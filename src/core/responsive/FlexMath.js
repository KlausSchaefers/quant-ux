/**
 * The layout math of a FlexContainer, modelled after Figma's auto layout:
 *
 *  - the container lays its items out in a row or a column (optionally
 *    reversed), with a gap, inside its padding and border
 *  - justifyContent places the items on the main axis: start, center, end
 *    or spaceBetween (Figma's "auto" spacing)
 *  - alignItems places them on the cross axis: start, center, end, or
 *    stretch (every item without its own cross size fills the container)
 *  - flexWrap breaks a row (or column) into several lines
 *  - every widget has a sizing per axis (props.resize.layoutWidth /
 *    layoutHeight): 'fixed' keeps its size, 'hug' takes the size of its
 *    content (the text of a label, the items of a container), 'fill' takes
 *    the space left in its parent container
 *
 * Everything here is pure: the items come with their current size and
 * functions that measure their content (hugW / hugH), the result are the
 * new boxes. FlexLayout applies it to the model, ResponsiveLayout.resizeFlex()
 * to its tree.
 */

export const SIZING = Object.freeze({
    FIXED: 'fixed',
    HUG: 'hug',
    FILL: 'fill'
})

export const JUSTIFY = Object.freeze({
    START: 'start',
    CENTER: 'center',
    END: 'end',
    SPACE_BETWEEN: 'spaceBetween'
})

export const ALIGN = Object.freeze({
    STRETCH: 'stretch',
    START: 'start',
    CENTER: 'center',
    END: 'end'
})

const SIZINGS = new Set(Object.values(SIZING))

/**
 * The alignment of the items on the cross axis. Besides our own values the
 * CSS ones are accepted, and the side names the first version of the
 * toolbar wrote ('top', which the wireframe template still has).
 */
export function normalizeAlign(value) {
    switch (value) {
        case 'start':
        case 'flex-start':
        case 'top':
        case 'left':
            return ALIGN.START
        case 'center':
        case 'middle':
            return ALIGN.CENTER
        case 'end':
        case 'flex-end':
        case 'bottom':
        case 'right':
            return ALIGN.END
        default:
            return ALIGN.STRETCH
    }
}

export function normalizeJustify(value) {
    switch (value) {
        case 'center':
            return JUSTIFY.CENTER
        case 'end':
        case 'flex-end':
            return JUSTIFY.END
        case 'spaceBetween':
        case 'space-between':
            return JUSTIFY.SPACE_BETWEEN
        default:
            return JUSTIFY.START
    }
}

function num(v) {
    const n = typeof v === 'number' ? v : parseFloat(v)
    return Number.isFinite(n) ? n : 0
}

/**
 * The layout settings of a FlexContainer, from its style. The padding
 * includes the border: both are inside the box and the items start after
 * them.
 */
export function getContainerConfig(style = {}) {
    const direction = style.flexDirection || 'row'
    const gap = Math.max(0, num(style.gap))
    return {
        isColumn: direction === 'column' || direction === 'columnReverse',
        isReverse: direction === 'rowReverse' || direction === 'columnReverse',
        gap: gap,
        crossGap: style.rowGap !== undefined && style.rowGap !== null ? Math.max(0, num(style.rowGap)) : gap,
        justify: normalizeJustify(style.justifyContent),
        align: normalizeAlign(style.alignItems),
        wrap: style.flexWrap === true || style.flexWrap === 'wrap',
        padding: {
            top: num(style.paddingTop) + num(style.borderTopWidth),
            right: num(style.paddingRight) + num(style.borderRightWidth),
            bottom: num(style.paddingBottom) + num(style.borderBottomWidth),
            left: num(style.paddingLeft) + num(style.borderLeftWidth)
        }
    }
}

/**
 * The sizing of a widget on one axis ('h' = width, 'v' = height).
 *
 * @param {object} widget
 * @param {'h'|'v'} axis
 * @param {object|null} parentConfig the config of the FlexContainer the
 *   widget is an item of, null if it is none. Fill only exists inside one.
 * @param {boolean} canHug whether the widget has a content to hug (a text,
 *   a FlexContainer). Hug falls back to fixed otherwise.
 */
export function getSizing(widget, axis, parentConfig, canHug = true) {
    const resize = (widget && widget.props && widget.props.resize) || {}
    const explicit = axis === 'h' ? resize.layoutWidth : resize.layoutHeight
    if (SIZINGS.has(explicit)) {
        if (explicit === SIZING.FILL && !parentConfig) {
            return SIZING.FIXED
        }
        if (explicit === SIZING.HUG && !canHug) {
            return SIZING.FIXED
        }
        return explicit
    }

    /**
     * Before the sizings existed, a child had resize.grow on the main axis
     * and was stretched on the cross axis by alignItems:stretch, unless
     * fixedHorizontal / fixedVertical was set.
     */
    if (!parentConfig) {
        return SIZING.FIXED
    }
    const isMain = parentConfig.isColumn ? axis === 'v' : axis === 'h'
    if (isMain) {
        return resize.grow > 0 ? SIZING.FILL : SIZING.FIXED
    }
    const isFixed = axis === 'h' ? resize.fixedHorizontal : resize.fixedVertical
    if (parentConfig.align === ALIGN.STRETCH && !isFixed) {
        return SIZING.FILL
    }
    return SIZING.FIXED
}

/**
 * The intrinsic size of an item on one axis, i.e. what it takes when the
 * container hugs it: a fill item has no size of its own there, it hugs its
 * content when it has one and keeps its size otherwise.
 */
function intrinsicWidth(item) {
    if (item.sizingH === SIZING.FIXED) {
        return item.w
    }
    return clamp(item.hugW ? item.hugW() : item.w, item.minW, item.maxW)
}

function intrinsicHeight(item, width) {
    if (item.sizingV === SIZING.FIXED) {
        return item.h
    }
    return clamp(item.hugH ? item.hugH(width) : item.h, item.minH, item.maxH)
}

/**
 * Keeps a size within the min and max of a widget (see getLimits()), like
 * Figma's min / max width and height. A missing or 0 limit is none.
 */
export function clamp(size, min, max) {
    let result = size
    if (max > 0 && result > max) {
        result = max
    }
    if (min > 0 && result < min) {
        result = min
    }
    return result
}

/**
 * The min and max sizes of a widget, from props.resize.
 */
export function getLimits(widget) {
    const resize = (widget && widget.props && widget.props.resize) || {}
    const positive = v => (typeof v === 'number' && v > 0 ? v : undefined)
    return {
        minW: positive(resize.minWidth),
        maxW: positive(resize.maxWidth),
        minH: positive(resize.minHeight),
        maxH: positive(resize.maxHeight)
    }
}

/**
 * Splits the free space among the fill items. The rounding remainder goes
 * to the last one, so the items end exactly at the end of the container.
 */
function distribute(free, count) {
    const sizes = []
    if (count === 0) {
        return sizes
    }
    const each = Math.max(0, Math.floor(free / count))
    for (let i = 0; i < count; i++) {
        sizes.push(each)
    }
    const rest = Math.max(0, Math.round(free) - each * count)
    sizes[count - 1] += rest
    return sizes
}

/**
 * Splits the free space among fill items with min / max sizes, like CSS
 * flexbox: an item whose share is out of its limits gets the limit, and the
 * rest of the space is split again among the others.
 *
 * @param {number} free
 * @param {Array<{min?: number, max?: number}>} limits one per fill item
 */
function distributeWithLimits(free, limits) {
    const sizes = limits.map(() => null)
    let open = limits.map((_, i) => i)
    for (let round = 0; round <= limits.length && open.length > 0; round++) {
        const fixed = sizes.reduce((sum, s) => sum + (s === null ? 0 : s), 0)
        const shares = distribute(free - fixed, open.length)
        const violated = open.filter((i, k) => clamp(shares[k], limits[i].min, limits[i].max) !== shares[k])
        if (violated.length === 0) {
            open.forEach((i, k) => { sizes[i] = shares[k] })
            open = []
            break
        }
        violated.forEach(i => {
            const k = open.indexOf(i)
            sizes[i] = clamp(shares[k], limits[i].min, limits[i].max)
        })
        open = open.filter(i => violated.indexOf(i) < 0)
    }
    return sizes.map(s => (s === null ? 0 : s))
}

/**
 * The fill sizes on the main axis: the free space is split, within the
 * limits of each item.
 */
function fillMain(sizes, fillItems, innerMain, gap, count, isWidth) {
    const used = sizes.reduce((sum, s) => sum + (s || 0), 0) + gap * Math.max(0, count - 1)
    const limits = fillItems.map(item => isWidth ? { min: item.minW, max: item.maxW } : { min: item.minH, max: item.maxH })
    const fills = distributeWithLimits(innerMain - used, limits)
    let f = 0
    return sizes.map(s => s === null ? fills[f++] : s)
}

/**
 * The widths of the items in a container with the given inner width.
 */
function resolveWidths(config, innerW, items) {
    if (config.isColumn) {
        // cross axis
        return items.map(item => {
            if (item.sizingH === SIZING.FILL) {
                return clamp(Math.max(0, innerW), item.minW, item.maxW)
            }
            if (item.sizingH === SIZING.HUG) {
                return intrinsicWidth(item)
            }
            return item.w
        })
    }

    // main axis: a wrapping row has no free space to fill, a fill item hugs there
    const isFill = item => item.sizingH === SIZING.FILL && !config.wrap
    const widths = items.map(item => isFill(item) ? null : intrinsicWidth(item))
    const fillItems = items.filter(isFill)
    if (fillItems.length > 0) {
        return fillMain(widths, fillItems, innerW, config.gap, items.length, true)
    }
    return widths
}

/**
 * The heights of the items, once their widths are known (a text that wraps
 * gets taller when it gets narrower).
 */
function resolveHeights(config, innerH, items, widths) {
    if (!config.isColumn) {
        // cross axis
        return items.map((item, i) => {
            if (item.sizingV === SIZING.FILL) {
                return clamp(Math.max(0, innerH), item.minH, item.maxH)
            }
            if (item.sizingV === SIZING.HUG) {
                return intrinsicHeight(item, widths[i])
            }
            return item.h
        })
    }

    const isFill = item => item.sizingV === SIZING.FILL && !config.wrap
    const heights = items.map((item, i) => isFill(item) ? null : intrinsicHeight(item, widths[i]))
    const fillItems = items.filter(isFill)
    if (fillItems.length > 0) {
        return fillMain(heights, fillItems, innerH, config.gap, items.length, false)
    }
    return heights
}

/**
 * Breaks the items into lines of at most innerMain. Without wrap there is
 * one line.
 */
function breakLines(config, innerMain, mainSizes) {
    const all = mainSizes.map((_, i) => i)
    if (!config.wrap) {
        return [all]
    }
    const lines = []
    let line = []
    let used = 0
    all.forEach(i => {
        const size = mainSizes[i]
        const next = line.length === 0 ? size : used + config.gap + size
        if (line.length > 0 && next > innerMain) {
            lines.push(line)
            line = [i]
            used = size
        } else {
            line.push(i)
            used = next
        }
    })
    if (line.length > 0) {
        lines.push(line)
    }
    return lines
}

/**
 * The size a container hugs: its items laid out without any free space,
 * plus its padding.
 *
 * @param {object} config see getContainerConfig()
 * @param {Array} items see layoutItems()
 * @param {number} [width] the outer width of the container, when it is
 *   known. Needed for the height: the widths of fill items, and with them
 *   the height of wrapping texts, depend on it.
 * @returns {{w: number, h: number}}
 */
export function getContentSize(config, items, width) {
    const p = config.padding
    const padX = p.left + p.right
    const padY = p.top + p.bottom
    const gaps = config.gap * Math.max(0, items.length - 1)

    const intrinsicWidths = items.map(intrinsicWidth)
    const contentW = config.isColumn
        ? Math.max(0, ...intrinsicWidths)
        : intrinsicWidths.reduce((sum, w) => sum + w, 0) + gaps
    const w = Math.round(contentW + padX)

    const outerW = width !== undefined && width !== null ? width : w
    const innerW = outerW - padX
    const widths = resolveWidths(config, innerW, items)
    const heights = items.map((item, i) => {
        // a fill height has no size of its own, it is the hugged content
        if (item.sizingV === SIZING.FILL) {
            return clamp(item.hugH ? item.hugH(widths[i]) : item.h, item.minH, item.maxH)
        }
        return intrinsicHeight(item, widths[i])
    })

    let contentH
    if (config.isColumn) {
        contentH = heights.reduce((sum, h) => sum + h, 0) + gaps
    } else {
        const lines = breakLines(config, innerW, widths)
        contentH = lines.reduce((sum, line) => sum + Math.max(0, ...line.map(i => heights[i])), 0) +
            config.crossGap * Math.max(0, lines.length - 1)
    }
    return { w: w, h: Math.round(contentH + padY) }
}

/**
 * Lays the items out in the given frame.
 *
 * @param {object} config see getContainerConfig()
 * @param {{x, y, w, h}} frame the outer box of the container
 * @param {Array<{id, w, h, sizingH, sizingV, hugW?: () => number, hugH?: (width) => number,
 *   minW?, maxW?, minH?, maxH?}>} items the limits are those of getLimits()
 *   in the order they are laid out
 * @returns {Object<string, {x, y, w, h}>} the new box of every item, by id
 */
export function layoutItems(config, frame, items) {
    const result = {}
    if (items.length === 0) {
        return result
    }
    const p = config.padding
    const innerX = frame.x + p.left
    const innerY = frame.y + p.top
    const innerW = frame.w - p.left - p.right
    const innerH = frame.h - p.top - p.bottom

    const widths = resolveWidths(config, innerW, items)
    const heights = resolveHeights(config, innerH, items, widths)

    const mainSizes = config.isColumn ? heights : widths
    const crossSizes = config.isColumn ? widths : heights
    const innerMain = config.isColumn ? innerH : innerW
    const innerCross = config.isColumn ? innerW : innerH
    const mainStart = config.isColumn ? innerY : innerX
    const crossStart = config.isColumn ? innerX : innerY

    const lines = breakLines(config, innerMain, mainSizes)
    const hasFill = items.some(item => (config.isColumn ? item.sizingV : item.sizingH) === SIZING.FILL) && !config.wrap

    /**
     * Without wrap the single line spans the whole cross axis, so stretch
     * and the alignment refer to the container. With wrap every line is as
     * thick as its thickest item and the alignment refers to the line.
     */
    let lineCross = 0
    lines.forEach(line => {
        const thickness = config.wrap
            ? Math.max(0, ...line.map(i => crossSizes[i]))
            : innerCross

        const sum = line.reduce((s, i) => s + mainSizes[i], 0)
        const free = innerMain - sum - config.gap * Math.max(0, line.length - 1)
        let offset = 0
        let spacing = config.gap
        if (!hasFill) {
            switch (config.justify) {
                case JUSTIFY.CENTER:
                    offset = free / 2
                    break
                case JUSTIFY.END:
                    offset = free
                    break
                case JUSTIFY.SPACE_BETWEEN:
                    if (line.length > 1) {
                        spacing = config.gap + Math.max(0, free) / (line.length - 1)
                    }
                    break
                default:
                    break
            }
        }

        let pos = offset
        line.forEach(i => {
            const item = items[i]
            const mainSize = mainSizes[i]
            const crossSizing = config.isColumn ? item.sizingH : item.sizingV
            const crossSize = config.wrap && crossSizing === SIZING.FILL
                ? clamp(thickness, config.isColumn ? item.minW : item.minH, config.isColumn ? item.maxW : item.maxH)
                : crossSizes[i]

            let cross = 0
            switch (config.align) {
                case ALIGN.CENTER:
                    cross = (thickness - crossSize) / 2
                    break
                case ALIGN.END:
                    cross = thickness - crossSize
                    break
                default:
                    break
            }

            const main = config.isReverse
                ? innerMain - pos - mainSize
                : pos
            const mainPos = Math.round(mainStart + main)
            const crossPos = Math.round(crossStart + lineCross + cross)
            result[item.id] = config.isColumn
                ? { x: crossPos, y: mainPos, w: Math.round(crossSize), h: Math.round(mainSize) }
                : { x: mainPos, y: crossPos, w: Math.round(mainSize), h: Math.round(crossSize) }
            pos += mainSize + spacing
        })
        lineCross += thickness + config.crossGap
    })
    return result
}

/**
 * The visual order of the items: along the main axis, or for a wrapping
 * container line by line. For the reversed directions the main-start edge
 * is the right / bottom one, so the order is mirrored.
 */
export function sortItems(config, items) {
    const mainOf = b => config.isColumn ? b.y : b.x
    const byMain = (a, b) => config.isReverse ? mainOf(b) - mainOf(a) : mainOf(a) - mainOf(b)
    if (!config.wrap) {
        return items.slice().sort(byMain)
    }

    /**
     * Reading order: the items are grouped into lines by their cross
     * position (an item joins the line it overlaps), the lines are taken
     * in order and each line along the main axis.
     */
    const crossOf = b => config.isColumn ? b.x : b.y
    const crossSizeOf = b => config.isColumn ? b.w : b.h
    const lines = []
    let current = null
    items.slice()
        .sort((a, b) => crossOf(a) - crossOf(b))
        .forEach(item => {
            if (current && crossOf(item) < current.end) {
                current.items.push(item)
                current.end = Math.max(current.end, crossOf(item) + crossSizeOf(item))
            } else {
                current = { items: [item], end: crossOf(item) + crossSizeOf(item) }
                lines.push(current)
            }
        })
    return lines.reduce((result, line) => result.concat(line.items.sort(byMain)), [])
}
