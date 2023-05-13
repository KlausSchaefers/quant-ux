import * as Outlier from '../../src/dash/Outlier'
import LOF from '../../src/dash/LOF'

const data = [
    [4,5],
    [5,5],
    [4,4],
    [4,4],
    [10,10],
    [9,9],
    [10,9],
    [9,10],
    [1,1]
]

test('Test Outlier.optics() > ', async () => {
    const cluster = Outlier.optics(data, 2, 2)
    console.debug('Optics', cluster.join())
    expect(cluster[8]).toBe(-1)
    expect(cluster.filter(x => x === -1).length).toBe(1)
})

test('Test Outlier.dbscan() > ', async () => {
    const cluster = Outlier.dbscan(data, 2, 3)
    console.debug('DBScan', cluster.join())
    expect(cluster.filter(x => x === -1).length).toBe(1)
    expect(cluster[8]).toBe(-1)
})


test('Test Outlier.lof() > ', async () => {

    const cluster = Outlier.lof(data, 2, 3)
    console.debug('LOF', cluster.join())
    expect(cluster.filter(x => x === -1).length).toBe(1)
    expect(cluster[8]).toBe(-1)

})

test('Test Outlier.lof() > KNearestNeighbours', async () => {

    const lof = new LOF()
    lof.init([[1], [2], [3], [4], [5], [6], [7]])
    const rows = lof.rows
    let knn = lof.getKNearestNeighbors(rows, rows[0], 3)
    expect(knn[0].value[0]).toBe(2)
    expect(knn[1].value[0]).toBe(3)
    expect(knn[2].value[0]).toBe(4)

    let kth = lof.getKthNearestNeighbor(rows, rows[0], 3)
    expect(kth.value[0]).toBe(4)

    kth = lof.getKthNearestNeighbor(rows, rows[0], 5)
    expect(kth.value[0]).toBe(6)

})