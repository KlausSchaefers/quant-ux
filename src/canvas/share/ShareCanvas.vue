
<template>
	 <div class="MatcCanvas MatcAnalyticCanvas">
		<div class="MatcCanvasFrame" data-dojo-attach-point="frame">
			<div class="MatcCanvasContainer MatcCanvasZoomable " data-dojo-attach-point="container">
			<div class="MatcCanvasContainer " data-dojo-attach-point="zoomContainer">
				<div data-dojo-attach-point="screenContainer" class="MatcCanvasLayer"></div>
				<div data-dojo-attach-point="widgetContainer" class="MatcCanvasLayer"></div>
			</div>
			<div data-dojo-attach-point="dndContainer" class="MatcDnDLayer"></div>
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
		

		<div class="MatcMessage" data-dojo-attach-point="message">
		</div>
	</div>

</template>
<style lang="css">
  @import url("../../style/matc.css");	
  @import url("../../style/share.css");	
  @import url("../../style/canvas/all.css");
  @import url('../../style/toolbar/all.css');
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'

import Logger from 'common/Logger'
import on from 'dojo/on'
import lang from 'dojo/_base/lang'

import win from 'dojo/_base/win'
import topic from 'dojo/topic'
import domGeom from 'dojo/domGeom'

import DomBuilder from 'common/DomBuilder'
import Dialog from 'common/Dialog'
import ScrollContainer from 'common/ScrollContainer'
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
import InlineEdit from 'canvas/InlineEdit'
import Scroll from 'canvas/Scroll'
import Upload from 'canvas/Upload'
import Comment from 'canvas/Comment'

import Simulator from 'core/Simulator'
import Util from 'core/Util'
import QR from 'core/QR'

import KeyBoard from "canvas/KeyBoard";
import Resize from "canvas/Resize";
import Replicate from "canvas/Replicate";

import DomUtil from 'core/FastDomUtil'

export default {
    name: 'ShareCanvas',
    mixins:[DojoWidget, _DragNDrop, Util, Render, Lines, DnD, Add, Select, Distribute,
					  Tools, Zoom, InlineEdit, Scroll, Upload, Comment, KeyBoard, Resize, Replicate, Heat],
    data: function () {
        return {
            mode: "view",
            zoom: 0.4,
            zoomLevelPos: 3,
            analyticMode: "HeatmapClick",
            resizeEnabled: false,
            renderDND: true,
            dragNDropMinTimeSpan: 0,
            wireInheritedWidgets: true,
            taskLineOpacity: 1
        }
    },
    components: {},
    methods: {

		postCreate (){
			this.logger = new Logger("ShareCanvas");
			this.logger.log(2,"postCreate", "entry");
			this.domUtil = new DomUtil()

			this.initSize()
			this.initWiring()

			this.cache = {};
			this.moveMode ="classic";
			/**
			 * init container size and position
			 */
			this.canvasPos = {
				x : this.canvasStartX,
				y: this.canvasStartY,
				w: this.canvasFlowWidth,
				h : this.canvasFlowHeight
			};
			this.initContainerSize();
			this.setContainerPos();

			this.db = new DomBuilder();


			/**
			 * Init remaining sub components
			 */
			this.initSelection()
			this.initRender();
			this.initZoom();
			this.initScrollBars();
			this.initComment();
			this.initSettings();
			this.initMouseTracker();
			this.initButtons()

			/**
			 * Init Listeners
			 */
			this.own(topic.subscribe("matc/toolbar/click", lang.hitch(this,"onToolbarClick")));
			this.own(on(win.body(), "keydown", lang.hitch(this,"onKeyPress")));
			this.own(on(win.body(), "keyup", lang.hitch(this,"onKeyUp")));

			this.logger.log(2,"postCreate", "exit!!!");
		},

		closeSVGEditor () {

		},

		setModelService (s) {
			this.modelService = s
		},

		setCommentService (s) {
			this.commentService = s
		},

		setPublic (isPublic){
			this.isPublic = isPublic;
		},


		inlineEditInit (){
			this.logger.log(2,"inlineEditInit", "enter");
		},

		onZoomMinusClick () {
			let z = Math.round((this.zoom - 0.1) * 10) / 10
			this.setZoomFactor(z)
		},

		onZoomPlusClick () {
			let z = Math.round((this.zoom + 0.1) * 10) /10
			this.setZoomFactor(z)
		},

		onTogggleLine () {
			this.setViewLines(!this.renderLines)
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
		},

		setCanvasViewConfig (key, value) {
			this.logger.log(-1, "setCanvasViewConfig", "enter > " + key, value);
		},

		setHash (h){
			this.logger.log(-1,"setHash", "entry > ", h);
			this.hash = h;
		},

		/**********************************************************************
		 * Button render
		 **********************************************************************/
		renderLayerList (){
			this.logger.log(1,"renderLayerList", "entry > ");
		},


		/**********************************************************************
		 * Button render
		 **********************************************************************/

		initButtons (){


			var btn = this.db.div("MatcTestCommentButton MatcAnimated MatcFadeOut").build(this.domNode); //
			this.db.span("mdi mdi-comment MatcMiddle").build(btn);
			this.own(on(btn, "click", lang.hitch(this, "onNewComment")));

			setTimeout(function(){
				css.remove(btn, "MatcFadeOut")
			}, 1250);


			var btnSim = this.db.div("MatcTestQRButton  MatcAnimated MatcFadeOut").build(this.domNode);
			this.db.span("mdi mdi-play MatcMiddle").build(btnSim);
			this.own(on(btnSim, "click", lang.hitch(this, "onSimulator")));

			setTimeout(function(){
				css.remove(btnSim, "MatcFadeOut")
			}, 1500);


			var btnZoomIn = this.db.div("MatcTestQRButton  MatcShareZoomIn MatcAnimated MatcFadeOut").build(this.domNode);
			this.db.span("mdi mdi-magnify-plus-outline MatcMiddle").build(btnZoomIn);
			this.own(on(btnZoomIn, "click", lang.hitch(this, "onZoomPlusClick")));

			setTimeout(function(){
				css.remove(btnZoomIn, "MatcFadeOut")
			}, 2000);

			var btnZoomOut = this.db.div("MatcTestQRButton MatcShareZoomOut MatcAnimated MatcFadeOut").build(this.domNode);
			this.db.span("mdi mdi-magnify-minus-outline MatcMiddle").build(btnZoomOut);
			this.own(on(btnZoomOut, "click", lang.hitch(this, "onZoomMinusClick")));

			setTimeout(function(){
				css.remove(btnZoomOut, "MatcFadeOut")
			}, 1750);


			var lineButton = this.db.div("MatcTestQRButton MatcShareLine MatcAnimated MatcFadeOut").build(this.domNode);
			this.db.span("mdi mdi-vector-line MatcMiddle").build(lineButton);
			this.own(on(lineButton, "click", lang.hitch(this, "onTogggleLine")));

			setTimeout(function(){
				css.remove(lineButton, "MatcFadeOut")
			}, 2250);

		},

		/**********************************************************************
		 * Comment Overwirtes
		 **********************************************************************/

		loadComments (){
			this.logger.log(0,"loadComments", "enter > " + this.hash);
			this.showComments = true;
			if (this.model) {
				this._doGet("/rest/comments/hash/" + this.hash + "/" + this.model.id +"/ScreenComment.json", lang.hitch(this, "onCommentsLoaded"));
			} else {
				this.logger.error("loadComments", "ERROR > No model");
			}
		},

		onNewComment (e) {
			this.logger.log(1,"onNewComment", "enter > " );
			this.addComment({event:e, type: "comment"});
		},

		/**
		 * Overrides some behaviour from Canvas.Share.
		 *
		 * 1) We set mode to view
		 *
		 * 2) we use other public api
		 */
		onCommentAdded (pos, model, e){
			this._onAddDone();
			this.setState(0);
			this.setMode("view");
			this.logger.log(0,"onCommentAdded", "enter");
			if (this.model) {
				if(this.model.isTryOut){
					this.showHint("Register to add comments...");
					this._onCommentAdded(pos,e, [] );
				} else {
					// use hashed URL here
					this._doGet("/rest/comments/hash/" + this.hash + "/" + this.model.id +"/ScreenComment.json", lang.hitch(this, "_onCommentAdded", pos, e));
				}
			}
		},

		saveDNDChange (comment){
			/**
			 * send to server!
			 */
			if (this.model) {
				if(this.model.isTryOut){
					this.showSuccess("Register to comment...");
				} else {
					this._doPost("/rest/comments/hash/" + this.hash + "/" + this.model.id +"/" + comment.id+ ".json", comment, "onCommentSaved");
				}
			}
		},


		onSaveComment (txt,comment, e){
			this.stopEvent(e);
			comment.message = txt.value;
			if(this.model.isTryOut){
				this.showSuccess("Register to comment...");
			} else {
				if(comment.id){
					this._doPost("/rest/comments/hash/" + this.hash + "/" + this.model.id +"/" + comment.id+ ".json", comment, "onCommentSaved");
				} else {
					this._doPost("/rest/comments/hash/" + this.hash + "/" + this.model.id, comment, "onCommentSaved");
				}
			}
			this.stopEvent(e);
			this.onCloseCommentPopup();
		},


		/**********************************************************************
		 * Simulator stuff
		 **********************************************************************/


		onSimulator (e) {
			// make sure we use an un-zoomed model like
			// the toolbar would do
			this.startSimulator(e, this.controller.model)
		},

		startSimulator (e, model){
			this.logger.log(1,"startSimulator", "enter > " );

			/**
			 * Since 2.1.7 we have better scalling. Keep in
			 * sync with _Dialogs.startSimilator()
			 */
			const pos = domGeom.position(win.body());
			const maxHeight = pos.h - 100
			css.add(win.body(), 'MatcCanvasSimulatorVisible')
			if( model.type == "desktop"){
				pos.w = pos.w * 0.75;
				pos.h = pos.h * 0.75;
				this._showDesktopSimulator(model, pos, maxHeight);
			} else if( model.type=="tablet"){
				if(this.model.screenSize.w > this.model.screenSize.h){
					pos.w = pos.w * 0.65;
					pos.h = pos.h * 0.65;
					this._showMobileTest(model, pos, "MatchSimulatorWrapperTablet", maxHeight);
				} else {
					pos.w = pos.w * 0.35;
					pos.h = pos.h * 0.35;
					this._showMobileTest(model, pos, "MatchSimulatorWrapperTablet", maxHeight);
				}
			} else{
				pos.w = pos.w * 0.25;
				pos.h = pos.h * 0.25;
				this._showMobileTest(model, pos , "MatchSimulatorWrapperMobile", maxHeight);
			}
		},


		_showDesktopSimulator (model, pos, maxHeight){

			const dialog = document.createElement("div");
			css.add(dialog, "MatchSimulatorDialog");

			const container = document.createElement("div");
			css.add(container, "MatchSimulatorContainer");
			dialog.appendChild(container);

			pos = this.getScaledSize(pos, "width", model);
			if (pos.h > maxHeight) {
				let factor = pos.h / maxHeight
				pos.h = pos.h / factor
				pos.w = pos.w / factor
			}

			container.style.width = Math.round(pos.w) + "px";
			container.style.height = Math.round(pos.h) + "px";

			const s = this.$new(Simulator,{mode : "debug", logData: false, hash: this.hash});
			s.scrollListenTarget = "parent";

			const scroller = this.$new(ScrollContainer,{canDestroy:false});
			scroller.placeAt(container);
			s.setScrollContainer(scroller);


			const d = new Dialog();
			d.popup(dialog, this.simulatorButton);
			d.own(d.on("close", lang.hitch(this, "stopSimulator",s, scroller)));

			const screen = this._getSimulatorScreen();
			setTimeout(function(){
				scroller.wrap(s.domNode);
				s.setStartScreen(screen);
				s.setModel(model);
			}, 500);

			/**
			 * otherwise the mouse wheel listener will prevent
			 * scrolling in the simulator!
			 */
			this.enableMouseZoom(false);
			this.setState("simulate");

		},

		resizeSimualtor (container, model, factor, dialog) {
			container.innerHTML = ""

			const screen = this._getSimulatorScreen();
			let pos = domGeom.position(win.body());
			pos.w = pos.w * factor;
			pos.h = pos.h * factor;
			pos = this.getScaledSize(pos, "width", model);
			container.style.width = Math.round(pos.w) + "px";
			container.style.height = Math.round(pos.h) + "px";

			const s = this.$new(Simulator,{mode : "debug", logData: false, hash: this.hash});
			s.scrollListenTarget = "parent";
			s.setStartScreen(screen);

			const scroller = this.$new(ScrollContainer,{canDestroy:false});
			scroller.placeAt(container);
			s.setScrollContainer(scroller);
			scroller.wrap(s.domNode);
			s.setModel(model);

			dialog.resize(container)
		},



		_showMobileTest (model, pos, clazz, maxHeight){
			console.debug('_showMobileTest', maxHeight)
			var dialog = document.createElement("div");
			css.add(dialog, "MatchSimulatorDialog");

			var wrapper = document.createElement("div");
			css.add(wrapper, "MatchSimulatorWrapper ");
			if(clazz){
				css.add(wrapper, clazz);
			}
			dialog.appendChild(wrapper);

			var container = document.createElement("div");
			css.add(container, "MatchSimulatorContainer");

			pos = this.getScaledSize(pos, "width", model);
			if (pos.h > maxHeight) {
				let factor = pos.h / maxHeight
				pos.h = pos.h / factor
				pos.w = pos.w / factor
			}

			container.style.width = Math.ceil(pos.w) + "px";
			container.style.height = Math.ceil(pos.h) + "px";
			wrapper.appendChild(container);

			var scroller = this.$new(ScrollContainer, {canDestroy:false});
			scroller.placeAt(container);

			var s = this.$new(Simulator, {mode : "debug", logData : false, hash: this.hash});
			s.scrollListenTarget = "parent";
			s.setScrollContainer(scroller);

			var img = document.createElement("img");
			QR.getQRCode(this.hash, false, false).then(url => {
				img.src = url
			})
			//img.src = "rest/invitation/hash/" + this.hash+ "/debug.jpg";

			css.add(img, "MatcSimulatorQR");
			dialog.appendChild(img);

			var d = new Dialog();
			d.popup(dialog, this.simulatorButton);
			d.on("close", lang.hitch(this, "stopSimulator", s, scroller));

			var screen = this._getSimulatorScreen();
			s.setStartScreen(screen);
			setTimeout(function(){
				scroller.wrap(s.domNode);
				s.setModel(model);
			},500);

			/**
			 * otherwise the mouse wheel listener will prevent
			 * scrolling in the simulator!
			 */
			this.enableMouseZoom(false);
			this.setState("simulate");

		},


		stopSimulator (s, scroller){
			css.remove(win.body(), 'MatcCanvasSimulatorVisible')
			this.enableMouseZoom(true);
			this.setState(0);
			if(s){
				s.destroy();
			}
			if(scroller){
				scroller.destroy();
			}
		},

		_getSimulatorScreen (){
			if(this.getSelectedScreen()){
				return this.getSelectedScreen();
			}
			if(this._selectedWidget){
				return this.getParentScreen(this._selectedWidget);
			}

		},



		/**********************************************************************
     * Wiring
     **********************************************************************/

    initWiring() {
      this.logger.log(-1, "initWiring", "enter");
      this.own(
        on(this.dndContainer, "mousedown", (e) => this.dispatchMouseDown(e))
      );
    },

	dispatchMouseDownCanvas (e) {
		this.logger.log(1,"dispatchMouseDownCanvas", "enter", e, this.mode);
		this.onDragStart(this.container, "container", "onCanvasDnDStart", "onCanvasDnDMove", "onCanvasDnDEnd", null, e);
	},

    dispatchMouseDownScreen(e, id) {
      this.logger.log(-1, "dispatchMouseDownScreen", "enter", id);
    },

    dispatchMouseDownWidget(e, id) {
      this.logger.log(-1, "dispatchMouseDownWidget", "enter", id);
      let div = this.widgetDivs[id];
      this.onWidgetDndClick(id, div);
    },

		onWidgetDndClick (id, div, pos ,e ){
			this.stopEvent(e);
			this.logger.log(-1,"onWidgetDndClick", "enter > " + id);
			this.setState(0);
			// var widget = this.model.widgets[id];
			// if(widget){
			// 	var lines = this.getLinesForWidget(widget);
			// 	if (lines) {
			// 		var clickLine = this.getLineForGesture(lines, "click")
			// 		if (!clickLine){
			// 			clickLine = lines[0]
			// 		}
			// 		if (clickLine){
			// 			this.animateToScreen(clickLine.to, this.container);
			// 		}
			// 	}
			// } else {
			// 	this.highlightActionWidgets();
			// }
		},

		highlightActionWidgets (){
			this.logger.log(2,"highlightActionWidgets", "entry > ");
			var divs = [];
			for (var id in this.model.widgets){
				var widget = this.model.widgets[id];
				if (widget){
					var lines = this.getLinesForWidget(widget);
					if (lines) {
						var div = this.analyticsDivs[widget.id];
						if (div) {
							divs.push(div);
							css.add(div, "MatcSimulatorWidgetHightlight")
						}
					}
				}
			}
			setTimeout(function(){
				for(var i=0; i< divs.length; i++){
					css.remove(divs[i], "MatcSimulatorWidgetHightlight")
				}
			}, 500)
		},


		onScreenDndClick (id, div, pos,e){
			this.logger.log(-1,"onScreenDndClick", "entry > " + id);
			this.stopEvent(e);
			this.highlightActionWidgets();
			// TODO: Check for lines
			this.setState(0);
			// call canvas click to make sure comment popups close
			this.onCanvasSelected();
		},

		onCanvasSelected (){
			this.logger.log(2,"onCanvasSelected", "entry > ");
			//this.inherited(arguments) ;
		},

		/**********************************************************************
		 * Rendering
		 **********************************************************************/


		animateToScreen (screenID, container){
			// css.add(container, "MatcShareCanvasAnimatedContainer");
			this.moveToScreen(screenID);

			setTimeout(function(){
				css.remove(container, "MatcShareCanvasAnimatedContainer");
			}, 500);
		},


		/**********************************************************************
		 * Rendering
		 **********************************************************************/


		afterRender (){
			this.logger.log(-1,"afterRender", "entry > " + this.analyticMode);
			this.cleanUpAnalytics();


		},

		hasSelect (){
			return this._mode!= "addComment";
		},


		/**********************************************************************
		 * Gesture
		 **********************************************************************/

		cleanUpAnalytics (){
			this.analyticsDivs = {};
		},


		/**********************************************************************
		 * DI
		 **********************************************************************/


		setController (c){
			this.logger.log(2,"setController", "enter");
			this.controller = c;
			c.setCanvas(this);
		},

		getController (){
			if(this._controllerCallback){
				this[this._controllerCallback]();
			}
			return this.controller;
		},

		setControllerCallback (c){
			this._controllerCallback = c;
		},


		setModelFactory (f){
			this.logger.log(3,"setModelFactory", "enter");
			this.factory = f;
		},

		setRenderFactory (f){
			this.logger.log(0,"setRenderFactory", "enter");
			this.renderFactory = f;
		},

		setModel (model){
			this.logger.log(3,"setModel", "enter");
			this.model = model;
			this.grid = this.model.grid;
			this.loadComments()
		},


		setTest (t){
			this.logger.log(2,"setTest", "enter > # " );
			this.testSettings = t;
		},


		setUser (u){
			this.user = u;
		},

		setMode (mode, forceRender){
			this.logger.log(2,"setMode", "enter > " + mode +" != " + this._mode + " > " + forceRender);
			if(mode != this._mode){
				this._mode = mode;
				if(this.toolbar){
					this.toolbar.setMode(mode);
				}
				this.rerender();
			} else if(forceRender){
				this.rerender();
			}
		},


		getMode (){
			return this._mode;
		},




		/***************************************************************************
		 * Keyboard handling
		 ***************************************************************************/

		onKeyPress (e){

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
				if(!this._inlineEditStarted ){
					this.stopEvent(e);
					if(this.getMode() != "move"){
						this.showHint("Move the mouse to move canvas...");
						this.onDragStart(this.container, "container", "onCanvasDnDStart", "onCanvasDnDMove", "onCanvasDnDEnd", null, this._lastMouseMoveEvent, true);
						this.setMode("move");
					}
				}
			/**
			 * Zoom
			 */
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

		onKeyUp (e){
			var k = e.keyCode ? e.keyCode : e.which;
			if (k==32){
				this.onDragEnd(this._lastMouseMoveEvent);
				this.setMode("view");
			}

			delete  this._currentKeyEvent;
		},


		/***************************************************************************
		 * Settings
		 ***************************************************************************/


		initSettings (){
			this.logger.log(1,"initSettings", "enter > " );
			/**
			 * default settings
			 */
			this.settings = {
				canvasTheme : "MatcLight",
				lineColor : "#999",
				lineWidth : 1,
				storePropView : true,
				moveMode : "ps",
				mouseWheelMode : "scroll"
			};


			var s = this._getStatus("matcSettings");
			if(s){
				if(s.canvasTheme){
					//this.settings.canvasTheme = s.canvasTheme;
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

		getSettings (){
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
				//this.settings.lineColor = s.lineColor;
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


		applySettings (s){

			this.logger.log(2,"applySettings", "enter > "  + s.canvasTheme + " &> " + s.moveMode);

			if(s.lineWidth){
				this.defaultLineWidth = s.lineWidth;
			}
			if(s.canvasTheme){
				if(this._lastCanvasTheme){
					css.remove(win.body(), this._lastCanvasTheme);
				}
				css.add(win.body(), s.canvasTheme)
				this._lastCanvasTheme = s.canvasTheme;
			}

			if(s.mouseWheelMode){
				this._mouseWheelMode = s.mouseWheelMode;
			}

			this.settings = s;

		},


		/***************************************************************************
		 * Helper Functons
		 ***************************************************************************/


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
		 * Return the line with a given type (lines[i].event === type).
		 * Handles also old school where there was not event
		 */
		getLineForGesture (lines,type ){
			for(var i=0; i< lines.length; i++){
				if(lines[i].event === type || ("click" === type && !lines[i].event)){
					return lines[i];
				}
			}
		},

		initMouseTracker (){
			this.own(on(win.body(),"mousemove", lang.hitch(this,"onMouseMove")));
		},

		onMouseMove (e){
			var pos2 = this.getCanvasMousePosition(e, true);
			this._lastMousePos = pos2;
			this._lastMouseMoveEvent = e;
		},


		destroy (){
			this.cleanUp();
		}
    },
    mounted () {

    }
}
</script>