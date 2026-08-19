import { mode } from 'd3'
import ModelUtil from '../core/ModelUtil'
import QUX2HTML from './QUX2HTML'

/**
 * Maps our internal camelCase style keys to CSS properties. Mirrors
 * QUX2HTML.js's CSS_PROP_MAP - kept as a separate copy since the two files
 * are meant to evolve independently (QUX2HTML renders a single screen's
 * positioned tree, this file extracts a stylesheet from the whole model).
 */
const CSS_PROP_MAP = {
    color: 'color',
    textAlign: 'text-align',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    fontStyle: 'font-style',
    fontWeight: 'font-weight',
    letterSpacing: 'letter-spacing',
    lineHeight: 'line-height',
    textDecoration: 'text-decoration',

    borderTopColor: 'border-top-color',
    borderBottomColor: 'border-bottom-color',
    borderLeftColor: 'border-left-color',
    borderRightColor: 'border-right-color',

    borderTopWidth: 'border-top-width',
    borderBottomWidth: 'border-bottom-width',
    borderLeftWidth: 'border-left-width',
    borderRightWidth: 'border-right-width',

    borderTopLeftRadius: 'border-top-left-radius',
    borderTopRightRadius: 'border-top-right-radius',
    borderBottomLeftRadius: 'border-bottom-left-radius',
    borderBottomRightRadius: 'border-bottom-right-radius',

    paddingTop: 'padding-top',
    paddingBottom: 'padding-bottom',
    paddingLeft: 'padding-left',
    paddingRight: 'padding-right',

    opacity: 'opacity'
}

const PIXEL_KEYS = new Set([
    'fontSize',
    'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth',
    'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius',
    'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'
])

/**
 * Same rationale as QUX2HTML.js: a widget's look is split into small,
 * independently deduplicated groups (font / border / padding / background /
 * shadow / opacity) instead of one monolithic declaration. Two widgets
 * rarely share every property, but very often share e.g. the same font
 * treatment while differing in background - splitting lets each group dedupe
 * on its own, which is exactly what keeps the extracted classes small and
 * with little overlap.
 */
const FONT_KEYS = [
    'color', 'textAlign', 'fontFamily', 'fontSize', 'fontStyle',
    'fontWeight', 'letterSpacing', 'lineHeight', 'textDecoration'
]
const BORDER_COLOR_KEYS = ['borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor']
const BORDER_WIDTH_KEYS = ['borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth']
const BORDER_RADIUS_KEYS = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius']
const PADDING_KEYS = ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight']

/**
 * One class-name prefix per style group, so each kind of look gets its own,
 * separately numbered class family (text-1, text-2, ..., border-1, bg-1,
 * ...) instead of one shared "qux-N" counter across all groups. This makes
 * the generated class names self describing and keeps each family's
 * numbering dense (a stylesheet with 5 distinct text treatments and 2
 * distinct borders gets text-1..5 and border-1..2, not scattered qux-N gaps).
 */
const GROUP_PREFIX = {
    font: 'text',
    border: 'border',
    padding: 'spacing',
    background: 'bg',
    shadow: 'shadow',
    opacity: 'opacity'
}

/**
 * Cap on how many distinct pixel values become a spacing utility class, per
 * axis/side (mt, ml, pt, pb, pl, pr each get their own top N) - keeps the
 * generated stylesheet to the handful of gaps that actually recur as a
 * rhythm across the model, rather than one class per node's exact gap.
 */
const TOP_SPACING_VALUES = 8

/**
 * Extracts a deduplicated CSS stylesheet from a whole model (model.widgets,
 * model.screens and, when a widget references one, model.templates) rather
 * than from a single positioned screen tree (see QUX2HTML.js for that).
 *
 * Each widget/screen style is split into the same small groups QUX2HTML.js
 * uses (font/border/padding/background/shadow/opacity - see GROUP_PREFIX
 * above). Every group's CSS text is hashed into a shared class of its own family
 * ("text-1", "border-1", "bg-1", ...) the first time it's seen, and reused
 * verbatim on every subsequent widget with the exact same declaration - so
 * the number of classes reflects the number of *distinct* looks in the
 * model, not the number of widgets.
 */
export default class QUX2CSS {

    /**
     * pretty: when true, each declaration inside a rule is put on its own
     * line (".text-1 {\n  color: #000;\n  font-size: 14px;\n}") instead of
     * all on one line - purely a formatting choice for human inspection
     * (e.g. AgentTest.vue's CSS preview), the dedup logic is unaffected.
     */
    toCSS(model, pretty = false) {
        this.model = model
        this.cssRules = []
        this.styleToClassName = new Map()
        this.classCounters = {}
        this.usedNames = new Set()

        Object.values(model.widgets || {}).forEach(widget => this.addStyleGroups(widget, false))
        Object.values(model.screens || {}).forEach(screen => this.addStyleGroups(screen, true))
        Object.values(model.templates || {}).forEach(template => this.addStyleGroups(template, true))

        this.addDesignTokenClasses(model)
        this.addTemplateClasses(model)
        this.addSpacingClasses(model)

        if (pretty) {
            return this.cssRules.map(rule => this.formatRulePretty(rule)).join('\n')
        }
        return this.cssRules.join('\n')
    }

    /* -----------------------------------------------------------------
     * Spacing utility classes: Tailwind-style mt-N/ml-N/pt-N/pb-N/pl-N/pr-N,
     * one per distinct pixel value - but only for the handful of values that
     * actually recur across the model, not one class per node.
     *
     * Margins come from the same positioned tree QUX2HTML.js renders from
     * (Flat2Tree, with the same grid-simplification into flex rows/columns/
     * wraps) - a node's gap to its previous sibling (or, for the first
     * child, to the parent's edge) only has a clean, singular meaning once
     * that layout resolution has happened; raw x/y overlap doesn't. We reuse
     * QUX2HTML's own tree-building and its getPositionStyle() margin
     * resolution rather than re-deriving layout heuristics here. Padding is
     * simpler - it's just each widget's own paddingTop/Bottom/Left/Right,
     * read directly off its resolved style, independent of the tree.
     * --------------------------------------------------------------- */

    addSpacingClasses(model) {
        const margins = this.collectMarginCounts(model)
        const paddings = this.collectPaddingCounts(model)

        this.addTopSpacingClasses(margins.top, 'mt', 'margin-top')
        this.addTopSpacingClasses(margins.left, 'ml', 'margin-left')
        this.addTopSpacingClasses(paddings.top, 'pt', 'padding-top')
        this.addTopSpacingClasses(paddings.bottom, 'pb', 'padding-bottom')
        this.addTopSpacingClasses(paddings.left, 'pl', 'padding-left')
        this.addTopSpacingClasses(paddings.right, 'pr', 'padding-right')
    }

    /**
     * Emits a class for each of the TOP_SPACING_VALUES most frequent
     * pixel values in counts (a Map<number,count>), skipping 0 (no-op,
     * nothing to add a class for) - sorted by frequency, ties broken by
     * the smaller pixel value so output is deterministic.
     */
    addTopSpacingClasses(counts, prefix, cssProp) {
        const entries = Array.from(counts.entries())
            .filter(([px]) => px > 0)
            .sort((a, b) => b[1] - a[1] || a[0] - b[0])
            .slice(0, TOP_SPACING_VALUES)

        entries.forEach(([px]) => {
            this.cssRules.push(`.${prefix}-${px} { ${cssProp}:${px}px; }`)
        })
    }

    /**
     * Builds the positioned tree for every screen (QUX2HTML's own
     * transform pipeline, unchanged) and walks each one, tallying how many
     * times each rounded margin-top / margin-left value occurs between a
     * node and its layout predecessor (previous sibling, or the parent's
     * edge for a first child) - restricted to the flex-resolved layout
     * types QUX2HTML derives margins for (row/auto-vertical/auto-horizontal
     * /wrap); grid children are skipped since their placement is a track
     * index, not a margin.
     */
    collectMarginCounts(model) {
        const top = new Map()
        const left = new Map()
        const qux2html = new QUX2HTML()

        Object.keys(model.screens || {}).forEach(screenId => {
            let scrnTree
            try {
                scrnTree = qux2html.toTree(model, screenId)
            } catch (e) {
                return
            }
            if (scrnTree) {
                this.walkMargins(scrnTree, null, top, left)
            }
        })

        return { top, left }
    }

    walkMargins(node, parent, top, left) {
        if (parent) {
            const parentLayout = parent.layout && parent.layout.type
            if (parentLayout === 'auto-horizontal') {
                const marginLeft = node.left !== undefined ? node.left : node.x
                this.addCount(left, this.round(marginLeft))
                this.addCount(top, this.round(node.y || 0))
            } else if (parentLayout === 'row' || parentLayout === 'auto-vertical' || parentLayout === 'wrap') {
                const marginTop = node.top !== undefined ? node.top : node.y
                this.addCount(top, this.round(marginTop))
            }
            // grid (and anything else): position is a track index, not a margin - skipped.
        }
        const children = node.children || []
        children.forEach(child => this.walkMargins(child, node, top, left))
    }

    /**
     * Each widget/screen/template's own padding, tallied the same way as
     * margins - independent of the tree, since padding is a property of the
     * node itself rather than its relation to a parent/sibling.
     */
    collectPaddingCounts(model) {
        const top = new Map()
        const bottom = new Map()
        const left = new Map()
        const right = new Map()

        const tally = style => {
            if (!style) {
                return
            }
            this.addCount(top, this.round(style.paddingTop))
            this.addCount(bottom, this.round(style.paddingBottom))
            this.addCount(left, this.round(style.paddingLeft))
            this.addCount(right, this.round(style.paddingRight))
        }

        Object.values(model.widgets || {}).forEach(widget => tally(this.resolveStyle(widget, false)))
        Object.values(model.screens || {}).forEach(screen => tally(this.resolveStyle(screen, true)))
        Object.values(model.templates || {}).forEach(template => tally(template.style))

        return { top, bottom, left, right }
    }

    addCount(counts, px) {
        if (!px || px <= 0) {
            return
        }
        counts.set(px, (counts.get(px) || 0) + 1)
    }

    round(value) {
        return Math.round(this.toNumber(value, 0))
    }

    /* -----------------------------------------------------------------
     * Named classes: one dedicated class per design token / per template,
     * named after the token's/template's own `name` rather than an
     * auto-numbered family - these are meant to be recognizable/reusable by
     * name (e.g. ".BlueBox", ".NextFlight"), not deduplication targets, so
     * unlike the groups above every token/template always gets its own rule
     * even if two happen to produce identical CSS text.
     * --------------------------------------------------------------- */

    /**
     * One combined class per design token (not split into font/border/...
     * families like widget styles are): a token only ever targets one or a
     * few related CSS props to begin with (see getDesignTokenStyle()), so
     * there's no meaningful overlap to dedupe within a single token's rule.
     */
    addDesignTokenClasses(model) {
        Object.values(model.designtokens || {}).forEach(token => {
            const style = this.getDesignTokenStyle(token)
            const cssText = this.getStyleGroups(style, false).map(g => g.css).join('')
            if (!cssText) {
                return
            }
            const className = this.getUniqueName(token.name)
            this.cssRules.push(`.${className} { ${cssText} }`)
        })
    }

    /**
     * Mirrors CSSExporter.vue's getDesignTokenCss(): a complex token's value
     * is already an object keyed by CSS-style prop names (e.g. a "text"
     * token spanning fontSize/fontWeight/...); a simple token targets a
     * single prop named after its own type (e.g. type "color" -> {color:
     * value}, type "boxShadow" -> {boxShadow: value}).
     */
    getDesignTokenStyle(token) {
        if (token.isComplex) {
            return token.value || {}
        }
        return { [token.type]: token.value }
    }

    /**
     * One combined class per named template, including its own pixel height
     * (template.h) alongside its look - width is left to layout rather than
     * fixed, matching QUX2HTML.js's containers (which likewise only ever
     * pin height explicitly, via getSizeStyle()). Group templates (type
     * "Group") carry no style of their own - just a name, w/h and a list of
     * child template ids - so they still get a class, just height-only;
     * their children already get their own look classes when
     * addStyleGroups() runs the generic per-template dedup pass above.
     */
    addTemplateClasses(model) {
        Object.values(model.templates || {}).forEach(template => {
            if (!template.name) {
                return
            }
            const isContainer = template.type === 'Group'
            const styleGroups = template.style ? this.getStyleGroups(template.style, isContainer) : []
            const cssText = this.getSizeCSS(template) + styleGroups.map(g => g.css).join('')
            if (!cssText) {
                return
            }
            const className = this.getUniqueName(template.name)
            this.cssRules.push(`.${className} { ${cssText} }`)
        })
    }

    getSizeCSS(node) {
        let css = ''
        if (this.toNumber(node.h, 0) > 0) {
            css += `height:${node.h}px;`
        }
        return css
    }

    /**
     * Turns an arbitrary token/template name into a valid, collision free
     * CSS class name: sanitized to [a-zA-Z0-9_-], guaranteed not to start
     * with a digit (invalid as a CSS identifier), and suffixed with a
     * running number ("BlueBox", "BlueBox-2", ...) the first time it
     * collides with a name already used in this stylesheet.
     */
    getUniqueName(rawName) {
        const base = this.sanitizeClassName(rawName)
        let name = base
        let i = 1
        while (this.usedNames.has(name)) {
            i += 1
            name = `${base}-${i}`
        }
        this.usedNames.add(name)
        return name
    }

    sanitizeClassName(rawName) {
        let name = String(rawName || '').trim().replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
        if (!name) {
            name = 'token'
        }
        if (/^[0-9]/.test(name)) {
            name = `_${name}`
        }
        return name
    }

    /**
     * Reformats a single ".className { prop:value;prop:value; }" rule
     * (as produced by resolveClass()) into one declaration per line.
     */
    formatRulePretty(rule) {
        const match = /^(\.[^{]+)\{\s*(.*?)\s*\}$/.exec(rule)
        if (!match) {
            return rule
        }
        const [, selector, body] = match
        const declarations = body.split(';').map(d => d.trim()).filter(d => d)
        if (declarations.length === 0) {
            return `${selector.trim()} {\n}`
        }
        const lines = declarations.map(d => `  ${d};`).join('\n')
        return `${selector.trim()} {\n${lines}\n}`
    }

    /**
     * Same shape as toCSS(), but additionally returns, per widget/screen id,
     * the list of class names it resolves to - useful for callers (e.g. an
     * HTML exporter) that want to reuse this extracted stylesheet instead of
     * inlining styles per node.
     */
    toCSSWithClassMap(model, pretty = false) {
        const css = this.toCSS(model, pretty)
        const idToClasses = {}
        Object.values(model.widgets || {}).forEach(widget => {
            idToClasses[widget.id] = this.getClassesForStyle(this.resolveStyle(widget, false))
        })
        Object.values(model.screens || {}).forEach(screen => {
            idToClasses[screen.id] = this.getClassesForStyle(this.resolveStyle(screen, true))
        })
        return { css, idToClasses }
    }

    /* -----------------------------------------------------------------
     * Style resolution
     * --------------------------------------------------------------- */

    /**
     * Effective style for a widget, merging in its template (if any) via
     * ModelUtil - screens never carry a template.
     */
    resolveStyle(node, isScreen) {
        return node.style || {}
    }

    addStyleGroups(node, isScreen) {
        const style = this.resolveStyle(node, isScreen)
        this.getClassesForStyle(style, isScreen)
    }

    /**
     * Resolves (and, the first time a given group is seen, registers) the
     * classes for one widget/screen style, returning the list of class
     * names that together reproduce it.
     */
    getClassesForStyle(style, isContainer = false) {
        const groups = this.getStyleGroups(style, isContainer)
        return groups.map(group => this.resolveClass(group.key, group.css))
    }

    /**
     * cssText is deduplicated per group key, not globally - two different
     * groups (e.g. a border and a background) never share a class even if
     * their CSS text happened to collide, and each group family keeps its
     * own dense counter (text-1, text-2, ... independent of border-1, ...).
     */
    resolveClass(groupKey, cssText) {
        const cacheKey = `${groupKey} ${cssText}`
        let className = this.styleToClassName.get(cacheKey)
        if (!className) {
            className = this.getClassName(groupKey)
            this.styleToClassName.set(cacheKey, className)
            this.cssRules.push(`.${className} { ${cssText} }`)
        }
        return className
    }

    getClassName(groupKey) {
        const prefix = GROUP_PREFIX[groupKey] || groupKey
        this.classCounters[groupKey] = (this.classCounters[groupKey] || 0) + 1
        return `${prefix}-${this.classCounters[groupKey]}`
    }

    /* -----------------------------------------------------------------
     * style object (JS/CSS camelCase) -> small, independently
     * deduplicated CSS groups. Mirrors QUX2HTML.js's getStyleGroups() and
     * its helpers, just applied directly to a widget/screen style instead
     * of a positioned tree node.
     * --------------------------------------------------------------- */

    getStyleGroups(style, isContainer) {
        if (!style) {
            return []
        }
        return [
            { key: 'font', css: this.getFontCSS(style) },
            { key: 'border', css: this.getBorderCSS(style) },
            { key: 'padding', css: isContainer ? '' : this.getPaddingCSS(style) },
            { key: 'background', css: this.getBackgroundCSS(style) },
            { key: 'shadow', css: this.getShadowCSS(style) },
            { key: 'opacity', css: this.getOpacityCSS(style) }
        ].filter(group => group.css)
    }

    /**
     * style.color is normally a plain color string, but - mirroring
     * UIWidget.vue's _set_gradient_color() - it can also be a gradient
     * object ({gradient:true, colors:[{c,p}], direction}), rendered as a
     * background-image clipped to the text instead of a solid color.
     */
    getFontCSS(style) {
        const color = style.color
        if (color && typeof color === 'object' && color.gradient) {
            const rest = this.getStyleByKeys(style, FONT_KEYS.filter(k => k !== 'color'))
            const stops = this.getSortedGradientStops(color)
            return `background-image:linear-gradient(${color.direction}deg, ${stops});background-clip:text;-webkit-background-clip:text;color:transparent;${rest}`
        }
        return this.getStyleByKeys(style, FONT_KEYS)
    }

    getBorderCSS(style) {
        let css = ''
        if (this.hasAnyBorderWidth(style)) {
            css += this.getUniformGroup(style, BORDER_COLOR_KEYS, 'border-color')
            css += this.getUniformGroup(style, BORDER_WIDTH_KEYS, 'border-width')
            css += 'border-style:solid;'
        } else {
            css += 'border:none;'
        }
        css += this.getRadiusCSS(style)
        return css
    }

    getRadiusCSS(style) {
        return this.getUniformSkipZero(style, BORDER_RADIUS_KEYS, 'border-radius')
    }

    getUniformGroup(style, keys, shorthandProp) {
        const values = keys.map(key => style[key])
        if (values.every(v => v === undefined || v === null || v === '')) {
            return ''
        }
        if (values.every(v => v === values[0])) {
            return `${shorthandProp}:${this.formatValue(keys[0], values[0])};`
        }
        return this.getStyleByKeys(style, keys)
    }

    getUniformSkipZero(style, keys, shorthandProp) {
        const values = keys.map(key => style[key])
        if (values.every(v => !v)) {
            return ''
        }
        if (values.every(v => v === values[0])) {
            return `${shorthandProp}:${this.formatValue(keys[0], values[0])};`
        }
        let css = ''
        keys.forEach((key, i) => {
            if (values[i]) {
                css += `${CSS_PROP_MAP[key]}:${this.formatValue(key, values[i])};`
            }
        })
        return css
    }

    getPaddingCSS(style) {
        const values = PADDING_KEYS.map(key => style[key])
        if (values.every(v => !v)) {
            return ''
        }
        if (values.every(v => v === values[0])) {
            return `padding:${values[0]}px;`
        }
        const [top, bottom, left, right] = values.map(v => `${v || 0}px`)
        return `padding:${top} ${right} ${bottom} ${left};`
    }

    getOpacityCSS(style) {
        return this.getStyleByKeys(style, ['opacity'])
    }

    getShadowCSS(style) {
        if (!style.boxShadow) {
            return ''
        }
        return `box-shadow:${this.formatBoxShadow(style.boxShadow)};`
    }

    getStyleByKeys(style, keys) {
        let css = ''
        keys.forEach(key => {
            const value = style[key]
            if (value === undefined || value === null || value === '') {
                return
            }
            css += `${CSS_PROP_MAP[key]}:${this.formatValue(key, value)};`
        })
        return css
    }

    hasAnyBorderWidth(style) {
        return BORDER_WIDTH_KEYS.some(k => this.toNumber(style[k], 0) > 0)
    }

    formatValue(key, value) {
        if (key === 'fontFamily') {
            return this.escapeFontFamily(value)
        }
        if (PIXEL_KEYS.has(key)) {
            return `${value}px`
        }
        return this.toHexColor(value)
    }

    toHexColor(value) {
        if (typeof value !== 'string') {
            return value
        }
        const m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/i.exec(value)
        if (!m) {
            return value
        }
        const [, r, g, b, a] = m
        const hex = [r, g, b].map(c => Number(c).toString(16).padStart(2, '0')).join('')
        if (a !== undefined && Number(a) < 1) {
            const alphaHex = Math.round(Number(a) * 255).toString(16).padStart(2, '0')
            return `#${hex}${alphaHex}`
        }
        return `#${hex}`
    }

    escapeFontFamily(value) {
        return String(value).split(',').map(f => {
            f = f.trim()
            return f.indexOf(' ') >= 0 ? `"${f}"` : f
        }).join(', ')
    }

    formatBoxShadow(shadow) {
        const inset = shadow.i ? ' inset' : ''
        return `${shadow.h}px ${shadow.v}px ${shadow.b}px ${shadow.s}px ${this.toHexColor(shadow.c)}${inset}`
    }

    getBackgroundCSS(style) {
        let css = ''
        if (style.background) {
            if (typeof style.background === 'object' && style.background.colors) {
                css += this.getBackgroundGradientCSS(style.background)
            } else if (this.hasVisibleBackground(style.background)) {
                css += `background-color:${this.toHexColor(style.background)};`
            }
        }
        if (style.backgroundColor && this.hasVisibleBackground(style.backgroundColor)) {
            css += `background-color:${this.toHexColor(style.backgroundColor)};`
        }
        return css
    }

    getBackgroundGradientCSS(background) {
        if (background.radial) {
            const stops = this.getSortedGradientStops(background)
            return `background-image:radial-gradient(circle, ${stops});`
        }
        const stops = this.getSortedGradientStops(background)
        const gradient = `(${background.direction}deg, ${stops})`
        return `background-image:linear-gradient${gradient};background-image:-webkit-linear-gradient${gradient};`
    }

    getSortedGradientStops(background) {
        return background.colors
            .slice()
            .sort((a, b) => a.p - b.p)
            .map(c => `${this.toHexColor(c.c)} ${c.p}%`)
            .join(', ')
    }

    hasVisibleBackground(bg) {
        if (!bg) {
            return false
        }
        if (typeof bg === 'object') {
            return true
        }
        const rgba = /rgba?\(([^)]+)\)/.exec(bg)
        if (rgba) {
            const parts = rgba[1].split(',').map(p => parseFloat(p))
            if (parts.length === 4 && parts[3] === 0) {
                return false
            }
        }
        return bg !== 'transparent'
    }

    toNumber(value, fallback) {
        const n = parseFloat(value)
        return isNaN(n) ? fallback : n
    }

}
