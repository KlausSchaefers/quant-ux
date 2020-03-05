import Tool from './Tool'
import Logger from 'common/Logger'

export default class SelectTool extends Tool {

    constructor (editor) {
        super(editor)
        this.logger = new Logger('SelectTool')
    }

    onElementClick (path) {
        this.logger.log(5, 'onElementClick', path.id)
        this.select(path.id)
    }

    onClick() {
        this.logger.log(5, 'onClick', this.editor.hover)
        if (this.editor.hover) {
          this.select(this.editor.hover)
        }
    }

    select (id) {
        this.editor.setHover(null)
        this.editor.select(id)
        this.editor.setState('selectEnd')
    }

    onElementHover(path) {
        this.editor.setHover(path.id)
    }

    onElementBlur() {
        this.editor.setHover(null)
    }
}