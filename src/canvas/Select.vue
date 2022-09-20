<script>
import lang from 'dojo/_base/lang'
import css from 'dojo/css'

import topic from 'dojo/topic'

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

		isScreenSelected (id) {
			if (this._selectedScreen) {
				return this._selectedScreen.id === id
			}
			if (this._selectMulti) {
				return this._selectMulti.indexOf(id) > -1
			}
			return false
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

	
	
		onWidgetSelected (id, forceSelection = false, ignoreParentGroups = null){
			this.logger.log(1,"onWidgetSelected", "enter > "+ id + " > ignoreParentGroups : "+ ignoreParentGroups);

			/**
			 * Check here if the widget was select a second time. In this case
			 * trigger the inline edit unless the forceSelection flag is set. This happens
			 * normally only after a complete rendering. Check this.renderSelection() for
			 * more details.
			 */
			if(this._selectWidget && this._selectWidget.id == id && !forceSelection){
				topic.publish("matc/canvas/click", "", "");
				this.inlineEditInit(this._selectWidget);
			} else {
				this.onSelectionChanged(id, "widget");
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
		},

		onInheritedWidgetSelected (id) {
			this.logger.log(-3,"onInheritedWidgetSelected", "enter > "+id);
		
			const widget = this.model.widgets[id];
			if (widget){
				this.onSelectionChanged(id, "inheritedWidget");
				this.controller.onInheritedWidgetSelected(widget);
				var parent  = this.widgetDivs[widget.id];
				this._selectInheritedWidget = widget
				this.selectBox(parent);
				this.showResizeHandles(widget, widget.id, parent, "inheritedWidget", true);
			} else {
				this.logger.log(-3,"onInheritedWidgetSelected", "cannot find > " + id);
			}	
		},


		onScreenSelected (id){
			this.logger.log(3,"onScreenSelected", "enter > "+ id);

			this.onSelectionChanged(id, "screen");

			/**
			 * The screen could have just been deleted!
			 */
			if(this.model.screens[id]){
				this._selectedScreen = this.model.screens[id];

				const parent = this.screenDivs[id];
				this.showResizeHandles(this._selectedScreen, id, parent, "screen", true);
				this.selectBox(parent);

				this.controller.onScreenSelected(id);
				css.add(this.domNode, "MatcCanvasSelection");
			}

			try {
				if (this.selectionListener) {
					this.selectionListener.selectScreen(id);
				}
			} catch (e){
				this.logger.error("onGroupSelected", "could not call selectionListener > ", e);
			}

		},


		onLineSelected (id){
			this.logger.log(-1,"onLineSelected", "enter ");
			this.onSelectionChanged(id, "line");
			this._selectedLine = this.model.lines[id];
			this.setLineColor(id, "orange");
			this.controller.onLineSelected(id);
			css.add(this.domNode, "MatcCanvasSelection");
		},

		onMutliSelected (selection){
			this.logger.log(1,"onMutliSelected", "enter ", selection);

			this.onSelectionChanged(null, "multi");
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

		onGroupSelected (groupID, fromLayerList) {
			this.logger.log(2,"onGroupSelected", "enter > " + groupID);
			this.onSelectionChanged(null, "group");
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

		onCanvasSelected (){
			this.logger.log(3,"onCanvasSelected", "enter ");
			this.onSelectionChanged(null);
			this.controller.onCanvasSelected();

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
			} catch( e){
				this.logger.sendError(e);
			}
			if (type !== 'group') {
				this.logger.log(1,"onSelectionChanged", "clear group children > ");
				delete this._dragNDropGroupChildren;
			}
			try{
				/**
				 * make sure all popups are closed!
				 */
				topic.publish("matc/canvas/click", id, type);
				this.unSelect();
			} catch( e){
				this.logger.sendError(e);
			}
		},

		unSelect (){
			this.logger.log(3,"unSelect", "enter > ");

			this._selectedScreen = null;
			this._selectWidget = null;
			this._selectMulti = null;
			this._selectGroup = null;
			this._selectInheritedWidget = null

			css.remove(this.domNode, "MatcCanvasSelection");

			if(this._selectedLine){
				this.setLineColor(this._selectedLine.id);
			}
			this._selectedLine = null;
			this.cleanUpResizeHandles();
			if(this._selectedDiv){
				css.remove(this._selectedDiv, "MatcBoxSelected");
			}
			if(this._selectedDnDDiv){
				css.remove(this._selectedDnDDiv, "MatcBoxSelected");
			}
			delete this._selectedDiv;
			delete this._selectedDnDDiv;
			delete this._selectChangeListener;
			delete this._selectStartListener;
			this.onDistributeEnd();
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
			}

			if(this._selectedScreen){
				this.onScreenSelected(this._selectedScreen.id, true);
			}

			if(this._selectMulti){
				this.onMutliSelected(this._selectMulti, true);
			}

			if(this._selectGroup){
				this.onGroupSelected(this._selectGroup.id, true);
			}

			if (this._selectInheritedWidget) {
				this.onInheritedWidgetSelected(this._selectInheritedWidget.id, true);
			}
		},

		updateSelection () {
			this.logger.log(5,"updateSelection", "enter > ");
	
			/**
			 * Since 4.0.40 we can just update the resizeHandlers for zooms etc.
			 * We still provide a call to renderSelection() as fallback
			 */
			let box = this.getSelectedBox()
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

			if(this._selectedScreen){
				if(this.model.screens[this._selectedScreen.id]){
					return this.model.screens[this._selectedScreen.id]
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

			if(this._selectedScreen){
				let id = this._selectedScreen.id;
				this.unSelect();
				this.controller.removeScreen(id);
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

		onContextMenu (e){
			this.logger.log(-1,"onContextMenu", "enter", e.target);
			this.stopEvent(e);
			return false;
		},

		hideContextMenu (){
			if(this._contextMenu){
				var listeners = this._contextMenu.listeners;
				for(var i=0; i < listeners.length; i++){
					listeners[i].remove();
				}

				this.domNode.removeChild(this._contextMenu.background);
			}
			delete this._contextMenu;
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