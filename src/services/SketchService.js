import Logger from 'common/Logger'

export default class SketchService {

    constructor () {
        this.logger = new Logger('SketchService')
        this.ids = 100000

        this.borderColorProperties = ['borderBottomColor', 'borderTopColor', 'borderLeftColor', 'borderRightColor']
		this.borderWidthProperties = ['borderBottomWidth', 'borderTopWidth', 'borderLeftWidth', 'borderRightWidth']
		this.borderStyleProperties = ['borderTopStyle', 'borderBottomStyle', 'borderRightStyle', 'borderLeftStyle']
		this.borderRadiusProperties = ['borderBottomLeftRadius', 'borderTopLeftRadius', 'borderBottomRightRadius', 'borderTopRightRadius']
    }

    async run (bytes) {
        this.logger.log(4, 'run', 'enter')
        return new Promise(async (resolve, reject) => {
            try {
                /**
                 * Lazy load jszip
                 */
                let x = await import(/* webpackChunkName: "sketch" */ 'jszip')
                let zip = new x.default()
                zip.loadAsync(bytes).then(res => {
                    this.logger.log(1, 'run', 'zip loaded', res)
                    this.processZip(res, resolve, reject)
                })
            } catch (e) {
                this.logger.error('run', 'error', e)
                reject(e)
            }
        })
    }

    async processZip (zip, resolve) {
        this.logger.log(4, 'processZip', 'enter')
        let result = {
            model: {
                name: '',
                screenSize: {
                    w: 0,
                    h: 100000
                },
                screens: {},
                widgets: {},
                lines: {},
                groups: {}
            },
            files: {}
        }
        /**
         * Load all files with a promise all
         */
      
        await this.loadJSONs(result, zip)
        await this.loadPreviews(result, zip)

        /**
         * Set screen size to min of all board
         */
       
        this.parse(result, resolve)   
    }

    async loadJSONs (result, zip) {
        let promisses = []
        let names = []
        Object.values(zip.files).forEach(file => {
            if (file.name.indexOf('document') >= 0 || file.name.indexOf('pages') >= 0 ) {
                names.push(file.name)
                promisses.push(file.async("string"))
            }
        });
        let files = await Promise.all(promisses)
        files = files.map((file, i) => {
            return {
                name: names[i],
                json: JSON.parse(file)
            }
        })
        result.files = files
    }

    async loadPreviews (result, zip) {
        let promisses = []
        let names = []
        Object.values(zip.files).forEach(file => {
            if (file.name.indexOf('previews') >= 0 ) {
                names.push(file.name)
                promisses.push(file.async("arraybuffer"))
            }
        });
        let files = await Promise.all(promisses)
        files = files.map((file, i) => {
            return {
                name: names[i],
                bytes: files[i]
            }
        })
        result.previews = files
    }

    parse (result, resolve) {
        this.logger.log(4, 'parse', 'enter')
  
        result.files.forEach(file => {
            if (file.name.indexOf('pages') >=0 ){
                this.parsePage(result, file)
            }
        })

        resolve(result)
    }

    parsePage (result, file) {
        this.logger.log(4, 'parse', 'enter',  file.name)

        let page = file.json
        page.layers.forEach(layer => {
            if (layer._class === 'artboard'){
                this.parseArtboard(result, layer, page)
            }
        })

        /**
         * Set max screen size
         */
        let screenSize = result.model.screenSize
        Object.values(result.model.screens).forEach(screen => {
            screenSize.w = Math.max(screenSize.w, screen.w)
            screenSize.h = Math.min(screenSize.h, screen.h)
        })
        this.logger.log(3, 'parsePage', 'exit', screenSize)
    }

    parseArtboard (result, artboard) {
        this.logger.log(4, 'parseArtboard', 'enter', artboard.name)
        let screen = {
            name : artboard.name,
            type: 'Screen',
            id: this.getID('s'),
            children: [],
            props: {},
            style: {
                "background": "#ffffff"
            }
        }
        this.copyPosition(artboard, screen)
        this.copyStyle(artboard, screen)
        result.model.screens[screen.id] = screen

        this.loopWidgets(result, screen, {x:screen.x, y: screen.y}, artboard)
        return screen.id;
    }

    loopWidgets (result, screen, offset, parent) {
        parent.layers.map(layer => {
            if (this['parse_' + layer._class]) {
                this['parse_' + layer._class](result, screen, offset, layer)
                if (layer.layers && layer.layers.length > 0) {
                    this.loopWidgets()
                }
            } else {
                this.logger.warn('loopLayers', 'unknown type', layer._class)
            }
        })
    }

    parse_rectangle (result, screen, offset, layer) {
        this.logger.log(4, 'parse_rectangle', 'enter', layer.name)
        
        let widget = {
            name : layer.name,
            type: 'Button',
            id: this.getID('w'),
            props: {},
            style: {
                "fontSize" : 14,
                "fontFamily" : "Helvetica Neue,Helvetica,Arial,sans-serif",
                "textAlign" : "center",
                "letterSpacing" : 0,
                "lineHeight" : 0,
                "background": "#333333",
                "color" : "#ffffff",
                "paddingTop" : 0,
                "paddingBottom" : 0,
                "paddingLeft" : 0,
                "paddingRight" : 0,
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
                "verticalAlign" : "middle"
            }
        }
        this.copyPosition(layer, widget, offset)
        this.copyStyle(layer, widget)
        screen.children.push(widget.id)
        // console.debug(layer.style)
        //console.debug(JSON.stringify(widget, null, 2))
        result.model.widgets[widget.id] = widget
    }

    parse_text (result, screen, offset, layer) {
        this.logger.log(5, 'parse_text', 'enter', layer.name)
    }

    parse_oval (result, screen, offset, layer) {
        this.logger.log(5, 'parse_oval', 'enter', layer.name)
    }

    parse_bitmap (result, screen, offset, layer) {
        this.logger.log(5, 'parse_bitmap', 'enter', layer.name)
    }

    parse_shapePath(result, screen, offset, layer) {
        this.logger.log(5, 'parse_shapePath', 'enter', layer.name)
    }

    copyPosition (layer, element, offset) {
        if (layer.frame) {
            element.x = layer.frame.x
            element.y = layer.frame.y
            element.h = layer.frame.height
            element.w = layer.frame.width
        }
        if (offset) {
            element.x += offset.x
            element.y += offset.y
        }
    }

    copyStyle (layer, element) {
        let result = element.style
        if (!result) {
            result = {}
        }
        if (layer.backgroundColor && layer.hasBackgroundColor) {
            result.background = this.getColorString(layer.backgroundColor)
        }


        if (layer.style) {
            let style = layer.style

            if (style.fills) {
                let fill = style.fills.find(f => f.isEnabled)
                if (fill) {
                    if (fill.color) {
                        result.background = this.getColorString(fill.color)
                    }
                }
            }

            if (style.borders) {
                let border = style.borders.find(b => b.isEnabled)
                if (border) {
             
                    if (border.color) {
                        let color = this.getColorString(border.color)
                        this.borderColorProperties.forEach(key => {
                            result[key] = color
                        })
                    }
                    if (border.thickness !== null && border.thickness !== undefined) {
                        this.borderWidthProperties.forEach(key => {
                            result[key] = border.thickness
                        })
                        this.adjustHeigtAndWithToBorderPosition(border, element)
                    }   
                }
            }

            if (style.shadows) {
                let shadow = style.shadows.find(s => s.isEnabled)
                if (shadow) {
                    result.boxShadow = this.getShadow(shadow)
                }
            }


            if (style.contextSettings && style.contextSettings.opacity) {
                result.opacity = style.contextSettings.opacity
            }
        }


        if (layer.fixedRadius) {
            this.borderRadiusProperties.forEach(key => {
                result[key] = layer.fixedRadius
            })
        }
        element.style = result
    }

    adjustHeigtAndWithToBorderPosition (border, element) {
        if (border.position === 0) {
            element.w += border.thickness
            element.h += border.thickness
        }   

        // border is outside
        if (border.position === 2) {
            element.w += border.thickness * 2
            element.h += border.thickness * 2
        }
    }

    getShadow (shadow) {
        return {
            "v" : shadow.offsetY,
            "h" : shadow.offsetX,
            "b" : shadow.blurRadius,
            "s" : 0,
            "c" : this.getColorString(shadow.color),
            "i" : false
        }
    }

    getColorString (color) {
        return `rgba(${this.getColorInt(color.red)}, ${this.getColorInt(color.green)}, ${this.getColorInt(color.blue)}, ${color.alpha})`
    }

    getColorInt(value) {
        return Math.round(value * 255)
    }

    getID(postfix) {
        return `${postfix}${this.ids++}`
    }

}