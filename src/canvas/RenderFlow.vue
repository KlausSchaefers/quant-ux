<script>
import css from 'dojo/css'
import lang from 'dojo/_base/lang'

export default {
    name: 'RenderFast',
    mixins:[],
    components: {},
    methods: {


			updateDnD (model) {
				this.logger.log(1,"updateDnD", "enter");

				for (let id in model.screens){
						let screen = model.screens[id]
						if (!this.screenDivs[id]) {
							console.debug(screen)
						}
				}
			},

			/**********************************************************************
			 * Rendering pipeline
			 **********************************************************************/

			renderFlowViewFast (model, zoomedModel, isResize = false){
				this.logger.log(1,"renderFlowViewFast", "enter");

				/**
				 * Check here if we really need a rerendering. SOmetimes this is also
				 * called after selection exit or so
				 */

				// console.debug(new Error().stack)

				this.beforeRender();
				this.cleanUpFast(isResize);
				this.renderCanvas();
				this.renderChangeCounter = 0
				this.renderCreateCounter = 0
				this.renderStartTime = new Date().getTime()

				/**
				 * start adding or updating stuff
				 */
				for (let id in model.screens){
						let screen = model.screens[id]
						let zoomedScreen = zoomedModel.screens[id]
						if (!this.screenDivs[id]) {
							/**
							 * Create new screen
							 */
							this.renderScreen(screen, zoomedScreen);
							this.renderedModels[screen.id] = screen

							this.renderCreateCounter++;
						} else {
							/**
							 * FIXME: we still have issues with the screen buttons!
							 * Sometiems there are double and not correctly removed!
							 */
							this.updateScreen(screen, zoomedScreen, isResize)
						}
				}

				/**
				 * Make sure the container widgets (grid) get
				 * the latest zoomed model.
				 * FIXME: Thsi should have been done in renderCanvas()...
				 */
				this.renderFactory.setZoomedModel(model)
				this.renderFactory.updatePositions(model)
				var widgets = this.getOrderedWidgets(model.widgets);
				for (let i=0; i< widgets.length; i++){
					let widget = widgets[i];
					let zoomedWidget = zoomedModel.widgets[widget.id]
					/**
					 * FIXME: we have to check here which for hidden stuff.
					 * 1) If stuff was hidden, and is now not hidden, the wiring will fail!
					 * 2) If stuff was visible and is not hidden, we have to remove the node
					 */

					/**
					 * We assume that for the first rendering we do not need to
					 * set the zIndex. For the updates we need, thus we pass i.
					 */
					if (!this.widgetBackgroundDivs[widget.id]) {
						this.renderWidget(widget, zoomedWidget);
						this.updateWidgetZ(widget, i)
						this.renderedModels[widget.id] = widget

						this.renderCreateCounter++;
					} else {
							this.updateWidget(widget, zoomedWidget, i, isResize);
					}
				}

				if (this.renderLines){
					for (let id in model.lines){
						let line = model.lines[id];
						if (!line.hidden){
							this.renderLine(model.lines[id]);
						}
					}
				}

				/**
				 * Remove not needed stuff
				 */
				for (let id in this.screenDivs) {
					if (!model.screens[id]) {
						this.deleteScreen(id)
					}
				}

				for (let id in this.widgetDivs) {
					if (!model.widgets[id]) {
						this.deleteWidget(id)
					}
				}

				/**
				 * FIXME: We could still try to avoid wireing everzthing from scrath
				 */
				if (isResize === false) {
					this.wireEvents();
				}

				this.renderSelection();
				this.renderDistance();
				if(this.animate){
					setTimeout(lang.hitch(this,"renderAnimation"),1);
				}

				this.logger.log(-1, "renderFlowViewFast", "exit > #update: " + this.renderChangeCounter + ' > #new : '+ this.renderCreateCounter , (new Date().getTime() - this.renderStartTime) +'ms');
			},

			countNodes (node) {
				let result = 1;
				var children = [...node.childNodes];
				children.forEach(child => {
					result += this.countNodes(child)
				})
				return result;
			},


			/********************************************************
			 *   Screen
			 ********************************************************/

			///esizeScreen (screen) {
			//	this.updateScreen(screen)
			//},

			renderScreen (screen, zoomedScreen){
				this.logger.log(4,"renderScreen", "enter");

				var dndDiv = null;
				var backgroundDiv = null;
				/**
				* We need these div also to check if the screen was rendered!
				*/
				if (!this.screenDivs[screen.id]){
					/**
					 * create dnd
					 */
					dndDiv = this.createScreenDnD(zoomedScreen);
					this.screenDivs[screen.id] = dndDiv;
					this.dndContainer.appendChild(dndDiv);

					var lbl = document.createElement("div");
					css.add(lbl, "MatcScreenLabel");
					this.setTextContent(lbl, screen.name);
					this.screenLabels[screen.id] = lbl;
					dndDiv.appendChild(lbl);

					/**
					 * Create a background box
					 */
					backgroundDiv = this.createScreen(screen);
					this.screenContainer.appendChild(backgroundDiv);
					this.screenBackgroundDivs[screen.id] = backgroundDiv;
				}

				/**
				 * set style and grid
				 */
				this.renderFactory.setStyle(backgroundDiv, screen);
				this.renderGrid(dndDiv, screen);
				this.renderScreenButtons(dndDiv, screen)

				return dndDiv;
			},

			updateScreen (screen, zoomedScreen) {
				if (this.elementHasChanged(screen)) {
					let dnd = this.screenDivs[screen.id]
					if (dnd) {

						this.cleanUpNode(dnd)
						this.updateBox(zoomedScreen, dnd)

						/**
						 * TODO: cleanUpNode() also removes the name. We should keep it :D
						 * Is there a better waz to remove all the other screen buttons?
						 */
						var lbl = document.createElement("div");
						css.add(lbl, "MatcScreenLabel");
						this.setTextContent(lbl, screen.name);
						this.screenLabels[screen.id] = lbl;
						dnd.appendChild(lbl);

						this.renderGrid(dnd, zoomedScreen);
						this.renderScreenButtons(dnd, zoomedScreen)

					}

					let background = this.screenBackgroundDivs[screen.id]
					if (background) {
						this.updateBox(screen, background)
						this.renderFactory.setStyle(background, screen);
					}
					this.renderedModels[screen.id] = screen
					this.renderChangeCounter++;
				}
			},

			deleteScreen (id) {
				let dnd = this.screenDivs[id]
				if (dnd && dnd.parentNode) {
					dnd.parentNode.removeChild(dnd);
				}
				let background = this.screenBackgroundDivs[id]
				if (background && background.parentNode) {
					background.parentNode.removeChild(background);
				}
				delete this.screenDivs[id]
				delete this.screenBackgroundDivs[id]
				delete this.renderedModels[id]
			},

			/********************************************************
			 *   WIDGETS
			 ********************************************************/

			renderWidget (widget, zoomedWidget){
				this.logger.log(4,"renderWidget", "enter");

				/**
					* check if we have to create div again.. Also used as indicator
					* if the widget was rendered!
					*/
				var div = null;
				if (!this.widgetBackgroundDivs[widget.id] && !this.isElementHidden(widget)){

					/**
						* create dnd
						*/
					if (this.renderDND && !this.isElementLocked(widget)) {

						div = this.createWidgetDnD(zoomedWidget);
						if(widget.inherited){
							css.add(div, "MatcWidgetDNDInherited");
						}
						this.widgetDivs[widget.id] = div;
						this.dndContainer.appendChild(div);
					}

					/**
						* Create background
						*/
					let divBack = this.createWidget(widget);
					this.screenContainer.appendChild(divBack);
					this.widgetBackgroundDivs[widget.id] = divBack;
				}
				return div;
			},

			updateWidget (widget, zoomedWidget, i, isResize) {
				if (isResize || this.elementHasChanged(widget)) {
					let dnd = this.widgetDivs[widget.id]
					if (dnd) {
						this.updateBox(zoomedWidget, dnd)
						dnd.style.zIndex = 10009 + i
					}
					let background = this.widgetBackgroundDivs[widget.id]
					if (background) {
						this.updateBox(widget, background)
						if (isResize) {
							this.renderFactory.reizeWidgetHTML(background, widget);
						} else {
							this.renderFactory.updateWidgetHTML(background, widget);
						}
						background.style.zIndex = i
					}
					this.renderedModels[widget.id] = widget
					this.renderChangeCounter++;
				}
				/**
				 * Since 2.1.6 we have the data view and need a callback
				 */
				this.updateWidgetDataView(widget)
			},

			updateWidgetDataView () {
				// child classes can implement
			},

			updateWidgetZ (widget, i) {
				let dnd = this.widgetDivs[widget.id]
				if (dnd) {
					dnd.style.zIndex = 10009 + i
				}
				let background = this.widgetBackgroundDivs[widget.id]
				if (background) {
					background.style.zIndex = i
				}
				this.renderChangeCounter++;
			},

			elementHasChanged (element) {
				/**
				 * TODO: we could check just for modified, but in this case we would have
				 * to make sure the renderedModels gets flushed on zooming.
				 */
				if (this.renderedModels[element.id]){
					let old = this.renderedModels[element.id]
					return !this.objectEquals(old, element)
				}
				return true
			},


			deleteWidget (id) {
				let dnd = this.widgetDivs[id]
				if (dnd && dnd.parentNode) {
					dnd.parentNode.removeChild(dnd);
				}
				let background = this.widgetBackgroundDivs[id]
				if (background && background.parentNode) {
					background.parentNode.removeChild(background);
				}
				delete this.widgetDivs[id]
				delete this.widgetBackgroundDivs[id]
				delete this.renderedModels[id]
			},

			/**************************************************
			 * CleanUp Code
			 **************************************************/

			cleanUpFast (isResize=false){
				this.logger.log(3,"cleanUpFast", "enter", isResize);

				this.cleanUpLines()
				this.cleanUpSVG()

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
				/**
				 * TODO: Be smarter later
				 */
				if (isResize === false) {
					this.cleanUpAllListeners();
				}
				this.cleanUpAlignment();

				css.remove(this.container, "MatcCanvasFadeOut");
				css.remove(this.container, "MatcCanvasModeAlign");
				css.remove(this.container, "MatcCanvasModeReplicate");

				this.cleanUpLines();
				this.cleanUpDebugLines();
				window.scrollTo(0, 0);

				if (this.cleanUpDistributionHandlers) {
					this.cleanUpDistributionHandlers()
				}
			},

			forceRenderUpdates () {
				this.logger.warn("forceRenderUpdates", "enter");
				this.renderedModels = {}
			},

			forceCompleteRender () {
				this.logger.warn("forceCompleteRender", "enter");

				this.cleanUpNode(this.screenContainer)
				this.cleanUpNode(this.widgetContainer)
				// this.screenContainer.innerHTML = "";
				// this.widgetContainer.innerHTML = "";
				this.renderFactory.cleanUp();

				this.widgetDivs = {};
				this.widgetBackgroundDivs = {};
				this.screenDivs = {};
				this.screenLabels = {};
				this.screenBackgroundDivs = {};
				this.lineSVGs = {};
				this.gridBackground = {};
				this.renderedModels = {}
			},

			cleanUpNode (node) {
				var fc = node.firstChild;
				while (fc) {
					node.removeChild(fc);
					fc = node.firstChild;
				}
			}
    },
    mounted () {
    }
}
</script>