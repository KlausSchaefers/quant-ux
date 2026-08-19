import Logger from '../core/Logger.js';
import ModelUtil from '../core/ModelUtil.js';

import ResponsiveLayout from '../core/responsive/ResponsiveLayout'
// import * as Layouter from './Layouter'

const TEXT_NODE = 3

const ELEMENT_NODE = 1

const labelTypes = new Set(['LABEL', 'H1', 'H2', 'H3', 'H4', 'P', 'A', 'CAPTION', 'LI'])

const inlineTextTags = new Set(['B', 'I', 'U', 'STRONG', 'EM', 'A', 'MARK', 'SMALL', 'SUB', 'SUP'])

const nullableStyles = new Set(['backgroundImage'])

const pixelStyles = {
    'border-bottom-left-radius': 'borderBottomLeftRadius',
    'border-bottom-right-radius': 'borderBottomRightRadius',
    'border-top-left-radius': 'borderTopLeftRadius',
    'border-top-right-radius': 'borderTopRightRadius',

    'border-bottom-width': 'borderBottomWidth',
    'border-right-width': 'borderRightWidth',
    'border-left-width': 'borderLeftWidth',
    'border-top-width': 'borderTopWidth',

    'padding-top': 'paddingTop',
    'padding-bottom': 'paddingBottom',
    'padding-right': 'paddingRight',
    'padding-left': 'paddingLeft',
    'font-size': 'fontSize',
}

const borderWidthKeys = [
    'borderBottomWidth',
    'borderRightWidth',
    'borderLeftWidth',
    'borderTopWidth',
]
const borderColorKeys = [
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor'
]

const paddingKeys = [
    'paddingTop',
    'paddingBottom',
    'paddingRight',
    'paddingLeft'
]

const stringStyles = {
    'border-top-style': 'borderTopStyle',
    'border-bottom-style': 'borderBottomStyle',
    'border-right-style': 'borderRightStyle',
    'border-left-style': 'borderLeftStyle',

    'border-top-color': 'borderTopColor',
    'border-right-color': 'borderRightColor',
    'border-bottom-color': 'borderBottomColor',
    'border-left-color': 'borderLeftColor',

    'letter-spacing': 'letterSpacing',
	'line-height': 'lineHeight',

    'text-align': 'textAlign',
    'font-weight': 'fontWeight',
    'text-decoration': 'textDecoration',

    'opacity': 'opacity'
}

const colorStyles = {
    'color': 'color',
    'background-color': 'background' // attention
}

const shadowStyles = {
    'text-shadow': 'textShadow',
    'box-shadow': 'boxShadow',
}



export default class HTML2QUX {

    constructor (domNode, lastUUID = 10000) {
        this.lastUUID = lastUUID
        this.isRemoveScreenOffset = false
        this.isRemoveContainers = false
        this.isUseImages = false
        this.defaultStyle = false
        this.isParseTable = true
        this.grid = false
        this.isFlattenLabels = true
        this.z = 1
        this.domNode = domNode
    }

    getUUID (){
		const uuid = this.lastUUID++ + "_" + Math.round(Math.random() * 100000);
		return uuid
	}

    run(html, width, height, options = {}) {
        this.isFixOverflow = true
        this.isRemoveNonLeafs = options.isRemoveNonLeafs
        this.isRemoveContainers = options.isRemoveContainers
        this.isRemoveHiddenElements = true
        this.isUseImages = options.isUseImages
        this.defaultStyle = options.defaultStyle
        this.customStyle = options.customStyle
        this.screenSize = {
            w: width,
            h: height
        }
        this.grid = options.grid
        this.z = 1

        Logger.log(-1, 'HTML2QUX.run() > enter', this.isRemoveNonLeafs, this.isRemoveContainers)

        this.domNode.innerText = ''
        const iframe = document.createElement('iframe')
        iframe.style.width = width + 'px'
        iframe.style.height = height + 'px'
        const promise = new Promise(resolve => {
            iframe.onload = () => {
                const root = iframe.contentWindow.document.getElementsByTagName('body')[0]
                if (root.scrollWidth > width) {
                    Logger.error('HTML2QUX.run() > too wide', root.scrollWidth)
                    // root.style.maxWidth = "none"
                    // console.debug(root)
                    // iframe.style.width = root.scrollWidth + 'px'
                    // console.debug('forced, render', iframe.style.width, root.scrollWidth)
                }
                const result = this.parseIFrame(root, width, height, options)
                console.timeEnd('HTML2QUX.run')
                resolve(result)
            }
        })
        iframe.srcdoc = addBorderBoxSizing(html)
        this.domNode.appendChild(iframe)
        return promise  
    }

    renderIframe() {

    }

    parseIFrame(body, width, height, options) {
        //console.debug('HTML2QUX.parseIFrame() > scrollWidth', body.scrollWidth, 'width', width)

        const tree = this.createWidget(body)
        tree._isRoot = true
        this.parseNode(body, tree)
        this.propagateCSS(tree)
        this.cleanTree(tree, true)
        //this.printTree(tree)
        const app = this.flattenTree(tree, width, height, options)
      
        this.cleanUpModel(app)
        const scalledApp = this.scalledApp(app)
        const layedOutApp = this.layoutApp(scalledApp)
        
        return layedOutApp
    }

    cleanTree(node) {
        if (node.children.length === 1) {
            const child = node.children[0]
            const isQualSize = child.w === node.w && 
                               child.h == node.h
                               child.x === 0 &&
                               child.y === 0

            //console.debug(child.w === node.w, child.h == node.h, child.x, child.y)
            if (isQualSize) {
           
                Logger.log(-1,'HTMLImporter.cleanTree() > Remove Single root child', child._tag);
                
                // node.children = child.children
                // node.style = child.style
               
            }
        }
        node.children.forEach(child => {
            if (child.style.opacity === 0) {
                Logger.log(1, 'HTMLImporter.cleanTree() > Opacity' , child)
                child.children = []
            }
            this.cleanTree(child)
        })
    }


    cleanUpModel (app) {

        Object.values(app.screens).forEach(s => {
            this.cleanUpScreen(s, app)
        })

        Object.values(app.widgets).forEach(w => {
            this.cleanUpWidget(w)
        })

        // filter wrong group relations
        Object.values(app.groups).filter(g => {
            if (g.groups) {
                g.groups = g.groups.filter(subId => {
                    if (!app.groups[subId]) {
                        return false
                    }
                    return true
                })
            }
            if (g.children) {
                g.children = g.children.filter(wId => {
                    if (!app.widgets[wId]) {
                        return false
                    }
                    return true
                })
            }
        })


        // check for one root group
        const allCount = Object.values(app.widgets).length
        const deleteGroups = []
        Object.values(app.groups).filter(g => {
            const gCount = ModelUtil.getAllGroupChildren(g, app).length
            if (gCount >= allCount) {
                return deleteGroups.push(g.id)
            }
        })

        deleteGroups.forEach(id => {
            Logger.log(-1, 'HTML2QUX.cleanUpModel() > remove super group', id)
            delete app.groups[id]
        })

        return app
    }

    cleanUpScreen(s, app) {
        this.removeHiddenElements(s, app)
        s.h = getScreenHeight(s, app)
        s.w = app.screenSize.w
        s.x = 0
        s.y = 0
        delete s._type
        delete s._isRoot
        if (this.defaultStyle) {
            s.style = {
                background: this.defaultStyle['Screen'].background
            }
        } else {
            s.style = {
                background: s.style.background
            }
        }
        
    }

    cleanUpWidget (w) {

        for (let key in w.style) {
            if (!nullableStyles.has(key)){
                const value = w.style[key]
                if (value === null) {
                    delete w.style[key]
                }
            }         
        }

        if (!this.isParseTable) {
            //we could add here some table groups
            // and remove all the TR, THEAD and TBODY
        }

        if (w.type === 'Label') {
            // w.w += 8
        }
      
        delete w._isRoot
        delete w._parentID 
        delete w._parent
        delete w.children
        delete w._tag
        delete w._type
        delete w._className
        delete w._flexDirection
    }


    layoutApp (app) {
        Logger.log(1, 'HTMLImporter.layoutApp() > grid ', this.grid)
        // if (this.grid && this.defaultStyle) {
        //     app = Layouter.gridify(app, this.grid.w, this.grid.h)
        // }
        // app = Layouter.layout(app)
        return app
    }

    scalledApp (app) {
        const width = app.screenSize.w

        Object.values(app.screens).forEach(s => {
            const scrnWidth = getScreenWidth(s, app)
            // this should not happen
            if (scrnWidth > width) {
                Logger.warn('HTML2QUX.scalledApp() ', scrnWidth + ' > ' + width)

                /**
                 * A naive per-widget scale factor breaks nested containers, since
                 * children need to be resized/repositioned coherently with their
                 * parent. ResponsiveLayout already does this (it derives the
                 * parent/child tree from the bounding boxes and resizes it as
                 * a whole), so we reuse it here the same way Screen.modelScreenSize() does.
                 */
               
                const layouter = new ResponsiveLayout(1)
                layouter.initApp(structuredClone(app))
                const responsivePositions = layouter.resize(width, -1)

                s.children.forEach(id => {
                    const widget = app.widgets[id]
                    const newPos = responsivePositions.widgets[id]
                    if (widget && newPos) {
                    
                        // check here is some bug if the stupid
                        // LLM produces code that is too wide
                        if (!(widget.w === width && widget.x === s.x)) {
                            widget.w = newPos.w
                        }
                     
                        widget.x = newPos.x
                        widget.y = newPos.y
                        widget.h = newPos.h
                    }
                })
            }
        })


        return app
    }

    propagateCSS (parent, keys = ['color', 'fontSize']) {
        parent.children.forEach(child => {
            for (let key of keys) {
                if (!child.style[key] && parent.style[key]) {
                    child.style[key] = parent.style[key]
                }
            }
            this.propagateCSS(child)
        })
    }

    flattenTree(tree,width, height) {
        const app = {
            screenSize: {
                w: width,
                h: height
            },
            screens: {},
            widgets: {},
            lines: {},
            groups: {}
        }

        const scrn = {
            name: 'Screen',
            id: 's' + this.getUUID(),
            min : {
                w : width,
                h : height
            },
            x: tree.x,
            y: tree.y,
            w: tree.w,
            h: tree.h,
            props: tree.props,
            has:tree.has,
            style: tree.style,
            children: []
        }
        scrn.props.start = true

        app.screens[scrn.id] = scrn

        this.flattenNode(scrn, app, tree, null)
    
        return app
    }

    flattenNode (scrn, app, node, parentGroup, prefx = '' ) {
        //Logger.log(-1, prefx + ' ' + node.id, node)
        let currentGroup = null;
        if (node.children.length > 1) {
            currentGroup = {
                "id" : node.id,
                "children" : [node.id],
                "groups" : [],
                "name" : node.name
            }
            node.name += " Background"
            app.groups[currentGroup.id] = currentGroup
           
        }
        node.children.forEach(child => {

            if (this.isRemoveScreenOffset) {
                child.x -= scrn.x
                child.y -= scrn.y
            }
            child._parentID = node.id
            app.widgets[child.id] = child
            scrn.children.push(child.id)
            if (currentGroup) {
                if (child.children <= 1) {
                    //console.debug(prefx, 'add leaf', currentGroup.name)
                    currentGroup.children.push(child.id)
                } else {
                    //console.debug(prefx, 'add sub', currentGroup.name)
                    currentGroup.groups.push(child.id)
                }
            }
            if (child.children.length === 1 && child.children[0]?.props.label && this.isFlattenLabels) {
                this.flattenLabelIntoParent(child)
            } else {
                this.flattenNode(scrn, app, child , currentGroup, prefx + "   ")
            }
        })
    }

    flattenLabelIntoParent (child, errorMargin = 4) {
        const labelNode = child.children[0];
        Logger.log(-4, 'HTMLImporter.flattenNode()' , labelNode.props.label)
        child.props.label = labelNode.props.label

        child.style.paddingLeft = Math.max(0, (labelNode.x - child.x) - errorMargin)
        child.style.paddingTop = Math.max(0, (labelNode.y - child.y) - errorMargin)
        child.style.paddingRight = Math.max(0, ((child.x + child.w) - (labelNode.x + labelNode.w)) - errorMargin)
        child.style.paddingBottom = Math.max(0, ((child.y + child.h) - (labelNode.y + labelNode.h)) - errorMargin)

        child.children = []
    }



 

    getStyleOverWrites (w, defaultStyle) {
        const type = w.type
        if (type === "Button") {
            if (w.children.length > 0) {
                return defaultStyle['Container']
            }
            return defaultStyle['Button']
        }
        if (type === "Label") {
            return defaultStyle['Label']
        }
        if (type === "TextBox") {
            return defaultStyle['TextBox']
        }
        if (type === "Table") {
            return defaultStyle['Table']
        }
        if (type === "RadioBox2") {
            return defaultStyle['RadioBox']
        }
        if (type === "CheckBox") {
            return defaultStyle['CheckBox']
        }
        if (type === "DropDown") {
            return defaultStyle['DropDown']
        }
        if (type === "Image") {
            return defaultStyle['Image']
        }
        return defaultStyle['Default']
        
    }

    removeHiddenElements (scrn, app) {
        const newChildren = []
        scrn.children.forEach(id => {
            const widget = app.widgets[id]
            if (this.isHiddenElement(widget, scrn) && this.isRemoveHiddenElements) {
                Logger.log(1, "removeHiddenElements() ", widget)
                delete app.widgets[id]
            } else {
                newChildren.push(id)
            }
        })
        scrn.children = newChildren
    }

    isHiddenElement(widget, scrn) {

        // we could somehow try to find a way to clip this better
        if (widget.y < 0 || widget.x < 0) {
            Logger.log(1, 'HTMLImporter.removeHiddenElements() > Overflow' , widget)
            return true
        }

        if (widget.x + widget.w > scrn.w) {
            Logger.log(1, 'HTMLImporter.removeHiddenElements()  > Overflow 2' , widget)
            return true
        }

        // if (isInvisibleButton(widget)) {
        //     Logger.log(1, 'HTMLImporter.removeHiddenElements() > Invisble' , widget)
        //     return true
        // }
        if (widget.style.opacity === 0) {
            Logger.log(1, 'HTMLImporter.removeHiddenElements() > Opacity' , widget)
            /** 
             * We should also remove all the children.
             */
            return true
        }
        if (widget.type === 'Label' && !widget.props.label) {
            Logger.log(1, 'HTMLImporter.removeHiddenElements() > Empty Label' , widget)
            return true
        }
        if (this.isRemoveContainers && widget.children.length > 0) {
            Logger.log(1, 'HTMLImporter.removeHiddenElements() > Container' , widget)
            return true
        }
        return false
    }
  
    parseNode (node, parent, prefx='BODY.', logLevel = 1) {
       
        const children = node.childNodes;

        const addChild = (child) => {
            parent.children.push(child)
            child._parent = parent
        }

        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            const isLeaf = isLeafNode(child)
            if (child.nodeType === ELEMENT_NODE) {
                if (isDropDown(child)) {
                    const table = this.createDropDownWidget(child)
                    Logger.log(logLevel, 'HTMLImpoter.createWidget() > DropDown', `${prefx}${child.tagName}}`)
                    addChild(table)
                } else if (isTable(child) && this.isParseTable) {
                    const table = this.createTableWidget(child)
                    Logger.log(logLevel, 'HTMLImpoter.createWidget() > TABLE', `${prefx}${child.tagName}}`)
                    addChild(table)
                } else if (!isLeaf) {
                    const widget = this.createWidget(child, prefx)
                    Logger.log(logLevel, 'HTMLImpoter.createWidget() > CNTR', `${prefx}${child.tagName} > ${widget.type}`)
                    addChild(widget)
                    this.parseNode(child, widget, prefx + child.tagName + '.' )
                } else {
                    const label = getLeafNodeLabel(child)
                    const widget = this.createWidget(child, prefx)
                    Logger.log(logLevel, 'HTMLImpoter.createWidget() > Leave', `${prefx}${child.tagName} > ${widget.type} : ${label}`)
                    addChild(widget)
                    if (label && label.trim()) {
                        widget.props.label = label.trim()
                    }
                }
           } 
           
           if (child.nodeType === TEXT_NODE) {
                const label = getLeafNodeLabel(child)
                if (label && label.trim()) {
                    const widget = this.createWidget(child, prefx)
                    widget.props.label = label.trim()
                    Logger.log(logLevel, 'HTMLImpoter.createWidget() > Text Leave', `${prefx}${child.tagName} > ${widget.type} : ${label}`)
                    addChild(widget)
                }
           }
        }
    }

    createDropDownWidget (node) {

        Logger.log(1, 'HTMLImpoter.createDropDownWidget() > ')

        const widget = this.createWidget(node)
        widget.type = 'DropDown'
        widget.children = []
        widget.has = {
            "onclick" : true,
            "border" : true,
            "backgroundColor" : true,
            "data" : true,
            "padding":true,
            "label":true
        }
        widget.style.paddingTop = 1
		widget.style.paddingBottom = 1
        widget.style.paddingLeft = 1
		widget.style.paddingRight = 1
        widget.style.popupBackground = "#ffffff"
        widget.style.popupColor = "#333333"
        widget.style.selectedOptionColor= "#333333"
        widget.style.selectedOptionBackground = "#f2f2f2"		

        const options = []
        const children = node.getElementsByTagName('option');
        for (let c= 0; c < children.length; c++) {
            const opt = children[c]
            options.push(opt.innerText)
        }


        widget.props.options = options
        return widget
    }

    createTableWidget (node, importPadding=true) {
        Logger.log(1, 'HTMLImpoter.createTableWidget() > ')

        const data = this.getTableData(node)
       
        const widget = this.createWidget(node)
        widget.type = 'Table'
        widget.props.data = data
        widget.children = []
        widget.style.paddingTop = 1
		widget.style.paddingBottom = 1
        widget.style.paddingLeft = 1
		widget.style.paddingRight = 1
		widget.style.headerSticky = true
	    widget.style.headerColor = "#fff"
        widget.style.headerFontWeight = "800"
		widget.style.headerBackground = "#333333"
		widget.style.headerSticky = true
	    widget.style.headerColor = "#fff"
		widget.style.checkBox = false
		widget.style.checkBoxHookColor = "#333333"
		widget.style.checkBoxBackground = "#ffffff"
		widget.style.checkBoxBorderColor = "#333333"
		widget.style.checkBoxBorderRadius = 2
		widget.style.checkBoxBorderWidth = 1

        // guess border && padding
        const td = node.getElementsByTagName('td')[0]
        if (td) {
            const compStyle = getComputedStyle(td)
            const w = parsePixel(compStyle.borderTopWidth)
            borderWidthKeys.forEach(key => {
                widget.style[key] = w
            })
            const c = compStyle.borderTopColor
            borderColorKeys.forEach(key => {
                widget.style[key] = c
            })

            if (importPadding) {
                paddingKeys.forEach(key => {
                    const padding = parsePixel(compStyle[key])
                    widget.style[key] = padding
                })
            }  
        }
        
        // guess header
        const th = node.getElementsByTagName('th')[0]
        widget.style.headerBackground = 
            this.getTableHeaderStyle(th, 'backgroundColor', '#333333')
        widget.style.headerColor = 
            this.getTableHeaderStyle(th, 'color', '#333333')
      


        return widget
    }

    getTableHeaderStyle(node, style, defaultValue) {
        const compStyle = getComputedStyle(node)
        const value = compStyle[style]
        if (isTranparent(value)) {
            const parent = node.parentNode
            if (parent && !isTable(parent)) {
                return this.getTableHeaderStyle(parent, style, defaultValue)
            }
            return defaultValue
        }
        return value
    }

    getTableData (table, data = []) {

        const addRow = () => {
            const newRow = []
            data.push(newRow)
            return newRow
        }

        const header = table.getElementsByTagName('th');
        if (header.length) {
            const dataRow = addRow()
            for (let c= 0; c < header.length; c++) {
                const cell = header[c]
                dataRow[c] = cell.innerText
            }
        }
      
        const trs = table.getElementsByTagName('tr');
        for (let r= 0; r < trs.length; r++) {
            const tr = trs[r]
            const tds = tr.getElementsByTagName('td');
            if (tds.length > 0) {
                const dataRow = addRow()
                for (let c = 0; c < tds.length; c++) {
                    const td = tds[c]
                    dataRow[c] = td.innerText
                }
            }
            
        }
        return data
    }

    createWidget(node) {
        /**
         * map here
         * 
         * check input
         * 
         * get positon
         * 
         * get style
         * 
         * from placeholder
         * 
         * labeled checkbox?
         */
        const pos = this.getPosition(node)
        const style = this.getStyle(node, pos)
        const widgetType = this.getWidgetType(node, style)
        const has = this.getHas(widgetType)
        const props = this.getProps(node)
        // TODO: maybe
        //const isFixedHorizontal = pos.w === pos.h
   
        const widget = {
            id: 'w' + this.getUUID(),
            name: this.getWidgetName(widgetType, node.className),
            _className: node.className,
            _tag: node.tagName,
            type: widgetType,
            x: pos.x,
            y: pos.y,
            w: pos.w,
            h: pos.h,
            z: this.z,
            props: props,
            has:has,
            style: style,
            children: []
        }

        this.z++

        widget.active = {} // this.getDifStyle(style, this.getStyle(node, null, getActivePseudo(node)))
        widget.hover = {} //this.getDifStyle(style, this.getStyle(node, null, '::hover'))
        widget.error = {}

        return widget
    }

    getWidgetName (type, className) {
        if (className && className.split) {
            return className
                .split(/[-_]/)
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' ')
        }
        return type
    }

    getDifStyle(style, otherStyle)  {
        for (let key in style) {
            if (style[key] === otherStyle[key]){
                delete otherStyle[key]
            }
        }
        return otherStyle
    }

    getProps (node) {
        const result = {}
        if (node.tagName === 'INPUT') {
            result.placeholder = true
            if (node.placeholder) {
                result.label = node.placeholder
            }
            if (node.name) {
                result.databinding = {
                    default : node.name
                }
            }

            if (isSubmit(node) || isReset(node)) {
                result.label = node.value
            }
          
            if (isCheckBox(node)) {
                result.checked = node.checked 
            }  
            
            if (isRadio(node)) {
                result.formGroup = node.name
                result.checked = node.checked
            }
        }      
        return result
    }

    getHas(type) {
        if (type === 'Label') {
            return {
                "label": true,
                "padding": true,
                "advancedText": true
            }
        }

        if (type === 'Image') {
            return {
                "onclick" : true,
                "backgroundImage" : true,
                "borderRadius" : true,
                "iconPlaceholder" : true
            }
        }
        
        return {
            "label" : true,
            "backgroundColor" : true,
            "border" : true,
            "editable" : true,
            "onclick" : true,
            "padding" : true
        }
    }

    getStyle(node, pos, pseudoElt = '') {
        if (node.nodeType != 1) {
            return {}
        }
        return this.getCurrentStyle(node, pos, pseudoElt)
    }

    getCurrentStyle(node, pos, pseudoElt) {
        const result = {
            fontFamily: 'Helvetica Neue,Helvetica,Arial,sans-serif'
        }
        try {

            const compStyle = pseudoElt ? getComputedStyle(node, pseudoElt) : getComputedStyle(node)
          
            if (compStyle.fontFamily) {
                result.fontFamily = compStyle.fontFamily
            }
            for (let key in pixelStyles) {
                let value = compStyle[key]
                if (value && value != 'none') {
                    result[pixelStyles[key]] = parsePixel(value, key, node)
                }
            
            }
            for (let key in stringStyles) {
                const value = compStyle[key]
                if (value && value != 'none') {
                    //console.debug(node.tagName, key, value)
                    result[stringStyles[key]] = value
                }
            }
            for (let key in colorStyles) {
                const value = compStyle[key]
                if (value && value != 'none') {
                    result[colorStyles[key]] = value
                }
            }

            const backgroundImage = compStyle.backgroundImage
            if (backgroundImage && backgroundImage !== 'none') {
                const gradient = parseGradient(backgroundImage)
                if (gradient) {
                    result.background = gradient
                }
            }

            for (let key in shadowStyles) {
                const value = compStyle[key]
                if (value && value != 'none') {
                    const shadow = parseShadow(value)
                    if (shadow) {
                        result[shadowStyles[key]] = shadow
                    }
                }
            }

            result.opacity = compStyle.opacity * 1

            // some fixes
            this.fixStyles(pos, result, node, compStyle);

        
        } catch(err) {
            Logger.error('HTMLImporter.getStyle()', err)
        }

        if (node.tagName === 'BUTTON') {
            paddingKeys.forEach(p => {
                if (result[p]) {
                    result[p] = 0// result[p] - 2 // substract because some times due to font
                }
            })
            result.verticalAlign = "middle"
            result.textAlign = "center"
        }

        if (node.tagName === 'INPUT') {
            if (isCheckBox(node)) {
               
                result.borderTopWidth = 1
                result.borderBottomWidth = 1
                result.borderLeftWidth = 1
                result.borderRightWidth = 1
                result.colorButton = result.borderTopColor
            }
            if (isRadio(node)) {
                result.borderBottomLeftRadius = 50
                result.borderBottomRightRadius = 50
                result.borderTopLeftRadius = 50
                result.borderTopRightRadius = 50
                result.borderTopWidth = 1
                result.borderBottomWidth = 1
                result.borderLeftWidth = 1
                result.borderRightWidth = 1
                result.colorButton = result.borderTopColor
            }

        }

        if (isImg(node)) {
            return {
                "borderTopRightRadius" : result.borderTopRightRadius,
                "borderTopLeftRadius" : result.borderTopLeftRadius,
                "borderBottomRightRadius" : result.borderBottomRightRadius,
                "borderBottomLeftRadius" : result.borderBottomLeftRadius,
                "borderTopWidth" : result.borderTopWidth,
                "borderBottomWidth" : result.borderBottomWidth,
                "borderRightWidth" : result.borderRightWidth,
                "borderLeftWidth" : result.borderLeftWidth,
                "borderTopColor" : result.borderTopColor,
                "borderBottomColor" : result.borderBottomColor,
                "borderRightColor" : result.borderRightColor,
                "borderLeftColor" : result.borderLeftColor,
                "backgroundImage" : null
                // we could trye to tune the image
                //"iconPlaceholderBackground": 'red',
            }
        }

        return result
    }

    fixStyles(pos, result, node, compStyle) {
        if (pos.overflow) {
            if (pos.overflow === 'right') {
                result.borderBottomRightRadius = 0;
                result.borderTopRightRadius = 0;
            }
            if (pos.overflow === 'left') {
                result.borderBottomLeftRadius = 0;
                result.borderTopLeftRadius = 0;
            }
        }

        // Make horizontal padding a little smaller if the node has just one 
        // text node and center stuff if needed
        if (hasSingleTextChild(node)) {
            if (result.paddingLeft) {
                result.paddingLeft -= 1;
            }
            if (result.paddingRight) {
                result.paddingRight -= 1;
            }

            if (compStyle.display === 'grid') {
                if (compStyle.placeItems === 'center') {
                    result.textAlign = 'center';
                    result.verticalAlign = 'middle';
                }
            }

            if (compStyle.display === 'flex') {
                if (compStyle.justifyContent === 'center') {
                    result.textAlign = 'center';
                    result.verticalAlign = 'middle';
                }
            }
        }

        if (result.letterSpacing && result.letterSpacing.indexOf) {
            //console.debug(result.letterSpacing, typeof result.letterSpacing)
            // if (result.letterSpacing === 'normal') {
            //     result.letterSpacing = 1.2
            // }
            if (result.letterSpacing.indexOf('px') > 0) {
                const p = result.letterSpacing.slice(0, -2) * 1;
                if (result.fontSize) {
                    result.letterSpacing = Math.round((p / result.fontSize) * 100) / 100
                }
            }
        }

        if (result.lineHeight && result.lineHeight.indexOf) {
            if (result.lineHeight.indexOf('px') > 0) {
                const p = result.lineHeight.slice(0, -2) * 1;
                if (result.fontSize) {
                    result.lineHeight = Math.round((p / result.fontSize) * 100) / 100
                }
            }
        }
    }

    isSupportedNode(node) {
        if (node.nodeType === 1) {
            const ret = node.getBoundingClientRect();
            if (ret.x < 0 || ret.y < 0) {
                Logger.warn('HTML2QUX.isSupportedNode() > ', node)
                return false
            }
        }

        return true
    }


    getPosition(node) {
        if (node.nodeType === 1) {
            const ret = node.getBoundingClientRect();
            const pos = {
                x: Math.round(ret.left), 
                y: Math.round(ret.top), 
                w: Math.round(ret.right - ret.left), 
                h: Math.round(ret.bottom - ret.top)
            };


            if (this.isFixOverflow){
                if (pos.y < 0) {
                    //const o = pos.y
                    pos.y = 0
                    pos.h += pos.y
                    pos.overflow = "top"
                }

                if (pos.x < 0) {
                    pos.w += pos.x
                    pos.x = 0
                    pos.overflow = "left"
                }

                if (pos.x + pos.w > this.screenSize.w) {
                    const o = (pos.x + pos.w)  - this.screenSize.w
                    pos.w -= o
                    pos.overflow = "right"
                }
        
            }

            // TODO: Here we have some issue of one if the elements is 
            // placed outside. We should clip this somehow...
            //console.debug(node, pos)
            return pos
        }

        if (node.nodeType === 3) {
            const range = document.createRange();
            range.selectNodeContents(node);
            const rects = range.getClientRects();
            if (rects[0]) {
                const ret = rects[0]
                return {
                    x: Math.round(ret.left), 
                    y: Math.round(ret.top), 
                    w: Math.round(ret.right - ret.left), 
                    h: Math.round(ret.bottom - ret.top)
                };
            }
        }
        return {
            x:-1, y:-1, w: -1, h:-1
        }
    }

    // eslint-disable-next-line no-unused-vars
    getWidgetType (node, style) {
        //console.debug('getWidgetType >> ', node.nodeType, node.tagName, labelTypes.has(node.tagName), node)
        if (node.nodeType === TEXT_NODE) {
            return 'Label'
        }
        if (labelTypes.has(node.tagName)) {
            if (hasVisibleBorder(style)) {
                Logger.log(3, 'HTML2QUX.getWidgetType() > bordered label', node)
                return 'Button'
            }
            return 'Label'
        }

        if (node.tagName === 'DIV' && !hasVisibleBorder(style) && isTranparent(style?.background)) {
            return 'Label'
        }

        if (node.tagName === 'BUTTON') {
            return 'Button'
        }
        if (node.tagName === 'TEXTAREA') {
            return 'TextArea'
        }
        if (isImg(node)) {
            return 'Image'
        }
        if (node.tagName === 'INPUT') {
            if (isCheckBox(node)) {
                return 'CheckBox'
            }
            if (isRadio(node)) {
                return 'RadioBox2'
            }
            if (isSubmit(node)) {
                return 'Button'
            }
            if (isReset(node)) {
                return 'Button'
            }
            if (isPassword(node)) {
                return 'Password'
            }           
            return 'TextBox'
        }
        return 'Button'

    }

    
    printTree(node, prefix=''){
        if (node.children.length > 0) {
            console.debug(prefix, '+', '<' + node._tag + '>', node.type, ' >> '+ node.props.label)
            node.children.forEach(child => {
                this.printTree(child, prefix + '   ')
            })
        } else {
            console.debug(prefix, '-', '<' + node._tag + '>', node.type, ' >> '+ node.props.label)
        }
    }
    
}


function addBorderBoxSizing(html) {
    const styleTag = '<style>*{box-sizing:border-box;}</style>'
    if (/<head[^>]*>/i.test(html)) {
        return html.replace(/<head[^>]*>/i, match => match + styleTag)
    }
    if (/<html[^>]*>/i.test(html)) {
        return html.replace(/<html[^>]*>/i, match => match + styleTag)
    }
    return styleTag + html
}

function parseShadow(value) {
    const pos = value.indexOf(')') + 1
    if (pos > 0) {
        const color = value.substring(0, pos)
        const parts = value.substring(pos+1).split(' ')
        if (parts.length >=3 ){
            const pixel = parts.map(s => parsePixel(s))
            const shadow =  {
                "v" : pixel[1],
                "h" : pixel[0],
                "b" : pixel[2],
                "s" : pixel[3] ? pixel[3] : 0, // in textShadow not there
                "c" : color
            }
            return shadow
        }
    }
}


const gradientKeywordDirections = {
    'to top': 0,
    'to right': 90,
    'to bottom': 180,
    'to left': 270,
    'to top right': 45,
    'to right top': 45,
    'to bottom right': 135,
    'to right bottom': 135,
    'to bottom left': 225,
    'to left bottom': 225,
    'to top left': 315,
    'to left top': 315
}

function splitTopLevel(value) {
    const parts = []
    let depth = 0
    let current = ''
    for (let i = 0; i < value.length; i++) {
        const ch = value[i]
        if (ch === '(') {
            depth++
        } else if (ch === ')') {
            depth--
        }
        if (ch === ',' && depth === 0) {
            parts.push(current)
            current = ''
        } else {
            current += ch
        }
    }
    if (current.trim()) {
        parts.push(current)
    }
    return parts
}

function parseGradient(value) {
    const trimmed = value.trim()
    const isRadial = trimmed.startsWith('radial-gradient')
    if (!isRadial && !trimmed.startsWith('linear-gradient')) {
        return null
    }

    const inner = trimmed.substring(trimmed.indexOf('(') + 1, trimmed.lastIndexOf(')'))
    const parts = splitTopLevel(inner).map(p => p.trim())

    let direction = 180
    let colorParts = parts

    if (isRadial) {
        colorParts = parts.filter(p => !/^(circle|ellipse|at\s|closest-|farthest-)/.test(p))
    } else {
        const first = parts[0] || ''
        const degMatch = first.match(/^(-?\d+(?:\.\d+)?)deg$/)
        if (degMatch) {
            direction = Math.round(parseFloat(degMatch[1])) + 270
            colorParts = parts.slice(1)
        } else if (/^to\s/.test(first)) {
            if (gradientKeywordDirections[first] !== undefined) {
                direction = gradientKeywordDirections[first]
            }
            colorParts = parts.slice(1)
        }
    }

    const stops = colorParts.map(part => {
        const match = part.match(/^(.*?)\s+(-?\d+(?:\.\d+)?)%$/)
        if (match) {
            return { c: match[1].trim(), p: Math.round(parseFloat(match[2])) }
        }
        return { c: part.trim(), p: null }
    }).filter(stop => stop.c)

    if (stops.length < 2) {
        return null
    }

    stops.forEach((stop, i) => {
        if (stop.p === null) {
            stop.p = Math.round((i / (stops.length - 1)) * 100)
        }
    })

    const background = {
        colors: stops,
        gradientHeight: 300,
        gradientWidth: 30,
        selectedHandle: 0
    }

    if (isRadial) {
        background.radial = true
    } else {
        background.gradient = true
        background.direction = String(direction)
    }

    return background
}

function hasSingleTextChild(node) {
    return node.childNodes.length === 1 && node.childNodes[0].nodeType === TEXT_NODE
}

function parsePixel(value, /* key, node */) {
    if (!value) {
        return 0
    }
    if (value.indexOf('px') !== -1) {
        value = value.slice(0, -2);
    }
    if (value.indexOf('%') !== -1) {
        // use    const pos = this.getPosition(node) and get the right 
        value = value.slice(0, -1);
    }
    return Math.round(value * 1)
}

// eslint-disable-next-line no-unused-vars
function isInvisibleButton(widget) {
    if (widget.type !== "Button") {
       return false
    }
    if (isTranparent(widget.style.background) && isNoBorder(widget)) {
        return true
    }
    // TODO Check for inner TXT??
    return false
}

function isNoBorder(widget) {
    const style = widget.style
    let sum = 0
    borderWidthKeys.forEach(key => {
        sum += style[key]
    })
    return sum === 0
}

// eslint-disable-next-line no-unused-vars
function hasVisibleBorder(style) {
    if (!style) {
        return false
    }
    const hasWidth = borderWidthKeys.some(key => style[key] > 0)
    if (!hasWidth) {
        return false
    }
    return borderColorKeys.some(key => style[key] && !isTranparent(style[key]))
}



function isTranparent(color) {
    return !color || color === 'rgba(0, 0, 0, 0)' || color === 'transparent'
}

function isSubmit(node) {
    return node.type && node.type.toLowerCase() === 'submit'
}

function isImg(node) {
    if (node.tagName === 'IMG') {
        return true
    }
    const compStyle = getComputedStyle(node)
    if (compStyle.background?.indexOf('url(') > 0) {
        return true
    }
    return false
}

function isTable(node) {
    return node.tagName === 'TABLE'
}

function isReset(node) {
    return node.type && node.type.toLowerCase() === 'reset'
}

function isPassword(node) {
    node.type && node.type.toLowerCase() === 'password'
}

function isCheckBox (node) {
    return node.type && node.type.toLowerCase() === 'checkbox'
}

function isDropDown(node) {
    return node.tagName === 'SELECT'
}

function isRadio (node) {
    return node.type && node.type.toLowerCase() === 'radio'
}

function isLeafNode(node, debug=false) {
    if (node.nodeType === TEXT_NODE) {
        return true
    }
    const children = node.childNodes;

    let counts = 0
    let inlineElementCount = 0
    let significantTextCount = 0
    // we do not want some underlines, but if some of
    // the blogs are bold or so use them.
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const type = child.nodeType
        const tagName = child.tagName
        if (type === ELEMENT_NODE && inlineTextTags.has(tagName)) {
            counts++
            inlineElementCount++
        }
        if (type === TEXT_NODE) { // TEXT_NODE
            counts++
            if (child.nodeValue && child.nodeValue.trim()) {
                significantTextCount++
            }
        }
    }
    if (debug)
        console.debug(node.tagName, counts, children.length)

    if (children.length !== counts) {
        return false
    }

    // Multiple inline elements with no connecting text (e.g. a <strong>
    // title and a <span> subtitle stacked in a div) are separate lines,
    // not a single run of prose, so keep them as separate widgets.
    if (inlineElementCount > 1 && significantTextCount === 0) {
        return false
    }

    return true
}

function getLeafNodeLabel (node) {

    if (node.nodeType === TEXT_NODE) {
     
        return node.nodeValue
    }
    return node.innerText
}
 
// function getActivePseudo(node) {
//     if (isCheckBox(node)) {
//         return ':checked'
//     }
//     return ''
// }

function getScreenHeight (scrn, app) {
    let maxY = 0
    scrn.children.forEach(id => {
        const widget = app.widgets[id]
        if (widget) {
            maxY = Math.max(maxY, widget.y + widget.h)
        }
    })
    return Math.max(app.screenSize.h,maxY)
}

function getScreenWidth(scrn, app) {
    let maxX = 0
    scrn.children.forEach(id => {
        const widget = app.widgets[id]
        if (widget) {
            maxX = Math.max(maxX, widget.x + widget.w)
        }
    })
    return maxX
}