import Snapp from './Snapp'
import lang from '../../dojo/_base/lang'
import ResponsiveLayout from '../../core/responsive/ResponsiveLayout'
import ModelGeom from '../../core/ModelGeom'
import TreeIndex from '../../core/responsive/TreeIndex'
import FlexLayout, { FlexTree, keepParents, getOutermostGroup } from '../../core/responsive/FlexLayout'
import FlexTextMeasure from '../../core/responsive/FlexTextMeasure'
import * as FlexMath from '../../core/responsive/FlexMath'
import * as ResponsiveUtil from '../../core/responsive/ResponsiveUtil'


export default class Responsive extends Snapp {

    /**
     * A GridContainer whose grid settings changed lays out its children
     * again. A FlexContainer does not need this: every change of a widget is
     * laid out in relayoutFlexContainers() when the change is committed.
     */
    updateLayoutContainerChange(oldWidget) {
        const widget = this.model.widgets[oldWidget.id];
        const isGridChange = widget && widget.type === "GridContainer" && this.gridPropsHaveChanged(oldWidget, widget)

        if (isGridChange) {
            this.logger.log(-1, "updateLayoutContainerChange", widget.type + " changed, check for layout change");

            // create a resize model
            let childrenIDs = ModelGeom.getChildWidgetsIDs(this.model, widget)
            childrenIDs.push(widget.id) // add the container itself

            const resizeModel = {
                x: widget.x,
                y: widget.y,
                w: widget.w,
                h: widget.h,
                children: childrenIDs
            }

            // create model with old widget
            const oldModel = {
                widgets: {},
                screens: this.model.screens,
                groups: this.model.groups,
            }
            childrenIDs.forEach(id => {
                oldModel.widgets[id] = lang.clone(this.model.widgets[id]);
            })
            oldModel.widgets[oldWidget.id] = oldWidget;


            // call responsiveLayout
            const responsiveLayouter = new ResponsiveLayout(1)
            responsiveLayouter.initSelection(oldModel, resizeModel, resizeModel.children, true, true, false)

            // hackinto the treeModel and update all the props of the container
            const treeWidget = responsiveLayouter.findWidget(widget.id)
            if (!treeWidget) {
                this.logger.error("updateLayoutContainerChange", "No treeWidget found for " + widget.id);
                return
            }
            treeWidget.props = lang.clone(widget.props);
            treeWidget.style = lang.clone(widget.style);

            const newPositions = ResponsiveUtil.getResponsiveResizePositions(widget, widget, childrenIDs, responsiveLayouter)

            let errorCount = 0;
            for (let id in newPositions) {
                const pos = newPositions[id];
                const widget = this.model.widgets[id];
                // check here that this is a valid change, e.g. if columsn are redduced or so
                if (widget) {
                    widget.modified = new Date().getTime()
                    if (!isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.w) && !isNaN(pos.h)) {
                        widget.x = pos.x;
                        widget.y = pos.y;
                        widget.w = pos.w
                        widget.h = pos.h;
                    } else {
                        errorCount++
                    }
                } else {
                    console.warn('updateMultiWidgetSizeResponsive() > no widget', id)
                }
            }

            if (errorCount > 0) {
                this.showError("Not all elements could be resized.")
            }

            this.render();
            return newPositions
        }
    }

    gridPropsHaveChanged(widget, oldWidget) {
        return widget.props.columns != oldWidget.props.columns ||
            widget.props.columnGap != oldWidget.props.columnGap ||
            widget.style.paddingLeft != oldWidget.style.paddingLeft ||
            widget.style.paddingRight != oldWidget.style.paddingRight ||
            widget.style.borderLeftWidth != oldWidget.style.borderLeftWidth ||
            widget.style.borderRightWidth != oldWidget.style.borderRightWidth ||
            this.arrayPropHasChanged(widget.props.columnWidths, oldWidget.props.columnWidths) ||

            widget.props.rows != oldWidget.props.rows ||
            widget.props.rowGap != oldWidget.props.rowGap ||
            widget.style.paddingTop != oldWidget.style.paddingTop ||
            widget.style.paddingBottom != oldWidget.style.paddingBottom ||
            widget.style.borderBottomWidth != oldWidget.style.borderBottomWidth ||
            widget.style.borderTopWidth != oldWidget.style.borderTopWidth ||
            this.arrayPropHasChanged(widget.props.rowHeights, oldWidget.props.rowHeights)
    }

    flexChildPropsHaveChanged(props) {
        return !!(props && props.resize)
    }

    arrayPropHasChanged(a, b) {
        return (a || []).join(',') !== (b || []).join(',')
    }


    /**
     * A drag and drop moved widgets out of the container "start" and / or
     * into the container "end": both are laid out again. The moved widgets
     * belong to "end", even when the geometry says otherwise (e.g. the
     * dropped widget encloses a sibling after snapping).
     */
    updateLayoutContainers(layoutContainerChange, movedIds) {
        if (!layoutContainerChange || (!layoutContainerChange.start && !layoutContainerChange.end)) {
            this.logger.log(4, "updateLayoutContainers", "exit > NO CHANGE");
            return false
        }
        this.logger.log(1, "updateLayoutContainers", "enter > ", layoutContainerChange, movedIds);

        const ids = movedIds || []
        const startId = layoutContainerChange.start && layoutContainerChange.start.id
        const endId = layoutContainerChange.end && layoutContainerChange.end.id

        this.updateModelIndexes(this.model)

        const flexIds = []
        const laidOut = new Set()
        ;[endId, startId].filter(Boolean).forEach(id => {
            const container = this.model.widgets[id]
            if (!container || laidOut.has(id)) {
                return
            }
            laidOut.add(id)
            if (container.type === 'FlexContainer') {
                flexIds.push(id)
            } else {
                // a GridContainer: the moved widgets only belong to the one they were dropped in
                const isEnd = id === endId
                ResponsiveUtil.layoutContainer(this.model, id, [], isEnd ? ids : [], isEnd, this.treeIndex)
            }
        })

        if (flexIds.length > 0) {
            const tree = new FlexTree(this.treeIndex)
            if (endId && flexIds.indexOf(endId) >= 0) {
                this.reparentMovedWidgets(tree, endId, ids)
            }
            this.runFlexLayout(tree, flexIds, true)
        }

        return true
    }

    /**
     * The moved widgets become direct children of the container. Only the
     * outermost ones: a widget moved together with the box it is in stays in
     * that box. A widget in a group brings its group along, the group is the
     * item of the container. And a sibling that the moved widget happens to
     * enclose now is not its child, it stays in the container.
     */
    reparentMovedWidgets(tree, containerId, movedIds) {
        const moved = new Set(movedIds)
        const roots = movedIds.filter(id => {
            const widget = this.model.widgets[id]
            if (!widget || id === containerId) {
                return false
            }
            return !movedIds.some(otherId => {
                const other = this.model.widgets[otherId]
                return otherId !== id && other && ModelGeom.isFullContained(other, widget)
            })
        })

        roots.forEach(id => {
            const node = getOutermostGroup(this.model, id) || id
            if (node !== containerId && !tree.isAncestor(node, containerId)) {
                tree.setParent(node, containerId)
            }
            tree.getChildren(node).slice().forEach(childId => {
                const isMember = getOutermostGroup(this.model, childId) === node
                if (this.model.widgets[childId] && !moved.has(childId) && !isMember) {
                    tree.setParent(childId, containerId)
                }
            })
        })
    }

    layoutContainer(id, excludeIds = [], movedIds = [], isEnd=false) {
        this.logger.log(1, "layoutContainer", "enter > " + id, excludeIds, movedIds, isEnd, this.treeIndex)
        const widget = this.model.widgets[id]
        if (widget && widget.type === 'FlexContainer') {
            this.updateModelIndexes(this.model)
            const tree = new FlexTree(this.treeIndex)
            excludeIds.forEach(childId => {
                if (tree.getParent(childId) === id) {
                    tree.setParent(childId, tree.getParent(id))
                }
            })
            if (movedIds.length > 0) {
                this.reparentMovedWidgets(tree, id, movedIds)
            }
            return this.runFlexLayout(tree, [id], true)
        }
        return ResponsiveUtil.layoutContainer(this.model, id, excludeIds, movedIds, isEnd, this.treeIndex)
    }

    /**
     * Layout the FlexContainers affected by a change of an area: the ones that
     * overlap it, and the ones these are in when they hug their content.
     *
     * params.pos       - the changed area
     * params.widget    - the changed widget, used as the area
     * params.positions - list of pos objects; the union of all of them is used as the area
     * params.screenId  - use this screen's own box as the area
     * none of the above - no area restriction, layout every FlexContainer in the model
     */
    updateScreenLayout(params = {}) {
        const { screenId, pos, positions, widget } = params;

        let boundingBox = null;
        if (pos) {
            boundingBox = pos
        } else if (widget) {
            boundingBox = widget
        } else if (positions && positions.length > 0) {
            boundingBox = this.getBoundingBoxByBoxes(positions)
        } else if (screenId) {
            boundingBox = this.model.screens[screenId]
        }
        this.logger.log(1, "updateScreenLayout", "bbox", boundingBox)

        const flexContainerIds = Object.values(this.model.widgets)
            .filter(w => w.type === "FlexContainer")
            .filter(w => !boundingBox || overlaps(w, boundingBox))
            .map(w => w.id)

        if (flexContainerIds.length === 0) {
            return {}
        }

        this.updateModelIndexes(this.model)
        const allPositions = this.runFlexLayout(new FlexTree(this.treeIndex), flexContainerIds, true)

        this.onModelChanged(Object.keys(allPositions).map(id => {
            return { type: 'widget', action: "change", "prop": "position", id: id }
        }))

        return allPositions
    }

    /**
     * Called by commitModelChange() for every change: lays out the
     * FlexContainers the changed widgets are in (and the containers these
     * are in, as long as they hug their content), like Figma's auto layout
     * reacts to every change of its content: a longer text, a bigger font, a
     * resized, added or removed child, a new gap or padding.
     *
     * Runs inside the model change, so the undo of the change also restores
     * the layout.
     */
    relayoutFlexContainers() {
        if (!this.model || !this.model.widgets) {
            this._flexLaidOut = null
            return
        }
        const changedIds = new Set()
        const removedIds = []
        ;(this._modelChanges || []).forEach(change => {
            if (change && change.type === 'widget' && change.id) {
                if (this.model.widgets[change.id]) {
                    changedIds.add(change.id)
                } else {
                    removedIds.push(change.id)
                }
            }
        })
        const hugIds = Array.from(changedIds).filter(id => isHugging(this.model.widgets[id]))
        const touchesFlex = this.touchesFlexContainer(changedIds, removedIds)
        if (!touchesFlex && hugIds.length === 0) {
            this._flexLaidOut = null
            return
        }

        try {
            const tree = new FlexTree(new TreeIndex(this.model))
            keepParents(tree, this.model, this.oldModel, Array.from(changedIds))

            const layout = new FlexLayout(this.model, tree)
            const containerIds = layout.findContainers(Array.from(changedIds))
            removedIds.forEach(id => {
                const old = this.oldModel && this.oldModel.widgets && this.oldModel.widgets[id]
                const container = old && findFlexContainerAt(this.model, old)
                if (container) {
                    containerIds.push(...layout.findContainers([container.id]))
                }
            })

            const done = this._flexLaidOut || new Set()
            const todo = containerIds.filter(id => !done.has(id))
            if (todo.length > 0 || hugIds.length > 0) {
                this.runFlexLayout(tree, todo, false, hugIds)
            }
        } catch (e) {
            this.logger.error("relayoutFlexContainers", "Could not layout", e);
            this.logger.sendError(e)
        }
        this._flexLaidOut = null
    }

    /**
     * Cheap check before the tree is built: does a changed widget (where it is
     * now or where it was before) overlap a FlexContainer, or is it one?
     * Most changes on the canvas have nothing to do with one.
     */
    touchesFlexContainer(changedIds, removedIds) {
        const containers = Object.values(this.model.widgets).filter(w => w.type === 'FlexContainer')
        if (containers.length === 0) {
            return false
        }
        const oldWidgets = (this.oldModel && this.oldModel.widgets) || {}
        const boxes = []
        changedIds.forEach(id => {
            boxes.push(this.model.widgets[id])
            if (oldWidgets[id]) {
                boxes.push(oldWidgets[id])
            }
        })
        removedIds.forEach(id => {
            if (oldWidgets[id]) {
                boxes.push(oldWidgets[id])
            }
        })
        return boxes.some(box => box.type === 'FlexContainer' || containers.some(c => overlaps(c, box)))
    }

    /**
     * Lays out the containers with FlexLayout and writes the new boxes into
     * the model.
     *
     * @param {boolean} [remember] the containers are laid out already for
     *   this change, relayoutFlexContainers() skips them
     * @param {Array<string>} [hugIds] texts that hug their content, they take
     *   their size first (see FlexLayout.hugWidgets())
     * @returns {Object<string, {x, y, w, h}>} the changed boxes
     */
    runFlexLayout(tree, containerIds, remember = false, hugIds = []) {
        const renderFactory = this._canvas && this._canvas.renderFactory
        const measure = new FlexTextMeasure(this.model, renderFactory ? renderFactory.constructor : null)
        let positions = {}
        try {
            const layout = new FlexLayout(this.model, tree, {
                measureText: (widget, width) => measure.measure(widget, width)
            })
            layout.hugWidgets(hugIds)
            const containers = layout.findContainers(containerIds)
            positions = layout.run(containers)
            if (remember) {
                this._flexLaidOut = this._flexLaidOut || new Set()
                containers.forEach(id => this._flexLaidOut.add(id))
            }
        } finally {
            measure.cleanUp()
        }

        const now = new Date().getTime()
        const ids = Object.keys(positions)
        ids.forEach(id => {
            const widget = this.model.widgets[id]
            const pos = positions[id]
            if (widget && !isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.w) && !isNaN(pos.h)) {
                widget.x = pos.x
                widget.y = pos.y
                widget.w = pos.w
                widget.h = pos.h
                widget.modified = now
            }
        })
        if (ids.length > 0 && this._modelRenderJobs) {
            // the sizes changed as well, a position update is not enough
            delete this._modelRenderJobs['position']
            if (this._modelRenderJobs['all'] === undefined) {
                this._modelRenderJobs['all'] = false
            }
        }
        return positions
    }

    /**
     * Whether the width of a widget comes from the auto layout: it hugs or
     * fills, or it is an item of a FlexContainer. A new text must not set
     * its width then (updateWidgetLabel() does it for a free text), or it
     * sticks out of its container before the layout runs.
     */
    isSizedByFlexLayout(widget) {
        const resize = widget && widget.props && widget.props.resize
        if (resize && (resize.layoutWidth === 'hug' || resize.layoutWidth === 'fill')) {
            return true
        }
        const parent = widget && this.getTreeParent(widget.id)
        return !!(parent && parent.type === 'FlexContainer')
    }

    /**
     * Like in Figma, a widget the user resizes by hand gets the fixed sizing
     * on that axis, otherwise the layout would take the size right back.
     */
    fixFlexSizingOnResize(widget, pos) {
        if (!widget || !pos) {
            return
        }
        const resizedW = pos.w !== undefined && Math.round(pos.w) !== Math.round(widget.w)
        const resizedH = pos.h !== undefined && Math.round(pos.h) !== Math.round(widget.h)
        if (!resizedW && !resizedH) {
            return
        }
        // the sizing in effect, also the one from before the sizings existed (grow, stretch)
        const parent = this.getTreeParent(widget.id)
        const parentConfig = parent && parent.type === 'FlexContainer' ? FlexMath.getContainerConfig(parent.style) : null
        const changed = {}
        if (resizedW && FlexMath.getSizing(widget, 'h', parentConfig) !== FlexMath.SIZING.FIXED) {
            changed.layoutWidth = FlexMath.SIZING.FIXED
        }
        if (resizedH && FlexMath.getSizing(widget, 'v', parentConfig) !== FlexMath.SIZING.FIXED) {
            changed.layoutHeight = FlexMath.SIZING.FIXED
        }
        if (Object.keys(changed).length > 0) {
            widget.props = widget.props || {}
            widget.props.resize = Object.assign({}, widget.props.resize, changed)
        }
    }

}

function isHugging(widget) {
    const resize = widget && widget.props && widget.props.resize
    return !!(resize && (resize.layoutWidth === 'hug' || resize.layoutHeight === 'hug'))
}

function overlaps(a, b) {
    return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
}

/**
 * The topmost FlexContainer that contains the box, e.g. the one a removed
 * widget was in.
 */
function findFlexContainerAt(model, box, tolerance = 1) {
    let result = null
    Object.values(model.widgets).forEach(w => {
        if (w.type === 'FlexContainer' && w.id !== box.id &&
            box.x >= w.x - tolerance && box.y >= w.y - tolerance &&
            box.x + box.w <= w.x + w.w + tolerance && box.y + box.h <= w.y + w.h + tolerance &&
            (!result || (w.z || 0) > (result.z || 0))) {
            result = w
        }
    })
    return result
}
