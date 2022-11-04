import SVGRuler from './SVGRuler'
import ModelGeom from 'core/ModelGeom'

export default class SVGGridRuler extends SVGRuler{

    constructor (editor, value, selection, zoom, grid, app) {
        super(editor, value, selection, zoom, grid, app)
        this.gridWidth = grid.w
        this.gridHeight = grid.h
        this.snappDistance = Math.max(grid.w, grid.h)
        this.showDistance = Math.max(grid.w, grid.h)
    }

   
    start (path, points) {
        this.selecedPath = path
        this.selecedPoints = points
    }

    initGridLines(pos) {

        let parentScreen = this.getHoverScreen(pos)

        if (parentScreen) {

            if (this._lastParentScreenID !== parentScreen.id) {
                this.xLines = new Set()
                this.yLines = new Set()
                if (this.gridWidth > 0) {
                    const columns = Math.ceil(parentScreen.w / this.gridWidth);
                    for (let i = 0; i < columns; i++) {
                        const x = Math.round(parentScreen.x + i * this.gridWidth)
                        this.xLines.add(x)
                    }
                }    
    
                if (this.gridHeight > 0) {
                    const rows = Math.ceil(parentScreen.h / this.gridHeight);
                    for (let i = 0; i < rows; i++) {
                        const y = Math.round(parentScreen.y + i * this.gridHeight)
                        this.yLines.add(y)
                    }
                }    
                this._lastParentScreenID = parentScreen.id
            }          
        } else {  
            this.xLines = new Set()
            this.yLines = new Set()
        }
      

    }

    getHoverScreen (pos) {
        return ModelGeom.getHoverScreen(pos, this.app);
    }


    correct (pos) {
       
        if (pos.shiftKey || !this.selecedPath) {
            this.editor.hideSnappLineX()
            this.editor.hideSnappLineY()
            return pos
        }

        this.initGridLines(pos)
        return this.correctByMinLines(pos, false)
    }

}