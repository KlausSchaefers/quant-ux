
<template>
  <div class="MatcSurveySection">
      <div class="level">
      <div class="level-left">
        <h3 class="title level-item">
          <span data-nls="testSettingsTasks">{{$t('survey.header')}}</span>
          <HelpButton
            topic="survey.intro"
            :hasNotifications="false"
          />

       
        </h3>
      </div>
      <div class="level-right">
       
      
        <DropDownSelect
          class="MatcButtonSecondary"
          v-if="isLoaded && table.rows.length > 0 && table.cols.length > 0"
          ref="dropDown"
          :options="tableOptions" :l="$t('survey.options')" 
          @select="onChangeView" 
          @fullscreen="onFullScreen($event)"
          @download="downloadCVS"></DropDownSelect>
   
      </div>
    </div>

     <div class="MatcSurveySectionTableCntr">

      <SurveyTable 
          v-if="table && table.rows.length > 0 && table.cols.length > 0" 
          :app="app"
          :pub="pub"
          :events="events"
          :table="table"
          :viewOptions="viewOptions"
          :annotation="annotation"
          :test="test"/>

       <span class="MatcHint" v-else>
         {{$t('scatter.no-data')}}
       </span>
    </div>
    <SurveyDialog ref="dialog">

    </SurveyDialog>
	</div>
</template>
<style lang="scss">
    @import '../../../style/components/survey_section.scss';
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
          table: {rows: {}, cols:{}},
          viewOptions:{
            showTasksSucess: false,
            showTaskDetails: false,
            showVideo: false,
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
        const cols = this.table.cols.filter(c => c.type=== 'data').map(c => {
            return {value: 'toggleColumn', label: c.label, check:true, selected: !c.hidden, callback: (selected) => this.toggleColumn(c, selected)}
        })
        
        return cols.concat([
            {css:"MatcDropDownButtonLine"},
            {value: 'showTasksSucess', label: this.$t('survey.taskSuccess'), check:true, selected: this.viewOptions.showTasksSucess},
            {value: 'showVideo', label: this.$t('survey.showVideo'), check:true, selected: this.viewOptions.showVideo},
            //{value: 'showId', label:this.$t('survey.ids'), check:true},
            //{css:"MatcDropDownButtonLine"},
            //{value: 'fullscreen', label: this.$t('survey.fullscreen'), event:'fullscreen', icon:' mdi mdi-chart-bar'},
            {css:"MatcDropDownButtonLine"},
            {value: 'download', label: this.$t('survey.download'), event:'download', icon:'mdi mdi-download-outline'}
          ])
      },
      hasID () {
        return this.viewOptions.showId
      },
      hasTasks () {
        return this.viewOptions.showTasksSucess || this.viewOptions.showTaskDetails
      },
     
     
      downloadFileName () {
        if (this.app) {
          return this.app.name + '_survey.csv'
        }
        return 'Quant-UX_Survey.csv'
      }
    },
    methods: {
      getTable () {
        const analytics = new Analytics();
        const events = analytics.filterEvents(lang.clone(this.events), this.annotation)
        return analytics.getSurveyAnswers(events, 
          this.app, 
          this.test, 
          this.viewOptions
        )
      },
      onFullScreen () {
        if (this.$refs.dialog && this.$refs.dropDown) {
          this.$refs.dialog.show(this.$refs.dropDown.$el)
        }
      },
      toggleColumn (col, selected) {
          col.hidden = !selected
      },
      onChangeView (selection) {
        for (let key in selection) {
          this.$set(this.viewOptions, key, selection[key])
        }
      },
       downloadCVS () {

          const table = this.table
          let csvContent = '#,' + table.cols.map(c => c.label).join(',') + "\n";
          csvContent += table.rows.map((row, r) => {
            return r+ ',' + table.cols.map(c => row[c.key]).join(',')
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
      this.table = this.getTable()
      this.isLoaded = true
    }
}
</script>