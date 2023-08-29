<template>
    <ZoomDialog ref="dialog">
        <div class=" MatcDialog MatcSurveyDialog MatcPadding">
            <div class="MatcToolbarTabs MatcToolbarTabsBig">
                <a @click="tab='table'" :class="{'MatcToolbarTabActive': tab === 'table'}">{{ $t('survey.dialogTable')}}</a>
                <a @click="tab='diagrams'" :class="{'MatcToolbarTabActive': tab === 'diagrams'}">{{ $t('survey.dialogDiagrams')}}</a>
                </div>
        </div>
 
     
    </ZoomDialog>
</template>
<style lang="scss">
    @import '../../../style/components/survey_section.scss';
</style>
<script>
import Logger from 'common/Logger'
import ZoomDialog from 'common/ZoomDialog'
import Analytics from "dash/Analytics";
import lang from 'dojo/_base/lang'
//import Dialog from 'common/Dialog'
//import SurveyTable from './SurveyTable'

export default {
    name: 'SurveySection',
    mixins:[],
    props: ['test', 'app', 'events', 'annotation'],
    data: function () {
        return {
            tab:'table'
        }
    },
    components: {
      //'SurveyTable': SurveyTable,
      'ZoomDialog': ZoomDialog
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
      }
    },
    methods: {
        show (target) {
            this.$refs.dialog.show(target)

            // let popup = document.createElement('div')
            // popup.className = 'MatcSurveyDialog'

            // const d = new Dialog()
            // d.popup(popup, e.target)
        }
    },
    mounted () {
      this.logger = new Logger('SurveySection')
    }
}
</script>