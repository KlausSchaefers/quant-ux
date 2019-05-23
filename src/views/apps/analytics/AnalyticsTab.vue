<template>
  <div class="MatcTest">

    <div class="MatcSection">
      <div class="container">       
            <div class="row">
                <div class="col-md-6 " id="">
                    <h2>
                        Overview 
                        <a href="#help/analyze/dash.html" class="MatcHelpIcon"><span class="mdi mdi-help-circle"></span></a>
                    </h2>
                </div>
                <div class="col-md-6 MatcRight">
                    <a class="MatcButton MatcButtonSignUp" :href="`#/apps/${app.id}/analyze/workspace.html`">Analytic Canvas</a>
                </div>                    
            </div>       
            <AnalyticsHeader class="MatcMarginTopXXL" :value="summary"/>   
        </div>
    </div> <!-- header -->

    <div class="MatcSection" data-dojo-attach-point="sectionTask">
      <div class="container">
        <AnalyticTaskList :pub="pub" :test="test" :app="app" :events="events" :annotation="annotation" @change="onTaskChange"/>
      </div>
    </div>

    <div class="MatcSection">
      <div class="container">
        <h2>Comments</h2>
        <Comment v-if="app" :appID="app.id" type="overview_dash" reference="" contentID="" insertPosition="top"/>
      </div>
    </div>
  </div>
</template>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import DataFrame from "common/DataFrame";
import Plan from 'page/Plan'
import Util from 'core/Util'
import AnalyticsHeader from 'views/apps/analytics/AnalyticsHeader'
import AnalyticTaskList from 'views/apps/analytics/AnalyticTaskList'
import Comment from 'page/Comment'

export default {
  name: "Test",
  mixins: [DojoWidget, Plan, Util],
  props: ["app", "test", "annotation", "events", "pub"],
  data: function() {
    return {
      MIN_REQUIERED_USERS: 40,
      summary: {}      
    };
  },
  components: {
    Comment: Comment,
    AnalyticsHeader: AnalyticsHeader,
    AnalyticTaskList: AnalyticTaskList
  },
  methods: {
    onTaskChange(test) {
      this.$emit("change", lang.clone(test));
    },
    show () {
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
        
    _addTestKPI:function(df, app){
        
        var sessionGroup = df.groupBy("session");
        var count = df.count("session");
        var min = sessionGroup.min("time");
        var max = sessionGroup.max("time");
        max.minus(min); 
        
        var userCount = df.count("user");
        var userGroup = df.groupBy("user");
        var uniqueSession = userGroup.unique("session");
                
        let summary = {} 
        summary.userCount = userCount.size();
        summary.userEventMean = Math.round(userCount.mean());
        summary.userEventStd = Math.round(userCount.std());
        summary.userSessionMean = Math.round(uniqueSession.mean());
        summary.userSessionStd =  Math.round(uniqueSession.std());    
        
        summary.sessionCount = count.size();
        summary.sessionCountMean =  Math.round(count.mean());
        summary.sessionCountStd =  Math.round(count.std());
        summary.sessionDurationMean =  Math.round(max.mean() / 1000);
        summary.sessionDurationStd =  Math.round( max.std() / 1000);        
        summary.sessionMeanUser = summary.sessionCount / summary.userCount;
        summary.sessionPercentage =  Math.min(summary.sessionCount  / this.MIN_REQUIERED_USERS, 1)
        
        if(isNaN(summary.sessionDurationMean) ){
            summary.sessionDurationMean = 0;
            summary.sessionDurationStd = 0;
        }
        
        var screenCount = this.getObjectLength(app.screens);
        var uniqueScreenPerSession = sessionGroup.unique("screen");
        var expRate = uniqueScreenPerSession.mean() / screenCount;        
        if(isNaN(expRate) ){
            expRate = 0;
        }
        if(isNaN(expRate) ){
            expRate = 0;
        }
        summary.expRate = expRate
        this.summary = summary
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
    this.show()
    this.logger.info("mounted", "exit");
  }
};
</script>

