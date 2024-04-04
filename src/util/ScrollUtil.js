import Logger from '../core/Logger'
import 'simplebar'
import 'simplebar/dist/simplebar.css'

const forceSimpleBar = false

export function addScrollIfNeeded(node) {
    if (navigator.platform.indexOf('Win') > -1 || forceSimpleBar) {
        Logger.log(-1, "ScrollUtil.addScrollIfNeeded() Detected Windows. Add JS Scrollbars")
        node.setAttribute('data-simplebar', true)
        return true
    }
    return false
}