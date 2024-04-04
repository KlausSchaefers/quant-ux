<template>
	<div class="MatcSimulator">
		<Splash :hash="hash" :model="model" :settings="settings" @start="onStart"  v-if="hasSplash"/>
	</div>
  </template>
  <style lang="scss">
	@import "../style/simulator.scss";
	@import "../style/widgets/all.scss";
  </style>
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
  import TemplateMixin from 'core/simulator/TemplateMixin'
  import ScriptMixin from 'core/simulator/ScriptMixin'
  import TooltipMixin from 'core/simulator/TooltipMixin'
  import Preloader from 'core/simulator/Preloader'
  import Splash from '../views/simulator/Splash.vue'

  
  import ModelUtil from 'core/ModelUtil'
  
  import Gestures from 'core/Gestures'
  
  export default {
	  name: 'Simulator',
	  props: ['mode', 'app', 'hasPreload'],
	  mixins:[
		  Layout, Gestures, RestMixin, LogMixin, RenderMixin, EventMixin,ScriptMixin, TooltipMixin,
		  ScrollMixin, AnimationMixin, MouseMixin, DataBindingMixin, TemplateMixin, DojoWidget
	  ],
	  data: function () {
		  return {
				hasSplash: false,
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
				settings: null,
				step: 0,
				maxEventCount: 1000,
				model: {},
				password: '',
				passwordError: '',
				doNotExecuteScripts: false
		  }
	  },
	  components: {
		'Splash': Splash
	  },
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
  
			  const uri = location.hash;
			  const query = uri.substring(uri.indexOf("?") + 1, uri.length);
			  const params = io.queryToObject(query);
			  this.initDataFromURL(params)
  
			  this.initNLS()
		  
  
			  /** Since 2.4 we allow to pass a user */
			  if (params.u && params.u.length > 0) {
				  this._user = params.u
				  this.logger.log(0, 'postCreate', 'set user bu url', this._user)
			  }
  
			  if(params.s == "true"){
				  this.logger.log(-1, 'postCreate', 'skip splash')
				  this.skipSplash = true;
			  }
  
			  if(this.mode == "standalone"){
				  // FIXME: On reloads this may cause issues because we get several screens
				  this.baseURI = uri
			
  
				  if(params.live == "true"){
					  this.live = true;
					  this.hasSplash = false
				  }
  
				  if(params.qr == "true"){
					  this.qr = true;
					  this.showSplashScreen()
					  this.own(on(window, "popstate", lang.hitch(this, "onPopState")));
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
  
				  if (params.h){
					  let hash = params.h
					  if (hash.length < 60) {
						  this.showPassword(hash)
					  } else {
						  this.setInvitation(params.h);
						  Services.getModelService().findAppByHash(params.h).then(app => this.loadSettings(app))
					  }
				  }
  
			  } else {
				this.hasSplash = false
				if(this.hash) {
					this.renderFactory.hash = this.hash;
				}
			  }
  
			  this.own(this.addTouchStart(this.domNode,lang.hitch(this, "onScreenPress")));
			  this.own(this.addTouchRelease(this.domNode, lang.hitch(this, "onScreenRelease")));
			  this.own(topic.subscribe("MatcSimulatorRenderFixedPopup", lang.hitch(this, "addFixedPopup")));
			  this.logger.log(0,"postCreate","exit > mode : " + this.mode + " > logData : " + this.logData + " > qr : " + this.qr  + " > embedded:" + this.embedded);
		  },
  
		  setHash (h) {
			  this.logger.log(2,"setHash","enter");
			  this.setInvitation(h)
		  },
  
		  setDebug (d){
			  this.debug = d;
		  },
  
		  showPassword (hash) {
			  this.logger.log(-1,"showPassword","enter");
			  this.step = 6
			  this.tempHash = hash
		  },
  
		  showPasswordError () {
			  this.passwordError = 'The password is wrong'
		  },
  
		  async setPassword () {
			  this.logger.log(-1,"setPassword","enter", this.password);
			  let newHash = this.tempHash + this.password
			  try {
				  let app = await Services.getModelService().findAppByHash(newHash)
				  if (app) {
					  this.setInvitation(newHash);
					  this.loadSettings(app)
				  } else {
					  this.showPasswordError()
				  }
			  } catch (e) {
				  this.showPasswordError()
			  }
		  },
  
		  setInvitation (h){
			  this.logger.log(1,"setInvitation","enter > " + h);
			  this.hash = h;
			  if (this.renderFactory) {
				  this.renderFactory.setHash(h);
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
			  const app = await Services.getModelService().checkAppUpdateByHash(this.hash)
			  this.setLiveUpdate(app)
		  },
  
		  async setLiveUpdate (app){
			  if (app && app.lastUpdate && this.model && this.model.lastUpdate < app.lastUpdate){
				  const app = await Services.getModelService().findAppByHash(this.hash)
				  this.doLiveUpdate(app)
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
				  this.model = ModelUtil.inlineTemplateStyles(this.model)
				  this.initRootTemplateLines(this.model)
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
				if (!this.live) {
					this.logger.log(-2,"showSplashScreen","enter >");
					this.hasSplash = true
					css.add(this.domNode, "MatcSimulatorSplash MactMainGradient");
					this._splashTime = new Date().getTime();
				}
		  },
  
		  async loadSettings (model) {
			  if (this.hash && this.qr) {
				  const settings = await Services.getModelService().findTestByHash(model, this.hash)
				  this.settings = settings;
				  this.applyTestSettings(settings)
				  this.logger.log(-1,"loadSettings","enter >", this.settings);
			  }
			  this.setModel(model)
		  },
  
		  applyTestSettings (settings) {
			  if (settings.recordOneTestPerUser === true) {
				  const key = 'quxSession' + settings.appID
				  const userHasTested = localStorage.getItem(key)
				  if (userHasTested === 'true') {
					  this.logData = false
					  this.logger.log(-1,"applyTestSettings","DO NOT LOG DATA >> " + key);
				  }
				  localStorage.setItem(key, 'true')
			  }
		  },
  
		  setModel (model){
			  this.logger.log(1,"setModel","enter > step:" + this.step, this._splashTime );
			  if (model == null) {
				  this.logger.error("setModel","exit > No model");
				  location.href = location.protocol + "//" + location.host + "/404.html";
			  } else {
				  this.logger.log(1,"setModel","enter >" + model.id + " > splash : "+ this._splashTime);
				  this.model = model;
				  this.initRootTemplateLines(model)
				  if(this.hash){
					  this.preloadImages();
				  }
				  if(this._splashTime > 0 && this.skipSplash !== true){
  
					  this.logger.log(-1,"setModel","show splash");
					  /**
					   * If we can by splash screen make sure we show it long enough...
					   */
					  var t = Math.max(3000 - (new Date().getTime() - this._splashTime),0);
					  setTimeout(() => {
						  this.afterSplash()
					  }, t);
					  //this.fullSreenListener = on(this.startNode, "click", lang.hitch(this, "onStartClick", model));
				  } else {
					  this.startSimilator(model);
				  }
			  }
		  },
  
		  afterSplash () {
			  this.logger.log(-1,"afterSplash","enter > step:" + this.step, this.settings);
			  /**
			   * 4 should not happen normally. Just o make sure ...
			   */
			  this.step = 4
			  if (this.settings) {
				  this.step = 2
				  return
			  }
		  },
  
		  preloadImages (){
				if (this.hasPreload) {
					this.logger.log(-2,"preloadImages","enter", this.mode);
					Preloader.load(this.model, this.hash, this.domNode)	
				}
		  },
  
  
		  onPopState (){
			  const hash = location.hash;
			  if(hash && hash.length > 1){
				  const uri = location.hash;
				  const query = uri.substring(uri.indexOf("?") + 1, uri.length);
				  const params = io.queryToObject(query);
				  const screenId = params.s
				  if(this.currentScreen &&  this.currentScreen.id != screenId){
					  this.logger.log(0,"onPopState","back detected! >> " + screenId);
					  this.setScreenId(screenId);
				  }
			  }
		  },
  
		  onStart (e) {
			  this.onStartClick(this.model, e)
		  },
  
		  onStartClick (model, e){
			  this.logger.log(-1,"onStartClick","enter");
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
  
		  async startSimilator (model){
			  this.logger.log(2,"startSimilator","enter >" + model.id);
  
			  this.initScale();
			  this.initLiveUpdate();
			  this.initScroll();
			  // this can cause issues when the script want to fix
			  await this.initLoadScripts() 
			  await this.initRepeatScripts() 
			  await this.initDefaultDataBinding(model)
			  await this.initLoadRest()
			  await this.initRepeatRest()
	  
  
			  this.model = this.createZoomedModel(this._scaleX, this._scaleY);
			  this.model = Core.addContainerChildrenToModel(this.model);
			  this.model = ModelUtil.inlineTemplateStyles(this.model)
			  this.model = ModelUtil.updateInheritedRefs(this.model)
  
			  this.initParent();
			  this.updateScale()
  
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
				  this.logger.log(-1,"initParent","enter > "  + this.model.screenSize.h  );
				  this.domNode.parentNode.style.height = this.model.screenSize.h + "px";
  
				  if (this._resizeListener) {
					  try {
						  this._resizeListener(this.model.screenSize)
					  } catch (err) {
						  this.logger.log(-1,"initParent","Could not call _resizeListener > ");
					  }
				  }
			  }
		  },
  
		  setResizeListener (l) {
			  this._resizeListener = l
		  },
  
		  setScreenPosition (pos) {
			  this._externScreenPos = pos
		  },
  
		  getRootNode () {
			  if (this.isDesktopTest) {
				  if (this.scrollListenTarget === 'simpleBar'){
					  let node = this.domNode.parentNode;
					  while (node) {
						  if (node && node.classList?.contains('MatchSimulatorContainer')) {
							  this.logger.log(1,"getRootNode","SimpleBar >>", node);
							  return node
						  }
						  node = node.parentNode
					  }
					  this.logger.error("getRootNode"," no simplebar root >> ");
					  return this.domNode.parentNode;
				  } else {
					  this.logger.log(1,"getRootNode"," parentNode >> ", this.domNode.parentNode);
					  return this.domNode.parentNode;
				  }
		  
			  } else {
				  this.logger.log(1,"getRootNode"," modeNode >> ", this.domNode);
				  return this.domNode;
			  }
		  },
  
		  initScale (){
			  if (!this._externScreenPos) {
				  if(this.isDesktopTest){
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
			  this.logger.log(-1,"initScale","exit > h:" + this.screenPos.h + " x w:" + this.screenPos.w + " * " + this._scaleX + " > desk : " + this.isDesktopTest);
		  },
  
		  updateScale () {
			  if (this.model.screenSize.h > this.screenPos.h) {
				  // sometimes we might need to rescale the screenPos, because the "this.model.screenSize.h "
				  // is not correclty rounded
				  this.logger.log(-1, "updateScale","exit > h:" + this.screenPos.h + " < " + this.model.screenSize.h  );
				  this.screenPos.h = this.model.screenSize.h
			  }
		  },
  
  
		  setScreenId (screenID){
			  this.logger.log(3,"setScreen","enter >" + screenID);
			  const screen = this.model.screens[screenID];
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
			  const logic = this.model.widgets[line.to];
			  if (logic) {
				  /**
				   * FIXME: Here is a bug, if the first line dos not have a rule, but the second has...
				   */
				  var matchedLine = null;
				  const lines = this.getFromLines(logic);
				  for(let i=0; i< lines.length; i++){
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
			  for(let i=0; i< lines.length; i++){
				  if(lines[i].event === type || ("click" ===type && !lines[i].event)){
					  return lines[i];
				  }
			  }
		  },
  
		  onTransitionBack (screenID, widgetID, action, e){
			  this.logger.log(0,"onTransitionBack","enter >  sreen:" + screenID + " > widget:" + widgetID);
			  this.stopEvent(e);
			  this.log("WidgetClick",screenID, widgetID, e);
			  const lastScreenLine = this.screenHistory.pop();
			  if(lastScreenLine){
  
				  if(this.currentOverlay){
					  this.popOverlay();
				  } else {
  
					  const lastScreenID  = lastScreenLine.screenID;
					  const screen = this.model.screens[lastScreenID];
					  if(screen){
  
						  /**
						   * We create here a virtual line...
						   */
						  const backLine = {
							  id:"back",
							  from : screenID,
							  to : lastScreenID
						  };
  
						  /**
						   * We copy and inverse the animation if there is
						   */
						  const lastLine = lastScreenLine.line;
						  if(lastLine){
							  const inverse = this.animationFactory.getInverseAnimation(lastLine.animation);
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
			  this.logger.log(1,"onTransition","enter >  sreen:" + screenID + " > widget:" + widgetID);
			  this.stopEvent(e);
			  this.log("WidgetClick",screenID, widgetID, e);
			  this.executeLine(screenID, widgetID, line);
		  },
  
		  executeLine (screenID, widgetID, line){
			  /**
			   * Make sure we flush the output binding in case
			   * the widget is in a container. 
			   * 
			   * FIXME: For now now dataScript are run. 
			   * We need to make sure
			   */
			  this.flushOutputDataBinding(screenID, widgetID)
  
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
					  const widget = this.model.widgets[line.to];
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
			   * Script are fired and then we return
			   */
			  if (widget.props.script) {
				  await this.executeScript(widget.id, orginalLine)
				  return
			  }
  
		  
			  /** 
			   *  Fire REST, but inspect result for rule (lines)
			   */
			  let restSuccess = false
			  if (widget.props && widget.props.rest) {
				  restSuccess = await this.executeRest(widget, orginalLine)
			  }
  
			  /**
			   * Get all lines in the correct order
			   */
			  let matchedLine = null;
			  const lines = this.getFromLines(widget);
			  if (widget.props && widget.props.isRandom){
				  /**
				   * Since 4.0. the test dialog can inject a method
				   */
				  if (this.abSelector) {
					  this.abSelector(lines, (matchedLIne) => {
						  this.excuteMatchedLine(matchedLIne, screenID, orginalLine)
					  })
					  this.logger.warn("executeLogic"," delagte to external selctor!");
					  return
				  } else {
					  matchedLine = this.getABLine(lines, widget)
					  this.logger.log(-1,"executeLogic","AB:" + widget.id + " >> " + matchedLine);
				  }
			  } else {
				  this.logger.log(-1,"executeLogic","RULE: " + widget.id + " >> ");
				  matchedLine = this.getRuleMatchingLine(lines, screenID, restSuccess)
			  }
  
			  this.excuteMatchedLine(matchedLine, screenID, orginalLine)
		  },
  
		  getABLine (lines, widget) {
			  const random = Math.random()
			  const pos = Math.floor(random * lines.length);
			  this.logger.log(-1,"getABLine","enter >  do AB:" + widget.id + " >> " + random + " >> " + pos);
			  return lines[pos]
		  },
  
		  getRuleMatchingLine (lines, screenID, restSuccess) {
  
			  
			  let matchedLine;
			  for(let i=0; i< lines.length; i++){
				  const line = lines[i];
				  if(line.rule){
					  if (line.rule.type === 'widget') {
						  matchedLine = this.checkWidgetRule(line, screenID)
					  }
					  if (line.rule.type === 'databinding') {
						  matchedLine = this.checkDataBindingRule(line, screenID)
					  }
					  if (line.rule.type === 'rest') {
						  if (line.rule.restResponseStatus === '4xx' && !restSuccess) {
							  matchedLine = line
						  }
						  if (line.rule.restResponseStatus === '200' && restSuccess) {
							  matchedLine = line
						  }
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
			  const rule = line.rule
			  let value = this.getDataBindingByPath(rule.databinding)
			  if (!value) {
				  // Since 3.0.17 this should not happen
				  this.logger.warn('checkDataBindingRule', 'No databinding value for ', rule.databinding)
				  value = this.getDefaultDatabinding(rule.databinding)
			  }
			  const result = this.isValueMatchingRule(value, true, rule);
			  if (result) {
				  return line
			  }
		  },
  
		  checkWidgetRule (line, screenID) {
			  const rule = line.rule;
			  let uiWidget = this.renderFactory.getUIWidgetByID(rule.widget);
			  if (!uiWidget) {
				  const copyId = rule.widget + "@" + screenID;
				  uiWidget = this.renderFactory.getUIWidgetByID(copyId);
			  }
			  if (uiWidget){
				  if (this.isRuleMatching(rule, uiWidget)) {
					  return line;
				  }
			  } else {
				  console.warn("executeLogic() > No rule widget with id", line, rule.widget);
			  }
		  },
  
		  excuteMatchedLine (matchedLine, screenID, orginalLine) {
			  if (matchedLine){
				  const screen = this.model.screens[matchedLine.to];
				  if(screen){
					  const newLine = lang.clone(matchedLine);
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
				  } else {
					  /**
					   * Since 2.1.4 we support chaining of logic widgets
					   */
					  const widget = this.model.widgets[matchedLine.to];
					  if(widget){
						  this.logLine(matchedLine, screenID);
						  this.executeLogic(screenID, matchedLine.from, widget, matchedLine);
					  } else {
						  console.warn("excuteMatchedLine() > No screen or logic widget with id "+ matchedLine.to)
					  }
				  }
			  } else {
				  console.warn("executeLogic() > Could not match any line");
			  }
		  },
  
  
		  isRuleMatching (rule, uiWidget){
			  const value = uiWidget.getValue()
			  const valid = uiWidget.isValid(false);
			  const result = this.isValueMatchingRule(value, valid, rule);
			  this.logger.log(-1,"isRuleMatching","enter > " ,	rule.value + " " + rule.operator + " " + value + " / " + valid + " =>" + result);
			  return result;
		  },
  
		  getRuleValue (rule) {
			  let result = rule.value
			  if (result && result.indexOf('${') === 0 && result.indexOf('}') === result.length-1) {
				  const path = result.substring(2, result.length - 1)
				  result = this.getDataBindingByPath(path)
				  this.logger.log(-1,'getRuleValue', 'WITH PATH ' +  path,  ` >${result}<`)
			  }
  
			  if (result === 'true') {
				  result = true
			  }
			  if (result === 'false') {
				  result = false
			  }
  
			  return result
		  },
  
		  isValueMatchingRule (value, valid, rule) {
			  this.logger.log(2,"isValueMatchingRule","enter > " + rule.value + " " + rule.operator + " " + value + " / " + valid);
  
			  if (this.isQDate(value)) {
				  this.logger.log(-1,"isValueMatchingRule","convert q date > " + this.convertQDateToIsoString(value));
				  value = this.convertQDateToIsoString(value)
			  }
  
			  const operator = rule.operator;
  
  
			  /**
			   * Special handling for checkbox group.
			   * We should have an "in" operation
			   */
			  if (value && Array.isArray(value) && value.length > 0){
				  console.debug("Simulator.isRuleMatching.isArray", value)
				  value = value[0]
			  }
  
			  let result = false;
			  const ruleValue = this.getRuleValue(rule)
  
			  switch(operator){
				  case "contains":
					  if (value.toLowerCase && ruleValue.toLowerCase) {
						  const lowerValue = value.toLowerCase();
						  const lowerRule = ruleValue.toLowerCase();
						  result = lowerValue.indexOf(lowerRule) >= 0;
					  } else {
						  result = false;
					  }
					  break;
  
				  case "isValid":
					  result = valid;
					  break;
  
				  case "checked":
					  result = (value == true);
					  break;
  
				  case "notchecked":
					  result = (value == false);
					  break;
  
				  case "active":
					  result = (value == true);
					  break;
  
				  case "notactive":
					  result = (value == false) || (value == null) || (value == undefined);
					  break;
  
				  case "==":
					  result = (value == ruleValue);
					  break;
  
				  case "!=":
					  result = (value != ruleValue);
					  break;
  
				  case ">":
					  if(!value){
						  value = 0;
					  }
					  result = (value * 1 > ruleValue *1);
					  break;
  
				  case "<":
					  if(!value){
						  value = 0;
					  }
					  result = (value * 1 < ruleValue *1);
					  break;
  
				  case ">=":
					  if(!value){
						  value = 0;
					  }
					  result = (value * 1 >= ruleValue *1);
					  break;
  
				  case "<=":
					  if(!value){
						  value = 0;
					  }
					  result = (value * 1 <= ruleValue *1);
					  break;
  
				  default:
						  console.warn("getRuleLabel() > not supported operator", rule.operator)
			  }
			  return result;
		  },
  
		  canPerformTransition (line, screenID){
			  this.logger.log(2,"canPerformTransition","enter > " + line.from + ' -> ' + line.to, screenID);
  
			  if (line.validation && line.validation.all){
				  let screen = this.model.screens[screenID];
				  /**
				   * Fix in 4.0.30. We only validate the overlay
				   */
				  if (this.currentOverlay) {
					  this.logger.log(-2,"canPerformTransition","validate overlay > " + this.currentOverlay.name);
					  screen = this.currentOverlay
				  }
  
				  if (screen){
					  let isValid = true;
					  let children = screen.children;
					  for (let i=0; i < children.length; i++){
						  let childID = children[i];
						  let uiWidget = this.renderFactory.getUIWidgetByID(childID);
						  if (uiWidget){
							  let uiWidgetValid = uiWidget.isValid(true);
							  isValid = isValid && uiWidgetValid;
							  if (!uiWidgetValid){
								  this.logger.log(-2,"canPerformTransition","validate error > " + uiWidget.model.name);
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
			  if (!this._user){
				  this._user  = {
					  'id': this.getUUID("U"),
					  'name': 'tester'
				  }
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
			  this.logger.log(2,"toggleFullScreen","enter");
			  try{
				  this.stopEvent(e);
				  if (location.href.indexOf('localhost') > 0) {
					  this.logger.log(-1,"toggleFullScreen","exit local host");
					  return
				  }
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
							  requestFullScreen.call(docEl, {navigationUI: 'hide' });
						  }
						  else {
							  cancelFullScreen.call(doc, { navigationUI: 'hide' });
						  }
						  this.logger.log(-1,"toggleFullScreen","exit > Fullscreen started");
					  } else {
						  this.logger.log(-1,"toggleFullScreen","exit > IOS .. No FullsScreen");
					  }
				  } else {
					  this.logger.log(-1, "toggleFullScreen","exit > desktop");
				  }
			  } catch(e){
				  this.logger.error("toggleFullScreen","error", e);
				  this.logger.sendError(e)
			  }
  
		  },
  
  
		  highlight (ids){
			  if (this._highlights){
				  for(let i=0; i< this._highlights.length; i++){
					  css.remove(this._highlights[i], "MatcSimulatorHighlight");
					  if(this._highlightsInner[i]){
						  this._highlights[i].removeChild(this._highlightsInner[i]);
					  }
  
				  }
				  delete this._highlights;
				  delete this._highlightsInner;
			  }
  
			  if (ids){
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
  
		  scrollIntoView (ids) {
				for(let i=0; i< ids.length; i++){
					const div = this.renderFactory.getWidgetNodeByID(ids[i]);
					if(div && div.scrollIntoViewIfNeeded) {
						/**
						 *  This is somehow not standard. Later thereshould be a flag on scrollIntoView
						 */
						div.scrollIntoViewIfNeeded({behavior: "smooth", block: "center", inline: "nearest", scrollMode: 'if-needed'})
					}
				}
		  },
  
		//   getUserTasks (){
		// 	  const tasks = [];
		// 	  if (this.settings.tasks && this.settings.tasks){
		// 		  for(var i=0; i< this.settings.tasks.length; i++){
		// 			  var task = this.settings.tasks[i];
		// 			  if(task.description && task.description != "Enter a description here"){
		// 				  tasks.push(task);
		// 			  }
		// 		  }
		// 	  }
		// 	  return tasks;
		//   },
  
		  destroy (){
			  this.logger.log(-1,"destroy","enter");
			  this.isDestroyed = true;
			  this.sendMouse();
			  this.cleanUpTempListener();
			  this.cleanUpGestureScreenAnim();
			  this.cleanUpAnimations();
			  this.cleanUpRepeatScripts()
			  this.cleanUpRepeatRests()
			  this.renderFactory.cleanUp()
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
  