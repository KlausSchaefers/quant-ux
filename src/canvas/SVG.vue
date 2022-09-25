<script>

import css from 'dojo/css'
// import * as SVGUtil from '../svg/SVGUtil'

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
		}
	},
    methods: {

		/**********************************************************************
		 * SVG
		 **********************************************************************/

        editSVG (widget) {
		    this.logger.log(-1,"editSVG", "enter > ", widget);

            this.showSVGEditor()
            this._svgCurrentWidget = widget
            //
            const div = this.widgetBackgroundDivs[widget.id]
            if (div) {
                css.add(div, 'MatcHidden')
                this._svgCurrentWidgetDiv = div
            } else {
                this.logger.error("editSVG", "connot find > ", div);
            }

            this.$nextTick(() => {
                this.currentTool = this.$refs.svgEditor
                 if (this.currentTool) {
                    this.currentTool.setValue(widget.props.paths, widget, this.getZoomFactor())
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
            this.setCanvasCancelCallback('cancelSVG')
            this.setCanvasModeListener('cancelSVG')
        },

		addSVG (e) {
			this.logger.log(-1,"addSVG", "enter > ", e);
			if (!this.showSVG ) {
				this.showSVGEditor()
			} 
            this.$nextTick(() => {
                this.currentTool = this.$refs.svgEditor
                if (this.currentTool) {
                    this.currentTool.startBezierTool()
                } else {
                    this.logger.warn("addSVG", "exit > NO SVGEditor ");
                }
            })
        },

		endSVG () {
			this.logger.log(-1,"endSVG", "enter > ", this._selectWidget);

            if (this._svgCurrentWidget) {
                this.closeSVGEditor()
                return
            }

			if (this.currentTool ) {
				const value = this.currentTool.getValue()
                const paths = value.paths
                const bbox = value.bbox
				const pos = value.pos

				var widget = {
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
				this.logger.log(-1,"endSVG", "NO SVGEditor!");
			}
			this.closeSVGEditor()
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
            delete this.currentTool
            this.clearCanvasModeListener()
            if (this.showSVG) {
                this.showSVG = false  
                this.setMode('edit');
            }
		}
    },
    mounted () {
    }
}
</script>