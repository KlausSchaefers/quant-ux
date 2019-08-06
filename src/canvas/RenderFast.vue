<script>
import css from 'dojo/css'
import on from 'dojo/on'
import lang from 'dojo/_base/lang'
import domGeom from 'dojo/domGeom'
import topic from 'dojo/topic'
import CheckBox from 'common/CheckBox'
import Render from 'canvas/Render'

export default {
    name: 'RenderFast',
    mixins:[Render],
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
            state: 0, 
            isSinglePage: false, 
            defaultFontSize: 12, 
            canvasFlowWidth: 15000, 
            canvasFlowHeight: 8000, 
            canvasStartX: -1000, 
            canvasStartY: -1000, 
            canvasMargin: 0.6, 
            moveMode: "ps", 
            renderDND: true, 
            renderLines: true, 
            showDistance: true, 
            wireInheritedWidgets: false, 
			showAnimation: false, 
			showRuler: true,
            hasSelectOnScreen: false, 
            gridBackground: {}
        }
    },
    components: {},
    methods: {
        initRender (){
			this.logger.log(2,"initRender", "enter");				
			this.domPos = domGeom.position(this.domNode);
				
			this.widgetDivs = {};		
			this.widgetBackgroundDivs = {};		
			this.screenDivs = {};		
			this.screenLabels = {};		
			this.screenBackgroundDivs = {};		
			this.lineSVGs = {};		
			this.gridBackground = {};

			this.lineChkBox = this.$new(CheckBox);
			this.lineChkBox.setLabel("Show Lines");
			this.lineChkBox.setValue(this.renderLines);
			this.lineChkBox.placeAt(this.lineCntr);
			this.own(on(this.lineChkBox, "change", lang.hitch(this, "setViewLines")));		
			
			if(this.distanceCntr){
				this.distanceChkBox = this.$new(CheckBox);
				this.distanceChkBox.setLabel("Show Distance");
				this.distanceChkBox.setValue(this.showDistance);
				this.distanceChkBox.placeAt(this.distanceCntr);
				this.own(on(this.distanceChkBox, "change", lang.hitch(this, "setShowDistance")));
			}
			
			this.own(topic.subscribe("matc/canvas/fadeout", lang.hitch(this, "onFadeOut")));
			this.own(topic.subscribe("matc/canvas/fadein", lang.hitch(this, "onFadeIn")));		
			this.own(on(window, "contextmenu", lang.hitch(this, "onContextMenu")));		
			this.logger.log(2,"initRender", "exit");
		},
		
		
		/**********************************************************************
		 * Rendering pipeline
		 **********************************************************************/
			
		renderFlowView (model){
			this.logger.log(0,"renderFlowView (FAST)", "enter");
				
			this.beforeRender();
			this.model = model;
            this.cleanUp();	
            /**
             * FIXME: This could be better by resizing the SVG
             */
            this.cleanUpLines()
            this.cleanUpSVG()
			this.renderCanvas();

			/**
			 * FIXME: Make this incremental:
			 *  - clean up all wiring for now 
			 *  - Check new elements and create if needed
			 *  - update exiting ones 
			 *     - update boxes
			 *     - update styles
			 *     - call setStyle() and resize() and all UI widgets
			 * 
			 *  - remove not existing ones
			 *    - destroz widget and remove dnd nodes
			 * 
			 */
					
			/**
			 * start real rendering
			 */
			for (let id in model.screens){
                let screen = model.screens[id]
                if (!this.screenDivs[id]) {
	                this.renderScreen(screen);
                } else {
                    this.updateScreen(screen)
                }
			}
		
			var widgets = this.getOrderedWidgets(model.widgets);
			for (let i=0; i< widgets.length; i++){
                let widget = widgets[i];
                if (!this.widgetDivs[widget.id]) {
                    this.renderWidget(widget);
                } else {
                    this.updateWidget(widget);
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
		
			this.wireEvents();		
			this.renderSelection();		
			this.renderDistance();		
			if(this.animate){
				setTimeout(lang.hitch(this,"renderAnimation"),1);
			}		
			this.logger.log(3,"renderFlowView", "exit");
		},
        
        updateScreen (screen) {
            let dnd = this.screenDivs[screen.id]
            if (dnd) {
                this.cleanUpNode(dnd)
                this.updateBox(screen, dnd)
                this.renderGrid(dnd, screen);
                this.renderScreenButtons(dnd, screen)
            }
            
            let background = this.screenBackgroundDivs[screen.id]
            if (background) {
                this.updateBox(screen, background)
                this.renderFactory.setStyle(background, screen);
            }
        },


        updateWidget (widget) {
            let dnd = this.widgetDivs[widget.id]
            if (dnd) {
                this.updateBox(widget, dnd)
            }

            let background = this.widgetBackgroundDivs[widget.id]
            if (background) {
                this.updateBox(widget, background)
                this.renderFactory.updateWidgetHTML(background, widget);
            }
        },
        
		/**************************************************
		 * CleanUp Code
		 **************************************************/	

		cleanUp (){
			this.logger.log(3,"cleanUp", "enter");
			
			/**
			 * Make sure inline edit is flushed
			 */
			this.inlineEditStop();		
			this.cleanUpComments();
			this.cleanUpScreenButtons();
            
            // this.resetCanvas();

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
        
        resetCanvas () {
            console.warn('RenderFast.resetCanvas()')
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