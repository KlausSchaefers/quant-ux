//import * as ExportUtil from './ExportUtil'
import ResponsiveLayout from './ResponsiveLayout'
import ModelGeom from '../ModelGeom'
import Logger from '../Logger'

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
export function layoutContainer (model, id, excludeIds = [], movedIds = [], isEnd = false, treeIndex) {
    Logger.log(-1, "ResponsiveUtil.layoutContainer() >> isEnd: " + isEnd, movedIds)
    const widget = model.widgets[id];
    if (!widget || (widget.type !== "FlexContainer" && widget.type !== "GridContainer")) {
        return
    }

    
    // create a resize model based on the widgets currently contained in the container
    let childrenIDs = treeIndex.getAllChildren(id, true)
    if (excludeIds.length > 0) {
        childrenIDs = childrenIDs.filter(cid => !excludeIds.includes(cid))
    }
    childrenIDs.push(widget.id) // add the container itself


    const resizeModel = {
        x: widget.x,
        y: widget.y,
        w: widget.w,
        h: widget.h,
        children: childrenIDs,
        // the container is the layout frame. Without a style, initSelection() would
        // shrink the frame to the (floored) children, which shifts everything by 1px
        // if a child was nudged 0.1 over the container edge
        style: {}
    }

    // call responsiveLayout
    const responsiveLayouter = new ResponsiveLayout(1)
    responsiveLayouter.initSelection(model, resizeModel, resizeModel.children, true, true, false)


    if (widget.type === "FlexContainer" && movedIds.length > 0) {
        reparentChildren(movedIds, model, responsiveLayouter, childrenIDs, id)
    }

    const newPositions = getResponsiveResizePositions(widget, widget, childrenIDs, responsiveLayouter)

    for (let cid in newPositions) {
        const pos = newPositions[cid];
        const childWidget = model.widgets[cid];
        if (childWidget) {            
            if (!isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.w) && !isNaN(pos.h)) {
                childWidget.modified = new Date().getTime()
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

/**
 * We already know these widgets belong directly under this container
 * (that's why layoutContainer() was called for it/them). The geometric
 * tree-build above can mistakenly nest one under a sibling that visually
 * encloses it (e.g. after DnD snapping) - correct that here, before we
 * read positions back out.
 *
 * movedIds can be a whole dragged group (e.g. a Box moved together with
 * its own children). We must only reparent the *root* ones - a moved
 * widget that is itself geometrically contained by another moved widget
 * is a legitimate nested child of that widget (its containment didn't
 * change, the whole group moved together) and must stay nested, or we'd
 * rip real children out from under their real parent.
 */
function reparentChildren(movedIds, model, responsiveLayouter, childrenIDs, id) {
    Logger.log(-1, "ResponsiveUtil.reparentChildren() ", movedIds)
    // This does not work well. Smaller elements or so might still be contained.
    // so maybe exlucde them first. Then add them explicityly as a child in 
    // the container. But if we have nested groups that would be and issue.
    // this is waht this code should have done...

    const rootMovedIds = movedIds.filter(movedId => {
        const movedWidget = model.widgets[movedId]
        if (!movedWidget) {
            return false
        }
        return !movedIds.some(otherId => {
            if (otherId === movedId) {
                return false
            }
            const otherWidget = model.widgets[otherId]
            return otherWidget && ModelGeom.isFullContained(otherWidget, movedWidget)
        })
    })

    /**
     * The reverse case: a moved widget now geometrically encloses a
     * non-moved sibling (e.g. black dragged in front of gray). Flat2Tree
     * nests the sibling under the moved widget. Real children of a moved
     * widget always travel with it, so are in movedIds - any other child
     * is an accidental one and belongs back in the container.
     */
    const accidentalIds = []
    rootMovedIds.forEach(movedId => {
        const node = responsiveLayouter.findWidget(movedId)
        if (node && node.children) {
            node.children.forEach(c => {
                if (childrenIDs.includes(c.id) && !movedIds.includes(c.id)) {
                    accidentalIds.push(c.id)
                }
            })
        }
    })



    //console.debug(responsiveLayouter.printTree())

    /**
     * Design groups are wrapped in their own tree node (Quant2Flat), which
     * is the actual flex child. A widget inside a group must never be
     * pulled out of its wrapper - that leaves an empty wrapper plus the
     * widget as two flex children (two grow children then split the space
     * and both come out too small). Reparent the outermost wrapper instead.
     */
    const getFlexChildId = (widgetId) => {
        let node = responsiveLayouter.findWidget(widgetId)
        while (node && node.parent && node.parent.id !== id && model.groups && model.groups[node.parent.id]) {
            node = node.parent
        }
        return node ? node.id : widgetId
    }

    const reparented = {}
    accidentalIds.forEach(movedId => {
        if (movedId !== id && childrenIDs.includes(movedId)) {
            const flexChildId = getFlexChildId(movedId)
            if (!reparented[flexChildId]) {
                reparented[flexChildId] = true
                console.debug('reparent', flexChildId)
                responsiveLayouter.reparentToDirectChild(flexChildId, id)
            }
        }
    })
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