<script>


import PathTool from '../tools/PathTool'
import SelectTool from '../tools/SelectTool'
import MorphTool from '../tools/MorphTool'
import MoveTool from '../tools/MoveTool'
import BezierTool from '../tools/BezierTool'
import SVGRuler from '../tools/SVGRuler'
import * as SVGUtil from '../SVGUtil'

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
            const selectedPath = this.value.find(p => p.id === selected)
            if (selectedPath) {
                this.currentTool.select(selectedPath.id)
            }
        }
       
    },

    startPathTool (pos) {
        this.logger.log(1, 'startPathTool ', 'enter', pos)
        this.mode = 'add'
        this.reset()
        this.setCursor('crosshair')
        this.currentTool = new PathTool(this)
        if (pos) {
            this.currentTool.onClick(pos)
        }
        this.initRuler(this.selection)
    },

    startBezierTool (pos) {
        this.logger.log(1, 'startBezierTool ', 'enter', pos)
        this.mode = 'add'
        this.reset()
        this.setCursor('crosshair')
        this.currentTool = new BezierTool(this)
        if (pos) {
            this.currentTool.onClick(pos)
        }
        this.initRuler(this.selection)
    },


    initRuler (selection) {
        this.ruler = new SVGRuler(this.value, selection)
    },

    deleteSelection () {
        this.logger.log(2, 'deleteSelection ', 'enter')
        this.beforeValueChange()
        this.value = this.value.filter(v => !this.isSelected(v))
        this.unSelect()
        this.startSelectTool()
    },


    changePathProps(pathID, key, value, isCallChange = false) {
        this.logger.log(1, 'changePathProps ', 'enter')
        const path = this.value.find(p => p.id === pathID)
        if (path) {
            path[key] = value
        } else {
            this.logger.warn('changePathProps ', 'No path with id', pathID)
        }
        if (isCallChange) {
            this.onChange()
        }
    },

    changePathOrder (fromPathId, toPathId, isCallChange = false) {
        this.logger.log(-1, 'changePathOrder ', 'enter')
        SVGUtil.changePathOrder(this.value, fromPathId, toPathId)
        if (isCallChange) {
            this.onChange()
        }
    },

    renameSelection (name) {
        this.logger.log(-1, 'renameSelection ', 'enter')
        this.beforeValueChange()
        const selection = this.getSelectedElements()
        selection.forEach(element => {
            element.name = name
        });
        this.onValueChanged('name', selection.map(e => e.id))
    },

    resizeSelection (unZoomedTargetBox, type) {
        this.logger.log(-1, 'resizeSelection ', 'enter: ' + type, unZoomedTargetBox)
        this.beforeValueChange()
     
        const unZoomedBBox = this.getSelectedUnZoomedBoundingBox()
        const selection = this.getSelectedElements()
    
        if (type === 'x' || type === 'y') {
            SVGUtil.translatePathsByBox(selection, unZoomedBBox, unZoomedTargetBox)
        }
        if (type === 'w' || type === 'h') {
            SVGUtil.scalePathsByBox(selection, unZoomedBBox, unZoomedTargetBox)
        }

        
        const newBoundingBox = SVGUtil.getZoomedBox(unZoomedTargetBox, this.zoom)
        this.setBoundingBox(newBoundingBox)
       
        this.onValueChanged('position', selection.map(e => e.id))
    },

    tempStyleSelection (key, value,) {
        this.logger.log(-1, 'tempStyleSelection ', 'enter')
     
        const selection = this.getSelectedElements()
        selection.forEach(element => {
            element[key] = value
        })
    },

    styleSelection (key, value,) {
        this.logger.log(-1, 'styleSelection ', 'enter', key)
        this.beforeValueChange()
        const selection = this.getSelectedElements()
        selection.forEach(element => {
            element[key] = value
        })

        this.onValueChanged('style', selection.map(e => e.id))
    }
  }
};
</script>