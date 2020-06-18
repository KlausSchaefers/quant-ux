import Logger from 'common/Logger'

class FigmaService {

  constructor () {
    this.baseURL = 'https://api.figma.com/v1/'
    this.vectorTypes = ['LINE', 'ELLIPSE', 'VECTOR']
    this.buttonTypes = ['RECTANGLE', 'TEXT']
    this.allAsVecor = false
    this.logger = new Logger('FigmaService')
  }

  setAccessKey (key) {
    this.key = key
  }

  _createDefaultHeader() {

    let headers = new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Figma-Token': this.key
    })
    return headers

}

  async get (key, allAsVecor = false) {
    this.allAsVecor = allAsVecor
    return new Promise ((resolve, reject) => {
      let url = this.baseURL + 'files/' + key + '?geometry=paths'
      fetch(url, {
        method: 'get',
        credentials: "same-origin",
        headers: this._createDefaultHeader()
      }).then(resp => {
        resp.json().then(json => {
          try {
            let app = this.parse(key, json)
            resolve(app)
          } catch (e) {
            this.logger.error('get', 'Error', e)
            resolve(null)
          }
        })
      }, err => {
        reject(err)
      })
    })

  }

  getImages (key, ids) {
    return new Promise ((resolve, reject) => {
      /**
       * Get in double resolution
       */
      let url = this.baseURL + 'images/' + key + '?format=png&scale=2&ids=' + ids
      fetch(url, {
        method: 'get',
        credentials: "same-origin",
        headers: this._createDefaultHeader()
      }).then(resp => {
        resp.json().then(json => {
          try {
            resolve(json)
          } catch (e) {
            this.logger.error('get', 'Error', e)
            resolve(null)
          }
        })
      }, err => {
        reject(err)
      })
    })
  }

  async parse (id, fModel) {
    this.logger.log(-1, 'parse', fModel)
    let model = this.createApp(id, fModel)
    let fDoc = fModel.document

    if (fDoc.children) {
      fDoc.children.forEach(page => {
        if (page.children) {
          page.children.forEach(screen => {
            this.parseScreen(screen, model, fModel)
          })
        }
      })
    }

    /**
     * Get download images for all
     */
    await this.addVectorImages(id, model)

    /**
     * TODO Add groups
     */

    return model
  }

  async addVectorImages(id, model) {
    let vectorWidgets = Object.values(model.widgets).filter(widget => widget.props.isVector)
    if (vectorWidgets.length > 0) {
      let vectorWidgetIds = vectorWidgets.map(w => w.figmaId).join(',')
      let imageResponse = await this.getImages(id, vectorWidgetIds)
      if (imageResponse.err === null) {
        let images = imageResponse.images
        vectorWidgets.forEach(w => {
          let image = images[w.figmaId]
          if (image) {
            w.props.figmaImage = image
          } else {
            this.logger.error('addVectorImages', 'No image for', w)
          }
        })
      } else {
        this.logger.error('addVectorImages', 'Could not get images', imageResponse)
      }
    }
  }

  parseScreen (fScreen, model, fModel) {
    this.logger.log(1, 'parseScreen', fScreen.name)
    let pos = this.getPosition(fScreen)
    let qScreen = {
      id: 's' + this.getUUID(model),
      figmaId: fScreen.id,
      name: fScreen.name,
      type: 'Screen',
      x: pos.x,
      y: pos.y,
      w: pos.w,
      h: pos.h,
      props: {},
      children: [],
      style: this.getStyle(fScreen)
    }

    if (fScreen.children) {
      fScreen.children.forEach(child => {
        this.parseElement(child, qScreen, fScreen, model, fModel)
      })
    }

    model.screenSize.w = model.screenSize.w === -1 ? pos.w : Math.min(model.screenSize.w, pos.w)
    model.screenSize.h = model.screenSize.h === -1 ? pos.h : Math.min(model.screenSize.h, pos.h)
    model.screens[qScreen.id] = qScreen
    return qScreen
  }

  parseElement (element, qScreen, fScreen, model, fModel) {
    this.logger.log(1, 'parseElement', 'enter', element)

    let pos = this.getPosition(element)
    let widget = {
      id: 'w' + this.getUUID(model),
      figmaId: element.id,
      name: element.name,
      type: this.getType(element),
      figmaType: element.type,
      x: pos.x,
      y: pos.y,
      w: pos.w,
      h: pos.h
    }
    widget.style = this.getStyle(element, widget)
    widget.props = this.getProps(element, widget)
    widget.has = this.getHas(element, widget)
    model.widgets[widget.id] = widget
    qScreen.children.push(widget.id)

    /**
     * Go down recursive...
     */
    if (element.children) {
      element.children.forEach(child => {
        this.logger.log(-1, 'parseElement', 'go recursive', element)
        this.parseElement(child, qScreen, fScreen, model, fModel)
      })
    }
    return widget
  }

  getProps (element, widget) {
    let props = {}
    if (this.isVector(element)) {
      //console.debug('FigmaService.getProps() > make vector', element)
      props.paths = element.strokeGeometry
      props.relativeTransform = element.relativeTransform
      props.isVector = true
    }
    if (widget.type === 'Label') {
      props.label = widget.name
    }
    return props
  }

  isVector (element) {
    return this.allAsVecor || !this.isButton(element)
  }

  isButton (element) {
    if (this.buttonTypes.indexOf(element.type) >=0 ){
      return  !this.isTooComplexStyle(element)
    }
    return false
  }

  isTooComplexStyle (element) {
    if (element.fills && element.fills.length > 1) {
      return true
    }
    if (element.fills && element.fills.length === 1) {
      let fill = element.fills[0]
      return fill.type !== 'SOLID'
    }
    if (element.effects && element.effects.length > 1) {
      return true
    }
    if (element.strokes && element.strokes.length > 1) {
      return true
    }
    return false
  }


  getHas (element, widget) {
    if (widget.type === 'Label') {
      return {
        label: true,
        padding : true,
        advancedText: true
      }
    }
    if (widget.type === 'Button') {
      return {
        label: true,
        backgroundColor : true,
        border: true,
        onclick: true,
        padding: true
      }
    }
    return {}
  }

  getStyle (element, widget) {
    let style = {
      fontFamily : 'Helvetica Neue,Helvetica,Arial,sans-serif'
    }
    /**
     * How is this rendered. Which has priority
     */
    if (element.backgroundColor) {
      style.backgroundColor =  this.getColor(element.backgroundColor)
    }
    if (element.fills) {
      if (element.fills.length === 1) {
        let fill = element.fills[0]
        if (fill.type === 'SOLID') {
          if (this.isLabel(widget)) {
            style.color = this.getColor(fill.color)
          } else {
            style.backgroundColor = this.getColor(fill.color)
          }
        }
        if (fill.type === 'GRADIENT_LINEAR') {
          /*
          * https://github.com/KarlRombauts/Figma-SCSS-Generator
          */
          console.debug('gradient', element.name, element.id, element.fills)
          if (!this.isLabel(widget)) {
            let start = fill.gradientHandlePositions[0]
            let end = fill.gradientHandlePositions[1]

            let xDiff = start.x - end.x;
            let yDiff = start.y - end.y;
            let dir = Math.atan2(yDiff, xDiff) * 180 / Math.PI;


            let gradientStops = fill.gradientStops
            let colors = gradientStops.map(stop => {
                return {
                  c: this.getColor(stop.color),
                  p: stop.position * 100
                }
            })
            style.background = {
              direction: dir,
              colors: colors
            }
          } else {
            this.logger.log(1, 'getStyle', 'gradients not supported...')
          }
        }
      }
    }

    if (element.cornerRadius) {
      style.borderBottomLeftRadius = element.cornerRadius
      style.borderTopLeftRadius = element.cornerRadius
      style.borderBottomRightRadius = element.cornerRadius
      style.borderTopRightRadius = element.cornerRadius
    }

    /**
     * The border stuff we just do for rects and text
     */
    if (!this.isVector(element)) {
      if (element.strokes && element.strokes.length > 0) {
        let stroke = element.strokes[0]
        style.borderBottomColor = this.getColor(stroke.color)
        style.borderTopColor = this.getColor(stroke.color)
        style.borderLeftColor = this.getColor(stroke.color)
        style.borderRightColor = this.getColor(stroke.color)

        if (element.strokeWeight) {
          style.borderBottomWidth = element.strokeWeight
          style.borderTopWidth = element.strokeWeight
          style.borderLeftWidth = element.strokeWeight
          style.borderRightWidth = element.strokeWeight
        }

        if (element.strokeAlign !== 'INSIDE' && element.strokeWeight) {
          widget.x -= element.strokeWeight
          widget.w += element.strokeWeight * 2
          widget.y -= element.strokeWeight
          widget.h += element.strokeWeight * 2
        }
      }

      if (element.effects) {
        element.effects.forEach(effect => {
          if (effect.type === 'DROP_SHADOW') {
            style.boxShadow = {
              v: effect.offset.y,
              h: effect.offset.x,
              b: effect.radius,
              s: 0,
              i: false,
              c: this.getColor(effect.color)
            }
          }
          if (effect.type === 'INNER_SHADOW') {
            style.boxShadow = {
              v: effect.offset.y,
              h: effect.offset.x,
              b: effect.radius,
              s: 0,
              i: true,
              c: this.getColor(effect.color)
            }
          }
        })
      }

      if (element.style) {
        let fStyle = element.style
        style.fontSize = fStyle.fontSize
        style.fontSize = fStyle.fontSize
        style.fontWeight = fStyle.fontWeight
        style.lineHeight = fStyle.lineHeightPercent / 100
        style.letterSpacing = fStyle.letterSpacing
        if (fStyle.textAlignHorizontal) {
          style.textAlign = fStyle.textAlignHorizontal.toLowerCase()
        }
        if (fStyle.textAlignVertical) {
          style.valign = fStyle.textAlignVertical.toLowerCase()
        }
      }
    }

    return style
  }

  getType (element) {
    if (this.isVector(element)) {
      return 'Vector'
    }
    if (element.type === 'TEXT') {
      return 'Label'
    }

    return 'Button'
  }

  getColor (c) {
    return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${c.a})`
  }

  getPosition (element) {
    if (element.absoluteBoundingBox) {
      return {
        x: element.absoluteBoundingBox.x,
        y: element.absoluteBoundingBox.y,
        w: element.absoluteBoundingBox.width,
        h: element.absoluteBoundingBox.height
      }
    }
    this.logger.warn('getPosition', 'No abs pos', element)
    return {}
  }

  isLabel (widget) {
    return widget && widget.type === 'Label'
  }

  createApp (id, data) {
    return {
      version: 2.1,
      figmaId: id,
			name: data.name,
			description: '',
			screenSize: {
        "w" : -1,
        "h" : -1
      },
			type: 'smartphone',
			screens: {},
			widgets: {},
			lines: {},
			lastUUID: 10000,
			lastUpdate: 0,
			created: 0,
			startScreen: "",
			grid: {
				w: 8,
				h: 8,
				style: "line",
				color: "#cecece",
				visible: false,
				enabled: false
			}
    }
  }

  getUUID (model){
		var uuid = model.lastUUID++ + "";
		return uuid
	}

}

export default new FigmaService()