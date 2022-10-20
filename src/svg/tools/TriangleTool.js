import Tool from './Tool'
import Logger from 'common/Logger'
//import * as Util from '../SVGUtil'
export default class TriangleTool extends Tool{

    constructor (editor, closePathAtTheEnd = false) {
        super(editor)
        let path = {
            id: 'p' + new Date().getTime(),
            name: 'Triangle',
            hint: 'Triangle',
            type: 'Path',
            stroke: '#333333',
            strokeWidth: 1,
            fill:'',
            closed: true,
            d: []
        }
        this.path = path
        this.editor.value.push(path)
        this.editor.select([path.id])
        this.isMouseDown = false
        this.closePathAtTheEnd = closePathAtTheEnd
        this.logger = new Logger('TriangleTool')
    }

    onMouseDown(pos) {
        this.logger.log(1, 'onMouseDown', 'enter', pos)
        this._startPos = pos
    }

    initBox(d) {
       d.push({t: 'M', x: 0, y: 0})
       d.push({t: 'L', x: 0, y: 0})
       d.push({t: 'L', x: 0, y: 0})
    }
    
    onMove (point) {
       if (this._startPos){
            const box = this.getBox(this._startPos, point, point.shiftKey)
            const d = this.path.d
            if (d.length === 0) {
                this.initBox(d)
            }
            d[0].x = box.x + box.w /2
            d[0].y = box.y

            d[1].x = box.x + box.w
            d[1].y = box.y + box.h

            d[2].x = box.x
            d[2].y = box.y + box.h
       }
    }

    onClick () {
        this.logger.log(1, 'onClick')
        this.path.d = this.path.d.filter(p => !p._temp)
        this.select([this.path.id])
        this.editor.setState('addEnd')
        this.editor.onChange()
        this.editor.onTempChange()
    }
}