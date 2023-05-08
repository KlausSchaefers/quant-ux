import * as Outlier from '../../src/dash/Outlier'

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

    const cluster = Outlier.dbscan([
        [4,5],
        [5,5],
        [4,4],
        [4,4],
        [10,10],
        [9,9],
        [10,9],
        [9,10],
        [1,1]
    ], 2, 3)
    console.debug('DBScan', cluster.join())
    expect(cluster.filter(x => x === -1).length).toBe(1)
    expect(cluster[8]).toBe(-1)

 
})


