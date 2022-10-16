<script>


import PathTool from '../tools/PathTool'
import SelectTool from '../tools/SelectTool'
import MorphTool from '../tools/MorphTool'
import MoveTool from '../tools/MoveTool'
import BezierTool from '../tools/BezierTool'
import SVGRuler from '../tools/SVGRuler'


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
    setState (state) {
        this.logger.log(1, 'setState ', 'enter', state)
  
        delete this.currentTool
        this.isBoundingBoxVisible = true
        this.setCursor('default')
        this.setBoundingBox()
        switch (state) {
            case 'addEnd':
                this.startSelectTool()
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
    },

    startMorphTool () {
        this.logger.log(1, 'startMorphTool ', 'enter')
        this.mode = 'morph'
        this.currentTool = new MorphTool(this, this.config.pointRadius)
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
        } else if (selected){
            this.currentTool.select(selected)
        }
       
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


    initRuler (selection) {
        this.ruler = new SVGRuler(this.value, selection)
    }
  }
};
</script>