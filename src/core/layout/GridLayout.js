import CoreUtil from '../CoreUtil'
import Logger from '../Logger'
import * as Util from './LayoutUtil'

export default class GridLayout {

    constructor (selection, app) {

        const widgets = this.getWidgets(selection, app)
        CoreUtil.sortWidgetList(widgets)
     
        const widgetsWidthGroups = this.addGroupWrapper(widgets, app)
        this.tree = this.buildTree(widgetsWidthGroups, app)
        


    }

    addGroupWrapper(widgets, model) {
        const createdGroups = {}
        const order = []
        widgets.forEach((widget) => {
            let group = Util.getGroup(widget.id, model)
            if (group) {
                this.createGroupCntr(group, model, createdGroups, order)
            }
            order.push(widget)
        })

        /**
         * Set new z to ensure that the groups are before the
         */
        order.forEach((widget, i) => {
            widget.z = i
        })
        CoreUtil.sortWidgetList(order)
        return order
    }

    createGroupCntr(group, model, createdGroups, order) {
        /**
         * Create new group container only if needed
         */
        if (!createdGroups[group.id]) {
            Logger.log(2, "Quant2Flat.createGroupCntr() > create ", group.name)

            /**
             * 1) check if we need to create parent group. If so we go up hierachy
             */
            const parentGroup = Util.getParentGroup(group.id, model)
            if (parentGroup) {
                this.createGroupCntr(parentGroup, model, createdGroups, order, screen)
            }

            /**
             * 2) Now create the group cntr
             */
            const allGroupChildren = Util.getAllGroupChildren(group, model)
            const boundingBox = Util.getBoundingBoxByIds(allGroupChildren, model)
            const groupCntr = {
                id: `gc${group.id}`,
                name: group.name,
                groupId: group.id,
                isGroup: true,
                type: "Box",
                x: boundingBox.x,
                y: boundingBox.y,
                w: boundingBox.w,
                h: boundingBox.h,
                style: group.style ? group.style : {},
                props: {
                    resize: group.props && group.props.resize ? group.props.resize : {
                        right: false,
                        up: false,
                        left: false,
                        down: false,
                        fixedHorizontal: false,
                        fixedVertical: false,
                    }
                },
            }

            /**
             * For inhereted groups make sure that the inherited flag
             * is set, other wise the sortWidgets methods will put
             * it behind it's children and nesting does not work!
             */
            if (group.inherited) {
                groupCntr.inherited = group.inherited
            }

            /**
             * Add it to the model and link stuff properly
             */
            model.widgets[groupCntr.id] = groupCntr
            createdGroups[group.id] = groupCntr

            /**
             * Attention, this is imporant! We add the groupCntr here.
             * After this method, the widget will be added! By doing this,
             * we ensure the right order.
             */
            order.push(groupCntr)
        }
    }

    buildTree(widgets, app) {

        const result = {
            name: 'Root',
            children: []
        }

        /**
         *  now build child parent relations
         */
        const parentWidgets = []
        const elementsById = {}
        widgets.forEach((widget) => {

            let element = Util.clone(widget)
            element._x = widget.x
            element._y = widget.y
            element.children = []

            let parentWidget = this.getParentWidget(parentWidgets, element, app)
            if (parentWidget && Util.isContainerElement(parentWidget)) {
                element.x = widget.x - parentWidget.x
                element.y = widget.y - parentWidget.y
                element.parent = parentWidget
                elementsById[parentWidget.id].children.push(element)
            } else {
                element.x = widget.x - screen.x
                element.y = widget.y - screen.y
                element.parent = null
                result.children.push(element)
            }

            /**
             * Save the widget, so we can check in the next
             * iteation if this is a parent or not! Only use
             * widgets that can have children
             */
            if (Util.isContainerElement(widget)) {
                parentWidgets.unshift(widget)
            }
            elementsById[element.id] = element
        })

        return result
    }

    getWidgets (selection, app) {
        return Object.values(app.widgets).filter(w => {
            return selection.indexOf(w.id) >= 0
        })
    }

    getParentWidget(potentialParents, element, model) {
        /**
         * First see if the widget is nested in a widget that was rendered before
         */
        for (let p = 0; p < potentialParents.length; p++) {
            let parent = potentialParents[p]
            if (Util.isContainedInBox(element, parent)) {
                return parent
            }
        }
        /**
         * If not, check of the parent was defined otherwise, e.g. figma.
         */
        if (element.parentId) {
            let parent = model.widgets[element.parentId]
            if (parent) {
                return parent
            }
        }
    }



   

    resize (pos) {

    }
}