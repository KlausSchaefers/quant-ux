<script>

import css from 'dojo/css'
import on from "dojo/on";
import win from 'dojo/_base/win'
import lang from 'dojo/_base/lang'
import ResponsiveLayout from 'core/responsive/ResponsiveLayout'
//import * as ResponsiveUtil from 'core/responsive/ResponsiveUtil'
//import topic from "dojo/topic";
// import lang from 'dojo/_base/lang'
// import * as SVGUtil from '../svg/SVGUtil'

export default {
    name: 'SVG',
    mixins:[],
    data: function () {
        return {
            isSVGMultiPath: false
        }
    },
    components: {},
    computed: {
        svgCanvasZoom () {
            return this.zoom
        },
		svgCanvasPos () {
			return {
				x : (this.domPos.x + this.canvasPos.x),
				y : (this.domPos.y + this.canvasPos.y)
			}
		},
        svgGrid () {
            return this.model.grid
        }
	},
    methods: {

        // onSVGClick () {
        //     topic.publish("matc/canvas/click", "", "");
        // },

        onGridResize() {
            this.logger.log(-1,"onGridResize", "enter > ", this._gridResizeEnabled);

            if (this._gridResizeEnabled){
				this.onGridResizeEnd()
			} else {
				this.onGridResizeStart();
			}
        },

        onGridResizeStart () {
			css.add(this.container, "MatcCanvasModeGridResize");

            this._gridResizeEnabled = true
            this._gridResizeModel = this.getGridResizModel()
            this._gridResizeHandlersColumn = []
            this._gridResizeHandlersRow = []
            this._gridResizeHandlerListeners = []

            this._responsiveLayouter = new ResponsiveLayout()
            this._responsiveLayouter.initSelection(this.model, this._gridResizeModel, this._gridResizeModel.children)
            
            const tree = this._responsiveLayouter.treeModel
            const root = tree.screens[0]
            const grid = lang.clone(root.grid)

            this._gridResizeGrid = grid

            const l = (this.resizeButtonSize * 2) +1;

            if (grid.columns.length > 2) {
                grid.columns.forEach((col,i) => {

                    if (i > 0 ) {
                        const handler = document.createElement("div")
                        css.add(handler, "MatcCanvasModeGridResizeHandler MatcCanvasModeGridResizeHandlerColumn")

                        const icon = document.createElement("div")
                        css.add(icon, "MatcCanvasModeGridResizeHandlerIcon")
                        icon.style.width = l + "px";
                        icon.style.height = l + "px";
                        handler.append(icon)

                        const line = document.createElement("div")
                        css.add(line, "MatcCanvasModeGridResizeHandlerLine")

                        line.style.height = this._gridResizeModel.h + "px";
                        handler.append(line)


                        this.dndContainer.appendChild(handler);
                        this._addSizeHandlerTouch(handler);

                        const listener = on(handler, "mousedown", (e) => this.onGridResizeDNDStart(e, col,i, true))
                        this._gridResizeHandlerListeners.push(listener)
                        this._gridResizeHandlersColumn[i] = handler
                    }

                })
            }
  
            this._updateGridResizeHandler(grid)

        },

        _updateGridResizeHandler (grid) {
            // const s = this.resizeButtonSize
            // const l = (this.resizeButtonSize * 2) +1;

            grid.columns.forEach((col,i) => {
                const node = this._gridResizeHandlersColumn[i]
                if (node) {
                    node.style.top = (this._gridResizeModel.y) + "px"
                    node.style.left = (this._gridResizeModel.x + col.v) + "px"
                }
            }) 
            
        },

        onGridResizeDNDStart (e, col, i,isColumn) {
            this.stopEvent(e)
      
            this._resizeGrid = lang.clone(this._gridResizeGrid)
            this._resizeStartPos = this.getCanvasMousePosition(e);
            this._resizeHandleMove = on(win.body(),"mousemove", e => this.onGridResizeDNDMove(e, i, isColumn));
            this._resizeHandleUp = on(win.body(),"mouseup", e => this.onGridResizeDNDEnd(e, i, isColumn));

        },

        onGridResizeDNDMove (e, i, isColumn) {
            this.stopEvent(e)
            this._resizeRenderJobs = {}
            if (!this._resizeStartPos ||  !this._responsiveLayouter || !this._resizeGrid) {

                console.debug('onGridResizeDNDMove() > End illegal state',)
                this.onGridResizeDNDEnd()
                return
            }
            const pos =  this.getCanvasMousePosition(e);
            if (isColumn) {
                const dif = pos.x - this._resizeStartPos.x
          
                const v = this._gridResizeGrid.columns[i].v + dif
                const l = this._gridResizeGrid.columns[i].l - dif
                const leBefore = this._gridResizeGrid.columns[i-1].l + dif
                this._resizeGrid.columns[i].v = v
                this._resizeGrid.columns[i].l = l
                this._resizeGrid.columns[i-1].l = leBefore
            }

            // console.debug(this._gridResizeGrid.columns.map(c => c.v))
            // console.debug(this._resizeGrid.columns.map(c => c.v))

            if (this._responsiveLayouter) {
                const responsivePositions = this._responsiveLayouter.updateScreenGrid(0, this._resizeGrid)
                const positions = {}
                for(let i=0; i< this._gridResizeModel.children.length; i++){
                    const id = this._gridResizeModel.children[i];                   
                    const repositionWidget = responsivePositions.widgets[id]
                    //console.debug(repositionWidget?.w, repositionWidget?.y)
                    positions[id] = {
                        x: repositionWidget.x,
                        y: repositionWidget.y,
                        w: repositionWidget.w,
                        h: repositionWidget.h
                    }         
                }
                this._createMultiPositionRenderJobs(positions)         
            }


            this._updateGridResizeHandler(this._resizeGrid)
            if(!window.requestAnimationFrame){
                console.warn("No requestAnimationFrame()");
                this._resizeDndUpDateUI();
            } else {
                const callback = lang.hitch(this, "_resizeDndUpDateUI");
                requestAnimationFrame(callback);
            }
    
        },

        onGridResizeDNDEnd(e, i, isColumn) {
            this.stopEvent(e)
            this._gridResizeGrid = this._resizeGrid
            console.debug('onGridResizeDNDEnd', isColumn)
            if (this._resizeHandleMove) {
                this._resizeHandleMove.remove()
            }
            if (this._resizeHandleUp) {
                this._resizeHandleUp.remove()
            }
            delete this._resizeGrid
            delete this._resizeHandleMove
            delete this._resizeHandleUp
        },

        getGridResizModel() {
            if (this._selectGroup) {
                const gridResizeModel = this.getBoundingBox(this.getSelectedGroup().children);
                gridResizeModel.children = this.getSelectedGroup().children;
                return gridResizeModel
            }
            if (this._selectMulti) {
                const gridResizeModel = this.getBoundingBox(this.getMultiSelection());
                gridResizeModel.children = this.getMultiSelection();
                return gridResizeModel
            }
        },

        onGridResizeEnd () {
            this.logger.log(-1,"onGridResizeEnd", "enter > ", this._gridResizeEnabled);
            this.cleanUpGridResize()
        },

        cleanUpGridResize () {

            css.remove(this.container, "MatcCanvasModeGridResize");
            this._gridResizeEnabled = false
            if (this._resizeHandleMove) {
                this._resizeHandleMove.remove()
            }
            if (this._resizeHandleUp) {
                this._resizeHandleUp.remove()
            }

            if (this._gridResizeHandlersColumn) {
                this._gridResizeHandlersColumn.forEach(node => {
                    if (node && node.parentNode) {
                        node.parentNode.removeChild(node)
                    }
                })
            }
            if (this._gridResizeHandlersRow) {
                this._gridResizeHandlersRow.forEach(node => {
                    if (node && node.parentNode) {
                        node.parentNode.removeChild(node)
                    }
                })
            }
            if (this._gridResizeHandlerListeners) {
                this._gridResizeHandlerListeners.forEach(l => {
                    l.remove()
                })
            }
            delete this._resizeHandleMove
            delete this._resizeHandleUp
            delete this._gridResizeGrid
            delete this._gridResizeHandlerListeners
            delete this._gridResizeHandlersColumn
            delete this._gridResizeHandlersRow
            delete this._gridResizeModel
            delete this._responsiveLayouter 
        }
 
    },
    mounted () {
    }
}
</script>