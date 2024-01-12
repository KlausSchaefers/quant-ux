import yaml from 'js-yaml'
import Logger from '../Logger'
import QSS from '../qss/QSS'
import HTMLImporter from './HTMLImporter'

export default class YAMLImporter extends HTMLImporter {

    constructor (lastUUID = 10000) {
        super(lastUUID)
        this.formWidth = "@form-width"
        this.containerPadding = 16
        this.paddingX = 16
        this.paddingY = 16
        this.isFlattenLabels = false
    }

    yamlQuantUX(content, domNode, width, height, options = {}) {
        Logger.log(-1, 'YAMLImporter.yamlQuantUX() > enter', options)
        
        this.isRemoveContainers = options.isRemoveContainers
        this.isWireFrame = options.isWireFrame
        this.customStyle = options.customStyle
        this.domNode = domNode
        const nodes = yaml.load(content)

        const root = {
            name: 'Screen',
            type: "Screen",
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
            _type: "CONTAINER",
            children: []
        }
  
        const tree = this.parseNode(nodes, root)
        this.layoutTree(tree, width - this.containerPadding * 2, this.containerPadding, this.containerPadding)
        const app = this.flattenTree(tree, width, height, options)     
        const scalledApp = this.scalledApp(app)
        const layedOutApp = this.layoutApp(scalledApp)
        const cleanedApp = this.cleanUpModel(layedOutApp)

        //console.debug(JSON.stringify(cleanedApp, null, 2))
        return cleanedApp
    }

    layoutTree (node, width, offsetX = 0, offsetY = 0, gapX = 16, gapY = 16, indent= "") {
  
        let tempOffsetY = offsetY
        let tempOffsetX = offsetX
        let paddingX = 0
        let paddingY = 0
        if (!this.isRemoveContainers) {
            paddingX = this.paddingX
            paddingY = this.paddingX
            width -= (2 * gapX)
        }


        if (this.isRowContainer(node)) {
            const l = node.children.length 
            const childWidth = Math.floor((width - ((l-1) * gapX)) / l)            
            node.children.forEach((child) => {
                child.y = tempOffsetY
                child.x = tempOffsetX
                child.w = childWidth
                if (!this.isContainer(child)) {
                    child.h = this.computeContentHeight(child, width)
                }
                tempOffsetX = child.w + tempOffsetX + gapX
                const offsets = this.layoutTree(child, width, tempOffsetX, tempOffsetY + paddingY, gapX, gapY, indent + "   ")
                tempOffsetX = offsets.x             
            })    
        } else {           
            node.children.forEach((child) => {
                child.x = tempOffsetX 
                child.w = width
                child.y = tempOffsetY

                if (this.isContainer(child)) {
                    tempOffsetY += paddingY
                } else {
                    child.h = this.computeContentHeight(child, width)
                }
                this.layoutTree(child, width, tempOffsetX + paddingX, tempOffsetY, gapX, gapY, indent + "   ")
                tempOffsetY += child.h + gapY           
            })    
        }

        if (node._type === "CONTAINER") {          
            node.h = this.computeChildHeight(node) + paddingY * 2
        }

        //console.debug(indent, node.type, node.id, node.props.label, node.h, node.y)
        return {x: tempOffsetX, y: tempOffsetY} 
    }

    computeChildHeight(node) {
        let top = 1000000
        let bottom = 0
        node.children.forEach(c => {
            top = Math.min(top, c.y)
            bottom = Math.max(bottom, c.y + c.h)
        })
        return bottom - top
    }

    computeContentHeight (node, width) {
        let result = node.h
        if (node.type === 'Label') {
            let div =document.createElement('div')
            div.innerText = node.props.label
            div.style.width = width + 'px'
            div.style.fontFamily = node.style.fontFamily
            div.style.lineHeight = node.style.lineHeight

            div.style.fontSize = node.style.fontSize + 'px'
            this.domNode.appendChild(div)
            result = div.offsetHeight
            this.domNode.innerText = ""
        }
        return result
    }

    parseNode (node, parent = {children:[], type:"Screen"}) {
        if (Object.keys(node).length === 1) {
            for (let key in node) {
                const value = node[key]
                if (value) {
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
            }
        } else {
            Logger.error('YAMLImporter.parseNode() > wrong yaml node', node)
        }
        return parent
    }

    createWidget(type, node) {

        const widgetType = this.getWidgetType(type, node)
        const pos = this.getPosition(type, node)
        const height = this.getHeight(type, node)
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

    getHeight(type, node) {
        if (type === "CONTAINER")  {
            return 0
        }
        if (type === "IMAGE")  {
            return "@box-height-l"
        }
        if (type === "TABLE")  {
            return "@box-height-l"
        }

        if (type === "RADIO_GROUP" || type === 'CHECKBOX_GROUP')  {
            if (node.OPTIONS) {
                return node.OPTIONS.length * 40
            }
            return "@box-height-l"
        }

        return  "@form-height"

    }


    isHiddenElement(widget) {
        if (this.isRemoveContainers && widget._type === "CONTAINER") {
            return true
        }
        return false
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

        if (type === 'CONTAINER') {
            result.borderColor = "@form-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"
            result.padding = 0
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

        if (type === 'DATE_PICKER') {
            result.background = "@form-background"
            result.color = "@form-color"
            result.borderColor = "@button-primary-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"       
            result.borderRadius = "@border-radius"
            result.paddingBottom = "@form-padding-vertical"
			result.paddingTop = "@form-padding-vertical"
			result.paddingLeft = "@form-padding-horizontal"
			result.paddingRight = "@form-padding-horizontal"
            result.boxShadow = "@box-shadow-m"
            result.headerColor = "@form-color"
            result.headerBackground = "@form-background"
            result.selectedColor = "@form-background"
            result.selectedInRangeBackground = "@background-passive"
            result.selectedInRangeColor = "@color-passive"
            result.tableHeaderColor = "@form-color"
            result.tableHeaderBackground = "transparent"
            result.popupBorderColor = "@form-popup-border-color"
            result.popupBorderWidth = "@form-popup-border-width"
            result.popupColor = "@form-popup-color"
            result.popupBackground = "@form-popup-background"
            result.itemBorderRadius = "@calendar-item-radius"

        }

        if (type === 'DROPDOWN') {
            result.background = "@form-background"
            result.color = "@form-color"
            result.borderColor = "@button-primary-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"       
            result.borderRadius = "@border-radius"
            result.paddingBottom = "@form-padding-vertical"
			result.paddingTop = "@form-padding-vertical"
			result.paddingLeft = "@form-padding-horizontal"
			result.paddingRight = "@form-padding-horizontal"
            result.boxShadow = "@box-shadow-m"
  
            result.popupBorderColor = "@form-popup-border-color"
            result.popupBorderWidth = "@form-popup-border-width"
            result.popupColor = "@form-popup-color"
            result.popupBackground = "@form-popup-background"
            result.selectedOptionColor = "@form-popup-color:hover"
            result.selectedOptionBackground = "@form-popup-background:hover"

        }

        if (type === 'RADIO_GROUP' || type === 'CHECKBOX_GROUP') {
            result.background = "@form-background"
            result.borderColor = "@button-primary-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"
            result.color = "@form-color"
            result.borderRadius = "@border-radius"

            result.boxHeight = "@form-height"
            result.boxMarginRight = "@spacing-s"
            result.colorButton = "@background-active"


            if (type === 'RadioGroup') {
                result.borderRadius = "@border-radius-round"
            }
        }

        if (type === 'TABLE') {
            result.background = "@form-background"
            result.borderColor = "@form-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"
            result.color = "@form-color"
            result.borderRadius = "@border-radius"
            result.paddingBottom = "@form-padding-vertical",
			result.paddingTop = "@form-padding-vertical",
			result.paddingLeft = "@form-padding-horizontal",
			result.paddingRight = "@form-padding-horizontal"
            result.headerFontWeight = 800
            result.headerBackground = "@form-border-color"
            result.headerColor = "@form-background"
            result.headerSticky = true
            result.checkBox = false
            result.checkBoxHookColor = "#@background-active"
            result.checkBoxBackground = "@form-background"
            result.checkBoxBorderColor = "@form-border-color"
            result.checkBoxBorderRadius = "@border-radius"
            result.checkBoxBorderWidth = 1
        }
       
        if (type === 'CONTAINER') {
            result.colorButton = "@form-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"
        }

        if (type === 'IMAGE') {
            result.colorButton = "@form-border-color"
            result.borderWidth = 0
            result.borderStyle = "solid"
            result.backgroundImage = null
        }

        if (type === 'INPUT') {
            result.background = "@form-background"
            result.borderColor = "@form-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"
            result.borderRadius = "@border-radius"
            result.color = "@form-color"
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

        if (node.TYPE === 'Headline') {
            result.fontSize = "@font-size-xl"
        }     

        if (!this.isWireFrame) {
            if (node.BACKGROUND) {
                result.background = node.BACKGROUND
            }
            if (node.COLOR) {
                result.color = node.COLOR
            }
            if (node.BORDER_COLOR) {
                result.borderColor = node.BORDER_COLOR
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

        if (type === 'TABLE') {
            if (node.COLUMNS) {
                result.columns = node.COLUMNS.map(c => {
                    return {      
                        "label": c,
                        "width": 100,
                        "isEditable": false,
                        "isSortable": false,
                        "isSearchable": false                        
                    }
                })
            }
            if (node.DATA) { 
                result.data = node.DATA
            }
        }

        if (type === 'RADIO_GROUP' || type === 'CHECKBOX_GROUP' || type === 'DROPDOWN') {
            if (node.OPTIONS) {
                result.options = node.OPTIONS
            }
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
                "advancedText": true,
                "data" : true	
            }
        }

        if (type === 'Image') {
            return {
                "onclick" : true,
                "backgroundImage" : true,
                "borderRadius" : true,
                "data" : true	
            }
        }

        if (type === 'RadioGroup' || type === 'CheckBoxGroup' || type === 'DateDropDown') {
            return {
                "backgroundColor" : true,
                "onclick" : true,
                "border" : true,
                "label" : true,
                "data" : true	
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

        if (type === 'TABLE') {
            return 'Table'
        }

        if (type === 'CHECKBOX_GROUP') {
            return 'CheckBoxGroup'
        }

        if (type === 'RADIO_GROUP') {
            return 'RadioGroup'
        }

        if (type === 'LABEL') {
            return 'Label'
        }

        if (type === 'BUTTON') {
            return 'Button'
        }

        if (type === 'IMAGE') {
            return 'Image'
        }

        if (type === 'DROPDOWN'){
            return 'DropDown'
        }

        if (type === 'DATE_PICKER') {
            return 'DateDropDown'
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


    
    isRowContainer (node) {
        return node._flexDirection === "ROW"
    }

    isContainer (node) {
        return node._type === "CONTAINER"
    }
}
