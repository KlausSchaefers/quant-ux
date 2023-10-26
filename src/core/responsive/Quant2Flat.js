import * as Util from "./ExportUtil"
import Logger from '../Logger'

export function transform(app) {
	Logger.log(3, "Quant2Flat.transform () > enter")

	let model = Util.clone(app)

	/**
	 * Add here virtual elements for the groups
	 */
	for (let screenID in model.screens) {
		const screen = model.screens[screenID]
		model = addGroupWrapper(screen, model)
	}

	return model
}


function addGroupWrapper(screen, model) {
	Logger.log(4, "Quant2Flat.addGroupWrapper() > create ", screen.name)
	const widgets = Util.getOrderedWidgets(getWidgets(screen, model))
	const createdGroups = {}
	const order = []
	widgets.forEach((widget) => {
		const group = Util.getGroup(widget.id, model)		
		if (group) {
			if (!hasSameChildren(screen, group, model)) {
				createGroupCntr(group, model, createdGroups, order, screen)
			}
		}
		order.push(widget)
	})

	/**
	 * Set new z to ensure that the groups are before the
	 */
	order.forEach((widget, i) => {
		widget.z = i
	})
	return model
}

function hasSameChildren(screen, group, model) {
	let allGroupChildren = Util.getAllGroupChildren(group, model)
	return arraysEqual(screen.children, allGroupChildren)
}
function arraysEqual(arr1, arr2) {
	if (arr1.length !== arr2.length) return false;
	for (let i = arr1.length; i--; ) {
		if (arr1[i] !== arr2[i]) return false;
	}
	return true;
}

function createGroupCntr(group, model, createdGroups, order, screen) {
	/**
	 * Create new group container only if needed
	 */
	if (!createdGroups[group.id]) {
		Logger.log(2, "Quant2Flat.createGroupCntr() > create ", group.name)

		/**
		 * 1) check if we need to create parent group. If so we go up hierachy
		 */
		let parentGroup = Util.getParentGroup(group.id, model)
		if (parentGroup) {
			createGroupCntr(parentGroup, model, createdGroups, order, screen)
		}

		/**
		 * 2) Now create the group cntr
		 */
		let allGroupChildren = Util.getAllGroupChildren(group, model)

		let boundingBox = Util.getBoundingBoxByIds(allGroupChildren, model)

		let groupCntr = {
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
		screen.children.push(groupCntr.id)
		createdGroups[group.id] = groupCntr

		/**
		 * Attention, this is imporant! We add the groupCntr here.
		 * After this method, the widget will be added! By doing this,
		 * we ensure the right order.
		 */
		order.push(groupCntr)
	}
}

function getWidgets(screen, model) {
	let widgets = []
	for (let i = 0; i < screen.children.length; i++) {
		let id = screen.children[i]
		let widget = model.widgets[id]
		widgets.push(widget)
	}
	return widgets
}
