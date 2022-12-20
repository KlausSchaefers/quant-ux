import taskPerfBugEvents from './data/taskPerfBugEvents.json'

import Analytics from '../../src/dash/Analytics'
import DataFrame from '../../src/common/DataFrame'

test('Test TaskPerfBug() >  ', async () => {
   
    let tasks = [ {
          "name" : "Abrir e fechar menu",
          "description" : "Abrir e fechar menu",
          "id" : "t1671423029540",
          "strict" : false,
          "flow" : [ {
            "screen" : "s10004_44385",
            "widget" : null,
            "type" : "ScreenLoaded"
          }, {
            "screen" : "s10005_76053",
            "widget" : null,
            "type" : "ScreenLoaded"
          }, {
            "screen" : "s10004_44385",
            "widget" : null,
            "type" : "ScreenLoaded"
          } ]
    }]

    let analytics = new Analytics()
    let session = new DataFrame(taskPerfBugEvents);
    session = getActionEvents(session);
    const matches = analytics.getTaskPerformance(session, tasks, true);
    expect(matches.data.length).toBe(1)
})

function  getActionEvents (df) {
    return df.select("type", "in", [
      "ScreenClick",
      "WidgetClick",
      "WidgetChange",
      "ValidationError",
      "ValidationErrorLine",
      "ScreenLoaded",
      "OverlayLoaded",
      "OverlayRemoved",
      "ScreenGesture",
      "WidgetGesture"
    ]);
}