import Snapp from './Snapp'
import lang from '../../dojo/_base/lang'
import * as TextUtil from '../../core/TextUtil'

export default class Widget extends Snapp {

	enableInheritedWidget (widget){
		this.logger.log(-1,"enableInheritedWidget", "enter > " +widget.id);

		if(widget.inherited) {
			const source = this.model.widgets[widget.inherited];
			const targetScreen = this.model.screens[widget.inheritedScreen];
			if (source && targetScreen) {

				const sourcePos = this.getWidgetPostionInScreen(source);
				const targetPos = {
					x: targetScreen.x + sourcePos.x,
					y: targetScreen.y + sourcePos.y,
					w: sourcePos.w,
					h: sourcePos.h
				}
				const newWidget = this.addInheritedWidget(source, targetPos, targetScreen);
				this.logger.log(4,"enableInheritedWidget", "enter > " +widget.id + " -> " + newWidget.id);
				return newWidget
			} else {
				this.logger.error("enableInheritedWidget", "enter > No source " +widget.inherited);
			}
		} else {
			this.logger.error("enableInheritedWidget", "enter > NOT inherited " +widget.id);
		}
	}

	addInheritedWidget (widget, pos, targetScreen){
		this.logger.log(-1,"addInheritedWidget", "enter > "+ widget.id) ;

		this.startModelChange()
		// like onCopyWidget
		const newWidget = this._copyWidget(widget, targetScreen);
		newWidget.copyOf = widget.id;
		newWidget.name = widget.name // make sure we get the same name! Otherwise we would get box1 or so...
		newWidget.id = "w"+this.getUUID();
		newWidget.z = this.getMaxZValue(this.model.widgets) + 1;

		newWidget.x =  pos.x;
		newWidget.y =  pos.y;

		delete newWidget.props.databinding;

		// special stuff for inherited widgets
		newWidget.parentWidget = widget.id;
		newWidget.parentWidgetPos = true
		newWidget.style = {}
		newWidget.hover = {}
		newWidget.props = {}

		const command = {
			timestamp : new Date().getTime(),
			type : "CopyWidget",
			model : newWidget,
		};
		this.addCommand(command);

		this.modelAddWidget(newWidget);
		this.render();
		this.commitModelChange(true, true)
		return newWidget;
	}

	/**********************************************************************
	 * Distribution
	 **********************************************************************/


	distributeWidgets (type, widgets){
		this.logger.log(-1,"distributeWidgets", "enter > " +type, widgets);

		const bbx = this.getBoundingBox(widgets);
		const positions = this._distributedPositions(type, widgets, bbx).positions;

		this.updateMultiWidgetPosition(positions, true);

		this.render();
		this.renderAlignEnd();
	}



	/**********************************************************************
	 * Alignment
	 **********************************************************************/

	alignWidgets (direction, source, target, ignoreGroups = false) {
		this.logger.log(-1, "alignWidgets", "enter > " + direction + ' > ignore: ' + ignoreGroups, target, ignoreGroups);

		const targetBox = this.getBoundingBox(target);
		const positions = {};

		for (let i=0; i < source.length; i++){
			const widgetID = source[i];
			const widget = this.model.widgets[widgetID];

			if (widget) {
				/**
				 * We copy the old position
				 */
				const widgetPos = { x: widget.x, y : widget.y, h: widget.h, w: widget.w};
				let sourceBox = widgetPos
				positions[widgetID] = widgetPos;
				const offset = {x:0,y:0};
				/**
				 * In case there is a group, we set an offset!
				 *
				 */
				const group = this.getParentGroup(widgetID);
				if (group && !ignoreGroups){
					const boundingBox = this.getBoundingBox(group.children);
					offset.x = widgetPos.x - boundingBox.x;
					offset.y = widgetPos.y - boundingBox.y;
					/**
					 * 2.1.7: We use the bounding box as source box
					 */
					sourceBox = boundingBox
				}

				switch(direction) {
					case "top":
						widgetPos.y = (targetBox.y + offset.y);
						break;
					case "bottom":
						widgetPos.y = ((targetBox.y + targetBox.h) -sourceBox.h) + offset.y;
						break;
					case "left":
						widgetPos.x = targetBox.x + + offset.x;
						break;
					case "right":
						widgetPos.x = ((targetBox.x + targetBox.w) -sourceBox.w) +  offset.x;
						break;
					case "horizontal": {
						let m = (targetBox.y + targetBox.h / 2);
						widgetPos.y = Math.round(m - sourceBox.h / 2) +  offset.y;
						break;
					}
					case "vertical": {
						let m = (targetBox.x + targetBox.w / 2);
						widgetPos.x = Math.round(m -sourceBox.w / 2) + offset.x;
						break;
					}
					default:
						console.error("alignWidgets() > No method for " + direction);
						break;
				}

			} else {
				console.error("alignWidgets() > No widget with id", widgetID);
			}
		}

		this.updateMultiWidgetPosition(positions, true);

		this.render();
		this.renderAlignEnd();
	}

	incMultiWidgetPosition (ids, x, y){
		this.logger.log(3,"incMultiWidgetPosition", "enter > " + x + "  : " + y);

		if (ids && ids.length > 0) {
			var positions = {};
			for(var i=0; i< ids.length; i++){
				var id = ids[i];
				var widget = this.model.widgets[id];
				if(widget){
					positions[id] = {
						x : widget.x + x,
						y : widget.y + y,
						h : widget.h,
						w : widget.w
					};
				}
			}
			this.updateMultiWidgetPosition(positions, true);

			/**
			 * FIXME: This is a little ugly. It would be enough to simply
			 * update the widget positions in the canvas..
			 */
			this.render();
		}
	}

	/**********************************************************************
	 * Align
	 **********************************************************************/

	updateWidgetDataBinding (id, databinding, schema, data) {
		this.logger.log(-1,"updateWidgetDataBinding", "enter > " + id, JSON.stringify(databinding));

		const widget = this.model.widgets[id]
		if (!widget) {
			this.logger.log(-1,"updateWidgetDataBinding", "Error NO Widget > ", id);
			return
		}


		this.startModelChange()
		const command = {
			timestamp : new Date().getTime(),
			type : "UpdateDataBinding",
			modelId : id,
			n: {
				databinding: lang.clone(databinding),
				schema: lang.clone(schema),
				data: lang.clone(data)
			},
			o: {
				databinding: lang.clone(widget.props.databinding),
				schema: lang.clone(this.model.schema),
				data: lang.clone(this.model.data)
			}
		};

		this.modelUpdateDataBindingAndSchema(id, databinding, schema, data)


		//console.debug('updateWidgetDataBinding() > exit', JSON.stringify(this.model.widgets, null, 2))


		this.addCommand(command);
		this.render();
		this.commitModelChange(true, true)

		//console.debug('updateWidgetDataBinding() > exit', JSON.stringify(this.model.widgets, null, 2))
	}

	modelUpdateDataBindingAndSchema (id, databinding, schema, data) {
		const widget = this.model.widgets[id]
		if (!widget) {
			this.logger.log(-1,"modelUpdateDataBindingAndSchema", "Error NO Widget > ", id);
			return
		}

		if (!widget.props) {
			widget.props = {}
		}

		widget.props.databinding = databinding
		this.model.schema = schema
		this.model.data = data

		this.onModelChanged([{type: 'widget', action:"change", id: id}])
	}

	redoUpdateDataBinding(command) {
		this.logger.log(-3,"redoUpdateDataBinding", "enter > " + command.id);
		this.modelUpdateDataBindingAndSchema(command.modelId, command.n.databinding, command.n.schema, command.n.data);
		this.render();
	}

	undoUpdateDataBinding(command) {
		this.logger.log(-3,"undeUpdateDataBinding", "enter > " + command.id);
		this.modelUpdateDataBindingAndSchema(command.modelId, command.o.databinding, command.o.schema, command.o.data);
		this.render()
	}


	/**********************************************************************
	 * Multi Widget stuff
	 **********************************************************************/

	updateBoundingBox (ids, pos) {
		if(pos.snapp) {

			const modelBoundingBox = this.getBoundingBox(ids);

			const boundingBox = this.getUnZoomedBox(lang.clone(pos), this._canvas.getZoomFactor());

			const dif ={
				x: boundingBox.x *1.0 / modelBoundingBox.x,
				y: boundingBox.y *1.0 / modelBoundingBox.y,
				w: boundingBox.w *1.0 / modelBoundingBox.w,
				h: boundingBox.h *1.0 / modelBoundingBox.h
			};

			const positions = {};
			for(var i=0; i< ids.length; i++){
				var id = ids[i];
				var widget = this.model.widgets[id];
				var newPos = this._getGroupChildResizePosition(widget,this._resizeModel,pos, dif)
				positions[id] = newPos;
			}

			this.updateMultiWidgetPosition(positions, true)
		} else {
			this.logger.log(1,"updateBoundingBox", "NO SNAPP");
		}


	}

	updateMultiWidgetPosition (positions, fromToolbar, boundingbox, hasCopies){
		this.logger.log(-1,"updateMultiWidgetPosition", "enter > " + fromToolbar);
	
		this.startModelChange()
		const command = {
			timestamp : new Date().getTime(),
			type : "MultiCommand",
			label : "UpdateMultiWidgetPos",
			children :[]
		};

		let correctPosition = true;

		if (boundingbox && boundingbox.snapp && boundingbox.type=="boundingbox"){

			/**
			 * So we got the position of the bounding box.
			 *
			 * 1) unzoom bounding box
			 *
			 * 2) Get the hover screen
			 *
			 * 3) Get the source bounding box in the model
			 *
			 * 4) Snapp current bounding box
			 *
			 * 5) Calculate the difference between old
			 *
			 * 6) update the positions accordingly
			 *
			 * 7) surpress the normal position correction...
			 */
			const snapp = boundingbox.snapp;
			if (snapp.type=="All"){

				/**
				 * Get bounding box in model and also the offset
				 */
				const ids = [];
				for(let id in positions){
					ids.push(id);
				}
				let modelBoundingBox = this.getBoundingBox(ids);


				/**
				 * Get bounding box in editor
				 */
				const boxes = [];
				for(let id in positions){
					boxes.push(positions[id]);
				}
				const b = this.getBoundingBoxByBoxes(boxes);
				boundingbox.x = b.x;
				boundingbox.y = b.y;

				/**
				 * Unzoomed
				 */
				boundingbox = this.getUnZoomedBox(lang.clone(boundingbox), this._canvas.getZoomFactor());
			
				/**
				 * Get hover screen
				 */
				const screen = this.getHoverScreen(boundingbox);
				if(screen) {
					this.snappAll(modelBoundingBox, screen, boundingbox, snapp);
				}

				/**
				 * compare difference between snapped bbox and model bbox
				 */
				const difX = modelBoundingBox.x - boundingbox.x;
				const difY = modelBoundingBox.y - boundingbox.y;
				this.logger.log(0,"updateMultiWidgetPosition", "correct > " + difX + " > " + difY);
				/**
				 * Update move positions
				 */
				for(let id in positions){
					let pos = positions[id];
					let widget = this.model.widgets[id];
					pos.x = widget.x -difX;
					pos.y = widget.y -difY;
					pos.h = widget.h;
					pos.w = widget.w;
				}
				correctPosition = false;
			}

			
		}

		// fixme. Here something is super slow
		for(let id in positions){
			const pos = positions[id];
			const child = this.createWidgetPositionCommand(id, pos, fromToolbar, correctPosition);
			command.children.push(child);
			this.modelWidgetUpdate(id, pos, false);
		}

		this.addCommand(command);

		/**
		 * We must render of the repositioning was called by the toolbar,
		 * e.g. align. If it was from DND, not
		 */
		if (fromToolbar || hasCopies) {
			this.logger.log(1,"updateMultiWidgetPosition", "exit > with render");
			this.render();
		} else {
			this.onWidgetPositionChange()
		}
	

		this.checkTemplateAutoUpdate(Object.keys(positions).map(id => {
			return {id: id, type:'widget', prop:'position', action:'change'} 
		}))	

		
		this.onModelChanged(Object.keys(positions).map(id => {
			return {type: 'widget', action:"change", "prop": "position", id: id}
		}))

		this.commitModelChange(true, true)

		return positions
	}

	removeMultiWidget (selection){
		this.logger.log(1,"removeMultiWidget", "enter > ", selection);
		this.unSelect();
		this.startModelChange()

		let command = {
			timestamp: new Date().getTime(),
			type: "MultiCommand",
			label: "RemoveMultiWidget",
			children: []
		};

		for (let i=0; i < selection.length; i++){
			let id = selection[i];
			let widget = this.model.widgets[id];
			if (widget) {
				// create first the command,, whcih contain a group
				let widgetRemoveCmd = this.createWidgetRemoveCommand(id);
				command.children.push(widgetRemoveCmd);
			} else {
				console.warn('removeMultiWidget() Could not find widget', id)
			}
		}

		this.checkTemplateAutoUpdate(selection.map(id => {
			return {id: id, type:'widget', action:'remove'}
		}))

		// once all groups are stored, fire the commands.
		command.children.forEach(cmd => {
			this.modelRemoveWidgetAndLines(cmd.model, cmd.lines, cmd.refs, false, cmd.group);
		})
		
		this.addCommand(command);
		this.render();
		this.commitModelChange(true, true)
	}

	/**********************************************************************
	 * Widget name
	 **********************************************************************/

	setWidgetName (id, value){

		if (value === '') {
			this.logger.info("setWidgetName", "exit EMPYT name > " + id);
			return
		}


		/**
		 * check first if there was really a change. This method might get called alot.
		 */
		const widget = this.model.widgets[id];
		if(widget && widget.name!= value){

			this.logger.log(-1,"setWidgetName", "enter > " + id + " > " + value);
			this.startModelChange()
			const command = {
				timestamp : new Date().getTime(),
				type : "WidgetName",
				o :widget.name,
				n : value,
				modelId : id
			};
			this.addCommand(command);

			/**
			 * do the model update
			 */
			this.modelWidgetName(id, value);
			this.commitModelChange(false, true)
		}

	}

	modelWidgetName (id, value){
		const widget = this.model.widgets[id];
		if(widget){
			widget.name = value;
			if (this.model.templates && widget.isRootTemplate) {
				const template = this.model.templates[widget.template]
				if (template) {
					template.name = value
				}
			}
			this.onModelChanged([{type: 'widget', action:"change", id: id}])
			this.onWidgetNameChange(widget)
		}

	}

	undoWidgetName (command){
		this.modelWidgetName(command.modelId, command.o);
	}


	redoWidgetName (command){
		this.modelWidgetName(command.modelId, command.n);
	}

	/**********************************************************************
	 * Widget text
	 **********************************************************************/
	updateWidgetLabel(id, label){
		this.logger.log(5,"updateWidgetLabel", "enter > " + id);

		const widget = this.model.widgets[id];
		if (widget) {
			this.startModelChange()
			let width = TextUtil.getTextWidth(label, widget)
			this.logger.log(-1,"updateWidgetLabel", "enter > " + label + ' => ' + width + 'px');
			const command = {
				timestamp : new Date().getTime(),
				type : "WidgetLabel",
				o: {
					label: widget.props.label,
					w: widget.w
				},
				n: {
					label: label,
					w: width
				},
				modelId : id
			};

			this.modelUpdateWidgetText(id, label, width)
			this.render();

			this.checkTemplateAutoUpdate([{id: id, type:'widget', prop:'props', action:'change'}])
			this.commitModelChange(true, true)	
			return command;
		} else {
			this.logger.log(-1,"updateWidgetLabel", "no widget: ", id);
		}
	}

	modelUpdateWidgetText(id, label, width) {
		const widget = this.model.widgets[id];
		if (widget) {
			widget.props.label = label
			widget.w = width
			this.logger.log(-1,"modelUpdateWidgetText", "width ", widget.w);
			this.onModelChanged([{type: 'widget', action:"change", id: id}])
		}
	}

	undoWidgetLabel (command){
		this.logger.log(3,"undoWidgetLabel", "enter > " + command.id);
		this.modelRemoveWidget(command.modelId, command.o.label, command.o.w);
		this.render();
	}

	redoWidgetLabel (command){
		this.logger.log(3,"redoWidgetLabel", "enter > " + command.id);
		this.modelRemoveWidget(command.modelId, command.n.label, command.n.w);
		this.render();
	}


	/**********************************************************************
	 * Widget position
	 **********************************************************************/



	updateWidgetPosition (id, pos, fromToolbar, hasCopies){
		this.logger.log(-1,"updateWidgetPosition", "enter > " + id );

		const widget = this.model.widgets[id];
		if (!widget) {
			this.logger.error("updateWidgetPosition", "No widget with id > " + id );
			return
		}

		this.startModelChange()
		const command = this.createWidgetPositionCommand(id, pos,fromToolbar, true);
		this.addCommand(command);

		/**
		 * get the old screen
		 */
		const oldScreen = this.getHoverScreen(widget);

		/**
		 * Update the model
		 */
		this.modelWidgetUpdate(id, pos);

		/**
		 * show message
		 */
		const newScreen = this.getHoverScreen(widget);
		if(newScreen){
			if(!oldScreen || (oldScreen && oldScreen.id != newScreen.id)){
				this.showSuccess("Great! A new widget was added to screen "+ newScreen.id);
			}
		} else{
			if(oldScreen){
				if(widget.has && !widget.has.logic){
					this.showError("The widget is not in a screen! It will not be shown in the simulator!");
				}
			}
		}

		/**
		 * render if triggered from tool bar or widget has inheritance
		 *
		 * FIXME: If we call render directly after and DnD from Canvas We have huge bumps.
		 * Somehow the GridRuler rounds the grid stupid
		 */
		if(fromToolbar || hasCopies){
			this.render();
		} else {
			this.onWidgetPositionChange()
		}

		this.checkTemplateAutoUpdate([{id: id, type:'widget', prop:'position', action:'change'}])
		this.commitModelChange(true, true)		
		return pos;
	}


	createWidgetPositionCommand (id, pos,fromToolbar, correctPosition){

	
		/**
		 * get the correct coordinates in the
		 * un-zoomed model or do the snapping to
		 * get rid of rounding errors!
		 */
		if(correctPosition){
			pos = this.correctPostion(id, pos, fromToolbar);
		}

		/**
		 * make command
		 */
		const widget = this.model.widgets[id];
		const delta = this.getDeltaBox(widget, pos);
		const command = {
			timestamp : new Date().getTime(),
			type : "WidgetPosition",
			delta :delta,
			modelId : id
		};

		return command;
	}

	
	modelWidgetUpdate (id, pos, callModelChange = true){
		const widget = this.model.widgets[id];
		widget.modified = new Date().getTime()

		/**
		 * update position
		 */
		this.updateBox(pos, widget);

		/**
		 * IF we have in inherited widget moved,
		 * we use its position in rendering and remove
		 * the parentWidgetPos flag.
		 */
		if (widget.parentWidgetPos) {
			this.logger.log(-1,"modelWidgetUpdate", "remove parentWidgetPos");
			delete widget.parentWidgetPos;
		}

		/**
		 * remove from parent screen if set.
		 */
		this.cleanUpParent(widget);

		/**
		 * update parent screen
		 */
		const screen = this.getHoverScreen(widget);
		if(screen){
			screen.children.push(widget.id);
		}

		/**
		 * call model change
		 */
		if (callModelChange) {
			this.onModelChanged([{type: 'widget', action:"change", "prop": "position", id: id}])
		}

	}

	undoWidgetPosition (command){
		this.logger.log(0,"undoWidgetPosition", "enter > " + command.id);
		this.modelWidgetUpdate(command.modelId, command.delta.o);
		this.render();
	}

	redoWidgetPosition (command){
		this.logger.log(0,"redoWidgetPosition", "enter > " + command.id);
		this.modelWidgetUpdate(command.modelId, command.delta.n);
		this.render();
	}

	cleanUpParent (widget){
		let currentParent = this.getParentScreen(widget);
		if(currentParent){
			let i = currentParent.children.indexOf(widget.id);
			if(i != -1) {
				this.logger.log(2,"cleanUpParent", "remove Screen " + widget.id  +" from " + currentParent.id);
				currentParent.children.splice(i, 1);
			}
		}
	}

	cleanUpGroup (widget){

		var currentGroup = this.getParentGroup(widget.id);
		if(currentGroup){
			var i = currentGroup.children.indexOf(widget.id);
			if(i != -1) {
				this.logger.log(2,"cleanUpGroup", "remove " + widget.id  +" from " + currentGroup.id);
				currentGroup.children.splice(i, 1);
			}
		}
	}

	

	/**********************************************************************
	* Widget props
	**********************************************************************/

	updateWidgetProperties (id, props, type, doNotRender, forceCompleteRender = false){
		this.logger.log(-1,"updateWidgetProperties", "enter > " + type+ " > doNotRender: "+ doNotRender);
		this.startModelChange()

		const widget = this.model.widgets[id];
		const command = this.createWidgetPropertiesCommand(id, props, type);
		const inlineEdit = this.getInlineEdit();
		if(command){
			this.addCommand(command);	
			this.modelWidgetPropertiesUpdate(id, props, type, doNotRender);
		}
	
		if(!doNotRender){
			// fast if not templates
			this.renderWidget(widget, type);
		}

		if (inlineEdit) {
			this.logger.log(-1,"updateWidgetProperties", "force rerender because of inline edit");
			this.render();
		}

		if (forceCompleteRender) {
			this.logger.log(-1,"updateWidgetProperties", "force rerender !");
			this.render()
		}

		this.checkTemplateAutoUpdate([{id: id, type:'widget', action:'change', prop:'props'}])
		this.commitModelChange(true, true)
	}

	createWidgetPropertiesCommand (id, props, type, inlineLabel){
		const widget = this.model.widgets[id];
		if (widget){
			if (!widget[type]){
				this.logger.log(0,"createWidgetPropertiesCommand", "add key > " + type);
				widget[type]={};
			}

			const delta = this.getPropertyDelta(widget, props, type);
			const command = {
				timestamp : new Date().getTime(),
				type : "WidgetProperties",
				delta :delta,
				modelId : id,
				element : type,
				inlineLabel: inlineLabel
			};
			return command;

		} else {
			this.logger.log(0,"createWidgetPropertiesCommand", "No widget with id > " + id);
		}
	}

	modelWidgetPropertiesUpdate (id, props, type){
		this.logger.log(1,"modelWidgetPropertiesUpdate", "enter > " + id+ " > " + type, props);

		const widget = this.model.widgets[id];
		if(widget && widget[type]){
			widget.modified = new Date().getTime()
			for(let p in props){
				widget[type][p] = props[p];
			}
		}else {
			console.warn("Could not update widget properties for type", type);
		}

		this.setLastChangedWidget(widget)
		this.onModelChanged([{type: 'widget', action:"change", id: id}])
	}

	undoWidgetProperties (command){
		this.logger.log(3,"undoWidgetProperties", "enter > " + command.id);
		this.modelWidgetPropertiesUpdate(command.modelId, command.delta.o, command.element);
		this.render();
	}

	redoWidgetProperties (command){
		this.logger.log(3,"redoWidgetProperties", "enter > " + command.id);
		this.modelWidgetPropertiesUpdate(command.modelId, command.delta.n, command.element);
		this.render();
	}

	/**********************************************************************
	 * Widget add
	 **********************************************************************/
	addWidget (model, pos, fromTool){
		this.logger.log(0,"addWidget", "enter > " + fromTool);

		this.startModelChange()
		pos = this.getUnZoomedBox(pos, this._canvas.getZoomFactor());
		const targetScreen = this.getHoverScreen(pos);

		/**
		 * Create the model. Attention! The passed model might say that it was from a
		 * template. In that case we need to create a templated model! We assume the
		 * template exists!
		 */
		const widget = this._createWidgetModel(model);
		if (targetScreen) {
			widget.name = this.getWidgetName(targetScreen.id, widget.name);
		}
		widget.id = "w"+this.getUUID();
		widget.z = this.getMaxZValue(this.model.widgets) + 1;		
		widget.x =  pos.x;
		widget.y =  pos.y;
		if( fromTool){
			widget.w =  pos.w;
			widget.h =  pos.h;
		}

		// make sure there is one root template
		if (widget.template && this.model.templates) {
			let template = this.model.templates[widget.template]
			if (template) {
				this.setRootTemplateIfNeeded(widget, template)
			}
		}

		const command = this._createAddWidgetCommand(widget);
		this.addCommand(command);

		/**
		 * Update model
		 */
		this.modelAddWidget(widget);

		this.render();
		const screen = this.getHoverScreen(widget);
		if(screen){
			this.showSuccess("Great! A new widget was added to screen "+ screen.id);
		} else {
			if(widget.has && !widget.has.logic){
				this.showError("Great! A new widget was added, but is does not belong to any screen! It will not be shown in the simulator.");
			}
		}
		this.commitModelChange(true, true)
		return widget;
	}

	_createAddWidgetCommand (widget){
		/**
		 * create the command
		 */
		const command = {
			timestamp : new Date().getTime(),
			type : "AddWidget",
			model : widget
		};
		return command;
	}


	/**
	 * create the new model. the model element must have a parameter "type",
	 * "template" or "theme"!
	 */
	_createWidgetModel (model){

		/**
			* this is has changed. we might have templates, that still get some special handling
			* other wise we just use the objct from the ui.
			*/
		if(model.template){
			return this.factory.createTemplatedModel(model);
		} else {
			return model;
		}
	}


	modelAddWidget (widget, ignoreModelChange){
		if(!this.model.widgets[widget.id]){
			widget.created = new Date().getTime()
			this.model.widgets[widget.id] = widget;
			this.onElementCreated(widget)
		} else {
			console.warn("Could not add widget because id wxists", widget);
		}

		/**
		* also check if we have dropped on a screen
		*/
		const screen = this.getHoverScreen(widget);
		if (screen){
			screen.children.push(widget.id);
		}
		if(!ignoreModelChange){
			this.onModelChanged([{type: 'widget', action:"add", id: widget.id}]) // pass teh screen as well?
		}

	}

	modelRemoveWidget (widget){
		if(this.model.widgets[widget.id]){
			// this.cleanUpParentWidgets(widget);
			delete this.model.widgets[widget.id];
			this.cleanUpParent(widget);
			this.onModelChanged([{type: 'widget', action:"remove", id: widget.id}])
			return true;
		} else {
			console.warn("Could not delete widget", widget);
		}
	}

	undoAddWidget (command){
		this.logger.log(3,"undoAddWidget", "enter > " + command.id);
		const widget = command.model;
		this.modelRemoveWidget(widget);
		this.render();
	}

	redoAddWidget (command){
		this.logger.log(3,"redoAddWidget", "enter > " + command.id);
		const widget = command.model;
		this.modelAddWidget(widget);
		this.render();
	}


	/**********************************************************************
	* Widget remove
	**********************************************************************/

	removeWidget (id){
		this.logger.log(3,"removeWidget", "enter > " +id);
		const widget = this.model.widgets[id];
		if (widget) {
			this.startModelChange()
			const command = this.createWidgetRemoveCommand(id);
			this.addCommand(command);
			this.unSelect();
			this.checkTemplateAutoUpdate([{id: id, type:'widget', action:'remove'}])
			this.modelRemoveWidgetAndLines(command.model, command.lines, command.refs, false, command.group);
			this.render();
			this.commitModelChange(true, true)
		}
		
	}

	createWidgetRemoveCommand (id){
		const widget = this.model.widgets[id];
		const lines = this.getLines(widget);
		const refs = this.getReferences(widget);
		const group = this.getParentGroup(widget.id)
	
		var command = {
			timestamp : new Date().getTime(),
			type : "RemoveWidget",
			model: widget,
			lines: lines,
			group: lang.clone(group),
			refs : refs,
			modelId : id
		};

		return command;
	}


	getReferences (widget){

		var result = [];

		for (var widgetID in this.model.widgets) {
			var w = this.model.widgets[widgetID];
			if (w.props && w.props.refs) {
				var refs = w.props.refs;
				for (var refKey in refs){
					var refIds = refs[refKey];
					if (refIds.indexOf(widget.id) >=0){
						var refId = widget.id;
						result.push({
							widget : widgetID,
							refKey : refKey,
							refId : refId
						})
					}
				}
			}
		}

		return result;
	}

	modelRemoveWidgetAndLines (widget, lines, refs, doNotCallModelChanged, group){
	
		if (this.model.widgets[widget.id]) {
			delete this.model.widgets[widget.id];
			this.cleanUpParent(widget);
			this.cleanUpGroup(widget);
		} else {
			console.warn("Could not delete widget and lines: " + widget.id, widget);
		}

		if (lines) {
			for	(let i=0; i < lines.length; i++){
				let line = lines[i];
				delete this.model.lines[line.id];
			}
		} else {
			console.warn("modelRemoveWidgetAndLines() > Missing lines parameter");
		}

		if (refs){
			try {
				for(let i=0; i < refs.length; i++){
					let ref = refs[i];
					let refKey = ref.refKey;
					let refId = ref.refId;
					let target = this.model.widgets[ref.widget];
					if (target!=null && target.props!=null && target.props.refs!=null){
						let refs = target.props.refs[refKey];
						let pos = refs.indexOf(refId);
						if(pos >=0){
							target.props.refs[refKey].splice(pos, 1);
						}
						if(target.props.refs[refKey].length == 0){
							delete target.props.refs[ref.refKey];
						}
					}
				}
			} catch (e) {
				this.logger.sendError(e);
				console.error(e);
			}
		} else {
			console.warn("modelRemoveWidgetAndLines() > Missing refs parameter");
		}

		if (group) {
			const groupId = group.id
			if (this.model.groups && this.model.groups[groupId]) {
				group = this.model.groups[groupId]
				group.children = group.children.filter(id => id!== widget.id)
				// remove not needed groups before the model fixer will do
				if (group.children.length === 0) {
					delete this.model.groups[groupId]
				}
			}
		}

		if(!doNotCallModelChanged){
			this.onModelChanged([])
		}

		return true;
	}


	modelAddWidgetAndLines (widget, lines, refs, group){

		if(!this.model.widgets[widget.id]){
			this.model.widgets[widget.id] = widget;

			/**
			 * also check if we have dropped on a screen
			 */
			const screen = this.getHoverScreen(widget);
			if(screen){
				screen.children.push(widget.id);
			}

		} else {
			console.warn("Could not add widget", widget);
		}

		if (refs){
			try {
				for (let i=0; i < refs.length; i++){
					let ref = refs[i];
					let target = this.model.widgets[ref.widget];
					if (target && target.props && target.props){
						if (!target.props){
							target.props = {};
						}
						if (!target.props.refs[ref.refKey]){
							target.props.refs[ref.refKey] = [];
						}
						target.props.refs[ref.refKey].push(ref.refId);
					}
				}
			} catch(e){
				this.logger.sendError(e);
			}
		} else {
			console.warn("modelAddWidgetAndLines() > Missing refs parameter");
		}

		/**
			* also add lines
			*/
		if (lines) {
			for(let i=0; i < lines.length; i++){
				let line = lines[i];
				if(!this.model.lines[line.id]){
					this.model.lines[line.id] = line;
				} else {
					console.warn("Could not add line", line);
				}
			}
		} else {
			console.warn("modelAddWidgetAndLines() > Missing lines parameter");
		}


		if (group) {
			if (!this.model.groups) {
				this.model.groups = {}
			}
			this.model.groups[group.id] = group
		}

		this.onModelChanged([]);
	}


	undoRemoveWidget (command){
		const widget = command.model;
		this.modelAddWidgetAndLines(widget, command.lines, command.refs, command.group);
		this.render();
	}

	redoRemoveWidget (command){
		const widget = command.model;
		this.modelRemoveWidgetAndLines(widget, command.lines, command.refs, false, command.group);
		this.render();
	}


	/**********************************************************************
	 * Add Multi Widgets (from uplaod)
	 **********************************************************************/

	addMultiImageWidgets (widgets, parentScreen){
		this.logger.log(0,"addMultiImageWidgets", "enter > " + parentScreen.name);

		this.startModelChange()
		const command = {
			timestamp : new Date().getTime(),
			type : "MultiCommand",
			label : "addMultiImageWidgets",
			children :[]
		};

		const z = this.getMaxZValue(this.model.widgets) + 1;
		for (let i=0; i< widgets.length; i++){
			/**
				* Set id
				*/
			const widget = widgets[i];

			const img = widget.style.backgroundImage;
			const scaleRatio = img.h / img.w;

			widget.id = "w"+this.getUUID();
			widget.z = z + 1 + i
			widget.w = Math.min(300, img.w);
			widget.props = {};
			widget.has = {
				image:true,
				onclick : true,
				backgroundImage : true,
				border:true
			}

			widget.h = Math.floor(widget.w * scaleRatio);

			const child = {
				timestamp : new Date().getTime(),
				type : "AddWidget",
				model : widget
			};
			command.children.push(child);
			this.modelAddWidget(widget);
		}

		this.addCommand(command);

		this.render();
		this.commitModelChange(true, true)
	}

	/**********************************************************************
	* Widget Z
	**********************************************************************/

	setWidgetLayers (zValues){
		this.logger.log(0,"setWidgetLayers", "enter > ");
		this.startModelChange()
		const old = {};
		const widgets = this.model.widgets;
		for(var id in widgets){
			var newZ = zValues[id];
			var widget = widgets[id];
			if(widget.z != newZ){
				old[id] = widget.z;
			}
		}

		const command = {
			timestamp : new Date().getTime(),
			type : "WidgetLayers",
			o : old,
			n: zValues
		};

		this.addCommand(command);
		this.modelWidgetLayers(zValues);
		this.render();
		this.commitModelChange(true, true)
	}

	modelWidgetLayers (zValues){
		const widgets = this.model.widgets;
		const modified = new Date().getTime()
		for(let id in zValues){
			const widget = widgets[id];
			if(widget){
				widget.modified = modified
				widget.z = zValues[id];
			} else {
				console.warn("modelWidgetLayers() > Could not set z Valoue for ", id);
			}
		}
		this.onModelChanged([]);
	}

	undoWidgetLayers (command){
		this.modelWidgetLayers(command.o);
		this.render();
	}

	redoWidgetLayers (command){
		this.modelWidgetLayers(command.n);
		this.render();
	}
}