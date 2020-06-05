class FigmaService {

  constructor () {
    this.baseURL = 'https://api.figma.com/v1/'
    this.vectorTypes = ['LINE', 'ELLIPSE', 'VECTOR']
    this.buttonTypes = ['RECTANGLE']
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

  async get (key) {

    return new Promise ((resolve, reject) => {
      console.debug('get', key)
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
            console.error('FigmaService.get() Error', e)
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
      let url = this.baseURL + 'images/' + key + '?ids=' + ids
      fetch(url, {
        method: 'get',
        credentials: "same-origin",
        headers: this._createDefaultHeader()
      }).then(resp => {
        resp.json().then(json => {
          try {
            resolve(json)
          } catch (e) {
            console.error('FigmaService.get() Error', e)
            resolve(null)
          }
        })
      }, err => {
        reject(err)
      })
    })
  }

  async parse (id, fModel) {
    console.debug('FigmaService.parse', fModel)
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

    let vectorWidgets = Object.values(model.widgets).filter(widget => widget.props.isVector)
    let vectorWidgetIds = vectorWidgets.map(w => w.figmaId).join(',')


    let imageResponse = await this.getImages(id, vectorWidgetIds)
    if (imageResponse.err === null) {
      let images = imageResponse.images
      vectorWidgets.forEach(w => {
        let image = images[w.figmaId]
        if (image) {
          w.props.figmaImage = image
        } else {
          console.error('FigmaService.parse() > No image for', w)
        }
      })
    } else {
      console.error('FigmaService.parse() > Could not get images', imageResponse)
    }
    return model
  }

  parseScreen (fScreen, model, fModel) {
    // console.debug('FigmaService.parseScreen', fScreen)
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
      style: this.getStyle(fScreen),
      children: []
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

  parseElement (element, qScreen, fParent, model) {
    // console.debug('FigmaService.parseElement', element)

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
      h: pos.h,
      props: this.getProps(element),
      style: this.getStyle(element)
    }
    model.widgets[widget.id] = widget
    qScreen.children.push(widget.id)

    /**
     * Go down recursive...
     */
    return widget
  }

  getProps (element) {
    let props = {}
    if (this.isVector(element)) {
      console.debug('FigmaService.getProps() > make vector', element)
      props.paths = element.strokeGeometry
      props.relativeTransform = element.relativeTransform
      props.isVector = true
    }
    return props
  }

  isVector (element) {
    return this.buttonTypes.indexOf(element.type) === -1
  }

  getStyle (element) {
    let style = {
      backgroundColor: 'red'
    }
    /**
     * How is this rendered. Which has priority
     */
    if (element.backgroundColor) {
      style.backgroundColor =  this.getColor(element.backgroundColor)
    }
    if (element.fills && element.fills.length > 0) {
      let fill = element.fills[0]
      style.backgroundColor = this.getColor(fill.color)
    }

    return style
  }

  getType (element) {
    if (this.isVector(element)) {
      return 'Vector'
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
    console.warn('FigmaServive.getPosition() > No abs pos', element)
    return {}
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