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

    constructor (editor) {
        super(editor)
        let path = {
            id: 'pb' + new Date().getTime(),
            name: 'Bezier',
            type: 'Path',
            stroke: '#333333',
            strokeWidth: 1,
            fill:'',
            d: []
        }
        this.editor.value.push(path)
        this.editor.select(path.id)
        this.path = path
        this.isMouseDown = false
        this.logger = new Logger('BezierTool')
    }

    onJointMouseDown (pos) {
        this.logger.log(-1, 'onJointMouseDown', 'enter', pos)
        this.onMouseDown(pos)
    }

    onMouseDown(pos) {
        this.logger.log(-1, 'onMouseDown', 'enter', pos)
        this.isMouseDown = true
    }

    onJointClick (pos) {
        this.logger.log(-1, 'onJointClick', 'enter', pos)
        this.onClick(pos)
    }

    onClick(pos) {
        /**
         * Must be click. MouseUp triggers for some reason very often, which is not nice.
         */
        this.logger.log(-1, 'onClick', 'enter')
        if (this.path.d.length === 0) {
          this.path.d.push({
            t: 'M',
            x: pos.x,
            y: pos.y
          })
          this.path.d.push(this.createPoint(pos, true))
        } else {
            let last = this.getLast()
            delete last._temp
            let newPoint = this.createPoint(pos, true)
            if (last._moved) {
                newPoint.x1 = last.x + (last.x - last.x2)
                newPoint.y1 = last.y + (last.y - last.y2)
                delete last._moved
                newPoint._isCurved = true
            }
            this.path.d.push(newPoint)
        }
        this.isMouseDown = false
        this.editor.setSelectedJoint()
    }

    onMove (pos) {
        if (this.path.d.length >= 1) {
            let current = this.path.d[this.path.d.length-1]
            if (this.isMouseDown) {
                this.editor.setSelectedJointId(this.path.d.length-1)

                /** update X2 */
                let difX = current.x - pos.x
                let difY = current.y - pos.y
                current.x2 = current.x + difX
                current.y2 = current.y + difY
                current._moved = true

            } else {
                current.x = pos.x
                current.y = pos.y
                let last = this.path.d[this.path.d.length-2]
                if (last) {
                    this.updateCurvePoint(pos, last, current)
                }
            }
       }
        // this.logger.log(-1, 'onMove', 'exit', this.path.d.map(p => p.t + '' + p.x + '.' + p.y).join(' '))
    }

    createPoint (pos, temp = false) {
        this.logger.log(-1, 'createPoint', pos.x + ' ' + pos.y)
        let last = this.getLast()
        let current = {
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
        let difX = pos.x - last.x
        let difY = pos.y - last.y

        if (!current._isCurved) {
            current.x1 = Math.round(last.x + difX * 0.33)
            current.y1 =  Math.round(last.y + difY * 0.33)
        }

        /** FIXME: What do we do here  is _isCurved*/
        current.x2 = Math.round(last.x + difX * 0.66)
        current.y2 = Math.round(last.y + difY * 0.66)
    }

    onEsc () {
        this.onDoubleClick()
    }

    onDoubleClick () {
        this.logger.log(-1, 'onDoubleClick')
        this.path.d = this.path.d.filter(p => !p._temp)
        /** The double click might create double entries */
        this.path.d = Util.filterDouble(this.path.d)
        /**
         * FIXME: remove all _ props
         */
        this.editor.setState('addEnd')
        this.editor.onChange()
        this.editor.onTempChange()
    }

    getLast () {
        return this.path.d[this.path.d.length-1]
    }

}