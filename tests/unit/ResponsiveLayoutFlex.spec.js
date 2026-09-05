import ResponsiveLayout from '../../src/core/responsive/ResponsiveLayout'

function widget(id, x, y, w, h, grow = 0) {
    return {
        id,
        name: id,
        x,
        y,
        w,
        h,
        children: [],
        layout: { type: 'Grid' },
        props: {
            resize: {
                grow
            }
        }
    }
}

test('ResponsiveLayout.resizeFlex() - row: fixed child keeps its width, others grow equally, cross axis stretches by default', () => {

    const rl = new ResponsiveLayout(1)

    const a = widget('a', 0, 0, 50, 30, 0) // fixed width
    const b = widget('b', 60, 0, 50, 30, 1)
    const c = widget('c', 120, 0, 50, 30, 1)

    const box = {
        id: 'cntr',
        type: 'FlexContainer',
        name: 'FlexContainer',
        style: {
            flexDirection: 'row',
            gap: 10,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            paddingRight: 10
        },
        children: [a, b, c]
    }

    const newNestedPositions = {
        cntr: { x: 0, y: 0, w: 300, h: 100 }
    }

    rl.resizeFlex(box, box, newNestedPositions, '')

    // inner box: w 280 (300 minus 2x10 padding), h 80 (100 minus 2x10 padding)
    // fixed child keeps w:50, the 2 grow children equally split the remaining 210 (280 - 50 - 2*10 gap) -> 105 each
    // no alignItems set -> defaults to 'stretch' (matches CSS align-items default), so height fills the inner height
    expect(newNestedPositions.a).toEqual({ x: 10, y: 10, w: 50, h: 80 })
    expect(newNestedPositions.b).toEqual({ x: 70, y: 10, w: 105, h: 80 })
    expect(newNestedPositions.c).toEqual({ x: 185, y: 10, w: 105, h: 80 })
})

test('ResponsiveLayout.resizeFlex() - row: borderWidth shrinks the inner box like padding', () => {

    const rl = new ResponsiveLayout(1)

    const a = widget('a', 0, 0, 50, 30, 0) // fixed width
    const b = widget('b', 60, 0, 50, 30, 1)
    const c = widget('c', 120, 0, 50, 30, 1)

    const box = {
        id: 'cntr',
        type: 'FlexContainer',
        name: 'FlexContainer',
        style: {
            flexDirection: 'row',
            gap: 10,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            paddingRight: 10,
            borderTopWidth: 5,
            borderBottomWidth: 5,
            borderLeftWidth: 5,
            borderRightWidth: 5
        },
        children: [a, b, c]
    }

    const newNestedPositions = {
        cntr: { x: 0, y: 0, w: 300, h: 100 }
    }

    rl.resizeFlex(box, box, newNestedPositions, '')

    // inner box: w 270 (300 minus 2x10 padding minus 2x5 border), h 70 (100 minus 2x10 padding minus 2x5 border)
    // fixed child keeps w:50, the 2 grow children equally split the remaining 200 (270 - 50 - 2*10 gap) -> 100 each
    expect(newNestedPositions.a).toEqual({ x: 15, y: 15, w: 50, h: 70 })
    expect(newNestedPositions.b).toEqual({ x: 75, y: 15, w: 100, h: 70 })
    expect(newNestedPositions.c).toEqual({ x: 185, y: 15, w: 100, h: 70 })
})

test('ResponsiveLayout.resizeFlex() - row: alignItems stretch grows the cross axis', () => {

    const rl = new ResponsiveLayout(1)

    const a = widget('a', 0, 0, 50, 30, 0) // fixed width
    const b = widget('b', 60, 0, 50, 30, 1)
    const c = widget('c', 120, 0, 50, 30, 1)

    const box = {
        id: 'cntr',
        type: 'FlexContainer',
        name: 'FlexContainer',
        style: {
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: 10,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            paddingRight: 10
        },
        children: [a, b, c]
    }

    const newNestedPositions = {
        cntr: { x: 0, y: 0, w: 300, h: 100 }
    }

    rl.resizeFlex(box, box, newNestedPositions, '')

    // inner height: 80 (100 minus 2x10 padding), all children stretch to fill it
    expect(newNestedPositions.a).toEqual({ x: 10, y: 10, w: 50, h: 80 })
    expect(newNestedPositions.b).toEqual({ x: 70, y: 10, w: 105, h: 80 })
    expect(newNestedPositions.c).toEqual({ x: 185, y: 10, w: 105, h: 80 })
})

test('ResponsiveLayout.resizeFlex() - row: alignItems start opts out of stretching, cross axis keeps its own size', () => {

    const rl = new ResponsiveLayout(1)

    const a = widget('a', 0, 0, 50, 30, 0) // fixed width
    const b = widget('b', 60, 0, 50, 30, 1)
    const c = widget('c', 120, 0, 50, 30, 1)

    const box = {
        id: 'cntr',
        type: 'FlexContainer',
        name: 'FlexContainer',
        style: {
            flexDirection: 'row',
            alignItems: 'start',
            gap: 10,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            paddingRight: 10
        },
        children: [a, b, c]
    }

    const newNestedPositions = {
        cntr: { x: 0, y: 0, w: 300, h: 100 }
    }

    rl.resizeFlex(box, box, newNestedPositions, '')

    // inner box: w 280 (300 minus 2x10 padding)
    // fixed child keeps w:50, the 2 grow children equally split the remaining 210 (280 - 50 - 2*10 gap) -> 105 each
    // explicit alignItems: 'start' opts out of stretch, so height stays each child's own h:30
    expect(newNestedPositions.a).toEqual({ x: 10, y: 10, w: 50, h: 30 })
    expect(newNestedPositions.b).toEqual({ x: 70, y: 10, w: 105, h: 30 })
    expect(newNestedPositions.c).toEqual({ x: 185, y: 10, w: 105, h: 30 })
})

test('ResponsiveLayout.resizeFlex() - column: fixed child keeps its height, others grow equally, cross axis stretches by default', () => {

    const rl = new ResponsiveLayout(1)

    const x = widget('x', 0, 0, 40, 20, 0) // fixed height
    const y = widget('y', 0, 25, 40, 20, 1)
    const z = widget('z', 0, 50, 40, 20, 1)

    const box = {
        id: 'cntr2',
        type: 'FlexContainer',
        name: 'FlexContainer',
        style: {
            flexDirection: 'column',
            gap: 5,
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
        },
        children: [x, y, z]
    }

    const newNestedPositions = {
        cntr2: { x: 0, y: 0, w: 100, h: 200 }
    }

    rl.resizeFlex(box, box, newNestedPositions, '')

    // inner box: h 190 (200 minus 2x5 padding), w 90 (100 minus 2x5 padding)
    // fixed child keeps h:20, the 2 grow children equally split the remaining 160 (190 - 20 - 2*5 gap) -> 80 each
    // no alignItems set -> defaults to 'stretch', so width fills the inner width
    expect(newNestedPositions.x).toEqual({ x: 5, y: 5, w: 90, h: 20 })
    expect(newNestedPositions.y).toEqual({ x: 5, y: 30, w: 90, h: 80 })
    expect(newNestedPositions.z).toEqual({ x: 5, y: 115, w: 90, h: 80 })
})

test('ResponsiveLayout.resizeFlex() - column: alignItems end opts out of stretching, cross axis keeps its own size', () => {

    const rl = new ResponsiveLayout(1)

    const x = widget('x', 0, 0, 40, 20, 0) // fixed height
    const y = widget('y', 0, 25, 40, 20, 1)
    const z = widget('z', 0, 50, 40, 20, 1)

    const box = {
        id: 'cntr2',
        type: 'FlexContainer',
        name: 'FlexContainer',
        style: {
            flexDirection: 'column',
            alignItems: 'end',
            gap: 5,
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
        },
        children: [x, y, z]
    }

    const newNestedPositions = {
        cntr2: { x: 0, y: 0, w: 100, h: 200 }
    }

    rl.resizeFlex(box, box, newNestedPositions, '')

    // inner box: h 190 (200 minus 2x5 padding), w 90 (100 minus 2x5 padding)
    // fixed child keeps h:20, the 2 grow children equally split the remaining 160 (190 - 20 - 2*5 gap) -> 80 each
    // explicit alignItems: 'end' opts out of stretch (width stays each child's own w:40),
    // and is right-aligned: x = innerX + innerWidth - w = 5 + 90 - 40 = 55
    expect(newNestedPositions.x).toEqual({ x: 55, y: 5, w: 40, h: 20 })
    expect(newNestedPositions.y).toEqual({ x: 55, y: 30, w: 40, h: 80 })
    expect(newNestedPositions.z).toEqual({ x: 55, y: 115, w: 40, h: 80 })
})

test('ResponsiveLayout.resizeFlex() - gap and padding are zoomed, widget sizes (already zoomed) are not', () => {

    const zoom = 0.5
    const rl = new ResponsiveLayout(zoom)

    // widget sizes are taken as-is: in the real pipeline they already come
    // from a model pre-scaled to the current zoom (see ModelUtil.createScalledModelFast)
    const a = widget('a', 0, 0, 50, 30, 0) // fixed width
    const b = widget('b', 60, 0, 50, 30, 1)
    const c = widget('c', 120, 0, 50, 30, 1)

    const box = {
        id: 'cntr',
        type: 'FlexContainer',
        name: 'FlexContainer',
        style: {
            flexDirection: 'row',
            alignItems: 'start', // opt out of stretch, irrelevant to what this test checks
            gap: 10, // un-zoomed design value -> 5 zoomed
            paddingTop: 20, // un-zoomed design value -> 10 zoomed
            paddingBottom: 20,
            paddingLeft: 20,
            paddingRight: 20
        },
        children: [a, b, c]
    }

    const newNestedPositions = {
        cntr: { x: 0, y: 0, w: 300, h: 100 }
    }

    rl.resizeFlex(box, box, newNestedPositions, '')

    // inner box: w 280 (300 minus 2x10 zoomed padding)
    // fixed child keeps its already-zoomed w:50, the 2 grow children equally
    // split the remaining 220 (280 - 50 - 2x5 zoomed gap) -> 110 each
    expect(newNestedPositions.a).toEqual({ x: 10, y: 10, w: 50, h: 30 })
    expect(newNestedPositions.b).toEqual({ x: 65, y: 10, w: 110, h: 30 })
    expect(newNestedPositions.c).toEqual({ x: 180, y: 10, w: 110, h: 30 })
})

test('ResponsiveLayout.resizeFlex() - a child with no props.resize.grow (or grow: 0) never grows, even when it is the only child', () => {

    const rl = new ResponsiveLayout(1)

    const a = { id: 'a', name: 'a', x: 0, y: 0, w: 50, h: 30, children: [], layout: { type: 'Grid' }, props: {} }

    const box = {
        id: 'cntr',
        type: 'FlexContainer',
        name: 'FlexContainer',
        style: {
            flexDirection: 'row',
            gap: 10,
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0
        },
        children: [a]
    }

    const newNestedPositions = {
        cntr: { x: 0, y: 0, w: 300, h: 100 }
    }

    rl.resizeFlex(box, box, newNestedPositions, '')

    // no props.resize at all -> treated as fixed (grow undefined is not > 0), keeps its own w:50
    expect(newNestedPositions.a).toEqual({ x: 0, y: 0, w: 50, h: 100 })
})

test('ResponsiveLayout.resizeFlex() - rowReverse: children fill from the right edge, main-start is the rightmost child', () => {

    const rl = new ResponsiveLayout(1)

    const a = widget('a', 0, 0, 50, 30, 0) // fixed width
    const b = widget('b', 60, 0, 50, 30, 1)
    const c = widget('c', 120, 0, 50, 30, 1)

    const box = {
        id: 'cntr',
        type: 'FlexContainer',
        name: 'FlexContainer',
        style: {
            flexDirection: 'rowReverse',
            gap: 10,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            paddingRight: 10
        },
        children: [a, b, c]
    }

    const newNestedPositions = {
        cntr: { x: 0, y: 0, w: 300, h: 100 }
    }

    rl.resizeFlex(box, box, newNestedPositions, '')

    // same sizing as the row test (fixed a:50, b/c grow to 105 each), but laid
    // out from the right edge (innerX + innerWidth = 10 + 280 = 290) leftward:
    // c first (rightmost, x:290-105=185), then b (185-10-105=70), then a (70-10-50=10)
    expect(newNestedPositions.c).toEqual({ x: 185, y: 10, w: 105, h: 80 })
    expect(newNestedPositions.b).toEqual({ x: 70, y: 10, w: 105, h: 80 })
    expect(newNestedPositions.a).toEqual({ x: 10, y: 10, w: 50, h: 80 })
})

test('ResponsiveLayout.resizeFlex() - columnReverse: children fill from the bottom edge, main-start is the bottommost child', () => {

    const rl = new ResponsiveLayout(1)

    const x = widget('x', 0, 0, 40, 20, 0) // fixed height
    const y = widget('y', 0, 25, 40, 20, 1)
    const z = widget('z', 0, 50, 40, 20, 1)

    const box = {
        id: 'cntr2',
        type: 'FlexContainer',
        name: 'FlexContainer',
        style: {
            flexDirection: 'columnReverse',
            gap: 5,
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
        },
        children: [x, y, z]
    }

    const newNestedPositions = {
        cntr2: { x: 0, y: 0, w: 100, h: 200 }
    }

    rl.resizeFlex(box, box, newNestedPositions, '')

    // same sizing as the column test (fixed x:20, y/z grow to 80 each), but laid
    // out from the bottom edge (innerY + innerHeight = 5 + 190 = 195) upward:
    // z first (bottommost, y:195-80=115), then y (115-5-80=30), then x (30-5-20=5)
    expect(newNestedPositions.z).toEqual({ x: 5, y: 115, w: 90, h: 80 })
    expect(newNestedPositions.y).toEqual({ x: 5, y: 30, w: 90, h: 80 })
    expect(newNestedPositions.x).toEqual({ x: 5, y: 5, w: 90, h: 20 })
})

test('ResponsiveLayout.resizeFlex() - children are laid out by their visual x order, not the order they appear in the tree', () => {

    const rl = new ResponsiveLayout(1)

    // spatially: left (fixed, x:0) < middle (x:50) < right (x:100)
    // but the tree/children array lists them out of visual order
    const left = widget('left', 0, 0, 30, 30, 0)
    const middle = widget('middle', 50, 0, 30, 30, 1)
    const right = widget('right', 100, 0, 30, 30, 1)

    const box = {
        id: 'cntr',
        type: 'FlexContainer',
        name: 'FlexContainer',
        style: {
            flexDirection: 'row',
            gap: 10,
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0
        },
        children: [right, left, middle] // deliberately scrambled
    }

    const newNestedPositions = {
        cntr: { x: 0, y: 0, w: 230, h: 30 }
    }

    rl.resizeFlex(box, box, newNestedPositions, '')

    // fixed "left" keeps w:30, the 2 grow children split the remaining 180 (230 - 30 - 2*10 gap) -> 90 each
    // placement must follow the visual (x sorted) order: left, middle, right
    expect(newNestedPositions.left).toEqual({ x: 0, y: 0, w: 30, h: 30 })
    expect(newNestedPositions.middle).toEqual({ x: 40, y: 0, w: 90, h: 30 })
    expect(newNestedPositions.right).toEqual({ x: 140, y: 0, w: 90, h: 30 })
})
