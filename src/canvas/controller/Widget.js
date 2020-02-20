import lang from 'dojo/_base/lang'
import Screen from 'canvas/controller/Screen'
import * as TextUtil from 'core/TextUtil'

export default class Widget extends Screen {

	enableInheritedWidget (widget){
		this.logger.log(-1,"enableInheritedWidget", "enter > " +widget.id);
		
		if(widget.inherited) {
			var source = this.model.widgets[widget.inherited];
			var targetScreen = this.model.screens[widget.inheritedScreen];
			if (source && targetScreen) {
				
				var sourcePos = this.getWidgetPostionInScreen(source);
				var targetPos = {
					x: targetScreen.x + sourcePos.x,
					y: targetScreen.y + sourcePos.y,
					w: sourcePos.w,
					h: sourcePos.h
				}
				var newWidget = this.addInheritedWidget(source, targetPos, targetScreen);
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
		
		// like onCopyWidget
		var newWidget = this._copyWidget(widget, targetScreen);
		newWidget.copyOf = widget.id;
		newWidget.name = widget.name // make sure we get the same name! Otherwise we would get box1 or so...
		newWidget.id = "w"+this.getUUID();
		newWidget.x =  pos.x;
		newWidget.y =  pos.y;
		newWidget.z = this.getMaxZValue(this.model.widgets) + 1;
		delete newWidget.props.databinding;
		
		// special stuff for inherited widgets
		newWidget.parentWidget = widget.id;
		newWidget.parentWidgetPos = true
		newWidget.style = {}
		newWidget.hover = {}
		newWidget.props = {}

		var command = {
			timestamp : new Date().getTime(),
			type : "CopyWidget",
			model : newWidget,
		};
		this.addCommand(command);
		
		this.modelAddWidget(newWidget);
		this.render();
		return newWidget;
	} 

	/**********************************************************************
	 * Distribution
	 **********************************************************************/
	
	
	distributeWidgets (type, widgets){
		this.logger.log(0,"distributeWidgets", "enter > " +type);	
		
		var bbx = this.getBoundingBox(widgets);
		var positions = this._distributedPositions(type, widgets, bbx).positions;
		
		this.updateMultiWidgetPosition(positions, true);
		
		this.render();
		this.renderAlignEnd();
	} 
	
	
	
	/**********************************************************************
	 * Alignment
	 **********************************************************************/
	
	alignWidgets (direction, source, target) {
		this.logger.log(-1, "alignWidgets", "enter > " + direction, target);
		
		var targetBox = this.getBoundingBox(target);
		var positions = {};
	
		for (var i=0; i < source.length; i++){
			var widgetID = source[i];
			var widget = this.model.widgets[widgetID];
	
			if (widget){
				/**
				 * We copy the old position
				 */
				var widgetPos = { x: widget.x, y : widget.y, h: widget.h, w: widget.w};
				var sourceBox = widgetPos
				positions[widgetID] = widgetPos;
				var offset = {x:0,y:0};
				/**
				 * In case there is a group, we set an offset!
				 * 
				 */
				var group = this.getParentGroup(widgetID);
				if (group){
					var boundingBox = this.getBoundingBox(group.children);
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

	
	
	/**********************************************************************
	 * Multi Widget stuff
	 **********************************************************************/

	updateBoundingBox (ids, pos) {
		if(pos.snapp) {
			
			/** 
			 * Get bounding box in model
			 */

			/**
			 * FIXME: This where are the positions comming from?
			 */
			console.warn('updateBoundingBox', ids, pos)
			//ids = [];
			// for(id in positions){
			//	ids.push(id);
			//}
			var modelBoundingBox = this.getBoundingBox(ids);
			
			/**
			 * Unzoomed
			 */
			var boundingBox = this.getUnZoomedBox(lang.clone(pos), this._canvas.getZoomFactor()); 
			/**
			 * FIXME: We had here again the issue of writing to a wrong variable boundingBox vs boundingBVox
			 */
			boundingBox = this._correctBoundindBox(boundingBox, modelBoundingBox);
		
			
			var dif ={
				x: boundingBox.x *1.0 / modelBoundingBox.x,
				y: boundingBox.y *1.0 / modelBoundingBox.y,
				w: boundingBox.w *1.0 / modelBoundingBox.w,
				h: boundingBox.h *1.0 / modelBoundingBox.h
			}; 
				
			var positions = {};
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

		var command = {
			timestamp : new Date().getTime(),
			type : "MultiCommand",
			label : "UpdateMultiWidgetPos",
			children :[]
		};
		
		var correctPosition = true;
		
		if(boundingbox && boundingbox.snapp && boundingbox.type=="boundingbox"){
		
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
			var snapp = boundingbox.snapp;
			if(snapp.type=="All"){
				
				/** 
				 * Get bounding box in model and also the offset
				 */
				var ids = [];
				for(let id in positions){
					ids.push(id);
				}
				var modelBoundingBox = this.getBoundingBox(ids);
				
				
				/**
				 * Get bounding box in editor
				 */
				var boxes = [];
				for(let id in positions){
					boxes.push(positions[id]);
				}
				var b = this.getBoundingBoxByBoxes(boxes);		
				boundingbox.x = b.x;
				boundingbox.y = b.y;
				
				/**
				 * Unzoomed
				 */
				boundingbox = this.getUnZoomedBox(lang.clone(boundingbox), this._canvas.getZoomFactor()); 
				/**
				 * FIXME, here was a bug that the corect* methdo was writting to a different variable
				 */
				boundingbox = this._correctBoundindBox(boundingbox, modelBoundingBox);
						
				/**
				 * Get hover screen
				 */
				var screen = this.getHoverScreen(boundingbox);
				if(screen) {
					this.snappAll(modelBoundingBox, screen, boundingbox, snapp);						
				}
				
				/**
				 * compare difference between snapped bbox and model bbox
				 */
				var difX = modelBoundingBox.x - boundingbox.x;
				var difY = modelBoundingBox.y - boundingbox.y;	
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
		
		for(let id in positions){
			let pos = positions[id];
			var child = this.createWidgetPositionCommand(id, pos, fromToolbar, correctPosition);
			command.children.push(child);
			this.modelWidgetUpdate(id, pos);
		}
		
		this.addCommand(command);
		
		/**
		 * FIXME: We could show here some validation messages,
		 * if all widgets are inside the thing.... Should be done in the 
		 * for loop.
		 */
		
		/**
		 * Do not render
		 */
		if (fromToolbar || hasCopies) {
			this.logger.log(-1,"updateMultiWidgetPosition", "exit > with render");
			this.render();
		}
	} 
	
	removeMultiWidget (selection){
		this.logger.log(1,"removeMultiWidget", "enter > ");
		
		var command = {
			timestamp : new Date().getTime(),
			type : "MultiCommand",
			label : "RemoveMultiWidget",
			children :[]
		};
		
		for(var i=0; i < selection.length; i++){
			var id = selection[i];

			var child = this.createWidgetRemoveCommand(id);
			command.children.push(child);
				
			var widget = this.model.widgets[id];
			var lines = this.getLines(widget);	
			var refs = this.getReferences(widget);
			
			this.modelRemoveWidgetAndLines(widget, lines, refs);
		}
		
		this.unSelect();
		this.render();
		
		this.addCommand(command);
	} 
	
	/**********************************************************************
	 * Widget name
	 **********************************************************************/

	setWidgetName (id, value){
		
		
		/**
		 * check first if there was really a change. This method might get called alot.
		 */
		var widget = this.model.widgets[id];
		if(widget && widget.name!= value){
			
			this.logger.log(-1,"setWidgetName", "enter > " + id + " > " + value);
			
			var command = {
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
		}
		
	} 
	
	modelWidgetName (id, value){
		var widget = this.model.widgets[id];
		if(widget){
			widget.name = value;
			this.onModelChanged();
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

		/**
		 * make command 
		 */
		var widget = this.model.widgets[id];
		if (widget) {
			let width = TextUtil.getTextWidth(label, widget)
			this.logger.log(-1,"updateWidgetLabel", "enter > " + label + ' == ' + width);
			var command = {
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
		}
		return command;
	}

	modelUpdateWidgetText(id, label, width) {
		var widget = this.model.widgets[id];
		if (widget) {
			widget.props.label = label
			widget.w = width

			this.onModelChanged();
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
		this.logger.log(1,"updateWidgetPosition", "enter > " + id );
		
		
		var command = this.createWidgetPositionCommand(id, pos,fromToolbar, true);
		this.addCommand(command);
	
		
		/**
		 * get the old screen
		 */
		var widget = this.model.widgets[id];
		var oldScreen = this.getHoverScreen(widget);
		
		/**
		 * Update the model
		 */
		this.modelWidgetUpdate(id, pos);
		
	
		/**
		 * show message
		 */
		var newScreen = this.getHoverScreen(widget);
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
		var widget = this.model.widgets[id];
		var delta = this.getDeltaBox(widget, pos);
		var command = {
			timestamp : new Date().getTime(),
			type : "WidgetPosition",
			delta :delta,
			modelId : id
		};
		
	
		return command;
	} 
	
	correctPostion (id, pos, fromToolbar){
		
		if(!fromToolbar){
			pos = this.getUnZoomedBox(pos, this._canvas.getZoomFactor());
		}
		
		if(pos.snapp){
			/**
			 * Group snapps do not have a .snapp object
			 */
			var snapp = pos.snapp;
			var screen = this.getHoverScreen(pos);
			var widget = this.model.widgets[id];
			if(screen && widget) {
				if(snapp.type=="All"){		
					this.snappAll(widget,screen, pos, snapp);
				}else {
					this.snappResize(widget,screen, pos, snapp)
				}
			}
		}
		return pos;
	} 
	
	snappResize (widget,screen, pos, snapp){
		this.logger.log(0,"snappResize", "enter > " + snapp.type);
		var type = snapp.type;
		
	
		if(snapp.x || snapp.y){
			/**
			 * We have snapping, so we ensure here that the all not changed values stay the same.
			 * hence we copy the values form the unzoomed model and update only the snapped 
			 * values 
			 */
			if(snapp.x){
				let line = snapp.x;
				let x = this.getSnappXValue(line, screen);
			
				if(type=="RightDown" || type=="RightUp" || type =="East"){
					pos.w = x - widget.x;
					/**
					 * Snapp pos.x to old x to avoid jumps
					 */
					pos.x = widget.x;
				} else if(type=="LeftUp" || type=="LeftDown" || type =="West"){					
					pos.w = widget.w+ (widget.x -x);
					pos.x = x;				
				} else {
					console.warn("snappResize() : X with unsupported type", type, snapp.x);
				}
			

			}
			
			if(snapp.y){			
				let line = snapp.y;	
				let y = this.getSnappYValue(line, screen);					
				if(type=="RightDown" || type=="South" || type =="LeftDown"){				
					pos.h = y - widget.y;
					/**
					 * Snapp pos.y to old y to avoid jumps
					 */
					pos.y = widget.y;					
				} else if(type=="LeftUp" || type=="RightUp" || type =="North"){					
					pos.h = widget.h+ (widget.y -y);
					pos.y = y;			
				} else {
					console.warn("snappResize() : X with unsupported type", type, snapp.x);
				}
			}
		}
		

		/**
		 * If there is no snapp, there might be a pos.x / pos.y value that has been updated
		 * in the canvas and has a pixel rounding error because of zooming. This we stop here
		 */
		if(type == "South" || type=="North"){
			pos.x = widget.x;
		}
		
		if(type == "East" || type=="West"){
			pos.y = widget.y;
		}

		if(snapp.square){
			var min = Math.min(pos.w, pos.h);
			pos.h = min;
			pos.w = min;
		}		
	} 
	
	snappAll (widget,screen, pos, snapp){
		this.logger.log(0,"snappAll", "enter > ");
	
		if(snapp.x){
			pos.x = widget.x;
			pos.w = widget.w;
			let line = snapp.x;
			let x = this.getSnappXValue(line, screen);
			if (x > 0) {
				if(snapp.x.middle){
					/**
					 * Should not happen for grid lines and groups!
					 * We filter before so no problem...
					 */
					pos.x = x - Math.floor(pos.w/2);
				} else if(snapp.left){
					pos.x = x;	
				} else {
					pos.x = x - pos.w;
				}
			} else {
				this.logger.error("snappAll", " getSnappXValue return 0");
			}
		}		
		
		if(snapp.y){
			let line = snapp.y;
			pos.y = widget.y;
			pos.h = widget.h;
			let y = this.getSnappYValue(line, screen);
			if (y > 0) {
				if(snapp.y.middle){
					/**
					 * Should not happen for grid lines and groups!
					 */
					pos.y = y - Math.floor(pos.h/2);
				} else if(snapp.top){
					pos.y = y;
				} else {
					pos.y = y - pos.h;
				}
			} else {
				this.logger.error("snappAll", " getSnappYValue return 0");
			}
		}
	} 
	
	getSnappXValue (line, screen){
		if("Grid" == line.type){
			
			if (line.column === true){
				
				var columnCount = this.model.grid.columnCount * 1;
				var columnOffset = this.model.grid.columnOffset * 1;
				var columnGutter = this.model.grid.columnGutter * 1;
				var columnWidth =  this.model.grid.columnWidth * 1;
			
				/**
				 * FIXME: we reproduce here the method from the rendering and GridAndRuler...
				 */
				var count = 0;
				var lastX = columnOffset;
				for (let i=0; i< columnCount; i++){
					if (line.line == count){
						return (screen.x + lastX);
					}
					count++;
					let x = lastX + columnWidth;
					if (line.line == count){
						return (screen.x + x);
					}
					count++;
					lastX = x + columnGutter;
				}
				return (screen.x + screen.w);
			} else {
				return (screen.x + this.model.grid.w * line.line);
			}
		
		} else if("Screen" == line.type || "Widget" == line.type){
			let box = this.getBoxById(line.id);
			return this.getSnappValue(box, line);
		} else if ("Mirror" == line.type) {
			let box = this.getBoxById(line.id);
			let difX = box.x - screen.x;
			return (screen.x + screen.w) - difX
		} else if ("Ruler" == line.type) {
			let rulers = this.getAllRulers(this.model, screen)
			if (rulers) {
				let ruler = rulers.find(r => r.id === line.id)
				if (ruler) {
					return screen.x + ruler.v
				} else {
					this.logger.error("getSnappXValue", "No ruler with id " + line.id);
					this.logger.sendError(new Error('Could not snapp to X ruler'));
				}
			}
		} else {
			console.warn("getSnappXValue() >Unsupported snapp type for x", line.type);
		}
		return 0;
	} 
	
	getSnappYValue (line, screen){
		if("Grid" == line.type){
			return (screen.y + (this.model.grid.h * line.line));
		}else if("Screen" == line.type || "Widget" == line.type){
			let box = this.getBoxById(line.id);
			return this.getSnappValue(box, line);
		} else if ("Mirror" == line.type) {
			let box = this.getBoxById(line.id);
			let difY = box.y - screen.y;
			return (screen.y + screen.h) - difY
		} else if ("Ruler" == line.type) { 
			let rulers = this.getAllRulers(this.model, screen)
			if (rulers) {
				let ruler = rulers.find(r => r.id === line.id)
				if (ruler) {
					return screen.y + ruler.v
				} else {
					this.logger.error("getSnappYValue", "No ruler with id " + line.id);
					this.logger.sendError(new Error('Could not snapp to Y ruler'));
				}
			}
		} else {
			console.warn("getSnappYValue() > Unsupported snapp type for ", line.type);
		}
		return 0;
	}
	
	getSnappValue(box, line){
		var pos = line.pos;
		switch(pos){
			case "top":
				return box.y;
			case "bottom":
				return box.y + box.h;
			case "left":
				return box.x;
			case "right":
				return box.x+ box.w;
			case "middleY":
				return box.y+ Math.round(box.h/2);
			case "middleX":
				return box.x+ Math.round(box.w/2);
			default:
				console.warn("Not supported line position", pos, line);
		}
		return 0;
	} 
	

	
	modelWidgetUpdate (id, pos){
		var widget = this.model.widgets[id];
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
		var screen = this.getHoverScreen(widget);
		if(screen){
			screen.children.push(widget.id);
		}
		
		/**
		 * call model change
		 */
		this.onModelChanged();
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
	updateWidgetProperties (id, props, type, doNotRender){
		this.logger.log(-1,"updateWidgetProperties", "enter > " + type+ " > doNotRender: "+ doNotRender);
		
		/**
		* make command 
		*/
		var widget = this.model.widgets[id];
		var command = this.createWidgetPropertiesCommand(id, props, type);	
		var inlineEdit = this.getInlineEdit();
		if(command){
			this.addCommand(command);
			this.modelWidgetPropertiesUpdate(id, props, type, doNotRender);
		}
		if(!doNotRender){
			this.renderWidget(widget, type);	
		}		
		if (inlineEdit) {
			this.logger.log(-1,"updateWidgetProperties", "force rerender because of inline edit");
			this.render();
		}
	} 
	
	createWidgetPropertiesCommand (id, props, type, inlineLabel){
		var widget = this.model.widgets[id];
		if(widget){
			if(!widget[type]){
				this.logger.log(0,"createWidgetPropertiesCommand", "add key > " + type);
				widget[type]={};
			}
			
			var delta = this.getPropertyDelta(widget, props, type);
			
			var command = {
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
		this.logger.log(1,"modelWidgetPropertiesUpdate", "enter > " + id+ " > " + type);
		
		
		var widget = this.model.widgets[id];
		if(widget && widget[type]){
			widget.modified = new Date().getTime()
			for(var p in props){
				widget[type][p] = props[p];
			}
		}else {
			console.warn("Could not update widget properties for type", type);
		}
		
		this.setLastChangedWidget(widget)
		this.onModelChanged();
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
		
		pos = this.getUnZoomedBox(pos, this._canvas.getZoomFactor());
		var targetScreen = this.getHoverScreen(pos);
		
		
		/**
			* Create the model. Attention! The passed model might say that it was from a 
			* template. In that case we need to create a templated model! We assume the 
			* template exists!
			*/
		var widget = this._createWidgetModel(model);
		if (targetScreen) {
			widget.name = this.getWidgetName(targetScreen.id, widget.name);
		} 
		widget.id = "w"+this.getUUID();
		widget.x =  pos.x;
		widget.y =  pos.y;
		if(fromTool){
			widget.w =  pos.w;
			widget.h =  pos.h;
		}
		widget.z = this.getMaxZValue(this.model.widgets) +1;
		
		var command = this._createAddWidgetCommand(widget);
		this.addCommand(command);
		
		/**
			* Update model
			*/
		this.modelAddWidget(widget);
		
		this.render();
		
		var screen = this.getHoverScreen(widget);
		if(screen){
			this.showSuccess("Great! A new widget was added to screen "+ screen.id);
		} else {
	
			if(widget.has && !widget.has.logic){
				this.showError("Great! A new widget was added, tut is does not belong to any screen! It will not be shown in the simulator.");
			}
		}
		
		return widget;
		
	} 
	
	_createAddWidgetCommand (widget){
		/**
			* create the command
			*/
		var command = {
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
		} else {
			console.warn("Could not add widget because id wxists", widget);
		}
		
		/**
		* also check if we have dropped on a screen
		*/
		var screen = this.getHoverScreen(widget);
		if(screen){
			screen.children.push(widget.id);
		}

		// this.setParentWidgets(widget)
		
		if(!ignoreModelChange){
			this.onModelChanged();
		}

	} 
	
	modelRemoveWidget (widget){
		console.debug('Repeater.remove')
		if(this.model.widgets[widget.id]){
			// this.cleanUpParentWidgets(widget);
			delete this.model.widgets[widget.id];
			this.cleanUpParent(widget);
			this.onModelChanged();
			return true;
		} else {
			console.warn("Could not delete widget", widget);
		}
	} 
	
	undoAddWidget (command){
		this.logger.log(3,"undoAddWidget", "enter > " + command.id);
		var widget = command.model;
		this.modelRemoveWidget(widget);
		this.render();
	} 
	
	redoAddWidget (command){
		this.logger.log(3,"redoAddWidget", "enter > " + command.id);
		var widget = command.model;
		this.modelAddWidget(widget);
		this.render();
	} 
	
	
	/**********************************************************************
		* Widget remove
		**********************************************************************/
	
	removeWidget (id){
		this.logger.log(3,"removeWidget", "enter > " +id);
		
		var command = this.createWidgetRemoveCommand(id);
		this.addCommand(command);
		
		var widget = this.model.widgets[id];
		var lines = this.getLines(widget);		
		var refs = this.getReferences(widget);
		this.modelRemoveWidgetAndLines(widget, lines, refs);
		
		this.unSelect();
		this.render();
	} 
	
	createWidgetRemoveCommand (id){
		var widget = this.model.widgets[id];
		var lines = this.getLines(widget);
		var refs = this.getReferences(widget);
		
		var command = {
			timestamp : new Date().getTime(),
			type : "RemoveWidget",
			model :widget,
			lines : lines,
			refs : refs,
			modelId : id
		};
		
		return command;
	} 
	
	
	getReferences (widget){
		
		var result = [];
		
		for(var widgetID in this.model.widgets){
			var w = this.model.widgets[widgetID];
			if(w.props && w.props.refs){
				
				var refs = w.props.refs;
				for(var refKey in refs){
					var refIds  = refs[refKey];
					
					if(refIds.indexOf(widget.id) >=0){
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
		
		//console.debug("getFres", result)
		
		return result;
	} 
	
	modelRemoveWidgetAndLines (widget, lines, refs, doNotCallModelChanged){
		
		if(this.model.widgets[widget.id]){
			delete this.model.widgets[widget.id];
			// this.cleanUpParentWidgets(widget);
			this.cleanUpParent(widget);
			
			this.cleanUpGroup(widget);
			
			for(let i=0; i < lines.length; i++){
				let line = lines[i];
				delete this.model.lines[line.id];
			}
			
			if(refs){
				try{					
					for(let i=0; i < refs.length; i++){
						let ref = refs[i];
						let refKey = ref.refKey;
						let refId = ref.refId;
						let target = this.model.widgets[ref.widget];
						if(target!=null && target.props!=null && target.props.refs!=null){
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
				} catch(e){
					this.logger.sendError(e);
					console.error(e);
				}
			} else {
				console.warn("modelRemoveWidgetAndLines() > Missing refs parameter");
			}			
			if(!doNotCallModelChanged){
				this.onModelChanged();
			}
			return true;
		} else {
			console.warn("Could not delete widget and lines", widget);
		}
	} 
	
	
	modelAddWidgetAndLines (widget, lines, refs){

		if(!this.model.widgets[widget.id]){
			this.model.widgets[widget.id] = widget;
			
			/**
				* also check if we have dropped on a screen
				*/
			var screen = this.getHoverScreen(widget);
			if(screen){
				screen.children.push(widget.id);
			}
			// this.setParentWidgets(widget)
			
			if(refs){
				try{					
					for(let i=0; i < refs.length; i++){
						let ref = refs[i];
						let target = this.model.widgets[ref.widget];
						if(target && target.props && target.props){
							if(!target.props){
								target.props = {};
							}
							if(!target.props.refs[ref.refKey]){
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
			
		} else {
			console.warn("Could not add widget", widget);
		}
		
		/**
			* also add lines
			*/
		for(let i=0; i < lines.length; i++){
			let line = lines[i];
			if(!this.model.lines[line.id]){
				this.model.lines[line.id] = line;
			} else {
				console.warn("Could not add line", line);
			}
		}
		
		this.onModelChanged();
	} 
	
	
	undoRemoveWidget (command){
		var widget = command.model;
		this.modelAddWidgetAndLines(widget, command.lines, command.refs);
		this.render();
	} 
	
	redoRemoveWidget (command){
		var widget = command.model;
		this.modelRemoveWidgetAndLines(widget, command.lines, command.refs);
		this.render();
	} 
	
	
	/**********************************************************************
		* Add Multi Widgets (from uplaod)
		**********************************************************************/
	
	addMultiImageWidgets (widgets, parentScreen){
		this.logger.log(0,"addMultiImageWidgets", "enter > " + parentScreen.name);
	
		var command = {
			timestamp : new Date().getTime(),
			type : "MultiCommand",
			label : "addMultiImageWidgets",
			children :[]
		};
		

		for(var i=0; i< widgets.length; i++){
			/**
				* Set id
				*/
			var widget = widgets[i];
			
			var img = widget.style.backgroundImage;
			var scaleRatio = img.h / img.w;
			
			widget.id = "w"+this.getUUID();
			widget.w = Math.min(300, img.w);
			widget.props = {};
			widget.has = {
				image:true,  
				onclick : true,
				backgroundImage : true,
				border:true
			}    
			
			widget.h = Math.floor(widget.w * scaleRatio);
		
				
			/**
				* Create Child Command
				*/
			var child = {
				timestamp : new Date().getTime(),
				type : "AddWidget",
				model : widget
			};
			command.children.push(child);
				
			/**
				* update model
				*/
			this.modelAddWidget(widget);
		}
		
		this.addCommand(command);
		
		this.render();

	} 
	
	/**********************************************************************
		* Widget name
		**********************************************************************/
	
	setWidgetLayers (zValues){
		this.logger.log(0,"setWidgetLayers", "enter > ");
		
		var old = {};
		var widgets = this.model.widgets;
		for(var id in widgets){
			var newZ = zValues[id];
			var widget = widgets[id];
			if(widget.z != newZ){ 
				old[id] = widget.z;
			}
		}

		var command = {
			timestamp : new Date().getTime(),
			type : "WidgetLayers",
			o : old,
			n: zValues
		};
		
		this.addCommand(command);
		this.modelWidgetLayers(zValues);
		this.render();
	} 
	
	modelWidgetLayers (zValues){
		var widgets = this.model.widgets;
		for(var id in zValues){
			var widget = widgets[id];
			if(widget){
				widget.z = zValues[id];
			} else {
				console.warn("Could not set z Valoue for ", id);
			}
		}
		this.onModelChanged();
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