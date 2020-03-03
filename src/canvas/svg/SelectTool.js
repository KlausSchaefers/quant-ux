import Tool from './Tool'
import Logger from 'common/Logger'

export default class SelectTool extends Tool {

    constructor (editor) {
        super()
        this.editor = editor
        this.logger = new Logger('SelectTool')
    }

    onClick() {
        this.logger.log(-1, 'onClick', this.editor.hover)
        if (this.editor.hover) {
            this.editor.select(this.editor.hover)
        }
    }

    onHover(path) {
        this.editor.setHover(path.id)
    }

    onBlur() {
        this.editor.setHover(null)
    }
}