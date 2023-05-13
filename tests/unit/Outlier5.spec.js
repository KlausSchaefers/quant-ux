import * as outlier from '../../src/dash/Outlier'
import outlierEvents3 from './data/outlierEvents3.json'
import outlierEvents4 from './data/outlierEvents4.json'


import DataFrame from '../../src/common/DataFrame'

// test('Test Outlier.getGraphSessionScores() > 1', async () => {

//     const df = new DataFrame(outlierEvents4)

//     let scores = outlier.getGraphSessionScores(df, true, true)
 
//     console.debug(scores)
//     console.debug(scores.S1560448086805_9266)

   
//     const matrix = Object.values(scores).map(v => [v])
//     const minDistance = outlier.getQuantile(Object.values(scores), 0.25)
//     console.debug('minDistance', minDistance)
//     const cluster = outlier.optics(matrix, minDistance)
//     const outliers = clusterToDict(Object.keys(scores), cluster)
//     console.debug(outliers)

//     //S1560448086805_9266

// })


test('Test Outlier.computeOutliersCluster() > 1', async () => {
    const df = new DataFrame(outlierEvents3)
    const outliers = outlier.computeOutliersCluster(df)
    expect(Object.values(outliers).filter(v => v === 1).length).toBe(2)
    expect(outliers.S1683234591120_448).toBe(1)
    expect(outliers.S1683234566472_7919).toBe(1)
})

test('Test Outlier.computeOutliersIRQ() > 2', async () => {
    const df = new DataFrame(outlierEvents3)
    const outliers = outlier.computeOutliersIRQ(df)
    expect(Object.values(outliers).filter(v => v === 1).length).toBe(2)
    expect(outliers.S1683234591120_448).toBe(1)
    expect(outliers.S1683234566472_7919).toBe(1)
})


// test('Test Outlier.computeOutliersIRQ() > 4', async () => {
//     const df = new DataFrame(outlierEvents4)

//     let outliers = outlier.computeOutliersIRQ(df)
//     expect(outliers.S1528950120352_757).toBe(1)
//     expect(outliers.S1560448086805_9266).toBe(1)
//     //expect(Object.values(outliers).filter(v => v === -1).length).toBe(2)
//     //
//     // expect(outliers.S1529346602828_2760).toBe(1)
      

// })


// test('Test Outlier.computeOutliersMAD() > 4', async () => {
//     const df = new DataFrame(outlierEvents4)

//     let outliers = outlier.computeOutliersMAD(df)
//     console.debug(outliers)
//     expect(outliers.S1528950120352_757).toBe(1)
//     expect(outliers.S1560448086805_9266).toBe(1)
//     //expect(Object.values(outliers).filter(v => v === -1).length).toBe(2)
//     //
//     // expect(outliers.S1529346602828_2760).toBe(1)
      

// })


