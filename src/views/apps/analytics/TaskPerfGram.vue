
<template>
     <div class="MatcDashTaskPerfGram">
			<div class="MatcToolbarTabContainer">
				<div class="MatcToolbarTabs" data-dojo-attach-point="tabsCntr">
				</div>
			</div>
			<div class="MatcDashTaskPerfActionCntr" data-dojo-attach-point="actionCntr">
			</div>
				<div class="MatcDashTaskPerfGramCntr" data-dojo-attach-point="cntr">
					<span class="MatxAxisXLine MatcDashTaskPerfScatternVisible MatcDashTaskPerfGramDurationHidden" data-dojo-attach-point="xLine"></span>
					<span class="MatxAxisYLine MatcDashTaskPerfScatternVisible MatcDashTaskPerfGramDurationHidden" data-dojo-attach-point="yLine"></span>
					<div class="MatcDashTaskPerfGramCanvas" data-dojo-attach-point="canvas">
					</div>
					<span class="MatxAxisLabel xMaxLabel" data-dojo-attach-point="xMaxLabel"></span>
					<span class="MatxAxisLabel MatcDashTaskPerfGramDropOffHidden yMaxLabel" data-dojo-attach-point="yMaxLabel"></span>
					<span class="MatxAxisLabel MatcDashTaskPerfScatternVisible MatcDashTaskPerfGramDurationHidden xMiddleLabel" data-dojo-attach-point="xMiddleLabel"></span>
					<span class="MatxAxisLabel MatcDashTaskPerfScatternVisible MatcDashTaskPerfGramDurationHidden yMiddleLabel" data-dojo-attach-point="yMiddleLabel"></span>
					<span class="MatxAxisLabel minLabel" data-dojo-attach-point="minLabel">0</span>
					<span class="MatxAxisLabel xLabel "  data-dojo-attach-point="xLabel">X</span>
					<span class="MatxAxisLabel yLabel MatcDashTaskPerfGramDropOffHidden" data-dojo-attach-point="yLabel">Y</span>

					<span class="MatxAxisLabel yLabelEast MatcDashTaskPerfDetailsVisible" data-dojo-attach-point="yLabelEast">Y</span>
					<span class="MatxAxisLabel yMinLabelEast MatcDashTaskPerfDetailsVisible" data-dojo-attach-point="yMinLabelEast">0</span>
					<span class="MatxAxisLabel yMaxLabelEast MatcDashTaskPerfDetailsVisible" data-dojo-attach-point="yMaxLabelEast">100</span>
					<span class="MatxAxisLabel yMinLabel" data-dojo-attach-point="yMinLabel"></span>

					<span class="MatxAxisLabel bottom25Label MatcDashTaskPerfDetailsVisible" data-dojo-attach-point="bottom25Label"></span>
					<span class="MatxAxisLabel bottom75Label MatcDashTaskPerfDetailsVisible" data-dojo-attach-point="bottom75Label"></span>

					<span class="MatxAxisLabel MatxAxisLabelCntr" data-dojo-attach-point="xAxisLabelCntr"></span>


					<div class="MatcDashTaskPerfTaskCntr" data-dojo-attach-point="taskCntr" v-show="hasTaskSelector">
					</div>

					<div class="MatcDashTaskPerfDropCntr" data-dojo-attach-point="dropoffCntr">
						<CheckBox label="Show Dropoff" @change="onChangeFunnelDropOff"/>
					</div>

					
					
				</div>

			<div class="MatcDashTaskPerHintBar" data-dojo-attach-point="hintCntr">
			</div>

	</div>
</template>
<style lang="css">
  
</style>

<style lang="scss">
    @import '../../../style/components/task_perf_gram.scss';
	@import '../../../style/toolbar/tab.scss';
</style>


<script>
import DojoWidget from 'dojo/DojoWidget'
import on from 'dojo/on'
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import Logger from 'common/Logger'
import _Color from 'common/_Color'
import DomBuilder from 'common/DomBuilder'
import CheckBox from 'common/CheckBox'
import Util from 'core/Util'
import Analytics from 'dash/Analytics'
import * as d3 from "d3"
import DataFrame from 'common/DataFrame'
import {iconDOM} from 'page/QIconUtil'


export default {
    name: 'TaskPerfGram',
    mixins:[_Color, Util, DojoWidget],
    data: function () {
        return {
            x_prefix: "",
            paddingFactor: 1.1,
            tab: "scatter",// "scatter",
            tabs: {},
            dialog: false,
			includeDropOff: false,
            colors: ["#56A9FC", "#9933cc", "#669900", "#ff8a00", "#cc0000", "#000000", "#8ad5f0", "#d6adeb", "#c5e26d"],
            bins: 3,
			smoothLineFunction: d3.line()
				.curve(d3.curveBasis)
				.x((d) => {
					return d.x-.5; 
				 }).y((d) => { 
					return d.y-.5; 
				}),
			straightLineFunction: d3.line()
				.x((d) => { 
					return d.x-.5; 
				})
				.y((d) => { 
					return d.y-.5; 
			}),
			canvasPos:{
				w:800,
				h:450
			},
			hasTaskSelector: true
        }
    },
    components: {
		CheckBox
	},
    methods: {
        postCreate (){
			this.log = new Logger("TaskPerfGram");
			this.init();
			this._scatterPoints= {}
		},

		init (){
			this.db = new DomBuilder();
			this.addTab("scatter", "MatcToolbarTabActive");
			this.addTab("details", "");
			this.addTab("funnelDurartion", "");
			this.addTab("funnelInteraction", "");
			this._scatterPoints = {};
		},

		addTab (key, cls){
			var tab = this.db.a(cls, this.getNLS("dash.perf.tab." + key)).build(this.tabsCntr);
			this.own(on(tab, "mousedown", lang.hitch(this, "setTab", key)));
			this.tabs[key] = tab;
		},

		setTab (tab){
			if (this.tab != tab){
				this.lastTab = this.tab;
				this.tab = tab;
				for (var t in this.tabs){
					css.remove(this.tabs[t], "MatcToolbarTabActive");
				}
				if (this.tabs[tab]){
					css.add(this.tabs[tab], "MatcToolbarTabActive");
				}
				this.render();
			}
		},

		setModel (m) {
			this.model = m
		},

		setValue (df, task, annotations, tasks){
			this.df = df;
			this.task = task;
			this.annotations = annotations;
			this.tasks = tasks;
			this.renderTasks(tasks);
			this.selectTask(task); // will call render
			this.render();
		},

		renderTasks (tasks){
			this.log.log(-1, "renderTasks", "enter");
			this.taskDivs = {};
			this.taskCircles = {};
			this.selectedTasks = {};
			this.taskColors = {};
			for(let i=0; i< tasks.length; i++){
				const task = tasks[i];
				if (task.flow.length >= 2) {
					this.selectedTasks[task.id] = false;
					this.taskColors[task.id] = this.colors[i % this.colors.length];

					const div = this.db.div().build(this.taskCntr);
					const circle = this.db.span("").build(div);

					this.db.label("", tasks[i].name).build(div);
					this.taskCircles[task.id] = circle;
					this.taskDivs[task.id] = div;

					this.own(on(div, "click", lang.hitch(this, "clickTask",task, i)));
				}
			}
		},

		clickTask (task){
			this.selectTask(task);
			this.render(true);
		},

		selectTask (task){
			this.selectedTasks[task.id] = !this.selectedTasks[task.id];
			for (let id in this.selectedTasks){
				const circle = this.taskCircles[id];
				const div = this.taskDivs[id];
				
				if (div &&  circle){
					if (this.selectedTasks[id]){
						css.add(div, "MatcDashTaskPerfTaskSelected");
						circle.style.background = this.taskColors[id];
			
					} else {
						css.remove(div, "MatcDashTaskPerfTaskSelected");
						circle.style.background = ""; 					
					}
				}
			}

		},

		render (changeTask){
			this.log.log(-1, "render", "enter > " + changeTask);
			this.cleanUpTempListener()
			if (this.task.flow && this.task.flow.length >= 2) {
				if (!changeTask && this["clean_" + this.lastTab]){
					this["clean_" + this.lastTab](lang.hitch(this, "renderTab", changeTask));
				} else {
					this.renderTab(changeTask);
				}
			} else {
				css.add(this.tabsCntr, "hidden");
				css.add(this.cntr, "hidden");
				this.db.h2("", this.getNLS("dash.perf.no-flow-title")).build(this.domNode);
				this.db.div("MatcMarginTop", this.getNLS("dash.perf.no-flow-msg"), true).build(this.domNode);
			}
		},

		renderTab (changeTask){
			if (this.tab === 'dropoff' || this.tab === 'funnelDurartion' || this.tab === 'funnelInteraction') {
				css.add(this.domNode, "MatcDashTaskPerfGramHideTasks");
			} else {
				css.remove(this.domNode, "MatcDashTaskPerfGramHideTasks");
			}

			if (this.tab === 'funnelDurartion' || this.tab === 'funnelInteraction') {
				css.remove(this.domNode, "MatcDashTaskPerfGramHideDropoff");
			} else {
				css.add(this.domNode, "MatcDashTaskPerfGramHideDropoff");
			}
				

			if (this["render_" + this.tab]){
				this["render_" + this.tab](this.df, this.task, this.annotations, this.tasks, changeTask);
			} else {
				this.log.error("render", "No render for " + this.tab);
			}
		},

		/*********************************************************************
		 * Funnel Interaction stuff
		 *********************************************************************/

		onChangeFunnelDropOff (value) {
			this.log.log(-1, "onChangeFunnelDropOff", "enter > :", this.tab);
			this.includeDropOff = value
		
			// fixme: this should be updates with cool animations
			if (this.tab === 'funnelDurartion') {
				this.clean_funnelDurartion()
				this.render_funnelDurartion(this.df, this.task, true)
			}

			if (this.tab === 'funnelInteraction') {
				this.clean_funnelInteraction()
				this.render_funnelInteraction(this.df, this.task, true)
			}

		},


		render_funnelInteraction(df, task) { //
			this.log.log(-1, "render_funnelInteractions", "enter > :", this.includeDropOff);

			css.add(this.domNode, "MatcDashTaskPerfGramFunnel");
		
			this.xLabel.innerHTML = ""; 
			this.yLabel.innerHTML = "";
			this.yLabelEast.innerHTML = "";
			this.bottom25Label.innerHTML = "";
			this.bottom75Label.innerHTML = "";
			this.xMaxLabel.innerHTML = "";
			this.yMaxLabel.innerHTML = ""
			this.yMaxLabel.innerHTML = ""
			this.yMinLabelEast.innerHTML = ""
			this.minLabel.innerHTML = ""
			this.yMinLabel.innerHTML = "0"

			const offset = 60
			const flow = task.flow
			const stepWidth = (this.canvasPos.w - (offset * 2)) / (flow.length - 1)
			const canvasHeight = this.canvasPos.h - 20
		
			const analytics = new Analytics();
			const stepData = analytics.getFunnelInteraction(df, task, this.includeDropOff)	
			const maxIteration = analytics.getFunnelMax(stepData) +1
			this._render_funnel_steps(stepData, maxIteration, flow, stepWidth, offset, canvasHeight)
			this._render_funnel_lines(stepData, maxIteration, stepWidth, offset, canvasHeight, duration => {return Math.round(duration)})
		
			this.yMaxLabel.innerHTML = maxIteration
			this.tempOwn(on(this.cntr, "click", () => this.reset_funnel_selection()));
		
		},

		clean_funnelInteraction (callback) {
			this.log.log(-1, "clean_funnelInteractions", "enter > :");

			css.remove(this.domNode, "MatcDashTaskPerfGramFunnel");
			
			if (this._stepDivs) {
				this._stepDivs.forEach(div => {
					div.parentNode.removeChild(div)
				})
				delete this._stepDivs
			}
			if (this.funnelSVG) {
				this.canvas.innerHTML = ""
				delete this.funnelSVG
			}
			this.xAxisLabelCntr.innerHTML = ""
			this.yMinLabel.innerHTML = ""
			if (callback) {
				callback()
			}
		},


		/*********************************************************************
		 * Funnel Duration stuff
		 *********************************************************************/


		render_funnelDurartion (df, task) {
			this.log.log(-1, "render_funnelDurartion", "enter > :");

			css.add(this.domNode, "MatcDashTaskPerfGramFunnel");

			this.xLabel.innerHTML = ""; //this.getNLS("dash.perf.details.xLabel");
			this.yLabel.innerHTML = "";//this.getNLS("dash.perf.details.yLabel");
			this.yLabelEast.innerHTML = ""; //this.getNLS("dash.perf.details.yLabelEast");
			this.bottom25Label.innerHTML = "";
			this.bottom75Label.innerHTML = "";
			this.xMaxLabel.innerHTML = "";
			this.yMaxLabel.innerHTML = ""
			this.yMaxLabel.innerHTML = ""
			this.yMinLabelEast.innerHTML = ""
			this.minLabel.innerHTML = ""
			this.yMinLabel.innerHTML = "0"

			const offset = 60
			const flow = task.flow
			const stepWidth = (this.canvasPos.w - (offset * 2)) / (flow.length - 1)
			const canvasHeight = this.canvasPos.h - 20
		
			const analytics = new Analytics();
			const stepData = analytics.getFunnelDuration(df, task, this.includeDropOff)	
			const maxDuration = analytics.getFunnelMax(stepData) + 1000
			this._render_funnel_steps(stepData, maxDuration, flow, stepWidth, offset, canvasHeight)
			this._render_funnel_lines(stepData, maxDuration, stepWidth, offset, canvasHeight, duration => {
				return (Math.round(duration / 100) / 10)+ ' s'
			})
				
			this.yMaxLabel.innerHTML = Math.ceil(maxDuration / 1000) + ' s'
			this.tempOwn(on(this.cntr, "click", () => this.reset_funnel_selection()));
		
		},

		reset_funnel_selection () {
			this.selectFunnelPoint(false)
			this.setHint()
		},

		_render_funnel_lines (stepData, maxValue,  stepWidth, offset, canvasHeight, lblFunction) {

			const svgCntr = this.db.div('MatcDashTaskPerfGramFunnelSVG MatcDashTaskPerfGramFunnelSVGHidden').build(this.canvas)
	
			this.funnelSVG = d3
				.select(svgCntr)
				.append("svg")
				.attr("width", this.canvasPos.w)
				.attr("height",this.canvasPos.h)

			this.lineSVGs = {}
			this.lineColor = {}
			this.linePoints = {}

			// FIXME: here we could build a try to customize width and opacity?
				
			for (let id in stepData) {
				let steps = stepData[id]
				this._render_funnel_session_line(id, steps, maxValue, stepWidth, canvasHeight, offset, lblFunction)
			}
				
			setTimeout(() => {
				css.remove(svgCntr, 'MatcDashTaskPerfGramFunnelSVGHidden')
			}, 200)
		},

		_render_funnel_session_line(id, steps, maxValue, stepWidth, canvasHeight, offset, lblFunction) {
				const curveOffset = Math.round(stepWidth / 4)
				let line = []
				let color = this.colors[0]
				this.linePoints[id] = []
				steps.forEach((step, i) => {

					color = step.dropoff === true ? 'red': this.colors[0]

					let point = {
						x: (offset + (stepWidth * i)),
						y: canvasHeight - ((step.value / maxValue) * canvasHeight)
					}
					let div = this.db.div('MatcDashTaskPerfGramFunnelStepPoint')
						.left(point.x)
						.top(point.y)
						.build(this.canvas)

					this.db.div('MatcDashTaskPerfGramFunnelStepPointLabel', lblFunction(step.value)).build(div)
					
					div.style.background = color
					this.tempOwn(on(div, "click", lang.hitch(this, "selectFunnelPoint", id)));
				
					this.linePoints[id].push(div)
					if  (i > 0) {
						line.push({
							x: point.x - curveOffset,
							y: point.y
						})
					}
				
					line.push(point)
					if (i < steps.length-1) {
						line.push({
							x: point.x + curveOffset,
							y: point.y
						})
					}
					
				})
				let svg = this.funnelSVG.append("path")
						.attr("d", this.smoothLineFunction(line))
						.attr("stroke", color)
						.attr("stroke-width", 1 )
						.attr("fill", "none")
						.style("opacity", 0.5);
				this.lineSVGs[id] = svg
				this.lineColor[id] = color
		},

		_render_funnel_steps (stepData, maxValue, flow, width, offset, canvasHeight) {
			this._stepDivs = []
		
			if (flow.length > 1) {
				flow.forEach((step, i) => {

					const values = this.getStepData(stepData, i)
				
					const stepDF = new DataFrame(values)
				
					const max = Math.ceil(stepDF.max("value"));
					const min = Math.ceil(stepDF.min("value"));
					const mean = Math.ceil(stepDF.mean("value"));
					const std = Math.ceil(stepDF.std("value"));
					const left = (offset + (width * i))

					const div = this.db.
						div('MatcDashTaskPerfGramFunnelStep MatcDashTaskPerfGramFunnelStepSmall')
						.left(left)
						.build(this.canvas)

			
					this.render_funnel_box_plot(
						div, -11, 20, max, min, mean, std, maxValue, 
						this.colors[0], canvasHeight)
		
					this._stepDivs.push(div)


					const label = flow.length < 7
						? this.getNiceEventLabel (step, i, false) 
						: 'Step ' + (i +1)

					this.db
						.div('MatcDashTaskPerfGramFunnelStepLabel', label)
						.left((offset + (width * i)))
						.build(this.xAxisLabelCntr)

					
					setTimeout(() => {
						css.remove(div, 'MatcDashTaskPerfGramFunnelStepSmall')
					}, Math.min(300, 50 * i))
				})
			}
		},

		render_funnel_box_plot(parent, left, width ,max, min, mean, std, total, color, canvasHeight) {
			const height = (((max-min) / total) * canvasHeight)
			const cntr = this.db
				.div("MatcDashTaskPerfGramBoxPlotCntr")
				.top(canvasHeight - ((max / total) * canvasHeight ))
				.h(height)
				.w(width)
				.left(left)
				.build(parent);

			const bar = this.db
				.div("MatcDashTaskPerfGramBoxPlot")
				.build(cntr)
			bar.style.bottom = Math.max(0, ((((mean-std)-min) / (max-min)))) * 100 + "%"
			bar.style.height = ((std * 2) / (max-min)) * 100 + "%"
			bar.style.background = color

			const centre = this.db
				.div("MatcDashTaskPerfGramBoxPlotMean")
				.build(cntr)
			centre.style.bottom = (((mean-min) / (max-min))) *100 + "%"
		},
 
		getStepData(stepData, i) {
			const result = []
			for (let id in stepData) {
				const steps = stepData[id]
				if (steps[i] !== undefined) {
					result.push(steps[i])
				}
				
			}
			return result
		},

		selectFunnelPoint (id, e) {
			this.log.log(-1, "selectFunnelPoint", "enter > :", id);
			this.stopEvent(e)
			this.showSessionReplayHint(id)

			for (let session in this.lineSVGs) {
				const svg = this.lineSVGs[session]
				const color = session === id ? this.colors[1] : this.lineColor[session]

				if(svg){
					svg.attr("stroke", color )
				}
				if (this.linePoints[session]) {
					this.linePoints[session].forEach(div => {
						div.style.background = color
					})
				}
			
			}
		},

		clean_funnelDurartion (callback) {
			this.log.log(-1, "clean_funnelDurartion", "enter > :");

			css.remove(this.domNode, "MatcDashTaskPerfGramFunnel");
			
			if (this._stepDivs) {
				this._stepDivs.forEach(div => {
					div.parentNode.removeChild(div)
				})
				delete this._stepDivs
			}
			if (this.funnelSVG) {
				this.canvas.innerHTML = ""
				delete this.funnelSVG
			}
			this.xAxisLabelCntr.innerHTML = ""
			this.yMinLabel.innerHTML = ""
			if (callback) {
				callback()
			}
		},


		/*********************************************************************
		 * BoxPlot
		 *********************************************************************/


		render_details (df, task, annotations, tasks){
			this.log.log(-1, "render_duration", "enter > changeTask:");

			css.add(this.domNode, "MatcDashTaskPerfGramDetails");
			this.xLabel.innerHTML = ""; //this.getNLS("dash.perf.details.xLabel");
			this.yLabel.innerHTML = "";//this.getNLS("dash.perf.details.yLabel");
			this.yLabelEast.innerHTML = ""; //this.getNLS("dash.perf.details.yLabelEast");
			this.bottom25Label.innerHTML = this.getNLS("dash.perf.details.bottom25Label");
			this.bottom75Label.innerHTML = this.getNLS("dash.perf.details.bottom75Label");
			this.xMaxLabel.innerHTML = "";
			this.yMinLabel.innerHTML = ""
			this.minLabel.innerHTML = ""

			var analytics = new Analytics();
			var perf = analytics.getTaskPerformance(df, tasks);

			// loop to get the max
			var max_duration = 1;
			var max_count = 1;
			var selectCount = 0;
			for (let id in this.selectedTasks){
				if (this.selectedTasks[id]){
					let taskDF = perf.select("task", "==", id);
					max_duration = Math.max(max_duration, Math.ceil(taskDF.max("duration") * this.paddingFactor));
					max_count = Math.max(max_count, Math.ceil(taskDF.max("interactions") * this.paddingFactor));
					selectCount++;
				}
			}

			this.yMaxLabel.innerHTML = max_count;
			this.yMaxLabelEast.innerHTML = Math.ceil(max_duration / 1000) + " s";


			/**
			 * Now render selected tasks and remove not selected tasks
			 */
			var i=0;
			var w = 2;
			var slots = (selectCount * 2) -1;
			for (let id in this.selectedTasks){
				if (this.selectedTasks[id]){
					let taskDF = perf.select("task", "==", id);

					/**
					 * Create interactions box plot
					 */
					let max = Math.ceil(taskDF.max("interactions"));
					let min = Math.ceil(taskDF.min("interactions"));
					let mean = Math.ceil(taskDF.mean("interactions"));
					let std = Math.ceil(taskDF.std("interactions"));
					let left = (25 - ((w * slots)/2)) + (i * 2 * w) + "%";
					this.createBoxPlot(id , "i", i, left, w, max, min, mean, std, max_count, this.taskColors[id]);

					/**
					 * Create duration box plot
					 */
					max = Math.ceil(taskDF.max("duration"));
					min = Math.ceil(taskDF.min("duration"));
					mean = Math.ceil(taskDF.mean("duration"));
					std = Math.ceil(taskDF.std("duration"));
					left = (75 - ((w * slots)/2)) + (i * 2 * w) + "%";
					this.createBoxPlot(id , "d", i, left, w, max, min, mean, std, max_duration, this.taskColors[id]);

					i++;
				} else {
					/**
					 * Remove not needed box plots
					 */
					if (this._bars){
						if (this._bars[id + "i"]){
							let bar = this._bars[id + "i"];
							bar.parentNode.removeChild(bar);
							delete this._bars[id + "i"]
						}
						if (this._bars[id + "d"]){
							let bar = this._bars[id + "d"];
							bar.parentNode.removeChild(bar);
							delete this._bars[id + "d"]
						}
					}
				}
			}
		},

		createBoxPlot (id, prefix, i, left, width ,max, min, mean, std, total, color, widthUnit = '%'){

			if (!this._bars) {
				this._bars = {}
			}

			var height = (((max-min) / total) *100)+ "%";
			var ms = Math.min(i*60, 500);
			if (!this._bars[id + prefix]){
				/**
				 * Create new
				 */
				let cntr = this.db.div("MatcDashTaskPerfGramBoxPlotCntr").build(this.canvas);
				cntr.style.bottom = ((min / total) *100)+ "%"
				cntr.style.left = left;
				cntr.style.height = "0px";
				cntr.style.width = width + widthUnit

				this.db.div("MatcDashTaskPerfGramBoxPlotLine").build(cntr);

				var bar = this.db.div("MatcDashTaskPerfGramBoxPlot").build(cntr);
				bar.style.bottom = Math.max(0, ((((mean-std)-min) / (max-min)))) * 100 + "%";
				bar.style.height = ((std * 2) / (max-min)) * 100 + "%";
				bar.style.background = color

				var centre = this.db.div("MatcDashTaskPerfGramBoxPlotMean").build(cntr);
				centre.style.bottom = (((mean-min) / (max-min))) *100 + "%"

				setTimeout(lang.hitch(this, "animateBoxplot",  cntr, height), ms);
				this._bars[id + prefix] = cntr;

			} else {
				/**
				 * Update exiting ones
				 */
				let cntr = this._bars[id + prefix];
				cntr.style.left = left;
				setTimeout(lang.hitch(this, "animateBoxplot",  cntr, height), ms);
			}
		},

		animateBoxplot (bar, height){
			bar.style.height = height;
		},

		clean_details (callback){
			this.log.log(-1, "clean_duration", "enter");
			css.remove(this.domNode, "MatcDashTaskPerfGramDetails");
			this.setHint();

			if(this._bars){
				for (var id in this._bars){
					var b = this._bars[id];
					b.style.height = "0%";
					b.style.bottom = "0%";
				}
			}
			setTimeout(lang.hitch(this, "removeBoxplots"), 200);

			if (callback){
				setTimeout(callback, 200);
			}
		},


		removeBoxplots:function(){
			if(this._bars){
				for (var id in this._bars){
					var b = this._bars[id];
					this.canvas.removeChild(b)
				}
			}
			delete this._bars;
		},



		/*********************************************************************
		 * Scatter
		 *********************************************************************/

		render_scatter (df, task, annotations, tasks, changeTask){
			this.log.log(-1, "render_scatter", "enter > changeTask:" + changeTask);

			var db = new DomBuilder();

			/**
			 * reset some stuff
			 */
			delete this._selectedScatterPoint;


			this.setHint(db.span("", this.getNLS("dash.perf.hint.scatter")).build());
			css.add(this.domNode, "MatcDashTaskPerfGramScatter");
			this.xLabel.innerHTML = this.getNLS("dash.perf.scatter.xLabel");
			this.yLabel.innerHTML = this.getNLS("dash.perf.scatter.yLabel");
			this.minLabel.innerHTML = "0 s"
			this.yMinLabel.innerHTML = "0"

			var analytics = new Analytics();
			var perf = analytics.getTaskPerformance(df, tasks);

			// loop to get the max
			let max_duration = 1;
			let max_count = 1;
			let mean_duration = 0
			let mean_count = 0
			let maxDelay = 0;
			for (let id in this.selectedTasks){
				if (this.selectedTasks[id]){
					let taskDF = perf.select("task", "==", id);
					max_duration = Math.max(max_duration, Math.ceil(taskDF.max("duration") * this.paddingFactor));
					max_count = Math.max(max_count, Math.ceil(taskDF.max("interactions") * this.paddingFactor));
				}
			}

			this.xMaxLabel.innerHTML = Math.ceil(max_duration / 1000) + " s" ;
			this.yMaxLabel.innerHTML = Math.ceil(max_count);
			for (let id in this.selectedTasks){
				let taskDF = perf.select("task", "==", id);
				let sessions = taskDF.data;
				sessions.sort(function(a,b){
					return b.interactions - a.interactions;
				});

				if (this.selectedTasks[id]){
					mean_duration = taskDF.mean("duration");
					mean_count = taskDF.mean("interactions");
			
					for (let i=0; i< sessions.length; i++){
						let s = sessions[i];
						let key = s.session + " " + id;
						let ms = Math.min(i*10, 300);
						maxDelay = Math.max(maxDelay, ms)

						if (this._scatterPoints[key]){
							let p = this._scatterPoints[key];
							this.tempOwn(on(p, "click", lang.hitch(this, "selectPoint", p, s, i)));
							setTimeout(lang.hitch(this, "animateScatterPoint",p, s, max_duration, max_count), ms);
						} else {
							let p = db.span("MatxScatterPoint").build(this.canvas);
							p.style.bottom =  "-5%";
							p.style.left = (((s.duration / max_duration) * 100))+ "%";
							p.style.background = this.taskColors[id];
							this._scatterPoints[key] = p;
							this.tempOwn(on(p, "click", lang.hitch(this, "selectPoint", p, s, i)));
							
							setTimeout(lang.hitch(this, "animateScatterPoint",p, s, max_duration, max_count), ms);
						}
					}
				} else {
					// remove all not needed elements
					for (let i=0; i< sessions.length; i++){
						let s = sessions[i];
						let key = s.session + " " + id;
						if (this._scatterPoints[key]){
							let p = this._scatterPoints[key];
							p.style.opacity =0;
							setTimeout(lang.hitch(this, "fadeOutPoint", p), 300);
							delete this._scatterPoints[key]
						}
					}
				}
			}

			// save values for select events
			this.max_interactions = max_count;
			this.max_duration = max_duration;

			// FIXME: Should be per task...
			setTimeout(lang.hitch(this, "setMiddle",mean_count, max_count, mean_duration, max_duration),200);
		},

		fadeOutPoint (p){
			if (p.parentNode){
				p.parentNode.removeChild(p);
			}
		},

		clean_scatter (callback){
			this.log.log(-1, "clean_scatter", "enter");
			css.remove(this.domNode, "MatcDashTaskPerfGramScatter");
			this.setHint();
			if(this._scatterPoints){
				for (var sessionID in this._scatterPoints){
					var p = this._scatterPoints[sessionID];
					p.style.bottom = "-5%";
				}
			}
			setTimeout(lang.hitch(this, "removePoints"), 200);
			if (callback){
				setTimeout(callback, 200);
			}
			this.yMinLabel.innerHTML = ""
			this.minLabel.innerHTML = ""
		},

		removePoints (){
			if(this._scatterPoints){
				for (var sessionID in this._scatterPoints){
					var p = this._scatterPoints[sessionID];
					if (p.parentNode){
						p.parentNode.removeChild(p)
					}

				}
			}
			delete this._scatterPoints;
			this._scatterPoints = {};
		},

		selectPoint (p, s, i, e){
			this.stopEvent(e);
			this.setXMiddle(s.duration, this.max_duration);
			this.setYMiddle(s.interactions, this.max_interactions);
			css.add(this.cntr, "MatcDashTaskPerfGramCntrHover");
			this._selectedScatterPoint = p;
			this.showSessionReplayHint(s.session)
		},

		showSessionReplayHint(id) {
			if (this.model){
				let url = "#/apps/" + this.model.id + "/replay/" + id + ".html";
				if (this.mode == "public"){
					url = "#/examples/" + this.model.id + "/replay/" + id + ".html";
				}
				const hint = this.db.span("", this.getNLS("dash.perf.hint.session-msg")).build();
				const a = this.db.a("", this.getNLS("dash.perf.hint.session-play")).build(hint);
				a.href = url
				a.target = "_matcSessionReplay" + id
				this.setHint(hint);
			}
		},



		/*********************************************************************
		 * DropOff
		 *********************************************************************/

		render_dropoff (df, task, annotations){
			this.log.log(-1, "render_dropoff", "enter > " + task.flow.length);

			css.add(this.domNode, "MatcDashTaskPerfGramDropOff");
			this.xLabel.innerHTML = this.getNLS("dash.perf.dropoff.xLabel");
			this.xMaxLabel.innerHTML = "100%";
			this.minLabel.innerHTML = ""
			this._bars = {}
			this._barLabels = {}

			if (!this.funnel) {
				var analytics = new Analytics();
				this.funnel = analytics.getFunnelSummary(df, task, annotations);
			}

			// var height = Math.min(10, (100 / (this.funnel.length*2 - 1)));
			for(var i=0; i< this.funnel.length; i++){
				var summary = this.funnel[i];
				var v = summary.p;

				if(summary.event){
					var lbl = this.getNiceEventLabel(summary.event, i);
					var top = ((i-1) * 40 + 10) +"px"

					var bar = this.db.div("MatcDashTaskPerfGramBar").build(this.canvas);
					bar.style.top = top
					bar.style.left = "0px"
					bar.style.height = "20px";
					bar.style.width ="0%";
					bar.style.background = this.greenToRed(v)
					bar.innerHTML = Math.round(v * 100) + "%";

					var label = this.db.span("MatxAxisLabel MatcDashTaskPerfGramBarLabel MatcDashTaskPerfGramScatterHidden MatcDashTaskPerfGramBarLabelHidden", lbl).build(this.cntr);
					label.style.top = top;

					var ms = Math.min(i*60, 500);
					setTimeout(lang.hitch(this, "animateBar",  bar, label, Math.max(1, Math.min(99, v*100)) + "%"), ms);

					this._bars[i] = bar;
					this._barLabels[i] = label;
				}
			}

		},

		animateBar (bar, label, width){
			bar.style.width = width;
			css.remove(label, "MatcDashTaskPerfGramBarLabelHidden");
		},

		clean_dropoff (callback){
			this.log.log(-1, "clean_dropoff", "enter");
			css.remove(this.domNode, "MatcDashTaskPerfGramDropOff");
			if(this._barLabels){
				for (let id in this._barLabels){
					let b = this._barLabels[id];
					b.parentNode.removeChild(b);
				}
			}
			delete this._barLabels;
			if(this._bars){
				for (let id in this._bars){
					let b = this._bars[id];
					b.style.width = "0%";
				}
			}
			setTimeout(lang.hitch(this, "removeBars"), 200);
			this.setHint();
			if (callback){
				setTimeout(callback, 200);
			}
		},

		removeBars (){
			if(this._bars){
				for (var id in this._bars){
					var b = this._bars[id];
					this.canvas.removeChild(b)
				}
			}
			delete this._bars;
		},


		/*********************************************************************
		 * Helper
		 *********************************************************************/


		showSessionReplay (url, i, e){
			this.stopEvent(e);
			if (this.dialog){
				this.dialog.close();
			}
			location.href = url;
		},

		hoverPoint (p){
			if (this._selectedScatterPoint == p){
				css.add(this.cntr, "MatcDashTaskPerfGramCntrHover");
			}
		},

		setHint (hintNode){
			this.hintCntr.innerHTML = "";
			if(hintNode){
				this.hintCntr.appendChild(iconDOM('PlayVideo'))
				this.hintCntr.appendChild(hintNode);
			}
		},

		clearPoint (){
			//this.setMiddle(mean_count, max_count, mean_duration, max_duration);
			css.remove(this.cntr, "MatcDashTaskPerfGramCntrHover");
		},

		setMiddle (mean_count, max_count, mean_duration, max_duration){
			this.setXMiddle(mean_duration, max_duration);
			this.setYMiddle(mean_count, max_count);
			css.remove(this.cntr, "MatcDashTaskPerfGramCntrHover");
		},

		setYMiddle (count, max_count){
			this.yMiddleLabel.innerHTML = Math.ceil(count);
			this.yMiddleLabel.style.bottom = ((count / max_count) * 100)+ "%";
			this.yLine.style.bottom = ((count / max_count) * 100)+ "%";
		},

		setXMiddle (duration, max_duration){
			this.xMiddleLabel.innerHTML = Math.ceil(duration /1000) + " s" ;
			this.xMiddleLabel.style.left =(((duration / max_duration) * 100))+ "%";
			this.xLine.style.left =(((duration / max_duration) * 100))+ "%";
		},

		animateScatterPoint (p, s, max_duration, max_interactions){
			p.style.bottom = (((s.interactions / max_interactions) * 100))+ "%";
			p.style.left = (((s.duration / max_duration) * 100))+ "%";
		},

		getNiceEventLabel (event, i, includeScreenForWidgets=true){
			if (this.model){
				const screenName = this.getScreenName(event.screen, true)
				const widgetName = this.getWidgetName(event.widget, true)

				var row = [];
				if(event.widget){
					const screenLabel = includeScreenForWidgets ? ' @ ' + screenName : ''
					if(event.type =="WidgetGesture" && event.gesture){
						let gesture = event.gesture;
						row = [this.getGestureLabel(gesture.type),  widgetName];
					} else if(event.state && (event.type == "WidgetClick" || event.type == "WidgetChange")  ){

						return this.getEventStateLabel(event.state) + ` -  ` + widgetName +  screenLabel;
					} else {
						return this.getEventLabel(event.type) + ` -  ` + widgetName + screenLabel;
					}
				} else if(event.type =="ScreenGesture" && event.gesture){
					let gesture = event.gesture;
					row = ["Screen " + this.getGestureLabel(gesture.type), screenName];
				}else {
					row = [this.getEventLabel(event.type), screenName];
				}
				return row[0] + " - " +row[1]+ "";
			}
			return this.getNLS("dash.perf.dropoff.step") + i;
		}
    },
    mounted () {
    }
}
</script>