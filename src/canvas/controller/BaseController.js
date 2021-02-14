import hash from 'dojo/hash'
import lang from 'dojo/_base/lang'

import Core from 'core/Core'
import CoreUtil from 'core/CoreUtil'
import Logger from 'common/Logger'

export default class BaseController extends Core {

  constructor (params){
		super()
		this.logger = new Logger("Controller");
		this.mode = 'private'

		if(params && params.mode){
			this.mode =params.mode;
		}

		this.debug = false
		this.active = true

		this.logger.log(1,"constructor", "entry > " + this.mode);
		this.commandStack =  {stack : [], pos : 0, id:0};
		this._lastChangedWidgets = {};
	}


	/**********************************************************************
	 * Dependencies
	 **********************************************************************/

	setPublic (isPublic) {
		if (isPublic) {
			this.mode = 'public'
		}
	}

	setModelService (s) {
		this.modelService = s
	}

	setCanvas (c){
		this.logger.log(3,"setCanvas", "entry");
		this._canvas = c;
	}

	setToolbar (t){
		this.logger.log(3,"setToolbar", "entry");
		this.toolbar = t;
	}

	setModelFactory (f){
		this.logger.log(3,"setModelFactory", "entry");
		/**
		 * Just used for templated widgets...
		 */
		this.factory = f;
	}

	/**
	 * Method is called on first load. Inits the
	 */
	setModel (m, screenID){
		this.logger.log(-1,"setModel", "entry > " + screenID);

		this.fixNegativeCoords(m);

		this.model = m;
		this.oldModel = lang.clone(m);

		// need to run with model set.
		// this.fixWidgetsNotInScreen(m);
		this.fixModelCount(m);
		this.render(screenID);

		if(this.toolbar){
			this.toolbar.setModel(m);
		} else {
			this.logger.log(2,"setModel", "No toolbar");
		}

		if (this._canvas) {
			this._canvas.setFonts(m.fonts)
			this._canvas.setModel(this.model)
		}
	}

	setMode (mode, forceRender){
		this.logger.log(2,"setMode", "entry > " + mode);
		//this.toolbar.setMode(mode);
		// toolbar will nbe called in canvas
		this._canvas.setMode(mode, forceRender);
	}

	setSinglePage (enabled){
		this.logger.log(0,"setSinglePage", "entry > " + enabled);
	}


	getZoomFactor (){
		if(this._canvas){
			return this._canvas.getZoomFactor();
		}
		return 1;
	}

	onExit (){
		this.logger.log(-1,"onExit", "enter > " );
		this.active = false;
	}

	/**********************************************************************
	 * Selection methods
	 **********************************************************************/

	onRulerSelected (screenID, rulerID) {
		this.logger.log(0 ,"onRulerSelected", "enter > ");
		if(this.toolbar){
			var screen = this.model.screens[screenID];
			if (screen) {
				let ruler = screen.rulers.find(r => r.id === rulerID)
				if (ruler) {
					this.toolbar.onRulerSelected(screen, ruler);
				}
			}
		}
	}

	onWidgetSelected (id){
		this.logger.log(3,"onWidgetSelected", "enter > "+ id);
		var widget = this.model.widgets[id];
		if(this.toolbar){
				this.toolbar.onWidgetSelected(widget);
		}
	}

	onInheritedWidgetSelected (widget) {
		this.logger.log(3,"onInheritedWidgetSelected", "enter > "+ widget.id);

		if(this.toolbar){
			this.toolbar.onInheritedWidgetSelected(widget);
		}
	}


	onScreenSelected (id){
		this.logger.log(1,"onScreenSelected", "enter > "+ id);
		var screen = this.model.screens[id];
		if(this.toolbar){
			this.toolbar.onScreenSelected(screen);
		}
	}

	onCanvasSelected (){
		this.logger.log(1,"onCanvasSelected", "enter ");
		if(this.toolbar){
			this.toolbar.onCanvasSelected();
		}
	}

	onLineSelected (id){
		this.logger.log(1,"onLineSelected", "enter > " + id);
		var line = this.model.lines[id];
		if(this.toolbar){
			this.toolbar.onLineSelected(line);
		}
	}

	onMultiSelect (selection){
		this.logger.log(1,"onMultiSelect", "enter > ");
		if(this.toolbar){
			/**
			 * TODO: get all the model elements
			 */
			this.toolbar.onMultiSelect(selection);
		}
	}

	onGroupSelected (id){
		this.logger.log(1,"onGroupSelected", "enter > " + id);
		if(this.model.groups && this.model.groups[id]){
			if(this.toolbar){
				var group = this.model.groups[id];
				this.toolbar.onGroupSelect(group);
			}
		}
	}

	/**********************************************************************
	 * Model change methods
	 **********************************************************************/


	onModelChanged (){
		this.logger.log(3,"onModelChanged", "enter");
		if (this.active) {

			/**
			 * Update the view model too! This is super important
			 * for all child widgets that might other wise not be
			 * correctly updated. This should normally
			 * not require a new rendering!
			 */
			if (this._canvas){
				var zoomedModel = this.createZoomedModel(this._canvas.getZoomFactor());
				this._canvas.setModel(zoomedModel);
				this.setZoomedModelCache(zoomedModel)
			}

			if (this.toolbar){
				this.toolbar.updatePropertiesView();
			}

			this.model.lastUpdate = new Date().getTime();

			var s = JSON.stringify(this.model);
			this.model.size = s.length;

			this.setDirty();

			this.emit('change', this.model)
		} else {
			this.logger.log(1,"onModelChanged", "Exit because not active");
		}
	}

	setDirty (){
		this._dirty = true;
		if (this.debug){
			this.saveModelChanges();
		} else {
			setTimeout(lang.hitch(this, "saveModelChanges"), 300);
		}
	}

	async saveModelChanges () {

		if (this.mode == "public"){
			this.showSuccess("Please register to save changes...");
			this.validateAndFixModel(this.model);
			this.emit("notSavedWarningShow", this.model);
		} else {
			if(this._dirty){
				if(this.oldModel ){

					/**
					 * Validate and fix model
					 */
					this.validateAndFixModel(this.model);

					/**
					 * compute changes and send them to server
					 */
					var changes = this.getModelDelta(this.oldModel, this.model);
					this.logger.log(4,"saveModelChanges", "Save changes " + changes.length);
					if(changes.length > 0){
						this.modelService.updateApp(this.model, changes).then(res => {
							this.onModelUpdated(res);
						})
					} else {
						console.warn("saveModelChanges() > triggered without getting change! We send entire model!");
						this.logger.error("saveModelChanges", "Triggered without getting change! We send entire model");
						// this._doPost("rest/apps/" + this.model.id + ".json", this.model, "onModelSaved");
						let res = await this.modelService.saveApp(this.model)
						this.onModelSaved(res);
					}

					this._dirty = false;


				} else {
					console.warn("saveModelChanges() > No oldModel!", this);
				}

				/**
				 * Clone currrent model as old model
				 */
				this.oldModel = lang.clone(this.model);
			}
		}
	}

	async onModelUpdated (response){
		/**
		 * Some server shit might happen. In this case we
		 * save the entire app.
		 */
		if(response && response.type === "error") {
			this.logger.error("onModelUpdated", "Error while partial save. ");
			let res = await this.modelService.saveApp(this.model)
			this.onModelSaved(res)
			this.logger.sendError("onModelUpdated", new Error("Could not update. Check Server Log"));
		} else {
			this.showSuccess("Model Updated!");
		}
	}

	onModelSaved (){
		this.logger.error("onModelSaved", "Should not have been called!");
		this.showSuccess("Model Saved!");
	}


	/**********************************************************************
	 * Model FIXES
	 **********************************************************************/

	fixModelCount (m){
		var errors = [];
		this.logger.log(4,"fixModelCount", "enter");
		try {
			var max = 0;
			for(let id in m.screens){
				let i = parseInt(id.substring(1));
				max = Math.max(max, i)
			}
			for(let id in m.widgets){
				let i = parseInt(id.substring(1));
				max = Math.max(max, i)
			}
			if (m.lines){
				for(let id in m.lines){
					let i = parseInt(id.substring(1));
					max = Math.max(max, i)
				}
			}
			if (m.groups){
				for(let id in m.groups){
					let i = parseInt(id.substring(1));
					max = Math.max(max, i)
				}
			}
			if (m.templates){
				for(let id in m.templates){
					let i = parseInt(id.substring(1));
					max = Math.max(max, i)
				}
			}
			this.logger.log(4,"fixModelCount", "exit > " + max + " ?= " +m.lastUUID + " == " + (max > m.lastUUID));
			if (max > m.lastUUID){
				errors.push({msg: "lastUUID to small!"})
				this.logger.error("fixModelCount", "fix > " + max + " ?= " +m.lastUUID);
				this.logger.sendError(new Error("Controller.fixModelCount() > Some fuckup"));
				m.lastUUID = max + 1;
			}

		} catch (e){
			console.error('BaseController.fixModelCount() > Error', e)
		}
		return errors;
	}

	/**
	 * Deprecated... Is not called...
	 */
	fixWidgetsNotInScreen (m){
		this.logger.log(2,"fixWidgetsNotInScreen", "enter");
		var errors = [];

		var widgets2Screen = {};
		for(let id in m.screens){
			let screen = m.screens[id];
			let children = screen.children;
			for (let i=0; i < children.length; i++){
				let widgetID = children[i];
				widgets2Screen[widgetID] = id;
			}
		}
		for(let id in m.widgets){
			if(!widgets2Screen[id]){
				// let widget = m.widgets[id]
				let screen = this._getHoverScreen(id, m);
				if (screen) {
					errors.push({
						widgetID : id,
						type: "WidgetNotInScreen"
					});
					screen.children.push(id);
				}
			}
		}

		if (errors.length > 0){
			this.logger.log(1,"fixWidgetsNotInScreen", "exit > " + errors.length);
			//this.printStackToLog();
			//this.logger.sendError(new Error("Controller.fixWidgetsNotInScreen() > Some fuckup"));
		}
		return errors;
	}

	fixNegativeCoords (m){
		var fixed = false;
		for(let id in m.screens){
			let s = m.screens[id];
			let difX = 0;
			let difY = 0;
			if(s.x < 0){
				s.x = Math.abs(s.x);
				fixed = true;
				difX = s.x *2;
			}
			if(s.y < 0){
				s.y = Math.abs(s.y);
				fixed = true;
				difY = s.y *2;
			}
			if(difY> 0 || difY > 0){
				for(let i=0; i < s.children.length; i++){
					let widgetID = screen.children[i];
					let widget = m.widgets[widgetID];
					widget.x += difX;
					widget.y += difY;
				}
			}
		}

		for(let id in m.widgets){
			let w = m.widgets[id];
			if(w.x < 0){
				w.x = Math.abs(w.x);
				fixed = true;
			}
			if(w.y < 0){
				w.y = Math.abs(w.y);
				fixed = true;
			}
		}

		if(fixed){
			this.printStackToLog();
			this.logger.sendError({message:"fixNegativeCoords() > negative screens", "stack" : "---"});
		}
	}


	validateAndFixModel (model){
		this.logger.log(3,"validateAndFixModel", "enter > model : " + model.id);
		var errors = [];

		if(model.lastCategory === null){
			this.logger.log(0,"validateAndFixModel", "lastCategory is null");
			errors.push({id:model.id, msg: "lastCategory is null"});
			model.lastCategory = "WireFrame";
		}

		var widgets2Screen = {};
		for(let screenID in model.screens){
			let screen = model.screens[screenID];
			if(screen){
				if(screen.x < 0){
					screen.x =0;
					errors.push({id:screenID, msg: "x less 0"});
					this.logger.log(0,"validateAndFixModel", "screen.x less 0 : " + screenID);
				}
				if(screen.y < 0){
					screen.y =0;
					errors.push({id:screenID, msg: "y less  0"});
					this.logger.log(0,"validateAndFixModel", "screen.y less 0 : " + screenID);
				}


				let children = lang.clone(screen.children);
				for(let i=0; i< children.length; i++){
					let widgetID = children[i];
					let widget = model.widgets[widgetID];
					widgets2Screen[widgetID] = screenID;
					if(!widget){
						screen.children.splice(i, 1);
						errors.push({id:screenID, msg: "No child "+ widgetID});
						this.logger.log(0,"validateAndFixModel", "screen  " + screenID + " has not exisitng widget " + widgetID);
					}
				}

			} else {
				delete model.screens[screenID];
				errors.push({id:screenID, msg: "No screen"});
				this.logger.log(0,"validateAndFixModel", "No screen object : " + screenID);
			}

		}

		for(let widgetID in model.widgets){
			let widget = model.widgets[widgetID];
			if(widget){
				if(widget.x < 0){
					widget.x =0;
					errors.push({id:widgetID, msg: "x less 0"});
					this.logger.log(0,"validateAndFixModel", "widget.x less 0 : " + widgetID);
				}
				if(widget.y < 0){
					widget.y =0;
					errors.push({id:widgetID, msg: "y less  0"});
					this.logger.log(0,"validateAndFixModel", "widget.y less 0 : " + widgetID);
				}
				// fix widgets that are on screens, but are somehow not attached.
				// dunno why this sometimes happens
				if(!widgets2Screen[widgetID]){
					var screen = this._getHoverScreen(widget, model);
					if (screen) {
						this.logger.log(0,"validateAndFixModel", "widget not in screen : " + widgetID);
						errors.push({id:widgetID, msg: "Not in screen"});
						screen.children.push(widgetID);
					}
				}
			} else {
				delete model.widgets[widgetID];
				errors.push({id:widgetID, msg: "No widget"});
				this.logger.log(0,"validateAndFixModel", "No widget object : " + widgetID);
			}
		}

		for(let lineID in model.lines){
			let line = model.lines[lineID];
			if(line){
				let lineValid = true;
				if(!model.widgets[line.to] && !model.screens[line.to]){
					lineValid = false;
					this.logger.log(0,"validateAndFixModel", "No line to:" + lineID);
				}

				if(!model.widgets[line.from] && !model.screens[line.from] && (model.groups && !model.groups[line.from])){
					lineValid = false;
					this.logger.log(0,"validateAndFixModel", "No line from :" + lineID);
				}

				if(!lineValid){
					delete model.lines[lineID];
					errors.push({id:line.from, msg: "No line to or from"});
				}

			} else {
				this.logger.log(0,"validateAndFixModel", "No line object : " + lineID);
			}
		}

		if(model.groups){
			for(let groupID in model.groups){
				let group = model.groups[groupID];
				if(group){

					let children = lang.clone(group.children);
					for(let i=0; i< children.length; i++){
						let widgetID = children[i];
						let widget = model.widgets[widgetID];
						if(!widget){
							group.children.splice(i, 1);
							errors.push({id:groupID, msg: "No group member "+ widgetID});
							this.logger.log(0,"validateAndFixModel", "group  " + groupID + " has not exisitng widget " + widgetID);
						}
					}


					/**
					 * This can happen. Don't make a mess, just remove empty group
					 */
					let groupLength = 0
					if (group.groups) {
						groupLength = group.groups.length
					}
					if(group.children.length === 0 && groupLength === 0){
						this.logger.log(-1,"validateAndFixModel", "group  " + groupID + "  was empty");
						delete model.groups[groupID];
					}
				}
			}
		}



		if(errors.length > 0){
			this.printStackToLog();
			this.logger.log(-1,"validateAndFixModel", "exit() > Found  " + errors.length + " errors");
		}

		return errors;
	}

	printStackToLog (){
		var stack = this.commandStack.stack;
		var to = Math.max(0, stack.length-5);
		this.logger.log(0,"printStackToLog", "zoom : " +this.getZoomFactor()  );
		for(var i=stack.length-1; i > to; i--){
			var c = stack[i];
			var raw = i + "_"+c.type;
			if(c.label){
				raw+=" ("+ c.label + ")";
			}
			this.logger.log(0,"getStackAsString() >",  raw);
		}
	}

	/**********************************************************************
	 * Canvas Delegates
	 **********************************************************************/

	onWidgetNameChange (widget) {
		if (this._canvas) {
			this._canvas.setWidgetName(widget)
		}
	}

	onScreenNameChange (widget) {
		if (this._canvas) {
			this._canvas.setScreenName(widget)
		}
	}

	onGroupNameChange (group) {
		if (this._canvas) {
			this._canvas.setGroupName(group)
		}
	}

	/**
	 * Since 3.0.29 we have a sepcial isResize to maake the fast render faster
	 */
	render (screenID, isResize = false){
		this.logger.log(2,"render", "enter > screenID : " + screenID);
		if(this._canvas){
			/**
			 * resize the model.
			 */
			let inheritedModel = CoreUtil.createInheritedModel(this.model)
			requestAnimationFrame(() => {
				this._canvas.render(inheritedModel, isResize);
				if(screenID){
					this._canvas.moveToScreen(screenID);
				}
			});
		}
	}

	/**
	 * Notify the canvas that there has been some changes in widget positions!
	 */
	onWidgetPositionChange () {
		this.logger.log(2,"onWidgetPositionChange", "enter");
		if(this._canvas){
			/**
			 * resize the model
			 *
			 */
			let inheritedModel = CoreUtil.createInheritedModel(this.model)
			requestAnimationFrame(() => {
				this._canvas.onWidgetPositionChange(inheritedModel);
			});
		}
	}

	setZoomedModelCache (m) {
		this._zoomedModel = m
	}

	getZoomedModelCache () {
		/**
		 * We could read the cached on. But we have to test more
		 */
		return this.createZoomedModel(this._canvas.getZoomFactor());
	}

	renderWidget (widget, type){
		this.logger.log(0,"renderWidget", "enter > type : ", type);
		if (widget) {

			if(widget.template){
				/**
				 * TODO: Make this faster! Get all the widgets with the template and update them!
				 */
				this.render();
			} else {
				/**
				 * W have to set a zoomed model! Otherwise so UI widgets that use the
				 * box size to compute some layout stuff ( e.g. icon size) have issues.
				 *
				 * FIXME: Also, there seems to be an issues when (data) props are updated!
				 * e.g. table or spinner do not update!
				 *
				 * FIXME: Also add children in case it is an container widget!
				 */
				var zoom = this._canvas.getZoomFactor();
				var zoomedModel = lang.clone(widget);
				zoomedModel.isZoomed = true;
				this.getZoomedBox(zoomedModel, zoom, zoom)
				this._canvas.setWidgetStyle(zoomedModel.id, zoomedModel.style, zoomedModel);

				if (type === 'props') {
					this._canvas.updateWidgetDataView(zoomedModel);
				}
			}
		} else {
			this.logger.error("renderWidget", "No widget passed for type" + type);
			this.logger.sendError(new Error("Controller.renderWidget() No widget"));
		}
	}

	renderScreen (screen){
		/**
		 * Suppose the model was already updated
		 */
		if(this._canvas){
			this._canvas.setScreenStyle(screen.id, screen.style);
		}
	}

	unSelect (){
		if(this._canvas){
			this._canvas.unSelect();
		}
		if(this.toolbar){
			this.toolbar.cleanUp();
		}
	}

	/**********************************************************************
	 * Tools
	 **********************************************************************/


	updateCreateWidget (){
		this.toolbar.toolUpdateWidgetButton();
	}

	renderCopyPasteStyleEnd (){
		this.toolbar.toolCopyPasteStyleEnd();
	}

	renderAlignEnd (){
		this.toolbar.toolAlignEnd();
	}

	showSuccess (msg){
		if(this._canvas){
			this._canvas.showSuccess(msg);
		}
	}

	showError (msg){
		if(this._canvas){
			this._canvas.showError(msg);
		}
	}

	/**********************************************************************
	 * on save as
	 **********************************************************************/
	async onSaveAs (oldModel, newName){
		/**
		 * Create a new version
		 */
		let app = await this.modelService.copyApp(oldModel, newName)
		// var app = this._doPost("rest/apps/copy/" +oldModel.id, {"name" : newName});
		this.logger.log(0, "onSaveAs", "New app" + app.id);
		return app;
	}

	async onSaveAsAfterSignUp (oldModel, newName){
		/**
		 * Create a new version
		 */
		oldModel.name = newName;
		oldModel.parent = oldModel.id;
		delete oldModel.id;
		delete oldModel._id;
		var app = await this.modelService.createApp(oldModel)
		hash("#/apps/" + app.id + ".html");
		this.logger.log(0, "onSaveAsAfterSignUp", "New app" + app.id);
	}

	/**********************************************************************
	 * Fonts
	 **********************************************************************/
	async setFonts (fonts) {
		this.logger.log(0, "setFonts", "enter > ", fonts);
		this.model.fonts = fonts;
		/**
		 * We have to do a hard save here, because the delta somehow produces
		 * on the server null elements
		 */
		let res = await this.modelService.saveApp(this.model)
		if (res) {
			if (this._canvas){
				this._canvas.setFonts(fonts);
			}
			if (this.toolbar){
				this.toolbar.updateFontFamilies()
			}
		}
	}

	/**********************************************************************
	 * Imports
	 **********************************************************************/

	async setImports (imports) {
		this.logger.log(0, "setFonts", "enter > ", imports);
		this.model.imports = imports;
		/**
		 * We have to do a hard save here, because the delta somehow produces
		 * on the server null elements
		 */
		let res = await this.modelService.saveApp(this.model)
		if (res) {
			if (this.toolbar){
				this.toolbar.updateImports()
			}
		}
	}

	/**********************************************************************
	 * Grid
	 **********************************************************************/

	removeGrid (){

		var command = {
			timestamp : new Date().getTime(),
			type : "SetGrid",
			n : null,
			o : this.model.grid
		};
		this.addCommand(command);

		/**
		 * update model
		 */
		this.modelSetGrid(null);

		this.render();
	}

	setGrid (width, height, color, style,visible, enabled){

		/**
		 * create the command
		 */
		var grid = {
			w : width,
			h : height,
			color : color,
			style : style,
			visible:visible,
			enabled:enabled
		};


		var command = {
			timestamp : new Date().getTime(),
			type : "SetGrid",
			n : grid,
			o : this.model.grid
		};
		this.addCommand(command);

		/**
		 * update model
		 */
		this.modelSetGrid(grid);

		this.render();
	}

	setGrid2 (grid, color, style){

		/**
		 * mixing color
		 */
		grid.color = color;
		grid.style = style;

		var command = {
			timestamp : new Date().getTime(),
			type : "SetGrid",
			n : grid,
			o : this.model.grid
		};
		this.addCommand(command);

		/**
		 * update model
		 */
		this.modelSetGrid(grid);

		this.render();
	}

	modelSetGrid (grid){
		this.model.grid = grid;
		this.onModelChanged();
	}


	undoSetGrid (command){
		this.modelSetGrid(command.o);
		this.render();
	}

	redoSetGrid (command){
		this.modelSetGrid(command.n);
		this.render();
	}

	/**********************************************************************
	 * Add Action
	 **********************************************************************/



	addAction (widgetID, action, isGroup){
		var command = {
			timestamp : new Date().getTime(),
			type : "AddAction",
			model : action,
			modelID : widgetID,
			isGroup: isGroup
		};
		this.addCommand(command);

		this.modelAddAction(widgetID, action, isGroup);
	}

	modelAddAction (widgetID, action, isGroup){
		if(isGroup){
			var group = this.model.groups[widgetID];
			if(group){
				group.action = action;
			} else {
				console.warn("modelRemoveAction() > No group with ID", widgetID)
			}
		} else {
			var widget = this.model.widgets[widgetID];
			if(widget){
				widget.action = action;
			} else {
				console.warn("modelRemoveAction() > No widgte with ID", widgetID)
			}
		}
		this.onModelChanged();
	}

	undoAddAction (command){
		var action = command.model;
		var id = command.modelID;
		this.modelRemoveAction(id, action, command.isGroup);
		this.render();
	}

	redoAddAction (command){
		var action = command.model;
		var id = command.modelID;
		this.modelAddAction(id, action, command.isGroup);
		this.render();
	}

	/**********************************************************************
	 * Remove Action
	 **********************************************************************/


	removeAction (widgetID, action, isGroup){
		var command = {
			timestamp : new Date().getTime(),
			type : "RemoveAction",
			model : action,
			modelID: widgetID,
			isGroup: isGroup
		};
		this.addCommand(command);

		this.modelRemoveAction(widgetID, action, isGroup);
	}

	modelRemoveAction (widgetID, action, isGroup){

		if(isGroup){
			var group = this.model.groups[widgetID];
			if(group){
				delete group.action;
			} else {
				console.warn("modelRemoveAction() > No group with ID", widgetID)
			}
		} else {
			var widget = this.model.widgets[widgetID];
			if(widget){
				delete widget.action;
			} else {
				console.warn("modelRemoveAction() > No widgte with ID", widgetID)
			}
		}

		this.onModelChanged();
	}


	undoRemoveAction (command){
		var action = command.model;
		var id = command.modelID;
		this.modelAddAction(id, action, command.isGroup);
		this.render();
	}

	redoRemoveAction (command){
		var action = command.model;
		var id = command.modelID;
		this.modelRemoveAction(id, action, command.isGroup);
		this.render();
	}

	/**********************************************************************
	 * update Action
	 **********************************************************************/
	updateAction (widgetID, action, isGroup) {
		var command = {
			timestamp : new Date().getTime(),
			type : "ActionAction",
			modelID: widgetID,
			n: action,
			o: this.getActionById(widgetID, isGroup),
			isGroup: isGroup
		};
		this.addCommand(command);

		this.modelUpdateAction(widgetID, action, isGroup);
	}

	getActionById (id, isGroup) {
		if (isGroup){
			var group = this.model.groups[id];
			return group.action;
		} else {
			var widget = this.model.widgets[id];
			return widget.action;
		}
	}

	modelUpdateAction (widgetID, action, isGroup) {
		if(isGroup){
			var group = this.model.groups[widgetID];
			if(group){
				group.action = action;
			} else {
				console.warn("modelUpdateAction() > No group with ID", widgetID)
			}
		} else {
			var widget = this.model.widgets[widgetID];
			if(widget){
				widget.action = action;
			} else {
				console.warn("modelUpdateAction() > No widgte with ID", widgetID)
			}
		}

		this.onModelChanged();
	}

	undoActionAction (command){
		var action = command.o;
		var id = command.modelID;
		this.modelUpdateAction(id, action, command.isGroup);
		this.render();
	}

	redoActionAction (command){
		var action = command.n;
		var id = command.modelID;
		this.modelUpdateAction(id, action, command.isGroup);
		this.render();
	}


	/**********************************************************************
	 * Add Line
	 **********************************************************************/

	addLine (line){


		/**
		 * here comes already the correct model.
		 * we do not have to do anything more,
		 * just add an uuid
		 */
		line.id = "l"+this.getUUID();
		var zoom = this._canvas.getZoomFactor();
		for(var i=0; i< line.points.length; i++){
			this.getUnZoomedBox(line.points[i], zoom);
		}

		/**
		 * create the command
		 */
		var command = {
			timestamp : new Date().getTime(),
			type : "AddLine",
			model : line
		};
		this.addCommand(command);

		/**
		 * update model
		 */
		this.modelAddLine(line);

		this.render();

		if(this.toolbar){
			//this.toolbar.showLineAction(line)
		}
	}

	modelAddLine (line){
		if(!this.model.lines[line.id]){
			this.model.lines[line.id] = line;
			this.onModelChanged();
		} else {
			console.warn("Could not add line", line);
		}
	}


	modelRemoveLine (line){

		if(this.model.lines[line.id]){
			delete this.model.lines[line.id];
			this.onModelChanged();
		} else {
			console.warn("Could not delete line", line);
		}
	}

	undoAddLine (command){
		var line = command.model;
		this.modelRemoveLine(line);
		this.render();
	}

	redoAddLine (command){
		var line = command.model;
		this.modelAddLine(line);
		this.render();
	}


	/**********************************************************************
	 * Add Line
	 **********************************************************************/

	removeLine (line){

		/**
		 * create the command
		 */
		var command = {
			timestamp : new Date().getTime(),
			type : "RemoveLine",
			model : line
		};
		this.addCommand(command);

		/**
		 * update model
		 */
		this.modelRemoveLine(line);

		this.render();
	}

	undoRemoveLine (command){
		var line = command.model;
		this.modelAddLine(line);
		this.render();
	}

	redoRemoveLine (command){
		var line = command.model;
		this.modelRemoveLine(line);
		this.render();
	}

	/**********************************************************************
	 * Line Points
	 **********************************************************************/


	updateLinePoint (id, i, pos){
		this.logger.log(3,"updateLinePoint", "enter > line : " + id +  " > point : " + i);

		pos = this.getUnZoomedBox(pos, this._canvas.getZoomFactor());

		/**
		 * create the command
		 */
		var line = this.model.lines[id];
		if(line.points[i]){
			var point = line.points[i];
			var command = {
					timestamp : new Date().getTime(),
					type : "LinePointPosition",
					delta :{
						o : point,
						n : pos
					},
					i : i,
					modelId : id
			};
			this.addCommand(command);
		}



		/**
		 * update model!
		 */
		this.modelLinePointPosition(id, i, pos);
	}

	modelLinePointPosition (id, i, pos){
		var line = this.model.lines[id];
		if(line.points[i]){
			line.points[i] = pos;
		} else {
			console.warn("Could not update line point ", i, "in line", id);
		}

		this.onModelChanged();
	}

	undoLinePointPosition (command){
		this.modelLinePointPosition(command.modelId, command.i, command.delta.o);
		this.render();
	}

	redoLinePointPosition (command){
		this.modelLinePointPosition(command.modelId, command.i, command.delta.n);
		this.render();
	}

	/**********************************************************************
	 * Line Properties
	 **********************************************************************/
	updateLineProperties (id, key, value){
		this.logger.log(0,"updateLineProperties", "enter >key : " + key +  " > value : " + value);

		var line = this.model.lines[id];


		if(line){

			var command = {
				timestamp : new Date().getTime(),
				type : "LineProperties",
				key : key,
				delta :{
					o : line[key],
					n : value
				},
				modelId : id
			};
			this.addCommand(command);

			this.modelLineProperties(id, key, value);

			this.render();
		} else {
			console.warn("updateLineProperties() > No line with id " + id);
		}

	}


	modelLineProperties (id, key, value){
		var line = this.model.lines[id];

		if(line){
			line[key] = value;
			this.onModelChanged();
		} else {
			console.warn("modelLineProperties() > No line with id " + id);
		}
	}

	undoLineProperties (command){
		this.modelLineProperties(command.modelId, command.key, command.delta.o);
		this.render();
	}

	redoLineProperties (command){
		this.modelLineProperties(command.modelId, command.key, command.delta.n);
		this.render();
	}



	/**********************************************************************
	 * Line Properties
	 **********************************************************************/

	updateLineAllProperties (id, newLine){
		this.logger.log(0,"updateLineAllProperties", "enter >key : " + id );

		var line = this.model.lines[id];


		if(line){

			var command = {
				timestamp : new Date().getTime(),
				type : "LineAllProperties",
				delta :{
					o : line,
					n : newLine
				},
				modelId : id
			};
			this.addCommand(command);


			this.modelLineAllProperties(id, newLine);

			this.render();
		} else {
			console.warn("updateLineAllProperties() > No line with id " + id);
		}
	}


	modelLineAllProperties (id, newLine){

		var line = this.model.lines[id];

		if(line){
			this.model.lines[id] = newLine;
			this.onModelChanged();
		} else {
			console.warn("modelLineProperties() > No line with id " + id);
		}

	}

	undoLineAllProperties (command){
		this.modelLineAllProperties(command.modelId, command.delta.o);
		this.render();
	}

	redoLineAllProperties (command){
		this.modelLineAllProperties(command.modelId, command.delta.n);
		this.render();
	}

	/**********************************************************************
	 * Box
	 **********************************************************************/

	updateBox (pos, box){

		if(pos.y){
			box.y = pos.y;
		}

		if(pos.x){
			box.x = pos.x;
		}

		if(pos.h){
			box.h = pos.h;
		}

		if(pos.w){
			box.w = pos.w;
		}


		if(box.x < 0){
			box.x = Math.abs(box.x);
			console.warn("updateBox() > Something strange happened, box.x < 0 ...");
		}

		if(box.y < 0){
			box.y = Math.abs(box.y);
			console.warn("updateBox() > Something strange happened, pox.y < 0 ...");
		}
	}


	/**********************************************************************
	 * MulitCommand
	 **********************************************************************/

	undoMultiCommand (command){
		this.logger.log(0,"undoMultiCommand", "enter > " + command.id);

		for(var i=0; i< command.children.length; i++){
			var child = command.children[i];
			if(this["undo" + child.type]){
				this["undo"+ child.type](child);
			} else {
				console.warn("No Undo function defined for ", command);
			}
		}
	}

	redoMultiCommand (command){
		this.logger.log(0,"redoMultiCommand", "enter > " + command.id);

		for(var i=0; i< command.children.length; i++){
			var child = command.children[i];
			if(this["redo" + child.type]){
				this["redo"+ child.type](child);
			} else {
				console.warn("No Undo function defined for ", command);
			}
		}
	}

	/**********************************************************************
	 * CommandStack
	 **********************************************************************/


	async addCommand (command){

		if(!this.commandStack.lastUUID){
			this.commandStack.lastUUID = 0;
		}
		command.id = "c" + this.commandStack.lastUUID++;

		/**
		 * It might have happened that we have moved back in the stack via undo.
		 * if a new command comes, we throw away all newer commands.
		 */
		if(this.commandStack.pos < this.commandStack.stack.length){
			if(this.mode=="public"){
				this.onCommandDeleted(command);
			} else {
				var count = (this.commandStack.stack.length - this.commandStack.pos);
				this.modelService.deleteCommand(this.model, count).then(res => {
					this.logger.log(0,"addCommand", "cut off future! > " + count + " >> "  + res.pos);
					this.onCommandDeleted(command)
				})
			}
		} else {
			this.postCommand(command);
		}
		this.emit("commandAdded", this.commandStack.stack.length);
	}

	onCommandDeleted (command){

		/**
		 * just remove the command. also update the pos, altough it should be updated
		 * in the next step
		 */
		// var count = (this.commandStack.stack.length - this.commandStack.pos);
		this.commandStack.stack = this.commandStack.stack.slice(0,this.commandStack.pos );
		this.logger.log(2,"onCommandDeleted", "enter > pos : " + this.commandStack.pos + " > stack : " +	this.commandStack.stack.length);

		if(this.toolbar){
			this.toolbar.disableRedo();
		}
		this.postCommand(command);
	}


	async postCommand (command){
		this.logPageEvent("addCommand", command.type)
		var result = {
			pos : this.commandStack.pos + 1,
			command : command,
			lastUUID : this.commandStack.lastUUID + 1
		}
		this.logger.log(1,"postCommand", "enter > " + this.mode);
		if (this.mode == "public"){
			/**
			 * In public mode, we do not call network, and just add
			 */
			this.onCommandAdded(result);
		} else {

			try {
				this.modelService.addCommand(this.model, command).then(pos => {
					this.onCommandAdded(pos);
				})

				/**
				 * Since 2.1.3 we put stuff and the stack, without waiting
				 * for the backend.
				 */
				this.commandStack.stack.push(result.command);
				this.commandStack.pos = result.pos;
				this.commandStack.lastUUID = result.lastUUID;

				this.logger.log(1,"postCommand", "exit > lastUUID: " + this.commandStack.lastUUID  + ' > pos: ' + this.commandStack.pos);
			} catch (err) {
				this.logger.sendError("postCommand", err);
			}
		}
	}


	onCommandAdded (result){
		if(result.errors){
			this.logger.sendError("onCommandAdded", new Error("Server returned error"));
		}

		/**
		 * Since 2.1.3 we put stuff and the stack. here we just update the
		 * lastUUID ans pos with the server one, in case we would have
		 * concurrant editing
		 *
		 * FIXME: for some reason the last UUID on the server lacks
		 * the one we have in browser. Question: Do we need the last UUID on the stack?
		 * Can`t we use the normal lastUUID? Or just created with Date()
		 */

		// this.commandStack.stack.push(result.command);
		this.commandStack.pos = result.pos;
		this.commandStack.lastUUID = result.lastUUID;

		if(this.toolbar){
			this.toolbar.enbaleUndo();
		}
		this.logger.log(1,"onCommandAdded", "exit > id: "+ result.command.id + " > lastUUID: " + this.commandStack.lastUUID + " > pos: " + this.commandStack.pos);
	}


	canUndo (){
		return 	this.commandStack.pos > 0;
	}

	async undo (){
		this.logger.log(2,"undo", "enter > " + (this.commandStack.pos > 0));
		this.logPageEvent("undo", "")
		if(this.commandStack.pos > 0){
			/**
			 * Do do things faster for large requests,
			 * we do not wait for the rest response.
			 */
			if(this.mode !== "public"){
					this.modelService.undoCommand(this.model, {}).then(res => {
						if (res.pos != this.commandStack.pos) {
							this.logger.error('undo', "server is behind")
						}
						this.logger.log(2,"undo", "saved", res.pos + '==' + this.commandStack.pos);
					})
			}
			var result = {
				pos : this.commandStack.pos - 1
			}
			this.onUndoCompleted(result);
		}
		if(this.commandStack.pos <= 0){
			if(this.toolbar){
				this.toolbar.disableUndo();
			}
		}
	}


	onUndoCompleted (result){
		this.logger.log(2,"onUndoCompleted", "enter > " + result.pos);
		this.commandStack.pos = result.pos;
		var command = this.commandStack.stack[this.commandStack.pos];
		if(command){
			this.logger.log(0,"onUndoCompleted", "enter > "+ command.id);
			if(this["undo" + command.type]){
				try{
					this["undo"+ command.type](command);
				} catch(e){
					console.debug(e.stack);
				}
			} else {
				console.warn("No Undo function defined for ", command);
			}
			if(this.toolbar){
				this.toolbar.enbaleRedo();
			}
		} else {
			console.warn("No Undo command defined!");
		}
	}

	async redo (){
		this.logger.log(2,"redo", "enter > "+ (this.commandStack.pos >= this.commandStack.stack.length));
		this.logPageEvent("redo", "")
		if(this.commandStack.pos >= 0 && this.commandStack.pos < this.commandStack.stack.length){
			/**
			 * Do do things faster for large requests,
			 * we do not wait for the rest response.
			 */
			if(this.mode !=="public"){
				this.modelService.redoCommand(this.model, {}).then(res => {
					if (res.pos !== this.commandStack.pos) {
						this.logger.log(1, 'redo', "server is behind")
					}
					this.logger.log(2,"redo", "saved",  res.pos + '==' + this.commandStack.pos);
				})
			}

			var result = {
				pos : this.commandStack.pos+1
			}
			this.unRedoCompleted(result);
		} else {
			this.logger.log(0,"redo", "No redo > ");
		}

		if(this.commandStack.pos >= this.commandStack.stack.length){
			if(this.toolbar){
				this.toolbar.disableRedo();
			}
		}
	}

	unRedoCompleted (result){
		var command = this.commandStack.stack[this.commandStack.pos];
		this.commandStack.pos = result.pos;
		this.logger.log(2,"unRedoCompleted", "enter > "+ command.id);
		if(this["redo" + command.type]){
			try{
				this["redo"+ command.type](command);
			}catch(e){
				console.debug(e.stack);
			}
		} else {
			console.warn("No Redo function defined for ", command.type);
		}
		if(this.toolbar){
			this.toolbar.enbaleUndo();
		}
	}

	setCommandStack (s){

		this.logger.log(2,"setCommandStack", "enter");

		this.commandStack = s;

		if(this.toolbar){
			if(this.commandStack.pos > 0){
				this.toolbar.enbaleUndo();
			} else {
				this.toolbar.disableUndo();
			}

			if(this.commandStack.pos < this.commandStack.stack.length){
				this.toolbar.enbaleRedo();
			} else{
				this.toolbar.disableRedo();
			}
		}
	}

	/**********************************************************************
	 * Helper
	 **********************************************************************/

	getWidgetName (screenID, name){
		var screen = this.model.screens[screenID];
		if (screen){
			var children = screen.children;
			var names = {};
			for (let i = 0; i < children.length; i++){
				let widgetID = children[i];
				if (this.model.widgets[widgetID]) {
					let widget = this.model.widgets[widgetID];
					names[widget.name] = widget.id;
				} else {
					console.debug("No widget", widgetID);
				}
			}
			// also add names of parent screen widgets
			if(screen.parents && screen.parents.length > 0 ){
				for(let i = 0; i< screen.parents.length; i++){
					let parentID = screen.parents[i];
					let parent = this.model.screens[parentID];
					if (parent) {
						let parentChildren = parent.children;
						for (let j = 0; j < parentChildren.length; j++){
							let widgetID = parentChildren[j];
							if (this.model.widgets[widgetID]) {
								let widget = this.model.widgets[widgetID];
								names[widget.name] = widget.id;
							}
						}
					}
				}
			}
			return this.getUniqueName(name, names);
		} else {
			console.error("getWidgetName() > No screen", screenID);
		}
		return name;
	}

	getSceenName (name){
		var names = {};
		for (var id in this.model.screens){
			var screen =  this.model.screens[id];
			if (screen) {
				names[screen.name] = screen.id;
			} else {
				console.debug("getSceenName() > No screen", id);
			}
		}
		return this.getUniqueName(name, names);
	}

	/**
	 * Returns a unique group name within the screen!!
	 */
	getGroupName (screenID, name){
		var names = {};
		for (var id in this.model.groups){
			var group =  this.model.groups[id];
			if (group) {
				if (group.children.length > 0){
					var widgetID = group.children[0];
					var widget = this.model.widgets[widgetID];
					if (widget) {
						var parentScreen = this.getParentScreen(widget);
						if (parentScreen && parentScreen.id === screenID) {
							names[group.name] = group.id;
						}
					}
				}
			} else {
				console.debug("getGroupName() > No group", id);
			}
		}

		return this.getUniqueName(name, names);
	}

	/**
	 * Create a unique name in a screen by adding an count add the end. If there is already a count,
	 * we have to remove it
	 */
	getUniqueName  (name, names) {
		// if the name is unique simply return
		if (!names[name]){
			return name;
		}
		// else reduce to base bz assuming "<String> <Int>" pattern
		var pos = name.lastIndexOf(" ");
		if (pos > 0) {
			var end = name.substring(pos+1);
			var er = /^-?[0-9]+$/;
			var isInt =  er.test(end);
			if (isInt){
				name = name.substring(0, pos);
			}
		}
		if (!names[name]){
			return name;
		}
		var count = 1;
		var newName = name;
		while (names[newName] && count < 1000) {
			newName = name + " " + count;
			count++;
		}
		return newName;
	}

	getInlineEdit (){
		if (this._canvas){
			return this._canvas.inlineEditGetCurrent();
		}
	}

	getUUID (){
		var uuid = this.model.lastUUID++ + "";
//			var isUnique = (this.model.widgets["w" + uuid] === undefined && this.model.widgets["s" + uuid] === undefined)
//			while (!isUnique){
//				this.logger.error("getUUID", "Fix UUID");
//				uuid = this.model.lastUUID++ + "";
//				isUnique = (this.model.widgets["w" + uuid] === undefined && this.model.widgets["s" + uuid] === undefined)
//			}
		return uuid
	}

	getLastChangedWidget (type){
		if (this._lastChangedWidgets && this._lastChangedWidgets[type]){
			return this._lastChangedWidgets[type];
		}
	}

	setLastChangedWidget (widget){
		if (this._lastChangedWidgets && widget){
			this._lastChangedWidgets[widget.type] = widget;
		}
	}

	createNiceName (w){
		return w.type;
	}

	getDeltaBox (model, pos){
		var delta = {n:{}, o:{}};
		if(model){
			for(var p in pos){
				if(pos[p] != null && pos[p]!= undefined){
					if(pos[p] != model[p]){
						delta.n[p] = pos[p];
						delta.o[p] = model[p];
						this.fix1PXBug(p, model, pos)
					}
				}

			}
		} else{
			this.logger.error("getDeltaBox", "no model passed ");
		}
		return delta;
	}

	/**
	 * There is a nasty bug that miss aligns widgets sometimes by one px.
	 * This method will do some additional logging to find out what is happening
	 */
	fix1PXBug (p, model, pos) {
		if (p === 'x' || p === 'y') {
			let dif = Math.abs(pos[p] - model[p])
			if (dif === 1) {
				//this.logger.warn("getDeltaBox", "1 PX BUG '" + p + "' @ " + model.id);
				//this.logger.sendError(new Error("1 PX BUG '" + p + "' @ " + model.id))
				if (window.location.href.indexOf('localhost') > 0) {
					alert('1 PX BUG')
					console.warn(new Error().stack)
				}
			}
		}
	}


	getPropertyDelta (model, props, type){
		/**
		 * check if we have to handle templates in here!
		 */
		if(type == "style" && model.template){
			if(this.model.templates && this.model.templates[model.template]){
				var template = this.model.templates[model.template];
				return this.getDelta(template[type], props);
			} else {
				console.warn("No template with ", model.template);
			}
		} else {
			return this.getDelta(model[type], props);
		}
	}


	getDelta (model, pos){

		var delta = {n:{}, o:{}};
		for(var p in pos){
			if(pos[p] != model[p]){
				delta.n[p] = pos[p];
				if(model[p] != null){
					delta.o[p] = model[p];
				} else {
					/**
					 * This causes some serious troubles in vertx mongo
					 */
					delta.o[p] = null;
				}

			}
		}
		return delta;
	}



	/**
	 * Try to keep in sync with JS Objetc.Observe()
	 *
	 * https://developer.mozilla.org/pt-PT/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
	 *
	 * Returns a list of:
	 * - name: The name of the property which was changed.
	 * - object: The changed object after the change was made.
	 * - type: A string indicating the type of change taking place. One of "add", "update", or "delete".
	 * - oldValue: Only for "update" and "delete" types. The value before the change
	 * - parent: The name of the parent node in case of widgets or so
	 */
	getModelDelta (objOld, objNew){


		var changes =[];

		/**
		 * some children have to looked deeper into..
		 */
		var specialChildren = {
				"screens" : true,
				"widgets" : true,
				"lines" : true,
				"templates" : true,
				"groups" : true,
				"fonts": true,
				"imports": true
		};


		/**
		 * check which things have changed in the new model
		 */
		for(let key in objOld){
			let vOld = objOld[key];
			let vNew = objNew[key];
			if(specialChildren[key]){
				let childChanges = this.getChanges(vOld, vNew, key);
				changes = changes.concat(childChanges);
			} else {
				let change = this.getChange(key, vOld, vNew);
				if(change){
					changes.push(change);
				}
			}
		}

		/**
		 * check which things were added
		 */
		for(let key in objNew){
			let vOld = objOld[key];
			let vNew = objNew[key];
			if(vOld === undefined || vOld === null){
				let change = {
					name : key,
					type :"add",
					object : vNew
				};
				changes.push(change);
			}
		}
		return changes;
	}


	logPageEvent (action, label) {
		this.logger.log(4,"logPageEvent","enter", action + " > " + label);
		try{
			// if(ga!=null && ga!=undefined){
			//	ga('send', {
			//	  hitType: 'event',
			//	  eventCategory: 'MATC',
			//	  eventAction: action,
			//	  eventLabel: label
			//	})
			//}
		} catch(err) {
			this.logger.error("logPageEvent","error", err);
		}
	}

	printWidget (id) {
		if (this.model.widgets[id]) {
			return this.model.widgets[id].name
		}
		return id + '[Not found]'
	}
}