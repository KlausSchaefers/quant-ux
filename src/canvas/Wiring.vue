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