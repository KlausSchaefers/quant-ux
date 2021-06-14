import Logger from '../core/Logger'

export default class FigmaService {

  constructor (key) {
    this.setAccessKey(key)
    this.baseURL = 'https://api.figma.com/v1/'
    this.vectorTypes = ['LINE', 'ELLIPSE', 'VECTOR']
    this.buttonTypes = ['RECTANGLE', 'TEXT', 'FRAME']
    this.ignoredTypes = ['GROUP', 'INSTANCE']
    this.allAsVecor = false
    this.max_ids = 50
    this.pluginId = '858477504263032980'
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

  getPages (fModel) {
    Logger.log(-1, 'getPages() > enter')
    let pages = []
    let fDoc = fModel.document
    if (fDoc.children) {
      fDoc.children.forEach(page => {
        console.debug(page)
        pages.push({
          id: page.id,
          value: page.id,
          label: page.name
        })

      })
    }
    Logger.log(-1, 'getPages() > exit', pages)
    return pages
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
          } catch (err) {
            Logger.error('get() > Error', err)
            reject(err)
          }
        })
      }, err => {
        reject(err)
      })
    })
  }

  async get (key) {
    Logger.log(-1, 'get() > enter :' + key)
    return new Promise ((resolve, reject) => {
      let url = this.baseURL + 'files/' + key + '?geometry=paths&plugin_data=' + this.pluginId
      fetch(url, {
        method: 'get',
        credentials: "same-origin",
        headers: this._createDefaultHeader()
      }).then(resp => {
        if (resp.status === 200) {
          resp.json().then(json => {
            console.debug('get ', json)
            resolve(json)
          })
        } else {
          reject(new Error('Wrong Status'))
        }
      }, err => {
        reject(err)
      })
    })
  }

  async parse (id, fModel, importChildren, screenSize, selectedPages) {
    Logger.log(-1, 'parse() > enter importChildren:' + importChildren, fModel)
    let model = this.createApp(id, fModel, screenSize)
    let fDoc = fModel.document

    if (fDoc.children) {
      fDoc.children.forEach(page => {
        if (page.children && selectedPages.indexOf(page.id) >= 0) {
          page.children.forEach(screen => {
            this.parseScreen(screen, model, fModel, importChildren, screenSize)
          })
        }
      })
    }

    /**
     * Fix the lines that are until now with figma ids
     */
    this.setLineTos(model, fModel)

    /**
     * Get download images for all
     */
    await this.addBackgroundImages(id, model, importChildren)

    /**
     * TODO Add groups
     */


    return model
  }

  setLineTos (model) {
    let widgetMapping = {}
    Object.values(model.widgets).forEach(w => {
      widgetMapping[w.figmaId] = w.id
    })

    let screenMapping = {}
    Object.values(model.screens).forEach(s => {
      screenMapping[s.figmaId] = s.id
    })

    Object.values(model.lines).forEach(line => {
      line.from = widgetMapping[line.figmaFrom]
      line.to = screenMapping[line.figmaTo]
    })
  }

  async addBackgroundImages(id, model, importChildren) {

    let vectorWidgets = this.getElementsWithBackgroundIMage(model, importChildren)
    if (vectorWidgets.length > 0) {

      Logger.log(-1, 'addBackgroundImages() > vectors', vectorWidgets.length)
      let batches = this.getChunks(vectorWidgets, this.max_ids)

      let promisses = batches.map((batch,i) => {
        return this.addBackgroundImagesBatch(id, batch, i)
      })
      await Promise.all(promisses)
    }
    Logger.log(-1, 'addBackgroundImages() > exit')
  }

  getElementsWithBackgroundIMage (model, importChildren) {
    if (importChildren) {
      return Object.values(model.widgets).filter(widget => widget.props.isVector)
    } else {
      return Object.values(model.screens)
    }
  }

  async addBackgroundImagesBatch(id, batch, i) {
    Logger.log(3, 'addBackgroundImagesBatch() > start', i)
    return new Promise((resolve, reject) => {
      let vectorWidgetIds = batch.map(w => w.figmaId).join(',')
      this.getImages(id, vectorWidgetIds).then(imageResponse => {
        if (imageResponse.err === null) {
          Logger.log(3, 'addBackgroundImagesBatch () > end', i)
          let images = imageResponse.images
          batch.forEach(w => {
            let image = images[w.figmaId]
            if (image) {
              w.props.figmaImage = image
            }
            resolve(batch)
          })
        } else {
          Logger.error('addBackgroundImagesBatch () > Could not get images', imageResponse)
          reject(imageResponse.err)
        }
      }, err => {
        Logger.error('addBackgroundImagesBatch() > Could not get images', err)
        reject(err)
      })
    })
  }

  getChunks (array, size) {
    let result = []
    for (let i = 0; i < array.length; i += size) {
        let chunk = array.slice(i, i + size);
        result.push(chunk);
    }
    return result;
  }

  parseScreen (fScreen, model, fModel, importChildren, screenSize) {
    Logger.log(1, 'parseScreen()', fScreen.name)
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

    console.debug('parseScreen', pos, qScreen.name, qScreen.w, qScreen.h, screenSize)

    if (fScreen.children) {
      fScreen.children.forEach(child => {
        child._parent = fScreen
        this.parseElement(child, qScreen, fScreen, model, fModel)
      })
    }

    /**
     * Or check prototypeDevice
     */
    if (!screenSize) {
      model.screenSize.w = model.screenSize.w === -1 ? pos.w : Math.max(model.screenSize.w, pos.w)
      model.screenSize.h = model.screenSize.h === -1 ? pos.h : Math.max(model.screenSize.h, pos.h)
    }
    model.screens[qScreen.id] = qScreen

    Logger.log(4, 'parseScreen() exit ', fScreen.name, qScreen.id)
    return qScreen
  }

  parseElement (element, qScreen, fScreen, model, fModel) {
    Logger.log(6, 'parseElement() > enter: ' + element.name, element.type)

    let widget = null
    if (!this.isIgnored(element) && !this.isInsisible(element)) {
      let pos = this.getPosition(element)
      widget = {
        id: 'w' + this.getUUID(model),
        figmaId: element.id,
        name: element.name,
        type: this.getType(element),
        figmaType: element.type,
        x: pos.x,
        y: pos.y,
        w: pos.w,
        h: pos.h,
        z: this.getZ(element, model)
      }
      widget.style = this.getStyle(element, widget)
      widget.props = this.getProps(element, widget)
      widget.has = this.getHas(element, widget)
      widget.pluginData = this.getPluginData(element, widget)
      model.widgets[widget.id] = widget

      qScreen.children.push(widget.id)

    } else {
      Logger.log(7, 'parseElement() >Ignore: ' + element.name, element.type)
      /**
       * What if we have defined the callbacks and on a compomemt?
       */
    }

    /**
     * Go down recursive...
     */
    if (element.children) {
      element.children.forEach(child => {
        if (child.visible !== false) {
          child._parent = element
          Logger.log(6, 'parseElement() > go recursive', element)
          this.parseElement(child, qScreen, fScreen, model, fModel)
        }
      })
    }

    this.addTempLine(element, model)
    return widget
  }

  addTempLine (element,  model) {
    Logger.log(4, 'addLine() > enter', element.name, 'transition :' + element.transitionNodeID, element)

    if (element.transitionNodeID) {
      let clickChild = this.getFirstNoIgnoredChild(element)
      Logger.log(-1, 'addLine() >  : ', element.name, clickChild)
      let line = {
        id: 'l' + this.getUUID(model),
        from : null,
        to: null,
        figmaFrom: clickChild.id,
        figmaTo: element.transitionNodeID,
        points : [ ],
        event: "click",
        animation: "",
        duration : element.transitionDuration
      }
      model.lines[line.id] = line
    }
  }

  getFirstNoIgnoredChild (element) {
    /**
     * We do not render instance wrappers, so we take the first child.
     */
    if (this.isIgnored(element) && element.children.length > 0) {
      Logger.log(5, 'getFirstNoIgnoredChild() >  take child ', element.name)
      return this.getFirstNoIgnoredChild(element.children[0])
    }
    return element
  }

  getPluginData (element, widget) {
    if (element.pluginData && element.pluginData[this.pluginId]) {
      let pluginData = element.pluginData[this.pluginId]
      if (pluginData.quxType) {
        Logger.log(3, 'getPluginData() > quxType : ', pluginData.quxType, element.name)
        widget.type = pluginData.quxType
      }
      if (pluginData.quxDataBindingDefault) {
        Logger.log(3, 'getPluginData() > quxDataBindingDefault : ', pluginData.quxDataBindingDefault, element.name)
        widget.props.databinding = {
          'default': pluginData.quxDataBindingDefault
        }
      }
      if (pluginData.quxOnClickCallback) {
        Logger.log(3, 'getPluginData() > quxOnClickCallback: ', pluginData.quxOnClickCallback, element.name)
        widget.props.callbacks = {
          'click': pluginData.quxOnClickCallback
        }
      }
    }
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
      if (element.characters) {
        props.label = element.characters
      } else {
        props.label = element.name
      }
    }
    return props
  }

  isIgnored (element) {
    // FIXME: check for empty frames
    return this.ignoredTypes.indexOf(element.type) >= 0
  }

  isInsisible (element) {
    if (element.visible === false) {
      Logger.log(5, 'isInsisible() > exit (visible): ' + element.name, element.type)
      return true
    }
    if (element.type === 'FRAME') {
      if (element.backgroundColor && element.backgroundColor.a === 0) {
        Logger.log(5, 'isInsisible() > exit (alpha): ' + element.name, element.type)
        return true
      }
      if (element.fills) {
        if (element.fills.every(f => !f.visible)) {
          Logger.log(5, 'isInsisible() > exit (fills): ' + element.name, element.type)
          return true
        }
      }
    }
    if (element.opacity <= 0) {
      Logger.log(5, 'isInsisible() > exit (opacity): ' + element.name, element.type)
      return true
    }
    return false
  }

  isVector (element) {
    return this.allAsVecor || !this.isButton(element)
  }

  isLabel (widget) {
    return widget && widget.type === 'Label'
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
      style.backgroundColor =  this.getColor(element.backgroundColor, element)
    }
    if (element.fills) {
      if (element.fills.length === 1) {
        let fill = element.fills[0]
        if (fill.type === 'SOLID') {
          if (this.isLabel(widget)) {
            style.color = this.getColor(fill.color, element)
          } else {
            style.backgroundColor = this.getColor(fill.color, element)
          }
        }
        if (fill.type === 'GRADIENT_LINEAR') {
          /*
          * https://github.com/KarlRombauts/Figma-SCSS-Generator
          */
          // console.debug('gradient', element.name, element.id, element.fills)
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
            Logger.log(1, 'getStyle() > gradients not supported...')
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
        if (stroke.color) {
          style.borderBottomColor = this.getColor(stroke.color, element)
          style.borderTopColor = this.getColor(stroke.color, element)
          style.borderLeftColor = this.getColor(stroke.color, element)
          style.borderRightColor = this.getColor(stroke.color, element)
        }

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
              c: this.getColor(effect.color, element)
            }
          }
          if (effect.type === 'INNER_SHADOW') {
            style.boxShadow = {
              v: effect.offset.y,
              h: effect.offset.x,
              b: effect.radius,
              s: 0,
              i: true,
              c: this.getColor(effect.color, element)
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
          style.verticalAlign = fStyle.textAlignVertical.toLowerCase()
        }
      }
    }

    /**
     * Labels with constraints can be vertical middle
     */
    if (this.isLabel(widget) && style.verticalAlign !== 'bottom') {
      if (element.constraints) {
        let constraints = element.constraints
        if (constraints.vertical === 'TOP_BOTTOM') {
          style.verticalAlign = 'middle'
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

  getColor (c, element) {
    if (element && element.visible === false) {
      return ''
    }
    let a = c.a
    if (element && element.opacity < 1) {
      a = element.opacity
    }
    return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${a})`
  }

  getPosition (element) {
    if (element.absoluteBoundingBox) {
      let pos = {
        x: element.absoluteBoundingBox.x,
        y: element.absoluteBoundingBox.y,
        w: element.absoluteBoundingBox.width,
        h: element.absoluteBoundingBox.height
      }
      /**
       * We can ignore transformMatrix because absolutePositon gives the right values
       */
      return pos
    }
    Logger.warn('getPosition() > No abs pos', element)
    return {}
  }

  getTransformParent (element) {
    if (element._parent) {
      if (element._parent.type === 'FRAME') {
        return element._parent
      }
    }
    return
  }

  getZ (element, model) {
    model.lastZ++
    return model.lastZ
  }

  createApp (id, data, screenSize) {
    let app = {
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
      groups: {},
      lastUUID: 10000,
      lastZ: 1,
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

    if (screenSize) {
      app.screenSize = screenSize
    }
    return app
  }

  getUUID (model){
		var uuid = model.lastUUID++ + "";
		return uuid
	}

}