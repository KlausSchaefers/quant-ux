import Logger from 'core/Logger'
import JSONPath from 'core/JSONPath'

const isNumeric = /^[-+]?(\d+|\d+\.\d*|\d*\.\d+)$/;

export function executeAction (action, data) {
    Logger.log(-1, 'WorkFlowEngine.executeAction() ', action, data)

    let changes = []

    if (action && action.steps) {
        action.steps.forEach(step => {
            let change = executeStep(step, data)
            // if the value is a JSON, we should call all paths as well...
            if (isObject(change.value)) {
                expandJSON(change.path, change.value, changes)
            }
            if (Array.isArray(change.value)) {
                expandArray(change.path, change.value, changes)
            }
            changes.push(change)
        })
    }

    return changes
}

function expandJSON(path, value, changes) {
    for (let key in value) {
        let childPath = path + "." + key
        let childValue = value[key]
        if (isObject(childValue)) {
            expandJSON(childPath, childValue, changes)
        } else if (Array.isArray(childValue)) {
            expandArray(childPath, childValue, changes)
        } else {
            changes.push({path: childPath, value:childValue})
        }
    }
}


function expandArray(path, value, changes) {
    for (let i = 0; i < value.length; i++) {
        let childPath = path + "[" + i + "]"
        let childValue = value[i]
        if (isObject(childValue)) {
            expandJSON(childPath, childValue, changes)
        } else if (Array.isArray(childValue)) {
            expandArray(childPath, childValue, changes)
        } else {
            changes.push({path: childPath, value:childValue})
        }
    }
}

function executeStep (step, data) {
    Logger.log(-1, 'WorkFlowEngine.executeStep() ', step.operation, step.databinding)
    
    if (step.operation === 'set') {
        return {path: step.databinding, value: getParameter(step.parameter, data)}
    }

    if (step.operation === 'plus') {
        let x = getParameter(step.parameter, data)
        let o = JSONPath.get(data, step.databinding, 0)
        return {path: step.databinding, value: o + x}
    }

    if (step.operation === 'minus') {
        let x = getParameter(step.parameter, data)
        let o = JSONPath.get(data, step.databinding, 0)
        return {path: step.databinding, value: o - x}
    }

    if (step.operation === 'toggle') {
        let o = JSONPath.get(data, step.databinding)
        let x = getParameter(step.parameter, data)
        let y = getParameter(step.parameter2, data)
        if (o != x) {
            return {path: step.databinding, value: x}
        } else {
            return {path: step.databinding, value: y}
        }
    }

    Logger.log(-1, 'WorkFlowEngine.executeStep() > error : Not supported operation', step.operation)
}

function getParameter (parameter, data) {

    // support ${variable}
    if (parameter && parameter.indexOf('${') === 0 && parameter.indexOf('}') === parameter.length-1) {
        let path = parameter.substring(2, parameter.length - 1)
        parameter = JSONPath.get(data, path)
    }

    if (parameter === 'true') {
        return true
    }

    if (parameter === 'false') {
        return false
    }

    if (isNumeric.test(parameter)) {
        return parameter * 1
    }

    if (parameter && isJSON(parameter)) {
        try {
            const obj = JSON.parse(parameter)
            return obj
        } catch (err){
            Logger.error('WorkFlowEngine.getParameter() > error. Could not parse JSON ', parameter)
        }
    }

    return parameter
}

function isJSON (str) {
    return (str.indexOf('{') === 0 && str.indexOf('}') === str.length-1) || (str.indexOf('[') === 0 && str.indexOf(']') === str.length-1)
}

function isObject(value) {
    return typeof value === 'object' && !Array.isArray(value) && value !== null
}