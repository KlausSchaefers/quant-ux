import Logger from '../core/Logger'
import 'simplebar'
import 'simplebar/dist/simplebar.css'

export function addScrollIfNeeded(node, force = false) {
    if (navigator.platform.indexOf('Win') > -1 || force) {
        Logger.log(-1, "ScrollUtil.addScrollIfNeeded() Detected Windows. Add JS Scrollbars")
        node.setAttribute('data-simplebar', true)
        return true
    }
    return false
}

export function addScrollCSSIfNeeded(node, force = true) {
    if (navigator.platform.indexOf('Win') > -1 || force) {
        node.classList.add("MatcScrollContainer");
        return true
    }
    return false
}