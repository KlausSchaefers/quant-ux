import Logger from '../Logger'

import * as Flat2Tree from './Flat2Tree'
//import * as Quant2Flat from './Quant2Flat'
import * as ExportUtil from './ExportUtil'
import Config from './Config'

export default class ResponsiveLayout {

    constructor(model, config = Config.getDefault()) {
        this.model = model // remove style for faster copy???
        this.config = config
        this.init(model, config)
    }

    init(model, config) {
        //const flatModel = Quant2Flat.transform(model, config)
        const treeModel = Flat2Tree.transform(model, config)
        this.treeModel = treeModel
    }

    resize(width, height = this.model.screenSize.h) {
        Logger.log(-1, 'ResponsiveLayout.resize() > width: ' + width + ' > height:' + height )
        const newNestedPositions = this.resizePositions(width, height)
        return this.resizeModel(width, height, newNestedPositions)
    }

    resizePositions(width, height = this.model.screenSize.h) {
        const newNestedPositions = {}
        this.treeModel.screens.forEach(scrn => {
            this.resizeScreen(width, height, scrn, newNestedPositions)
        })
        return newNestedPositions
    }

    resizeModel (width, height, newNestedPositions) {
        const result = ExportUtil.clone(this.model)
        result.screenSize.w = width
        result.screenSize.h = height
       
        this.treeModel.screens.forEach(x => {
            const scrn = result.screens[x.id]
            scrn.w = newNestedPositions[x.id].w
            scrn.h = newNestedPositions[x.id].h
         
            this.updateModel(newNestedPositions, result, x, scrn.x, scrn.y)
        })

        return result
    }

    updateModel (newNestedPositions, app, box, offsetX = 0, offsetY = 0, indent = '') {
        //console.table(newNestedPositions)
        box.children.forEach(child => {        
            const widget = app.widgets[child.id]
            if (widget) {
                const newPos = newNestedPositions[child.id]
                if (newPos) {
                    widget.w = newPos.w
                    widget.h = newPos.h
                    widget.x = newPos.x + offsetX
                    widget.y = newPos.y + offsetY
                    this.updateModel(newNestedPositions, app, child, offsetX, offsetY, indent+ '    ')
                }
            } else {
                // group
                this.updateModel(newNestedPositions, app, child, offsetX, offsetY)
            }
        })
    }

    resizeScreen (width, height, scrn, newNestedPositions) {
        Logger.log(-1, 'ResponsiveLayout.resizeScreen() > ' + scrn.name )
        newNestedPositions[scrn.id] = createResult(0,0, width, height)
        this.resizeChildren(scrn, scrn, newNestedPositions, '')
    }


    resizeChildren(box, parent, newNestedPositions, indent='') {

        if (box.children.length === 0) {
            return 
        }
        Logger.log(1, indent + 'ResponsiveLayout.resizeChildren() > ' + box.name, box.layout.type )

        if (box.layout.type === 'row') {
            this.resizeChildrenRow(box, parent, newNestedPositions, indent)
        }

        if (box.layout.type === 'grid' && box.grid) {
            this.resizeChildenGrid(box, parent, newNestedPositions, indent)
        }
    }


    resizeChildenGrid(box, parent, newNestedPositions, indent) {


        const newParent = newNestedPositions[parent.id]
        const factorWidth = newParent.w / parent.w
        const factorHeight = newParent.h / parent.h

        const sclaleGrid = this.sclaleGrid(box.grid, factorWidth, factorHeight)
        console.debug(indent, 'resizeChildenGrid', box.name, factorWidth, box.grid.columns)
        // console.debug(box.grid.columns.map(r => r.l))
        // console.debug(sclaleGrid.cols)

         
        box.children.forEach(child => {   
            console.debug(indent, '  -', child.name, child)
     
            const startX = sclaleGrid.cols[child.gridColumnStart]
            const endX = sclaleGrid.cols[child.gridColumnEnd]
            const width = endX - startX

            const startY = sclaleGrid.rows[child.gridRowStart]
            const endY = sclaleGrid.rows[child.gridRowEnd]
            const height = endY - startY

            const newChildPos = createResult(
                startX + newParent.x, 
                startY + newParent.y,
                width,
                height
            )

            newNestedPositions[child.id] = newChildPos
            //console.debug(indent, ' - ', child.name, gridPos.xStart, gridPos.xEnd - gridPos.xStart)
            //console.debug(indent, ' ->> ', child.w,' :', newChildPos.w, ' / ', child.x ,' :',  newChildPos.x)

            this.resizeChildren(child, child, newNestedPositions, indent + '     ')
        })


    }

    getWidgetPositionInGrid (grid, scaledGrid) {
        const result = {}
        grid.columns.forEach((col, i) => {
            const x = scaledGrid.cols[i]
            col.start.forEach((wID) => {
                if (!result[wID]) {
                    result[wID]= {}
                }
                result[wID].xStart = x
            })
            col.end.forEach((wID) => {
                if (!result[wID]) {
                    result[wID]= {}
                }
                result[wID].xEnd = x
            })
        })
        return result
    }


    sclaleGrid (grid, factorWidth = 1, factorHeight = 1) {
        const result = {}
        // there is also something about hasMinMax?
        let lastX = 0
        result.cols = grid.columns.map((col) => {
            return col.fixed  ? col.l : Math.round(col.l * factorWidth)            
        }).map(x => {         
            lastX += x
            return lastX
        })
        result.cols.unshift(0)

        let lastY = 0
        result.rows = grid.rows.map((row) => {            
            return row.fixed ? row.l : Math.round(row.l * factorHeight)            
        }).map(y => {         
            lastY += y
            return lastY
        })
        result.rows.unshift(0)
        return result
    }

    
    resizeChildrenRow (box, parent, newNestedPositions, indent) {
        box.children.forEach(child => {             
            this.resizeRowChild(child, parent, newNestedPositions, indent)           
        })
    }

    resizeRowChild(child, parent, newNestedPositions, indent) {
        const newParent = newNestedPositions[parent.id]
        // FIXME add offet
        const result = createResult(child.x + newParent.x, child.y + newParent.y, child.w, child.h)     
        this.resizeChildRowHorizontal(child, parent, newParent, result, indent)       
        newNestedPositions[child.id] = result
        this.resizeChildren(child, child, newNestedPositions, indent + '     ')
    }


    resizeChildRowHorizontal (child, parent, newParent, newChildPos) {
        const parentW = parent.w
        const distanceRight = parentW - (child.x + child.w)
        const factorWidth = newParent.w / parent.w

        if (ExportUtil.isPinnedLeft(child) && ExportUtil.isPinnedRight(child)) {    

            const newWidth = newParent.w - distanceRight - child.x
            newChildPos.w = newWidth

        } else if (ExportUtil.isFixedHorizontal(child)){

            if (ExportUtil.isPinnedLeft(child)) {
                // nothing
            } else if (ExportUtil.isPinnedRight(child)) {            
                const newX = (newParent.w + newParent.x) - (child.w + distanceRight)
                newChildPos.x = newX
                newChildPos.r = distanceRight
            } else {
                newChildPos.x = Math.round(child.x * factorWidth) + newParent.x
            }

        } else {
       
            if (ExportUtil.isPinnedLeft(child)) {
                newChildPos.w = Math.round(child.w * factorWidth)
            } else if (ExportUtil.isPinnedRight(child)) {          
                    
                const newWidth = Math.round(child.w * factorWidth)
                const newX = (newParent.w + newParent.x) - (newWidth + distanceRight)
                newChildPos.w = newWidth
                newChildPos.x = newX  
                newChildPos.r = distanceRight         
            } else {
                newChildPos.w = Math.round(child.w * factorWidth) 
                newChildPos.x = Math.round(child.x * factorWidth) + newParent.x           
            }             
        }
        //console.debug(indent,'  hor', parent.name, '-> ', child.name, child.id, child.w, parent.w, newParent.w, ' ==',newChildPos.w)
       
    }





}

function createResult(x, y, w, h) {
    return {
        w: Math.round(w),
        x: Math.round(x),
        y: Math.round(y),
        h: Math.round(h)
    }
}