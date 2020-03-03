import Tool from './Tool'

export default class AddPathTool extends Tool{

    constructor (editor) {
        super()
        this.editor = editor
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
    }

    onClick(point) {
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
        // check here if we snapp to end?
    }

}