
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
       
          <!-- <DropDownButton
            class="MatcButtonTrans MatcDropDownRight"
            :value="scatterMode"
            @change="setScatterMode"
            :options="scatterOptions"         
          /> -->


          <DropDownButton
            class="MatcButtonTrans MatcDropDownRight"
            v-if="hasOutlier"
            ref="dropDown"
            :value="viewMode"
            @change="setViewMode"
            :options="viewOptions"         
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
              
              </template>
      
      
            <span class="MatcHint" v-else>
              {{$t('analytics.distribution.no-data')}}
            </span>
          </div>
          <div v-if="selection.length > 0" style="padding:30px">        
            <table class="table">
                <thead>
                  <tr>
                    
                      <th  v-for="(col, c) in cols" :key="c">
                        <span class="MatcSurveySectionTableColLabel">
                          {{col.label}}
                        </span>                    
                      </th>  
                   
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, r) in selection" :key="r">   
                      <td :key="c" v-for="(col, c) in cols">
                        {{row[col.key]}}
                      </td>     
                  </tr>                 
                </tbody>
            </table>
          </div>
     
      </div>
  </template>
  <style lang="scss">
      //@import '../../../style/survey_section.scss';
  </style>
  <script>
  import Logger from 'common/Logger'
  import DropDownButton from 'page/DropDownButton'
  import HelpButton from "help/HelpButton";
  import ScatterPlot from './ScatterPlot'
  
  
  export default {
      name: 'DistributionSection',
      mixins:[],
      props: ['test', 'app', 'events', 'annotation', 'pub'],
      data: function () {
          return {
            xAxis: 'duration',
            yAxis: 'interactions',
            hasOutlier: false,
            isLoaded: false,
            scatterMode: 'duration,interactions',
            scatterOptions:[
              {value:'duration,interactions', label: this.$t('analytics.distribution.scatterModeInteractionXDuration')},
              {value:'duration,screens', label: this.$t('analytics.distribution.scatterModeDurationXScreen')},
              {value:'duration,tasks', label: this.$t('analytics.distribution.scatterModeDurationXTasks')},
              {value:'errors,screens', label: this.$t('analytics.distribution.scatterModeErrorsXScreen')}
            ],
            viewMode: 'Scatter',
            viewOptions:[
              {value:'Scatter', label: this.$t('analytics.distribution.viewScatter'), event:'scatter'},
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
            ]
          }
      },
      components: {
        'HelpButton': HelpButton,
        'DropDownButton': DropDownButton,
        'ScatterPlot': ScatterPlot,
        'OutlierPlot':() => import(/* webpackChunkName: "outlier" */ './OutlierPlot')
      },
      computed: {
       
      },
      methods: {
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
        this.isLoaded = true
        this.hasOutlier = location.href.indexOf('localhost') >= 0
        if (this.hasOutlier) {
          //this.viewMode = 'Outlier'
        }
      }
  }
  </script>