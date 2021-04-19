
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

								<span class="MatxAxisLabel bottom25Label MatcDashTaskPerfDetailsVisible" data-dojo-attach-point="bottom25Label"></span>
								<span class="MatxAxisLabel bottom75Label MatcDashTaskPerfDetailsVisible" data-dojo-attach-point="bottom75Label"></span>

								<div class="MatcDashTaskPerfTaskCntr" data-dojo-attach-point="taskCntr">
								</div>
							</div>

							<div class="MatcDashTaskPerHintBar" data-dojo-attach-point="hintCntr">
							</div>

						</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import on from 'dojo/on'
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import domGeom from 'dojo/domGeom'
import Logger from 'common/Logger'
import _Color from 'common/_Color'
import DomBuilder from 'common/DomBuilder'
import Util from 'core/Util'
import Analytics from 'dash/Analytics'
import Plan from 'page/Plan'

export default {
    name: 'TaskPerfGram',
    mixins:[_Color, Util, Plan, DojoWidget],
    data: function () {
        return {
            x_prefix: "",
            paddingFactor: 1.1,
            tab: "scatter",
            tabs: {},
            dialog: false,
            colors: ["#56A9FC", "#9933cc", "#669900", "#ff8a00", "#cc0000", "#000000", "#8ad5f0", "#d6adeb", "#c5e26d"],
            bins: 3
        }
    },
    components: {},
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
			this.addTab("dropoff", "");
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
			for(var i=0; i< tasks.length; i++){
				var task = tasks[i];
				if (task.flow.length >= 2) {
					this.selectedTasks[task.id] = false;
					this.taskColors[task.id] = this.colors[i % this.colors.length];

					var div = this.db.div().build(this.taskCntr);
					var circle = this.db.span("").build(div);

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
			for (var id in this.selectedTasks){
				var circle = this.taskCircles[id];
				var div = this.taskDivs[id];
				if (div){
					if (this.selectedTasks[id]){
						css.add(div, "MatcDashTaskPerfTaskSelected");
						circle.style.background = this.taskColors[id];
						circle.style.border = "";
					} else {
						css.remove(div, "MatcDashTaskPerfTaskSelected");
						circle.style.background = "";
						circle.style.border = "1px solid #777";
					}
				}
			}

		},

		render (changeTask){
			this.log.log(-1, "render", "enter > " + changeTask);
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

		renderTab:function(changeTask){
			if (this["render_" + this.tab]){
				this["render_" + this.tab](this.df, this.task, this.annotations, this.tasks, changeTask);
			} else {
				this.log.error("render", "No render for " + this.tab);
			}
		},





		/*********************************************************************
		 * details
		 *********************************************************************/


		render_details (df, task, annotations, tasks){
			this.log.log(-1, "render_duration", "enter > changeTask:");

			//this.removeBoxplots();

			css.add(this.domNode, "MatcDashTaskPerfGramDetails");
			this.xLabel.innerHTML = ""; //this.getNLS("dash.perf.details.xLabel");
			this.yLabel.innerHTML = "";//this.getNLS("dash.perf.details.yLabel");
			this.yLabelEast.innerHTML = ""; //this.getNLS("dash.perf.details.yLabelEast");
			this.bottom25Label.innerHTML = this.getNLS("dash.perf.details.bottom25Label");
			this.bottom75Label.innerHTML = this.getNLS("dash.perf.details.bottom75Label");

			this.xMaxLabel.innerHTML = "";


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
			this.yMaxLabelEast.innerHTML = Math.ceil(max_duration / 1000) + " sec";


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
					this.createBoxPlot(id , "i", i, left, w, max, min, mean, std, max_count);

					/**
					 * Create duration box plot
					 */
					max = Math.ceil(taskDF.max("duration"));
					min = Math.ceil(taskDF.min("duration"));
					mean = Math.ceil(taskDF.mean("duration"));
					std = Math.ceil(taskDF.std("duration"));
					left = (75 - ((w * slots)/2)) + (i * 2 * w) + "%";
					this.createBoxPlot(id , "d", i, left, w, max, min, mean, std, max_duration);

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

		createBoxPlot (id, prefix, i, left, width ,max, min, mean, std, total){

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
				cntr.style.width = width + "%";

				this.db.div("MatcDashTaskPerfGramBoxPlotLine").build(cntr);

				var bar = this.db.div("MatcDashTaskPerfGramBoxPlot").build(cntr);
				bar.style.bottom = Math.max(0, ((((mean-std)-min) / (max-min)))) * 100 + "%";
				bar.style.height = ((std * 2) / (max-min)) * 100 + "%";
				bar.style.background = this.taskColors[id];

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

		animateBoxplot:function(bar, height){
			bar.style.height = height;
		},

		clean_details:function(callback){
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


			this.setHint(db.span("MatcHint", this.getNLS("dash.perf.hint.scatter")).build());
			css.add(this.domNode, "MatcDashTaskPerfGramScatter");
			this.xLabel.innerHTML = this.getNLS("dash.perf.scatter.xLabel");
			this.yLabel.innerHTML = this.getNLS("dash.perf.scatter.yLabel");

			var analytics = new Analytics();
			var perf = analytics.getTaskPerformance(df, tasks);

			// loop to get the max
			var max_duration = 1;
			var max_count = 1;
			for (let id in this.selectedTasks){
				if (this.selectedTasks[id]){
					let taskDF = perf.select("task", "==", id);
					max_duration = Math.max(max_duration, Math.ceil(taskDF.max("duration") * this.paddingFactor));
					max_count = Math.max(max_count, Math.ceil(taskDF.max("interactions") * this.paddingFactor));
				}
			}

			this.xMaxLabel.innerHTML = Math.ceil(max_duration / 1000) + " sec" ;
			this.yMaxLabel.innerHTML = Math.ceil(max_count);
			for (let id in this.selectedTasks){
				let taskDF = perf.select("task", "==", id);
				let sessions = taskDF.data;
				sessions.sort(function(a,b){
					return b.interactions - a.interactions;
				});

				if (this.selectedTasks[id]){
					console.debug("renderScatter", id, sessions)
					var mean_duration = taskDF.mean("duration");
					var mean_count = taskDF.mean("interactions");
					var maxDelay = 0;
					for (let i=0; i< sessions.length; i++){
						let s = sessions[i];
						let key = s.session + " " + id;
						let ms = Math.min(i*10, 300);
						maxDelay = Math.max(maxDelay, ms)

						if (this._scatterPoints[key]){
							let p = this._scatterPoints[key];
							setTimeout(lang.hitch(this, "animateScatterPoint",p, s, max_duration, max_count), ms);
						} else {
							let p = db.span("MatxScatterPoint").build(this.canvas);
							p.style.bottom =  "-5%";
							p.style.left = (((s.duration / max_duration) * 100))+ "%";
							p.style.background = this.taskColors[id];
							this._scatterPoints[key] = p;
							this.tempOwn(on(p, "mousedown", lang.hitch(this, "selectPoint", p, s, i)));
							this.tempOwn(on(p, "mouseover", lang.hitch(this, "hoverPoint", p)));
							this.tempOwn(on(p, "mouseout", lang.hitch(this, "clearPoint")));
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

			if (this.model){
				var url = "#/apps/" + this.model.id + "/replay/" + s.session + ".html";
				if (this.mode == "public"){
					url = "#/examples/" + this.model.id + "/replay/" + s.session + ".html";
				}
				var hint = this.db.span("MatcHint", this.getNLS("dash.perf.hint.session-msg")).build();
				var a = this.db.a("", this.getNLS("dash.perf.hint.session-play")).build(hint);
				this.own(on(a, "click", lang.hitch(this, "showSessionReplay", url, i)));
			}

			//this.render_user_journey(s, max_duration, max_count);
			this.setHint(hint);
		},

		render_user_journey (s, max_duration, max_count){
			var pos = domGeom.position(this.cntr);
			var w = pos.w;
			var h = pos.h;
			var canvas= document.createElement("canvas");
			canvas.width=w;
			canvas.height=h;
			var ctx = canvas.getContext("2d");
			this._render_line(w,h, s, ctx, max_duration, max_count)
			this.cntr.style.backgroundImage = "url(" + canvas.toDataURL("image/png")  + ")";
		},

		_render_line(w,h, s, ctx, max_duration, max_count){
			var n = 0.5;
			var events = this.df.select("session", "==", s.session);
			var min = events.min("time");

			ctx.beginPath();
			ctx.moveTo(0, h);

			var data = events.data;
			for (var i =0; i < data.length && i < max_count; i++){
				var e = data[i];
				var time = e.time - min;
				if (time <= (s.duration + 100)){
					var y = Math.round((i / max_count) * h) + n;
					var x = Math.round((time / max_duration) * w) +n ;
					ctx.lineTo(x, h - y);
				}
			}
			ctx.strokeStyle= "#ccc";
			ctx.lineWidth=1;
			ctx.stroke();
		},


		/*********************************************************************
		 * DropOff
		 *********************************************************************/

		render_dropoff (df, task, annotations){
			this.log.log(-1, "render_dropoff", "enter > " + task.flow.length);

			css.add(this.domNode, "MatcDashTaskPerfGramDropOff");
			this.xLabel.innerHTML = this.getNLS("dash.perf.dropoff.xLabel");
			this.xMaxLabel.innerHTML = "100%";
			this._bars = {}
			this._barLabels = {}

			if (!this.funnel) {
				var analytics = new Analytics();
				this.funnel = analytics.getFunnelSummary(df, task, annotations);
			}

			console.debug(this.funnel)

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
			this.xMiddleLabel.innerHTML = Math.ceil(duration /1000) + " sec" ;
			this.xMiddleLabel.style.left =(((duration / max_duration) * 100))+ "%";
			this.xLine.style.left =(((duration / max_duration) * 100))+ "%";
		},

		animateScatterPoint (p, s, max_duration, max_interactions){
			p.style.bottom = (((s.interactions / max_interactions) * 100))+ "%";
			p.style.left = (((s.duration / max_duration) * 100))+ "%";
		},

		getNiceEventLabel (event, i){
			if (this.model){
				var row = [];
				if(event.widget){
					if(event.type =="WidgetGesture" && event.gesture){
						let gesture = event.gesture;
						row = [this.getGestureLabel(gesture.type),  this.getWidgetName(event.widget)];
					} else if(event.state && (event.type == "WidgetClick" || event.type == "WidgetChange")  ){
						return this.getEventStateLabel(event.state) + ` -  ` + this.getWidgetName(event.widget) + ' @ ' + this.getScreenName(event.screen);
					} else {
						return this.getEventLabel(event.type) + ` -  ` + this.getWidgetName(event.widget) + ' @ ' + this.getScreenName(event.screen);
					}
				} else if(event.type =="ScreenGesture" && event.gesture){
					let gesture = event.gesture;
					row = ["Screen " + this.getGestureLabel(gesture.type), this.getScreenName(event.screen)];
				}else {
					row = [this.getEventLabel(event.type), this.getScreenName(event.screen)];
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