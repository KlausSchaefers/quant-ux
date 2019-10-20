import Templates from 'canvas/controller/Templates'
import LayerUtil from 'core/LayerUtil'
export default class Layer extends Templates {
    
	changeLayer (from, to){
		this.logger.log(-1,"changeLayer", "entry > Widgets: ", from, to);
		
		if (from.screenID != to.screenID){
			this.logger.error("changeLayer", "Screen ids not equal");
			this.showError('Widgets can be moved only in the same screen!')
			return;
		}
				
		var command = this.createChangeLayerCommand(from, to);
					
		this.addCommand(command);
		this.modelChangeLayer(command.n, command.ng);
		this.render();
	}	
	
	createChangeLayerCommand (from, to){
	
		var beforePosition = to.widgetID
		var selectedElements = [from.widgetID]
	
		/**
		 * If we have a group, expand the selection to the group
		 */
		if (from.groupID && from.type === 'group' && from.source) {
			let group = this.model.groups[from.source]
			let children = this.getAllGroupChildren(group)
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
		this.onModelChanged();
	}
	
	
	_modelChangeLayer (zValues, groupDeltas) {	
		for(var id in zValues){
			var widget = this.model.widgets[id];
			if (widget){
				widget.z = zValues[id]
			} else {
				console.warn("LayerController._modelChangerLayer() > No Widget", id);
			}
		}
		
		for (var i=0; i < groupDeltas.length; i++) {
			var delta = groupDeltas[i]
			var group = this.model.groups[delta.groupID];
			if (group) {
				if (delta.type == "add") {
					group.children.push(delta.widgetID);
				}
				if (delta.type == "remove") {
					let index = group.children.indexOf(delta.widgetID);
					if (index > -1) {
						group.children.splice(index, 1);
					}
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
	
	
	undoChangeLayer (command){
		this.modelChangeLayer(command.o, command.og);
		this.render();
	}
	
	
	redoChangeLayer (command){
		this.modelChangeLayer(command.n, command.ng);
		this.render();
	}
	
	getZValuesForScreen (model, screenID) {
		var result = {};
		var screen = model.screens[screenID];
		if (screen) {
			for (var i=0; i < screen.children.length; i++){
				var widgetID = screen.children[i];
				var widget = model.widgets[widgetID];
				if (widget) {
					result[widgetID] = widget.z;
				}
			}
		}
		return result;
	}
}