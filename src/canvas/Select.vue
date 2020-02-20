<script>
import on from 'dojo/on'
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import win from 'dojo/_base/win'
import topic from 'dojo/topic'
import ModelResizer from 'core/ModelResizer'

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
					
					var parent = this.widgetDivs[id];
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
		
		onInheritedWidgetSelected (widget) {
			this.logger.log(3,"onInheritedWidgetSelected", "enter > "+ widget.id);
			this.controller.onInheritedWidgetSelected(widget);
			var parent  = this.widgetDivs[widget.id];
			this.selectBox(parent);
			this.showResizeHandles(widget,widget.id, parent, "inheritedWidget", true);
		},
		
		
		onScreenSelected (id){
			this.logger.log(3,"onScreenSelected", "enter > "+ id);
			
			this.onSelectionChanged(id, "screen");
			
			/**
			 * The screen could have just been deleted!
			 */
			if(this.model.screens[id]){
				this._selectedScreen = this.model.screens[id];
			
				var parent = this.screenDivs[id];
				this.showResizeHandles(this._selectedScreen, id, parent, "screen", true);
				this.selectBox(parent);
				
				this.controller.onScreenSelected(id);
				css.add(this.domNode, "MatcCanvasSelection");
			}

			try {
				if (this.selectionListener) {
					this.selectionListener.unSelect();
				}
			} catch (e){
				this.logger.error("onGroupSelected", "could not call selectionListener > ", e);
			}
			
		},
		
		
		onLineSelected (id){
			this.logger.log(0,"onLineSelected", "enter ");
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
			this.showHint("Press <b>D</b> to distribute selected objects...");

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
			this.logger.log(3,"renderSelection", "enter > ");
			
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
		 * Resize Stuff
		 **********************************************************************/
		
		showGroupResizeHandlers (children,groupID, type){
			/**
			 * we hack how a little and will pass an id to the bounding box,
			 * so that the _DargNDrop._dragNDropUpDateUI method will also move
			 * the resize handles. To do so, we select the left upper child that is in
			 * the bounding box.
			 * 
			 * FIXME: here is a bug! We have an issue, if no widget is in the upper left corner alone,
			 * for instance the cross.
			 */
			var boundingBox = this.getBoundingBox(children);
			for(var i=0; i< children.length; i++){
				var id = children[i];
				// var widget = this.model.widgets[id];
				//if(widget.x == boundingBox.x  widget.y == boundingBox.y){
					boundingBox.id = id;
					break;
				//}
			}			
			this.showResizeHandles(boundingBox,groupID, null, type, true);
		},

	
		
		
		showResizeHandles (box, id, parent, modelType, drawLines){	
			
			if(!this.resizeEnabled){
				return;
			}
			
			if(!this.handlers){
				this.handlers = {};
			}

			/**
			 * add corners. For screen we have only the south handler...
			 */
			if (modelType != "inheritedWidget") {
				var l = (this.resizeButtonSize * 2) +1;			
				if (modelType == "screen"){
					this._renderResizeHandler('South', l, parent, id, modelType);
				
					if (box.style && box.segment) {
						console.debug('showResizeHandles() >  Show segment', box)
						this._renderResizeHandler('East', l, parent, id, modelType);
					}

				} else {
					var locked = box.style && box.style.locked;
					var noResize = box.has && box.has.noresize;
					if(!noResize && !locked){
						this._renderResizeHandler('RightUp', l, parent, id, modelType);
						this._renderResizeHandler('LeftUp', l, parent, id, modelType);
						this._renderResizeHandler('RightDown', l, parent, id, modelType);
						this._renderResizeHandler('LeftDown', l, parent, id, modelType);
						
						this._renderResizeHandler('North', l, parent, id, modelType);
						this._renderResizeHandler('West', l, parent, id, modelType);
						this._renderResizeHandler('East', l, parent, id, modelType);
						this._renderResizeHandler('South', l, parent, id, modelType);
					}
				}
			}
		
			
			if(drawLines){
				this._renderResizeLine("Left");
				this._renderResizeLine("Right");
				this._renderResizeLine("Up");
				this._renderResizeLine("Down");
			}
		
			
			this._selectedParent = parent;
			this._resizeHandlerBox = box;
		
			
			this._updateResizeHandlers(box);
			
			return parent;
		},
		
		_renderResizeHandler (type, l, parent, id, modelType){
			var div = document.createElement("div");
			div.style.width = l + "px";
			div.style.height = l + "px";
			css.add(div, "MatcResizeHandle MatchResize"+type);
			this._addSizeHandlerTouch(div);
			this.widgetContainer.appendChild(div);
			this.handlers[type] = div;
			this.registerResizeListener(div, parent, id, type, modelType);
		},
		
		_renderResizeLine (type){
			var div = document.createElement("div");
			div.style.height="1px"
			div.style.width="1px"
			css.add(div, "MatcResizeBorder MatcResizeBorder"+type);
			this.handlers[type] = div;
			this.widgetContainer.appendChild(div);
		},
		
		_updateResizeHandlers (box){
			
			
			if (this.handlers && box && this.resizeEnabled) {
				if (this.handlers['LeftUp']) {
					this.handlers['LeftUp'].style.top = box.y  + (-1* this.resizeButtonSize) + "px";
					this.handlers['LeftUp'].style.left = box.x  + (-1* this.resizeButtonSize)+ "px";
					
					this.handlers['RightUp'].style.top = box.y  + (-1* this.resizeButtonSize) + "px";
					this.handlers['RightUp'].style.left = (box.x + box.w) + (-1* this.resizeButtonSize)+ "px";
					
					this.handlers['RightDown'].style.top = (box.y + box.h) - this.resizeButtonSize + "px";
					this.handlers['RightDown'].style.left = (box.x + box.w) - this.resizeButtonSize+ "px";
					
					this.handlers['LeftDown'].style.top = (box.y + box.h) - this.resizeButtonSize + "px";
					this.handlers['LeftDown'].style.left = (box.x) - this.resizeButtonSize+ "px";
				}
				
				if (this.handlers['Left']) {
					this.handlers['Left'].style.height= box.h +"px"
					this.handlers['Left'].style.top = box.y + "px";
					this.handlers['Left'].style.left = box.x -1 +"px";
					
					this.handlers['Right'].style.height= box.h +"px"
					this.handlers['Right'].style.top = box.y + "px";
					this.handlers['Right'].style.left = (box.x + box.w) +"px";
					
					this.handlers['Up'].style.width= box.w +"px"
					this.handlers['Up'].style.top = box.y -1 + "px";
					this.handlers['Up'].style.left = (box.x) +"px";
					
					this.handlers['Down'].style.width= box.w +"px"
					this.handlers['Down'].style.top = (box.y + box.h) + "px";
					this.handlers['Down'].style.left = (box.x) +"px";
				}
				
				if (this.handlers['North']) {
					this.handlers['North'].style.top = box.y  + (-1* this.resizeButtonSize) + "px";
					this.handlers['North'].style.left = (box.x + box.w/2)+ (-1* this.resizeButtonSize)+ "px";
					
					this.handlers['West'].style.top = box.y +(box.h/2) + (-1* this.resizeButtonSize) + "px";
					this.handlers['West'].style.left = (box.x) + (-1* this.resizeButtonSize)+ "px";
				}
				
				/**
				 * Since 2.2.0 we have screen segements
				 */
				if (this.handlers['East']) {
					this.handlers['East'].style.top = box.y +(box.h/2) + (-1* this.resizeButtonSize) + "px";
					this.handlers['East'].style.left = (box.x + box.w)+ (-1* this.resizeButtonSize)+ "px";
				}
				
				if (this.handlers['South']) {
					this.handlers['South'].style.top = box.y +box.h + (-1* this.resizeButtonSize) + "px";
					this.handlers['South'].style.left = (box.x + box.w/2)+ (-1* this.resizeButtonSize)+ "px";
				}

				if (this.updateCustomHandlers) {
					this.updateCustomHandlers(box)
				}
			} 
		},
		
		/**
		 * add some invisible touch handler to make it easier to grap it.
		 */
		_addSizeHandlerTouch (node){
			var t = document.createElement("div");
			css.add(t, "MatcResizeHandleTouch");
			node.appendChild(t);
		},
		
		cleanUpResizeHandles (){
			
			if(this.handlers){
				for(var id in this.handlers){
					var node = this.handlers[id];
					var parent = node.parentNode;
					if(parent){
						parent.removeChild(node);
					}
				}
			}
			this.handlers = null;
			this._selectedParent = null;
			
			if(this._resizeHandleListeners){		
				for(var i=0; i < this._resizeHandleListeners.length; i++){
					this._resizeHandleListeners[i].remove();
				}
			}

			delete this._resizeHandleListeners;
			delete this._resizeHandlerBox;
			this.onResizeDnDCleanUp();
			if (this.cleanUpCustomHandlers) {
				this.cleanUpCustomHandlers();
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
			if(this._selectGroup){
				let group = this._selectGroup;
				this.unSelect();
				this.controller.removeGroupAndWidgets(group.id);
				return true;
			}
			
			if(this._selectMulti){
				let multi = this._selectMulti;
				this.unSelect();
				this.controller.removeMultiWidget(multi);
				return true;
			}
			
			if(this._selectWidget){
				let id = this._selectWidget.id;
				let group = this.getParentGroup(this._selectWidget.id);
				this.unSelect();
				if(!group){
					this.controller.removeWidget(id);
				} else {
					/**
					 * We should have here a method removeFromGroup
					 */
					this.controller.removeGroupAndWidgets(group.id);
				}
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
		 * DND: We have to drag and drop
		 **********************************************************************/
		
		registerResizeListener (div, parent, id, type, modelType){
			if(!this._resizeHandleListeners){
				this._resizeHandleListeners = [];
			}
			var listener = on(div,"mousedown", lang.hitch(this,"onResizeDnDStart", div,parent, id, type, modelType));
			this._resizeHandleListeners.push(listener);
		},
		
		
		onResizeDnDStart (div, parent, id, type,modelType,e){
			this.stopEvent(e);
			this.logger.log(3,"onResizeDnDStart", "enter > "+  id);
			topic.publish("matc/canvas/click", "", "");
			
			
			/**
			 * make sure inline edit is flushed,
			 * because a renrender or some other stuff might
			 * happen
			 */
			this.inlineEditStop();
			
			// this is wrong if we want to have snappz stuff
			// we have to select depending on the type.. arghh
			this._resizeStartPos = this.getCanvasMousePosition(e);
			this._resizeHandleDiv = div;
			this._resizeParentDiv = parent;
			this._resizeType = type;
			this._resizeId = id;
			this._resizeModelType = modelType;
			this._resizeRenderJobs = {};
			this._resizeCursor = "MatcCanvasResizeCursor" + type
			
			css.add(this.container, this._resizeCursor);
			
			/**
			 * we have to get the right model object. For groups and mutli
			 * we set the bounding box.
			 */
			if(this._resizeModelType == "screen"){
				this._resizeModel = this.model.screens[id];
			} else if(this._resizeModelType == "widget"){
				this._resizeModel = this.model.widgets[id];
			} else if(this._resizeModelType == "group"){
				this._resizeModel = this.getBoundingBox(this._selectGroup.children);
				this._resizeModel.children = this._selectGroup.children;
			} else if(this._resizeModelType == "multi"){
				this._resizeModel = this.getBoundingBox(this._selectMulti);
				this._resizeModel.children = this._selectMulti;
			}
		
			/**
			 * start the alignment, like grid or ruler!
			 */
			this.alignmentStart(modelType, this._resizeModel, type, null, true);
				
			/**
			 * register mouse move and release listener, maybe also esc listener
			 */
			this._resizeHandleMove = on(win.body(),"mousemove", lang.hitch(this,"onResizeDnDMove", modelType));
			this._resizeHandleUp = on(win.body(),"mouseup", lang.hitch(this,"onResizeDnDEnd", modelType));
		},
		
		onResizeDnDMove (modelType, e){
		
		
			this.stopEvent(e);
			if(!this._resizeHandleDiv || !this._resizeModel){
				this.logger.warning(0,"onResizeDnDMove", "No model or handler");
				this.onResizeDnDCleanUp();
				return;
			}
			
			// dispatch to special handler if attached
			if(this._resizeDnDMoveHandler){
				this[this._resizeDnDMoveHandler](modelType, e)
				return;
			}
			
			// get snapped position
			var pos = this._getSizePos(e);
		

			if(modelType!= "group" && modelType!= "multi"){
				/**
				 * Normal screen or widgedt. Now build the job
				 */
				this._resizeRenderJobs[pos.id] = {
					"pos" : pos,
					"div" : this._resizeParentDiv 
				};
			} else {
				if (modelType == "multi" && this._distributeEnabled) {
					/**
					 * Distribute
					 */
					let dir = this.isHorinzontalDistribution()
					let temp = this._distributedPositions(dir, this._resizeModel.children, pos);
					let positions = temp.positions;
					for(let id in positions){
						let newPos = positions[id]
						let div = this.widgetDivs[id];
						this._resizeRenderJobs[id] = {
							"pos" : newPos,
							"div" : div 
						};
					}
					this.alignmentShowDistribution(temp.distances);
				} else {
					/**
					 * Calculate relative changes in size.
					 */
					let dif ={
						x: pos.x *1.0 / this._resizeModel.x,
						y: pos.y *1.0 / this._resizeModel.y,
						w: pos.w *1.0 / this._resizeModel.w,
						h: pos.h *1.0 / this._resizeModel.h
					}; 
						
					let children = this._resizeModel.children;
					for(let i=0; i< children.length; i++){
						let id = children[i];
						let widget = this.model.widgets[id];
						let div = this.widgetDivs[id];
						let newPos = this._getGroupChildResizePosition(widget,this._resizeModel,pos, dif)			
						this._resizeRenderJobs[id] = {
							"pos" : newPos,
							"div" : div 
						};
					}
				}
						
				/**
				 * in case of group we also set the bounding box,
				 * to make sure all lines are correctly updated
				 */
				if(modelType== "group"){
					pos.id = this._resizeId;
					this._resizeRenderJobs[this._resizeId] = {
						"pos" : pos 
					};
				}
			}
		
			/**
			 * make sure handler are also updated
			 */
			this._resizeRenderJobsHandlerPos = pos;
		
			/**
			 * now request rendering
			 */
			if(!window.requestAnimationFrame){
				console.warn("No requestAnimationFrame()");
		    	this._resizeDndUpDateUI();
		    } else {
		    	var callback = lang.hitch(this, "_resizeDndUpDateUI");
	        	requestAnimationFrame(callback);
		    }
			return false;
		},
		
		onResizeDnDEnd (modelType, e){
			this.logger.log(1,"onResizeDnDEnd", "enter");
			this.stopEvent(e);
			
			if(!this._resizeStartPos){
				this.onResizeDnDCleanUp();
				return;
			}
			
			// return if we have special handler
			if (this._resizeDnDEndHandler){
				this[this._resizeDnDEndHandler](modelType, e);
				return;
			}
			
			this._resizeNewPosition = this.getCanvasMousePosition(e);
			this._resizeNewPosition.x -= this._resizeStartPos.x;
			this._resizeNewPosition.y -= this._resizeStartPos.y;
			
			/**
			 * calculate new position of widget (or bounding box) and 
			 * align it with snapping.
			 */
			var pos = this._getResizePosition(this._resizeNewPosition, this._resizeModel, this._resizeType);
			pos = this.allignPosition(pos, e);
			pos = this.allignToKeyBoard(pos,e);
					
			/**
			 * Copy new pos, so DND will correctly be updated.
			 * Make sure the id stays the same!
			 */
			this._resizeHandlerBox.x = pos.x;
			this._resizeHandlerBox.y = pos.y;
			this._resizeHandlerBox.w = pos.w;
			this._resizeHandlerBox.h = pos.h;
			
			if(modelType!= "group" && modelType!="multi"){
				
				/**
				 * call aligner to snap to ruler of grid
				 */
				if(this._resizeModelType == "screen"){
					this.controller.updateScreenPosition(this._resizeId, pos);
				} else {
					this.renderFactory.resize(this._resizeId, pos);
					var widget = this.model.widgets[this._resizeId];
					this.controller.updateWidgetPosition(this._resizeId, pos, false, this.isMasterWidget(widget));
				}
			} else {
				if (modelType == "multi" && this._distributeEnabled) {
					/**
					 * Distribute
					 */
					let dir = this.isHorinzontalDistribution();
					let temp = this._distributedPositions(dir, this._resizeModel.children, pos);
					let positions = temp.positions;
					
					let children = this._resizeModel.children;
					let hasCopies = false;
					for(let i=0; i< children.length; i++){
						let id = children[i];
						let widget = this.model.widgets[id];
						hasCopies = hasCopies || this.isMasterWidget(widget);
					}
					 // FIXME: We could have here a nice methods in the controller
					 // to work on the unzoomed model and avoid rounding errors!
					this.getController().updateMultiWidgetPosition(positions, false, null, hasCopies);
				} else {
					/**
					 * Calculate relative changes in size.
					 */
					let dif ={
						x: pos.x *1.0 / this._resizeModel.x,
						y: pos.y *1.0 / this._resizeModel.y,
						w: pos.w *1.0 / this._resizeModel.w,
						h: pos.h *1.0 / this._resizeModel.h
					}; 
					let positions = {};
					let children = this._resizeModel.children;
					let hasCopies = false;
					for(let i=0; i< children.length; i++){
						let id = children[i];
						let widget = this.model.widgets[id];
						hasCopies = hasCopies || this.isMasterWidget(widget);
						// let div = this.widgetDivs[id];						
						let newPos = this._getGroupChildResizePosition(widget, this._resizeModel, pos, dif)
						positions[id] = newPos;
					}
					// FIXME: Add here new API to to do the multi position calculation again in 
					// to avoid rounding issues.
					// Basically we have to move this entire method to the controller!!
					this.getController().updateMultiWidgetPosition(positions, false, null, hasCopies);
				}
			}
			
			this.onResizeDnDCleanUp();
		},
		
		/**********************************************************************
		 * Replicate Tool
		 **********************************************************************/
		
		onReplicate (){
			this.logger.log(0,"onReplicate", "enter");
			
			// toggle between states
			if (!this._resizeDnDEndHandler){
				this._resizeDnDMoveHandler = "onReplicateDnDMove";
				this._resizeDnDEndHandler = "onReplicateDnDEnd";
				css.add(this.container, "MatcCanvasModeReplicate");
				
				this._selectCloneIds = []
				if (this._selectGroup){
					this._selectCloneIds = this._selectGroup.children
				}
				if (this._selectWidget){
					this._selectCloneIds.push(this._selectWidget.id)
				}
				if (this._selectMulti){
					this._selectCloneIds = this._selectMulti;
				}
				
			} else {
				delete this._resizeDnDMoveHandler;
				delete this._resizeDnDEndHandler;
				css.remove(this.container, "MatcCanvasModeReplicate");
			}
		
		},
		
		onReplicateDnDMove (modelType, e){	
			
			/**
			 * get the position of the placeholder
			 */
			try {
				var pos = this._getSizePos(e);
				this._resizeCopyJobs = this.getClones(this._selectCloneIds, pos).previews;
				this._resizeRenderJobsHandlerPos = pos;

				/**
				 * now request rendering
				 */
				if(!window.requestAnimationFrame){
					console.warn("No requestAnimationFrame()");
					this._replicateDndUpDateUI();
				} else {
					requestAnimationFrame(() => {
						this._replicateDndUpDateUI()
					});
				}
			} catch (e){
				console.error(e)
			}
			//console.debug('onReplicateDnDMove() exit')
		},
		
		onReplicateDnDEnd (modelType, e){
			this.logger.log(0,"onReplicateDnDEnd", "enter");
			
			/**
			 * Create models
			 */
			var pos = this._getSizePos(e);
			var cloneIDs = this.getController().replicateWidgets(this._selectCloneIds, pos, this._selectGroup);
			
			/**
			 * Select everything
			 */
			var selection = cloneIDs.widgets.concat(this._selectCloneIds);
			this.onMutliSelected(selection)
			this.onResizeDnDCleanUp();
			this.renderSelection();
		},
		
		
		_replicateDndUpDateUI () {
			if(!this._resizeCopyJobs){
				/**
				 * Because of some weird reason this is since the introduction
				 * of the some times null. Dunno why this did not happen earlier.
				 */
				// this.onResizeDnDCleanUp();
				return;
			}
			
			// remove old stuff
			this.cleanUpReplicate();
			
			// render place holders
			this._resizeCopyJobsDivs = [];
			for(var i=0; i < this._resizeCopyJobs.length; i++){
				var job = this._resizeCopyJobs[i];
				var div = this.createBox(job);
				css.add(div, "MatcBoxPlaceHolder");
				this.widgetContainer.appendChild(div);	
				this._resizeCopyJobsDivs.push(div);
			}
			delete this._resizeCopyJobs;
				
			/**
			 * now update all handlers
			 */
			if(this._resizeRenderJobsHandlerPos){
				this._updateResizeHandlers(this._resizeRenderJobsHandlerPos);
			}

			console.debug('_replicateDndUpDateUI() > exit')
		},
		
		cleanUpReplicate (){
			//this.logger.log(0,"cleanUpReplicate", "enter");
			if (this._resizeCopyJobsDivs) {
				for(var i=0; i< this._resizeCopyJobsDivs.length; i++){
					var div = this._resizeCopyJobsDivs[i]
					if (div.parentNode){
						div.parentNode.removeChild(div);
					}
				}
			}
		},
		
		
		/**********************************************************************
		 * Helper
		 **********************************************************************/

		allignToKeyBoard (pos){
			/**
			 * If shift was pressed
			 */
			if(this._currentKeyPressed === 16){
				var min = Math.min(pos.w, pos.h);
				pos.h = min;
				pos.w = min;
				if(pos.snapp){
					pos.snapp.square = true;
				}
				//delete pos.snapp;
			}
			return pos;
		},
		
		_getSizePos (e){
			var pos = this.getCanvasMousePosition(e);
			pos.x -= this._resizeStartPos.x;
			pos.y -= this._resizeStartPos.y;
			
			pos = this._getResizePosition(pos, this._resizeModel, this._resizeType);
					
			/**
			 * *ATTENTION* We snapp now here and not in the _resizeDndUpDateUI()
			 * anymore. Otherwise we have some stupid jumpy effects...
			 */
			pos = this.allignPosition(pos, e);
			pos = this.allignToKeyBoard(pos,e);
			return pos;
		},
		
		/**
		 * drawing method that updates the thing
		 */
		_resizeDndUpDateUI (){
			if(!this._resizeRenderJobs){
				this.onResizeDnDCleanUp();
				return;
			}
			
			for(var id in this._resizeRenderJobs){
				var job = this._resizeRenderJobs[id];
				var pos = job.pos;
				let div = job.div;
				if(div){
					/**
					 * render parent (widget / screendnd)
					 */
					div.style.left = pos.x + "px";
					div.style.top = pos.y + "px";
					div.style.width = pos.w + "px";
					div.style.height = pos.h + "px";
					
					/**
					 * Also update the background things
					 */
					if(this._resizeModelType == "screen"){
						div = this.screenBackgroundDivs[id];
						div.style.left = pos.x + "px";
						div.style.top = pos.y + "px";
						div.style.width = pos.w + "px";
						div.style.height = pos.h + "px";
					} else {
						div = this.widgetBackgroundDivs[id];
						if(div){
							div.style.left = pos.x + "px";
							div.style.top = pos.y + "px";
							div.style.width = pos.w + "px";
							div.style.height = pos.h + "px";
						}	
					}
				}
			
				/**
				 * Also update the ui on the fly. This might by slow, so 
				 */
				this.renderFactory.resize(id, pos);
				
				/**
				 * update lines
				 */
				this.resizeUpdateLines(pos);
				
				/**
				 * FIXME: can this lead to concurreant loop exceptions?
				 */
				delete this._resizeRenderJobs[pos.id];
			}
				
			/**
			 * now update all handlers
			 */
			if(this._resizeRenderJobsHandlerPos){
				this._updateResizeHandlers(this._resizeRenderJobsHandlerPos);
			}
		},
		
		/**
		 * Calculates the correct dimensions depending on the new mouse pos
		 * and the type of handle.
		 * 
		 * Returns a complete box with x,y,w,h and *id* !!
		 */
		_getResizePosition (pos, model, type){
			return ModelResizer.getResizePosition(pos, model, type, this._resizeModel)
		},
		
		
		/**
		 * FIXME: This should be merged with the
		 * DnD.updateLines() method in the DnD package
		 */
		resizeUpdateLines (box){
			if(box.id){
				for(var id in this.model.lines){
					var line = this.model.lines[id];
					if(line.to == box.id || line.from == box.id){
						//var from = this.model.widgets[line.from];
						//var to = this.model.screens[line.to];
						
						var from =  this.getFromBox(line);
						var to = this.getToBox(line);
						/**
						 * Here we switch he
						 */
						if(line.to == box.id){
							to = box;
						} 
						if(line.from == box.id){
							from = box;
						}
						this.updateLine(line, from, to);
					}
				}
				
				/**
				 * Check also for groups children or so
				 */
			} 
			
		},
		
		
		onResizeDnDCleanUp (){
			if(this._resizeHandleMove){
				this._resizeHandleMove.remove();
			}
			if(this._resizeHandleUp){
				this._resizeHandleUp.remove();
			}
			if (this._resizeCursor && this.container){
				css.remove(this.container, this._resizeCursor);
			}
			delete this._resizeHandleUp;
			delete this._resizeHandleMove;
			delete this._resizeStartPos;
			delete this._resizeNewPosition;
			delete this._resizeHandleDiv;
			delete this._resizeType;
			delete this._resizeModel;
			delete this._resizeId;
			delete this._resizeParentDiv;
			delete this._resizeContainerDiv;
			delete this._resizeModelType;
			delete this._resizeRenderJobs
			delete this._resizeRenderJobsHandlerPos;
			delete this._resizeDnDMoveHandler;
			delete this._resizeDnDEndHandler
			delete this._selectCloneIds;
			delete this._resizeCopyJobs;
			this.cleanUpAlignment();
			this.cleanUpReplicate();
			this.cleanupDistribute();
			css.remove(this.container, "MatcCanvasModeReplicate");
		},

		/**
		 * Keep this method here, so the analztic canvas won#t crash
		 */
		cleanupDistribute () {
			
        },
		
		isHorinzontalDistribution () {
			if (this._resizeType === "East" || this._resizeType === "West"){
				return "horizontal";
			} else {
				return "vertical";
			}
		},


    	extendSelectionToGroup (widgetId, selection) {
			let group = this.getParentGroup(widgetId);
			if (group) {
				this.logger.log(1,"extendSelectionToGroup", "extend group for widget : " + widgetId, group);
				let children = group.children
				children.forEach(childId => {
					if (selection.indexOf(childId) < 0) {
						selection.push(childId)
					}
				})
			}
			return selection
		}
    }, 
    mounted () {
    }
}
</script>