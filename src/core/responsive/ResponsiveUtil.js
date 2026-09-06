//import * as ExportUtil from './ExportUtil'
import ResponsiveLayout from './ResponsiveLayout'
import ModelGeom from '../ModelGeom'

export function getResponsiveResizePositions (pos, oldPos, children, responsiveLayouter) {

    const responsivePositions = responsiveLayouter.resize(pos.w, pos.h)
    const offsetX = pos.x - oldPos.x
    const offsetY = pos.y - oldPos.y

    const positions = {};
    for (let i = 0; i < children.length; i++) {
        const id = children[i];
        const repositionWidget = responsivePositions.widgets[id]
        positions[id] = {
            x: repositionWidget.x + offsetX,
            y: repositionWidget.y + offsetY,
            w: repositionWidget.w,
            h: repositionWidget.h
        }
    }
    return positions
}

/**
 * Relayout a single FlexContainer/GridContainer with ResponsiveLayout, based
 * on the widgets currently contained in it (by geometry, via
 * ModelGeom.getChildWidgetsIDsFast).
 */
export function layoutContainer (model, id, excludeIds = []) {
    const widget = model.widgets[id];
    if (!widget || (widget.type !== "FlexContainer" && widget.type !== "GridContainer")) {
        return
    }

    // create a resize model based on the widgets currently contained in the container
    let childrenIDs = ModelGeom.getChildWidgetsIDsFast(model, widget)
    if (excludeIds.length > 0) {
        childrenIDs = childrenIDs.filter(cid => !excludeIds.includes(cid))
    }
    childrenIDs.push(widget.id) // add the container itself

    const resizeModel = {
        x: widget.x,
        y: widget.y,
        w: widget.w,
        h: widget.h,
        children: childrenIDs
    }

    // call responsiveLayout
    const responsiveLayouter = new ResponsiveLayout(1)
    responsiveLayouter.initSelection(model, resizeModel, resizeModel.children, true, true, false)

    const newPositions = getResponsiveResizePositions(widget, widget, childrenIDs, responsiveLayouter)

    for (let cid in newPositions) {
        const pos = newPositions[cid];
        const childWidget = model.widgets[cid];
        if (childWidget) {
            childWidget.modified = new Date().getTime()
            if (!isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.w) && !isNaN(pos.h)) {
                childWidget.x = pos.x;
                childWidget.y = pos.y;
                childWidget.w = pos.w
                childWidget.h = pos.h;
            }
        } else {
            console.warn('layoutContainer() > no widget', cid)
        }
    }

    return newPositions
}

export function getPinnedScreenChildPositions (pos, pinnedChildren) {
    const result = {}

    pinnedChildren.forEach(w => {

        if (w.pinnedUp) {
            const h = Math.max(16, (((pos.y + pos.h) - w.offsetBottom)) - w.y)
            result[w.id] = {
                y: w.y,
                x: w.x,
                h: h,
                w: w.w
            }
        } else {
            const y = ((pos.y + pos.h)) - w.h - w.offsetBottom
            result[w.id] = {
                y: y,
                x: w.x,
                h: w.h,
                w: w.w
            }
        }


    })
    return result
}

export function getPinnedScreenChildren(/*screen, model */) {
    const children = []
    // screen.children.forEach(id => {
    //   const widget = model.widgets[id]
    //   /**
    //    * We do not support widgets from a master screen
    //    */
    //   if (widget && !widget.inherited && ExportUtil.isPinnedDown(widget)) {
    //     children.push({
    //         id: widget.id,
    //         x: widget.x,
    //         y: widget.y,
    //         h: widget.h,
    //         w: widget.w,
    //         offsetTop: widget.y - screen.y,
    //         offsetBottom: (screen.y + screen.h) - (widget.y + widget.h),
    //         pinnedUp: ExportUtil.isPinnedUp(widget),
    //         pinnedDown: ExportUtil.isPinnedDown(widget)
    //     })
    //   }
    // })
    return children
}