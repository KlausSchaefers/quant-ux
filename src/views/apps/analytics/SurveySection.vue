
<template>
  <div class="MatcSurveySection">
      <div class="level">
      <div class="level-left">
        <h2 class="title level-item">
          <span data-nls="testSettingsTasks">{{$t('survey.header')}}</span>
          <HelpButton
            topic="survey.intro"
            :hasNotifications="false"
          />
        </h2>
      </div>
      <div class="level-right">
       
      
        <DropDownSelect 
          :options="tableOptions" :l="$t('survey.options')" 
          @select="onChangeView" 
          @fullscreen="onFullScreen"
          @download="downloadCVS"></DropDownSelect>
   
      </div>
    </div>

     <div class="MatcSurveySectionTableCntr">

       <table class="table" v-if="table.rows.length > 0 && table.cols.length > 0">
          <thead>
            <tr>
              <th class="MatcSurveySectionTableNumber">
                #
              </th>
              <th v-if="hasID" class="MatcSurveySectionTableBorderLeft MatcSurveySectionTableBorderRight">
                {{$t('survey.id')}}
              </th>
              <template v-for="(col, c) in table.cols">
                <th  v-if="table.meta[col].hidden !== true" :key="c">
                  <span class="MatcSurveySectionTableColLabel">
                    {{col}}
                  </span>
               
                </th>
              </template>
              <th v-if="hasTasks" class="MatcSurveySectionTableBorderLeft">
                {{$t('survey.tasks')}}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, r) in table.rows" :key="r">
              <td class="MatcSurveySectionTableNumber">
                {{r+1}}
              </td>
              <td v-if="hasID" class="MatcSurveySectionTableBorderLeft MatcSurveySectionTableBorderRight">
                {{table.ids[r]}}
              </td>
              <template v-for="(col, c) in table.cols" >
                <td :key="c"  v-if="table.meta[col].hidden !== true" >
                  {{row[col]}}
                </td>
              </template>
              <td v-if="hasTasks" class="MatcSurveySectionTableBorderLeft  MatcTagCntr">
          
                 <span v-for="task in table.tasks[r]" :key="task.task" class="tag">
                    
                    {{task.taskName}}

                    <span v-if="viewOptions.showTaskDetails">
                      ({{Math.round(task.duration /1000)}}s  | #{{task.interactions}})
                    </span>

                  
                  </span>

              </td>
            </tr>
            <tr class="MatcSurveySectionTableSummary">
              <td class="MatcSurveySectionTableNumber">
                =
              </td>
              <td v-if="hasID" class="MatcSurveySectionTableBorderLeft MatcSurveySectionTableBorderRight">
               
              </td>
              <td v-for="(value, i) in summary" :key="i">
                {{value}}
              </td>
              <td v-if="hasTasks" class="MatcSurveySectionTableBorderLeft">
                
              </td>
            </tr>
          </tbody>
       </table>

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
import DropDownSelect from 'page/DropDownSelect'
import HelpButton from "help/HelpButton";
import Analytics from "dash/Analytics";
import lang from 'dojo/_base/lang'

export default {
    name: 'SurveyTable',
    mixins:[],
    props: ['test', 'app', 'events', 'annotation'],
    data: function () {
        return {
          viewOptions:{
            showTasksSucess: false,
            showTaskDetails: false,
            showId: false
          }
        }
    },
    components: {
      'HelpButton': HelpButton,
      'DropDownSelect': DropDownSelect
    },
    computed: {
      tableOptions () {
      
        return [
            {value: 'showTasksSucess', label: this.$t('survey.taskSuccess'), check:true, selected: this.viewOptions.showTasksSucess},
            {value: 'showTaskDetails', label: this.$t('survey.taskDetails'), check:true, selected: this.viewOptions.showTaskDetails},
            {value: 'showId', label:this.$t('survey.ids'), check:true},
            //{css:"MatcDropDownButtonLine"},
            //{value: 'fullscreen', label: this.$t('survey.fullscreen'), event:'fullscreen', icon:'mdi mdi-fullscreen'},
            {css:"MatcDropDownButtonLine"},
            {value: 'download', label: this.$t('survey.download'), event:'download', icon:'mdi mdi-download-outline'}
          ]
      },
      hasID () {
        return this.viewOptions.showId
      },
      hasTasks () {
        return this.viewOptions.showTasksSucess || this.viewOptions.showTaskDetails
      },
      summary () {
        const result = []
        const data = this.table
        data.cols.forEach(col => {
          if (data.meta[col].hidden !== true) {
              let sum = 0
              let count = 0
              data.rows.forEach(row  => {
                let value = row[col]
                if (value !== '-') {
                  /**
                   * FIXME: We could check table.types and check for
                   * the data types,.g. boolean, categorical etc.
                   */
                  if (!isNaN(value * 1)) {
                    sum += value * 1
                    count++
                  }

                }
              })
              if (count > 0) {
                result.push(Math.round((sum / count) * 100) / 100)
              } else {
                result.push('-')
              }
          }
        })
        return result
      },
      table () {
        const analytics = new Analytics();
        const events = analytics.filterEvents(lang.clone(this.events), this.annotation)
        return analytics.getSurveyAnswers(events, 
          this.app, 
          this.test, 
          this.viewOptions
        )
      },
      downloadFileName () {
        if (this.app) {
          return this.app.name + '_survey.csv'
        }
        return 'Quant-UX_Survey.csv'
      }
    },
    methods: {
      onFullScreen () {

      },
      onChangeView (selection) {
        for (let key in selection) {
          this.$set(this.viewOptions, key, selection[key])
        }
      },
       downloadCVS () {

          const table = this.table
          let csvContent = '#,' + table.cols.join(',') + "\n";
          csvContent += table.rows.map((row, r) => {
            return r+ ',' + table.cols.map(c => row[c]).join(',')
          }).join("\n")

          const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;"
          });
          if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, this.downloadFileName)
          } else {
            const elem = window.document.createElement("a");
            elem.href = window.URL.createObjectURL(blob)
            elem.download = this.downloadFileName
            document.body.appendChild(elem)
            elem.click()
            document.body.removeChild(elem)
          }
        },
    },
    mounted () {
      this.logger = new Logger('SurveyTable')
      if (this.test && this.test.tasks.length > 0) {
        this.viewOptions.showTasksSucess = true
      }
    }
}
</script>