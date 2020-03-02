

export default class AddPathTool {

    constructor (path) {
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

    onEnd () {
        // check here if we snapp to end?
    }

}