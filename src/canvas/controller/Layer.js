import Templates from 'canvas/controller/Templates'

export default class Layer extends Templates {
    
	changeLayer (fromScreenID, fromWidgetID, fromGroupID, toScreenID, toWidgetID, toGroupID){
		this.logger.log(-1,"changeLayer", "entry " + fromWidgetID + " -> " + toWidgetID +  " >> " + fromGroupID + " -> "+ toGroupID);
		
		if (fromScreenID != toScreenID){
			this.logger.error("changeLayer", "Screen ids not equal");
			return;
		}
		
		if (fromGroupID && toGroupID && !fromWidgetID && toWidgetID){
			this.logger.error("changeLayer", "Group merging stuff not supported");
			return;
		}
		
		
		var command = this.createChangeLayerCommand({
			widgetID: fromWidgetID,
			screenID: fromScreenID,
			groupID: fromGroupID
		},
		{
			widgetID: toWidgetID,
			screenID: toScreenID,
			groupID: toGroupID
		});
					
		this.addCommand(command);
		this.modelChangeLayer(command.n, command.ng);
		this.render();
	}	
	
	createChangeLayerCommand (from, to){
	
		var newGroup = [];
		var oldGroup = [];
		var inGroupPlacement = false
		
		// 2) change between group
		if (from.groupID && to.groupID){
			//console.debug("createChangeLayerCommand() > Change group!", from.groupID , to.groupID);
			inGroupPlacement = true
			
			newGroup.push({
				type: "add",
				groupID: to.groupID,
				widgetID: from.widgetID
			});
			newGroup.push({
				type: "remove",
				groupID: from.groupID,
				widgetID: from.widgetID
			});
			oldGroup.push({
				type: "remove",
				groupID: to.groupID,
				widgetID: from.widgetID
			});
			oldGroup.push({
				type: "add",
				groupID: from.groupID,
				widgetID: from.widgetID
			})
		}
		
		// 2) add to group
		if (!from.groupID && to.groupID && to.widgetID != undefined){
			//console.debug("createChangeLayerCommand() > add group!");
			newGroup.push({
				type: "add",
				groupID: to.groupID,
				widgetID: from.widgetID
			});
			oldGroup.push({
				type: "remove",
				groupID: to.groupID,
				widgetID: from.widgetID
			})
			inGroupPlacement = true
		}
		
		// 3) remove group
		if (from.groupID && (!to.groupID || !to.widgetID)){
			//console.debug("createChangeLayerCommand() > remove group!");
			newGroup.push({
				type: "remove",
				groupID: from.groupID,
				widgetID: from.widgetID
			});
			oldGroup.push({
				type: "add",
				groupID: from.groupID,
				widgetID: from.widgetID
			})
		}
		
		
		var oldValues = this.getZValuesForScreen(this.model, from.screenID, inGroupPlacement);
		var newValues = this.getNewZValuePositions(from, to, oldValues, inGroupPlacement);
		
		return {
			timestamp : new Date().getTime(),
			type : "ChangeLayer",
			o: oldValues,
			n: newValues,
			og: oldGroup,
			ng: newGroup
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
					var index = group.children.indexOf(delta.widgetID);
					if (index > -1) {
						group.children.splice(index, 1);
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
	
	getNewZValuePositions (from, to, oldValues, inGroupPlacement){
		var isGroupMove = !from.widgetID && from.groupID != undefined
		//console.debug("isGroupMove", isGroupMove)
	
		/**
		 * We have to get the insert point in here (to.max). If move an entire group
		 * we have to also get the offset of the group members
		 */
		from = this._addLayerStructure(from, oldValues, isGroupMove);
		if(inGroupPlacement && to.widgetID){
			// for in group placements we do not need this
			to.max = oldValues[to.widgetID];
		} else {
			to = this._addLayerStructure(to, oldValues, true);
		}
		
	
		/**
		 * Get the insert position. One above the *TO*
		 */
		var newZ = Math.max(0, to.max +1) 
		var temp = []
		
		/**
		 * Shift all *FROM* widgets up, but perserve the order 
		 * by using the offset. This is only important 
		 * from group moves
		 */
		for (let id in from.offset){
			let offset = from.offset[id]
			temp.push({id: id, z: newZ - offset});
		}
		for (let id in oldValues){
			/**
			 * Do not update the from widgets, as they are already updated!
			 */
			if (from.offset[id] == undefined){
				let oldZ = oldValues[id];
				if (oldZ < newZ){
					/**
					 * If the other widget is below, we push it from.length
					 * layers down!
					 */
					temp.push({id: id, z: oldZ -= from.length}); 
				} else {
					/**
					 * Else we push it one up
					 */
					temp.push({id: id, z: oldZ += 1});
				}
			}
		}
		
		/**
		 * Now we sort by z value
		 */
		temp.sort(function(a, b){
			return a.z - b.z
		});
		
		/**
		 * Finally normalize the layer values
		 */
		var newValues = {};
		for(var i=0; i< temp.length; i++){
			var t = temp[i];
			newValues[t.id] = i;
		}
		return newValues;
	}
	
	/**
	 * Add the max z value to the selection and add the offset
	 * for the other elements in the selection.
	 */
	_addLayerStructure (selection, zValues, ingnoreGroup){
		let ids = [];
		if (selection.widgetID){
			ids =  [selection.widgetID]
		}
		
		if (selection.groupID && ingnoreGroup){
			let group = this.model.groups[selection.groupID];
			if (group) {
				ids = group.children;
			} 
		}
		
		// get the max
		let max = 0;
		let min = 10000000;
		for (let i=0; i < ids.length; i++){
			let id = ids[i];
			let z = zValues[id];
			max = Math.max(z, max);
			min = Math.min(z, min)
		}
		selection.max = max;
		selection.min = min;
		selection.length = ids.length;
		selection.offset = {};
		for (let i=0; i < ids.length; i++){
			let id = ids[i];
			let z = zValues[id];
			selection.offset[id] = max-z
		}
		return selection;
		
	}
}