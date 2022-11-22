import * as SnappUtil from '../../src/core/SnappUtil'

test('Test SnappUtil.getMinLine() >  ', async () => {

    let l = SnappUtil.getMinLine([{dist: 3}, {dist: 2}, null, {dist: -4}, {dist: -1}])
    expect(l.dist).toBe(-1)

    l = SnappUtil.getMinLine([{dist: 3}, {dist: -2}, null, {dist: -4}, {dist: 1}])
    expect(l.dist).toBe(1)
})