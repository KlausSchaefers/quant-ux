<template>
    <div class="StudioDetails" id="">

        <div class="StudioDetailsSummary">

        </div>
        {{ summary }}
    </div>
</template>

<script>

import Logger from "common/Logger";
import Util from "core/Util";
import PerformanceMonitor from 'core/PerformanceMonitor'
import DataFrame from "common/DataFrame";

export default {
    name: "StudioDetails",
    mixins: [Util],
    props: ["app", "test", "annotation", "events", "pub", "hash"],
    data: function () {
        return {
            summary: false
        };
    },
    components: {
    },
    computed: {

    },
    methods: {
        setSummary() {
            if (!this.app) {
                return
            }
            PerformanceMonitor.start('StudioDetails.setSummary()')
            
            /**
             * remove all sessions that are invalid!
             */
            let events = this.filterEvents(this.events, this.annotation);

            /**
             * Just use actionable events
             */
            const actionEvents = this.getActionEvents(new DataFrame(events));
            events = actionEvents.as_array();

            const df = new DataFrame(events);
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
            summary.sessionCountMean = Math.round(count.mean());
            summary.sessionCountStd = Math.round(count.std());
            summary.sessionDurationMean = Math.round(max.mean() / 1000);
            summary.sessionDurationStd = Math.round(max.std() / 1000);
            summary.sessionMeanUser = summary.sessionCount / summary.userCount;
            summary.sessionPercentage = Math.min(summary.sessionCount / this.MIN_REQUIERED_USERS, 1);

            if (isNaN(summary.sessionDurationMean)) {
                summary.sessionDurationMean = 0;
                summary.sessionDurationStd = 0;
            }

            const screenCount = this.getObjectLength(app.screens);
            const uniqueScreenPerSession = sessionGroup.unique("screen");
            let expRate = uniqueScreenPerSession.mean() / screenCount;
            if (isNaN(expRate)) {
                expRate = 0;
            }
            if (isNaN(expRate)) {
                expRate = 0;
            }
            summary.expRate = expRate;
            this.summary = summary;
            PerformanceMonitor.end('AnalyticsTab._addTestKPI()')
        }
    },
    watch: {
        app(v) {
            this.logger.info("watch", "app >", v);
            this.app = v;
        },
        test(v) {
            this.logger.info("watch", "test >", v);
            this.test = v;
        },
        events(v) {
            this.logger.info("watch", "events >", v);
            this.events = v;
            this.setSummary()
        }
    },
    async mounted() {
        this.logger = new Logger("StudioDetails");
        this.setSummary()
    }
};
</script>
  