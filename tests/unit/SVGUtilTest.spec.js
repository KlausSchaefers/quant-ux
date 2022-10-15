import * as SVGUtil from '../../src/svg/SVGUtil'

test('Test SVGUtil.changePathOrder() >  ', async () => {

    const paths = [
        {
            id: '1'
        },
        {
            id: '2'
        },
        {
            id: '3'
        }
    ]
    SVGUtil.changePathOrder(paths, '1', '2')
    expect(paths[0].id).toBe('2')
    expect(paths[1].id).toBe('1')
    expect(paths[2].id).toBe('3')
    console.debug(paths)

    SVGUtil.changePathOrder(paths, '2', '1')
    expect(paths[0].id).toBe('1')
    expect(paths[1].id).toBe('2')
    expect(paths[2].id).toBe('3')

    console.debug(paths)
})