import Logger from '../Logger'

import * as Flat2Tree from './Flat2Tree'
import * as Quant2Flat from './Quant2Flat'
import * as ExportUtil from './ExportUtil'
import * as SnappUtil from '../SnappUtil'
import Config from './Config'

export default class ResponsiveLayout {

    constructor(zoom, config = Config.getDefault()) {
        this.config = config
        this.config.useRows = false
        this.config.wrapGroups = true
        this.config.removeRootIfNeeded = false
        this._debugScaledGrids = {}

        if (!zoom) {
            Logger.error('ResponsiveLayout.constructor() > zoom not passed ')
            console.trace()
            this.config.zoom = 1
        } else {
            Logger.log(2, 'ResponsiveLayout.constructor() > zoom  ', zoom)
            this.config.zoom = zoom
        }

    }

    initApp(model, wrapGroups, removeRootIfNeeded=false) {
        this.model = model
        this.config.removeRootIfNeeded = removeRootIfNeeded
        if (wrapGroups) {
            model = Quant2Flat.transform(model, this.config)
        }
        const treeModel = Flat2Tree.transform(model, this.config)
        this.treeModel = treeModel
    }

    findWidget (id) {
        if (this.treeModel) {
            const scrn = this.treeModel.screens[0]
            return this.findElementsById(scrn, id)[0]
        }
    }

    findElementsById (e, id, result = []) {
    
        if (e.children) {
            e.children.forEach(c => {
                if (c.id === id) {
                  result.push(c)
                }                
                this.findElementsById(c, id, result)
            })
        }
        return result
    }

    initSelection(model, boundingBox, children, round=true, wrapGroups = true, removeRootIfNeeded=true) {
       // Logger.log(-1, 'ResponsiveLayout.initSelection() > wrapGroups: ' + wrapGroups)
        /**
         * We want to make sure, that the selection is always
         * in the crisp in the bounding box.
         */
        if (round) {
            boundingBox.w = ExportUtil.round(boundingBox.w)
            boundingBox.h = ExportUtil.round(boundingBox.h)
            boundingBox.x = ExportUtil.round(boundingBox.x)
            boundingBox.y = ExportUtil.round(boundingBox.y)       
        }
        this.config.fixStartEnd = true
        const scrn = {
            id: 's',
            name: 'Selection',
            w: boundingBox.w,
            h: boundingBox.h,
            x: boundingBox.x,
            y: boundingBox.y,
            children: children,
            style: {},
            props: {}
        }
        const responsiveSelection = {
            id: model.id,
            name: "Selection",
            screenSize: {
                w: boundingBox.w,
                h: boundingBox.h
            },
            screens: {
               s: scrn
            },
            widgets: {},
            groups: {}
        }

        const roundedBoxed = []
        children.forEach(id => {
            const widget = model.widgets[id]
            const group = ExportUtil.getParentGroup(widget.id, model)
       
            if (group && !responsiveSelection.groups[group.id]) {
                responsiveSelection.groups[group.id] = group
            }
            if (!round) {
                responsiveSelection.widgets[id] = widget
            } else {
                const cloned = ExportUtil.clone(widget)
                cloned.x = ExportUtil.round(cloned.x)
                cloned.y = ExportUtil.round(cloned.y)
                cloned.w = ExportUtil.round(cloned.w)
                cloned.h = ExportUtil.round(cloned.h)
                responsiveSelection.widgets[id] = cloned
                roundedBoxed.push(cloned)
            }

        })

        /**
         * To avoid stupid double cols and row at the end,
         * we resize the bounding bix, however, if we have a screen,
         * the bounding should no be changed
         */
        if (round && !this.isBoundingBoxScreen(boundingBox)) {
          
            const roundedBoundingBox = ExportUtil.getBoundingBoxByBoxes(roundedBoxed)
            scrn.x = roundedBoundingBox.x
            scrn.y = roundedBoundingBox.y
            scrn.w = roundedBoundingBox.w
            scrn.h = roundedBoundingBox.h
        }

        // add groups
        this.initApp(responsiveSelection, wrapGroups, removeRootIfNeeded)
    }

    isBoundingBoxScreen(boundingBox) {
        return boundingBox.style
    }

    // createGroupWrapper (element, group, model) {

    //     let boundingBox = ExportUtil.getBoundingBoxByIds(group.children, model)
    
    //     const wrapper = {
    //         id: `w${element.id}`,
    //         name: group.name + 'Wrapper',
    //         groupId: group.id,
    //         isGroup: true,
    //         type: "Box",
    //         x: 0,
    //         y: 0,
    //         w: boundingBox.w,
    //         h: boundingBox.h,
    //         style: element.style ? element.style : {},
    //         props: {
    //             resize: element.props && element.props.resize ? element.props.resize : {
    //                 right: false,
    //                 up: false,
    //                 left: false,
    //                 down: false,
    //                 fixedHorizontal: false,
    //                 fixedVertical: false,
    //             }
    //         }
    //     }
    
    //     return wrapper
    // }

    resize(width, height) {
        Logger.log(1, 'ResponsiveLayout.resize() > width: ' + width + ' > height:',  height )
        const newNestedPositions = this.resizePositions(width, height)
        return this.resizeModel(width, height, newNestedPositions)
    }

    updateScreenGrid (scrnNumber, grid) {
        Logger.log(1, 'ResponsiveLayout.updateScreenGrid() > scrnNumber: ' + scrnNumber + ' > grid:',  grid )
        const newNestedPositions = {}
        const scrn = this.treeModel.screens[scrnNumber]
        if (scrn) {
            scrn.grid = grid
            const width = scrn.w
            const height = scrn.h
            newNestedPositions[scrn.id] = createResult(0,0, width, height)
            const sclaleGrid = this.mapGrid(grid, scrn)
            this.updateChildPositions(scrn, scrn, sclaleGrid, newNestedPositions, '')

            return this.resizeModel(scrn.w, scrn.h, newNestedPositions)
        }
        return newNestedPositions
    }

    resizePositions(width, height) {
        const newNestedPositions = {}
        this.treeModel.screens.forEach(scrn => {
            if (height === -1) {
                height = scrn.h
            }
            if (width === -1) {
                width = scrn.w
            }
            this.resizeScreen(width, height, scrn, newNestedPositions)
        })
        return newNestedPositions
    }


    resizeScreen (width, height, scrn, newNestedPositions) {
        Logger.log(2, 'ResponsiveLayout.resizeScreen() > ' + scrn.name + ' w:' + width + ' h:'+ height)
        newNestedPositions[scrn.id] = createResult(0,0, width, height)
        this.resizeChildren(scrn, scrn, newNestedPositions, '')
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
            // not all children are real, we have for instance the grup wrappers.
            // we do not want to return them in here
            const widget = app.widgets[child.id]     
            if (widget) {
                const newPos = newNestedPositions[child.id]
                if (newPos) {
                    // in some cases fixed elements would be stretched,
                    // because the align with pinned one. 
                    // we prevent this here explicitly
                    if (child?.props?.resize?.fixedVertical) {
                        //widget.h = widget.h
                    } else {
                        widget.h = newPos.h
                    }
                    if (child?.props?.resize?.fixedHorizontal) {
                        //widget.w = widget.w
                    } else {
                        widget.w = newPos.w
                    }
                    
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


    resizeChildren(box, parent, newNestedPositions, indent='') {
        Logger.log(2, indent + 'ResponsiveLayout.resizeChildren() > ' + box.name, box.layout.type )
        if (box.children.length === 0) {
            return 
        }
      
        if (box.layout.type === 'row') {
            this.resizeChildenGrid(box, parent, newNestedPositions, indent)
        }

        if (box.layout.type === 'grid' && box.grid) {
            this.resizeChildenGrid(box, parent, newNestedPositions, indent)
        }
    }


    resizeChildenGrid(box, parent, newNestedPositions, indent) {
        Logger.log(2, indent + 'ResponsiveLayout.resizeChildenGrid() > ' + box.name)  
        const newParent = newNestedPositions[parent.id]
        const sclaleGrid = this.sclaleGrid(box, box.grid, newParent, indent + box.name)
        this._debugScaledGrids[box.id] = sclaleGrid
        this.updateChildPositions(box, newParent, sclaleGrid, newNestedPositions, indent)      
    }

    updateChildPositions (box, newParent, sclaleGrid, newNestedPositions, indent) {
        box.children.forEach(child => {

          
            const startX = sclaleGrid.cols[child.gridColumnStart]
            const endX = sclaleGrid.cols[child.gridColumnEnd]
            const width = endX - startX
            //console.debug(indent, 'ResponsiveLayout.updateChildPositions() > ', child.name, newParent.x, '> ', sclaleGrid.cols.join(','), '>',  startX, endX, width, '=' ,child.gridColumnStart, child.gridColumnEnd)
    
            // TODO: we should check that the with and height on
            // fixed elements are really the same...
        
            const startY = sclaleGrid.rows[child.gridRowStart]
            const endY = sclaleGrid.rows[child.gridRowEnd]
            const height = endY - startY

            //console.debug(indent, 'ResponsiveLayout.updateChildPositions() > ', child.name, startY, endY, startX, endX, width, height)

            const newChildPos = createResult(
                startX + newParent.x, 
                startY + newParent.y,
                width,
                height
            )
            //console.debug(indent, 'ResponsiveLayout.updateChildPositions() > ', child.name, newChildPos.x, newChildPos.w)

    
            newNestedPositions[child.id] = newChildPos
            this.resizeChildren(child, child, newNestedPositions, indent + '     ')
        })
    }


    mapGrid (grid, newParent) {
        const result = {}
        let lastX = 0
        result.cols = grid.columns.map((col) => {
            return col.l       
        }).map(x => {         
            lastX += x
            return lastX
        })
        result.cols.unshift(0)

        let lastY = 0
        result.rows = grid.rows.map((row) => {            
            return row.l          
        }).map(y => {         
            lastY += y
            return lastY
        })
        result.rows.unshift(0)

        if (this.config.fixStartEnd) {
            result.cols[result.cols.length-1] = newParent.w
            result.rows[result.rows.length-1] = newParent.h
        }

        return result
    }

    sclaleGrid (box, grid, newParent) {

        if (ExportUtil.isGridContainerWidget(box)) {  
            return this.sclaleDGridContainer(box, grid, newParent)
        } else {
            return this.sclaleDefaultGrid(grid, newParent)
        }
       
    }

    sclaleDGridContainer (box, gridX, newParent) {

        const newBox = {
            id: box.id,
            name: box.name,
            x: 0, // box is always at 0,0
            y: 0,
            w: newParent.w,
            h: newParent.h,
            style: box.style,
            props: box.props,
            children: box.children
        }

        const lines = SnappUtil.getGridContainerLines(newBox, 'All', this.config.zoom)
        lines.x.unshift(0)
        lines.x.push(newParent.w)
        lines.y.unshift(0)
        lines.y.push(newParent.h)

        // console.debug('ResponsiveLayout.sclaleDGridContainer() > ', box.name, box.x, box.w, ' newParent:', newParent.x, newParent.w,' newBox:', newBox.x, newBox.w, '>', lines.x.join(','))
        // console.debug('ResponsiveLayout.sclaleDGridContainer() > ', box.name, box.y, box.h, ' newParent:', newParent.y, newParent.h,' newBox:', newBox.y, newBox.h, '>', lines.y.join(','))

        // this is in principle the same as the old one good
        // but for zooming we add
        return {
            rows: lines.y,
            cols: lines.x
        }
    }

    sclaleDefaultGrid (grid, newParent) {
        grid = ExportUtil.clone(grid)
        const result = {}

        unFixMax(grid.columns)
        unFixMax(grid.rows)
   
        const [flexWidth, fixedWith] = getFlexFixed(grid.columns)
        const factorWidth = (newParent.w - fixedWith) / flexWidth
        
        let lastX = 0
        result.cols = grid.columns.map((col) => {
            return col.fixed  ? col.l : ExportUtil.round(col.l * factorWidth)            
        }).map(x => {         
            lastX += x
            return lastX
        })
        result.cols.unshift(0)
        
    
        const [flexHeight, fixedHeight] = getFlexFixed(grid.rows, 'row')
        const factorHeight = (newParent.h - fixedHeight)/ flexHeight
        let lastY = 0
        result.rows = grid.rows.map((row) => {            
            return row.fixed ? row.l : ExportUtil.round(row.l * factorHeight)            
        }).map(y => {         
            lastY += y
            return lastY
        })
        result.rows.unshift(0)

        if (this.config.fixStartEnd) {
            result.cols[result.cols.length-1] = newParent.w
            result.rows[result.rows.length-1] = newParent.h
        }

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
        this.resizeChildRowVertical(child, parent, newParent, result, indent)     
        newNestedPositions[child.id] = result
        this.resizeChildren(child, child, newNestedPositions, indent + '     ')
    }


    resizeChildRowVertical (child, parent, newParent, newChildPos) {
        const parentH = parent.h
        const distanceBottom = parentH - (child.y + child.h)
        const factorHeight = newParent.h / parent.h

        if (ExportUtil.isPinnedUp(child) && ExportUtil.isPinnedDown(child)) {    

            const newWidth = newParent.h - distanceBottom - child.y
            newChildPos.h = newWidth

        } else if (ExportUtil.isFixedVertical(child)){

            if (ExportUtil.isPinnedUp(child)) {
                // nothing
            } else if (ExportUtil.isPinnedDown(child)) {            
                const newY = (newParent.h + newParent.h) - (child.h + distanceBottom)
                newChildPos.y = newY
                newChildPos.b = distanceBottom
            } else {
                newChildPos.y = ExportUtil.round(child.y* factorHeight) + newParent.y
            }

        } else {
       
            if (ExportUtil.isPinnedUp(child)) {
                newChildPos.h = Math.round(child.h * factorHeight)
            } else if (ExportUtil.isPinnedDown(child)) {          
                    
                const newHeight = ExportUtil.round(child.h * factorHeight)
                const newY = (newParent.h + newParent.y) - (newHeight + distanceBottom)
                newChildPos.h = newHeight
                newChildPos.y = newY  
                newChildPos.b = distanceBottom         
            } else {
                newChildPos.h = ExportUtil.round(child.h * factorHeight) 
                newChildPos.y = ExportUtil.round(child.y * factorHeight) + newParent.y           
            }             
        }
        //console.debug(indent,'  hor', parent.name, '-> ', child.name, child.id, child.w, parent.w, newParent.w, ' ==',newChildPos.w)
       
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
                newChildPos.x = ExportUtil.round(child.x * factorWidth) + newParent.x
            }

        } else {
       
            if (ExportUtil.isPinnedLeft(child)) {
                newChildPos.w = Math.round(child.w * factorWidth)
            } else if (ExportUtil.isPinnedRight(child)) {          
                    
                const newWidth = ExportUtil.round(child.w * factorWidth)
                const newX = (newParent.w + newParent.x) - (newWidth + distanceRight)
                newChildPos.w = newWidth
                newChildPos.x = newX  
                newChildPos.r = distanceRight         
            } else {
                newChildPos.w = ExportUtil.round(child.w * factorWidth) 
                newChildPos.x = ExportUtil.round(child.x * factorWidth) + newParent.x           
            }             
        }
        //console.debug(indent,'  hor', parent.name, '-> ', child.name, child.id, child.w, parent.w, newParent.w, ' ==',newChildPos.w)
       
    }
}

function getFlexFixed(list) {

    let flex = 0
    let fixed = 0
    list.forEach((col) => {
        if (col.fixed) {
            fixed += col.l
        } else {
            flex += col.l
        }
    })
    return [flex, fixed]
}

function createResult(x, y, w, h) {
    return {
        w: ExportUtil.round(w),
        x: ExportUtil.round(x),
        y: ExportUtil.round(y),
        h: ExportUtil.round(h)
    }
}

export function isAllFixed(list) {
    const fixedCols = list.filter((col) => col.fixed)
    return fixedCols.length === list.length
}

export function getMaxChild(children, type) {
    let max = 0;
    let maxChild = null
    children.forEach(c => {
        if (c[type] > max) {
            maxChild = c
            max = c[type]
        }
    })
    return maxChild
}

export function unFixMax(list) {
    const fixedCols = list.filter((col) => col.fixed)
     if (fixedCols.length === list.length) {
        //console.debug('Make all flex')
        //const max = Math.max(...list.map(col => col.l))
        list.forEach(col => {   
            col.fixed = false            
        })
    } 
}

export function unFixMin(list) {
    const fixedCols = list.filter((col) => col.fixed)
    if (fixedCols.length === list.length) {
        const min = Math.min(...list.map(col => col.l))
        list.forEach(col => {
            if (col.l === min) {
                col.fixed = false
            }
        })
    } 
}

