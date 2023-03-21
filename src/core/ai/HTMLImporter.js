import Logger from '../Logger'

const labelTypes = new Set(['LABEL', 'H1', 'H2', 'H3', 'H4'])

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

    'font-size': 'fontSize'
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

    'background-color': 'backgroundColor',
    'color': 'color',
    'text-align': 'textAlign',
    'font-family': 'fontFamily'
}


export default class HTMLImporter {

    constructor (lastUUID = 10000) {
        this.lastUUID = lastUUID
    }

    getUUID (){
		const uuid = this.lastUUID++ + "_" + Math.round(Math.random() * 100000);
		return uuid
	}

    html2QuantUX(html, node, width, height, options) {
        Logger.log(-1, 'HTMLImporter.html2QuantUX() > enter')
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
        return this.flattenTree(tree, width, height, options)
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
    
        return this.cleanUpModel(app)
    }

    cleanUpModel (app) {

        Object.values(app.screens).forEach(s => {
            s.x = 0
            s.y = 0
        })

        Object.values(app.widgets).forEach(w => {
            delete w.children
            delete w._tag
        })

        // set max screen height
        return app
    }
    
    flattenNode (scrn, app, node, prefx) {
        //Logger.log(-1, prefx + ' ' + node.id, node)
        node.children.forEach(child => {

            // child.x -= scrn.x
            // child.y -= scrn.y

            app.widgets[child.id] = child
            scrn.children.push(child.id)

            // check invisible???

            // check if we need to inline a label
            if (child.children.length === 1 && child.children[0].type === 'Label') {
            
                child.props.label = child.children[0].props.label
                console.debug('Inloine', child.children[0].props.label, 'at' , child)
            } else {
                this.flattenNode(scrn, app, child , prefx + "   ")
            }


        })
    }

    parseNode (node, parent, prefx='') {
    // console.debug(prefx, node.tagName, node.nodeType)

        if (this.isLeafNode(node)) {
            const label = node.nodeValue
            if (label && label.trim()) {
                const widget = this.createWidget(node)
                widget.props.label = label.trim()
                parent.children.push(widget)
            }
        }

    
        const children = node.childNodes;
        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            if (child.nodeType === 1) {
                const widget = this.createWidget(child)
                parent.children.push(widget)
                //console.debug(prefx, 'DOM >>> ', child.tagName)
                this.parseNode(child, widget, prefx + '  ')
            } else {
                this.parseNode(child, parent, prefx + '  ')
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
        return {
            id: 'w' + this.getUUID(),
            name: 'Widget',
            _className: node.className,
            _tag: node.tagName,
            type: widgetType,
            x: pos.x,
            y: pos.y,
            w: pos.w,
            h: pos.h,
            props: {},
            has:has,
            style: style,
            children: []
        }
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

    getStyle(node) {
        const result = {}
        if (node.nodeType != 1) {
            return result
        }
        const compStyle = getComputedStyle(node)
     
        for (let key in pixelStyles) {
            let value = compStyle[key]
            if (value) {
                if (value.indexOf('px')) {
                    value = value.slice(0, -2);
                }
                result[pixelStyles[key]] = value * 1
            }
        
        }
        for (let key in stringStyles) {
            const value = compStyle[key]
            if (value) {
                //console.debug(node.tagName, key, value)
                result[stringStyles[key]] = value
            }
        }
        return result
    }

    getPosition(node) {
        if (node.nodeType === 1) {
            const ret = node.getBoundingClientRect();
            return {x: ret.left, y: ret.top, w: ret.right - ret.left, h: ret.bottom - ret.top};
        }
        return {
            x:-1, y:-1, w: -1, h:-1
        }
    }

    getWidgetType (node) {
        if (node.nodeType === 3) {
            return 'Label'
        }
        if (labelTypes.has(node.tagName)) {
            return 'Label'
        }
        if (node.tagName === 'BUTTON') {
            return 'Button'
        }
        if (node.tagName === 'INPUT') {
            if (node.type && node.type.toLowerCase() === 'checkbox') {
                return 'CheckBox'
            }
            if (node.type && node.type.toLowerCase() === 'password') {
                return 'Password'
            }
            return 'TextBox'
        }
        return 'Button'

    }

    isLeafNode(node) {
        const children = node.childNodes;
        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            const type = child.nodeType
            if (type === 3) {
                return false
            }
        }
        return true
    }
}

/**
 *  const style = {
        color : "#333333",
        fontFamily : "Helvetica Neue,Helvetica,Arial,sans-serif",
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopWidth: 0,
        borderBottomWidth: 0,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        fontSize: 18,
        borderTopColor: "#333333",
        borderBottomColor: "#333333",
        borderRightColor: "#333333",
        borderLeftColor: "#333333",
        background: "#ffffff",
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        textAlign:"left"
    }
 */