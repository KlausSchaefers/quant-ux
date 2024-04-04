import * as outlier from '../../src/dash/Outlier'
import DataFrame from '../../src/common/DataFrame'
import outlierPattern from './data/outlierPattern.json'

const events = [
    {
        time: 1,
        session: 1,
        screen: 's1',
        widget: 'null',
        type: 'ScreenLoaded'
    },
    {
        time: 2,
        session: 1,
        screen: 's1',
        widget: 'null',
        type: 'ScreenClick'
    },
    {
        time: 3,
        session: 1,
        screen: 's1',
        widget: 'w1',
        type: 'WidgetClick'
    },
    {
        time: 4,
        session: 1,
        screen: 's1',
        widget: 'w2',
        type: 'WidgetClick'
    },
    {
        time: 5,
        session: 1,
        screen: 's1',
        widget: 'w1',
        type: 'WidgetClick'
    },
    //
    {
        time: 1,
        session: 2,
        screen: 's1',
        widget: 'null',
        type: 'ScreenLoaded'
    },
    {
        time: 3,
        session: 2,
        screen: 's1',
        widget: 'w1',
        type: 'WidgetClick'
    },
    {
        time: 4,
        session: 2,
        screen: 's1',
        widget: 'w2',
        type: 'WidgetClick'
    },
    {
        time: 5,
        session: 2,
        screen: 's1',
        widget: 'w3',
        type: 'WidgetClick'
    },
    {
        time: 6,
        session: 2,
        screen: 's1',
        widget: 'w1',
        type: 'WidgetClick'
    },
    //
    {
        time: 1,
        session: 3,
        screen: 's1',
        widget: 'null',
        type: 'ScreenLoaded'
    },
    {
        time: 2,
        session: 3,
        screen: 's1',
        widget: 'null',
        type: 'ScreenClick'
    },
    {
        time: 3,
        session: 3,
        screen: 's1',
        widget: 'w1',
        type: 'WidgetClick'
    },
    {
        time: 4,
        session: 3,
        screen: 's1',
        widget: 'w2',
        type: 'WidgetClick'
    },
    {
        time: 5,
        session: 3,
        screen: 's1',
        widget: 'w1',
        type: 'WidgetClick'
    },
    { // ignored
        time: 6,
        session: 3,
        screen: 's1',
        widget: 'w1',
        type: 'ValidationError'
    }
]

test('Test Outlier.getEditDistanceOutliers() > ', async () => {
    const df = new DataFrame(events)
    const scores = outlier.getEditDistanceOutliers(df, 0.5)
    console.debug(scores)
    expect(Object.values(scores).length).toBe(3)
    expect(scores['1'] < scores['2']).toBe(true)
    expect(scores['3'] < scores['2']).toBe(true)
})

test('Test Outlier.getEditDistanceOutliers() 2> ', async () => {
    const df = new DataFrame(outlierPattern)
    const scores = outlier.getEditDistanceOutliers(df)
    expect(Object.values(scores).length).toBe(8)
})


test('Test Outlier.getEditDistanceSessionScores()', async () => {
    const df = new DataFrame(outlierPattern)
    const scores = outlier.getEditDistanceSessionScores(df)
    expect(Object.values(scores).length).toBe(8)
    expect(scores.S1682030162151_6362).toBe(72)
})


test('Test Outlier.editDistance() > ', async () => {

    expect(outlier.editDistance([1,2,3,4],[1,2,3,4])).toBe(0)
    expect(outlier.editDistance([1,2,3,4],[1,2,3,5])).toBe(1)
    expect(outlier.editDistance([1,2,3,4],[1,2,3,4,5])).toBe(1)
    expect(outlier.editDistance([1,2,3,4,3],[1,3,4,5,3])).toBe(2)
})


test('Test Outlier.editDistance() > ', async () => {

    expect(outlier.editDistance([1,2,3,4],[1,2,3,4])).toBe(0)
    expect(outlier.editDistance([1,2,3,4],[1,2,3,5])).toBe(1)
    expect(outlier.editDistance([1,2,3,4],[1,2,3,4,5])).toBe(1)
    expect(outlier.editDistance([1,2,3,4,3],[1,3,4,5,3])).toBe(2)
})

test('Test Outlier.encodeSessions() > ', async () => {

    const df = new DataFrame(events)
    const encoded = outlier.encodeSessions(df)
    expect(Object.values(encoded).length).toBe(3)
    expect(encoded['1'].join(',')).toBe('1,2,3,4,3')
    expect(encoded['2'].join(',')).toBe('1,3,4,5,3')
    expect(encoded['3'].join(',')).toBe('1,2,3,4,3')
})



test('Test Outlier.getOutlierByQuantile() > ', async () => {

    let result = outlier.getOutlierByQuantile({a: 10, b: 10, c:10}, 0.1);
    expect(Object.values(result).length).toBe(3)
    expect(Object.values(result).filter(score => score === 1).length).toBe(0)
 
    result = outlier.getOutlierByQuantile({a: 10, b: 11, c:10}, 0.1);
    expect(Object.values(result).length).toBe(3)
    expect(Object.values(result).filter(score => score === 1).length).toBe(0)

    // here the value is too high for our real world example
    // we would set much lower quantile values
    result = outlier.getOutlierByQuantile({a: 10, b: 11, c:10}, 0.6);
    expect(result.a).toBe(1)
    expect(result.b).toBe(0)
    expect(result.c).toBe(1)
   

    result = outlier.getOutlierByQuantile({a: 10, b: 11, c:10,d: 10, e: 12, f:10, h:9, j: 2}, 0.1);
    expect(result.j).toBe(1)
    expect(Object.values(result).filter(score => score === 1).length).toBe(1)
    

    result = outlier.getOutlierByQuantile({a: 10, b: 11, c:10,d: 10, e: 12, f:10, h:9, j: 8}, 0.1);
    expect(result.j).toBe(1)
    expect(Object.values(result).filter(score => score === 1).length).toBe(1)

})

test('Test Outlier.encodeSessions() > ', async () => {
    const df = new DataFrame(events)
    const encoded = outlier.encodeSessions(df)
    expect(Object.values(encoded).length).toBe(3)
    expect(encoded['1'].join(',')).toBe('1,2,3,4,3')
    expect(encoded['2'].join(',')).toBe('1,3,4,5,3')
    expect(encoded['3'].join(',')).toBe('1,2,3,4,3')
})


