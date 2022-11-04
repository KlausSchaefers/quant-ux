import Tool from './Tool'
import Logger from 'common/Logger'
import * as Util from '../SVGUtil'
/**
 * Flow of tool is
 *
 * 1) first click start and a L point
 *
 * 2) mouse move: update the end of the point
 *
 * 2) mouse down: stop updating end of point
 *
 * 3) move move: if we move (drag n drop),  make point a C and update x1 and x2 somehow, or if it is curved update x2 some how
 *
 * 4) mouse click (not up): create now point. If last point was C, makle another C
 * and match slope, otherwise line.
 */
export default class BezierTool extends Tool{

    constructor (editor, closePathAtTheEnd = false) {
        super(editor)
        let path = {
            id: 'pb' + new Date().getTime(),
            name: 'Bezier',
            hint: 'Bezier',
            type: 'Path',
            stroke: '#333333',
            strokeWidth: 1,
            fill:'',
            d: []
        }
        this.editor.value.push(path)
        this.editor.select([path.id])
        this.path = path
        this.isMouseDown = false
        this.closePathAtTheEnd = closePathAtTheEnd
        this.logger = new Logger('BezierTool')
        this.updateRuler()
    }

    onJointMouseDown (pos) {
        this.logger.log(1, 'onJointMouseDown', 'enter', pos)
        this.onMouseDown(pos)
    }

    onMouseDown(pos) {
        this.logger.log(1, 'onMouseDown', 'enter', pos)
        this.isMouseDown = true
        this.endRuler()
    }

    onJointClick (pos) {
        this.logger.log(-1, 'onJointClick', 'enter', pos)
        this.onClick(pos)
    }

    onClick(pos) {
        /**
         * Must be click. MouseUp triggers for some reason very often, which is not nice.
         */

        if (this.path.d.length === 0) {
          this.path.d.push({
            t: 'M',
            x: pos.x,
            y: pos.y
          })
          this.logger.log(-1, 'onClick', 'start')
          this.path.d.push(this.createPoint(pos, true))
          this.updateRuler()
        } else {
            const previous = this.path.d[this.path.d.length-2]
            // avoid two points at the same space
            if (previous.x === pos.x && previous.y === pos.y) {
                this.logger.log(1, 'onClick', 'ignore')              
            } else {
                const last = this.getLast()
                delete last._temp
                const newPoint = this.createPoint(pos, true)
                if (last._moved) {
                    newPoint.x1 = last.x + (last.x - last.x2)
                    newPoint.y1 = last.y + (last.y - last.y2)
                    delete last._moved
                    newPoint.isCurved = true
                }
                this.logger.log(-1, 'onClick', 'add')
                this.path.d.push(newPoint)
                this.updateRuler()
            }
           
        }
        this.isMouseDown = false
        this.editor.setSelectedJoints()
    }

    onMove (pos) {
        if (this.path.d.length >= 1) {
            const current = this.path.d[this.path.d.length-1]
            if (this.isMouseDown) {
                //this.editor.setSelectedJointId(this.path.d.length-1)

                /** update X2 */
                current.t = 'C'
                const difX = current.x - pos.x
                const difY = current.y - pos.y
                current.x2 = current.x + difX
                current.y2 = current.y + difY
                current._moved = true

            } else {
                current.x = pos.x
                current.y = pos.y
                const last = this.path.d[this.path.d.length-2]
                if (last) {
                    this.updateCurvePoint(pos, last, current)
                }
            }
       }
        // this.logger.log(-1, 'onMove', 'exit', this.path.d.map(p => p.t + '' + p.x + '.' + p.y).join(' '))
    }

    createPoint (pos, temp = false) {
        this.logger.log(-1, 'createPoint', pos.x + ' ' + pos.y)
        const last = this.getLast()
        const current = {
            t: 'C',
            x: pos.x,
            y: pos.y
        }
        this.updateCurvePoint(pos, last, current)
        if (temp) {
            current._temp = true
        }
        return current
    }

    updateCurvePoint (pos, last, current) {
        const difX = pos.x - last.x
        const difY = pos.y - last.y
        if (!current.isCurved) {
            current.x1 = Math.round(last.x + difX * 0.33)
            current.y1 =  Math.round(last.y + difY * 0.33)
        }
        current.x2 = Math.round(last.x + difX * 0.66)
        current.y2 = Math.round(last.y + difY * 0.66)
    }

    onEsc () {
        this.onDoubleClick()
    }

    onDoubleClick () {
        this.logger.log(-1, 'onDoubleClick')
        this.path.d = Util.filterTempPoints(this.path.d)
        // make straigt curves into lines
        this.path.d.forEach(p => {
            if (p.t === 'C' && !p.isCurved) {
                //p.t = 'L'
            }
            delete p.isCurved
        })
        this.path.d = Util.filterDouble(this.path.d)

        if (this.closePathAtTheEnd) {
            Util.closePath(this.path.d)
        }
        this.editor.setState('addEnd')
        this.editor.onChange()
        this.editor.onTempChange()
        this.endRuler()
    }

    getLast () {
        return this.path.d[this.path.d.length-1]
    }

}