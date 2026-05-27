---
applyTo: "src/canvas/SnappingEngine.js"
---

# SnappingEngine — Architecture & Design Notes

`src/canvas/SnappingEngine.js` is a custom snap & alignment engine for the
quant-ux canvas.  It extends `GridAndRulerSnapp` and shares the same public
interface:

```
start(canvas, selectedType, selectedModel, activePoint, grid, zoom)
correct(absPos, e, mouse)   → returns corrected absPos
cleanUp()                   → inherited
```

Wired in `src/canvas/Render.vue` behind the `settings.useSnappingEngine` flag
(currently `true` in `src/canvas/Canvas.vue`).

---

## Key design decisions

### 1. LayoutContainer / GridContainer snap
`cacheLayoutContainers()` is **not** overridden — the parent scans
`model.widgets` for `GridContainer` widgets on `start()`.  In `_correct()`,
`findHoverLayoutContainer(absPos)` is called first; when a container is found
the engine calls `initLayoutContainerLines()`, sets `snappDistance = 64` /
`showDistance = 24`, and passes `layoutContainer` through to `getCorners()` and
`getFilteredLinesX/Y()`.  Pattern snap is disabled inside a GridContainer.

### 2. Pattern detection (equal-spacing snap)
Active only during free move (`activePoint === 'All'`, grid disabled, not in a
LayoutContainer).

- `_computePatternTargetsX(absPos, siblings)` — finds the modal horizontal gap
  among Y-overlapping siblings, then projects **at most 2 snap targets**: one
  from the nearest sibling to the LEFT and one from the nearest to the RIGHT.
- `_computePatternTargetsY(absPos, siblings)` — same for the Y axis using
  X-overlapping siblings.
- `_findModalGap(gaps)` — buckets gaps within `patternNeighbourhood` (8 px)
  tolerance, requires at least `patternMinCount` (2) occurrences, returns the
  bucket average or `null`.
- `_renderPatternFeedback(absPos, siblings)` — renders labelled distance lines
  between existing equal-gap pairs as visual cues (every frame, cleaned up by
  `cleanupDistanceLines()`).

### 3. Weighted line selection
`_getMinLineWeighted(candidates)` replaces `SnappUtil.getMinLine`.  Pattern
lines are multiplied by `patternWeight` (default `0.4`) before distance
comparison — a pattern line must be 2.5× farther than an edge line before the
edge wins.  Post-processing mirrors `getMinLine`: pattern winner → delete
`.snapp`; middle winner → add `.middle = true`.

### 4. Nearest-neighbour limiting
`_getNearestLeft(refEdge, sorted, axis, sizeKey)` and
`_getNearestRight(refEdge, sorted, axis)` restrict pattern targets to the
single closest sibling on each side, avoiding the "gets lost" problem caused by
many competing targets when many widgets are present.

---

## `_correct()` flow (step numbers match inline comments)

```
0.  cleanupDistanceLines()
1.  Fix bounding-box geometry
2.  findHoverLayoutContainer → branch: grid snap vs. screen snap
    Early-return if neither screen nor layoutContainer found
3.  updateMovements / getMovementDir
4.  SHIFT pre-scale
5.  CTRL/META → bypass, render NN distance, return
6.  getCorners(absPos, grid.enabled, layoutContainer, left, top)
7.  getFilteredLinesX/Y + getCloseLines (edge)
    correctSnappDirection only when !layoutContainer
8.  Middle snap (grid disabled only)
9.  Pattern snap (no layoutContainer, no grid, activePoint==='All')
10. hideLines/hideBoxes → _getMinLineWeighted → correctX/Y → snapp()
11. Post-SHIFT scale, clamp w/h > 0
12. renderNNDistance
13. topic.publish('matc/box/move') → return
```

---

## Tunable constants (constructor)

| Property | Default | Purpose |
|---|---|---|
| `patternNeighbourhood` | `8` px | Gap tolerance for bucketing |
| `patternMinCount` | `2` | Min occurrences to infer a pattern |
| `patternWeight` | `0.4` | Distance multiplier for pattern lines |
