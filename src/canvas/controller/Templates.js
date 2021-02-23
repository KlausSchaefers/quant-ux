import BaseController from 'canvas/controller/BaseController'
import lang from 'dojo/_base/lang'

export default class Templates extends BaseController{

    updateTemplateStyle (id){
			this.logger.log(0,"updateTemplateStyle", "enter > " + id);

			if (this.model.widgets[id]){
				var widget = this.model.widgets[id]
				if (widget.template && this.model.templates[widget.template]) {

					var template = this.model.templates[widget.template];
					var command = {
						timestamp : new Date().getTime(),
						type : "UpdateWidget",
						template: template,
						widget: widget,
					};
					this.addCommand(command);

					this.modelUpdateTemplate(template, widget);

					this.showSuccess("The template "  + template.name + " was updated.");

				} else {
					this.logger.error("updateTemplateStyle", "No template > " + widget.template);
				}
			} else {
				this.logger.error("updateTemplateStyle", "No widget > " + id);
			}
		}

		modelUpdateTemplate  (template, widget) {
			for (let key in widget.style) {
				let value = widget.style[key]
				template.style[key] = value
				this.logger.log(0,"modelUpdateTemplate", "enter > " + key + " : "  + value);
			}
			widget.style = {};

			if (widget.hover) {
				let style = widget.hover
				if (!template.hover) {
					template.hover = {}
				}
				for (let key in style) {
					let value = style[key]
					template.hover[key] = value
					this.logger.log(0,"modelUpdateTemplate", "enter > " + key + " : "  + value);
				}
				widget.hover = {};
			}

			if (widget.error) {
				let style = widget.error
				if (!template.error) {
					template.error = {}
				}
				for (let key in style) {
					let value = style[key]
					template.error[key] = value
					this.logger.log(0,"modelUpdateTemplate", "enter > " + key + " : "  + value);
				}
				widget.hover = {};
			}

			if (widget.focus) {
				let style = widget.focus
				if (!template.focus) {
					template.focus = {}
				}
				for (let key in style) {
					let value = style[key]
					template.focus[key] = value
					this.logger.log(0,"modelUpdateTemplate", "enter > " + key + " : "  + value);
				}
				widget.focus = {};
			}

			template.modified = new Date().getTime()
			this.onModelChanged([{type: 'template', action:"change", id: template.id}])
			this.render();
		}

		modelRollbackUpdateTemplate (oldTemplate, oldWidget) {
			var template = this.model.templates[oldTemplate.id];
			var widget = this.model.widgets[oldWidget.id];
			if (template && widget) {
				template.style = oldTemplate.style
				widget.style = oldWidget.style
			}
			this.onModelChanged([{type: 'template', action:"change", id: template.id}])
			this.render();
		}

		undoUpdateWidget (command){
			this.logger.log(0,"undoUpdateWidget", "enter > ", command);
			this.modelRollbackUpdateTemplate(command.template, command.widget);
		}

		redoUpdateWidget (command){
			this.logger.log(0,"redoUpdateWidgetfunction", "enter > ");
			this.modelUpdateTemplate(command.template, command.widget);
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

			template.style = lang.clone(widget.style);
			template.has = lang.clone(widget.has);
			template.props = lang.clone(widget.props);
			template.w = widget.w;
			template.h = widget.h;
			template.z = widget.z;
			template.x =0;
			template.y =0;
			template.templateType = "Widget";
			template.type = widget.type;
			template.visible=visible;
			template.name = name;
			template.modified = new Date().getTime()
			template.created = new Date().getTime()
			return template;
		}

		addTemplateScreen (screen, name){
			this.logger.log(0,"addTemplateScreen", "enter > " + name);

			this.updateCreateWidget();
		}

		addTemplateGroup (group, name){
			this.logger.log(0,"addTemplateGroup", "enter > " + name);


			var command = {
				timestamp : new Date().getTime(),
				type : "CreateTemplate",
				models : [],
				widgets : [],
				groupID : group.id
			};

			/**
			 * make one group template!
			 */
			var template = {};
			template.id = "tg" + this.getUUID();
			template.type = "Group";
			template.templateType = "Group";
			template.visible=true;
			template.name = name;
			template.children = [];
			command.group = template;


			/**
			 * make templates for all children
			 */
			let allChildren = this.getAllGroupChildren(group)
			var boundingBox = this.getBoundingBox(allChildren);
			for(var i=0; i < allChildren.length; i++){
				var widgetID = allChildren[i];
				var widget = this.model.widgets[widgetID];

				var t = this._createWidgetTemplate(widget, false, name+"_"+i, "");
				// add also relative coords!
				t.x = widget.x - boundingBox.x;
				t.y = widget.y - boundingBox.y;

				template.children.push(t.id);
				command.models.push(t);
				command.widgets.push(widgetID);
			}

			this.addCommand(command);
			this.modelAddTemplate(command.models,command.widgets,command.group, command.groupID);
			this.updateCreateWidget();
		}

		modelAddTemplate (templates, widgetIDs, group, groupID){

			if(!this.model.templates){
				this.model.templates = {};
			}

			for(var i=0; i < templates.length; i++){
				var t = templates[i];
				this.model.templates[t.id] = t;
				// make widget instance of template as well
				var widgetID = widgetIDs[i];
				var widget = this.model.widgets[widgetID];
				if(widget){
					widget.template = t.id;
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
				} else {
					console.warn("No Widget with ", widgetID);
				}
			}

			if(group){
				this.model.templates[group.id] = group;
			}
			if(groupID){
				this.model.groups[groupID].template = group.id;
			}
			this.onModelChanged([{type: 'template', action: 'add'}]);
			this.showSuccess("The template was created. You can find it in the 'Create' menu");
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
			this.logger.log(0,"removeTemplate", "enter > " + id);
		}


		modelRemoveTemplate (templates, widgetIDs, group, groupID){

			if(this.model.templates){
				for(var i=0; i < templates.length; i++){
					var t = templates[i];
					delete this.model.templates[t.id];

					var widgetID = widgetIDs[i];
					var widget = this.model.widgets[widgetID];
					if(widget){
						delete widget.template;
						widget.style = t.style;

					} else {
						console.warn("No widget with ", widgetID);
					}
					/**
					 * delete all children recursive
					 */
					if(t.children){
						this.modelRemoveTemplate(t.children, true);
					}

				}
			}

			if(group){
				delete this.model.templates[group.id];
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





		updateTemplateWidget (){

		}
	}