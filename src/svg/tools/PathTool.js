import Tool from './Tool'
import Logger from 'common/Logger'
import * as Util from '../SVGUtil'
export default class PathTool extends Tool{

    constructor (editor, closePathAtTheEnd = false) {
        super(editor)
        let path = {
            id: 'p' + new Date().getTime(),
            name: 'Path',
            hint: 'Path',
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
        this.logger = new Logger('PathTool')
    }

    onJointMouseUp (joint, pos) {
        this.onClick(pos)
    }

    onMouseDown(pos) {
        this.logger.log(1, 'onMouseDown', 'enter', pos)
        this.isMouseDown = true
    }

    onClick(pos) {
        this.logger.log(1, 'onClick', pos.x + '/'+ pos.y)
        if (this.path.d.length === 0) {
            this.path.d.push({
                t: 'M',
                x: pos.x,
                y: pos.y
            })
            this.path.d.push(this.createPoint(pos, true))
            this.updateRuler()
        } else {
            const previous = this.path.d[this.path.d.length-2]
            if (previous.x === pos.x && previous.y === pos.y) {
                this.logger.log(1, 'onClick', 'ignore')              
            } else {
                let last = this.getLast()
                delete last._temp
                this.path.d.push(this.createPoint(pos, true))
                this.updateRuler()
            }
        }
        this.isMouseDown = false
        this.logger.log(1, 'onClick', 'exit')
    }

    createPoint (pos, temp) {
        this.logger.log(1, 'createPoint', pos.x + ' ' + pos.y)
        let point = {
            t: 'L',
            x: pos.x,
            y: pos.y
        }
        if (temp) {
            point._temp = true
        }
        return point
    }

    onMove (point) {
       if (this.path.d.length >= 1){
           let last = this.getLast()
           last.x = point.x
           last.y = point.y
       }
       this.logger.log(5, 'onMove', 'exit', this.path.d.map(p => p.x + '.' + p.y).join(' '))
    }

    onDoubleClick () {
        this.logger.log(1, 'onDoubleClick')
        this.path.d = Util.filterTempPoints(this.path.d)
        this.path.d = Util.filterDouble(this.path.d)
        if (this.closePathAtTheEnd) {
            Util.closePath(this.path.d)
        }
        this.editor.setState('addEnd')
        this.editor.onChange()
        this.editor.onTempChange()
        this.editor.endRuler()
    }

    getLast () {
        return this.path.d[this.path.d.length-1]
    }


}