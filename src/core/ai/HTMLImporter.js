import Logger from '../Logger'

const TEXT_NODE = 3

const ELEMENT_NODE = 1

const labelTypes = new Set(['LABEL', 'H1', 'H2', 'H3', 'H4', 'P', 'A'])

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
    //'font-family': 'fontFamily',
    'font-weight': 'fontWeight',
    'text-decoration': 'textDecoration'
}

const colorStyles = {
    'color': 'color',
    'background-color': 'background' // attention
}

const shadowStyles = {
    'text-shadow': 'textShadow',
    'box-shadow': 'boxShadow',
}

const borderKeys = [
    'borderBottomLeftRadius',
    'borderBottomRightRadius',
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomWidth',
    'borderRightWidth',
    'borderLeftWidth',
    'borderTopWidth',

    'borderTopStyle',
    'borderBottomStyle',
    'borderRightStyle',
    'borderLeftStyle',

    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor'
]


export default class HTMLImporter {

    constructor (lastUUID = 10000) {
        this.lastUUID = lastUUID
        this.isRemoveScreenOffset = false
        this.isRemoveContainers = false
        this.defaultStyle = false
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
        //this.printTree(tree)
        const app = this.flattenTree(tree, width, height, options)
        this.cleanUpModel(app)
        const scalledApp = this.scalledApp(app)
        return [scalledApp, tree]
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
                    widget.y *= f
                    widget.w *= f
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
            this.cleanUpWidget(w)
        })

        return app
    }

    cleanUpScreen(s, app) {
        this.removeHiddenElements(s, app)
        s.h = getScreenHeight(s, app)
        s.w = app.screenSize.w
        s.x = 0
        s.y = 0
        
        s.style = {
            background: s.style.background
        }
    }

    cleanUpWidget (w) {
        if (w.type === 'Label') {
            for (let key of borderKeys) {
                delete w.style[key]
            }
            delete w.style.background
        }
        delete w.children
        delete w._tag
        delete w._className
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
        if (widget._tag === 'FORM') {
            Logger.log(-1, 'HTMLImporter.removeHiddenElements() > FORM' , widget)
            return true
        }
        if (widget.type === 'Label' && !widget.props.label) {
            Logger.log(-1, 'HTMLImporter.removeHiddenElements() > Empty Label' , widget)
            return true
        }
        if (this.isRemoveContainers && widget.children.length > 0) {
            Logger.log(-1, 'HTMLImporter.removeHiddenElements() > Container' , widget)
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
       
            // check if we need to inline a label
            // FIXME: we can have here weird shitty stuff like <span><b>lala
            if (child.children.length === 1 && child.children[0].type === 'Label') {
                Logger.log(1, 'HTMLImporter.flattenNode()' , child.children[0].props.label)
                child.props.label = child.children[0].props.label
                child.children = []
            } else {
                this.flattenNode(scrn, app, child , prefx + "   ")
            }

        })
    }

    parseNode (node, parent, prefx='BODY.', logLevel = 1) {
       
        const children = node.childNodes;

        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            const isLeaf = isLeafNode(child)
            if (child.nodeType === ELEMENT_NODE) {
                if (!isLeaf) {
                    const widget = this.createWidget(child, prefx)
                    Logger.log(logLevel, 'HTMLImpoter.createWidget() > CNTR', `${prefx}${child.tagName} > ${widget.type}`)
                    parent.children.push(widget)
                    this.parseNode(child, widget, prefx + child.tagName + '.' )
                } else {
                    const label = getLeafNodeLabel(child)
                    const widget = this.createWidget(child, prefx)
                    Logger.log(logLevel, 'HTMLImpoter.createWidget() > Leave', `${prefx}${child.tagName} > ${widget.type} : ${label}`)
                    parent.children.push(widget)
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
                    parent.children.push(widget)
                }
           }
        }
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
        const has = this.getHas(node)
        const props = this.getProps(node)

        const widget = {
            id: 'w' + this.getUUID(),
            name: 'Widget',
            _className: node.className,
            _tag: node.tagName,
            type: widgetType,
            x: pos.x,
            y: pos.y,
            w: pos.w,
            h: pos.h,
            props: props,
            has:has,
            style: style,
            children: []
        }

        widget.active = {} // this.getDifStyle(style, this.getStyle(node, getActivePseudo(node)))
        widget.hover = {} //this.getDifStyle(style, this.getStyle(node, '::hover'))
        widget.error = {}

        return widget
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
        }
      
        return result
    }

    getHas() {
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

        if (this.defaultStyle) {
            return this.getDefaultStyle(node, pseudoElt)
        } else {
            return this.getCurrentStyle(node, pseudoElt)
        }
    }

    getDefaultStyle () {
        // make this much smarter depending on the type
        return JSON.parse(JSON.stringify(this.defaultStyle))
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

        
        } catch(err) {
            Logger.error('HTMLImporter.getStyle()', err)
        }

        if (node.tagName === 'INPUT') {
            if (isCheckBox(node)) {
               
                result.borderTopWidth = 1
                result.borderBottomWidth = 1
                result.borderLeftWidth = 1
                result.borderRightWidth = 1
                result.colorButton = result.color
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
        if (node.tagName === 'INPUT') {
            if (isCheckBox(node)) {
                return 'CheckBox'
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
    if (value.indexOf('px')) {
        value = value.slice(0, -2);
    }
    return Math.round(value * 1)
}

function isSubmit(node) {
    return node.type && node.type.toLowerCase() === 'submit'
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