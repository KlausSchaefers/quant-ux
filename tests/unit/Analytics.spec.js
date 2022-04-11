import Analytics from '../../src/dash/Analytics'
import DataFrame from '../../src/common/DataFrame'
import analyticStartBugEvents from './data/analyticStartBugEvents.json'
import analyticStartBugTask from './data/analyticStartBugTask.json'

test('Test Analytics.getTaskSummary() > too many starts bug', async () => {

    const a = new Analytics()
    let hits = analyticStartBugEvents.filter(e => {
        return   e.screen == "s10004_28487" && e.type == "ScreenLoaded"
    })
    
    const df = new DataFrame(analyticStartBugEvents)
    const sessionCount = df.count('session').size()
 
    const summary = a.getTaskSummary(df ,analyticStartBugTask.tasks, [])
    expect(summary[0].startCount).toBe(8)
    expect(sessionCount).toBe(8)
    expect(hits.length).toBe(80)
});

