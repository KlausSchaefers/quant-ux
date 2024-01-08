import yaml from 'js-yaml'
import Logger from '../Logger'
import QSS from '../qss/QSS'
import HTMLImporter from './HTMLImporter'

export default class YAMLImporter extends HTMLImporter {

    constructor (lastUUID = 10000) {
        super(lastUUID)
        this.formWidth = "@form-width"
        this.containerPadding = 16
    }

    yamlQuantUX(content, width, height, options = {}) {
        Logger.log(-1, 'YAMLImporter.yamlQuantUX() > enter', options)
        
        
        const nodes = yaml.load(content)

        const root = {
            name: 'Screen',
            id: 's' + this.getUUID(),
            min : {
                w : width,
                h : height
            },
            x: 0,
            y: 0,
            w: width,
            h: height,
            props: {
                start:true
            },
            has: {},
            style: {
                background: "#fff"
            },
            children: []
        }
  
        //console.debug(JSON.stringify(nodes, null, 2))
        const tree = this.parseNode(nodes, root)
     

        this.layoutTree(tree, width - this.containerPadding * 2, this.containerPadding)


        const app = this.flattenTree(tree, width, height, options)
     
        const scalledApp = this.scalledApp(app)
        const layedOutApp = this.layoutApp(scalledApp)
        const cleanedApp = this.cleanUpModel(layedOutApp)

        //console.debug(JSON.stringify(cleanedApp, null, 2))
        return cleanedApp
    }

    layoutTree (node, width, offsetX = 0, offsetY = 0, gapX = 16, gapY = 32, indent= "") {
        // 
        console.debug(indent, '- ', node._type, node.props.label, offsetY, node.y, node.h)
        let tempOffsetY = offsetY
        let tempOffsetX = offsetX
        let totalHeigth = 0
        if (node._flexDirection === "ROW") {
            const l = node.children.length 
            const childWidth = Math.floor((width - ((l-1) * gapX)) / l)
            
            node.children.forEach((child) => {
                child.y = offsetY
                //console.debug(indent, ' >> ', child._type, child.props.label, child.y)

                child.x = tempOffsetX
                child.w = childWidth
                tempOffsetX = child.w + tempOffsetX + gapX
                const offsets = this.layoutTree(child, width, tempOffsetX, tempOffsetY, gapX, gapY,indent + "   ")
                tempOffsetX = offsets.x
                tempOffsetY = offsets.y

                totalHeigth = Math.max(totalHeigth, child.h)
            })    

        } else {
            node.children.forEach((child) => {
                child.y = tempOffsetY
                //console.debug(indent, ' >> ', child._type, child.props.label, child.y)
                child.x = offsetX
                child.w = width
                tempOffsetY = child.h + tempOffsetY + gapY
                const offsets = this.layoutTree(child, width, tempOffsetX, tempOffsetY, gapX, gapY, indent + "   ")
                tempOffsetX = offsets.x
                tempOffsetY = offsets.y
                totalHeigth += child.h + gapY

     
            })    
        }

        if (node._type === "CONTAINER") {

            console.debug(indent, ' done', node._type, totalHeigth)

            node.h = totalHeigth
        }



        return {x: tempOffsetX, y: tempOffsetY}
 
    }

    parseNode (node, parent = {children:[], type:"Screen"}) {
        if (Object.keys(node).length === 1) {
            for (let key in node) {
                const value = node[key]
                const widget = this.createWidget(key, value)
                if (parent) {
                    parent.children.push(widget)
                }
                if (value.CHILDREN) {
                    const children = value.CHILDREN
                    children.forEach(child => {
                        this.parseNode(child, widget)
                    })
                }
            }
        } else {
            Logger.error('YAMLImporter.parseNode() > wrong yaml node', node)
        }
        return parent
    }

    createWidget(type, node) {
        const widgetType = this.getWidgetType(type, node)
        const pos = this.getPosition(type, node)
        const height = type === "CONTAINER" ? 0 : "@form-height"
        const has = this.getHas(widgetType)
        const props = this.getProps(type, node)

        let widget = {
            id: 'w' + this.getUUID(),
            name: this.getWidgetName(widgetType),
            type: widgetType,
            x: pos.x,
            y: pos.y,
            w: "@form-width",
            h: height,
            z: this.z,
            props: props,
            has:has,
            children: [],
            _type: type
        }

        if (type === "CONTAINER") {
            widget._flexDirection = node['FLEX-DIRECTION']
        }
       
        this.z++
        widget.style = this.getStyle(type, node)
        widget.active = this.getActiveStyle(type, node)
        widget.hover = this.getHoverStyle(type, node)
        widget.error = this.getErrorStyle(type, node)
        widget.focus = this.getFocusStyle(type, node)

        const qssTheme = QSS.getTheme("wireframe")
        QSS.replaceVariables(qssTheme, widget)
        QSS.replaceSize(qssTheme, widget)
        QSS.replaceBorderVariables(widget)
 
        return widget
    }

    getActiveStyle (type) {
        if (type === 'INPUT') {
            return {
               "color": "@color-active",
               "background": "@background-active"
            }
        }

        return {}
    }

    getHoverStyle (type) {
        if (type === 'INPUT') {
            return {
                "borderColor": "@form-border-color:hover",
                "background": "@form-background:hover",
                "color": "@form-color:hover"
            }
        }
        if (type === 'BUTTON') {
            return {
                "borderColor": "@button-primary-border-color:hover",
                "background": "@button-primary-background:hover",
                "color": "@button-primary-color:hover"	
            }
        }
      
        return {}
    }


    getErrorStyle (type) {
        if (type === 'INPUT') {
            return {
                "borderColor": "@form-border-color:error",
                "background": "@form-background:error",
                "color": "@form-color:error",
                "colorButton": "@form-border-color:error"		
            }
        }

        return {}
    }

    getFocusStyle (type) {
        if (type === 'INPUT') {
            return {
                "borderWidth": "@border-width:focus",
                "borderColor": "@form-border-color:focus",
                "background": "@form-background:focus",
                "color": "@form-color:focus"
            }
        }

        return {}
    }

    getStyle (type, node) {
        const result = {
            fontFamily: "@font-family",
            fontSize: "@font-size-m",
            lineHeight: "@lineHeight",
            textAlign: "left",
            letterSpacing: "@letterSpacing",
            color: "@label-color",
            textShadow: null
        }

        if (type === 'BUTTON') {
            result.background = "@button-primary-background"
            result.borderColor = "@button-primary-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"
            result.padding = 0	
            result.color = "@button-primary-color"	
            result.textAlign = "center"
            result.verticalAlign = "middle"
        }
       
        if (type === 'CONTAINER') {
            result.borderColor = "red"
            result.borderWidth = "@border-width"
            result.borderStyle = "dashed"
        }

        if (type === 'INPUT') {
            result.background = "@form-background"
            result.borderColor = "@form-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"
            result.color = "@borderRadius"
            result.paddingBottom = "@form-padding-vertical",
			result.paddingTop = "@form-padding-vertical",
			result.paddingLeft = "@form-padding-horizontal",
			result.paddingRight = "@form-padding-horizontal"
           
            if (node.TYPE === 'Checkbox') {
                result.colorButton = "@form-border-color"
                result.verticalAlign = "middle"
            }
            if (node.TYPE === 'RadioBox') {
                result.colorButton = "@form-border-color"
                result.verticalAlign = "middle"
            }          
        }

        return result
      
    }

    getPosition () {
        return {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        }
    }

    getWidgetName (type) {
        return type + this.z
    }

    getProps (type, node) {
        const result = {}
        if (node.CONTENT) {
            result.label = node.CONTENT
        }            

        if (type === 'INPUT') {
            result.placeholder = true
            if (node.PLACEHOLDER) {
                result.label = node.PLACEHOLDER
            }            
            if (node.TYPE === 'Checkbox') {
                result.checked = false              
            }              
            if (node.TYPE === 'RadioBox') {
                result.checked = false
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

    getWidgetType (type, node) {
        if (type === 'CONTAINER') {
            return 'Box'
        }

        if (type === 'LABEL') {
            return 'Button'
        }

        if (type === 'BUTTON') {
            return 'Button'
        }
               
        if (type === 'INPUT') {
            if (node.TYPE === 'Text') {
                return 'TextBox'
            }
            if (node.TYPE === 'Checkbox') {
                return 'LabeledCheckBox'
            }
            if (node.TYPE === 'Password') {     
                return 'Password'
            }
            if (node.TYPE === 'RadioBox') {
                return 'LabeledRadioBox'
            }
            if (node.TYPE === 'TextArea') {
                return 'TextArea'
            }           
            return 'TextBox'
        }
        return 'Button'

    }


    
}