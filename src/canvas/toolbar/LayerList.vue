<template>
     <div class="MatcToolbarLayerList MatcToobarPropertiesSection MatcToolbar">
		<div class="MatcToolbarLayerListCntr" data-dojo-attach-point="cntr">
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import ScrollContainer from 'common/ScrollContainer'
import Util from 'core/Util'

export default {
    name: 'LayerList',
    mixins:[Util, DojoWidget],
    data: function () {
        return {
            sections: [], 
            screenListeners: {}, 
            expanded: {}
        }
    },
    components: {},
    methods: {
      postCreate (){
				this.logger = new Logger("LayerList");
				this.logger.log(-1,"constructor", "entry > " + this.mode);	
				this.db = new DomBuilder();
				this.init();
			},
			
			init (){
				this.screenCntr = this.db.div("MatcToolbarLayerListScreenCntr").build();
				this.scroller = this.$new(ScrollContainer);
				this.scroller.placeAt(this.cntr);
				this.scroller.wrap(this.screenCntr, 40);
			},
			
			setController (c){
				this.controller = c;
			},
			
			setCanvas (c){
				this.canvas = c;
			},
			
			setToolbar (t) {
				this.toolbar = t;
			},
			
			setModel (m){
				this.model = m;
			},
		
			
			createNestedModel (model){
				var result = [];
				
				// 1) Build group lookup
				let widget2Group = {};
				for(let id in model.groups){
					let group = model.groups[id];
					for (let i=0; i < group.children.length; i++){
						let widgetID = group.children[i];
						widget2Group[widgetID] = group;
					}
				}
				//console.debug(widget2Group);
				// let widgets = this.getOrderedWidgets(model.widgets);
				// widgets = widgets.reverse();
				
				for(let id in model.screens){
					let screen = model.screens[id];
					let widgets = {}
					for (let i=0; i < screen.children.length; i++){
						let widgetID = screen.children[i];
						let widget = model.widgets[widgetID];
						if (widget) {
							widgets[widget.id] = widget
						}
					}
					let sorted = this.getOrderedWidgets(widgets).reverse();			
					let node = {
						screen:screen,
						children: []
					};
					let group2Node = {};
					for(let i=0; i< sorted.length; i++){
						let widget = sorted[i];
						if (widget2Group[widget.id]){
							let group = widget2Group[widget.id]
							if(!group2Node[group.id]){
								let groupNode = {
									group: group,
									children: []
								};
								node.children.push(groupNode);
								group2Node[group.id] = groupNode;
							}
							group2Node[group.id].children.push({widget: widget})
						} else {
							node.children.push({widget: widget})
						}					
					}
					result.push(node)				
				}
				return result;
			},
		
			render (model){
				this.logger.log(-1,"render", "render > ", );
				this.cleanUp();
				this.model = model;
				var nested = this.createNestedModel(model);
				var parent = this.db.div("MatcLayerListScreens").build();
				for(var i=0; i< nested.length; i++){
					var node = nested[i]
					this.renderScreen(node, parent);
				}
				this.screenCntr.appendChild(parent);
				this.setExpanded();
			},
			
			
			
			renderScreen (node, parent){
				this.logger.log(3,"renderScreen", "render > ", node.screen.name);
				var screen = node.screen;
				var section = this.createSection(node.screen);
				
				var content = this.db
					.div("MatcToolbarSectionContent").build(section);
				
				var children = node.children;
				for(let i=0; i< children.length; i++){
					let child = children[i]
					if (child.widget){
						let widgetDiv = this.db.div("MatcLayerListWidget").build(content);
						widgetDiv.setAttribute("draggable", true);
						widgetDiv.setAttribute("widget", child.widget.id);
						widgetDiv.setAttribute("screen", screen.id);
						
						this.db.span(" MatcLayerListRowIcon " + this.getNodeIcon(child.widget)).build(widgetDiv);
						let lbl = this.db.span("MatcLayerListRowLabel", this.getNodeLabel(child.widget)).build(widgetDiv);
						this.nodeDivs[child.widget.id] = widgetDiv;
						
						this.addScreenListner(screen, widgetDiv, "click", lang.hitch(this, "setSelectedWidget", child.widget, false));
						this.addScreenListner(screen, widgetDiv, "dblclick", lang.hitch(this, "startInlineEdit", child.widget, lbl, "widget"));
						this.addScreenListner(screen, widgetDiv, "dragstart", lang.hitch(this, "startDND", child.widget, screen, null, "widget"));
						
					}
					if (child.group){
						let groupDiv = this.db.div("MatcLayerListGroupCntr").build(content);
						groupDiv.setAttribute("draggable", true);					
						
						let groupNode = this.db.div("MatcLayerListGroup").build(groupDiv);
						let chevron = this.db.span("MatcLayerListGroupIcon MatcLayerListExpandIcon MatcLayerListRowIcon mdi mdi-menu-down").build(groupNode);
						//var icon = this.db.span(" MatcLayerListRowIcon mdi mdi-folder-outline").build(groupNode);
						let lbl = this.db.span("MatcLayerListRowLabel", child.group.name).build(groupNode);
						
						// groupNode.setAttribute("widget", false);
						groupNode.setAttribute("group", child.group.id);
						groupNode.setAttribute("screen", screen.id);
					
						
						this.renderChildren(screen, child, groupDiv, child.group);
						this.nodeDivs[child.group.id] = groupDiv;
						this.addExpand(screen, child.group.id+"_cntr", chevron, groupDiv);
						this.addScreenListner(screen, groupNode, "click", lang.hitch(this, "setSelectedGroup", child.group));
						this.addScreenListner(screen, groupNode, "dblclick", lang.hitch(this, "startInlineEdit", child.group, lbl, "group"));
						this.addScreenListner(screen, groupDiv, "dragstart", lang.hitch(this, "startDND", null, screen, child.group, "group"));
					}
				}
				
				this.nodeDivs[node.screen.id] = section;
				parent.appendChild(section);
				this.addScreenListner(screen, content, "dragover", lang.hitch(this, "canDND"));
				this.addScreenListner(screen, content, "drop", lang.hitch(this, "endDND"));
				this.addScreenListner(screen, content, "dragend", lang.hitch(this, "endDND"));
			},
			
			getNodeIcon (box){
				if (box.type == "Label") {
					return "mdi mdi-format-title";
				}
				if (box.type == "Icon") {
					if (box.style.icon){
						return box.style.icon;
					}
				}
	//			if (box.type == "RadioBox2" || box.type == "RadioGroup") {
	//				return "mdi mdi-radiobox-marked"
	//			}
	//			if (box.type == "CheckBox" || box.type == "CheckBoxGroup") {
	//				return "mdi mdi-checkbox-marked"
	//			}
				return "mdi mdi-crop-portrait";
			},
			
			getNodeLabel (box){
				if (box.props && box.props.label) {
					return  box.props.label
				}
				return box.name; // + " (" + box.id + " - " + box.z + ")";
			},
			
			
			renderChildren (screen, node, content, group){
				var children = node.children;
				for(var i=0; i< children.length; i++){
					var child = children[i]
					if (child.widget){
						var widgetDiv = this.db.div("MatcLayerListWidget").build(content);
						widgetDiv.setAttribute("draggable", true);
						widgetDiv.setAttribute("widget", child.widget.id);
						widgetDiv.setAttribute("screen", screen.id);
						widgetDiv.setAttribute("group", group.id);
						
						this.db.span("MatcLayerListRowIcon mdi mdi-crop-portrait").build(widgetDiv);
						var lbl = this.db.span("MatcLayerListRowLabel", this.getNodeLabel(child.widget)).build(widgetDiv);
						this.nodeDivs[child.widget.id] = widgetDiv;
						
						this.addScreenListner(screen, widgetDiv, "click", lang.hitch(this, "setSelectedWidget", child.widget, false));
						this.addScreenListner(screen, widgetDiv, "dblclick", lang.hitch(this, "startInlineEdit", child.widget, lbl, "widget"));
						this.addScreenListner(screen, widgetDiv, "dragstart", lang.hitch(this, "startDND", child.widget, screen, group, "widget"));
					}
				}
			},
			
			
			startDND (widget, screen, group){
				//console.debug("startDND", widget, screen.name, group, type);
				
				if (widget) {
					this._dndStartWidgetID = widget.id;
				}
				if (screen) {
					this._dndStartScreenID = screen.id;
				}
				if (group) {
					this._dndStartGroupID = group.id;
				}			
			},

			canDND (e) {
				this.stopEvent(e);
				
				var div = e.target;
				var widgetId = div.getAttribute("widget");
				var screenID = div.getAttribute("screen");
				var groupID = div.getAttribute("group");
				var count = 0;
				
				while (!screenID && count < 5) {
					div = div.parentNode;
					widgetId = div.getAttribute("widget");
					screenID = div.getAttribute("screen");
					groupID = div.getAttribute("group");
					count++;
				}
				if (this._dndStartScreenID == screenID) {
					if (widgetId != this._dndWidgetID || screenID != this._dndScreenID || groupID != this._dndGroupID){
						this._dndWidgetID = widgetId;
						this._dndScreenID = screenID;
						this._dndGroupID = groupID;
						if (this._dndDiv) {
							css.remove(this._dndDiv, "MatcLayerListDragOver");
						}
						
						css.add(div, "MatcLayerListDragOver");
						this._dndDiv = div;
					}
				} else {
					if (this._dndDiv) {
						css.remove(this._dndDiv, "MatcLayerListDragOver");
					}
					this._dndWidgetID = widgetId;
					this._dndScreenID = screenID;
				}
			
				return true;
			},
			
			endDND (e){
				this.stopEvent(e);
				// the end node is the dragged node, so we use the ids from the canDND
				// var div = e.target;
				if (this._dndScreenID){
					//console.debug("endDND", this._dndWidgetID, this._dndScreenID, this._dndGroupID);
					if (this.controller){
						this.controller.changeLayer(this._dndStartScreenID, this._dndStartWidgetID, this._dndStartGroupID, this._dndScreenID, this._dndWidgetID, this._dndGroupID);
					} else {
						console.debug("changeLayer(", this._dndStartWidgetID, this._dndStartGroupID, this._dndWidgetID, this._dndGroupID);
					}
				}
				
				this.cleanDND();
			},
			
			cleanDND (){
				delete this._dndStartWidgetID;
				delete this._dndStartScreenID;
				delete this._dndStartGroupID;
				delete this._dndWidgetID;
				delete this._dndScreenID;
				delete this._dndGroupID;
				if (this._dndDiv) {
					css.remove(this._dndDiv, "MatcLayerListDragOver");
				}
			},
			
			
			selectWidget (widgetID){
				var widget = this.model.widgets[widgetID];
				if (widget){
					this.setSelectedWidget(widget, true);
				} else {
					console.debug("selectWidget() > cannot find", widgetID);
				}
			},
			
			
			
			
			setSelectedWidget (widget, ignoreCanvas){
				//console.debug("setSelectedWidget",widget);
				if (this._selectedDiv){
					css.remove(this._selectedDiv,"MatcLayerListNodeSelected");
					delete this._selectedDiv;
				}
				if (widget){
					var div = this.nodeDivs[widget.id];
					if (div){
						css.add(div, "MatcLayerListNodeSelected");
						this._selectedDiv = div;
						if (ignoreCanvas ) {
							if (!this.selectedWidget || this.selectedWidget.id != widget.id) {
								this._selectedDiv.scrollIntoView()
							}
						}
					}
				}
				this.selectedWidget = widget;
				if(this.canvas && ignoreCanvas !== true){
					this.canvas.onWidgetSelected(widget.id, true);
				}
			},
			
			selectGroup (groupID){
				var group = this.model.groups[groupID];
				if (group){
					this.setSelectedGroup(group, true);
				}
			},
			
			setSelectedGroup (group, ignoreCanvas){
				if (this._selectedDiv){
					css.remove(this._selectedDiv,"MatcLayerListNodeSelected");
					delete this._selectedDiv;
				}
				if (group){
					var div = this.nodeDivs[group.id];
					if (div){
						css.add(div, "MatcLayerListNodeSelected");
						this._selectedDiv = div;
					}
				}
				this.selectedGroup = group;
				if(this.canvas && ignoreCanvas !== true){
					this.canvas.onGroupSelected(group.id, true);
				}
			},

			createSection (screen){
				var parent = document.createElement("div");
				css.add(parent, "MatcToolbarSection");
				var header = this.createSectionHeader( parent, screen.name);	
				this.addExpand(screen, screen.id+"_header", header, parent);
				this.sections.push(parent);
				return parent;
			},
			

			createSectionHeader (parent, lbl){
				
				var header = this.db.div("MatcToolbarSectionLabel", lbl).build(parent);
				this.db.span("MatcToolbarSectionChevron MatcLayerListExpandIcon mdi mdi-chevron-down").build(header);
				
				return header;
			},
			
			addExpand (screen, id, node, cntr){
				this.addScreenListner(screen, node, "click", lang.hitch(this, "toggleExpand" , cntr, id));
				if (!this.expanded[id]){
					this.expanded[id] = {
						cntr: cntr,
						isExpanded: true	
					}
				}
				this.expanded[id].cntr =  cntr;
			},
			
			toggleExpand (node, id){
				
				var status = this.expanded[id];
				if (status.isExpanded){
					css.add(status.cntr, "MatcToolbarSectionCollabsed");
					status.isExpanded = false;
				} else {
					css.remove(status.cntr, "MatcToolbarSectionCollabsed");
					status.isExpanded = true;
				}
				console.debug("toggleExpand", id, this.expanded[id]);
			},
			
			setExpanded (){
				
				for (var id in this.expanded){
					var status = this.expanded[id];
					if (status.isExpanded){
						css.remove(status.cntr, "MatcToolbarSectionCollabsed");
					} else {
						css.add(status.cntr, "MatcToolbarSectionCollabsed");
					}
				}
			},
			
			addScreenListner (screen, node, event, callback){
				//console.debug("addScreenListner", screen, node);
				var listener = on(node, event, callback);
				if (!this.screenListeners[screen.id]){
					this.screenListeners[screen.id] = [];
				}
				this.screenListeners[screen.id].push(listener);
			},
			
			
			startInlineEdit (model, lbl, type, e){
				this.logger.log(-1,"startInlineEdit", "entry > " + model.name);	
				this.stopEvent(e);
				
				this.endInlineEdit();
				
				this._inlineEditDiv = lbl;
				this._inlineInnerHTML = this._inlineEditDiv.innerHTML;
				this._inlineEditDiv.setAttribute("contentEditable", true);
				css.add(lbl, "MatcIgnoreOnKeyPress")
				this._inlineEditDiv.focus();
				css.add(this._inlineEditDiv,"MatcInlineEditableStarted");
				this.setEndOfContenteditable(this._inlineEditDiv);
			
				this._inlinebBlurListener = on(this._inlineEditDiv, "blur", lang.hitch(this, "endInlineEdit", model, type));
				this._inlinebKeyUpListener = on(this._inlineEditDiv, "keydown", lang.hitch(this, "onKeyDown", model, type));
				this._inlinebKeyDownListener = on(this._inlineEditDiv, "keyup", lang.hitch(this, "onKeyUp", model, type));
				
			},
			
			onKeyUp (model, type){
				if (this.toolbar && this._inlineEditDiv){
					var txt = this.getInlineTxt();
					this.toolbar.onModelNameChange(model.id, type, txt);
				}
			},
			
			onKeyDown (model, type, e){		
				var k = e.keyCode ? e.keyCode : e.which;
				if (k == 13){
					this.stopEvent(e);
					this.endInlineEdit(model, type);
				}
				if (k == 27){
					this._inlineEditDiv.innerHTML = model.name;
					if (this.toolbar){
						this.toolbar.onModelNameChange(model.id, type, model.name);
					}
					this.cleanUpInlineEdit();
				}
			},
			
			getInlineTxt (){
				if (this._inlineEditDiv){
					var txt = this._inlineEditDiv.innerHTML;	
					txt = txt.replace(/<br>/g, "");
					txt = txt.replace(/&nbsp;/g, " ");
					txt = txt.replace(/%/g, "$perc;"); 
					return txt;
				}
			},
			
			endInlineEdit (model, type, e){
				this.stopEvent(e);
				if (this._inlineEditDiv){
					var txt = this.getInlineTxt();
					this.logger.log(-1,"endInlineEdit", "exit > OLD: " + model.name  + " >> NEW:" + txt + " " + type);
					
					if (this.controller) {
						if (type == "widget"){
							this.controller.setWidgetName(model.id, txt)
						} else if (type == "screen"){
							this.controller.setScreenName(model.id, txt)
						} else if (type == "group"){
							this.controller.setGroupName(model.id, txt)
						}
					}
				}
				this.cleanUpInlineEdit();
			},
			
			cleanUp (){
				this.screenCntr.innerHTML = "";
				this.nodeDivs = {}
				for (var id in this.screenListeners){
					var list = this.screenListeners[id];
					for (var i =0; i < list.length; i++){
						list[i].remove();
					}
				}
				this.screenListeners = {};
				this.cleanUpInlineEdit();
			},
			
			cleanUpInlineEdit (){
				if(this._inlinebBlurListener){
					this._inlinebBlurListener.remove();
					delete this._inlinebBlurListener;
				}
				if (this._inlinebKeyUpListener){
					this._inlinebKeyUpListener.remove();
					delete this._inlinebKeyUpListener;
				}
				if (this._inlinebKeyDownListener){
					this._inlinebKeyDownListener.remove();
					delete this._inlinebKeyDownListener;
				}
				if (this._inlineEditDiv){
					this._inlineEditDiv.setAttribute("contentEditable", false);
					this._inlineEditDiv.blur();
				}
				delete this._inlineEditDiv;
			},
			
			
			setEndOfContenteditable (contentEditableElement){
					var range,selection;
					if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
					{
							range = document.createRange();//Create a range (a range is a like the selection but invisible)
							range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
							range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
							selection = window.getSelection();//get the selection object (allows you to change selection)
							selection.removeAllRanges();//remove any selections already made
							selection.addRange(range);//make the range you have just created the visible selection
					}
					else if(document.selection)//IE 8 and lower
					{ 
							range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
							range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
							range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
							range.select();//Select the range (make it the visible selection
					}
			}
    }, 
    mounted () {
    }
}
</script>