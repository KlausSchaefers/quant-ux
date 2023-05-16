import Logger from '../Logger'

import * as Flat2Tree from './Flat2Tree'
import * as Quant2Flat from './Quant2Flat'
import * as ExportUtil from './ExportUtil'
import Config from './Config'

export default class ResponsiveLayout {

    constructor(model, config = Config.getDefault()) {
        this.model = model // remove style for faster copy???
        this.config = config
        this.init(model, config)
    }

    init(model, config) {
        const flatModel = Quant2Flat.transform(model, config)
        const treeModel = Flat2Tree.transform(flatModel, config)
        this.treeModel = treeModel
    }

    resize(width) {
        const f = width / this.model.screenSize.w
        Logger.log(-1, 'ResponsiveLayout.resize() > width: ' + width + ' > f:' + f )

        const newNestedPositions = this.resizePositions(f)
        return this.resizeModel(f, newNestedPositions)
    }

    resizePositions(f) {
        const newNestedPositions = {}
        this.treeModel.screens.forEach(scrn => {
            this.resizeScreen(f, scrn, newNestedPositions)
        })
        return newNestedPositions
    }

    resizeModel (f, newNestedPositions) {
        const result = ExportUtil.clone(this.model)
        result.screenSize.w = this.model.screenSize.w * f
        Object.values(result.screens).forEach(scrn => {
            scrn.w = newNestedPositions[scrn.id].w
            scrn.x = newNestedPositions[scrn.id].x
        })

        return result
    }

    resizeScreen (f, scrn, newNestedPositions) {
        Logger.log(-1, 'ResponsiveLayout.resizeScreen() > ' + scrn.name )


        newNestedPositions[scrn.id] = createResult(0,scrn.w * f,  scrn)

        this.resizeChildren(f, scrn, scrn, newNestedPositions)


    }


    resizeChildren(f, box, parent, newNestedPositions) {
        Logger.log(-1, 'ResponsiveLayout.resizeChildren() > ' + box.name, box.layout.type )

        if (box.layout.type === 'row') {
            this.resizeChildrenRow(f, box, parent, newNestedPositions)
        }

        if (box.layout.type === 'grid') {
            this.resizeChildenGrid(f, box, parent, newNestedPositions)
        }
    }

    resizeChildrenRow (f, box, parent, newNestedPositions) {
       
        const newParent = newNestedPositions[parent.id]

        box.children.forEach(child => {             
            const parentX = parent.x
            const parentW = parent.w
            console.debug('- ', child.name, ExportUtil.isPinnedLeft(child) && ExportUtil.isPinnedRight(child), ExportUtil.isFixedHorizontal(child))
            if (ExportUtil.isPinnedLeft(child) && ExportUtil.isPinnedRight(child)) {
                const distanceRight = parentW - (child.x + child.w)
                const newWidth = newParent.w - distanceRight - child.x
                newNestedPositions[child.id] = createResult(child.x, newWidth,child)
                //console.debug('  ', distanceRight, child.x, result[child.id], newParent.w - (result[child.id].w + result[child.id].x))
            } else if (ExportUtil.isFixedHorizontal(child)){
                if (ExportUtil.isPinnedLeft(child)) {

                } else if (ExportUtil.isPinnedLeft(child)) {

                } else {

                }

            } else {

            }
        })
    }



    resizeChildenGrid (f, box, result) {
        
    }
}

function createResult(x, w, /*box*/) {
    return {
        w: w,
        x: x
    }
}