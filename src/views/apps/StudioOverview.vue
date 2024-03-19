<template>
  <div class="StudioOverview">
    <SplitContainer :right="256" qid="StudioOverView">
      <template v-slot:left>
        <div class="StudioOverviewHeader">

          <div class="StudioOverviewHeaderRow MatcFlexColumns" v-if="true">
            <div class="MatcFlexColumn"  >
              <StudioColorDropDown :color="app.previewColor" @change="onColorChange"></StudioColorDropDown>
              <div>
                <input class="" v-model="app.name" @change="onNameChange"/>
                <span class="MatcHint"> 
                  {{$t('app.lastedit')}} {{formatDate(app.lastUpdate, true)}}</span>
              </div>
   
            </div>
 

            <div class="MatcFlexColumn">
              <Team
                v-if="app.id && user.id && appLoaded" 
                :appID="app.id" 
                :userID="user.id" 
                :qteam="team"/>
                
              <a :class="['MatcButton MatcButtonXS MatcButton MatcButtonSecondary MatcButtonSecondaryBlue MatcRoundButton', { 'MatcButtonPassive': tab == 'X' }]" v-if="tab === 'analyze'"
                  :href="`#/${urlPrefix}/${appID}/analyze/workspace.html`" id="overviewHeaderRunTest">
                  {{$t('app.analyze') }}
              </a>
              <a :class="['MatcButton MatcButtonXS MatcButtonSecondary MatcButtonSecondaryBlue MatcRoundButton', { 'MatcButtonPassive': tab == 'X' }]" v-if="tab !== 'analyze'"
                :href="`#/${urlPrefix}/${appID}/design/start.html`" id="overviewHeaderRunTest">
                {{$t('app.edit') }}
              </a>
              <a class="MatcButton MatcButtonXS MatcButtonSecondary MatcButtonIcon MatcRoundButton" @click="showShareDialog" ref="shareButton">
                <QIcon icon="Share"></QIcon>
              </a>
              <QIconDropDown icon="Dots" :options="dotOptions"/>
            </div>

          </div>

         

          <div class="StudioOverviewHeaderRow">

            <div class="MatcTabs ">
              <a :href="`#/${urlPrefix}/${appID}/design.html`" :class="{'MatcTabActive': tab === 'design'}">
                <QIcon icon="Overview" />
                {{ $t('app.overview.design') }}
              </a>
              <a :href="`#/${urlPrefix}/${appID}/test.html`" :class="{'MatcTabActive': tab == 'test' || tab === 'video'}" >
                <QIcon icon="Tests" />
                {{ $t('app.overview.test') }}              
              </a>
              <a :href="`#/${urlPrefix}/${appID}/analyze.html`" :class="{'MatcTabActive': tab == 'analyze'}">
                <QIcon icon="Results" />
                {{ $t('app.overview.dash') }}
              </a>
              <!-- <a :href="`#/${urlPrefix}/${appID}/comments.html`" :class="{'MatcTabActive': tab == 'comments'}">{{ $t('app.overview.comments') }}</a> -->
            </div>
 
        </div>

         

        </div>



        <section class="StudioOverviewContent">


          <div v-if="tab == 'design'">
            <div class="StudioOverviewTabContent">
              <div>
                <h3>{{ $t('app.description')}}</h3>
                <AutoTextArea  :inline="true" v-model="app.description" @blur="onChangeAppDescription" :placeholder="$t('app.description-hint')"/>
              </div>

              <div>
                <h3 class="" >{{ $t('app.screen-list')}}</h3>
                <ScreenList :app="app" v-if="appLoaded" :pub="isPublic" class="MatcMarginTop" />
              </div>

            </div>


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

          <div v-if="tab == 'comments'">
            <CommentsTab :loading="loading" :app="app" :user="user" :invitations="invitations" v-if="restLoaded"
              @change="onSettingsChange" />
          </div>

        </section>
      </template>
      <template v-slot:right>
          <StudioDetails 
            @change="onChangeAppDescription"
            @more="onShowMore"
            :isLoaded="appLoaded" 
            :app="app" 
            :user="user" 
            :test="testSettings" 
            :annotation="sessionAnnotations" 
            :events="events"/>
      </template>
    </SplitContainer>

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
import * as UIUtil from '../../util/UIUtil'

import ScreenList from "page/ScreenList";
import AutoTextArea from 'page/AutoTextArea'
import QIcon from "page/QIcon";
import TestTab from "views/apps/test/TestTab";
import AnalyticsTab from "views/apps/analytics/AnalyticsTab";
import HeatTab from "views/apps/analytics/HeatTab";
import VideoTab from "views/apps/test/VideoTab";
import CommentsTab from 'views/apps/CommentsTab'
import SettingsTab from "views/apps/SettingsTab";
import SplitContainer from "page/SplitContainer";
import QIconDropDown from 'page/QIconDropDown'
import StudioColorDropDown from './StudioColorDropDown'
import StudioDetails from './StudioDetails'

import Team from "page/Team";
import Share from "page/Share";
import Services from "services/Services";

export default {
  name: "Overview",
  mixins: [DojoWidget],
  props:['user'],
  data: function () {
    return {
      loading: true,
      team: [],
      tab: "design",
      appID: "",
      app: {
        name: "loading..."
      },
      dotOptions: [
        {label: 'Rename', callback: (o, e) => this.onRename(e), icon: "EventKeykoard"},
        {label: 'Duplicate', callback: (o, e) => this.onDuplicate(e), icon: "Duplicate"},
        {label: 'Change Test Link', callback: (o, e) => this.onChangeHash(e), icon: "Key"},
        {label: 'Delete', callback: (o, e) => this.onDelete(e), icon: "Delete"}
      ],
      testSettings: {},
      events: [],
      sessionAnnotations: [],
      invitations: [],
      hash: "",
      appLoaded: false,
      restLoaded: false,
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
    QIconDropDown: QIconDropDown,
    StudioDetails: StudioDetails,
    SplitContainer: SplitContainer,
    CommentsTab: CommentsTab,
    AutoTextArea: AutoTextArea
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
    onShowMore () {
      this.$router.push(`/${this.urlPrefix}/${this.appID}/analyze.html`)
    },
    scrollTop() {
      window.scrollTo(0, 0);
    },
    reloadEvents() {
      this.logger.log(1, "reloadEvents", "enter > ");
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
          this.appLoaded = true;
          this.logger.log(1, "loadEvents", "Found " + events.length + " events");
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
      this.logger.log(4, "checkEventCount", "Check " + this.app.sessionCount + " ?= " + loads.length);
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
        this.modelService.findInvitation(id),
        this.modelService.findTeam(id)
      ])
        .then(values => {
          this.testSettings = values[0];
          this.sessionAnnotations = values[1];
          this.restLoaded = true;
          this.invitations = values[2];
          this.team = values[3]
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
        this.tab = "design";
        this.$forceUpdate()
      }
      this.scrollTop();
    },
    onWindowFocus() {
      this.logger.log(1, "onWindowFocus", "enter > ");
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
      return UIUtil.formatDate(t, justDate)
    },
    async onChangeAppDescription (description) {    
      let res = await Services.getModelService().updateAppProps(this.app.id, {
        id: this.app.id,
        description: description
      })
      if (res.status === "ok") {
       
        this.app.description = description
        this.showSuccess("Description was saved...");
      } else {
        this.showError("Oooppps, Could not change the color. Try again!");
      }
      
    },
    async onColorChange (c) {

      let res = await Services.getModelService().updateAppProps(this.app.id, {
        id: this.app.id,
        previewColor: c
      });
      if (res.status === "ok") {
        this.showSuccess("Color was saved...");
        this.app.previewColor = c
        this.$emit('change', this.app)
      } else {
        this.showError("Oooppps, Could not change the color. Try again!");
      }
    },
    async onNameChange () {
      if (!this.app.name) {
        this.showError("The name cannot be empty");
      }
      let res = await Services.getModelService().updateAppProps(this.app.id, {
        id: this.app.id,
        name: this.app.name
      });
      if (res.status === "ok") {
        this.showSuccess("Name was saved...");
        this.$emit('change', this.app)
      } else {
        this.showError("Oooppps, Could not change the name. Try again!");
      }
    },

    onDuplicate (e) {
      this.logger.info("onChangeHash", "enter > ", e);
      this.stopEvent(e)


			const db = new DomBuilder();
			const popup = db.div("MatcDialog MatcHeaderDialog MatcPadding").build();

		
      const cntr = db.div().build(popup);
      db.h3("MatcDialogHeader", "Duplicate").build(cntr);
      const inputName = db.input("form-control input-lg MatcIgnoreOnKeyPress", "Copy of " + this.app.name, "Name of the template").build(cntr);
      const bar = db.div("MatcButtonBar MatcMarginTopXL").build(popup);
      const write = db.div("MatcButton MatcButtonPrimary", "Save As").build(bar);
      const cancel = db.a("MatcLinkButton ", "Cancel").build(bar);
      
      const dialog = new Dialog();
      dialog.own(on(cancel, "click", lang.hitch(dialog, "close")));
      dialog.own(on(write, "click", () => {
        this.duplicateApp(inputName.value)
        dialog.close()
      }))

      setTimeout(() => {
        inputName.select()
        inputName.focus()
      }, 200)
		
			dialog.popup(popup, e.target);
    },

    async duplicateApp (newName) {
      this.logger.log(-1, "duplicateApp", "enter > ", newName);
    	const app = await this.modelService.copyApp(this.app, newName)
      if (app) {
				this.redirectAfterExit = false;
				this.$router.push("/apps/" + app.id + ".html");
        this.$emit("duplicate")
			}
    },

    onChangeHash (e) {
      this.logger.info("onChangeHash", "enter > ", e);

      this.stopEvent(e)

      const div = this.db.div("MatcDeleteDialog").build();
      this.db.h3("title is-4", 'Change Test Link').build(div);
      this.db.p('MatcMarginBottomXL', `Do you want to create new test links? Old test links will not work anymore!`).build(div)
      const bar = this.db.div("MatcButtonBar").build(div);
      const write = this.db.a("MatcButton MatcButtonDanger", this.getNLS("btn.change")).build(bar);
      const cancel = this.db.a("MatcLinkButton", this.getNLS("btn.cancel")).build(bar);

      const d = new Dialog();
      d.own(on(write, "click", () => this.changeHash(d, this.app)));
      d.own(on(cancel, "click", () => d.close()));
      d.popup(div, e.target);
    },

    async changeHash (d) {
      await Services.getModelService().resetTeam(this.app.id);
      location.reload();
      d.close()
      //this.$emit("delete", app)
    },

    onDelete(e) {
      this.stopEvent(e)

      const div = this.db.div("MatcDeleteDialog").build();
      this.db.h3("title is-4", 'Delete App').build(div);
      this.db.p('MatcMarginBottomXL', `Do you want to delete the '${this.app.name}' app?`).build(div)
      const bar = this.db.div("MatcButtonBar").build(div);
      const write = this.db.a("MatcButton MatcButtonDanger", this.getNLS("btn.delete")).build(bar);
      const cancel = this.db.a("MatcLinkButton", this.getNLS("btn.cancel")).build(bar);

      const d = new Dialog();
      d.own(on(write, "click", () => this.deleteApp(d, this.app)));
      d.own(on(cancel, "click", () => d.close()));
      d.popup(div, e.target);

    },

    async deleteApp(d, app) {
      await Services.getModelService().deleteApp(app);
      d.close()
      this.$emit("delete", app)
    },

    onRename(e) {
      this.stopEvent(e)

      const div = this.db.div("MatcDeleteDialog").build();
      this.db.h3("title is-4", 'Rename Prototype').build(div);

      var inputName = this.db
        .div("MatcMarginBottomXL")
        .input("form-control input-lg MatcIgnoreOnKeyPress", this.app.name, "Name of the prototype")
        .build(div);

      const bar = this.db.div("MatcButtonBar").build(div);
      const write = this.db.a("MatcButton", this.getNLS("btn.rename")).build(bar);
      const cancel = this.db.a("MatcLinkButton", this.getNLS("btn.cancel")).build(bar);

      const d = new Dialog();
      d.own(on(write, "click", () => this.renameApp(d, this.app, inputName)));
      d.own(on(cancel, "click", () => d.close()));
      d.popup(div, e.target);
    },

    async renameApp(d, app, input) {
      this.app.name = input.value
      this.onNameChange()
      d.close()
    },
  },
  watch: {
    $route() {
      this.logger.info("watch", "route");
      this.initRoute();
    }
  },
  async mounted() {
    this.logger = new Logger("StudioOverview");
    this.db = new DomBuilder();
    this.appID = this.$route.params.id;
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
  
  