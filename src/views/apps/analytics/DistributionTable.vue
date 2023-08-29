
<template>
    <div class="MatcDashTable MatcDistributionTable">
XXX
        <div data-dojo-attach-point="tableCntr" class="MatcDistributionTableCntr"></div>

    </div>
</template>
<style>
    .MatcDashTable.MatcDistributionTable .MatcDistributionTableCntr {
        max-height: 800px;
        overflow: auto;
    }
</style>
<script>
import css from "dojo/css";
import lang from "dojo/_base/lang";
import Util from 'core/Util'
import Table from "common/Table";
import Analytics from "dash/Analytics";
import * as Outlier from 'dash/Outlier'
import DataFrame from 'common/DataFrame'
import DomBuilder from 'common/DomBuilder'
import Logger from 'common/Logger'

export default {
    name: "DistributionTable",
    mixins: [Util],
    props: ['test', 'app', 'events', 'annotation', 'pub',  'clusterVars', 'clusterAlgo', 'clusterNorm'],
    data: function () {
        return {
            appID: "",
            userID: "",
            mode: "private",
            colWidths: [3, 3, 3, 3],
            details: false
        };
    },
    components: {
    },
    computed: {
        urlPrefix() {
            if (this.pub) {
                return "examples";
            }
            return "apps";
        },
    },
    methods: {

        render() {
            this.cleanUpTempListener();      

            try {
                const filteredEvents = this.filterEvents(this.events, this.annotation);
                this.df = this.getActionEvents(new DataFrame(filteredEvents));      
                this.df.sortBy("time");
        
                this.tasks = lang.clone(this.test.tasks).filter(task => task.flow.length >= 2);  

                this.sessionDetails = this.analytics.getSessionDetails(this.df, this.tasks)     
                this.sessionDetails = Outlier.addWeirdness(this.sessionDetails, this.df) 
                let data = this.analytics.convertSessionDetails(this.sessionDetails)

                let matrix = Outlier.getMatrix(data, this.clusterVars)
                matrix = Outlier.getZScore(matrix)

                console.debug(data, matrix)

                this.renderTaskTable(data)
            } catch (e) {
                this.logger.error("render", e);
                this.logger.sendError(e);
            }


        },

        renderTaskTable(data) {
            this.tableCntr.innerHTML = "";
            var tbl = this.$new(Table);
            tbl.setPagingSize(10)
            tbl.setPaging(true)
            tbl.actionLabel = 'Video'

            tbl.setColumns([
                {
                    query: "date",
                    label: this.getNLS("videoTableDate"),
                    fct: (td, row) => {
                        td.innerHTML = this.formatDate(row.date, true);
                    }
                },
                {
                    query: "duration",
                    label: this.getNLS("analytics.distribution.details.duration"),
               
                    fct: (td, row) => { 
                        td.innerHTML = this.formatNumber(row.duration / 1000) + " sec";
                    }
                },
                {
                    query: "interactions",
                    label: this.getNLS("analytics.distribution.details.interactions"),
                 
                },
                {
                    query: "screenLoads",
                    label: this.getNLS("analytics.distribution.details.screens"),
          
                    fct: (td, row) => { 
                        td.innerHTML = `${row.screenUnique} / ${row.screenLoads}`
                    }
                },
                {
                    query: "errors",
                    label: this.getNLS("analytics.distribution.details.errors"),
                },
                {
                    query: "tasks",
                    label: this.getNLS("analytics.distribution.details.tasks"),  
                } 
             
            ]);
            tbl.setActions([
                {
                    render: (node, row) => {
                
                        const play = document.createElement("a");
                        play.href = "#/" +  this.urlPrefix + "/" +  this.app.id + "/replay/" + row.session + ".html";
                        css.add(play, "MatcButton");
                        play.innerHTML = '<span class="mdi mdi-play"></span>';
                        node.appendChild(play);
                    }
                }
            ]);
         

            tbl.setValue(data);
            tbl.placeAt(this.tableCntr);
        },
        showVideo() {

        }

    },
    watch: {
        events() {
           this.render();
        }
    },
    mounted() {
        this.logger = new Logger("DsiTable");
        this.analytics = new Analytics();
        this.db = new DomBuilder();
        this.render()
    }
};
</script>