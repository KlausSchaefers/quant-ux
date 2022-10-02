<script>

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

    // bezier
    onBezierMouseDown (joint, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBezierMouseDown(joint, pos)
        }
    },
    onBezierMouseUp (joint, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBezierMouseUp(joint, pos)
        }
    },
    onBezierClick (joint, e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBezierClick(joint, pos)
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
        this.logger.log(5, 'onMouseClick ', 'enter')
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onClick(pos)
        }
    },
    onMouseMove (e) {
        const pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onMove(pos)
        }
        this.$emit('qmouse', pos)
    },
    onMouseDown (e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onMouseDown(pos)
        }
        this.logger.log(5, 'onMouseUp ', 'exit', pos)
    },
    onMouseUp (e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onMouseUp(pos)
        }
        this.logger.log(5, 'onMouseUp ', 'exit', pos)
    },
    onMouseDoubleClick (e) {
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
    // keyboard
    onKeyUp (e) {

        if (e.key === 'Escape') {
            this.onEsc()
        }
        if (e.key === 'Enter') {
            this.onEnter()
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
            this.onDelete()
        }
        if (e.key === 'v') {
            this.startBezierTool()
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