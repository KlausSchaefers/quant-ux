
<template>
    <div class="">
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
<!--        
          <DropDownButton
            class="MatcButtonTrans MatcDropDownRight"
            :value="scatterMode"
            @change="setScatterMode"
            :options="scatterOptions"         
          /> -->

<!-- 
          <DropDownButton
            class="MatcButtonTrans MatcDropDownRight"       
            ref="dropDown"
            :value="viewMode"
            @change="setViewMode"
            :options="viewOptions"         
          /> -->

          <DropDownSelect
            v-if="hasConfig"
            ref="dropDown"
            :options="clusterOptions" 
            :l="$t('analytics.distribution.cluster-vars')" 
            @select="onChangeCluster" 
           />
        
    
        </div>
      </div>
  
          <div class="MatcSurveySectionTableCntr">

            <template v-if="events && events.length > 0">
      
              <ScatterPlot 
                  v-if="viewMode === 'Scatter'" 
                  :yAxis="yAxis"
                  :xAxis="xAxis"
                  :app="app"
                  :pub="pub"
                  :clusterVars="clusterVars"
                  :events="events"
                  :annotation="annotation"
                  :test="test"/>

              <OutlierPlot 
                  v-if="viewMode === 'Outlier'" 
                  @selected="showSelection"
                  :mode="viewMode"
                  :app="app"
                  :pub="pub"
                  :events="events"
                  :annotation="annotation"
                  :test="test"/>

              <DistributionTable            
                v-if="viewMode === 'Details'"
                :mode="viewMode"
                :app="app"
                :pub="pub"
                :events="events"
                :annotation="annotation"
                :test="test" />
              
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
  //import DropDownButton from 'page/DropDownButton'
  import DropDownSelect from 'page/DropDownSelect'
  import HelpButton from "help/HelpButton";
  import ScatterPlot from './ScatterPlot'
  import DistributionTable from './DistributionTable.vue'
  
  export default {
      name: 'DistributionSection',
      mixins:[],
      props: ['test', 'app', 'events', 'annotation', 'pub'],
      data: function () {
          return {
            xAxis: 'duration',
            yAxis: 'interactions',
            hasOutlier: false,
            hasConfig: false,
            isLoaded: false,
            scatterMode: 'duration,interactions',
            viewMode: 'Scatter',
            viewOptions:[
              {value:'Scatter', label: this.$t('analytics.distribution.viewScatter'), event:'scatter'},
              {value:'Details', label: this.$t('analytics.distribution.viewDetails'), event:'outlier'},
              {value:'Outlier', label: this.$t('analytics.distribution.viewOutlier'), event:'outlier'}
            ],
            selection: [],
            cols: [
              {key: "interactions", label: "Interactions"},
              {key: "duration", label: "Duration"},
              {key: "screens", label: "Test Coverage"},
              {key: "tasks", label: "Tasks"},
              {key: "outlierRaw", label: "Outlier Raw"},
              {key: "outlierUmap", label: "Outlier Umap"},
            ],
            clusterOptions: [
                {value: 'duration', label: this.$t('analytics.distribution.details.duration'), check:true, selected: true},
                {value: 'interactions', label: this.$t('analytics.distribution.details.interactions'), check:true, selected: true},
                {value: 'screenLoads', label: this.$t('analytics.distribution.details.screenLoads'), check:true, selected: true},
                {value: 'tasks', label: this.$t('analytics.distribution.details.tasks'), check:true, selected: true},
                {value: 'weirdness', label: this.$t('analytics.distribution.details.weirdness'), check:true, selected: false},
                {value: 'errors', label: this.$t('analytics.distribution.details.errors'), check:true, selected: false},
            ],
            clusterVars : ["interactions", "duration", "screenLoads", "tasks"]
          }
      },
      components: {
        'HelpButton': HelpButton,
        'DropDownSelect': DropDownSelect,
       // 'DropDownButton': DropDownButton,
        'ScatterPlot': ScatterPlot,
        'DistributionTable': DistributionTable,
        'OutlierPlot':() => import(/* webpackChunkName: "outlier" */ './OutlierPlot')
      },
      computed: {
       
      },
      methods: {
        onChangeCluster (d) {
          let clusterVars = []
          Object.keys(d).forEach(key => {
            const selected = d[key]
            if (selected) {
              clusterVars.push(key)
            }
          })
          this.clusterVars = clusterVars
        },
        setScatterMode (m) {
          if (m) {
            let parts = m.split(',')
            this.xAxis = parts[0]
            this.yAxis = parts[1]
          } 
          this.scatterMode = m
        },
        setViewMode (m) {
          this.viewMode = m
          this.selection = []
        },
        showSelection (selection) {
          this.selection = selection
        }
      },
      mounted () {
        this.logger = new Logger('DistributionSection')
        this.hasConfig = location.href.indexOf('localhost') >= 0
        this.isLoaded = true       
      }
  }
  </script>