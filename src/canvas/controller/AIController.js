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
        const addedScreens = []

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
                addedScreens.push(...Object.values(appFragment.screens || {}))
            } else if (change.type === 'updateScreen' && change.value) {
                if (change.region) {
                    this._applyUpdateRegion(change)
                } else {
                    this._applyUpdateScreen(change)
                }
            } else if (change.type === 'updateWidgets') {
                this._applyUpdateWidgets(change)
            } else if (change.type === 'deleteWidget') {
                this._applyDeleteWidget(change)
            }
        })

        this.render();
        this.commitModelChange()

        /**
         * Where the screens actually landed, so the canvas can focus them.
         * This used to return the paste offset, which only matches the screen
         * position for a screen planned at x=0: a streamed chunk that is not
         * the first one of the plan was focused one screen width off.
         */
        if (addedScreens.length > 0) {
            const box = this.getBoundingBoxByBoxes(addedScreens)
            return { x: box.x, y: box.y, w: box.w, h: box.h }
        }
        pos.w = this.model.screenSize.w
        pos.h = this.model.screenSize.h
        return pos
    }

    /**
     * Applies a regenerated screen (EditTool, update_screen without a region)
     * to the screen it was generated from. The screen keeps its id, name,
     * position, start flag and the links pointing to it; it takes the new
     * background and height. Its widgets are replaced by the fragment's, see
     * _replaceWidgets(): a widget the LLM kept (same data-qid) keeps its id,
     * name and links. Wrapped by the caller's startModelChange /
     * commitModelChange, so one undo restores the old screen.
     */
    _applyUpdateScreen(change) {
        const screen = this.model.screens[change.screenID]
        if (!screen) {
            this.logger.warn(-1, '_applyUpdateScreen', 'No screen with id ' + change.screenID)
            return
        }
        const fragment = change.value || {}
        this._mergeFragmentMeta(fragment)

        // The fragment comes from HTML2QUX with its screen at 0,0. Its widgets
        // move along with the screen, or they land at the canvas origin.
        const fragScreen = Object.values(fragment.screens || {})[0] || {}
        const dx = screen.x - (fragScreen.x || 0)
        const dy = screen.y - (fragScreen.y || 0)
        this._replaceWidgets(screen, this.getModelChildren(screen), fragment, dx, dy)

        if (fragScreen.style && fragScreen.style.background !== undefined) {
            screen.style = screen.style || {}
            screen.style.background = fragScreen.style.background
        }
        if (fragScreen.h > 0) {
            screen.h = fragScreen.h
        }
        this.onModelChanged([])
    }

    /**
     * Applies a regenerated region of a screen (EditTool, update_screen with
     * selected widgets). change.region is the box that was regenerated and
     * the widgets inside it; the rest of the screen stays as it is. The new
     * content is placed at the top of the old box, keeping its horizontal
     * position inside the region. When it is taller or shorter, everything
     * below the region moves by the difference, and the widgets around it (a
     * card or section containing it) grow or shrink with it.
     */
    _applyUpdateRegion(change) {
        const screen = this.model.screens[change.screenID]
        if (!screen) {
            this.logger.warn(-1, '_applyUpdateRegion', 'No screen with id ' + change.screenID)
            return
        }
        const fragment = change.value || {}
        const region = change.region
        this._mergeFragmentMeta(fragment)

        const oldWidgets = (region.widgetIDs || [])
            .map(id => this.model.widgets[id])
            .filter(w => w && screen.children.indexOf(w.id) >= 0)
        const fragScreen = Object.values(fragment.screens || {})[0] || {}
        const fragWidgets = Object.values(fragment.widgets || {})
        const newBox = fragWidgets.length > 0
            ? this.getBoundingBoxByBoxes(fragWidgets)
            : { x: 0, y: 0, w: 0, h: 0 }

        const dx = region.x - (fragScreen.x || 0)
        const dy = region.y - newBox.y
        const delta = Math.round(newBox.h - region.h)
        if (delta !== 0) {
            this._shiftBelowRegion(screen, region, new Set(oldWidgets.map(w => w.id)), delta)
        }

        this._replaceWidgets(screen, oldWidgets, fragment, dx, dy)

        if (delta !== 0) {
            const floor = Math.min(screen.h, this.model.screenSize.h)
            const contentBottom = this.getModelChildren(screen).reduce((max, w) => Math.max(max, w.y + w.h), screen.y)
            screen.h = Math.max(floor, screen.h + delta, contentBottom - screen.y)
        }
        this.onModelChanged([])
    }

    /**
     * Makes room for a region that changed its height by delta: widgets below
     * it move, widgets containing it are resized.
     */
    _shiftBelowRegion(screen, region, replacedIDs, delta) {
        const tolerance = 1
        const bottom = region.y + region.h
        this.getModelChildren(screen).forEach(w => {
            if (replacedIDs.has(w.id)) {
                return
            }
            if (w.y >= bottom - tolerance) {
                w.y += delta
                return
            }
            const contains = w.x <= region.x + tolerance &&
                w.y <= region.y + tolerance &&
                w.x + w.w >= region.x + region.w - tolerance &&
                w.y + w.h >= bottom - tolerance
            if (contains) {
                w.h = Math.max(1, w.h + delta)
            }
        })
    }

    /**
     * Replaces oldWidgets of the screen by the widgets of an HTML2QUX fragment,
     * moved by dx/dy.
     *
     * A fragment widget whose _sourceId (the data-qid of its element, see
     * HTML2QUX.getSourceMarker) names one of the old widgets takes over its
     * id, name and refs, so the prototype links from and to it and the
     * references of other widgets survive the edit. Every other fragment
     * widget gets a fresh id from the model's own counter (the parser ids are
     * only unique within one parse), and the old widgets without a successor
     * are removed with their lines.
     *
     * The groups made only of old widgets are removed, the fragment's groups
     * are added. When the old widgets were part of a bigger group (e.g. a
     * card inside a section group), the new content joins that group.
     */
    _replaceWidgets(screen, oldWidgets, fragment, dx, dy) {
        const oldIDs = new Set(oldWidgets.map(w => w.id))
        const fragWidgets = Object.values(fragment.widgets || {})
            .sort((a, b) => (a.z || 0) - (b.z || 0))

        const idMap = {}
        const kept = new Set()
        fragWidgets.forEach(fw => {
            const source = fw._sourceId
            if (source && oldIDs.has(source) && !kept.has(source)) {
                idMap[fw.id] = source
                kept.add(source)
            } else {
                idMap[fw.id] = 'w' + this.getUUID()
            }
        })

        // while the old group memberships are still there
        const outerGroupID = this._removeGroupsOf(oldIDs)

        oldWidgets
            .filter(w => !kept.has(w.id))
            .forEach(w => {
                this.modelRemoveWidgetAndLines(w, this.getLines(w), this.getReferences(w), true)
            })

        // the new content is drawn above what stays of the screen
        const others = this.getModelChildren(screen).filter(w => !oldIDs.has(w.id))
        let z = others.length > 0 ? this.getMaxZValue(others) + 1 : 1

        fragWidgets.forEach(fw => {
            const id = idMap[fw.id]
            const old = this.model.widgets[id]
            const widget = lang.clone(fw)
            delete widget._sourceId
            widget.id = id
            widget.x = Math.round(fw.x + dx)
            widget.y = Math.round(fw.y + dy)
            widget.z = z++
            widget.modified = new Date().getTime()
            if (old) {
                widget.name = old.name
                if (old.props && old.props.refs) {
                    widget.props = widget.props || {}
                    widget.props.refs = old.props.refs
                }
            }
            this.model.widgets[id] = widget
            if (screen.children.indexOf(id) < 0) {
                screen.children.push(id)
            }
        })

        this._addFragmentGroups(fragment, idMap, outerGroupID)
    }

    /**
     * Removes the groups made only of the given widgets (and of such groups),
     * and the given widgets from every other group.
     *
     * @returns {string|null} the group the new content should join: the
     *   innermost group that lost members, when there is exactly one
     */
    _removeGroupsOf(widgetIDs) {
        if (!this.model.groups) {
            this.model.groups = {}
        }
        const groups = this.model.groups
        const deleted = new Set()
        let changed = true
        while (changed) {
            changed = false
            Object.values(groups).forEach(g => {
                if (deleted.has(g.id)) {
                    return
                }
                const children = g.children || []
                const subs = g.groups || []
                if (children.length + subs.length > 0 &&
                    children.every(id => widgetIDs.has(id)) &&
                    subs.every(id => deleted.has(id))) {
                    deleted.add(g.id)
                    changed = true
                }
            })
        }
        deleted.forEach(id => delete groups[id])
        // a link can start at a group, it must not point into nothing
        Object.values(this.model.lines || {}).forEach(line => {
            if (deleted.has(line.from) || deleted.has(line.to)) {
                delete this.model.lines[line.id]
            }
        })

        const touched = []
        Object.values(groups).forEach(g => {
            const before = (g.children || []).length + (g.groups || []).length
            g.children = (g.children || []).filter(id => !widgetIDs.has(id))
            g.groups = (g.groups || []).filter(id => !deleted.has(id))
            if (g.children.length + g.groups.length < before) {
                touched.push(g)
            }
        })

        const innermost = touched.filter(g => !touched.some(other => other !== g && this._isAncestorGroup(g, other.id)))
        const result = innermost.length === 1 ? innermost[0].id : null
        touched
            .filter(g => g.id !== result && g.children.length + g.groups.length === 0)
            .forEach(g => delete groups[g.id])
        return result
    }

    _isAncestorGroup(group, groupID, depth = 0) {
        if (!group || depth > 20) {
            return false
        }
        return (group.groups || []).some(id => id === groupID || this._isAncestorGroup(this.model.groups[id], groupID, depth + 1))
    }

    _addFragmentGroups(fragment, idMap, outerGroupID) {
        const fragGroups = Object.values(fragment.groups || {})
        const groupIDMap = {}
        fragGroups.forEach(g => {
            groupIDMap[g.id] = 'g' + this.getUUID()
        })

        const added = []
        fragGroups.forEach(g => {
            const children = (g.children || []).map(id => idMap[id]).filter(Boolean)
            if (children.length === 0 && (g.groups || []).length === 0) {
                return
            }
            const group = lang.clone(g)
            group.id = groupIDMap[g.id]
            group.children = children
            this.model.groups[group.id] = group
            added.push(group)
        })
        // only now every added group is known
        const members = new Set()
        added.forEach(group => {
            group.groups = (group.groups || [])
                .map(id => groupIDMap[id])
                .filter(id => id && this.model.groups[id])
            group.children.forEach(id => members.add(id))
            group.groups.forEach(id => members.add(id))
        })

        const outer = outerGroupID && this.model.groups[outerGroupID]
        if (outer) {
            Object.values(fragment.widgets || {})
                .map(fw => idMap[fw.id])
                .filter(id => !members.has(id))
                .forEach(id => outer.children.push(id))
            added
                .filter(group => !members.has(group.id))
                .forEach(group => outer.groups.push(group.id))
        }
    }

    /**
     * The fragment can carry its own designtokens (and templates), mirror the
     * addScreen branch.
     */
    _mergeFragmentMeta(fragment) {
        if (fragment.designtokens && this.model) {
            this.model.designtokens = this.model.designtokens || {}
            Object.assign(this.model.designtokens, fragment.designtokens)
        }
        if (fragment.templates && this.model) {
            this.model.templates = this.model.templates || {}
            Object.assign(this.model.templates, fragment.templates)
        }
    }

    /**
     * Applies a property patch (EditTool, edit_widgets): new style values,
     * texts and sizes for existing widgets, and a new background for a
     * screen. Everything else of them stays. A design token the new style
     * overrides is unlinked, like a change in the properties panel does.
     */
    _applyUpdateWidgets(change) {
        (change.changes || []).forEach(c => {
            const target = c.target === 'screen' ? this.model.screens[c.id] : this.model.widgets[c.id]
            if (!target) {
                this.logger.warn(-1, '_applyUpdateWidgets', 'No ' + c.target + ' with id ' + c.id)
                return
            }
            if (c.style) {
                this.removeOverwrittenDesignTokens(target, c.style, 'style')
                target.style = Object.assign(target.style || {}, c.style)
            }
            if (c.props) {
                target.props = Object.assign(target.props || {}, c.props)
            }
            if (c.size) {
                if (c.size.w > 0) {
                    target.w = c.size.w
                }
                if (c.size.h > 0) {
                    target.h = c.size.h
                }
            }
            target.modified = new Date().getTime()
        })
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
