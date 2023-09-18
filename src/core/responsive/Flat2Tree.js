import * as Util from "./ExportUtil"
import Logger from "../Logger"
import * as Grid from "./GridLayouter"
import {Layout} from './Const'
import * as Rows from "./RowLayouter"

var cloneID = 0

/**
 * Inlines some quant-ux stuff
 */
const supportedWidgetTypes = [
	"Button",
	"Box",
	"Label",
	"Container",
	"Icon",
	"Image",
	"CheckBox",
	"RadioBox",
	"RadioBox2",
	"HotSpot",
	"TextBox",
	"Password",
	"TextArea",
	"Repeater",
	"RadioGroup",
	"CheckBoxGroup",
	"ToggleButton",
	"Switch",
	"DropDown",
	"MobileDropDown",
	"Stepper",
	"HSlider",
	"Date",
	"DateDropDown",
	"SegmentButton",
	"Rating",
	"IconToggle",
	"LabeledIconToggle",
	"TypeAheadTextBox",
	"Table",
	"Paging",
	"BarChart",
	"PieChart",
	"MultiRingChart",
	"RingChart",
	"Vector",
	"Timeline",
	"Upload",
	"ChildrenToggle",
	"Camera",
	"UploadPreview",
	"Spinner",
	"DynamicContainer",
	"RichText",
	"Link"
]

const textProperties = ["color", "textDecoration", "textAlign", "fontFamily", "fontSize", "fontStyle", "fontWeight", "letterSpacing", "lineHeight", "lineHeightPX"]

export function transform(model, config) {
	Logger.log(1, "Falt2Tree.transform () > enter", config)

	let result = {
		id: model.id,
		name: model.name,
		templates: model.templates ? Object.values(model.templates) : [],
		warnings: [],
		screens: [],
	}

	/**
	 * IN QUX we want to attach label nodes. In Figma this causes issues. with attachLabels we control for which elements we should use this
	 */
	let nodesWithLabelAttachment = config.css && config.css.attachLabels === true ? ["TextBox", "Password", "TextArea", "Box", "Button", "DropDown"] : ["TextBox", "Password", "TextArea", "DropDown"]

	for (let screenID in model.screens) {
		let screen = model.screens[screenID]

		/**
		 * First we build a hierachical parent child relation.
		 */
		screen = transformScreenToTree(screen, model)

		/**
		 * Add rows and grid if needed
		 */
		screen = layoutTree(screen, config.useRows)

		/**
		 * Now we put the fixed stuff in the fixedChildren list
		 */
		screen = setFixedChildren(screen, model)

		/**
		 * Now we need to layout the shit again, because we have removed the fixed elements.
		 * FIXME: Make the layoutTree method faster that it also works with the fixedChildren
		 */
		if (screen.fixedChildren && screen.fixedChildren.length > 0) {
			Logger.log(1, "Falt2Tree.transform() > fixed elements require double layout")
			screen = layoutTree(screen, model)
		}

		/**
		 * Since 0.5 we will set now the layouts.
		 */

		/**
		 * set screen pos to 0,0
		 */
		screen.children.forEach((c) => {
			c.parent = screen
		})
		screen.x = 0
		screen.y = 0

		attachSingleLabelsInScreen(model, screen, nodesWithLabelAttachment)

		setWidgetTypes(screen)

		setCSSClassNames(screen, screen.name)

		result.screens.push(screen)

	}

	return result
}

function layoutTree(screen, useRows) {
  Logger.log(-1, 'Flat2Tree.layoutTree() > ', useRows)

	/**
	 * We add lines, because for wrapped groups we need the rows!
	 * Attention: In the UI we can not configure this anymore!
	 */
	if (useRows) {
		screen = Rows.addRows(screen)
		screen = Rows.addRowContainer(screen, true)
	}

	/**
	 * First we determine the type of layout
	 */
	addLayoutType(screen, useRows)


	/**
	 * Afterwards we re order the elements
	 */
	fixParents(screen)

	screen = addGrid(screen)
	return screen
}

function addLayoutType (element, useRows) {

	/**
	 * We set here for each element how it should be rendered, if and only if,
	 * the layout has not been set by hand, e.g. in Figma.
	 *
	 * If we set the layout, the options are:
	 * 1) Wrap -> defined in UI. Has priority
	 * 2) Rows -> if the X over laps
	 * 3) Grid -> Default
	 */


	let grow = 0
	if (element.layout && element.layout.grow !== undefined) {
		grow = element.layout.grow
	}

	if (!Util.isLayoutAuto(element)) {

		/**
		 * For Figma Autos, the wrap will be ignored!
		 */
		if (Util.isWrappedContainer(element)) {

			element.layout = {type: Layout.Wrap, grow: grow}
			setOrderInWrapper(element, element.children)

		} else if (Util.hasRowLayout(element) && useRows) {

			element.layout = {type: Layout.Row, grow: grow}
			setOrderInRow(element, element.children, false)

		} else {
			element.layout = {type: Layout.Grid, grow: grow}
		}
	}


	if (element.children) {
		element.children.forEach(child => addLayoutType(child, element))
	}

	return element
}


function addGrid(screen) {
	Grid.addGridToElements(screen)
	return screen
}



/**
 * In a column, elements are rendered top to down
 */
function setOrderInRow (parent, nodes) {
	Logger.log(5, "Falt2Tree.setOrderInRow() > Column", parent.name)
	nodes.sort((a, b) => {
		return a.y - b.y
	})
	let last = 0
	nodes.forEach((n) => {
		let top = n.y - last
		last = n.y + n.h
		//n.row = i
		n.top = top
	})
}



/**
* Sort by bz row and column. After wards set just paddings and mardings
*/
function setOrderInWrapper (parent, nodes) {
	Logger.log(3, "Falt2Tree.setOrderInWrapper() > Wrapper Container", parent.name)

	nodes.sort((a, b) => {
		if (Util.isOverLappingY(a, b)) {
			return a.x - b.x
		}
		return a.y - b.y
	})

	if (parent.isGroup) {
		/*
			* If the parent is group, the offet will be 0! So we calculate instead
			* the didtance between the first and second row and first and second column.
			* This is offcourse just guess.
			*/

		let offsetBottom = 10
		let offSetRight = 10
		/**
		 * FIXME: This is broken???
		 */
		let rows = Util.getElementsAsRows(nodes)
		if (rows[0] && rows[0].length > 1 && rows[1]) {
			let firstRowChild1 = rows[0][0]
			let firstRowChild2 = rows[0][1]
			let secondRowChild2 = rows[1][0]
			offSetRight = firstRowChild2.x - (firstRowChild1.x + firstRowChild1.w)
			offsetBottom = secondRowChild2.y - (firstRowChild1.y + firstRowChild1.h)
		} else {
			Logger.log(-1, "Falt2Tree.setOrderAndRelativePositons() > cannot guess offsets for Wrapper Container", parent.name)
		}

		parent.style.paddingTop = 0
		parent.style.paddingBottom = 0
		parent.style.paddingLeft = 0
		parent.style.paddingRight = 0

		nodes.forEach((n) => {
			n.wrapOffSetBottom = offsetBottom
			n.wrapOffSetRight = offSetRight
			n.wrapOffSetY = 0
			n.wrapOffSetX = 0
		})
	} else {
		/**
		 * We take as the position, the offset of the first element
		 * Then we add half as padding and the rest a masgin for
		 * the children
		 */
		let firstNode = nodes[0]
		let offSetX = Math.round(firstNode.x / 2)
		let offSetY = Math.round(firstNode.y / 2)
		parent.style.paddingTop = offSetY
		parent.style.paddingBottom = offSetY
		parent.style.paddingLeft = offSetX
		parent.style.paddingRight = offSetX
		nodes.forEach((n) => {
			n.wrapOffSetY = offSetY
			n.wrapOffSetX = offSetX
		})
	}
}



function setWidgetTypes(parent) {
	parent.qtype = getWidgetType(parent)
	if (parent.children) {
		parent.children.forEach((c) => {
			setWidgetTypes(c)
		})
	}
	if (parent.fixedChildren) {
		parent.fixedChildren.forEach((c) => {
			setWidgetTypes(c)
		})
	}
	if (parent.templates) {
		parent.templates.forEach((c) => {
			setWidgetTypes(c)
		})
	}
}

export function setCSSClassNames(parent, screenName) {
	return Util.setCSSClassNames(parent, screenName)
}

function getWidgetType(element) {
	/**
	 * We check here different component overrides
	 */
	if (element.props.customComponent) {
		Logger.log(1, "Falt2Tree.getWidgetType() > Use customComponent", element)
		return element.props.customComponent
	}

	if (element.type === "ComponentSet") {
		return "qComponentSet"
	}

	if (element.type === "DynamicContainer") {
		return "qDynamicContainer"
	}

	if (element.children && element.children.length > 0) {
		if (element.type === "Repeater") {
			return "qRepeater"
		}
		if (element.type === "ChildrenToggle") {
			return "qChildrenToggle"
		}
		return "qContainer"
	} else {
		if (supportedWidgetTypes.indexOf(element.type) >= 0) {
			return `q${element.type}`
		}
		/**
		 * There is a raw ase were fixed children might cause an issue
		 */
		Logger.warn("Falt2Tree.getWidgetType() > Not supported widget type: " + element.type)
		return "qBox"
	}
}

function fixParents(parent) {
	if (parent.children) {
		parent.children.forEach((c) => {
			c.parent = parent
			fixParents(c)
		})
	}
}

function attachSingleLabelsInScreen(model, screen, allowedTypes = null) {
	Logger.log(3, "Falt2Tree.attachSingleLabelsInScreen()", allowedTypes)
	screen.children.forEach((child) => {
		attachSingleLabelsInNodes(model, child, allowedTypes)
	})
	return screen
}

function attachSingleLabelsInNodes(model, node, allowedTypes) {

	/**
	 * If we have a box that has NO label props and contains
	 * only one child of type label, we merge this in.
	 */
	let type = node.type
	//Logger.log(-7, "Falt2Tree.attachSingleLabelsInNodes()", node.name , node.children.length, allowedTypes.indexOf(type) >= 0, )
	if (!node.props.label && node.children.length === 1 && (allowedTypes === null || allowedTypes.indexOf(type) >= 0)) {

		let child = node.children[0]
		/**
		 * TODO: We should check here if teh re is a link. What to do with the link?
		 * Copy to aprent if it is different?
		 */
		let lines = Util.getLines(child, model)
		if (child.type === "Label" && lines.length === 0) {
			Logger.log(7, "Falt2Tree.attachSingleLabelsInNodes()", child.name , node.name)

			node.props.label = child.props.label
			node.children = []
			/**
			 * For none input types set to Box
			 */
			if (!Util.isInputElement(node)) {
				node.type = "Box"
				node.qtype = "qBox"
			}
			textProperties.forEach((key) => {
				if (child.style[key]) {
					node.style[key] = child.style[key]
				}
			})
			node.style.paddingTop = child.y
			node.style.paddingBottom = node.h - child.h - child.y
			node.style.paddingLeft = child.x
			node.style.paddingRight = node.w - child.w - child.x

			/**
			 * If the parent is an auto layout, remove it.
			 */
			if (Util.isLayoutAuto(node)) {
				node.layout = {type: Layout.Row}
			}

			node.style = Util.fixAutos(node.style, child)

			/**
			 * Merge in the databinding of the child, if there is no data binding of the parent
			 */
			if (child.props.databinding && !node.props.databinding) {
				Logger.log(-1, "Falt2Tree.attachSingleLabelsInNodes() copy data binding", child.name, node.name)
				node.props.databinding = child.props.databinding
			}

			// remove grid??
		} else {
			/**
			 * TODO: We have two conditions that can fail and require us to go deeper.
			 * Therefore we need to call this recursive code again. We could have a better check,
			 * to make teh code more beautifull
			 */
			node.children.forEach((child) => {
				attachSingleLabelsInNodes(model, child, allowedTypes)
			})
		}
	} else {
		node.children.forEach((child) => {
			attachSingleLabelsInNodes(model, child, allowedTypes)
		})
	}
}




/**
 * Transforms and screen into a hiearchical presentation. return the root node.
 */
function transformScreenToTree(screen, model) {
	let result = clone(screen)
	delete result.children
	delete result.has
	result.children = []
	result.fixedChildren = []

	/**
	 * Get widget in render order. This is important to derive the
	 * parent child relations.
	 */
	let widgets = Util.getOrderedWidgets(getWidgets(screen, model))

	/**
	 *  now build child parent relations
	 */
	let parentWidgets = []
	let elementsById = {}
	widgets.forEach((widget) => {

		// console.debug('buildTree', widget.name, '    in ', parentWidgets.map(p => p.name).join(', '))

		let element = clone(widget)
		element._x = widget.x
		element._y = widget.y
		element.children = []

		let group = Util.getGroup(widget.id, model)
		element.group = group

		/**
		 * Check if the widget has a parent (= is contained) widget.
		 * If so, calculate the relative position to the parent,
		 * otherwise but the element under the screen.
		 */
		let parentWidget = getParentWidget(parentWidgets, element, model)
		if (parentWidget && Util.canBeChild(element, parentWidget)) {
			//  was Util.canHaveChildren(parentWidget)
			element.x = widget.x - parentWidget.x
			element.y = widget.y - parentWidget.y
			element.parent = parentWidget
			elementsById[parentWidget.id].children.push(element)
		} else {
			element.x = widget.x - screen.x
			element.y = widget.y - screen.y
			element.parent = null
			result.children.push(element)

			/**
			 * If we have a widget directly under the screen, and we have a negative margin, crop
			 * This might happen with figma
			 */
			if (element.y < 0) {
				Logger.log(2, "Falt2Tree.transformScreenToTree() > fix negative margin", element.name)
				element.h += element.y
				element.y = 0
			}
		}

		/**
		 * Save the widget, so we can check in the next
		 * iteation if this is a parent or not! Only use
		 * widgets that can have children
		 */
		if (Util.canHaveChildren(widget)) {
			parentWidgets.unshift(widget)
		}
		elementsById[element.id] = element
	})

	/**
	 * Padding messes with the grid :(
	 */
	resetPadding(result)
	return result
}

function setFixedChildren(screen, model) {
	if (screen.children) {
		setFixedChildrenInElement(screen, screen, model)
	}
	return screen
}

function setFixedChildrenInElement(element, screen, model, fixBottomNodes = true) {
	/**
	 * Attention. Fixed elements must be set in the model as fixed. Otherwise
	 * the oder in the tree method is not correct and the will be wrongly nested!
	 */
	if (element.children) {
		let children = []
		element.children.forEach((child) => {
			if (child.style.fixed === true) {
				child.x = child._x - screen.x
				child.y = child._y - screen.y
				// the first call if with the element being the screen
				if (element.id !== screen.id) {
					element.parent = screen
				}

				setAllChildrenAsNotFixed(child)
				if (fixBottomNodes) {
					setFixedBottom(child, model, screen)
				}
				screen.fixedChildren.push(child)
			} else {
				setFixedChildrenInElement(child, screen, model)
				children.push(child)
			}
		})
		element.children = children
	}
}

function setFixedBottom(element, model, screen) {

	/**
	 * IF we have an pinned bottom
	 */
	if (Util.isPinnedDown(element)) {
		element.bottom = Util.getDistanceFromScreenBottom(element, model, screen)
	}
}

function setAllChildrenAsNotFixed(element) {
	if (element.children) {
		element.children.forEach((child) => {
			child.style.fixed = false
			setAllChildrenAsNotFixed(child)
		})
	}
}

function resetPadding(element) {
	if (element.children) {
		element.children.forEach((child) => {
			/**
			 * If we have more than one child, we have to set the padding to 0.
			 * Also, we have to create an label element
			 */
			let labelToAdd = null
			if (child.children && child.children.length > 0) {
				let style = child.style
				if (child.props.label) {
					let style = child.style
					let paddingLeft = style.paddingLeft ? style.paddingLeft : 0
					let paddingRight = style.paddingRight ? style.paddingRight : 0
					let paddingBottom = style.paddingBottom ? style.paddingBottom : 0
					let paddingTop = style.paddingTop ? style.paddingTop : 0
					// Logger.warn('Falt2Tree.resetPadding() > inline label!', child)
					labelToAdd = {
						id: child.id + "-label",
						name: child.name + "-label",
						type: "Label",
						x: style.paddingRight,
						y: style.paddingTop,
						w: child.w - paddingLeft - paddingRight,
						h: child.h - paddingBottom - paddingTop,
						props: Util.clone(child.props),
						style: {
							color: style.color,
							textAlign: style.textAlign,
							fontFamily: style.fontFamily,
							fontSize: style.fontSize,
							fontStyle: style.fontStyle,
							fontWeight: style.fontWeight,
							letterSpacing: style.letterSpacing,
							lineHeight: style.lineHeight,
							verticalAlign: style.verticalAlign,
						},
						children: [],
					}
				}

				style.paddingBottom = 0
				style.paddingLeft = 0
				style.paddingRight = 0
				style.paddingTop = 0

				resetPadding(child)

				if (labelToAdd) {
					/**
					 * Or add to fron?
					 */
					child.children.push(labelToAdd)
				}
			}
		})
	}
}

/**
 * This method will try to find the parent widget. By default,
 * the parent child relation ship is defined as the visual hierachy. This must be done, to
 * get nice nested HTML also from drawing style.
 *
 * Figma, however, might have overflows. Thus we check, if there is no visual parent,
 * also the parentID.
 */
function getParentWidget(potentialParents, element, model) {
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

function getWidgets(screen, model) {
	let widgets = []
	for (let i = 0; i < screen.children.length; i++) {
		let id = screen.children[i]
		let widget = model.widgets[id]
		widgets.push(widget)
	}
	return widgets
}


function clone(obj) {
	let clone = JSON.parse(JSON.stringify(obj))
	clone._id = cloneID++
	return clone
}
