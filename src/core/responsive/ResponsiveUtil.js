//import * as ExportUtil from './ExportUtil'

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