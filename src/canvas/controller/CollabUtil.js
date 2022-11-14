import * as MergeUtil from './MergeUtil'


export function getMiniChanges (changes, options = {}) {
	return changes.map(change => getMiniChange(change, options))
}

export function getMiniChange(change, options = {}) {
	let result = {
		id: change.name,
		type: change.type,
		parent: change.parent,
		value: change.object
	}
	/**
	 * We only do mini difs if we have an update and a parent.
	 */
	if (change.object && change.oldValue && change.type === 'update' && change.parent) {
		result.value = MergeUtil.getDelta(change.oldValue, change.object)
		result.diff = true
	}
	if (change.type === 'update' && options[change.name] === "inc") {
		result.value = {
			_isInc: true,
			value: change.object,
			inc: change.object - change.oldValue
		}
	}
	/**
	 * FIXME: add here some logic for lastUUID
	 */
	return result
}

/**
 * Try to keep in sync with JS Objetc.Observe()
 *
 * https://developer.mozilla.org/pt-PT/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
 *
 * Returns a list of:
 * - name: The name of the property which was changed.
 * - object: The changed object after the change was made.
 * - type: A string indicating the type of change taking place. One of "add", "update", or "delete".
 * - oldValue: Only for "update" and "delete" types. The value before the change
 * - parent: The name of the parent node in case of widgets or so
 */
export function getModelDelta(objOld, objNew) {
	let changes = []

	/**
	 * some children have to looked deeper into..
	 */
	const specialChildren = {
		screens: true,
		widgets: true,
		lines: true,
		templates: true,
		groups: true,
		fonts: true,
		imports: true,
		designtokens: true,
		schemas: true
	}

	/**
	 * check which things have changed in the new model
	 */
	for (let key in objOld) {
		const vOld = objOld[key]
		const vNew = objNew[key]
		if (specialChildren[key]) {
			let childChanges = getChanges(vOld, vNew, key)
			changes = changes.concat(childChanges)
		} else {
			let change = getChange(key, vOld, vNew)
			if (change) {
				changes.push(change)
			}
		}
	}

	/**
	 * check which things were added
	 */
	for (let key in objNew) {
		const vOld = objOld[key]
		const vNew = objNew[key]
		if (vOld === undefined || vOld === null) {
			const change = {
				name: key,
				type: "add",
				object: vNew,
			}
			changes.push(change)
		}
	}
	return changes
}

function getChanges(objOld, objNew, parentPath) {
	let changes = []

	/**
	 * check which things have changed in the new model
	 */
	for (let key in objOld) {
		const vOld = objOld[key]
		const vNew = objNew[key]
		const change = getChange(key, vOld, vNew)
		if (change) {
			change.parent = parentPath
			changes.push(change)
		}
	}

	/**
	 * check which things were added
	 */
	for (let key in objNew) {
		const vOld = objOld[key]
		const vNew = objNew[key]
		if (vOld === undefined || vOld === null) {
			let change = {
				name: key,
				type: "add",
				object: vNew,
				parent: parentPath,
			}
			changes.push(change)
		}
	}
	return changes
}

function getChange(key, vOld, vNew) {
	if (vNew === undefined || vNew === null) {
		return {
			name: key,
			type: "delete",
			oldValue: vOld,
		}
	} else if (typeof vOld !== typeof vNew) {
		return {
			name: key,
			type: "update",
			object: vNew,
			oldValue: vOld,
		}
	} else if (vOld instanceof Object && vNew instanceof Object) {
		if (!objectEquals(vOld, vNew)) {
			return {
				name: key,
				type: "update",
				object: vNew,
				oldValue: vOld,
			}
		}
	} else if (vNew !== vOld) {
		return {
			name: key,
			type: "update",
			object: vNew,
			oldValue: vOld,
		}
	}
}

function countProps(obj) {
	let count = 0
	for (let k in obj) {
		if (obj.hasOwnProperty(k)) {
			count++
		}
	}
	return count
}

function objectEquals(v1, v2) {
	if (typeof v1 !== typeof v2) {
		return false
	}

	if (typeof v1 === "function") {
		return v1.toString() === v2.toString()
	}

	if (v1 instanceof Object && v2 instanceof Object) {
		if (countProps(v1) !== countProps(v2)) {
			return false
		}
		let r = true
		for (let k in v1) {
			r = objectEquals(v1[k], v2[k])
			if (!r) {
				return false
			}
		}
		return true
	} else {
		if (v1 === v2) {
			return true
		} else {
			return false
		}
	}
}
