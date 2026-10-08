/** Shared geometry for the existing fixed/grow auto layout. */
export function normalizeAlign(value) {
    if (['start', 'flex-start', 'top', 'left'].includes(value)) return 'start'
    if (['center', 'middle'].includes(value)) return 'center'
    if (['end', 'flex-end', 'bottom', 'right'].includes(value)) return 'end'
    return 'stretch'
}

export function normalizeJustify(value) {
    if (value === 'center') return 'center'
    if (value === 'end' || value === 'flex-end') return 'end'
    if (value === 'spaceBetween' || value === 'space-between') return 'spaceBetween'
    return 'start'
}

export function getContainerConfig(style = {}) {
    const n = v => parseFloat(v) || 0
    return {
        isColumn: style.flexDirection === 'column' || style.flexDirection === 'columnReverse',
        isReverse: style.flexDirection === 'rowReverse' || style.flexDirection === 'columnReverse',
        gap: Math.max(0, n(style.gap)),
        align: normalizeAlign(style.alignItems),
        justify: normalizeJustify(style.justifyContent),
        padding: {
            top: n(style.paddingTop) + n(style.borderTopWidth),
            right: n(style.paddingRight) + n(style.borderRightWidth),
            bottom: n(style.paddingBottom) + n(style.borderBottomWidth),
            left: n(style.paddingLeft) + n(style.borderLeftWidth)
        }
    }
}

export function isGrowing(item) {
    return !!(item.props && item.props.resize && item.props.resize.grow > 0)
}

export function isStretching(item, config) {
    const resize = (item.props && item.props.resize) || {}
    return config.align === 'stretch' && !(config.isColumn ? resize.fixedHorizontal : resize.fixedVertical)
}

export function sortItems(config, items) {
    const axis = config.isColumn ? 'y' : 'x'
    return items.slice().sort((a, b) => config.isReverse ? b[axis] - a[axis] : a[axis] - b[axis])
}

/** Items keep their measured size, or share the free space with grow. */
export function layoutItems(config, frame, items) {
    const result = {}
    const p = config.padding
    const innerW = Math.max(0, frame.w - p.left - p.right)
    const innerH = Math.max(0, frame.h - p.top - p.bottom)
    const main = config.isColumn ? innerH : innerW
    const cross = config.isColumn ? innerW : innerH
    const mainSize = config.isColumn ? 'h' : 'w'
    const crossSize = config.isColumn ? 'w' : 'h'
    const growing = items.filter(isGrowing).length
    const used = items.filter(item => !isGrowing(item)).reduce((sum, item) => sum + item[mainSize], 0)
    const free = main - used - config.gap * Math.max(0, items.length - 1)
    const growSize = growing ? Math.max(0, free) / growing : 0
    let position = 0
    let gap = config.gap
    if (!growing) {
        if (config.justify === 'center') position = free / 2
        if (config.justify === 'end') position = free
        if (config.justify === 'spaceBetween' && items.length > 1) gap += Math.max(0, free) / (items.length - 1)
    }
    items.forEach(item => {
        const size = isGrowing(item) ? growSize : item[mainSize]
        // Preserve the canvas rule: a fixed cross size cannot exceed the container.
        const breadth = Math.min(isStretching(item, config) ? cross : item[crossSize], cross)
        const offset = config.align === 'center' ? (cross - breadth) / 2 : config.align === 'end' ? cross - breadth : 0
        const start = config.isReverse ? main - position - size : position
        result[item.id] = {
            x: Math.round(frame.x + p.left + (config.isColumn ? offset : start)),
            y: Math.round(frame.y + p.top + (config.isColumn ? start : offset)),
            w: Math.round(config.isColumn ? breadth : size),
            h: Math.round(config.isColumn ? size : breadth)
        }
        position += size + gap
    })
    return result
}
