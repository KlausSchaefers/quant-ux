import SVGController from './SVGController'

/**
 * Space we keep between a pasted result and any existing screen, and
 * the grid size used while searching for a free spot.
 */
const PASTE_MARGIN = 80

/**
 * Small offset from the viewport corner, so pasted content does not
 * stick directly to the edge of the visible area.
 */
const VIEWPORT_INSET = 40

export default class AIController extends SVGController {

    addAiResult(result, viewport) {
	    this.logger.log(-1, "addAiResult", "enter > viewport : ", viewport);

        this.startModelChange()
        const pos = this.getPastePosition(result, viewport)
        const zoom = this.getZoomFactor();

        result.changes
            .filter(change => change.type === 'addScreen' && change.value)
            .forEach(change => {
                const screenPos = this.getZoomedBox({ x: pos.x, y: pos.y }, zoom, zoom)
                const appFragment = this._setAddPosition(change.value, screenPos)
                this.modelAddScreenAndWidgets(appFragment);
            })

        this.render();
		this.commitModelChange()
        pos.w = this.model.screenSize.w
        pos.h = this.model.screenSize.h
        return this.getZoomedBox(pos, zoom, zoom)
    }

    /**
     * Computes the best top level offset for pasting the screens/widgets
     * contained in an AI result. The result is basically its own little
     * model (see the "value" of an "add" change), with its screens usually
     * starting close to x:0, y:0 (see Agent.layoutScreens()).
     *
     * We only look at the screens currently visible in the viewport and
     * place the new content to the right of the right most one, at the
     * same y. If nothing is visible, we just drop it into the viewport.
     */
    getPastePosition (result, viewport) {
        const newScreens = this.getAddedScreens(result)
        if (newScreens.length === 0) {
            return {
                x: Math.max(0, Math.round(viewport.x)),
                y: Math.max(0, Math.round(viewport.y))
            }
        }

        const bbox = this.getBoundingBoxByBoxes(newScreens)
        const visibleScreens = this.getScreensInViewport(viewport)

        let topLeft
        if (visibleScreens.length === 0) {
            topLeft = {
                x: Math.max(0, Math.round(viewport.x + VIEWPORT_INSET)),
                y: Math.max(0, Math.round(viewport.y + VIEWPORT_INSET))
            }
        } else {
            const rightMostScreen = visibleScreens.reduce((rightMost, screen) => {
                return (screen.x + screen.w) > (rightMost.x + rightMost.w) ? screen : rightMost
            })
            topLeft = {
                x: rightMostScreen.x + rightMostScreen.w + PASTE_MARGIN,
                y: rightMostScreen.y
            }
        }

        return {
            x: Math.round(topLeft.x - bbox.x),
            y: Math.round(topLeft.y - bbox.y)
        }
    }

    /**
     * Collects the screens of all "add" changes into a flat list.
     */
    getAddedScreens (result) {
        const screens = []
        const changes = (result && result.changes) || []
        changes
            .filter(change => change.type === 'addScreen' && change.value && change.value.screens)
            .forEach(change => {
                screens.push(...Object.values(change.value.screens))
            })
        return screens
    }

    /**
     * Screens of the current model that are (at least partially) visible
     * inside the given viewport.
     */
    getScreensInViewport (viewport) {
        const viewBox = { x: viewport.x, y: viewport.y, w: viewport.w, h: viewport.h }
        return Object.values(this.model.screens || {})
            .filter(screen => this.isBoxOverlapping(viewBox, screen))
    }

    isBoxOverlapping (a, b, margin = 0) {
        return (
            a.x < b.x + b.w + margin &&
            a.x + a.w + margin > b.x &&
            a.y < b.y + b.h + margin &&
            a.y + a.h + margin > b.y
        )
    }
}
