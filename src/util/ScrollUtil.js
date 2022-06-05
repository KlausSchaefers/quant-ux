import Logger from '../core/Logger'
import 'simplebar'; // or "import SimpleBar from 'simplebar';" if you want to use it manually.
import 'simplebar/dist/simplebar.css';

export function addScrollIfNeeded(node) {
    if (navigator.platform.indexOf('Win') > -1) {
        Logger.log(-1, "ScrollUtil.addScrollIfNeeded() Detected Windows. Add JS Scrollbars")
        node.setAttribute('data-simplebar', true)
    }
}