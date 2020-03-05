import Tool from './Tool'
import Logger from 'common/Logger'
export default class AddPathTool extends Tool{

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
        this.editor.value.push(path)
        this.path = path
        this.logger = new Logger('AddPathTool')
    }

    onClick(point) {
        this.logger.log(5, 'onClick', point.x + ' ' + point.y)
        let t = this.path.d.length === 0 ? 'M' : 'L'
        this.path.d.push({
            t: t,
            x: point.x,
            y: point.y
        })
        if (this.path.d.length === 1){
            this.onClick(point)
        }
    }

    onMove (point) {
       if (this.path.d.length >= 1){
           let last = this.path.d[this.path.d.length-1]
           last.x = point.x
           last.y = point.y
       }
    }

    onDoubleClick () {
        this.logger.log(5, 'onDoubleClick')
        this.editor.setState('addEnd')
    }

}