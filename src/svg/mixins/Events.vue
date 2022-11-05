<script>
import * as SVGUtil from '../SVGUtil'

export default {
  name: "Events",
  data: function() {
    return {
    };
  },
  computed: {
  },
  components: {
  },
  methods: {

    onBoundBoxChange () {
        if (this.boundingBox) {
            const unZoomedBounding = SVGUtil.getUnZoomedBox(this.boundingBox, this.zoom)
            this.$emit('move', this.getSelectedElements(), unZoomedBounding)
        }
    },

    /******************************************
     * Event handler
     *****************************************/

    onResizeMouseDown (handler, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onResizeMouseDown(handler, this.boundingBox, pos)
        }
    },
    onResizeMouseUp (handler, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onResizeMouseUp(handler,this.boundingBox, pos)
        }
        this.onBoundBoxChange()
    },
    onResizeMouseClick (handler, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onResizeMouseClick(handler, this.boundingBox, pos)
        }
    },

    // bounding box
    onBBoxMouseDown (e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBBoxMouseDown(this.boundingBox, pos)
        }
    },
    onBBoxMouseUp (e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBBoxMouseUp(this.boundingBox, pos)
        }
        this.onBoundBoxChange()
    },
    onBBoxMouseClick (e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBBoxMouseClick(this.boundingBox, pos)
        }
    },

    // joints
    onJointMouseDown (joint, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onJointMouseDown(joint, pos)
        }
    },
    onJointMouseUp (joint, e) {
        this.logger.log(6, 'onJointMouseUp ', 'enter')
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onJointMouseUp(joint, pos)
        }
    },
    onJointClick (joint, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onJointClick(joint, pos)
        }
    },

    // split points
    onSplitPointMouseDown (splitPoint, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onSplitPointMouseDown(splitPoint, pos)
        }
    },
    onSplitPointMouseUp (splitPoint, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onSplitPointMouseUp(splitPoint, pos)
        }
    },
    onSplitPointClick (splitPoint, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onSplitPointClick(splitPoint, pos)
        }
    },


    // bezier
    onBezierMouseDown (bezierpoint, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBezierMouseDown(bezierpoint, pos)
        }
    },
    onBezierMouseUp (bezierpoint, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBezierMouseUp(bezierpoint, pos)
        }
    },
    onBezierClick (bezierpoint, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBezierClick(bezierpoint, pos)
        }
    },

    onBezierMouseOver (bezierpoint, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBezierMouseOver(bezierpoint, pos)
        }
    },

    // element
    onElementBlur () {
        if (this.currentTool) {
            this.currentTool.onElementBlur()
        }
    },

    onElementHover (path) {
        if (this.currentTool) {
            this.currentTool.onElementHover(path)
        }
    },

    onElementClick (path, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onElementClick(path, pos)
        }
    },

    // canvas mouse
    onMouseClick (e) {
        this.$emit('mouseclick')
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onClick(pos)
        }
        this.logger.log(5, 'onMouseClick ', 'enter', pos)
    },
    onMouseMove (e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onMove(pos)
        }
        this.lastCanvasMousePosition = pos
        this.$emit('qmouse', pos)
    },
    onMouseDown (e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            const stop = this.currentTool.onMouseDown(pos, e)
            if (stop === true) {
                this.stopEvent(e)
            }
        }
        this.logger.log(5, 'onMouseDown ', 'exit', pos)
    },
    onMouseUp (e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            const stop = this.currentTool.onMouseUp(pos, e)
            if (stop === true) {
                this.stopEvent(e)
            }
        }
        this.logger.log(5, 'onMouseUp ', 'exit', pos)
    },
    onMouseDoubleClick (e) {
        this.stopEvent(e)
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onDoubleClick(pos)
        }
    },
    onZoom (z) {
        this.logger.log(1, 'onZoom', 'enter', z)
        if (this.currentTool) {
            // some tools might use the svg.getBOX() method, e.g.
            // to calculate that boundign box. These values
            // might not be updated yet, therefore we wait one
            // tick.
            this.$nextTick(() => {
                this.currentTool.onZoom(z)
            })
        }
        if (this.ruler) {
            this.ruler.setZoom(z)
        }
    },
    onEsc () {
        this.logger.log(-1, 'onEsc ', 'enter')
        if (this.currentTool) {
            this.currentTool.onEsc()
        }
    },
    onEnter () {
        this.logger.log(-1, 'onEnter ', 'enter')
        if (this.currentTool) {
            this.currentTool.onEnter()
        }
    },
    onDelete () {
        this.logger.log(-1, 'onDelete ', 'enter')
        if (this.currentTool) {
            this.currentTool.onDelete()
        }
    }
  },
  mounted() {
  }
};
</script>