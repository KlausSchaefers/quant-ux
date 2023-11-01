<script>

import css from 'dojo/css'
import topic from "dojo/topic";
import lang from 'dojo/_base/lang'
import * as SVGUtil from '../svg/SVGUtil'

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

        onSVGClick () {
            topic.publish("matc/canvas/click", "", "");
        },

        showSVGEditor() {
            this.logger.log(1,"showSVGEditor", "enter > ");
            this.unSelect();
            this.cleanUpSelectionListener();
            this.showSVG = true
            this.setMode('svg');
            this.setCanvasCancelCallback('endSVG')
            this.setCanvasModeListener('onSVGModeChange')
        },

        onSVGPathsSelected (widgetID, pathIDs) {
            this.logger.log(2,"onSVGPathsSelected", "enter", pathIDs + "@" + widgetID);

            if (this._svgCurrentWidget && this.currentTool) {
                if (this._svgCurrentWidget.id !== widgetID) {
                    this.logger.log(2,"onSVGPathSelected", "enter > change widget> ", pathIDs + "@" + widgetID);
                    this.endSVG(false)
                    const widget = this.model.widgets[widgetID]
                    if (widget) {
                        this.editSVG(widget, pathIDs)
                    }
                } else {
                    this.logger.log(2,"onSVGPathSelected", "enter > change path > ", pathIDs + "@" + widgetID);
                    this.currentTool.startMorphTool(pathIDs)
                }
   
            } else {
                this.logger.log(2,"onSVGPathSelected", "enter > open >",pathIDs + "@" + widgetID);
                const widget = this.model.widgets[widgetID]
                if (widget) {
                    this.editSVG(widget, pathIDs)
                }
            }
        },

        onSVGModeChange (mode) {
            this.logger.log(1,"onSVGModeChange", "enter > ");
            if (mode !== 'svg') {
                this.endSVG()
            }
        },

        openSVGEditor (event) {
            const widget = this.model.widgets[event.id]
            if (widget) {
                this.editSVG(widget)
            }
        },

        editSVG (widget, pathIDs = true) {
		    this.logger.log(1,"editSVG", "enter > ", widget);

            this.showSVGEditor()
            const sourceWidget = this.sourceModel.widgets[widget.id]
            const div = this.widgetBackgroundDivs[widget.id]
            if (!sourceWidget || !div) {
                this.logger.error("editSVG", "Cannot find > ", widget.id);
                return
            }

            this._svgCurrentWidget = widget
            css.add(div, 'MatcHidden')
            this._svgCurrentWidgetDiv = div
            this.$nextTick(() => {
                const svgEditor = this.$refs.svgEditor
                this.setCurrentTool(svgEditor)
                if (this.currentTool) {
                    this.currentTool.setApp(this.sourceModel)
                    this.currentTool.setValue(widget.props.paths, widget.props.bbox, sourceWidget)
                    this.currentTool.setGrid(this.sourceModel.grid)
                    
                    this.$nextTick(() => {
                        this.currentTool.startMorphTool(pathIDs)
                    })
                } else {
                    this.logger.warn("editSVG", "exit > NO SVGEditor ");
                }
            })
        },


		addSVG (e) {
			this.logger.log(-1,"addSVG", "enter > ", e.type);

			if (!this.showSVG ) {
				this.showSVGEditor()
			} 
            if (!this.isSVGMultiPath) {
               this.flushSVGEditor()         
            }

            // we should create here a temp element?
            this.$nextTick(() => {
                const svgEditor = this.$refs.svgEditor
                this.setCurrentTool(svgEditor)
                
                if (this.currentTool) {
                    this.currentTool.setApp(this.sourceModel)
                    this.currentTool.setGrid(this.sourceModel.grid)
                    if (e.type === 'bezier') {
                        this.currentTool.startBezierTool()
                    }

                    if (e.type === 'path') {
                        this.currentTool.startPathTool()
                    }

                    if (e.type === 'rectangle') {
                        this.currentTool.startRectangleTool()
                    }

                    if (e.type === 'triangle') {
                        this.currentTool.startTriangleTool()
                    }
                 
                } else {
                    this.logger.warn("addSVG", "exit > NO SVGEditor ");
                }
            })
        },

		endSVG (selectAfterSave = true) {
			this.logger.log(1,"endSVG", "enter > ", selectAfterSave);
			if (this.currentTool ) {
                if (this._svgCurrentWidget) {
                  this.saveSVG(selectAfterSave)
                } else {
                    this.createSVG(selectAfterSave)
                }
			} else {
				this.logger.log(-1,"endSVG", "NO SVGEditor!");
			}
			this.closeSVGEditor()
		},

        flushSVGEditor () {
            this.logger.log(-1,"flushSVGEditor", "enter > ");
            if (this.currentTool) {
                if (this._svgCurrentWidget) {
                    this.saveSVG(false)
                } else {
                    this.createSVG(false)
                }
                this.currentTool.clear()
                this.cleanUpSVGEditor()
            }
        },


        saveSVG (selectAfterSave) {
            const value = this.currentTool.getValue()
            if (value.dirty === false) {
                this.logger.log(1,"saveSVG", "NO CHANGE", this.svgCurrentWidget);
                if (selectAfterSave) {
                    const widgetID = this._svgCurrentWidget.id
                    requestAnimationFrame(() => {
                        this.onWidgetSelected(widgetID, true);
                    })
                }
               
                return
            }
            const paths = value.paths
            const bbox = value.bbox
            const pos = value.pos
            if (SVGUtil.isValidPaths(paths)) {
                const props = {
                    paths: paths,
                    bbox: {
                        w: bbox.w,
                        h: bbox.h
                    }
                }
                const updatedWidget = this.controller.updateSVGWidget(this._svgCurrentWidget.id, pos, props);
                if(updatedWidget && selectAfterSave){
                    requestAnimationFrame( () => {
                        this.onWidgetSelected(updatedWidget.id, true);
                    })
                }

            } else {
                this.logger.log(-1,"saveSVG", "NO Paths > Remove");
                this.controller.removeWidget(this._svgCurrentWidget.id);
            }
        },

        createSVG (selectAfterSave) {
            const value = this.currentTool.getValue()
            const paths = value.paths
            const bbox = value.bbox
            const pos = value.pos
            if (SVGUtil.isValidPaths(paths)) {
            
                const widget = {
                    "type" : "SVGPaths",
                    "name" : "Path",
                    "x" : pos.x,
                    "y" : pos.y,
                    "w" : pos.w,
                    "h" : pos.h,
                    "z" : 0,
                    "props" : {
                        "paths": paths,
                        "bbox": {
                            w: bbox.w,
                            h: bbox.h
                        }
                    },
                    "has" : {
                        "onclick" : true
                    },
                    "actions":{},
                    "style" : {}
                };
                const newWidget = this.controller.addWidget(widget, pos, true);
                if(newWidget && selectAfterSave){
                    requestAnimationFrame( () => {
                        this.onWidgetSelected(newWidget.id, true);
                    })
                }
            } else {
                this.logger.log(-1,"createSVG", "NO Paths!");
            }
        },

		cancelSVG () {
			this.logger.log(1,"cancelSVG", "enter > ");
            this.closeSVGEditor()
		},

        changeSVGPathOrder(widgetID, fromPathId, toPathId){
            this.logger.log(1,"changeSVGPathOrder", "enter > ", widgetID, fromPathId + ' -> ' + toPathId);
            if (this.currentTool) {
                this.currentTool.changePathOrder(fromPathId, toPathId)
            }
        },

        changeSVGProps(widgetID, pathID, key, value){
	        this.logger.log(1,"changeSVGProps", "enter > ", widgetID, pathID, key, value);
            if (this.currentTool) {
                this.currentTool.changePathProps(pathID, key, value)
            }
        },

		closeSVGEditor () {
            this.logger.log(1,"closeSVGEditor", "enter > ");
			this.cleanUpSVGEditor()
            this.setCurrentTool()
            this.clearCanvasModeListener()
            if (this.showSVG) {
                this.showSVG = false  
                this.setMode('edit');
            }
		},

        cleanUpSVGEditor () {
            this.logger.log(1,"closeSVGEditor", "enter > ");
            if ( this._svgCurrentWidgetDiv) {
                css.remove(this._svgCurrentWidgetDiv, 'MatcHidden')
            }
            delete this._svgCurrentWidget
            delete this._svgCurrentWidgetDiv
            delete this._svgIsNewWidget
        },

        onSVGCommandStackChange (hasUndo, hasRedo) {
            this.logger.log(2,"onSVGCommandStackChange", "enter > ", hasUndo, hasRedo);
            if (this.controller) {
                this.controller.onSVGCommandStackChange(hasUndo, hasRedo)
            } else {
                this.logger.error("onSVGEditorPathSelected", "No widget selected > ");
            }
        },

        onSVGTempChange (paths) {
            this.logger.log(2,"onSVGTempChange", "enter > ", paths);
            if (this.layerList && this._svgCurrentWidget) {
                const update = lang.clone(this._svgCurrentWidget)
                update.props.paths = paths
                this.layerList.renderNodeUpdate(update)
            }
        },

        onSVGEditorPathSelected (selectedPaths, bbox) {
            this.logger.log(-2,"onSVGEditorPathSelected", "enter > ", bbox);
           
            if (this.controller) {
                this.controller.onSVGPathsSelected(selectedPaths, bbox)
            } else {
                this.logger.error("onSVGEditorPathSelected", "No widget selected > ");
            }

            if (this.layerList && this._svgCurrentWidget) {
                selectedPaths.forEach(p => {
                    this.layerList.selectSVGPath(this._svgCurrentWidget.id, p.id)
                })
            }
        },

        onSVGEditorPathUnSelected () {
            this.logger.log(2,"onSVGEditorPathUnSelected", "enter");           
            if (this.controller) {
                this.controller.onCanvasSelected()
            }
        },


        onSVGEditorMove (selectedPaths, bbox) {
            this.logger.log(2,"onSVGEditorMove", "enter", bbox);
            if (this.controller) {
                this.controller.onSVGPathsMoved(selectedPaths, bbox)
            } else {
                this.logger.error("onSVGEditorMove", "No widget selected > ");
            }
        },

        onSVGChange (paths) {
            this.logger.log(2,"onSVGChange", "enter", paths);
        }
    },
    mounted () {
    }
}
</script>