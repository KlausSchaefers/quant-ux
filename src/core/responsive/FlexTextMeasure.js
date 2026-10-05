import Logger from '../Logger'

/**
 * Measures the text of a widget the way the canvas draws it, for the
 * FlexLayout of a text that hugs its content: the widget is rendered with
 * the canvas' own RenderFactory into a hidden host in the editor document
 * (where the canvas CSS and fonts are), and the box of its label is read.
 * The same approach as ai/CanvasTextProbe.
 *
 * One instance is used for one layout run and cleaned up after it.
 *
 * The RenderFactory class comes from the canvas (it pulls in Vue and every
 * widget, which the controller does not import).
 */
/**
 * Measuring renders a widget and makes the browser lay it out, which is
 * slow; a relayout of a screen measures all of its texts. A text measures
 * the same until its text, its font or the width changes, so the sizes are
 * kept across layout runs, by those.
 */
const CACHE_SIZE = 5000
const measureCache = new Map()
const normalLineHeights = new Map()

const TEXT_STYLE_KEYS = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight',
    'textTransform', 'textDecoration', 'whiteSpace', 'wordBreak',
    'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
    'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth']

function getCacheKey(widget, width, model) {
    const style = widget.style || {}
    return JSON.stringify([
        widget.type,
        widget.props.label,
        width === null || width === undefined ? null : Math.round(width),
        TEXT_STYLE_KEYS.map(key => style[key]),
        // a font set by a design token: its current value
        getTokenValues(widget.designtokens, model && model.designtokens)
    ])
}

function getTokenValues(refs, tokens) {
    if (!refs || !tokens) {
        return null
    }
    const values = []
    const collect = (v, depth) => {
        if (depth > 5) {
            return
        }
        if (typeof v === 'string' && tokens[v]) {
            values.push(tokens[v])
        } else if (v && typeof v === 'object') {
            Object.values(v).forEach(child => collect(child, depth + 1))
        }
    }
    collect(refs, 0)
    return values
}

export default class FlexTextMeasure {

    constructor(model, RenderFactory, doc = document) {
        this.model = model
        this.RenderFactory = RenderFactory
        this.doc = doc
        this.factory = null
        this.host = null
    }

    /**
     * @param {object} widget
     * @param {number|null} width the outer width of the widget, null for
     *   the text on one line
     * @returns {{w: number, h: number}|null} the size of the text, null when
     *   there is no layout to measure (jsdom) or it cannot be rendered
     */
    measure(widget, width) {
        if (!this.RenderFactory || !widget || !widget.props || !widget.props.label) {
            return null
        }
        const model = this.withTemplateStyle(widget)
        const key = getCacheKey(model, width, this.model)
        if (measureCache.has(key)) {
            return measureCache.get(key)
        }
        const size = this.render(model, width)
        if (measureCache.size >= CACHE_SIZE) {
            measureCache.delete(measureCache.keys().next().value)
        }
        measureCache.set(key, size)
        return size
    }

    render(model, width) {
        try {
            this.init()
            const box = this.doc.createElement('div')
            box.className = 'MatcBox MatcWidget'
            box.style.left = '0px'
            box.style.top = '0px'
            box.style.width = Math.round(width === null || width === undefined ? 100000 : width) + 'px'
            box.style.height = Math.round(model.h) + 'px'
            this.host.appendChild(box)
            this.factory.createWidgetHTML(box, model)
            const labelNode = this.factory.getLabelNode(model)
            if (!labelNode) {
                box.remove()
                return null
            }
            const range = this.doc.createRange()
            if (typeof range.getBoundingClientRect !== 'function') {
                box.remove()
                return null
            }
            range.selectNodeContents(labelNode)
            const rect = range.getBoundingClientRect()
            const height = this.getTextHeight(range, labelNode, rect)
            box.remove()
            if (!rect || !(rect.width > 0) || !(height > 0)) {
                return null
            }
            return { w: Math.ceil(rect.width), h: Math.ceil(height) }
        } catch (e) {
            Logger.warn('FlexTextMeasure.render() > could not measure', model.id, e)
            return null
        }
    }

    /**
     * The rect of a text range covers the glyphs, not the lines: with a
     * line-height of 1.4 a text is higher than that. So the height is the
     * number of lines times the line height, as in the browser.
     */
    getTextHeight(range, labelNode, rect) {
        const view = this.doc.defaultView || window
        const style = view.getComputedStyle(labelNode)
        let lineHeight = parseFloat(style.lineHeight)
        if (!Number.isFinite(lineHeight)) {
            // line-height: normal, its px value depends on the font
            lineHeight = this.getNormalLineHeight(style)
        }
        if (!(lineHeight > 0) || typeof range.getClientRects !== 'function') {
            return rect ? rect.height : 0
        }
        const tops = new Set()
        Array.from(range.getClientRects()).forEach(r => {
            if (r.width > 0) {
                tops.add(Math.round(r.top))
            }
        })
        const lines = Math.max(1, tops.size)
        return lines * lineHeight
    }

    /**
     * The height of one line with line-height: normal in the font of the
     * style, measured once per font.
     */
    getNormalLineHeight(style) {
        const font = [style.fontStyle, style.fontWeight, style.fontSize, style.fontFamily].join(' ')
        if (!normalLineHeights.has(font)) {
            const probe = this.doc.createElement('div')
            probe.style.position = 'absolute'
            probe.style.whiteSpace = 'nowrap'
            probe.style.fontStyle = style.fontStyle
            probe.style.fontWeight = style.fontWeight
            probe.style.fontSize = style.fontSize
            probe.style.fontFamily = style.fontFamily
            probe.style.lineHeight = 'normal'
            probe.textContent = 'Xg'
            this.host.appendChild(probe)
            normalLineHeights.set(font, probe.getBoundingClientRect().height)
            probe.remove()
        }
        return normalLineHeights.get(font)
    }

    /**
     * A widget with a template has (part of) its style there.
     */
    withTemplateStyle(widget) {
        const template = widget.template && this.model.templates && this.model.templates[widget.template]
        if (!template || !template.style) {
            return widget
        }
        return Object.assign({}, widget, { style: Object.assign({}, template.style, widget.style) })
    }

    init() {
        if (this.factory) {
            return
        }
        this.factory = new this.RenderFactory('edit')
        this.factory.setModel(this.model)
        const host = this.doc.createElement('div')
        host.setAttribute('data-qux-flex-measure', 'true')
        host.style.position = 'absolute'
        host.style.left = '-100000px'
        host.style.top = '0px'
        host.style.visibility = 'hidden'
        host.style.pointerEvents = 'none'
        this.doc.body.appendChild(host)
        this.host = host
    }

    cleanUp() {
        if (this.factory) {
            this.factory.cleanUp()
            this.factory = null
        }
        if (this.host) {
            this.host.remove()
            this.host = null
        }
    }
}
