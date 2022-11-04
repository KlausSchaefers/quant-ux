<script>


import PathTool from '../tools/PathTool'
import SelectTool from '../tools/SelectTool'
import MorphTool from '../tools/MorphTool'
import MoveTool from '../tools/MoveTool'
import BezierTool from '../tools/BezierTool'
import SVGRuler from '../tools/SVGRuler'
import SVGGridRuler from '../tools/SVGGridRuler'
import RectangleTool from '../tools/RectangleTool'
import TriangleTool from '../tools/TriangleTool'
import EllipseTool from '../tools/EllipseTool'
import DiamondTool from '../tools/DiamondTool'
import ArcTool from '../tools/ArcTool'

export default {
  name: "Tools",
  methods: {

    /******************************************
     * State maschine
     *   Implement here a simple state machine
     *   to transition from tool to tool. This
     *   method is usualy called from the tools
     *   after they finished
     *****************************************/
    setState (state, point) {
        this.logger.log(1, 'setState ', 'enter', state)

        if (this.isMultiPath) {
            this.setMultiPathState(state, point)
        } else {
            this.setSinglePathState(state, point)
        }

    },

    setSinglePathState(state, point) {
        this.logger.log(1, 'setSinglePathState ', 'enter', state)
        delete this.currentTool
        this.isBoundingBoxVisible = true
        this.setCursor('default')
        this.setBoundingBox()
        switch (state) {
            case 'addEnd':
                // select, but we need to make sure the SVG elements are drawn
                this.$nextTick(() => {
                    this.startMorphTool()
                })             
                break
            case 'selectEnd':
                this.startMoveTool()
                break
            case 'moveDoubleClick':
                this.startMorphTool()
                break
            case 'morphEnd':
                this.logger.log(-1, 'setState ', 'END', state)
                this.$emit('stop')              
                break
            case 'moveCanvasMouseDown':
                this.startSelectTool()
                this.currentTool.onMouseDown(point)
                break
            default:
                this.startSelectTool()
        }
    },

    setMultiPathState (state, point) {
        this.logger.log(1, 'setMultiPathState ', 'enter', state)
        delete this.currentTool
        this.isBoundingBoxVisible = true
        this.setCursor('default')
        this.setBoundingBox()
        switch (state) {
            case 'addEnd':
                // select, but we need to make sure the SVG elements are drawn
                this.$nextTick(() => {
                    this.startMorphTool()
                })             
                break
            case 'selectEnd':
                this.startMoveTool()
                break
            case 'moveDoubleClick':
                this.startMorphTool()
                break
            case 'morphEnd':             
                this.startSelectTool()
                break
            case 'moveCanvasMouseDown':
                this.startSelectTool()
                this.currentTool.onMouseDown(point)
                break
            default:
                this.startSelectTool()
        }
    },



    /******************************************
     * Tools
     *****************************************/

  

    startMoveTool () {
        this.logger.log(1, 'startMoveTool ', 'enter')
        this.mode = 'move'
        this.currentTool = new MoveTool(this, this.selection)
        this.initRuler(this.selection)
    },

    startMorphTool (selected) {
        this.logger.log(1, 'startMorphTool ', 'enter', selected)
        this.mode = 'morph'
        if (selected === true) {
            const firstPath = this.value[0]
            this.select([firstPath.id])
        }
        if (Array.isArray(selected)) {
            this.select(selected)
        }
        this.currentTool = new MorphTool(this)
        this.initRuler(this.selection)
    },

    startSelectTool (selected) {
        this.logger.log(1, 'startSelectTool ', 'enter', selected)
        this.mode = 'select'
        this.reset()
        this.currentTool = new SelectTool(this)
        if (selected === true) {
            const firstPath = this.value[0]
            if (firstPath) {
                this.currentTool.select(firstPath.id)
            }
        } 
        if (Array.isArray(selected)) {
            this.currentTool.select(selected)
        }
        this.initRuler(this.selection)
    },

    startArcTool () {
        this.logger.log(1, 'startRectangleTool ', 'enter')
        this.mode = 'add'
        this.reset()
        this.setCursor('crosshair')
        this.currentTool = new ArcTool(this, this.selection)
        this.initRuler(this.selection)
    },

    startRectangleTool () {
        this.logger.log(1, 'startRectangleTool ', 'enter')
        this.mode = 'add'
        this.reset()
        this.setCursor('crosshair')
        this.currentTool = new RectangleTool(this, this.selection)
        this.initRuler(this.selection)
    },

    startPathTool (closePathAtTheEnd) {
        this.logger.log(1, 'startPathTool ', 'enter')
        this.mode = 'add'
        this.reset()
        this.setCursor('crosshair')
        this.currentTool = new PathTool(this, closePathAtTheEnd)
        this.initRuler(this.selection)
    },

    startBezierTool (closePathAtTheEnd = false) {
        this.logger.log(1, 'startBezierTool ', 'enter')
        this.mode = 'add'
        this.reset()
        this.setCursor('crosshair')
        this.currentTool = new BezierTool(this, closePathAtTheEnd)
        this.initRuler(this.selection)
    },

    startTriangleTool (closePathAtTheEnd = false) {
        this.logger.log(1, 'startTriangleTool ', 'enter')
        this.mode = 'add'
        this.reset()
        this.setCursor('crosshair')
        this.currentTool = new TriangleTool(this, closePathAtTheEnd)
        this.initRuler(this.selection)
    },

    startEllipseTool (closePathAtTheEnd = false) {
        this.logger.log(1, 'startEllipseTool ', 'enter')
        this.mode = 'add'
        this.reset()
        this.setCursor('crosshair')
        this.currentTool = new EllipseTool(this, closePathAtTheEnd)
        this.initRuler(this.selection)
    },

    startDiamondTool (closePathAtTheEnd = false) {
        this.logger.log(1, 'startDiamondTool ', 'enter')
        this.mode = 'add'
        this.reset()
        this.setCursor('crosshair')
        this.currentTool = new DiamondTool(this, closePathAtTheEnd)
        this.initRuler(this.selection)
    },

    startRuler (path, points) {
        if (this.ruler) {
            this.ruler.start(path, points)
        } else {
            this.logger.warn('startRuler ', 'No ruler')
        }
    },

    endRuler () {
        if (this.ruler) {
            this.ruler.end()
        } else {
            this.logger.warn('endRuler ', 'No ruler')
        }
    },

    initRuler (selection) {
        this.logger.log(-1, 'initRuler ', 'enter', this.grid?.enabled)
        if (this.grid && this.grid.enabled) {
            this.ruler = new SVGGridRuler(
                this,
                this.value, 
                selection, 
                this.zoom, 
                this.grid, 
                this.app
            )
        } else {
            this.ruler = new SVGRuler(
                this,
                this.value, 
                selection, 
                this.zoom, 
                this.grid, 
                this.app
            )
        }
    }
  }
};
</script>