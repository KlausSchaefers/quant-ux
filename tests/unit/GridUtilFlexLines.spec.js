import * as GridUtil from '../../src/core/GridUtil'

function child (id, x, y, w, h) {
    return { id, x, y, w, h }
}

test('GridUtil.getFlexContainerLines() - row: one x line half a gap before and after every child', () => {

    const cntr = {
        id: 'cntr',
        x: 100, y: 100, w: 400, h: 200,
        style: { flexDirection: 'row', gap: 20 }
    }
    const children = [
        child('a', 110, 110, 50, 100),  // 110 - 160
        child('b', 180, 110, 50, 100)   // 180 - 230
    ]

    const lines = GridUtil.getFlexContainerLines(cntr, children, 1)

    // half gap is 10: before/after a -> 100, 170. before/after b -> 170, 240
    expect(lines.x).toEqual([100, 170, 170, 240])
    expect(lines.y).toEqual([])
})

test('GridUtil.getFlexContainerLines() - column: y lines instead of x lines', () => {

    const cntr = {
        id: 'cntr',
        x: 100, y: 100, w: 200, h: 400,
        style: { flexDirection: 'column', gap: 20 }
    }
    const children = [
        child('a', 110, 110, 100, 50),  // 110 - 160
        child('b', 110, 180, 100, 50)   // 180 - 230
    ]

    const lines = GridUtil.getFlexContainerLines(cntr, children, 1)

    expect(lines.y).toEqual([100, 170, 170, 240])
    expect(lines.x).toEqual([])
})

test('GridUtil.getFlexContainerLines() - the gap is zoomed, the children are not', () => {

    const cntr = {
        id: 'cntr',
        x: 100, y: 100, w: 400, h: 200,
        // un-zoomed design value -> 20 at zoom 0.5, half gap 10
        style: { flexDirection: 'row', gap: 40 }
    }
    const children = [child('a', 110, 110, 50, 100)]

    const lines = GridUtil.getFlexContainerLines(cntr, children, 0.5)

    expect(lines.x).toEqual([100, 170])
})

test('GridUtil.getFlexContainerLines() - rowReverse/columnReverse use the same axis as row/column', () => {

    const row = { x: 100, y: 100, w: 400, h: 200, style: { flexDirection: 'rowReverse', gap: 20 } }
    expect(GridUtil.getFlexContainerLines(row, [child('a', 110, 110, 50, 100)], 1).x).toEqual([100, 170])

    const column = { x: 100, y: 100, w: 200, h: 400, style: { flexDirection: 'columnReverse', gap: 20 } }
    expect(GridUtil.getFlexContainerLines(column, [child('a', 110, 110, 100, 50)], 1).y).toEqual([100, 170])
})

test('GridUtil.getFlexContainerLines() - no gap means the lines sit on the child edges', () => {

    const cntr = { x: 100, y: 100, w: 400, h: 200, style: { flexDirection: 'row' } }
    const children = [child('a', 110, 110, 50, 100)]

    expect(GridUtil.getFlexContainerLines(cntr, children, 1).x).toEqual([110, 160])
})

test('GridUtil.getFlexContainerLines() - no children and no style are handled', () => {
    expect(GridUtil.getFlexContainerLines({}, [], 1)).toEqual({ x: [], y: [] })
})

test('GridUtil.getFlexContainerLines() - lines are clamped to the container dimensions', () => {

    const row = { x: 100, y: 100, w: 200, h: 200, style: { flexDirection: 'row', gap: 20 } }
    const rowChildren = [
        child('a', 105, 110, 50, 100),  // 105 - 155 -> before line 95 is left of the container (tolerance 2px)
        child('b', 250, 110, 50, 100)   // 250 - 300 -> after line 310 is right of the container (tolerance 2px)
    ]
    expect(GridUtil.getFlexContainerLines(row, rowChildren, 1).x).toEqual([98, 165, 240, 302])

    const column = { x: 100, y: 100, w: 200, h: 200, style: { flexDirection: 'column', gap: 20 } }
    const columnChildren = [
        child('a', 110, 105, 100, 50),
        child('b', 110, 250, 100, 50)
    ]
    expect(GridUtil.getFlexContainerLines(column, columnChildren, 1).y).toEqual([98, 165, 240, 302])
})
