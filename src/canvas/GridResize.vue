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

            // Maybe toggle between group and flat mode?
            if (this._gridResizeEnabled){
				this.onGridResizeEnd()
			} else {
				this.onGridResizeStart();
			}
        },

        updateGridRezise () {
            this.logger.log(-1,"onGridResize", "enter > ", this._gridResizeEnabled);

            if (this._gridResizeEnabled) {
                this.cleanUpGridResize()
                this.onGridResizeStart()
            }
        },

        onGridResizeStart () {
			css.add(this.container, "MatcCanvasModeGridResize");

            this._gridResizeEnabled = true
            this._gridResizeModel = this.getGridResizModel()
            this._gridResizeHandlersDivs= []
            this._gridResizeHandlersColumn = []
            this._gridResizeHandlersColumnDots = []
            this._gridResizeHandlersColumnLabels= []
            this._gridResizeHandlersRow = []
            this._gridResizeHandlersRowDots = []
            this._gridResizeHandlersRowLabels = []
            this._gridResizeHandlerListeners = []

            this._gridResponsiveLayouter = new ResponsiveLayout()
            this._gridResponsiveLayouter.initSelection(this.model, this._gridResizeModel, this._gridResizeModel.children, true)
            
            const tree = this._gridResponsiveLayouter.treeModel
            //console.debug(tree.screens[0].children)
            const root = tree.screens[0]
            const grid = lang.clone(root.grid)

            this._gridResizeGrid = grid
            //console.debug(this._gridResizeGrid.columns.map(c => c.v + ":"+ c.l))

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

                        const listener = on(handler, "mousedown", (e) => this.onGridResizeDNDStart(e, col,i, true, false))
                        this._gridResizeHandlerListeners.push(listener)
                        this._gridResizeHandlersColumn[i] = handler
                        this._gridResizeHandlersDivs.push(handler)
                    }

                    if (i > 0 && i < grid.columns.length -1) {

                        const handler = document.createElement("div")
                        css.add(handler, "MatcCanvasModeGridResizeHandler MatcCanvasModeGridResizeHandlerColumn")

                        const icon = document.createElement("div")
                        css.add(icon, "MatcCanvasModeGridResizeHandlerDot")
                        icon.style.width = l + "px";
                        icon.style.height = l + "px";
                        handler.append(icon)

                        this.dndContainer.appendChild(handler);
                        this._addSizeHandlerTouch(handler);

                        const listener = on(handler, "mousedown", (e) => this.onGridResizeDNDStart(e, col,i, true, true))
                        this._gridResizeHandlerListeners.push(listener)
                        this._gridResizeHandlersColumnDots[i] = handler
                        this._gridResizeHandlersDivs.push(handler)

                    }

                    const label = document.createElement("div")
                    css.add(label, "MatcCanvasModeGridResizeLabel MatcCanvasModeGridResizeLabelColumn")
                    this.dndContainer.appendChild(label);
                    this._gridResizeHandlersColumnLabels[i] = label
                    this._gridResizeHandlersDivs.push(label)
                })
            }
  
            if (grid.rows.length > 2) {
                grid.rows.forEach((row,i) => {

                    if (i > 0 ) {
                        const handler = document.createElement("div")
                        css.add(handler, "MatcCanvasModeGridResizeHandler MatcCanvasModeGridResizeHandlerRow")

                        const icon = document.createElement("div")
                        css.add(icon, "MatcCanvasModeGridResizeHandlerIcon")
                        icon.style.width = l + "px";
                        icon.style.height = l + "px";
                        handler.append(icon)

                        const line = document.createElement("div")
                        css.add(line, "MatcCanvasModeGridResizeHandlerLine")

                        line.style.width = this._gridResizeModel.w + "px";
                        handler.append(line)


                        this.dndContainer.appendChild(handler);
                        this._addSizeHandlerTouch(handler);

                        const listener = on(handler, "mousedown", (e) => this.onGridResizeDNDStart(e, row,i, false, false))
                        this._gridResizeHandlerListeners.push(listener)
                        this._gridResizeHandlersRow[i] = handler
                        this._gridResizeHandlersDivs.push(handler)
                    }

                    if (i > 0 && i < grid.rows.length -1) {

                        const handler = document.createElement("div")
                        css.add(handler, "MatcCanvasModeGridResizeHandler MatcCanvasModeGridResizeHandlerRow")

                        const icon = document.createElement("div")
                        css.add(icon, "MatcCanvasModeGridResizeHandlerDot")
                        icon.style.width = l + "px";
                        icon.style.height = l + "px";
                        handler.append(icon)

                        this.dndContainer.appendChild(handler);
                        this._addSizeHandlerTouch(handler);

                        const listener = on(handler, "mousedown", (e) => this.onGridResizeDNDStart(e, row,i, false, true))
                        this._gridResizeHandlerListeners.push(listener)
                        this._gridResizeHandlersRowDots[i] = handler
                        this._gridResizeHandlersDivs.push(handler)

                    }

                    const label = document.createElement("div")
                    css.add(label, "MatcCanvasModeGridResizeLabel MatcCanvasModeGridResizeLabelRow")
                    this.dndContainer.appendChild(label);
                    this._gridResizeHandlersRowLabels[i] = label
                    this._gridResizeHandlersDivs.push(label)
                })
            }
  

            this._updateGridResizeHandler(grid)

        },

        _updateGridResizeHandler (grid, showColLabels = false, showRowLabels = false) {
            // const s = this.resizeButtonSize
            // const l = (this.resizeButtonSize * 2) +1;

            grid.columns.forEach((col,i) => {
                const node = this._gridResizeHandlersColumn[i]
                if (node) {
                    node.style.top = (this._gridResizeModel.y) + "px"
                    node.style.left = (this._gridResizeModel.x + col.v) + "px"
                }

                const dot = this._gridResizeHandlersColumnDots[i]
                if (dot) {
                    if (col.l > 16) {
                        dot.style.opacity=1
                    } else {
                        dot.style.opacity=0
                    }
                    dot.style.top = (this._gridResizeModel.y) + "px"
                    dot.style.left = (this._gridResizeModel.x + col.v + (col.l / 2)) + "px"
                }

                const label = this._gridResizeHandlersColumnLabels[i]
                if (label) {
                    if (!showColLabels) {
                        label.style.opacity=0
                    } else {
                        label.style.opacity=1
                    }
                    label.style.top = (this._gridResizeModel.y) + "px"
                    label.style.left = (this._gridResizeModel.x + col.v) + "px"
                    label.style.width = (col.l) + "px"
                    console.debug(this.zoom)
                    label.innerText = Math.round(col.l / this.zoom)
                }
            }) 


            grid.rows.forEach((row,i) => {
                const node = this._gridResizeHandlersRow[i]
                if (node) {
                    node.style.top = (this._gridResizeModel.y + row.v) + "px"
                    node.style.left = (this._gridResizeModel.x) + "px"
                }

                const dot = this._gridResizeHandlersRowDots[i]
                if (dot) {
                    if (row.l > 16) {
                        dot.style.opacity=1
                    } else {
                        dot.style.opacity=0
                    }
                    dot.style.top = (this._gridResizeModel.y + row.v + (row.l / 2)) + "px"
                    dot.style.left = (this._gridResizeModel.x) + "px"
                }


                const label = this._gridResizeHandlersRowLabels[i]
                if (label) {
                    if (!showRowLabels) {
                        label.style.opacity=0
                    } else {
                        label.style.opacity=1
                    }
                    label.style.top = (this._gridResizeModel.y + row.v) + "px"
                    label.style.left = (this._gridResizeModel.x) + "px"
                    label.style.height = (row.l) + "px"
                    label.innerText = Math.round(row.l / this.zoom)
                }
            }) 
            
        },

        onGridResizeDNDStart (e, col, i,isColumn, isDot) {
            this.stopEvent(e)      
            this._resizeGrid = lang.clone(this._gridResizeGrid)
            this._resizeStartPos = this.getCanvasMousePosition(e);
            this._resizeHandleMove = on(win.body(),"mousemove", e => this.onGridResizeDNDMove(e, i, isColumn, isDot));
            this._resizeHandleUp = on(win.body(),"mouseup", e => this.onGridResizeDNDEnd(e, i, isColumn, isDot));
        },

        onGridResizeDNDMove (e, i, isColumn, isDot) {
            this.stopEvent(e)
    
            if (!this._resizeStartPos ||  !this._gridResponsiveLayouter || !this._resizeGrid) {
                console.debug('onGridResizeDNDMove() > End illegal state',)
                this.onGridResizeDNDEnd()
                return
            }

            this._gridResizeDirty = true
            this._resizeRenderJobs = {}
            const pos =  this.getCanvasMousePosition(e);
            if (isColumn) {
                // we have to update the length (l) of the col before,
                // thew value and the length of the current one
                // TODOD: DO SOME GRID STUFF
                const dif = pos.x - this._resizeStartPos.x 

                const currentValue = this._gridResizeGrid.columns[i].v + dif      
                this._resizeGrid.columns[i].v = currentValue   
                const lengthBefore = this._gridResizeGrid.columns[i-1].l + dif
                this._resizeGrid.columns[i-1].l = lengthBefore    
       
                if (isDot && this._resizeGrid.columns[i+1]) {
                    const valueAfter = this._gridResizeGrid.columns[i+1].v + dif
                    const lengthAfter = this._gridResizeGrid.columns[i+1].l - dif
                    this._resizeGrid.columns[i+1].l = lengthAfter
                    this._resizeGrid.columns[i+1].v = valueAfter
                } else {
                    const currentLength = this._gridResizeGrid.columns[i].l - dif
                    this._resizeGrid.columns[i].l = currentLength         
                }        
            }

            if (!isColumn) {
                const dif = pos.y - this._resizeStartPos.y 

                const currentValue = this._gridResizeGrid.rows[i].v + dif      
                this._resizeGrid.rows[i].v = currentValue   
                const lengthBefore = this._gridResizeGrid.rows[i-1].l + dif
                this._resizeGrid.rows[i-1].l = lengthBefore    

                if (isDot && this._resizeGrid.rows[i+1]) {
                    const valueAfter = this._gridResizeGrid.rows[i+1].v + dif
                    const lengthAfter = this._gridResizeGrid.rows[i+1].l - dif
                    this._resizeGrid.rows[i+1].l = lengthAfter
                    this._resizeGrid.rows[i+1].v = valueAfter
                } else {
                    const currentLength = this._gridResizeGrid.rows[i].l - dif
                    this._resizeGrid.rows[i].l = currentLength         
                }        
            }
            this._updateGridResizeHandler(this._resizeGrid, isColumn, !isColumn)

            //console.debug(this._resizeGrid.columns.map(c => c.v + ":"+ c.l))
      
            const [positions] = this._getGridResizePositions(this._resizeGrid)
            this._createMultiPositionRenderJobs(positions)    
    
            if(!window.requestAnimationFrame){
                console.warn("No requestAnimationFrame()");
                this._resizeDndUpDateUI();
            } else {
                const callback = lang.hitch(this, "_resizeDndUpDateUI");
                requestAnimationFrame(callback);
            }
    
        },

        _getGridResizePositions (grid) {
            let hasCopies = false;
            const responsivePositions = this._gridResponsiveLayouter.updateScreenGrid(0, grid)
            const positions = {}
            for(let i=0; i< this._gridResizeModel.children.length; i++){
                const id = this._gridResizeModel.children[i];
                const widget = this.model.widgets[id];        
                hasCopies = hasCopies || this.isMasterWidget(widget);            
                const repositionWidget = responsivePositions.widgets[id]
                positions[id] = {
                    x: repositionWidget.x,
                    y: repositionWidget.y,
                    w: repositionWidget.w,
                    h: repositionWidget.h
                }         
            }
            return [positions, hasCopies]
        },

        onGridResizeDNDEnd(e) {
            this.stopEvent(e)
            this._updateGridResizeHandler(this._resizeGrid, false, false)
            this._gridResizeGrid = this._resizeGrid
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

            if (this.getSelectedScreen()) {
                const scrn = this.getSelectedScreen()
                const gridResizeModel = scrn
                console.debug(gridResizeModel)
                gridResizeModel.children = scrn.children
                return gridResizeModel
            }

        },

        onGridResizeEnd () {
            this.logger.log(-1,"onGridResizeEnd", "enter > dirty: ", this._gridResizeDirty);

            if (this._gridResizeDirty && this._gridResizeGrid) {
                const [positions, hasCopies] = this._getGridResizePositions(this._gridResizeGrid);           
                this.getController().updateMultiWidgetPosition(positions, false, null, hasCopies);
            }


            this.cleanUpGridResize()
        },

        cleanUpGridResize () {
            this.logger.log(-1,"cleanUpGridResize", "enter > ");

            css.remove(this.container, "MatcCanvasModeGridResize");
            this._gridResizeEnabled = false
            if (this._resizeHandleMove) {
                this._resizeHandleMove.remove()
            }
            if (this._resizeHandleUp) {
                this._resizeHandleUp.remove()
            }

            if (this._gridResizeHandlersDivs) {
                this._gridResizeHandlersDivs.forEach(node => {
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
            delete this._gridResizeDirty
            delete this._resizeHandleMove
            delete this._resizeHandleUp
            delete this._gridResizeGrid
            delete this._gridResizeHandlersDivs
            delete this._gridResizeHandlerListeners
            delete this._gridResizeHandlersColumn
            delete this._gridResizeHandlersRow
            delete this._gridResizeModel
            delete this._gridResizeHandlersColumnDots
            delete this._gridResizeHandlersRowDots
            delete this._gridResponsiveLayouter 
            delete this._gridResizeHandlersColumnLabels
            delete this._gridResizeHandlersRowLabels
        }
 
    },
    mounted () {
    }
}
</script>