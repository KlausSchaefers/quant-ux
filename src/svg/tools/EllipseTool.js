import Tool from './Tool'
import Logger from 'common/Logger'

//https://www.smashingmagazine.com/2019/03/svg-circle-decomposition-paths/
export default class EllipseTool extends Tool{

    constructor (editor) {
        super(editor)
        let path = {
            id: 'p' + new Date().getTime(),
            name: 'Ellipse',
            hint: 'Ellipse',
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
       d.push({t: 'C', x: 0, y: 0, x1:0, y1: 0, x2:0, y2:0})
       d.push({t: 'C', x: 0, y: 0, x1:0, y1: 0, x2:0, y2:0})
       d.push({t: 'C', x: 0, y: 0, x1:0, y1: 0, x2:0, y2:0})
       d.push({t: 'CZ', x: 0, y: 0, x1:0, y1: 0, x2:0, y2:0})
       //d.push({t: 'C', x: 0, y: 0, x1:0, y1: 0, x2:0, y2:0})
       //d.push({t: 'Z', x: 0, y: 0, x1:0, y1: 0, x2:0, y2:0})
    }
    
    onMove (point) {
       if (this._startPos){
            const box = this.getBox(this._startPos, point, point.shiftKey)
            const d = this.path.d
            if (d.length === 0) {
                this.initBox(d)
            }
            const f = 0.27
            const offset = Math.min(box.w, box.h) * f

            d[0].x = box.x + box.w / 2
            d[0].y = box.y

            d[1].x = box.x + box.w
            d[1].y = box.y + box.h / 2
      
            d[2].x = box.x + box.w / 2
            d[2].y = box.y + box.h

            d[3].x = box.x
            d[3].y = box.y + box.h / 2

            d[4].x = box.x + box.w / 2
            d[4].y = box.y


            d[1].x1 = d[0].x + offset
            d[1].y1 = d[0].y
            d[1].x2 = d[1].x
            d[1].y2 = d[1].y - offset


            d[2].x1 = d[1].x
            d[2].y1 = d[1].y + offset
            d[2].x2 = d[2].x + offset
            d[2].y2 = d[2].y

            d[3].x1 = d[2].x - offset
            d[3].y1 = d[2].y 
            d[3].x2 = d[3].x 
            d[3].y2 = d[3].y + offset

            d[4].x1 = d[3].x 
            d[4].y1 = d[3].y - offset
            d[4].x2 = d[4].x - offset
            d[4].y2 = d[4].y


            // d[2].x1 = box.x
            // d[2].y1 = box.y
            // d[2].x1 = box.x + box.w / 2
            // d[2].y1 = box.y + box.h

            //d[0].x = box.x + box.w / 2
            //d[0].y = box.y
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