import * as FlexMath from './FlexMath'
import { SIZING } from './FlexMath'
import { canHaveChildren } from './ExportUtil'

/**
 * The widget types whose content is a text (drawn as one label), so they can
 * hug it, when they have one.
 */
export const TEXT_TYPES = new Set(['Label', 'Button', 'WebLink', 'ToggleButton', 'Box'])

const FLEX = 'FlexContainer'

/**
 * The parent / children relation FlexLayout works on. It starts as a copy of
 * a TreeIndex (the geometric containment of the model, with groups as nodes
 * of their own) and can be corrected where the geometry is wrong for the
 * layout: a child that just grew out of its container still belongs to it
 * (see keepParents()), a widget dropped into a container belongs to it
 * even if it encloses a sibling (see Responsive.updateLayoutContainers()).
 */
export class FlexTree {

    constructor(treeIndex) {
        this.parents = new Map(treeIndex.parents)
        this.children = new Map()
        treeIndex.children.forEach((ids, id) => this.children.set(id, ids.slice()))
    }

    getParent(id) {
        return this.parents.get(id)
    }

    getChildren(id) {
        return this.children.get(id) || []
    }

    setParent(childId, parentId) {
        const old = this.parents.get(childId)
        if (old === parentId) {
            return
        }
        if (old && this.children.has(old)) {
            this.children.set(old, this.children.get(old).filter(id => id !== childId))
        }
        this.parents.set(childId, parentId)
        if (!this.children.has(parentId)) {
            this.children.set(parentId, [])
        }
        this.children.get(parentId).push(childId)
    }

    isAncestor(ancestorId, id) {
        let current = this.parents.get(id)
        let steps = 0
        while (current && steps < 1000) {
            if (current === ancestorId) {
                return true
            }
            current = this.parents.get(current)
            steps++
        }
        return false
    }

    getDepth(id) {
        let depth = 0
        let current = this.parents.get(id)
        while (current && depth < 1000) {
            depth++
            current = this.parents.get(current)
        }
        return depth
    }
}

/**
 * Lays out FlexContainers like Figma's auto layout (see FlexMath): nested
 * containers, groups as items, texts and containers that hug their content
 * and items that fill the free space.
 *
 * It works on a copy of the boxes and returns the ones that changed, the
 * model itself is not touched.
 *
 * @param {object} model the model (only read)
 * @param {FlexTree} tree
 * @param {object} [options]
 * @param {function} [options.measureText] (widget, width) => {w, h} the size
 *   of the text of a widget as the canvas draws it, at the given outer width
 *   of the widget, or on one line when width is null. Returns null when it
 *   cannot measure; the widget then keeps its size.
 */
export default class FlexLayout {

    constructor(model, tree, options = {}) {
        this.model = model
        this.tree = tree
        this.measureText = options.measureText
        this.boxes = new Map()
        this.textCache = new Map()
        // the content sizes of the containers in one layout pass, see getHugWidth()
        this.hugCache = new Map()
    }

    /**
     * Lays out the given containers, the innermost first: a container that
     * hugs its content needs the final size of the containers in it. A
     * container in another one is laid out again by its parent, so the
     * result is the same as laying out only the outermost one, but a
     * container inside a group or a plain box (which its parent only moves)
     * is laid out as well.
     *
     * @returns {Object<string, {x, y, w, h}>} the changed widget boxes
     */
    run(containerIds) {
        const ids = Array.from(new Set(containerIds)).filter(id => this.isFlex(id))
        const set = new Set(ids)
        // an item of another container of the list is laid out by that one
        const roots = ids.filter(id => !set.has(this.tree.getParent(id)))
        roots.sort((a, b) => this.tree.getDepth(b) - this.tree.getDepth(a))
        roots.forEach(id => this.layoutRoot(id))
        return this.getChanges()
    }

    /**
     * A text that hugs its content and is not in a FlexContainer takes its
     * size right away, like a text with auto width or height in Figma. Its
     * top left corner stays. (In a container its parent lays it out.)
     */
    hugWidgets(ids) {
        ids.forEach(id => {
            if (!this.isText(id) || this.isFlex(this.tree.getParent(id))) {
                return
            }
            const box = this.getBox(id)
            const hugW = this.getSizing(id, 'h') === SIZING.HUG
            const hugH = this.getSizing(id, 'v') === SIZING.HUG
            if (!hugW && !hugH) {
                return
            }
            const limits = this.getLimits(id)
            const w = hugW ? FlexMath.clamp(this.getHugWidth(id), limits.minW, limits.maxW) : box.w
            const h = hugH ? FlexMath.clamp(this.getHugHeight(id, w), limits.minH, limits.maxH) : box.h
            this.setBox(id, { x: box.x, y: box.y, w, h })
        })
        return this.getChanges()
    }

    /**
     * The containers to lay out after the given widgets changed: for every
     * widget the container it is in, and as long as that one can change its
     * own size by it (it hugs its content), the container that one is in,
     * and so on. A group grows with its members, so the chain goes on
     * through it. A plain box keeps its size, the chain ends there.
     */
    findContainers(changedIds) {
        const result = new Set()
        changedIds.forEach(id => {
            if (!this.model.widgets[id] && !this.isGroup(id)) {
                return
            }
            let node = id
            if (this.isFlex(node)) {
                result.add(node)
            }
            let steps = 0
            while (steps++ < 1000 && this.canChangeSize(node, id)) {
                const parent = this.tree.getParent(node)
                if (!parent) {
                    break
                }
                if (this.isFlex(parent)) {
                    result.add(parent)
                } else if (!this.isGroup(parent)) {
                    break
                }
                node = parent
            }
        })
        return Array.from(result)
    }

    canChangeSize(node, changedId) {
        if (node === changedId || this.isGroup(node)) {
            return true
        }
        if (this.isFlex(node)) {
            return this.getSizing(node, 'h') === SIZING.HUG || this.getSizing(node, 'v') === SIZING.HUG
        }
        return false
    }

    getChanges() {
        const changes = {}
        this.boxes.forEach((box, id) => {
            const widget = this.model.widgets[id]
            if (widget && (widget.x !== box.x || widget.y !== box.y || widget.w !== box.w || widget.h !== box.h)) {
                changes[id] = { x: box.x, y: box.y, w: box.w, h: box.h }
            }
        })
        return changes
    }

    /**********************************************************************
     * Layout
     **********************************************************************/

    layoutRoot(id) {
        // a container laid out before changed the content sizes
        this.hugCache.clear()
        const box = this.getBox(id)
        if (!box) {
            return
        }
        const size = this.getOwnSize(id, box)
        this.layoutContainer(id, { x: box.x, y: box.y, w: size.w, h: size.h })
    }

    /**
     * The size of a container laid out on its own: its hug size on a hug
     * axis, its current size otherwise (a fill size is given by its parent).
     */
    getOwnSize(id, box) {
        const limits = this.getLimits(id)
        const w = this.getSizing(id, 'h') === SIZING.HUG ? FlexMath.clamp(this.getHugWidth(id), limits.minW, limits.maxW) : box.w
        const h = this.getSizing(id, 'v') === SIZING.HUG ? FlexMath.clamp(this.getHugHeight(id, w), limits.minH, limits.maxH) : box.h
        return { w, h }
    }

    getLimits(id) {
        const widget = this.model.widgets[id]
        return widget ? FlexMath.getLimits(widget) : {}
    }

    layoutContainer(id, frame) {
        const old = this.getBox(id)
        // what does not take part in the layout moves with the container
        const dx = frame.x - old.x
        const dy = frame.y - old.y
        if (dx !== 0 || dy !== 0) {
            this.getAbsoluteChildren(id).forEach(childId => this.moveNode(childId, dx, dy))
        }
        this.setBox(id, frame)

        const config = this.getConfig(id)
        const items = this.getItems(id, config)
        const boxes = FlexMath.layoutItems(config, frame, items)
        items.forEach(item => {
            if (boxes[item.id]) {
                this.applyItem(item.id, boxes[item.id])
            }
        })
    }

    /**
     * An item gets its new box. A container lays its own items out in it,
     * anything else moves with its content: the content keeps its place
     * relative to the top left corner, like in a Figma frame without auto
     * layout.
     */
    applyItem(id, box) {
        if (this.isFlex(id)) {
            this.layoutContainer(id, box)
            return
        }
        const old = this.getBox(id)
        const dx = box.x - old.x
        const dy = box.y - old.y
        if (this.model.widgets[id]) {
            this.setBox(id, box)
        }
        if (dx !== 0 || dy !== 0) {
            this.getDescendants(id).forEach(childId => this.translate(childId, dx, dy))
        }
    }

    moveNode(id, dx, dy) {
        if (this.model.widgets[id]) {
            this.translate(id, dx, dy)
        }
        this.getDescendants(id).forEach(childId => this.translate(childId, dx, dy))
    }

    translate(id, dx, dy) {
        const box = this.getBox(id)
        if (box) {
            this.setBox(id, { x: box.x + dx, y: box.y + dy, w: box.w, h: box.h })
        }
    }

    /**********************************************************************
     * Items
     **********************************************************************/

    getConfig(id) {
        const widget = this.model.widgets[id]
        return FlexMath.getContainerConfig(widget && widget.style)
    }

    isAbsolute(id) {
        const node = this.model.widgets[id] || (this.model.groups && this.model.groups[id])
        return !!(node && node.props && node.props.resize && node.props.resize.absolute)
    }

    getAbsoluteChildren(id) {
        return this.tree.getChildren(id).filter(childId => this.isNode(childId) && this.isAbsolute(childId))
    }

    getItems(id, config) {
        const items = this.tree.getChildren(id)
            .filter(childId => this.isNode(childId) && !this.isAbsolute(childId))
            .map(childId => {
                const box = this.getBox(childId)
                if (!box) {
                    return null
                }
                return {
                    ...this.getLimits(childId),
                    id: childId,
                    x: box.x,
                    y: box.y,
                    w: box.w,
                    h: box.h,
                    sizingH: this.getSizing(childId, 'h', config),
                    sizingV: this.getSizing(childId, 'v', config),
                    hugW: () => this.getHugWidth(childId),
                    hugH: (width) => this.getHugHeight(childId, width)
                }
            })
            .filter(Boolean)
        return FlexMath.sortItems(config, items)
    }

    getSizing(id, axis, parentConfig) {
        const widget = this.model.widgets[id]
        if (!widget) {
            // a group is as big as its members
            return SIZING.FIXED
        }
        if (parentConfig === undefined) {
            const parent = this.tree.getParent(id)
            parentConfig = this.isFlex(parent) ? this.getConfig(parent) : null
        }
        return FlexMath.getSizing(widget, axis, parentConfig, this.canHug(id))
    }

    canHug(id) {
        return this.isFlex(id) || this.isText(id)
    }

    isText(id) {
        const widget = this.model.widgets[id]
        return !!(widget && TEXT_TYPES.has(widget.type) && widget.props && widget.props.label)
    }

    /**********************************************************************
     * Hug sizes
     **********************************************************************/

    /**
     * The content size of a container needs the ones of its items, and
     * FlexMath asks for them several times (widths, heights, the content
     * size): without the cache nested containers cost exponential time.
     * Within one layout pass the content of a container does not change.
     */
    cachedHug(key, compute) {
        if (!this.hugCache.has(key)) {
            this.hugCache.set(key, compute())
        }
        return this.hugCache.get(key)
    }

    getHugWidth(id) {
        const box = this.getBox(id)
        if (this.isFlex(id)) {
            return this.cachedHug('w:' + id, () => {
                const config = this.getConfig(id)
                return FlexMath.getContentSize(config, this.getItems(id, config)).w
            })
        }
        if (this.isText(id)) {
            const text = this.getTextSize(id, null)
            if (text) {
                return Math.ceil(text.w + this.getPadding(id, 'h'))
            }
        }
        return box.w
    }

    getHugHeight(id, width) {
        const box = this.getBox(id)
        const w = width !== undefined && width !== null ? width : box.w
        if (this.isFlex(id)) {
            return this.cachedHug('h:' + id + ':' + Math.round(w), () => {
                const config = this.getConfig(id)
                return FlexMath.getContentSize(config, this.getItems(id, config), w).h
            })
        }
        if (this.isText(id)) {
            const text = this.getTextSize(id, w)
            if (text) {
                return Math.ceil(text.h + this.getPadding(id, 'v'))
            }
        }
        return box.h
    }

    getPadding(id, axis) {
        const style = this.model.widgets[id].style || {}
        const n = v => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
        if (axis === 'h') {
            return n(style.paddingLeft) + n(style.paddingRight) + n(style.borderLeftWidth) + n(style.borderRightWidth)
        }
        return n(style.paddingTop) + n(style.paddingBottom) + n(style.borderTopWidth) + n(style.borderBottomWidth)
    }

    getTextSize(id, width) {
        if (!this.measureText) {
            return null
        }
        const key = id + '@' + (width === null ? 'line' : Math.round(width))
        if (!this.textCache.has(key)) {
            let size = null
            try {
                size = this.measureText(this.model.widgets[id], width)
            } catch (e) {
                size = null
            }
            this.textCache.set(key, size && size.w > 0 && size.h > 0 ? size : null)
        }
        return this.textCache.get(key)
    }

    /**********************************************************************
     * Boxes
     **********************************************************************/

    isFlex(id) {
        const widget = id && this.model.widgets[id]
        return !!(widget && widget.type === FLEX)
    }

    isGroup(id) {
        return !!(id && this.model.groups && this.model.groups[id])
    }

    isNode(id) {
        return !!(this.model.widgets[id] || this.isGroup(id))
    }

    /**
     * The widgets under a node in the tree, groups resolved to their
     * members.
     */
    getDescendants(id) {
        const result = []
        const visit = (nodeId, depth) => {
            if (depth > 1000) {
                return
            }
            this.tree.getChildren(nodeId).forEach(childId => {
                if (this.model.widgets[childId]) {
                    result.push(childId)
                }
                visit(childId, depth + 1)
            })
        }
        visit(id, 0)
        return result
    }

    getBox(id) {
        if (this.boxes.has(id)) {
            return this.boxes.get(id)
        }
        const widget = this.model.widgets[id]
        if (widget) {
            return { x: widget.x, y: widget.y, w: widget.w, h: widget.h }
        }
        if (this.isGroup(id)) {
            const members = this.getDescendants(id).map(childId => this.getBox(childId)).filter(Boolean)
            if (members.length === 0) {
                return null
            }
            const x = Math.min(...members.map(b => b.x))
            const y = Math.min(...members.map(b => b.y))
            const right = Math.max(...members.map(b => b.x + b.w))
            const bottom = Math.max(...members.map(b => b.y + b.h))
            return { x, y, w: right - x, h: bottom - y }
        }
        return null
    }

    setBox(id, box) {
        this.boxes.set(id, { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.w), h: Math.round(box.h) })
    }
}

/**
 * The geometry decides which container a widget is in. A widget that just
 * got bigger than its container (a longer text in a container that hugs
 * it) is not inside it any more, until the layout made the container
 * bigger as well. So for every changed widget that did not move, the
 * container it was in before the change stays its parent.
 *
 * A widget in a group is moved as part of the group, so the outermost group
 * is checked instead.
 *
 * @param {FlexTree} tree changed in place
 * @param {object} model the model after the change
 * @param {object} oldModel the model before the change
 * @param {Array<string>} changedIds
 */
export function keepParents(tree, model, oldModel, changedIds, tolerance = 1) {
    if (!oldModel || !oldModel.widgets) {
        return
    }
    const nodes = new Set()
    changedIds.forEach(id => {
        if (model.widgets[id] && oldModel.widgets[id]) {
            nodes.add(getOutermostGroup(model, id) || id)
        }
    })

    nodes.forEach(node => {
        const oldBox = getNodeBox(oldModel, node)
        const newBox = getNodeBox(model, node)
        if (!oldBox || !newBox) {
            return
        }
        if (Math.abs(oldBox.x - newBox.x) > tolerance || Math.abs(oldBox.y - newBox.y) > tolerance) {
            return
        }
        const members = new Set(getNodeWidgets(model, node))
        const z = Math.min(...Array.from(members).map(id => model.widgets[id].z || 0))
        let parent = null
        Object.values(model.widgets).forEach(w => {
            if (members.has(w.id) || !canHaveChildren(w) || (w.z || 0) >= z) {
                return
            }
            if (tree.isAncestor(node, w.id)) {
                return
            }
            if (isInside(oldBox, w, tolerance) && (!parent || (w.z || 0) > (parent.z || 0))) {
                parent = w
            }
        })
        if (parent && parent.type === FLEX && tree.getParent(node) !== parent.id) {
            tree.setParent(node, parent.id)
        }
    })
}

function isInside(box, parent, tolerance) {
    return box.x >= parent.x - tolerance &&
        box.y >= parent.y - tolerance &&
        box.x + box.w <= parent.x + parent.w + tolerance &&
        box.y + box.h <= parent.y + parent.h + tolerance
}

function getGroupOf(model, id) {
    const groups = model.groups || {}
    for (const groupId in groups) {
        const group = groups[groupId]
        if ((group.children && group.children.indexOf(id) >= 0) || (group.groups && group.groups.indexOf(id) >= 0)) {
            return group
        }
    }
    return null
}

export function getOutermostGroup(model, id) {
    let group = getGroupOf(model, id)
    let result = null
    let steps = 0
    while (group && steps++ < 100) {
        result = group.id
        group = getGroupOf(model, group.id)
    }
    return result
}

function getNodeWidgets(model, id) {
    if (model.widgets[id]) {
        return [id]
    }
    const group = model.groups && model.groups[id]
    if (!group) {
        return []
    }
    const result = (group.children || []).filter(childId => model.widgets[childId])
    ;(group.groups || []).forEach(subId => {
        result.push(...getNodeWidgets(model, subId))
    })
    return result
}

function getNodeBox(model, id) {
    const boxes = getNodeWidgets(model, id).map(childId => model.widgets[childId]).filter(Boolean)
    if (boxes.length === 0) {
        return null
    }
    const x = Math.min(...boxes.map(b => b.x))
    const y = Math.min(...boxes.map(b => b.y))
    return {
        x,
        y,
        w: Math.max(...boxes.map(b => b.x + b.w)) - x,
        h: Math.max(...boxes.map(b => b.y + b.h)) - y
    }
}
