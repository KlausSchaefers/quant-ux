
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
          v-if="isLoaded"
          ref="dropDown"
          :options="tableOptions" :l="$t('survey.options')" 
          @select="onChangeView" 
          @fullscreen="onFullScreen($event)"
          @download="downloadCVS"></DropDownSelect>
   
      </div>
    </div>

     <div class="MatcSurveySectionTableCntr">

      <SurveyTable 
          v-if="table.rows.length > 0 && table.cols.length > 0" 
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
    <SurveyDialog ref="dialog">

    </SurveyDialog>
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
import SurveyTable from './SurveyTable'
import SurveyDialog from './SurveyDialog'


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
      'DropDownSelect': DropDownSelect,
      'SurveyTable': SurveyTable,
      'SurveyDialog': SurveyDialog
    },
    computed: {
      tableOptions () {
        return [
            {value: 'showTasksSucess', label: this.$t('survey.taskSuccess'), check:true, selected: this.viewOptions.showTasksSucess},
            //{value: 'showTaskDetails', label: this.$t('survey.taskDetails'), check:true, selected: this.viewOptions.showTaskDetails},
            {value: 'showId', label:this.$t('survey.ids'), check:true},
            //{css:"MatcDropDownButtonLine"},
            //{value: 'fullscreen', label: this.$t('survey.fullscreen'), event:'fullscreen', icon:' mdi mdi-chart-bar'},
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
        if (this.$refs.dialog && this.$refs.dropDown) {
          this.$refs.dialog.show(this.$refs.dropDown.$el)
        }
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
      this.logger = new Logger('SurveySection')
      if (this.test && this.test.tasks.length > 0) {
        //this.viewOptions.showTasksSucess = true
      }
      this.isLoaded = true
    }
}
</script>