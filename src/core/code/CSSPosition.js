import Logger from "./Logger"
import * as Util from "./ExportUtil"

export default class CSSPosition {

  constructor (config, f) {
		this.cssFacotory = f

		this.gridAutoErrorThreshold = 5

		if (config.css) {
			this.isForceGrid = config.css.grid
			this.justifyContentInWrapper = config.css.justifyContentInWrapper
			this.prefix = config.css.prefix ? config.css.prefix : ''
			this.gridAutoErrorThreshold = config.css.gridAutoErrorThreshold ? config.css.gridAutoErrorThreshold : 5
		}

		if (config.responsive) {
			this.responsive = config.responsive
		}


    this.ignoreCorrectWidthAndHeigth = [
      'CheckBox',
      'RadioBox',
      'RadioBox2',
      'Switch',
      'Stepper',
      'TypeAheadTextBox',
      'Paging',
      'Camera'
    ]

    this.heightProperties = [
			'paddingTop',
			'_paddingTop',
			'paddingBottom',
			'_paddingBottom',
			'borderTopWidth',
			'_borderTopWidth',
			'borderBottomWidth',
			'_borderBottomWidth'
    ]

    this.widthProperties = [
			'paddingLeft',
			'_paddingLeft',
			'paddingRight',
			'_paddingRight',
			'borderLeftWidth',
			'_borderLeftWidth',
			'borderRightWidth',
			'_borderRightWidth'
		]
	}

	getPostion(widget) {
		Logger.log(3, "CSSPostion.getPostion()" + widget.name, widget.layout)


		/**
		 * Special handling for deisgn systems and fixed stuff
		 */
		if (Util.isDesignSystemRoot(widget)) {
			return this.getDesignSystemPosition(widget)
		}

		if (Util.hasComponentScreenParent(widget)) {
			return this.getComponentScreenPosition(widget)
		}


		/**
		 * Normal layout:
		 * 1) Position in parent
		 * 2) Set position of childnre
		 */
		let result = ''
		let parent = widget.parent

		result += this.getParentPosition(parent, widget)
		result += this.getChildPosition(widget)

		return result
	}

	getParentPosition(parent, widget) {

		if (!parent) {
			return this.getParentDefault(widget)
		}

		if (Util.isFixedPosition(widget)) {
			return this.getParentFixed(widget)
		}

		if (Util.isRepeater(parent)) {
			return this.getParentRepeater(widget)
		}

		if (Util.isLayoutWrap(parent)) {
			return this.getParentWrap(widget)
		}

		if (Util.isLayoutAutoHorizontal(parent)) {
			return this.getParentAutoHorizontal(widget)
		}

		if (Util.isLayoutAutovertical(parent)) {
			return this.getParentAutoVertical(widget)
		}

		if (Util.isLayoutRow(parent)) {
			return this.getParentRow(widget)
		}

		if (Util.isLayoutGrid(parent)) {
			return this.getParentGrid(widget)
		}

		return ''
	}

	getChildPosition(widget) {

		if (!Util.hasChildren(widget)) {
			return ''
		}
		if (Util.isRepeater(widget)) {
			return this.setChildrenRepeater(widget)
		}

		if (Util.isLayoutWrap(widget)) {
			return this.getChildrenWrap(widget)
		}

		if (Util.isLayoutAutoHorizontal(widget)) {
			return this.getChildrenAutoHorizontal(widget)
		}

		if (Util.isLayoutAutovertical(widget)) {
			return this.getChildrenAutoVertical(widget)
		}

		if (Util.isLayoutRow(widget)) {
			return this.getChildrenRow(widget)
		}

		if (Util.isLayoutGrid(widget)) {
			return this.getChildrenGrid(widget)
		}

		return ''
	}

	getParentDefault(widget) {
		let result = ''
		if (this.isForceGrid && Util.isScreen(widget)) {
			result += `  min-height: ${widget.h}px;\n`
		} else {
			/**
			 * This has caused issues with templates and fixed in combination.
			 * Thus we do not call getPostion for templates anymore.
			 */
			result += `  min-height: 100%;\n`
		}
		return result
	}



	/*********************************************************************
	 * Auto
	 *********************************************************************/

	getChildrenAutoHorizontal (widget) {
		Logger.log(5, "CSSPosition.getChildrenAutoHorizontal()" + widget.name)
		let result = ''

		let l = widget.layout
		result += "  display: flex;\n"
		result += "  flex-direction: row;\n"
		result += `  align-items: ${l.alignItems};\n`
		result += `  justify-content: ${l.justifyContent};\n`


		if(Util.isWrappedContainer(widget)) {
			result += "  flex-wrap: wrap;\n"
		}

		result += `  gap: ${l.itemSpacing}px;\n`
		result += `  padding-left: ${l.paddingLeft}px;\n`
		result += `  padding-right: ${l.paddingRight}px;\n`
		result += `  padding-top: ${l.paddingTop}px;\n`
		result += `  padding-bottom: ${l.paddingBottom}px;\n`


		return result
	}

	getParentAutoHorizontal (widget) {
		Logger.log(5, "CSSPosition.getParentAutoHorizontal()" + widget.name)
		let result = ''

		result += `  height: ${this.getCorrectedHeight(widget, true)};\n`

		if (Util.hasMinMaxWdith(widget)) {
			result += this.getMinMaxWidth(widget, false)
			result += `  flex-grow: 1;\n`
		} else if (Util.isFixedHorizontal(widget)) {
			result += `  width: ${this.getFixedWidth(widget)};\n`
		} else {
			if (Util.isLayoutGrow(widget)) {
				//result += `  min-width: ${this.getFixedWidth(widget)};\n`
				//result += `  max-width: 100%;\n`
				result += `  flex-grow: 1;\n`
			} else {
				result += `  width: ${this.getResponsiveWidth(widget)};\n`
			}
		}


		return result
	}

	getChildrenAutoVertical (widget) {
		Logger.log(3, "CSSPosition.getChildrenAutoVertical()" + widget.name)
		let result = ''


		let l = widget.layout
		result += "  display: flex;\n"
		result += "  flex-direction: column;\n"
		result += `  align-items: ${l.alignItems};\n`
		result += `  justify-content: ${l.justifyContent};\n`
		result += `  gap: ${l.itemSpacing}px;\n`

		result += `  padding-left: ${l.paddingLeft}px;\n`
		result += `  padding-right: ${l.paddingRight}px;\n`
		result += `  padding-top: ${l.paddingTop}px;\n`
		result += `  padding-bottom: ${l.paddingBottom}px;\n`

		return result
	}

	getParentAutoVertical (widget) {
		Logger.log(3, "CSSPosition.getParentAutovertical()" + widget.name)
		let result = ''

		if (Util.isLayoutGrow(widget)) {
			result += `  min-height: ${this.getCorrectedHeight(widget, true)};\n`
			result += `  flex-grow: 1;\n`
		} else {
			result += `  height: ${this.getCorrectedHeight(widget, true)};\n`
		}

		result += `  width: ${this.getFixedWidth(widget)};\n`


		return result
	}

	/*********************************************************************
	 * Grid
	 *********************************************************************/

	getChildrenGrid (widget) {
		Logger.log(3, "CSSPosition.getChildrenGrid()" + widget.name)
		let result = ''
		result += "  display: grid;\n"
		result += "  grid-template-columns: " + this.getGridColumnTracks(widget.w, widget.grid.columns, widget) + ";\n"
		result += "  grid-template-rows: " + this.getGridRowTracks(widget.h, widget.grid.rows, widget, true) + ";\n"
		return result
	}

	getParentGrid (widget) {
		Logger.log(3, "CSSPosition.getParentGrid()" + widget.name)

		let result = ''
		result += `  grid-column-start: ${widget.gridColumnStart + 1};\n`
		result += `  grid-column-end: ${widget.gridColumnEnd + 1};\n`
		result += `  grid-row-start: ${widget.gridRowStart + 1};\n`
		result += `  grid-row-end: ${widget.gridRowEnd + 1};\n`

		if (widget.z) {
			result += `  z-index: ${widget.z};\n`
		}
		return result
	}


	/**
	 * Returns the tracks for the grid. It makes sure the biggest element
	 * is auto, so the grid is responsive... we could also use minmax()
	 */
	getGridColumnTracks(total, list) {
		Logger.log(6, "CSSPosition.getGridColumnTracks() > ", list)

		if (list) {
			/**
			 * We get the max not fixed. Still we would
			 * need to make sure we get the fixed stuff
			 */
			let notFixed = list.filter(i => !i.fixed)
			if (notFixed.length === 0) {
				notFixed = list
			}
			let max = Math.max(...notFixed.map((i) => i.l))

			return list
				.map((i) => {

					/**
					 * Fixed has priority. For rows we have always fixed...
					 */
					if (i.fixed) {
						return i.l + "px"
					}

					/**
					 * We might want several autos. This is very sensitive
					 * to small changes in the editor. Therefore we give a
					 * small error margin. Use minmax to prevent blowout
					 * https://css-tricks.com/preventing-a-grid-blowout/
					 */
					if (Math.abs(max - i.l) <= this.gridAutoErrorThreshold) {
						// max === i.l
						/**
						 * FIXME: If we have a min max , we use max-content, but only of there
						 * is more than one column! Otherwise the resizing will not work
						 * correctly!
						 */
						// if (i.hasMinMax && list.length > 1) {
						// 	return "minmax(0,max-content)" //'1fr'
						// } else {
						//	return "minmax(0,1fr)" //'1fr'
						// }
						return "minmax(0,1fr)"
					}
					return (Math.round((i.l * 1000) / total) / 10 )+ "%"
				})
				.join(" ")
		}
	}

	getGridRowTracks(total, rows) {
		Logger.log(6, "CSSPosition.getGridRowTracks() > ", rows)
		if (rows) {
			return rows
				.map((row, index) => {
					/**
					 * The last row will be free space, if it is
					 * not fixed
					 */
					if (!row.fixed && index === rows.length - 1) {
						return "1fr"
					}
					/**
					 * Fixed rows or spacer (no element starts here, or first)
					 * rows have a fixed size. Everything else is minmax
					 */
					if (row.fixed || row.start.length === 0 || index === 0) {
						return Math.round(row.l) + "px"
					}
					return `minmax(${Math.round(row.l)}px, auto)`
				})
				.join(" ")
		}
	}

	/*********************************************************************
	 * Fixed Position
	 *********************************************************************/

	getParentFixed(widget) {
		let result = "  position: fixed;\n"
		if (this.isFixedHorizontal(widget)) {
			result += `  width: ${this.getFixedWidth(widget)};\n`
		} else {
			result += `  width: ${this.getResponsiveWidth(widget)};\n`
		}
		if (Util.isPinnedLeft(widget)) {
			result += `  left: ${this.getPinnedLeft(widget)};\n`
		} else if (Util.isPinnedRight(widget)) {
			result += `  right: ${this.getPinnedRight(widget)};\n`
		} else {
			result += `  left: ${this.getResponsiveLeft(widget)};\n`
		}
		if (Util.isPinnedDown(widget)) {
			result += `  bottom: ${widget.bottom}px;\n`
		} else {
			result += `  top: ${widget.y}px;\n`
		}
		result += `  height: ${this.getCorrectedHeight(widget)};\n`
		return result
	}


	/*********************************************************************
	 * Wrapped
	 *********************************************************************/


	getParentWrap (widget) {
		Logger.log(3, "CSSPosition.getParentWrap()" + widget.name)
		let result = ""
		/**
		 * For wrapped we just add margins
		 */
		result += `  min-height: ${this.getWrappedHeight(widget)};\n`
		result += this.getWrappedWidth(widget)
		if (widget.wrapOffSetBottom && widget.wrapOffSetRight && !this.justifyContentInWrapper) {
			result += `  margin-bottom: ${widget.wrapOffSetBottom}px ;\n`
			result += `  margin-right: ${widget.wrapOffSetRight}px ;\n`
		} else {
			result += `  margin: ${widget.wrapOffSetY}px ${widget.wrapOffSetX}px;\n`
		}

		return result
	}

	getChildrenWrap (widget) {
		Logger.log(4, "CSSPosition.getChildrenWrap() " + widget.name)
		let result = ""
		result += "  display: flex;\n"
		result += "  flex-direction: row;\n"
		result += "  flex-wrap: wrap;\n"
		result += "  align-items: flex-start;\n"
		result += "  align-content: flex-start;\n"

		/**
		 * FIXME:This hsould be configured in the UI
		 */
		if (this.justifyContentInWrapper) {
			result += "  justify-content: space-between;\n"
		}
		return result
	}

	getWrappedHeight(widget) {
		return this.getCorrectedHeight(widget)
	}

	getWrappedWidth(widget) {
		Logger.log(5, "CSSPosition.getWrappedWidth() " + widget.name, Util.hasMinMaxWdith(widget))
		if (Util.hasMinMaxWdith(widget)) {
			return this.getMinMaxWidth(widget, true)
		}
		if (this.isFixedHorizontal(widget)) {
			return `  width: ${this.getFixedWidth(widget)};\n`
		}
		return `  width: ${this.getResponsiveWidth(widget)};\n`
	}

	/*********************************************************************
	 * Repeater
	 *********************************************************************/

	getParentRepeater (widget) {
		Logger.log(5, "CSSPosition.getParentRepeater() " + widget.name)
		let result = ""

		if (Util.isFixedVertical(widget)) {
			result += `  height: ${this.getCorrectedHeight(widget, true)};\n`
		} else {
			result += `  min-height: ${this.getCorrectedHeight(widget, true)};\n`
			result += `  height: 100%;\n`
		}
		// Take the border of the child out!
		result += `  width: calc(100% - ${this.getLeftRightBorder(widget)}px);\n`

		return result
	}

	getLeftRightBorder (widget) {
		let result = 0
		if (widget.style) {
			this.widthProperties.forEach((key) => {
				if (widget.style[key]) {
					result += widget.style[key]
				}
			})
		}
		return result
	}

	setChildrenRepeater(widget) {
		Logger.log(5, "CSSPosition.setChildrenRepeater() " + widget.name)


		/**
		 * First check of we have an auto layout
		 */
		if (Util.isLayoutAutoHorizontal(widget)) {
			return this.getChildrenAutoHorizontal(widget)
		}

		if (Util.isLayoutAutovertical(widget)) {
			return this.getChildrenAutoVertical(widget)
		}

		/**
		 * Otherwise return standard grid or row style
		 */
		let result = ""
		if (Util.isRepeaterGrid(widget)) {
			result += "  display: flex;\n"
			result += "  flex-direction: row;\n"
			result += "  flex-wrap: wrap;\n"
			result += "  align-items: flex-start;\n"
			result += "  align-content: flex-start;\n"
			if (Util.isRepeaterAuto(widget)) {
				result += "  justify-content: space-between;\n"
			}
		} else {
			result += "  display: flex;\n"
			result += "  flex-direction: column;\n"
		}

		return result
	}



	/*********************************************************************
	 * Rows
	 *********************************************************************/

	getChildrenRow () {
		let result = ""
		result += "  display: flex;\n"
		result += "  flex-direction: column;\n"
		return result
	}

	getParentRow (widget) {
		Logger.log(5, "CSSPosition.getParentRow() " + widget.name, widget.props)
		let result = ""

		result += this.getParentRowHorizontal(widget)
		result += this.getParentRowVertical(widget)

		return result
	}

	getParentRowVertical(widget) {
		let result = ""
		if (Util.isFixedVertical(widget)) {
			result += `  height: ${this.getCorrectedHeight(widget, true)};\n`
		} else {
			result += `  min-height: ${this.getCorrectedHeight(widget, true)};\n`
		}
		result += `  margin-top: ${this.getPinnedTop(widget)};\n`
		return result
	}

	getParentRowHorizontal (widget) {

		/**
		 * Stronged constraint is left and right pinned!
		 */
		if (this.isPinnedLeft(widget) && this.isPinnedRight(widget)) {
			return this.getParentRowPinnedBoth(widget)
		}

		/**
		 * Second constraint is centered!
		 */
		if (Util.isCentered(widget)) {
			return this.getParentRowCenter(widget)
		}

		if (this.isPinnedLeft(widget)) {
			return this.getParentRowPinnedLeft(widget)
		}

		if (this.isPinnedRight(widget)) {
			return this.getParentRowPinneRight(widget)
		}

		/**
		 * Default is more or less quant-ux standard
		 */
		return this.getParentRowPinnedNone(widget)

	}

	getParentRowCenter(widget) {
		let result = ''

		if (Util.hasMinMaxWdith(widget)) {
			result += this.getMinMaxWidth(widget, true)
		} else if (Util.isFixedHorizontal(widget)){
			result += `  width: ${this.getFixedWidth(widget)};\n`
		} else {
			result += `  width: ${this.getResponsiveWidth(widget)};\n`
		}

		result += `  margin-left: auto;\n`
		result += `  margin-right: auto;\n`

		return result
	}

	getParentRowPinnedBoth (widget) {
		let result = ""
		result += `  margin-left: ${this.getPinnedLeft(widget)};\n`
		result += `  margin-right: ${this.getPinnedRight(widget)};\n`
		return result
	}

	getParentRowPinnedLeft (widget) {
		let result = ""
		if (this.isFixedHorizontal(widget)) {
			result += `  width: ${this.getFixedWidth(widget)};\n`
			result += `  margin-left: ${this.getPinnedLeft(widget)};\n`
		} else {
			result += `  margin-right: ${this.getResponsiveRight(widget)};\n`
			result += `  margin-left: ${this.getPinnedLeft(widget)};\n`
		}
		return result
	}

	getParentRowPinneRight (widget) {
		let result = ""
		/**
		 * This is a tricky one.
		 */
		if (this.isFixedHorizontal(widget)) {
			result += `  width: ${this.getFixedWidth(widget)};\n`
			result += `  margin-left: ${this.getCalcLeft(widget)};\n`
		} else {
			/**
			 * TODO: can we use somehow a reposnive calculated left?
			 */
			result += `  margin-left: ${this.getResponsiveLeft(widget)};\n`
			result += `  margin-right: ${this.getPinnedRight(widget)};\n`
		}
		return result
	}

	getParentRowPinnedNone(widget) {
		let result = ""

		/**
		 * Nothing is pinned.
		 * We are in a rowGrid, this means the widget is alone. Therefore
		 * we can set the margin left and right and not the width.
		 */
		if (this.isFixedHorizontal(widget)) {

			/**
			 * FIXME: This branch should be dead. We catch this before!
			 */
			if (Util.isCentered(widget)) {
				result += `  width: ${this.getFixedWidth(widget)};\n`
				result += `  margin-left: auto;\n`
				result += `  margin-right: auto;\n`
			} else {
				result += `  width: ${this.getFixedWidth(widget)};\n`
				result += `  margin-left: ${this.getResponsiveLeft(widget)};\n`
			}

		} else if (Util.hasMinMaxWdith(widget) && Util.isCentered(widget)) {
			/**
			 * If we have min max and center we will use minmax with relative width
			 */
			result += this.getMinMaxWidth(widget, true)
			result += `  margin-left: auto;\n`
			result += `  margin-right: auto;\n`

		} else {
			result += `  margin-right: ${this.getResponsiveRight(widget)};\n`
			result += `  margin-left: ${this.getResponsiveLeft(widget)};\n`
		}

		return result
	}

	/*********************************************************************
	 * Design System
	 *********************************************************************/

	getDesignSystemPosition(widget) {
		Logger.log(3, "CSSPosition.getDesignSystemPosition()" + widget.name, widget)

		let result = ""

		/**
		 * ComponentSet are just placed as block or inline block. The child will
		 * determine the size. This will happen the ComponenSetCSS.js file
		 * TODO factor this out...
		 */
		if (Util.isComponentSet(widget)) {

			if (Util.isBlock(widget)) {
				result += `  display:block;\n`
			} else {
				result += `  display:inline-block;\n`
			}

		} else {
			/**
			 * For all other components we set (inline)grid or block,
			 * with and height and a grid of needed-
			 */
			if (this.isGrid(widget)) {
				if (Util.isBlock(widget)) {
					result += `  display:grid;\n`
				} else {
					result += `  display:inline-grid;\n`
				}
			} else if (Util.isBlock(widget)) {
				result += `  display:block;\n`
			} else {
				result += `  display:inline-block;\n`
			}

			/**
			 * For wrapped we just add margins
			 */
			if (Util.isFixedHorizontal(widget)) {
				result += `  width: ${this.getCorrectedWidth(widget)};\n`
			} else if (Util.hasMinMaxWdith(widget)) {
				result += this.getMinMaxWidth(widget, false)
			}else {
				result += `  width: auto;\n`
			}

			if (Util.isFixedVertical(widget)) {
				result += `  height: ${this.getCorrectedHeight(widget)};\n`
			} else {
				result += `  min-height: ${this.getCorrectedHeight(widget)};\n`
			}

			if (Util.hasChildren(widget)) {
				if (Util.isLayoutGrid(widget)) {
					Logger.log(3, "CSSPosition.getComponentScreenPosition() > add grid" + widget.name)
					result += "  grid-template-columns: " + this.getGridColumnTracks(widget.w, widget.grid.columns, widget) + ";\n"
					result += "  grid-template-rows: " + this.getGridRowTracks(widget.h, widget.grid.rows, widget) + ";\n"
				} else {
					result += "  display: flex;\n"
					result += "  flex-direction: column;\n"
				}
			}

		}


		return result
	}

	getMinMaxWidth (widget, isWrapped = false) {
		let result = ""
		if (widget.style && widget.style.minWidth) {
			result += `  min-width: ${widget.style.minWidth}px;\n`
		}
		if (widget.style && widget.style.maxWidth) {
			result += `  max-width: ${widget.style.maxWidth}px;\n`
		}
		/**
		 * We need to make sure that we also include the reponsive with,
		 * to make it 'push' outwards
		 */
		if (isWrapped) {
			result += `  width: ${this.getResponsiveWidth(widget)};\n`
		}
		return result
	}

	isInlineBlock (widget) {
		return widget.qtype !== 'qContainer'
	}

	isGrid (widget) {
		return Util.isLayoutGrid(widget) && Util.hasChildren(widget)
	}

	/*********************************************************************
	 * Child of component screen
	 *********************************************************************/

	getComponentScreenPosition(widget) {
		Logger.log(3, "CSSPosition.getComponentScreenPosition()" + widget.name)
		let result = ""
		/**
		 * For wrapped we just add margins
		 */
		result += `  height:100%;\n`
		result += `  width: 100%;\n`

		/**
		 * FIXME: Add here check for
		 */
		if (Util.isLayoutGrid(widget)) {
			Logger.log(-1, "CSSPosition.getComponentScreenPosition() > add grid" + widget.name)
			result += "  display: grid;\n"
			result += "  grid-template-columns: " + this.getGridColumnTracks(widget.w, widget.grid.columns, widget) + ";\n"
			result += "  grid-template-rows: " + this.getGridRowTracks(widget.h, widget.grid.rows, widget) + ";\n"
		}

		return result
	}


	/*********************************************************************
	 * Position Helpers
	 *********************************************************************/

	isPinnedLeft(widget) {
		return Util.isPinnedLeft(widget)
	}

	isPinnedRight(widget) {
		return Util.isPinnedRight(widget)
	}

	getPinnedBottom(widget) {
		if (widget.parent) {
			let parent = widget.parent
			let innerHeight = parent.children
				.map((c) => {
					// grid has top
					if (c.top != undefined) {
						return c.h + c.top
					}
					return c.h + c.y
				})
				.reduce((a, b) => a + b, 0)
			return Math.max(0, parent.h - innerHeight) + "px"
		}
		return "auto"
	}

	getFixedWidth(widget) {
		if (Util.isFullWidth(widget)) {
			return "100%"
		}
		return this.getCorrectedWidth(widget)
	}

	getFixedTop(widget) {
		return widget.y + "px"
	}

	getPinnedTop(widget) {
		return widget.top + "px"
	}

	getCalcLeft(widget) {
		if (widget.parent) {
			let right = widget.parent.w - (widget.x + widget.w)
			return `calc(100% - ${widget.w + right}px)`
		}
		return "0px"
	}

	getResponsiveLeft(widget) {
		if (widget.parent) {
			return Math.round((widget.x * 100) / widget.parent.w) + "%"
		}
		return widget.x + "px"
	}

	getResponsiveRight(widget) {
		if (widget.parent) {
			let right = widget.parent.w - (widget.x + widget.w)
			return Math.round((right * 100) / widget.parent.w) + "%"
		}
		return widget.x + "px"
	}

	getPinnedLeft(widget) {
		return widget.x + "px"
	}

	getPinnedRight(widget) {
		if (widget.parent) {
			if (widget.absX) {
				return widget.parent.w - (widget.absX + widget.w) + "px"
			} else {
				return widget.parent.w - (widget.x + widget.w) + "px"
			}
		}
		return "0px"
	}

	getResponsiveWidth(widget) {
		if (widget.parent) {
			/**
			 * What about border...
			 */
			return Math.round((widget.w * 100) / widget.parent.w) + "%"
		}
		Logger.warn("CSSPosition.getResponsiveWidth() > No parent! " + widget.name)
		return "100%"
	}

	getFixedHeight(widget) {
		return widget.h + "px"
	}

	getCorrectedHeight(widget, isPosition = false, h = -1) {
		if (h < 0) {
			h = widget.h
		}

		/**
		 * when we are positioning, we only sustract
		 * for certain widgets
		 */
		if (isPosition && this.ignoreCorrectWidthAndHeigth.indexOf(widget.type) >= 0) {
			return h + "px"
		}
		this.heightProperties.forEach((key) => {
			if (widget.style[key]) {
				h -= widget.style[key]
			}
		})

		/**
		 * For auto layouts we have the padding in the layout
		 */
		if (Util.isLayoutAuto(widget)) {
			h -= widget.layout.paddingTop
			h -= widget.layout.paddingBottom
		}
		/**
		 * For templated widgets, we need to also check for
		 * template padings. Also check for '_padding' and so...
		 */
		if (widget._template) {
			let template = widget._template
			this.heightProperties.forEach((key) => {
				if (template.style[key] && !widget.style[key] && !widget.style['_'+key]) {
					h -= template.style[key]
				}
			})
		}

		return h + "px"
	}

	getCorrectedWidth(widget, isPosition = false, w = -1) {

		if (w < 0) {
			w = widget.w
		}
		if (isPosition && this.ignoreCorrectWidthAndHeigth.indexOf(widget.type) >= 0) {
			return w + "px"
		}

		/**
		 * For auto layouts we have the padding in the layout
		 */
		if (Util.isLayoutAuto(widget)) {
			w -= widget.layout.paddingLeft
			w -= widget.layout.paddingRight
		}

		this.widthProperties.forEach((key) => {
			if (widget.style[key]) {
				w -= widget.style[key]
			}
		})


		return w + "px"
	}

	isFixedHorizontal(widget) {
		return Util.isFixedHorizontal(widget)
	}

	getSiblings(widget) {
		if (widget.parent && widget.parent.children) {
			return widget.parent && widget.parent.children
		}
		return []
	}
}
