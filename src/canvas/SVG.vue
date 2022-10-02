<script>

import css from 'dojo/css'
import topic from "dojo/topic";
import * as SVGUtil from '../svg/SVGUtil'

export default {
    name: 'SVG',
    mixins:[],
    data: function () {
        return {
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

		/**********************************************************************
		 * SVG
		 **********************************************************************/

        editSVG (widget) {
		    this.logger.log(-1,"editSVG", "enter > ", widget);

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
                    this.currentTool.setValue(widget.props.paths, widget.props.bbox, sourceWidget)
                    this.$nextTick(() => {
                        this.currentTool.startSelectTool(true)
                    })
                } else {
                    this.logger.warn("editSVG", "exit > NO SVGEditor ");
                }
            })
            
        },

        showSVGEditor() {
            this.logger.log(-1,"showSVGEditor", "enter > ");
            this.unSelect();
            this.cleanUpSelectionListener();
            this.showSVG = true
            this.setMode('svg');
            this.setCanvasCancelCallback('endSVG')
            this.setCanvasModeListener('onSVGModeChange')
        },

        onSVGModeChange (mode) {
            this.logger.log(-1,"onSVGModeChange", "enter > ");
            if (mode !== 'svg') {
                this.endSVG()
            }
        },

		addSVG (e) {
			this.logger.log(-1,"addSVG", "enter > ", e);
			if (!this.showSVG ) {
				this.showSVGEditor()
			} 

            // we should create here a temp element?
            this.$nextTick(() => {
                const svgEditor = this.$refs.svgEditor
                this.setCurrentTool(svgEditor)
                
                if (this.currentTool) {
                    this.currentTool.startBezierTool()
                } else {
                    this.logger.warn("addSVG", "exit > NO SVGEditor ");
                }
            })
        },

		endSVG () {
			this.logger.log(-1,"endSVG", "enter > ", this._svgCurrentWidget);
			if (this.currentTool ) {
                if (this._svgCurrentWidget) {
                  this.saveSVG()
                } else {
                    this.createSVG()
                }
			} else {
				this.logger.log(-1,"endSVG", "NO SVGEditor!");
			}
			this.closeSVGEditor()
		},


        saveSVG () {
            const value = this.currentTool.getValue()
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
                const updatedWidget = this.controller.updateCompleteWidget(this._svgCurrentWidget.id, pos, props);
                if(updatedWidget){
                    requestAnimationFrame( () => {
                        this.onWidgetSelected(updatedWidget.id, true);
                    })
                }

            } else {
                this.logger.log(-1,"saveSVG", "NO Paths > Remove");
                this.controller.removeWidget(this._svgCurrentWidget.id);
            }
        },

        createSVG () {
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
                if(newWidget){
                    requestAnimationFrame( () => {
                        this.onWidgetSelected(newWidget.id, true);
                    })
                }
            } else {
                this.logger.log(-1,"createSVG", "NO Paths!");
            }
        },

		cancelSVG () {
			this.logger.log(-1,"cancelSVG", "enter > ");
            this.closeSVGEditor()
		},

		closeSVGEditor () {
			this.logger.log(-1,"closeSVGEditor", "enter > ");
            if ( this._svgCurrentWidgetDiv) {
                css.remove(this._svgCurrentWidgetDiv, 'MatcHidden')
            }
            delete this._svgCurrentWidget
            delete this._svgCurrentWidgetDiv
            delete this._svgIsNewWidget
            this.setCurrentTool()
            this.clearCanvasModeListener()
            if (this.showSVG) {
                this.showSVG = false  
                this.setMode('edit');
            }
		},

        onSVGPathSelected (selectedPaths, bbox) {
            this.logger.log(-1,"onSVGPathSelected", "enter > ", bbox);

            if (this.controller) {
                this.controller.onSVGPathsSelected(selectedPaths, bbox)
            } else {
                this.logger.error("onSVGPathSelected", "No widget selected > ");
            }
        },

        onSVGPathUnSelected () {
            this.logger.log(-1,"onSVGPathUnSelected", "enter");
            if (this.controller) {
                this.controller.onCanvasSelected()
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