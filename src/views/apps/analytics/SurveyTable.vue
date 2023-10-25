
<template>

       <table class="table" v-if="table.rows.length > 0 && table.cols.length > 0">
          <thead>
            <tr>
              <th class="MatcSurveySectionTableNumber MatcSurveySectionTableBorderRight">
                #                 
              </th>
              <th v-if="hasID" class="MatcSurveySectionTableBorderLeft MatcSurveySectionTableBorderRight">
                {{$t('survey.id')}}
              </th>
              <template v-for="(col) in table.cols">
                <th  v-if="col.hidden !== true" :key="col.key">
                  <span class="MatcSurveySectionTableColLabel">
                    {{col.label}}
                  </span>
               
                </th>
              </template>
              <th v-if="hasTasks" class="MatcSurveySectionTableBorderLeft">
                {{$t('survey.tasks')}}
              </th>
              <th  class="MatcSurveySectionTableBorderLeft MatcSurveySectionTableAction" v-if="hasVideo">
                {{$t('survey.video')}}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, r) in table.rows" :key="r">
              <td class="MatcSurveySectionTableNumber MatcSurveySectionTableBorderRight">
                {{r+1}}
              </td>
              <td v-if="hasID" class="MatcSurveySectionTableBorderLeft MatcSurveySectionTableBorderRight">
                <a :href="getVideoURL(table.ids[r])" target="_QUXvideo">
                  {{table.ids[r]}}
                  <span class="mdi mdi-play-circle-outline"></span>
                </a>
            
              </td>
              <template v-for="col in table.cols" >

                <td :key="col.key"  v-if="col.hidden !== true" >
      
                  {{row[col.key]}}
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

              <td class="MatcSurveySectionTableBorderLeft MatcSurveySectionTableAction" v-if="hasVideo">
                <a :href="getVideoURL(table.ids[r])" class="MatcButton MatcButtonSecondary MatcButtonXS" target="_QUXvideo">
                  <QIcon icon="Play" />
                </a>
              </td>
            </tr>
            <tr class="MatcSurveySectionTableSummary">
              <td class="MatcSurveySectionTableNumber MatcSurveySectionTableBorderRight">
                AVG
              </td>
              <td v-if="hasID" class="MatcSurveySectionTableBorderLeft MatcSurveySectionTableBorderRight">
              </td>
              <td v-for="(value, i) in summary" :key="i">
                {{value}}
              </td>
              <td v-if="hasTasks" class="MatcSurveySectionTableBorderLeft">
              </td>
              <td  class="MatcSurveySectionTableBorderLeft MatcSurveySectionTableAction" v-if="hasVideo">
              </td>
            </tr>
          </tbody>
       </table>

</template>
<style lang="scss">
    @import '../../../style/components/survey_section.scss';
</style>
<script>
import Logger from 'common/Logger'
// import Analytics from "dash/Analytics";
// import lang from 'dojo/_base/lang'
import QIcon from '../../../page/QIcon'


export default {
    name: 'SurveyTable',
    mixins:[],
    props: ['test', 'app', 'events', 'annotation', 'viewOptions', 'pub', 'table'],
    data: function () {
        return {
        }
    },
    components: {
      QIcon
    },
    computed: {
      hasVideo () {
        return this.viewOptions.showVideo
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
          if (col.hidden !== true) {
              let sum = 0
              let count = 0
              data.rows.forEach(row  => {
                let value = row[col.key]
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
      urlPrefix() {
        if (this.pub) {
          return "examples";
        }
        return "apps";
      },
    },
    methods: {
      getVideoURL (id) {
        return "#/" +  this.urlPrefix + "/" +  this.app.id + "/replay/" + id + ".html";
      },
    },
    watch: {
      table (v) {
        this.table = v
      }
    },

    mounted () {
      this.logger = new Logger('SurveyTable')
    }
}
</script>