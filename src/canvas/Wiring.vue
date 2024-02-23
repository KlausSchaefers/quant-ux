<script>

import on from 'dojo/on'
import touch from 'dojo/touch'
import lang from 'dojo/_base/lang'

export default {
    name: 'Wiring',
    mixins:[],
    data: function () {

      return {
      }
    },
    components: {},
    methods: {

			initWiring() {
				this.logger.log(-1,"initWiring", "enter");
				this.own(on(this.dndContainer, "mousedown", (e) => this.dispatchMouseDown(e)));
				this.own(on(this.dndContainer, "mouseup", (e) => this.dispatchMouseUp(e)));
				this.own(on(this.dndContainer, touch.over, (e) => this.dispatchOver(e)));
				this.own(on(this.dndContainer, touch.out, (e) => this.dispatchOut(e)));
				this.own(on(this.dndContainer, 'dblclick', (e) => this.dispatchDoubleClick(e)));
				this.own(on(this.container, "mousedown", (e) => this.dispatchBackroundClick(e)));
				this.own(on(this.dndContainer, "contextmenu", (e) => this.dispatchContextMenu(e)));
			},
			
			dispatchContextMenu (e) {
				this.logger.log(-1, "dispatchContextMenu", "enter", this.mode);
				const target = e.target
				this.onContextMenu(e, target._widgetID, target._screenID)
				return false
			},
			dispatchDoubleClick (e) {
				this.logger.log(-1, "dispatchDoubleClick", "enter", this.mode);			
				const target = e.target				
				if (this.mode === "svg") {
					return
				}
				if (target._widgetID) {
					this.onWidgetDoubleClick(target._widgetID)
					return
				}
				// this.forceCompleteRender()
				// this.rerender()
			},

			dispatchBackroundClick (e) {
				this.logger.log(-1, "dispatchBackroundClick", "enter", this._inlineEditStarted);
				if (this._inlineEditStarted) {
					let target = e.target
					if (this._inlineEditDiv === target) {
						return
					}
					this.dispatchMouseDownCanvas(e, target)
				}
			},

			dispatchOver (e) {
	
				let target = e.target
				if (target._widgetID) {
					let widget = this.model.widgets[target._widgetID];
					if (widget) {
						if (this.mode == "distance") {
							this.renderWidgetDistance(widget);
							return
						}
						if (this.mode == "edit" || this.mode == "addLine"){
							this.setHoverWidget(widget);
							return
						}
					}

				}
				if (target._screenID) {
					let scrn = this.model.screens[target._screenID];
					if (scrn) {
						return
					}
					return
				}

			},

			dispatchOut (e) {
				let target = e.target
				if (target._widgetID) {
					if (this.mode == "distance") {
						let widget = this.model.widgets[target._widgetID];
						if (widget) {
							this.renderWidgetDistance(null);
							// TODO add clone
						}
					}
					return
				}
				if (target._screenID) {
					let scrn = this.model.screens[target._screenID];
					if (scrn) {
						return
					}
					return
				}
			},

			dispatchMouseUp (e) {
				/**
				 * We only dispacth the events when lien created was
				 * triggered by using the 'dnd' button.
				 */
				if (this._addLineIsDndStarted) {
					let target = e.target
					if (target._widgetID) {
						this.onLineEndSelected(target._widgetID, e)
						return
					}
					if (target._screenID) {
						this.onLineEndSelected(target._screenID, e)
						return
					}
					this.onLineSuggestEnd(e)
					
				}
			},

			dispatchMouseDown (e) {
				const target = e.target
				const isCntrl = e.ctrlKey || e.metaKey;

				/**
				 * Since 5.0.0 we will show the context menu
				 */
				if (isCntrl) {
					return false
				}

				/**
				 * First dispatch tools
				 */
				if (this.mode == "move"){
					this.onDragStart(this.container, "container", "onCanvasDnDStart", "onCanvasDnDMove", "onCanvasDnDEnd", null, e);
				}

				if(this.mode == "select") {
					this.onSelectionStarted(e);
					return
				}

				if (this.mode == "hotspot"){
					this.onToolHotspotStart(e)
					return
				}

				if(this.mode == "addLine") {
					//this.dispatchMouseDownCanvas(e, target)
					//return
					//this.onDragStart(this.dndContainer, "container", "onCanvasDnDStart", "onCanvasDnDMove", "onCanvasDnDEnd", "onCanvasDnClick");
				}

				if (this.mode == "addText") {
					this.onToolTextStart(e);
					return
				}
				if (this.mode == "addBox") {
					//this.onToolBoxInit();
					this.onToolBoxStart(e);
					return
				}

				/**
				 * Otherwise check selection on screen, widget or canvas
				 */
				if (target._widgetID) {
					this.dispatchMouseDownWidget(e, target._widgetID, target)
					return
				}

				if (target._screenRulerTop) {
					this._onScreenTopMouseDown(target._screenRulerTop, e)
					return
				}

				if (target._screenRulerLeft) {
					this._onScreenLeftMouseDown(target._screenRulerLeft, e)
					return
				}

				if (target._screenID) {
					this.dispatchMouseDownScreen(e, target._screenID, target)
					return
				}

				if (target._lineID) {
					this.dispatchMouseDownLine(e, target._lineID, target._pointIndex, target)
					return
				}

				if (target._commentID) {
					this.dispatchMouseDownComment(e, target._commentID, target)
					return
				}

				this.dispatchMouseDownCanvas(e, target)

			},

			dispatchMouseDownComment (e, id, div) {
				this.logger.log(1,"dispatchMouseDownComment", "enter", id);
				// the event might come from a comment child
				if (this.commentDivs[id]) {
					div = this.commentDivs[id];
				}				
				this.onDragStart(div, id, "onCommentDndStart", "onCommntDndMove", "onCommentDndEnd", "onCommentDndClick", e);
			},

			dispatchMouseDownWidget (e, id) {
				this.logger.log(1,"dispatchMouseDownWidget", "enter", id);

				const widget = this.model.widgets[id];
				if (!widget) {
					return
				}
				if(this.mode == "addLine") {
					this.onLineEndSelected(id, e)
					return
				}
				if (this.isElementLocked(widget) || this.isElementHidden(widget)) {
					return
				}
				const div = this.widgetDivs[widget.id];
				if (widget.inherited){
					this.onInheritedWidgetSelected(widget.id);
					return
				}

				if (this.mode == "edit" || this.mode == "addLine"){
					/**
					 * we check if the widget can move. This is not the case,
					 * if it is locked, or if it not selected in case we have the Slected2Move mode on
					 */
					if(this.widgetCanMove(widget)){
						
						this.onDragStart(div, widget.id, "onWidgetDndStart", "onWidgetDndMove", "onWidgetDndEnd", "onWidgetDndClick", e);
					} else {
						/**
						 * shouldbe mouse up...
						 */
						this.onWidgetDndClick(id, div, null, e)
					}
					return
				}

				if (this.mode == "view" ){
					this.onWidgetDndClick(widget.id, div, null, e);
					return
				}

			},

			widgetCanMove(widget) {
				if (widget?.style?.locked) {
					return false
				}
				if (widget.inherited) {
					return false
				}
				if (this.isMoveOnlySelected) {
					/**
					 * check if teh widget is selected. This can be because,
					 * it is selected alone, in a multi or in a group.s
					 */
					return this.isWidgetSelected(widget.id)
				}
				return true
			},

			dispatchMouseDownScreen (e, id, target) {
				this.logger.log(1,"dispatchMouseDownScreen", "enter", id);

				let dndDiv = this.screenDivs[id];
				let screen = this.model.screens[id];

				if (!screen) {
					return
				}

				if (this.mode == "addLine") {
					this.onLineEndSelected(id, e)
					return
				}

				// since 4.1.02 we allow to 
				// screen selection only on labels
				if (!this.hasSelectOnScreen) {
					if (target._screenDND) {
						this.onSelectionStarted(e);
						return
					}
				}

				if (this.isElementLocked(screen)) {
					return
				}

				/**
				 * register dnd
				 */
				if (this.mode == "addLine" || this.mode == "edit") {
					if(this.screenCanMove(screen)){
						this.onDragStart(dndDiv, screen.id, "onScreenDndStart", "onScreenDndMove", "onScreenDndEnd", "onScreenDndClick", e);
					} else {
						this.onScreenDndClick(screen.id, dndDiv, null, e)
					}
					return
				}

				if(this.mode == "view"){
					this.tempOwn(on(dndDiv, "mousedown", lang.hitch(this, "onScreenDndClick", screen.id, dndDiv, null)));
					return
				}
			},

			screenCanMove(screen) {
				if (screen?.style?.locked) {
					return false
				}
				if (this.isMoveOnlySelected) {
					/**
					 * check if teh widget is selected. This can be because,
					 * it is selected alone, in a multi or in a group.s
					 */
					return this.isScreenSelected(screen.id)
				}
				return true
			},

			dispatchMouseDownLine (e, lineID, pointIndex, div) {
				this.logger.log(-1,"dispatchMouseDownLine", "enter", lineID, pointIndex);
	     		let line = this.model.lines[lineID];
				if (line) {
					/**
					 * We distaptch in the touch div, but we want to move the parent
					 */
					div = div.parentNode
					this.onDragStart(div,{ id : lineID, i : pointIndex, l: line} , "onLinePointDnDStart", "onLinePointDnDMove", "onLinePointDnDEnd", "onLinePointDnDClikc", e);
				}
			},

			dispatchMouseDownCanvas (e) {
				this.logger.log(1,"dispatchMouseDownCanvas", "enter", e, this.mode);

				if(this.mode == "addLine") {
					this.onLinePointSelected(e)
					return
				}

				if (this.mode === "edit" || this.mode === "view" || this.mode === "data"){
					this.onSelectionStarted(e);
					return
				}
			},


			isElementLocked (widget) {
				return widget && widget.props && widget.props.locked
			},

			isElementHidden (widget) {
				return widget && widget.props && widget.props.hidden
			},

		}

}
</script>