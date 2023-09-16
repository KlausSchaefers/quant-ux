import * as Util from "./ExportUtil"
import Logger from "../Logger"

var rowContainerID = 0

/**
 * Sets the row IDS to each child
 */
export function addRows(parent) {
	let nodes = parent.children
	nodes.sort((a, b) => {
		return a.y - b.y
	})
	// let rows = []
	let rowIDs = 1
	nodes.forEach((a) => {
		nodes.forEach((b) => {
			if (a.id !== b.id) {
				if (Util.isOverLappingY(a, b)) {
					/**
					 * If we have now row, create a new id for a
					 */
					if (!a.row) {
						a.row = rowIDs++
					}

					/**
					 * If b has no row, we put it in the same row as
					 * a
					 */
					if (!b.row) {
						b.row = a.row
					} else {
						let oldId = b.row
						let newId = a.row
						/**
						 * if b has already a row, we merge row a & b
						 */
						nodes.forEach((c) => {
							if (c.row === oldId) {
								c.row = newId
							}
						})
					}
				}
			}

			/**
			 * no step down recursive
			 */
			if (a.children && a.children.length > 0) {
				addRows(a)
			}
		})
	})

	return parent
}

/**
 * Add extra containers around rows... in theory nice, in practice
 * this leads often to messy stuff.
 */
export function addRowContainer(parent, hasRows) {
	let nodes = parent.children

	let newChildren = []
	let rows = {}
	nodes.forEach((a) => {
		if (a.row) {
			if (!rows[a.row]) {
				rows[a.row] = []
			}
			rows[a.row].push(a)
		} else {
			newChildren.push(a)
		}
	})

	/**
	 * For each row create a container and reposition the children.
	 *
	 * For wrappend and grid containers, we do not do this .
	 *
	 * FIXME: For groups we should not need to add a now row?
	 *
	 */
	if (!Util.isWrappedContainer(parent) && !Util.isGridContainer(parent) && hasRows) {
		for (let row in rows) {
			let children = rows[row]
			let container = createRowCntr(parent, children)
			/**
			 * Position the children in the container
			 */
			children.forEach((c) => {
					c.x = c.x - container.x,
					c.y = c.y - container.y,
					c.parent = container
			})
			newChildren.push(container)
		}
		parent.children = newChildren
	} else {
		/**
		 * Is this needed?
		 */
		if (parent.type !== "Screen") {
			Logger.log(4, "Falt2Tree.addRowContainer() > ignore wrapper ", parent.name)
			parent.isWrap = true
			parent.isRow = false
			parent.isColumn = false
		}
	}

	/**
	 * Go down recursive
	 */
	nodes.forEach((a) => {
		if (a.children && a.children.length > 0) {
			addRowContainer(a)
		}
	})
	return parent
}

function createRowCntr(parent, children) {
	let boundingBox = Util.getBoundingBoxByBoxes(children)
	let rowCntr = {
		id: "r" + rowContainerID++,
		name: `QRow ${rowContainerID}`,
		children: children,
		isRow: true,
		x: boundingBox.x,
		y: boundingBox.y,
		h: boundingBox.h,
		w: boundingBox.w,
		type: "row",
		parent: parent,
		style: {},
		props: {
			resize: {
				right: false,
				up: false,
				left: false,
				down: false,
				/**
				 * check of all children are fixed width. Then we set this one too.
				 */
				fixedHorizontal: Util.allChildrenAreFixedHorizontal(children),
				fixedVertical: false,
			},
		},
	}
	return rowCntr
}