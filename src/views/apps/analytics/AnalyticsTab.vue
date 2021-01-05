<template>
  <div class="MatcTest">
    <section class="section">
      <div class="container">
        <div class="box is-shadowless">
          <div class="level">
            <div class="level-left">
              <h2 class="level-item title">Dashboard</h2>
            </div>
            <div class="level-right">
              <div class="level-item">
                <a class="button is-primary is-outlined" @click="downloadCSV">Download Test Data</a>
              </div>
            </div>
          </div>
          <AnalyticsHeader :value="summary" />
        </div>
      </div>
    </section>
    <!-- header -->

    <section class="section" data-dojo-attach-point="sectionTask">
      <div class="container">
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
      </div>
    </section>

     <section class="section" data-dojo-attach-point="sectionTask">
      <div class="container">
        <div class="box is-shadowless">
          <SurveySection
            :pub="pub"
            :test="test"
            :app="app"
            :events="events"
            :annotation="annotation"/>
        </div>
      </div>
    </section>


    <section class="section">
      <div class="container">
        <div class="box is-shadowless">
          <h2 class="title">Comments</h2>
          <Comment
            v-if="app"
            :appID="app.id"
            type="overview_dash"
            reference
            contentID
            insertPosition="top"
          />
        </div>
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
import AnalyticsHeader from "views/apps/analytics/AnalyticsHeader";
import AnalyticTaskList from "views/apps/analytics/AnalyticTaskList";
import SurveySection from "views/apps/analytics/SurveySection";
import Comment from "page/Comment";

export default {
  name: "Test",
  mixins: [DojoWidget, Plan, Util],
  props: ["app", "test", "annotation", "events", "pub", "hash"],
  data: function() {
    return {
      MIN_REQUIERED_USERS: 40,
      summary: {}
    };
  },
  components: {
    'Comment': Comment,
    'AnalyticsHeader': AnalyticsHeader,
    'AnalyticTaskList': AnalyticTaskList,
    'SurveySection': SurveySection
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
      /**
       * remove all sessions that are invalid!
       */
      let events = this.filterEvents(this.events, this.annotation);

      /**
       * Just use actionable events
       */
      var actionEvents = this.getActionEvents(new DataFrame(events));
      events = actionEvents.as_array();
      var df = new DataFrame(events);
      df.sortBy("time");

      this._addTestKPI(df, this.app);
      // does any body use this?
      // this._addTagData(tags,df);
      // this._addScreenData(df,app);
      // this._addScreenList(events, app);
    },

    _addTestKPI: function(df, app) {
      var sessionGroup = df.groupBy("session");
      var count = df.count("session");
      var min = sessionGroup.min("time");
      var max = sessionGroup.max("time");
      max.minus(min);

      var userCount = df.count("user");
      var userGroup = df.groupBy("user");
      var uniqueSession = userGroup.unique("session");

      let summary = {};
      summary.userCount = userCount.size();
      summary.userEventMean = Math.round(userCount.mean());
      summary.userEventStd = Math.round(userCount.std());
      summary.userSessionMean = Math.round(uniqueSession.mean());
      summary.userSessionStd = Math.round(uniqueSession.std());

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

      var screenCount = this.getObjectLength(app.screens);
      var uniqueScreenPerSession = sessionGroup.unique("screen");
      var expRate = uniqueScreenPerSession.mean() / screenCount;
      if (isNaN(expRate)) {
        expRate = 0;
      }
      if (isNaN(expRate)) {
        expRate = 0;
      }
      summary.expRate = expRate;
      this.summary = summary;
    }
  },
  watch: {
    test(v) {
      this.logger.info("watch", "test >", v);
      this.test = v;
    }
  },
  async mounted() {
    this.logger = new Logger("AnalyticsTab");
    this.show();
    this.logger.info("mounted", "exit");
  }
};
</script>

