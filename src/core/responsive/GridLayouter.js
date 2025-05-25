import * as Util from "./ExportUtil"
import * as SnappUtil from '../SnappUtil'
//import { Layout } from "../core/Const"

export function addGridToElements(parent, zoom) {
  
	const grid = computeGrid(parent, zoom)


	if (grid) {
		parent.grid = grid
		if (parent.children && parent.children.length > 0) {
			parent.children.forEach((e) => {
		
				e.gridColumnStart = 0
				e.gridColumnEnd = grid.columns.length
				e.gridRowStart = 0
				e.gridRowEnd = grid.rows.length
				grid.columns.forEach((c, i) => {
					if (c.start.includes(e.id)) {
						e.gridColumnStart = i
					}
					if (c.end.includes(e.id)) {
						e.gridColumnEnd = i
					}
					// /**
					//  * FIXME: if we want to use grdiCleanUp we
					//  * have to use start and end
					//  */
					// if (c.v === e.x) {
					// 	e.gridColumnStart = i
					// } else if (c.v === e.x + e.w) {
					// 	e.gridColumnEnd = i
					// }
				})
				grid.rows.forEach((r, i) => {
					if (r.start.includes(e.id)) {
						e.gridRowStart = i
					}
					if (r.end.includes(e.id)) {
						e.gridRowEnd = i
					}
					// if (r.v === e.y) {
					// 	e.gridRowStart = i
					// }
					// if (r.v === e.y + e.h) {
					// 	e.gridRowEnd = i
					// }
				})
			})
		}
	}
	

	if (parent.children && parent.children.length > 0) {
		parent.children.forEach((c) => {
			addGridToElements(c, zoom)
		})
	}

	return parent
}

export function computeGrid(parent, zoom, fixSmallColumns = false) {
	if (parent.children && parent.children.length > 0) {
		let rows = {}
		let columns = {}
		let snapp = false

		/**
		 * Collect all the relevant lines. First the parent
		 * then all the children
		 */
		addGridColumns(columns, 0, parent, true)
		addGridRow(rows, 0, parent, true)

		// for a grid container we set the grid from
		// the container
		let lines = {x: [], y: []}
		if (Util.isGridContainerWidget(parent)) {
			snapp = true
			lines = SnappUtil.getGridContainerLines(parent, 'All', zoom)
			lines.x.forEach(x => {
				// substract the model x and y... I think
				addGridColumns(columns, Util.round(x - parent.x), null, true)
			})
			lines.y.forEach(y => {
				// substract the model x and y... I think
				addGridRow(rows, Util.round(y - parent.y), null, true)
			})
		}

		addGridColumns(columns, Util.round(parent.w), parent, false)
		addGridRow(rows, Util.round(parent.h), parent, false)

		parent.children.forEach((c) => {
			// we have an issue here id we are zooming, because 
			// we might get double lines with just a difference of 1
			addGridColumns(columns, Util.round(c.x), c, true, snapp)
			addGridColumns(columns, Util.round(c.x + c.w), c, false, snapp)
			addGridRow(rows, Util.round(c.y), c, true, snapp)
			addGridRow(rows, Util.round(c.y + c.h), c, false, snapp)
		})

		//console.debug('GridLayouter', 'computeGrid', 'columns', Object.values(rows).length, 'lines', lines.y)
		
		/**
		 * Set the width and convert objects to arrays
		 */
		columns = setGridColumnWidth(columns, parent)
		rows = setGridRowHeight(rows, parent)
	
		if (fixSmallColumns) {
			/**
			 * To make htis work, we need to fix the addGridToElements() to not match values,
			 * but go over the start and end thingies.
			 */
			columns = computeReducedColumns(columns)
		}

		/**
		 * determine fixed columns and rows
		 */
		if (Util.isGridContainerWidget(parent)) {
			setGridContainerFixed(parent, columns, rows)
		} else {
			setFixedGirdRowsAndColumns(parent, columns, rows)
		}



		return {
			rows: rows,
			columns: columns,
		}
	}
	return null
}

function setGridContainerFixed(parent, columns, rows) {
	columns.forEach((c,i) => {
		if (i % 2 === 0) {
			c.fixed = true
		}
	})
	rows.forEach((r,i) => {
		if (i % 2 === 0) {
			r.fixed = true
		}
	})
}


export function computeReducedColumns(columns) {
	let temp = []
	let last = null
	for (let c = 0; c < columns.length; c++) {
		let col = columns[c]
		if (last && col.v - last.v < 2) {
			/**
			 * This does not work
			 */
			let start = last.start.concat(col.start)
			let end = last.end.concat(col.end)
			last.start = start
			last.end = end
		} else {
			temp.push(col)
			last = col
		}
	}
	return temp
}

export function setFixedGirdRowsAndColumns(parent, columns, rows) {
	/**
	 * Set fixed. For each child check if the
	 * 1) We have fixed Vertical or Horizontal
	 * 2) If pinned. e.g. if pinned right, all
	 *    columns < e.v must be fixed
	 */
	parent.children.forEach((e) => {
		if (Util.isFixedHorizontal(e)) {
			columns.forEach((column) => {
				if (column.v >= e.x && column.v < e.x + e.w) {
					column.fixed = true
				}
			})
		}
		if (Util.isPinnedLeft(e)) {
			// FIXME: Just fix the closest
			let before = columns.filter((column) => column.v < e.x)
			if (before.length > 0) {
				before[before.length - 1].fixed = true
			}
			//columns.forEach(column => {
			//    if (column.v < e.x) {
			//        column.fixed = true
			//    }
			//})
		}
		if (Util.isPinnedRight(e)) {
			let after = columns.filter((column) => column.v >= e.x + e.w)
			if (after.length > 0) {
				after[0].fixed = true
			}
			//columns.forEach(column => {
			//    if (column.v >= e.x + e.w) {
			//        column.fixed = true
			//    }
			//})
		}

		if (Util.isFixedVertical(e)) {
			rows.forEach((row) => {
				if (row.v >= e.y && row.v < e.y + e.h) {
					row.fixed = true
				}
			})
		}

		if (Util.isPinnedUp(e)) {
			// Just fix the one before
			let before = rows.filter((row) => row.v < e.y)
			if (before.length > 0) {
				before[before.length - 1].fixed = true
			}
			// rows.forEach((row) => {
			// 	if (row.v < e.y) {
			// 		row.fixed = true
			// 	}
			// })
		}
		if (Util.isPinnedDown(e)) {
			//	Just fix the one after
			let after = rows.filter((row) => row.v >= e.y + e.h)
			if (after.length > 0) {
				after[0].fixed = true
			}
			// rows.forEach((row) => {				
			// 	if (row.v >= e.y + e.h) {
			// 		row.fixed = true
			// 	}
			// })
		}
	})
}

export function setGridColumnWidth(columns, parent) {
	columns = Object.values(columns).sort((a, b) => a.v - b.v)
	columns.forEach((column, i) => {
		if (columns[i + 1]) {
			column.l = Util.round(columns[i + 1].v - column.v)
		} else {
			column.l = Util.round(parent.w - column.v)
		}
	})
	// FIXME: this should be smarter for rows that are not the beginning and the ned
	return columns.filter((c) => c.l > 0)
}

export function setGridRowHeight(rows, parent) {
	rows = Object.values(rows).sort((a, b) => a.v - b.v)
	rows.forEach((row, i) => {
		if (rows[i + 1]) {
			row.l = Util.round(rows[i + 1].v - row.v)
		} else {
			row.l = Util.round(parent.h - row.v)
		}
	})
	// FIXME: this should be smarter for rows that are not the beginning and the ned
	return rows.filter((r) => r.l > 0)
}

export function addGridColumns(columns, x, e, start, snapp) {
	x = correctColumnX(columns, x, snapp)
	if (!columns[x]) {	
		columns[x] = {
			v: x,
			start: [],
			end: [],
			fixed: false,
			hasMinMax: false,
		}
	}
	if (e) {
		if (start) {
			columns[x].start.push(e.id)
		} else {
			columns[x].end.push(e.id)
		}
		/**
		 * If we have a min max, we will
		 * later try to use max-content. This will
		 * only work for the longest element.
		 * Check CSSPosition.getGridColumnTracks()
		 */
		if (Util.hasMinMaxWdith(e)) {
			columns[x].hasMinMax = true
		}
	} else {
		columns[x].isGridContainer = true
	}
}

function correctColumnX (columns, x, snapp) {
	if (!snapp) {
		return x
	}
	for (let i = 1; i <= 3; i++) {
		if (columns[x + i]) {
			return x + i
		}
		if (columns[x - i]) {
			return x - i
		}
	}
	return x
}

export function addGridRow(rows, y, e, start, snapp) {
	y = correctRowY(rows, y, snapp)
	if (!rows[y]) {
		rows[y] = {
			v: y,
			start: [],
			end: [],
			fixed: false,
		}
	}
	if (e) {
		if (start) {
			rows[y].start.push(e.id)
		} else {
			rows[y].end.push(e.id)
		}
	} else {
		rows[y].isGridContainer = true
	}

}

function correctRowY (rows, y, snapp) {
	if (!snapp) {
		return y
	}
	if (rows[y]) {
		return y
	}
	for (let i = 1; i <= 3; i++) {
		if (rows[y + i]) {
			return y + i
		}
		if (rows[y - i]) {
			return y - i
		}
	}
	return y
}