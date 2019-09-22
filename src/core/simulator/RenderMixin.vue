<template>
  <div>
  </div>
</template>
<script>
import hash from 'dojo/hash'
import touch from 'dojo/touch'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import domGeom from 'dojo/domGeom'

export default {
	name: 'RenderMixin',
    methods: {
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
					/**
					 * Since 2.1.1 we render we do the databinding directly in
					 * createWidget()
					 */
					//this.initDataBinding(uiWidget, screen);
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
			 * 2.1.1 Do the data binding here, so that the repeater will
			 * return the correct children
			 */
			let uiWidget = this.renderFactory.getUIWidget(widget);
			if (uiWidget){
				this.initDataBinding(uiWidget, screen);
			}

			/**
			 * Wire shit together
			 */
			this.wireWidget(widget, screen, screenId, w)

			/**
			 * For container widgets we wire all the children and add
			 * them to the model.
			 */

			if (widget.isContainer){
				let cntrWidget = this.renderFactory.getUIWidget(widget);
				if (cntrWidget){
					/**
					 * Get list of 'virtual' elements, plus the div so 
					 * we can wire stuff together
					 */
					let children = cntrWidget.getChildren()
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
			if (lines && lines.length > 0){
				let line = this.getLineForGesture(lines, "scroll");
				if (line){
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
			this.lastScreen = this.currentScreen;
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
							this.removeScreen(oldScreenDiv);     
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
        
        /**
		 * Get called by the renderfactory
		 */
		onWidgetInit (e){		
			if(this.loadingScreen){
				this.log("WidgetInit",this.loadingScreen.id, e.id, null, e.state);
			}	
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
				 * Read the screen position a every time, because
				 * the animation...
				 */
				let screen = domGeom.position(this.domNode);
				
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
					div.style.top = (box.y - parentBox.y) + screen.y + "px";
					div.style.left = (box.x - parentBox.x) + screen.x + "px";
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
		}
    }
}
</script>