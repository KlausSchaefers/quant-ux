import Analytics from '../../src/dash/Analytics'
import DataFrame from '../../src/common/DataFrame'
import tests from './data/outlierTest.json'
import events from './data/outlierEvents.json'

test('Test Analytics.getData() > ', async () => {

    const df = new DataFrame(events)
    const analytics = new Analytics()
    const details = analytics.getSessionDetails(df, tests.tasks)
    expect(details.data.length).toBe(8)
})