import Tool from './Tool'
import Logger from 'common/Logger'


export default class SelectTool extends Tool {

    constructor (editor) {
        super(editor)
        this.logger = new Logger('SelectTool')
    }


    onElementClick (path) {
        this.logger.log(-5, 'onElementClick', path.id)
        this.select([path.id])
        this.clearSelect()
    }

    onClick() {
        this.logger.log(-5, 'onClick', this.editor.hover)
        // somehow the mouseip event is not always fired
        if (this.isSelectionStarted()) {
            this.onSelectEnd()
            return
        }
      
        if (this.editor.hover) {
          this.select([this.editor.hover])
        }
        this.clearSelect()
    }

    onElementHover(path) {
        this.editor.setHover(path.id)
    }

    onElementBlur() {
        this.editor.setHover(null)
    }

    onMouseDown (point) {
        this.logger.log(5, 'onMouseDown', 'enter', point)
        this.onSelectStart(point)
    }

    onMove (point) {
       this.onSelectMove(point)
    }


}