import SVGController from './SVGController'
import lang from '../../dojo/_base/lang'

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

        result.changes.forEach(change => {
            if (change.type === 'addScreen' && change.value) {
                if (change.value.designtokens && this.model) {
                    this.model.designtokens = this.model.designtokens || {}
                    Object.assign(this.model.designtokens, change.value.designtokens)
                }
                if (change.value.templates && this.model) {
                    this.model.templates = this.model.templates || {}
                    Object.assign(this.model.templates, change.value.templates)
                }
                const screenPos = this.getZoomedBox({ x: pos.x, y: pos.y }, zoom, zoom)
                const appFragment = this._setAddPosition(change.value, screenPos)
                this.modelAddScreenAndWidgets(appFragment);
            } else if (change.type === 'updateScreen' && change.value) {
                this._applyUpdateScreen(change)
            } else if (change.type === 'deleteWidget') {
                this._applyDeleteWidget(change)
            }
        })

        this.render();
        this.commitModelChange()
        pos.w = this.model.screenSize.w
        pos.h = this.model.screenSize.h
        return this.getZoomedBox(pos, zoom, zoom)
    }

    /**
     * Replaces the widgets/lines/groups of the target screen in place: the
     * screen id and position are kept, the old content is removed with the
     * modelRemove primitives and the new fragment is added through
     * modelAddScreenAndWidgets. Wrapped by the caller's
     * startModelChange/commitModelChange so undo works.
     */
    _applyUpdateScreen(change) {
        const screenID = change.screenID
        const fragment = change.value || {}
        const oldScreen = this.model.screens[screenID]
        if (!oldScreen) {
            this.logger.warn(-1, '_applyUpdateScreen', 'No screen with id ' + screenID)
            return
        }

        // Mirror the addScreen branch: EditTool.updateScreen can legitimately
        // reference shared components (AgentMemory keeps componentTemplates
        // for the whole chat session, not just the create_app turn that first
        // built them) and instantiate them via ComponentInstantiator, so the
        // fragment can carry its own templates/designtokens too.
        if (fragment.designtokens && this.model) {
            this.model.designtokens = this.model.designtokens || {}
            Object.assign(this.model.designtokens, fragment.designtokens)
        }
        if (fragment.templates && this.model) {
            this.model.templates = this.model.templates || {}
            Object.assign(this.model.templates, fragment.templates)
        }

        const pos = { x: oldScreen.x, y: oldScreen.y }

        // collect the old content before removing it
        const widgets = this.getModelChildren(oldScreen)
        const lines = this.getLines(oldScreen, true)
        const groups = this.getGroupsForWidgets(widgets)

        widgets.forEach(w => {
            const refs = this.getReferences(w)
            this.modelRemoveWidgetAndLines(w, lines, refs, true)
        })
        groups.forEach(g => {
            if (this.model.groups[g.id]) {
                delete this.model.groups[g.id]
            }
        })
        // drop any leftover lines of the old screen
        lines.forEach(line => {
            delete this.model.lines[line.id]
        })

        // rebuild the fragment so its screen keeps the target id and position
        const appFragment = lang.clone(fragment)
        if (appFragment.screens) {
            const fragScreen = Object.values(appFragment.screens)[0]
            if (fragScreen) {
                fragScreen.id = screenID
                fragScreen.x = pos.x
                fragScreen.y = pos.y
                appFragment.screens = {}
                appFragment.screens[screenID] = fragScreen
            }
        }

        // remove the old screen so the fragment screen (same id) can take over
        delete this.model.screens[screenID]
        this.modelAddScreenAndWidgets(appFragment)
        this.onModelChanged([])
    }

    /**
     * Removes the selected widgets and their lines via modelRemoveWidgetAndLines.
     */
    _applyDeleteWidget(change) {
        const ids = (change && change.ids) || []
        ids.forEach(id => {
            const widget = this.model.widgets[id]
            if (widget) {
                const lines = this.getLines(widget)
                const refs = this.getReferences(widget)
                this.modelRemoveWidgetAndLines(widget, lines, refs, true)
            }
        })
        this.onModelChanged([])
    }

    /**
     * Unlocks screens and widgets generated during an AI session.
     */
    unlockSessionScreens(sessionID) {
        if (!this.model) {
            return
        }
        this.startModelChange()
        if (sessionID) {
            Object.values(this.model.screens || {}).forEach(s => {
                if (s.aiID === sessionID) {
                    delete s.locked
                }
            })
            Object.values(this.model.widgets || {}).forEach(w => {
                if (w.aiID === sessionID || (w.props && w.props.locked)) {
                    delete w.locked
                    if (w.props) {
                        delete w.props.locked
                    }
                }
            })
        } else {
            Object.values(this.model.screens || {}).forEach(s => {
                delete s.locked
            })
            Object.values(this.model.widgets || {}).forEach(w => {
                delete w.locked
                if (w.props) {
                    delete w.props.locked
                }
            })
        }
        this.commitModelChange()
        this.render()
        this.onModelChanged([])
    }

    /**
     * Computes the best top level offset for pasting the screens/widgets
     * contained in an AI result. The result is basically its own little
     * model (see the "value" of an "add" change), with its screens usually
     * starting close to x:0, y:0 (see Agent.layoutScreens()).
     *
     * We anchor to the right of the right most screen of the whole model -
     * not just the ones currently visible in the viewport - so a new batch
     * never lands on top of a screen that simply isn't in view right now
     * (e.g. it sits further right than whatever the viewport happens to
     * show). If the model has no screens at all, we center in the viewport
     * - see getCenteredPastePosition().
     */
    getPastePosition(result, viewport) {
        const newScreens = this.getAddedScreens(result)
        if (newScreens.length === 0) {
            return {
                x: Math.max(0, Math.round(viewport.x)),
                y: Math.max(0, Math.round(viewport.y))
            }
        }

        const bbox = this.getBoundingBoxByBoxes(newScreens)
        const existingScreens = Object.values(this.model.screens || {})

        let topLeft
        if (existingScreens.length === 0) {
            topLeft = this.getCenteredPastePosition(bbox, viewport)
        } else {
            const rightMostScreen = existingScreens.reduce((rightMost, screen) => {
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
     * Where to drop content when nothing is currently visible to anchor it
     * to (an empty canvas, or the user panned somewhere empty). Centers the
     * pasted bounding box inside the visible viewport instead of a fixed
     * VIEWPORT_INSET offset from the viewport's top-left corner - the old
     * behavior always landed new content in the same corner of an empty
     * canvas rather than where the user is actually looking, and clamped to
     * the model's (0,0) origin even when the viewport itself had panned to
     * negative coordinates.
     *
     * Falls back to VIEWPORT_INSET (still relative to the real viewport, not
     * the model origin) when the content is too large to center without
     * pushing its opposite edge out of view.
     */
    getCenteredPastePosition(bbox, viewport) {
        return {
            x: Math.round(viewport.x + Math.max(VIEWPORT_INSET, (viewport.w - bbox.w) / 2)),
            y: Math.round(viewport.y + Math.max(VIEWPORT_INSET, (viewport.h - bbox.h) / 2))
        }
    }

    /**
     * Collects the screens of all "add" changes into a flat list.
     */
    getAddedScreens(result) {
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
    getScreensInViewport(viewport) {
        const viewBox = { x: viewport.x, y: viewport.y, w: viewport.w, h: viewport.h }
        return Object.values(this.model.screens || {})
            .filter(screen => this.isBoxOverlapping(viewBox, screen))
    }

    isBoxOverlapping(a, b, margin = 0) {
        return (
            a.x < b.x + b.w + margin &&
            a.x + a.w + margin > b.x &&
            a.y < b.y + b.h + margin &&
            a.y + a.h + margin > b.y
        )
    }
}
