
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
                    <label> {{getNLS("analytics.distribution.outlier")}}</label>
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


            <ScatterPlotDetails v-if="hoverDetails" :value="hoverDetails"/>


        </div>

        <div class="MatcScatterPlotHintBar" data-dojo-attach-point="hintCntr">
        </div>

    </div>
</template>

<style lang="scss">
    @import '../../../style/components/scatter.scss';
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
import ScatterPlotDetails from './ScatterPlotDetails'
import * as Outlier from 'dash/Outlier'
import PerformanceMonitor from 'core/PerformanceMonitor'
import {iconDOM} from 'page/QIconUtil'

export default {
    name: 'ScatterPlot',
    mixins: [_Color, Util],
    props: ['test', 'app', 'events', 'annotation', 'pub', 'mode', 'yAxis', 'xAxis', 'clusterVars', 'clusterAlgo', 'clusterNorm'],
    data: function () {
        return {
            tasks: [],
            selectedTasks: {},
            hasOutliers: true,
            paddingFactor: 1.1,
            dialog: false,
            includeDropOff: false,
            defaultColor: "#365fff",
            outlierColor: '#f83a3a',
            clusters: [],
            colors: [ "#9933cc", "#669900", "#ff8a00", "#cc0000", "#000000", "#8ad5f0", "#d6adeb", "#c5e26d"],
            bins: 3,
            hoverDetails: null,
        }
    },
    components: {
        ScatterPlotDetails
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
            this.init();
            this._scatterPoints = {}
        },

        init() {
            this.db = new DomBuilder();      
            this._scatterPoints = {};
        },

        setValue(test, app, events, annotations) {
            this.logger.log(-1, "setValue", "enter");
            PerformanceMonitor.start('ScatterPlot.setValue()')
            this.annotations = annotations;
            this.model = app

            try {
                const filteredEvents = this.filterEvents(events, annotations);
                this.df = this.getActionEvents(new DataFrame(filteredEvents));      
                this.df.sortBy("time");
        
                this.tasks = lang.clone(test.tasks).filter(task => task.flow.length >= 2);  

                this.sessionDetails = this.analytics.getSessionDetails(this.df, this.tasks)     
                this.sessionDetails = Outlier.addWeirdness(this.sessionDetails, this.df) 
                let data = this.analytics.convertSessionDetails(this.sessionDetails)

                if (data.length < 200) {
                    this.clusters = Outlier.cluster(data, this.clusterVars, this.clusterNorm, this.clusterAlgo)
                } else {
                    this.logger.error("setValue", "Too many events");
                    this.hasOutliers = false
                }
             
                this.render();
            } catch (e) {
                this.logger.error("setValue", "Error");
                this.logger.sendError(e);
            }
            PerformanceMonitor.end('ScatterPlot.setValue()')
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
            this.logger.log(-1, "render", "enter > ");
            this.cleanUpTempListener()    
            this.onBackgroundClick()       
            this.render_Scatter();
        },

      
        onBackgroundClick () {
            this.setHint(this.db.span("", this.getNLS("analytics.distribution.hint")).build());
            this.unSelectPoint()
        },

        render_Scatter() {
            this.logger.log(1, "render_Scatter", "enter", this.mode);

            delete this._selectedScatterPoint;           
         
            this.xLabel.innerHTML = this.getNLS("analytics.distribution.details." + this.xAxis);
            this.yLabel.innerHTML = this.getNLS("analytics.distribution.details." + this.yAxis);
            this.minLabel.innerHTML = "0 s"
            this.yMinLabel.innerHTML = "0"    
            this.render_Scatter_Points(this.xAxis, this.yAxis)            

        },

        render_Scatter_Points (xAxis, yAxis) {
            this.logger.log(1, "render_Scatter_Points", "enter > " + xAxis + " X " + yAxis );

  
            const sessionSummaryDF = this.sessionDetails
                  
            const maxXAxis = Math.max(1, Math.ceil(sessionSummaryDF.max(xAxis) * this.paddingFactor));
            const maxYAxis = Math.max(1, Math.ceil(sessionSummaryDF.max(yAxis) * this.paddingFactor));
            const meanXAxis = sessionSummaryDF.mean(xAxis);
            const meanYAxis = sessionSummaryDF.mean(yAxis);

        
            this.xMaxLabel.innerHTML = Math.ceil(maxXAxis / 1000) + " s";
            this.yMaxLabel.innerHTML = Math.ceil(maxYAxis);
     
            const sessions = sessionSummaryDF.data;
                      
            for (let i = 0; i < sessions.length; i++) {
                const s = sessions[i]        
                const x = s[xAxis]
                const y = s[yAxis]            
                this.renderScatterPoint(i,s, x, y, maxXAxis, maxYAxis)               
            }
                
            this.maxYAxis = maxYAxis;
            this.maxXAxis = maxXAxis;
            this.meanYAxis = meanYAxis
            this.meanXAxis = meanXAxis

            this.unSelectPoint()
        },

        renderScatterPoint(i, s, x, y , maxXAxis, maxYAxis) {
            const key = s.session;
            const ms = Math.min(i * 10, 300);

            if (!this._scatterPoints[key]) {
                const p = this.db.span("MatxScatterPoint").build(this.canvas);
                p.style.bottom = "-5%";
                p.style.left = (((x / maxXAxis) * 100)) + "%";
                this._scatterPoints[key] = p;
            }

            const color = this.getPointColor(s, i)
            const p = this._scatterPoints[key];
            p.style.background = color
            this.tempOwn(on(p, "click", lang.hitch(this, "selectPoint", p, s, x, y, i))); 
            this.tempOwn(on(p, "mouseover", lang.hitch(this, "hoverPoint", p, s, x, y, i)));
            this.tempOwn(on(p, "mouseout", lang.hitch(this, "leavePoint")));   
            setTimeout(lang.hitch(this, "animateScatterPoint", p, x,y, maxXAxis, maxYAxis), ms);
        },

        animateScatterPoint(p, x, y, maxXAxis, maxYAxis) {
            p.style.bottom = (((y / maxYAxis) * 100)) + "%";
            p.style.left = (((x / maxXAxis) * 100)) + "%";
        },

        unSelectPoint() {
            setTimeout(lang.hitch(this, "setMiddle", this.meanYAxis, this.maxYAxis, this.meanXAxis, this.maxXAxis), 200);
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

        hoverPoint (p, s, x, y) {
            let posX = x * 100 / this.maxXAxis
            let posY = y * 100 / this.maxYAxis
            let cls = ''
            if (posX > 50) {
                cls += 'left '
            } else {
                cls += 'right '
            }
            if (posY > 50) {
                cls += 'bottom '
            } else {
                cls += 'top '
            }
            const tasks = []
            this.tasks.forEach(t => {
                if (s[t.id]?.success === 1) {
                    tasks.push(t.name)
                }
            })
            this.hoverDetails = {
                x: posX,
                y: posY,
                cls: cls,
                s: s,
                tasks: tasks
            }
        },

        leavePoint () {
            this.hoverDetails = null
        },

        selectPoint(p, s, x, y, i, e) { 
            this.stopEvent(e);
            this.setXMiddle(x, this.maxXAxis);
            this.setYMiddle(y, this.maxYAxis);
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
                const hint = this.db.span("").build();
				this.db.span("", this.getNLS("analytics.distribution.play")).build(hint);
				const a = this.db.a("", this.getNLS("analytics.distribution.here")).build(hint);
                a.href = url
                a.target = "_matcSessionReplay" + id
                this.setHint(hint);
            }
        },

        /*********************************************************************
         * Helper
         *********************************************************************/


        setHint(hintNode) {
            this.hintCntr.innerHTML = "";
            if (hintNode) {
                this.hintCntr.appendChild(iconDOM('PlayVideo'))
                this.hintCntr.appendChild(hintNode);
            }
        },

        clearPoint() {
            //this.setMiddle(meanYAxis, maxYAxis, meanXAxis, maxXAxis);
            css.remove(this.cntr, "MatcScatterPlotCntrHover");
        },

        setMiddle(meanYAxis, maxYAxis, meanXAxis, maxXAxis) {
            this.setXMiddle(meanXAxis, maxXAxis);
            this.setYMiddle(meanYAxis, maxYAxis);
            css.remove(this.cntr, "MatcScatterPlotCntrHover");
        },

        setYMiddle(count, maxYAxis) {
            this.yMiddleLabel.innerHTML = Math.ceil(count);
            this.yMiddleLabel.style.bottom = ((count / maxYAxis) * 100) + "%";
            this.yLine.style.bottom = ((count / maxYAxis) * 100) + "%";
        },

        setXMiddle(duration, maxXAxis) {
            this.xMiddleLabel.innerHTML = Math.ceil(duration / 1000) + " s";
            this.xMiddleLabel.style.left = (((duration / maxXAxis) * 100)) + "%";
            this.xLine.style.left = (((duration / maxXAxis) * 100)) + "%";
        }
    },
    watch: {
        mode (v) {
            this.mode = v
            this.render();
        },
        yAxis (v) {
            this.yAxis = v
            this.render()
        },
        xAxis (v) {
            this.xAxis = v
            this.render()
        },
        clusterVars (v) {
            this.clusterVars = v
            this.setValue(this.test, this.app, this.events, this.annotation)
        },
        clusterAlgo (v) {
            this.clusterAlgo = v
            this.setValue(this.test, this.app, this.events, this.annotation)
        },
        clusterNorm (v) {
            this.clusterNorm = v
            this.setValue(this.test, this.app, this.events, this.annotation)
        }
    },
    mounted() {        
        this.analytics = new Analytics();
        this.logger = new Logger("ScatterPlot");
        this.db = new DomBuilder();
        this.setValue(this.test, this.app, this.events, this.annotation)
    }
}
</script>