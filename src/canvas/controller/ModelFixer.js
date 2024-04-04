import Logger from "../../common/Logger"
import lang from "../../dojo/_base/lang"
import ModelGeom from "../../core/ModelGeom"
//import CoreUtil from "../../core/CoreUtil"

class ModelFixer {
	constructor() {
		this.logger = new Logger("ModelFixer")
	}

	

	fixCommandStack(stack) {
		this.logger.log(2, "fixCommandStack", "enter")
		let result = false
		if (stack.pos < 0) {
			this.logger.warn("fixCommandStack", "Pos < 0 >> pos:" + stack.pos + ' > length:' + stack.stack.length )
			this.logger.sendError(new Error("Controller.fixCommandStack() > pos is < 0" + stack.pos  + " > length: " + stack.stack.length))
			stack.pos = stack.stack.length
			result = true
		}

		if (stack.pos > stack.stack.length) {
			this.logger.warn("fixCommandStack", "Pos too bug >> pos:" + stack.pos + ' > length:' + stack.stack.length )
			this.logger.sendError(new Error("Controller.fixCommandStack() > pos is < 0" + stack.pos  + " > length: " + stack.stack.length))
			stack.pos = stack.stack.length
			result = true
		}
		return result
	}

	fixZValues(m) {
		this.logger.log(2, "fixZValues", "enter", m)

		// this should work in the screen level!!
		//const zValues = Object.values(m.widgets).map(w => w.z)
		//if (this.hasDoublicate(zValues)) {
			//this.logger.warn("fixZValues", "Double z values", zValues)
			// const ordered = CoreUtil.getOrderedWidgets(m.widgets, true)
			// for (let i = 0; i< ordered.length; i++) {
			// 	let widget = ordered[i]
			// 	widget.z = i
			// }
		//}

		return false
	}

	hasDoublicate (arr) {
		const values = {}
		for (let i = 0; i< arr.length; i++) {
			const v = arr[i]
			if (values[v]) {
				return true
			}
			values[v] = true
		}
		return false
	}

	fixNegativeCoords(m) {
		var fixed = false
		for (let id in m.screens) {
			let s = m.screens[id]
			let difX = 0
			let difY = 0
			if (s.x < 0) {
				s.x = Math.abs(s.x)
				fixed = true
				difX = s.x * 2
			}
			if (s.y < 0) {
				s.y = Math.abs(s.y)
				fixed = true
				difY = s.y * 2
			}
			if (difY > 0 || difY > 0) {
				for (let i = 0; i < s.children.length; i++) {
					let widgetID = screen.children[i]
					let widget = m.widgets[widgetID]
					widget.x += difX
					widget.y += difY
				}
			}
		}

		for (let id in m.widgets) {
			let w = m.widgets[id]
			if (w.x < 0) {
				w.x = Math.abs(w.x)
				fixed = true
			}
			if (w.y < 0) {
				w.y = Math.abs(w.y)
				fixed = true
			}
		}

		if (fixed) {
			this.printStackToLog()
			this.logger.sendError({ message: "fixNegativeCoords() > negative screens", stack: "---" })
		}
	}

	fixModelCount(m) {
		var errors = []
		this.logger.log(4, "fixModelCount", "enter")
		try {
			var max = 0
			for (let id in m.screens) {
				let i = this.getUUID(id)
				max = Math.max(max, i)
			}
			for (let id in m.widgets) {
				let i = this.getUUID(id)
				max = Math.max(max, i)
			}
			if (m.lines) {
				for (let id in m.lines) {
					let i = this.getUUID(id)
					max = Math.max(max, i)
				}
			}
			if (m.groups) {
				for (let id in m.groups) {
					let i = this.getUUID(id)
					max = Math.max(max, i)
				}
			}
			if (m.templates) {
				for (let id in m.templates) {
					let i = this.getUUID(id)
					max = Math.max(max, i)
				}
			}
			this.logger.log(4, "fixModelCount", "exit > " + max + " ?= " + m.lastUUID + " == " + (max > m.lastUUID))
			if (max > m.lastUUID) {
				errors.push({ msg: "lastUUID to small!" })
				this.logger.error("fixModelCount", "fix > " + max + " ?= " + m.lastUUID)
				this.logger.sendError(new Error("Controller.fixModelCount() > Some fuckup"))
				m.lastUUID = max + 1
			}
		} catch (e) {
			console.error("BaseController.fixModelCount() > Error", e)
		}
		return errors
	}

	getUUID (id) {
		let result = id.substring(1)
		let pos = result.indexOf('_')
		if (pos >= 0) {
			result = result.substring(0,pos)
		}
		return parseInt(result)
	}

	validateAndFixModel(model) {
		this.logger.log(3, "validateAndFixModel", "enter > model : " + model.id)
		var errors = []

		if (model.lastCategory === null) {
			this.logger.log(0, "validateAndFixModel", "lastCategory is null")
			errors.push({ id: model.id, msg: "lastCategory is null" })
			model.lastCategory = "WireFrame"
		}

		var widgets2Screen = {}
		for (let screenID in model.screens) {
			let screen = model.screens[screenID]
			if (screen) {
				if (screen.x < 0) {
					screen.x = 0
					errors.push({ id: screenID, msg: "x less 0" })
					this.logger.log(0, "validateAndFixModel", "screen.x less 0 : " + screenID)
				}
				if (screen.y < 0) {
					screen.y = 0
					errors.push({ id: screenID, msg: "y less  0" })
					this.logger.log(0, "validateAndFixModel", "screen.y less 0 : " + screenID)
				}

				if (screen.w < 0) {
					errors.push({ id: screenID, msg: "w less  0" })
					this.logger.log(-1, "validateAndFixModel", "screen.w less 0 : " + screenID)
				}

				let children = lang.clone(screen.children)
				for (let i = 0; i < children.length; i++) {
					let widgetID = children[i]
					let widget = model.widgets[widgetID]
					widgets2Screen[widgetID] = screenID
					if (!widget) {
						screen.children.splice(i, 1)
						errors.push({ id: screenID, msg: "No child " + widgetID })
						this.logger.log(0, "validateAndFixModel", "screen  " + screenID + " has not exisitng widget " + widgetID)
					}
				}

				if (screen.parents && screen.parents.length > 0) {
					let parentsToRemove = {}
					screen.parents.forEach((parentId) => {
						if (!model.screens[parentId]) {
							this.logger.log(-1, "validateAndFixModel", "No screen parent : " + parentId + " in screen " + screenID)
							parentsToRemove[parentId] = true
						}
					})

					if (Object.values(parentsToRemove).length > 0) {
						screen.parents = screen.parents.filter((parentId) => !parentsToRemove[parentId])
						errors.push({ id: screenID, msg: "No parents " + parentsToRemove })
					}
				}
			} else {
				delete model.screens[screenID]
				errors.push({ id: screenID, msg: "No screen" })
				this.logger.log(0, "validateAndFixModel", "No screen object : " + screenID)
			}
		}

		for (let widgetID in model.widgets) {
			let widget = model.widgets[widgetID]
			if (widget) {
				if (widget.x < 0) {
					widget.x = 0
					errors.push({ id: widgetID, msg: "x less 0" })
					this.logger.log(0, "validateAndFixModel", "widget.x less 0 : " + widgetID)
				}
				if (widget.y < 0) {
					widget.y = 0
					errors.push({ id: widgetID, msg: "y less  0" })
					this.logger.log(0, "validateAndFixModel", "widget.y less 0 : " + widgetID)
				}

				if (widget.h < 0) {
					errors.push({ id: widget, msg: "h less  0" })
					widget.h = 100
					this.logger.log(-1, "validateAndFixModel", "widget.h less 0 : " + widgetID)
				}

				if (widget.w < 0) {
					errors.push({ id: widget, msg: "w less  0" })
					widget.w = 100
					this.logger.log(-1, "validateAndFixModel", "widget.w less 0 : " + widgetID)
				}

				// fix widgets that are on screens, but are somehow not attached.
				// dunno why this sometimes happens
				if (!widgets2Screen[widgetID]) {
					var screen = this._getHoverScreen(widget, model)
					if (screen) {
						this.logger.log(0, "validateAndFixModel", "widget not in screen : " + widgetID)
						errors.push({ id: widgetID, msg: "Not in screen" })
						screen.children.push(widgetID)
					}
				}
			} else {
				delete model.widgets[widgetID]
				errors.push({ id: widgetID, msg: "No widget" })
				this.logger.log(0, "validateAndFixModel", "No widget object : " + widgetID)
			}
		}

		for (let lineID in model.lines) {
			let line = model.lines[lineID]
			if (line) {
				let lineValid = true
				if (!model.widgets[line.to] && !model.screens[line.to] && model.groups && !model.groups[line.to]) {
					lineValid = false
					this.logger.warn("validateAndFixModel", "No line to:", line)
				}

				if (!model.widgets[line.from] && !model.screens[line.from] && model.groups && !model.groups[line.from]) {
					lineValid = false
					this.logger.warn("validateAndFixModel", "No line from :" + lineID)
				}

				if (!lineValid) {
					delete model.lines[lineID]
					errors.push({ id: line.from, msg: "No line to or from" })
				}
			} else {
				this.logger.log(0, "validateAndFixModel", "No line object : " + lineID)
			}
		}

		if (model.groups) {
			for (let groupID in model.groups) {
				let group = model.groups[groupID]
				if (group) {
					let children = lang.clone(group.children)
					for (let i = 0; i < children.length; i++) {
						let widgetID = children[i]
						let widget = model.widgets[widgetID]
						if (!widget) {
							group.children.splice(i, 1)
							errors.push({ id: groupID, msg: "No group member " + widgetID })
							this.logger.log(0, "validateAndFixModel", "group  " + groupID + " has not exisitng widget " + widgetID)
						}
					}

					/**
					 * This can happen. Don't make a mess, just remove empty group
					 */
					let groupLength = 0
					if (group.groups) {
						groupLength = group.groups.length
					}
					if (group.children.length === 0 && groupLength === 0) {
						this.logger.log(-1, "validateAndFixModel", "group  " + groupID + "  was empty")
						delete model.groups[groupID]
					}
				}
			}
		}

		if (errors.length > 0) {
			this.logger.log(-1, "validateAndFixModel", "exit() > Found  " + errors.length + " errors", errors)
		}

		return errors
	}

	fixMissingSubgroups (model) {
		
		if (model.groups) {
			for (let groupID in model.groups) {
				const group = model.groups[groupID]
		
				if (group.groups) {		
					const missing = {}
					group.groups.forEach(id => {
						if (!model.groups[id]) {
							missing[id] = true
						}
					})
					
					if (Object.values(missing).length > 0) {
						console.debug(JSON.stringify(group.groups))
						group.groups = group.groups.filter(id => !missing[id])
						this.logger.error("fixMissingSubgroups", "fix() > " + group.id)
						console.debug(JSON.stringify(group.groups))
					}
				}
			}
		}
	}

	fixRecursiveGroups (model) {

		const errors = []

		if (model.groups) {
			for (let groupID in model.groups) {
				const group = model.groups[groupID]
				if (group.groups) {
					const index = group.groups.indexOf(groupID)
					if (index >= 0) {
						errors.push({id: groupID, msg: "Recursive Group"})
						group.groups.splice(index, 1)
					}
				}
			}
		}


		if (errors.length > 0) {
			this.logger.error("fixRecursiveGroups", "exit() > Found  " + errors.length + " errors", errors)
		}

		return errors
	}

	isValidLine () {

	}

	/**
	 * There is a nasty bug that miss aligns widgets sometimes by one px.
	 * This method will do some additional logging to find out what is happening
	 */
	fix1PXBug(p, model, pos) {
		if (p === "x" || p === "y") {
			let dif = Math.abs(pos[p] - model[p])
			if (dif === 1) {
				this.showDebugAlert('1 PX Bug')
			}
		}
	}

	showDebugAlert (msg) {
		if (window.location.href.indexOf("localhost") > 0) {
			console.warn(new Error().stack)
			alert(msg)
		}
	}

	_getHoverScreen(box, model) {
		return ModelGeom.getHoverScreen(box, model)
	}
}
export default new ModelFixer()
