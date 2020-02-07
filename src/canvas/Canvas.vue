<template>
<div class="MatcCanvas">
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
		<div class="MatcStatusCntr">
			<div class="MatcStatusItem">	
				<span class="MatcStatusButtom glyphicon glyphicon-minus" data-dojo-attach-point="zoomMinus"> 			
				</span> 
				<span class="MatcStatusItemLabel" > 	
					<span data-dojo-attach-point="zoomLabel"></span> 
				</span> 
				<span class="MatcStatusButtom glyphicon glyphicon-plus" data-dojo-attach-point="zoomPlus"> 			
				</span> 
			</div> 
			<div class="MatcStatusItem" data-dojo-attach-point="gridBtn">
				<span class="MatcStatusButtom glyphicon glyphicon-th"></span> 
				<span class="MatcStatusItemLabel MatcStatusButtom" >Grid &amp; Columns</span> 
			</div>	
			<div class="MatcStatusItem MatcStatusItemXXL" data-dojo-attach-point="layerCheckCntr"></div>	
			<div class="MatcStatusItem MatcStatusItemXXL" data-dojo-attach-point="commentCntr"></div>
			<div class="MatcStatusItem MatcStatusItemXXL" data-dojo-attach-point="lineCntr"></div>
			<div class="MatcStatusItem MatcStatusItemXXL" data-dojo-attach-point="distanceCntr"></div>
			<div class="MatcStatusItem MatcStatusItemXXL" data-dojo-attach-point="rulerCntr"></div>
			<div class="MatcStatusItem MatcStatusItemXXL" data-dojo-attach-point="dataViewCntr"></div>
		</div>
	</div> 
	--> <!-- Status -->

	<div class="MatcMessage" data-dojo-attach-point="message"> 			
	</div> 
</div>

</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import keys from 'dojo/keys'
import Logger from 'common/Logger'
import on from 'dojo/on'
import touch from 'dojo/touch'
import lang from 'dojo/_base/lang'
import win from 'dojo/win'
import topic from 'dojo/topic'
import _DragNDrop from 'common/_DragNDrop'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import GridSelector from 'canvas/GridSelector'
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
import Layer from 'canvas/Layer'
import DataView from 'canvas/DataView'
import ScreenRuler from 'canvas/ScreenRuler'
import CustomHandler from 'canvas/CustomHandler'

// var _matcIcons = []

export default {
  name: 'Canvas',
	mixins:[DojoWidget, _DragNDrop, Util, Render, Lines, DnD, Add, Select, Distribute, Tools, 
			Zoom, InlineEdit, Scroll, Upload, Comment, Layer, CustomHandler, ScreenRuler, DataView],
    data: function () {
        return {
			mode: "edit", 
            debug: false, 
            grid: null, 
            isPublic: false, 
			active: true,
			name: 'XCanvas'
        }
    },
    components: {},
    methods: {       
		postCreate (){

			this.logger = new Logger("Canvas")
			this.logger.log(2,"postCreate", "entry");
			this.initSize()

			/**
			 * init container size and position
			 */
			this.canvasPos = {
				x : this.canvasStartX, 
				y: this.canvasStartY, 
				w: this.canvasFlowWidth, 
				h: this.canvasFlowHeight
			};	
			this.setContainerSize();
			this.setContainerPos();			
			
			/**
			 * Init remaining sub components
			 */
			this.initSettings();
			this.initRender();
			this.initMouseTracker();
			this.initZoom();
			this.initScrollBars();
			this.initUpload();
			this.initComment();		
			this.initScreenRuler()	
			this.initDataView()
			
			/**
			 * Init Listeners
			 */
			this.own(topic.subscribe("matc/toolbar/click", lang.hitch(this,"onToolbarClick")));
			//this.own(on(this.gridBtn, touch.press, lang.hitch(this, "showGrid")));
			this.own(on(win.body(), "keydown", lang.hitch(this,"onKeyPress")));
			this.own(on(win.body(), "keyup", lang.hitch(this,"onKeyUp")));
			

			/**
			 * Set correct mode
			 */
			css.add(this.domNode, "MatcCanvasMode"+ this.mode);			
			this.logger.log(-1,"postCreate", "exit > " + this.mode);
		},		
		
		setUser (u){
			this.user = u;
		},
		
		setPublic (isPublic){
			this.isPublic = isPublic;
		},

		setModelService (s) {
			this.modelService = s
		},

		setCommentService (s) {
			this.commentService = s
		},
		
		setController (c){
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
			this.factory = f;
		},
		
		setRenderFactory (f){
			this.renderFactory = f;
		},
		
		setToolbar (t){
			this.toolbar = t;
			if (this.settings){
				this.toolbar.setSettings(this.settings);
			}
			this.onChangeCanvasViewConfig()
		},

		onChangeCanvasViewConfig () {
			if (this.toolbar) {
				let hasGrid = false
				let hasShowGrid = false
				let grid = null
				if (this.model) {
					hasGrid = this.model.grid.enabled
					hasShowGrid = this.model.grid.visible
					grid = this.model.grid
				}
				this.toolbar.setCanvasViewConfig({
					zoom: this.zoom,
					renderLines: this.renderLines,
					showDistance: this.showDistance,
					showComments:  this.showComments,
					showRuler: this.showRuler,
					hasDataView: this.hasDataView,
					layerListVisible: this.settings.layerListVisible,
					hasGrid: hasGrid,
					hasVisibleGrid: hasShowGrid,
					grid: grid
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

			if (key === 'showDistance') {
				this.setShowDistance(value)
			}

			if (key === 'showComments') {
				this.setCommentView(value)
			}

			if (key === 'showRuler') {
				this.setShowScreenRuler(value)
			}

			if (key === 'hasGrid') {
				this.setEnableGrid(value)
			}

			if (key === 'hasVisibleGrid') {
				this.setVisibleGrid(value)
			}

			if (key === 'showGrid') {
				this.showGrid(value)
			}

			if (key === 'layerListVisible') {
				this.setLayerVisibility(value)
			}

			if (key === 'hasDataView') {
				this.setDataView(value)
			}
		},

		setScreenName (screen) {
			this.logger.log(-1, "setScreenName", "enter > " + screen.name);
			if (this.layerList){
				this.layerList.changeName(screen);
			}
		},

		setWidgetName (widget) {
			this.logger.log(-1, "setWidgetName", "enter > " + widget.name);
			if (this.layerList){
				this.layerList.changeName(widget);
				/**
				 * Also update inherited
				 */
				let viewWidget = this.model.widgets[widget.id]
				if (viewWidget && viewWidget.copies) {
					viewWidget.copies.forEach(copyId => {
						let copyWidget = this.model.widgets[copyId]
						if (copyWidget) {
							this.layerList.changeName(copyWidget);
						}
					})
				}
			}
		},

		setGroupName (group) {
			this.logger.log(-1, "setGroupName", "enter > " + group.name);
			if (this.layerList){
				this.layerList.changeName(group);
			}
		},
		
		setModel (model){
			this.model = model;
			this.onChangeCanvasViewConfig()
		},
		
		
		setMode (mode, forceRender){
			this.logger.log(3,"setMode", "enter > " + mode +" != " + this.mode + " > forceRender : " + forceRender);
			if(mode != this.mode ){
				
				/**
				 * Toggle mode specify css class
				 */
				css.remove(this.domNode, "MatcCanvasMode"+this.mode);
				css.add(this.domNode, "MatcCanvasMode"+mode);
			
				this.mode = mode;
				if(this.toolbar){
					this.toolbar.setMode(mode);
				}
				/**
				 * FIXME: Make sure this is correct!
				 */
				//this.rerender();
				if(forceRender){
					this.rerender();
				} else {
					this.inlineEditStop();
					this.reWireEvents();
					this.renderSelection();
				}

			} else if(forceRender){
				this.rerender();
			}
		},

		getMode (){
			return this.mode;
		},
		
		getStatusBar (){
			return this.status;
		},
		
		onExit (){
			this.logger.log(-1,"onExit", "enter > " );
			this.active = false;
		}, 

		
		
		/***************************************************************************
		 * Settings
		 ***************************************************************************/

		initSettings (){
			this.logger.log(0, "initSettings", "enter > " );
			/**
			 * default settings
			 */
			this.settings = {
				canvasTheme : "MatcLight",
				lineColor : "#333",
				lineWidth : 1,
				storePropView : true,
				moveMode : "ps",
				startToolsOnKeyDown : true,
				mouseWheelMode : "scroll",
				renderLines : true,
				keepColorWidgetOpen: true,
				layerListVisible: false,
				showRuler: true,
				fastRender: false,
				hasProtoMoto: false
			};
			
			var s = this._getStatus("matcSettings");
			if (s){
				/**
				 * Cant we use setSetiings her??
				 */
				if(s.canvasTheme){
					this.settings.canvasTheme = s.canvasTheme;
				}

				if(s.showRuler != null){
					this.settings.showRuler = s.showRuler;
				}

				if(s.lineColor){
					this.settings.lineColor = s.lineColor;
				}
				if(s.lineWidth){
					this.settings.lineWidth = s.lineWidth;
				}
				if(s.moveMode){
					this.settings.moveMode = s.moveMode;
				}
				if(s.renderLines != null){
					this.settings.renderLines = s.renderLines;
				}
				if(s.showDistance != null){
					this.settings.showDistance = s.showDistance;
				}
				if(s.showAnimation != null){
					this.settings.showAnimation = s.showAnimation;
				}
				if(s.keepColorWidgetOpen === true || s.keepColorWidgetOpen === false){
					this.settings.keepColorWidgetOpen = s.keepColorWidgetOpen;
				}
				if(s.storePropView != null){
					this.settings.storePropView = s.storePropView;
				}
				if(s.startToolsOnKeyDown != null){
					this.settings.startToolsOnKeyDown = s.startToolsOnKeyDown;
				}
				if(s.mouseWheelMode != null){
					this.settings.mouseWheelMode = s.mouseWheelMode;
				}
				if (s.layerListVisible === true || s.layerListVisible === false){
					this.settings.layerListVisible = s.layerListVisible;
				}
				if (s.fastRender != null) {
					this.settings.fastRender = s.fastRender
				}
				if (s.hasProtoMoto != null) {
					this.settings.hasProtoMoto = s.hasProtoMoto
				}
			} else {
				this.logger.log(2,"initSettings", "exit>  no saved settings" );
			}	
			this.applySettings(this.settings);
		
		},
		
		getSettings (){
			return this.settings;
		},
		
		/**
		 * Called from the dialog
		 */
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
			if(s.moveMode){
				this.settings.moveMode = s.moveMode;
			}
			if(s.storePropView!=null){
				this.settings.storePropView = s.storePropView;
			}
			if(s.startToolsOnKeyDown!=null){
				this.settings.startToolsOnKeyDown = s.startToolsOnKeyDown;
			}
			if(s.mouseWheelMode!=null){
				this.settings.mouseWheelMode = s.mouseWheelMode;
			}
			if(s.keepColorWidgetOpen === true || s.keepColorWidgetOpen === false){
				this.settings.keepColorWidgetOpen = s.keepColorWidgetOpen;
			}
			if (s.layerListVisible === true || s.layerListVisible === false){
				this.settings.layerListVisible = s.layerListVisible;
			}
			if (s.fastRender != null) {
				this.settings.fastRender = s.fastRender
			}
			if (s.hasProtoMoto != null) {
				this.settings.hasProtoMoto = s.hasProtoMoto
			}
			this._setStatus("matcSettings",this.settings );
			this.applySettings(this.settings);

			this.rerender();
		},
		
		applySettings (s){
			this.logger.log(0,"applySettings", "enter > "  + s.canvasTheme + " &> " + s.moveMode);
			
			if(s.moveMode){
				this.moveMode = s.moveMode;
			}
			
			if(s.renderLines!=null){
				this.renderLines = s.renderLines;
			}
			
			if(s.showDistance!=null){
				this.showDistance = s.showDistance;
			}

			if(s.showRuler!=null){
				this.showRuler = s.showRuler;
			}
			
			if(s.showAnimation!=null){
				this.showAnimation = s.showAnimation;
			}
			
			if(s.lineColor){
				this.defaultLineColor = s.lineColor;
			}
			
			if(s.lineWidth){
				this.defaultLineWidth = s.lineWidth;
			}
			
			if(s.mouseWheelMode){
				this._mouseWheelMode = s.mouseWheelMode;
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
					this.defaultLineColor = "#777";
				}
			
			}
			this.settings = s;

			if (this.toolbar) {
				this.toolbar.setSettings(this.settings);
			}
			this.onChangeCanvasViewConfig()
			//console.debug("applySetztings() > exit > renderlines: ", this.renderLines, " > showSettings: ", this.showComments);
		},
		
		
		
		/***************************************************************************
		 * Grid
		 ***************************************************************************/


		showGrid (target){
			
			var db = new DomBuilder();
			var popup = db.div("MatcGridSelectorDialogContent MatcPadding").build();
					
			var selector = this.$new(GridSelector);
			selector.setValue(this.controller.model);
			selector.placeAt(popup)
			
			var dialog = this.createDialog();
			var bar = db.div("container").div("row").div("col-md-12").div("MatcButtonBar MatcMarginTop").build(popup);
			var write = db.div("MatcButton", "Save").build(bar);
			var cancel = db.a("MatcLinkButton ", "Cancel").build(bar);
			
			dialog.own(on(cancel, touch.press, lang.hitch(this, "closeDialog")));
			dialog.own(on(write, touch.press, lang.hitch(this, "setGrid2", selector)));
			if (target.screenX) {
				target = this.gridBtn
			}
			dialog.popup(popup, target);
		},

		setEnableGrid (value) {
			let grid = lang.clone(this.model.grid)
			grid.enabled = value
			if (grid.type === "columns"){
				this.controller.setGrid2(grid, "rgba(0,0,0,0.25)", "line");
			} else {
				this.controller.setGrid2(grid, "#cecece", "line");
			}
		},

		setVisibleGrid (value) {
			this.forceRenderUpdates();
			let grid = lang.clone(this.model.grid)
			grid.visible = value
			if (grid.type === "columns"){
				this.controller.setGrid2(grid, "rgba(0,0,0,0.25)", "line");
			} else {
				this.controller.setGrid2(grid, "#cecece", "line");
			}
		},
		
		setGrid2 (selector){
		
			if(selector.isValid()){
				this.forceRenderUpdates();
				var grid = selector.getValue();
				this.gridBackground = {}
				if (grid.type === "columns"){
					this.controller.setGrid2(grid, "rgba(0,0,0,0.25)", "line");
				} else {
					this.controller.setGrid2(grid, "#cecece", "line");
				}
				this.closeDialog();
			} else {
				this.dialog.shake();
			}
		},

		isInt (value){
			var er = /^-?[0-9]+$/;
			return er.test(value);
		},
		
		/***************************************************************************
		 * Dialog Handling
		 ***************************************************************************/
		
		createDialog (){
			this.dialog = new Dialog();
			//this.dialog.wrapperClass =  "MatcCanvasDialogWrapper";
			this.state = "dialog";
			return this.dialog;
		},
		
		closeDialog (){
			this.state =0;
			
			if(this.dialog){
				this.dialog.close();
			}
			this.dialog = null;
		},
		
		setState (s){
			this.state = s;
		},
		
		/***************************************************************************
		 * Keyboard handling
		 ***************************************************************************/
		
		onKeyPress (e){
	
			this._currentKeyEvent = e;
			var k = e.keyCode ? e.keyCode : e.which;
			var target = e.target;
			var isMeta = e.altKey || e.ctrlKey || e.metaKey;
			var isCntrl = e.ctrlKey || e.metaKey;

			// console.debug("onKeyPress", target, isMeta, css.contains(target, "MatcIgnoreOnKeyPress"))
		
			/**
			 * Cancel listeners must be always fired.
			 */
			if (k == keys.ESCAPE){
				this.onCancelAction();
				topic.publish("matc/canvas/esc");
				this.stopEvent(e);
				return
			} 

			/**
			 * IF we have a dialog open, we return
			 */
			if (this.state == "simulate" || this.state == "dialog" || Dialog.getCurrentDialog()) {
				this.logger.log(-1 ,"onKeyPress", "exit because of dialog");
				return;
			}
			
			/**
			 * Inputs from the toolbar should be also ignored
			 */
			if (css.contains(target, "MatcIgnoreOnKeyPress")){
				return;
			}
			
			this._currentKeyPressed = k;

			/**
			 * Do nothing if we are in inline edit
			 */
			if (this._inlineEditStarted ){
				this.onSelectionKeyPress(e);
			/**
			 * Arrow dispatch if cntrl is not pressed
			 */
			} else if(k == 37 && !isCntrl){
				if(!this._inlineEditStarted ){
					this.onArrowLeft(e);
					this.stopEvent(e);
				}
			} else if(k == 39 && !isCntrl){
				if(!this._inlineEditStarted){
					this.onArrowRight(e);
					this.stopEvent(e);
				}
			} else if(k == 40 && !isCntrl){
				if(!this._inlineEditStarted){
					this.onArrowDown(e);
					this.stopEvent(e);
				}
			} else if(k == 38 && !isCntrl){
				if(!this._inlineEditStarted ){
					this.onArrowUp(e);
					this.stopEvent(e);
				}
			} else if (k==16){ // shift
				
				//if(!this._inlineEditStarted && !this._resizeStartPos){
					//this.setMode("select");
						
					/**
					 * Start selection tool
					 */
					//this.unSelect();
					//this._selectionToolStart = this._lastMousePos;
					//this._selectionToolMoveListener = on(win.body(),"mousemove", lang.hitch(this,"onSelectionMove"));
					
					//this.showHint("Move mouse to start selecting...");
					
				//}
			} else if (k==18){ // alt
				if(!this._inlineEditStarted && !this._resizeStartPos && !this._dragNDropBoxWidgetStart){
					if(this.mode == "edit"){
						this.setMode("distance");
						if(this._selectWidget){
							this.renderScreenDistance();
						}	else {
							if(this._lastHoverWidget){
								this.renderWidgetDistance(this._lastHoverWidget);
							}
						}
					} else {
						console.debug("ALT while", this._dragNDropBoxWidgetStart);
					}
				}
			} else if (k==32){ // space
			
				if(!this._inlineEditStarted ){
					this.stopEvent(e);
					if(this.getMode() != "move"){
						this.showHint("Move the mouse to move canvas...");
						this.onDragStart(this.container, "container", "onCanvasDnDStart", "onCanvasDnDMove", "onCanvasDnDEnd", null, this._lastMouseMoveEvent, true);
						/**
						 * If we are adding a line, we do not want to change mode ( and trigger redraw).
						 * Instead we block the Add._updateAddLineMove() method by setting the pause flag.
						 */
						if (this.getMode() != "addLine") {
							this.setMode("move"); 
							this.setDnDMinTime(0);
						} else {
							this._addLineIsPaused = true;
						}
					}
				}
				
			/**
			 * H dispatch...
			 */
			} else if(k == 72){
				if(!this._inlineEditStarted && !this._selectionToolStart){
					this.setMode("hotspot");
					this.unSelect();
					this.showHint("Mark the area where to create the hotspot...");
					this.stopEvent(e);
				}
			/**
			 * R dispatch...
			 */
			} else if(k == 82){
				if(!this._inlineEditStarted  && !this._selectionToolStart){
					this.setMode("addBox");
					this.unSelect();
					this.showHint("Mark the area where to create the box...");
					this.stopEvent(e);

				}
			/**
			 * C dispatch...
			 */
			} else if(k == 67 && !isMeta){
				if(!this._inlineEditStarted  && !this._selectionToolStart){
					if (this._selectWidget || this._selectGroup || this._selectMulti) { // _selectGroup
						this.onReplicate();
						this.stopEvent(e);
						e.cancelBubble = true
					} else {
						this.showHint("Cloning does not work on multi selection");
					}
				}
			/**
			 * L dispatch...
			 */
			} else if(k == 76){
				if(!this._inlineEditStarted  && !this._selectionToolStart){
					if (this._selectWidget && this._lastMouseMoveEvent) {
						this.addLine({
							from : this._selectWidget.id, 
							event:this._lastMouseMoveEvent
						})
					}
					if (this._selectedScreen && this._lastMouseMoveEvent) {
						this.addLine({
							from : this._selectedScreen.id, 
							event:this._lastMouseMoveEvent
						})
					}
					if (this._selectGroup && this._lastMouseMoveEvent) {
						this.addLine({
							from : this._selectGroup.id, 
							event:this._lastMouseMoveEvent
						})
					}
				}
			/**
			 * D dispatch...
			 */
			} else if(k == 68 && !isMeta){
				if(!this._inlineEditStarted  && !this._selectionToolStart){
					if (this._selectMulti) {
						this.onDistribute();
						this.stopEvent(e);
						e.cancelBubble = true
					} else {
						this.showHint("Select multiple widgets to distribute equally...");
					}
				}
			/**
			 * T dispatch...
			 */
			} else if(k == 84){
				if(!this._inlineEditStarted  && !this._selectionToolStart){
					this.setMode("addText");
					this.showHint("Mark the area where to create the txt...");
					this.stopEvent(e);
				}
			/**
			 * W dispatch...
			 */
			} else if(k == 87){
				if(!this._inlineEditStarted){
					if(this.toolbar){
						this.toolbar.showWidgetSelector();
					}
				}
			/**
			 * S dispatch...
			 */
			} else if(k == 83){
				if(!this._inlineEditStarted){
					if(this.toolbar){
						this.toolbar.showScreenSelector();
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
			} else if(k == keys.DELETE || k == keys.BACKSPACE){
				var removed = this.onRemoveSelected();
				if(removed){
					this.stopEvent(e);
				}
			} else if (e.altKey || e.ctrlKey || e.metaKey){

				this.logger.log(0,"onKeyPress", "enter > " + k + " > ctrl : " +e.ctrlKey + " > meta :" +(e.ctrlKey || e.metaKey));
					
				/**
				 * Copy only when no inline edit
				 */
				if(!this._inlineEditStarted){
					if(k == 67){ // ctrl-c
						this.onCopy();
						this.stopEvent(e);
					}
					if(k == 86){ // ctrl -v
						this.onPaste();
						this.stopEvent(e);
					}
					if(k == 88){// ctrl-x
						this.onCut();
						this.stopEvent(e);
					}
					if(k == 90){// ctrl-z
						this.controller.undo();
						this.stopEvent(e);
					}
					if(k == 89){// ctrl-y
						this.controller.redo();
						this.stopEvent(e);
					}
					
					if(k == 68){ // ctrl-d
						this.onDuplicate();
						this.stopEvent(e);
					}
					
					
					if(k == 40){ // ctrl & down
						if(this.toolbar){
							this.stopEvent(e);
							this.toolbar.onToolWidgetLayer("back");
						}
					}
						
					if(k == 38){ // ctrl + up
						if(this.toolbar){
							this.stopEvent(e);
							this.toolbar.onToolWidgetLayer("front");
						}
					}
							
						
					if(k == 71){ // ctrl-g
						this.onGroup();	
						this.stopEvent(e);
					}
				}
		
			} else {
				/**
				 * Default like inline edit
				 */
				this.onSelectionKeyPress(e);
			}
			
		},
		
		getCurrentKeyCode  () {
			if(this._currentKeyEvent){
				return this._currentKeyEvent.keyCode ? this._currentKeyEvent.keyCode : this._currentKeyEvent.which
			}
			return -1;
		},
		
		onKeyUp (e){
			
			if(this.state == "simulate" || this.state == "dialog" || Dialog.getCurrentDialog()){
				this.logger.log(-1 ,"onKeyUp", "exit because of dialog");
				return;
			}
			
			var target = e.target;
			if(css.contains(target, "MatcIgnoreOnKeyPress")){
				return
			}
			
			var k = e.keyCode ? e.keyCode : e.which;
			
			if(this._inlineEditStarted ){
				/**
				 * Do nothing...
				 */
					return;
			} else if(k==16){
				/**
				 * End selection
				 */
				//this.onSelectionEnd();
				//this.setMode("edit");
			} else if (k==18){ // alt
				this.cleanUpAlignment();
				this.setMode("edit");
			} else if (k==68){ // D
				//this.onDistributeEnd();
				//this.stopEvent(e);
				//e.cancelBubble = true
			} else if (k==72){ // H
	//			 if(this.settings.startToolsOnKeyDown){
	//				 this.onToolHotspotEnd(this._lastMouseMoveEvent);
	//		     }
	//			 this.setMode("edit");
	//		     this.stopEvent(e);
			} else if (k==82){ // B
	//			 if(this.settings.startToolsOnKeyDown){
	//				 this.onToolBoxEnd(this._lastMouseMoveEvent);
	//			 }
	//			 this.setMode("edit");
	//		     this.stopEvent(e);
			} else if (k==32){ // space
				this.onDragEnd(this._lastMouseMoveEvent);
				/**
				 * Enable line Add._updateAddLineMove again.
				 * Set mode to edit, if we are not adding a line
				 */
				this._addLineIsPaused = false;
				if (this.getMode() != "addLine") {
					this.setMode("edit");
				} 
				this.stopEvent(e);
			} else if (k==84){ // t
	//			 if(this.settings.startToolsOnKeyDown){
	//				 this.onToolTextEnd(this._lastMouseMoveEvent);
	//			 }
	//			 this.setMode("edit");
	//		     this.stopEvent(e);
			} else if (k==72 || k==84 || k == 66 || k == 70){
				this.stopEvent(e);
				this.setMode("edit");
			}
			
			delete this._currentKeyPressed;
			delete this._currentKeyEvent;
		},
	
		/***************************************************************************
		 * Helper Functons
		 ***************************************************************************/

		initMouseTracker (){
			this.own(on(win.body(),"mousemove", lang.hitch(this,"onMouseMove")));
		},

		onMouseMove (e){
			var pos2 = this.getCanvasMousePosition(e, true);
			/**
			 * if we show, only with in screen position... dunno if this gets to slow...
			 */
			this._lastMousePos = pos2;
			this._lastMouseMoveEvent = e;
		},
		destroy (){
			this.cleanUp();
			this._dojoCleanUpOwn();
			this._dojoCleanUpEvent();
			this.cleanUpTempListener();
		}
	},
    mounted () {
    }
}
</script>