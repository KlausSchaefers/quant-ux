
<template>

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

</template>
<style lang="scss">
    @import '../../../style/survey_section.scss';
</style>
<script>
import Logger from 'common/Logger'
import Analytics from "dash/Analytics";
import lang from 'dojo/_base/lang'


export default {
    name: 'SurveyTable',
    mixins:[],
    props: ['test', 'app', 'events', 'annotation', 'viewOptions'],
    data: function () {
        return {
        }
    },
    components: {
    
    },
    computed: {
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
    },
    methods: {
    },
    mounted () {
      this.logger = new Logger('SurveyTable')
    }
}
</script>