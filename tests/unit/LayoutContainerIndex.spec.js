import LayoutContainerIndex from '../../src/core/responsive/LayoutContainerIndex'

function model () {
    return {
        screens: {},
        widgets: {
            cntr:  { id: 'cntr',  name: 'Flex',  type: 'FlexContainer', x: 100, y: 100, w: 400, h: 600, z: 1 },
            childA:{ id: 'childA',name: 'A',     type: 'Box',           x: 110, y: 110, w: 380, h: 100, z: 2 },
            childB:{ id: 'childB',name: 'B',     type: 'Box',           x: 110, y: 220, w: 380, h: 100, z: 2 },
            outside:{id: 'outside',name:'Out',   type: 'Box',           x: 800, y: 800, w: 50,  h: 50,  z: 2 }
        }
    }
}

test('findContainedLayoutContainer() - a dragged widget inside the container finds it', () => {
    const index = new LayoutContainerIndex(model(), model(), new Set(['FlexContainer']))
    // the dragged widget, at a live position inside the container
    const dragged = { id: 'outside', name: 'Out', x: 150, y: 400, w: 50, h: 50, z: 2 }
    const found = index.findContainedLayoutContainer(dragged)
    expect(found).not.toBe(null)
    expect(found.id).toBe('cntr')
})

test('findContainedLayoutContainer() - a widget that IS a child of the container still finds it', () => {
    const index = new LayoutContainerIndex(model(), model(), new Set(['FlexContainer']))
    // childA is in the index children list - it must not veto itself
    const dragged = { id: 'childA', name: 'A', x: 110, y: 110, w: 380, h: 100, z: 2 }
    const found = index.findContainedLayoutContainer(dragged)
    expect(found).not.toBe(null)
    expect(found.id).toBe('cntr')
})

test('findContainedLayoutContainer() - outside the container finds nothing', () => {
    const index = new LayoutContainerIndex(model(), model(), new Set(['FlexContainer']))
    const dragged = { id: 'outside', name: 'Out', x: 800, y: 800, w: 50, h: 50, z: 2 }
    expect(index.findContainedLayoutContainer(dragged)).toBe(null)
})

test('findContainedLayoutContainer() - only partially over the container finds nothing', () => {
    const index = new LayoutContainerIndex(model(), model(), new Set(['FlexContainer']))
    // sticks out over the right edge (container ends at x 500)
    const dragged = { id: 'outside', name: 'Out', x: 480, y: 400, w: 50, h: 50, z: 2 }
    expect(index.findContainedLayoutContainer(dragged)).toBe(null)
})

test('findContainedLayoutContainer() - fully inside one of the children returns null', () => {
    const index = new LayoutContainerIndex(model(), model(), new Set(['FlexContainer']))
    // sits completely within childA
    const dragged = { id: 'outside', name: 'Out', x: 120, y: 120, w: 20, h: 20, z: 3 }
    expect(index.findContainedLayoutContainer(dragged)).toBe(null)
})

test('findContainedLayoutContainer() - a box without z finds nothing (needs z)', () => {
    const index = new LayoutContainerIndex(model(), model(), new Set(['FlexContainer']))
    const dragged = { x: 150, y: 400, w: 50, h: 50 }
    expect(index.findContainedLayoutContainer(dragged)).toBe(null)
})
