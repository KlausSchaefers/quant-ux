
<template>
    <div :class="'MatcScatterPlot MatcScatterPlot' + mode  ">
       
        <div class="MatcScatterPlotfActionCntr" data-dojo-attach-point="actionCntr">
        </div>
        <div class="MatcScatterPlotCntr" data-dojo-attach-point="cntr" @click="onBackgroundClick">
            <span class="MatxAxisXLine MatcScatterPlotfScatternVisible MatcScatterPlotDurationHidden" data-dojo-attach-point="xLine"></span>
            <span class="MatxAxisYLine MatcScatterPlotfScatternVisible MatcScatterPlotDurationHidden" data-dojo-attach-point="yLine"></span>
           
            <div class="MatcScatterPlotCanvas" data-dojo-attach-point="canvas">
            </div>

            <span class="MatxAxisLabel xMaxLabel" data-dojo-attach-point="xMaxLabel"></span>
            <span class="MatxAxisLabel MatcScatterPlotDropOffHidden yMaxLabel" data-dojo-attach-point="yMaxLabel"></span>
            <span class="MatxAxisLabel MatcScatterPlotfScatternVisible MatcScatterPlotDurationHidden xMiddleLabel" data-dojo-attach-point="xMiddleLabel"></span>
            <span class="MatxAxisLabel MatcScatterPlotfScatternVisible MatcScatterPlotDurationHidden yMiddleLabel" data-dojo-attach-point="yMiddleLabel"></span>
            <span class="MatxAxisLabel minLabel" data-dojo-attach-point="minLabel">0</span>
            <span class="MatxAxisLabel xLabel " data-dojo-attach-point="xLabel">X</span>
            <span class="MatxAxisLabel yLabel MatcScatterPlotDropOffHidden" data-dojo-attach-point="yLabel">Y</span>
            <span class="MatxAxisLabel yLabelEast MatcScatterPlotfDetailsVisible" data-dojo-attach-point="yLabelEast">Y</span>
            <span class="MatxAxisLabel yMinLabelEast MatcScatterPlotfDetailsVisible" data-dojo-attach-point="yMinLabelEast">0</span>
            <span class="MatxAxisLabel yMaxLabelEast MatcScatterPlotfDetailsVisible" data-dojo-attach-point="yMaxLabelEast">100</span>
            <span class="MatxAxisLabel yMinLabel" data-dojo-attach-point="yMinLabel"></span>
            <span class="MatxAxisLabel bottom25Label MatcScatterPlotfDetailsVisible" data-dojo-attach-point="bottom25Label"></span>
            <span class="MatxAxisLabel bottom75Label MatcScatterPlotfDetailsVisible" data-dojo-attach-point="bottom75Label"></span>
            <span class="MatxAxisLabel MatxAxisLabelCntr" data-dojo-attach-point="xAxisLabelCntr"></span>

            <div class="MatcScatterPlotfTaskCntr" data-dojo-attach-point="taskCntr">
                <div @click="toggleOutlier()" :class="{'MatcScatterPlotfTaskSelected': hasOutliers}">
                    <span :style="getOutlierStyle()"></span>
                    <label> {{getNLS("dash.perf.scatter.outlier")}}</label>
                </div> 
                <!-- <div @click="clickTask()" v-if="Object.values(selectedTasks).length">
                    <span></span>
                    <label> {{getNLS("dash.perf.scatter.no-task")}}</label>
                </div> -->
                <!-- <div v-for="task in tasks" :key="task.id" @click="clickTask(task)">
                    <span :style="getTaskStyle(task)"></span>
                    <label>{{task.name}}</label>
                </div> -->
            </div>



        </div>

        <div class="MatcScatterPlotHintBar" data-dojo-attach-point="hintCntr">
        </div>

    </div>
</template>

<style lang="scss">
    @import '../../../style/scatter.scss';
</style>

<script>
import on from 'dojo/on'
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import Logger from 'common/Logger'
import _Color from 'common/_Color'
import DomBuilder from 'common/DomBuilder'
import Util from 'core/Util'
import Analytics from 'dash/Analytics'
import DataFrame from 'common/DataFrame'
import * as Outlier from 'dash/Outlier'

export default {
    name: 'ScatterPlot',
    mixins: [_Color, Util],
    props: ['test', 'app', 'events', 'annotation', 'pub', 'mode'],
    data: function () {
        return {
            tasks: [],
            selectedTasks: {},
            hasOutliers: true,
            paddingFactor: 1.1,
            dialog: false,
            includeDropOff: false,
            defaultColor: "#56A9FC",
            outlierColor: '#f83a3a',
            clusters: [],
            colors: [ "#9933cc", "#669900", "#ff8a00", "#cc0000", "#000000", "#8ad5f0", "#d6adeb", "#c5e26d"],
            bins: 3,
            canvasPos: {
                w: 800,
                h: 450
            }
        }
    },
    components: {

    },
    methods: {

        getOutlierStyle () {
            if (this.hasOutliers) {
                return `background:${this.outlierColor}; border:none`
            }
            return ''
        },

        getTaskStyle (task) {      
            if (this.selectedTasks[task.id]) {
                return `background:${task.color}; border:none`
            }
            return ''
        },

        postCreate() {
            this.log = new Logger("ScatterPlot");
            this.init();
            this._scatterPoints = {}
        },

        init() {
            this.db = new DomBuilder();      
            this._scatterPoints = {};
        },

        setValue(test, app, events, annotations) {

            const filteredEvents = this.filterEvents(events, annotations);
            const df = this.getActionEvents(new DataFrame(filteredEvents));      
            df.sortBy("time");

            this.model = app
            this.df = df

            this.annotations = annotations;
            this.tasks = lang.clone(test.tasks).filter(task => task.flow.length >= 2);
        
   
            this.sessionDetails = this.analytics.getSessionDetails(df, this.tasks)
      
           
            this.setClusters4d(this.sessionDetails)               
            
        
            this.initTasks(this.tasks);           
            this.render();
        },

        setClusters4d (sessionDetails) {
           
            const data = this.analytics.convertSessionDetails(sessionDetails)
  
            let matrix = Outlier.getMatrix(data, ["interactions", "duration", "screens", "tasks"]) //,  // ...this.tasks.map(t => t.id)
            matrix = Outlier.getZScore(matrix)
            const distance = Outlier.getPairwiseDistance(matrix)
            const minDistance = Outlier.getClusterMinDistance(distance)          
            this.clusters = Outlier.cluster(matrix, minDistance, 3)
        },

        setClusters2D (sessionSummary) {
            
            let matrix = Outlier.getMatrix(sessionSummary.data, ["interactions", "duration"])
            matrix = Outlier.getZScore(matrix)

            const distance = Outlier.getPairwiseDistance(matrix)
            const minDistance = Outlier.getClusterMinDistance(distance, 0.5)
           
            const clusters = Outlier.cluster(matrix, minDistance, 3)
            this.clusters = clusters
        },

        initTasks(tasks) {
            this.log.log(1, "initTasks", "enter");
            this.taskColors = {};        
            for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];
                if (task.flow.length >= 2 ) {
                    this.selectedTasks[task.id] = false;
                    const color = this.colors[i % this.colors.length];
                    this.taskColors[task.id] = color
                    task.color = color
                }
            }
        },

        clickTask(task) {
            this.selectTask(task);
            this.render();
            this.$forceUpdate()
        },

        toggleOutlier () {
            this.hasOutliers = !this.hasOutliers
            this.render();
            this.$forceUpdate()
        },

        selectTask(task) {
            this.selectedTasks[task?.id] = !this.selectedTasks[task?.id];
            for (let id in this.selectedTasks) {
                if (id !== task?.id) {
                    this.selectedTasks[id] = false
                }
            }
        },

        render() {
            this.log.log(-1, "render", "enter > ");
            this.cleanUpTempListener()    
            this.onBackgroundClick()       
            this.render_Scatter();
        },

      
        onBackgroundClick () {
            this.setHint(this.db.span("MatcHint", this.getNLS("analytics.distribution.hint")).build());
            setTimeout(lang.hitch(this, "setMiddle", this.mean_count, this.max_interactions, this.mean_duration, this.max_duration), 200);
        },

        render_Scatter() {
            this.log.log(-1, "render_Scatter", "enter > changeTask:" + this.scatterMode);

            delete this._selectedScatterPoint;            
            this.xLabel.innerHTML = this.getNLS("dash.perf.scatter.xLabel");
            this.yLabel.innerHTML = this.getNLS("dash.perf.scatter.yLabel");
            this.minLabel.innerHTML = "0 s"
            this.yMinLabel.innerHTML = "0"    
            this.render_Scatter_Session()            
        },

        render_Scatter_Session () {
            this.log.log(-1, "render_Scatter_Tasks", "enter" );

            const db = new DomBuilder();
            const sessionSummaryDF = this.sessionDetails

            let mean_duration = 0
            let mean_count = 0
            let maxDelay = 0;

        
            let max_duration = Math.max(1, Math.ceil(sessionSummaryDF.max("duration") * this.paddingFactor));
            let max_count = Math.max(1, Math.ceil(sessionSummaryDF.max("interactions") * this.paddingFactor));
       
            this.xMaxLabel.innerHTML = Math.ceil(max_duration / 1000) + " s";
            this.yMaxLabel.innerHTML = Math.ceil(max_count);
     
            const sessions = sessionSummaryDF.data;
                      
            mean_duration = sessionSummaryDF.mean("duration");
            mean_count = sessionSummaryDF.mean("interactions");

            for (let i = 0; i < sessions.length; i++) {
                const s = sessions[i]
                const key = s.session;
                const ms = Math.min(i * 10, 300);
                maxDelay = Math.max(maxDelay, ms)

                const color = this.getPointColor(s, i)

                if (this._scatterPoints[key]) {
                    const p = this._scatterPoints[key];
                    p.style.background = color
                    this.tempOwn(on(p, "click", lang.hitch(this, "selectPoint", p, s, i)));        
                    setTimeout(lang.hitch(this, "animateScatterPoint", p, s, max_duration, max_count), ms);
                } else {
                    const p = db.span("MatxScatterPoint").build(this.canvas);
                    p.style.bottom = "-5%";
                    p.style.left = (((s.duration / max_duration) * 100)) + "%";
                    p.style.background = color
                    this._scatterPoints[key] = p;
                    this.tempOwn(on(p, "click", lang.hitch(this, "selectPoint", p, s, i)));
            
                    setTimeout(lang.hitch(this, "animateScatterPoint", p, s, max_duration, max_count), ms);
                }
            }
                
            this.max_interactions = max_count;
            this.max_duration = max_duration;
            this.mean_count = mean_count
            this.mean_duration = mean_duration

            setTimeout(lang.hitch(this, "setMiddle", mean_count, max_count, mean_duration, max_duration), 200);
        },

        getPointColor (session, i) {       
            if (this.clusters[i] === -1 && this.hasOutliers) {
                return this.outlierColor
            }
            for (let taskID in this.selectedTasks) {      
                if (this.selectedTasks[taskID] && session[taskID] && session[taskID].success) {
                    return this.taskColors[taskID];
                }          
            }
            return this.defaultColor
        },

        selectPoint(p, s, i, e) { 
            this.stopEvent(e);
            this.setXMiddle(s.duration, this.max_duration);
            this.setYMiddle(s.interactions, this.max_interactions);
            css.add(this.cntr, "MatcScatterPlotCntrHover");
            this._selectedScatterPoint = p;
            this.showSessionReplayHint(s.session)
        },

        showSessionReplayHint(id) {
            if (this.model) {
                let url = "#/apps/" + this.model.id + "/replay/" + id + ".html";
                if (this.mode == "public") {
                    url = "#/examples/" + this.model.id + "/replay/" + id + ".html";
                }
                const hint = this.db.span("MatcHint", this.getNLS("analytics.distribution.play")).build();
                const a = this.db.a("", this.getNLS("analytics.distribution.here")).build(hint);
                a.href = url
                a.target = "_matcSessionReplay" + id
                this.setHint(hint);
            }
        },

        /*********************************************************************
         * Helper
         *********************************************************************/

        hoverPoint(p) {
            if (this._selectedScatterPoint == p) {
                css.add(this.cntr, "MatcScatterPlotCntrHover");
            }
        },

        setHint(hintNode) {
            this.hintCntr.innerHTML = "";
            if (hintNode) {
                this.hintCntr.appendChild(hintNode);
            }
        },

        clearPoint() {
            //this.setMiddle(mean_count, max_count, mean_duration, max_duration);
            css.remove(this.cntr, "MatcScatterPlotCntrHover");
        },

        setMiddle(mean_count, max_count, mean_duration, max_duration) {
            this.setXMiddle(mean_duration, max_duration);
            this.setYMiddle(mean_count, max_count);
            css.remove(this.cntr, "MatcScatterPlotCntrHover");
        },

        setYMiddle(count, max_count) {
            this.yMiddleLabel.innerHTML = Math.ceil(count);
            this.yMiddleLabel.style.bottom = ((count / max_count) * 100) + "%";
            this.yLine.style.bottom = ((count / max_count) * 100) + "%";
        },

        setXMiddle(duration, max_duration) {
            this.xMiddleLabel.innerHTML = Math.ceil(duration / 1000) + " s";
            this.xMiddleLabel.style.left = (((duration / max_duration) * 100)) + "%";
            this.xLine.style.left = (((duration / max_duration) * 100)) + "%";
        },

        animateScatterPoint(p, s, max_duration, max_interactions) {
            p.style.bottom = (((s.interactions / max_interactions) * 100)) + "%";
            p.style.left = (((s.duration / max_duration) * 100)) + "%";
        }
    },
    watch: {
    },
    mounted() {        
        this.analytics = new Analytics();
        this.setValue(this.test, this.app, this.events, this.annotation)
    }
}
</script>