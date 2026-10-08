import * as TestUtil from './TestUtil'
import ResponsiveLayout from '../../src/core/responsive/ResponsiveLayout'
import * as LayoutContainerUtil from '../../src/core/LayoutContainerUtil'

function widget (id, type, x, y, w, h, z, extra = {}) {
  return { id, name: id, type, x, y, w, h, z, props: Object.assign({}, extra.props), has: {}, style: Object.assign({}, extra.style) }
}

function makeModel () {
  const widgets = {
    f: widget('f', 'FlexContainer', 100, 100, 300, 230, 1, { style: { flexDirection: 'column', gap: 10, paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10 } }),
    a: widget('a', 'Box', 110, 110, 280, 50, 2, { props: { resize: { fixedHorizontal: false, fixedVertical: true } } }),
    r: widget('r', 'FlexContainer', 110, 170, 280, 60, 3, {
      style: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingLeft: 5, paddingTop: 5, paddingBottom: 5, paddingRight: 5 },
      props: { resize: { fixedHorizontal: false, fixedVertical: true } }
    }),
    b1: widget('b1', 'Box', 115, 175, 50, 50, 4),
    b2: widget('b2', 'Box', 175, 175, 50, 50, 5, { props: { resize: { grow: 1, fixedVertical: true } } }),
    c: widget('c', 'Box', 110, 240, 100, 80, 6)
  }
  return {
    id: 'app1', name: 'App', screenSize: { w: 800, h: 800 },
    screens: { s1: { id: 's1', name: 'Screen', x: 0, y: 0, w: 800, h: 800, children: Object.keys(widgets), props: {}, has: {}, style: {} } },
    widgets, lines: {}, groups: {}, templates: {}, designtokens: {}, lastUUID: 10000,
    lastUpdate: 0, created: 0, startScreen: '',
    grid: { w: 8, h: 8, style: 'line', color: '#cecece', visible: false, enabled: false }
  }
}

// a layout container is resized as a "group" of itself and its tree children (Resize.getResizeModel())
function getResizeModel (controller, model, id) {
  controller.updateModelIndexes(model)
  const childIds = LayoutContainerUtil.getLayoutContainerChildren(id, model, controller.treeIndex)
  const resizeModel = controller.getBoundingBox(childIds)
  resizeModel.children = childIds
  return resizeModel
}

function resize (controller, model, id, pos) {
  const resizeModel = getResizeModel(controller, model, id)
  const layouter = new ResponsiveLayout(1)
  layouter.initSelection(model, resizeModel, resizeModel.children, true, true, false)
  const preview = layouter.resize(pos.w, pos.h)
  const previewPos = {}
  resizeModel.children.forEach(cid => {
    const p = preview.widgets[cid]
    previewPos[cid] = { x: p.x + pos.x - resizeModel.x, y: p.y + pos.y - resizeModel.y, w: p.w, h: p.h }
  })
  controller.updateMultiWidgetSizeResponsive(pos, resizeModel, false, false, {})
  return previewPos
}

const box = (model, id) => {
  const w = model.widgets[id]
  return { x: w.x, y: w.y, w: w.w, h: w.h }
}

describe('FlexContainer resize on the canvas', () => {

  const cases = {
    wider: { x: 100, y: 100, w: 400, h: 230 },
    narrower: { x: 100, y: 100, w: 200, h: 230 },
    taller: { x: 100, y: 100, w: 300, h: 400 },
    'from the left': { x: 50, y: 100, w: 350, h: 230 }
  }
  Object.keys(cases).forEach(name => {
    test(`${name}: the preview is the result`, () => {
      const [controller, model] = TestUtil.createController(makeModel())
      const preview = resize(controller, model, 'f', cases[name])
      Object.keys(preview).forEach(id => {
        expect(box(model, id)).toEqual(preview[id])
      })
      // the children keep their sizing, only the container was sized by hand
      expect(model.widgets.a.props.resize.fixedHorizontal).toBe(false)
      expect(model.widgets.b2.props.resize.grow).toBe(1)
    })
  })

})
