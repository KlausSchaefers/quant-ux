<script>

import CopyTool from '../tools/CopyTool'
import * as SVGUtil from '../SVGUtil'

export default {
  name: "Actions",
  methods: {
    /******************************************
     * Actions
     *****************************************/

    rotateSelection (angle, isCallChange = false) {
        this.logger.log(1, 'rotateSelection ', 'enter', angle)

        const selection = this.getSelectedElements()
        selection.forEach(path => {
            const oldAngle = path.angle ? path.angle : 0
            const difAngle = oldAngle - angle
            SVGUtil.rotate(path, difAngle)
            path.angle = angle
        }) 

        if (isCallChange) {
            this.onChange()
        }
    },

 


    deleteSelection () {
        this.logger.log(2, 'deleteSelection ', 'enter')
        this.value = this.value.filter(v => !this.isSelected(v))
        this.unSelect()
        this.onChange()
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

    moveSelectedPathToTop(isCallChange = false) {
        this.logger.log(-1, 'moveSelectedPathToTop ', 'enter')

        const selection = this.getSelectedElements()
        this.value = SVGUtil.moveSelectedPathToTop(this.value, selection.map(e => e.id))
        if (isCallChange) {
            this.onChange()
        }
        this.onTempChange()
    },

    moveSelectedPathToBottom (isCallChange = false) {
        this.logger.log(-1, 'moveSelectedPathToTop ', 'enter')

        const selection = this.getSelectedElements()
        this.value = SVGUtil.moveSelectedPathToBottom(this.value, selection.map(e => e.id))
        if (isCallChange) {
            this.onChange()
        }
        this.onTempChange()
    },

    renameSelection (name) {
        this.logger.log(-1, 'renameSelection ', 'enter')

        const selection = this.getSelectedElements()
        selection.forEach(element => {
            element.name = name
        });
        this.onChange()
        this.onTempChange()
    },

    resizeSelection (unZoomedTargetBox, type) {
        this.logger.log(-1, 'resizeSelection ', 'enter: ' + type, unZoomedTargetBox)
  
        const unZoomedBBox = this.getSelectedUnZoomedBoundingBox()
        const selection = this.getSelectedElements()
    
        if (type === 'x' || type === 'y') {
            SVGUtil.translatePathsByBox(selection, unZoomedBBox, unZoomedTargetBox)
        }
        if (type === 'w' || type === 'h') {
            SVGUtil.scalePathsByBox(selection, unZoomedBBox, unZoomedTargetBox)
        }

        //const newBoundingBox = SVGUtil.getZoomedBox(unZoomedTargetBox, this.zoom)
        //this.setBoundingBox(newBoundingBox)
        this.onChange()
    },

    tempStyleSelection (key, value,) {
        this.logger.log(-1, 'tempStyleSelection ', 'enter')
     
        const selection = this.getSelectedElements()
        selection.forEach(element => {
            this.$set(element, key, value)
        })
    },

    styleSelection (key, value,) {
        this.logger.log(-1, 'styleSelection ', 'enter', key)
        const selection = this.getSelectedElements()
        selection.forEach(element => {
           this.$set(element, key, value)
        })
        this.onChange()
    },

    copySelection () {
        this.logger.log(-1, 'copySelection ', 'enter')
        const selection = this.getSelectedElements()
        CopyTool.copy(this.lastCanvasMousePosition, selection)
    },

    pasteSelection () {
        this.logger.log(-1, 'pasteSelection ', 'enter')

        if (!this.lastCanvasMousePosition) {
            this.logger.log(-1, 'pasteSelection ', 'No lastCanvasMousePosition')
        }

        const source = CopyTool.paste()
        if (source) {
            const paths = source.value
            const bbox = SVGUtil.getSVGBoundingBoxByPaths(paths)
            SVGUtil.translatePathsByBox(paths, bbox, this.lastCanvasMousePosition)
            paths.forEach(p => {
                p.copyOf = p.id
                p.id = 'pb' + new Date().getTime()
                p.name = CopyTool.getUniquePathName(this.value, p.name)
                this.value.push(p)
            })

            this.onChange()
            this.onTempChange()

            this.$nextTick(() => {
                this.startSelectTool(paths[0].id)
            })
        }
    }
  }
};
</script>