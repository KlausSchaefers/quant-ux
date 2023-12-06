<template>
    <div class="StudioDetails" id="">
        <template v-if="summary">
            <div class="StudioDetailsKPICntr" >
                <div class="StudioDetailsKPI" :style="{'background': getBackgroundColor(summary.sessionCount, 5, 30)}">
                    <h4>{{ summary.sessionCount }}</h4>
                    <label>{{$t('app.kpi-sessions')}}</label>
                </div>

                <div class="StudioDetailsKPI">
                    <h4>{{ summary.sessionDurationMean}} {{summary.sessionDurationMeanLabel}}</h4>
                    <label>{{$t('app.kpi-duration')}}</label>
                </div>
                <div class="StudioDetailsKPI" :style="{'background': getBackgroundColor(summary.taskSuccessMean, 33, 66)}">
                    <h4>{{ summary.taskSuccessMean }} {{summary.taskSuccessMeanLabel}}</h4>
                    <label>{{$t('app.kpi-task')}}</label>
                </div>
                <div class="StudioDetailsKPI">
                    <h4>{{summary.expRate }} {{summary.expRateLabel}}</h4>
                    <label>{{$t('app.kpi-coverage')}}</label>
                </div>
            </div>

            <div class="StudioDetailsComments">
                <div class="StudioDetailsCommentsHeader">
                    <h4>Comments</h4>
                </div>
                <div class="StudioDetailsCommentsCntr">
                    <StudioComment v-for="c in comments" :key="c.id" :user="user" :comment="c"/>
                </div>
            </div>
        </template>
        <div v-else>
            <div class="MatcLoading">
                {{$t('common.loading')}}
            </div>
       
        </div>
    </div>
</template>

<script>

import Logger from "common/Logger";
import Util from "core/Util";
import PerformanceMonitor from 'core/PerformanceMonitor'
import DataFrame from "common/DataFrame";
import Analytics from "dash/Analytics";
import Services from "services/Services";
import StudioComment from './StudioComment'
export default {
    name: "StudioDetails",
    mixins: [Util],
    props: ["app", "test", "user", "annotation", "events", "pub", "hash", "isLoaded"],
    data: function () {
        return {
            summary: false,
            comments: []
        };
    },
    components: {
        'StudioComment': StudioComment
    },
    computed: {

    },
    methods: {
        getBackgroundColor (v, low, high) {    
            if (isNaN(v)) {
                return ''
            }
            if (v <= low) {
                return '#FFECF2'
            }
            if (v >= high) {
                return '#D4F7D3'
            }
            return //' '#F7EFD3'
        },
        onChange () {
            // This method gets called three times, if any of the props change,
            // but we do not want to render 3 times...
            if (!this.summary) {
                setTimeout(async () => {
                    await this.loadComments()
                    this.setSummary()
                }, 30)
            }
        },
        async loadComments () {
            this.comments = await Services.getCommentService().findAll(
                this.app.id
            );
        },
        setSummary() {
            this.logger.log(-1, "setSummary", "ener");
            if (!this.app || !this.isLoaded) {
                return
            }
            PerformanceMonitor.start('StudioDetails.setSummary()')
            const events = this.filterEvents(this.events, this.annotation);
            const df = this.getActionEvents(new DataFrame(events));
            df.sortBy("time");
            this._addTestKPI(df, this.app);

            PerformanceMonitor.end('StudioDetails.setSummary()')
        },

        _addTestKPI(df, app) {
            PerformanceMonitor.start('AnalyticsTab._addTestKPI()')
            const sessionGroup = df.groupBy("session");
            const count = df.count("session");
            const min = sessionGroup.min("time");
            const max = sessionGroup.max("time");
            max.minus(min);

            const summary = {};
            summary.sessionCount = count.size();
            if (count.size() === 0) {
                summary.sessionDurationMean = '-'
                summary.expRate = '-'
            } else {
                summary.sessionCountMean = Math.round(count.mean());               
                summary.sessionDurationMean = Math.round(max.mean() / 1000);             
                if (isNaN(summary.sessionDurationMean)) {
                    summary.sessionDurationMean = 0;
                }
                summary.sessionDurationMeanLabel = 's'

                const screenCount = this.getObjectLength(app.screens);
                const uniqueScreenPerSession = sessionGroup.unique("screen");
                let expRate = uniqueScreenPerSession.mean() / screenCount;
                if (isNaN(expRate)) {
                    expRate = 0;
                }
                if (isNaN(expRate)) {
                    expRate = 0;
                }
                summary.expRate = Math.round(expRate * 100)
                summary.expRateLabel ='%';
            }


            const tasks = this.test.tasks;
            if (tasks && tasks.length > 0) {
                const analytics = new Analytics();
                const taskSummaries = analytics.getTaskSummary(df, tasks, this.annotation);
                let sumSuccess = 0
                taskSummaries.forEach(s => {
                    sumSuccess += s.success
                })

                summary.taskSuccessMean = Math.round(100* (sumSuccess / taskSummaries.length))
                summary.taskSuccessMeanLabel = '%'
            } else {
                summary.taskSuccessMean = '-'
            }

            this.summary = summary;
            PerformanceMonitor.end('AnalyticsTab._addTestKPI()')
        }
    },
    watch: {
        isLoaded (v) {
            this.isLoaded = v;
            if (!v) {
                this.comments = []
                this.summary = false
            }
        },
        app(v) {
            this.logger.info("watch", "app >", v);
            this.app = v;
            this.onChange()
        },
        test(v) {
            this.logger.info("watch", "test >", v);
            this.test = v;
            this.onChange()
        },
        events(v) {
            this.logger.info("watch", "events >", v);
            this.events = v;
            this.onChange()
        }
    },
    async mounted() {
        this.logger = new Logger("StudioDetails");
        this.setSummary()
    }
};
</script>
  