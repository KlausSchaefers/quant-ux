<script>
import on from 'dojo/on'
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import win from 'dojo/_base/win'
import ModelUtil from 'core/ModelUtil'


export default {
    name: 'Add',
    mixins:[],
    data: function () {
        return {
            addNDropOffSet: 10,
            zoomOnLineAdd: false
        }
    },
    components: {},
    methods: {
      	addMultiThemedScreens (params) {
			let z = this.getZoomFactor();

			let screens = params.obj;
			let clonedScreens = []

			let pos = this.getCanvasMousePosition(params.event);
			pos = this.getUnZoomedBox(pos, this.zoom, this.zoom);
			for(let i=0; i< screens.length;i++){
				/**
				 * FIXME: Do something with rows???
				 */
				let screen = screens[i];
				let clonedScreen = this.getZoomedBox(lang.clone(screen),z,z);
				clonedScreens.push(clonedScreen);
				clonedScreen.x = pos.x + (this.model.screenSize.w + this.getZoomed(100,this.zoom)) * i;
				clonedScreen.y = pos.y;
			}
			this.controller.addMultiScreens(clonedScreens, true);
		},

		addScriptObject (params) {
			this.logger.log(1,"addScriptObject", "enter");

			this._createAddCommand("addScriptObject", params);

			this._addWidget(params, params.obj, "addScript");
		},

		addRestObject (params){
			this.logger.log(1,"addRestObject", "enter");

			this._createAddCommand("addRestObject", params);

			this._addWidget(params, params.obj, "addRest");
		},


		addLogicGroup (params){
			this.logger.log(0,"addLogicGroup", "enter");

			this._createAddCommand("addLogicGroup", params);

			this._addWidget(params, params.obj, "addLogic");

		},


		addClonedWidget (zoomedModel, e){

			/**
			 * Same as adding themed widget. Just we do not change mode
			 * (function called from distance). Also we need the stop DND
			 * on mouse up!
			 */
			var params = {
				obj : this.getUnZoomedBox(zoomedModel, this.zoom, this.zoom),
				event : e,
				mouseup : true
			};
			this.addThemedWidget(params, "distance");
		},


		addImportedApp (params) {
			this.logger.log(-1,"addThemedScreenAndWidgets", "enter", params);
			this._createAddCommand("addImportedApp", params);
			this._addScreensAndWidgets(params, params.obj, 'MatcImportBox');
		},

		
		/**********************************************************************
		 * Add  from Theme. Themes are essentially the same as templates, but we
		 * do not assume there is a template defined in the model. Instead, there
		 * is an external theme and we will copy all styles
		 **********************************************************************/
		addThemedWidget (params, mode){
			this.logger.log(1,"addThemedWidget", "enter");
			this._createAddCommand("addThemedWidget", params);
			this._addWidget(params, params.obj, mode);
		},


		addThemedScreen (params){
			this.logger.log(1,"addThemedScreen", "enter");
			this._createAddCommand("addThemedScreen", params);
			this._addScreen(params, params.obj);
		},

		addThemedScreenAndWidgets (params){
			this.logger.log(-1,"addThemedScreenAndWidgets", "enter", params);
			this._createAddCommand("addThemedScreenAndWidgets", params);
			this._addScreensAndWidgets(params, params.obj);
		},


		addThemedGroup (params){
			this.logger.log(1,"addThemedGroup", "enter");

			this._createAddCommand("addThemedGroup", params);

			var group = params.obj;

			var z = this.getZoomFactor();

			/**
			 * create div
			 */
			var boundingBox = this.getBoundingBoxByBoxes(group.children);
			boundingBox = this.getZoomedBox(boundingBox,z,z);

			var div = this.createBox(boundingBox);
			css.add(div, "MatcAddBox")

			var children = group.children;
			for(var i=0; i< children.length; i++){
				var child = children[i];
				/**
				 * Create a copy and resize it...Otherwise
				 * the zoomed model arrives in the controller..
				 */
				var widget = this.getZoomedBox(lang.clone(child),z,z);
				var widgetDIV = this.createWidget(widget);
				div.appendChild(widgetDIV);

			}

			if(!this._alignmentToolInited){
				this.alignmentStart("boundingbox", boundingBox, "All");
			}

			this._onAddNDropStart(div, group, params.event, "_onThemedGroupAdd");

			this.setState(3);

		},


		_onThemedGroupAdd (pos, group){
			this.logger.log(0,"_onThemedGroupAdd", "enter");

			this.controller.addGroupByTheme(group, pos);

			this._onAddDone();

			this.setState(0);
		},



		/**********************************************************************
		 * Add Template
		 **********************************************************************/

		addTemplatedWidget (params){
			this.logger.log(1,"addTemplatedWidget", "enter > " + params.id);

			this._createAddCommand("addTemplatedWidget", params);

			/**
			 * check what kind of template this is.
			 */
			var widget = this.factory.createTemplatedModel(params);
			ModelUtil.inlineBoxDesignToken(widget, this.model)
			/**
			 * Render drag and drop!
			 */
			this._addWidget(params, widget);
		},



		addTemplatedScreen (params){
			this.logger.log(0,"addTemplatedScreen", "enter");

			this._createAddCommand("addTemplatedScreen", params);

		},

		addTemplatedGroup (params){
			this.logger.log(-1,"addTemplatedGroup", "enter > XXX");

			this._createAddCommand("addTemplatedGroup", params);

			var group = this.factory.createTemplatedModel(params);

			this._addTemplatedGroup(params, group, "_onTemplateGroupAdd");
		},

		_addTemplatedGroup (params, group, callback){

			this.setMode("add");

			const z = this.getZoomFactor();

			/**
			 * create div
			 */
			let boundingBox = this.getBoundingBox(group.children);
			boundingBox = this.getZoomedBox(boundingBox,z,z);
			const div = this.createBox(boundingBox);
			css.add(div, "MatcAddBox")

			const children = this.getTemplateGroupOrderChildren(group);
			for(var i=0; i< children.length; i++){
				const child = children[i];
				let widget = this.factory.createTemplatedModel(child);
				widget = this.getZoomedBox(widget,z,z);
				const widgetDIV = this.createZoomedWidget(widget);
				div.appendChild(widgetDIV);
			}

			if(!this._alignmentToolInited){
				this.alignmentStart("boundingbox", boundingBox, "All");
			}
			this._onAddNDropStart(div, group, params.event, callback);
			this.setState(3);
		},

		_onTemplateGroupAdd (pos, group){
			this.controller.addGroupByTemplate(group, pos);
			this._onAddDone();
			this.setState(0);
		},


		/**********************************************************************
		 * Add Screen
		 **********************************************************************/


		addScreen (params){
			this.logger.warn("addScreen", "DEPRECATED");

			var screen = this.factory.createScreenModel(params);
			screen.id = "_tempScreen";

			this._addScreen(params, screen);
		},

		_addScreen (params, screen){

			if(!this._alignmentToolInited){
				var zoomedModel = this.getZoomedBox(lang.clone(screen), this.getZoomFactor(), this.getZoomFactor());
				this.alignmentStart("screen", zoomedModel, "All");
			}
			this.setMode("addScreen");

			var z = this.getZoomFactor();
			var zoomedScreen = this.getZoomedBox(lang.clone(screen),z,z);
			var div = this.createScreen(zoomedScreen);
			css.add(div, "MatcAddBox")
			this.renderFactory.setStyle(div, zoomedScreen);
			this._onAddNDropStart(div, screen, params.event, "onScreenAdded");
			this.setState(3);
		},

		onScreenAdded (pos, model){
			this.controller.addScreen(model, pos);
			this._onAddDone();
			this.setState(0);
		},

		/**********************************************************************
		 * Add Screens && Widget
		 **********************************************************************/
		_addScreensAndWidgets (params, app, cls) {

			const screens = Object.values(app.screens)
			if (screens.length !== 1) {
				this.logger.warn("_addScreensAndWidgets", "Not 1 screen!!");
				return
			}
			const screen = screens[0]
			if(!this._alignmentToolInited){
				var zoomedModel = this.getZoomedBox(lang.clone(screen), this.getZoomFactor(), this.getZoomFactor());
				this.alignmentStart("screen", zoomedModel, "All");
			}
			this.setMode("add");

			const z = this.getZoomFactor();
			const zoomedScreen = this.getZoomedBox(lang.clone(screen),z,z);
			const div = this.createScreen(zoomedScreen);
			css.add(div, "MatcAddBox")
			if (cls) {
				css.add(div, 'MatcImportBox')
			} else {
				this.renderFactory.setStyle(div, zoomedScreen);
			}

			this._onAddNDropStart(div, app, params.event, "onScreensAndWidgetsAdded");
			this.setState(3);
		},

		onScreensAndWidgetsAdded (pos, model) {
			this.logger.log(-1, "onScreensAndWidgetsAdded", "enter", pos, model);
			this.controller.addScreensAndWidgets(model, pos);
			this._onAddDone();
			this.setState(0);
		},

		/**********************************************************************
		 * Add Widget
		 **********************************************************************/

		addWidget (params){
			console.warn("addWidget() > DEPRECATED");
			this.logger.log(1,"addWidget", "enter");

			/**
			 * create temp widget for rendering
			 */
			var widget = this.factory.createWidgetModel(params);
			widget.id ="_tempWidget";

			/**
			 * Render drag and drop!
			 */
			this._addWidget(params, widget);
		},

		_addWidget (params, widget, mode){
			this.logger.log(-1,"_addWidget", "enter", widget);

			if(mode){
				this.setMode(mode);
			} else {
				this.setMode("add");
			}

			/**
			 * Zoom. We create a copy because we want to pass the original object to
			 * the controller
			 */
			var z = this.getZoomFactor();
			var zoomedWidget = this.getZoomedBox(lang.clone(widget),z,z);

			/**
			 * Call after setMode() because the might trigger a redraw and would
			 * remove the GridRuler
			 */
			if(!this._alignmentToolInited){
				this.alignmentStart("widget", zoomedWidget, "All");
			}

			/**
			 * add addNDrop div
			 */
			var div = this.createZoomedWidget(zoomedWidget);
			css.add(div, "MatcAddBox")

			/**
			 * add stop listener
			 */
			this._onAddNDropStart(div, widget, params.event, "onWidgetAdded", params.mouseup);
			this.setState(3);
			this.logger.log(2,"_addWidget", "exit");
		},

		onWidgetAdded (pos, model){
			this.logger.log(0,"onWidgetAdded", "enter");

			var newWidget = this.controller.addWidget(model, pos);
			if(newWidget){
				requestAnimationFrame( () => {
					this.onWidgetSelected(newWidget.id, true);
				})
			}

			this._onAddDone();

			this.setState(0);
		},


		/**********************************************************************
		 * Add line
		 *
		 * This process has three steps.
		 *
		 * 1) the user select the start widget (onLineStartSelected). If the
		 * user has already selected an widget we step go to step 2)
		 *
		 * 2) the user set 0:n support points (onLinePointSelected)
		 *
		 * 3) the user select the end screen (onLineEndSelected)
		 **********************************************************************/

		addLineAtSelected (e, isLineDndStarted = false) {
			this.logger.log(-1,"addLineAtSelected", "enter > isLineDnd: " + isLineDndStarted);

			const selectedWidget = this.getSelectedWidget()

			if (selectedWidget && this._lastMouseMoveEvent) {

				/**
				 * Check if there is a line
				 */
				if (!ModelUtil.isLogicWidget(selectedWidget)) {
						let lines = this.getFromLines(selectedWidget)
						if (lines.length > 0) {
							this.logger.log(-1,"addLineAtSelected", "EXIT because line exists");
							this.showError('The widget has already a link')
							return
						}
				}

				this.addLine({
					from : selectedWidget.id,
					event:this._lastMouseMoveEvent
				})
			}
			if (this.getSelectedScreen() && this._lastMouseMoveEvent) {
				this.addLine({
					from : this.getSelectedScreen().id,
					event:this._lastMouseMoveEvent
				})
			}
			if (this.getSelectedGroup() && this._lastMouseMoveEvent) {
				this.addLine({
					from : this.getSelectedGroup().id,
					event:this._lastMouseMoveEvent
				})
			}

			/**
			 * Set flag so wiring.vue knwos how to handle mouseup.
			 * Add last, because addLine() will call cleanup
			 */
			this._addLineIsDndStarted = isLineDndStarted
		},

		addLine (params){
			this.logger.log(-1,"addLine", "enter " + params.from +  " " + params.animation);

			/**
			 * Set extra mode to also work with the
			 */
			this._oldMode = this.mode;
			this.setMode("addLine");

			this._createAddCommand("addLine", params);

			this.cleanUpAddLine();

			this.setCanvasCancelCallback("cancelAddLine");

			this._addLineParams = params;


			this._addLineStartedFromTemplate = false // this.isLineStartedFromTemplate(params)

			/**
			 * Store all other widget where a line can go to
			 */
			this._addLineActionTargets = []
			for (let id in this.model.widgets) {
				let widget = this.model.widgets[id]
				if (this._addLineStartedFromTemplate) {
					/**
					 * FIXME: Make sure there is no other templates link from some other widget>
					 */
					if (widget.template) {
						let parent = this.getParentScreen(widget, this.model)
						if (!parent) {
							this.logger.log(-1,"addLine", "addTemplate", widget.name);
							this._addLineActionTargets.push(widget)
						}				
					}
				} else {
					if (widget.type === "Rest") {
						this._addLineActionTargets.push(widget)
					}
					if (widget.type === "LogicOr") {
						this._addLineActionTargets.push(widget)
					}		
					if (widget.type === "Script") {
						this._addLineActionTargets.push(widget)
					}	
				}
			}

			if (params.from){

				let widget = this.model.widgets[params.from];
				if (widget) {
					this.logger.log(1,"addLine", "draw widget line");
					this.onLineStartSelected(params.from, null, null, params.event );
					this._updateAddLineMove(params.event);
				} else {
					let screen = this.model.screens[params.from];
					if (screen) {
						this.logger.log(0,"addLine", "draw screen line");
						this.onLineStartSelected(params.from, null, null, params.event );
						this._updateAddLineMove(params.event);
					} else if (this.model.groups) {
						let group = this.model.groups[params.from];
						if (group){
							this.logger.log(1,"addLine", "draw group line");
							this.onLineStartSelected(params.from, null, null, params.event );
							this._updateAddLineMove(params.event);
						} else {
							this.logger.log(0,"addLine", "No element with id ", params.from);
						}
					}
				}

			} else {
				this.logger.log(0,"addLine", "No start passed...");
				this.setBoxClickCallback("onLineStartSelected");

				/**
				 * fade out all widgets that have an transition
				 */
				for(let i=0; i< this.model.widgets.length; i++){
					let widget = this.model.widgets[i];
					if(this.hasLine(widget)){
						var div = this.widgetDivs[widget.id];
						css.add(div, "");
					}
				}

				this.setState(6);
			}
		},

		isLineStartedFromTemplate (params) {
			if (params.from){
				const widget = this.model.widgets[params.from];
				if (this.isTemplatedWidgetOnCanvas(widget)) {
					return true
				}
			
				const group = this.model.groups[params.from];
				if (group && group.template){
					this.logger.warn("isLineStartedFromTemplate", "groups not supported");
					const children = group.children
					for (let i=0; i < children.length; i++) {
						let id = children[i]
						const widget = this.model.widgets[id];
						if (this.isTemplatedWidgetOnCanvas(widget)) {
							return true
						}
					}
				}
			}
			return false
		},

		isTemplatedWidgetOnCanvas (widget) {
			if (widget && widget.template) {
					const parent = this.getParentScreen(widget, this.model)
					if (!parent) {
						return true
					}			
			}
			return false
		},

		onLineStartSelected (id, div, pos,e){
			this.logger.log(1,"onLineStartSelected", "enter > " +id);


			var line = this.factory.createLineModel();
			line.id = "_tempLine";
			line.from = id;
			if (this._addLineParams && this._addLineParams.animation) {
				line.animation = this._addLineParams.animation
			}
			if (this._addLineParams && this._addLineParams.duration) {
				line.duration = this._addLineParams.duration
			}

			this._addLineStartPos = this._getMousePosition(e);
			this._addLineStartId = id
			this._addLineModel = line;
			this._addLinePoints=[];
			this._addLineIsPaused = false;
			this._addNDropMove = on(win.body(),"mousemove", lang.hitch(this,"_updateAddLineMove"));

			this.showHint("Select the screen where the click should go to. You can also set some way points in the middle to make it look nicer!");

			this.setState(7);
		},


		onLinePointSelected (e){
			this.logger.log(1,"onLinePointSelected", "enter >  ");

			if(!this._addLineStartPos){
				this._onAddCleanup();
			}

			const pos = this.getCanvasMousePosition(e);
			pos.w = 1;
			pos.h = 1;

			const point = this.drawPoint(pos);
			this.dndContainer.appendChild(point);
			this._addLinePoints.push(point);

			this._addLineModel.points.push(pos);
		},

		onLineEndSelected (id, e){
			this.logger.log(-1,"onLineEndSelected", "enter > "+ id);
			
			if (this._addLineStartedFromTemplate) {
				let widget = this.model.widgets[id];
				if (this.isTemplatedWidgetOnCanvas(widget)) {
					let parentGroup = this.getParentGroup(id)
					/**
					 * Check somehow if the group is templated??
					 */
					let model = this._addLineModel;
					model.isTemplateTransition = true
					if (parentGroup) {
						model.to = parentGroup.id;
						model.isGroup = true
					} else {
						model.to = widget.id;
					}			
			
					this.controller.addLine(model, e);
					this._onAddDone();

				} else {
					this.showError("You have to select a component on the canvas!");
				}
			} else {
				/**
				 * check if we clicked on a screen or widget
				 */
				var screen = this.model.screens[id];
				if (!screen){
					let widget = this.model.widgets[id];
					screen = this.getParentScreen(widget);
				}

				if (screen) {
					let model = this._addLineModel;
					model.to = screen.id;
					this.controller.addLine(model,e);
					this._onAddDone();
				} else {
					/**
					 * Check if we have clicked on LogicElement
					 */
					let widget = this.model.widgets[id];
					if(this.hasLogic(widget)){
						//let fromWidget = this.model.widgets[this._addLineModel.from];
						//if(!this.hasLogic(fromWidget)){
							let model = this._addLineModel;
							model.to = widget.id;
							this.controller.addLine(model, e);
							this._onAddDone();
						//} else {
						//	this.showError("You cannot connect two logic nodes!");
						//}
					} else if (this.hasRest(widget) || this.hasScript(widget)) {
						let model = this._addLineModel;
						model.to = widget.id;
						this.controller.addLine(model, e);
						this._onAddDone();
					} else {
						this.showError("You have to select a screen, logic or cloud element!");
					}
				}
			}
		
			this.cleanUpAddLine();
			this.setMode(this._oldMode);
			this._onAddDone();
			this.setState(0);
		},

		onLineSuggestEnd (e) {
			this.logger.log(-1,"onLineSuggestEnd", "enter > ", e);
			// TODO: add here some cool "create new element" stuff?
		},

		_updateAddLineMove (e){
	
			/**
			 * Pressing space will pause this operation!
			 * The canvas DnD handler will instead move the
			 * canvas.
			 */
			if (this._addLineIsPaused) {
				return;
			}
			this.stopEvent(e);

			if(!this._addLineStartPos){
				this._onAddCleanup();
			}

			const from = this.getFromBox(this._addLineModel);
			let to = this.getCanvasMousePosition(e);
			to.h = 2;
			to.w = 2;

			/**
			 * check if we are hovering over anything
			 */
		 	const screen = this.getHoverScreen(to);
			if(screen && !this._addLineStartedFromTemplate){
				/**
				 * Do not snapp to same screen
				 */
				const startWidget = this.model.widgets[this._addLineStartId]
				if (startWidget) {
					let startParent = this.getParentScreen(startWidget);
					if (!startParent || startParent.id !== screen.id) {
						to = screen;
					}
				} else {
					to = screen;
				}

			} else {
				/**
				 * Check for all the smart widgets, if we can snapp
				 */
				if (this._addLineActionTargets) {
					for (let i=0; i < this._addLineActionTargets.length; i++) {
						const action = this._addLineActionTargets[i]
						if (this._isContainedInBox(to, action)) {
							to = action
							break;
						}
					}
				}
			}

			const layoutedLine = this.layoutLine(from, to, this._addLineModel);

			if(!this._addLineSVG){
				this._addLineSVG = this.drawLine(this._addLineModel.id, layoutedLine);
			} else {
				this._addLineSVG.attr("d", this.lineFunction(layoutedLine));
			}

		},

		cancelAddLine (){
			this.logger.log(0,"cancelAddLine", "enter");

			this.cleanUpAddLine();
			this._onAddDone();
		},


		cleanUpAddLine (){
			this.logger.log(0,"cleanUpAddLine", "enter");
			this.cleanUpClickCallbacks();
			delete this._addLineParams;
			this._addLinePoints = null;
			this._addLineModel = null;
			this._addLineIsPaused = false;
			this._addLineActionTargets = null;
			this._addLineStartedFromTemplate = false;
			if(this._addLineSVG){
				this._addLineSVG.remove();
			}
			this._addLineSVG = null;
			this._onAddCleanup();
			this.setState(0);
			return true;
		},


		/**********************************************************************
		 * AddNDropMethods
		 **********************************************************************/
		_onAddNDropStart (div, model, e, onEndCallback , mouseup){

			this.setCanvasCancelCallback("_onAddCancel");

			/**
			 * set variables
			 */
			this._addNDropNode = div;
			this._addNDropModel = model;
			this._addNDropNodePos = this.getCanvasMousePosition(e);

			this._addNDropNodePos.w = this.getZoomed(this._addNDropModel.w, this.getZoomFactor());
			this._addNDropNodePos.h = this.getZoomed(this._addNDropModel.h, this.getZoomFactor());
			this._addMDropModel = model;

			this._addCorrectOffset(this._addNDropNodePos);

			this._addNDropEndCallback = onEndCallback;


			/**
			 * append node to domNode
			 */
			css.add(this._addNDropNode,"");
			css.add(this._addNDropNode,"MatcCanvasAddNDropNode");
			this._addNDropUpDateUI();
			this.dndContainer.appendChild(this._addNDropNode);

			/**
			 * register mouse move and release listener, mazbe also esc listener
			 */
			this._addNDropMove = on(win.body(),"mousemove", lang.hitch(this,"_onAddNDropMove"));

			this.setDragNDropActive(false);
			if(mouseup === true){
				this._addNDropUp = on(win.body(),"mouseup", lang.hitch(this,"_onAddNDropUp"));
			} else {
				this._addNDropUp = on(win.body(),"mousedown", lang.hitch(this,"_onAddNDropUp"));
			}
		},


		_onAddNDropMove (e){
			this.stopEvent(e);

			/**
			 * Sometimes there might be still a listener.
			 * We stop that now.
			 */
			if(!this._addNDropNode){
				this._onAddCleanup();
				return;
			}
			this._addNDropStarted = true;

			this._addNDropNodePos = this.getCanvasMousePosition(e);

			this._addCorrectOffset(this._addNDropNodePos);

			/**
			 * Update the stupid  to the alignment works correctly
			 */
			this._addNDropNodePos.w = this.getZoomed(this._addNDropModel.w, this.getZoomFactor());
			this._addNDropNodePos.h = this.getZoomed(this._addNDropModel.h, this.getZoomFactor());
			this._addNDropNodePos = this.allignPosition(this._addNDropNodePos, e);

			if(!window.requestAnimationFrame){
				console.warn("No requestAnimationFrame()");
				this._addNDropUpDateUI();
			} else {
				var callback = lang.hitch(this, "_addNDropUpDateUI");
					requestAnimationFrame(callback);
			}
			return false;
		},


		_addCorrectOffset (box){
			box.x -= this.addNDropOffSet;
			box.y -= this.addNDropOffSet;
			return box;
		},


		_addNDropUpDateUI ( ){
			if(!this._addNDropNode || !this._addNDropNodePos){
				this._onAddCleanup();
				return;
			}
			this.domUtil.setPos(this._addNDropNode, this._addNDropNodePos)
			//this._addNDropNode.style.left = this._addNDropNodePos.x  +"px";
			//this._addNDropNode.style.top = this._addNDropNodePos.y + "px";
		},


		_onAddNDropUp (e){
			this.stopEvent(e);

			var pos = this._addNDropNodePos;
			if(pos.x > 0 && pos.y >0 && pos.x < this.getZoomed(this.canvasPos.w, this.zoom) && pos.y < this.getZoomed(this.canvasPos.h, this.zoom)){
				var model = this._addMDropModel;
				var callback = this._addNDropEndCallback;
				try{
					if(this[callback]){
						this[callback](this._addNDropNodePos, model, e);
					}
				} catch(e){
					this.logger.error("_onAddNDropUp", "Could not indluce callback.", e);
				}
			} else {
				this.logger.error("_onAddNDropUp", "Not placed in canvas");
				this.showError("Please place the element in the canvas");
			}

			this._onAddCleanup();

		},

		_onAddCleanup (){

			if(this._addNDropNode){
				css.remove(this._addNDropNode,"MatcCanvasAddNDropNode");
			}

			this._addNDropMoveCallback = null;
			this._addNDropEndCallback = null;
			this._addNDropClickCallback=null;
			this._addMDropModel = null;
			this._addNDropNewPos = null;
			this._addLineStartId = null
			this._addLineSVG = null;
			delete this._addNDropModel;
			delete this._addLineIsDndStarted

			if(this._addNDropMove)
				this._addNDropMove.remove();
			if(this._addNDropUp)
				this._addNDropUp.remove();
			this._addNDropStarted = false;

			if (this._addNDropNode && this._addNDropNode.parentNode){
				this._addNDropNode.parentNode.removeChild(this._addNDropNode);
			}

			this.setDragNDropActive(true);
			this._addNDropNode = null;

			this.cleanUpAlignment();
		},

		_onAddCancel (){
			this._onAddDone();
			return true;
		},

		_createAddCommand (method, params){
			if(!this._addCurrentCommand){

				this._addCurrentCommand = {
					m : method,
					p : params
				};
			}
		},

		_onAddDone (){
			/**
			 * The add was complete or canceled. We can delete the command!
			 */
			if(this._addCurrentCommand){
				delete this._addCurrentCommand;
			}
			this.setMode("edit", true);
		},

		renderAddCommand (){
			/**
			 * If there is a current add going on, we
			 * should continue doing it...
			 */
			if(this._addCurrentCommand){
				this.logger.log(3,"renderAddCommand", "enter > " + this._addCurrentCommand.m);
				var method = this._addCurrentCommand.m;
				if(this[method]){
					/**
					 * Set the last mouse move event as the event, to make sure we
					 * continue add the same position with the add dnd.
					 */
					var params =this._addCurrentCommand.p;
					params.event = this._lastMouseMoveEvent;
					this[method](params);
				}

			}
		},

		cleanUpAddNDrop (){
			this._onAddCleanup();
		}
    },
    mounted () {
    }
}
</script>