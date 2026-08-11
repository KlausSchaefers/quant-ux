import Logger from '../core/Logger'
import * as Flat2Tree from '../core/responsive/Flat2Tree'
import * as Quant2Flat from '../core/responsive/Quant2Flat'
import Config from '../core/responsive/Config'

/**
 * Maps our internal camelCase style keys to CSS properties. Keys that need
 * special handling (background, boxShadow, backgroundImage) are treated
 * separately in getBackgroundCSS()/getShadowCSS().
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
    // letterSpacing/lineHeight already arrive pre-formatted ("normal", "1px", "37.76px")
    'fontSize',
    'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth',
    'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius',
    'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'
])

/**
 * A node's "own style" (its look, independent of where it sits or how big it
 * is) is split into small, independently deduplicated groups instead of one
 * monolithic block. Two nodes rarely share an identical combination of every
 * property, but they very often share e.g. the exact same font treatment or
 * the exact same border/radius - splitting lets each of those pieces dedupe
 * on its own instead of being blocked by the rest of the declaration.
 */
const FONT_KEYS = [
    'color', 'textAlign', 'fontFamily', 'fontSize', 'fontStyle',
    'fontWeight', 'letterSpacing', 'lineHeight', 'textDecoration'
]
const BORDER_COLOR_KEYS = ['borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor']
const BORDER_WIDTH_KEYS = ['borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth']
const BORDER_RADIUS_KEYS = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius']
const PADDING_KEYS = ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight']

const INPUT_TYPES = {
    TextBox: 'text',
    Password: 'password'
}

/**
 * Converts the nested, pixel positioned scrnTree produced by Flat2Tree into a
 * single, self contained HTML file. Every node in the tree already carries
 * its box (x, y, w, h relative to its parent), a JS/CSS style object and,
 * for containers, pre computed layout information:
 *
 *  - node.layout.type: 'row' | 'grid' | 'wrap' | 'auto-horizontal' | 'auto-vertical'
 *  - node.grid: {columns:[{v,l,...}], rows:[{v,l,...}]}  present on *every*
 *    container, independent of layout.type. columns[i].l / rows[i].l are the
 *    pixel size of track i.
 *  - node.gridColumnStart/End, gridRowStart/End: 0 based track indices into
 *    the *parent's* grid.columns/rows.
 *  - node.top: for 'row' layout children, the gap to the previous sibling
 *    (or to the top of the container for the first child).
 *
 * We use this information to lay out children with real flexbox/grid CSS
 * instead of absolute positioning, while keeping every box's own pixel size
 * so the result still matches the original design.
 */
export default class QUX2HTML {

    constructor(config = Config.getDefault()) {
        this.config = config
        this.config.useRows = true
        this.config.wrapGroups = true
        this.config.removeRootIfNeeded = false
        this.config.zoom = 1
    }

    toHTML(model, screenID, wrapGroups = false, removeRootIfNeeded = false, simplifyGrid = true) {
        const scrnTree = this.toTree(model, screenID, wrapGroups, removeRootIfNeeded, simplifyGrid)

        Logger.log(1, 'QUX2HTML.toHTML()', scrnTree)

        this.cssRules = []
        this.styleToClassName = new Map()
        this.classCounters = {}
        const bodyHTML = this.renderNode(scrnTree, null, true)
        return this.wrapDocument(scrnTree, bodyHTML, this.cssRules.join('\n'))
    }

    /**
     * The positioned, layout-resolved tree for one screen - everything
     * toHTML() does short of rendering markup/CSS. Factored out so other
     * tools (e.g. QUX2CSS.js's margin extraction) can walk the same
     * grid-simplified layout QUX2HTML renders from without duplicating this
     * pipeline.
     */
    toTree(model, screenID, wrapGroups = false, removeRootIfNeeded = false, simplifyGrid = true) {
        this.model = model
        this.config.removeRootIfNeeded = removeRootIfNeeded
        if (wrapGroups) {
            model = Quant2Flat.transform(model, this.config)
        }
        const treeModel = Flat2Tree.transform(model, this.config)
        const scrnTree = treeModel.screens.find(s => s.id === screenID)
        this.cleanTree(scrnTree)
        if (simplifyGrid) {
            this.removeNotNeedGrid(scrnTree)
        }
        return scrnTree
    }

    cleanTree(scrn) {
        if (scrn.children) {
            scrn.children.forEach(c => {
                c.parent = null
                this.cleanTree(c)
            })
        }
    }

    /**
     * Flat2Tree computes a CSS grid for *every* container whose children
     * overlap in some way, regardless of whether that overlap actually
     * needs 2D placement to render correctly. A container only genuinely
     * needs a grid when its children overlap in BOTH axes at once (e.g. one
     * child sits directly to the right of another AND a third sits below
     * both) - that's real 2D structure. Three simpler, common cases don't:
     *
     *  - no pair of children overlaps in x  -> one horizontal row, flex row
     *  - no pair of children overlaps in y  -> one vertical stack, flex column
     *  - children overlap in y *within* clusters but not *across* them (e.g.
     *    three icons side by side, then another three below) -> several
     *    explicit row bands, each an internal flex row, stacked in a flex
     *    column - not a single flat flex, since the row grouping itself is
     *    real structure worth keeping explicit.
     *
     * Anything left over (children that don't cleanly decompose into row
     * bands, e.g. staggered/columns that don't line up) keeps its grid.
     */
    removeNotNeedGrid(node) {
        if (node.children && node.children.length > 0) {
            node.children.forEach(c => this.removeNotNeedGrid(c))

            if (node.layout && node.layout.type === 'grid' && node.grid) {
                this.simplifyGrid(node)
            }
        }
    }

    simplifyGrid(node) {
        const children = node.children

        if (!this.anyOverlap(children, 'x')) {
            this.convertToFlexRow(node, children)
            return
        }

        if (!this.anyOverlap(children, 'y')) {
            this.convertToFlexColumn(node, children)
            return
        }

        const bands = this.groupIntoRowBands(children)
        if (bands.length > 1 && bands.every(band => !this.anyOverlap(band, 'x'))) {
            this.convertToExplicitRows(node, bands)
        }
        // else: children genuinely overlap in both axes at once - keep the grid.
    }

    /**
     * Clusters children into row bands purely by y-overlap: walking top to
     * bottom, a child joins the current band if it overlaps the band's
     * y-range so far, otherwise it starts a new band. This is transitive
     * (A overlapping B and B overlapping C bands them together even if A
     * and C don't directly overlap), matching how a real multi-row layout
     * reads visually.
     */
    groupIntoRowBands(children) {
        const sorted = children.slice().sort((a, b) => a.y - b.y)
        const bands = []
        let current = null
        sorted.forEach(child => {
            if (current && child.y < current.bottom) {
                current.children.push(child)
                current.bottom = Math.max(current.bottom, child.y + child.h)
            } else {
                current = { children: [child], bottom: child.y + child.h }
                bands.push(current)
            }
        })
        return bands.map(b => b.children)
    }

    anyOverlap(children, axis) {
        for (let i = 0; i < children.length; i++) {
            for (let j = i + 1; j < children.length; j++) {
                if (this.overlaps(children[i], children[j], axis)) {
                    return true
                }
            }
        }
        return false
    }

    overlaps(a, b, axis) {
        const pos = axis === 'x' ? 'x' : 'y'
        const size = axis === 'x' ? 'w' : 'h'
        return a[pos] < b[pos] + b[size] && b[pos] < a[pos] + a[size]
    }

    /**
     * A single horizontal row: every child sits side by side with no
     * vertical variation - lay them out with a horizontal flexbox instead,
     * using each child's gap to the previous sibling (mirroring how
     * Flat2Tree computes "top" for its native vertical 'row' layout, just
     * along x instead of y).
     */
    convertToFlexRow(node, children) {
        children.sort((a, b) => a.x - b.x)
        let last = 0
        children.forEach(child => {
            child.left = child.x - last
            last = child.x + child.w
        })
        // CSS Grid's grid-template-columns implicitly reserved any trailing
        // space after the last child (e.g. right padding baked into the
        // original design) as an empty final track. A flex row has no such
        // mechanism - width is explicit, but content just ends - so
        // reinstate that gap as padding-right on the container itself.
        if (node.w > last) {
            node.paddingRight = node.w - last
        }
        // A row container *also* renders height:auto (see getSizeStyle), so
        // it needs the same bottom-gap treatment as a column - see
        // addTrailingPaddingBottom().
        this.addTrailingPaddingBottom(node, children)
        node.children = children
        node.layout = { type: 'auto-horizontal', grow: 0 }
    }

    /**
     * A single vertical stack: every child sits directly above/below the
     * next with no horizontal variation - lay them out with QuantUX's
     * vertical 'row' layout instead, computing the same "top" gap Flat2Tree
     * would have produced natively.
     */
    convertToFlexColumn(node, children) {
        children.sort((a, b) => a.y - b.y)
        let last = 0
        children.forEach(child => {
            child.top = child.y - last
            last = child.y + child.h
        })
        this.addTrailingPaddingBottom(node, children)
        node.children = children
        node.layout = { type: 'row', grow: 0 }
    }

    /**
     * Containers always render with height:auto, regardless of whether
     * they ended up a flex row or a flex column (see getSizeStyle) - so the
     * vertical trailing gap (distance from the lowest child's bottom edge
     * to the container's own bottom edge in the source design) has to be
     * reinstated as padding-bottom in *both* cases, not just the
     * vertical-stack one. Width, by contrast, is always explicit on
     * containers, so there's no equivalent cross-axis gap to fix up for a
     * flex column.
     */
    addTrailingPaddingBottom(node, children) {
        const maxBottom = Math.max(...children.map(c => c.y + c.h))
        if (node.h > maxBottom) {
            node.paddingBottom = node.h - maxBottom
        }
    }

    /**
     * Several row bands: wrap each band in a synthetic horizontal flex
     * container (same shape convertToFlexRow() produces, just built by hand
     * since there's no source widget for it), then stack those bands
     * vertically like convertToFlexColumn() would.
     */
    convertToExplicitRows(node, bands) {
        const rowNodes = bands.map((band, i) => {
            const minX = Math.min(...band.map(c => c.x))
            const minY = Math.min(...band.map(c => c.y))
            const maxRight = Math.max(...band.map(c => c.x + c.w))
            const maxBottom = Math.max(...band.map(c => c.y + c.h))

            band.forEach(child => {
                child.x -= minX
                child.y -= minY
            })

            const row = {
                id: `${node.id}-row${i}`,
                type: 'Box',
                x: minX,
                y: minY,
                w: maxRight - minX,
                h: maxBottom - minY,
                style: {},
                children: band
            }
            this.convertToFlexRow(row, band)
            return row
        })

        this.convertToFlexColumn(node, rowNodes)
    }

    /* -----------------------------------------------------------------
     * Document
     * --------------------------------------------------------------- */

    wrapDocument(scrn, bodyHTML, nodeCSS) {
        const title = this.escapeHTML(scrn.name || 'Screen')
        return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
  }
  img { display: block; max-width: 100%; }
  button {
    font: inherit;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    border: none;
    background: none;
    margin: 0;
  }
  input, textarea, select { font: inherit; }
  a { text-decoration: none; color: inherit; }
  .qux-screen {
    position: relative;
    background: #fff;
    overflow: hidden;
  }
</style>
<style>
${nodeCSS}
</style>
</head>
<body>
${bodyHTML}
</body>
</html>
`
    }

    /* -----------------------------------------------------------------
     * Node rendering
     * --------------------------------------------------------------- */

    renderNode(node, parent, isRoot = false) {
        const hasChildren = node.children && node.children.length > 0
        if (hasChildren || isRoot) {
            return this.renderContainer(node, parent, isRoot)
        }
        return this.renderLeaf(node, parent)
    }

    renderContainer(node, parent, isRoot) {
        const ownGroups = this.getStyleGroups(node.style, true)
        const layoutStyle = this.getLayoutStyle(node)
        const sizeStyle = this.getSizeStyle(node, parent, true)
        const posStyle = `${isRoot ? '' : this.getPositionStyle(node, parent)}${sizeStyle}${layoutStyle}`

        this.assignClasses(node, ownGroups, posStyle)
        const cls = isRoot ? `qux-screen ${this.getClassAttr(node)}` : this.getClassAttr(node)

        const childrenHTML = (node.children || []).map(c => this.renderNode(c, node)).join('')
        const fixedHTML = (node.fixedChildren || []).map(c => this.renderNode(c, node)).join('')

        return `<div class="${cls}"${this.getDataAttr(node)}>${childrenHTML}${fixedHTML}</div>`
    }

    renderLeaf(node, parent) {
        const ownGroups = this.getStyleGroups(node.style, false)
        if (node.type === 'Image') {
            // <img> is a replaced element: unlike a plain div, it won't
            // reliably stretch to fill a CSS grid cell on its own (no src
            // means no intrinsic size for the "stretch" alignment to work
            // with), so it always gets its own explicit pixel size.
            const posStyle = `${this.getPositionStyle(node, parent)}${this.getSizeStyle(node, parent, false, true)}`
            return this.renderImage(node, ownGroups, posStyle)
        }

        const posStyle = `${this.getPositionStyle(node, parent)}${this.getSizeStyle(node, parent)}`

        if (INPUT_TYPES[node.type]) {
            this.assignClasses(node, ownGroups, posStyle)
            const label = this.getLabel(node)
            return `<input type="${INPUT_TYPES[node.type]}" placeholder="${this.escapeAttr(label)}" class="${this.getClassAttr(node)}"${this.getDataAttr(node)}>`
        }

        if (node.type === 'TextArea') {
            this.assignClasses(node, ownGroups, posStyle)
            const label = this.getLabel(node)
            return `<textarea placeholder="${this.escapeAttr(label)}" class="${this.getClassAttr(node)}"${this.getDataAttr(node)}></textarea>`
        }

        if (node.type === 'DropDown') {
            this.assignClasses(node, ownGroups, posStyle)
            const label = this.getLabel(node)
            const option = label ? `<option>${this.escapeHTML(label)}</option>` : ''
            return `<select class="${this.getClassAttr(node)}"${this.getDataAttr(node)}>${option}</select>`
        }

        if (node.type === 'CheckBox' || node.type === 'RadioBox2') {
            this.assignClasses(node, [...ownGroups, 'display:flex;align-items:center;gap:6px;'], posStyle)
            const label = this.getLabel(node)
            const inputType = node.type === 'CheckBox' ? 'checkbox' : 'radio'
            return `<label class="${this.getClassAttr(node)}"${this.getDataAttr(node)}><input type="${inputType}">${this.escapeHTML(label)}</label>`
        }

        this.assignClasses(node, ownGroups, posStyle)
        const tag = this.getLeafTag(node)
        const label = this.getLabel(node)
        return `<${tag} class="${this.getClassAttr(node)}"${this.getDataAttr(node)}>${this.escapeHTML(label)}</${tag}>`
    }

    renderImage(node, ownGroups, posStyle) {
        const bg = node.style && node.style.backgroundImage
        if (bg && bg.url && bg.url.indexOf('http') === 0) {
            this.assignClasses(node, [...ownGroups, 'object-fit:cover;'], posStyle)
            return `<img src="${this.escapeAttr(bg.url)}" class="${this.getClassAttr(node)}"${this.getDataAttr(node)} alt="">`
        }
        // No portable URL (missing, or a server-relative path we can't embed
        // in a self contained file) - still an <img>, just without a src.
        this.assignClasses(node, [...ownGroups, this.getImagePlaceholderStyle()], posStyle)
        return `<img class="${this.getClassAttr(node)}"${this.getDataAttr(node)} alt="">`
    }

    /**
     * data-qid="<widget id>" on every rendered element, purely for
     * debugging: lets you inspect an element in devtools and immediately
     * see which source widget it came from (and cross reference it against
     * console dumps of the tree, e.g. from removeNotNeedGrid()).
     */
    getDataAttr(node) {
        return ` data-qid="${this.escapeAttr(node.id)}"`
    }

    /* -----------------------------------------------------------------
     * CSS class per node, deduplicated by css text
     * --------------------------------------------------------------- */

    /**
     * Resolves the CSS class(es) for a node, reusing an existing class when
     * an earlier node already produced the exact same CSS.
     *
     * ownGroups is a list of small, independent "look" declarations (font,
     * border, background, ...) - see getStyleGroups(). Each one is resolved
     * to its own "s<n>" class, so e.g. two nodes with the same font but a
     * different border still share the font class. Geometry (size,
     * margin/grid placement in the parent, and - for containers - how its
     * own children are laid out) is kept as one further, separately
     * deduplicated "p<n>" class: two nodes can easily look identical while
     * differing only in size or position (e.g. repeated cards/icon
     * placeholders in a list), and splitting it out lets the shared "look"
     * classes still dedupe even though "geometry" differs. The result is
     * cached on the node as _cssClass so render call sites don't need to
     * carry class names/style text around separately.
     */
    assignClasses(node, ownGroups, posStyle) {
        node._cssClass = []
        ownGroups.filter(cssText => cssText).forEach(cssText => {
            const className = this.resolveClass(cssText, 's')
            if (className) {
                node._cssClass.push(className)
            }
        })
        const posClass = this.resolveClass(posStyle, 'p')
        if (posClass) {
            node._cssClass.push(posClass)
        }
        return node._cssClass
    }

    resolveClass(cssText, prefix) {
        if (!cssText) {
            return null
        }
        let className = this.styleToClassName.get(cssText)
        if (!className) {
            className = this.getClassName(prefix)
            this.styleToClassName.set(cssText, className)
            this.cssRules.push(`.${className} { ${cssText} }`)
        }
        return className
    }

    getClassAttr(node) {
        return node._cssClass.join(' ')
    }

    /**
     * Short, sequential class names (s1, s2, ... / p1, p2, ...) - one
     * running counter per prefix, tracked in this.classCounters.
     */
    getClassName(prefix) {
        this.classCounters[prefix] = (this.classCounters[prefix] || 0) + 1
        return `${prefix}${this.classCounters[prefix]}`
    }

    getImagePlaceholderStyle() {
        return 'background-color:#e5e8eb;'
    }

    getLabel(node) {
        return (node.props && node.props.label) ? node.props.label : ''
    }

    /* -----------------------------------------------------------------
     * Tag selection for leaf nodes
     * --------------------------------------------------------------- */

    getLeafTag(node) {
        const label = this.getLabel(node)
        if (!label) {
            return 'div'
        }

        if (this.looksLikeButton(node)) {
            return 'button'
        }

        const style = node.style || {}
        const fontSize = this.toNumber(style.fontSize, 14)
        const fontWeight = this.toNumber(style.fontWeight, 400)

        if (fontSize >= 28) {
            return 'h1'
        }
        if (fontSize >= 22) {
            return 'h2'
        }
        if (fontSize >= 18 && fontWeight >= 600) {
            return 'h3'
        }
        if (label.length > 60) {
            return 'p'
        }
        return 'div'
    }

    looksLikeButton(node) {
        if (node.type !== 'Button' || node.w > 260) {
            return false
        }
        const style = node.style || {}
        const hasRadius = this.toNumber(style.borderTopLeftRadius, 0) > 0
        const hasBackground = this.hasVisibleBackground(style.background) || this.hasVisibleBackground(style.backgroundColor)
        const centered = style.textAlign === 'center'
        return hasRadius && hasBackground && centered
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

    /* -----------------------------------------------------------------
     * Layout: how a container places its children
     * --------------------------------------------------------------- */

    getLayoutStyle(node) {
        const type = node.layout && node.layout.type
        const grid = node.grid

        if (type === 'grid' && grid && grid.columns && grid.columns.length > 0 && grid.rows && grid.rows.length > 0) {
            const cols = grid.columns.map(c => `${Math.max(c.l, 0)}px`).join(' ')
            const rows = grid.rows.map(r => `${Math.max(r.l, 0)}px`).join(' ')
            // grid-template already reserves any trailing empty track, so a
            // grid never needs the padding fallback below.
            return `display:grid;grid-template-columns:${cols};grid-template-rows:${rows};`
        }

        if (type === 'wrap') {
            return `display:flex;flex-wrap:wrap;align-content:flex-start;align-items:flex-start;${this.getTrailingGapCSS(node)}`
        }

        if (type === 'auto-horizontal') {
            return `display:flex;flex-direction:row;align-items:flex-start;${this.getTrailingGapCSS(node)}`
        }

        // 'row', 'auto-vertical' and everything else: children are stacked top down
        return `display:flex;flex-direction:column;align-items:flex-start;${this.getTrailingGapCSS(node)}`
    }

    /**
     * A flex container's height/width:auto only ever reflects its content -
     * unlike CSS Grid, it has no way to reserve trailing space after the
     * last child. removeNotNeedGrid()'s convertToFlexRow()/convertToFlexColumn()
     * compute exactly how much of the original box that would have been
     * (node.paddingRight/paddingBottom) when converting a grid; render it
     * back as real padding so that space doesn't just disappear.
     */
    getTrailingGapCSS(node) {
        let css = ''
        if (node.paddingBottom > 0) {
            css += `padding-bottom:${node.paddingBottom}px;`
        }
        if (node.paddingRight > 0) {
            css += `padding-right:${node.paddingRight}px;`
        }
        return css
    }

    /**
     * How a *child* is placed inside its parent's layout.
     */
    getPositionStyle(node, parent) {
        if (!parent) {
            return ''
        }

        const parentLayout = parent.layout && parent.layout.type
        if (parentLayout === 'grid' && parent.grid) {
            const colStart = (node.gridColumnStart !== undefined ? node.gridColumnStart : 0) + 1
            const colEnd = (node.gridColumnEnd !== undefined ? node.gridColumnEnd : colStart) + 1
            const rowStart = (node.gridRowStart !== undefined ? node.gridRowStart : 0) + 1
            const rowEnd = (node.gridRowEnd !== undefined ? node.gridRowEnd : rowStart) + 1
            return `grid-column:${colStart} / ${colEnd};grid-row:${rowStart} / ${rowEnd};`
        }

        if (parentLayout === 'auto-horizontal') {
            // Main axis is x here (gap to the previous sibling, via
            // convertToFlexRow()'s "left"), cross axis is y (absolute).
            const marginLeft = node.left !== undefined ? node.left : node.x
            const marginTop = node.y || 0
            return `margin-top:${Math.max(marginTop, 0)}px;margin-left:${Math.max(marginLeft, 0)}px;`
        }

        // 'row', 'auto-vertical' and everything else: main axis is y (gap
        // to the previous sibling), cross axis is x (absolute).
        const marginTop = node.top !== undefined ? node.top : node.y
        const marginLeft = node.x || 0
        return `margin-top:${Math.max(marginTop, 0)}px;margin-left:${Math.max(marginLeft, 0)}px;`
    }

    /**
     * Explicit pixel size for a node. Children of a CSS grid container are
     * skipped by default, since they stretch to fill their assigned track -
     * unless force is set, which always emits an explicit size regardless of
     * the parent's layout (needed for replaced elements like <img>, which
     * don't reliably stretch to fill a grid cell the way a plain div does).
     * Containers get height:auto rather than a fixed pixel height: their
     * content is laid out with flex/grid rather than the original absolute
     * x/y, so its actual rendered height should come from that content, not
     * from the source design's number - a fixed height (even as a min-height
     * floor) can still clip or leave a gap once fonts/wrapping differ.
     */
    getSizeStyle(node, parent, isContainer = false, force = false) {
        const parentLayout = parent && parent.layout && parent.layout.type
        if (!force && parentLayout === 'grid' && parent.grid) {
            return ''
        }
        if (isContainer) {
            return `width:${node.w}px;height:auto;`
        }
        return `width:${node.w}px;height:${node.h}px;`
    }

    /* -----------------------------------------------------------------
     * style object (JS/CSS camelCase) -> small, independently
     * deduplicated CSS groups (font / border / padding / background /
     * shadow / opacity), rather than one monolithic block.
     * --------------------------------------------------------------- */

    getStyleGroups(style, isContainer) {
        if (!style) {
            return []
        }
        return [
            this.getFontCSS(style),
            this.getBorderCSS(style),
            // Containers position their children explicitly (margins or
            // grid tracks already reserve the space padding would take),
            // so applying it again would offset children twice.
            isContainer ? '' : this.getPaddingCSS(style),
            this.getBackgroundCSS(style),
            this.getShadowCSS(style),
            this.getOpacityCSS(style)
        ].filter(group => group)
    }

    getFontCSS(style) {
        return this.getStyleByKeys(style, FONT_KEYS)
    }

    getBorderCSS(style) {
        let css = ''
        if (this.hasAnyBorderWidth(style)) {
            css += this.getUniformGroup(style, BORDER_COLOR_KEYS, 'border-color')
            css += this.getUniformGroup(style, BORDER_WIDTH_KEYS, 'border-width')
            css += 'border-style:solid;'
        } else {
            // No side has a width: the color is irrelevant, so skip it and
            // collapse straight to the shorthand instead of 4 zero-widths.
            css += 'border:none;'
        }
        css += this.getRadiusCSS(style)
        return css
    }

    getRadiusCSS(style) {
        return this.getUniformSkipZero(style, BORDER_RADIUS_KEYS, 'border-radius')
    }

    /**
     * Collapses a set of per-side keys (e.g. the 4 border colors) into a
     * single shorthand declaration when they're all equal - the
     * overwhelmingly common case - falling back to the individual longhand
     * properties otherwise.
     */
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

    /**
     * Like getUniformGroup(), but treats 0 as "no value" too: a corner
     * radius or padding side of 0 has no visual effect, so it's dropped
     * rather than emitted explicitly - individually, or as a
     * "<shorthand>:0px" when all 4 sides happen to be 0.
     */
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

    /**
     * PADDING_KEYS is [top, bottom, left, right]. All 0 -> nothing (padding
     * has no visual effect); all equal and non-zero -> single-value
     * shorthand; otherwise the CSS 4-value shorthand ("padding: top right
     * bottom left") rather than one longhand declaration per side.
     */
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

    /**
     * The source style objects hold colors as rgb()/rgba() strings; convert
     * to hex (#rrggbb, or #rrggbbaa when there's alpha) for shorter, more
     * conventional CSS. Anything that isn't an rgb()/rgba() string (hex
     * already, a keyword like "normal"/"transparent", a number, ...) passes
     * through untouched.
     */
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

    /**
     * Mirrors UIWidget.vue's _set_background_gradient(): stops are sorted by
     * their percentage (the raw data is not guaranteed to be ordered), and
     * the gradient is applied as background-image, with a -webkit- prefixed
     * duplicate for older engines, rather than the `background` shorthand.
     */
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

    /* -----------------------------------------------------------------
     * Helpers
     * --------------------------------------------------------------- */

    toNumber(value, fallback) {
        const n = parseFloat(value)
        return isNaN(n) ? fallback : n
    }

    escapeHTML(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
    }

    escapeAttr(text) {
        return this.escapeHTML(text).replace(/"/g, '&quot;')
    }

}
