import BaseController from './BaseController'
import lang from '../../dojo/_base/lang'
import ModelUtil from 'core/ModelUtil'

export default class Templates extends BaseController{

	/**********************************************************************
	 * Udate Template Group
	 **********************************************************************/


	updateGroupTemplateStyle (groupId) {
		this.logger.log(-1,"updateGroupTemplateStyle", "enter > " + groupId);

		if (this.model.groups && this.model.groups[groupId]){ 
			const group = this.model.groups[groupId]
			if (group.template && this.model.templates[group.template]) {
				const changes = []
				let groupTemplate = this.model.templates[group.template]

				var command = {
					timestamp : new Date().getTime(),
					type : "MultiCommand",
					label : "GroupTemplateStyle",
					children :[]
				};
				

				const children = this.getAllGroupChildren(group)
				children.forEach(widgetId => {
					const widget = this.model.widgets[widgetId]
					if (widget && widget.template) {
						var template = this.model.templates[widget.template];
						if (template) {
							this.logger.log(-1,"updateGroupTemplateStyle", "Update widget " + widget.name);
							const resizes = this.getWidgetTemplateResize(template, widget)
							var childCommand = {
								timestamp : new Date().getTime(),
								type : "UpdateWidget",
								template: lang.clone(template),
								widget: lang.clone(widget),
								resizes: resizes
							};
							this.modelUpdateTemplate(template, widget, resizes, false);
							changes.push({type: 'template', action:"change", id: template.id})
							command.children.push(childCommand)
						}
					
					} else {
						this.logger.log(-1,"updateGroupTemplateStyle", "New widget " + widget);
					}
				})

				this.addCommand(command);
				this.onModelChanged(changes)
				this.showSuccess("The template "  + groupTemplate.name + " was updated.");
				this.render()


			} else {
				this.logger.log(-1,"updateGroupTemplateStyle", "Group is not template > " + groupId);
			}
		


		} else {
			this.logger.warn("updateGroupTemplateStyle", "No group > " + groupId);
		}
	}

	/**********************************************************************
	 * Uodate Template
	 **********************************************************************/


    updateTemplateStyle (id){
		this.logger.log(0,"updateTemplateStyle", "enter > " + id);

		if (this.model.widgets[id]){
			const widget = this.model.widgets[id]
			if (widget.template && this.model.templates[widget.template]) {
				const template = this.model.templates[widget.template];
				const resizes = this.getWidgetTemplateResize(template, widget)
				const command = {
					timestamp : new Date().getTime(),
					type : "UpdateWidget",
					template: lang.clone(template),
					widget: lang.clone(widget),
					resizes: resizes
				};
				this.addCommand(command);
				this.modelUpdateTemplate(template, widget, resizes, true);
				this.showSuccess("The template "  + template.name + " was updated.");
			} else {
				this.logger.error("updateTemplateStyle", "No template > " + widget.template);
			}
		} else {
			this.logger.error("updateTemplateStyle", "No widget > " + id);
		}
	}

	getWidgetTemplateResize (template, widget) {
		console.debug('getWidgetTemplateResize', template.w, widget.w, template.h, widget.h)
		return []
	}

	modelUpdateTemplate  (commandTemplate, commandWidget, resizes, render = true) {
		console.debug('modelUpdateTemplate()', commandTemplate.style.background, commandWidget.style.background)

		if (!this.model.widgets[commandWidget.id]) {
			this.logger.warn("modelUpdateTemplate", "Cannot find wiget");
			return
		}

		if (!this.model.templates[commandTemplate.id]) {
			this.logger.warn("modelUpdateTemplate", "Cannot find template");
			return
		}

		const widget = this.model.widgets[commandWidget.id]
		const template = this.model.templates[commandTemplate.id]

		template.w = widget.w
		template.h = widget.h
		template.modified = new Date().getTime()

		widget.modified = new Date().getTime()
		ModelUtil.updateTemplateStyle(widget, template, 'style')
		ModelUtil.updateTemplateStyle(widget, template, 'error')
		ModelUtil.updateTemplateStyle(widget, template, 'focus')
		ModelUtil.updateTemplateStyle(widget, template, 'active')
		ModelUtil.updateTemplateStyle(widget, template, 'hover')

		if (render) {
			console.debug('modelUpdateTemplate() > RENDER')
			this.onModelChanged([{type: 'template', action:"change", id: template.id}])
			this.render();
		}
	}

	modelRollbackUpdateTemplate (oldTemplate, oldWidget, resizes, render = true) {
		this.logger.log(-1,"modelRollbackUpdateTemplate", "enter > ", JSON.stringify(oldWidget.style));
		const template = this.model.templates[oldTemplate.id];
		const widget = this.model.widgets[oldWidget.id];
		if (template && widget) {

			template.style = oldTemplate.style
			this.updateStylesInBox(template, oldTemplate)
			template.modified = new Date().getTime()
			template.w = oldTemplate.w
			template.h = oldTemplate.h

			widget.style = oldWidget.style
			this.updateStylesInBox(widget, oldWidget)
			widget.modified = new Date().getTime()
		} else {
			this.logger.warn("modelRollbackUpdateTemplate", "Cannot find template or widget");
		}
		
		if (render) {
			console.debug('modelRollbackUpdateTemplate() > RENDER')
			this.onModelChanged([{type: 'template', action:"change", id: template.id}])
			this.render();
		}
	}

	updateStylesInBox (box, oldBox) {
		if (oldBox.hover) {
			box.hover = oldBox.hover
		}
		if (oldBox.error) {
			box.error = oldBox.error
		}
		if (oldBox.active) {
			box.active = oldBox.active
		}
		if (oldBox.focus) {
			box.focus = oldBox.focus
		}
	}

	undoUpdateWidget (command){
		this.logger.log(-1,"undoUpdateWidget", "enter > ", command);
		this.modelRollbackUpdateTemplate(command.template, command.widget, command.resizes, true);
	}

	redoUpdateWidget (command){
		this.logger.log(-1,"redoUpdateWidgetfunction", "enter > ");
		this.modelUpdateTemplate(command.template, command.widget, command.resizes, true);
	}

	/**********************************************************************
	 * Create Template
	 **********************************************************************/



	addTemplateWidget (widget, name, description){
		this.logger.log(0,"addTemplateWidget", "enter > " + name);

		var template = this._createWidgetTemplate(widget, true, name, description);

		var command = {
			timestamp : new Date().getTime(),
			type : "CreateTemplate",
			models : [template],
			widgets : [widget.id],
		};
		this.addCommand(command);
		this.modelAddTemplate([template],[widget.id]);
		this.updateCreateWidget();
		this.onLayerListChange()

		this.showSuccess("The template "  + name + " was created. You can find it in the Create menu");
	}

	_createWidgetTemplate (widget, visible, name){
		var template = {};
		template.id = "tw" + this.getUUID();
		template.style = lang.clone(widget.style);

		if (widget.hover) {
			template.hover = lang.clone(widget.hover);
		}
		if (widget.error) {
			template.error = lang.clone(widget.error);
		}
		if (widget.active) {
			template.active = lang.clone(widget.active);
		}
		if (widget.focus) {
			template.focus = lang.clone(widget.focus);
		}
		if (widget.designtokens) {
			template.designtokens = lang.clone(widget.designtokens);
		}


		template.style = lang.clone(widget.style);
		template.has = lang.clone(widget.has);
		template.props = lang.clone(widget.props);
		template.w = widget.w;
		template.h = widget.h;
		template.z = widget.z;
		template.x = 0;
		template.y = 0;
		template.templateType = "Widget";
		template.type = widget.type;
		template.visible = visible;
		template.name = name;
		template.modified = new Date().getTime()
		template.created = new Date().getTime()
		return template;
	}

	addTemplateScreen (screen, name){
		this.logger.log(0,"addTemplateScreen", "enter > " + name);

		this.updateCreateWidget();
	}

	

	addNestedTemplateGroup (group, name){
		this.logger.log(-1,"addNestedTemplateGroup", "enter > " + name);
		// keep this method, because of legacy commands!

		const command = {
			timestamp : new Date().getTime(),
			type : "CreateTemplate",
			models : [],
			widgets : [],
			groupID : group.id
		};

		const allChildren = this.getAllGroupChildren(group)
		const boundingBox = this.getBoundingBox(allChildren);

		/**
		 * make one group template!
		 */
		const template = {};
		template.id = "tg" + this.getUUID();
		template.type = "Group";
		template.templateType = "Group";
		template.visible=true;
		template.name = name;
		template.children = [];
		template.groups = []
		template.w = boundingBox.w
		template.h = boundingBox.h

		command.group = template;


		/**
		 * make templates for all children
		 * 
		 */
	
		const template2Widget = {}
		for(let i=0; i < allChildren.length; i++){
			let widgetID = allChildren[i];
			let widget = this.model.widgets[widgetID];

			let t = this._createWidgetTemplate(widget, false, widget.name , "");
			t.x = widget.x - boundingBox.x;
			t.y = widget.y - boundingBox.y;

			template.children.push(t.id);
			command.models.push(t);
			command.widgets.push(widgetID);
			template2Widget[widgetID] = t.id
		}

		this._createSubGroupTemplates(template, group, template.id, name, template2Widget)

		this.addCommand(command);
		this.modelAddTemplate(command.models,command.widgets,command.group, command.groupID);
		this.updateCreateWidget();
		this.onLayerListChange()
	}

	_createSubGroupTemplates (template, group, parentID, name, template2Widget) {
		if (group.groups) {
			group.groups.forEach(subID => {
				const subgroup = this.model.groups[subID]
				if (subgroup) {
					let childTemplate = {
						id : 'tsg' + this.getUUID(),
						name: name + subgroup.name,
						groupID: subgroup.id,
						parent: parentID,
						children: []
					}

					if (subgroup.children) {
						subgroup.children.forEach(widgetID => {
							if (template2Widget[widgetID]) {
								childTemplate.children.push(template2Widget[widgetID])
							} else {
								console.warn('_createSubGroupTemplates() Cannot map widget id', widgetID)
							}
						})
					}

					template.groups.push(childTemplate)

					this._createSubGroupTemplates(template, subgroup, childTemplate.id, name, template2Widget)
					
				}
			})
		}
	}

	modelAddTemplate (childTemplates, widgetIDs, template, groupID){

		if (!this.model.templates){
			this.model.templates = {};
		}

		for (let i=0; i < childTemplates.length; i++) {
			const t = childTemplates[i];
			const widgetID = widgetIDs[i];

			// 1) add the widget template
			this.model.templates[t.id] = t;
			
			// 2) make the widget a template
			const widget = this.model.widgets[widgetID];
			if (widget){
				widget.template = t.id;
				widget.isRootTemplate = true
				widget.modified = new Date().getTime()
				widget.style = {};
				if (widget.hover) {
					widget.hover = {}
				}
				if (widget.error) {
					widget.error = {}
				}
				if (widget.focus) {
					widget.focus = {}
				}
				if (widget.active) {
					widget.active = {}
				}
				if (widget.designtokens) {
					delete widget.designtokens
				}
			} else {
				console.warn("modelAddTemplate() > No Widget with ", widgetID);
			}
		}

		// in early version group was no there. this might have caused an issue.
		if (template) {
			this.model.templates[template.id] = template;

			/** 
			 * Since 4.0.60 we have sub groups!!
			 */
			if (template.groups) {
				template.groups.forEach(childGroupTemplate => {
					let childGroup = this.model.groups[childGroupTemplate.groupID]
					if (childGroup) {
						childGroup.template = childGroupTemplate.id
						childGroup.isRootTemplate = true
					} else {
						console.warn("modelAddTemplate() > No childgroup with ", childGroupTemplate.groupID);
					} 
				})
			}
		}


		if (groupID) {
			this.model.groups[groupID].template = template.id;
			this.model.groups[groupID].isRootTemplate = true
		}


		this.onModelChanged([{type: 'template', action: 'add'}]);
		this.showSuccess("The Component was created. You can find it in the 'Create' menu");
		
	}

	undoCreateTemplate (command){
		this.logger.log(0,"undoCreateTemplate", "enter > ");
		this.modelRemoveTemplate(command.models, command.widgets, command.group, command.groupID);
		this.updateCreateWidget();
		this.render();
	}

	redoCreateTemplate (command){
		this.logger.log(0,"redoCreateTemplate", "enter > ");
		this.modelAddTemplate(command.models, command.widgets, command.group, command.groupID);
		this.updateCreateWidget();
		this.render();
	}




	/**********************************************************************
	 * Remove Template
	 **********************************************************************/

	removeTemplate (id){
		this.logger.log(-1,"removeTemplate", "enter > " + id);
	}


	modelRemoveTemplate (templates, widgetIDs, template, groupID){
		if (this.model.templates) {
			for(let i=0; i < templates.length; i++) {
				let t = templates[i];
				delete this.model.templates[t.id];

				let widgetID = widgetIDs[i];
				let widget = this.model.widgets[widgetID];
				if (widget) {
					delete widget.template;
					delete widget.isRootTemplate
					widget.style = t.style;

					if (t.hover) {
						widget.hover = t.hover
					}
					if (t.error) {
						widget.error = t.error
					}
					if (t.focus) {
						widget.focus = t.focus
					}
					if (t.active) {
						widget.active = t.active
					}
		
				} else {
					console.warn("modelRemoveTemplate() > No widget with ", widgetID);
				}

				/**
				 * delete all children recursive
				 */
				if(t.children){
					this.modelRemoveTemplate(t.children, true);
				}

			}
		}

		if(template){
			delete this.model.templates[template.id];

			/** 
			 * Since 4.0.60 we have sub groups!!
			 */
			if (template.groups) {
				template.groups.forEach(childGroupTemplate => {
					let childGroup = this.model.groups[childGroupTemplate.groupID]
					if (childGroup) {
						delete childGroup.template
						delete childGroup.isRootTemplate
					} else {
						console.warn("modelAddTemplate() > No childgroup with ", childGroupTemplate.groupID);
					} 
				})
			}
		}

		if(groupID){
			delete this.model.groups[groupID].template;
		}


		this.onModelChanged([]);
		this.showSuccess("The template was removed");
	}


	undoRemoveTemplate (command){
		this.logger.log(0,"undoRemoveTemplate", "enter > ");
		this.modelAddTemplate(command.models, command.widgets, command.group);
		// this.renderCreateWidget();
		this.render();
	}

	redoRemoveTemplate (command){
		this.logger.log(0,"redoRemoveTemplate", "enter > ");
		this.modelRemoveTemplate(command.models, command.widgets, command.group);
		// this.renderCreateWidget();
		this.render();
	}


	/**********************************************************************
	 * update Template
	 **********************************************************************/

	unlinkTemplate (id, isGroup = false) {
		this.logger.log(-1,"unlinkTemplate", "enter > ", isGroup);

		if (!isGroup && !this.model.widgets[id]) {
			this.logger.log(-1,"unlinkTemplate", "No widget > ", id);
			return
		}

		if (isGroup && this.model.groups && !this.model.groups[id]) {
			this.logger.log(-1,"unlinkTemplate", "No group > ", id);
			return
		}

		if (!this.model.templates) {
			this.logger.log(0,"unlinkTemplate", "No templates  ");
			return
		}

		let element = !isGroup ? this.model.widgets[id] : this.model.groups[id]
		let template = this.model.templates[element.template]
		if (!template) {
			this.logger.log(-1,"unlinkTemplate", "No template with id  ", element.template);
			return
		}

		let childrenTemplateIds = []
		let childGroupTemplateIds = []
		if (isGroup) {
			let group = this.model.groups[id]
			group.children.forEach(childId => {
				let child = this.model.widgets[childId]
				if (child && child.template) {
					childrenTemplateIds.push({
						widgetId: child.id,
						templateId: child.template
					})
				}
			})

			/**
			 * Since 4.0.60 we have subgroups as well
			 */
			let subgroups = this.getAllChildGroups(group)
			subgroups.forEach(subgroup => {
				if (subgroup && subgroup.template) {
					childGroupTemplateIds.push({
						groupId: subgroup.id,
						templateId: subgroup.template
					})

					if (subgroup.children) {
						subgroup.children.forEach(childId => {
							let child = this.model.widgets[childId]
							if (child && child.template) {
								childrenTemplateIds.push({
									widgetId: child.id,
									templateId: child.template
								})
							}
						})
					}
				}
			})
		}

		

		var command = {
			timestamp : new Date().getTime(),
			type : "UnlinkTemplate",
			modelId: id,
			isGroup: isGroup,
			templateId: template.id,
			childrenTemplateIds: childrenTemplateIds,
			childGroupTemplateIds: childGroupTemplateIds
		};

		this.modelUnlinkTemplate(id, isGroup, childrenTemplateIds, childGroupTemplateIds);
		this.onModelChanged([{type: 'widget', action:"change", id: id}])
		this.addCommand(command);

		this.render()
	}

	modelUnlinkTemplate (id, isGroup = false, childrenTemplateIds, childGroupTemplateIds) {
		this.logger.log(-1,"modelUnlinkTemplate", "enter ");
		if (!this.model.templates) {
			this.logger.log(0,"modelUnlinkTemplate", "No templates ");
			return
		}
		if (isGroup) {
			this.modelUnlinkGroupTemplate(id, childrenTemplateIds, childGroupTemplateIds)
		} else {
			this.modelUnlinkWidgetTemplate(id)
		}
	}

	modelUnlinkGroupTemplate(id, childrenTemplateIds, childGroupTemplateIds) {
		this.logger.log(-1,"modelUnlinkGroupTemplate", "enter ");
		if (!this.model.groups || !this.model.groups[id]){
			this.logger.log(0,"modelUnlinkGroupTemplate", "No group ", id);
			return
		}

		/**
		 * Delete the group
		 */
		let group = this.model.groups[id]
		if (group) {
			delete group.template
		}

		/**
		 * Clean up children
		 */
		if (childrenTemplateIds) {
			childrenTemplateIds.forEach(child => {
				this.modelUnlinkWidgetTemplate(child.widgetId)
			})
		}

		if (childGroupTemplateIds) {
			childGroupTemplateIds.forEach(child => {
				let group = this.model.groups[child.groupId]
				if (group) {
					delete group.template
				} else {
					console.warn('modelUnlinkGroupTemplate() Cannot unlink child group')
				}
			})
		}
	}

	modelUnlinkWidgetTemplate (id) {
		this.logger.log(-1,"modelUnlinkWidgetTemplate", "Enter > ", id);

		if (!this.model.widgets[id]) {
			this.logger.log(0,"modelUnlinkWidgetTemplate", "No widhget > ", id);
			return
		}

		let widget = this.model.widgets[id]
		if (widget.template) {
			let template = this.model.templates[widget.template]
			if (template) {
				ModelUtil.setMergedTemplateStyle(widget, template, "style")
				ModelUtil.setMergedTemplateStyle(widget, template, "hover")
				ModelUtil.setMergedTemplateStyle(widget, template, "focus")
				ModelUtil.setMergedTemplateStyle(widget, template, "error")
				ModelUtil.setMergedTemplateStyle(widget, template, "active")
			}
		}
		widget.isRootTemplate = false
		delete widget.template
	}




	modelLinkTemplate (id, templateId, isGroup, childrenTemplateIds, childGroupTemplateIds) {
		this.logger.log(0,"modelLinkTemplate", "enter > ", id, templateId);

		if (!this.model.templates) {
			this.logger.log(0,"modelLinkTemplate", "No templates ");
			return
		}

		let template = this.model.templates[templateId]
		if (!template) {
			this.logger.log(0,"modelUnlinkTemplate", "No template with id > ", templateId);
			return
		}

		if (isGroup) {
			this.modelLinkGroupTemplate(id, templateId, childrenTemplateIds, childGroupTemplateIds)
		} else {
			this.modelLinkWidgetTemplate(id, templateId)
		}

	}

	modelLinkGroupTemplate (id, templateId, childrenTemplateIds, childGroupTemplateIds) {
		this.logger.log(0,"modelLinkGroupTemplate", "enter > ", id, templateId);

		if (!this.model.groups || !this.model.groups[id]){
			this.logger.log(0,"modelLinkGroupTemplate", "No group ", id);
			return
		}

		let group = this.model.groups[id]
		if (group) {
			group.template = templateId
		}
		

		if (childrenTemplateIds) {
			childrenTemplateIds.forEach(child => {
				this.modelLinkWidgetTemplate(child.widgetId, child.templateId)
			})
		}

		if (childGroupTemplateIds) {
			childGroupTemplateIds.forEach(child => {
				let group = this.model.groups[child.groupId]
				if (group) {
					group.template = child.templateId
				}
			})
		}
	}

	modelLinkWidgetTemplate (id, templateId) {
		this.logger.log(0,"modelLinkWidgetTemplate", "enter > ", id, templateId);

		if (!this.model.widgets[id]) {
			this.logger.log(0,"modelLinkWidgetTemplate", "No widhget > ", id);
			return
		}

		if (!this.model.templates[templateId]) {
			this.logger.log(0,"modelLinkWidgetTemplate", "No template > ", templateId);
			return
		}

		let template = this.model.templates[templateId]
		let widget = this.model.widgets[id]
		widget.template = templateId
		ModelUtil.setStylesNotInTemplate(widget, template, 'style')
		ModelUtil.setStylesNotInTemplate(widget, template, 'hover')
		ModelUtil.setStylesNotInTemplate(widget, template, 'error')
		ModelUtil.setStylesNotInTemplate(widget, template, 'focus')
		ModelUtil.setStylesNotInTemplate(widget, template, 'active')
	}
	

	undoUnlinkTemplate (command){
		this.logger.log(0,"undoUnlinkTemplate", "enter > ");
		this.modelLinkTemplate(command.modelId, command.templateId, command.isGroup, command.childrenTemplateIds, command.childGroupTemplateIds);
		this.render();
	}

	redoUnlinkTemplate (command){
		this.logger.log(0,"redoUnlinkTemplate", "enter > ");
		this.modelUnlinkTemplate(command.modelId, command.isGroup, command.childrenTemplateIds, command.childGroupTemplateIds);
		this.render();
	}



	/**********************************************************************
	 * Delete Template
	 **********************************************************************/

	removeAndUnlinkTemplate (id){
		this.logger.log(-1,"removeAndUnlinkTemplate", "enter > " + id);

		if (!this.model.templates) {
			this.logger.log(0,"removeAndUnlinkTemplate", "No templates  ");
			return
		}

		if (!this.model.templates[id]) {
			this.logger.log(0,"removeAndUnlinkTemplate", "No template with id  " + id);
			return
		}

		let template = this.model.templates[id]
		let isGroup = template.templateType === 'Group'
		let widgetIds = isGroup && this.model.groups ?
			Object.values(this.model.groups).filter(g => g.template === id).map(g => g.id) :
			Object.values(this.model.widgets).filter(w => w.template === id).map(w => w.id)

		let templates = [{
			template: template,
			widgetIds: widgetIds,
			isGroup: isGroup
		}]

		/**
		 * Group templates have child templates that need to be
		 * removed
		 */
		if (template.children) {
			template.children.forEach(chidlId => {
				let childTemplate = this.model.templates[chidlId]
				if (childTemplate) {
					let childWidgetIds = Object.values(this.model.widgets).filter(w => w.template === childTemplate.id).map(w => w.id)
					templates.push({
						template: childTemplate,
						widgetIds: childWidgetIds,
						isGroup: false
					})
				}
			})
		}

		var command = {
			timestamp : new Date().getTime(),
			type : "RemoveAndUnlinkTemplate",
			templates: templates
		}

		this.modelRemoveAndUnlinkTemplate(templates)
		this.addCommand(command);
		this.render()
	}

	modelRemoveAndUnlinkTemplate (templateChanges) {
		this.logger.log(-1,"modelRemoveAndUnlinkTemplate", "enter > ", templateChanges);
		let changes = []
		templateChanges.forEach(templateChange => {
			let template = templateChange.template
			let widgetIds = templateChange.widgetIds
			let isGroup = templateChange.isGroup

			widgetIds.forEach(widgetId => {
				this.modelUnlinkTemplate(widgetId, isGroup)
				changes.push({type: 'widget', action:"change", id: widgetId})
			})
			if (this.model.templates) {
				delete this.model.templates[template.id]
			}
		})

		this.onModelChanged(changes)
	}

	modelAddAndLinkTemplate (templateChanges) {
		this.logger.log(-1,"modelAddAndLinkTemplate", "enter > ", templateChanges);

		if (!this.model.templates) {
			this.model.templates = {}
		}
		let changes = []
		templateChanges.forEach(templateChange => {
			let template = templateChange.template
			let widgetIds = templateChange.widgetIds
			let isGroup = templateChange.isGroup
			this.model.templates[template.id] = template
			widgetIds.forEach(widgetId => {
				this.modelLinkTemplate(widgetId, template.id, isGroup)
				changes.push({type: 'widget', action:"change", id: widgetId})
			})
		})
		this.onModelChanged(changes)
	}

	undoRemoveAndUnlinkTemplate(command){
		this.logger.log(0,"undoRemoveAndUnlinkTemplate", "enter > ");
		this.modelAddAndLinkTemplate(command.templates);
		this.render();
	}

	redoRemoveAndUnlinkTemplate (command){
		this.logger.log(0,"redoRemoveAndUnlinkTemplate", "enter > ");
		this.modelRemoveAndUnlinkTemplate(command.templates);
		this.render();
	}


}