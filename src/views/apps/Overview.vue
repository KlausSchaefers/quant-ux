<template>
  <div class="MatcApps">
    <div class="MatcAppHeader" id="header">
      <div class="VommondHeaderContainer">
        <div :class="['MatcHeader MactMainGradient MatcHeaderDark bs-docs-header', 'MatcHeaderTab' + tab]">
          <div class="container-fluid">
            <div class="row MatcHeaderTopRow">
              <div class="col-md-8">
                <h2 style="display:inline-block" id="headerName">{{app.name}}</h2>
              </div>
              <div class="col-md-4 MatcRight">
                  <Team v-if="app.id && user.id && !isPublic" :appID="app.id" :userID="user.id" />             
              </div>
            </div>
          </div>

          <div class="container-fluid">
            <div class="row MatcHeaderBottomRow">
              <div class="col-md-8">
                <a :class="['MatcHeaderItem', {'MatcHeaderItemSelected': tab == 'design'}]" 
                  :href="`#/${urlPrefix}/${appID}/design.html`">Design</a>
                
                <a :class="['MatcHeaderItem', {'MatcHeaderItemSelected': tab == 'test' || tab === 'video'}]" 
                  :href="`#/${urlPrefix}/${appID}/test.html`">Test</a>

                <a :class="['MatcHeaderItem', {'MatcHeaderItemSelected': tab == 'analyze'}]" 
                  :href="`#/${urlPrefix}/${appID}/analyze.html`">Dashboard</a>

                <a :class="['MatcHeaderItem', {'MatcHeaderItemSelected': tab == 'heat'}]" 
                  :href="`#/${urlPrefix}/${appID}/heat.html`">Heat Maps</a>

                <a :class="['MatcHeaderItem', {'MatcHeaderItemSelected': tab == 'settings'}]" 
                  :href="`#/${urlPrefix}/${appID}/settings.html`" v-if="!isPublic">Settings</a>
 
              </div>

              <div class="col-md-4 MatcRight">
                <a  class="MatcButton MatcButtonTrans" target="test" :href="'#/test.html?h=' + hash + '&log=' + !isPublic" id="overviewHeaderRunTest">Test</a>
                <a class="MatcButton MatcButtonTrans"  @click="showShareDialog" ref="shareButton">Share</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="MatcContent">
          
        <div v-if="tab == 'design'">
            <div class="MatcSection">
                <div class="container">
                    <ScreenList :app="app" v-if="appLoaded" :pub="isPublic"/>
                </div>
            </div>
            <div class="MatcSection" v-if="appLoaded" >
              <div class="container">
                <h2>Comments</h2>
                <Comment :appID="app.id" type="overview" reference="" contentID="" insertPosition="top"/>
              </div>
            </div>
        </div>
        <div v-if="tab == 'test'">
            <TestTab 
              :app="app" 
              :test="testSettings" 
              :annotation="sessionAnnotations" 
              :events="events" 
              v-if="restLoaded" 
              @change="onTestChange"/>
        </div>
        <div v-if="tab == 'analyze'">
          <AnalyticsTab 
            :app="app" 
            :test="testSettings" 
            :annotation="sessionAnnotations" 
            :events="events" 
            v-if="restLoaded"
            @change="onTestChange"/>     
        </div>

        <div v-if="tab == 'heat'">
           <HeatTab 
            :app="app" 
            :test="testSettings" 
            :annotation="sessionAnnotations" 
            :events="events" 
            v-if="restLoaded"/>      
        </div>

        <div v-if="tab == 'video'">
          <VideoTab 
            :app="app" 
            :test="testSettings" 
            :annotation="sessionAnnotations" 
            :events="events" 
            v-if="restLoaded"
            @change="onAnnotationChange"/>     
        </div>

        <div v-if="tab == 'settings'">
            <SettingsTab 
              :app="app" 
              :user="user"
              :invitations="invitations"
              v-if="restLoaded"
              @change="onSettingsChange"/>  
        </div>
    </div>
  </div>
</template>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Dialog from 'common/Dialog'
import on from 'dojo/on'
import lang from 'dojo/_base/lang'
import touch from 'dojo/touch'
import DomBuilder from 'common/DomBuilder'

import ScreenList from "page/ScreenList";
import TestTab from 'views/apps/test/TestTab'
import AnalyticsTab from 'views/apps/analytics/AnalyticsTab'
import HeatTab from 'views/apps/analytics/HeatTab'
import VideoTab from 'views/apps/test/VideoTab'
import SettingsTab from 'views/apps/SettingsTab'

import Team from 'page/Team'
import Share from 'page/Share'
import Comment from 'page/Comment'
import Services from "services/Services"

export default {
  name: "Overview",
  mixins: [DojoWidget],
  data: function() {
    return {
        tab: 'design',
        appID: '',
        app: {
            name: 'loading...'
        },
        testSettings: {},
        events: [],
        sessionAnnotations: [],
        invitations: [],
        hash: '',
        appLoaded: false,
        restLoaded: false,
        user: {},
        modelService: Services.getModelService()
    };
  },
  components: {
      'ScreenList': ScreenList,
      'TestTab': TestTab,
      'AnalyticsTab': AnalyticsTab,
      'VideoTab': VideoTab,
      'SettingsTab': SettingsTab,
      'Team': Team,
      'HeatTab': HeatTab,
      'Comment': Comment
  },
  computed: {
    isPublic () {
      return this.$route.meta && this.$route.meta.isPublic
    },
    urlPrefix () {
      if (this.isPublic) {
        return 'examples'
      }
      return 'apps'
    }
  },
  methods: {
    scrollTop () {
      window.scrollTo(0,0)
    },
    onSettingsChange (settings) {
        this.logger.info("onSettingsChange", "enter > ", settings);
    },
    onTestChange (testSettings) {
        this.logger.info("onTestChange", "enter > ", testSettings);
        this.testSettings = testSettings
    },
    onAnnotationChange (annos) {
        this.logger.info("onAnnotationChange", "enter > ", annos);
        /**
         * See, to work, because if do deep changes. Would be 
         * better to update and fix all the watches in the tabs...
         */
        //this.sessionAnnotations = annos
    },
    async loadApp() {
        let id = this.$route.params.id
        if (id) {
          this.app = await this.modelService.findApp(id)
          this.appLoaded = true
          this.loadRest()
          this.loadEvents()
        } else {
          this.logger.error('loadApp', 'No id ')
          this.logger.sendError(new Error())
        }
   
    },
    loadEvents () {
      let id = this.$route.params.id
      this.modelService.findEvents(id).then(events => {
        this.events = events
        this.logger.log(-1, 'loadEvents', 'Found ' + events.length + ' events')
      })
    },
    loadRest () {
        let id = this.$route.params.id
        Promise.all([
            this.modelService.findTest(id),
            this.modelService.findSessionAnnotations(id),
            this.modelService.findInvitation(id)
        ]).then(values => {
            this.testSettings = values[0]
            this.sessionAnnotations = values[1]
            this.restLoaded = true
            this.invitations = values[2]
            var temp = {};
			      for(var key in this.invitations){
				      temp[this.invitations[key]] = key;
            }
            this.hash = temp[1]
        }).catch(e => {
          console.error(e)
        })
    },
    showShareDialog () {	
			var db = new DomBuilder();
			var popup = db.div("MatcInfitationDialog MatcInfitationDialogLarge MatcPadding").build();			
			var cntr = db.div("container").build(popup);
			var row = db.div("row").build(cntr);			
			var right = db.div("col-md-12").build(row);
						
			db.h3("",this.getNLS("share.Headline")).build(right);
      
      			
	    let share = this.$new(Share)
      share.placeAt(right)
      share.setInvitation(this.hash)
      share.setPublic(this.isPublic)
	
			row = db.div("row MatcMarginTop").build(cntr);
			right = db.div("col-md-12 MatcButtonBar").build(row);
			var write = db.div("MatcButton", "Close").build(right);
			
			var d = new Dialog();
			d.own(on(write, touch.press, lang.hitch(d,"close")));
	
      
			d.popup(popup, this.$refs.shareButton);
    },
    initRoute () {
      this.logger.info("initRoute", "enter", this.$route.params.tab);
      if (this.$route.params.tab) {
        this.tab = this.$route.params.tab
      } else if (this.$route.params.session) {
        this.tab = 'video'
      }
      this.scrollTop()
    }
  },
  watch: {
    '$route' () {
      this.logger.info("watch", "route");
      this.initRoute()
    }
  },
  async mounted() {
    this.logger = new Logger("Overview");
    this.appID = this.$route.params.id
    this.user = await Services.getUserService().load()
    this.modelService = Services.getModelService(this.$route)
    this.loadApp();
    this.initRoute();
    this.logger.info("mounted", "exit > ");
  }
};
</script>

