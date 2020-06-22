
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
        <a
          class="button is-primary is-outlined level-item"
          data-nls="btn.download"
          @click="downloadCVS"
        >{{$t('survey.download')}}</a>
      </div>
    </div>

     <div class="MatcSurveySectionTableCntr">

       <table class="table" v-if="table.rows.length > 0 && table.cols.length > 0">
          <thead>
            <tr>
              <th class="MatcSurveySectionTableNumber">
                #
              </th>
              <th v-for="(col, c) in table.cols" :key="c">
                {{col}}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, r) in table.rows" :key="r">
              <td class="MatcSurveySectionTableNumber">
                {{r+1}}
              </td>
              <td v-for="(col, c) in table.cols" :key="c">
                {{row[col]}}
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
import HelpButton from "help/HelpButton";
import Analytics from "dash/Analytics";
import lang from 'dojo/_base/lang'

export default {
    name: 'SurveyTable',
    mixins:[],
    props: ['test', 'app', 'events', 'annotation'],
    data: function () {
        return {
        }
    },
    components: {
      'HelpButton': HelpButton
    },
    computed: {
      table () {
        var analytics = new Analytics();
        let events = analytics.filterEvents(lang.clone(this.events), this.annotation)
        return analytics.getSurveyAnswers(events, this.app)
      },
      downloadFileName () {
        if (this.app) {
          return this.app.name + '_survey.csv'
        }
        return 'Quant-UX_Survey.csv'
      }
    },
    methods: {
       downloadCVS () {

          let table = this.table
          var csvContent = '#,' + table.cols.join(',') + "\n";
          csvContent += table.rows.map((row, r) => {
            return r+ ',' + table.cols.map(c => row[c]).join(',')
          }).join("\n")

          var blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;"
          });
          if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, this.downloadFileName)
          } else {
            var elem = window.document.createElement("a");
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
    }
}
</script>