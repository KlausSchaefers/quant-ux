
import * as outlier from '../../src/dash/Outlier'
import DataFrame from '../../src/common/DataFrame'


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
    // the outlier
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


// test('Test Outlier.normalizeGraphScores() > Normalized', async () => {

//     let scores = outlier.normalizeGraphScores({'a': 0, 'b': 3, 'c': 6})
//     console.debug(scores)
//     expect(scores['a']).toBe(1)
//     expect(scores['b']).toBe(0.5)
//     expect(scores['c']).toBe(0)

//     scores = outlier.normalizeGraphScores({'a': 5, 'b': 15, 'c': 15})
//     expect(scores['a']).toBe(1)
//     expect(scores['b']).toBe(0)
//     expect(scores['c']).toBe(0)

//     scores = outlier.normalizeGraphScores({'a': 5, 'b': 15, 'c': 25})
//     expect(scores['a']).toBe(1)
//     expect(scores['b']).toBe(0.5)
//     expect(scores['c']).toBe(0)
// })

test('Test Outlier.normalizeGraphScores() > Raw', async () => {

    let scores = outlier.normalizeGraphScores({'a': 0, 'b': 3, 'c': 6}, false)
    expect(scores['a']).toBe(6)
    expect(scores['b']).toBe(3)
    expect(scores['c']).toBe(0)

    scores = outlier.normalizeGraphScores({'a': 5, 'b': 15, 'c': 15}, false)
    expect(scores['a']).toBe(10)
    expect(scores['b']).toBe(0)
    expect(scores['c']).toBe(0)

    scores = outlier.normalizeGraphScores({'a': 5, 'b': 15, 'c': 25}, false)
    expect(scores['a']).toBe(20)
    expect(scores['b']).toBe(10)
    expect(scores['c']).toBe(0)
})

test('Test Outlier.getGraphSessionScores() > ', async () => {
    const df = new DataFrame(events)
    const scores = outlier.getGraphSessionScores(df)
    expect(Object.values(scores).length).toBe(3)
    expect(scores['1']).toBe(0)
    expect(scores['2']).toBe(1)
    expect(scores['3']).toBe(0)
})


test('Test Outlier.getIRQOutlier() > ', async () => {
    
    const scores = outlier.getIRQOutlier({1: 20, 2:23, 3: 21, 4:20, 5:40})
    expect(Object.values(scores).length).toBe(5)
    expect(Object.values(scores).filter(score => score === 1).length).toBe(1)
    expect(scores[5]).toBe(1)
})

test('Test Outlier.getMADOutlier() > ', async () => {
    
    const scores = outlier.getMADOutlier({1: 20, 2:23, 3: 21, 4:20, 5:40})
    console.debug(scores)
    expect(Object.values(scores).length).toBe(5)
    expect(Object.values(scores).filter(score => score === 1).length).toBe(1)
    expect(scores[5]).toBe(1)
})


