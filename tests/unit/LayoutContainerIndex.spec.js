import LayoutContainerIndex from '../../src/core/responsive/LayoutContainerIndex'
import nestedFlex from './data/nestedFlex.json'

function names (widgets) {
    return widgets.map(w => w.name).sort()
}

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

test('init() - rootChildren skips the nested child (nestedFlex)', () => {
    const index = new LayoutContainerIndex(nestedFlex, nestedFlex, new Set(['FlexContainer']))

    expect(index.layoutContainers.length).toBe(1)
    const cntr = index.layoutContainers[0]

    // NestChild3 sits in Child2, so it is contained, but not a direct child
    expect(names(cntr.children)).toEqual(['Child1', 'Child2', 'NestChild3'])
    expect(names(cntr.rootChildren)).toEqual(['Child1', 'Child2'])
})

test('init() - rootChildren equals children when nothing is nested', () => {
    const index = new LayoutContainerIndex(model(), model(), new Set(['FlexContainer']))
    const cntr = index.layoutContainers[0]

    expect(names(cntr.children)).toEqual(['A', 'B'])
    expect(names(cntr.rootChildren)).toEqual(['A', 'B'])
})

test('init() - deeply nested children are all dropped, only the top one stays', () => {
    const m = model()
    // cntr > A > deep > deeper
    m.widgets.deep = { id: 'deep', name: 'Deep', type: 'Box', x: 120, y: 120, w: 80, h: 80, z: 3 }
    m.widgets.deeper = { id: 'deeper', name: 'Deeper', type: 'Box', x: 130, y: 130, w: 20, h: 20, z: 4 }

    const index = new LayoutContainerIndex(m, m, new Set(['FlexContainer']))
    const cntr = index.layoutContainers[0]

    expect(names(cntr.children)).toEqual(['A', 'B', 'Deep', 'Deeper'])
    // Deeper sits in Deep, which sits in A - only A is direct
    expect(names(cntr.rootChildren)).toEqual(['A', 'B'])
})

test('init() - a widget nested in a child container is no rootChild', () => {
    const m = model()
    // childA becomes a container holding a widget
    m.widgets.childA.type = 'FlexContainer'
    m.widgets.nested = { id: 'nested', name: 'Nested', type: 'Box', x: 120, y: 120, w: 50, h: 50, z: 3 }

    const index = new LayoutContainerIndex(m, m, new Set(['FlexContainer']))
    const outer = index.layoutContainers.find(c => c.id === 'cntr')
    const inner = index.layoutContainers.find(c => c.id === 'childA')

    expect(names(outer.children)).toEqual(['A', 'B', 'Nested'])
    expect(names(outer.rootChildren)).toEqual(['A', 'B'])

    // for the inner container the nested widget IS a direct child
    expect(names(inner.rootChildren)).toEqual(['Nested'])
})
