<template>
  <div class="StudioOverview">
    <!-- <SplitContainer :right="250">
      <template v-slot:left> -->
        <div class="StudioOverviewHeader">

          <div class="StudioOverviewHeaderRow MatcFlexColumns">
            <div class="MatcFlexColumn">
              <StudioColorDropDown></StudioColorDropDown>
              <input class="" v-model="app.name" />
            </div>
 

            <div class="MatcFlexColumn">
              <a :class="['MatcButton MatcButtonXS MatcButtonPrimary', { 'MatcButtonPassive': tab == 'X' }]"
              :href="`#/${urlPrefix}/${appID}/analyze/workspace.html`" id="overviewHeaderRunTest">{{
                $t('app.edit') }}</a>

              <a class="MatcButton MatcButtonXS MatcButtonSecondary MatcButtonIcon" @click="showShareDialog" ref="shareButton">
                <QIcon icon="Share"></QIcon>
              </a>

              <Team v-if="app.id && user.id && !isPublic" :appID="app.id" :userID="user.id" />
            </div>

          </div>

          <div class="StudioOverviewHeaderRow ">
            <span class="MatcHint"> 
                {{$t('app.lastedit')}} {{formatDate(app.lastUpdate, true)}}</span>
            </div>

          <div class="StudioOverviewHeaderRow">

            <div class="MatcTabs ">
              <a :href="`#/${urlPrefix}/${appID}/design.html`" :class="{'MatcTabActive': tab === 'design'}">{{ $t('app.overview.design') }}</a>
              <a :href="`#/${urlPrefix}/${appID}/test.html`" :class="{'MatcTabActive': tab == 'test' || tab === 'video'}" >{{ $t('app.overview.test') }}</a>
              <a :href="`#/${urlPrefix}/${appID}/analyze.html`" :class="{'MatcTabActive': tab == 'analyze'}">{{ $t('app.overview.dash') }}</a>

            </div>
 
        </div>

         

        </div>



        <section class="StudioOverviewContent">


          <div v-if="tab == 'design'">

            <ScreenList :app="app" v-if="appLoaded" :pub="isPublic" />

          </div>
          <div v-if="tab == 'test'">
            <TestTab :loading="loading" :app="app" :test="testSettings" :hash="hash" :annotation="sessionAnnotations"
              :events="events" @reloadEvents="reloadEvents" v-if="restLoaded" @change="onTestChange" />
          </div>
          <div v-if="tab == 'analyze'">
            <AnalyticsTab :loading="loading" :app="app" :hash="hash" :test="testSettings" :annotation="sessionAnnotations"
              :events="events" v-if="restLoaded" @change="onTestChange" />
          </div>

          <div v-if="tab == 'heat'">
            <HeatTab :loading="loading" :app="app" :test="testSettings" :annotation="sessionAnnotations" :events="events"
              v-if="restLoaded" />
          </div>

          <div v-if="tab == 'video'">
            <VideoTab :loading="loading" :app="app" :test="testSettings" :annotation="sessionAnnotations" :events="events"
              v-if="restLoaded" @change="onAnnotationChange" />
          </div>

          <div v-if="tab == 'settings'">
            <SettingsTab :loading="loading" :app="app" :user="user" :invitations="invitations" v-if="restLoaded"
              @change="onSettingsChange" />
          </div>
        </section>
      <!-- </template>
      <template v-slot:right>

        Hello
      </template>
    </SplitContainer> -->

  </div>
</template>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Dialog from "common/Dialog";
import on from "dojo/on";
import lang from "dojo/_base/lang";
import touch from "dojo/touch";
import DomBuilder from "common/DomBuilder";

import ScreenList from "page/ScreenList";
import QIcon from "page/QIcon";
import TestTab from "views/apps/test/TestTab";
import AnalyticsTab from "views/apps/analytics/AnalyticsTab";
import HeatTab from "views/apps/analytics/HeatTab";
import VideoTab from "views/apps/test/VideoTab";
import SettingsTab from "views/apps/SettingsTab";
//import SplitContainer from "page/SplitContainer";
import StudioColorDropDown from './StudioColorDropDown'

import Team from "page/Team";
import Share from "page/Share";
// import Comment from "page/Comment";
import Services from "services/Services";

export default {
  name: "Overview",
  mixins: [DojoWidget],
  data: function () {
    return {
      loading: true,
      tab: "design",
      appID: "",
      app: {
        name: "loading..."
      },
      testSettings: {},
      events: [],
      sessionAnnotations: [],
      invitations: [],
      hash: "",
      appLoaded: false,
      restLoaded: false,
      user: {},
      modelService: Services.getModelService()
    };
  },
  components: {
    ScreenList: ScreenList,
    TestTab: TestTab,
    AnalyticsTab: AnalyticsTab,
    VideoTab: VideoTab,
    SettingsTab: SettingsTab,
    Team: Team,
    HeatTab: HeatTab,
    StudioColorDropDown: StudioColorDropDown,
    QIcon: QIcon,
    // Comment: Comment,
    //SplitContainer: SplitContainer
  },
  computed: {
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
    scrollTop() {
      window.scrollTo(0, 0);
    },
    reloadEvents() {
      this.logger.log(-1, "reloadEvents", "enter > ");
      this.loadEvents();
    },
    onSettingsChange(settings) {
      this.logger.info("onSettingsChange", "enter > ", settings);
    },
    onTestChange(testSettings) {
      this.logger.info("onTestChange", "enter > ", testSettings);
      this.testSettings = testSettings;
    },
    onAnnotationChange(annos) {
      this.logger.info("onAnnotationChange", "enter > ", annos);
      /**
       * See, to work, because if do deep changes. Would be
       * better to update and fix all the watches in the tabs...
       */
      //this.sessionAnnotations = annos
    },
    async loadApp() {
      let id = this.$route.params.id;
      this.appLoaded = false
      try {
        if (id) {
          this.app = await this.modelService.findApp(id);
          this.appLoaded = true;
          this.loadRest();
          this.loadEvents();
        } else {
          this.logger.error("loadApp", "No id ");
          this.logger.sendError(new Error());
        }
      } catch (e) {
        this.logger.error("loadApp", "Some error");
        this.logger.sendError(e);
      }

    },
    loadEvents() {
      let id = this.$route.params.id;
      try {
        this.modelService.findEvents(id).then(events => {
          this.events = events;
          this.loading = false
          this.logger.log(-1, "loadEvents", "Found " + events.length + " events");
          this.checkEventCount()
        });
      } catch (e) {
        this.logger.error("loadEvents", "Some error");
        this.logger.sendError(e);
      }
    },
    async checkEventCount() {
      if (this.isPublic) {
        return
      }
      const loads = this.events.filter(e => e.type === 'SessionStart')
      this.logger.log(-1, "checkEventCount", "Check " + this.app.sessionCount + " ?= " + loads.length);
      if (this.app.sessionCount !== loads.length && this.app && this.app.id) {
        const res = await this.modelService.updateAppProps(this.app.id, {
          id: this.app.id,
          sessionCount: loads.length
        });
        if (res.status !== "ok") {
          this.logger.error("checkEventCount", "Could not update");
          this.logger.sendError(new Error());
        }
      }
    },
    loadRest() {
      let id = this.$route.params.id;
      Promise.all([
        this.modelService.findTest(id),
        this.modelService.findSessionAnnotations(id),
        this.modelService.findInvitation(id)
      ])
        .then(values => {
          this.testSettings = values[0];
          this.sessionAnnotations = values[1];
          this.restLoaded = true;
          this.invitations = values[2];
          const temp = {};
          for (let key in this.invitations) {
            temp[this.invitations[key]] = key;
          }
          this.hash = temp[1];
        })
        .catch(e => {
          this.logger.error("loadRest", "Some error");
          this.logger.sendError(e);
        });
    },
    showShareDialog() {
      const db = new DomBuilder();
      const popup = db
        .div("MatcDialog MatcInfitationDialog MatcInfitationDialogLarge MatcPadding")
        .build();

      let cntr = db.div("container").build(popup);
      let row = db.div("row").build(cntr);
      let right = db.div("col-md-12").build(row);

      db.h3("", this.getNLS("share.Headline")).build(right);

      const share = this.$new(Share);
      share.placeAt(right);
      share.setInvitation(this.hash);
      share.setPublic(this.isPublic);

      row = db.div("row MatcMarginTop").build(cntr);
      right = db.div("col-md-12 MatcButtonBar").build(row);
      let write = db.div("MatcButton", "Close").build(right);

      const d = new Dialog();
      d.own(on(write, touch.press, lang.hitch(d, "close")));

      d.popup(popup, this.$refs.shareButton);
    },
    initRoute() {
      this.logger.info("initRoute", "enter", this.$route.params.tab);
      if (this.$route.params.tab) {
        this.tab = this.$route.params.tab;
      } else if (this.$route.params.session) {
        this.tab = "video";
      }
      if (this.$route.params.id && this.$route.params.id !== this.appID) {
        this.appID = this.$route.params.id;
        this.loadApp();
        this.$forceUpdate()
      }
      this.scrollTop();
    },
    onWindowFocus() {
      this.logger.log(-1, "onWindowFocus", "enter > ");
      this.loadEvents();
    },
    initFocusListener() {
      this.logger.log(1, "initFocusListener", "enter > ");
      this._focusListner = () => {
        this.onWindowFocus()
      }
      window.addEventListener('focus', this._focusListner);
    },
    formatDate (t, justDate) {
      var date = new Date(t);
      if (justDate) {
        return date.toLocaleDateString();
      }
      return date.toLocaleString();
    },
  },
  watch: {
    $route() {
      this.logger.info("watch", "route");
      this.initRoute();
    }
  },
  async mounted() {
    this.logger = new Logger("Overview");
    this.appID = this.$route.params.id;
    this.user = await Services.getUserService().load();
    this.modelService = Services.getModelService(this.$route);
    this.loadApp();
    this.initRoute();
    this.initFocusListener()
    this.logger.info("mounted", "exit > ");
  },
  beforeDestroy() {
    this.logger.log(-1, "beforeDestroy", "enter > ");
    window.removeEventListener('focus', this._focusListner);
    delete this._focusListner
  }
};
</script>
  
  