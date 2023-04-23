
<template>
    <div class="MatcSurveySection">
        <div class="level">
        <div class="level-left">
          <h2 class="title level-item">
            <span data-nls="testSettingsTasks">{{$t('analytics.distribution.title')}}</span>
            <HelpButton
              topic="analytics.dist"
              :hasNotifications="false"
            />
          </h2>
        </div>
        <div class="level-right">
          <DropDownSelect
            v-if="false"
            ref="dropDown"
            :options="viewOptions"
            @scatter="showScatter"
            @outlier="showOutlier"
            @boxplot="showBoxPlot"
            :l="$t('analytics.distribution.options')" 
          />
        
    
        </div>
      </div>
  
       <div class="MatcSurveySectionTableCntr">

        <template v-if="events && events.length > 0">
  
        <ScatterPlot 
            v-if="viewMode === 'Scatter'" 
            :mode="viewMode"
            :app="app"
            :pub="pub"
            :events="events"
            :annotation="annotation"
            :test="test"/>

        <div 
            v-if="viewMode === 'Outlier'" 
            :mode="viewMode"
            :app="app"
            :pub="pub"
            :events="events"
            :annotation="annotation"
            :test="test">
          
          Out</div>

          </template>
  
  
         <span class="MatcHint" v-else>
           {{$t('analytics.distribution.no-data')}}
         </span>
      </div>
     
      </div>
  </template>
  <style lang="scss">
      //@import '../../../style/survey_section.scss';
  </style>
  <script>
  import Logger from 'common/Logger'
  import DropDownSelect from 'page/DropDownSelect'
  import HelpButton from "help/HelpButton";
  import ScatterPlot from './ScatterPlot'
  
  export default {
      name: 'DistributionSection',
      mixins:[],
      props: ['test', 'app', 'events', 'annotation', 'pub'],
      data: function () {
          return {
            isLoaded: false,
            viewMode: 'Scatter',
            viewOptions:[
              {label: this.$t('analytics.distribution.viewScatter'), event:'scatter'},
              {label: this.$t('analytics.distribution.viewOutlier'), event:'outlier'}
            ]
          }
      },
      components: {
        'HelpButton': HelpButton,
        'DropDownSelect': DropDownSelect,
        'ScatterPlot': ScatterPlot
      },
      computed: {
       
      },
      methods: {
        showScatter () {
          console.debug('showScatter()')
          this.viewMode = 'Scatter'
        },
        showOutlier () {
          console.debug('showOutlier()')
          this.viewMode = 'Outlier'
        },
        showBoxPlot () {
          this.viewMode = 'BoxPlot'
        }
      },
      mounted () {
        this.logger = new Logger('DistributionSection')
        this.isLoaded = true
      }
  }
  </script>