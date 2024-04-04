<script>
import lang from 'dojo/_base/lang'
import css from 'dojo/css'

import topic from 'dojo/topic'
import CanvasSelection from './CanvasSelection'
import * as SelectionUtil from 'core/SelectionUtil'

 export default {
    name: 'Select',
    mixins:[],
    data: function () {
        return {
            resizeButtonSize: 3,
            resizeBorder: 2,
            resizeEnabled: true
        }
    },
    components: {},
    methods: {

		initSelection () {
			this._canvasSelection = new CanvasSelection()
		},

		/**********************************************************************
		 * Screen Select
		 **********************************************************************/

		setSelectedScreens (screenIDs, expand = false, render = true) {
			this.logger.log(-1, 'setSelectedScreens', screenIDs, expand, render)
			this.unSelect()					
			this._canvasSelection.setSelectedScreens(this.model, screenIDs, expand)
			if (render) {
				this.renderScreenSelection()
			}
		},

		hasScreenSelection() {
			return this._canvasSelection.screens.length > 0
		},

		renderScreenSelection () {
			this.logger.log(-1, "renderScreenSelection", "enter > ");
			if (this._canvasSelection.screens.length === 1) {
				this.renderSingleScreenSelection()
			} 
			if (this._canvasSelection.screens.length > 1) {
				this.renderMultiScreenSelection()
			}
		},

		renderMultiScreenSelection () {
			this.logger.log(1, "renderMultiScreenSelection", "enter > ");

			const divs = []
			const ids = []
			for (let i = 0; i < this._canvasSelection.screens.length; i++) {
				const scrn = this._canvasSelection.screens[i]
				const id = scrn.id
				ids.push(id)
				if (this.model.screens[id]) {			
					const parent = this.screenDivs[id];
					divs.push(parent)		
				}
			}
			this.onSelectionChanged(null, "screens", false);
			this.selectMultiBoxes(divs)

			try {
				/** 
				 * this is the layerlist...
				 */
				if (this.selectionListener) {
					this.selectionListener.selectScreens(ids);
				}
			} catch (e){
				this.logger.error("_selectSingleScreen", "could not call selectionListener > ", e);
			}
			
			css.add(this.domNode, "MatcCanvasSelection");
		},

		renderSingleScreenSelection () {
			this.logger.log(1, "renderSingleScreenSelection", "enter > ");

			const scrn = this._canvasSelection.screens[0]
			const id = scrn.id
			this.onSelectionChanged(id, "screen", false);

			if (this.model.screens[id]) {			
				const parent = this.screenDivs[id];
				this.showResizeHandles(scrn, id, parent, "screen", true);
				this.selectBox(parent);

				this.controller.onScreenSelected(id);
				// select in layerList???s
				css.add(this.domNode, "MatcCanvasSelection");
			}

			try {
				/** 
				 * this is the layerlist...
				 */
				if (this.selectionListener) {
					this.selectionListener.selectScreens([id]);
				}
			} catch (e){
				this.logger.error("_selectSingleScreen", "could not call selectionListener > ", e);
			}
		
		},

		getSelectedScreen () {
			if (this._canvasSelection.screens.length === 1) {
				/**
				 * FIXME: After a zoom this might be the wrong object...
				 */
				return this._canvasSelection.screens[0]
			}
			return null
		},

		isScreenSelected (id) {
			if (this.getSelectedScreen()) {
				return this.getSelectedScreen().id === id
			}
			if (this._selectMulti) {
				return this._selectMulti.indexOf(id) > -1
			}
			return false
		},

		/**********************************************************************
		 * Widget Select
		 **********************************************************************/

		setSelectionById (id) {
			const selectedWidget = this.getSelectedWidget()
			const selectedGroup = this.getSelectedGroup()
			const [selectedWidgetID, selectedGroupId] = SelectionUtil.updateSelection(
				this.model, id, 
				selectedWidget?.id, 
				selectedGroup?.id
			)
			if (selectedWidgetID) {
				this.onWidgetSelected(id);
				this._dragNDropIgnoreGroup = true;
			}
			if (selectedGroupId) {
				this.onGroupSelected(selectedGroupId, true);
			}
		},

		isWidgetSelected (id) {
			if (this._selectWidget) {
				return this._selectWidget.id === id
			}
			if (this._selectMulti) {
				return this._selectMulti.indexOf(id) > -1
			}
			if (this._selectGroup && this._selectGroup.children) {
				return this._selectGroup.children.indexOf(id) > -1
			}
			return false
		},

		setSelectedWidget (id, expand = false, render = true) {
			const w = this.model.widgets[id]
			if (w) {
				this._selectWidget = w
			} else {
				this.logger.error("setSelectedScreens", "No widget with id"+ id, expand, render);
			}
		},
	

		getSelectedWidget() {
			return this._selectWidget
		},
	
	
		onWidgetSelected (id, forceSelection = false, ignoreParentGroups = null){
			this.logger.log(1,"onWidgetSelected", "enter > "+ id + " > ignoreParentGroups : "+ ignoreParentGroups);

			const now = new Date().getTime()
		
			/**
			 * Check here if the widget was select a second time. In this case
			 * trigger the inline edit unless the forceSelection flag is set. This happens
			 * normally only after a complete rendering. Check this.renderSelection() for
			 * more details.
			 */
			if(this._selectWidget && this._selectWidget.id == id && !forceSelection){
		
				// if (now - this._lastWidgetSelected < 3000) {
				// 	this.onWidgetDoubleClick(this._selectWidget)
				// } else {
				// 	this.logger.log(1,"onWidgetSelected", "ignore double > ");
				// }
			
			} else {
				this.unSelect()
				this.onSelectionChanged(id, "widget", false);
				if (this.model.widgets[id]){
					this._selectWidget = this.model.widgets[id];

					if (ignoreParentGroups === true) {
						this._dragNDropIgnoreGroup = true
					}

					const parent = this.widgetDivs[id];
					if (parent){
						if (this.showCustomHandlers) {
							this.showCustomHandlers(this._selectWidget, parent)
						}
						this.showResizeHandles(this._selectWidget,id, parent, "widget", true);
						this.selectBox(parent);
						this.selectDnDBox(id);
					}
					this.controller.onWidgetSelected(id);
				} else {
					console.warn("onWidgetSelected() > No widget with id", id);
				}
			}
			css.add(this.domNode, "MatcCanvasSelection");
			try {
				if (this.selectionListener) {
					this.selectionListener.selectWidget(id);
				}
			} catch (e){
				console.debug(e)
				this.logger.error("onWidgetSelected", "could not call selectionListener > ", e);
			}
			this._lastWidgetSelected = now
		},

		onWidgetDoubleClick (widgetID) {
			this.logger.log(-3,"onWidgetDoubleClick", "enter > "+ widgetID);

			// Since 4.6.0 we listen to real double clicks. We must make sure
			// this works only on the selected widget
			if (!this._selectWidget ?? this._selectWidget.id !== widgetID) {
				return
			}
			const widget = this.model.widgets[widgetID]
		
			topic.publish("matc/canvas/click", "", "");
			if (widget.type === 'Script') {
				if (this.toolbar) {
					this.toolbar.showScriptDialog(widget)
				}
				return
			}
			if (widget.type === 'Rest') {
				if (this.toolbar) {
					this.toolbar.showRestDialog(widget)
				}
				return
			}
			if (widget.type === 'SVGPaths') {
				this.editSVG(widget)
				return
			}
			this.inlineEditInit(widget)	
		},

		onInheritedWidgetSelected (id) {
			this.logger.log(-3,"onInheritedWidgetSelected", "enter > "+id);
		
			const widget = this.model.widgets[id];
			if (widget){
				this.unSelect()
				this.onSelectionChanged(id, "inheritedWidget", false);
				this.controller.onInheritedWidgetSelected(widget);
				const parent  = this.widgetDivs[widget.id];
				this._selectInheritedWidget = widget
				this.selectBox(parent);
				this.showResizeHandles(widget, widget.id, parent, "inheritedWidget", true);
			} else {
				this.logger.log(-3,"onInheritedWidgetSelected", "cannot find > " + id);
			}	
		},

		onLineSelected (id){
			this.logger.log(-1,"onLineSelected", "enter ");
			this.unSelect()
			this.onSelectionChanged(id, "line", false);
			this._selectedLine = this.model.lines[id];
			this.setLineColor(id, "orange");
			this.controller.onLineSelected(id);
			css.add(this.domNode, "MatcCanvasSelection");
		},

		/**********************************************************************
		 * Multi Select
		 **********************************************************************/

		setMultiSelection(ids, expand = false) {
			if (!Array.isArray(ids)) {
				this.logger.error("setMultiSelection", "no array ");
				console.trace()
				ids = [ids]
			}
			//console.warn('setMultiSelection', ids)
			if (expand) {
				if (!this._selectMulti) {
					this._selectMulti = []
				}
				this._selectMulti = this._selectMulti.concat(ids)
			} else {
				this._selectMulti = ids
			}
			
		},
	
		getMultiSelection() {
			return this._selectMulti
		},

		onMutliSelected (selection){
			this.logger.log(1,"onMutliSelected", "enter ", selection);

			this.unSelect()
			this.onSelectionChanged(null, "multi", false);
			this._dragNDropIgnoreGroup = false;

			this._selectMulti = selection;
			this.showGroupResizeHandlers(selection, null, "multi", true);
			this.controller.onMultiSelect(selection);
			css.add(this.domNode, "MatcCanvasSelection");
			this.showHint("Press D to distribute selected objects...");

			try {
				if (this.selectionListener) {
					this.selectionListener.selectMulti(selection);
				}
			} catch (e){
				this.logger.error("onGroupSelected", "could not call selectionListener > ", e);
			}
		},

		/**********************************************************************
		 * Group Select
		 **********************************************************************/
		setSelectedGroup(id, expand = false, render = false) {
			const g = this.model.groups[id]
			if (g) {
				this._selectGroup = g
			} else {
				this.logger.error("setSelectedGroups", "No widget with id"+ id, expand, render);
			}
		},

		getSelectedGroup() {
			return this._selectGroup
		},

		onGroupSelected (groupID, fromLayerList) {
			this.logger.log(2,"onGroupSelected", "enter > " + groupID);
			this.unSelect()
			this.onSelectionChanged(null, "group", false);
			/**
			 * This can be triggered from the LayerList. If a widget was before
			 * selectd we migh tbe weird stuff
			 */
			this._dragNDropIgnoreGroup = false

			if (this.model.groups) {
				this._selectGroup = this.model.groups[groupID];

				if(this._selectGroup){
					/**
					 * Since 2.1.3 we can have subgroups. To make everzthing work here
					 * we merge all sub children.
					 * We make a copy to not mess up the model.
					 */
					let allChildren = this.getAllGroupChildren(this._selectGroup)
					this._selectGroup = lang.clone(this._selectGroup)
					this._selectGroup._isVirtual = true
					this._selectGroup.children = allChildren
					this.showGroupResizeHandlers(this._selectGroup.children, groupID, "group", true);
					this.controller.onGroupSelected(groupID);

					/**
					 * Make sure the DND._addDnDChildren() method does not select
					 * the parent group
					 */
					if (fromLayerList) {
						this._dragNDropGroupChildren = allChildren
					}
				}
			}
			css.add(this.domNode, "MatcCanvasSelection");
			try {
				if (this.selectionListener) {
					this.selectionListener.selectGroup(groupID);
				}
			} catch (e){
				this.logger.error("onGroupSelected", "could not call selectionListener > ", e);
			}
		},

		/**********************************************************************
		 * Canvas Select
		 **********************************************************************/
	
		onCanvasSelected (){
			this.logger.log(-3,"onCanvasSelected", "enter ");
			this.unSelect()
			this.onSelectionChanged(null, 'canvas', false);
			this.controller.onCanvasSelected();

			this._dragNDropIgnoreGroup = false
			try {
				if (this.selectionListener) {
					this.selectionListener.unSelect();
				}
			} catch (e){
				this.logger.error("onCanvasSelected", "could not call selectionListener > ", e);
			}
		},

		onSelectionMoved (pos, dif, id){
			this.logger.log(3,"onSelectionMoved", "enter " + id + " ");

			/**
			 * We reset the entire selection to make sure the bounding box is correct
			 */
			this.renderSelection();

		},


		onSelectionChanged (id, type){
			this.logger.log(1,"onSelectionChanged", "enter > " + id + " >" + type);
			try{
				if(this._selectWidget && this._selectWidget.id!= id){
					this.inlineEditStop();
				}
				if(this._selectChangeListener){
					this._selectChangeListener();
				}
				if (this.currentTool && this.currentTool.stop) {
					this.currentTool.stop()
				}

				topic.publish("matc/canvas/click", id, type);
			} catch( e){
				this.logger.error("onSelectionChanged", "enter > ", e);
				this.logger.sendError(e);
			}
			if (type !== 'group') {
				this.logger.log(1,"onSelectionChanged", "clear group children > ");
				delete this._dragNDropGroupChildren;
			}

			/**
			 * FIXME: Why is this needed?
			 */
			this.cleanUpResizeHandles()		
		},

		isInSelection (id) {
			if (this.getSelectedScreen()) {
				return this.getSelectedScreen().id === id 
			}
			if (this._selectWidget) {
				return this._selectWidget.id === id 
			}
			if (this._selectMulti) {
				return this._selectMulti.indexOf(id) >= 0
			}
			if (this._selectGroup) {
				const children = this.getAllGroupChildren(this._selectGroup)
				return children.indexOf(id) >= 0
			}
			return false
		},

		hasSelection () {
			return (this.getSelectedScreen() !== null  && this.getSelectedScreen() !== undefined ) ||
					(this._selectWidget !== null  && this._selectWidget !== undefined ) ||
					(this._selectMulti !== null  && this._selectMulti !== undefined ) ||
					(this._selectGroup !== null  && this._selectGroup !== undefined ) ||
					(this._selectInheritedWidget !== null  && this._selectInheritedWidget !== undefined )
		},

		resetCanvasSelection () {
			this._canvasSelection.reset()
		},

		unSelect (){		
			this.logger.log(1,"unSelect", "enter > ");
			this.cleanUpResizeHandles();
			this.onDistributeEnd();
			this.onGridResizeEnd();
			this._selectWidget = null;
			this._selectMulti = null;
			this._selectGroup = null;
			this._selectInheritedWidget = null		
			this.resetCanvasSelection()


			css.remove(this.domNode, "MatcCanvasSelection");

			if(this._selectedLine){
				this.setLineColor(this._selectedLine.id);
			}		
			if(this._selectedDiv){
				css.remove(this._selectedDiv, "MatcBoxSelected");
			}
			if(this._selectedDnDDiv){
				css.remove(this._selectedDnDDiv, "MatcBoxSelected");
			}
			if (this._selectedDivList) {
				this._selectedDivList.forEach(div => {
					css.remove(div, "MatcMultiBoxSelected");
				})
			}

			delete this._selectedLine
			delete this._selectedDivList
			delete this._selectedDiv;
			delete this._selectedDnDDiv;
			delete this._selectChangeListener;
			delete this._selectStartListener;
	
		},

		addSelectionChangeListener (listener){
			this._selectChangeListener = listener;
		},

		addSelectionStartListener (listener){
			this._selectStartListener = listener;
		},

		/**
		 * Hook after rendering! If a model
		 * was selected before rendering, show selection
		 * again!
		 */
		renderSelection (){
			this.logger.log(5,"renderSelection", "enter > ", this._selectWidget);
	

			if(this._selectWidget){
				this.onWidgetSelected(this._selectWidget.id, true);
				return
			}

			if(this.hasScreenSelection()){
				this.renderScreenSelection()
				return
			}

			if (this._selectMulti){
				this.onMutliSelected(this._selectMulti, true);
				return
			}

			if(this._selectGroup){
				this.onGroupSelected(this._selectGroup.id, true);
				return
			}

			if (this._selectInheritedWidget) {
				this.onInheritedWidgetSelected(this._selectInheritedWidget.id, true);
				return
			}
		},

		updateSelection () {
			this.logger.log(5,"updateSelection", "enter > ");
	
			/**
			 * Since 4.0.40 we can just update the resizeHandlers for zooms etc.
			 * We still provide a call to renderSelection() as fallback
			 */
			const box = this.getSelectedBox()
			if (box) {
				this._updateResizeHandlers(box)
			} else {
				this.logger.log(3, "updateSelection", "could not find box > ");
				this.renderSelection()
			}
		},

		getSelectedBox () {
			if (this._selectWidget){
				if(this.model.widgets[this._selectWidget.id]){
					return this.model.widgets[this._selectWidget.id]
				}
			}

			if(this.getSelectedScreen()){
				const screenID = this.getSelectedScreen().id
				if(this.model.screens[screenID]){
					return this.model.screens[screenID]
				}
			}

			if (this._selectMulti){
				let boundingBox = this.getBoundingBox(this._selectMulti);
				return boundingBox
			}

			if (this._selectGroup){
				let children = this.getAllGroupChildren(this._selectGroup)
				let boundingBox = this.getBoundingBox(children);
				return boundingBox
			}

			if (this._selectInheritedWidget) {
				if(this.model.widgets[this._selectInheritedWidget.id]){
					return this.model.widgets[this._selectInheritedWidget.id]
				}
			}
			this.logger.log(1, "updateSelection", "No selection");
			
		},

		getSelectedIds (){

			if(this._selectWidget){
				return [this._selectWidget.id];
			}
			if(this._selectMulti){
				return this._selectMulti;
			}
			if(this._selectGroup){
				return this._selectGroup.children;
			}

			return null;
		},


		/**
		 * If a key stroke comes we shall start
		 * the inline edit if a widget is selected!
		 */
		onSelectionKeyPress (){

			if(this._selectWidget){
				/**
				 * FIXME: If we change some of the hot keys, we might again use
				 * the keys to start inloine edit
				 */
				//this.inlineEditKeyPress(e);
			}
		},

		onToolbarClick (){

		},

		selectBox (div){
			this._selectedDiv = div;
			css.add(div, "MatcBoxSelected");
		},


		selectMultiBoxes (divList){
			divList.forEach(div => {
				css.add(div, "MatcMultiBoxSelected");
			})
			this._selectedDivList = divList;
		},

		selectDnDBox (id){
			if(this.widgetDivs[id]){
				this._selectedDnDDiv = this.widgetDivs[id];
				css.add(this._selectedDnDDiv, "MatcBoxSelected");
			}
		},


		/**********************************************************************
		 * Remove
		 **********************************************************************/

		onRemoveSelected (){
			this.logger.log(3,"onRemoveSelected", "enter");

			/**
			 * if there is some inline editing going on,
			 * do nothing and also send gfalse, so the Canvas.js
			 * will stop the backspace event.
			 */
			if(this.inlineEditStarted()){
				return false;
			}

			/**
			 * FIXME: This should be in toolbar!
			 */
			if (this._selectGroup){
				let group = this._selectGroup;
				this.unSelect();
				this.controller.removeGroupAndWidgets(group.id);
				return true;
			}

			if (this._selectMulti){
				let multi = this._selectMulti;
				this.unSelect();
				this.controller.removeMultiWidget(multi);
				return true;
			}

			if(this._selectWidget){
				let id = this._selectWidget.id;
				this.unSelect();
				this.controller.removeWidget(id);
				return true;
			}

			if(this.getSelectedScreen()){
				let id = this.getSelectedScreen().id;
				this.unSelect();
				this.controller.removeScreen(id);
				return true;
			}

			if(this._canvasSelection.screens.length > 1){
				const ids = this._canvasSelection.screens.map(s => s.id)
				this.unSelect();
				this.controller.removeMultiScreen(ids);
				return true;
			}

			if(this._selectedLine){
				let line = this._selectedLine;
				this.unSelect();
				this.controller.removeLine(line);
				return true;
			}

			return true;
		},

		/**********************************************************************
		 * Context Stuff
		 **********************************************************************/

		onContextMenu (e, widgetID, screenID){
			this.logger.log(-1,"onContextMenu", `enter . ${widgetID} > ${screenID}`);
			this.stopEvent(e);
			// check if we need to make a selection
			if (!this.hasSelection()) {
				if (widgetID) {
					this.setSelectionById(widgetID)
				}
				if (screenID) {
					this.setSelectedScreens([screenID], false, true)
				}
			}
			if (this.$refs.contextMenu) {
				this.$refs.contextMenu.show(e, this.hasSelection())
			}
			return false;
		},

		/**********************************************************************
		 * Helper
		 **********************************************************************/

		allignToKeyBoard (pos){
			console.error('allignToKeyBoard() > DECRECTAED', pos)
		}


    },
    mounted () {
    }
}
</script>