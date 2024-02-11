<template>
     <div class="MatcPlayer">
		<div class="MatcPlayerLeft">
			<div class="MatcPlayerView" ref="container">
			</div>
			<div class="MatcPlayerNav">
				<div class="MatcPlayerTasks" ref="tasks">
				</div>
				<div class="MatcPlayerProgress" ref="progress">
				</div>
			</div>	
		
			<div class="MatcPlayerButtonBar">
				<div class="">
					<a data-dojo-attach-point="btnBack"><span class="mdi mdi-skip-previous"></span></a>
					<a data-dojo-attach-point="btnPlay"><span data-dojo-attach-point="iconPlay" class="mdi mdi-play"></span></a>
					<span class="MatcPlayerTime" data-dojo-attach-point="time"></span>
				</div>
			</div>
		</div>
		<div class="MatcPlayerEvents" data-dojo-attach-point="eventCntr">

		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import on from 'dojo/on'
import touch from 'dojo/touch'
import lang from 'dojo/_base/lang'
import domGeom from 'dojo/domGeom'
import Logger from 'common/Logger'
import DataFrame from 'common/DataFrame'
import HSlider from 'common/HSlider'
import DomBuilder from 'common/DomBuilder'
import Util from 'core/Util'
import RenderFactory from 'core/RenderFactory'
import Animation from 'core/Animation'
import Analytics from 'dash/Analytics'
import Preview from 'page/Preview'
import Core from 'core/Core'
import Services from 'services/Services'

export default {
    name: 'Player',
	mixins:[DojoWidget, Util],
	props: ["app", "testSettings", "annotation", "sessionID", "eventsWithAnnimations", "pub", "mouse"],
    data: function () {
        return {
            running: false,
            currentTime: 0,
            lastEventPos: 0,
            animationTimeOffSet: 400,
            mode: "private",
            invisibleEvents: {
				"Animation": true,
				"SessionStart": true,
				"ScreenAnimation": true,
				"OverlayShowAnimation": true,
				"OverlayRemoveAnimation": true,
				"ValidationOk": true,
				"MouseOut": true,
				"MouseOver": true,
				"WidgetInit": true
			}
        }
    },
	components: {},

    methods: {
      postCreate (){
			this.logger = new Logger('VideoPlayer');
			this.analytics = new Analytics();
			this.jwtToken = Services.getUserService().getToken()
			this.db = new DomBuilder()
			this.own(on(this.btnBack, touch.press, lang.hitch(this, "onBack")));
			this.own(on(this.btnPlay, touch.press, lang.hitch(this, "onPlay")));
			this.init()
		},

		init () {
			if (this.app) {
				this.setModel(this.app)
				let events = this.analytics.nornalizeContainerChildEvents(this.eventsWithAnnimations)
				var df = new DataFrame(events);
				var sessionGroup = df.groupBy("session");
				var session = sessionGroup.get(this.sessionID);
				this.mouseData = this.mouse
				this.setSession(session, this.sessionID)
			}
		},

		setMouse (m) {
			this.mouseData = m
		},

		setTestSettings (t) {
			this.testSettings = t
		},

		setDialog(dialog) {
			this.dialog = dialog
		},

		setModel(model){
			this.model = this.createInheritedModel(model);
			this.model = Core.addContainerChildrenToModel(this.model)
			this.initSize()
		},

		initSize () {
			this.previewWrapper = this.renderPreview()
		},

		setSession(session,sessionID){
			this.logger.log(0, "setSession", "enter " + sessionID);
			try {

				this.sessionID = sessionID;
				this.session = session;
				session.sortBy("time");
				this.events = lang.clone(session.as_array());


				/**
				 * Now we have to the WidgetClick events a little and move them forward
				 * if the trigger a screen transition, because otherwise the the animation
				 * is deleted.
				 * Also we fix ScreenGestures
				 */
				for(var i=0; i <this.events.length;i++){
					var event = this.events[i];
					var nextEvent = null;
					if(i +1 < this.events.length){
						nextEvent = this.events[i+1];
						if((nextEvent.type == "ScreenLoaded" || nextEvent.type == "ScreenAnimation") && ( event.type=="WidgetClick" || event.type == "ScreenGesture")){
							event.time -= this.animationTimeOffSet;
							event._transition = true;
						}
					}
				}

				/**
				 * Fix gestures
				 */
				this.fixGestures(this.events);


				/**
				 * no check for tasks
				 */
				this.taskMatches = this.getMatches();


				this.duration = this.session.max("time") - this.session.min("time");
				this.min = this.session.min("time");


				/**
				 * init widget states
				 */
				 this.initWidgetStatesAndScroll();


				 /**
				  * now build for all ui widgets a time series
				  * with the states. for every event we have to know the
				  * state of all widgets.
				  */
			 	 this.render();

				 /**
				  * init animations
				  */
				 this.initAnimations();


				 /**
				  *
				  */
				 this.initMouseData();

				 /**
				  * Start ship up
				  */
				 this.lastEventPos =0;
				 this.setTime(0);
			} catch(e){
				console.debug(e.err);
				console.debug(e.stack);
			}

			//console.debug(this._widgetAnimationStates)

		},

		/**
		 * Transform raw array based mouse data into time based lookup table
		 */
		initMouseData(){
			var maxMouse = 0;
			var mouseStates = {};
			if(this.mouseData){

				var d = this.mouseData;
				for(var i=0; i< d.length; i++){
					var batch = d[i];
					for(var j=0; j < batch.t.length; j++){
						var e = {
							screen : batch.screen,
							time : batch.t[j],
							x : batch.x[j],
							y : batch.y[j],
							dur : batch.sample
						}
						var t  = this.getAnimationIndex(e.time-this.min);
						mouseStates[t] = e;
						maxMouse = Math.max(e.time)
					}
				}
				// delete this.mouseData
				this.mouseData = null
			}
			this._mouseStates = mouseStates;
			this.duration = Math.max( maxMouse-this.min, this.duration);
		},


		/**
		 * This method will loop over all events and will calculate the state for all widgets
		 */
		initAnimations(){
			this.logger.log(0, "initAnimations", "enter");

			/**
			 * we init this for all
			 */
			var aFac = new Animation();

			/**
			 * Init lookup table... for every possible timestamp we
			 * have a slot. In each slot we have info for each widget
			 */
			this._widgetAnimationStates = {};
			for(let i=0; i< this.duration;  i+=30){
				this._widgetAnimationStates[i] = {}
			}

			/**
			 * Init style holders
			 */
			var widgetInited = {};
			var lastState = {};
			this.styleIDCounter =0;

			/**
			 * Init pos holders
			 */
			var lastPos = {};
			var widgetInitedPos = {};
			this.posIDCounter =0;
			var lastScreenLoadTimeStamp = 0;
			for(let i=0; i <this.events.length;i++){
				let event = this.events[i];
				// let screenID = event.screen;
				// let widgetID = event.widget;
				// let widget = this.model.widgets[widgetID];
				let start  = this.getAnimationIndex(event.time-this.min);

				/**
				 * Reset style because of screen load
				 */
				if(( event.type =="ScreenLoaded" || event.type =="OverlayLoaded")){

					for(let j=start; j < this.duration; j+=30 ){

						/**
						 * Reset styles and pos
						 */
						// let widgets = this._widgetAnimationStates[j];
						for(let id in widgetInited){
							var orgStyle = widgetInited[id];
							this._widgetAnimationStates[j][id].style = orgStyle;
							lastState[animWidgetId] = orgStyle;

							var orgPos = widgetInitedPos[id];
							this._widgetAnimationStates[j][id].pos = orgPos;
							lastPos[animWidgetId] = orgPos;
						}


					}
					lastScreenLoadTimeStamp = start;
				}


				/**
				 * FIXME: Add here some Screen and Animation index! Otherwise Clicks or
				 * Animations might stop the ScreenAnimation!
				 */
				//if(event.type == "ScreenAnimation" ){
				//}


				if(event.type =="Animation"){
					/**
					 * The animation might have been triggered by the widgetID,
					 * but it animated another widget, which is stored
					 * in the event.animation.id
					 */
					var animWidgetId = event.animation.id;

					var animWidget = this.model.widgets[animWidgetId];
					if(animWidget){
						/**
						 * init the index with the original style as default. This should just be
						 * a reference, therefore I hope it does not consume too much memory...
						 */
						if(!widgetInited[animWidgetId]){
							let orginalStyle = this.initWidgetAnimation(animWidgetId, animWidget);
							widgetInited[animWidgetId] = orginalStyle;
							lastState[animWidgetId] = orginalStyle;

							let orgPos = this.initWidgetAnimationPos(animWidgetId, animWidget);
							widgetInitedPos[animWidgetId] = orgPos;
							lastPos[animWidgetId] = orgPos;
						}


						var animation = event.animation;

						var fromStyle = animation.from.style;
						var toStyle = animation.to.style;


						var fromPos = animation.from.pos;
						if(fromPos){
							fromPos = this.getAbsolutePosition(event.screen, fromPos);
						}
						var toPos = animation.to.pos;
						if(toPos){
							toPos = this.getAbsolutePosition(event.screen, toPos);
						}
						//console.debug("Animate ", start ,"/", this.duration , " => ", animation.duration + start);

						var animationEnded = false;
						var mixed;
						var mixedPos;


						/**
						 * We have here a problem. The animations are started not with the correct
						 * timestamp of we have onload animations!
						 */
						var startTimeStamp = start;
						if(event.animation && event.animation.triggerType =="ScreenLoaded"){
							startTimeStamp = lastScreenLoadTimeStamp;
						}


						/**
						 * Now calculate the state from the *start* point on.
						 * j is the rolling timestamp
						 */
						for(let j=startTimeStamp; j < this.duration; j+=30 ){
							/**
							 * The current time index for the animation. We substract start,
							 * to make it start at 0
							 */
							let t = j - start;


							/**
							 * Get the p
							 */
							var p = 1;
							if(animation.duration > 0){
								if(animation.delay){
									p = aFac.getP(t,animation.delay, animation.duration );
								} else {
									p = Math.min(1, t / animation.duration);
								}
							}

							if(!animationEnded || !mixed){
								/**
								 * Here we call the factory to get the animated style
								 */
								mixed  =  aFac.getAnimationMixedStyle(fromStyle,toStyle, p );
								mixed._aid = this.styleIDCounter++;
								mixed._org = false;


								/**
								 * now mix with last state to have full state at every
								 * point of time. The last state must be correctly initialized
								 * with the org style!
								 */
								var last = lastState[animWidgetId];
								for(var key in last){
									if(mixed[key] == undefined){
										//console.debug("-", j , "fill : ", key, mixed[key], " <- ", last[key])
										mixed[key] = last[key];
									}
								}
								lastState[animWidgetId] = lang.clone(mixed);


								if(fromPos && toPos){

									/**
									 * Do calculate here the mixedPos
									 */
									mixedPos = aFac.getAnimationMixedPos(fromPos,toPos, p );
									mixedPos._aid = this.posIDCounter++;
									mixedPos._org = false;
								} else {
									mixedPos = null;
								}
							}

							if(p >=1){
								animationEnded = true;
							}

							this._widgetAnimationStates[j][animWidgetId].style = mixed;
							if(mixedPos){
								this._widgetAnimationStates[j][animWidgetId].pos = mixedPos;
							}
						}
					} else {
						console.warn("initAnimations() > No widgte", animWidgetId);
					}
				}
			}

			/**
			 * HACK: we remove now all animation so ScreenAnaimtions run through
			 */
			var temp = [];
			for(let i=0; i <this.events.length;i++){
				let event = this.events[i];
				if(event.type !="Animation"){
					temp.push(event)
				}
			}
			this.events = temp;

			this.logger.log(0, "initAnimations", "exit > " + this.styleIDCounter);
		},

		getAbsolutePosition(screenID, pos){
			var screen = this.scaledModel.screens[screenID];
			if(screen){
				var result = {
					x : Math.round(screen.w * pos.x),
					y : Math.round(screen.h * pos.y),
					w : Math.round(screen.w * pos.w),
					h : Math.round(screen.h * pos.h)
				};
				return result;
			}
		},


		initWidgetAnimation(widgetID,widget ){


			/**
			 * create here a copy and set and "_aid" id field
			 * so we can later do the change checking faster
			 * (oldstyle._aid == newstyle._aid).
			 */
			var orginalStyle = lang.clone(widget.style);
			orginalStyle._aid = this.styleIDCounter++;
			orginalStyle._org = true;


			for(var j=0; j< this.duration;  j+=30){
				this._widgetAnimationStates[j][widgetID] = {
					style :  orginalStyle
				}
			}

			return orginalStyle;
		},

		initWidgetAnimationPos(widgetID){
			var originalPos = {
				x :0,
				y: 0,
				w: 0,
				h: 0,
				start:true
			};
			originalPos._aid = this.posIDCounter++;
			originalPos._org = true;


			for(var j=0; j< this.duration;  j+=30){
				if(!this._widgetAnimationStates[j][widgetID]){
					this._widgetAnimationStates[j][widgetID] = {};
				}
				this._widgetAnimationStates[j][widgetID].pos = originalPos;
			}

			return originalPos;
		},

		/**
		 * This method will loop over all events and will calculate the state for all widgets
		 */
		initWidgetStatesAndScroll(){
			this.logger.log(1, "initWidgetStatesAndScroll", "enter");

			/**
			 * we initialize with the default state of the widgets. We have an
			 * states[screenID][widgetID][state] object. We do this because of the
			 * radio buttons that we have to controll on a screen level...
			 */
			var lastStates = this.getDefaultStates();

			var widgetStatesByEvent ={};

			var overLays = [];
			var overlayStatesByEvent ={};

			var lastScroll = {
				type:"scroll",
				value:0
			};
			var screenScoll = {};



			for(let i=0; i <this.events.length;i++){
				let event = this.events[i];
				let screenID = event.screen;
				// let eventID = event.id

				/**
				 * 1) we clone that last state of all widgets. Then we set the state
				 * for the current event to the states of the current screen!
				 */
				var states = lang.clone(lastStates)
				widgetStatesByEvent[event.id] = states[screenID];
				lastStates = states;


				/**
				 * 2) if there is a new state, we update it
				 * for the new state for the widget that emited it
				 */
				if(event.state && event.type!="ScreenScroll"){


					if(states[screenID]){

						/**
						 * FIXME: If we do master-state-propagation, we have to update the state here, or?
						 */

						states[screenID][event.widget] = event.state;

						/**
						 * FIXME: For the radio box we have to change  the
						 * states of the other radio boxes. For now this hack is
						 * ok, as I think we will only have one type of widgets with synced
						 * states. Also if we have several radio button groups we have to fix
						 * this...
						 */
						if(event.state.type == "radiobox.checked"){
							this._setStates(states[screenID],"radiobox.checked", false, event);
						}
					} else {
						console.warn("getWidgetStatesByEvent() > No state for screen ", screenID);
					}

				}

				/**
				 * 3) Here we build for each event the scrollPosition.
				 * ScreenLoaded and ScreenAnimation will set the scrolling to 0!
				 *
				 */
				if(event.type=="ScreenScroll" && event.state){
					screenScoll[event.id] =event.state;
					lastScroll = {
						type:"scroll",
						value:event.state.value
					};

				} else if(event.type=="ScreenLoaded" || event.type=="ScreenAnimation"){
					/**
					 * We set scroll to 0. Simulator does the same
					 */
					var state = {
						type:"scroll",
						value:0
					};
					screenScoll[event.id] =state;
					lastScroll = state;
					/**
					 * Add here scroll state only of we do not have a ScreenAnimation.
					 * If a ScreenLoad follows a ScreenAnimation we do not reset as well!
					 */
					var lastEvent = this.events[i-1];
					if (lastEvent && event.type !="ScreenAnimation" && !(lastEvent.type == "ScreenAnimation" && event.type == "ScreenLoaded")) {
						if(event.scrollTop != undefined && event.scrollTop != null){
							state.value = event.scrollTop;
						}
					}

					/**
					 * FIXME: reset here all widget states??
					 */
				} else {
					/**
					 * other events took place at the same scroll position as before
					 */
					screenScoll[event.id] = lastScroll;
				}

				if(event.type=="ScreenLoaded" ){
					overLays = [];
				}

				if(event.type=="OverlayLoaded"){
					let index = overLays.indexOf(event.overlay);
					if(index <0){
						overLays.push(event.overlay);
					}
				}

				if(event.type == "OverlayShowAnimation"){
					if(event.animation){
						let index = overLays.indexOf(event.animation.to);
						if(index <0){
							overLays.push(event.animation.to);
						}
					} else {
						console.debug("initWidgetStatesAndScroll() > no animation for event", event)
					}
				}

				if(event.type=="OverlayRemoved"){
					let index = overLays.indexOf(event.overlay);
					if(index >-1){
						overLays.splice(index,1);
					}
				}
				overlayStatesByEvent[event.id] = lang.clone(overLays);
			}


			this._widgetStates = widgetStatesByEvent;
			this._overLayStates = overlayStatesByEvent;
			this._scrollStates = screenScoll;

			this.logger.log(2, "initWidgetStatesAndScroll", "exit");
		},






		_setStates(states,type, value, event){
			for(var id in states){
				var s = states[id];
				if(s.type == type && id!= event.widget){
					s.value = value;
				}
			}
		},





		/**
		 * This method gets the default state for every widget. It does this by renderibg each widget once, and calling the getState() method,
		 * whoich should be corretly initialized form the UIWidget objects during rendering!
		 */
		getDefaultStates(){
			this.logger.log(2, "getDefaultStates", "enter");

			var fac = new RenderFactory();
			fac.setJwtToken(this.jwtToken)
			fac.setModel(this.model); // FIXME: Shouldn't this be zoomed?
			fac.setMode("view");
			fac.setScaleFactor(1,1);

			var dummy = document.createElement("div");

			var states = {};
			var screenStates = {};

			for(var id in this.model.widgets){
				var widget = this.model.widgets[id];
				var screen = this.getParentScreen(widget);
				if(screen){
					if(!screenStates[screen.id]){
						screenStates[screen.id] = {};
					}
					var uiWidget = fac.createUIWidget(dummy,  widget);
					if(uiWidget){
						var state = uiWidget.getState();
						if(state){
							//this.logger.log(3, "getDefaultStates", "State for widget '" +id +"' (" + widget.name +  ") >> " + state.type + " :  "+ state.value);
							states[id] = state;
							screenStates[screen.id][id] = state;
						}
					}
				}

			}
			fac.cleanUp();
			return screenStates;
		},

		getMatches(){

			this.taskNames = {};
			if(this.testSettings){

				var session = new DataFrame(this.events);
				session = this.getActionEvents(session);

				var tasks = this.testSettings.tasks;
				for(var i=0; i < tasks.length; i++){
					this.taskNames[tasks[i].id] = tasks[i].name;
				}
				return this.analytics.getTaskPerformance(session, tasks, true);


			}

			return null;
		},

		onBack(e){
			this.stopEvent(e);
			this.currentTime =0;
			this.lastEventPos = 0;
			this.setTime(0);
		},

		onPlay(e){
			this.stopEvent(e);

			/**
			 * make sure we start from the beginning after we have ended!
			 */
			if(this.currentTime >= this.duration){
				this.currentTime =0;
				this.lastEventPos = 0;
			}

			if(!this.running){
				this.start();
			} else {
				this.stop();
			}
		},

		start(){
			this.running = true;
			css.add(this.iconPlay, "mdi-pause");
			css.remove(this.iconPlay, "mdi-play");
			this.lastLoop = new Date().getTime();
			requestAnimationFrame(lang.hitch(this, "loop"));
		},



		stop(){
			this.running = false;
			css.remove(this.iconPlay, "mdi-pause");
			css.add(this.iconPlay, "mdi-play");
		},


		loop(){
			var now = new Date().getTime();
			var dif = now - this.lastLoop;
			this.lastLoop = now;
			this.currentTime += dif;


			if(this.currentTime < this.duration){
				this.setTime(this.currentTime);
				if(this.running){
					requestAnimationFrame(lang.hitch(this, "loop"));
				}
			} else {
				// make sure we show the last event!
				this.setTime(this.duration, true);
				this.stop();
			}

		},



		render(){
			this.logger.log(2,"render","enter");


			this.preview = this.$new(Preview, {isPlayer:true});
			this.preview.setJwtToken(this.jwtToken)
			this.preview.placeAt(this.previewWrapper);
			this.preview.setModel(this.model);

			this.scaledModel = this.preview.model;

			this.slider = this.$new(HSlider);
			this.slider.setMax(this.duration);
			this.slider.setMarks(this.getAnnotation());
			this.slider.placeAt(this.$refs.progress);

			this.own(on(this.slider, "change", lang.hitch(this, "onSliderChange")));
			this.renderEventList();
			this.renderTaskBar()
		},

		renderPreview () {
			this.$refs.container.innerHTML="";
			var previewWrapper = document.createElement("div");
			css.add(previewWrapper, "MatcPlayerPreview");
			this.layout(previewWrapper);
			return previewWrapper
		},

		renderTaskBar () {
			if(	this.taskMatches){
				const tasks = this.taskMatches.as_dict('task')
				for (let id in this.taskNames) {
					const label = this.taskNames[id]
					let row =  tasks[id]
					if (row) {
						const start = (row.startTime - this.min) / this.duration
						const length = (row.endTime - row.startTime) / this.duration
						this.renderTask(start, length, label)
					}
				}
				if (Object.values(tasks).length === 0) {
					css.add(this.$refs.tasks, "MatcHidden")
				}
			}
		},

		renderTask (start, length, label) {			
			const bar = this.db
				.div('MatcPlayerTasksBarCntr')
				.div('MatcPlayerTasksBar', label)
				.build(this.$refs.tasks)
		
			bar.style.left = Math.min(97, (start * 100)) +'%'
			bar.style.width = Math.max(3, 100* length) +'%'
		},


		getAnnotation(){
			const result = [];
			if(	this.taskMatches){
				this.taskMatches.foreach(row => {
					const marker = {
						start : row.startTime - this.min,
						length : 0
					}
					result.push(marker);
				});
			}
			return result;
		},

		renderEventList(){

			/**
			 * Merge in annotation.tags
			 */
			var list = [];
			for(let i=0; i< this.events.length; i++){
				let e = this.events[i];
				list.push(e);
			}
			list.sort(function(a,b){
				return a.time - b.time;
			});

			this.eventCntr.innerHTML="";
			this.cleanUpTempListener();

			// var scroller = new ScrollContainer();
			// scroller.placeAt(this.eventCntr);

			var parent = document.createElement("div");

			for(let i=0; i< list.length; i++){
				let e = list[i];
				let type = e.type;
				if(type){

					if(!this.invisibleEvents[type] && !e.hidden){
						var item = document.createElement("div");
						css.add(item, "MatcPlayerEvent");
						css.add(item, e.type);
						var txt = this.getMinute(e.time -this.min);
						if(type == "WidgetClick" || type == "WidgetChange" || type=="ValidationError" || type=="ValidationErrorLine"){
							if(e.state && (type == "WidgetClick" || type == "WidgetChange" )){
								txt += " - " +  this.getEventStateLabel(e.state);
							} else {
								txt += " - " + this.getEventLabel(e.type);
							}
							let widget = this.model.widgets[e.widget];
							if(widget){
								txt +=" -  &quot;" + widget.name+"&quot;";
							} else {
								txt +=" -  &quot;" + e.widget +"&quot;";
							}
						} else if(type =="ScreenGesture" && e.gesture){
							let gesture = e.gesture;
							let screen = this.model.screens[e.screen];
							if(screen){
								txt += " - Screen " + this.getGestureLabel(gesture.type) + " -  &quot;" + screen.name +"&quot;";
							} else {
								txt += " - Screen " + this.getGestureLabel(gesture.type) + " - &quot;" + e.screen +"&quot;";
							}
					    } else if(type =="WidgetGesture" && e.gesture){
							let gesture = e.gesture;
							let screen = this.model.screens[e.screen];
							if(screen){
								txt += " - " + this.getGestureLabel(gesture.type) + " -  &quot;" + screen.name +"&quot;";
							} else {
								txt += " - " + this.getGestureLabel(gesture.type) + " - &quot;" + e.screen +"&quot;";
							}
							let widget = this.model.widgets[e.widget];
							if(widget){
								txt +=" -  &quot;" + widget.name+"&quot;";
							} else {
								txt +=" -  &quot;" + e.widget +"&quot;";
							}
					    } else {
							var screen = this.model.screens[e.screen];
							if(screen){
								txt += " - " + this.getEventLabel(e.type) + " -  &quot;" + screen.name +"&quot;";
							} else {
								txt += " - " + this.getEventLabel(e.type) + " - &quot;" + e.screen +"&quot;";
							}

						}

						item.innerHTML= this.stripHTML(txt);
						parent.appendChild(item);
						this.tempOwn(on(item, touch.press, lang.hitch(this, "onEvent", e)));
					}
				} else {
					let item = document.createElement("div");
					css.add(item, "MatcPlayerEvent MatcPlayerTagEvent");
					let txt = this.getMinute(e.time -this.min) + " - Tag &quot;" + this.stripHTML( e.tag) + "&quot;";
					item.innerHTML=  txt;
					parent.appendChild(item);
					this.tempOwn(on(item, touch.press, lang.hitch(this, "onEvent", e)));

					let del = document.createElement("span");
					css.add(del, "mdi mdi-close-circle MatcPlayerEventRemove");
					item.appendChild(del);
					this.tempOwn(on(del, touch.press, lang.hitch(this, "removeTag", e)));
				}

			}
			this.eventCntr.appendChild(parent)
		},

		layout(previewWrapper){
			const container = this.$refs.container

			const cPos = domGeom.position(container);
			const pos = this.getScaledSize(cPos, "auto", this.model);

			previewWrapper.style.width = Math.round(pos.w) + "px";
			previewWrapper.style.height = pos.h + "px";
			container.style.height = pos.h + "px";
			container.appendChild(previewWrapper);

			const domPos = domGeom.position(this.domNode);
			this.eventCntr.style.height= Math.floor(domPos.h) + "px";

		

			if (this.dialog) {
				this.logger.log(-1,'layout', 'dialog >> ' +  domPos.h + ' x ' +  domPos.w)
				domPos.w += 0
				domPos.h += 0
				setTimeout(() => {
					this.dialog.resize(domPos)
				}, 30)
			}		
		},

		onEvent(e){
			this.currentTime = e.time - this.min;
			this.lastEventPos = 0;
			this.preview.resetAnimations();
			this.setTime(this.currentTime, true);
		},



		onSliderChange(v){
			this.currentTime = v;
			this.lastEventPos = 0;
			this.preview.resetAnimations();
			this.setTime(v, true);
		},

		/**
		 * Render of time t (which is relative to the end. Dunno why I did that...)
		 */
		setTime(t, forceMarker){

			/**
			 * The widget might already be destroyed....
			 */
			if(!this.time){
				return;
			}

			/**
			 * Show the time
			 */
			this.time.innerHTML = this.getMinute(t) + " / " + this.getMinute(this.duration)  + "";
			this.slider.setValue(t);


			/**
			 * Now get the event
			 */
			var event = this.getEvent(Math.floor(t));


			try {
				/**
				 * Set screen or animate transition
				 */
				if(event.screen){

					if("ScreenAnimation" == event.type){
						this.preview.animateScreen(event, t, this.min);
					} else {
						this.preview.setScreen(event.screen, event.scrollTop);
					}
				}

				/**
				 * Set overlays.
				 *
				 * 1) We render all overlays.
				 * 2) Then we run an animation if required
				 */
				var overlays = this._overLayStates[event.id];
				if(overlays){
					this.preview.setOverlays(overlays);
				}
				if(event.type == "OverlayShowAnimation" || event.type == "OverlayRemoveAnimation"){

					this.preview.animateOverlay(event, t, this.min);

				} else if(this.lastEvent && this.lastEvent.type == "OverlayShowAnimation"){

					/**
					 * Because of skipping or so, the animation might not have reached 100%,
					 * so we force fore the animation one mo time,
					 */
					this.preview.animateOverlay(this.lastEvent, t, this.min);
				}


				/**
				 * Show a click marker. We only show the marker if the delta is small
				 * and there and x and y values
				 */
				var tDelta = 0;
				if(forceMarker){
					tDelta = Math.abs((event.time -this.min) - t);
				}
				if(event.x> 0 && event.y >0 && tDelta < 100){
					this.preview.setMarker(event, forceMarker );
				}

				/**
				 * now update widget states
				 */
				var states = this._widgetStates[event.id];
				for(var widgetID in states){
					var state = states[widgetID];
					this.preview.setWidgetState(widgetID, state, forceMarker, t +this.min);
				}

				/**
				 * Set scroll
				 */
				this.setScroll(event, t);

				this.setMouseCursor(event, t);


				/**
				 * fire widget animations
				 */

				var at = this.getAnimationIndex(t);
				if(this._widgetAnimationStates[at]){
					var animStates = this._widgetAnimationStates[at];
					this.preview.setWidgetAnimationStates(animStates);
				} else {
					console.warn("setTime() > No animation data for time index", at)
				}

			} catch (err) {
				console.warn("VideoPlayer.setTime() > Error", err)
			}
			

			this.lastEventID = event.id;

			this.lastEvent = event;
		},


		setMouseCursor(event, t){
			var i  = this.getAnimationIndex(t);

			if(this._mouseStates && this._mouseStates[i]){
				this.preview.setMouse(this._mouseStates[i]);
			}


		},

		setScroll(event, t){

			var scrollState = this._scrollStates[event.id];
			if(scrollState){
				if(scrollState.children){
					if(!scrollState._ts){
						scrollState._scrollts = this.createTimeSeries(scrollState.children)
					}
					t = t + this.min;
					var scrollEvent = scrollState._scrollts.get(t); //this._getLastValueForTime(scrollState.children, t);
					if(scrollEvent){
						this.preview.setScroll(scrollEvent.value);
					} else {
						console.debug("setScroll()> No scrollEvent for event ", t);
					}
				} else {
					this.preview.setScroll(scrollState.value);
				}
			} else {
				console.warn("setScroll() > No scrollState for ", event.id);
			}


		},

		_getLastValueForTime(values, t){
			var result = null;
			if(values){
				/**
				 * we now the list is ordered. So we could use binay search, and save also the last position...
				 */
				for(var i=0; i< values.length; i++){
					var value = values[i];
					if(value.time <= t) {
						result = value;
					} else {
						return result;
					}
				}
			} else {
				console.warn("_getLastValueForTime() > No values passed");
			}
			return result;
		},


		/**
		 * This method will return the event for the time stamp. It has a little tweak that it will start from the
		 * last position, so that in theory we should have in the animation loop only 1 or 2 iterations in the loop.
		 * However when clicking on the slider we have to set the lastEventPos to 0 so that we search all the array.
		 */
		getEvent(t){
			var event = null;
			for(var i= this.lastEventPos; i < this.events.length; i++){
				var e = this.events[i];
				var time = e.time - this.min;
				if(time > t){
					break;
				}
				event = e;
				this.lastEventPos = i;
			}
			return event;
		},


		getMinute(t){
			var s = Math.round(t/1000);
			var min = Math.floor(s / 60);
			var sec = s % 60;
			if(sec < 10){
				sec = "0"+sec;
			}
			return min+":"+sec;
		}
    },
    mounted () {
    }
}
</script>