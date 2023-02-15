import BaseController from './BaseController'
import lang from '../../dojo/_base/lang'
import ModelUtil from '../../core/ModelUtil'
import ModelGeom from '../../core/ModelGeom'

export default class Templates extends BaseController{


	/**********************************************************************
	 * Auto template update
	 **********************************************************************/
	checkTemplateAutoUpdate () {
		this.logger.log(3,"checkTemplateAutoUpdate", "enter > ");
	}


	/**********************************************************************
	 * Udate Template Group
	 **********************************************************************/


	updateGroupTemplateStyle (groupId, updatePositons = true) {
		this.logger.log(-1,"updateGroupTemplateStyle", "enter > " + groupId + ' > updatePositons: ' + updatePositons);

		if (this.model.groups && this.model.groups[groupId]){ 
			const group = this.model.groups[groupId]
			if (group.template && this.model.templates[group.template]) {
				this.startModelChange()
				const groupTemplate = this.model.templates[group.template]

				const command = {
					timestamp : new Date().getTime(),
					type : "MultiCommand",
					label : "GroupTemplateStyle",
					children :[]
				};
				const changes = []
				
				// we might need to normalize all zLayers to fix z adding screw ups?
				//let zCommand = this.createNormalizeZValuesCommand(this.model)
				//this.modelWidgetLayers(zCommand.n)
				//command.children.push(zCommand)
			
				const children = this.getAllGroupChildren(group)
				const sortedChildren = this.sortChildren(children)
				const boundingBox = this.getBoundingBox(children)

				/**
				 * 1) Check if we have added elements (or groups). this must be doen first to keep bounding
				 * boxes well
				 */
				const deltaBoundingBox = this.addAndRemoveTemplateGroupWidgets(command, changes, group, groupTemplate, sortedChildren, boundingBox)

				/**
				 * 2) Update all widgets in the group and also reposition them
				 */
				const instanceBoundingBoxes = this.getInstanceBoundingBoxes(groupTemplate)
				this.updateAllTemplateGroupWidgets(command, changes, updatePositons, instanceBoundingBoxes, sortedChildren, boundingBox, deltaBoundingBox)


				this.addCommand(command);
				this.onModelChanged(changes)
				this.onLayerListChange()
				this.showSuccess("The template "  + groupTemplate.name + " was updated.");
				this.completeRender()
				this.commitModelChange()
			} else {
				this.logger.log(-1,"updateGroupTemplateStyle", "Group is not template > " + groupId, group);
			}

		} else {
			this.logger.warn("updateGroupTemplateStyle", "No group > " + groupId);
		}
	}

	getInstanceBoundingBoxes (groupTemplate) {
		this.logger.log(1,"getInstanceBoundingBoxes", "enter > ", groupTemplate);
		const result = {}
		const instanceGroups = ModelUtil.getGroupsByTemplate(groupTemplate.id, this.model)
		instanceGroups.forEach(instanceGroup => {
			const allChildren = this.getAllGroupChildren(instanceGroup)
			const boundingBox = this.getBoundingBox(allChildren)
			allChildren.forEach(widgetId => {
				result[widgetId] = {
					x: boundingBox.x,
					y: boundingBox.y,
					groupId: instanceGroup.id
				}	
			})
		})
		return result
	}

	updateAllTemplateGroupWidgets (command, changes, updatePositons, instanceBoundingBoxes, sortedChildren, boundingBox, deltaBoundingBox) {
		sortedChildren.forEach((widget, index) => {			
			if (widget.template) {
				const template = this.model.templates[widget.template];
				if (template) {
					
					const x = widget.x - boundingBox.x
					const y = widget.y - boundingBox.y
					const deltaX = template.x - x
					const deltaY = template.y - y
					const deltaZ = template.z - index

					const resizes = this.getWidgetTemplateResize(updatePositons, template, widget, x, y, instanceBoundingBoxes, deltaBoundingBox)
					const props = this.getWidgetTemplatePropsChanges(template, widget)
					const childCommand = {
						timestamp : new Date().getTime(),
						type : "UpdateWidget",
						template: lang.clone(template),
						widget: lang.clone(widget),
						resizes: resizes,
						deltaZ: deltaZ,
						deltaX: deltaX,
						deltaY: deltaY,
						isChildCommand: true,
						props: props
					};
					this.modelUpdateTemplate(childCommand, false);

					changes.push({type: 'template', action:"change", id: template.id})
					command.children.push(childCommand)
				}
			

			}
		})
	}

	addAndRemoveTemplateGroupWidgets (command, changes,group, groupTemplate, sortedChildren, boundingBox) {

		const [newTemplates, widgets, widgetGroups, oldWidgets] = this.getTemplatesToAddFromGroup(sortedChildren, boundingBox, group)
		const removeTemplates = this.getTemplatesToRemoveFromGroup(sortedChildren, groupTemplate, group)

		const deltaBoundingBox = this.getBoundingBoxDelta(oldWidgets, boundingBox);

		if (newTemplates.length > 0 || removeTemplates.length > 0) {
			this.logger.log(-1,"addAndRemoveTemplateGroupWidgets", "Add or remove templates > ", newTemplates, removeTemplates);

			// 1) add new widgets
			const createTemplateCommand = {
				timestamp : new Date().getTime(),
				type : "CreateTemplate",
				models : newTemplates,
				widgets : widgets
			};
			command.children.push(createTemplateCommand)
			this.modelAddTemplate(createTemplateCommand.models,createTemplateCommand.widgets);

			// 2) Update the group
			const updateTemplateGroupCommand = {
				timestamp : new Date().getTime(),
				type : "UpdateTemplateGroup",
				templateId: groupTemplate.id,
				addChildren: newTemplates.map(t => t.id),
				addWidgets:[],
				removeChildren: removeTemplates.map(t => t.id),
				removeWidgets: [],
				addChildGroups: widgetGroups,
				mergedInWidgets: widgets
			};

		
			// for all instances add or remove children
			const instanceGroups = ModelUtil.getGroupsByTemplate(groupTemplate.id, this.model)
			instanceGroups.forEach(instanceGroup => {
				if (instanceGroup.id !== group.id) {
					const allChildren = this.getAllGroupChildren(instanceGroup)
					const boundingBox = this.getBoundingBox(allChildren)	
					let targetScreen = this.getHoverScreen(boundingBox);

					// add the new wiggets relative
				
					let instanceGroupMinZ = ModelGeom.getMinZValueByIDs(allChildren, this.model) 
				
					// 3) build all the new widgets to add
					newTemplates.forEach(newTemplate => {									
						this.addNewTemplatesWidgets(
							newTemplate, targetScreen, instanceGroupMinZ, boundingBox, 
							deltaBoundingBox, instanceGroup, 
							widgetGroups, updateTemplateGroupCommand);
					})

					// 4) remove all not needed widgets in the instance group
		
					allChildren.forEach(id => {
						this.removeTemplatesWidget(id, removeTemplates, updateTemplateGroupCommand, targetScreen);
					})

				}				
			})	

			// 5) remove and unlink all old widgets. This should not 
			// happen before deleting the instances, otherwise stuff is not linked
			removeTemplates.forEach(removeTemplate => {
				const removeTemplateCommand = this.createRemoveAndUnlinkTemplateCommand(removeTemplate.id)
				command.children.push(removeTemplateCommand)
				this.modelRemoveAndUnlinkTemplate(removeTemplateCommand.templates)
			})
		
			command.children.push(updateTemplateGroupCommand)
			this.modelUpdateTemplateGroup(updateTemplateGroupCommand)			
		}

		return deltaBoundingBox
	}

	removeTemplatesWidget(id, removeTemplates, updateTemplateGroupCommand, targetScreen) {
		const widget = this.model.widgets[id];
		const removeTemplate = removeTemplates.find(t => t.id === widget.template);
		if (removeTemplate) {
			const group = this.getParentGroup(widget.id);
			updateTemplateGroupCommand.removeWidgets.push({
				screenId: targetScreen ? targetScreen.id : false,
				widget: lang.clone(widget),
				groupId: group ? group.id : false
			});
		}
	}

	addNewTemplatesWidgets(t, targetScreen, instanceGroupMinZ, boundingBox, deltaBoundingBox, instanceGroup, widgetGroups, updateTemplateGroupCommand) {
		const widget = this.factory.createTemplatedModel(lang.clone(t));
		if (targetScreen) {
			widget.name = this.getWidgetName(targetScreen.id, widget.name);
		}
		widget.id = "w" + this.getUUID();

		widget.z = instanceGroupMinZ + t.z;
		widget.x = boundingBox.x + t.x - deltaBoundingBox.x;
		widget.y = boundingBox.y + t.y - deltaBoundingBox.y;
		widget.template = t.id;

		let groupId = instanceGroup.id;
		if (widgetGroups[t.id]) {
			let subgroups = this.getAllChildGroups(instanceGroup);
			let subgroup = subgroups.find(g => g.template === widgetGroups[t.id]);
			if (subgroup) {
				groupId = subgroup.id;
			}
		}

		updateTemplateGroupCommand.addWidgets.push({
			screenId: targetScreen ? targetScreen.id : false,
			widget: widget,
			groupId: groupId
		});
	}

	getBoundingBoxDelta(oldWidgets, boundingBox) {
		const oldBoundingBox = this.getBoundingBoxByBoxes(oldWidgets);
		const deltaBoundingBox = {
			w: boundingBox.w - oldBoundingBox.w,
			h: boundingBox.h - oldBoundingBox.h,
			x: boundingBox.x - oldBoundingBox.x,
			y: boundingBox.y - oldBoundingBox.y
		};
		return deltaBoundingBox
	}

	getTemplatesToRemoveFromGroup (sortedChildren, groupTemplate) {
		const removeTemplates = []
		const instanceChildTemplateIds = {}
		sortedChildren.forEach(widget => instanceChildTemplateIds[widget.template] = true)
		groupTemplate.children.forEach(childTemplateId => {
			if (!instanceChildTemplateIds[childTemplateId]) {			
				const childTemplate = this.model.templates[childTemplateId]
				if (childTemplate) {
					this.logger.log(-1,"addAndRemoveTemplateGroupWidgets", "Remove > ", childTemplate.name);
					removeTemplates.push(childTemplate)
				}				
			}
		})
		return removeTemplates
	}

	getTemplatesToAddFromGroup (sortedChildren, boundingBox, parentGroup) {
		const newTemplates = []
		const newWidgets = []
		const widgetGroups = {}
		const oldWidgets = []
	
		sortedChildren.forEach((widget, index) => {		
			if (this.isNewChildInTemplatedGroup(widget, parentGroup)) {
	
				this.logger.log(-1,"addAndRemoveTemplateGroupWidgets", "Add > ", widget);
				const t = this._createOrCopyWidgetTemplate(widget, false, widget.name , "");
				t.x = widget.x - boundingBox.x;
				t.y = widget.y - boundingBox.y;
				t.z = index
	
				newTemplates.push(t);
				newWidgets.push(widget.id);

				const parentGroup = this.getParentGroup(widget.id)
				if (parentGroup) {
					if (parentGroup.template) {
						widgetGroups[t.id] = parentGroup.template
					} else {
						this.logger.log(-1,"addAndRemoveTemplateGroupWidgets", "New element group is not template > ", widget);
					}
				}
			} else {
				oldWidgets.push(widget)
			}
		})

		return [newTemplates, newWidgets, widgetGroups, oldWidgets]
	}

	isNewChildInTemplatedGroup (widget) {
		return widget.isNewTemplateChild
	}


	modelUpdateTemplateGroup(command, render) {
		this.logger.log(1,"modelUpdateTemplateGroup", "enter > ", command);

		if (!this.model.templates) {
			return
		}

		const template = this.model.templates[command.templateId]
		if (!template || !template.children) {
			this.logger.log(-1,"modelUpdateTemplateGroup", "No template > ", command.templateId);
			return
		}

		if (command.addChildren) {
			command.addChildren.forEach(id => {
				template.children.push(id)
			})
		}

		if (command.removeChildren) {
			command.removeChildren.forEach(removeId => {
				template.children = template.children.filter(childId => childId !== removeId)
			})
		}

		if (command.addChildGroups) {
			for (let templateId in command.addChildGroups) {
				let subgroupId = command.addChildGroups[templateId]
				let subgroup = template.groups.find(g => g.id === subgroupId)
				if (subgroup) {
					subgroup.children.push(templateId)
				}
			}
		}

		if (command.mergedInWidgets) {
			command.mergedInWidgets.forEach(id => {
				const widget = this.model.widgets[id]
				if (widget) {
					delete widget.isNewTemplateChild
				}
			})
		}

		if (command.removeWidgets) {
			this.modelRemoveWidgetsByCommandList(command.removeWidgets)
		}

		if (command.addWidgets) {
			this.modelAddWidgetsByCommandList(command.addWidgets)
		}
			
		if (render) {
			this.onModelChanged([{type: 'templateGroup', action:"change", id: template.id}])
			this.render();
		}
	}

	modelAddWidgetsByCommandList (list) {
		list.forEach(subCommand => {
			const widget = subCommand.widget
			widget.created = new Date().getTime()
			this.model.widgets[widget.id] = widget;
			if (this.model.groups && this.model.groups[subCommand.groupId]) {
				const parentGroup = this.model.groups[subCommand.groupId]
				parentGroup.children.push(widget.id)
			}else {
				this.logger.warn("modelAddWidgetsByCommandList", "No group > ", subCommand);
			}
			if (this.model.screens[subCommand.screenId]) {
				const scrn = this.model.screens[subCommand.screenId]
				scrn.children.push(widget.id)
			}
		})
	}

	modelRemoveWidgetsByCommandList (list) {
		list.forEach(subCommand => {
			const widget = subCommand.widget
			delete this.model.widgets[widget.id]
			if (this.model.groups && this.model.groups[subCommand.groupId]) {
				const parentGroup = this.model.groups[subCommand.groupId]
				parentGroup.children = parentGroup.children.filter(id => id !== widget.id)
			} else {
				this.logger.warn("modelRemoveWidgetsByCommandList", "No group > ", subCommand);
			}
			if (this.model.screens[subCommand.screenId]) {
				const scrn = this.model.screens[subCommand.screenId]
				scrn.children = scrn.children.filter(id => id !== widget.id)
			}
		})
	}

	modelRollBackUpdateTemplateGroup (command) {
		this.logger.log(-1,"modelRollBackUpdateTemplateGroup", "enter > ", command);

		if (!this.model.templates) {
			return
		}

		const template = this.model.templates[command.templateId]
		if (!template || !template.children) {
			this.logger.log(-1,"modelUpdateTemplateGroup", "No template > ", command.templateId);
			return
		}

		if (command.addChildren) {
			command.addChildren.forEach(id => {
				template.children = template.children.filter(childId => childId !== id)
			})
		}

		if (command.removeChildren) {
			command.removeChildren.forEach(id => {
				template.children.push(id)
			})
		}

		if (command.addChildGroups) {
			for (let templateId in command.addChildGroups) {
				let subgroupId = command.addChildGroups[templateId]
				let subgroup = template.groups.find(g => g.id === subgroupId)
				if (subgroup) {
					subgroup.children = subgroup.children.filter(childId => childId !== templateId)
				}
			}
		}

		if (command.mergedInWidgets) {
			command.mergedInWidgets.forEach(id => {
				const widget = this.model.widgets[id]
				if (widget) {
					widget.isNewTemplateChild = true
				}
			})
		}


		if (command.removeWidgets) {
			this.modelAddWidgetsByCommandList(command.removeWidgets)
		}

		if (command.addWidgets) {
			this.modelRemoveWidgetsByCommandList(command.addWidgets)
		}

		this.onModelChanged([{type: 'templateGroup', action:"change", id: template.id}])
		this.render();
	}


	undoUpdateTemplateGroup(command) {
		this.logger.log(-1,"undoUpdateTemplateGroup", "enter > ", command);
		this.modelRollBackUpdateTemplateGroup(command, true);
	}

	redoUpdateTemplateGroup(command) {
		this.logger.log(-1,"redoUpdateTemplateGroup", "enter > ", command);
		this.modelUpdateTemplateGroup(command, true)
	}


	/**********************************************************************
	 * Update Single Template
	 **********************************************************************/


    updateTemplateStyle (id, updatePositons = true){
		this.logger.log(0,"updateTemplateStyle", "enter > " + id);

		if (this.model.widgets[id]){
			const widget = this.model.widgets[id]
			if (widget.template && this.model.templates[widget.template]) {
				this.startModelChange()
				const template = this.model.templates[widget.template];
				const resizes = this.getWidgetTemplateResize(updatePositons, template, widget)
				const command = {
					timestamp : new Date().getTime(),
					type : "UpdateWidget",
					template: lang.clone(template),
					widget: lang.clone(widget),
					resizes: resizes,
					updateCopyTemplates: false,
					props: this.getWidgetTemplatePropsChanges(template, widget)
				};
				this.addCommand(command);
				this.modelUpdateTemplate(command, true);
				this.showSuccess("The template "  + template.name + " was updated.");
				this.commitModelChange()
			} else {
				this.logger.error("updateTemplateStyle", "No template > " + widget.template);
			}
		} else {
			this.logger.error("updateTemplateStyle", "No widget > " + id);
		}
	}

	getWidgetTemplatePropsChanges (template, updatedWidget) {
		let result = []
		if (template.props.label && updatedWidget.props.label) {	
			if (template.props.label !== updatedWidget.props.label) {
				const widgets = ModelUtil.getWidgetsByTemplate(template.id, this.model)
				widgets.forEach(widget => {
					if (widget.id !== updatedWidget.id && widget?.props.label === template.props.label ) {
						result.push({id: widget.id, type:'label', n: updatedWidget.props.label, o: widget.props.label})
					}
					// TODO: Update data binding props as well?
				})
			}
		}
		return result
	}



	getWidgetTemplateResize (updatePositons, template, updatedWidget = false, x = 0, y = 0, instanceBoundingBoxes, deltaBoundingBox) {
		let result = []
		if (!updatePositons) {
			this.logger.log(1,"getWidgetTemplateResize", "NO update");
			return
		}

		const widgets = ModelUtil.getWidgetsByTemplate(template.id, this.model)
		widgets.forEach(widget => {
			if (widget.id !== updatedWidget.id) {
			
				if (widget.w === template.w && template.w !== updatedWidget.w ) {
					result.push({id: widget.id, type:'w', n: updatedWidget.w, o: widget.w})
				}
				if (widget.h === template.h && template.h !== updatedWidget.h) {
					result.push({id: widget.id, type:'h', n: updatedWidget.h, o: widget.h})
				}

				if (instanceBoundingBoxes && instanceBoundingBoxes[widget.id]) {
					const boundBox = instanceBoundingBoxes[widget.id]
					result.push({id: widget.id, type:'x', n: boundBox.x + x + deltaBoundingBox.x, o: widget.x})
					result.push({id: widget.id, type:'y', n: boundBox.y + y + deltaBoundingBox.y, o: widget.y})
				}
			}
		})
		return result
	}

	modelUpdateTemplate  (command, render = true) {
		this.logger.log(1, "modelUpdateTemplate", "enter", command.deltaZ);

		const modified = new Date().getTime()
		const commandTemplate = command.template
		const commandWidget = command.widget
		const resizes = command.resizes

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
		template.modified = modified

		widget.modified = modified
		ModelUtil.updateTemplateStyle(widget, template, 'style')
		ModelUtil.updateTemplateStyle(widget, template, 'error')
		ModelUtil.updateTemplateStyle(widget, template, 'focus')
		ModelUtil.updateTemplateStyle(widget, template, 'active')
		ModelUtil.updateTemplateStyle(widget, template, 'hover')

		// We should also update props??

		// update modified on all variants, to rendering can pick up changes
		this.modelUpdateTemplateVariants(template, this.model, modified)


		// execute all widget position updates
		if (resizes) {
			resizes.forEach(r => {
				let widget = this.model.widgets[r.id]
				if (widget) {
					if (r.type === 'w') {
						widget.w = r.n
					}
					if (r.type === 'h') {
						widget.h = r.n
					}
					if (r.type === 'x') {
						widget.x = r.n
					}
					if (r.type === 'y') {
						widget.y = r.n
					}
				}
			})	
		}


		// if we have z change, update also all instances
		// and the template
		if (command.deltaZ !== undefined) {
			template.z = template.z - command.deltaZ
			const widgets = ModelUtil.getWidgetsByTemplate(template.id, this.model)
			widgets.forEach(widget => {
				if (commandWidget.id !== widget.id) {
					widget.z = widget.z - command.deltaZ
				}
			})
		}

		if (command.deltaX) {
			template.x = template.x - command.deltaX
		}

		if (command.deltaY) {
			template.y = template.y - command.deltaY
		}

		if (commandWidget.props.label !== template.props.label) {
			template.props.label = commandWidget.props.label
		}

		if (command.props) {
			command.props.forEach(r => {
				// might call double for selected?
				// 	if (commandWidget.id !== widget.id) {
				let widget = this.model.widgets[r.id]
				if (widget) {
					widget.props.label = r.n
				}
			})
		}

	
		if (render) {
			if (!command.isChildCommand) {
				this.logger.log(1,"modelUpdateTemplate", "enter");
				this.onModelChanged([{type: 'template', action:"change", id: template.id}])
				this.render();
			}
		}
	}


	modelUpdateTemplateVariants (template, model, modified) {
		let variants = ModelUtil.getVariantesOfTemplate(template, model)
		this.logger.log(1,"modelUpdateTemplateVariants", "enter", variants);
		variants.forEach(variant => {
			variant.modified = modified
		})
	}

	modelRollbackUpdateTemplate (command, render = true) {
		this.logger.log(1,"modelRollbackUpdateTemplate", "enter > ");

		const modified = new Date().getTime()
		// FIXME:we need to clone the command in here, 
		// because resetStylesInBox() will
		// pass references. As a result, undo() redo() actions might 
		// mingle with the element on the stack
		// this could be fixed by cloning the command in the undo() method
		const oldTemplate = lang.clone(command.template)
		const oldWidget = command.widget
		const resizes = command.resizes

		const template = this.model.templates[oldTemplate.id];
		const widget = this.model.widgets[oldWidget.id];
		if (template && widget) {
	
			template.modified = modified
			template.w = oldTemplate.w
			template.h = oldTemplate.h
			template.style = oldTemplate.style
			this.resetStylesInBox(template, oldTemplate)
			
			widget.style = oldWidget.style
			widget.modified = modified
			this.resetStylesInBox(widget, oldWidget)

			this.modelUpdateTemplateVariants(oldTemplate, this.model, modified)


			
			// undo all the position updates and set the
			// old value
			if (resizes) {
				resizes.forEach(r => {
					let widget = this.model.widgets[r.id]
					if (widget) {
						if (r.type === 'w') {
							widget.w = r.o
						}
						if (r.type === 'h') {
							widget.h = r.o
						}
						if (r.type === 'x') {
							widget.x = r.o
						}
						if (r.type === 'y') {
							widget.y = r.o
						}
					}
				})
			}

			// if we have z change, update also all instances
			// and the template
			if (command.deltaZ) {
				template.z = template.z + command.deltaZ
				const widgets = ModelUtil.getWidgetsByTemplate(template.id, this.model)
				widgets.forEach(widget => {
					if (oldWidget.id !== widget.id) {
						widget.z = widget.z + command.deltaZ
					}	
				})
			}


			if (command.deltaX) {
				template.x = template.x + command.deltaX
			}
	
			if (command.deltaY) {
				template.y = template.y + command.deltaY
			}

			if (oldTemplate.props.label) {
				template.props.label = oldTemplate.props.label
			}

			if (command.props) {
				command.props.forEach(r => {
					let widget = this.model.widgets[r.id]
					if (widget) {
						widget.modified = new Date().getTime()
						widget.props.label = r.o
					}
				})
			}

		} else {
			this.logger.warn("modelRollbackUpdateTemplate", "Cannot find template or widget");
		}
		
		if (render) {
			if (!command.isChildCommand) {
				this.onModelChanged([{type: 'template', action:"change", id: template.id}])
				this.render();
			}
		}
	}

	resetStylesInBox (box, oldBox) {
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
		this.logger.log(1,"undoUpdateWidget", "enter > ", command);
		this.modelRollbackUpdateTemplate(command, true);
		this.render()
	}

	redoUpdateWidget (command){
		this.logger.log(1,"redoUpdateWidget", "enter > ");
		this.modelUpdateTemplate(command, true);
		this.render()
	}



	/**********************************************************************
	 * Create Template
	 **********************************************************************/



	addTemplateWidget (widget, name, description){
		this.logger.log(0,"addTemplateWidget", "enter > " + name);
		this.startModelChange()
		const template = this._createWidgetTemplate(widget, true, name, description);

		const command = {
			timestamp : new Date().getTime(),
			type : "CreateTemplate",
			models : [template],
			widgets : [widget.id],
		};
		this.addCommand(command);
		this.modelAddTemplate([template],[widget.id]);
		this.updateCreateWidget();
		this.onLayerListChange()
		this.commitModelChange(true, true)
		this.showSuccess("The template "  + name + " was created. You can find it in the Create menu");
	}

	_createOrCopyWidgetTemplate (widget, visible, name) {
		if (widget.template) {
			let parentTemplate = this.model.templates[widget.template]
			if (parentTemplate) {
				let template = this._createTemplateVariant(widget, parentTemplate, visible, name)
				return template
			}
		}
		return this._createWidgetTemplate(widget, visible, name)
	}


	_createTemplateVariant (widget, parentTemplate, visible, name) {
		let template = {}//lang.clone(parentTemplate)
		template.id = "tw" + this.getUUID();
		template.visible = visible;
		template.variant = true
		template.name = name;
		template.modified = new Date().getTime()
		template.created = new Date().getTime()
		template.w = widget.w;
		template.h = widget.h;
		template.z = widget.z;
		template.x = 0;
		template.y = 0;
		template.templateType = "Widget";
		template.type = widget.type;
		template.has = lang.clone(widget.has);
		template.props = lang.clone(widget.props);
		template.variantOf = parentTemplate.variantOf ? parentTemplate.variantOf : parentTemplate.id
		// here we could compute the difference between parent and widget?
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
		return template
	}

	_createTemplateCopy (widget, parentTemplate, visible, name) {
		let template = lang.clone(parentTemplate)
		template.id = "tw" + this.getUUID();
		template.visible = visible;
		template.variant = true
		template.name = name;
		template.modified = new Date().getTime()
		template.created = new Date().getTime()
		template.w = widget.w;
		template.h = widget.h;
		template.z = widget.z;
		template.x = 0;
		template.y = 0;
		template.templateType = "Widget";
		template.type = widget.type;
		template.has = lang.clone(widget.has);
		template.props = lang.clone(widget.props);
		template.copyOf = template.copyOf ? template.copyOf : widget.template
		ModelUtil.mixinNewStyles(template, widget)
		return template
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

		this.startModelChange()
		const command = {
			timestamp : new Date().getTime(),
			type : "CreateTemplate",
			models : [],
			widgets : [],
			groupID : group.id
		};

		const allChildren = this.getAllGroupChildren(group)
		const boundingBox = this.getBoundingBox(allChildren);
		const sortChildren = this.sortChildren(allChildren)

		/**
		 * make one group template!
		 */
		const template = {};
		template.id = "tg" + this.getUUID();
		template.type = "Group";
		template.templateType = "Group";
		template.visible = true;
		template.name = name;
		template.children = [];
		template.groups = []
		template.w = boundingBox.w
		template.h = boundingBox.h

		command.group = template;


		/**
		 * make templates for all children
		 */
		const template2Widget = {}
		sortChildren.forEach((widget, index) => {
	
			// some if the widgets might be already templates. In the case
			// we create just a copy
			const t = this._createOrCopyWidgetTemplate(widget, false, widget.name , "");
			t.x = widget.x - boundingBox.x;
			t.y = widget.y - boundingBox.y;
			t.z = index

			template.children.push(t.id);
			command.models.push(t);
			command.widgets.push(widget.id);
			template2Widget[widget.id] = t.id
		})
	

		this._createSubGroupTemplates(template, group, template.id, name, template2Widget)

		this.addCommand(command);
		this.modelAddTemplate(command.models,command.widgets,command.group, command.groupID);
		this.updateCreateWidget();
		this.onLayerListChange()
		this.commitModelChange(true, true)
	}

	_createSubGroupTemplates (template, group, parentID, name, template2Widget) {
		if (group.groups) {
			group.groups.forEach(subID => {
				const subgroup = this.model.groups[subID]
				if (subgroup) {
					const childTemplate = {
						id : 'tsg' + this.getUUID(),
						name: subgroup.name,
						templateType: "Group",
						groupID: subgroup.id, // FIXME: This is an ugly typo
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

					// for templates we store all child groups in the template, and do not
					// create different templates as we would do for the normal groups. 
					// This makes the preview and create rendering easy.
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
			//this.model.groups[groupID].templateChildren = widgetIDs
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

					// here is a bug. We should weave in the original styles
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
			//delete this.model.groups[groupID].templateChildren 
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
		this.startModelChange()

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
		this.commitModelChange(true, true)
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

		const widget = this.model.widgets[id]
		if (widget.template) {
			/**
			 * Since 4.0.60 we have to deal with variants as well
			 */
			let template = ModelUtil.getMergedTemplate(widget.template, this.model);
			if (template) {
				ModelUtil.setMergedTemplateStyle(widget, template, "style")
				ModelUtil.setMergedTemplateStyle(widget, template, "hover")
				ModelUtil.setMergedTemplateStyle(widget, template, "focus")
				ModelUtil.setMergedTemplateStyle(widget, template, "error")
				ModelUtil.setMergedTemplateStyle(widget, template, "active")
			}
		}
		delete widget.isRootTemplate
		delete widget.isNewTemplateChild
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
		this.startModelChange()
		const command = this.createRemoveAndUnlinkTemplateCommand(id)
		this.modelRemoveAndUnlinkTemplate(command.templates)
		this.addCommand(command);
		this.render()
		this.commitModelChange(true, true)
	}

	createRemoveAndUnlinkTemplateCommand (id) {
		this.logger.log(-1,"createRemoveAndUnlinkTemplateCommand", "enter > ", id);

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

		const command = {
			timestamp : new Date().getTime(),
			type : "RemoveAndUnlinkTemplate",
			templates: templates
		}
		return command
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