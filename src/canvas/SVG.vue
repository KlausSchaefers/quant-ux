<script>


export default {
    name: 'SVG',
    mixins:[],
    data: function () {
        return {
        }
    },
    components: {},
    computed: {
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

        editSVG () {
		    this.logger.log(-1,"editSVG", "enter > ");

          	if(this.toolbar){
			    this.toolbar.setMode('svg');
			}
            this.unSelect();
            this.cleanUpSelectionListener();
            this.setCanvasCancelCallback('cancelSVG')
            this.showSVG = true

            //
			
        },

		addSVG (e) {
			this.logger.log(-1,"addSVG", "enter > ", e);
			if (!this.showSVG ) {
				this.unSelect();
				this.cleanUpSelectionListener();
				this.setCanvasCancelCallback('cancelSVG')
				this.showSVG = true
				
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
			this.logger.log(-1,"endSVG", "enter > ");

			if (this.currentTool ) {
				const value = this.currentTool.getValue()
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
						"paths": value.paths,
						"bbox": {
							w: pos.w,
							h: pos.h
						}
					},
					"has" : {
						"onclick" : true
					},
					"actions":{},
					"style" : {}
				};
				var newWidget = this.controller.addWidget(widget, pos, true);
				if(newWidget){
					requestAnimationFrame( () => {
						this.onWidgetSelected(newWidget.id, true);
					})
				}
			} else {
				this.logger.log(-1,"endSVG", "NO SVGEditor!");
			}

			// get hree the data and store
			this.setMode('edit')
		},

		cancelSVG () {
			this.logger.log(-1,"cancelSVG", "enter > ");
			this.setMode('edit')
		},

		closeSVGEditor () {
			this.logger.log(-1,"closeSVGEditor", "enter > ");
			this.currentTool = null
			this.showSVG = false
			this.cleanUpCancelCallbacks();
		}
    },
    mounted () {
    }
}
</script>