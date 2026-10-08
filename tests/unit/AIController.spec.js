/**
 * Characterization tests for src/canvas/controller/AIController.js.
 *
 * These capture the AI controller AS IT IS TODAY, before the
 * "Enable reasoning extraction in LLM providers" change extends addAiResult
 * with updateScreen/deleteWidget branches. Today addAiResult only applies
 * change.type === 'addScreen' and ignores every other change type (e.g. the
 * planned askUser change) safely.
 *
 * The controller is constructed directly (Controller extends AIController, so
 * AIController carries the full BaseController/Core machinery) with the same
 * scaffolding the tests/unit/ suite uses.
 */
/* eslint-env jest */
import * as TestUtil from './TestUtil'

function makeModel () {
  return {
    id: 'app1',
    name: 'App',
    screenSize: { w: 800, h: 600 },
    screens: {},
    widgets: {},
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

function createController (model = makeModel()) {
  return TestUtil.createController(model)
}

function makeScreenFragment () {
  return {
    screens: {
      s1: { id: 's1', name: 'Screen', x: 0, y: 0, w: 400, h: 300, children: ['w1'], props: {}, has: {}, style: {} }
    },
    widgets: {
      w1: { id: 'w1', name: 'W1', type: 'Label', x: 0, y: 0, w: 100, h: 20, props: {}, has: {}, style: {} }
    },
    groups: {},
    lines: {}
  }
}

describe('AIController.getAddedScreens', () => {
  test('collects the screens of all addScreen changes that carry a value', () => {
    const [controller] = createController()
    const result = {
      changes: [
        { type: 'addScreen', value: { screens: { s1: { id: 's1' } } } },
        { type: 'addScreen', value: { screens: { s2: { id: 's2' } } } },
        { type: 'askUser', question: '?' },
        { type: 'addScreen' }
      ]
    }

    const screens = controller.getAddedScreens(result)

    expect(screens.map((s) => s.id)).toEqual(['s1', 's2'])
  })

  test('returns an empty list for results without addScreen changes', () => {
    const [controller] = createController()

    expect(controller.getAddedScreens({ changes: [{ type: 'askUser', question: '?' }] })).toEqual([])
    expect(controller.getAddedScreens({})).toEqual([])
  })
})

describe('AIController.isBoxOverlapping', () => {
  test('detects overlapping and disjoint boxes', () => {
    const [controller] = createController()

    expect(controller.isBoxOverlapping({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 })).toBe(true)
    expect(controller.isBoxOverlapping({ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 0, w: 10, h: 10 })).toBe(false)
    expect(controller.isBoxOverlapping({ x: 0, y: 0, w: 10, h: 10 }, { x: 0, y: 20, w: 10, h: 10 })).toBe(false)
  })
})

describe('AIController.getScreensInViewport', () => {
  test('returns only the screens that intersect the viewport', () => {
    const model = makeModel()
    model.screens = {
      s1: { id: 's1', x: 0, y: 0, w: 100, h: 100, children: [] },
      s2: { id: 's2', x: 5000, y: 5000, w: 100, h: 100, children: [] }
    }
    const [controller] = createController(model)

    const visible = controller.getScreensInViewport({ x: 0, y: 0, w: 200, h: 200 })

    expect(visible.map((s) => s.id)).toEqual(['s1'])
  })
})

describe('AIController.getPastePosition', () => {
  test('falls back to the viewport origin when the result has no new screens', () => {
    const [controller] = createController()

    const pos = controller.getPastePosition({ changes: [] }, { x: -20, y: 30, w: 400, h: 300 })

    expect(pos).toEqual({ x: 0, y: 30 })
  })

  test('offsets the new content from the right-most visible screen', () => {
    const model = makeModel()
    model.screens = {
      s1: { id: 's1', x: 0, y: 0, w: 100, h: 100, children: [] }
    }
    const [controller] = createController(model)
    const result = {
      changes: [{ type: 'addScreen', value: { screens: { s2: { id: 's2', x: 0, y: 0, w: 50, h: 50 } } } }]
    }

    const pos = controller.getPastePosition(result, { x: 0, y: 0, w: 200, h: 200 })

    // right-most visible screen ends at x=100 -> PASTE_MARGIN 80 -> minus the
    // new screen's bbox offset (x=0) -> 180.
    expect(pos).toEqual({ x: 180, y: 0 })
  })

  test('anchors past the right-most screen of the whole model, even when it sits outside the current viewport', () => {
    const model = makeModel()
    model.screens = {
      // Visible in the viewport below, but not the right-most screen overall.
      s1: { id: 's1', x: 0, y: 0, w: 100, h: 100, children: [] },
      // Further right than the viewport shows - the old viewport-only logic
      // missed this one and could land new content on top of it.
      s2: { id: 's2', x: 1000, y: 0, w: 400, h: 100, children: [] }
    }
    const [controller] = createController(model)
    const result = {
      changes: [{ type: 'addScreen', value: { screens: { s3: { id: 's3', x: 0, y: 0, w: 50, h: 50 } } } }]
    }

    const pos = controller.getPastePosition(result, { x: 0, y: 0, w: 200, h: 200 })

    // right-most screen (s2) ends at x=1400 -> PASTE_MARGIN 80.
    expect(pos).toEqual({ x: 1480, y: 0 })
  })

  test('centers the new content in the viewport when no screen is visible, instead of the viewport corner', () => {
    const [controller] = createController()
    const result = {
      changes: [{ type: 'addScreen', value: { screens: { s2: { id: 's2', x: 0, y: 0, w: 400, h: 300 } } } }]
    }

    const pos = controller.getPastePosition(result, { x: 1000, y: 1000, w: 1600, h: 1000 })

    // (1600-400)/2 = 600, (1000-300)/2 = 350 -> centered inside the viewport,
    // which itself may be far from the model's (0,0) origin.
    expect(pos).toEqual({ x: 1600, y: 1350 })
  })

  test('does not clamp to the model origin when the viewport is at negative coordinates', () => {
    const [controller] = createController()
    const result = {
      changes: [{ type: 'addScreen', value: { screens: { s2: { id: 's2', x: 0, y: 0, w: 100, h: 100 } } } }]
    }

    const pos = controller.getPastePosition(result, { x: -2000, y: -2000, w: 800, h: 600 })

    expect(pos.x).toBeLessThan(0)
    expect(pos.y).toBeLessThan(0)
  })

  test('falls back to a viewport-relative inset when the content is too big to center', () => {
    const [controller] = createController()
    const result = {
      changes: [{ type: 'addScreen', value: { screens: { s2: { id: 's2', x: 0, y: 0, w: 2000, h: 2000 } } } }]
    }

    const pos = controller.getPastePosition(result, { x: 500, y: 500, w: 800, h: 600 })

    expect(pos).toEqual({ x: 540, y: 540 })
  })
})

describe('AIController.addAiResult', () => {
  test('ignores non-addScreen changes without throwing and adds no screens', () => {
    const [controller] = createController()
    const result = {
      changes: [
        { type: 'askUser', question: 'Which color?' }
      ]
    }

    const box = controller.addAiResult(result, { x: 0, y: 0, w: 800, h: 600 })

    expect(Object.keys(controller.model.screens)).toHaveLength(0)
    expect(Object.keys(controller.model.widgets)).toHaveLength(0)
    expect(box).toBeDefined()
  })

  test('adds the screens and widgets of addScreen changes', () => {
    const [controller] = createController()
    const result = {
      changes: [{ type: 'addScreen', value: makeScreenFragment() }]
    }

    controller.addAiResult(result, { x: 0, y: 0, w: 800, h: 600 })

    expect(Object.keys(controller.model.screens)).toHaveLength(1)
    expect(Object.keys(controller.model.widgets)).toHaveLength(1)

    const screen = Object.values(controller.model.screens)[0]
    const widget = Object.values(controller.model.widgets)[0]
    expect(screen.children).toContain(widget.id)
    // IDs are remapped on import, the original fragment ids are not reused.
    expect(controller.model.screens['s1']).toBeUndefined()
  })
})

describe('AIController.addAiResult > single-child groups', () => {
  test('a group with exactly one child survives the paste, not just its widget', () => {
    const [controller] = createController()
    const fragment = {
      screens: {
        s1: { id: 's1', name: 'Screen', x: 0, y: 0, w: 400, h: 300, children: ['w1'], props: {}, has: {}, style: {} }
      },
      widgets: {
        w1: { id: 'w1', name: 'W1', type: 'Label', x: 0, y: 0, w: 100, h: 20, props: {}, has: {}, style: {} }
      },
      groups: {
        g1: { id: 'g1', name: 'Sidebar instance', children: ['w1'], groups: [], template: 'tg_sidebar' }
      },
      lines: {}
    }

    controller.addAiResult({ changes: [{ type: 'addScreen', value: fragment }] }, { x: 0, y: 0, w: 800, h: 600 })

    expect(Object.keys(controller.model.groups)).toHaveLength(1)
    const group = Object.values(controller.model.groups)[0]
    expect(group.template).toBe('tg_sidebar')
    const widget = Object.values(controller.model.widgets)[0]
    expect(group.children).toEqual([widget.id])
  })
})

describe('AIController._applyUpdateScreen', () => {
  test('merges the fragment templates and designtokens into the model, like the addScreen branch', () => {
    const model = makeModel()
    model.screens = {
      target: { id: 'target', name: 'Screen', x: 10, y: 20, w: 400, h: 300, children: [], props: {}, has: {}, style: {} }
    }
    const [controller] = createController(model)

    const fragment = makeScreenFragment()
    fragment.screens.s1.id = 'target'
    fragment.templates = { tg_sidebar: { id: 'tg_sidebar', templateType: 'Group' } }
    fragment.designtokens = { dtc_primary: { id: 'dtc_primary', value: '#000' } }

    controller._applyUpdateScreen({ screenID: 'target', value: fragment })

    expect(controller.model.templates.tg_sidebar).toEqual({ id: 'tg_sidebar', templateType: 'Group' })
    expect(controller.model.designtokens.dtc_primary).toEqual({ id: 'dtc_primary', value: '#000' })
  })
})

describe('AIController._applyUpdateScreen keeps the screen name', () => {
  test('the regenerated screen keeps the name of the screen it replaces', () => {
    const model = makeModel()
    model.screens = {
      target: { id: 'target', name: 'Habit Details', x: 10, y: 20, w: 400, h: 300, children: [], props: {}, has: {}, style: {} }
    }
    const [controller] = createController(model)

    const fragment = makeScreenFragment()
    fragment.screens.s1.name = 'Screen'

    controller._applyUpdateScreen({ screenID: 'target', value: fragment })

    expect(controller.model.screens.target.name).toBe('Habit Details')
  })
})

describe('AIController.addAiResult returns where the screens landed', () => {
  test('a chunk planned at a non-zero x is still focused on its real position', () => {
    const model = makeModel()
    model.screens = {
      existing: { id: 'existing', name: 'Existing', x: 0, y: 0, w: 400, h: 300, children: [], props: {}, has: {}, style: {} }
    }
    const [controller] = createController(model)
    const fragment = makeScreenFragment()
    // the second screen of a plan, laid out one screen width to the right
    fragment.screens.s1.x = 464
    fragment.widgets.w1.x = 464

    const box = controller.addAiResult({ changes: [{ type: 'addScreen', value: fragment }] }, { x: 0, y: 0, w: 800, h: 600 })

    const added = Object.values(controller.model.screens).find(s => s.id !== 'existing')
    expect(box).toEqual({ x: added.x, y: added.y, w: added.w, h: added.h })
  })
})

describe('AIController._applyUpdateScreen places the new content in the screen', () => {
  function modelWithScreenAt (x, y, start) {
    const model = makeModel()
    model.screens = {
      target: { id: 'target', name: 'Today', x: x, y: y, w: 400, h: 300, children: [], props: { start: start }, has: {}, style: {} }
    }
    return model
  }

  test('widgets land inside a screen that is not at the canvas origin', () => {
    const [controller] = createController(modelWithScreenAt(2000, 500, false))
    const fragment = makeScreenFragment()
    fragment.widgets.w1.x = 10
    fragment.widgets.w1.y = 20

    controller._applyUpdateScreen({ screenID: 'target', value: fragment })

    const screen = controller.model.screens.target
    expect(screen.children).toHaveLength(1)
    const widget = controller.model.widgets[screen.children[0]]
    expect(widget.x).toBe(2010)
    expect(widget.y).toBe(520)
  })

  test('the new widgets get fresh ids instead of the parser ids', () => {
    const [controller] = createController(modelWithScreenAt(0, 0, false))

    controller._applyUpdateScreen({ screenID: 'target', value: makeScreenFragment() })

    expect(controller.model.widgets.w1).toBeUndefined()
    expect(controller.model.screens.target.children[0]).not.toBe('w1')
  })

  test('the screen keeps its start flag, and does not become a start screen', () => {
    const [startController] = createController(modelWithScreenAt(0, 0, true))
    startController._applyUpdateScreen({ screenID: 'target', value: makeScreenFragment() })
    expect(startController.model.screens.target.props.start).toBe(true)

    const model = modelWithScreenAt(0, 0, false)
    model.screens.home = { id: 'home', name: 'Home', x: 600, y: 0, w: 400, h: 300, children: [], props: { start: true }, has: {}, style: {} }
    const [controller] = createController(model)
    const fragment = makeScreenFragment()
    fragment.screens.s1.props.start = true
    controller._applyUpdateScreen({ screenID: 'target', value: fragment })
    expect(controller.model.screens.target.props.start).toBe(false)
  })
})

describe('AIController.addAiResult start screen', () => {
  test('pasting several generated screens leaves exactly one start screen', () => {
    const [controller] = createController()
    // as streamed by create_app: one chunk per screen, none marked as start
    controller.addAiResult({ changes: [{ type: 'addScreen', value: makeScreenFragment() }] }, { x: 0, y: 0, w: 800, h: 600 })
    controller.addAiResult({ changes: [{ type: 'addScreen', value: makeScreenFragment() }] }, { x: 0, y: 0, w: 800, h: 600 })
    controller.addAiResult({ changes: [{ type: 'addScreen', value: makeScreenFragment() }] }, { x: 0, y: 0, w: 800, h: 600 })

    const starts = Object.values(controller.model.screens).filter(s => s.props.start)
    expect(Object.keys(controller.model.screens)).toHaveLength(3)
    expect(starts).toHaveLength(1)
  })
})

describe('AIController edits keep what the LLM kept', () => {
  function editModel () {
    const model = makeModel()
    model.screenSize = { w: 400, h: 600 }
    model.screens = {
      s1: { id: 's1', name: 'Login', x: 100, y: 50, w: 400, h: 800, children: ['bg', 'w1', 'w2', 'w3'], props: { start: true }, has: {}, style: { background: '#ffffff' } },
      s2: { id: 's2', name: 'Home', x: 600, y: 50, w: 400, h: 800, children: ['w9'], props: {}, has: {}, style: {} }
    }
    model.widgets = {
      bg: { id: 'bg', name: 'Background', type: 'Box', x: 100, y: 50, w: 400, h: 800, z: 1, props: {}, has: {}, style: {} },
      w1: { id: 'w1', name: 'My Card', type: 'Box', x: 120, y: 150, w: 360, h: 200, z: 2, props: {}, has: {}, style: {} },
      w2: { id: 'w2', name: 'Title', type: 'Label', x: 140, y: 170, w: 200, h: 30, z: 3, props: { label: 'Title' }, has: {}, style: {} },
      w3: { id: 'w3', name: 'Sign in', type: 'Button', x: 120, y: 400, w: 360, h: 48, z: 4, props: { label: 'Sign in' }, has: {}, style: {} },
      w9: { id: 'w9', name: 'Back', type: 'Button', x: 620, y: 70, w: 100, h: 40, z: 1, props: { label: 'Back' }, has: {}, style: {} }
    }
    model.lines = {
      l1: { id: 'l1', from: 'w3', to: 's2', points: [] },
      l2: { id: 'l2', from: 'w2', to: 's2', points: [] },
      l3: { id: 'l3', from: 'w1', to: 's2', points: [] },
      l4: { id: 'l4', from: 'w9', to: 's1', points: [] }
    }
    model.groups = {
      g1: { id: 'g1', name: 'Card', children: ['w1', 'w2'], groups: [] },
      gOuter: { id: 'gOuter', name: 'Section', children: ['w3'], groups: ['g1'] }
    }
    return model
  }

  function regionFragment () {
    return {
      screens: { sf: { id: 'sf', name: 'Screen', x: 0, y: 0, w: 360, h: 260, children: ['f1', 'f2', 'f3'], props: {}, has: {}, style: {} } },
      widgets: {
        f1: { id: 'f1', _sourceId: 'w1', name: 'Box', type: 'Box', x: 0, y: 10, w: 360, h: 260, z: 1, props: {}, has: {}, style: { background: '#eeeeee' } },
        f2: { id: 'f2', name: 'Label', type: 'Label', x: 20, y: 30, w: 200, h: 30, z: 2, props: { label: 'New title' }, has: {}, style: {} },
        f3: { id: 'f3', name: 'Button', type: 'Button', x: 20, y: 220, w: 100, h: 40, z: 3, props: { label: 'More' }, has: {}, style: {} }
      },
      groups: {
        fg: { id: 'fg', name: 'Content', children: ['f2', 'f3'], groups: [] }
      },
      lines: {}
    }
  }

  const region = { x: 120, y: 150, w: 360, h: 200, widgetIDs: ['w1', 'w2'] }

  test('a region edit keeps the kept widget with its id, name and links, and removes the rest of the region', () => {
    const [controller] = createController(editModel())

    controller.addAiResult({ changes: [{ type: 'updateScreen', screenID: 's1', value: regionFragment(), region }] }, { x: 0, y: 0, w: 800, h: 600 })

    const model = controller.model
    const w1 = model.widgets.w1
    expect(w1).toMatchObject({ name: 'My Card', x: 120, y: 150, w: 360, h: 260 })
    expect(w1.style.background).toBe('#eeeeee')
    expect(w1._sourceId).toBeUndefined()
    expect(model.widgets.w2).toBeUndefined()
    expect(model.lines.l2).toBeUndefined()
    expect(model.lines.l3).toBeDefined()

    const added = model.screens.s1.children.map(id => model.widgets[id]).filter(w => w.props.label === 'New title')
    expect(added).toHaveLength(1)
    expect(added[0]).toMatchObject({ x: 140, y: 170 })
    expect(added[0].id).not.toBe('f2')
  })

  test('a taller region moves what is below it and grows what contains it', () => {
    const [controller] = createController(editModel())

    controller._applyUpdateRegion({ screenID: 's1', value: regionFragment(), region })

    const model = controller.model
    // 60px taller
    expect(model.widgets.w3.y).toBe(460)
    expect(model.lines.l1).toBeDefined()
    expect(model.widgets.bg.h).toBe(860)
    expect(model.screens.s1.h).toBe(860)
    // the other screen is not touched
    expect(model.widgets.w9).toMatchObject({ x: 620, y: 70 })
  })

  test('the region groups are replaced and the new content joins the group around it', () => {
    const [controller] = createController(editModel())

    controller._applyUpdateRegion({ screenID: 's1', value: regionFragment(), region })

    const model = controller.model
    expect(model.groups.g1).toBeUndefined()
    const outer = model.groups.gOuter
    expect(outer.children).toEqual(['w3', 'w1'])
    expect(outer.groups).toHaveLength(1)
    const content = model.groups[outer.groups[0]]
    expect(content.name).toBe('Content')
    expect(content.children.map(id => model.widgets[id].props.label)).toEqual(['New title', 'More'])
  })

  test('a full screen edit keeps the screen, its links and the widgets the LLM kept', () => {
    const [controller] = createController(editModel())
    const fragment = {
      screens: { sf: { id: 'sf', name: 'Screen', x: 0, y: 0, w: 400, h: 900, children: ['f1', 'f2'], props: {}, has: {}, style: { background: '#000000' } } },
      widgets: {
        f1: { id: 'f1', _sourceId: 'w3', name: 'Button', type: 'Button', x: 20, y: 500, w: 360, h: 48, z: 1, props: { label: 'Sign in' }, has: {}, style: {} },
        f2: { id: 'f2', name: 'Label', type: 'Label', x: 20, y: 20, w: 200, h: 30, z: 2, props: { label: 'Welcome' }, has: {}, style: {} }
      },
      groups: {},
      lines: {}
    }

    controller._applyUpdateScreen({ screenID: 's1', value: fragment })

    const model = controller.model
    const screen = model.screens.s1
    expect(screen).toMatchObject({ name: 'Login', x: 100, y: 50, h: 900 })
    expect(screen.props.start).toBe(true)
    expect(screen.style.background).toBe('#000000')
    expect(model.widgets.w3).toMatchObject({ name: 'Sign in', x: 120, y: 550 })
    expect(model.lines.l1).toBeDefined()
    // the link from another screen to this one survives
    expect(model.lines.l4).toBeDefined()
    expect(model.widgets.w1).toBeUndefined()
    expect(model.widgets.bg).toBeUndefined()
    expect(model.lines.l3).toBeUndefined()
    expect(screen.children).toHaveLength(2)
    expect(model.groups.g1).toBeUndefined()
    expect(model.groups.gOuter).toBeUndefined()
  })

  test('a link from a group the edit removed does not point into nothing', () => {
    const model = editModel()
    model.lines.lg = { id: 'lg', from: 'g1', to: 's2', points: [] }
    const [controller] = createController(model)

    controller._applyUpdateRegion({ screenID: 's1', value: regionFragment(), region })

    expect(controller.model.groups.g1).toBeUndefined()
    expect(controller.model.lines.lg).toBeUndefined()
  })

  test('a property patch changes styles, texts and sizes in place', () => {
    const model = editModel()
    model.widgets.w3.designtokens = { style: { background: 'dt1', color: 'dt2' } }
    const [controller] = createController(model)

    controller.addAiResult({
      changes: [{
        type: 'updateWidgets',
        changes: [
          { id: 'w3', target: 'widget', style: { background: '#ff0000' }, props: { label: 'Go' }, size: { h: 56 } },
          { id: 's1', target: 'screen', style: { background: '#111111' } },
          { id: 'gone', target: 'widget', style: { color: '#000000' } }
        ]
      }]
    }, { x: 0, y: 0, w: 800, h: 600 })

    const w3 = controller.model.widgets.w3
    expect(w3.style.background).toBe('#ff0000')
    expect(w3.props.label).toBe('Go')
    expect(w3.h).toBe(56)
    expect(w3.w).toBe(360)
    // the overridden token is unlinked, the other one stays
    expect(w3.designtokens.style).toEqual({ color: 'dt2' })
    expect(controller.model.screens.s1.style.background).toBe('#111111')
    expect(controller.model.lines.l1).toBeDefined()
  })
})

describe('AIController._applyUpdateScreen keeps the recorded parents', () => {
  test('a parentId of the fragment points to the new id of its parent, or is dropped', () => {
    const model = makeModel()
    model.screens = {
      target: { id: 'target', name: 'Screen', x: 10, y: 20, w: 400, h: 300, children: [], props: {}, has: {}, style: {} }
    }
    const [controller] = createController(model)
    const fragment = makeScreenFragment()
    fragment.screens.s1.children = ['card', 'kid', 'lost']
    fragment.widgets = {
      card: { id: 'card', name: 'Card', type: 'Box', x: 0, y: 0, w: 100, h: 50, props: {}, has: {}, style: {} },
      kid: { id: 'kid', name: 'Kid', type: 'Box', x: 10, y: 10, w: 80, h: 60, parentId: 'card', props: {}, has: {}, style: {} },
      lost: { id: 'lost', name: 'Lost', type: 'Box', x: 200, y: 0, w: 80, h: 60, parentId: 'gone', props: {}, has: {}, style: {} }
    }

    controller._applyUpdateScreen({ screenID: 'target', value: fragment })

    const byName = name => Object.values(controller.model.widgets).find(w => w.name === name)
    expect(byName('Kid').parentId).toBe(byName('Card').id)
    expect(byName('Kid').parentId).not.toBe('card')
    expect(byName('Lost').parentId).toBeUndefined()
  })
})
