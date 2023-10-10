import Logger from '../core/Logger'

export default class FigmaService {

  constructor (key) {
    this.setAccessKey(key)
    this.baseURL = 'https://api.figma.com/v1/'
    this.vectorTypes = ['LINE', 'ELLIPSE', 'VECTOR']
    this.buttonTypes = ['RECTANGLE', 'TEXT', 'FRAME']
    this.ignoredTypes = ['GROUP', 'INSTANCE']
    this.allAsVecor = false
    this.max_ids = 10
    this.pluginId = '858477504263032980',
    this.downloadVectors = true
  }

  setAccessKey (key) {
    this.key = key
  }

  setDownloadVectors (value) {
    this.downloadVectors = value
    return this
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
    Logger.log(2, 'getPages() > enter')
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
    Logger.log(1, 'getPages() > exit', pages)
    return pages
  }

  getImages (key, ids, scale=2) {
    Logger.log(1, 'getImages() > enter', scale)
    return new Promise ((resolve, reject) => {
      /**
       * Get in double resolution
       */
      let url = this.baseURL + 'images/' + key + '?format=png&scale=' + scale + '&ids=' + ids
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
    Logger.log(1, 'get() > enter :' + key)
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

  async parse (id, fModel, importChildren, screenSize, selectedPages = []) {
    Logger.log(1, 'parse() > enter importChildren:' + importChildren)
    let model = this.createApp(id, fModel, screenSize)
    let fDoc = fModel.document

    if (fDoc.children) {
      fDoc.children.forEach(page => {
        if (page.children && selectedPages.indexOf(page.id) >= 0 || selectedPages.length === 0) {
          Logger.log(1, 'parse() > enter page:' + page.id, page.id)
          page.children.forEach(screen => {
            if (screen.visible !== false) {
              this.parseScreen(screen, model, fModel, screenSize)
            } else {
              Logger.log(-1, 'parse() >ignore screen:' + screen.id, screen.name)
            }     
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
     * Add hot spots
     */
     model.widgets = this.addHotspots(model)


    return model
  }

  async getPreviews (id, fModel, importChildren, screenSize, selectedPages = []) {
    Logger.log(1, 'getPreviews() > enter importChildren:' + importChildren)
    let model = this.createApp(id, fModel, screenSize)
    let fDoc = fModel.document

    if (fDoc.children) {
      fDoc.children.forEach(page => {
        if (page.children && selectedPages.indexOf(page.id) >= 0 || selectedPages.length === 0) {
          Logger.log(1, 'parse() > enter page:' + page.id, page.id)
          page.children.forEach(screen => {
            if (screen.visible !== false) {
              this.parseScreen(screen, model, fModel, screenSize)
            } else {
              Logger.log(-1, 'parse() >ignore screen:' + screen.id, screen.name)
            }     
          })
        }
      })
    }

    await this.addBackgroundImages(id, model, importChildren)
    return model.screens
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
      if (widgetMapping[line.figmaFrom] && screenMapping[line.figmaTo]) {
        line.from = widgetMapping[line.figmaFrom]
        line.to = screenMapping[line.figmaTo]
      } else {
        Logger.error(-1, 'setLineTos() > Can NOT find', line.figmaFrom +' -> '+ line.figmaTo + ' = ', widgetMapping[line.figmaFrom] + ' ' + screenMapping[line.figmaTo])
      }

    })
  }

  async addBackgroundImages(id, model, importChildren) {
    if (this.downloadVectors) {
      const vectorWidgets = this.getElementsWithBackgroundIMage(model, importChildren)
      const maxWidth = Math.max(... vectorWidgets.map(v => v.w))
      const maxHeight = Math.max(... vectorWidgets.map(v => v.h))
      const scale = this.getScale(maxWidth, maxHeight)
      if (vectorWidgets.length > 0) {  
        Logger.log(-1, `addBackgroundImages() > vectors ${vectorWidgets.length} , w: ${maxWidth}, h: ${maxHeight}, scale: ${scale}`)
        const batches = this.getChunks(vectorWidgets, this.max_ids)  
        const promisses = batches.map((batch,i) => {
          return this.addBackgroundImagesBatch(id, batch, i, scale)
        })
        await Promise.all(promisses)
      }
      Logger.log(1, 'addBackgroundImages() > exit')
    }
  }

  getScale(width, height) {
    if (width > 2000 || height > 3000) {
      return 1
    }
    return 2
  }

  getElementsWithBackgroundIMage (model, importChildren) {
    if (importChildren) {
      return Object.values(model.widgets).filter(widget => widget.props.isVector)
    } else {
      return Object.values(model.screens)
    }
  }

  async addBackgroundImagesBatch(id, batch, i, scale = 2) {
    Logger.log(-1, 'addBackgroundImagesBatch() > batch : ' + i + ' @ '+ scale)
    return new Promise((resolve, reject) => {
      let vectorWidgetIds = batch.map(w => w.figmaId).join(',')
      this.getImages(id, vectorWidgetIds, scale).then(imageResponse => {
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

  parseScreen (fScreen, model, fModel, screenSize) {
    Logger.log(1, 'parseScreen()', fScreen.name)
    let pos = this.getPosition(fScreen)
    if (pos.w == 0 || pos.h == 0) {
      Logger.error('parseScreen() > Wrong dimension:', fScreen.name)
      return
    }
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

    /**
     * We add all widgets here!
     */
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
        
    this.addTempLine(element, model)

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


    return widget
  }

  addTempLine (element,  model) {


    if (element.transitionNodeID) {
      Logger.log(1, 'addTempLine() > enter', element.name  + '(' + element.id + ') -> :' + element.transitionNodeID)
      let line = {
        id: 'l' + this.getUUID(model),
        from : null,
        to: null,
        figmaFrom: element.id,
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

        if (widget && element.strokeAlign !== 'INSIDE' && element.strokeWeight) {
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
		var uuid = model.lastUUID++ + "_figma_" + Math.round(Math.random() * 100000)
		return uuid
	}


  addHotspots (model) {
      let result = {}

      var widgetScreenMapping = {}
      Object.values(model.screens).forEach(screen => {
          screen.children.forEach(widgetId => {
              widgetScreenMapping[widgetId] = screen
          })
          screen.children = []
      })

      Object.values(model.lines).forEach(line => {
          let from = model.widgets[line.from]
          let to = model.screens[line.to]
          if (from && to) {
              let parent = widgetScreenMapping[from.id]
              if (parent) {
                  from.type = 'HotSpot'
                  from.style = {}
                  result[from.id] = from
                  parent.children.push(from.id)

                  console.debug('ADD HOTSPOT', from.name, from.figmaId)
              } else {
                  Logger.log(0, 'addHotspots', 'cannot add hotspot for parent', line)
              }
          } else {
              Logger.log(0, 'addHotspots', 'cannot add hotspot for line', line)
          }
      })
      Logger.log(2, 'addHotspots', 'exit', result)
      return result
  }

}