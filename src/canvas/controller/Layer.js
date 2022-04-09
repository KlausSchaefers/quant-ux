import Templates from './Templates'
import LayerUtil from '../../core/LayerUtil'
import ModelUtil from '../../core/ModelUtil';
export default class Layer extends Templates {

	/**********************************************************************
	 * Normalize zValues
	 **********************************************************************/


	normalilizeZvalues () {
		this.logger.log(-1,"normalilizeZvalues", "entry > Widgets: ");

		let command = this.createNormalizeZValuesCommand()
		this.modelWidgetLayers(command.n)
		this.addCommand(command)
		this.onModelChanged([]); // FIXME
		this.render()
	}

	createNormalizeZValuesCommand (model) {
		const oldValues = {}
		const newValues = {}

		for (let screenId in model.screens) {
			let srcn = model.screens[screenId]
			const sortedChildren = this.sortChildren(srcn.children)
			sortedChildren.forEach((w,i) => {
				let z = i + 1
				if (w.z !== z) {
					newValues[w.id] = z,
					oldValues[w.id] = w.z
				}
			})
		}

		this.logger.log(1,"createNormalizeZValuesCommand", "exit > # changes: ", Object.keys(newValues).length);

		return {
			timestamp : new Date().getTime(),
			type : "NormalizeLayers",
			o: oldValues,
			n: newValues,
		};
	}

	undoNormalizeLayers(command) {
		this.modelWidgetLayers(command.o)
		this.render();
	}

	redoNormalizeLayers(command) {
		this.modelWidgetLayers(command.n)
		this.render();
	}

	/**********************************************************************
	 * DND stuff from LayerList
	 **********************************************************************/


	changeLayer (from, to){
		this.logger.log(1,"changeLayer", "entry > Widgets: ", from, to);

		if (from.screenID != to.screenID){
			this.logger.error("changeLayer", "Screen ids not equal");
			this.showError('Widgets can be moved only in the same screen!')
			return;
		}

		const command = this.createChangeLayerCommand(from, to);

		this.addCommand(command);
		this.modelChangeLayer(command.n, command.ng);
		this.render();


		const changes = this.getLayerChanges(command.n, command.ng)
		this.checkTemplateAutoUpdate(changes)
	}

	createChangeLayerCommand (from, to){

		var beforePosition = to.widgetID
		var selectedElements = [from.widgetID]

		/**
		 * If we have a group, expand the selection to the group
		 */
		if (from.groupID && from.type === 'group' && from.source) {
			const group = this.model.groups[from.source]
			const children = this.getAllGroupChildren(group)
			selectedElements = children
		}

		/**
		 * Get old and new Z Values
		 */
		var oldValues = this.getZValuesForScreen(this.model, from.screenID);
		var newValues = LayerUtil.getNewZValuePositions(beforePosition, selectedElements, oldValues);

		/**
		 * Get group changes
		 */
		let groupChanges = LayerUtil.getGroupChanges(from, to, this.model)

		return {
			timestamp : new Date().getTime(),
			type : "ChangeLayer",
			o: oldValues,
			n: newValues,
			og: groupChanges.oldGroup,
			ng: groupChanges.newGroup
		};
	}




	modelChangeLayer (zValues, groupDeltas) {
		this._modelChangeLayer(zValues, groupDeltas)
		const changes = this.getLayerChanges(zValues, groupDeltas)
		this.onModelChanged(changes); 
	}


	getLayerChanges (zValues, groupDeltas) {
		const changes = Object.keys(zValues).map(id => {
			return {id: id, type:'widget', prop:'position', action:'change'}
		})
		groupDeltas.forEach(delta => {
			changes.push({id: delta.groupID, type:'group', action:'change'})
		})
		return changes
	}


	_modelChangeLayer (zValues, groupDeltas) {
		for(let id in zValues){
			const widget = this.model.widgets[id];
			if (widget){
				widget.z = zValues[id]
			} else {
				console.warn("LayerController._modelChangerLayer() > No Widget", id);
			}
		}

		for (let i=0; i < groupDeltas.length; i++) {
			const delta = groupDeltas[i]
			const group = this.model.groups[delta.groupID];
			if (group) {
				if (delta.type == "add") {
					group.children.push(delta.widgetID);
					this.addNewWidgetInTemplateGroup(delta.widgetID, group)
				}
				if (delta.type == "remove") {
					let index = group.children.indexOf(delta.widgetID);
					if (index > -1) {
						group.children.splice(index, 1);
					}
					this.removeNewWidgetInTemplateGroup(delta.widgetID, group)
				}
				if (delta.type == "addSubGroup") {
					if (!group.groups) {
						group.groups = []
					}
					group.groups.push(delta.subGroupID);
				}
				if (delta.type == "removeSubGroup") {
					if (group.groups) {
						let index = group.groups.indexOf(delta.subGroupID);
						if (index > -1) {
							group.groups.splice(index, 1);
						}
					}
				}
			} else {
				console.warn("LayerController._modelChangerLayer() > No group", delta);
			}
		}
	}

	addNewWidgetInTemplateGroup(widgetID, group) {
		if (group.template && group.isRootTemplate) {
			const widget = this.model.widgets[widgetID]
			if (widget) {
				/**
				 * Since 4.0.60 we track if an widget was added to a root component
				 */
				widget.isNewTemplateChild = true
			}	
		}
	}

	removeNewWidgetInTemplateGroup(widgetID) {
		const widget = this.model.widgets[widgetID]
		if (widget) {
			delete widget.isNewTemplateChild
		}	
	}

	setRootTemplateIfNeeded (element, template) {
		if (this.hasNoRootTemplate(template)) {
			element.isRootTemplate = true
		}
	}

	hasNoRootTemplate (template) {
		if (template.templateType === 'Widget') {
			return Object.values(this.model.widgets).filter(w => w.isRootTemplate && w.template === template.id).length === 0
		}
		if (template.templateType === 'Group') {
			return Object.values(this.model.groups).filter(g => g.isRootTemplate && g.template === template.id).length === 0
		}
	}


	undoChangeLayer (command){
		this.modelChangeLayer(command.o, command.og);
		this.render();
	}


	redoChangeLayer (command){
		this.modelChangeLayer(command.n, command.ng);
		this.render();
	}

	getZValuesForScreen (model, screenID) {
		const result = {};
		const screen = model.screens[screenID];
		if (screen) {
			for (let i=0; i < screen.children.length; i++){
				const widgetID = screen.children[i];
				const widget = model.widgets[widgetID];
				if (widget) {
					result[widgetID] = widget.z;
				}
			}
		} else {
			// for stuff on canvas we need to get all
			const canvasChildren = ModelUtil.getCanvasWidgets(model)
			canvasChildren.forEach(widget => {
				result[widget.id] = widget.z;
			})
		}
		return result;
	}
}