
<template>
    <div class="MatcSurveySection">
        <div class="level">
        <div class="level-left">
          <h2 class="title level-item">
            <span data-nls="testSettingsTasks">{{$t('analytics.scatter.title')}}</span>
            <HelpButton
              topic="analytics.dist"
              :hasNotifications="false"
            />
  
         
          </h2>
        </div>
        <div class="level-right">
         
        
    
        </div>
      </div>
  
       <div class="MatcSurveySectionTableCntr">
  
        <ScatterPlot 
            v-if="events && events.length > 0" 
            :app="app"
            :pub="pub"
            :events="events"
            :viewOptions="viewOptions"
            :annotation="annotation"
            :test="test"/>
  
         <span class="MatcHint" v-else>
           {{$t('survey.no-data')}}
         </span>
      </div>
     
      </div>
  </template>
  <style lang="scss">
      @import '../../../style/survey_section.scss';
  </style>
  <script>
  import Logger from 'common/Logger'
  //import DropDownSelect from 'page/DropDownSelect'
  import HelpButton from "help/HelpButton";
//   import Analytics from "dash/Analytics";
//   import lang from 'dojo/_base/lang'
  import ScatterPlot from './ScatterPlot'
  
  
  export default {
      name: 'SurveySection',
      mixins:[],
      props: ['test', 'app', 'events', 'annotation', 'pub'],
      data: function () {
          return {
            isLoaded: false,
            viewOptions:{
              showTasksSucess: false,
              showTaskDetails: false,
              showId: false
            }
          }
      },
      components: {
        'HelpButton': HelpButton,
        //'DropDownSelect': DropDownSelect,
        'ScatterPlot': ScatterPlot
      },
      computed: {
       
      },
      methods: {
      },
      mounted () {
        this.logger = new Logger('SurveySection')
        if (this.test && this.test.tasks.length > 0) {
          //this.viewOptions.showTasksSucess = true
        }
        this.isLoaded = true
      }
  }
  </script>