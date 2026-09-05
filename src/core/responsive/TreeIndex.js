import Logger from "../Logger"
import * as Util from "./ExportUtil"
import * as Quant2Flat from "./Quant2Flat"

/**
 * Builds a flat Map<ChildId, ParentId> for a model, i.e. for every widget
 * we determine its parent, either another widget, a group or the screen
 * it lives on. It also keeps the reverse Map<ParentId, ChildId[]> of direct
 * children.
 *
 * This uses the same logic as ResponsiveLayout.initSelection():
 *
 * 1) Quant2Flat.transform() adds virtual "Box" widgets for groups, so that
 *    groups (and nested groups) show up as regular parents.
 * 2) Flat2Tree.transformScreenToTree()'s parent detection is then used to
 *    determine, for every widget (real or virtual group wrapper), its
 *    direct parent.
 *
 * Instead of building a nested tree, this just records the parent id of
 * each widget/group in a Map.
 */
export default class TreeIndex {

    constructor(model) { 
        this.build(model)
    }

    update(model) {
        this.build(model)
    }

    build(model) {
        this.model = model
        this.parents = new Map()
        this.children = new Map()
        let start = new Date().getTime()
        const flatModel = Quant2Flat.transform(model)
        for (let screenId in flatModel.screens) {
            const screen = flatModel.screens[screenId]
            this.buildScreen(screen, flatModel)
        }
        let end = new Date().getTime()
        Logger.log(-1, 'TreeIndex.build() > took : ', (end - start))
        return this.parents
    }

    buildScreen(screen, model) {
        const widgets = Util.getOrderedWidgets(this.getWidgets(screen, model))

        /**
         * As we iterate the widgets in z-order, we keep track of the widgets
         * that could be a parent. We unshift, so that widgets added last
         * (i.e. rendered on top) are checked first.
         */
        const potentialParents = []

        widgets.forEach((widget) => {
            const parent = this.findParent(potentialParents, widget, model)
            if (parent && Util.canBeChild(widget, parent)) {
                this.setParent(widget.id, parent.id)
            } else {
                this.setParent(widget.id, screen.id)
            }

            if (Util.canHaveChildren(widget)) {
                potentialParents.unshift(widget)
            }
        })
    }

    setParent(childId, parentId) {
        this.parents.set(childId, parentId)
        if (!this.children.has(parentId)) {
            this.children.set(parentId, [])
        }
        this.children.get(parentId).push(childId)
    }

    /**
     * Find the parent for a widget. First we check if the widget is visually
     * contained in one of the potential parents. If not, we fall back to the
     * explicit parentId, e.g. set by a Figma import.
     */
    findParent(potentialParents, widget, model) {
        for (let i = 0; i < potentialParents.length; i++) {
            const parent = potentialParents[i]
            if (Util.isContainedInBox(widget, parent, 1)) {
                return parent
            }
        }
        if (widget.parentId) {
            return model.widgets[widget.parentId]
        }
        return null
    }

    getWidgets(screen, model) {
        return screen.children
            .map((id) => model.widgets[id])
            .filter((widget) => widget !== undefined)
    }

    getParent(id) {
        return this.parents.get(id)
    }
    
    getParentWidget(id, step=0) {
        const parentID = this.parents.get(id)
        if (parentID) {
            if (this.model.groups[parentID] && step < 100) {
                return this.getParentWidget(parentID, step+1)
            }
            return this.model.widgets[parentID]
        }
    }


    hasParent(id) {
        return this.parents.has(id)
    }

    /**
     * Returns the direct children of a widget/group/screen id, i.e. not the
     * children of children. Returns an empty array if there are none.
     */
    getChildren(id) {
        return this.children.get(id) || []
    }

    /**
     * Groups do not get their own entry in the model. Instead
     * Quant2Flat.transform() creates a virtual widget with this id to
     * represent the group in the tree. Use it to look up the parent of a
     * group, e.g. index.getParent(index.getGroupWrapperId(groupId)).
     */
    getGroupWrapperId(groupId) {
        return `${groupId}`
    }
}
