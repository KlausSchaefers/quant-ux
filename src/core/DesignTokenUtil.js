import * as ColorUtil from 'core/code/ColorUtil'

class DesignTokenUtil {

    /**
    * Scans all widgets and screens (across all view states) for the
    * colors, border colors, font families and font sizes that are
    * actually used in the model, so users can spot values that are
    * good candidates for a design token.
    */
    getCommonStyles(model) {
        const empty = { colors: [], fontFamilies: [], fontSizes: [] }
        if (!model) {
            return empty
        }

        const stateKeys = ['style', 'hover', 'focus', 'checked', 'active', 'error']
        const colors = new Map()
        const fontFamilies = new Map()
        const fontSizes = new Map()

        const addValue = (map, value, normalize) => {
            if (value === undefined || value === null || value === '') {
                return
            }
            let key
            if (value && typeof value === 'object') {
                key = JSON.stringify(value)
            } else {
                key = normalize ? normalize(value) : value
            }
            if (!map.has(key)) {
                map.set(key, { value: value, count: 0 })
            }
            map.get(key).count++
        }

        // colors are deduped case-insensitively, since "#FFF" and "#fff" are the same color
        const normalizeColor = (value) => (typeof value === 'string') ? value.toLowerCase() : value

        const scanStyle = (style) => {
            if (!style) {
                return
            }
            addValue(colors, style.background, normalizeColor)
            addValue(colors, style.color, normalizeColor)
            addValue(colors, style.borderTopColor, normalizeColor)
            addValue(colors, style.borderBottomColor, normalizeColor)
            addValue(colors, style.borderLeftColor, normalizeColor)
            addValue(colors, style.borderRightColor, normalizeColor)
            addValue(fontFamilies, style.fontFamily)
            addValue(fontSizes, style.fontSize)
        }

        const scanEntity = (entity) => {
            stateKeys.forEach(key => scanStyle(entity[key]))
        }

        if (model.widgets) {
            for (let id in model.widgets) {
                scanEntity(model.widgets[id])
            }
        }
        if (model.screens) {
            for (let id in model.screens) {
                scanEntity(model.screens[id])
            }
        }

        const toSortedList = (map) => {
            return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count)
        }

        const toColorSortedList = (map) => {
            return Array.from(map.entries()).sort((a, b) => {
                const la = this.getColorLightness(a[1].value)
                const lb = this.getColorLightness(b[1].value)
                if (la === null && lb === null) {
                    return 0
                }
                if (la === null) {
                    return 1
                }
                if (lb === null) {
                    return -1
                }
                return la - lb
            })
        }

        const toLabel = (entry) => {
            const label = (entry.value && typeof entry.value === 'object') ? 'Gradient' : entry.value
            return entry.count > 1 ? `${label} · ${entry.count}` : `${label}`
        }

        const toColorLabel = (entry) => {
            return this.formatColorLabel(entry.value)
        }

        return {
            colors: toColorSortedList(colors).map(([key, entry]) => ({
                id: 'common-color-' + key,
                type: 'color',
                name: toColorLabel(entry),
                value: entry.value
            })),
            fontFamilies: toSortedList(fontFamilies).map(([key, entry]) => ({
                id: 'common-font-family-' + key,
                type: 'fontFamily',
                name: toLabel(entry),
                value: {
                    fontFamily: entry.value,
                    fontWeight: '400',
                    fontStyle: 'normal',
                    textDecoration: 'none'
                }
            })),
            fontSizes: toSortedList(fontSizes).map(([key, entry]) => ({
                id: 'common-font-size-' + key,
                type: 'fontSize',
                name: entry.value,
                value: entry.value
            }))
        }
    }

    /**
    * Perceived brightness of a color string (0 = black, 255 = white).
    * Returns null when the value cannot be parsed (e.g. a gradient
    * object or a named CSS color), so it can be sorted to the end.
    */
    getColorLightness(value) {
        if (!value || typeof value === 'object') {
            return null
        }
        const rgb = ColorUtil.fromString(value)
        if (!rgb) {
            return null
        }
        return (0.299 * rgb.r) + (0.587 * rgb.g) + (0.114 * rgb.b)
    }

    /**
* Human readable label for a color value: a 6 digit hex code, plus
* the alpha channel as a separate number when it isn't fully opaque.
* Falls back to the raw value when it cannot be parsed (e.g. a named
* CSS color).
*/
    formatColorLabel(value) {
        if (!value || typeof value === 'object') {
            return 'Gradient'
        }
        const rgb = ColorUtil.fromString(value)
        if (!rgb) {
            return value
        }
        const hex = '#' + [rgb.r, rgb.g, rgb.b].map(c => {
            return Math.round(c).toString(16).padStart(2, '0')
        }).join('')
        if (rgb.a !== undefined && rgb.a !== 1) {
            return `${hex} (${rgb.a})`
        }
        return hex
    }

}

export default new DesignTokenUtil()