
<template>
  <div :class="['MatcWidgetTypeRepeater', {'MatcWidgetTypeRepeaterHasBorder': hasBorder}, {'MatcWidgetTypeRepeaterGridSpaceBetween': hasSpaceBetween}]">

  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";
import DomBuilder from 'common/DomBuilder'
import Core from 'core/Core'
import lang from 'dojo/_base/lang'
import JSONPath from 'core/JSONPath'
import Logger from "common/Logger";

export default {
  name: "Repeater",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
        model: {
            props:{}
        },
        hasXOverFlow: false,
        dataBindingValues: null
    };
  },
  computed: {
      hasSpaceBetween () {
          return this.model.props.auto
      },
      hasBorder () {
          if (this.model && this.model.style) {
              let s = this.model.style
              return s.borderTopWidth > 0 || s.borderBottomWidth > 0 || s.borderRightWidth > 0 || s.borderLeftWidth > 0
          }
          return false
      }
  },
  methods: {

    setSymbol (s) {
        this.isSymbol = s
    },

    setZoomedModel (m) {
        this.app = m;
    },

    postCreate () {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this.logger = new Logger('Repeater')
    },

    wireEvents () {
        this.wireHover()
      //this.own(on(this.domNode, touch.press, lang.hitch(this, "onChange")));
      //this.own(topic.subscribe(this.topic, lang.hitch(this, "onOtherChecked")));
    },

    getHandlers () {
        // do not show if auto!
        if (this.boundingBox) {
            let handlers =  []
            handlers.push({
                y: this.boundingBox.h + this.distanceY,
                distanceY: this.distanceY,
                distanceX: this.distanceX,
                x: -10,
                hasY: true,
                hasX: false,
                icon: 'MatcCutsomerHandlerY',
                cursor: 'MatchResizeNorth',
                id: 'DistanceY'
            })
            if (this.model.props.layout !== 'rows' && this.model.props.auto === false) {
                handlers.push({
                    y: -10,
                    distanceY: this.distanceY,
                    distanceX: this.distanceX,
                    x: this.boundingBox.w + this.distanceX,
                    hasY: true,
                    hasX: false,
                    icon: 'MatcCutsomerHandlerX',
                    cursor: 'MatchResizeWest',
                    id: 'DistanceX'
                })
            }
            return handlers
        }
    },

    onHandlerChange (change) {
        if (this.boundingBox) {
            if (change.id === 'DistanceY') {
                this.model.props.distanceY = (change.distanceY + change.difY) / this._scaleY
                this.model.props.auto = false
                requestAnimationFrame( () => {
                    this.render(this.model, this.style, this._scaleX, this._scaleY)
                })
                return {
                      y: this.boundingBox.h + change.distanceY + change.difY,
                      x: -10
                }
            }

            if (change.id === 'DistanceX') {
                this.model.props.distanceX = (change.distanceX + change.difX) / this._scaleX
                this.model.props.auto = false
                requestAnimationFrame( () => {
                    this.render(this.model, this.style, this._scaleX, this._scaleY)
                })
                return {
                      x: this.boundingBox.w + change.distanceX + change.difX,
                      y: -10
                }
            }
        }
    },

    getHandlerCommand (change, handler) {
        if (this.boundingBox) {
            if (change.id === 'DistanceY') {
                this.model.props.distanceY = (change.distanceY + change.difY) / this._scaleY
                this.model.props.auto = false
                // also update the handler state, in case we click again..!
                handler.distanceY =  this.distanceY
                return {
                    change:{
                        distanceY: Math.floor((change.distanceY + change.difY) / this._scaleY),
                        auto: false
                    },
                    type: 'props'
                }
            }
            if (change.id === 'DistanceX') {
                 this.model.props.distanceX = (change.distanceX + change.difX) / this._scaleX
                this.model.props.auto = false
                // also update the handler state, in case we click again..!
                handler.distanceX =  this.distanceX
                return {
                    change:{
                        distanceX: Math.floor((change.distanceX + change.difX) / this._scaleX),
                        auto: false
                    },
                    type: 'props'
                }
            }
        }
    },

    getChildren() {
       return this._childWidgets
    },

    getDataBindingChildren () {
        return null
    },

    update (widget) {

        /**
         * We should have here some kind of fast rendering!
         */
        this.render(widget, this.style, this._scaleX, this._scaleY)
    },

    render (widget, style, scaleX, scaleY) {

      /**
       * This is super slow for fast rendering, as we will redraw everzthing. We must
       * therefore reuse the items or have some kind of rerender() method if the
       * isUpdate parameter is set
       */
      this.model = widget;
      this.setDataBindingFromTable(widget)
      /**
       * The widgets come from the getInhereitedMethod...
       * Property changes will not always send children.
       * FIXME: in BaseController.setWidget also add children?
       */
      if (widget.children) {
        this.children = widget.children
      } else {
          widget.children = this.children
      }

      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, widget);

      this.removeAllChildren(this.domNode)
      // this.domNode.innerHTML = ""
      this._childWidgets = []
      let db = new DomBuilder()

      if (!this.isSymbol && this.app && widget.children && widget.children.length > 0) {
        let core = new Core()
        core.model = this.app
        let boundingBox = core.getBoundingBox(widget.children)
        let offsetTop = boundingBox.y - widget.y - widget.style.borderTopWidth * scaleX
        let offsetLeft = boundingBox.x - widget.x - widget.style.borderLeftWidth * scaleX

        let cntrBox = {
            x: boundingBox.x,
            y: boundingBox.y,
            w: offsetLeft + boundingBox.w,
            h: offsetTop + boundingBox.h
        }

        if (widget.props.layout === 'rows') {
            cntrBox.w = widget.w
        }

        let rows = this.getRows(widget, cntrBox)
        let distanceY = this.getDistanceY(widget, rows, cntrBox)
        let columns = this.getColumns(widget, cntrBox)
        let distanceX = this.getDistanceX(widget, columns, cntrBox)
        // console.debug('Repeater.render(Y) h:', widget.h,  ' > bb: ', cntrBox.h, ' > r ', rows, ' > dis ', distanceY, "=", cntrBox.h * rows + (rows-1) * distanceY)
        // console.debug('Repeater.render(X)', widget.id, widget.w, cntrBox.w, columns, distanceX, "=", cntrBox.w * columns + (columns-1) * distanceX, widget)

        let cntrDiv = db.div('MatcWidgetTypeRepeaterGrid ' + widget.props.layout).build()

        if (widget.props.layout !== 'rows') {
            let cntrWith = (columns * cntrBox.w  + (columns-1) * distanceX)
            cntrDiv.style.width = cntrWith + 'px'
            this.hasXOverFlow = cntrWith > widget.w
        }

        let childWidgets = this.getChildWidgets(widget)
        let count = rows * columns

        /**
         * If we have a data binding, this gets priority
         */
        if (this.dataBindingValues && Array.isArray(this.dataBindingValues)) {
            count = this.dataBindingValues.length
        }

        for (let i = 0; i < count; i++) {
                /**
                 * We should have here something like smart rendering because in
                 * this approach redraws all the widget for each rendering, also in the
                 * fast rendering in canvas.
                 */
               let marginRight = distanceX
               if (i % columns === columns -1) {
                   marginRight = 0;
               }
               let marginBottom = distanceY
               if (i % rows === rows -1 && !this.dataBindingFromExternal) {
                   marginBottom = 0;
               }
               let cellDiv = db.div('MatcWidgetTypeRepeaterElement')
                    .w(cntrBox.w).h(cntrBox.h)
                    .marginBottom(marginBottom).marginRight(marginRight)
                    .build(cntrDiv)

                if (this.isSimulator || i > 0) {
                    childWidgets.forEach(childWidget => {

                        let copy = lang.clone(childWidget)
                        copy.inherited = childWidget.id
                        copy.id = childWidget.id + '-' + i
                        copy.dataBingingIndex = i
                        copy.isRepeaterChild = true
                        this.rewriteDataBinding(i, copy)

                        // we need to rewrite the data binding here!!

                        let top = (childWidget.y - cntrBox.y) + offsetTop
                        let left = (childWidget.x - cntrBox.x) + offsetLeft

                        let div = db.div('MatcWidget')
                            .w(childWidget.w).h(childWidget.h)
                            .top(top).left(left)
                            .build(cellDiv)

                        this._childWidgets.push({
                            parent: childWidget.id,
                            widget: copy,
                            div: div
                        })
                        this.factory.createWidgetHTML(div, copy);

                        /**
                         * We also set the databinging value here!
                         */
                        let uiWidget = this.factory.getUIWidgetByID(copy.id)
                        if (uiWidget) {
                            let dbValue = this.getDataBindingValue(i, copy, widget)
                            if (dbValue) {
                                uiWidget.setDataBinding(dbValue.variable, dbValue.value)
                            }
                        }
                    })
                }
        }

        this.domNode.appendChild(cntrDiv)
        this.boundingBox = cntrBox
        this.distanceY = distanceY
        this.distanceX = distanceX
      } else {
        db.div('MatcWidgetTypeRepeaterHint', 'Place widgets above').build(this.domNode)
      }
    },

    rewriteDataBinding (i, child) {
        if (child?.props?.databinding?.default) {
            // only of the repeater has a data binding
            if (this.model.props.databinding && this.model.props.databinding.default) {
                const parentPath = this.model.props.databinding.default
                const path = child.props.databinding.default
                const childPath = this.cutOffParentPath(path, parentPath)
                const newPath = `${parentPath}[${i}].${childPath}`
                child.props.databinding.default = newPath
                child.props.databinding.defaultRelativ = childPath
            } else {
                // set still the relative one, so the data bindng can work
                child.props.databinding.defaultRelativ = child.props.databinding.default
            }
        }
    },

    cutOffParentPath (path, parentPath)  {
       
        if (path.indexOf(parentPath) === 0) {
            path = path.substring(parentPath.length)
            
            /**
             * We might have a path from the auto suggestion with '[0].' We cut it off
             */
            if (path.indexOf('[0]') === 0) {
                path = path.substring(3)
            }
            /**
             * We might have also a path starting with '.', we cut it off as well
             */
            if (path.indexOf('.') === 0) {
                path = path.substring(1)
            }
        }
       
        return path
    },

    getDataBindingValue (i, child) {
         if (this.dataBindingValues) {
            if (child.props.databinding && child.props.databinding.defaultRelativ){
                let key = child.props.databinding.default
                let path = child.props.databinding.defaultRelativ
                let row = this.dataBindingValues[i]
                let value = JSONPath.get(row, path)
                if (value !== null && value != undefined) {
                    return {
                        variable: key,
                        value: value
                    }
                } else {
                    this.logger.warn('getDataBindingValue()', 'Cannot find ' + path)
                }
            } else {
                this.logger.warn('getDataBindingValue()', 'No defaultRelativ ', child.props)
            }
        }
    },

    getDataBindingValueOld (i, child) {
     
        if (this.dataBindingValues) {
            if (child.props.databinding && child.props.databinding.default){
                let key = child.props.databinding.default
                let path = key
                
                /**
                 * We remove the parent path here if needed. The varibale must stay
                 * the same, otherwise the UIWidget.setDataBining() will not work
                 */
                
                if (this.model.props.databinding && this.model.props.databinding.default) {
                    let parentKey = this.model.props.databinding.default
                    if (key.indexOf(parentKey) === 0) {
                        path = key.substring(parentKey.length)
                        
                        /**
                         * We might have a path from the auto suggestion with '[0].' We cut it off
                         */
                        if (path.indexOf('[0]') === 0) {
                            path = path.substring(3)
                        }
                        /**
                         * We might have also a path starting with '.', we cut it off as well
                         */
                        if (path.indexOf('.') === 0) {
                            path = path.substring(1)
                        }
                    }
                }
                /**
                 * Data Binding has priority
                 */
                if (this.dataBindingValues && this.dataBindingValues.length > i) {
                    let row = this.dataBindingValues[i]
                    let value = JSONPath.get(row, path)
                    if (value !== null && value != undefined) {
                        return {
                            variable: key,
                            value: value
                        }
                    } else {
                        this.logger.warn('getDataBindingValue()', 'Cannot find ' + path)
                    }
                }
            }
        }
    },

    getChildWidgets (container) {
        return container.children.map(id => {
            let childWidget = this.app.widgets[id];
            if (childWidget){
                return childWidget
            }
        })
    },

    getDistanceY (widget, rows, cntrBox) {
        let distance = widget.props.distanceY
        distance = Math.round(distance * this._scaleY)
        if (widget.props.distanceY < 0 || widget.props.auto) {
            let rest = widget.h - (rows * cntrBox.h)
            distance = Math.max(0, ( rest / Math.max(1,(rows - 1)))) // Math.floor gives some times spaces
        }
        return distance
    },

    getDistanceX (widget, columns, cntrBox) {
        let distance = widget.props.distanceX
        distance = Math.round(distance * this._scaleX)
        if (widget.props.distanceX < 0 || widget.props.auto) {
            let rest = widget.w - (columns * cntrBox.w)
            distance = Math.max(0,( rest / Math.max(1,(columns - 1))))
        }
        return distance
    },

    getColumns (widget, cntrBox) {
        if (widget.props.layout === 'rows') {
            return 1;
        }
        let columns = widget.props.columns
        if (columns >= 0) {
            this.logger.warn('getColumns()', 'Row > not supported!')
        }

        let w = cntrBox.w
        if (widget.props.distanceX > 0 && !widget.props.auto) {
            /**
             * This takes too the distance on the last element into account!
             * widget.w = columns * w + (columns - 1) * distanceX
             * widget.w = columns * w + columns * distanceX  + -1 * distanceX
             * widget.w = columns * w + columns * distanceX  - distanceX
             * widget.w + distanceX = columns * w + columns * distanceX
             * widget.w + distanceX = columns * (w + distanceX)
             * widget.w + distanceX  / (w + disanceX) = columns
             */
            let distance = Math.round(widget.props.distanceX * this._scaleX)
            columns = Math.floor((widget.w + distance) / (w + distance))
        } else {
            columns = Math.floor(widget.w / w)
        }

        this.logger.log(3, 'getColumns()', 'exit', columns)
        return columns
    },

    getRows (widget, cntrBox) {
        let rows = widget.props.rows * 1
        /** Since 2.4.0 we do not consider the row statement */
        if (rows >= 0) {
            this.logger.warn('getRows()', 'Row > not supported!')
        }
        let h = cntrBox.h
        if (widget.props.distanceY > 0 && !widget.props.auto) {
            /**
             * This takes too the distance on the last element into account!
             * widget.h = rows * h + (rows - 1) * distanceY
             * widget.h = rows * h + rows * distanceY - distanceY
             * widget.h + distanceY = rows * h + rows * distanceY
             * widget.h + distanceY = rows * (h + distanceY)
             * (widget.h + distanceY) / (h + distanceY) = rows
             */
            let distance = Math.round(widget.props.distanceY * this._scaleY)
            rows = Math.floor((widget.h + distance) / (h + distance))
        } else {
            rows = Math.floor(widget.h / h)
        }
        this.logger.log(3, 'getRows()', 'exit', rows)
        return rows
    },

    getValue () {},

    setValue () {},

    getState () {
      if (this.dataBindingFromExternal) {
        return {
            'dataBindingValues': this.dataBindingValues
        };
      }
    },

    setState (state) {
        if (state && state.dataBindingValues) {
            this.dataBindingValues = state.dataBindingValues
            if (this.model) {
                this.render(this.model, this.style, this._scaleX, this._scaleY)
            }
        }
    },

    _setDataBindingValue (v) {
      this.dataBindingValues = v
      this.dataBindingFromExternal = true
      this.render(this.model, this.style, this._scaleX, this._scaleY)
      this.emit('rerender', this)
    },

    getOutputDataBindingValue (index) {
        if (this.dataBindingValues) {
            return this.dataBindingValues[index]
        }
    },

    setDataBindingFromTable (widget) {
        if (!this.dataBindingValues && !this.databindingInitedFromTable) {
             if (widget.props.data && widget.props.data.length > 1) {
                let data = widget.props.data
                this.dataBindingValues = []
                let header = widget.props.data[0]
                for (let r=1; r < data.length; r++) {
                    let row = {}
                    for (let c=0; c < header.length; c++) {
                        let col = header[c]
                        row[col] = data[r][c]
                    }
                    this.dataBindingValues.push(row)
                }
                this.databindingInitedFromTable = true
             }
        }
    }

  },
  mounted() {}
};
</script>