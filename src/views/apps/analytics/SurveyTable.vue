
<template>

       <table class="table" v-if="sortedTable.rows.length > 0 && sortedTable.cols.length > 0">
          <thead>
            <tr v-if="showGroups">
              <th class="MatcSurveySectionTableNumber MatcSurveySectionTableBorderRight">             
              </th>
              <th v-for="group in groups" :key="group.label" :colspan="group.count" class="MatcSurveySectionTableGroupLabel">
                  <span class="MatcSurveySectionTableColLabel" v-if="group.count > 1">
                    {{group.label}}
                  </span>
              </th>
              <th v-if="hasTasks" class="MatcSurveySectionTableBorderLeft"></th>
              <th  class="MatcSurveySectionTableBorderLeft MatcSurveySectionTableAction" v-if="hasVideo">X</th>
           
            </tr>

            <tr>
              <th class="MatcSurveySectionTableLabel MatcSurveySectionTableBorderRight MatcSurveySectionTableBorderBottom">
                Test               
              </th>
              <th v-if="hasID" class="MatcSurveySectionTableBorderLeft MatcSurveySectionTableBorderRight MatcSurveySectionTableBorderBottom">
                {{$t('survey.id')}}
              </th>
              <template v-for="(col) in sortedTable.cols" >
                <th  v-if="col.hidden !== true" :key="col.key" class="MatcSurveySectionTableBorderBottom">
                  <span class="MatcSurveySectionTableColLabel">
                    {{col.label}}
                  </span>
               
                </th>
              </template>
              <th v-if="hasTasks" class="MatcSurveySectionTableBorderLeft MatcSurveySectionTableBorderBottom">
                {{$t('survey.tasks')}}
              </th>
              <th  class="MatcSurveySectionTableBorderLeft MatcSurveySectionTableAction MatcSurveySectionTableBorderBottom" v-if="hasVideo">
                {{$t('survey.video')}}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(row, r) in sortedTable.rows" :key="r">
              <td class="MatcSurveySectionTableLabel MatcSurveySectionTableBorderRight">
                {{sortedTable.labels[r]}}
              </td>
              <td v-if="hasID" class="MatcSurveySectionTableBorderLeft MatcSurveySectionTableBorderRight">
                <a :href="getVideoURL(sortedTable.ids[r])" target="_QUXvideo">
                  {{sortedTable.ids[r]}}
                  <span class="mdi mdi-play-circle-outline"></span>
                </a>
            
              </td>
              <template v-for="col in sortedTable.cols" >

                <td :key="col.key"  v-if="col.hidden !== true" >
      
                  {{row[col.key]}}
                </td>
              </template>

              <td v-if="hasTasks" class="MatcSurveySectionTableBorderLeft  ">
                <div class="MatcTagCntr">
                 <span v-for="task in sortedTable.tasks[r]" :key="task.task" class="tag">
                    {{task.taskName}}
                    <span v-if="viewOptions.showTaskDetails">
                      ({{Math.round(task.duration /1000)}}s  | #{{task.interactions}})
                    </span>
                  </span>
                </div>
              </td>

              <td class="MatcSurveySectionTableBorderLeft MatcSurveySectionTableAction" v-if="hasVideo">
                <a :href="getVideoURL(sortedTable.ids[r])" class="MatcButton MatcButtonSecondary MatcButtonXS" target="_QUXvideo">
                  <QIcon icon="Play" />
                </a>
              </td>
            </tr>
            <tr class="MatcSurveySectionTableSummary">
              <td class="MatcSurveySectionTableNumber MatcSurveySectionTableBorderRight">
                <QIcon icon="AVG" />
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
          showGroups: false
        }
    },
    components: {
      QIcon
    },
    computed: {
      sortedTable () {
       
        return this.table
      },
      hasVideo () {
        return this.viewOptions.showVideo
      },
      hasID () {
        return this.viewOptions.showId
      },
      hasTasks () {
        return this.viewOptions.showTasksSucess || this.viewOptions.showTaskDetails
      },
      groups () {
        const groups = []
        if (this.table && this.table.cols) {
          const cols = this.sortedTable.cols;

          let lastGroup = {label:''}
          cols.forEach(col => {
            if (col.type === 'data') {
              if (col.group !== lastGroup.label) {
                lastGroup = {label: col.group, count:0}
                groups.push(lastGroup)
              }
              lastGroup.count++
            }
          })

        }
      
        return groups
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