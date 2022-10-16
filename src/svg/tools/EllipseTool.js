import Tool from './Tool'
import Logger from 'common/Logger'
//import * as Util from '../SVGUtil'
export default class EllipseTool extends Tool{

    constructor (editor) {
        super(editor)
        let path = {
            id: 'p' + new Date().getTime(),
            name: 'Path',
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
        this.logger = new Logger('EllipseTool')
    }

    onMouseDown(pos) {
        this.logger.log(1, 'onMouseDown', 'enter', pos)

        this._startPos = pos

       
    }

    initBox(d) {
       d.push({t: 'M', x: 0, y: 0})
       d.push({t: 'L', x: 0, y: 0})
       d.push({t: 'L', x: 0, y: 0})
       d.push({t: 'L', x: 0, y: 0})
       d.push({t: 'Z', x: 0, y: 0})
    }
    
    onMove (point) {
       if (this._startPos){
            const box = this.getBox(this._startPos, point)
            console.debug(box)
            const d = this.path.d
            if (d.length === 0) {
                this.initBox(d)
            }
            d[0].x = box.x
            d[0].y = box.y
            d[1].x = box.x + box.w
            d[1].y = box.y
            d[2].x = box.x + box.w
            d[2].y = box.y + box.h
            d[3].x = box.x
            d[3].y = box.y + box.h
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

    getLast () {
        return this.path.d[this.path.d.length-1]
    }


}