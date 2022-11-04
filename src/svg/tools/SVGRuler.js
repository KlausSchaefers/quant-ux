export default class SVGRuler {

    constructor (editor, value, selection, zoom, grid, app) {
        this.editor = editor
        this.value = value
        this.selection = selection
        this.zoom = zoom
        this.grid = grid
        this.app = app
        this.snappDistance = 8
        this.showDistance = 8
    }

    setZoom (z) {
        this.zoom = z
    }

    start (path, points) {
        this.selecedPath = path
        this.selecedPoints = points
        this.initLines()
    }

    initLines() {
        this.xLines = new Set()
        this.yLines = new Set()
        this.value.forEach(path => {
            path.d.forEach((point, i) => {
                if (path.id !== this.selecedPath.id || this.selecedPoints.indexOf(i) < 0) {
                    this.xLines.add(point.x)
                    this.yLines.add(point.y)
                }
            })
        });

    }

    end () {
        delete this.selecedPath
        delete this.selecedPoints
        this.editor.hideSnappLineX()
        this.editor.hideSnappLineY()
    }

    correct (pos) {

        if (pos.shiftKey || !this.selecedPath) {
            this.editor.hideSnappLineX()
            this.editor.hideSnappLineY()
            return pos
        }

        return this.correctByMinLines(pos)
      
    }

    correctByMinLines (pos, show=true) {
        const min = {
            x: 100000,
            correctX: 0,
            showX: -1,
            y: 100000,
            correctY: 0,
            showY: -1
        } 
       
        this.xLines.forEach(x => {
            const dif = pos.x - x
            if (Math.abs(dif) < min.x) {
                min.x = Math.abs(dif)
                min.showX = x 
                min.correctX = dif
            }
        })

        this.yLines.forEach(y => {
            const dif = pos.y - y
            if (Math.abs(dif) < min.y) {
                min.y = Math.abs(dif)
                min.showY = y 
                min.correctY = dif
            }
        })

        if (min.x < this.showDistance && show) {
            this.editor.showSnappLineX(min.showX)
        } else {
            this.editor.hideSnappLineX()
        }

        if (min.x < this.snappDistance) {
            pos.x = min.showX
        }

        if (min.y < this.showDistance && show) {
            this.editor.showSnappLineY(min.showY)
        } else {
            this.editor.hideSnappLineY()
        }
    
        if (min.y < this.snappDistance) {
            pos.y = min.showY
        }

        
        return pos
    }

}