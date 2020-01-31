import Logger from 'common/Logger'

export default class SketchService {

    constructor () {
        this.logger = new Logger('SketchService')
        this.ids = 0
    }

    async run (bytes) {
        this.logger.log(-1, 'run', 'enter')
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
        this.logger.log(1, 'processZip', 'enter')
        let result = {
            model: {
                name: '',
                screenSize: {
                    w: 100,
                    h: 100
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

        await this.loadPreviews(result, zip)

    

        /**
         * Set screen size to min of all board
         */
        result.files = files
        this.parse(result, resolve)   
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
        this.logger.log(1, 'parse', 'enter')
  
        result.files.forEach(file => {
            if (file.name.indexOf('pages') >=0 ){
                this.parsePage(result, file)
            }
        })

        resolve(result)
    }

    parsePage (result, file) {
        this.logger.log(-1, 'parse', 'enter',  file.name)

        let page = file.json
        return page.layers.map(layer => {
            if (layer._class === 'artboard'){
                this.parseArtboard(result, layer, page)
            }
        })
    }

    parseArtboard (result, artboard) {
        this.logger.log(-1, 'parseArtboard', 'enter', artboard.name)
        let screen = {
            name : artboard.name,
            id: this.getID('s'),
            children: []
        }
        this.copyPosition(artboard, screen)
        this.copyStyle(artboard, screen)
        result.model.screens[screen.id] = screen

        this.loopWidgets(result, artboard, screen)
        return screen.id;
    }

    loopWidgets (result, parent, screen) {
        return parent.layers.map(layer => {
            if (this['parse_' + layer._class]) {
                return this['parse_' + layer._class](result, layer, screen)
            } else {
                this.logger.log(-1, 'loopLayers', 'unknown type', layer._class)
            }
            return false
        }).filter(id => id != false)
    }

    copyPosition (layer, element) {
        if (layer.frame) {
            element.x = layer.frame.x
            element.y = layer.frame.y
            element.h = layer.frame.height
            element.w = layer.frame.width
        }
    }

    copyStyle (layer, element) {
        let style = {}
        console.debug(layer)
        if (layer.backgroundColor && layer.hasBackgroundColor) {
            style.background = this.getColorString(layer.backgroundColor)
        }
        element.style = style
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