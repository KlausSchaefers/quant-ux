<template>
  <div class="MatcSimulator">
    <div class="MatcSimulatorLoading" data-dojo-attach-point="splashNode">
      <div class="MatcSimulatorLoadingCntr">
        <div class="MatcLogoNew MatcSimulatorLoadingLogoAnimation" data-dojo-attach-point="splashLogo" ></div>
        <div data-dojo-attach-point="loadNode"></div>

        <div class="MatcSimulatorStartBtn hidden" data-dojo-attach-point="startNode">Test Prototype</div>
      </div>
      <div class="MatcSimulatorPrivacy hidden" data-dojo-attach-point="privacyNode">
        This is a usability test and your interaction will be stored to make the design better.
        We <u>do not store</u> any personal information about you.
      </div>
      <div class="MatcSimulatorVersion">v2.0.0</div>
    </div>
  </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import topic from 'dojo/topic'
import domGeom from 'dojo/domGeom'
import has from 'dojo/has'
import Logger from 'common/Logger'
import Layout from 'core/Layout'

import Css3Animation from 'core/Css3Animation'
import RenderFactory from 'core/RenderFactory'
import Services from 'services/Services'
import io from 'dojo/io'
import Core from 'core/Core'
import RestMixin from 'core/simulator/RestMixin'
import LogMixin from 'core/simulator/LogMixin'
import RenderMixin from 'core/simulator/RenderMixin'
import ScrollMixin from 'core/simulator/ScrollMixin'
import AnimationMixin from 'core/simulator/AnimationMixin'
import MouseMixin from 'core/simulator/MouseMixin'
import DataBindingMixin from 'core/simulator/DataBindingMixin'
import EventMixin from 'core/simulator/EventMixin'

import Gestures from 'core/Gestures'

export default {
	name: 'Simulator',
	props: ['mode', 'app'],
	mixins:[
		Layout, Gestures, RestMixin, LogMixin, RenderMixin, EventMixin,
		ScrollMixin, AnimationMixin, MouseMixin, DataBindingMixin, DojoWidget
	],
    data: function () {
        return {
            debug: false, 
            logData: true, 
            qr: false, 
            hash: null, 
            remoteDebug: false, 
            skipSplash: false, 
            lastScroll: 0, 
            lastMouse: 0, 
            isGesture: false, 
            scrollListenTarget: "window", 
            mouseSampleRate: 50, 
            currentScrollTop: 0, 
            hoverAnimationDuration: 150, 
            runTimerLinesOnScreenLoad: true, 
			embedded: false,
			live: false,
			eventCount: 0,
			maxEventCount: 1000
        }
    },
    components: {},
    methods: {
        async postCreate (){
			this.logger = new Logger("Simulator");
			this.logger.debugLevel = 1;
			
			this.screenHistory = [];
			this.dataBindingValues = {};
			
			this.renderFactory = new RenderFactory();
			this.renderFactory.setMode("simulator");
			this.own(this.renderFactory.on("uiWidgetInit", lang.hitch(this, "onWidgetInit")));
		
			this._animations = {};
			this.animationFactory = new Css3Animation();

			var uri = location.hash;
			var query = uri.substring(uri.indexOf("?") + 1, uri.length);
			var params = io.queryToObject(query);
				
			if(this.mode == "standalone"){		
				// FIXME: On reloads this may cause issues because we get several screens
				this.baseURI = uri
				
				if(params.s == "true"){
					this.skipSplash = true;
				}
				
				if(params.live == "true"){
					this.live = true;
				}
				
				if(params.qr == "true"){
					this.qr = true;
					this.showSplashScreen();
					this.own(on(window, "popstate", lang.hitch(this, "onPopState")));
				}
				
				if(params.h){
					this.setInvitation(params.h);
					Services.getModelService().findAppByHash(params.h).then(app => this.setModel(app))
					// this._doGet("rest/invitation/"+ params.h + "/app.json", lang.hitch(this, "setModel"));
				}
				if(params.log &&  params.log != undefined){
					if(params.log== "false"){
						this.logData = false;
					} else {
						this.logData = params.log;
					}		
				}			
				
				if (this.embedded) {
					this.logData = false;
					this.qr = true;
				}
		
			} else {
				if(this.hash) {
					this.renderFactory.hash = this.hash;
				}
			}
			
			this.own(this.addTouchStart(this.domNode,lang.hitch(this, "onScreenPress")));
			this.own(this.addTouchRelease(this.domNode, lang.hitch(this, "onScreenRelease")));
			this.own(topic.subscribe("MatcSimulatorRenderFixedPopup", lang.hitch(this, "addFixedPopup")));
			
			
			this.logger.log(0,"postCreate","exit > mode : " + this.mode + " > logData : " + this.logData + " > qr : " + this.qr  + " > embedded:" + this.embedded);
		
		},
		
		
		setDebug (d){
			this.debug = d;
		},
		
		setInvitation (h){
			this.logger.log(2,"setInvitation","enter");
			this.hash = h;
			if(this.renderFactory){
				/**
				 * set hash so images are corretly rendered
				 */
				this.renderFactory.hash = h;
			}
		},
		
		setStartScreen (s){
			if(s){
				this.startScreenID = s.id;
			}		
		},
		
		initLiveUpdate (){
			if (this.live){
				setTimeout(lang.hitch(this,"checkLiveUpdate"), 1000);
			}
		},
		
		async checkLiveUpdate (){
			let app = await Services.getModelService().checkAppUpdateByHash(this.hash)
			this.setLiveUpdate(app)
			// this._doGet("rest/invitation/"+ this.hash + "/update.json", lang.hitch(this, "setLiveUpdate"));
		},
		
		async setLiveUpdate (app){
			if (app && app.lastUpdate && this.model && this.model.lastUpdate < app.lastUpdate){
				let app = await Services.getModelService().findAppByHash(this.hash)
				this.doLiveUpdate(app)
				// this._doGet("rest/invitation/"+ this.hash + "/app.json", lang.hitch(this, "doLiveUpdate"));
			} else {
				setTimeout(lang.hitch(this,"checkLiveUpdate"), 5000);
			}
		},
		
		doLiveUpdate (app){
			this.logger.log(0,"doLiveUpdate","enter");
			try {
				this.model = app;
				this.model = this.createZoomedModel(this._scaleX, this._scaleY);
				this.model = Core.addContainerChildrenToModel(this.model);
				if (this.currentScreen && this.currentScreen.id){
					this.setScreenId(this.currentScreen.id)
				}
				setTimeout(lang.hitch(this,"checkLiveUpdate"), 5000);
			} catch (e){
				console.error(e);
			}
		},
	
		getScreenDiv (){
			return this.currentScreenDiv;
		},
		
		
		showSplashScreen (){
			this.logger.log(2,"showSplashScreen","enter >");
			css.add(this.domNode, "MatcSimulatorSplash MactMainGradient");
			this._splashTime = new Date().getTime();		
		},
		
		setModel (model){	
			if (model == null) {
				this.logger.error("setModel","exit > No model");
				this.loadNode.innerHTML = "Sorry, invitation is not valid..."
				location.href = location.protocol + "//" + location.host + "/404.html";
			} else {
				this.logger.log(1,"setModel","enter >" + model.id + " > splash : "+ this._splashTime);
				this.model = model;
				if(this.hash){
					this.preloadImages();
				}
				if(	this._splashTime > 0){
					this.logger.log(2,"setModel","show splash");
					/**
					 * If we can by splash screen make sure we show it long enough...
					 */
					var t = Math.max(4000 - (new Date().getTime() - this._splashTime),0);
					var me = this;
					setTimeout(function(){
						css.add(me.loadNode, "hidden");
						css.remove(me.startNode, "hidden");
						css.remove(me.privacyNode, "hidden");
						css.add(me.splashLogo, "hidden");
					},t);
					this.fullSreenListener = on(this.startNode, "click", lang.hitch(this, "onStartClick", model));	
				} else {
					this.startSimilator(model);
				}
			}
		},
		
		preloadImages (){
			this.logger.log(2,"preloadImages","enter");
			
			var div = document.createElement("div");
			css.add(div, "MatcSimulatorImagePreloader");
			this.domNode.appendChild(div);
			
			for(let id in this.model.screens){
				let box = this.model.screens[id];
				if(box.style && box.style.backgroundImage){
					let img = document.createElement("img");
					img.style.backgroundImage = "url(/rest/images/" + this.hash + "/"  + box.style.backgroundImage.url +")";
					div.appendChild(img);
				}
			}
			
			for(let id in this.model.widgets){
				let box = this.model.widgets[id];
				if(box.style && box.style.backgroundImage){
					let img = document.createElement("img");
					img.style.backgroundImage = "url(/rest/images/" + this.hash + "/"  + box.style.backgroundImage.url +")";
					div.appendChild(img);
				}
			}
			this.logger.log(3,"preloadImages","exit");
		},
		
		
		onPopState (){
			var hash = location.hash;
			if(hash && hash.length > 1){
				var uri = location.hash;
				var query = uri.substring(uri.indexOf("?") + 1, uri.length);
				var params = io.queryToObject(query);				
				var screenId = params.s
				if(this.currentScreen &&  this.currentScreen.id != screenId){
					this.logger.log(0,"onPopState","back detected! >> " + screenId);
					this.setScreenId(screenId);
				}
			}
		},
		
		onStartClick (model, e){
			this.logger.log(2,"onStartClick","enter");
			this.stopEvent(e);

			if(this.fullSreenListener){
				this.fullSreenListener.remove();
			}
			
			this.toggleFullScreen();
			if (this.qr) {
				this.logger.log(2,"onStartClick","delay start");
				/**
				 * if we have a qr code, full screen might be togggled!
				 * This would cause the initScale() method to get a wrong reading,
				 * so we have to wait a little!
				 */
				setTimeout(() => {
					this.startSimilator(model);
				}, 200)
			} else {
				this.startSimilator(model);
			}
		},
		
		startSimilator (model){
			this.logger.log(2,"startSimilator","enter >" + model.id);
			
			this.initScale();
			this.initLiveUpdate();
			this.initScroll();
			
			this.model = this.createZoomedModel(this._scaleX, this._scaleY);
			this.model = Core.addContainerChildrenToModel(this.model);

			this.initParent();
			
			this.renderFactory.setModel(this.model);
				
			this.renderFactory.setScaleFactor(this._scaleX, this._scaleY);
			
			this.render();
			
			if((!has("android") && !has("ios"))){
				this.logger.log(0,"postCreate","Desktop detected -> log mouse!");
				this.own(on(this.domNode, "mousemove", lang.hitch(this, "onMouseMove")));
				this.own(on(this.domNode, "onmousewheel", lang.hitch(this, "onMouseWheel")));
				this.own(on(this.domNode, "mousewheel", lang.hitch(this, "onMouseWheel")));
				this.own(on(this.domNode,"DOMMouseScroll", lang.hitch(this,"onMouseWheel")));
				this.logMouse = true;
			} else{
				this.logMouse = false;				
			}
		
			if (this.model.fonts) {
				this.attachFontsToDom(this.model.fonts)
			}
			this.own(on(window,"resize", lang.hitch(this,"onResize")));
		},
		
		
		/**
		 * When running the simulator not 
		 */
		initParent (){
			if(!this.qr && this.domNode.parentNode){
				this.logger.log(0,"initParent","enter > "  +this.model.screenSize.h  );
				this.domNode.parentNode.style.height = this.model.screenSize.h + "px";
			}
		},
	
		setScreenPosition (pos) {
			this._externScreenPos = pos
		},
		
		initScale (){
			/**
			 * FIXME: We should have here a way to inject the screensize from outside!
			 */
			if (!this._externScreenPos) {
				if(this.isDesktopTest){
					/**
					 * FIXME: For some reason this method does not 
					 * return the correct size of the node in case of the
					 * simulator is launched in the dektop test.html.
					 */
					this.screenPos = domGeom.position(this.domNode.parentNode);
				} else {
					this.screenPos = domGeom.position(this.domNode);
				}
			} else {
				this.screenPos = this._externScreenPos
				console.warn('Simulator.initSclae() > Use external screenPOS', this.screenPos)
			}
			
			this._scaleX = (this.screenPos.w / this.model.screenSize.w );
			this._scaleY = this._scaleX;
			this.logger.log(0,"initScale","exit > h:" + this.screenPos.h + " x w:" + this.screenPos.w + " * " + this._scaleX + " > desk : " + this.isDesktopTest);
		},
		
		
		setScreenId (screenID){
			this.logger.log(3,"setScreen","enter >" + screenID);
			
			var screen = this.model.screens[screenID];
			if(screen){
				this.renderScreen(screen, null);
			} else {
				console.error("No screen with ", screenID);
			}
		},
		
		cleanUp (){
			this.logger.log(2,"cleanUp","enter");
			this.renderFactory.cleanUp();
			this.cleanUpTempListener();
			this.cleanUpOverlays();
			this.overlays = [];
			delete this.currentOverlay;
			delete this.fixedOverlayWrapper;
			delete this.currentOverlayDiv;
			delete this._scrollWidgets;
		},
			
		/**********************************************************
		 * Navigation
		 **********************************************************/
		
		getMatchingLine (screenID, widgetID, line, value) {
			var logic = this.model.widgets[line.to];
			if (logic) {
				var matchedLine = null;
				var lines = this.getFromLines(logic);				
				for(var i=0; i< lines.length; i++){
					line = lines[i];
					if(line.rule){
						if(this.isValueMatchingRule(value, true, line.rule)){
							matchedLine = line;		
							break;
						}	
					} else if(!matchedLine){
						matchedLine = line;
					}
				}
				return matchedLine;
			} else {
				return line;
			}
		},
	
		/**
		 * Return the line with a given type (lines[i].event === type).
		 * Handles also old school where there was not event
		 */
		getLineForGesture (lines,type ){
			for(var i=0; i< lines.length; i++){
				if(lines[i].event === type || ("click" ===type && !lines[i].event)){
					return lines[i];
				}
			}
		},
		
		onTransitionBack (screenID, widgetID, action, e){
			this.logger.log(0,"onTransitionBack","enter >  sreen:" + screenID + " > widget:" + widgetID);
			this.stopEvent(e);
			this.log("WidgetClick",screenID, widgetID, e);
			var lastScreenLine = this.screenHistory.pop();
			if(lastScreenLine){
				
				if(this.currentOverlay){
					this.popOverlay();
				} else {
					
					var lastScreenID  = lastScreenLine.screenID;
					var screen = this.model.screens[lastScreenID];
					if(screen){
						
						/**
						 * We create here a virtual line...
						 */
						var backLine = {
							id:"back",
							from : screenID,
							to : lastScreenID
						};
						
						/**
						 * We copy and inverse the animation if there is
						 */
						var lastLine = lastScreenLine.line;
						if(lastLine){
							var inverse = this.animationFactory.getInverseAnimation(lastLine.animation);
							backLine.animation = inverse;
							backLine.duration = lastLine.duration;
							backLine.easing = lastLine.easing;
						}
					
						/**
						 * New we fire the line
						 */
						if(screen.style.overlay){
							this.renderOverlay(backLine, lastScreenID); // FIXME: was line before
						} else {
							this.renderTransition(backLine,lastScreenID);		
						}						
					}
					
				}
				
				
				
			}
		},
		
		onTransition (screenID, widgetID, line, e){
			this.logger.log(0,"onTransition","enter >  sreen:" + screenID + " > widget:" + widgetID);			
			this.stopEvent(e);
			this.log("WidgetClick",screenID, widgetID, e);		
			this.executeLine(screenID, widgetID, line);				
		},
		
		executeLine (screenID, widgetID, line){
			// prevent looping animation to run 4ever
			if (this.isDestroyed) {
				return;
			}
			if(this.canPerformTransition(line, screenID)){
				var screen = this.model.screens[line.to];
				if(screen){				
					/**
					 * Store the screen because of onWidgetInit
					 */
					this.loadingScreen = screen;
					if(screen.style.overlay){
						this.logLine(line, screenID);		
						this.renderOverlay(line, screenID);
					} else {
						this.logLine(line, screenID);			
						this.renderTransition(line,screenID);		
					}								
				} else {					
					/**
					 * We might have a logic widget in here
					 */
					var widget= this.model.widgets[line.to];
					if(widget){
						this.logLine(line, screenID);
						this.executeLogic(screenID, widgetID, widget, line);						
					} else {
						console.warn("onTransition() > No screen or logic widget with id "+ line.to)
					}					
				}
			} else {
				this.log("ValidationErrorLine",screenID, widgetID);
			}
		},
		
		/**
		 * Execute the logic flow. The semantics are the following:
		 * 
		 * 1) Get all lines in the right order (like they were added)
		 * 
		 * 2) The *FIRST* line with a rule that matches will be executed
		 * 
		 * 3) If no line with a rule matches the *FIRST* line will be executed
		 */
		async executeLogic (screenID, widgetID, widget, orginalLine){
			this.logger.log(1,"executeLogic","enter >  " + widget.id + ' '+ widget.type );
		
			/**
			 * Get all line sin the correct order
			 */
			var lines = this.getFromLines(widget);
			var matchedLine = null;
			let restSuccess = false
			if (widget.props && widget.props.rest) {
				restSuccess = await this.executeRest(screenID, widgetID, widget, orginalLine)
			}

			if (widget.props && widget.props.isRandom){
				var random = Math.random()
				var pos = Math.floor(random * lines.length);
				this.logger.log(1,"executeLogic","enter >  do AB:" + widget.id + " >> " + random + " >> " + pos);
				matchedLine = lines[pos]
			} else {
				matchedLine = this.getRuleMatchingLine(lines, screenID, restSuccess)
			}
	
			this.excuteMatchedLine(matchedLine, screenID, orginalLine)
		},

		getRuleMatchingLine (lines, screenID, restSuccess) {
			let matchedLine;
			for(var i=0; i< lines.length; i++){
				var line = lines[i];
				if(line.rule){
					if (line.rule.type === 'widget') {
						matchedLine = this.checkWidgetRule(line, screenID)
					}
					if (line.rule.type === 'databinding') {
						matchedLine = this.checkDataBindingRule(line, screenID)
					}
					if (line.rule.type === 'rest') {
						console.warn('getRuleMatchingLine() implement rest success', restSuccess)
					}
					if (matchedLine) {
						break;
					}
				} else {
					/**
					 * The *FIRST* line without a condition will be 
					 */
					if(!matchedLine){
						matchedLine = line;
					}
				}
			}
			return matchedLine;
		},

		checkDataBindingRule (line) {	
			let rule = line.rule
			let value = this.getDataBindingByPath(rule.databinding)
			var result = this.isValueMatchingRule(value, true, rule);
			if (result) {
				return line
			}
		},

		checkWidgetRule (line, screenID) {
			var rule = line.rule;
			var uiWidget = this.renderFactory.getUIWidgetByID(rule.widget);
			if(!uiWidget){						
				var copyId = rule.widget + "@" + screenID;
				uiWidget = this.renderFactory.getUIWidgetByID(copyId);
			}		
			if(uiWidget){	
				if(this.isRuleMatching(rule, uiWidget)){
					return line;
				}						
			} else {
				console.warn("executeLogic() > No rule widget with id", line, rule.widget);
			}
		},

		excuteMatchedLine (matchedLine, screenID, orginalLine) {
			if(matchedLine){
				var screen = this.model.screens[matchedLine.to];
				if(screen){
					var newLine = lang.clone(matchedLine);
					newLine.animation = orginalLine.animation;
					newLine.duration = orginalLine.duration;
					/**
					 * Store the screen because of onWidgetInit
					 */
					this.loadingScreen = screen;
					if(screen.style.overlay){
						this.renderOverlay(newLine, screenID);
					} else {
						this.renderTransition(newLine,screenID);		
					}							
				}
			} else {
				console.warn("executeLogic() > Could not match any line");
			}
		},
		
		
		isRuleMatching (rule, uiWidget){
			var value = uiWidget.getValue()
			var valid = uiWidget.isValid(false);
			var result = this.isValueMatchingRule(value, valid, rule);
			this.logger.log(0,"isRuleMatching","enter > " , 
				rule.value + " " + rule.operator + " " + value + " / " + valid + " =>" + result);
			return result;
		},

		isValueMatchingRule (value, valid, rule) {
			this.logger.log(2,"isValueMatchingRule","enter > " + rule.value + " " + rule.operator + " " + value + " / " + valid);
			
			var operator = rule.operator;
			/**
			 * Special handling for checkbox group.
			 * We should have an "in" operation
			 */
			if (value && Array.isArray(value) && value.length > 0){
				console.debug("Simualtor.isRuleMatching.isArray", value)
				value = value[0]
			}
			
			var result = false;
			switch(operator){
				case "contains":
					if (value.toLowerCase && rule.value.toLowerCase) {
						var lowerValue = value.toLowerCase();
						var lowerRule = rule.value.toLowerCase();
						result = lowerValue.indexOf(lowerRule) >= 0;
					} else {
						result = false;
					}				
				    break;
				case "isValid":
					result = valid;
				    break;
				case "checked":
					result = (value === true);
				    break;
				case "notchecked":
					result = (value === false);
			        break;
			        
			    case "active":
			    	result = (value === true);
			        break;
			    case "notactive":
			    	result = (value === false);
			        break;
			    case "==":
			    	result = (value === rule.value);
			        break;
			    case "!=":
			    	result = (value != rule.value);
			        break;
			    case ">":
			    	if(!value){
			    		value = 0;
			    	}
			    	result = (value*1 > rule.value *1);
			        break;
			    case "<":
			    	if(!value){
			    		value = 0;
			    	}
			    	result = (value*1 < rule.value *1);
			        break;
			    case ">=":
			    	if(!value){
			    		value = 0;
			    	}
			    	result = (value*1 >= rule.value *1);
			        break;
			    case "<=":
			    	if(!value){
			    		value = 0;
			    	}
			    	result = (value*1 <= rule.value *1);
			        break;
			    default:
			    	console.warn("getRuleLabel() > not supported operator", rule.operator)
			}	
			return result;
		},
		
		canPerformTransition (line, screenID){
			this.logger.log(2,"canPerformTransition","enter > " + line.to);
			
			if(line.validation && line.validation.all){
				
				var screen = this.model.screens[screenID];
				if(screen){
					var isValid = true;
					var children = screen.children;
					for(var i=0; i < children.length; i++){
						var childID = children[i];
						var uiWidget = this.renderFactory.getUIWidgetByID(childID);
						if(uiWidget){
							var uiWidgetValid = uiWidget.isValid(true);
							isValid = isValid && uiWidgetValid;
							if(!uiWidgetValid){
								this.logger.log(2,"canPerformTransition","validate error > " + uiWidget.model.name);								
							}
						}
					}
					
					return isValid;
				}		
			}
			return true;
		},
		
		getSession (){
			if(!this._session){
				this._session = this.getUUID("S");
				this.logger.log(2,"getSession","created session > "+ this._session);
			}
			return this._session;
		},
		
		getUser (){
			if(!this._user){
				var user = this._getStatus("user");
				if(!user){
					user = this.getUUID("U");
					this._setStatus("user", user);
					this.logger.log(2,"getUser","created user > "+ user);
				} else {
					this.logger.log(2,"getUser","found user > "+ user);
				}
				this._user = user;
			}
			
			return this._user;
		},
		
		
		getUUID (prefix){
			return prefix + (new Date().getTime()) + "_"+ Math.round(Math.random() * 10000);
		},
		
		/**
		 * http://www.html5rocks.com/en/mobile/fullscreen/
		 */
		toggleFullScreen (e) {
			this.logger.log(0,"toggleFullScreen","enter");
			try{
				this.stopEvent(e);
				if((has("android") || !has("ios"))){
					var doc = window.document;
					var docEl = doc.documentElement;
	
					var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
					var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
	
					if(requestFullScreen){
						if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
							/**
							 * FIXME: This blocks the scrolling to an input element
							 */
							requestFullScreen.call(docEl);
						}
						else {
						  cancelFullScreen.call(doc);
						}
						this.logger.log(2,"toggleFullScreen","exit > Fullscreen started");
					} else {
						this.logger.log(2,"toggleFullScreen","exit > IOS .. No FullsScreen");
					}
				} else {
					this.logger.error("toggleFullScreen","exit > desktop");
				}
			} catch(e){
				this.logger.error("toggleFullScreen","error", e);
				this.logger.sendError(e)
			}
			
		},
		
		
		highlight (ids){
			if(this._highlights){
				for(let i=0; i< this._highlights.length; i++){
					css.remove(this._highlights[i], "MatcSimulatorHighlight");
					if(this._highlightsInner[i]){
						this._highlights[i].removeChild(this._highlightsInner[i]);
					}
					
				}
				delete this._highlights;
				delete this._highlightsInner;
			}
			
			if(ids){
				this._highlights = [];
				this._highlightsInner = [];
				for(let i=0; i< ids.length; i++){
					var div = this.renderFactory.getWidgetNodeByID(ids[i]);
					if(div){
						css.add(div, "MatcSimulatorHighlight");
						this._highlights.push(div);
						var inner = document.createElement("div");
						css.add(inner, "MatcSimulatorHighlightInner");
						div.appendChild(inner);
						this._highlightsInner.push(inner);
					}
				}
			}
		},
		
		  
	    destroy (){
			this.logger.log(-1,"destroy","enter");
			
			this.isDestroyed = true;
	    	
	    	this.sendMouse();
	    	
	    	this.cleanUpTempListener();
	    	
	    	this.cleanUpGestureScreenAnim();
	    	
	    	this.cleanUpAnimations();
			/**
			 * Do not to allow scrolling again!!!
			 */
			window.onscroll =null;
		}
    }, 
    mounted () {
		if (this.app) {
			this.setModel(this.app)
		}
    }
}
</script>