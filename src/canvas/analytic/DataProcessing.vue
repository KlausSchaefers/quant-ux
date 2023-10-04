
<template>
  <div class="MatcCanvas MatcAnalyticCanvas">

  </div>
</template>
  
  
<script>

import DataFrame from "common/DataFrame";
import Analytics from "dash/Analytics";
import * as Outlier from 'dash/Outlier'

export default {
  name: "DataProcessing",
  mixins: [],
  data: function () {
    return {
    };
  },
  components: {},
  methods: {


    getOutlierScores() {
      if (!this.cache["outliers"]) {
        const df = new DataFrame(this.events);
        //const outliers = Outlier.computeOutliersIRQ(df);
        const outliers = Outlier.computeOutliersMAD(df, 2)
        this.cache["outliers"] = outliers
      }
      return this.cache["outliers"];
    },

    getGestures() {
      if (!this.cache["gestures"]) {
        var df = new DataFrame(this.events);
        var gestures = df.select("type", "in", [
          "ScreenGesture",
          "WidgetGesture",
        ]);
        this.cache["gestures"] = gestures.data;
      }

      return this.cache["gestures"];
    },

    getUserJourney() {
      if (!this.cache["userJourney"]) {
        var df = new DataFrame(this.events);
        df.sortBy("time");
        var sessionGroup = df.groupBy("session");
        let sessions = sessionGroup.data;
        this.cache["userJourney"] = sessions;
      }
      return this.cache["userJourney"];
    },

    getTaskPerformance() {
      if (!this.cache["taskPerformance"]) {
        const analytics = new Analytics();
        const df = new DataFrame(this.events);
        df.sortBy("time");

        const temp = analytics.getTaskPerformance(
          df, this.testSettings.tasks, false, false
        );
        const sessions = {};
        for (let i = 0; i < temp.data.length; i++) {
          const match = temp.data[i];
          if (!sessions[match.session]) {
            sessions[match.session] = {};
          }
          if (!sessions[match.session][match.task]) {
            sessions[match.session][match.task] = match;
          } else {
            console.warn("getTaskPerformance() Double mactch", match);
          }
        }
        this.cache["taskPerformance"] = sessions;
      }
      return this.cache["taskPerformance"];
    },

    getOverlayViews() {
      if (!this.cache["overlayViews"]) {
        var screenLoads = this.df.select("type", "==", "OverlayLoaded");

        var screenLoadCounts = screenLoads.count("overlay");
        var totalScreenLoads = screenLoads.size();

        var views = {};
        var screens = this.getScreens(this.sourceModel);
        for (var s = 0; s < screens.length; s++) {
          var screen = screens[s];
          views[screen.id] = screenLoadCounts.get(screen.id, null, 0);
        }

        this.cache["overlayViews"] = {
          total: totalScreenLoads,
          counts: views,
        };
      }
      return this.cache["overlayViews"];
    },

    getOverlayTest() {
      if (!this.cache["overlayTests"]) {
        var sessions = this.df.groupBy("session");
        var sessionCount = sessions.size().size();

        var tests = {};
        var screens = this.getScreens(this.sourceModel);
        for (var s = 0; s < screens.length; s++) {
          var screen = screens[s];
          tests[screen.id] = 0;
        }

        sessions.foreach(function (df) {
          var screenCounts = df.count("overlay"); // diference to screenTest
          screenCounts.foreach(function (row, id) {
            tests[id] += 1;
          });
        });

        this.cache["overlayTests"] = {
          sessions: sessionCount,
          counts: tests,
        };
      }
      return this.cache["overlayTests"];
    },

    getScreenViews() {
      if (!this.cache["screenViews"]) {
        var screenLoads = this.df.select("type", "==", "ScreenLoaded");
        var screenLoadCounts = screenLoads.count("screen");
        var totalScreenLoads = screenLoads.size();

        var views = {};
        var screens = this.getScreens(this.sourceModel);
        for (var s = 0; s < screens.length; s++) {
          var screen = screens[s];
          views[screen.id] = screenLoadCounts.get(screen.id, null, 0);
        }

        this.cache["screenViews"] = {
          total: totalScreenLoads,
          counts: views,
        };
      }
      return this.cache["screenViews"];
    },

    getScreenTests() {
      if (!this.cache["screenTests"]) {
        var sessions = this.df.groupBy("session");
        var sessionCount = sessions.size().size();

        var tests = {};
        var screens = this.getScreens(this.sourceModel);
        for (var s = 0; s < screens.length; s++) {
          var screen = screens[s];
          tests[screen.id] = 0;
        }

        sessions.foreach(function (df) {
          var screenCounts = df.count("screen");
          screenCounts.foreach(function (row, id) {
            tests[id] += 1;
          });
        });

        this.cache["screenTests"] = {
          sessions: sessionCount,
          counts: tests,
        };
      }
      return this.cache["screenTests"];
    },

    getScreenDwellTime() {
      if (!this.cache["screenDwell"]) {
        var count = this.df.count("session");
        var sessionCount = count.size();

        var analytics = new Analytics();
        var screenTimeGrouping = analytics.getScreenTimeGrouping(this.df);
        var totalTime = screenTimeGrouping.sum().sum();

        var times = {};
        var screens = this.getScreens(this.sourceModel);
        for (var s = 0; s < screens.length; s++) {
          var screen = screens[s];
          var screenTimeDF = screenTimeGrouping.get(screen.id);
          if (screenTimeDF) {
            times[screen.id] = screenTimeDF.sum();
          } else {
            times[screen.id] = 0;
          }
        }

        this.cache["screenDwell"] = {
          total: totalTime,
          times: times,
          sessions: sessionCount,
        };
      }
      return this.cache["screenDwell"];
    },

    getOverlayDwellTime() {
      if (!this.cache["overlayDwell"]) {
        var count = this.df.count("session");
        var sessionCount = count.size();

        var analytics = new Analytics();

        /**
         * We calculate the overlay time relative to the absolute screen time...
         */
        var screenTimeGrouping = analytics.getScreenTimeGrouping(this.df);
        var totalTime = screenTimeGrouping.sum().sum();

        var overlayGrouping = analytics.getOverlayTimeGrouping(this.df);

        var times = {};
        var screens = this.getScreens(this.sourceModel);
        for (var s = 0; s < screens.length; s++) {
          var screen = screens[s];
          var screenTimeDF = overlayGrouping.get(screen.id);
          if (screenTimeDF) {
            times[screen.id] = screenTimeDF.sum();
          } else {
            times[screen.id] = 0;
          }
        }

        this.cache["overlayDwell"] = {
          total: totalTime,
          times: times,
          sessions: sessionCount,
        };
      }
      return this.cache["overlayDwell"];
    },

    getScreenWidgetClicks() {
      if (!this.cache["screenWidgetClicks"]) {
        /**
         * FIXME: This could be nice with regards to the overlays....
         *
         * Some clicks should be attributed the to overlay, nit the clicks, or?
         */
        var widgetEvents = this.df.select("type", "==", "WidgetClick");
        var widgetScreenEvents = widgetEvents.count("screen");
        var totalWidgetEvents = widgetScreenEvents.sum();

        /**
         * Now filter out overlay events
         */
        widgetEvents = widgetEvents.select("overlay", "==", null);
        widgetScreenEvents = widgetEvents.count("screen");

        var clicks = {};
        var screens = this.getScreens(this.sourceModel);
        for (var s = 0; s < screens.length; s++) {
          var screen = screens[s];
          clicks[screen.id] = widgetScreenEvents.get(screen.id, null, 0);
        }

        this.cache["screenWidgetClicks"] = {
          clicks: clicks,
          total: totalWidgetEvents,
        };
      }

      return this.cache["screenWidgetClicks"];
    },


    getScreenClicksOnBackground(df) {

      const screenClicks = df.select("type", "==", "ScreenClick");
      return screenClicks

    },

    getMissedClicks(df) {
     
        /** 
         * Get all screens that do not have a line
         */
        var screens = Object.values(this.sourceModel.screens);
        let passiveScreens = {}
        screens.forEach(s => {
          let linesFrom = this.getFromLines(s)
          if (linesFrom.length === 0) {
            passiveScreens[s.id] = true
          }
        })


        /**
         * Get all the widgets that do not have a line
         * AND that are not inputs 
         */
        let passiveWidgets = []
        let widgets = Object.values(this.sourceModel.widgets)
        widgets.forEach(w => {
          if (w.type === "Box" || w.type === "Button" || w.type === "HotSpot") {
            let linesFrom = this.getFromLines(w)
            if (linesFrom.length === 0) {
              passiveWidgets[w.id] = true
            }
          }
        })

        /**
         * Filter screenclicks for these screens
         */
        let clickEvents = df
          .select("type", "in", ["ScreenClick", "WidgetClick"])
          .as_array();


        let missedClicks = clickEvents.filter(e => {
          if (e.type === "ScreenClick" && passiveScreens[e.screen] === true) {
            return true
          }
          if (e.type === "WidgetClick" && passiveWidgets[e.widget] === true) {
            return true
          }

          return false
        })

        return missedClicks;


      
    },


    getScreenClicks() {
      if (!this.cache["screenClicks"]) {
        /**
         * FIXME: This could be nice with regards to the overlays....
         *
         * Some clicks should be attributed the to overlay, nit the clicks, or?
         */
        var clickEvents = this.df.select("type", "in", [
          "ScreenClick",
          "WidgetClick",
        ]);
        var clickEventsCount = clickEvents.count("screen");
        var totalWidgetEvents = clickEventsCount.sum();

        var widgetEvents = this.df.select("type", "==", "ScreenClick");
        var widgetScreenEvents = widgetEvents.count("screen");

        var clicks = {};
        var screens = this.getScreens(this.sourceModel);
        for (var s = 0; s < screens.length; s++) {
          var screen = screens[s];
          clicks[screen.id] = widgetScreenEvents.get(screen.id, null, 0);
        }

        this.cache["screenClicks"] = {
          clicks: clicks,
          total: totalWidgetEvents,
        };
      }

      return this.cache["screenClicks"];
    },

    getOverlayClicks() {
      if (!this.cache["overlayCicks"]) {
        /**
         * FIXME: This could be nice with regards to the overlays....
         *
         * Some clicks should be attributed the to overlay, nit the clicks, or?
         */
        var widgetEvents = this.df.select("type", "==", "ScreenClick");
        var widgetScreenEvents = widgetEvents.count("overlay");
        var totalWidgetEvents = widgetScreenEvents.sum();

        var clicks = {};
        var screens = this.getScreens(this.sourceModel);
        for (var s = 0; s < screens.length; s++) {
          var screen = screens[s];
          clicks[screen.id] = widgetScreenEvents.get(screen.id, null, 0);
        }

        this.cache["overlayCicks"] = {
          clicks: clicks,
          total: totalWidgetEvents,
        };
      }

      return this.cache["overlayCicks"];
    },

    getOverlayWidgetClicks() {
      if (!this.cache["overlayWidgetCicks"]) {
        /**
         * FIXME: This could be nice with regards to the overlays....
         *
         * Some clicks should be attributed the to overlay, nit the clicks, or?
         */
        var widgetEvents = this.df.select("type", "==", "WidgetClick");
        var widgetScreenEvents = widgetEvents.count("overlay");
        var totalWidgetEvents = widgetScreenEvents.sum();

        var clicks = {};
        var screens = this.getScreens(this.sourceModel);
        for (var s = 0; s < screens.length; s++) {
          var screen = screens[s];
          clicks[screen.id] = widgetScreenEvents.get(screen.id, null, 0);
        }

        this.cache["overlayWidgetCicks"] = {
          clicks: clicks,
          total: totalWidgetEvents,
        };
      }

      return this.cache["overlayWidgetCicks"];
    },

    getLineWidgetData() {
      if (!this.cache["lineWidgetData"]) {
        let result = {}
        let allWidetData = this.getWidgetData()
        let maxClicksAbs = 0
        // filter only for clicks on lines, and calcuate the clicksRel
        for (let id in this.model.lines) {
          let from = this.model.lines[id].from
          if (allWidetData[from]) {
            const clicksAbs = allWidetData[from].clicksAbs
            result[from] = {
              clicksAbs: clicksAbs
            }
            maxClicksAbs = Math.max(maxClicksAbs, clicksAbs)
          }
          Object.values(result).forEach(v => {
            v.clicksRel = v.clicksAbs / maxClicksAbs
          })
        }
        this.cache["lineWidgetData"] = result
      }
      return this.cache["lineWidgetData"]
    },

    getWidgetData() {
      if (!this.cache["widgetData"]) {
        var analytics = new Analytics();
        var widgets = {};
        var data = analytics.getWidgetStatistics(this.sourceModel, this.df);
        for (var id in data) {
          widgets[id] = data[id];
        }
        this.cache["widgetData"] = widgets;
      }
      return this.cache["widgetData"];
    },

    getFirstNClicksData(events, n) {
      console.debug('getFirstNClicksData', events.length)
      const analytics = new Analytics();
      return analytics.getFirstNClicks(events, n);
    },


  },
  mounted() { },
};
</script>