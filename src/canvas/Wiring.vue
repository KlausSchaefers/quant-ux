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
				this.own(on(this.dndContainer, touch.over, (e) => this.dispatchOver(e)));
				this.own(on(this.dndContainer, touch.out, (e) => this.dispatchOut(e)));
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

			dispatchMouseDown (e) {
				let target = e.target

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
					this.onDragStart(this.dndContainer, "container", "onCanvasDnDStart", "onCanvasDnDMove", "onCanvasDnDEnd", "onCanvasDnClick");
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
				 * Otherwise check selection on screen, widget or canbas
				 */
				if (target._widgetID) {
					this.dispatchMouseDownWidget(e, target._widgetID, target)
					return
				}
				if (target._screenID) {
					this.dispatchMouseDownScreen(e, target._screenID, target)
					return
				}

				if (target._lineID) {
					this.dispatchMouseDownLine(e, target._lineID, target._pointId, target)
				}

				this.dispatchMouseDownCanvas(e, target)

			},

			dispatchMouseDownWidget (e, id) {
				this.logger.log(-1,"dispatchMouseDownWidget", "enter", id);
				let widget = this.model.widgets[id];

				if (!widget) {
					return
				}

				if (this.isElementLocked(widget) || this.isElementHidden(widget)) {
					return
				}

				let div = this.widgetDivs[widget.id];
				if (widget.inherited){
					this.onInheritedWidgetSelected(widget);
					return
				}

				if (this.mode == "edit" || this.mode == "addLine"){
						let locked = widget.style.locked;
						if(locked){
							this.onWidgetDndClick(id, div, null)
						} else {
							this.onDragStart(div, widget.id, "onWidgetDndStart", "onWidgetDndMove", "onWidgetDndEnd", "onWidgetDndClick", e);
						}
					return
				}

				if (this.mode == "view" ){
					this.onWidgetDndClick(widget.id, div, null);
					return
				}

			},

			dispatchMouseDownScreen (e, id) {
				this.logger.log(-1,"dispatchMouseDownScreen", "enter", id);

				let dndDiv = this.screenDivs[id];
				let screen = this.model.screens[id];

				if (!screen) {
					return
				}

				if (this.isElementLocked(screen)) {
					return
				}

				/**
				 * register dnd
				 */
				if (this.mode == "addLine") {
					this.onDragStart(dndDiv, screen.id, "onScreenDndStart", "onScreenDndMove", "onScreenDndEnd", "onScreenDndClick", e);
					return
				}

				if (this.mode == "edit"){
					this.onDragStart(dndDiv, screen.id, "onScreenDndStart", "onScreenDndMove", "onScreenDndEnd", "onScreenDndClick", e);
					return
				}

				if(this.mode == "view"){
					this.tempOwn(on(dndDiv, "mousedown", lang.hitch(this, "onScreenDndClick", screen.id, dndDiv, null)));
					return
				}
			},

			dispatchMouseDownLine (e, id, point) {
				this.logger.log(-1,"dispatchMouseDownLine", "enter", id, point);
			},

			dispatchMouseDownCanvas (e) {
				this.logger.log(-1,"dispatchMouseDownCanvas", "enter", e);


				if (this.mode === "edit" || this.mode === "view" || this.mode === "data"){
					this.onSelectionStarted(e);
					return
				}

			},

			/**********************************************************************
			 * Wiring
			 **********************************************************************/
			reWireEvents (){
				this.logger.log(3,"reWireEvents", "enter");
				this.cleanUpAllListeners();
				this.wireEvents();
			},

			wireEvents (){
				this.logger.log(2,"wireEvents", "enter > " + this.mode);
				if (this.mode) {
					return
				}

				this.wireCanvas()

				for(let id in this.model.screens){
					this.wireScreen(id)
				}

				for(let id in this.model.widgets){
					this.wireWidget(id);
				}

				// wire comments;
				this.wireComments();
				/**
				 * FIXME: Wire lines too. Then we can call this in setMode();
				 */
				this.logger.log(4,"wireEvents", "exit");
			},

			/**
			 * wire all widgets that are *NOT* inherited
			 */
			wireWidget (id) {
				let widget = this.model.widgets[id];

				if (this.isElementLocked(widget) || this.isElementHidden(widget)) {
					return
				}

				let div = this.widgetDivs[widget.id];
				if (!widget.inherited || this.wireInheritedWidgets){
					if(this.mode == "edit" || this.mode == "addLine"){
						let locked = widget.style.locked;
						if(locked){
							this.tempOwn(on(div, "mousedown", lang.hitch(this, "onWidgetDndClick", widget.id, div, null)));
						} else {
							this.registerDragOnDrop(div, widget.id, "onWidgetDndStart", "onWidgetDndMove", "onWidgetDndEnd", "onWidgetDndClick");
						}
						this.tempOwn(on(div, touch.over, lang.hitch(this, "setHoverWidget", widget)));
					} else if(this.mode == "view" ){
						this.tempOwn(on(div, "mousedown", lang.hitch(this, "onWidgetDndClick", widget.id, div, null)));
					} else if (this.mode == "distance"){
						this.tempOwn(on(div, touch.over, lang.hitch(this, "renderWidgetDistance", widget)));
						this.tempOwn(on(div, touch.out, lang.hitch(this, "renderWidgetDistance", null)));
						/**
						 * TODO: Make addCloneWork. Really use dull
						 */
						this.tempOwn(on(div, touch.press, lang.hitch(this, "addClonedWidget", widget))); // ALT + DND
					}
				} else {
					this.tempOwn(on(div, "click", lang.hitch(this, "onInheritedWidgetSelected", widget)));
				}
			},

			isElementLocked (widget) {
				return widget && widget.props && widget.props.locked
			},

			isElementHidden (widget) {
				return widget && widget.props && widget.props.hidden
			},

			wireScreen (id) {
				let dndDiv = this.screenDivs[id];
				let screen = this.model.screens[id];

				if (this.isElementLocked(screen)) {
					return
				}

				/**
				 * register dnd
				 */
				if (this.mode == "addLine") {
					this.registerDragOnDrop(dndDiv, screen.id, "onScreenDndStart", "onScreenDndMove", "onScreenDndEnd", "onScreenDndClick");
				} else if(this.mode == "edit" && !this.isSinglePage){
					if (this.hasSelectOnScreen) {
						let lbl = this.screenLabels[id]
						if (lbl) {
							this.registerDragOnDrop(dndDiv, screen.id, "onScreenDndStart", "onScreenDndMove", "onScreenDndEnd", "onScreenDndClick", lbl);
						}
					} else {
						this.registerDragOnDrop(dndDiv, screen.id, "onScreenDndStart", "onScreenDndMove", "onScreenDndEnd", "onScreenDndClick");
					}
				} else if(this.mode == "view"){
					this.tempOwn(on(dndDiv, "mousedown", lang.hitch(this, "onScreenDndClick", screen.id, dndDiv, null)));
				}
			},

			wireCanvas () {
				console.debug('wireCanvas', this.mode)
				if(this.moveMode == "classic" && (this.mode == "edit" || this.mode == "view" || this.mode === "data") ){
					/**
					 * In the classic mode the
					 */
					this.registerDragOnDrop(this.dndContainer, "container", "onCanvasDnDStart", "onCanvasDnDMove", "onCanvasDnDEnd", "onCanvasDnClick", this.container);
				} else if (this.mode === "edit" || this.mode === "view" || this.mode === "data"){
					/**
					 * The must be mousedown, because in chrome the touch press is fired after mousedown and fucks up some how our state maschine
					 */

					this.tempOwn(on(this.dndContainer, "mousedown", lang.hitch(this, "onSelectionStarted") ));

				} else if(this.mode == "move"){
					this.registerDragOnDrop(this.dndContainer, "container", "onCanvasDnDStart", "onCanvasDnDMove", "onCanvasDnDEnd", null, this.container);
				} else if(this.mode == "select"){
					this._selectionToolPressListener = on(this.dndContainer,"mousedown", lang.hitch(this,"onSelectionStarted"));
				} else if(this.mode == "hotspot"){
					this._hotspotToolPressListener = on(this.dndContainer,"mousedown", lang.hitch(this,"onToolHotspotStart"));
				} else if(this.mode == "addLine") {
					this.registerDragOnDrop(this.dndContainer, "container", "onCanvasDnDStart", "onCanvasDnDMove", "onCanvasDnDEnd", "onCanvasDnClick");
				} else if(this.mode == "addText") {
					this._hotspotToolPressListener = on(this.dndContainer,"mousedown", lang.hitch(this,"onToolTextStart"));
				} else if(this.mode == "addBox") {
					this.onToolBoxInit();
					this._hotspotToolPressListener = on(this.dndContainer,"mousedown", lang.hitch(this,"onToolBoxStart"));
				}
			}

    }

}
</script>