<template>
	<div>
	</div>
  </template>
  <script>
  import has from 'dojo/has'
  import on from 'dojo/on'
  import lang from 'dojo/_base/lang'
  import css from 'dojo/css'
  import ModelUtil from 'core/ModelUtil'
  import * as WorkFlowEngine from './WorkFlowEngine'
  
  export default {
	  name: 'EventMixin',
	  methods: {
  
		  executeAction (screenID, widgetID, action, eventType, e) {
			  this.logger.log(-2,"executeAction","enter >  sreen:" + screenID +  " > widget: "  + widgetID + " > eventType:" + eventType, e);
			  this.stopEvent(e);
			  this.log("WidgetClick",screenID, widgetID, e);
  
			  const datachanges = WorkFlowEngine.executeAction(action, this.dataBindingValues)
		  
			  datachanges.forEach(change => {
				  this.logger.log(-2,"executeAction","change", change);
				  this.onUIWidgetDataBinding(screenID, widgetID, change.path, change.value)
			  }) 
		  },
  
		  onDomMouseOver (screenID, widgetID, e){
			  this.logger.log(2,"onDomMouseOver","enter >  sreen:" + screenID + " > widget:" + widgetID);
  
			  var widget = this.model.widgets[widgetID];
			  if (widget){
				  var hover  = ModelUtil.getTemplatedStyle(widget, this.model, 'hover');
				  if (hover) {
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
						  return
					  }
				  }
				  /**
				   * Since 4.0.60 we have template transitions
				   */
				  this.fireTemplateLineIfNeeded(screenID, widgetID, "mouseover")
  
				  /**
				   * Since 4.1.06 we have tooltips
				   */
				  this.showTooltip(widgetID)
				  
			  } else {
				  console.warn('EventMixin could not find', widgetID)
			  }
			  this.onMouseMove(e);
		  },
  
		  onDomMouseOut (screenID, widgetID,e){
			  this.logger.log(2,"onDomMouseOut","enter >  sreen:" + screenID + " > widget:" + widgetID);
			  var widget = this.model.widgets[widgetID];
  
			  if (widget) {
				  var hover  = ModelUtil.getTemplatedStyle(widget, this.model, 'hover');
				  if (hover) {
					  var style  = ModelUtil.getTemplatedStyle(widget, this.model, 'style');
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
  
				  /**
				   * Since 4.0.60 we have template transitions
				   */
				  this.fireTemplateLineIfNeeded(screenID, widgetID, "mouseout")
  
				  /**
				   * Since 4.1.06 we have tooltips
				   */
				  this.hideTooltip(screenID, widgetID)
			  }
  
			  this.onMouseMove(e);
			  //this.log("MouseOut",screenID, widgetID, null);
		  },
  
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
  
  
		  onWidgetMouseOver (screenID, widgetID,e){
			  this.onMouseMove(e);
			  const widget = this.model.widgets[widgetID];
			  if (widget) {
				  var lines = this.getLinesForWidget(widget);
				  if (lines){
					  var line = this.getLineForGesture(lines, "hover");
					  if (line) {
						  this.logger.log(1,"onWidgetMouseOver","enter > run line");				
						  this.executeLine(screenID, widgetID, line);
						  return
					  }
					  /**
					   * Since 4.0.60 we have template transitions
					   */
					  this.fireTemplateLineIfNeeded(screenID, widgetID, "mouseover")
  
				  }
			  }
  
			  /**
			   * Since 4.1.06 we have tooltips
			   */
			  this.showTooltip(widgetID)
		  },
  
		  onWidgetMouseOut (screenID, widgetID,e){
			  this.onMouseMove(e);
  
			  /**
			   * Since 4.1.06 we have tooltips
			   */
			  this.hideTooltip(screenID, widgetID)
		  },
  
		  onWidgetGesture (screenID, widgetID, lines, gesture, startEvent, endEvent){
			  this.logger.log(2,"onWidgetGesture","enter >  sreen:" + screenID + " > widget:" + widgetID + " > "+ gesture.type);
		  
			  if(gesture && lines){
				  const line = this.getLineForGesture(lines, gesture.type);
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
  
  
		  onWidgetClick (screenID, widgetID, e){
			  this.logger.log(1,"onWidgetClick","enter >  sreen:" + screenID + " > widget:" + widgetID);
			  this.stopPropagation(e);
			  this.log("WidgetClick",screenID, widgetID, e);
  
			  /**
			   * Add here also a call to flushOutputDataBinding()???
			   */
  
			  /**
			   * Dispatch Screen Line?
			   */
			  this.onScreenClickFromWidget(screenID, widgetID, e);
		  },
  
  
		  onWidgetEvent (screenID, widgetID, uiWidget, line, widgetEvent){
			  this.logger.log(1,"onWidgetEvent","enter >  sreen:" + screenID + " > widget:" + widgetID);
		  
			  if (widgetEvent.e){
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
  
		  onWidgetRerended (screenID, widgetID) {
			  this.logger.log(-1,"onWidgetRerended","enter >  sreen:" + screenID + " > widget:" + widgetID);
			  const widget = this.model.widgets[widgetID]
			  if (widget) {
				  this.wireContainer(widget, screenID)
			  }
		  },
  
		  onWidgetNavigation (screenID, widgetID, targetScreenID) {
			  this.logger.log(-1,"onWidgetNavigation","enter >  targetScreen:" + targetScreenID);
			  
			  const line = {
				  from: widgetID,
				  to: targetScreenID
			  }
			  this.executeLine(screenID, widgetID, line)
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
		   * Screen Press
		   **********************************************************/
  
		  isScreenEvent (e){
			  return (e && css.contains(e.target, "MatcScreen"));
		  },
  
		  onScreenPress (e){
			  this.logger.log(2,"onScreenPress","enter > ", this.mode);
  
			  if (this.mode === "debug") {
				  this.stopPropagation(e);
			  }
			  this.cleanUpGestureScreenAnim();
  
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
			  this.logger.log(1,"onScreenGestureMove","enter");
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
  
			  if (type!="none" && type!="click" && type!="longclick"){
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
				  const lines = this.getFromLines(this.currentScreen);
				  if(gesture && lines){
					  const line = this.getLineForGesture(lines, gesture.type);
					  if (line){
						  /**
						   * Make gesture pos relative
						   */
						  if(gesture.type != "click"){
							  this.log("ScreenGesture",this.currentScreen.id, null, null, {"gesture" : gesture} );
						  }
						  this.executeLine(this.currentScreen.id, "", line);
					  } else {
						  this.logger.log(2, "onScreenGesture > no line ", gesture, lines)
					  }
				  }
			  }
		  },
  
		  onScreenClickFromWidget (screenID, widgetID){
			  this.logger.log(1,"onScreenClickFromWidget","enter > " + screenID + " > widget:" + widgetID);
			  if(this.currentScreen){
				  const lines = this.getFromLines(this.currentScreen);
				  if (lines){
					  var line = this.getLineForGesture(lines, "click");
					  if(line){
						  this.executeLine(this.currentScreen.id, "", line);
						  return
					  }
				  }
				  /**
				   * Since 4.0.60 we also check template lines
				   */
				  this.fireTemplateLineIfNeeded(screenID, widgetID, "click")		
			  } else {
				  console.debug('No current')
			  }
		  },
  
		  onValiationError (screenID, widgetID, e){
			  this.log("ValidationError",screenID, widgetID, null, {type:"value", value: e.value});
		  },
  
		  onValiationOK (screenID, widgetID){
			  this.log("ValidationOk",screenID, widgetID, null);
		  }
	  }
  }
  </script>