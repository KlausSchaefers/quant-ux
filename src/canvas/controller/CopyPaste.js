
import Group from './Group'
import lang from '../../dojo/_base/lang'

export default class CopyPaste extends Group{

	constructor () {
		super()
		this.borderPropsAttributes = ["borderBottom", "borderLeft", "borderRight", "borderTop"]

		this.borderStyleAttributes = ["borderColor", "borderWidth", "borderRadius", "borderTopWidth",
									  "borderBottomWidth", "borderLeftWidth", "borderRightWidth" ,
									  "borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius",
									  "borderBottomRightRadius", "borderTopColor", "borderBottomColor",
									  "borderRightColor", "borderLeftColor"]

		this.textStyleAttributes = ["color", "fontFamily", "fontSize", "line-height", "fontStyle",
									"fontWeight", "textAlign", "letter-spacing", "textShadow",
									"textDecoration", "verticalAlign" ]

		this.backStyleAttributes = ["background", "boxShadow" ,"opacity"]

		this.copyNullValues =  {"boxShadow": true}
	}

	replicateWidgets (ids, pos, selectedGroup, fromToolbar){
		this.logger.log(-1,"replicateWidgets", "enter > ");
		this.startModelChange()
		
		pos = this.correctPostion(ids, pos, fromToolbar);

		const cloneIds = this.modelAddClonedWidgets(ids, pos, selectedGroup)

		/**
		 * make command
		 */
		const command = {
			timestamp : new Date().getTime(),
			type : "WidgetReplicate",
			sourceIds: ids,
			sourcePos: pos,
			clonedIds: cloneIds,
			group: selectedGroup
		};

		this.addCommand(command);
		this.render();
		this.commitModelChange()
		return cloneIds;
	}

	modelAddClonedWidgets (ids, pos,selectedGroup, undoIds) {
		const clonedIds = {
			widgets: [],
			groups: [],
		};

		const targetScreen = this.getHoverScreen(pos);

		/**
		 * FIXME: copy the group stuff as well!
		 */
		let groups = []
		let changes = []
		let clonePos = this.getClones(ids, pos).clones;
		clonePos.sort((a,b) => a.z - b.z)
		let z = this.getMaxZValue(this.model.widgets)
		for (let i = 0; i < clonePos.length; i++) {
			const cPos = clonePos[i];
			console.debug(cPos)
			if(this.model.widgets[cPos.cloneOff]){
				const widget = this.model.widgets[cPos.cloneOff];

				const clonedWidget = this._copyWidget(widget, targetScreen);
				changes.push({type:"widget", action:'add', id: clonedWidget.id})

				/**
				 * In case of redo, we have to use the same ids, so
				 * undo works again...
				 */
				if (undoIds && undoIds[i]){
					clonedWidget.id = undoIds[i];
				} else {
					clonedWidget.id = "w"+this.getUUID();
				}
				clonedWidget.x =  cPos.x;
				clonedWidget.y =  cPos.y;
				clonedWidget.copyOf = widget.id;
				clonedWidget.z = z + 1 + i;
				delete clonedWidget.props.databinding;

				/**
				 * update model
				 */
				this.modelAddWidget(clonedWidget, true);

				clonedIds.widgets.push(clonedWidget.id)

				/**
				 * Check if we should create a group!
				 */
				if (selectedGroup){
					if (!groups[cPos.group]){
						let group = {
							id: "g" + this.getUUID(),
							copyOf : selectedGroup.id,
							name :  selectedGroup.name + "("  + cPos.group + ")",
							children: []
						}
						clonedIds.groups.push(group.id);
						this.modelAddGroup(group, true);
						groups[cPos.group] = group;
					}
					groups[cPos.group].children.push(clonedWidget.id)
				}

			} else {
				this.logger.error("modelAddClonedWidgets", "Error. No widget with id > " +cPos.cloneOff);
			}
		}

		this.onModelChanged(changes);
		return clonedIds;
	}

	modelRemoveClonedWidgets (ids) {
		var widgetIDs= ids.widgets;
		/**
		 * remove widgets
		 */
		let changes = []
		for(let i=0; i < widgetIDs.length; i++){
			let id = widgetIDs[i];
			if(this.model.widgets[id]){
				var widget = this.model.widgets[id];
				changes.push({type: 'widget', action: 'remove', id: id})
				delete this.model.widgets[id];
				this.cleanUpParent(widget);
			} else {
				console.warn("modelRemoveClonedWidgets() > Could not delete widget", id);
			}
		}
		/**
		 * remove groups
		 */
		var groupIDS = ids.groups;
		for(let i=0; i < groupIDS.length; i++){
			let id = groupIDS[i];
			if(this.model.groups && this.model.groups[id]){
				delete this.model.groups[id];
			} else {
				console.warn("modelRemoveClonedWidgets() > Could not delete groud", id);
			}
		}
		this.onModelChanged(changes);
	}

	undoWidgetReplicate (command){
		this.logger.log(3,"redoWidgetReplicate", "enter > " + command.id);
		this.modelRemoveClonedWidgets(command.clonedIds);
		this.unSelect();
		this.render();
	}

	redoWidgetReplicate (command){
		this.logger.log(3,"redoWidgetReplicate", "enter > " + command.id);
		this.modelAddClonedWidgets(command.sourceIds, command.sourcePos, command.group, command.clonedIds.widgets);
		this.render();
	}

	/**********************************************************************
	 * Clip Board
	 **********************************************************************/


	getClipBoard (){
		this.logger.log(5,"getClipBoard", "enter > ");
		if (typeof(Storage) !== "undefined") {
			var str = localStorage.getItem("mactCanvasClipBoard");
			return JSON.parse(str);
		}
		return null;
	}

	setClipBoard (selectWidget, selectedScreen, selectMulti, selectGroup) {
		let clipBoard = {
			id: this.model.id,
			widgets: [],
			screens: [],
			groups: [],
			designtokens: []
		};
		if (selectWidget) {

			clipBoard.widgets = [this.model.widgets[selectWidget.id]]

		} else if(selectedScreen) {

			clipBoard.screens = [this.model.screens[selectedScreen.id]];
			for(let i = 0; i < selectedScreen.children.length; i++){
				const id = selectedScreen.children[i];
				const widget = this.model.widgets[id];
				/**
				 * It can happen that there are master widgets. these shall not be copied
				 */
				if (widget) {
					clipBoard.widgets.push(this.model.widgets[id]);
				}
			}

		} else if (selectMulti) {

			for(let i = 0; i < selectMulti.length; i++){
				let id = selectMulti[i];
				clipBoard.widgets.push(this.model.widgets[id]);
			}

		} else if (selectGroup) {
			let groups = this.getAllChildGroups(selectGroup)
			groups.push(selectGroup)
			groups.forEach(group => {
				group = this.model.groups[group.id]
				clipBoard.groups.push(group)
				for(let i=0; i< group.children.length; i++){
					let id = group.children[i];
					clipBoard.widgets.push(this.model.widgets[id]);
				}
			})
		}

		/**
		 * also copy design tokens!
		 */
		if (this.model.designtokens) {
			const designtokenIdSet = new Set()
			clipBoard.widgets.forEach(w => {
				if (w.designtokens) {
					const designtokens = w.designtokens
					for (let key in designtokens) {
						const obj = designtokens[key]
						for (let prop in obj) {
							const designtokenId = obj[prop]
							designtokenIdSet.add(designtokenId)
						}
					}
				}
			})

			designtokenIdSet.forEach(id => {
				const dst = this.model.designtokens[id]
				clipBoard.designtokens.push(dst)
			})
			this.logger.log(-1, "_setCligBoard", `Copied ${designtokenIdSet.size} design tokens`);
		}


		/**
		 * Clone before we change the offset! Otherwise
		 * we fuckup the model!
		 */
		clipBoard = lang.clone(clipBoard)

		/**
		 * Also normalize the position in respect to the bounding box?
		 */
		let boxes = clipBoard.widgets.concat(clipBoard.screens)
		let boundingBox = this.getBoundingBoxByBoxes(boxes)

		clipBoard.widgets.forEach(widget => {
			widget.x = widget.x - boundingBox.x
			widget.y = widget.y - boundingBox.y
		})
		clipBoard.screens.forEach(screen => {
			screen.x = screen.x - boundingBox.x
			screen.y = screen.y - boundingBox.y
		})
		clipBoard.boundingBox = boundingBox


		if (typeof(Storage) !== "undefined") {
			localStorage.setItem("mactCanvasClipBoard", JSON.stringify(clipBoard));
		} else {
			this.logger.error("_setCligBoard", "No local storage");
		}
	}

	onPasteClipBoard (clipBoard, pos) {
		this.logger.log(2,"onPasteClipBoard", "enter > "+ pos);
		this.startModelChange()
		pos = this.getUnZoomedBox(pos, this._canvas.getZoomFactor());

		/**
		 * create new ids
		 */
		let idMapping = {}
		clipBoard.widgets.forEach(widget => {
			let id = "w" + this.getUUID()
			idMapping[widget.id] = id
			widget.id = id
			widget.x += pos.x
			widget.y += pos.y
			delete widget.isRootTemplate
			delete widget.isNewTemplateChild
		})
		clipBoard.screens.forEach(screen => {
			let id = "s" + this.getUUID()
			idMapping[screen.id] = id
			screen.id = id
			screen.name = this.getSceenName(screen.name)
			screen.x += pos.x
			screen.y += pos.y
			screen.children = screen.children.map(id => {
				if (idMapping[id]) {
					return idMapping[id]
				} else {
					console.error('onPasteClipBoard() > No id for screen child!')
				}
			})
			/**
			 * FIXME: Copy als screen groups
			 */
		})
		clipBoard.groups.forEach(group => {
			let id = "g" + this.getUUID()
			idMapping[group.id] = id
			group.id = id
			group.children = group.children.map(id => {
				if (idMapping[id]) {
					return idMapping[id]
				} else {
					console.error('onPasteClipBoard() > No id for group child!')
				}
			})
			if (group.groups) {
				group.groups = group.groups.map(id => {
					if (idMapping[id]) {
						return idMapping[id]
					} else {
						console.error('onPasteClipBoard() > No id for group sub group!')
					}
				})
			}
		})

		if (clipBoard.designtokens && this.model.designtokens) {
			this.logger.log(2,"onPasteClipBoard", "designtokens > before: "+ clipBoard.designtokens.length);
			clipBoard.designtokens = clipBoard.designtokens.filter(dst => {
				const current = this.model.designtokens[dst.id]
				return current === null || current === undefined
			})
			// IMPROVEMENT: 
			// 1) We could ask what the user if they want to replace
			// 2) We could also check for style duplicates and replace them in the 
			//    widget references

			this.logger.log(-2,"onPasteClipBoard", "designtokens > add new design tokens: "+ clipBoard.designtokens.length);
		}
		

		const command = {
			timestamp : new Date().getTime(),
			type : "PasteClipBoard",
			clipBoard: clipBoard
		};
		this.addCommand(command);
		this.modelPasteClipBoard(clipBoard)
		this.commitModelChange()
	}

	modelPasteClipBoard (clipBoard) {
		let hasScreen = clipBoard.screens.length > 0
		clipBoard.widgets.forEach(widget => {
			this.model.widgets[widget.id] = widget

			if (!hasScreen) {
				let parent = this.getHoverScreen(widget);
				if (parent) {
					parent.children.push(widget.id)
				}
			}
		})
		clipBoard.screens.forEach(screen => {
			this.model.screens[screen.id] = screen
		})
		clipBoard.groups.forEach(group => {
			if (!this.model.groups) {
				this.model.groups = {}
			}
			this.model.groups[group.id] = group
		})
		if (clipBoard.designtokens) {
			if (!this.model.designtokens) {
				this.model.designtokens = {}
			}
			clipBoard.designtokens.forEach(dst => {
				if (!this.model.designtokens[dst.id]) {
					this.model.designtokens[dst.id] = dst
				} else {
					this.logger.warn('modelPasteClipBoard', "Design token exists")
				}
			})
		}
		this.onModelChanged([]);
		this.render();
	}

	modelRemoveClipBoard (clipBoard) {
		clipBoard.widgets.forEach(widget => {
			delete this.model.widgets[widget.id]
			this.cleanUpParent(widget)
		})
		clipBoard.screens.forEach(screen => {
			delete this.model.screens[screen.id]
		})
		clipBoard.groups.forEach(group => {
			if (this.model.groups) {
				delete this.model.groups[group.id]
			}
		})
		if (clipBoard.designtokens && this.model.designtokens) {
			clipBoard.designtokens.forEach(dst => {
				delete this.model.designtokens[dst.id]
			})
		}
		this.onModelChanged([]);
		this.render();
	}


	undoPasteClipBoard (command) {
		this.logger.log(0,"undoPasteClipBoard", "enter > " + command.id);
		this.modelRemoveClipBoard(command.clipBoard)
	}

	redoPasteClipBoard (command) {
		this.logger.log(0,"redoPasteClipBoard", "enter > " + command.id);
		this.modelPasteClipBoard(command.clipBoard)
	}

	/**********************************************************************
	 * Copy Style
	 **********************************************************************/

	onCopyWidgetStyle (source, target){
		this.logger.log(0,"onCopyWidgetStyle", "enter > " + source + " > " + target);

		const from = this.getBoxById(source);
		const to = this.getBoxById(target);

		if(from && to){
			this.startModelChange()
			const isSameType = from.type == to.type;

			/**
			 * FIXME: Make style copy also work with templates!
			 */
			if(from.template || to.template){
				this.showError("Cannot copy style to templated elements!");
				return;
			}

			const fromStyle = from.style;
			const fromProps = from.props;

			const fromHover = from.hover;
			const fromError = from.error;
			const fromFocus = from.focus;

			const fromDesigntokens = from.designtokens

			/**
			 * First copy props, than copy styles
			 */
			const props = {};
			const style = {};
			if(isSameType || (from.has.backgroundColor && to.has.backgroundColor)){
				for(let i=0; i< this.backStyleAttributes.length; i++){
					let attr = this.backStyleAttributes[i];
					this._copyAttribute(fromStyle, style, attr);
				}
			}

			if(isSameType || (from.has.backgroundImage && to.has.backgroundImage)){
				this._copyAttribute(fromStyle, style, "backgroundImage");
				this._copyAttribute(fromStyle, style, "opacity");
			}

			if(isSameType || (from.has.padding && to.has.padding)){
				this._copyAttribute(fromStyle, style, "paddingTop");
				this._copyAttribute(fromStyle, style, "paddingBottom");
				this._copyAttribute(fromStyle, style, "paddingRight");
				this._copyAttribute(fromStyle, style, "paddingLeft");
			}


			if(isSameType || (from.has.border  && to.has.border)){
				for(let i=0; i< this.borderStyleAttributes.length; i++){
					const attr = this.borderStyleAttributes[i];
					this._copyAttribute(fromStyle, style, attr);
				}
				for(let i=0; i< this.borderPropsAttributes.length; i++){
					const attr = this.borderPropsAttributes[i];
					this._copyAttribute(fromProps, props, attr);
				}
			}

			if(isSameType || (from.has.label && to.has.label)){
				for(let i=0; i< this.textStyleAttributes.length; i++){
					let attr = this.textStyleAttributes[i];
					this._copyAttribute(fromStyle, style, attr);
				}
			}

			/**
			 * Now build one multi command to update props and style
			 */
			 const command = {
				timestamp : new Date().getTime(),
				type : "MultiCommand",
				label : "CopyWidgetStyle",
				children :[]
			};

			const styleCommand = this.createWidgetPropertiesCommand(target, style, "style");
			command.children.push(styleCommand);

			const propsCommand = this.createWidgetPropertiesCommand(target, props, "props");
			command.children.push(propsCommand);

			if(fromHover){

				const hover = lang.clone(fromHover);
				const hoverCommand = this.createWidgetPropertiesCommand(target,hover , "hover");
				command.children.push(hoverCommand);
				this.modelWidgetPropertiesUpdate(target, hover, "hover");
			}

			if(fromError){

				const error = lang.clone(fromError);
				const errorCommand = this.createWidgetPropertiesCommand(target,error , "error");
				command.children.push(errorCommand);
				this.modelWidgetPropertiesUpdate(target, error, "error");
			}

			if(fromFocus){

				const focus = lang.clone(fromFocus);
				const focusCommand = this.createWidgetPropertiesCommand(target,focus,  "focus");
				command.children.push(focusCommand);
				this.modelWidgetPropertiesUpdate(target, focus, "focus");
			}

			if (fromDesigntokens) {
				const designtokens = lang.clone(fromDesigntokens);
				const designtokensCommand = this.createWidgetPropertiesCommand(target,designtokens,  "designtokens");
				command.children.push(designtokensCommand);
				this.modelWidgetPropertiesUpdate(target, designtokens, "designtokens");
			}

			this.addCommand(command);

			this.modelWidgetPropertiesUpdate(target, style, "style");
			this.modelWidgetPropertiesUpdate(target, props, "props");

			this.renderWidget(to);
			this.commitModelChange(false, true)
		} else {
			this.logger.error("onCopyWidgetStyle", "Could not copy > " +source + " > " + target);
		}
	}

	_copyAttribute (from, to, attr){
		if(from[attr] != null){
			to[attr] = from[attr];
		} else if(this.copyNullValues[attr]){
			to[attr] = from[attr];
		}
	}


	onMultiCopyWidget (selection, pos){
		this.logger.log(-2,"onMultiCopyWidget", "enter > "+pos);
		this.startModelChange()

		pos = this.getUnZoomedBox(pos, this._canvas.getZoomFactor());
		var targetScreen = this.getHoverScreen(pos);

		/**
		 * get the most top right position in the selection
		 */
		var parentPos = this.getBoundingBox(selection);

		/**
		 * 2) create mutli command
		 */
		var command = {
			timestamp : new Date().getTime(),
			type : "MultiCommand",
			label : "MultiCopyWidget",
			children :[]
		};

		/**
		 * create already the grou
		 */
		var newSelection = [];

		/**
		 * 3) copy children and add off set to top children
		 */
		let zMax = this.getMaxZValue(this.model.widgets)
		let allChildren = this.sortChildren(selection)
		allChildren.forEach((widget, i) => {
			var id = widget.id

			var newWidget = this._copyWidget(widget, targetScreen);
			newWidget.id = "w"+this.getUUID();
			newWidget.z = zMax + 1 + i

			newWidget.x =  pos.x + (newWidget.x - parentPos.x);
			newWidget.y =  pos.y + (newWidget.y - parentPos.y);

			if (pos.newScreen){
				this.logger.log(1,"onMultiCopyWidget", "copy on new screen: " + id);
				var parentScreen = this.getParentScreen(widget)
				if (parentScreen) {
					newWidget.x =  targetScreen.x + (widget.x - parentScreen.x);
					newWidget.y =  targetScreen.y + (widget.y - parentScreen.y);
				} else {
					this.logger.error("onMultiCopyWidget", "Could not find new screen ", id, widget);
				}
			}
			newSelection.push(newWidget.id);

			/**
			 * create the command
			 */
			var child = {
				timestamp : new Date().getTime(),
				type : "CopyWidget",
				model : newWidget
			};
			command.children.push(child);

			/**
			 * update model
			 */
			this.modelAddWidget(newWidget);

		})


		this.addCommand(command);
		this.render();
		this.commitModelChange()
		return newSelection;
	}



	onCopyGroup (group, pos){
		this.logger.log(-1,"onCopyGroup", "enter > ", pos);
		this.startModelChange()
		pos = this.getUnZoomedBox(pos, this._canvas.getZoomFactor());

		/**
		 * get the most top right position in the selection
		 */
		const parentPos = this.getBoundingBox(group.children);
		const targetScreen = this.getHoverScreen(pos);

		/**
		 * 2) create mutli command
		 */
		const command = {
			timestamp : new Date().getTime(),
			type : "MultiCommand",
			label : "CopyGroup",
			children :[]
		};

		/**
		 * create already the grou
		 */
		const selection = [];
		const copyIds = {}
		/**
		 * 3) copy children and add off set to top children
		 *
		 * - Since 2.1.3 We have subgroup. The copy works
		 *   here because the Select class sets allChildren()!
		 *
		 * - Make sure we add in the correct Z order
		 */
		const zMax =  this.getMaxZValue(this.model.widgets)
		const allChildren = this.sortChildren(group.children)
		allChildren.forEach((widget, i) => {	
			const id = widget.id
			const newWidget = this._copyWidget(widget, targetScreen);
			newWidget.id = "w"+this.getUUID();
			newWidget.x =  pos.x + (newWidget.x - parentPos.x);
			newWidget.y =  pos.y + (newWidget.y - parentPos.y);
			if (pos.newScreen){
				this.logger.log(1,"onCopyGroup", "copy on new screen :" + id);
				const parentScreen = this.getParentScreen(widget)
				newWidget.x =  targetScreen.x + (widget.x - parentScreen.x);
				newWidget.y =  targetScreen.y + (widget.y - parentScreen.y);
			}
			newWidget.z = zMax + 1 + i;
			selection.push(newWidget.id);
			copyIds[id] = newWidget.id

			/**
			 * create the command
			 */
			 const child = {
				timestamp : new Date().getTime(),
				type : "CopyWidget",
				model : newWidget
			};
			command.children.push(child);

			/**
			 * update model
			 */
			this.modelAddWidget(newWidget);
		})

		/**
		 * 4) copy group
		 */
		const newGroup = this.createGroupCommands(group, copyIds, command, targetScreen)

		/**
		 * finally add command
		 */
		this.addCommand(command);

		/**
		 * render
		 */
		this.onGroupSelected(newGroup.id);
		this.render();
		this.commitModelChange()
		return newGroup;
	}


	createGroupCommands (group, copyIds, command, targetScreen) {

		/**
		 * First copy recursive down
		 */
		const subGroups = []
		if (group.groups) {
			group.groups.forEach(subGroupId => {
				let subGroup = this.model.groups[subGroupId]
				if (subGroup) {
					let subGroupCopy = this.createGroupCommands(subGroup, copyIds, command, targetScreen)
					subGroups.push(subGroupCopy.id)
				} else {
					this.logger.error("createGroupCommands", "could not find subgroup > " + subGroupId);
				}
			})
		}

		/**
		 * Now create real group
		 */
		let name = group.name;
		if (targetScreen){
			name = this.getGroupName(targetScreen.id, group.name)
		}
		const newGroup = {
			id : "g" + this.getUUID(),
			children : this.getGroupCopyChildren(group.id, copyIds),
			groups: subGroups,
			copyOf : group.id,
			template: group.template,
			name : name
		};

		const child = {
			timestamp : new Date().getTime(),
			type : "AddGroup",
			model : newGroup
		};
		command.children.push(child);
		this.modelAddGroup(newGroup);

		return newGroup;
	}

	getGroupCopyChildren (groupId, copyIds) {
		const group = this.model.groups[groupId]
		if (group) {
			return group.children.map(id => {
				return copyIds[id]
			}).filter(id => id !== undefined && id !== null)
		}
		console.error('CopyPaste.getGroupCopyChildren() > cannot find group', groupId)
		return []
	}

	/**********************************************************************
	 * Copy Widget
	 **********************************************************************/



	onCopyWidget (id, pos, isEnbaleInheritedWidget){
		this.logger.log(-1,"onCopyWidget", "enter > "+ id + " > "+pos.newScreen + "> " + isEnbaleInheritedWidget) ;


		const widget = this.model.widgets[id];

		if (widget) {
			this.startModelChange()
			pos = this.getUnZoomedBox(pos, this._canvas.getZoomFactor());
			const targetScreen = this.getHoverScreen(pos);
			// for copies to other screens, we take the position from the unzoomed model.
			if (pos.newScreen){
				const parentScreen = this.getParentScreen(widget);
				if (parentScreen && targetScreen) {
					pos.x = targetScreen.x + (widget.x - parentScreen.x)
					pos.y = targetScreen.y + (widget.y - parentScreen.y)
				}
			}

			const newWidget = this._copyWidget(widget, targetScreen);
			newWidget.id = "w"+this.getUUID();
			newWidget.z = this.getMaxZValue(this.model.widgets) + 1;
			newWidget.x =  pos.x;
			newWidget.y =  pos.y;
			newWidget.copyOf = widget.id;

			/**
			 * create the command
			 */
			 const command = {
				timestamp : new Date().getTime(),
				type : "CopyWidget",
				model : newWidget
			};
			this.addCommand(command);

			/**
			 * update model
			 */
			this.modelAddWidget(newWidget);
			this.render();
			this.commitModelChange()
			return newWidget;
		} else {
			console.warn("No Widget with id", id);
		}
	}



	undoCopyWidget (command){
		this.logger.log(3,"undoCopyWidget", "enter > " + command.id);
		const widget = command.model;
		this.modelRemoveWidget(widget);
		this.render();
	}
	redoCopyWidget (command){
		this.logger.log(3,"redoCopyWidget", "enter > " + command.id);
		const widget = command.model;
		this.modelAddWidget(widget);
		this.render();
	}

	_copyWidget (w, targetScreen){
		this.logger.log(3,"_copyWidget", "enter > ", targetScreen);
		if (!targetScreen){
			console.debug("_copyWidget() > No screen");
			targetScreen = this.getHoverScreen(w);
		}
		const copy = lang.clone(w);
		copy.copyOf = w.id;
		delete copy.isRootTemplate
		delete copy.isNewTemplateChild
		if (targetScreen) {
			copy.name = this.getWidgetName(targetScreen.id, w.name)
		}

		/**
		 * Clean up references here
		 *
		 * 1) errorLabels
		 *
		 * 2) Animation references...
		 *
		 * 3) give a name??
		 */
		if(copy.props.validation){
			delete copy.props.validation.errorLabels;
		}

		if(copy.children){
			copy.children = [];
		}

		if(copy.props.refs){
			delete copy.props.refs;
		}

		return copy;
	}

	/**********************************************************************
	 * Copy Widget
	 **********************************************************************/

	onCopyScreen (id, pos){
		this.logger.log(0,"onCopyScreen", "enter > "+ id + " "+pos);

		const screen = this.model.screens[id];

		if(screen){
			this.startModelChange()
			if(this._canvas){
				pos = this.getUnZoomedBox(pos, this._canvas.getZoomFactor());
			}


			const newScreen = lang.clone(screen);
			newScreen.id = "s"+this.getUUID();
			newScreen.x =  pos.x;
			newScreen.y =  pos.y;
			newScreen.name = this.getSceenName(screen.name);
			newScreen.children = [];
			delete newScreen.props.start;

			const children = [];
			const parentGroups ={};
			const widgetIDMapping = {};
	
			const zMax = 0//this.getMaxZValue(this.model.widgets)
			if(screen.children){
				const allChildren = this.sortChildren(screen.children)
				allChildren.forEach((widget, i) => {	
					const widgetID = widget.id
	
					// we do not update the widget names!
					const newWidget = lang.clone(widget);
					delete newWidget.isRootTemplate
					delete newWidget.isNewTemplateChild
					newWidget.id = "w"+this.getUUID();
					newWidget.z = zMax + 1 + i
					newWidget.copyOf = widget.id;
					newWidget.x = pos.x + (widget.x - screen.x);
					newWidget.y = pos.y + (widget.y - screen.y);

					newScreen.children.push(newWidget.id);

					children.push(newWidget);
					widgetIDMapping[widgetID] = newWidget.id;

					const parentGroup = this.getParentGroup(widgetID);
					if(parentGroup){
						parentGroups[parentGroup.id] = parentGroup;
					}
				})
			}

			
			const groups = this.copyScreenGroups(parentGroups, widgetIDMapping)

			/**
			 * create the command
			 */
			 const command = {
				timestamp : new Date().getTime(),
				type : "CopyScreen",
				model : newScreen,
				children :children,
				groups : groups
			};
			this.addCommand(command);

			/**
			 * update model
			 */
			this.modelAddScreenAndWidgetsAndLines(newScreen, children, null, groups);

			this.render();
			this.commitModelChange()

			return newScreen;
		} else {
			console.warn("No screen with id", id);
		}
	}

	copyScreenGroups (oldGroups, widgetIDMapping) {
		const groups = [];
		const groupMapping = {}
		for(let oldGroupsId in oldGroups){
			const oldGroup = oldGroups[oldGroupsId];
			const newGroup = lang.clone(oldGroup);
			newGroup.id = "g" + this.getUUID();
			newGroup.copyOf = oldGroup.id;
			delete newGroup.isRootTemplate
			delete newGroup.isNewTemplateChild
			newGroup.children = [];
			for (let c=0; c < oldGroup.children.length; c++) {
				const parentChildID = oldGroup.children[c];
				if (widgetIDMapping[parentChildID]){
					newGroup.children.push(widgetIDMapping[parentChildID]);
				}
			}
			groups.push(newGroup);
			groupMapping[oldGroupsId] = newGroup.id
		}

		groups.forEach(newGroup => {	
			if (newGroup.groups) {
				newGroup.groups = newGroup.groups.map(oldChildId => {
					console.debug(oldChildId, groupMapping[oldChildId])
					return groupMapping[oldChildId]
				})
			}
		})

		return groups
	}

	copyScreenGroup (parentGroup, groups, widgetIDMapping) {

		let subGroupIds = []
		if (parentGroup.groups) {
			parentGroup.groups.forEach(subGroupId => {
				let subGroup = this.model.groups[subGroupId]
				if (subGroup) {
					let newSubGroup = this.copyScreenGroup(subGroup, groups, widgetIDMapping)
					subGroupIds.push(newSubGroup.id)
				} else {
					this.logger.error("copyScreenGroup", "could not find subgroup > " + subGroupId);
				}
			})
		}

		const newGroup = lang.clone(parentGroup);
		newGroup.id = "g" + this.getUUID();
		newGroup.copyOf = parentGroup.id;
		newGroup.children = [];
		newGroup.groups = subGroupIds
		for (let c=0; c < parentGroup.children.length; c++) {
			const parentChildID = parentGroup.children[c];
			if (widgetIDMapping[parentChildID]){
				newGroup.children.push(widgetIDMapping[parentChildID]);
			}
		}
		groups.push(newGroup);
		this.logger.log(3,"copyScreenGroup", "enter > ", newGroup);
		return newGroup
	}

	undoCopyScreen (command){
		this.logger.log(3,"undoCopyScreen", "enter > " + command.id);
		const model = command.model;
		this.modelRemoveScreenAndWidgetAndLines(model, command.children, null, command.groups);
		this.render();
	}

	redoCopyScreen (command){
		this.logger.log(3,"redoCopyScreen", "enter > " + command.id);
		const model = command.model;
		this.modelAddScreenAndWidgetsAndLines(model, command.children, null, command.groups);
		this.render();
	}
}