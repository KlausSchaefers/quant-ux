<script>
import css from 'dojo/css'
import lang from 'dojo/_base/lang'

export default {
    name: 'RenderFast',
    mixins:[],
    components: {},
    methods: {
  
		/**********************************************************************
		 * Rendering pipeline
		 **********************************************************************/
			
		renderFlowViewFast (model){
			this.logger.log(0,"renderFlowViewFast", "enter");
			
			// console.debug(new Error().stack)
				
			this.beforeRender();
			this.model = model;
            this.cleanUpFast();	
			this.renderCanvas();
			this.renderChangeCounter = 0

		
			/**
			 * start adding or updating stuff
			 */
			for (let id in model.screens){
                let screen = model.screens[id]
                if (!this.screenDivs[id]) {
					this.renderScreen(screen);
					this.renderedModels[screen.id] = screen
					this.renderChangeCounter++;
                } else {
					/**
					 * FIXME: we still have issues with the screen buttons!
					 * Sometiems there are double and not correctly removed!
					 */
                    this.updateScreen(screen)
                }
			}
		
			/**
			 * Make sure the container widgets (grid) get 
			 * the latest zoomed model.
			 */
			this.renderFactory.setZoomedModel(model)
			this.renderFactory.updatePositions(model)
			var widgets = this.getOrderedWidgets(model.widgets);
			for (let i=0; i< widgets.length; i++){
				let widget = widgets[i];
				/**
				 * We assume that for the first rendering we do not need to
				 * set the zIndex. For the updates we need, thus we pass i.
				 */
                if (!this.widgetDivs[widget.id]) {
					this.renderWidget(widget);
					this.updateWidgetZ(widget, i)
					this.renderedModels[widget.id] = widget
					this.renderChangeCounter++;
                } else {
                    this.updateWidget(widget, i);
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
			this.wireEvents();		
			this.renderSelection();		
			this.renderDistance();		
			if(this.animate){
				setTimeout(lang.hitch(this,"renderAnimation"),1);
			}
		
			this.logger.log(0,"renderFlowViewFast", "exit > " + this.renderChangeCounter);
		},
        
        updateScreen (screen) {
			if (this.elementHasChanged(screen)) {
				let dnd = this.screenDivs[screen.id]
				if (dnd) {
					
					this.cleanUpNode(dnd)
					this.updateBox(screen, dnd)
					
					/**
					 * TODO: cleanUpNode() also removes the name. We should keep it :D
					 * Is there a better waz to remove all the other screen buttons?
					 */
					var lbl = document.createElement("div");
					css.add(lbl, "MatcScreenLabel");
					this.setInnerHTML(lbl, screen.name);
					this.screenLabels[screen.id] = lbl;
					dnd.appendChild(lbl);

					this.renderGrid(dnd, screen);
					this.renderScreenButtons(dnd, screen)

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

        updateWidget (widget, i) {
			if (this.elementHasChanged(widget)) {
				let dnd = this.widgetDivs[widget.id]
				if (dnd) {
					this.updateBox(widget, dnd)
					dnd.style.zIndex = 10009 + i
				}
				let background = this.widgetBackgroundDivs[widget.id]
				if (background) {
					this.updateBox(widget, background)
					this.renderFactory.updateWidgetHTML(background, widget);
					background.style.zIndex = i
				}
				this.renderedModels[widget.id] = widget
				this.renderChangeCounter++;
			}
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

		cleanUpFast (){
			this.logger.log(3,"cleanUpFast", "enter");
			
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
			this.cleanUpAllListeners();		
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
			this.logger.warn("forceCompleteRender", "enter");
			this.renderedModels = {}
		},
        
        forceCompleteRender () {
			this.logger.warn("forceCompleteRender", "enter");

            this.screenContainer.innerHTML = "";		
			this.widgetContainer.innerHTML = "";		
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
            // var cNode = node.cloneNode(false);
            // node.parentNode.replaceChild(cNode, node);
			var fc = node.firstChild;
            while( fc ) {
				node.removeChild(fc);
				fc = node.firstChild;
            }
        }
    }, 
    mounted () {
    }
}
</script>