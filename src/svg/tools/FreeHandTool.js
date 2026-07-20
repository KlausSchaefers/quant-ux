import Tool from './Tool'
import Logger from 'common/Logger'
import * as Util from '../SVGUtil'
export default class FreeHandTool extends Tool{

    constructor (editor, closePathAtTheEnd = false) {
        super(editor)
        let path = {
            id: 'p' + new Date().getTime(),
            name: 'Path',
            hint: 'FreeHand',
            type: 'Path',
            stroke: '#333333',
            strokeWidth: 1,
            fill:'',
            d: []
        }
        this.path = path
        this.editor.value.push(path)
        this.editor.select([path.id])
        this.isMouseDown = false
        this.closePathAtTheEnd = closePathAtTheEnd
        this.logger = new Logger('FreeHandTool')
    }

    onMouseDown (pos) {
        this.logger.log(1, 'onMouseDown', 'enter', pos)
        this.isMouseDown = true
        this.path.d = []
        this.path.d.push({
            t: 'M',
            x: pos.x,
            y: pos.y
        })
    }

    onMove (pos) {
        if (this.isMouseDown) {
            this.path.d.push({
                t: 'L',
                x: pos.x,
                y: pos.y
            })
            this.path.d = Util.filterDouble(this.path.d)
            this.path.d = Util.smoothPath(this.path.d)
        }
    }

    onMouseUp (pos) {
        this.logger.log(1, 'onMouseUp', 'enter', pos)
        if (!this.isMouseDown) {
            return
        }
        this.isMouseDown = false
        this.path.d = Util.filterDouble(this.path.d)
        if (this.closePathAtTheEnd) {
            Util.closePath(this.path.d)
        }
        this.path.d = Util.smoothPath(this.path.d)
        this.select([this.path.id])
        this.editor.setState('addEnd')
        this.editor.onChange()
        this.editor.onTempChange()
    }

}
