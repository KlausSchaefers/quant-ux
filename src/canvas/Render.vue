<script>
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import domGeom from 'dojo/domGeom'
import win from 'dojo/win'
import topic from 'dojo/topic'
import _Color from 'common/_Color'
import Ruler from 'canvas/Ruler'
import GridAndRulerSnapp from 'canvas/GridAndRulerSnapp'
import SimpleGrid from 'canvas/SimpleGrid'
import RenderFlow from 'canvas/RenderFlow'
import Wiring from 'canvas/Wiring'
import ModelUtil from 'core/ModelUtil'

export default {
    name: 'Render',
    mixins:[_Color, RenderFlow, Wiring],
    data: function () {
		/**
			 * The canvas has the following states:
			 *
			 * 0 = Default
			 *
			 * 1 = Screen DragNDrop
			 *
			 * 2 = Widget DragNDrop
			 *
			 * 3 = Adding new box
			 *
			 * 4 = Resizing entity
			 *
			 * 5 = Container DragNDrop
			 *
			 * 6 = Add Line
			 *
			 * 7 = Add Line 2
			 *
			 * 8 = Copy Style
			 *
			 * 9 = Selection
			 *
			 * 10 = Align
			 *
			 * 11 = StandAlone
		 	 */
      return {
			canvasPos: {},
			containerSize: {},
			roundCoordinates: false,
			state: 0,
			isSinglePage: false,
			defaultFontSize: 12,
			canvasFlowWidth: 40000,
			canvasFlowHeight: 20000,
			canvasStartX: -1000,
			canvasStartY: -1000,
			canvasMargin: 0.6,
			moveMode: "ps",
			renderDND: true,
			renderLines: false,
			showDistance: true,
			wireInheritedWidgets: false,
			showAnimation: false,
			showRuler: true,
			hasSelectOnScreen: false,
			gridBackground: {},
			isSnappyRuler: false
        }
    },
    components: {},
    methods: {
		initSize () {
			let height = win.getBox().h
			this.domNode.style.height = `${height}px`
		},

    	initRender (){
			this.logger.log(2,"initRender", "enter");
			this.domPos = domGeom.position(this.domNode);

			this.widgetDivs = {};
			this.widgetBackgroundDivs = {};
			this.screenDivs = {};
			this.screenGridDivs = {}
			this.screenLabels = {};
			this.screenBackgroundDivs = {};
			this.lineSVGs = {};
			this.linePoints = {}
			this.gridBackground = {};
			this.renderedModels = {};
			this.resetCanvasSelection()

			this.own(topic.subscribe("matc/canvas/fadeout", lang.hitch(this, "onFadeOut")));
			this.own(topic.subscribe("matc/canvas/fadein", lang.hitch(this, "onFadeIn")));
			this.logger.log(2,"initRender", "exit");
		},

		onFadeOut (){
			css.add(this.container, "MatcCanvasFadeOut");
			if (this.toolbar) {
				this.toolbar.onFadeOut()
			}
		},

		onFadeIn (){
			css.remove(this.container, "MatcCanvasFadeOut");
			if (this.toolbar) {
				this.toolbar.onFadeIn()
			}
		},

		/**********************************************************************
		 * Messages
		 **********************************************************************/

		showSuccess (msg){
			if(this.message){
				css.add(this.message, "MatcMessageSuccess");
				css.remove(this.message, "MatcMessageError MatcMessageHint");
				this.message.textContent = msg;
				setTimeout(lang.hitch(this,"hideMessage"),3000);
			}
		},

		showError (msg){
			if(this.message){
				css.add(this.message, "MatcMessageError");
				css.remove(this.message, "MatcMessageSuccess MatcMessageHint");
				this.message.textContent = msg;
				setTimeout(lang.hitch(this,"hideMessage"), 3000);
			}
		},

		showHint (msg){
			if(this.message){
				css.add(this.message, "MatcMessageHint");
				css.remove(this.message, "MatcMessageSuccess MatcMessageSuccess");
				this.message.textContent = msg;
				setTimeout(lang.hitch(this,"hideMessage"), 3000);
			}
		},

		hideMessage (){
			if(this.message){
				css.remove(this.message, "MatcMessageSuccess MatcMessageError MatcMessageHint");
			}
		},


		setState (state){
			if(state != this.state){

				this.logger.log(2,"setState", "enter > " + state);

				this.state = state;

				/**
				 * cleanup
				 */
				if(this.domNode){
					css.remove(this.domNode, "MatcCanvasStateAdd MatcCanvasStateDnD MatcCanvasStateBeginLine MatcCanvasStateEndLine MatcCanvasStateCopyStyle");
					//this.onDragCleanup();

					if(state == 1 || state == 2){
						css.add(this.domNode, "MatcCanvasStateDnD");
					}

					if(state == 3){
						css.add(this.domNode, "MatcCanvasStateAdd");
					}

					if(state == 6){
						css.add(this.domNode, "MatcCanvasStateBeginLine");
					}

					if(state == 7){
						css.add(this.domNode, "MatcCanvasStateEndLine");
					}

					if(state == 8){
						css.add(this.domNode, "MatcCanvasStateCopyStyle");
					}
				}

			}
		},

		initViewport () {
			// console.debug("initViewport", this.viewport)
			// if (this.viewport) {
		
			// 	this.canvasPos.x = this.viewport.x
			// 	this.canvasPos.y = this.viewport.y
			// 	this.zoom = this.viewport.zoom
			// 	//this.$emit("viewport", viewport)
			// }
		},

		onViewportChange () {
			const viewport = {
				zoom: this.zoom,
				x: this.canvasPos.x,
				y: this.canvasPos.y
			}
			this.$emit("viewport", viewport)
		},

		/**********************************************************************
		 * Container Size
		 **********************************************************************/

		/**
		 * Ugly method to set the height from outside. for some shity
		 * reason this is needed as all div will have just size ==0.
		 */
		setHeight (h){
			this.domNode.style.height = h + "px";
		},

		setViewLines (renderLines){
			this.renderLines = renderLines;
			this.settings.renderLines = renderLines;
			this._setStatus("matcSettings", this.settings );
			this.rerender();
		},

		setShowDistance (value){
			this.showDistance = value;
			this.settings.showDistance = value;
			this._setStatus("matcSettings",this.settings);
		},

		setShowAnimation (value){
			this.showAnimation = value;
			this.settings.showAnimation = value;
			this._setStatus("matcSettings",this.settings);
		},

		moveToScreen (screenID){
			if(this.model && this.model.screens[screenID]){
				var screen = this.model.screens[screenID];
				var winBox = win.getBox();
				var xOffSetScreen = (screen.x+ screen.w/2);
				var xOffSetWindow = (winBox.w/2)+ Math.abs(this.canvasPos.x);
				this.canvasPos.x = this.canvasPos.x + (xOffSetWindow - xOffSetScreen) -100;
				var yOffSetScreen = (screen.y);
				var yOffSetWindow = Math.min(winBox.h/2,200)+ Math.abs(this.canvasPos.y);
				this.canvasPos.y = this.canvasPos.y + (yOffSetWindow - yOffSetScreen) -100;
				this.setContainerPos();
			}
		},

		moveToBox (box) {
			if(this.model){
				var winBox = win.getBox();
				var xOffSetScreen = (box.x);
				var xOffSetWindow = (winBox.w/2)+ Math.abs(this.canvasPos.x);
				this.canvasPos.x = this.canvasPos.x + (xOffSetWindow - xOffSetScreen) -100;
				var yOffSetScreen = (box.y);
				var yOffSetWindow = Math.min(winBox.h/2,200)+ Math.abs(this.canvasPos.y);
				this.canvasPos.y = this.canvasPos.y + (yOffSetWindow - yOffSetScreen) -100;
				// if (animate) {
				// 	css.add(this.container, "MatcCanvasContainerAnimatePos")
				// 	setTimeout(() => {
				// 		css.remove(this.container, "MatcCanvasContainerAnimatePos")
				// 	}, 5000)
				// }
				this.setContainerPos();

			}
		},

		/**********************************************************************
		 * Fonts
		 **********************************************************************/

		setFonts (fonts) {
			this.logger.log(3,"setFonts", "enter > ", fonts);
			if (fonts) {
				this.attachFontsToDom(fonts)
			}
		},

		/**********************************************************************
		 * Container Size
		 **********************************************************************/

		initContainerSize () { // was setContainerSize
			this.container.style.height = this.canvasPos.h + "px";
			this.container.style.width = this.canvasPos.w + "px";

			this.dndContainer.style.fontSize = this.defaultFontSize + "px";

			this.dndContainer.style.height = this.canvasPos.h + "px";
			this.dndContainer.style.width = this.canvasPos.w + "px";

			this.containerSize = {
				h: this.canvasPos.h,
				w: this.canvasPos.w
			}

			this.container.style.height = this.containerSize.h + "px";
			this.container.style.width = this.containerSize.w + "px";
		},


		setContainerPos (ignoreScollUpdate){

			this.containerSize = {
				h: this.getZoomed(this.canvasPos.h, this.zoom),
				w: this.getZoomed(this.canvasPos.w, this.zoom)
			}

			this.domUtil.setPos(this.container, this.canvasPos)
			this.domUtil.setScale(this.zoomContainer, this.zoom)

			this.container.style.height = this.containerSize.h + "px";
			this.container.style.width = this.containerSize.w + "px";

			this.dndContainer.style.height = this.containerSize.h + "px";
			this.dndContainer.style.width = this.containerSize.w + "px";
			this.dndContainer.style.fontSize = this.getZoomed(this.defaultFontSize, this.zoom)  + "px";

			if (this.svg) {
				this.updateSVG()
			}

			if (!ignoreScollUpdate){
				this.updateScrollHandlers();
			}

			this.onViewportChange()
		},

		isInContainer (obj){
			if(
				(obj.x > 0 && (obj.x + obj.w) < this.getZoomed(this.canvasPos.w, this.zoom)) &&
				(obj.y > 0 && (obj.y + obj.h) < this.getZoomed(this.canvasPos.h, this.zoom))
				){
				return true;
			}
			return false;
		},



		/**********************************************************************
		 * Rendering pipeline
		 **********************************************************************/

		rerender (){
			this.render(this.sourceModel);
		},


		updateScalledModel () {
			//console.time('updateScalledModel')
			this.model = ModelUtil.createScalledModelFast(this.sourceModel, this.zoom, this.roundCoordinates)
			//console.timeEnd('updateScalledModel')
		},

		updateSourceModel (sourceModel, changes) {
			this.logger.log(1,"updateSourceModel", "enter", changes);
			this.sourceModel = sourceModel;
			this.updateScalledModel()
		},

		renderZoom () {

			this.setContainerPos()
			if (this.model) {
				this.cleanUpScreenButtons()
				
				/**
				 * This method gets called to often when zooming. We should find a way to debounce this
				 * without flickering labels or rulers
				 */
				this.updateScalledModel()
				this.updateDnD(this.model)
				/**
				 * 4.0.40: We do not call renderSelection(),as this would also update the 
				 * property panel. We just need to update the seelction handlers
				 */
				this.updateSelection();
				this.updateGridRezise();
				this.renderDistance();

				/**
				 * Since 5 we have absolute canvas positions and we need
				 * to rescale
				 */
				this.updateCommentPositions();
			}
		},

		/**
		 * Method should be called if the positions of widgets have been
		 * changed, but we did not do an complete rerender. This happens
		 * for instance when widgets are moved.
		 */
		onWidgetPositionChange (sourceModel) {
			this.logger.log(1,"onWidgetPositionChange", "enter", sourceModel);
			this.sourceModel = sourceModel;
			this.updateScalledModel()
			this.renderFactory.setZoomedModel(sourceModel);
			this.renderFactory.updatePositions(sourceModel)
			this.renderLayerList(sourceModel);
		},


		render (sourceModel, isResize = false){
			this.logger.log(2,"render", "enter", isResize);
			let renderStart = new Date().getTime();

			try {
				/**
				 * The sourceModel is used to draw the elements on the zoomable
				 * background, whereas the model is used to handle DND
				 */
				this.sourceModel = ModelUtil.updateTemplateModifies(sourceModel);

				/**
				 * Use to render drag and drop nodes
				 */
				this.updateScalledModel()

				this.renderFlowViewFast(this.sourceModel, this.model, isResize);

				this.afterRender(this.sourceModel, this.model);

				this.renderComments();

				/**
				 * Also update layer list. The renderFlow might call
				 * select which extends the group with additonal children!
				 */
				this.renderLayerList(sourceModel);

				/**
				 * Make sure we continue the add mode
				 */
				this.renderAddCommand();
			} catch(e){
				this.logger.error("render", "ups", e);
				this.logger.sendError(e);
			}
			this.logger.log(3,"render", "exit > " + (new Date().getTime() - renderStart) + 'ms');
		},


		renderDistance (){
			if(this.mode == "distance"){
				if(this.getSelectedWidget()){
					this.renderScreenDistance();
				}
			}
		},

		renderCanvas (){
			this.initSVG();
			this.setContainerPos();
		},

		beforeRender () {
		},

		/**
		 * add divs back to dom!
		 */
		afterRender (){
			if(this._afterRenderCallBack ){
				/**
				 * Call the callback to make sure it is not running in request animationframe
				 * FIXME: I had now once the issue that the callback was null or so beucase the
				 * edit was closed....
				 */
				setTimeout(this._afterRenderCallBack, 50);
			}

			if(this._afterRenderCallBackSync){
				this._afterRenderCallBackSync()
			}
			delete this._afterRenderCallBack ;
			delete this._afterRenderCallBackSync
		},


		addAfterRenderCallBack (fct, isSync = false){
			if (!isSync) {
				this._afterRenderCallBack = fct;
			} else {
				this._afterRenderCallBackSync = fct
			}
		},

		renderScreenButtons () {
			/**
			 * Methdod to be implemented by mixins
			 */
		},


		/**************************************************
		 * CleanUp Code
		 **************************************************/

		cleanUp (){
			this.logger.log(2,"cleanUp", "enter");

			if (this.settings && this.settings.fastRender) {
				return this.cleanUpFast();
			}

			/**
			 * Make sure inline edit is flushed
			 */
			this.inlineEditStop();
			this.cleanUpComments();
			this.cleanUpScreenButtons();

			/**
			 * Cleanup any stuff from the zoom
			 */
			this.cleanUpZoom();
			this.cleanUpAllListeners();
			this.cleanUpAlignment();

			this.widgetDivs = {};
			this.widgetBackgroundDivs = {};
			this.screenDivs = {};
			this.screenGridDivs = {}
			this.screenLabels = {};
			this.screenBackgroundDivs = {};
			this.lineSVGs = {};
			this.gridBackground = {};

			css.remove(this.container, "MatcCanvasFadeOut");
			css.remove(this.container, "MatcCanvasModeAlign");
			css.remove(this.container, "MatcCanvasModeReplicate");
			css.remove(this.container, "MatcCanvasModeGridResize");

			//this.screenContainer.innerHTML = "";
			//this.widgetContainer.innerHTML = "";
			this.domUtil.removeAllChildNodes(this.screenContainer)
			this.domUtil.removeAllChildNodes(this.widgetContainer)
			this.renderFactory.cleanUp();
			this.cleanUpLines();
			this.cleanUpDebugLines();
			window.scrollTo(0, 0);

			if (this.cleanUpDistributionHandlers) {
				this.cleanUpDistributionHandlers()
			}
		},



		cleanUpAllListeners (){
			this.cleanUpDragNDropListenerListener();
			this.cleanUpTempListener();
			if(this._canvasClickListener){
				this._canvasClickListener.remove();
				delete this._canvasClickListener;
			}
			this.cleanUpSelectionListener();
			if(this._selectionToolPressListener){
				this._selectionToolPressListener.remove();
				delete this._selectionToolPressListener;
			}
			if(this._hotspotToolPressListener){
				this._hotspotToolPressListener.remove();
				delete this._hotspotToolPressListener;
			}
			this.cleanUpResizeHandles();
			this.cleanUpGridResize()
			this.cleanUpAddNDrop();
		},

		cleanUpScreenButtons () {
		   /**
			* Methdod to be implemented by mixins
			*/
		},

			/**************************************************
		 * New wiring methods?
		 **************************************************/

		addCanvasEventHandler (id, handler) {
			if (!id) {
				console.error('addCanvasEventHandler() > no id passed', id, new Error().stack)
			}
			if (!this._canvasEventHandlers) {
				this._canvasEventHandlers = {}
			}
			if (!this._canvasEventHandlers[id]) {
				this._canvasEventHandlers[id] = []
			}
			this._canvasEventHandlers[id].push(handler)
		},

		removeCanvasEventHandler (id) {
			if (this._canvasEventHandlers && this._canvasEventHandlers[id]) {
				let handlers = this._canvasEventHandlers[id];
				handlers.forEach(handler => {
					handler.remove()
				})
				this._canvasEventHandlers[id] = []
			}
		},

		cleanCanvasEventHandler () {
			for (let id in this._canvasEventHandlers) {
				this.removeCanvasEventHandler(id)
			}
		},

		/**********************************************************************
		 * Create methods that assemble box stuff
		 **********************************************************************/


		renderGrid (backgroundDiv){

			if(this.model.grid && this.model.grid.visible){

				let z = '1'
				if (this.model.grid.type === "columns"){

					const h = this.model.grid.h * 1
					const w = this.model.grid.w * 1
				
					if (!this.gridBackground[z]){
						const columnCount = this.model.grid.columnCount * 1;
						const columnOffset = this.model.grid.columnOffset * 1;
						const columnGutter = this.model.grid.columnGutter * 1;
						const columnWidth = this.model.grid.columnWidth * 1;
					
						const c = document.createElement("canvas");
						c.width = this.sourceModel.screenSize.w;
						c.height = 1;
						const context = c.getContext("2d");

						let lastX = columnOffset;
						for (let i=0; i< columnCount; i++){
							let x = lastX + columnWidth;
						
							// if gutter is 0, we just draw some lines...
							if (columnGutter > 0 ) {
								context.moveTo(Math.round(lastX), 0);
								context.lineTo(Math.round(x), 0);
							} else {
								context.moveTo(Math.round(lastX), 0);
								context.lineTo(Math.round(lastX +1), 0);
								if (i === (columnCount-1)){
									context.moveTo(Math.round(x-1), 0);
									context.lineTo(Math.round(x), 0);
								}
							}
							lastX = x + columnGutter;
						}
						/**
						* We had here somehow a ghost h...
						*/
						context.moveTo(0, h);
						context.lineTo(w, h);
						context.strokeStyle = this.model.grid.color;
						context.stroke();
						let url = "url(" + c.toDataURL("image/png")  + ")";
						this.gridBackground[z] = url;
					}
					backgroundDiv.style.backgroundImage = this.gridBackground[z]
				} else {

					/**
					 * We render with double resolution and let the broser sort it out. Wr could call
					 * this on zoom and adopt z to the zoom
					 */
					const z = 2
					const h = this.model.grid.h * z;
					const w = this.model.grid.w * z;

					if (w > 0 && h > 0 && w < this.sourceModel.screenSize.w && h < this.sourceModel.screenSize.h ){

						if (!this.gridBackground[z]){
							let c = document.createElement("canvas");
							c.width=w;
							c.height=h;
							let context = c.getContext("2d");
							if(this.model.grid.style=="line"){
								context.moveTo(w, 0);
								context.lineTo(w, h);
								context.moveTo(0, h);
								context.lineTo(w, h);
								context.strokeStyle = this.model.grid.color;
								context.stroke();
							} else {
								context.moveTo(w-1, h);
								context.lineTo(w, h);
								context.strokeStyle = this.model.grid.color;
								context.stroke();
							}
							this.gridBackground[z] = "url(" + c.toDataURL("image/png")  + ")";
						}
						backgroundDiv.style.backgroundImage = this.gridBackground[z]
						backgroundDiv.style.backgroundSize = w / z + 'px ' + h / z + 'px'
					}
				}
			} else {
				backgroundDiv.style.backgroundImage = 'none'
			}
    	},

		createScreenDnD (screen){
			this.logger.log(4,"createScreenDnD", "enter");

			const div = this.createBox(screen);
			div._screenID = screen.id
			div._screenDND = true		
			css.add(div, "MatcScreenDnD");
			return div;
		},

		createScreenLabel(screen) {
			const lbl = document.createElement("div");
			css.add(lbl, "MatcScreenLabel");
			lbl._screenLabel = true
			lbl._screenID = screen.id
			this.setTextContent(lbl, screen.name);
			return lbl
		},

		createScreen (screen){
			this.logger.log(4,"createScreen", "enter");
			const div = this.createBox(screen);
			css.add(div, "MatcScreen");
			return div;
		},


		createWidgetDnD (widget){
			this.logger.log(4,"createWidgetDnD", "enter");
			const div = this.createBox(widget);
			div._widgetID = widget.id
			css.add(div, "MatcWidgetDND");
			if (this.hasLogic(widget)){
				css.add(div, "MatcLogicWidgetDnD");
			}
			/**
			 * Since 2.1.6 we have the data view and need a callback
			 */
			this.createWidgetDataView(widget, div)
			return div;
		},

		createWidgetDataView () {
			// child classes can implement
		},

		createZoomedWidget (widget) {
			this.logger.log(-1,"createZoomedWidget", "enter");
			const div = this.createBox(widget);
			css.add(div, "MatcWidget");
			this.renderFactory.setScaleFactor(this.zoom, this.zoom)
			this.renderFactory.createWidgetHTML(div, widget);
			this.renderFactory.setScaleFactor(1, 1)
			if(this.hasLine(widget)){
				css.add(div, "MatcWidgetWithTransition");
			}
			return div;
		},

		createWidget (widget){
			this.logger.log(4,"createWidget", "enter");
			const div = this.createBox(widget);
			css.add(div, "MatcWidget");
			this.renderFactory.createWidgetHTML(div, widget);
			if(this.hasLine(widget)){
				css.add(div, "MatcWidgetWithTransition");
			}
			return div;
		},

		createBox (box){
			this.logger.log(6,"createBox", "enter");
			const div = document.createElement("div");
			this.domUtil.setBox(div, box)
			css.add(div, "MatcBox");
			return div;
		},

		updateBox (box, div){
			this.domUtil.setBox(div, box)
			return div;
		},


		setWidgetPosition (id, sourcePos, zoomedPos){
			const widget = this.model.widgets[id];
			if (widget) {
				widget.x = zoomedPos.x;
				widget.y = zoomedPos.y;
				widget.w = zoomedPos.w;
				widget.h = zoomedPos.h;
				const dndDiv = this.widgetDivs[id];
				if (dndDiv){
					this.updateBox(widget, dndDiv);
				}
			}

			const sourceWidget = this.sourceModel.widgets[id]
			if (sourceWidget) {
				sourceWidget.x = sourcePos.x;
				sourceWidget.y = sourcePos.y;
				sourceWidget.w = sourcePos.w;
				sourceWidget.h = sourcePos.h;
				const sourceDiv = this.widgetBackgroundDivs[id];
				if(sourceDiv){
					this.updateBox(sourcePos, sourceDiv);
				}
			}
		},


		setScreenPosition (){
		},

		setTempWidgetStyle (id, style){
			const sourceWidget = this.getUpdatedSourceWidget(id, style)
			const div = this.widgetBackgroundDivs[id];
			if(div && sourceWidget){
				this.renderFactory.setStyle(div, sourceWidget, true);
				this.setCopyStyle(sourceWidget, true);
			} else {
				console.warn("setTempWidgetStyle() > Cannot set widget style", id, style);
			}
		},

		setTempWidgetProps(id, props){
			const sourceWidget = this.getUpdatedSourceWidgetProps(id, props)
			const div = this.widgetBackgroundDivs[id];
			if(div && sourceWidget){
				this.renderFactory.setStyle(div, sourceWidget, true);
			} else {
				console.warn("setTempWidgetProps() > Cannot set widget style", id, props);
			}
		},

		getUpdatedSourceWidgetProps (id, props) {
			const sourceWidget = this.sourceModel.widgets[id];
			if (sourceWidget) {
				for (let k in props) {
					sourceWidget.props[k] = props[k];
				}
			}
			return sourceWidget
		},


		getUpdatedSourceWidget (id, style) {
			const sourceWidget = this.sourceModel.widgets[id];
			if (sourceWidget) {
				for (let k in style) {
					sourceWidget.style[k] = style[k];
				}
			}
			return sourceWidget
		},

		setWidgetStyle (id, style, widget){
			this.logger.log(1,"setWidgetStyle", "enter > ", id);
			/**
			 * get the source model and copy the style. Asume
			 * partieal updates...
			 */
			const sourceWidget = this.getUpdatedSourceWidget(id, style)
			const div = this.widgetBackgroundDivs[id];
			if (div && sourceWidget){
				/**
				 * Flush inlineEdit if needed
				 */
				const newLabel = this.inlineEditStop();
				if (newLabel && widget.props) {
					/**
						* For some reason this will overwrite the style change in the undo()
						* This we live if this...
						*/
					//console.debug("overwrite inline", newLabel)
					//model.props.label = newLabel;
				}
				/**
				 * Pass here the source model! Otherwise the repeater or so, will have issues
				 * with zooming
				 */
				this.renderFactory.setStyle(div, sourceWidget, true);
				this.setCopyStyle(sourceWidget, false);
			} else {
				console.warn("setWidgetStyle() > Cannot set widget style", id, style);
			}
		},



		/**
		 * copy style to copies (from master screen)
		 */
		setCopyStyle (sourceWidget, isTempUpdate) {

			if (sourceWidget.copies){
				for(let i=0; i< sourceWidget.copies.length; i++){
					const copyID = sourceWidget.copies[i];
					const copyWidget = this.sourceModel.widgets[copyID];
					const copyDiv = this.widgetBackgroundDivs[copyID];
					if(copyWidget && copyDiv){
						copyWidget.style = sourceWidget.style;
						copyWidget.props = sourceWidget.props;
						this.renderFactory.setStyle(copyDiv, copyWidget);
					}
				}
			}

			/**
			 * Since 2.2.0 we have screen segments
			 */
			if (sourceWidget.segmentParent) {
				this.renderFactory.updateSegementChild(sourceWidget, this.sourceModel);
			}

			if (sourceWidget.container) {
				this.renderFactory.updateContainerChild(sourceWidget, this.sourceModel);
			}


			if(sourceWidget.inheritedCopies){
				for(let i=0; i< sourceWidget.inheritedCopies.length; i++){
					/**
						* Here we get also the latest updated model method
						*/
					const copyID = sourceWidget.inheritedCopies[i];
					const copyWidget = this.model.widgets[copyID];
					if (isTempUpdate) {
						/**
							* Attention: If this code is called
							* from the setTempWidgetStyle() method, the copyWidget
							* has off course already a style, because it was set
							* in the Layout.createInheritedModel() method.
							*
							* Thus the Layout.mixin() method will not detect the
							* that for instance the background is inherited...
							*
							* Thereefore we have a special update methid here
							*/
						copyWidget.style = this.mixinNotOverwriten(sourceWidget.style, copyWidget.style)
						copyWidget.props = this.mixinNotOverwriten(sourceWidget.props, copyWidget.props)
					} else {
						/**
							* This code is called when the setTempWidgetStyle() is done. If we would
							* call the normal mixin method it would set an empty _mixin. We do not that,
							* so we ignore that (and copy the old _mixin)
							*/
						copyWidget.style = this.mixin(sourceWidget.style, copyWidget.style, false)
						copyWidget.props = this.mixin(sourceWidget.props, copyWidget.props, false)
					}

					const copyDiv = this.widgetBackgroundDivs[copyID];
					if(copyWidget && copyDiv){
						this.renderFactory.setStyle(copyDiv, copyWidget);
					}
				}


			}
		},

		setScreenStyle (id){
			const screen = this.model.screens[id];
			const div = this.screenBackgroundDivs[id];
			if(screen && div){
				this.renderFactory.setStyle(div, screen);
				/**
					* Update label as well
					*/
				if(this.screenLabels[id]){
					this.setTextContent(this.screenLabels[id], screen.name);
				}
			} else {
				this.logger.error("setScreenStyle","No screen div for " + id);
				this.logger.sendError(new Error("No Screen Div in setScreenStyle"))
			}
		},

		setTempScreenStyle (id, style){
			const screen = this.model.screens[id];
			const div = this.screenBackgroundDivs[id];
			if(screen && div){
				for (let k in style) {
					screen.style[k] = style[k];
				}
				this.renderFactory.setStyle(div, screen);
			} else {
				this.logger.error("setScreenStyle","No screen div for " + id);
				this.logger.sendError(new Error("No Screen Div in setScreenStyle"))
			}
		},


		/***************************************************************************
			* Mouse Functons
			***************************************************************************/

		getCanvasMousePosition (e){
			const pos = this._getMousePosition(e);
			pos.x -= (this.domPos.x + this.canvasPos.x);
			pos.y-= (this.domPos.y + this.canvasPos.y);
			return pos;
		},

		getRelCanvasMousePosition (e){
			const pos = this.getCanvasMousePosition(e);
			pos.x = pos.x / this.getZoomed(this.canvasPos.w, this.zoom);
			pos.y = pos.y / this.getZoomed(this.canvasPos.h, this.zoom);
			return pos;
		},


		getAbsCanvasMousePosition (e){
			const pos = this._getMousePosition(e);
			return pos;
		},


		/***************************************************************************
			* Align
		***************************************************************************/

		alignmentShowDistribution (distances){

			if (this._alignmentTool && this._alignmentTool.showDistribution){
				this._alignmentTool.showDistribution(distances)
			}
		},

		alignmentStart (selectedType, selectedModel, activePoint, ignoreIds, showDimensions){
			this.logger.log(1,"alignmentStart","enter > " + selectedType, this.settings.snapGridOnlyToTopLeft);

			/**
			 * Use the grid only when widget is selected and grid is specified
			 */
			if (this.model.grid) {
				if ("widget" == selectedType || "boundingbox" == selectedType || "group" == selectedType ||  "multi" == selectedType) {
					this._alignmentTool = new GridAndRulerSnapp();
					this._alignmentTool.ignoreGroup = this._dragNDropIgnoreGroup;
					this._alignmentTool.showDndDistance = this.showDistance;
					this._alignmentTool.snapGridOnlyToTopLeft = this.settings.snapGridOnlyToTopLeft
					this._alignmentTool.showDimensions = showDimensions;
					if(ignoreIds){
						this._alignmentTool.ignoreIds = ignoreIds;
						this._alignmentTool.setSelectedIDs(ignoreIds);
					}
					this._alignmentTool.start(this, selectedType, selectedModel, activePoint, this.model.grid, this.zoom);
				} else if("grid" == selectedType ) {
					this._alignmentTool = new SimpleGrid();
					this._alignmentTool.start(this, this.model.grid, this.zoom, "RightDown");
					this._alignmentTool.showDimensions = showDimensions;
				} else {
					this._alignmentTool = new Ruler();
					this._alignmentTool.start(this, selectedType, selectedModel, activePoint, this.model.grid, this.zoom, ignoreIds);
				}
			} else  {
				this._alignmentTool = new Ruler();
				this._alignmentTool.start(this, selectedType, selectedModel, activePoint, this.model.grid, this.zoom, ignoreIds);
			}
			this._alignmentToolInited = true;
		},


		allignPosition (pos, e){
			if(this._alignmentTool){
				var mouse = this.getCanvasMousePosition(e);
				return this._alignmentTool.correct(pos, e, mouse);
			}
			return pos;
		},

		cleanUpAlignment (){
			this.logger.log(4,"cleanUpAlignment","enter");
			if(this._alignmentTool){
				this._alignmentTool.cleanUp();
				delete this._alignmentTool;
			}
			this._alignmentToolInited = false;
		},

		getModelPosition (){

		},


		/***************************************************************************
		 * Cancel stuff
		 ***************************************************************************/
		/**
		 * Register a call back that will be called in case
		 * an cancel action is executed. The name of the
		 * method has to be passed. The methods can return true,
		 * to request an rerendering.
		 */
		setCanvasCancelCallback (l){
			this.logger.log(4,"setCanvasCancelCallback", "enter");
			this._cancelCallback = l;
		},

		cleanUpCancelCallbacks (){
			this.logger.log(-1,"cleanUpCancelCallbacks", "enter");
			this._cancelCallback = null;
		},

		onCancelAction (){
			this.logger.log(-1,"onCancelAction", "enter > " + this._cancelCallback);
			if (this._cancelCallback && this[this._cancelCallback]){
				const rerender = this[this._cancelCallback]();
				if(rerender){
					this.rerender();
				}
			} else {
				this.rerender();
			}
			this._cancelCallback = null;
		},

		/***************************************************************************
		* Helper
		***************************************************************************/
		getColor (value){
			if(value == 0){
				return this.defaultLineColor;
			}
			return this.mixColor(value);
		},


		getLastMousePos () {
			return this._lastMousePos;
		},

		setHoverWidget (w){
			this._lastHoverWidget = w;
		}
    },
    mounted () {
    }
}
</script>