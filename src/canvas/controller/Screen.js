import CopyPaste from './CopyPaste'
import lang from '../../dojo/_base/lang'
import Core from '../../core/Core'
import ModelResizer from '../../core/ModelResizer'
import * as ImportUtil from './ImportUtil'

export default class Screen extends CopyPaste {

	/**********************************************************************
	 * Ruler Props
	 **********************************************************************/

	updateScreenRulerProps (screenID, rulerID, props) {
		this.logger.log(0,"updateScreenRulerProps", "enter > screen : " + rulerID + "@" + screenID + " > " + props.sticky);

		var screen = this.model.screens[screenID];

		if(screen && screen.rulers) {
			let oldRuler = screen.rulers.find(r => r.id === rulerID)
			if (oldRuler){

				var command = {
					timestamp : new Date().getTime(),
					type : "ScreenRulerPropertyUpdate",
					o: oldRuler.props,
					n: props,
					rulerID : rulerID,
					screen : screenID
				};
				this.addCommand(command);
				this.modelScreenRulerPropsUpdate(screenID, rulerID, props);
				this.render();
			}
		}
	}

	modelScreenRulerPropsUpdate (screenID, rulerID, props) {
		var screen = this.model.screens[screenID];
		if (screen && screen.rulers) {
			let oldRuler = screen.rulers.find(r => r.id === rulerID)
			if (oldRuler) {
				oldRuler.props = props
				this.onModelChanged([{type: 'screen', action:"change", id: screenID}])
			} else {
				console.warn('No ruler with id', rulerID)
			}
		}
	}

	undoScreenRulerPropertyUpdate(command) {
		this.modelScreenRulerPropsUpdate(command.screen, command.rulerID, command.o);
		this.render();
	}

	redoScreenRulerPropertyUpdate(command) {
		this.modelScreenRulerPropsUpdate(command.screen, command.rulerID, command.n);
		this.render();
	}

	/**********************************************************************
	 * Ruler Pos
	 **********************************************************************/

	updateScreenRulerValue (screenID, rulerID, v) {
		this.logger.log(0,"updateScreenRulerValue", "enter > screen : " + screenID + " > " + rulerID.type);

		var screen = this.model.screens[screenID];

		if(screen && screen.rulers) {
			let oldRuler = screen.rulers.find(r => r.id === rulerID)
			if (oldRuler){
				const command = {
					timestamp : new Date().getTime(),
					type : "ScreenRulerUpdate",
					o: oldRuler.v,
					n: v,
					rulerID : rulerID,
					screen : screenID
				};
				this.addCommand(command);
				this.modelScreenRulerUpdate(screenID, rulerID, v);
				this.render();
			}
		}
	}

	updateScreenRuler (screenID, pos, ruler) {
		this.logger.log(0,"updateScreenRuler", "enter > screen : " + screenID + " > " + pos.type);
		pos = this.getUnZoomedBox(pos, this.getZoomFactor());
		var screen = this.model.screens[screenID];

		if(screen && screen.rulers) {
			let oldRuler = screen.rulers.find(r => r.id === ruler.id)
			if (oldRuler){
				let v = 0
				if (ruler.type === 'y') {
					v = pos.y - screen.y
				} else {
					v = pos.x - screen.x
				}

				var command = {
					timestamp : new Date().getTime(),
					type : "ScreenRulerUpdate",
					o: oldRuler.v,
					n: v,
					rulerID : ruler.id,
					screen : screenID
				};
				this.addCommand(command);
				this.modelScreenRulerUpdate(screenID, ruler.id, v);
				return this.getInheredRulers(screen)
			}
		}
	}

	modelScreenRulerUpdate (screenID, rulerID, v) {
		var screen = this.model.screens[screenID];
		if (screen && screen.rulers) {
			let oldRuler = screen.rulers.find(r => r.id === rulerID)
			if (oldRuler) {
				let oldV = oldRuler.v
				oldRuler.v = v

				/**
				 * Also update teh sticky children
				 */
				if (oldRuler.props && oldRuler.props.sticky) {
					let positions = ModelResizer.getRulerMoveUpdates(this.model, screen, oldRuler, oldV, v)
					for (let id in positions) {
						let position = positions[id]
						let widget = this.model.widgets[id];
						if (widget) {
							widget.x = position.x
							widget.y = position.y
							widget.w = position.w
							widget.h = position.h
						}
					}
				}

				this.onModelChanged([{type: 'screen', action:"change", id: screenID}])
			} else {
				console.warn('No ruler with id', rulerID)
			}
		}
	}

	undoScreenRulerUpdate(command) {
		this.modelScreenRulerUpdate(command.screen, command.rulerID, command.o);
		this.render();
	}

	redoScreenRulerUpdate (command) {
		this.modelScreenRulerUpdate(command.screen, command.rulerID, command.n);
		this.render();
	}

	/**********************************************************************
	 * Remove Ruler
	 **********************************************************************/

	removeScreenRuler (screenID, ruler) {
		this.logger.log(0,"removeScreenRuler", "enter > screen : " + screenID + " > " + ruler.type);
		var screen = this.model.screens[screenID];
		if(screen && screen.rulers) {
			var command = {
				timestamp : new Date().getTime(),
				type : "ScreenRulerRemove",
				ruler: ruler,
				screen : screenID
			};
			this.addCommand(command);
			this.modelScreenRulerRemove(screenID, ruler);
			return this.getInheredRulers(screen)
		} else {
			this.logger.error("removeScreenRuler", "enter > No screen : " + screenID + " > " + ruler.type);
		}
	}

	undoScreenRulerRemove (command) {
		this.modelScreenRulerAdd(command.screen, command.ruler);
		this.render();
	}

	redoScreenRulerRemove (command) {
		this.modelScreenRulerRemove(command.screen, command.ruler);
		this.render();
	}

 	/**********************************************************************
	 * Add Ruler
	 **********************************************************************/

	addScreenRuler (screenID, pos, type) {
		this.logger.log(0,"addScreenRuler", "enter > screen : " + screenID + " > " + pos.y);

		pos = this.getUnZoomedBox(pos, this.getZoomFactor());
		var screen = this.model.screens[screenID];

		if(screen){
			let v = 0
			if (type === 'y') {
				v = pos.y - screen.y
			} else {
				v = pos.x - screen.x
			}
			let ruler = {
				id: 'sg' + this.getUUID(),
				type: type,
				v: v
			}
			var command = {
				timestamp : new Date().getTime(),
				type : "ScreenRulerAdd",
				ruler : ruler,
				screen : screenID
			};
			this.addCommand(command);
			this.modelScreenRulerAdd(screenID, ruler);
			return this.getInheredRulers(screen)
		}
	}

	modelScreenRulerAdd (screenID, ruler) {
		var screen = this.model.screens[screenID];
		if (screen) {
			if (!screen.rulers) {
				screen.rulers = []
			}
			screen.rulers.push(ruler)
			this.onModelChanged([{type: 'screen', action:"change", id: screenID}])
		}
	}

	modelScreenRulerRemove(screenID, ruler) {
		var screen = this.model.screens[screenID];
		if (screen) {
			if (screen.rulers) {
				screen.rulers = screen.rulers
					.map(r =>  {
						if (r.id !== ruler.id) {
							return r
						}
						return null
					})
					.filter(r => r !== null)
			}
			this.onModelChanged([{type: 'screen', action:"change", id: screenID}])
		}
	}

	undoScreenRulerAdd (command){
		this.modelScreenRulerRemove(command.screen, command.ruler);
		this.render();
	}

	redoScreenRulerAdd (command){
		this.modelScreenRulerAdd(command.screen, command.ruler);
		this.render();
	}

	getInheredRulers (screen) {
		let result = []
        if (screen.rulers) {
            result = result.concat(screen.rulers)
        }
        let parents = Core.getMasterScreens(this.model, screen)
        parents.forEach(parent => {
			if (parent.rulers) {
				parent.rulers.forEach(ruler => {
					let copy = lang.clone(ruler);
					copy.inherited = ruler.id
					result.push(copy)
				})
			}
		})
		return result
	}

   	/**********************************************************************
	 * Screen Animation
	 **********************************************************************/

	setScreenAnimation (screenID, eventType, animation){
		this.logger.log(0,"setScreenAnimation", "enter > screen : " +screenID + " >" +eventType);
		var screen = this.model.screens[screenID];
		if(screen){

			var oldAnimation = this.getScreenAnimation(screen, eventType);
			var command = {
				timestamp : new Date().getTime(),
				type : "ScreenAnimation",
				o : oldAnimation,
				n : animation,
				eventType: eventType,
				screen : screenID
			};
			this.addCommand(command);
			this.modelScreenAnimation(screenID, eventType, animation);
		}
	}
	modelScreenAnimation (screenID, eventType, animation){
		var screen = this.model.screens[screenID];
		if(screen){

			if(!screen.animation){
					screen.animation = {};
			}
			screen.animation[eventType] = animation;
			this.onModelChanged([{type: 'screen', action:"change", id: screenID}])
		} else {
			this.logger.error("modelSetScreenAnimation", "No screen : " +screenID + " >" +eventType);
		}
	}

	undoScreenAnimation (command){
		this.modelScreenAnimation(command.screen, command.eventType, command.o);
	}

	redoScreenAnimation (command){
		this.modelScreenAnimation(command.screen, command.eventType, command.n);
	}

	/**********************************************************************
	 * Screen Size (Resiying)
	 **********************************************************************/
	setScreenSize (newScreenSize){
		this.logger.log(0,"setScreenSize", "enter > screen : " + newScreenSize.screenSize.w + "x" + newScreenSize.screenSize.h);


		var oldScreenSize =  {
			type : this.model.type,
			screenSize : {
				w : this.model.screenSize.w,
				h : this.model.screenSize.h
			}
		};
		var command = {
			timestamp : new Date().getTime(),
			type : "ScreenSize",
			o : oldScreenSize,
			n : newScreenSize
		};

		this.addCommand(command);

		/**
		 * do the model update
		 */
		this.modelScreenSize(newScreenSize, false);
	}

	modelScreenSize (value, updateWidgets){
		var oldMinHeight = this.model.screenSize.h;

		for(var id in this.model.screens){
			var screen = this.model.screens[id];
			if(updateWidgets) {
				this.modelScreenSizeWidgets(screen, value.screenSize.w, value.screenSize.h, oldMinHeight)
			}
			screen.w = value.screenSize.w;
			screen.h = screen.h * (value.screenSize.h / oldMinHeight);
			screen.min.h = value.screenSize.h
			screen.min.w = value.screenSize.w
		}
		this.model.screenSize.w = value.screenSize.w;
		this.model.screenSize.h = value.screenSize.h;
		this.model.type = value.type;
		this.onModelChanged([]);
		this.render();
	}

	/**
	 * We simply scale...
	 * FIXME: This is super buggy!
	 */
	modelScreenSizeWidgets (screen, newW, newH) { // oldMinHeight
		var difX = screen.w / newW;
		var difY = screen.h / newH;

		for(var i=0; i < screen.children.length; i++){
			var widgetID = screen.children[i];

			var widget = this.model.widgets[widgetID];
			if(widget){
				var left = widget.x - screen.x;
				var top = widget.y - screen.y;
				widget.x = Math.round(widget.x -left + (left / difX))
				widget.y = Math.round(widget.y - top + (top / difY))
				widget.h = Math.round(widget.h / difY)
				widget.w = Math.round(widget.w / difX)
			}
		}
	}

	undoScreenSize (command){
		this.modelScreenSize(command.o, true);
	}


	redoScreenSize (command){
		this.modelScreenSize(command.n, true);
	}

	/**********************************************************************
	 * Screen
	 **********************************************************************/


	setScreenName (id, value) {
		if (value === '') {
			this.logger.warn("setScreenName", "exit > EMPTY name: " + id);
			return
		}

		const screen = this.model.screens[id];
		if(screen && screen.name!= value){
			this.logger.log(0,"setScreenName", "enter > screen.id : " + id + " > "+ value);
			const command = {
				timestamp : new Date().getTime(),
				type : "ScreenName",
				o :screen.name,
				n : value,
				modelId : id
			};
			this.addCommand(command);

			/**
			 * do the model update
			 */
			this.modelScreenName(id, value);

			this.renderScreen(screen);
		}
	}

	modelScreenName (id, value){
		var screen = this.model.screens[id];
		if(screen){
			screen.name = value;
			this.onModelChanged([{type: 'screen', action:"change", id: id}])
			this.onScreenNameChange(screen)
		}
	}

	undoScreenName (command){
		this.modelScreenName(command.modelId, command.o);
	}

	redoScreenName (command){
		this.modelScreenName(command.modelId, command.n);
	}

	updateScreenPosition (id, pos, isMove = false){
		this.logger.log(-1,"updateScreenPosition", "enter > screen.id : " + id + " > isMove: "+ isMove);

		pos = this.getUnZoomedBox(pos, this.getZoomFactor());

		const screen = this.model.screens[id];
		if (screen) {

			/**
			 * Resizing might cause the stupid 1px bug. If we do not move,
			 * we keep x and y stable
			 */
			if (!isMove) {
				pos.x = screen.x
				pos.y = screen.y
			}

			/**
			 * zooming can make width or height to small.
			 * we correct that here
			 */
			if (!screen.segment) {
				/**
				 * Since 3.0.44 we will always enforce the width. Otherwise rounding issues
				 * can add a pixel :(
				 */
				if (pos.w) {
					pos.w = this.model.screenSize.w;
				}
				if (pos.h) {
					pos.h = Math.max(pos.h,this.model.screenSize.h);
				}
			} else {
				this.logger.log(0,"updateScreenPosition", "segement > screen.id : " + id + " > do not enforce min: ");
			}

			if(pos.x < 0){
				pos.x = Math.abs(pos.x);
				console.warn("updateScreenPosition() > Something strange happened, pos.x < 0 ...");
			}

			if(pos.y < 0){
				pos.y = Math.abs(pos.y);
				console.warn("updateScreenPosition() > Something strange happened, pos.y < 0 ...");
			}

			/**
			 * create the command
			 */
			const delta = this.getDeltaBox(screen, pos);
			const command = {
				timestamp : new Date().getTime(),
				type : "ScreenPosition",
				delta :delta,
				modelId : id,
				updateChildren :isMove
			};
			this.addCommand(command);

			/**
			 * do the model update
			 */
			this.modelScreenUpdate(id, pos, isMove);
		}
	}

	updateScreenWidthAndHeight (id, pos) {
		this.logger.log(0,"updateScreenWidthAndHeight", "enter > screen.id : " + id + " > " +pos.w + "/"+pos.h);

		var screen = this.model.screens[id];

		/**
		 * zooming can make width or height to small.
		 * we correct that here
		 */
		if (!screen.segment) {
			if(pos.w){
				pos.w = Math.max(pos.w,this.model.screenSize.w);
			}
			if(pos.h){
				pos.h = Math.max(pos.h,this.model.screenSize.h);
			}
		}  else {
			this.logger.log(0,"updateScreenWidthAndHeight", "segement > screen.id : " + id + " > do not enforce min: ");
		}


		/**
		 * create the command
		 */
		var delta = this.getDeltaBox(screen, pos);
		var command = {
			timestamp : new Date().getTime(),
			type : "ScreenPosition",
			delta :delta,
			modelId : id,
			updateChildren :false
		};
		this.addCommand(command);

		/**
		 * do the model update
		 */
		this.modelScreenUpdate(id, pos, false);

		this.render();
	}

	modelScreenUpdate (id, pos, updateChildren){
		this.logger.log(-1,"modelScreenUpdate", "enter > id: " + id + " > updateChildren: " + updateChildren);

		let modified = new Date().getTime()
		var screen = this.model.screens[id];
		screen.modified = modified

		/**
		 * update all widgets too if there was
		 * a screen move and no resize!
		 */
		if (updateChildren){
			for (var i=0; i < screen.children.length; i++){
				var widgetID = screen.children[i];
				var widget = this.model.widgets[widgetID];
				widget.modified = modified
				if (widget){
					if (pos.x){
						widget.x -= (screen.x - pos.x);
					}
					if (pos.y){
						widget.y -= (screen.y - pos.y);
					}
				}
			}
		}

		/**
		 * update screen
		 */
		this.updateBox(pos, screen);
		this.onModelChanged([{type: 'screen', action:"change", id: id}])
	}

	undoScreenPosition (command){
		this.logger.log(3,"undoScreenPosition", "enter > " + command.id);
		this.modelScreenUpdate(command.modelId, command.delta.o, command.updateChildren);
		this.render();
	}

	redoScreenPosition (command){
		this.logger.log(3,"redoScreenPosition", "enter > " + command.id);
		this.modelScreenUpdate(command.modelId, command.delta.n, command.updateChildren);
		this.render();
	}

	/**********************************************************************
	 * Screen setScreenSegemnt
	 **********************************************************************/


	setScreenSegment (id, isSegment) {
		this.logger.log(-1, "setScreenSegment", "enter > " + id + " > " +  isSegment);

		var screen = this.model.screens[id];
		var command = {
			timestamp : new Date().getTime(),
			type : "ScreenSegement",
			delta : {
				o : screen.segment,
				n : isSegment
			},
			modelId : id
		};
		this.addCommand(command);
		this.modelScreenSegement(id, isSegment);
		this.onModelChanged([{type: 'screen', action:"change", id: id}])
		this.render();
	}

	modelScreenSegement (id, isSegment) {

		var screen = this.model.screens[id];
		if (screen) {
			screen.segment = isSegment
			if (isSegment) {
				screen.min.w = -1
				screen.min.h = -1
			} else {
				screen.min.w = this.model.screenSize.w
				screen.min.h = this.model.screenSize.h
			}
		}

	}

	undoScreenSegement (command){
		this.logger.log(3,"undoScreenSegement", "enter > " + command.id);
		this.modelScreenSegement(command.modelId, command.o);
		this.render();
	}

	redoScreenSegement (command){
		this.logger.log(3,"undoScreenSegement", "enter > " + command.id);
		this.modelScreenSegement(command.modelId, command.n);
		this.render();
	}


	/**********************************************************************
	 * Screen Parent
	 **********************************************************************/

	setScreenParent (id, parents){
		this.logger.log(0,"setScreenParent", "enter > " + id + " > " +  parents.length);



		var screen = this.model.screens[id];
		var command = {
			timestamp : new Date().getTime(),
			type : "ScreenParent",
			delta : {
				o : screen.parents,
				n : parents
			},
			modelId : id
		};
		this.addCommand(command);
		this.modelScreenParentUpdate(id, parents);


	}

	modelScreenParentUpdate (id, parents){

		var screen = this.model.screens[id];
		if(screen){
			screen.parents = parents;
		}else {
			console.debug("Could not update screen properties");
		}

		this.onModelChanged([])
		this.render();
	}

	undoScreenParent (command){
		this.logger.log(0,"undoScreenParent", "enter > " + command.id);
		this.modelScreenParentUpdate(command.modelId, command.delta.o);
	}

	redoScreenParent (command){
		this.logger.log(0,"undoScreenProperties", "enter > " + command.id);
		this.modelScreenParentUpdate(command.modelId, command.delta.n);
	}


	/**********************************************************************
	 * Screen props
	 **********************************************************************/
	updateScreenProperties (id, props, type){
		this.logger.log(0,"updateScreenProperties", "enter > " + props);

		var screen = this.model.screens[id];
		var delta = this.getDelta(screen[type], props);
		var command = {
			timestamp : new Date().getTime(),
			type : "ScreenProperties",
			delta :delta,
			modelId : id,
			element : type
		};
		this.addCommand(command);
		this.modelScreenPropertiesUpdate(id, props, type);
		if(type == "style"){
			this.renderScreen(screen);
		}
	}

	modelScreenPropertiesUpdate (id, props, type){
		var screen = this.model.screens[id];
		if(screen){
			for(var p in props){
				screen[type][p] = props[p];
			}
			screen.modified = new Date().getTime()
		}else {
			console.debug("Could not update screen properties");
		}
		this.onModelChanged([{type: 'screen', action:"change", id: id}])
	}


	undoScreenProperties (command){
		this.logger.log(3,"undoScreenProperties", "enter > " + command.id);
		this.modelScreenPropertiesUpdate(command.modelId, command.delta.o, command.element);
		this.render();
	}

	redoScreenProperties (command){
		this.logger.log(3,"redoScreenProperties", "enter > " + command.id);
		this.modelScreenPropertiesUpdate(command.modelId, command.delta.n, command.element);
		this.render();
	}


	/**********************************************************************
	 * Start Screen
	 **********************************************************************/

	updateScreenStart (id, props){
		this.logger.log(0,"updateScreenStart", "enter > " + id);


		/**
		 * make command
		 */
		var delta = {
			n : id,
			v : props.start
		};
		var oldStart = this.getStartScreen();
		if(oldStart){
			delta.o = oldStart.id;
		}

		var command = {
			timestamp : new Date().getTime(),
			type : "ScreenStart",
			delta :delta,
			modelId : id
		};

		this.addCommand(command);
		this.modelScreenStartUpdate(id, props.start);
	}

	modelScreenStartUpdate (id,start){
		this.logger.log(3,"modelScreenStartUpdate", "enter > " + id + " > " + start);

		if(start===true && this.model.screens[id]){
			for(let s in this.model.screens){
				let screen = this.model.screens[s];
				screen.props.start = false;
			}
		}

		// make new screen start
		let screen = this.model.screens[id];
		if(screen){
			screen.props.start = start;
		}

		// do some validation
		let startScreen = this.getStartScreen();
		if(!startScreen){
			this.showError("No Start screen is selected!");
		}

		this.onModelChanged([{type: 'screen', action:"change", id: id}])
	}

	undoScreenStart (command){
		this.logger.log(2,"undoScreenStart", "enter > " + command.id);
		this.modelScreenStartUpdate(command.delta.o, true);
		this.render();
	}

	redoScreenStart (command){
		this.logger.log(2,"redoScreenStart", "enter > " + command.id);
		this.modelScreenStartUpdate(command.delta.n, command.delta.v);
		this.render();
	}

	/**********************************************************************
	 * Add Multi Screen
	 **********************************************************************/

	addMultiScreens (screens, fitToBackground){
		this.logger.log(0,"addMultiScreens", "enter > " + fitToBackground);

		var command = {
			timestamp : new Date().getTime(),
			type : "MultiCommand",
			label : "AddMultiScreens",
			children :[]
		};

		var screenCount = this.countProps(this.model.screens);

		for(var i=0; i< screens.length; i++){
			/**
			 * Set id
			 */
			var screen = screens[i];
			var pos = screen;

			screen.id = "s"+this.getUUID();
			screen.x =  pos.x;
			screen.y =  pos.y;
			screen.h = this.model.screenSize.h;
			screen.w = this.model.screenSize.w;
			screen.min = {
				w : this.model.screenSize.w,
				h : this.model.screenSize.h
			};
			screen.props = {};
			screen.has = {image:true}
			screen.children = [];

			if(fitToBackground){
				var img = screen.style.backgroundImage;
				var scaleRatio = img.w / screen.w;
				var scalledHeight = img.h / scaleRatio;
				if(scalledHeight > screen.h){
					var ratio = img.h/ img.w;
					screen.h = screen.w * ratio;
				} else {
					/**
					 * The image is short. should we some how get the color
					 * of the last line and set the background color?
					 */
				}

			}

			if(screenCount== 0){
				screen.props.start=true;
				screenCount=1;
			}

			/**
			 * Create Child Command
			 */
			var child = {
				timestamp : new Date().getTime(),
				type : "AddScreen",
				model : screen
			};
			command.children.push(child);

			/**
			 * update model
			 */
			this.modelAddScreen(screen);


		}
		this.addCommand(command);
		this.render();
	}

	/**********************************************************************
	 * Sketch Update
	 **********************************************************************/

	isSketchUpdate (update){
		this.logger.log(2,"isSketchUpdate", "enter > ");

		var isSketchUpdate = false;

		var widgets = update.widgets;
		var importedWidgets = this.getImportedWidget(this.model);
		for(var widgetID in widgets){
			var widget = widgets[widgetID];
			if(widget.imported){
				if(importedWidgets[widget.imported]){
					isSketchUpdate = true;
				}
			}
		}

		var screens = update.screens;
		var importedScreens = this.getImportedScreens(this.model);
		for(var screenID in screens){
			var screen = screens[screenID];
			if(screen.imported){
				if(importedScreens[screen.imported]){
					isSketchUpdate = true;
				}
			}
		}

		return isSketchUpdate;
	}

	getImportedWidget (model){
		var result= {};
		for(var widgetID in model.widgets){
			var widget = model.widgets[widgetID];
			if(widget.imported){
				result[widget.imported] = widget;
			}
		}
		return result;
	}

	getImportedScreens (model){
		var result= {};
		for(var screenID in model.screens){
			var screen = model.screens[screenID];
			if(screen.imported){
				result[screen.imported] = screen;
			}
		}
		return result;
	}

	getImportedGroups (model){
		var result= {};
		for(var id in model.groups){
			var group = model.groups[id];
			if(group.import){
				result[group.import] = group;
			}
			if(group.imported){
				result[group.imported] = group;
			}
		}
		return result;
	}

	updateScreensAndWidgets (result){
		this.logger.log(0,"updateScreensAndWidgets", "enter > ");

		var importedWidgets = this.getImportedWidget(this.model);
		var importedScreens = this.getImportedScreens(this.model);
		var importedGroups = this.getImportedGroups(this.model);

		var updateWidgets = {};
		var oldWidgets = {};

		var updateScreens = {};
		var oldScreens = {};

		var updateGroups = {};
		var oldGroups = {};

		/**
		 * 1) Create the screens and widgets as before
		 */
		var app = this._createScreenAndWidgets(result);

		/**
		 * 2) now we filter all existing screens, but update the
		 * position of the children!
		 */
		for(let screenID in app.screens){
			let newScreen = app.screens[screenID];
			newScreen._newChildren = [];
			let oldScreen = importedScreens[newScreen.imported];
			if(oldScreen){

				let difX = oldScreen.x - newScreen.x;
				let difY = oldScreen.y - newScreen.y;
				let newChildren = newScreen.children;
				for(let i=0; i< newChildren.length; i++){
					let newChildID = newChildren[i];
					let newChild = app.widgets[newChildID];
					newChild.x += difX;
					newChild.y += difY;

					/**
					 * Check if we have to add to the new screen to the old parent
					 */
					var oldWidget = importedWidgets[newChild.imported];
					if(!oldWidget){
						newScreen._newChildren.push(newChild.id);
					}
				}

				updateScreens[oldScreen.id] = newScreen;
				oldScreens[oldScreen.id] = lang.clone(oldScreen);
				delete app.screens[screenID];
			}
		}

		/**
		 * 3) now we filter out all widget the have to be updates
		 */
		var widgetReplacements = {};
		for(let widgetID in app.widgets){
			let newWidget = app.widgets[widgetID];
			let oldWidget = importedWidgets[newWidget.imported];
			if(oldWidget){
				updateWidgets[oldWidget.id] = newWidget;
				oldWidgets[oldWidget.id] = lang.clone(oldWidget);
				widgetReplacements[newWidget.id] = oldWidget.id;
				delete app.widgets[widgetID];
			}
		}


		/**
		 * 4) now we filter out all widget the have to be updates
		 */
		for(let groupID in app.groups){
			let newGroup = app.groups[groupID];
			console.debug("newGroup", newGroup.id, importedGroups[newGroup.imported]);

			/**
			 * 4a) Fix old widgets
			 */
			let newChildren = [];
			var children = newGroup.children;
			var l = children.length;
			for(var i=0; i< l; i++){
				var newChildId = children[i];
				var oldChildId = widgetReplacements[newChildId];
				if(oldChildId){

					newChildren.push(oldChildId);
				} else {
					newChildren.push(newChildId);
				}
			}
			newGroup.children = newChildren;

			/**
			 * 4b) update old groups
			 */
			var oldGroup = importedGroups[newGroup.imported];
			if(oldGroup){
				updateGroups[oldGroup.id] = newGroup;
				oldGroups[oldGroup.id] = lang.clone(oldGroup);
				delete app.groups[groupID];
			}


		}

		/**
		 * 5) add new stuff create the command
		 */
		var command = {
			timestamp : new Date().getTime(),
			type : "AddAndUpdateScreenAndWidgets",
			app : app,
			oldWidgets:oldWidgets,
			updateWidgets : updateWidgets,
			updateScreens:updateScreens,
			oldScreens : oldScreens,
			updateGroups: updateGroups,
			oldGroups: oldGroups
		};

		this.addCommand(command);

		this.modelAddAndUpdateScreenAndWidgets(app, updateWidgets,updateScreens,updateGroups );

		this.render();
	}

	modelAddAndUpdateScreenAndWidgets (app, updateWidgets,updateScreens, updateGroups ){

		for(let screenID in updateScreens){
			let newScreen = updateScreens[screenID];
			let oldScreen = this.model.screens[screenID];
			if(oldScreen){
				oldScreen.w = newScreen.w;
				oldScreen.h = newScreen.h;
				oldScreen.style = newScreen.style;
				// var newChildren = newScreen._newChildren;
				oldScreen.children = oldScreen.children.concat(newScreen._newChildren);
			} else {
				console.warn("modelAddAndUpdateScreenAndWidgets() > no old screen");
			}
		}

		for(let widgetID in updateWidgets){
			let newWidget = updateWidgets[widgetID];
			let oldWidget = this.model.widgets[widgetID];
			if(oldWidget){
				oldWidget.x = newWidget.x;
				oldWidget.y = newWidget.y;
				oldWidget.w = newWidget.w;
				oldWidget.h = newWidget.h;
				oldWidget.style = newWidget.style;
			} else {
				console.warn("modelAddAndUpdateScreenAndWidgets() > no old screen");
			}
		}


		if(updateGroups){
			for(let id in updateGroups){
				let newGroup = updateGroups[id];
				let oldGroup = this.model.groups[id];
				if(oldGroup){
					oldGroup.children = newGroup.children;
				}
			}
		}

		this.modelAddScreenAndWidgets(app);
	}

	modelRemoveAndResetScreenAndWidgets (app, oldWidgets,oldScreens, oldGroups){

		for(let id in oldWidgets){
			this.model.widgets[id] = oldWidgets[id];
		}

		for(let id in oldScreens){
			this.model.screens[id] = oldScreens[id];
		}

		if(oldGroups){
			for(let id in oldGroups){
				this.model.groups[id] = oldGroups[id];
			}
		}

		this.modelRemoveScreenAndWidgets(app);
	}


	undoAddAndUpdateScreenAndWidgets (command){
		this.modelRemoveAndResetScreenAndWidgets(command.app, command.oldWidgets, command.oldScreens, command.oldGroups);
		this.render();
	}


	redoAddAndUpdateScreenAndWidgets (command){
		this.modelAddAndUpdateScreenAndWidgets(command.app, command.updateWidgets, command.updateScreens, command.updateGroups);
		this.render();
	}

	/**********************************************************************
	 * Add Screens and Widgets
	 **********************************************************************/

	addScreensAndWidgets (result, pos){
		this.logger.log(-1,"addScreensAndWidgets", "enter > ", pos);

		var app = this._createScreenAndWidgets(result);

		if (pos) {
			this.logger.log(-1,"addScreensAndWidgets", "fix position", pos);
			pos = this.getUnZoomedBox(pos, this.getZoomFactor());
			if (app.screens) {
				Object.values(app.screens).forEach(screen => {
					screen.x += pos.x
					screen.y += pos.y
					console.debug('fix', screen.name, screen.x, screen.y)
					return screen
				})
			}
			if (app.widgets) {
				Object.values(app.widgets).forEach(widget => {
					widget.x += pos.x
					widget.y += pos.y
					return widget
				})
			}
		}

		/**
		 * create the command
		 */
		var command = {
			timestamp : new Date().getTime(),
			type : "AddScreenAndWidgets",
			model : app
		};
		this.addCommand(command);

		this.modelAddScreenAndWidgets(app);

		this.render();
	}


	_createScreenAndWidgets (result){

		let screens = result.screens;
		let widgets = result.widgets;
		let groups = result.groups;
		let lines = result.lines;
		let startScreen = this.getStartScreen();

		if(!startScreen){
			for(var screenID in screens){
				screens[screenID].props.start=true;
				break;
			}
		}

		let tempWidgets = {};
		let widgetIdMapping = {};
		let z = this.getMaxZValue(this.model.widgets) + 1;
		let i = 0;
		for (let widgetID in widgets){
			let widget = widgets[widgetID];
			let newID = "w"+this.getUUID();
			widget.id = newID;
			widget.z = z + 1 + i
			tempWidgets[newID] = widget;
			widgetIdMapping[widgetID] = newID;
			i++
		}


		var tempScreens = {};
		var screenIdMapping = {};
		for(let screenID in screens){
			let screen = screens[screenID];
		
			let newID = "s"+this.getUUID();
			screen.id = newID;
			tempScreens[newID] = screen;
			screenIdMapping[screenID] = newID

			var tempChildren = [];
			for(let i =0; i< screen.children.length; i++){
				let oldChildID = screen.children[i];
				if(widgetIdMapping[oldChildID]){
					tempChildren.push(widgetIdMapping[oldChildID]);
				} else {
					console.error("Wooop Woopp. Cannot map old child to screen", oldChildID);
				}
			}
			screen.children = tempChildren;
		}

		var tempGroup = {};
		var groupedChildren = {};
		for(let groupID in groups){
			let group = groups[groupID];

			if(group.children.length > 1){
				let newID = "g"+this.getUUID();
				group.id = newID;
				tempGroup[newID] = group;
				let tempChildren = [];
				for(let i =0; i< group.children.length; i++){
					let oldChildID = group.children[i];
					if(widgetIdMapping[oldChildID]){
						let newChildID = widgetIdMapping[oldChildID];
						if(!groupedChildren[newChildID]){
							tempChildren.push(newChildID);
						}
						groupedChildren[newChildID] = true;
					} else {
						// can happen for nested groups
						//console.error("Mooop Moopp", oldChildID, widgetIdMapping);
					}
				}
				group.children = tempChildren;
			}
		}

		var tempLines = {}
		for(let lineID in lines){
			let line = lines[lineID];
			if (line.from && line.to) {
				if (widgetIdMapping[line.from] && screenIdMapping[line.to]) {
					line.from = widgetIdMapping[line.from]
					line.to = screenIdMapping[line.to]
					line.id = "l"+this.getUUID();
					tempLines[line.id] = line
					console.debug('ADD LINE' , line)
				} else {
					console.error("Wooop Woopp, cannot map line", line);
				}
			} else {
				console.error("Waap, Waap - Line is not correct", line);
			}
		}


		var app = {
			screens: tempScreens,
			widgets: tempWidgets,
			groups: tempGroup,
			lines: tempLines
		};

		return app;
	}

	modelAddScreenAndWidgets (app){


		if(app.screens){
			let screens = app.screens;
			for(let id in screens){
				if(!this.model.screens[id] ){
					this.model.screens[id] = screens[id];
				} else {
					console.warn("modelAddScreenAndWidgets() > Duplicate screen id!!", id)
				}
			}
		}

		if(app.widgets){
			let widgets = app.widgets;
			for(let id in widgets){
				if(!this.model.widgets[id] ){
					this.model.widgets[id] = widgets[id];
				} else {
					console.warn("modelAddScreenAndWidgets() > Duplicate widget id!!", id)
				}
			}
		}

		/**
		 * Since 3.0.15 we add also lines (liek from Figma)
		 */
		if(app.lines){
			let lines = app.lines;
			for(let id in lines){
				if(!this.model.lines[id] ){
					this.model.lines[id] = lines[id];
				} else {
					console.warn("modelAddScreenAndWidgets() > Duplicate line id!", id)
				}
			}
		}

		if(app.groups){
			if(!this.model.groups){
				this.model.groups = {};
			}
			let groups = app.groups;
			for(let id in groups){
				if(!this.model.groups[id] ){
					this.model.groups[id] = groups[id];
				} else {
					console.warn("modelAddScreenAndWidgets() > Duplicate groups id!!", id)
				}
			}
		}

		this.onModelChanged([])
	}


	modelRemoveScreenAndWidgets (app){

		if(app.screens){
			var screens = app.screens;
			for(let id in screens){
				delete this.model.screens[id];
			}
		}

		if(app.widgets){
			let widgets = app.widgets;
			for(let id in widgets){
				delete this.model.widgets[id];
			}
		}

		if(app.lines){
			let lines = app.lines;
			for(let id in lines){
				delete this.model.lines[id];
			}
		}

		if(app.groups){
			let groups = app.groups;
			for(let id in groups){
				delete this.model.groups[id];
			}
		}

		this.onModelChanged([]);
	}


	undoAddScreenAndWidgets (command){
		this.logger.log(3,"undoScreenAndWidgets", "enter > " + command.id);
		var app = command.model;
		this.modelRemoveScreenAndWidgets(app);
		this.render();
	}

	redoAddScreenAndWidgets (command){
		this.logger.log(3,"redoAddScreenAndWidgets", "enter > " + command.id);
		var app = command.model;
		this.modelAddScreenAndWidgets(app);
		this.render();
	}




	/**********************************************************************
	 * Add Screen
	 **********************************************************************/

	addScreen (screen, pos){

		pos = this.getUnZoomedBox(pos, this.getZoomFactor());

		screen.id = "s"+this.getUUID();
		screen.x =  pos.x;
		screen.y =  pos.y;
		screen.min = {
				w : this.model.screenSize.w,
				h : this.model.screenSize.h
		};

		var count =  Object.keys(this.model.screens).length

		screen.name ="Screen " + count;

		/**
		 * Set as start screen if we it is the first screen
		 */
		if(count===0){
			this.logger.log(0,"addScreen", "Set Start Screen");
			screen.props.start=true;
			screen.name = "Screen";
		}


		/**
		 * create the command
		 */
		var command = {
			timestamp : new Date().getTime(),
			type : "AddScreen",
			model : screen
		};
		this.addCommand(command);

		/**
		 * update model
		 */
		this.modelAddScreen(screen);



		return screen;
	}

	modelAddScreen (screen){

		if(!this.model.screens[screen.id] ){
			this.model.screens[screen.id] = screen;
			this.onElementCreated(screen)
			this.onModelChanged([])
			this.render();
		} else {
			console.warn("Could not add screen", screen);
		}
	}


	modelRemoveScreen (screen){
		if(this.model.screens[screen.id]){
			delete this.model.screens[screen.id];
			this.onModelChanged([])
			this.render();
		} else {
			console.warn("Could not delete screen");
		}
	}


	undoAddScreen (command){
		this.logger.log(3,"undoAddScreen", "enter > " + command.id);
		var screen = command.model;
		this.modelRemoveScreen(screen);
	}

	redoAddScreen (command){
		this.logger.log(3,"redoAddScreen", "enter > " + command.id);
		var screen = command.model;
		this.modelAddScreen(screen);
	}

	/**********************************************************************
	 * Screen remove
	 **********************************************************************/

	removeScreen (id){
		this.logger.log(3,"removeScreen", "enter > " +id);

		var screen = this.model.screens[id];

		var lines = this.getLines(screen, true);

		var widgets = this.getModelChildren(screen);

		var groups = this.getGroupsForWidgets(widgets);

		var command = {
				timestamp : new Date().getTime(),
				type : "RemoveScreen",
				screen :screen,
				lines : lines,
				groups : groups,
				widgets : widgets,
				modelId : id
		};
		this.addCommand(command);
		this.unSelect();
		this.modelRemoveScreenAndWidgetAndLines(screen, widgets, lines, groups);
		this.render();
	}


	modelRemoveScreenAndWidgetAndLines (screen, widgets, lines, groups){

		if(this.model.screens[screen.id]){
			delete this.model.screens[screen.id];
			if(widgets){
				for(let i=0; i < widgets.length; i++){
					let widget = widgets[i];
					delete this.model.widgets[widget.id];
				}
			}

			if(lines){
				for(let i=0; i < lines.length; i++){
					let line = lines[i];
					delete this.model.lines[line.id];
				}
			}

			if(groups){
				for(let i=0; i < groups.length; i++){
					let group = groups[i];
					delete this.model.groups[group.id];
				}
			}
			this.onModelChanged([]);
			return true;
		} else {
			console.warn("Could not delete widget and lines", screen);
		}
	}


	modelAddScreenAndWidgetsAndLines (screen, widgets, lines, groups){

		if(!this.model.screens[screen.id] ){
			this.model.screens[screen.id] = screen;
			this.onElementCreated(screen)
		} else {
			console.warn("Could not add screen because id exists!", screen);
		}

		if(widgets){
			for(let i=0; i < widgets.length; i++){
				let widget = widgets[i];
				if(!this.model.widgets[widget.id]){
					this.model.widgets[widget.id] = widget;
					this.onElementCreated(widget)
				} else {
					console.warn("Could not add widget", widget);
				}
			}
		}

		if(lines){
			for(let i=0; i < lines.length; i++){
				let line = lines[i];
				if(!this.model.lines[line.id]){
					this.model.lines[line.id] = line;
				} else {
					console.warn("Could not add widget", line);
				}
			}
		}

		if(groups){
			for(let i=0; i < groups.length; i++){
				let group = groups[i];
				if(!this.model.groups[group.id]){
					this.model.groups[group.id] = group;
				} else {
					console.warn("Could not add group", i, group);
				}
			}
		}

		this.onModelChanged([]);
		return true;
	}

	getGroupsForWidgets (widgets){
		var result = [];
		var addedGroupIds = {};
		for(var i = 0; i< widgets.length; i++){
			var group = this.getParentGroup(widgets[i].id);
			if(group){
				if(!addedGroupIds[group.id]){
					result.push(group);
					addedGroupIds[group.id] = true;
				}
			}
		}
		return result;
	}

	undoRemoveScreen (command){
		this.modelAddScreenAndWidgetsAndLines(command.screen, command.widgets, command.lines, command.groups);
		this.render();
	}

	redoRemoveScreen (command){
		this.modelRemoveScreenAndWidgetAndLines(command.screen, command.widgets, command.lines, command.groups);
		this.render();
	}


	/**********************************************************************
	 * Import app
	 **********************************************************************/

	 importApp (importModel, pos){
		this.logger.log(-1,"importApp", "enter > ", pos);

		let changes = ImportUtil.mergeModel(this.model, importModel, pos)
		var command = {
				timestamp : new Date().getTime(),
				type : "ImportApp",
				changes: changes
		};

		this.addCommand(command);
		this.onModelChanged(changes);
		this.render();
	}

	modelRemoveImportedChanges (changes) {

		changes.forEach(change => {
			if (change.type === 'widget') {
				if (this.model.widgets[change.id]) {
					delete this.model.widgets[change.id]
				} else {
					this.logger.log(-1,"modelRemoveImportedChanges", "Error > cannot undo", change);
				}
			}

			if (change.type === 'line') {
				if (this.model.lines[change.id]) {
					delete this.model.lines[change.id]
				} else {
					this.logger.log(-1,"modelRemoveImportedChanges", "Error > cannot undo", change);
				}
			}


			if (change.type === 'screen') {
				if (this.model.screens[change.id]) {
					delete this.model.screens[change.id]
				} else {
					this.logger.log(-1,"modelRemoveImportedChanges", "Error > cannot undo", change);
				}
			}


			if (change.type === 'group' && this.model.groups) {
				if (this.model.groups[change.id]) {
					delete this.model.groups[change.id]
				} else {
					this.logger.log(-1,"modelRemoveImportedChanges", "Error > cannot undo", change);
				}
			}

			if (change.type === 'template' && this.model.templates) {
				if (this.model.templates[change.id]) {
					delete this.model.templates[change.id]
				} else {
					this.logger.log(-1,"modelRemoveImportedChanges", "Error > cannot undo", change);
				}
			}
		})

		this.onModelChanged([]);
	}

	undoImportApp (command){
		this.logger.log(-1,"undoImportApp", "enter > ", command);
		this.modelRemoveImportedChanges(command.changes)

		this.render();
	}

	redoImportApp (){
	}


}