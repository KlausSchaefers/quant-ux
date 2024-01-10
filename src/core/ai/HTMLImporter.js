import Logger from '../Logger'
import * as Layouter from './Layouter'

const TEXT_NODE = 3

const ELEMENT_NODE = 1

const labelTypes = new Set(['LABEL', 'H1', 'H2', 'H3', 'H4', 'P', 'A', 'CAPTION', 'LI'])

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



export default class HTMLImporter {

    constructor (lastUUID = 10000) {
        this.lastUUID = lastUUID
        this.isRemoveScreenOffset = false
        this.isRemoveContainers = false
        this.defaultStyle = false
        this.isParseTable = true
        this.grid = false
        this.isFlattenLabels = true
        this.z = 1
    }

    getUUID (){
		const uuid = this.lastUUID++ + "_" + Math.round(Math.random() * 100000);
		return uuid
	}

    html2QuantUX(html, node, width, height, options = {}) {
        Logger.log(-1, 'HTMLImporter.html2QuantUX() > enter')
        this.isRemoveNonLeafs = options.isRemoveNonLeafs
        this.isRemoveContainers = options.isRemoveContainers
        this.defaultStyle = options.defaultStyle
        this.customStyle = options.customStyle
        this.grid = options.grid
        this.z = 1


        node.innerText = ''
        const iframe = document.createElement('iframe')
        iframe.style.width = width + 'px'
        iframe.style.height = height + 'px'
        const promise = new Promise(resolve => {
            iframe.onload = () => {
                const root = iframe.contentWindow.document.getElementsByTagName('body')[0]
                const result = this.parseIFrame(root, width, height, options)
                resolve(result)
            }
        })
        iframe.srcdoc = html
        node.appendChild(iframe)
        return promise  
    }

    parseIFrame(body, width, height, options) {
        const tree = this.createWidget(body)
        this.parseNode(body, tree)
        this.propagateCSS(tree)
        this.cleanTree(tree)
        const app = this.flattenTree(tree, width, height, options)
     
        const scalledApp = this.scalledApp(app)
        const layedOutApp = this.layoutApp(scalledApp)
        this.cleanUpModel(layedOutApp)
        return layedOutApp
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

    layoutApp (app) {
        Logger.log(1, 'HTMLImporter.layoutApp() > grid ', this.grid)
        if (this.grid && this.defaultStyle) {
            app = Layouter.gridify(app, this.grid.w, this.grid.h)
        }
        app = Layouter.layout(app)
        return app
    }

    scalledApp (app) {
        const width = app.screenSize.w
       
        Object.values(app.screens).forEach(s => {
            const scrnWidth = getScreenWidth(s, app)
            // this should not happen
            if (scrnWidth > width) {
                const f = width / scrnWidth
                Logger.log(-1, 'HTMLImporter.scalledApp() ', scrnWidth + ' > ' + width, f)

                s.children.forEach(id => {
                    const widget = app.widgets[id]
                    widget.y = Math.floor(widget.y * f)
                    widget.w = Math.ceil(widget.w * f)
                    if (widget.style.fontSize) {
                        widget.style.fontSize = Math.floor(widget.style.fontSize  * f)
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

        this.flattenNode(scrn, app, tree)
    
        return app
    }

    cleanUpModel (app) {

        Object.values(app.screens).forEach(s => {
            this.cleanUpScreen(s, app)
        })

        Object.values(app.widgets).forEach(w => {
            this.setDefaultStyle(w)
            this.setCustomStyle(w)
            this.cleanUpWidget(w)
        })

        return app
    }

    setDefaultStyle (w) {
        if (this.defaultStyle) {
            const overwrites = this.getStyleOverWrites(w, this.defaultStyle)
            for (let key in overwrites) {
                w.style[key] = overwrites[key]
            }
        }
    }

    setCustomStyle (w) {
        if (this.customStyle) {
            const overwrites = this.getStyleOverWrites(w, this.customStyle)
            if (overwrites) {
                for (let key in overwrites) {
                    w.style[key] = overwrites[key]
                }
            }          
        }
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

    
    cleanUpScreen(s, app) {
        this.removeHiddenElements(s, app)
        s.h = getScreenHeight(s, app)
        s.w = app.screenSize.w
        s.x = 0
        s.y = 0
        delete s._type
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
      
        delete w._parent
        delete w.children
        delete w._tag
        delete w._type
        delete w._className
        delete w._flexDirection
    }


    removeHiddenElements (scrn, app) {
        const newChildren = []
        scrn.children.forEach(id => {
            const widget = app.widgets[id]
            if (this.isHiddenElement(widget)) {
                delete app.widgets[id]
            } else {
                newChildren.push(id)
            }
        })
        scrn.children = newChildren
    }

    isHiddenElement(widget) {
        
        if (isInvisibleButton(widget)) {
            Logger.log(1, 'HTMLImporter.removeHiddenElements() > Invisble' , widget)
            return true
        }
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
  

    
    flattenNode (scrn, app, node, prefx) {
        //Logger.log(-1, prefx + ' ' + node.id, node)
        node.children.forEach(child => {

            if (this.isRemoveScreenOffset) {
                child.x -= scrn.x
                child.y -= scrn.y
            }

            app.widgets[child.id] = child
            scrn.children.push(child.id)
       
            if (child.children.length === 1 && child.children[0].type === 'Label' && this.isFlattenLabels) {
                this.flattenLabelIntoParent(child)
            } else {
                this.flattenNode(scrn, app, child , prefx + "   ")
            }

        })
    }

    flattenLabelIntoParent (child) {
        Logger.log(1, 'HTMLImporter.flattenNode()' , child.children[0].props.label)
        child.props.label = child.children[0].props.label
        child.children = []
    }

    cleanTree(node) {
        node.children.forEach(child => {
            if (child.style.opacity === 0) {
                Logger.log(-1, 'HTMLImporter.cleanTree() > Opacity' , child)
                child.children = []
            }
            this.cleanTree(child)
        })
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
        const widgetType = this.getWidgetType(node)
        const pos = this.getPosition(node)
        const style = this.getStyle(node)
        const has = this.getHas(widgetType)
        const props = this.getProps(node)

        const widget = {
            id: 'w' + this.getUUID(),
            name: this.getWidgetName(widgetType),
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

        widget.active = {} // this.getDifStyle(style, this.getStyle(node, getActivePseudo(node)))
        widget.hover = {} //this.getDifStyle(style, this.getStyle(node, '::hover'))
        widget.error = {}

        return widget
    }

    getWidgetName (type) {
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
                "borderRadius" : true
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

    getStyle(node, pseudoElt = '') {
        if (node.nodeType != 1) {
            return {}
        }
        return this.getCurrentStyle(node, pseudoElt)
    }

    getCurrentStyle(node, pseudoElt) {
        const result = {
            fontFamily: 'Helvetica Neue,Helvetica,Arial,sans-serif'
        }
        try {

            const compStyle = pseudoElt ? getComputedStyle(node, pseudoElt) : getComputedStyle(node)
          
            for (let key in pixelStyles) {
                let value = compStyle[key]
                if (value && value != 'none') {
                    result[pixelStyles[key]] = parsePixel(value)
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

        
        } catch(err) {
            Logger.error('HTMLImporter.getStyle()', err)
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
                "borderTopRightRadius" : 0,
                "borderTopLeftRadius" : 0,
                "borderBottomRightRadius" : 0,
                "borderBottomLeftRadius" : 0,
                "borderTopWidth" : 0,
                "borderBottomWidth" : 0,
                "borderRightWidth" : 0,
                "borderLeftWidth" : 0,
                "borderTopColor" : "#333333",
                "borderBottomColor" : "#333333",
                "borderRightColor" : "#333333",
                "borderLeftColor" : "#333333",
                "backgroundImage" : null
            }
        }

        return result
    }

    getPosition(node) {
        if (node.nodeType === 1) {
            const ret = node.getBoundingClientRect();
            return {
                x: Math.round(ret.left), 
                y: Math.round(ret.top), 
                w: Math.round(ret.right - ret.left), 
                h: Math.round(ret.bottom - ret.top)
            };
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

    getWidgetType (node) {
        //console.debug('getWidgetType >> ', node.nodeType, node.tagName, labelTypes.has(node.tagName), node)
        if (node.nodeType === TEXT_NODE) {
            return 'Label'
        }
        if (labelTypes.has(node.tagName)) {
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


function parsePixel(value) {
    if (!value) {
        return 0
    }
    if (value.indexOf('px')) {
        value = value.slice(0, -2);
    }
    return Math.round(value * 1)
}

function isInvisibleButton(widget) {
    if (widget.type !== "Button") {
       return false
    }
    if (isTranparent(widget.style.background) && isNoBorder(widget)) {
        return true
    }
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



function isTranparent(color) {
    return !color || color === 'rgba(0, 0, 0, 0)' || color === 'transparent'
}

function isSubmit(node) {
    return node.type && node.type.toLowerCase() === 'submit'
}

function isImg(node) {
    return node.tagName === 'IMG'
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
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const type = child.nodeType
        const tagName = child.tagName
        if (type === ELEMENT_NODE && (tagName === 'B' || tagName === 'I')) {
            counts++
        }
        if (type === TEXT_NODE) { // TEXT_NODE
            counts++
        }
    }
    if (debug)
        console.debug(node.tagName, counts, children.length)
    return children.length === counts
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