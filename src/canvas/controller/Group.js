import lang from 'dojo/_base/lang'
import Layer from 'canvas/controller/Layer'

export default class Group extends Layer {

	updateGroupProperties (ids, props, type){
		this.logger.log(0,"updateGroupProperties", "enter > " +type);	
		
		/**
		 * FIXME:we could also make our own command here to save some storage in the CommandStack 
		 */
		
		/**
		 * 1) create multi command
		 */
		var command = {
			timestamp : new Date().getTime(),
			type : "MultiCommand",
			label : "UpdateGroupProps",
			children :[]
		};
		
		/**
		 * Hack because some styles are by 
		 * default null (which is rendered as solid)
		 */
		var ignoreStyles = ["borderTopStyle", "borderBottomStyle", "borderRightStyle", "borderLeftStyle", "fontWeight", 
							"fontStyle", "textDecoration", "boxShadow", "textShadow", "opacity", "fixed"];
		
		for(var i=0; i< ids.length; i++){
			/**
			 * we just assume the object was already cloned.
			 * we just give new id and set position
			 */
			var id = ids[i];
			var widget = this.model.widgets[id];
			if(widget){
				var org = widget[type];
				/**
				 * Check if this widget has already the style. If not we exclude it.
				 * Otherwise we have Labels with background color and so on...
				 */
				var isIncluded = true;
				for(var key in props){
					if(ignoreStyles.indexOf(key) < 0 ){
						isIncluded = isIncluded &&  (org[key] !=null && org[key]!=undefined);
					}
				}
				if(isIncluded){
					var child = this.createWidgetPropertiesCommand(id, props, type);
					this.modelWidgetPropertiesUpdate(id, props, type);
					command.children.push(child);
				} else {
					console.debug(" - x", widget);
				}
			}
		}
		
	
		
		this.addCommand(command);
		
		this.onModelChanged();
		this.render();
		
		
	}
	
	alignGroup (direction){
		this.logger.log(0,"alignGroup", "enter > " +direction);	
		this.showError("Group Alignment not supported yet");
	}
	
	/**********************************************************************
	 * Theme Group add
	 **********************************************************************/
	
	addGroupByTheme (themedGroup, pos){
		this.logger.log(0,"addGroupByTheme", "enter > "+ themedGroup.id);

		pos = this.getUnZoomedBox(pos, this._canvas.getZoomFactor());
		
			
		/**
		 * 1) create multi command
		 */
		let command = {
			timestamp : new Date().getTime(),
			type : "MultiCommand",
			label : "AddGroupByTheme",
			children :[]
		};
	
		/**
		 * create new group
		 */
		let group ={
			id : "g"+this.getUUID(),
			children : [],
			name : themedGroup.name
		};
		
		/**
		 * 2) create child widgets
		 */
		var z = this.getMaxZValue(this.model.widgets);
		var children = themedGroup.children;
		for(let i=0; i< children.length; i++){
			/**
			 * we just assume the object was already cloned.
			 * we just give new id and set position
			 */
			let widget = children[i];
	
			widget.id = "w"+this.getUUID();
			widget.x +=  pos.x;
			widget.y +=  pos.y;
			widget.z = z+1+i;
			
			/**
			 * do not forget to add to group
			 */
			group.children.push(widget.id);
			
			let child = this._createAddWidgetCommand(widget);
			command.children.push(child);
		
			this.modelAddWidget(widget, true);
		}
		
		
		
		/**
		 * 3) add group
		 */
		let child = {
			timestamp : new Date().getTime(),
			type : "AddGroup",
			model : group
		};
		command.children.push(child);
		this.modelAddGroup(group, true);
		
		this.addCommand(command);
		
		this.onModelChanged();
		this.render();
		
			
	}
	
	/**********************************************************************
	 * Template Group add
	 **********************************************************************/
	

	addGroupByTemplate (group, pos){
		this.logger.log(0,"addGroupByTemplate", "enter > "+ group.template);
		
		pos = this.getUnZoomedBox(pos, this._canvas.getZoomFactor());
		
		var groupTemplate = this.model.templates[group.template];
		

		if(groupTemplate){
			
			group = this.factory.createTemplatedModel(groupTemplate);
			group.id = "tg"+this.getUUID();
			
			/**
			 * 1) create mutli command
			 */
			var command = {
				timestamp : new Date().getTime(),
				type : "MultiCommand",
				label : "AddGroupByTemplate",
				children :[]
			};
			
			/**
			 * order by z
			 */
			var children = [];
			for(let i=0; i < group.children.length; i++){
				let id = group.children[i];
				let child = this.model.templates[id];
				children.push(child);
			}
			children = this.getOrderedWidgets(children);
		
			group.children=[];
			/**
			 * 2) create child widgets
			 */
			var z = this.getMaxZValue(this.model.widgets);
			for(let i=0; i< children.length; i++){
				let widgetTemplate = children[i];
				let widget = this.factory.createTemplatedModel(widgetTemplate);
				
				widget.id = "w"+this.getUUID();
				widget.x +=  pos.x;
				widget.y +=  pos.y;
				widget.z = z+1+i;
				widget.name = this.createNiceName(widget);

				let child = this._createAddWidgetCommand(widget);
				command.children.push(child);
				group.children.push(widget.id);
				
				this.modelAddWidget(widget, true);
			}
			
			
			
			/**
			 * 3) add group
			 */
			let child = {
				timestamp : new Date().getTime(),
				type : "AddGroup",
				model : group
			};
			command.children.push(child);
			this.modelAddGroup(group, true);
			
			this.addCommand(command);
			
			this.onModelChanged();
			this.render();
		}
	}
	
	
	/**********************************************************************
	 * Group name
	 **********************************************************************/
	
	
	setGroupName (id, value){
		this.logger.log(2,"setGroupName", "enter ");
		
		if(this.model.groups && this.model.groups[id]){
		
			var group = this.model.groups[id];
			if(group.name != value){
				this.logger.log(4,"setGroupName", "enter " + id+ " " + value);
				var command = {
					timestamp : new Date().getTime(),
					type : "GroupName",
					o :group.name,
					n : value,
					modelId : id
				};
				this.addCommand(command);
				
				/**
				 * do the model update
				 */
				this.modelGroupName(id, value);					
			} 				
			
		} else {
			console.warn("setGroupName() > No group with id", id)
		}

	}
	
	modelGroupName (id, value){
		if(this.model.groups && this.model.groups[id]){				
			var group = this.model.groups[id];
			group.name = value;		
			this.onModelChanged();
		} else {
			console.warn("modelGroupName() > No group with id", id)
		}
	}

	
	undoGroupName (command){
		this.modelGroupName(command.modelId, command.o);
	}
	
	
	redoGroupName (command){
		this.modelGroupName(command.modelId, command.n);
	}
	
	/**********************************************************************
	 * Group add
	 **********************************************************************/

	addGroup (selection){
		this.logger.log(0,"addGroup", "enter ");
		
		/**
		 * check that we do not have group of group!
		 */
		// var targetScreen = null;
		let subGroups = []
		let children = []
		for (let i = 0; i < selection.length; i++) {
			/**
			 * FIXME: Here is some bug with mutli level groups
			 */
			let widgetID = selection[i];
			let group = this.getParentGroup(widgetID);
			if (group) {
				if (subGroups.indexOf(group.id) < 0) {
					subGroups.push(group.id)
				}
			} else {
				children.push(widgetID)
			}
			// since 2.1.3 we allow subgroups
			//if(group){
			//	this.showError("Some of the widgets are already part of another group! We do not support nested groups yet!");
			//	return;
			//}
		}
		var length = this.getObjectLength(this.model.groups);
		var name = "Group"
		if (length) {
			name += ' ' + length;
		}
		this.logger.log(-1,"addGroup", "add subgroups", subGroups);
		let group ={
			id : "g"+this.getUUID(),
			children : children,
			groups: subGroups, 
			name : name
		};

		console.debug('create group', group)

		/**
		 * create the command
		 */
		var command = {
			timestamp : new Date().getTime(),
			type : "AddGroup",
			model : group
		};
		this.addCommand(command);
		
		this.modelAddGroup(group);

		// console.debug("Group.add() ", JSON.stringify(this.model.groups, null, 2))
		
		this.render();
		
		this.showSuccess("Group was created!");
		
		return group;
	}
	
	
	
	modelAddGroup (group, ignoreModelUpdate, line){
	
		if(!this.model.groups){
			this.model.groups = {};
		}
		
		this.model.groups[group.id] = group;
		
		if(line){
			this.model.lines[line.id] = line;
		}
		
		if(!ignoreModelUpdate){
			this.onModelChanged();
		}
	}
	
	undoAddGroup (command){
		this.modelRemoveGroup(command.model);
		this.render();
	}
	
	redoAddGroup (command){
		this.modelAddGroup(command.model);
		this.render();
	}

	/**********************************************************************
	 * Group Remove
	 **********************************************************************/
	

	removeGroup (id){
		this.logger.log(0,"removeGroup", "enter >> " + id);
		
		if(this.model.groups && this.model.groups[id]) {
			var group = this.model.groups[id];
			var command = this.createRemoveGroupCommand(group);
			this.addCommand(command);
			this.modelRemoveGroup(group, command.line);	
			this.unSelect();
			this.render();
		} else {
			console.debug(this.model.groups);
			console.warn("Could not remove group with " , id);
		}
	}
	
	createRemoveGroupCommand (group){
		var command = {
			timestamp : new Date().getTime(),
			type : "RemoveGroup",
			model : group
		};
		/**
		 * if group has line, also remove it
		 */
		var line = this.getLineFrom(group);
		if(line){
			command.line = line;
		}
		return command;
	}
	
	
	modelRemoveGroup (group, line, doNotCallModelChanged){
		var id = group.id;
		if(this.model.groups && this.model.groups[id]){
			delete this.model.groups[id];
		
			
			/**
			 * also update lines
			 */
			if(line){
				delete this.model.lines[line.id];
			}
			
			if(!doNotCallModelChanged){
				this.onModelChanged();
			}
			
		} else {
			console.debug(this.model.groups);
			console.warn("Could not delete group", group);
		}
	}
	
	undoRemoveGroup (command){
		this.modelAddGroup(command.model, false, command.line);
		this.render();
	}
	
	redoRemoveGroup (command){
		this.modelRemoveGroup(command.model);
		this.render();
	}
	
	

	/**********************************************************************
	 * Delete Group and Widgets 
	 **********************************************************************/
	removeGroupAndWidgets (id){
		this.logger.log(0,"removeGroupAndWidget", "enter > " + id);
		
		
		if(this.model.groups && this.model.groups[id]){
			var group = this.model.groups[id];

			var command = {
				timestamp : new Date().getTime(),
				type : "MultiCommand",
				label : "RemoveGroupAndWidget",
				children :[]
			};
			
			/**
			 * 1st) remove group se we have also the children list saved!
			 */
			var child = this.createRemoveGroupCommand(group);
			command.children.push(child);
			this.modelRemoveGroup(group, null, true);
					
			/**
			 * 2) remove widgets. Clone children list as it might 
			 * be modified in the modelRemoveWidgetAndLines() method.
			 */
			var children = lang.clone(group.children);
			for(let i=0; i < children.length; i++){
				let id = children[i];				
				let child = this.createWidgetRemoveCommand(id);
				command.children.push(child);					
				var widget = this.model.widgets[id];
				var lines = this.getLines(widget);		
				var refs = this.getReferences(widget);				
				this.modelRemoveWidgetAndLines(widget, lines, refs, true);
			}			
			this.addCommand(command);
			this.onModelChanged();
			this.unSelect();
			this.render();
		}
	}
}