import * as outlier from '../../src/dash/Outlier'
import * as Distance from '../../src/dash/Distance'
import DataFrame from '../../src/common/DataFrame'
import tests from './data/outlierTest.json'
import events from './data/outlierEvents.json'
import umapResult from './data/umapResult.json'

test('Test Outlier.getBaseData() > ', async () => {

    const df = new DataFrame(events)
    const details = outlier.getBaseData(df, tests.tasks)
    expect(details.length).toBe(8)
})


test('Test Outlier.l2() > ', async () => {

    let d = Distance.l2([1,1], [1,1])
    expect(d).toBe(0)

    d = Distance.l2([0,0], [1,1])
    expect(d).toBe(Math.sqrt(2))

    d = Distance.l2([0,0], [3,3])
    expect(d).toBe(Math.sqrt(18))
})


test('Test Outlier.getZScore() > ', async () => {

    const m = [
        [1, 4, 6],
        [4, 1, 6],
        [3, 9, 1]
    ]
    const result = outlier.getZScore(m)

})

test('Test Outlier.getRankScore() > ', async () => {

    const m = [
        [1, 1, 6],
        [2, 3, 6],
        [3, 2, 1],
        [4, 9, 1]
    ]
    const result = outlier.getRankScore(m)

    expect(result[0][0]).toBe(0)
    expect(result[1][0]).toBe(1)
    expect(result[2][0]).toBe(2)
    expect(result[3][0]).toBe(3)

    expect(result[0][1]).toBe(0)
    expect(result[1][1]).toBe(2)
    expect(result[2][1]).toBe(1)
    expect(result[3][1]).toBe(3)

    expect(result[0][2]).toBe(1)
    expect(result[1][2]).toBe(1)
    expect(result[2][2]).toBe(0)
    expect(result[3][2]).toBe(0)
})

test('Test Outlier.getMinMaxScore() > ', async () => {

    let m = [
        [10],
        [5],
        [0]
    ]
    let result = outlier.getMinMaxScore(m)
    expect(result[0][0]).toBe(1)
    expect(result[1][0]).toBe(0.5)
    expect(result[2][0]).toBe(0)

    m = [
        [10, 0, 100],
        [5, 10, 900],
        [0, 20, 450]
    ]
    result = outlier.getMinMaxScore(m)
    

    expect(result[0][0]).toBe(1)
    expect(result[1][0]).toBe(0.5)
    expect(result[2][0]).toBe(0)

    expect(result[0][1]).toBe(0)
    expect(result[1][1]).toBe(0.5)
    expect(result[2][1]).toBe(1)


    result = outlier.getMinMaxScore(m, 100)

    expect(result[0][0]).toBe(100)
    expect(result[1][0]).toBe(50)
    expect(result[2][0]).toBe(0)

    expect(result[0][1]).toBe(0)
    expect(result[1][1]).toBe(50)
    expect(result[2][1]).toBe(100)


    result = outlier.getMinMaxScore(umapResult, 100)
    expect(Math.max(...result.map(x => x[0]))).toBe(100)
    expect(Math.max(...result.map(x => x[1]))).toBe(100)
    console.debug(Math.max(...result.map(x => x[1])))

})


test('Test Outlier.getPairwiseDistance() > ', async () => {
    const matrix = [
        [1, 1, 1],
        [2, 2, 2],
        [3, 3, 3]
    ]
    const dist = outlier.getPairwiseDistance(matrix)
    console.table(dist)
    expect(dist.length).toBe(3)
    expect(dist[0][0]).toBe(0)
    expect(dist[1][1]).toBe(0)
    expect(dist[2][2]).toBe(0)


    expect(dist[0][1]).toBe(Math.sqrt(3)) // [1,1,1] [2,2,2]
    expect(dist[1][0]).toBe(Math.sqrt(3))

    expect(dist[0][2]).toBe(Math.sqrt(12))
    expect(dist[2][0]).toBe(Math.sqrt(12))

    expect(dist[1][2]).toBe(Math.sqrt(3)) // [1,1,1] [2,2,2]
    expect(dist[2][1]).toBe(Math.sqrt(3))
})