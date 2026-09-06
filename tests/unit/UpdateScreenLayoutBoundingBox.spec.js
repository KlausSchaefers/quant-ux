import app from './data/treeIndex.json'
import * as TestUtil from './TestUtil'
import lang from '../../src/dojo/_base/lang'

const screenId = 's10000_80355'
const containerAId = 'w10015_11776'

test('updateScreenLayout({pos}) only touches FlexContainers that contain the changed area', () => {
    const [controller, model] = TestUtil.createController(app)

    const containerA = model.widgets[containerAId]
    const screen = model.screens[screenId]

    // second, far-away FlexContainer B (empty, no children), not even on the same screen
    const containerB = lang.clone(containerA)
    containerB.id = 'wB'
    containerB.name = 'Flex B'
    containerB.x = containerA.x + 5000
    containerB.y = containerA.y
    model.widgets[containerB.id] = containerB
    screen.children.push(containerB.id)

    const beforeA = { ...model.widgets['w10016_64924'] }
    const beforeB = { x: containerB.x, y: containerB.y, w: containerB.w, h: containerB.h }

    // a pos that only overlaps container A, nowhere near B
    const pos = { x: containerA.x + 10, y: containerA.y + 10, w: 5, h: 5 }

    controller.updateScreenLayout({ pos })

    const afterA = model.widgets['w10016_64924']
    const afterB = model.widgets[containerB.id]

    // A's child was relaid out (grew to fill the container, since alignItems defaults to stretch)
    expect(afterA.w).not.toBe(beforeA.w)

    // B is untouched: it doesn't contain the changed area, so it's skipped entirely
    expect(afterB.x).toBe(beforeB.x)
    expect(afterB.y).toBe(beforeB.y)
    expect(afterB.w).toBe(beforeB.w)
    expect(afterB.h).toBe(beforeB.h)
})

test('updateScreenLayout({pos}) does not depend on the changed area resolving to any screen', () => {
    const [controller, model] = TestUtil.createController(app)

    const containerA = model.widgets[containerAId]

    // move FlexContainer A itself (and its bounding box) way outside every
    // screen in the fixture - a pos inside it now resolves to no hover screen
    // at all, which used to mean "fall back to laying out every screen"
    const dx = 1000000
    const dy = 1000000
    const flexIds = ['w10015_11776', 'w10010_43885', 'w10016_64924', 'w10017_84479']
    flexIds.forEach(id => {
        model.widgets[id].x += dx
        model.widgets[id].y += dy
    })

    const pos = { x: containerA.x + 10, y: containerA.y + 10, w: 5, h: 5 }
    expect(controller.getHoverScreen(pos)).toBeFalsy()

    const before = { ...model.widgets['w10016_64924'] }
    const positions = controller.updateScreenLayout({ pos })
    const after = model.widgets['w10016_64924']

    expect(after.w).not.toBe(before.w)
    expect(Object.keys(positions).length).toBe(4)
})

test('updateScreenLayout() with no params updates every FlexContainer in the model', () => {
    const [controller, model] = TestUtil.createController(app)
    const positions = controller.updateScreenLayout()

    // the FlexContainer + its 3 children (Flex1Fixed, Flex2, Flex3) all get repositioned
    expect(Object.keys(positions).length).toBe(4)
    expect(model.widgets[containerAId].modified).toBeDefined()
})
