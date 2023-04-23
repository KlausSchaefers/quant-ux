
<template>
    <div class="MatcSurveySection">
        <div class="level">
        <div class="level-left">
          <h2 class="title level-item">
            <span data-nls="testSettingsTasks">{{$t('analytics.outlier.title')}}</span>
            <HelpButton
              topic="outliers.intro"
              :hasNotifications="false"
            />
  
         
          </h2>
        </div>
        <div class="level-right">
         
        
    
        </div>
      </div>
  
       <div class="MatcSurveySectionTableCntr">
  
     
  
         <span class="MatcHint" >
           {{$t('analytics.outlier.no-data')}}
         </span>
      </div>
     
      </div>
  </template>
  <style lang="scss">
      @import '../../../style/outlier_section.scss';
  </style>
  <script>
  import Logger from 'common/Logger'
  import HelpButton from "help/HelpButton";
//   import Analytics from "dash/Analytics";
//   import lang from 'dojo/_base/lang'
  
  
  export default {
      name: 'OutlierSection',
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
        'HelpButton': HelpButton
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