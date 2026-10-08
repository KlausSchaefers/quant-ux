import * as FlexMath from '@/core/responsive/FlexMath'

const item = (id, x, y, w, h, resize = {}) => ({ id, x, y, w, h, props: { resize } })
const frame = { x: 100, y: 50, w: 300, h: 100 }
const style = { flexDirection: 'row', gap: 10, alignItems: 'start', paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10 }
const layout = (items, extra = {}) => FlexMath.layoutItems(FlexMath.getContainerConfig({ ...style, ...extra }), frame, items)

describe('Fixed/grow auto layout', () => {
  test('a row keeps measured sizes, gap and padding', () => {
    expect(layout([item('a', 0, 0, 50, 20), item('b', 0, 0, 60, 30)])).toEqual({
      a: { x: 120, y: 60, w: 50, h: 20 }, b: { x: 180, y: 60, w: 60, h: 30 }
    })
  })
  test('grow shares free space without changing fixed siblings', () => {
    const result = layout([item('a', 0, 0, 50, 20), item('b', 0, 0, 10, 20, { grow: 1 }), item('c', 0, 0, 10, 20, { grow: 1 })])
    expect(result.b.w).toBe(95)
    expect(result.c.x + result.c.w).toBe(380)
  })
  test.each([['center', 215, 275], ['end', 310, 370], ['spaceBetween', 120, 370]])('justify %s', (justifyContent, a, b) => {
    const result = layout([item('a', 0, 0, 50, 20), item('b', 0, 0, 10, 20)], { justifyContent })
    expect(result.a.x).toBe(a)
    expect(result.b.x).toBe(b)
  })
  test('stretch respects the existing fixed cross-axis flag', () => {
    const result = layout([item('a', 0, 0, 50, 20, { fixedVertical: true }), item('b', 0, 0, 50, 20)], { alignItems: 'stretch' })
    expect(result.a.h).toBe(20)
    expect(result.b.h).toBe(80)
  })
  test('a reversed column starts at the bottom', () => {
    const result = layout([item('a', 0, 0, 50, 20), item('b', 0, 0, 60, 30)], { flexDirection: 'columnReverse' })
    expect(result.a).toEqual({ x: 120, y: 120, w: 50, h: 20 })
    expect(result.b).toEqual({ x: 120, y: 80, w: 60, h: 30 })
  })
  test('visual order follows the direction and keeps old alignment names', () => {
    expect(FlexMath.normalizeAlign('top')).toBe('start')
    const config = FlexMath.getContainerConfig({ flexDirection: 'rowReverse' })
    expect(FlexMath.sortItems(config, [item('a', 0, 0, 10, 10), item('b', 50, 0, 10, 10)]).map(i => i.id)).toEqual(['b', 'a'])
  })
})
