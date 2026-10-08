import * as TestUtil from './TestUtil'

function makeModel () {
  const widget = (id, type, x, y, w, h, z, extra = {}) => ({
    id, name: id, type, x, y, w, h, z,
    props: Object.assign({}, extra.props),
    has: {},
    style: Object.assign({}, extra.style)
  })
  return {
    id: 'app1',
    name: 'App',
    screenSize: { w: 800, h: 600 },
    screens: {
      s1: { id: 's1', name: 'Screen', x: 0, y: 0, w: 800, h: 600, children: ['f', 'a', 'b', 'c'], props: {}, has: {}, style: {} }
    },
    widgets: {
      f: widget('f', 'FlexContainer', 100, 100, 400, 100, 1, { style: { flexDirection: 'row', gap: 10, alignItems: 'start', paddingLeft: 10, paddingTop: 10 } }),
      a: widget('a', 'Box', 110, 110, 50, 50, 2),
      b: widget('b', 'Box', 170, 110, 50, 50, 3),
      c: widget('c', 'Box', 230, 110, 50, 50, 4)
    },
    lines: {},
    groups: {},
    templates: {},
    designtokens: {},
    lastUUID: 10000,
    lastUpdate: new Date().getTime(),
    created: 0,
    startScreen: '',
    grid: { w: 8, h: 8, style: 'line', color: '#cecece', visible: false, enabled: false }
  }
}

const xs = (model) => ['a', 'b', 'c'].map(id => model.widgets[id].x)

const viewport = { x: 0, y: 0, w: 800, h: 600 }

describe('Existing canvas auto layout and agent edits', () => {
  test('gap and distribution remain editable on the canvas', () => {
    const [controller, model] = TestUtil.createController(makeModel())
    controller.updateWidgetProperties('f', { gap: 20 }, 'style')
    expect(xs(model)).toEqual([110, 180, 250])
    controller.updateWidgetProperties('f', { justifyContent: 'end' }, 'style')
    expect(xs(model)).toEqual([310, 380, 450])
  })
  test('AI size edits reuse the canvas layout and undo restores both', async () => {
    const [controller, model] = TestUtil.createController(makeModel())
    controller.addAiResult({ changes: [{ type: 'updateWidgets', changes: [{ target: 'widget', id: 'b', size: { w: 100 } }] }] }, viewport)
    expect(xs(model)).toEqual([110, 170, 280])
    await controller.undo()
    expect(xs(controller.model)).toEqual([110, 170, 230])
    expect(controller.model.widgets.b.w).toBe(50)
  })
  test('deleting an item closes the old gap', () => {
    const [controller, model] = TestUtil.createController(makeModel())
    controller.addAiResult({ changes: [{ type: 'deleteWidget', ids: ['b'] }] }, viewport)
    expect(model.widgets.b).toBeUndefined()
    expect(model.widgets.c.x).toBe(170)
  })
  test('regenerating an item outside its row closes the gap without changing its new position', () => {
    const [controller, model] = TestUtil.createController(makeModel())
    const replacement = { ...model.widgets.b, id: 'new', _sourceId: 'b', x: 0, y: 0, w: 60, h: 40 }
    controller.addAiResult({ changes: [{
      type: 'updateScreen', screenID: 's1',
      region: { x: 550, y: 110, w: 60, h: 40, widgetIDs: ['b'] },
      value: { screens: { s: { id: 's', x: 0, y: 0, w: 60, h: 40, children: ['new'] } }, widgets: { new: replacement }, groups: {} }
    }] }, viewport)
    expect(model.widgets.b).toMatchObject({ x: 550, y: 110, w: 60, h: 40 })
    expect(model.widgets.c.x).toBe(170)
  })
  test('moving an item into another container lays out both containers', () => {
    const m = makeModel()
    m.widgets.right = { ...m.widgets.f, id: 'right', x: 520, w: 260 }
    m.widgets.d = { ...m.widgets.c, id: 'd', x: 640, z: 6 }
    m.screens.s1.children.push('right', 'd')
    const [controller, model] = TestUtil.createController(m)
    const replacement = { ...model.widgets.b, id: 'new', _sourceId: 'b', x: 0, y: 0, w: 60, h: 40 }
    controller.addAiResult({ changes: [{
      type: 'updateScreen', screenID: 's1',
      region: { x: 550, y: 110, w: 60, h: 40, widgetIDs: ['b'] },
      value: { screens: { s: { id: 's', x: 0, y: 0, w: 60, h: 40, children: ['new'] } }, widgets: { new: replacement }, groups: {} }
    }] }, viewport)
    expect(model.widgets.c.x).toBe(170)
    expect(model.widgets.b.x).toBe(530)
    expect(model.widgets.d.x).toBe(600)
    // A second edit before saving must use the current parent, not oldModel.
    controller.addAiResult({ changes: [{ type: 'deleteWidget', ids: ['b'] }] }, viewport)
    expect(model.widgets.d.x).toBe(530)
  })
  test('editing a free widget leaves unrelated containers alone', () => {
    const m = makeModel()
    m.widgets.free = { ...m.widgets.b, id: 'free', x: 600 }
    m.screens.s1.children.push('free')
    const [controller] = TestUtil.createController(m)
    const layout = jest.spyOn(controller, 'layoutContainer')
    controller.addAiResult({ changes: [{ type: 'updateWidgets', changes: [{ target: 'widget', id: 'free', size: { w: 70 } }] }] }, viewport)
    expect(layout).not.toHaveBeenCalled()
  })
})
