import topic from 'dojo/topic'
import Logger from 'common/Logger'
import * as SnappUtil from 'core/SnappUtil'
import ModelUtil from 'core/ModelUtil'
import GridAndRulerSnapp from './GridAndRulerSnapp'

/**
 * SnappingEngine — a clean snapping & alignment engine that shares the same
 * public interface as GridAndRulerSnapp:
 *
 *   start(canvas, selectedType, selectedModel, activePoint, grid, zoom)
 *   correct(absPos, e, mouse)   → returns corrected absPos
 *   cleanUp()                   → inherited from GridAndRulerSnapp / Core
 *
 * Key differences from GridAndRulerSnapp:
 *
 *   1. LayoutContainer (GridContainer) snap is fully supported: when the
 *      dragged widget hovers over a GridContainer the engine switches to grid
 *      snap lines exactly like GridAndRulerSnapp does.
 *   2. Full 4-direction pattern detection: the engine analyses the dominant
 *      inter-element gap among same-screen siblings and projects snap targets
 *      in all four directions (left, right, above, below) so the user can
 *      place a widget at equal spacing.
 *   3. Pattern targets are actual snap lines, not just visual guides — the
 *      widget truly snaps to them when within snappDistance.
 *   4. Pattern distance guides are rendered as visual feedback while dragging
 *      even before the snap activates, giving the user layout intent cues.
 *
 * Model assumptions (absolute canvas coordinates throughout):
 *   model.screens : { [id]: { x, y, w, h, children: [widgetId, ...] } }
 *   model.widgets : { [id]: { x, y, w, h, z, type, ... } }
 *   model and sourceModel are read from canvas inside start().
 */
export default class SnappingEngine extends GridAndRulerSnapp {

    constructor () {
        super()
        this.logger = new Logger('SnappingEngine')
        this.logger.log(2, 'constructor', 'entry')
        // patternNeighbourhood: gaps within this many pixels are considered equal
        this.patternNeighbourhood = 8
        // minimum number of equal gaps required to infer a pattern
        this.patternMinCount = 2
        // patternWeight: distance multiplier applied to pattern lines before
        // competing with edge/middle lines.  Values < 1 give patterns higher
        // effective priority — a value of 0.4 means a pattern line at 12 px
        // beats an edge line at 5 px (12×0.4 = 4.8 < 5).
        this.patternWeight = 0.4
    }

    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // Core correction loop
    // -------------------------------------------------------------------------

    /**
     * Public entry point — matches the GridAndRulerSnapp interface exactly.
     * Wraps _correct() with error handling so a snap bug never breaks the drag.
     */
    correct (absPos, e, mouse) {
        try {
            return this._correct(absPos, e, mouse)
        } catch (error) {
            this.logger.error('correct', 'Unhandled error', error)
            this.logger.sendError(error)
        }
        return absPos
    }

    /**
     * Core per-frame snapping logic.
     *
     * Flow:
     *   1.  Fix bounding-box geometry anomaly.
     *   2.  Detect LayoutContainer hover → init grid lines; else detect parent screen.
     *   3.  Update movement direction buffer.
     *   4.  SHIFT key: pre-apply proportional resize.
     *   5.  CTRL/META: skip snap, show NN distance, return.
     *   6.  Build corner arrays for the active resize handle.
     *   7.  Find closest edge snap line (X + Y).
     *   8.  Find closest middle snap line (X + Y, grid disabled only).
     *   9.  Find closest pattern snap target (X + Y, move only, grid disabled).
     *   10. Resolve per-axis winner, apply correction.
     *   11. Post-SHIFT correction, clamp dimensions.
     *   12. Render NN distance feedback.
     *   13. Publish position topic, return corrected absPos.
     */
    _correct (absPos, e) {

        // --- 0. Clean up distance lines from previous frame -------------------
        this.cleanupDistanceLines()

        // --- 1. Bounding-box geometry fix ------------------------------------
        if (this.selectedType === 'boundingbox') {
            absPos.w = this.selectedModel.w
            absPos.h = this.selectedModel.h
        }

        absPos.z      = this.selectedModel.z
        absPos.type   = this.selectedType
        absPos.source = this.selectedID

        // --- 2. LayoutContainer detection (GridContainer snap) ---------------
        //   When the dragged widget is over a GridContainer we switch to grid
        //   snap lines (same behaviour as GridAndRulerSnapp).  Otherwise we
        //   fall through to normal screen-level snap line initialisation.
        const layoutContainer = this.findHoverLayoutContainer(absPos)
        if (layoutContainer) {
            this.initLayoutContainerLines(layoutContainer)
            this.snappDistance = 64
            this.showDistance  = 24
        } else {
            this.snappDistance = 8
            this.showDistance  = 15
            if (!this._lastScreen || !this._isBoxChild(absPos, this._lastScreen)) {
                this.initLines(absPos)
            }
        }

        if (!this._lastScreen && !layoutContainer) {
            return absPos
        }

        // --- 3. Movement direction --------------------------------------------
        this.updateMovements(absPos)
        let left = this.getMovementDir(this.xMovements)
        let top  = this.getMovementDir(this.yMovements)

        const showDistanceXLeft = left
        const showDistanceYTop  = top

        // --- 4. SHIFT key: proportional resize (pre-snap) --------------------
        if (e.shiftKey) {
            const scaled = ModelUtil.scaleToSelection(this.selectedModel, absPos, this.activePoint)
            absPos.x = scaled.x
            absPos.y = scaled.y
            absPos.w = scaled.w
            absPos.h = scaled.h
        }

        // --- 5. CTRL / META: bypass snap, show NN distance only --------------
        if (e.ctrlKey || e.metaKey) {
            this.hideLines()
            this.hideBoxes()
            if (this.showDndDistance && this.selectedType !== 'Xboundingbox') {
                try {
                    this.renderNNDistance(absPos, top, left)
                } catch (err) {
                    console.debug(err)
                }
            }
            return absPos
        }

        // --- 6. Corner arrays for the active resize handle -------------------
        const corners = this.getCorners(absPos, this.grid.enabled, layoutContainer, left, top)

        // --- 7. Closest edge snap lines (X + Y) ------------------------------
        const lineX      = SnappUtil.getFilteredLinesX(this._linesX, this.activePoint, layoutContainer, left)
        const lineY      = SnappUtil.getFilteredLinesY(this._linesY, this.activePoint, layoutContainer, top)
        const closeXLine = SnappUtil.getCloseLines(this.showDistance, lineX,  'x', corners.x, false, 'corner', absPos)
        const closeYLine = SnappUtil.getCloseLines(this.showDistance, lineY,  'y', corners.y, false, 'corner', absPos)

        // Inside a GridContainer we don't adjust direction from the snap result
        // (mirrors GridAndRulerSnapp behaviour)
        if (!layoutContainer) {
            left = SnappUtil.correctSnappDirection(closeXLine, left)
            top  = SnappUtil.correctSnappDirection(closeYLine, top)
        }

        // --- 8. Closest middle snap lines (grid disabled only) ---------------
        let closeXMiddle = null
        let closeYMiddle = null
        if (!this.grid.enabled) {
            closeXMiddle = SnappUtil.getCloseLines(this.showDistance, this._linesXMiddle, 'x', corners.mx, 'Grid', 'middle', absPos)
            closeYMiddle = SnappUtil.getCloseLines(this.showDistance, this._linesYMiddle, 'y', corners.my, 'Grid', 'middle', absPos)
        }

        // --- 9. Pattern snap targets (move mode, no grid, not in a LayoutContainer) ---
        let closeXPattern = null
        let closeYPattern = null

        if (!layoutContainer && !this.grid.enabled && this.activePoint === 'All') {
            const siblings = this._getSiblings()
            if (siblings.length >= 2) {
                // Render visual distance guides for the current dominant gap
                this._renderPatternFeedback(absPos, siblings)

                const patternTargetsX = this._computePatternTargetsX(absPos, siblings)
                const patternTargetsY = this._computePatternTargetsY(absPos, siblings)

                closeXPattern = SnappUtil.getCloseLines(this.showDistance, patternTargetsX, 'x', corners.x, false, 'pattern')
                closeYPattern = SnappUtil.getCloseLines(this.showDistance, patternTargetsY, 'y', corners.y, false, 'pattern')
            }
        }

        // --- 10. Hide previous frame visuals; resolve winner, apply snap -----
        this.hideLines()
        this.hideBoxes()

        absPos.snapp = { type: this.activePoint, left, top }

        const diff = { x: 0, y: 0 }

        const minLineX = this._getMinLineWeighted([closeXLine, closeXMiddle, closeXPattern])
        if (minLineX) {
            this.correctX(absPos, diff, minLineX)
        }

        const minLineY = this._getMinLineWeighted([closeYLine, closeYPattern, closeYMiddle])
        if (minLineY) {
            this.correctY(absPos, diff, minLineY)
        }

        SnappUtil.snapp(absPos, diff, this.activePoint)

        // --- 11. Post-SHIFT correction + dimension clamp ---------------------
        if (e.shiftKey) {
            const scaled = ModelUtil.scaleToSelection(this.selectedModel, absPos, absPos.snapp.type)
            absPos.x = scaled.x
            absPos.y = scaled.y
            absPos.w = scaled.w
            absPos.h = scaled.h
            if (absPos.snapp) {
                absPos.snapp.scale = true
            }
        }

        if (absPos.w < 0) absPos.w = 1
        if (absPos.h < 0) absPos.h = 1

        // --- 12. NN distance visual feedback ---------------------------------
        if (this.showDndDistance && this.selectedType !== 'Xboundingbox') {
            try {
                this.renderNNDistance(absPos, showDistanceYTop, showDistanceXLeft)
            } catch (err) {
                console.error(err)
                console.error(err.stack)
            }
        }

        // --- 13. Publish + return --------------------------------------------
        topic.publish('matc/box/move', absPos)
        this._lastTop  = top
        this._lastLeft = left
        return absPos
    }

    // -------------------------------------------------------------------------
    // Sibling helpers
    // -------------------------------------------------------------------------

    /**
     * Returns all widgets in the current screen that are eligible snap targets,
     * i.e. excluding the selected widget and any widgets that share its group.
     * Delegates to _getOverlappingBoxes() which already handles selectedIDs,
     * copy-reference mode, and group bounding-box merging.
     */
    _getSiblings () {
        return this._getOverlappingBoxes()
    }

    // -------------------------------------------------------------------------
    // Pattern detection — horizontal (X axis)
    // -------------------------------------------------------------------------

    /**
     * Scans all siblings that share a Y-overlap with absPos, detects the
     * dominant inter-element horizontal gap, and returns a map of virtual snap
     * lines representing equal-spacing targets for the dragged widget's edges.
     *
     * Two target types are generated per sibling s:
     *   "right" — left edge of dragged widget lands at: s.x + s.w + modalGap
     *   "left"  — right edge of dragged widget lands at: s.x − modalGap
     *             (expressed as the x-position SnappUtil compares against corners.x)
     *
     * @param  {Object} absPos   current (pre-snap) position of the dragged widget
     * @param  {Array}  siblings eligible snap-target widgets on the current screen
     * @returns {Object}  map of { [id]: snapLine } virtual pattern snap lines
     */
    _computePatternTargetsX (absPos, siblings) {
        const result = {}

        const yOverlapping = siblings.filter(s => this.isOverLappingY(absPos, s))
        if (yOverlapping.length < 2) return result

        const sorted = yOverlapping.slice().sort((a, b) => a.x - b.x)
        const gaps = []
        for (let i = 0; i < sorted.length - 1; i++) {
            const gap = sorted[i + 1].x - (sorted[i].x + sorted[i].w)
            if (gap > 0) gaps.push(gap)
        }

        const modalGap = this._findModalGap(gaps)
        if (modalGap === null) return result

        // Only project from the two nearest siblings (one on each side) to
        // avoid flooding the snap pool with many competing targets.
        const nearestLeft  = this._getNearestLeft(absPos.x, sorted, 'x', 'w')
        const nearestRight = this._getNearestRight(absPos.x + absPos.w, sorted, 'x')

        if (nearestLeft) {
            const snapRight = nearestLeft.x + nearestLeft.w + modalGap
            result['pxR' + snapRight] = this._makePatternLineX('pxR' + snapRight, snapRight, nearestLeft.id, modalGap, 'right')
        }
        if (nearestRight) {
            const snapLeft = nearestRight.x - modalGap
            result['pxL' + snapLeft] = this._makePatternLineX('pxL' + snapLeft, snapLeft, nearestRight.id, modalGap, 'left')
        }

        return result
    }

    _makePatternLineX (id, x, refId, gap, dir) {
        return {
            id,
            x,
            type:     'Pattern',
            lineType: 'pattern',
            visible:  false,
            offset:   0,
            count:    0,
            boxes:    [refId],
            snapp: { type: 'PatternX', refId, gap, dir }
        }
    }

    // -------------------------------------------------------------------------
    // Pattern detection — vertical (Y axis)
    // -------------------------------------------------------------------------

    /**
     * Scans all siblings that share an X-overlap with absPos, detects the
     * dominant inter-element vertical gap, and returns virtual snap lines for
     * equal-spacing targets on the Y axis.
     *
     * Two target types per sibling s:
     *   "below" — top edge of dragged widget lands at: s.y + s.h + modalGap
     *   "above" — bottom edge of dragged widget lands at: s.y − modalGap
     *
     * @param  {Object} absPos
     * @param  {Array}  siblings
     * @returns {Object} map of { [id]: snapLine }
     */
    _computePatternTargetsY (absPos, siblings) {
        const result = {}

        const xOverlapping = siblings.filter(s => this.isOverLappingX(absPos, s))
        if (xOverlapping.length < 2) return result

        const sorted = xOverlapping.slice().sort((a, b) => a.y - b.y)
        const gaps = []
        for (let i = 0; i < sorted.length - 1; i++) {
            const gap = sorted[i + 1].y - (sorted[i].y + sorted[i].h)
            if (gap > 0) gaps.push(gap)
        }

        const modalGap = this._findModalGap(gaps)
        if (modalGap === null) return result

        // Only project from the two nearest siblings (one on each side).
        const nearestAbove = this._getNearestLeft(absPos.y, sorted, 'y', 'h')
        const nearestBelow = this._getNearestRight(absPos.y + absPos.h, sorted, 'y')

        if (nearestAbove) {
            const snapBelow = nearestAbove.y + nearestAbove.h + modalGap
            result['pyB' + snapBelow] = this._makePatternLineY('pyB' + snapBelow, snapBelow, nearestAbove.id, modalGap, 'below')
        }
        if (nearestBelow) {
            const snapAbove = nearestBelow.y - modalGap
            result['pyA' + snapAbove] = this._makePatternLineY('pyA' + snapAbove, snapAbove, nearestBelow.id, modalGap, 'above')
        }

        return result
    }

    _makePatternLineY (id, y, refId, gap, dir) {
        return {
            id,
            y,
            type:     'Pattern',
            lineType: 'pattern',
            visible:  false,
            offset:   0,
            count:    0,
            boxes:    [refId],
            snapp: { type: 'PatternY', refId, gap, dir }
        }
    }

    // -------------------------------------------------------------------------
    // Weighted line selection
    // -------------------------------------------------------------------------

    /**
     * Chooses the best snap line from a list of candidates using distance
     * weighting rather than raw minimum distance.
     *
     * Each candidate's effective distance is:  Math.abs(dist) × typeWeight
     *
     * Type weights:
     *   pattern  →  this.patternWeight (default 0.4) — strongly preferred
     *   corner   →  1.0
     *   middle   →  1.0
     *
     * This ensures pattern lines win against edge lines unless the edge is
     * substantially closer, solving the "gets lost in many snap lines" problem.
     *
     * Post-processing mirrors SnappUtil.getMinLine:
     *   - pattern winner: delete .snapp (prevents Mirror-distance rendering)
     *   - middle  winner: add    .middle = true
     *
     * @param  {Array} candidates  array of snap-line results (may contain nulls)
     * @returns {Object|null}
     */
    _getMinLineWeighted (candidates) {
        let best        = null
        let bestEffDist = Infinity

        for (const line of candidates) {
            if (!line) continue
            const weight  = line.lineType === 'pattern' ? this.patternWeight : 1.0
            const effDist = Math.abs(line.dist) * weight
            if (effDist < bestEffDist) {
                bestEffDist = effDist
                best = line
            }
        }

        if (!best) return null

        if (best.lineType === 'pattern') delete best.snapp
        if (best.lineType === 'middle')  best.middle = true

        return best
    }

    /**
     * From a sorted sibling array, find the one whose trailing edge
     * (axis + sizeKey) is as close as possible to refEdge without exceeding it.
     * Used for: nearest sibling LEFT of absPos.x  (axis='x', sizeKey='w')
     *           nearest sibling ABOVE absPos.y    (axis='y', sizeKey='h')
     */
    _getNearestLeft (refEdge, sorted, axis, sizeKey) {
        let nearest = null
        let minDist = Infinity
        for (const s of sorted) {
            const trailing = s[axis] + s[sizeKey]
            if (trailing <= refEdge) {
                const dist = refEdge - trailing
                if (dist < minDist) {
                    minDist = dist
                    nearest = s
                }
            }
        }
        return nearest
    }

    /**
     * From a sorted sibling array, find the one whose leading edge (axis) is
     * as close as possible to refEdge without being less than it.
     * Used for: nearest sibling RIGHT of absPos.x + absPos.w  (axis='x')
     *           nearest sibling BELOW absPos.y  + absPos.h    (axis='y')
     */
    _getNearestRight (refEdge, sorted, axis) {
        let nearest = null
        let minDist = Infinity
        for (const s of sorted) {
            const leading = s[axis]
            if (leading >= refEdge) {
                const dist = leading - refEdge
                if (dist < minDist) {
                    minDist = dist
                    nearest = s
                }
            }
        }
        return nearest
    }

    // -------------------------------------------------------------------------
    // Modal gap inference
    // -------------------------------------------------------------------------

    /**
     * Given an array of gap values (positive numbers), returns the most
     * frequently occurring gap, where gaps within `patternNeighbourhood` pixels
     * of each other are treated as equal.  Returns null when:
     *   - fewer than 2 gap values are provided, or
     *   - no single gap value (or bucket) occurs at least patternMinCount times.
     *
     * The returned value is the average of all gap values in the winning bucket,
     * giving a smooth result when the spacing is slightly irregular.
     *
     * @param  {number[]} gaps  array of raw gap values
     * @returns {number|null}
     */
    _findModalGap (gaps) {
        if (gaps.length < 2) return null

        const tolerance = this.patternNeighbourhood
        // Each bucket: { value (representative), count, sum }
        const buckets = []

        for (const gap of gaps) {
            let found = null
            for (const b of buckets) {
                if (Math.abs(b.value - gap) <= tolerance) {
                    found = b
                    break
                }
            }
            if (found) {
                found.count++
                found.sum += gap
            } else {
                buckets.push({ value: gap, count: 1, sum: gap })
            }
        }

        // Sort descending by count, then descending by value to prefer larger gaps
        // when counts are equal (larger gaps are more visually intentional).
        buckets.sort((a, b) => b.count - a.count || b.value - a.value)

        const best = buckets[0]
        if (!best || best.count < this.patternMinCount) return null

        return Math.round(best.sum / best.count)
    }

    // -------------------------------------------------------------------------
    // Pattern visual feedback
    // -------------------------------------------------------------------------

    /**
     * Renders labelled distance lines for the dominant horizontal and vertical
     * patterns visible near absPos, giving the user layout intent cues while
     * they are dragging — even before the widget is close enough to snap.
     *
     * Lines are rendered into this.distanceLines (same bucket as NN distance
     * lines) so they are automatically cleaned up by cleanupDistanceLines() at
     * the start of the next frame.
     *
     * This method is called every frame in _correct() when pattern detection is
     * active and at least two siblings exist.
     *
     * @param {Object} absPos    current position of the dragged widget
     * @param {Array}  siblings  eligible widgets on the current screen
     */
    _renderPatternFeedback (absPos, siblings) {

        // -- Horizontal gap guides (between Y-overlapping siblings) -----------
        const yOverlapping = siblings.filter(s => this.isOverLappingY(absPos, s))
        if (yOverlapping.length >= 2) {
            const sorted   = yOverlapping.slice().sort((a, b) => a.x - b.x)
            const gapPairs = []
            for (let i = 0; i < sorted.length - 1; i++) {
                const gap = sorted[i + 1].x - (sorted[i].x + sorted[i].w)
                if (gap > 0) {
                    gapPairs.push({ gap, from: sorted[i], to: sorted[i + 1] })
                }
            }
            const modalGapX = this._findModalGap(gapPairs.map(p => p.gap))
            if (modalGapX !== null) {
                for (const { gap, from, to } of gapPairs) {
                    if (Math.abs(gap - modalGapX) <= this.patternNeighbourhood) {
                        const lbl  = this._getHackedUnZoomed(gap, this.zoom)
                        const yMid = SnappUtil.getOverlayYMiddle(from, to)
                        this._renderDistanceLineX(from.x + from.w, yMid, gap, lbl, '', true)
                    }
                }
            }
        }

        // -- Vertical gap guides (between X-overlapping siblings) -------------
        const xOverlapping = siblings.filter(s => this.isOverLappingX(absPos, s))
        if (xOverlapping.length >= 2) {
            const sorted   = xOverlapping.slice().sort((a, b) => a.y - b.y)
            const gapPairs = []
            for (let i = 0; i < sorted.length - 1; i++) {
                const gap = sorted[i + 1].y - (sorted[i].y + sorted[i].h)
                if (gap > 0) {
                    gapPairs.push({ gap, from: sorted[i], to: sorted[i + 1] })
                }
            }
            const modalGapY = this._findModalGap(gapPairs.map(p => p.gap))
            if (modalGapY !== null) {
                for (const { gap, from, to } of gapPairs) {
                    if (Math.abs(gap - modalGapY) <= this.patternNeighbourhood) {
                        const lbl  = this._getHackedUnZoomed(gap, this.zoom)
                        const xMid = SnappUtil.getOverlayXMiddle(from, to)
                        this._renderDistanceLineY(xMid, from.y + from.h, gap, lbl, '', true)
                    }
                }
            }
        }
    }
}
