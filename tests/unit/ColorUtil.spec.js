import * as ColorUtil from '@/core/code/ColorUtil'

describe('ColorUtil.fromString', () => {
  test('reads the computed and the authored rgb() forms', () => {
    expect(ColorUtil.fromString('rgba(10, 20, 30, 0.5)')).toEqual({ r: 10, g: 20, b: 30, a: 0.5 })
    expect(ColorUtil.fromString('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 })
    expect(ColorUtil.fromString('rgb(10 20 30 / 50%)')).toEqual({ r: 10, g: 20, b: 30, a: 0.5 })
  })

  test('reads every hex length', () => {
    expect(ColorUtil.fromString('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(ColorUtil.fromString('#2563eb')).toEqual({ r: 37, g: 99, b: 235, a: 1 })
    expect(ColorUtil.fromString('#00000080')).toEqual({ r: 0, g: 0, b: 0, a: 0.502 })
    expect(ColorUtil.fromString('#0008')).toEqual({ r: 0, g: 0, b: 0, a: 0.533 })
  })

  test('a named color or anything else is not parsed', () => {
    // 'red' used to be read as the hex digits 'ed'
    expect(ColorUtil.fromString('red')).toBeUndefined()
    expect(ColorUtil.fromString('currentColor')).toBeUndefined()
    expect(ColorUtil.fromString('#12345')).toBeUndefined()
    expect(ColorUtil.fromString('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 0 })
  })
})
