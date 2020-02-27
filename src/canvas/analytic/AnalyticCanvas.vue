
<template>
	<div class="MatcCanvas MatcAnalyticCanvas">
		<div class="MatcCanvasFrame" data-dojo-attach-point="frame">
			<div class="MatcCanvasContainer MatcCanvasZoomable " data-dojo-attach-point="container">
				<div data-dojo-attach-point="screenContainer" class="MatcCanvasLayer"></div>
				<div data-dojo-attach-point="widgetContainer" class="MatcCanvasLayer"></div>
			</div>
		</div>
		<div class="MatcCanvasScrollBar MatcCanvasScrollBarRight" data-dojo-attach-point="scrollRight">
			<div class="MatcCanvasScrollBarCntr MatcCanvasScrollBarCntrRight" data-dojo-attach-point="scrollRightCntr">
				<div class="MatchCanvasScrollHandle" data-dojo-attach-point="scrollRightHandler"></div>
			</div>
		</div>
		<div class="MatcCanvasScrollBar MatcCanvasScrollBarBottom" data-dojo-attach-point="scrollBottom">
			<div class="MatcCanvasScrollBarCntr MatcCanvasScrollBarCntrBottom" data-dojo-attach-point="scrollBottomCntr">
				<div class="MatchCanvasScrollHandle" data-dojo-attach-point="scrollBottomHandler"></div>
			</div>
		</div>
		<!--
		<div class="MatcStatus" data-dojo-attach-point="status">    		    				
			<div class="MatcStatusItem">
				<span class="MatcStatusButtom glyphicon glyphicon-minus" data-dojo-attach-point="zoomMinus">			
				</span>
				<span class="MatcStatusItemLabel" data-dojo-attach-point="zoomLabel">			
				</span>
				<span class="MatcStatusButtom glyphicon glyphicon-plus" data-dojo-attach-point="zoomPlus">			
				</span>
			</div>    	    					
			<div class="MatcStatusItem MatcStatusItemXXL" data-dojo-attach-point="commentCntr"></div>    							
			<div class="MatcStatusItem MatcStatusItemXXL" data-dojo-attach-point="lineCntr"></div>    							
			<div class="MatcStatusItem MatcStatusItemXXL" data-dojo-attach-point="bwCntr"></div>
		</div>
		-->
		
		<div class="MatcMessage" data-dojo-attach-point="message">			
		</div>
	</div>

</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'

import Logger from 'common/Logger'
import on from 'dojo/on'
import touch from 'dojo/touch'
import lang from 'dojo/_base/lang'

import win from 'dojo/_base/win'
import topic from 'dojo/topic'

import DomBuilder from 'common/DomBuilder'
import DataFrame from 'common/DataFrame'
import _DragNDrop from 'common/_DragNDrop'

import Heat from 'dash/Heat'
import Render from 'canvas/Render'
import Lines from 'canvas/Lines'
import DnD from 'canvas/DnD'
import Add from 'canvas/Add'
import Select from 'canvas/Select'
import Distribute from 'canvas/Distribute'
import Tools from 'canvas/Tools'
import Zoom from 'canvas/Zoom'
import Util from 'core/Util'
import InlineEdit from 'canvas/InlineEdit'
import Scroll from 'canvas/Scroll'
import Upload from 'canvas/Upload'
import Comment from 'canvas/Comment'
import Analytics from 'dash/Analytics'

export default {
    name: 'AnalyticCanvas',
    mixins:[DojoWidget, _DragNDrop, Util, Render, Lines, DnD, Add, Select, Distribute, Tools, Zoom, InlineEdit, Scroll, Upload, Comment, Heat],
    data: function () {
        return {
            mode: "view", 
            zoom: 0.4, 
            zoomLevelPos: 3, 
            analyticMode: "HeatmapClick", 
            resizeEnabled: false, 
            renderDND: false, 
            dragNDropMinTimeSpan: 0, 
            wireInheritedWidgets: true, 
			taskLineOpacity: 1,
			isBlackAndWhite: false
        }
    },
    components: {},
    methods: {
        	
	postCreate(){
		this.logger = new Logger("AnalyticCanvas");
		this.logger.log(2,"constructor", "entry");	
		this.cache = {};
		this.moveMode ="classic";

		this.logger.log(2,"postCreate", "entry");
		this.initSize()

		/**
		 * init container size and position
		 */
		this.canvasPos = {
			x : this.canvasStartX, 
			y: this.canvasStartY, 
			w: this.canvasFlowWidth, 
			h : this.canvasFlowHeight
		};	
		this.setContainerSize();
		this.setContainerPos();
		
		
		/**
		 * Init remaining sub components
		 */
		this.initRender();
		this.initZoom();
		this.initScrollBars();
		this.initComment();
		this.initSettings();
	
		this.db = new DomBuilder();

		/**
		 * Init Listeners
		 */
		this.own(topic.subscribe("matc/toolbar/click", lang.hitch(this,"onToolbarClick")));
		this.own(on(win.body(), "keydown", lang.hitch(this,"onKeyPress")));
		this.own(on(win.body(), "keyup", lang.hitch(this,"onKeyUp")));

		
		this.logger.log(2,"postCreate", "exit!!!");
	},
	
	setPublic(isPublic){
		this.isPublic = isPublic;
	},

	setModelService (s) {
		this.modelService = s
	},

	setCommentService (s) {
		this.commentService = s
	},			

	setToolbar (t) {
		this.toolbar = t
		this.onChangeCanvasViewConfig()
	},	
	
	inlineEditInit (){
		this.logger.log(2,"inlineEditInit", "enter");		
	},
	
	setMouseData (data){
		this.logger.log(0,"setMouseData", "enter > " + data.length);
		// this.mouseData = this.computeMouseDistribution(data, this.model);
		this.mouseData = data
		if(data.length ==0){
			this.showError("No Mouse data was recorded");
		}
	},
	
	setBW (isBW){
		this.logger.log(-1,"setBW", "enter > " + isBW);	
		if (isBW){
			css.add(this.container, "MatcCanvasBW");
		} else {
			css.remove(this.container, "MatcCanvasBW");
		}
	},
	
	onChangeCanvasViewConfig () {
		if (this.toolbar) {
			this.toolbar.setCanvasViewConfig({
				zoom: this.zoom,
				renderLines: this.renderLines,
				showComments:  this.showComments,
				isBlackAndWhite: this.isBlackAndWhite
			})
		}
	},

	setCanvasViewConfig (key, value) {
		this.logger.log(-1, "setCanvasViewConfig", "enter > " + key, value);
		if (key === 'zoom') {
			this.setZoomFactor(value)
		}

		if (key === 'renderLines') {
			this.setViewLines(value)
		}

		if (key === 'showComments') {
			this.setCommentView(value)
		}

		if (key === 'isBlackAndWhite') {
			this.isBlackAndWhite = value
			this.setBW(value)
		}
	},

	/**********************************************************************
	 * DnD.js overwrites 
	 **********************************************************************/

	
	initSettings (){
		this.logger.log(1,"initSettings", "enter > " );
		/**
		 * default settings
		 */
		this.settings = {
			canvasTheme : "MatcDark",
			lineColor : "#333",
			lineWidth : 1,
			storePropView : true,
			moveMode : "ps",
			mouseWheelMode : "scroll"
		};
	
		
		var s = this._getStatus("matcSettings");
		if(s){
			if(s.canvasTheme){
				this.settings.canvasTheme = s.canvasTheme;
			}
			if(s.lineColor){
				this.settings.lineColor = s.lineColor;
			}
			if(s.lineWidth){
				this.settings.lineWidth = s.lineWidth;
			}
		} else {
			this.logger.log(2,"initSettings", "exit>  no saved settings" );
		}
		
		
		this.applySettings(this.settings);
	},
	
	getSettings(){
		return this.settings;
	},
	
	setSettings (s){
	
		/**
		 * Mixin values
		 */
		if(s.canvasTheme){
			this.settings.canvasTheme = s.canvasTheme;
		}
		if(s.lineColor){
			this.settings.lineColor = s.lineColor;
		}
		if(s.lineWidth){
			this.settings.lineWidth = s.lineWidth;
		}
		if(s.storePropView!=null){
			this.settings.storePropView = s.storePropView;
		}
		
		if(s.mouseWheelMode!=null){
			this.settings.mouseWheelMode = s.mouseWheelMode;
		}
		
		this._setStatus("matcSettings",this.settings );
		
		this.applySettings(this.settings);
		this.rerender();
	},
	
	
	applySettings(s){
		
		this.logger.log(2,"applySettings", "enter > "  + s.canvasTheme + " &> " + s.moveMode);
		
		
		if(s.lineColor){
			this.defaultLineColor = s.lineColor;
		}
		if(s.lineWidth){
			this.defaultLineWidth = s.lineWidth;
		}
		if(s.canvasTheme){
			if(this._lastCanvasTheme){
				css.remove(win.body(), this._lastCanvasTheme);
			}
			css.add(win.body(), s.canvasTheme)
			this._lastCanvasTheme = s.canvasTheme;
			
			/**
			 * FIXME: Kind of hack
			 */
			if(s.canvasTheme=="MatcLight"){
				this.defaultLineColor = "#777";
			} else {
				this.defaultLineColor = "#333";
			}
		
		}
		
		if(s.mouseWheelMode){
			this._mouseWheelMode = s.mouseWheelMode;
		}
		
		this.settings = s;
		
	},

	
	
	/**********************************************************************
	 * DnD.js overwrites 
	 **********************************************************************/

	
	onWidgetDndClick(id, div, pos ,e ){
		this.logger.log(2,"onWidgetDndClick", "enter > " + id);
		this.stopEvent(e);
		this.onWidgetSelected(id);
		this.selectAnalyticDiv(id);
		this.setState(0);
	},
	
	
	onScreenDndClick(id, div, pos,e){
		this.logger.log(2,"onScreenDndClick", "entry > " + id);
		this.stopEvent(e);
		this.onScreenSelected(id);
		this.selectAnalyticDiv(id);
		this.setState(0);
	},
	
	onCanvasSelected(){
		this.logger.log(2,"onCanvasSelected", "entry > ");
		this.selectAnalyticDiv(null);
		if (this.toolbar) {
			this.toolbar.unselect();
			if (this.analyticMode === 'HeatmapClick') {
				this.toolbar.reShowClickHeatMap()
			}
		}
	},
	
	selectAnalyticDiv(id){
		if(this._analyticLastSelectedDiv){
			css.remove(this._analyticLastSelectedDiv, "MatcHeapMapWidgetSelected");
			delete this._analyticLastSelectedDiv;
		}
		if(this.analyticsDivs){
			var div = this.analyticsDivs[id];
			if(div){
				css.add(div, "MatcHeapMapWidgetSelected");
			}
			this._analyticLastSelectedDiv = div;
		}	
	},
	

	/**********************************************************************
	 * Rendering
	 **********************************************************************/

	renderLayerList (){
		this.logger.log(-1,"renderLayerList", "entry > ");
	},

	afterRender (){
		this.logger.log(2,"afterRender", "entry > " + this.analyticMode);
		
		this.cleanUpAnalytics();
		
		try{
			this._renderHeatMap();
		} catch(e){
			this.logger.error("afterRender", "Could not render heatmaps ", e);
			this.logger.sendError(e);
		}
		
	},
	
	wireEvents(){
		this.logger.log(2,"wireEvents", "enter");					
		this.registerDragOnDrop(this.container, "container", "onCanvasDnDStart", "onCanvasDnDMove", "onCanvasDnDEnd", "onCanvasDnClick");		 
		for(var id in this.model.screens){
			var dndDiv = this.screenDivs[id];
			var screen = this.model.screens[id];
			this.tempOwn(on(dndDiv, touch.press, lang.hitch(this, "onScreenDndClick", screen.id, dndDiv, null)));	
		}
		this.logger.log(4,"wireEvents", "exit");
	},
	

	hasSelect(){
		return this.mode!= "addComment";
	},
	
	_renderHeatMap(){
		this.logPageView("/analytics/workspace/" + this.analyticMode + ".html")
		
		this.setBW(this.isBlackAndWhite);
		
		
		/**
		 * Init everything so the _Heat.js code works correctly
		 */
		this.cleanUpHeat();
		
		/**
		 * FIXME: Make this customisable
		 */
		if(this.model.type == "smartphone" || this.model.type == "tablet"){
			this.defaultRadius = this.model.screenSize.w / 20;
			this.defaultBlur = this.model.screenSize.w / 15;
		} else {			
			this.defaultRadius = this.model.screenSize.w / 120;
			this.defaultBlur = this.model.screenSize.w / 100;
		}
		this.logger.log(0,"onScreenRendered","adjust radios to " +this.defaultRadius);
		
		

		var screenGrouping = this.df.groupBy("screen");
		
		this.heatmapDivs = {};
		for(var id in this.model.screens){
			var screen = this.model.screens[id];
	
			var screenDF = screenGrouping.get(id);
			var screenEvents = [];
			if(screenDF){	
				screenEvents = screenDF.as_array();
			} 
		     
		    if(this["_render_" + this.analyticMode]){
		    	/**
				 * create canvas
				 */
		    	var div = this.createBox(screen);
		    	css.add(div, "MatcHeatMapScreen")
				var cntr = this.db.div("MatcHeapMapContainer").build(div)
				
			   	var canvas = this.db.canvas(screen.w, screen.h).build(cntr);
			    var ctx = canvas.getContext('2d');
			    
				this["_render_" + this.analyticMode](screenEvents, screen, ctx, div);
				
				if(this.hasSelect()){
					this.tempOwn(on(div, touch.press, lang.hitch(this, "onScreenDndClick", screen.id, div, null)));
				}

				
				this.widgetContainer.appendChild(div);
				
				this.heatmapDivs[screen.id] = div;
				this.analyticsDivs[screen.id] = div;
			} 
		    
			
		}
		
	
		/**
		 * now draw a div for every widgert so we can also select them. 
		 * A little hack but I dunno have a better way... 
		 */
		if("UserJourney"!=this.analyticMode && "Gesture" !=this.analyticMode){
			
			var widgets = this.getOrderedWidgets(this.model.widgets);
			for(var i=0; i< widgets.length; i++){
				var widget = widgets[i];
				if(widget){
					let div = this.createBox(widget);
					css.add(div, "MatcHeapMapWidget MatcWidget");
					this.widgetContainer.appendChild(div);				
					if(this.hasSelect()){
						this.tempOwn(on(div, touch.press, lang.hitch(this, "onWidgetDndClick", widget.id, div, null)));
					}
					this.analyticsDivs[widget.id] = div;
				}
			
			}
		}
		
		
		if(this["_render_global_" + this.analyticMode]){
			this["_render_global_" + this.analyticMode](screenEvents, screen, ctx, div);
		} 
	},
	
	_render_HeatmapMouse(screenEvents, screen, ctx){
		this.logger.log(0,"_render_HeatmapMouse", "entry > " +screen.name);
		/**
		 * FIXME: we could make this fastter by caching some stuff, 
		 * or at least soft the events by screen
		 */
		let mouseData = this.mouseData.filter(m => m.screen === screen.id)
		let data = this.computeMouseDistribution(mouseData, this.model);
		if (data[screen.id]) {
			let d = data[screen.id]
			this.draw(ctx, d.values, d.max, screen.w, screen.h);
		}
	},
	
	
	
	_render_HeatmapClick(screenEvents, screen, ctx, div){
		this.logger.log(2,"_render_HeatmapClick", "entry > ");
		
		var numberOfClicks = -1;
		if(this.analyticParams){
			numberOfClicks = this.analyticParams.numberOfClicks;
		}
		
		if(numberOfClicks > 0){
			var firstNEvents = this.getFirstNClicksData(numberOfClicks);				
			this._render_pixel_screen_heatmap(firstNEvents, screen, ctx, div);
		} else {
			/**
			 * Ignore Hover events...
			 */
			var filtered = this.getClickEvents(new DataFrame(this.events));
			var actionEvents = filtered.as_array();		
			this._render_pixel_screen_heatmap(actionEvents, screen, ctx, div);
		}
	},
	
	_render_pixel_screen_heatmap(actionEvents, screen, ctx){
		/**
		 * get only the events for this screen..
		 * 
		 * FIXME: could be done in one loop before rendering...
		 */
		
		var events = [];
		
		for(var i=0; i < actionEvents.length; i++){
			var e = actionEvents[i];
			var screenID = this.getEventScreenId(e);
			if(screenID == screen.id){
				events.push(e);
			}
		}		
		
	    var dist = this.computeClickDistribution(events, screen.w, screen.h);
		this.draw(ctx, dist.values, dist.max, screen.w, screen.h);
	},
	
	
	_render_HeatmapScrollView(screenEvents, screen, ctx){
		this.logger.log(2,"_render_HeatmapScrollView", "entry > ");
			
		var dist = this.computeScrollVisibiltyDistribution(screenEvents, this.model.screenSize.h, screen.h);
		this.drawSections(dist,ctx,screen.h, screen.w);

	},
	
	_render_HeatmapScrollTime(screenEvents, screen, ctx){
		this.logger.log(2,"_render_HeatmapScrollTime", "entry > ");
		
		var dist = this.computeScrollDurationDistrubtion(screenEvents, this.model.screenSize.h, screen.h);	
		this.drawSections(dist,ctx,screen.h, screen.w);

	},
	
	
	
	_render_HeatmapViews(screenEvents, screen, ctx){
		this.logger.log(2,"HeatmapViews", "entry > ");
		
		if(screen.style.overlay){
			let screenViews = this.getOverlayViews();
			let count =screenViews.counts[screen.id];
			if(!count){
				count = 0;
			} 
			
			ctx.globalAlpha = 0.4;
			let color = this.mixColor(count/ screenViews.total);	
			ctx.fillStyle = color;
			ctx.fillRect(0,0,screen.w,screen.h);
		} else {
			let screenViews = this.getScreenViews();
			let count =screenViews.counts[screen.id];
			if(!count){
				count = 0;
			} 
			
			ctx.globalAlpha = 0.4;
			let color = this.mixColor(count/ screenViews.total);	
			ctx.fillStyle = color;
			ctx.fillRect(0,0,screen.w,screen.h);
		}
	},
	
	_render_HeatmapDwelTime(screenEvents, screen, ctx){
		this.logger.log(2,"HeatmapDwelTime", "entry > ");
		
		if(screen.style.overlay){
			let times = this.getOverlayDwellTime();	
			let time =times.times[screen.id];
			if(!time){
				time = 0;
			} 			
			ctx.globalAlpha = 0.4;
			let color = this.mixColor(time/ times.total);	
			ctx.fillStyle = color;
			ctx.fillRect(0,0,screen.w,screen.h);
		} else {
			let times = this.getScreenDwellTime();			
			let time =times.times[screen.id];
			if(!time){
				time = 0;
			} 			
			ctx.globalAlpha = 0.4;
			let color = this.mixColor(time/ times.total);	
			ctx.fillStyle = color;
			ctx.fillRect(0,0,screen.w,screen.h);
		}
		
	
	},
	
	_render_global_UserJourney(screenEvents, screen, ctx, div){
		this.logger.log(-1,"_render_global_UserJourney", "entry > ");
		this.setBW(true);
		if (!this.analyticParams.tree){
			this._renderUserSingleLines(screenEvents, screen, ctx, div);
		} else {
			this._renderUserTree(screenEvents, screen, ctx, div);
		}
		
	},
	
	_renderUserTree(){
		
		var sessions = this.getUserJourney();
		var taskPerformance = this.getTaskPerformance();
		var db = new DomBuilder();
		var task = null
		if (this.analyticParams.task!== false && this.analyticParams.task >=0 ) {
			task = this.testSettings.tasks[this.analyticParams.task];
		}
		
		var selectedSessions = this.analyticParams.sessions;
		var graph = {};
		var taskGraph = {};
		var maxCount = 0;
		for(var sessionID in selectedSessions){
			if(selectedSessions[sessionID] === true){
				var session = sessions[sessionID];
				var matches = taskPerformance[sessionID];
				if(session){
					this._getSessionGraph(session,db, task,matches, graph, taskGraph);
					maxCount++;
				} else {
					console.debug("_renderUserTree() > No session for ",sessionID );
				}
			}
		}
		
		/**
		 * This does not work as we put single lines with only to segments...
		 */   
//	    this.lineFunction = d3.svg.line()
//	        .x(function(d) { return d.x-.5; })
//	        .y(function(d) { return d.y-.5; })
//	        .interpolate("linear"); // basis

	
		var divs = {};
		for (var id in graph){
			var l = graph[id];
		
			var line = [];
			line.push({
				x: l.from.x, 
				y : l.from.y, 
				d:"right"
			});
			line.push({
				x: l.to.x, 
				y : l.to.y, 
				d:"right"
			});
			var width = Math.min(Math.max(1, l.count * 0.8),15) * this.zoom;
			var color = this.mixColor(Math.min(1, l.count / maxCount));
			var toID = l.to.x + "," + l.to.y;
			if (!divs[toID]) {
				divs[toID] = this._renderTreeEvent(l.to.x, l.to.y, width, color, db)
			}
			var fromID = l.from.x + "," + l.from.y;
			if (!divs[fromID]) {
				divs[fromID] = this._renderTreeEvent(l.from.x, l.from.y, width, color, db)
			}
			
			this.drawSVGLineWidthArrow(id, line, color, width, this.taskLineOpacity);
		}
	},
	
	_renderTreeEvent(x,y, width, color, db){
		var cntr = db.div("MatcAnalyticCanvasEventCntr").build(this.widgetContainer)
		cntr.style.left = Math.round(x) +"px";
		cntr.style.top = Math.round(y) +"px";
	
		var div = db.div("MatcAnalyticCanvasEvent MatcAnalyticCanvasEvent" ).build(cntr);
	
		var r = Math.round(width * 2);
		div.style.width =  r +"px";
		div.style.height = r +"px";
		div.style.top =  -1* Math.round(r/2) +"px";
		div.style.left = -1* Math.round(r/2) +"px";
		div.style.background = color;
	},
	
	_renderUserSingleLines(){
			    
		var sessions = this.getUserJourney();
		var taskPerformance = this.getTaskPerformance();
		var db = new DomBuilder();
	
		var task = null
		if (this.analyticParams.task!== false && this.analyticParams.task >=0 ) {
			task = this.testSettings.tasks[this.analyticParams.task];
		}
		
		var selectedSessions = this.analyticParams.sessions;
		for(var sessionID in selectedSessions){
			if(selectedSessions[sessionID] === true){
				var session = sessions[sessionID];
				var matches = taskPerformance[sessionID];
				if(session){
					this._renderUserGraph(session,db, task,matches);
				} else {
					console.debug("_render_global_UserJourney() > No session for ",sessionID );
				}
			}
		}
	},
	
	_renderUserGraph(session, db, task, matches){	
		var sessionEvents = session.data;
		var line = [];
		var lastEventDiv = null;
		var divs = [];
		var match = null;
		var matchLines = [];
		var matchDiv = [];
		if (task && matches) {
			match = matches[task.id];
		}
		for(let i=0; i< sessionEvents.length; i++){
			var e = sessionEvents[i];
			/**
			 * Be aware of the overlay...
			 */
			var screenID = this.getEventScreenId(e);
			var screen = this.model.screens[screenID];
			if(screen){
				if(e.type =="SessionStart"){
					let x = screen.x - Math.max(10, Math.round(30 * this.zoom));
					let y = screen.y + Math.max(10, Math.round(30 * this.zoom));
					lastEventDiv = this._renderScreenEvent(x, y, e.type,"S", db, e.session)	
					line.push({x:x, y:y, d:"right"});
				} else if(e.x >=0 && e.y >=0 && !e.noheat) {
					let x = e.x * screen.w + screen.x;
					let y = e.y * screen.h + screen.y;
					lastEventDiv = this._renderScreenEvent(x, y, e.type, "", db, e.session)
					line.push({x:x, y:y, d:"right"});
					divs.push(lastEventDiv);
				} 
				if (match && match.startPosition <= i && match.endPosition >=i){
					var temp = line[line.length -1]
					matchLines.push(temp);
					matchDiv.push(lastEventDiv);
				} 
				
			} else {
				console.warn("_renderUserGraph()", "Screen is not there", e.screen);
			}
				
		}

		if(lastEventDiv){
			css.add(lastEventDiv, "MatcAnalyticCanvasEventSessionEnd");
		}
		
		
		if(this.analyticParams.color){
			for(let i=0; i < divs.length-1; i++){
				divs[i].style.background = this.analyticParams.color;
			}
		}
		
		/**
		 * Render successful task on top
		 */
		if (task){
			this.drawSVGLineWidthArrow(session.session, line, this.analyticParams.color, 1, this.taskLineOpacity)
			this.drawSVGLineWidthArrow(session.session, matchLines, this.analyticParams.taskColor, 2, this.taskLineOpacity)
			for(let i=0; i < matchDiv.length; i++){
				matchDiv[i].style.background = this.analyticParams.taskColor;
			}
		} else {
			this.drawSVGLineWidthArrow(session.session, line, this.analyticParams.color, 1, this.taskLineOpacity)		
		}
	
		
		return false;
	},
	
	_renderScreenEvent(x,y, type, label,  db, screenID){
		var cntr = db.div("MatcAnalyticCanvasEventCntr").build(this.widgetContainer)
		cntr.style.left = Math.round(x) +"px";
		cntr.style.top = Math.round(y) +"px";
	
		var div = db.div("MatcAnalyticCanvasEvent MatcAnalyticCanvasEvent" + type).build(cntr);
		var r = Math.max(5, Math.round(15 * this.zoom));
		div.style.width =  r +"px";
		div.style.height = r +"px";
		div.style.top =  -1* Math.round(r/2) +"px";
		div.style.left = -1* Math.round(r/2) +"px";
		
	
		this.tempOwn(on(div, "click", lang.hitch(this, "onScreenEventClick", screenID)))
		
		return div;
		
	},
	
	onScreenEventClick(id, e){
		this.stopEvent(e);
		if (this.toolbar){
			this.toolbar.setSelectSessions([id]);
		}
	},
	
	
	_getSessionGraph(session, db, task, matches,  graph){	
		var sessionEvents = session.data;
		
		// var matchDiv = [];
		// if (task && matches) {
		//	match = matches[task.id];
		//}
		var from;
		for(var i=0; i< sessionEvents.length; i++){
			var e = sessionEvents[i];
			/**
			 * Be aware of the overlay...
			 */
			var screenID = this.getEventScreenId(e);
			var screen = this.model.screens[screenID];
			if(screen){
				var to = {};
				if(e.type =="SessionStart"){
					
					to.x = screen.x - Math.max(10, Math.round(30 * this.zoom));
					to.y = screen.y + Math.max(10, Math.round(30 * this.zoom));
					from = this._addToGraph(from, to, graph);
				} else if(e.x >=0 && e.y >=0 && !e.noheat) {
					
					if (e.widget && this.model.widgets[e.widget]){
						var widget = this.model.widgets[e.widget];
						to.x = Math.round(widget.x + widget.w/2);
						to.y = Math.round(widget.y + widget.h/2);
						from = this._addToGraph(from, to, graph);
					} else {
						to.x = Math.round(Math.min(1, e.x) * screen.w + screen.x);
						to.y = Math.round(Math.min(1, e.y) * screen.h + screen.y);
						from = this._addToGraph(from, to, graph);
				
					}
				}
			} else {
				console.warn("_renderUserGraph()", "Screen is not there", e.screen);
			}
		}
	},
	
	_addToGraph(from, to, graph) {
		if (from){
			var id = from.x + ";" +from.y + "-" + to.x +";"+to.y;
			if (!graph[id]){
				graph[id] = {
					from: from,
					to : to,
					count:0 
				};
			}
			graph[id].count++;
			return to;
		}
		return to;
	},
	
	
	/**********************************************************************
	 * Gesture
	 **********************************************************************/

	
	_render_global_Gesture(){
		this.logger.log(0,"_render_global_Gesture", "entry > ");
		
		var gestures = this.getGestures();
		var db = new DomBuilder();
		
		
		for(var i=0; i< gestures.length; i++){
			var e = gestures[i];
			var gesture = e.gesture;
		
			
			var screenID = this.getEventScreenId(e);
			var screen = this.model.screens[screenID];
			if(screen && gesture){
				var line = [];
			
				var start = e.gesture.start;
				var end = e.gesture.end;
				if(start && end) {
					var x = start.x * screen.w + screen.x;
					var y = start.y * screen.h + screen.y;
					line.push({x:x, y:y, d:"right"});	
					
					this._renderGestureStart(x, y, this.analyticParams.color, db);
					
					x = end.x * screen.w + screen.x;
					y = end.y * screen.h + screen.y;
					line.push({x:x, y:y, d:"right"});
					
					var r = Math.max(1, Math.round(3 * this.zoom));
					this.drawSVGLine("", line, this.analyticParams.color, r, 1)
				} 
			} else {
				console.warn("_render_global_Gesture()", "Screen is not there", e.screen);
			}		
		}
	},
	
	_renderGestureStart(x,y, color,  db){
		var cntr = db.div("MatcAnalyticCanvasEventCntr").build(this.widgetContainer)
		cntr.style.left = Math.round(x) +"px";
		cntr.style.top = Math.round(y) +"px";
	
		var div = db.div("MatcAnalyticCanvasEvent MatcAnalyticCanvasEvent").build(cntr);
		var r = Math.max(5, Math.round(15 * this.zoom));
		div.style.width =  r +"px";
		div.style.height = r +"px";
		div.style.top =  -1* Math.round(r/2) +"px";
		div.style.left = -1* Math.round(r/2) +"px";
		div.style.backgroundColor = color;
		return div;
	},
	
	
	cleanUpAnalytics(){
		this.analyticsDivs = {};
	},
	
	
	/**********************************************************************
	 * Analytic Cached method
	 **********************************************************************/

	getGestures(){
		if(!this.cache["gestures"]){
			var df = new DataFrame(this.events);
			var gestures = df.select("type", "in", ["ScreenGesture", "WidgetGesture"]);
			this.cache["gestures"] = gestures.data;
		}
		
		return this.cache["gestures"];
	},
	
	getUserJourney(){
		if(!this.cache["userJourney"]){			
			var df = new DataFrame(this.events);
			df.sortBy("time");
			var sessionGroup = df.groupBy("session");
			let sessions = sessionGroup.data;		
			this.cache["userJourney"] = sessions;
		}		
		return this.cache["userJourney"];
	},
	
	getTaskPerformance(){
		if(!this.cache["taskPerformance"]){
			var analytics = new Analytics();
			
			var df = new DataFrame(this.events);
			df.sortBy("time");
			
			var temp = analytics.getTaskPerformance(df, this.testSettings.tasks, false, false);
			var sessions = {};
			for(var i=0; i < temp.data.length; i++){
				var match = temp.data[i];
			
				if (!sessions[match.session]){
					sessions[match.session] = {};
				}
				if (!sessions[match.session][match.task]) {
					sessions[match.session][match.task] = match;
				} else {
					console.warn("getTaskPerformance() Double mactch", match);
				}
			}
			this.cache["taskPerformance"] = sessions;
		}
		return this.cache["taskPerformance"];
	},
	
	
	
	getOverlayViews(){
		if(!this.cache["overlayViews"]){
			var screenLoads = this.df.select("type", "==","OverlayLoaded" );
			
			var screenLoadCounts = screenLoads.count("overlay");
			var totalScreenLoads = screenLoads.size();
			
			
			var views = {};
			var screens = this.getScreens(this.model);
			for(var s=0; s< screens.length; s++){
				var screen = screens[s];
				views[screen.id] =screenLoadCounts.get(screen.id,null, 0)
			}
			
			this.cache["overlayViews"] = {
				total : totalScreenLoads,
				counts : views
			};
			
		}
		return this.cache["overlayViews"];
	},
	
	getOverlayTest(){
		if(!this.cache["overlayTests"]){
			
			var sessions = this.df.groupBy("session");
			var sessionCount = sessions.size().size();
				
			var tests = {};
			var screens = this.getScreens(this.model);
			for(var s=0; s< screens.length; s++){
				var screen = screens[s];
				tests[screen.id] =0;
			}
			
			sessions.foreach(function(df){
				var screenCounts = df.count("overlay");	 // diference to screenTest
				screenCounts.foreach(function(row, id){		
					tests[id] +=1;
				});
			});
			
			this.cache["overlayTests"] = {
				sessions : sessionCount,
				counts : tests
			};
		}
		return this.cache["overlayTests"];
	},
	
	
	getScreenViews(){
		if(!this.cache["screenViews"]){
			var screenLoads = this.df.select("type", "==","ScreenLoaded" );
			var screenLoadCounts = screenLoads.count("screen");
			var totalScreenLoads = screenLoads.size();
			
			
			var views = {};
			var screens = this.getScreens(this.model);
			for(var s=0; s< screens.length; s++){
				var screen = screens[s];
				views[screen.id] =screenLoadCounts.get(screen.id,null, 0)
			}
			
			this.cache["screenViews"] = {
				total : totalScreenLoads,
				counts : views
			};
			
		}
		return this.cache["screenViews"];
	},
	
	getScreenTests(){
		if(!this.cache["screenTests"]){

			var sessions = this.df.groupBy("session");
			var sessionCount = sessions.size().size();
				
			var tests = {};
			var screens = this.getScreens(this.model);
			for(var s=0; s< screens.length; s++){
				var screen = screens[s];
				tests[screen.id] =0;
			}
			
			sessions.foreach(function(df){
				var screenCounts = df.count("screen");	
				screenCounts.foreach(function(row, id){		
					tests[id] +=1;
				});
			});
			
			this.cache["screenTests"] = {
				sessions : sessionCount,
				counts : tests
			};
			
		}
		return this.cache["screenTests"];
	},
	
	
	
	getScreenDwellTime(){
		if(!this.cache["screenDwell"]){
			
			var count = this.df.count("session");
			var sessionCount = count.size();
			
			var analytics = new Analytics();
			var screenTimeGrouping = analytics.getScreenTimeGrouping(this.df);
			var totalTime = screenTimeGrouping.sum().sum();
		
			
			var times = {};
			var screens = this.getScreens(this.model);
			for(var s=0; s< screens.length; s++){
				var screen = screens[s];
				var screenTimeDF = screenTimeGrouping.get(screen.id);
				if(screenTimeDF){
					times[screen.id] =screenTimeDF.sum();
				} else {
					times[screen.id] = 0;
				}
			}
			
			this.cache["screenDwell"] = {
				total : totalTime,
				times : times,
				sessions : sessionCount
			};
			
		}
		return this.cache["screenDwell"];
	},
	
	
	getOverlayDwellTime(){
		if(!this.cache["overlayDwell"]){
			
			var count = this.df.count("session");
			var sessionCount = count.size();
			
			var analytics = new Analytics();
			
			/**
			 * We calculate the overlay time relative to the absolute screen time...
			 */
			var screenTimeGrouping = analytics.getScreenTimeGrouping(this.df);
			var totalTime = screenTimeGrouping.sum().sum();
		
			var overlayGrouping = analytics.getOverlayTimeGrouping(this.df);
		
			
			var times = {};
			var screens = this.getScreens(this.model);
			for(var s=0; s< screens.length; s++){
				var screen = screens[s];
				var screenTimeDF = overlayGrouping.get(screen.id);
				if(screenTimeDF){
					times[screen.id] =screenTimeDF.sum();
				} else {
					times[screen.id] = 0;
				}
			}
			
			this.cache["overlayDwell"] = {
				total : totalTime,
				times : times,
				sessions : sessionCount
			};
			
		}
		return this.cache["overlayDwell"];
	},
	
	getScreenWidgetClicks(){
		if(!this.cache["screenWidgetClicks"]){
			
			/**
			 * FIXME: This could be nice with regards to the overlays....
			 * 
			 * Some clicks should be attributed the to overlay, nit the clicks, or?
			 */
			var widgetEvents = this.df.select("type", "==", "WidgetClick");
			var widgetScreenEvents = widgetEvents.count("screen");
			var totalWidgetEvents = widgetScreenEvents.sum();
			
			/**
			 * Now filter out overlay events
			 */
			widgetEvents = widgetEvents.select("overlay", "==", null);
			widgetScreenEvents = widgetEvents.count("screen");
		
			
			var clicks = {};
			var screens = this.getScreens(this.model);
			for(var s=0; s< screens.length; s++){
				var screen = screens[s];
				clicks[screen.id] = widgetScreenEvents.get(screen.id,null, 0);
			}
	
			this.cache["screenWidgetClicks"] = {
				clicks : clicks,
				total: totalWidgetEvents
			}
		}
		
		return this.cache["screenWidgetClicks"];
	},
	
	getScreenClicks(){
		if(!this.cache["screenClicks"]){
			
			/**
			 * FIXME: This could be nice with regards to the overlays....
			 * 
			 * Some clicks should be attributed the to overlay, nit the clicks, or?
			 */
			var clickEvents = this.df.select("type", "in", ["ScreenClick", "WidgetClick"]);
			var clickEventsCount = clickEvents.count("screen");
			var totalWidgetEvents = clickEventsCount.sum();
			
			var widgetEvents = this.df.select("type", "==", "ScreenClick");
			var widgetScreenEvents = widgetEvents.count("screen");
			
			var clicks = {};
			var screens = this.getScreens(this.model);
			for(var s=0; s< screens.length; s++){
				var screen = screens[s];
				clicks[screen.id] = widgetScreenEvents.get(screen.id,null, 0);
			}
	
			this.cache["screenClicks"] = {
				clicks : clicks,
				total: totalWidgetEvents
			}
		}
		
		return this.cache["screenClicks"];
	},
	
	
	
	getOverlayClicks(){
		if(!this.cache["overlayCicks"]){
			
			/**
			 * FIXME: This could be nice with regards to the overlays....
			 * 
			 * Some clicks should be attributed the to overlay, nit the clicks, or?
			 */
			var widgetEvents = this.df.select("type", "==", "ScreenClick");
			var widgetScreenEvents = widgetEvents.count("overlay");
			var totalWidgetEvents = widgetScreenEvents.sum();
			
			var clicks = {};
			var screens = this.getScreens(this.model);
			for(var s=0; s< screens.length; s++){
				var screen = screens[s];
				clicks[screen.id] = widgetScreenEvents.get(screen.id,null, 0);
			}
	
			this.cache["overlayCicks"] = {
				clicks : clicks,
				total: totalWidgetEvents
			}
		}
		
		return this.cache["overlayCicks"];
	},
	
	
	getOverlayWidgetClicks(){
		if(!this.cache["overlayWidgetCicks"]){
			
			/**
			 * FIXME: This could be nice with regards to the overlays....
			 * 
			 * Some clicks should be attributed the to overlay, nit the clicks, or?
			 */
			var widgetEvents = this.df.select("type", "==", "WidgetClick");
			var widgetScreenEvents = widgetEvents.count("overlay");
			var totalWidgetEvents = widgetScreenEvents.sum();
			
			var clicks = {};
			var screens = this.getScreens(this.model);
			for(var s=0; s< screens.length; s++){
				var screen = screens[s];
				clicks[screen.id] = widgetScreenEvents.get(screen.id,null, 0);
			}
	
			this.cache["overlayWidgetCicks"] = {
				clicks : clicks,
				total: totalWidgetEvents
			}
		}
		
		return this.cache["overlayWidgetCicks"];
	},
	
	getWidgetData(){
		
		if(!this.cache["widgetData"]){
			
			var analytics = new Analytics();
			
			var widgets = {};

			var data = analytics.getWidgetStatistics(this.model, this.df);
					
			for(var id in data){
				widgets[id] = data[id];
			}
						
			this.cache["widgetData"] =widgets;
			
		} 
		return this.cache["widgetData"];

		
	},
	
	
	getFirstNClicksData(n){
		var key = "firstClicks" +n;
		if(!this.cache[key]){
			var analytics = new Analytics();
			this.cache[key] = analytics.getFirstNClicks(this.events, n);
		} 
		return this.cache[key];
	},
	
	/**********************************************************************
	 * DI
	 **********************************************************************/


	setController(c){
		this.logger.log(2,"setController", "enter");
		this.controller = c;
		c.setCanvas(this);
	},
	
	getController(){
		if(this._controllerCallback){
			this[this._controllerCallback]();
		}
		return this.controller;
	},
	
	setControllerCallback(c){
		this._controllerCallback = c;
	},
	
	
	setModelFactory(f){
		this.logger.log(3,"setModelFactory", "enter");
		this.factory = f;
	},
	
	setRenderFactory(f){
		this.logger.log(3,"setRenderFactory", "enter");
		this.renderFactory = f;
	},
	
	setModel(model){
		this.model = model;
		this.grid = this.model.grid;
		this.loadComments()
	},
	
	setEvents(events){
		this.logger.log(1,"setEvents", "enter > # " + events.length);
		var analytics = new Analytics();		
		this.events = analytics.nornalizeContainerChildEvents(events);
		this.df = new DataFrame(events);
		this.df.sortBy("time");		
		this.fixGestures(events);
	},
	
	setAnnotation(a){
		this.logger.log(2,"setAnnotation", "enter > # " );
		this.annotation = a;
	},
	
	setTest(t){
		this.logger.log(2,"setTest", "enter > # " );
		this.testSettings = t;
	},

	
	setAnalyticMode(mode, params){
		this.logger.log(2,"setAnalyticMode", "entry > mode: " + mode);
		this.analyticMode = mode;
		this.analyticParams = params;
		this.rerender();
		
		if(this.analyticCSS){
			css.remove(this.domNode, this.analyticCSS);
		}
		
		this.analyticCSS = mode;
		css.add(this.domNode, this.analyticCSS);
	},
	
	setUser(u){
		this.user = u;
	},
	
	setMode(mode, forceRender){
		this.logger.log(2,"setMode", "enter > " + mode +" != " + this.mode + " > " + forceRender);
		if(mode != this.mode){
			this.mode = mode;
			if(this.toolbar){
				 this.toolbar.setMode(mode);
			}
			this.rerender();
		} else if(forceRender){
			this.rerender();
		}
	},
	
	


	 /***************************************************************************
	  * Keyboard handling
	  ***************************************************************************/
	
	 onKeyPress(e){
		 
		 this._currentKeyEvent = e;
		 
		 if(this.state == "simulate" || this.state == "dialog"){
			 return;
		 }
		 
		
		 var target = e.target;
		 if(css.contains(target, "MatcIgnoreOnKeyPress")){
			 return
		 }

		 /**
		  * The keycode is differently in every browser!
		  */
		 var k = e.keyCode ? e.keyCode : e.which;

		 if (k==32){ // space
			 
			 if(!this._inlineEditStarted){
				 this.setMode("move"); 
				 this.stopEvent(e);
				 /**
				  * start the dnd already
				  */
				 this.onDragStart(this.container, "container", "onCanvasDnDStart", "onCanvasDnDMove", "onCanvasDnDEnd", null, this._lastMouseMoveEvent);
			 }
			 
		 /**
		  * Arrow dispatch...
		  */
		 } else if(k == 37){
			 this.onArrowLeft();
		 } else if(k == 39){
			 this.onArrowRight();
		 } else if(k == 40){
			 this.onArrowDown();
		 } else if(k == 38){
			 this.onArrowUp();
		 
		 } else if (k== 171 || k ==187){ // +
			 
			 if(!this._inlineEditStarted){
				 this.onClickPlus();
				 this.stopEvent(e);
			 }
		 } else if (k== 173 || k ==189){ //-
			 
			 if(!this._inlineEditStarted){
				 this.onClickMinus();
				 this.stopEvent(e);
			 }
		 }
		 
	 },
	 
	 onKeyUp(e){
		 var k = e.keyCode ? e.keyCode : e.which;
		 if (k==32){
			 this.onDragEnd(this._lastMouseMoveEvent);
			 this.setMode("view");
		 }
		 
		 delete  this._currentKeyEvent;
	 },
	
	
	
	

	/***************************************************************************
	 * Helper Functons
	 ***************************************************************************/

	initMouseTracker(){
		
//		this._debugMouseLabel = document.createElement("div");
//		this._debugMouseLabel.innerHTML="[0,0]";
//		css.add(this._debugMouseLabel,"MatcStatusItem");
//		this.status.appendChild(this._debugMouseLabel);
//		this.own(on(win.body(),"mousemove", lang.hitch(this,"onMouseMove")));
//			

	},

	onMouseMove(e){
		var pos2 = this.getCanvasMousePosition(e, true);
		//this._debugMouseLabel.innerHTML = "[" + Math.round(pos2.x) +" , "+ Math.round(pos2.y) + "]";
		this._lastMousePos = pos2;
		this._lastMouseMoveEvent = e;
	},
	

    destroy(){
    	this.cleanUp();	
	},
	
	logPageView(url) {
		this.logger.log(4,"logPageView","enter", url);
		
	}
    }, 
    mounted () {
    }
}
</script>