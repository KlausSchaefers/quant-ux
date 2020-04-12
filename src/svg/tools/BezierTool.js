import Tool from './Tool'
import Logger from 'common/Logger'

/**
 * Flow of tool is
 *
 * 1) first click start and a L point
 *
 * 2) mouse move: update the end of the point
 *
 * 2) mouse down: stop updating end of point
 *
 * 3) move move: if we move (drag n drop),  make point a C and update x1 and x2 somehow
 *
 * 4) mouse up: create now point. If last point was C, makle another C and match slope, otherwise line
 */
export default class BezierTool extends Tool{

    constructor (editor) {
        super(editor)
        let path = {
            id: 'pb' + new Date().getTime(),
            name: 'Path',
            type: 'Path',
            stroke: '#333333',
            strokeWidth: 1,
            fill:'',
            d: []
        }
        this.editor.value.push(path)
        this.path = path
        this.logger = new Logger('BezierTool')
    }

    onClick(pos) {
        /** Should be mouse down */
        this.logger.log(-1, 'onClick', 'start', this.path.d.map(p => p.t + '' + p.x + ', ' + p.y).join('  >>  '))
        if (this.path.d.length === 0) {
          this.path.d.push({
            t: 'M',
            x: pos.x,
            y: pos.y
          })
          this.path.d.push(this.createPoint(pos, true))
        } else {
            let last = this.path.d[this.path.d.length-1]
            delete last._temp
            this.path.d.push(this.createPoint(pos, true))
        }
        this.logger.log(-1, 'onClick', 'exit', this.path.d.map(p => p.t + '' + p.x + ', ' + p.y).join('  >>  '))
    }

    onMove (pos) {
        if (this.path.d.length >= 1){
            let current = this.path.d[this.path.d.length-1]
            current.x = pos.x
            current.y = pos.y

            if (current.t === 'C') {
                let last = this.path.d[this.path.d.length-2]
                if (last) {
                    this.updateCurvePoint(pos, last, current)
                }
           }
       }
       this.logger.log(-1, 'onMove', 'exit', this.path.d.map(p => p.t + '' + p.x + '.' + p.y).join(' '))
    }

    createPoint (pos, temp = false) {
        console.debug('createPoint', this.path.d)
        let last = this.path.d[this.path.d.length-1]

        let difX = pos.x - last.x
        let difY = pos.y - last.y
        console.debug('create', pos.x, last.t, last.x, difX, difY)
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

        current.x1 = Math.round(pos.x + difX * 0.33),
        current.y1 =  Math.round(pos.y + difY * 0.33),
        current.x2 = Math.round(pos.x + difX * 0.66),
        current.y2 = Math.round(pos.y + difY * 0.66)
    }


    onDoubleClick () {
        this.logger.log(5, 'onDoubleClick')
        this.editor.setState('addEnd')
    }

}