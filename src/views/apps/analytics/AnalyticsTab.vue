<template>
  <div class="MatcTest">
    <section class="" v-if="false">

        <div class="box is-shadowless">
          <div class="level">
            <div class="level-left">
              <h3 class="level-item title">
                  Dashboard <HelpButton topic="analytics"  :hasNotifications="false"
            /></h3>
            </div>
            <div class="level-right">
              <div class="level-item">
                <a class="MatcButton MatcButtonSecondary MatcButtonXS" @click="downloadCSV">Download Test Data</a>
              </div>
            </div>
          </div>
          <AnalyticsHeader :value="summary" />
        </div>

    </section>
    <!-- header -->

    <section class="" data-dojo-attach-point="sectionTask">
 
        <div class="box is-shadowless">
          <AnalyticTaskList
            :hash="hash"
            :pub="pub"
            :test="test"
            :app="app"
            :events="events"
            :annotation="annotation"
            @change="onTaskChange"
          />
        </div>

    </section>

    <section class="" data-dojo-attach-point="sectionScatter">

        <div class="box is-shadowless">
          <DistributionSection
            :pub="pub"
            :test="test"
            :app="app"
            :events="events"
            :annotation="annotation"/>
        </div>

    </section>


     <section class="" data-dojo-attach-point="sectionTask">

        <div class="box is-shadowless">
          <SurveySection
            :pub="pub"
            :test="test"
            :app="app"
            :events="events"
            :annotation="annotation"/>
        </div>

    </section>

  </div>
</template>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import DataFrame from "common/DataFrame";
import Plan from "page/Plan";
import Util from "core/Util";
import PerformanceMonitor from 'core/PerformanceMonitor'
import AnalyticsHeader from "views/apps/analytics/AnalyticsHeader";
import AnalyticTaskList from "views/apps/analytics/AnalyticTaskList";
import SurveySection from "views/apps/analytics/SurveySection";
import DistributionSection from "views/apps/analytics/DistributionSection";
import HelpButton from "help/HelpButton";

export default {
  name: "Test",
  mixins: [DojoWidget, Plan, Util],
  props: ["app", "test", "annotation", "events", "pub", "hash"],
  data: function() {
    return {
      MIN_REQUIERED_USERS: 40,
      summary: {},
      hasComments: false
    };
  },
  components: {
    'AnalyticsHeader': AnalyticsHeader,
    'AnalyticTaskList': AnalyticTaskList,
    'SurveySection': SurveySection,
    'DistributionSection': DistributionSection,
    'HelpButton': HelpButton
  },
  computed: {
    imageHash () {
      return 'imageHahs'
    },
    isPublic() {
      return this.$route.meta && this.$route.meta.isPublic;
    },
    urlPrefix() {
      if (this.isPublic) {
        return "examples";
      }
      return "apps";
    }
  },
  methods: {
    onTaskChange(test) {
      this.$emit("change", lang.clone(test));
    },
    downloadCSV() {
      try {
        let events = this.filterEvents(this.events, this.annotation);
        var actionEvents = this.getActionEvents(new DataFrame(events));
        let csv = "Session,User,Screen,Widget,EventType,X,Y,Time\n";
        let screenSize = this.app.screenSize;
        csv += actionEvents.data
          .map(event => {
            let screen = this.app.screens[event.screen]
              ? this.app.screens[event.screen].name
              : event.screen;
            let widget = this.app.widgets[event.widget]
              ? this.app.widgets[event.widget].name
              : event.widget;
            let x = event.x >= 0 ? Math.round(event.x * screenSize.w) : -1;
            let y = event.y >= 0 ? Math.round(event.y * screenSize.h) : -1;
            return (
              event.session + "," +event.user + "," + screen + "," + widget + "," + event.type + "," + x + "," + y + "," + event.time
            );
          })
          .join("\n");

        var blob = new Blob([csv], {
          type: "text/csv;charset=utf-8;"
        });
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveBlob(blob, this.downloadFileName);
        } else {
          var elem = window.document.createElement("a");
          elem.href = window.URL.createObjectURL(blob);
          elem.download = this.app.name + ".csv";
          document.body.appendChild(elem);
          elem.click();
          document.body.removeChild(elem);
        }
      } catch (e) {
        console.error(e);
      }
    },
    show() {
      PerformanceMonitor.start('AnalyticsTab.show()')
      /**
       * remove all sessions that are invalid!
       */
      let events = this.filterEvents(this.events, this.annotation);

      /**
       * Just use actionable events
       */
      const actionEvents = this.getActionEvents(new DataFrame(events));
      events = actionEvents.as_array();

      const df = new DataFrame(events);
      df.sortBy("time");

      this._addTestKPI(df, this.app);

      PerformanceMonitor.end('AnalyticsTab.show()')
    },

    _addTestKPI (df, app) {
      PerformanceMonitor.start('AnalyticsTab._addTestKPI()')
      const sessionGroup = df.groupBy("session");
      const count = df.count("session");
      const min = sessionGroup.min("time");
      const max = sessionGroup.max("time");
      max.minus(min);

      /**
       *
       */


      const summary = {};
      summary.sessionCount = count.size();
      summary.sessionCountMean = Math.round(count.mean());
      summary.sessionCountStd = Math.round(count.std());
      summary.sessionDurationMean = Math.round(max.mean() / 1000);
      summary.sessionDurationStd = Math.round(max.std() / 1000);
      summary.sessionMeanUser = summary.sessionCount / summary.userCount;
      summary.sessionPercentage = Math.min(summary.sessionCount / this.MIN_REQUIERED_USERS,1);

      if (isNaN(summary.sessionDurationMean)) {
        summary.sessionDurationMean = 0;
        summary.sessionDurationStd = 0;
      }

      const screenCount = this.getObjectLength(app.screens);
      const uniqueScreenPerSession = sessionGroup.unique("screen");
      let expRate = uniqueScreenPerSession.mean() / screenCount;
      if (isNaN(expRate)) {
        expRate = 0;
      }
      if (isNaN(expRate)) {
        expRate = 0;
      }
      summary.expRate = expRate;
      this.summary = summary;
      PerformanceMonitor.end('AnalyticsTab._addTestKPI()')
    }
  },
  watch: {
    test(v) {
      this.logger.info("watch", "test >", v);
      this.test = v;
    },
    events(v) {
      this.logger.info("watch", "events >", v);
      this.events = v;
      this.show()
    }
  },
  async mounted() {
    this.logger = new Logger("AnalyticsTab");
    this.show();
    this.logger.info("mounted", "exit");
  }
};
</script>

