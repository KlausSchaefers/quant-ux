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
import touch from 'dojo/touch'
import topic from 'dojo/topic'
import domGeom from 'dojo/domGeom'
import hash from 'dojo/hash'
import has from 'dojo/has'
import Logger from 'common/Logger'
import Layout from 'core/Layout'
import Gestures from 'core/Gestures'
import Css3Animation from 'core/Css3Animation'
import RenderFactory from 'core/RenderFactory'
import Services from 'services/Services'
import io from 'dojo/io'
import Core from 'core/Core'

export default {
	name: 'Simulator',
	props: ['mode'],
    mixins:[Layout, Gestures, DojoWidget],
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
			live: false
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
	
		
		initScroll (){
		
			/**
			 * Hook in window scroll listener if the simulator is launched in the
			 * mobile. 
			 */		
			if(!this.scrollListenerInited){
				if(this.scrollListenTarget == "window"){
					this.own(on(window, "scroll", lang.hitch(this, "onScrollWindow")));
				} else {
					if (this.domNode.parentNode) {
						console.debug('initScroll() > Register on parent', this.domNode.parentNode)
						this.own(on(this.domNode.parentNode, "scroll", lang.hitch(this, "onScrollParent" )));
					} else {
						console.warn('initScroll() > no parent,, wait 200')				
						return
					}
				}
				
				this.own(topic.subscribe("VommondScrollContainer", lang.hitch(this,"onVommondScroll")));
		
				this.scrollListenerInited = true;
				this.logger.log(0,"initScroll","enter >" + this.scrollListenerInited + " @ " +this.scrollListenTarget);
			}
		},
		
		initScale (){
			
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
			this._scaleX = (this.screenPos.w / this.model.screenSize.w );
			//this._scaleY = this.screenPos.h / this.model.screenSize.h;
			//console.debug('initScale', this._scaleX, this._scaleY)
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
		
		render (){
			this.logger.log(2,"render","enter >" + this._scaleX + " > " + this._scaleY);
			
			css.remove(this.domNode, "MatcSimulatorSplash MactMainGradient");
			
			if(this.startScreenID ){
				let start = this.model.screens[this.startScreenID];	
				this.domNode.innerHTML="";
				//this.log("SessionStart",start.id, null, null);
				this.logSessionStart(start.id)
				this.renderScreen(start,0);
			} else {
				let start = this.getStartScreen();			
				if(start){
					this.domNode.innerHTML="";
					//this.log("SessionStart",start.id, null, null);
					this.logSessionStart(start.id)
					this.renderScreen(start,0);
				} else {
					this.domNode.innerHTML = "No Start Screen!";
				}
			}
			
		},
		
		
		/**
		 * The default method to show a screen without any animation
		 */
		renderScreen (screen, line){
			this.logger.log(-1,"renderScreen","enter > " + screen.id + " / " + screen.name);
			
			try {
				this.log("ScreenLoaded",screen.id, null, null);
				
				var oldScreen = this.currentScreenDiv;
				
				/**
				 * cleanup 
				 */
				this.cleanUp();
				
				/**
				 * set dom size
				 */
				this.setDomSize(screen);
				
				/**
				 * render screen and all widgets
				 */
				var div = this.createScreen(screen, false);
				
				/**
				 * append to DOM without any animation..
				 */
				this.addScreen(screen, div, line);
				
				if(this.qr){
					hash(`#/simulate.html?qr=${this.qr}&h=${this.hash}&s=${screen.id}&log=${this.logData}&live=${this.live}`);
				}
				
				if(oldScreen){
					this.removeScreen(oldScreen);
				} else {
					console.debug("Simualtor.render() > No old screen" );
				}

				this.checkEndScreen(screen);
			} catch (err) {
			   console.error(err)
			   console.warn("Simualtor.render() >", err.message);
			   console.warn(err.stack);
			   this.logger.sendError(err);
			}
			
			return div;
		},
		
		
		renderScreenOverlay (overlay, line){
			this.logger.log(3,"renderScreenOverlay","enter > " + overlay.id);
			
			try {
				this.logShowOverlay(overlay);
				/**
				 * set dom size
				 */
				this.setDomSize(this.currentScreen, overlay );
				
				/**
				 * render screen and all widgets
				 */
				var div = this.createScreen(overlay, true);
				
				/**
				 * append to dom
				 */
				this.addOverlay(overlay, div, line);
				
				if(this.qr){
					//hash(""+overlay.id);
				}
				
				this.destroyUiWidgets();
	
			} catch (err) {
			   console.warn("Simualtor.renderScreenOverlay() >", err.message);
			   console.debug(err.stack);
			   this.logger.sendError(err)
			}
			
			return div;
		},
		
		setDomSize (screen, overlay){
			if (this.domNode) {
				/**
				 * set screen position. Make -1 to fix scrolling issues...
				 */
				if(!overlay){
					this.domNode.style.height = screen.h + "px";
					this.domNode.style.width = screen.w + "px";
				} else {
					this.domNode.style.height = Math.max(screen.h, overlay.h) + "px";
					this.domNode.style.width  = Math.max(screen.w, overlay.w) + "px";
				}
				// FIXME: If we should not have scroll, because the screen is as the default height, add css to simulator parent to prevent scroll
				if(Math.abs(this.model.screenSize.h - screen.h) > 5){
					this.logScroll = true;
				} else {
					this.logScroll = false;
				}
			}
			this.logger.log(0,"setDomSize","exit > log scroll: " + this.logScroll  + " > h " + screen.h  + " x " + screen.w);
		},
		
		
		/**********************************************************
		 * Screen Rendering
		 * screen: the screen
		 * isOverLay: if the screen is an overlay
		 * line: The line that triggered the rendering. Might by null on start!
		 * **********************************************************/
		createScreen (screen, isOverlay){
			this.logger.log(2,"createScreen","enter > " + screen.id + " > overlay : " + isOverlay);
			/**
			 * Call live cycle methods
			 */
			this.beforeScreenCreated(screen, div);
			
			/**
			 * create screen box
			 */
			var div = document.createElement("div");
			div.style.width = screen.w + "px";
			div.style.height = screen.h + "px";
			div.style.left = "0px";
			div.style.top ="0px";
			
			div.dataScreenId = screen.id;
			css.add(div, "MatcScreen");
			div.setAttribute('screenID', screen.id)
			/**
			 * FIXME: Somehow blur the background image too?
			 */
			this.renderFactory.setStyle(div, screen);
			
			var screenId = screen.id;
			if(isOverlay){
				div.style.backgroundColor= "transparent";
				screenId = this.currentScreen.id;
			}
				
			/**
			 * Now render all widgets in their correct z-value order...
			 */
			var widgets = this.sortChildren(screen.children);
			for(var i=0; i< widgets.length; i++){
				var widget = widgets[i];	
				/**
				 * we do not render contained widgets! 
				 */	
				if (!widget.container){
					this.createWidget(widget, screen, screenId, div);	
				}	
			}	
			
			/**
			 * Init all widgets (for validation) 
			 */
			this.initWidgets(screen);
			
			/**
			 * Call live cycle methods
			 */
			this.afterScreenCreated(screen, div);
			
			
			return div;
		},
		
		beforeScreenCreated (){
			
			if(this._transitionTimer){
				this.logger.log(0,"beforeScreenCreated","Cancel transition timer");
				clearTimeout(this._transitionTimer);
			}
			
			if (this._androidBlurTimeout){
				this.logger.log(-2,"beforeScreenCreated","Cancel blur timer");
				clearTimeout(this._androidBlurTimeout);
				delete this._androidBlurTimeout;
			}
			delete this._transitionTimer;
		},
		
		afterScreenCreated (screen){
		
			
			/**
			 * Check if there is a timer line...
			 */
			if(this.runTimerLinesOnScreenLoad){
				var lines = this.getFromLines(screen);
				
				if(lines && lines.length > 0){
					var line = this.getLineForGesture(lines, "timer");
					if(line){
						this.logger.log(0,"afterScreenCreated","Found timer");
						var delay = Math.round(line.timer * 1000);
						if(!isNaN(delay) && delay > 0){
							this._transitionTimer = setTimeout(lang.hitch(this, "executeLine", screen.id, null, line),delay);
						} else {
							this.logger.error("afterScreenCreated","Delay has shitty format "+ line.timer);
						}	
					}
				}
			} else {
				console.debug("afterScreenCreated() > do not run timers!");
			}
			
		},
		
		
		
		/**********************************************************
		 * Widget Stuff
		 **********************************************************/
	
		
		
		initWidgets (screen){

			var widgets = this.sortChildren(screen.children);
			for(var i=0; i< widgets.length; i++){
				var widget = widgets[i];
				var uiWidget = this.renderFactory.getUIWidget(widget);
				if(uiWidget){
					uiWidget.onScreenRendered();
					this.initDataBinding(uiWidget, screen);
				}
			}
		},
		
		
		/**
		 * Returns all lines for a widget or its parent group. 
		 * 
		 * 1) If there is one or more lines for the widget, this will be
		 * returned
		 * 
		 * 2) Else, if there is a group and the group has one or more line,
		 * the group lines will be returned!
		 */
		getLinesForWidget (widget){
	
			/**
			 * In case of an inherited widget, use the lines of the master
			 */
			if(widget.inherited && this.model.widgets[widget.inherited]){
				widget = this.model.widgets[widget.inherited];
			}
			
			var widgetID = widget.id;
			var lines = this.getFromLines(widget);
			if(lines && lines.length > 0){
				return lines;
			}
			
			var group = this.getParentGroup(widgetID);
			if(group){
				var groupLine = this.getFromLines(group);
				if(groupLine && groupLine.length > 0){
					return groupLine;
				}
			}
		},
		
		/**
		 * Get action of widget.
		 * 
		 * 1) Widget actions have prio
		 * 
		 * 2) If no widget action we check group for action
		 */
		getActionsForWidget (widget){
			/**
			 * In case of an inherited widget, use the action of the master
			 */
			if(widget.inherited && this.model.widgets[widget.inherited]){
				widget = this.model.widgets[widget.inherited];
			}
			if(widget.action){
				return widget.action;
			}
			var group = this.getParentGroup(widget.id);
			if(group && group.action){
				return group.action;
			}
		},
		
		createWidget (widget, screen, screenId, div){
			/**
			 * Create the widget container and call render factory
			 */
			var w = this.renderWidget(screen, widget);
			div.appendChild(w);

			/**
			 * Wire shit together
			 */
			this.wireWidget(widget, screen, screenId, w)

			/**
			 * For container widgets we wire all the children and add
			 * them to the model.
			 */
			if (widget.isContainer){
				var uiWidget = this.renderFactory.getUIWidget(widget);
				if (uiWidget){
					let children = uiWidget.getChildren()
					children.forEach(child => {
						this.wireWidget(child.widget, screen, screenId, child.div)

						/**
						 * Extend here the model with the child elements,
						 * so we can find the widgets later on the event listeners
						 * TODO: Ideally this would be done by the Core.createInheritedModel()
						 * method.
						 */
						this.model.widgets[child.widget.id] = child.widget
					})
				} else {
					this.log.warn('createWidget', 'Could not find UI widgte for ', widget)
				}
			}
		},

		wireWidget (widget, screen, screenId, w) {
			var lines = this.getLinesForWidget(widget);
			var action = this.getActionsForWidget(widget);
			var uiWidget = this.renderFactory.getUIWidget(widget);
			var hasGestures = this.hasGestures(lines);
		
			if(action || lines){
				css.add(w, "MatcSimulatorClickable");	
				//css.add(w, "MatcWidgetNoTouch");
			}
			
			/**
			 * Hook up scrollWidgets
			 */
			this.wireScrollWidget(widget)

			if(uiWidget){
								
				/**
				 * Wire UI widgets
				 */
				uiWidget.setGestures(hasGestures);
					
				var line = null;
				if(lines){
					/**
					 * To not break the api we check if we have a click line.
					 * If so, we pass at as "the line" to the click event of the UI
					 * widget
					 */	
					line = this.getLineForGesture(lines, "click");
				}
				if(action){
					this.tempOwn(uiWidget.on("click", lang.hitch(this, "onTransitionBack", screenId, widget.id, action)));
					this.tempOwn(uiWidget.on("stateChange", lang.hitch(this, "onWidgetEvent", screenId, widget.id, uiWidget, line, action)));
				} else if(line){			
					uiWidget.setClickable(true);
					this.tempOwn(uiWidget.on("click", lang.hitch(this, "onTransition", screenId, widget.id, line)));
					this.tempOwn(uiWidget.on("stateChange", lang.hitch(this, "onWidgetEvent", screenId, widget.id, uiWidget, line)));
				} else {			
					this.tempOwn(uiWidget.on("click", lang.hitch(this, "onWidgetClick", screenId, widget.id)));
					this.tempOwn(uiWidget.on("stateChange", lang.hitch(this, "onWidgetEvent", screen.id, widget.id, uiWidget, null)));
				}
				
				/**
				 * Data Binding
				 */
				this.tempOwn(uiWidget.on("databinding", lang.hitch(this, "onUIWidgetDataBinding", screen.id, widget.id)));
				
				
				/**
				 * Mouse Move
				 */
				this.tempOwn(uiWidget.on("mousemove", lang.hitch(this, "onWidgetMouse")));
				
				/**
				 * Focus & Blur
				 */
				this.tempOwn(uiWidget.on("focus", lang.hitch(this, "onWidgetFocus", screen.id, widget.id, w)));
				this.tempOwn(uiWidget.on("blur", lang.hitch(this, "onWidgetBlur", screen.id, widget.id, w)));
				this.tempOwn(uiWidget.on("keyUp", lang.hitch(this, "onWidgetKeyUp", screen.id, widget.id)));
	
				/**
				 * Gestures
				 */
				this.tempOwn(uiWidget.on("gesture", lang.hitch(this, "onWidgetGesture", screenId, widget.id, lines)));
				
				/**
				 * Animations triggered by widgets
				 */
				this.tempOwn(uiWidget.on("animation", lang.hitch(this, "onAnimation", screenId, widget.id)));
				
				/**
				 * Validation Error
				 */
				this.tempOwn(uiWidget.on("validationError", lang.hitch(this, "onValiationError", screenId, widget.id)));
				this.tempOwn(uiWidget.on("validationOK", lang.hitch(this, "onValiationOK", screenId, widget.id)));
				
				
				this.tempOwn(uiWidget.on("mouseover", lang.hitch(this, "onWidgetMouseOver", screenId, widget.id)));
				this.tempOwn(uiWidget.on("mouseout", lang.hitch(this, "onWidgetMouseOut", screenId, widget.id)));
				
			} else {
				
				/**
				 * Wire normal widget as *CLICK* so that scrolling still works
				 * 
				 * Gestures will be dispatched in the onScreenPress. For now this
				 * only works, if the staart and end are the same..
				 */
				if(action){	
					this.tempOwn(on(w, touch.click, lang.hitch(this, "onTransitionBack", screenId, widget.id, action)));
				} else if(lines){	
					let line = this.getLineForGesture(lines, "click");
					if (line) {
						this.tempOwn(on(w, touch.click, lang.hitch(this, "onTransition", screenId, widget.id, line)));
					}
				} else {
					this.tempOwn(on(w, touch.click, lang.hitch(this, "onWidgetClick", screenId, widget.id)));
				}
				
				/**
				 * Hover Effects for DOM nodes
				 */
				this.tempOwn(on(w, touch.over, lang.hitch(this, "onDomMouseOver", screenId, widget.id)));				
				this.tempOwn(on(w, touch.out, lang.hitch(this, "onDomMouseOut", screenId, widget.id)));
			}
		},

		wireScrollWidget (widget) {
		
			if (!this._scrollWidgets) {
				this._scrollWidgets = []
			}
			
			var lines = this.getFromLines(widget);
			//console.debug('wireScrollWidget', widget, lines)
			if (lines && lines.length > 0){
				let line = this.getLineForGesture(lines, "scroll");
				if (line){
					console.debug('wireScrollWidget() > wire ', line, widget.name)
					this._scrollWidgets.push({
						w:widget,
						l:line
					})
				}
			}
		},
		
		addScreen (screen, div, line){
			/**
			 * make sure the mouse events are flushed and correctly associated with an screen!
			 */
			var oldScreenDiv = this.currentScreenDiv
			this.sendMouse();
			this.currentScreen = screen;
			this.currentScreenDiv = div;
			var me = this
			if (this.domNode){
				this.domNode.appendChild(div);
				var scrollPos = this.currentScrollTop;
				/**
				 * Line might be null on start!
				 */
				if(line && line.scroll){
					this.scrollToSamePosition(scrollPos);
				} else {
					this.scrollToTop();
				}
				this.runOnLoadedScreenAnimation(screen.id, line, function() {
					me.removeScreen(oldScreenDiv)
				});
			}
		},
		
		removeScreen (div){	
			this.logger.log(4, "removeScreen","enter", div);
			if(div && div.parentNode && this.domNode){
				try {
					this.domNode.removeChild(div);
				} catch (e) {
					console.warn("Simulator.removeScreen() > Cannot remove screen", e)
				}				
			}
		},
		
		checkEndScreen (screen){
			if (this.qr === true) {
				if (screen && screen.name && screen.name.indexOf("(END)") > 0){
					this.logger.log(-1, "checkEndScreen","END SCREEN > "+ screen.name);
					this.toggleFullScreen();
				}
			}
		},
		
		
		addOverlay (overlay, div, line){
			this.sendMouse();
			
			this.currentOverlay = overlay;
			this.currentOverlayDiv = div; 			
			
			this.overlays.push({
				screen : overlay,
				div : div,
				line : line
			});
						
			if(overlay.style.fixed){

				/**
				 * In case if fixed we add an extra screen wrapper, which is fixed,
				 * and which will hide the overflow of animations. 
				 * 
				 * FIXME: This does not work with resize..
				 */
				if(!this.fixedOverlayWrapper){
					
					
					this.fixedOverlayWrapper = document.createElement("div");
					this.fixedOverlayWrapper.style.height = this.screenPos.h +"px";
					this.fixedOverlayWrapper.style.width = this.screenPos.w +"px";
					this.fixedOverlayWrapper.style.position = "fixed";
					this.fixedOverlayWrapper.style.overflow = "hidden";
					this.fixedOverlayWrapper.style.top = this.screenPos.y +"px";
					this.fixedOverlayWrapper.style.left = this.screenPos.x +"px";
					//this.fixedOverlayWrapper.style.border ="1px solid orange";
					this.domNode.appendChild(this.fixedOverlayWrapper);
				}
				this.fixedOverlayWrapper.appendChild(div);
				
			} else {
				if(this.currentScreenDiv){
					this.currentScreenDiv.appendChild(div);
				} else {
					console.warn("addOverlay() > NO currentScreenDIV");
				}
			}
			
			
			if(overlay.style.blur && this.currentScreenDiv){
				requestAnimationFrame(lang.hitch(this, "blurBackground", div));
				//this.blurBackground();
			}
			

			this.runOnLoadedScreenAnimation(overlay.id, line);
		},
		
		popOverlay (){

			if(this.overlays && this.overlays.length > 0){
				
				this.sendMouse();
				
				this.logger.log(1,"popOverlay","enter >");
				
				var overlay = this.overlays.pop();
				if(overlay.line && overlay.line.animation){
					var line = overlay.line;
					
					if(overlay.screen.id != line.to){
						console.warn("popOverlay() wrong ids between overlay and line??");
					}
					
								
					var inverse = this.animationFactory.getInverseAnimation(line.animation);
					if(inverse && this.animationFactory["createScreen_"+inverse]){
						var me = this;
						var animation = this.animationFactory["createScreen_"+ inverse](overlay.screen, overlay.div,null , true);
						animation.onEnd(function(){
						
							me.removeOverlay(overlay.div);
							me.logHideOverlay(overlay.screen);							
							me.onOverlayPoped();
						});
						
						if(line.duration){
							animation.setDuration(line.duration);
						}
						
						var easing;
						if(line.easing){
							easing = this.animationFactory.getInverseEasing(line.easing);
							animation.setEasing(easing);
						}
						
						/**
						 * Unblur before
						 */
						this.unBlurBackground();
						
						animation.run();
						
						this.log("OverlayRemoveAnimation", this.currentScreen.id, null, null, {animation: {type:inverse, to:line.to, duration: animation.duration, easing : easing, overlay:true}});
						
					} else {
						console.warn("popOverlay() > No animation function for : createScreen_"+inverse);
						
						this.removeOverlay(overlay.div);
						this.logHideOverlay(overlay.screen);
						this.onOverlayPoped();
					}
					
				} else {
					this.removeOverlay(overlay.div, overlay);
					this.logHideOverlay(overlay.screen);
					this.onOverlayPoped();
				}
				
				
				
				return true;
			}
			
			return false;
		},
		
		removeOverlay (div){
			if(div && div.parentNode){
				div.parentNode.removeChild(div);
			}
			
			this.unBlurBackground();
					
		},
		
		
		unBlurBackground (){
			if(this.currentScreenDiv){
				var children = this.currentScreenDiv.childNodes;
				for(var i=0; i< children.length; i++){
					var node = children[i];						
					node.style.filter = "none";
					node.style.webkitFilter = "none";	
				}
			}		
		},
		
		blurBackground (div){
			if(this.currentScreenDiv){
				var children = this.currentScreenDiv.childNodes;
				var radius = Math.max(2,20 * this._scaleX);
				for(var i=0; i< children.length; i++){
					var node = children[i];						
					if(node != div){			
						node.style.filter = "blur(" + radius +"px)";	
						node.style.webkitFilter = "blur(" + radius +"px)";	
					}				
				}
			}
		},
				
		onOverlayPoped (){

			if(this.overlays.length >0){
				var o = this.overlays[ this.overlays.length-1];
				this.currentOverlay = o.screen;
				this.currentOverlayDiv = o.div; 			
			} else {
				delete this.currentOverlay;
				delete this.currentOverlayDiv;
				
				if(this.fixedOverlayWrapper){
					if(this.domNode) {
						this.domNode.removeChild(this.fixedOverlayWrapper);
					}
					delete this.fixedOverlayWrapper;
				}
			}
		},
		
		destroyUiWidgets (){
			this.logger.log(3,"destroyUiWidgets","enter");
			
			this.renderFactory.destroyWidgets();
			
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
		
		cleanUpGestureScreenAnim (){
			
			if(this._screenGestureMoveListener){
				this._screenGestureMoveListener.remove();
				delete this._screenGestureMoveListener;
			}
			if(this._screenGestureMoveListener2){
				this._screenGestureMoveListener2.remove();
				delete this._screenGestureMoveListener2;
			}
			if(this._gesturePressListener){
				this._gesturePressListener.remove();
				delete this._gesturePressListener;
			}
				
			delete this._screenGestureType;
			delete this._screenGestureLine;
			delete this._screenGestureStartScreenID;
			delete this._screenGestureAnim;
		},
		
		
		cleanUpOverlays (){
			if(this.overlays){
				for(var i=0; i< this.overlays.length; i++){
					var o = this.overlays[ this.overlays.length-1];
					var div = o.div;
					this.removeOverlay(div);	
					this.logHideOverlay(o.screen);
				}
			}
			this.overlays = [];
			this.onOverlayPoped();
		},
		
		
		/**
		 * Sometimes we want to render as a fixed popup. We have to make sure it
		 * has the width of the entire screen as it is position fixed.
		 */
		addFixedPopup (node){			
			if(node.parentNode){
				node.parentNode.removeChild(node);
			}		
			node.style.position = "fixed";
			node.style.height = this.screenPos.h +"px";
			node.style.width = this.screenPos.w +"px";
			this.currentScreenDiv.appendChild(node);		
		},
		
		
		
		
		/**********************************************************
		 * Data Binding
		 **********************************************************/
	
		
		onUIWidgetDataBinding (screenID, widgetID, variable, value){
			this.dataBindingValues[variable] = value;
			
			/**
			 * Find all widgets that are bound to this variable then
			 * 
			 * - call setDataBinding() or innerHTML in case of Label
			 * 
			 * - call getState
			 * 
			 * - log state for player this.log("WidgetInit", screenID, e.id, null, state);
			 */
			var widgets = this.renderFactory.getAllUIWidgets();
			
			for(var id in widgets){
				var uiWidget = widgets[id];
				var changed = uiWidget.setDataBinding(variable, value);
				if(changed){
					var state = uiWidget.getState();
					this.log("WidgetInit", screenID, id, null, state);
				}
			}
			
			
		},
		
		initDataBinding (uiWidget, screen){
			var databinding = this.getDataBinding(uiWidget.model);
			if(databinding ){
				for(var key in databinding){
					var variable = databinding[key];
					if(this.dataBindingValues[variable]){
						var value = this.dataBindingValues[variable];
						var changed = uiWidget.setDataBinding(variable, value);
						if(changed){
							var state = uiWidget.getState();
							this.log("WidgetInit", screen.id, uiWidget.model.id, null, state);
						}
					}
				}
			}
		},
		
		/**********************************************************
		 * Hover Callbacks
		 **********************************************************/
	
		
		onDomMouseOver (screenID, widgetID, e){
			this.logger.log(2,"onDomMouseOver","enter >  sreen:" + screenID + " > widget:" + widgetID);
			
			var widget = this.model.widgets[widgetID];
			
			if (widget){

				if (widget.hover) {
					var hover  = widget.hover;
					var aninEvent = {
						id : widgetID,
						to:{
							style:hover
						},
						from :{},
						duration : this.hoverAnimationDuration,
						delay: 0
					};
					this.onAnimation(screenID, widgetID, aninEvent);
				}

				var lines = this.getLinesForWidget(widget);
				if (lines){
					var line = this.getLineForGesture(lines, "hover");
					if (line) {
						this.logger.log(1,"onDomMouseOver","enter > run line");
						//this.log("WidgetHover",screenID, widgetID, e);		
						this.executeLine(screenID, widgetID, line);		
					}
				}
				this.onMouseMove(e);
			} else {
				console.warn('Repeater,could not find', widgetID)
			}
		},
		
		onDomMouseOut (screenID, widgetID,e){
			this.logger.log(2,"onDomMouseOut","enter >  sreen:" + screenID + " > widget:" + widgetID);
			var widget = this.model.widgets[widgetID];
			
			if(widget && widget.hover){
				var style  = widget.style;
				var hover  = widget.hover;
				
				var toStyle = {};
				for(var key in hover){
					toStyle[key] = style[key];
				}
				
				var aninEvent = {
					id : widgetID,
					to:{
						style:toStyle
					},
					from :{},
					delay: 0,
					duration : this.hoverAnimationDuration
				};
				
				this.onAnimation(screenID, widgetID, aninEvent);
			}
			
			this.onMouseMove(e);
			//this.log("MouseOut",screenID, widgetID, null);	
		},
		
	
		
		/**********************************************************
		 * Event Callbacks
		 **********************************************************/
		
		onWidgetKeyUp (screenID, widgetID, value) {
			try {
				var widget = this.model.widgets[widgetID];
				if (widget) {
					var lines = this.getLinesForWidget(widget);
					if (lines){
						var line = this.getLineForGesture(lines, "KeyboardUp")
						if (line) {
							var matchedLine = this.getMatchingLine(screenID, widgetID, line, value)
							if (matchedLine && matchedLine.to != screenID) {
								this.logger.log(-1,"onWidgetKeyUp","run transition to " + matchedLine.to);
								this.executeLine(screenID, widgetID, matchedLine);
							} else {
								this.logger.log(-1,"onWidgetKeyUp","No match for " + value);
							}
						}
					}
				}
			} catch(e) {
				this.logger.error("onWidgetKeyUp","error", e);
				this.logger.sendError(e)
			}
		},
		
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
		
		
		onWidgetMouseOver (screenID, widgetID,e){
			this.onMouseMove(e);
			//this.log("MouseOver",screenID, widgetID, null);	
			
			var widget = this.model.widgets[widgetID];
			if (widget) {
				var lines = this.getLinesForWidget(widget);
				if (lines){
					var line = this.getLineForGesture(lines, "hover");
					if (line) {
						this.logger.log(1,"onWidgetMouseOver","enter > run line");
						//this.log("WidgetHover",screenID, widgetID, e);		
						this.executeLine(screenID, widgetID, line);		
					}
				}
			}
		},
		
		onWidgetMouseOut (screenID, widgetID,e){
			this.onMouseMove(e);
			//this.log("MouseOut",screenID, widgetID, null);	
		},
	
		/**
		 * Get called by the renderfactory
		 */
		onWidgetInit (e){		
			if(this.loadingScreen){
				
				this.log("WidgetInit",this.loadingScreen.id, e.id, null, e.state);
			}	
		},
		

	
		onWidgetGesture (screenID, widgetID, lines, gesture, startEvent, endEvent){
			this.logger.log(2,"onWidgetGesture","enter >  sreen:" + screenID + " > widget:" + widgetID + " > "+ gesture.type);
		
			if(gesture && lines){
				var line = this.getLineForGesture(lines, gesture.type);
				if(line){		
					
					if(gesture.type  == "click"){
						this.log("WidgetClick",screenID, widgetID, startEvent);
					} else {

						if(gesture.start){
							let pos = this.getMouse(startEvent);
							gesture.start.x = pos.x;
							gesture.start.y = pos.y;
						}
						if(gesture.end){
							let pos = this.getMouse(endEvent);
							gesture.end.x = pos.x;
							gesture.end.y = pos.y;
						}	
						this.log("WidgetGesture",screenID, widgetID, null, {"gesture" : gesture});
					}
					
				
					if(this._screenGestureAnim){		
						this.finishScreenGestureAnimation(gesture);
					} else {
						// should never be called, but is because we clean up somewhere
						this.executeLine(screenID, widgetID, line);		
					}
			
					
					//this.onTransition(screenID, widgetID, line, startEvent);
					return;
				} 
			} 
		
			/**
			 * Log click somehow...??
			 */
			if(gesture.type  == "click"){
				this.log("WidgetClick",screenID, widgetID, startEvent);
			}
			/**
			 * ok, nothing fire, so we delegate to screen
			 */
			if(gesture){
				this.onScreenGesture(gesture, startEvent, endEvent);
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
		
		onWidgetClick (screenID, widgetID, e){
			this.logger.log(1,"onWidgetClick","enter >  sreen:" + screenID + " > widget:" + widgetID);
			this.stopPropagation(e);
			this.log("WidgetClick",screenID, widgetID, e);
			
			/**
			 * Dispatch Screen Line?
			 */
			this.onScreenClickFromWidget(screenID, widgetID, e);
		},
		
		
		onWidgetEvent (screenID, widgetID, uiWidget, line, widgetEvent){
			this.logger.log(1,"onWidgetEvent","enter >  sreen:" + screenID + " > widget:" + widgetID);
					
		
			if(widgetEvent.e){
				this.stopEvent(widgetEvent.e);
				this.log("WidgetClick",screenID, widgetID, widgetEvent.e, widgetEvent);
			} else {
				this.log("WidgetChange",screenID, widgetID, null, widgetEvent);				
			}
			
			if(widgetEvent.runTransition && line){
				this.logger.log(2,"onWidgetEvent","run transition to " + line.to);
				this.executeLine(screenID, widgetID, line);
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
		executeLogic (screenID, widgetID, widget, orginalLine){
			this.logger.log(1,"executeLogic","enter >  logic:" + widget.id );
		
			/**
			 * Get all line sin the correct order
			 */
			var lines = this.getFromLines(widget);
			var matchedLine = null;
			if (widget.props && widget.props.isRandom){
				var random = Math.random()
				var pos = Math.floor(random * lines.length);
				this.logger.log(-1,"executeLogic","enter >  do AB:" + widget.id + " >> " + random + " >> " + pos);
				matchedLine = lines[pos]
			} else {
				
				for(var i=0; i< lines.length; i++){
					var line = lines[i];
					if(line.rule){
						var rule = line.rule;
						var uiWidget = this.renderFactory.getUIWidgetByID(rule.widget);
						if(!uiWidget){						
							var copyId = rule.widget + "@" + screenID;
							uiWidget = this.renderFactory.getUIWidgetByID(copyId);
						}		
						if(uiWidget){	
							/**
							 * If we have a mathcing rule, we break the loop
							 */
							if(this.isRuleMatching(rule, uiWidget)){
								matchedLine = line;
								break;
							}						
						} else {
							console.warn("executeLogic() > No rule widget with id", line, rule.widget);
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
			}
		

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
			var value = uiWidget.getValue();
			var valid = uiWidget.isValid(false);
			var result = this.isValueMatchingRule(value, valid, rule);
			this.logger.log(0,"isRuleMatching","enter > " + rule.value + " " + rule.operator + " " + value + " / " + valid + " => " + result);
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
		
		renderTransition (line, screenID, isGestureAnimation){
			this.logger.log(0,"renderTransition","enter > from " + screenID + " to " + line.to);
			var to = line.to;
			var screen = this.model.screens[to];
		
			if(screen){
				
				this.sendMouse();
				
				if(line.animation){
					this.logger.log(2,"renderTransition","animate > " + line.animation);
					
					var oldScreenDiv = this.currentScreenDiv;
					
//					if(!isGestureAnimation){
//						this.cleanUpGestureScreenAnim();
//					}
					this.cleanUp();
				
					
					this.setDomSize(screen);
					
					var newScreenDiv = this.createScreen(screen, false);
					
					/**
					 * If there is an animation init it
					 */
					if(this.animationFactory["createScreen_"+line.animation]){
						var me = this;
						var animation = this.animationFactory["createScreen_"+ line.animation](screen, oldScreenDiv, newScreenDiv);
						animation.onEnd(function(){
							me.logger.log(-1,"renderTransition","exit > from " + screenID + " to " + line.to);
							me.log("ScreenLoaded",screen.id, null, null);
							me.removeScreen(oldScreenDiv);
							me.destroyUiWidgets();
						});
						
						if(line.duration){
							animation.setDuration(line.duration);
						}
						
						if(line.easing){
							animation.setEasing(line.easing);
						}
					
						if(isGestureAnimation){
							this.addScreen(screen, newScreenDiv, line);
							return animation;
						}
						animation.run();
					
						/**
						 * FIXME: Set scroll to 0 ... 
						 * this.currentScrollTopRelative = 0;
						 */
						this.log("ScreenAnimation", screenID, null, null, {animation: {type:line.animation, to:line.to, duration: animation.duration, easing : line.easing}});
						
					} else {
						if (line.animation === "transform") {
							/**
							 * Create a screen transition animation,
							 * but fire only when the screen is loaded in the 
							 * runOnLoadedScreenAnimation() together with 
							 * the other animations! Also log the screen load here!
							 */
							var anim = this.createScreenTransformAnimation(screen, line);
							screen._transAnim = anim;
							this.log("ScreenLoaded",screen.id, null, null); // ultra important. Otherwise player are fucked uppp
							
						} else {
							console.warn("renderTransition() > No animation function for : createScreen_"+line.animation);
						}
					}
					
					/**
					 * Now hook into dom...
					 */
					this.addScreen(screen, newScreenDiv, line);
					
					
				} else {
					/**
					 * default behavior. We remove the screen and render the new one
					 */
					this.logger.log(4,"renderTransition","default");
					this.renderScreen(screen, line);
				}
				
			} else {
				console.error("No screen with ", to);
			}
		},
		
		
		
		
		renderOverlay (line, screenID, isGestureAnimation){
			this.logger.log(2,"renderOverlay","enter > from " + screenID + " to " + line.to);
			var to = line.to;
			var overlay = this.model.screens[to];
			if(overlay){
				
				this.sendMouse();
				
				if(line.animation){
					this.logger.log(2,"renderOverlay","animate > " + line.animation);
					
					// var oldScreenDiv = this.currentScreenDiv;
							
					this.setDomSize(this.currentScreen, overlay);
					
					var newScreenDiv = this.createScreen(overlay, true);
					
					/**
					 * If there is an animation init it
					 */
					if(this.animationFactory["createScreen_"+line.animation]){
						
						var animation = this.animationFactory["createScreen_"+ line.animation](overlay, null, newScreenDiv, true);
						animation.onEnd(lang.hitch(this,"onOverLayLoaded",overlay));
						
						if(line.duration){
							animation.setDuration(line.duration);
						}
						
						if(line.easing){
							animation.setEasing(line.easing);
						}
						
						if(isGestureAnimation){
							this.addOverlay(overlay, newScreenDiv, line);
							return animation;
						}
						animation.run();
						
						this.log("OverlayShowAnimation", screenID, null, null, {animation: {type:line.animation, to:line.to, duration: animation.duration, overlay:true, easing:line.easing}});
						
					} else {
						console.warn("renderOverlay() > No animation function for : createScreen_"+line.animation);
					}
					
					/**
					 * Now hook into dom...
					 */
					this.addOverlay(overlay, newScreenDiv, line);
					
					
				} else {
					/**
					 * default behavior. We remove the screen and render the new one
					 */
					this.logger.log(0,"renderOverlay","default");
					this.renderScreenOverlay(overlay, line);
				}
				
			} else {
				console.error("No screen with ", to);
			}
		},
		
		
		onOverLayLoaded (overlay){
			this.logger.log(2,"onOverLayLoaded","enter > " + overlay.id);
			this.logShowOverlay(overlay);
		
		},
	
		
		logLine (line, screenID){		
			this.screenHistory.push({screenID:screenID, line:line});
		},
		
		
		
		/**********************************************************
		 * Animation
		 **********************************************************/
		
		onAnimation (screenID, widgetID, e){
			this.logger.log(2,"onAnimation","enter >  sreen:" + screenID + " > widget:" + widgetID + " > taget : " + e.id);
									
			if(this._animations[e.id]){
				this._animations[e.id].stop();
			}	
			var anim = this.renderFactory.createWidgetAnimation(e);	
			if(anim){
				anim.run()
				this.log("Animation",screenID, widgetID, null, {animation : anim.event});	
				anim.onEnd(lang.hitch(this, "onAnimationEnded", e.id));
				this._animations[e.id]  = anim;
			}			
		},
		
		onAnimationEnded (widgetID){
			delete this._animations[widgetID];
		},
		
		
		/**********************************************************
		 * Screen Animation!
		 **********************************************************/
		
		/**
		 * We create here a animation object like it would be in the model,
		 * and the call the default runScreenAnimation;
		 */
		createScreenTransformAnimation: function(screen, line){
			// FIXME: Merge with exiting one!
			var animations = {widgets : {}, groups:{}};
			var duration = 250;
			if (line.duration){
				duration = line.duration;
			}
			// var group = {};
			/**
			 * Keep somehow in sync with the AnimationComposer.js
			 */
			var from = this.currentScreen;
			var widgets = this.sortChildren(screen.children);
			for(var i=0; i< widgets.length; i++){
				var widget = widgets[i];	
				if(!animations.widgets[widget.id]){
					var animation = {duration:duration, delay:0, type: null, easing:line.easing};
					if(this.widgetIsCopyOfOtherScreen(widget, screen.id, from)){
						animation.type = "transformFromParent";
						animations.widgets[widget.id] = animation;
					}
				}
					
			}			
			return animations;
		},
		
		
		widgetIsCopyOfOtherScreen (widget, screenID, from){
			if (from){
				var children = from.children;
				for(var i=0; i< children.length; i++){
					var fromWidget = this.model.widgets[children[i]];
					if (fromWidget.name === widget.name) {
						widget.animFrom = fromWidget.id;
						return true;
					}
				}
			}
			return false;
		},	
		
		
		runOnLoadedScreenAnimation (screenID,line, endCallback){
			this.logger.log(1,"runOnLoadedScreenAnimation","enter >  sreen:" + screenID);
			if (this.doNotRunOnLoadAnimation){
				this.logger.log(0,"runOnLoadedScreenAnimation","exit because do not run!");
				return;
			}
			var screen = this.model.screens[screenID];

			if(screen){
				var anim = this.getScreenAnimation(screen, "ScreenLoaded");
				if (screen._transAnim) {
					/**
					 * If there is an amim, we merge in the transtion stuff, unless
					 * there is already something defined in the animation composer
					 */
					if(anim){
						var widgetTranAnims = screen._transAnim.widgets;
						for (var id in widgetTranAnims){
							if (!anim.widgets[id]){
								anim.widgets[id] = widgetTranAnims[id]
							}
						}
					
					} else {
						/**
						 * If no anim, but and transition anim,
						 * we take the transition!
						 */
						anim = screen._transAnim;
					}
					delete screen._transAnim;
				}
				if(anim){
					this.runScreenAnimation(screenID, anim, "ScreenLoaded", endCallback);
				} 
			}
		},
	
		
		runScreenAnimation (screenID, animation, triggerType, endCallBack, progressCallback){
			this.logger.log(1,"runScreenAnimation","enter >  sreen:" + screenID);
			
	
			
			var animFactory = new Css3Animation();
			var anims2Run = [];
			
			
			var widgets = lang.clone(animation.widgets);
			
			/**
			 * Here we create a copy of the group animations
			 * for every child.
			 * 
			 * To make slides work, we also calculate the offsets,
			 * which will be in the Animation factory method used
			 * to correct the *from* position, so the proportions stay the
			 * same during the animation.
			 */
			var groups = animation.groups;
			if(this.model.groups){
				for(var groupID in groups){
					var groupAnim = groups[groupID];
					var group = this.model.groups[groupID];
					if(group && group.children) {
						var children = group.children;
						
						var bbox = this.getGroupBoundingBox(group.children);
					
						for(var i =0; i< children.length; i++){
							var widgetID = children[i];
							var modelWidget = this.model.widgets[widgetID];
							if(!widgets[widgetID]){
								var widgetAnim = lang.clone(groupAnim);
								widgetAnim.offSet = {
									left: modelWidget.x - bbox.x,
									top : modelWidget.y - bbox.y,
									right : (modelWidget.x + modelWidget.w) - (bbox.x + bbox.w),
									bottom : (modelWidget.y + modelWidget.h) - (bbox.y + bbox.h)
								}
								widgets[widgetID] = widgetAnim;
								
							} else {
								console.warn("runScreenAnimation > Group cannot overwrite widget animation for " + widgetID);
							}
							
						}
					} else {
						// FIXME: this can happen if the group was deleted
						// We should clean up the animations on widget delete or group delete...
						console.warn("runScreenAnimation() > No Group with id", groupID)
					}	
				}
			}
			
			
			for(let widgetID in widgets){
				var widgetAnimation = widgets[widgetID];
				
				/**
				 * Check if we have an factory method
				 */
				if(animFactory["createAnimationEvent_" + widgetAnimation.type]){					
					let animationEvent = animFactory["createAnimationEvent_" + widgetAnimation.type](widgetID, widgetAnimation, this.model);
					if(animationEvent){						
						/**
						 * Like this.renderFactory.createWidgetAnimation(e)
						 */
						var widget = this.renderFactory.getAnimationWrapper(widgetID);					
						if(widget){
							let anim = animFactory.createWidgetAnimation(widget, animationEvent);
							/**
							 * Save to run later.
							 */
							if(anim){
								anims2Run.push(anim);
							}	
						} else {
							console.warn("runScreenAnimation > Not widget for " + widgetID);
						}						
					}
				} else {
					console.warn("runScreenAnimation > Not supported type " + widgetAnimation);
				}
			}
			
			/**
			 * Start the animations only after and have a closure to check
			 * if everything is done. Only then invoke callback
			 */
			var total = anims2Run.length;
			var done = 0;
			var me = this;
			var checkAllDone = function(){
				done++;
				if(total == done){
					me.cleanUpAnimations();
					if(endCallBack){
						endCallBack();
					}
				}
			};
			
			/**
			 * No run the animations...
			 */
			for(let i=0; i < anims2Run.length; i++){
				let anim = anims2Run[i];
				let widgetID = anim.event.id;
				anim.onEnd(checkAllDone);
				if (progressCallback) {
					anim.onStep(progressCallback);
				}
				anim.run();
				this.logAnimationEvent(screenID, widgetID, anim, triggerType);
			} 
			if(total ==0){
				if(endCallBack){
					endCallBack();
				}
			}
			
			this._widgetAnimations = anims2Run;
			
			
		},
		
		/**
		 * Log animation events. Pos is relative for correct playback!
		 */
		logAnimationEvent (screenID, widgetID, anim, triggerType){
			
			var event = lang.clone(anim.event);
			event.triggerType = triggerType;
			if(event.to.pos){
				event.to.pos = this.getRelativePosition(event.to.pos);
			}
			if(event.from.pos){
				event.from.pos = this.getRelativePosition(event.from.pos);
			}	
			this.log("Animation",screenID, widgetID, null, {animation : event});	
		},
		
		getRelativePosition (pos){
			return {
				x : Math.min(1,Math.round((pos.x / this.currentScreen.w ) * 1000) / 1000),
				y : Math.min(1,Math.round((pos.y / this.currentScreen.h ) * 1000) / 1000),
				w : Math.min(1,Math.round((pos.w / this.currentScreen.w ) * 1000) / 1000),
				h : Math.min(1,Math.round((pos.h / this.currentScreen.h ) * 1000) / 1000)
			};
		},
		
		
		cleanUpAnimations (){
			if(this._widgetAnimations){
				for(var i=0; i < this._widgetAnimations.length; i++){
					//this._widgetAnimations[i].stop();
				}
			}
			delete this._widgetAnimations;
		},
		

		
		/**********************************************************
		 *Validation
		 **********************************************************/
		
		onValiationError (screenID, widgetID, e){			
			this.log("ValidationError",screenID, widgetID, null, {type:"value", value: e.value});	
		},
		
		onValiationOK (screenID, widgetID){			
			this.log("ValidationOk",screenID, widgetID, null);	
		},
		
		
		/**********************************************************
		 * On Resize
		 **********************************************************/
		
		onResize (){
			console.debug("onResize");
		},
		
		
		
		/**********************************************************
		 * On Focus and Blur
		 * 
		 * FIXME: http://stackoverflow.com/questions/18110852/input-textbox-hidden-behind-keyboard-on-android-chrome
		 **********************************************************/
	
		onWidgetFocus (screenID, widgetID){
		
			if(has("android")){
				
				/**
				 * If there was a blur some seconds ago, it would reset the
				 * screen size and thus scroll. As we have a new focus element
				 * we surpress the call.
				 */
				if (this._androidBlurTimeout){
					clearTimeout(this._androidBlurTimeout);
					delete this._androidBlurTimeout;
				}
			
				var widget = this.model.widgets[widgetID];
				var screen = this.model.screens[screenID];
				
				if(widget && screen){
					/**
					 * FIXME: 
					 * 
					 * 1) we assume keyboard is roughly 1/3 of screen => get keyboard size
					 * 
					 * 2) check if we need to scroll => check if we are in viewport somehow currentScrollTop
					 * 
					 * 
					 */
					var y = widget.y - screen.y;
					var to = y- (screen.h /3) ;
					if(to > 0){
						this.domNode.style.height = Math.round(screen.h * 1.4) +"px";	
						setTimeout(function(){
							/**
							 * can we animate this
							 */
							window.scrollTo(0, to );
						},50);
					}
					
				}
			}
		},
		
		onWidgetBlur (screenID){
			/**
			 * If there is a blur in android, we have to reset the screen size. This however might
			 * screw up with the click and focus event, as the position is changed and the click
			 * is delegated to the next widget... We will therefore the reset the screen size only in 
			 * 100ms. If there is a focus event right after, it can cancel the timeout call.
			 */
			if(has("android")){
				this._androidBlurTimeout = setTimeout(lang.hitch(this, "_fixAndroidTextBlur",screenID), 100);
			}
		},
		
		_fixAndroidTextBlur (screenID){
			var screen = this.model.screens[screenID];
			if(screen){
				this.domNode.style.height = screen.h +"px";	
			}
			delete this._androidBlurTimeout;
		},
		
		
		/**********************************************************
		 * Mouse Move
		 **********************************************************/
		
		onWidgetMouse (e, clicked){
		
		
			if(this.logMouse){
				var pos = this.getMouse(e);
				var now = new Date().getTime();
				
				/**
				 * Widget events we sample with a higher precision,
				 * as otherwise the animations get bumpy
				 */
				if(now - this.lastMouse > this.mouseSampleRate){
					
					this.initMouseEvent(this.mouseSampleRate);
					
					this._mouseMoveEvent.x.push(pos.x);
					this._mouseMoveEvent.y.push(pos.y);
					this._mouseMoveEvent.c.push(clicked);
					this._mouseMoveEvent.t.push(now);
					
					this.flushMouse();
					
					this.lastMouse = now;
				}
			}
			
			
		},
		
		onMouseWheel (e){
			this.onMouseMove(e);
		},

		onMouseMove (e){
			
			if(this.logMouse){
				var pos = this.getMouse(e);
				var now = new Date().getTime();
				/**
				 * Sample rate 200ms. the rest will be interpolated in the
				 * browser via css animations... Anyhow store the sample rate
				 * so we adapt later in the browser
				 */
				if(now - this.lastMouse > this.mouseSampleRate){
					
					this.initMouseEvent(this.mouseSampleRate);
					
					this._mouseMoveEvent.x.push(pos.x);
					this._mouseMoveEvent.y.push(pos.y);
					this._mouseMoveEvent.c.push(0);
					this._mouseMoveEvent.t.push(now);
					
					this.flushMouse();
					
					this.lastMouse = now;
				}
			}
		},
		
		initMouseEvent (sampleRate){
			if(!this._mouseMoveEvent){
				var user = this.getUser();
				var session = this.getSession();
				
				this._mouseMoveEvent = {
					x:[],
					y:[],
					c:[],
					t:[],
					user:user,
					session:session,
					screen : this.currentScreen.id,
					sample:sampleRate
				};	
				
				if(this.currentOverlay){
					this._mouseMoveEvent.screen = this.currentOverlay.id;
				}
				
			
			}
		},
		
		flushMouse (){
			
			
			/**
			 * flush only 20 events. Attention this is correlated to the sample rate...
			 */
			if(this._mouseMoveEvent && this._mouseMoveEvent.x.length >= 20){
				this.sendMouse();		
			}
		},
		
		
		/**********************************************************
		 * Screen Press
		 **********************************************************/
		
		isScreenEvent (e){
			return (e && css.contains(e.target, "MatcScreen"));
		},
		
		onScreenPress (e){
			this.logger.log(-1,"onScreenPress","enter > " +this.mode);
			
			
			if(this.mode == "debug"){
				this.stopPropagation(e);
			}
			this.cleanUpGestureScreenAnim();
			
			//if(!this.isScreenEvent(e)){
			//	this.logger.log(-1,"onScreenPress","cancel");
			//	return;
			//}
			
			
			/**
			 * FIXME: if i have to registered somehow a mouse listener or something
			 * to surpress scrolling? Then I should only surpress on the right type,
			 * e.g. surpress left and right...
			 */
			if(this.currentScreen){
			
				var lines = this.getFromLines(this.currentScreen);
				// check if we have gestures lines...
				if(lines && lines.length > 0){
					this._screenGestureMoveListener = this.addTouchMove(this.domNode, lang.hitch(this, "onScreenGestureMove"));
					// FIXME: move to 
					// https://bugs.chromium.org/p/chromium/issues/detail?id=682795#
					this._gesturePressListener = on(this.domNode, 'touchend', lang.hitch(this, "onScreenRelease"));
				}
				this._screenPressEvent = e;
				this._screenGestureStart = this._getGestureMousePosition(e);
				this._screenGestureStartScreenID = this.currentScreen.id;
			}
			
		
			return true;
		},
		
		onScreenGestureMove (e){
			this.logger.log(0,"onScreenGestureMove","enter");
			if(!this._screenGestureStart){
				console.warn("onScreenGestureMove() > Exit no start event");
				this.cleanUpGestureScreenAnim();
				return;
			}
			
			var endEvent = this._getGestureMousePosition(e);
			if(!this._screenGestureType){
				this._screenGestureLine = this.getScreenAnimationLine(endEvent);
			}
			
			if(this._screenGestureLine){
				var p = this.getScreenGestureProgress(endEvent);
				this.executeGestureAnimation(p, this._screenGestureLine);
			}
		
		},

		onScreenRelease (e){
			this.logger.log(0,"onScreenRelease","enter " + (this._screenPressEvent!=null));

		
			if(this.currentScreen && this._screenPressEvent ){
			
				let startWidget = this.getWidgetIDFromEvent(this._screenPressEvent);
				let endWidget = this.getWidgetIDFromEvent(e);
			
				var endEvent = this._getGestureMousePosition(e);
				var type = this.getGestureType(this._screenGestureStart, endEvent);
				
				/**
				 * For backward compability with default behavior and support bagdrop
				 */
				if(type == "click"){

					/**
					 * If we have a click in the same widget, we cancel
					 * the action here. The click is handlet bz the normal
					 * wiring in the widgets.
					 */
					if (startWidget && startWidget == endWidget){
						this.logger.log(1,"onScreenRelease","Cancel because widget click");
						delete this._screenPressEvent;
						delete this._screenGestureStart;
						return
					}

					this.log("ScreenClick",this.currentScreen.id, null, e);
					this.popOverlay();
				}
				
				var gesture = {
					type: type,
					start : this._screenGestureStart,
					end: endEvent
				};

				/**
				 * Check here if we have a widget event, if so dispatch the widget.
				 * 
				 * FIXME: Maybe we should just check for a start widget on not end. 
				 * Otherwise, tiny tragets would nto work? 
				 */
				if (startWidget && startWidget == endWidget){
					let widget = this.model.widgets[startWidget];
					if (widget) {
						var lines = this.getLinesForWidget(widget);
						if (lines) {
							this.logger.log(1, "onScreenRelease","Cancel because widget gesture "  + type);
							this.onWidgetGesture(this.currentScreen.id, widget.id, lines, gesture, this._screenPressEvent, e)
							delete this._screenPressEvent;
							delete this._screenGestureStart;
							return
						}
					}
				}
				
				if(this._screenGestureAnim){
					this.fixGestureCoords(gesture, this._screenPressEvent, e)
					this.finishScreenGestureAnimation(gesture);
				} else {
					this.onScreenGesture(gesture, this._screenPressEvent, e);
					this.cleanUpGestureScreenAnim();
				}
				
			}
			delete this._screenPressEvent;
			delete this._screenGestureStart;
		},

		getWidgetIDFromEvent (e) {
			let node = e.target
			let widgetID = null;
			
			while(widgetID == null && node) {
				widgetID = node.getAttribute('widgetID')
				if (widgetID) {
					return widgetID
				}
				let screenID = node.getAttribute('screenID')
				if (screenID) {
					return 
				}
				node = node.parentNode
			}
		},
		
		onWidgetGestureAnim (screenID, widgetID, start, endEvent){
			if(!this._screenGestureStart){
				this._screenGestureStart = start;
				this._screenGestureStartScreenID = screenID
			}
			
			if(!this._screenGestureType){
				this._screenGestureLine = this.getWidgetAnimationLine(widgetID, endEvent);
			}
	
			if(this._screenGestureLine){
				var p = this.getScreenGestureProgress(endEvent);
				this.executeGestureAnimation(p, this._screenGestureLine);
			}
		},
		
		
		getWidgetAnimationLine (widgetID, endEvent){
			var type = this.getGestureType(this._screenGestureStart, endEvent);
			
			if(type!="none" && type!="click" && type!="longclick"){
				this._screenGestureType = type;
				var widget = this.model.widgets[widgetID];
				if(widget){
					var lines = this.getFromLines(widget);
					if(lines){
						var line = this.getLineForGesture(lines, type);
						if(line && line.animation){	
							return line;
						}
					}
				} else {
					console.warn("getWidgetAnimationLine() > no widget with id ", widgetID)
				}
				
			}
		},
	
		
		
		getScreenAnimationLine (endEvent){
			var type = this.getGestureType(this._screenGestureStart, endEvent);
		
			if(type!="none" && type!="click" && type!="longclick"){
				this._screenGestureType = type;
				var lines = this.getFromLines(this.currentScreen);
				if(lines){
					var line = this.getLineForGesture(lines, type);
					if(line && line.animation){	
						return line;
					}
				}
			}
		},
		
		getScreenGestureProgress (endEvent){
			if( this._screenGestureType=="swipeLeft"){
				let difX =(this._screenGestureStart.x - endEvent.x);
				return difX / this.screenPos.w;
			}
			if(this._screenGestureType == "swipeRight"){
				let difX =(endEvent.x - this._screenGestureStart.x);
				return difX / this.screenPos.w;
			}
			if(this._screenGestureType == "swipeDown"){
				let difY =(endEvent.y - this._screenGestureStart.y);
				return difY / this.screenPos.h;
			}
			if(this._screenGestureType == "swipeUp"){
				let difY =(this._screenGestureStart.y - endEvent.y);
				return difY / this.screenPos.h;
			}
			return 0;
		},
		
		executeGestureAnimation (p, line, screenID){
			p = Math.max(0,p);
			
			if(!this._screenGestureAnim){
				var screen = this.model.screens[line.to];
				if(screen){		
					this.loadingScreen = screen;
					if(screen.style.overlay){
						this._screenGestureAnim = this.renderOverlay(line, screenID, true);
					} else {
						this._screenGestureAnim = this.renderTransition(line,screenID, true);		
					}	
					// FIXME: Add widget stuff
				}
			}

			if(this._screenGestureAnim){
				this._screenGestureAnim.setP(p);
			}
		},
		
		
		
		fixGestureCoords (gesture, startEvent, endEvent){
			if(gesture.start){
				let pos = this.getMouse(startEvent);
				gesture.start.x = pos.x;
				gesture.start.y = pos.y;
			}
			if(gesture.end){
				let pos = this.getMouse(endEvent);
				gesture.end.x = pos.x;
				gesture.end.y = pos.y;
			}	
		},
		
		finishScreenGestureAnimation (gesture){
			
			/**
			 * FIXME: Check if we have to cancel and run anim reverse,
			 * e.g. if p > 0.5 and the movement was backwards..
			 * 
			 * 1) this._screenGestureAnim.reverse();
			 * 2) after reverse render current screen!
			 */
			
			/**
			 * add line to history for backdrop and back button!
			 */
			this.logLine(this._screenGestureLine, this._screenGestureStartScreenID);
			
			/**
			 * Log gesture
			 */
			this.log("ScreenGesture",this.currentScreen.id, null, null, {"gesture" : gesture} );
			
			/**
			 * Log also a screen animation so we can replay it
			 * 
			 * FIXME: Add later the mouse points..
			 */
			var line  = this._screenGestureLine;
			if(line){
				var screen = this.model.screens[line.to];
				if(screen){
					var duration = gesture.end.t - gesture.start.t;
					if(screen.style.overlay){
						this.log("OverlayShowAnimation", this.currentScreen.id, null, null, {animation: {type:line.animation, to:line.to, duration: duration, overlay:true, easing:line.easing}});
					} else {
						this.log("ScreenAnimation", this.currentScreen.id, null, null, {animation: {type:line.animation, to:line.to, duration: duration, easing : line.easing}});
					}
				}
			}
			
			
			/**
			 * Finish animation and cleanup after
			 */
			this._screenGestureAnim.cont();
			this.cleanUpGestureScreenAnim()
		},
		
		
		onScreenGesture (gesture, startEvent, endEvent){
		
			this.fixGestureCoords(gesture, startEvent, endEvent)
			
			if(this.currentScreen){
				var lines = this.getFromLines(this.currentScreen);
				if(gesture && lines){
					var line = this.getLineForGesture(lines, gesture.type);
					if(line){	
						/**
						 * Make gesture pos relative
						 */
						if(gesture.type != "click"){
							this.log("ScreenGesture",this.currentScreen.id, null, null, {"gesture" : gesture} );
						}
						this.executeLine(this.currentScreen.id, "", line);		
					} else {
						console.debug("onScreenGesture > no line ", gesture, lines)
					}
				}
			}
		},
		
		onScreenClickFromWidget (screenID, widgetID){
			this.logger.log(0,"onScreenClickFromWidget","enter > " + screenID + " > widget:" + widgetID);
			
			
			if(this.currentScreen){
				var lines = this.getFromLines(this.currentScreen);
				console.debug('onScreenClickFromWidget', lines, this.currentScreen, this.model.lines)
				if(lines){
					var line = this.getLineForGesture(lines, "click");
					if(line){	
						this.executeLine(this.currentScreen.id, "", line);			
					} 
				}
			} else {
				console.debug('No current')
			}
		},
		
		/**********************************************************
		 * Scrolling
		 **********************************************************/
		onVommondScroll (p, scrollTop){
		
			this.onScroll(scrollTop);
		},
	
		onScrollWindow (e){
			/**
			 * After scroll animations we do not want to scroll
			 */
			if (this._preventScroll){
				this.stopEvent(e)
				window.scrollTo(0, 0);
				return false;
			}
			
			var scrollTop = (window.pageYOffset !== undefined) 
				? window.pageYOffset 
				: (document.documentElement || document.body.parentNode || document.body).scrollTop;
	
			this.onScroll(scrollTop);
		},
		
		onScrollParent (e){

			var node = e.target;
			var scrollTop = (node.pageYOffset !== undefined) ? node.pageYOffset : node.scrollTop;
			this.onScroll(scrollTop);
		},
		
		onScroll (scrollTop){
			
			var p = (scrollTop / this.currentScreen.h);
			var now = new Date().getTime();
			if(this.logScroll){
				/**
				 * We do not want to record all scroll events. We stick to 
				 * every 30ms...
				 */				
				var event = {
					time : now,
					value : p
				};
				if(now - this.lastScroll > 30){
					if(this.currentScreen){
						if(!this._scrollEvent){
							this._scrollEvent = {
								time: now,
								children : [],
								type: "scroll"
							}
						}
						this._scrollEvent.children.push(event)
					}
					this.lastScroll = now;
					
					this._scrollFlushTimeout = setTimeout(lang.hitch(this,"flushScroll", this.currentScreen.id), 530);
				} 
				
				this._lastScrollEvent = event;
				this.currentScrollTop = scrollTop;
				this.currentScrollTopRelative = p;
			}
			
			this.gestureLastScroll = now;			
			topic.publish("MatcSimulatorScrollEvent", p, scrollTop);
			
			this.fireScrollEvents(scrollTop)
		},

	
		/**
		 * Check here for all the registered scroll widgets,
		 * if thez are in the view.
		 * 
		 * This works currentlz onlz for down scrolls
		 */
		fireScrollEvents (scrollTop) {
			if (this._scrollWidgets && this.currentScreen) {
				let offset = this.currentScreen.y + this.screenPos.h 
				for (let i=0; i < this._scrollWidgets.length; i++) {
					let widget = this._scrollWidgets[i].w;
					let line = this._scrollWidgets[i].l
					if (widget.y - offset - 1 < scrollTop) {
						this.preventNextScrolls()
						this.executeLine(this.currentScreen.id, widget.id, line)
						return
					}
				}
			}
		},

		/**
		 * On mobile the scrolls can have to much momentum,
		 * and the screen continues scrolling after the scroll transtion
		 * was fired. we block this for some time.
		 */
		preventNextScrolls () {
			this._preventScroll = true;
			setTimeout (() => {
				this._preventScroll = false
			}, 1000)
		},

		/**
		 * We wait until a scroll is complete, this means after a second.
		 */
		flushScroll (screenID){
			var now = new Date().getTime();
			if(now - this.lastScroll > 250 && this._scrollEvent){
				/**
				 * Add the last event, so we have 4 sure the last scroll position
				 */
				this._scrollEvent.children.push(this._lastScrollEvent)
				this._scrollEvent.value = this._lastScrollEvent.value;
				
				if(this._scrollEvent.children.length > 0){
					var start = this._scrollEvent.children[0];
					if(start.value > this._lastScrollEvent.value){
						this._scrollEvent.dir ="up";
					} else {
						this._scrollEvent.dir ="down";
					}
				}
			
				
				this.log("ScreenScroll", screenID, null, null, this._scrollEvent);
				delete this._scrollEvent;
				delete this._lastScrollEvent;
				delete this._scrollFlushTimeout;
			} else {
//				console.debug("cancelFlush");
			}
		},
		
		
		scrollToSamePosition (pos){
				
			/**
			 * we do not need to do this??
			 * Funny. But log the scroll event
			 */
//			if(this.scrollListenTarget == "window"){
//				window.scrollTo(0, pos);
//			} else {
//				if(this.scrollContainer){
//					this.scrollContainer.setScrollTop(pos);
//				}
//			}
			/**
			 * Log scroll event, so the player moves to the right position.
			 * 
			 * FIXME: This causes a small flickering in the 
			 * player. We should somehow add the scroll position
			 * to the pageload event?
			 * 
			 */
			this.onScroll(pos);
		},
		
		setScrollContainer (s){
			this.scrollContainer = s;
		},
		
		
		
		/**********************************************************
		 * Log
		 **********************************************************/
		
		logSessionStart (screenID){
			
			this.log("SessionStart",screenID, null, null, {
				"device" : {
					"w" : this.screenPos.w,
					"h" : this.screenPos.h,
					"qr" : this.qr
				}
			});
		},
		
		log (type, screenID, widgetID, e, widgetEvent){
			this.logger.log(2,"log","enter > type:" + type+ " > sreen:" + screenID + " > widget:" + widgetID);
			
			topic.publish("MatcSimulatorEvent", type, screenID, widgetID);
			
			var event = this.createBaseEvent(type, screenID, widgetID);
			
			var mouse = this.getMouse(e,this.isFixedPosition(widgetID));
			event.x = mouse.x,
			event.y = mouse.y;
			
			
			if(widgetEvent){
				if(widgetEvent.type || widgetEvent.value){
					event.state ={
						type : widgetEvent.type,
						value : widgetEvent.value,
					};
					
					if(widgetEvent.children){
						event.state.children = widgetEvent.children;
					}
				
					if(widgetEvent.options){
						event.state.options = widgetEvent.options;
					}
					
				}
				
				if(widgetEvent.device){
					event.device =  widgetEvent.device;
				}
				
				if(widgetEvent.gesture){
					event.gesture = widgetEvent.gesture;
				}
				
				
				if(widgetEvent.noheat){
					event.noheat = widgetEvent.noheat;
				}
				
				if(widgetEvent.time){
					event.time = widgetEvent.time;
				}
				
				if(widgetEvent.animation){
					event.animation = widgetEvent.animation;
				}
				
				if(widgetEvent.overlay){
					event.overlay = widgetEvent.overlay;
				}
			}		
			
			if(this.currentOverlay && !event.overlay){
				event.overlay = this.currentOverlay.id;
			}
			
			if(this.logData){
				this.sendEvent(event);
			} else {
				if(type!="Animation" && type!="MouseOut" && type!="MouseOver"){
					console.debug("log() >" , type, " > s:" , screenID, " > w:", widgetID, " > state:", event.state, " > anim:", event.animation, " > overlay:", event.overlay);
				}
			}
			
			this.emit("event", event);
		},
		
		
		logShowOverlay (overlay){
			this.log("OverlayLoaded", this.currentScreen.id, null, null, {overlay : overlay.id});
		},
		
		logHideOverlay (overlay){
			this.log("OverlayRemoved", this.currentScreen.id, null, null, {overlay : overlay.id});
		},
		
		isFixedPosition (widgetID){
			var widget = this.model.widgets[widgetID];
			if(widget && widget.style.fixed){
				console.debug("isFixedPosition", widget, widget.style.fixed)
				return true;
			}
			return false;
		},
		
		isFixedOverlay (){
			if(this.currentOverlay && this.currentOverlay.style.fixed){
				return true;
			}
			return false;
		},
		
		/**********************************************************
		 * Helper
		 **********************************************************/
		
		createBaseEvent (type, screenID, widgetID){
			var user = this.getUser();
			var session = this.getSession();
			var event = {
				session : session,
				user : user,
				screen : screenID,
				widget : widgetID,
				type : type,
				time : new Date().getTime(),
				scrollTop : this.currentScrollTopRelative
			};
			return event;
		},
		
		async sendEvent (event){
			/**
			 * depending on the mode, we have to use different REST end points :-(
			 */
			if(this.qr || this.hash){
				let res = await Services.getModelService().saveEvent(this.model.id, this.hash, event)
				this.onSaved(res)
				// this._doPost("rest/invitation/" + this.model.id + "/"+ this.hash + "/events.json", event, "onSaved");
			} else {
				console.warn("DEPRECATED END POINT")
				// this._doPost("rest/events/" + this.model.id + ".json", event, "onSaved");
			}
			event = false
			
			/**
			 * we force to send the mouse!!
			 */
			this.sendMouse();	
		},
		
		async sendMouse (){
			this.logger.log(3,"sendMouse","enter");
			if(this._mouseMoveEvent){
				if(this.logData && this.hash && this._mouseMoveEvent){
					let res = await Services.getModelService().saveMouse(this.model.id, this.hash, this._mouseMoveEvent)
					this.onMouseSaved(res)
					// this._doPost("rest/invitation/" + this.model.id + "/"+ this.hash + "/mouse.json", this._mouseMoveEvent, "onMouseSaved");
				} else {
					this.logger.log(2,"sendMouse","enter");
				}
			}
			delete this._mouseMoveEvent;
		},
		
		
		renderWidget (screen, widget){
			var div = this.createBox(widget, screen);
			div.setAttribute('widgetID', widget.id)
			css.add(div, "MatcWidget");		
			this.renderFactory.createWidgetHTML(div, widget);
			return div;
		},
		
		
		createBox (box, parentBox){
			var div = document.createElement("div");
			div.style.width = box.w + "px";
			div.style.height = box.h + "px";
			
			// templated elements have no style...
			var style = this.getStyle(box)
			if (!style) {
				style = box.style;
			}
			if(style.fixed){
				
				/**
				 * A hacky method to allow fixed elements!!!
				 */
				div.style.position = "fixed";
				
				/**
				 * Here is a bug when we have scrolling... 
				 * cannot we add the stupid element to the parent or whatever domnode that does not scroll?
				 * No does not work in mobile...
				 */
				if(this.screenPos && parentBox){
					div.style.top = (box.y -parentBox.y) + this.screenPos.y + "px";
					div.style.left = (box.x -parentBox.x) + this.screenPos.x + "px";
				} else {
					console.warn("createBox() > no screenPos or parentBox for fixed box!")
				}
				
			} else {
				if(parentBox){
					div.style.top = (box.y -parentBox.y) + "px";
					div.style.left = (box.x -parentBox.x) + "px";
				} else {
					console.warn("createBox() > no parent passed!");
				}
			}
			
			return div;
		},
		
		
		scrollToTop (){			
			if(this.mode != "debug" && this.mode!= "recordFlow"){
				this.logger.log(-1,"scrollToTop","enter");				
				window.scrollTo(0, 0);
				/**
				 * Also set last scroll, so the onScroll() method will
				 * ignore the event from this forced scrolling
				 */
				this.lastScroll = new Date().getTime();
			} else {	
				if(this.scrollListenTarget !== "window"){
					this.logger.log(-1,"scrollToTop","enter > parent");	
					this.domNode.parentNode.scrollTop = 0
				}
			}
			
			/**
			 * Notify the ScrollContainer
			 */
			topic.publish("VommondScrollContainerScrollToTop");
			this.currentScrollTop = 0;
			this.currentScrollTopRelative = 0;
		},

			
		onSaved (){
			this.logger.log(2,"onSaved","enter");		
		},
		
		onMouseSaved (){
			
		},
		
		
		getMouse (e, isFixedPosition){
			if(e){
				
				var domPos = domGeom.position(this.domNode);
				var pos = this._getMousePosition(e);
								
				/**
				 * Somehow compensate of scrolling. If we have fixed position
				 * ignore the scroll. 
				 * 
				 * FIXME: This does not work at all!
				 */
				if(!isFixedPosition){			
					var doc = document.documentElement;
					var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
					domPos.y += top;
				}else {
					/**
					 * FIXME: What about the Scroller.js which set the x to negative... we should check that somehow...
					 */
				}
			
				/**
				 * get pixel position in domNode
				 */
				pos.x -= (domPos.x);
				pos.y -= (domPos.y);
				
				/**
				 * make relative to compensate different scalings
				 */
				pos.x = Math.min(1,Math.round((pos.x / this.currentScreen.w ) * 1000) / 1000);
				pos.y = Math.min(1, Math.round((pos.y / this.currentScreen.h) * 1000) / 1000);
				
				return pos;
			} else {
				return {"x":-1, "y":-1};
			}
		},
		

		 _getMousePosition (e){	 
		     var result = {};
		    if (e.touches && e.touches.length > 0) {
				e = e.touches[0]
				result.x = e.clientX;
				result.y = e.clientY;
			} else if (e.changedTouches && e.changedTouches.length > 0 ) {
				e = e.changedTouches[0]
				result.x = e.clientX;
				result.y = e.clientY;
			} else {
				result.x = e.pageX;
				result.y = e.pageY;
			}
		     return result;
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
	    	this.logger.log(0,"destroy","enter");
	    	
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
    }
}
</script>