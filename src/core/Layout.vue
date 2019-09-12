<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import css from "dojo/css";
import CoreUtil from 'core/CoreUtil'

const _mactImportedFonts = {}

export default {
  name: "Layout",
  mixins: [DojoWidget],
  data: function() {
    return {
      RING_BACKGROUND: "#ccc",
      RING_FOREGROUND: false, //"#57a9fd",
      PROGRESS_COLOR: true
    };
  },
  components: {},
  methods: {
    attachFontsToDom (fonts) {
      if (fonts) {
        let head = document.head || document.getElementsByTagName('head')[0];
        fonts.forEach(f => {        
          if (f) { 
            if (!_mactImportedFonts[f.url]){
              let css = this.getFontImportStatement(f)
              let style = document.createElement('style');
              style.type = 'text/css';
              style.appendChild(document.createTextNode(css));   
              head.appendChild(style);
              _mactImportedFonts[f.url] = true
            }
          }
        })
      }
    },

    getFontImportStatement(f) {
      if (f.type !== 'import') {
        return `
          @font-face {
            font-family: "${f.name}";
            src: url("${f.url}") format("${f.type}")
          }`;  
      } else {
        return `@import url('${f.url}');`
      }
    },


    getParentScreen: function(widget) {
      for (var id in this.model.screens) {
        var screen = this.model.screens[id];
        var i = screen.children.indexOf(widget.id);
        if (i > -1) {
          return screen;
        }
      }

      return null;
    },

    getWidgetPostionInScreen: function(widget) {
      var screen = this.getParentScreen(widget);
      if (screen) {
        return {
          x: widget.x - screen.x,
          y: widget.y - screen.y,
          w: widget.w,
          h: widget.h
        };
      } else {
        return {
          x: widget.x,
          y: widget.y,
          w: widget.w,
          h: widget.h
        };
      }
    },

    /**********************************************************************
     * Bounding Box
     **********************************************************************/

    getGroupBoundingBox: function(ids) {
      var result = { x: 100000000, y: 100000000, w: 0, h: 0 };

      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var box = this.model.widgets[id];
        if (box) {
          result.x = Math.min(result.x, box.x);
          result.y = Math.min(result.y, box.y);
          result.w = Math.max(result.w, box.x + box.w);
          result.h = Math.max(result.h, box.y + box.h);
        } else {
          console.warn("getGroupBoundingBox() > No box with id", id);
        }
      }

      result.h -= result.y;
      result.w -= result.x;

      return result;
    },

    getScreenAnimation: function(screen, eventType) {
      if (screen.animation && screen.animation[eventType]) {
        return screen.animation[eventType];
      }
    },

    getDataBinding: function(widget) {
      if (widget && widget.props && widget.props.databinding) {
        return widget.props.databinding;
      }
    },

    getAllAppVariables (){
 
      var variables = [];
      if (this.model) {
        for(var id in this.model.widgets){
          var widget = this.model.widgets[id];
          if(widget.props && widget.props.databinding){
            var databinding = widget.props.databinding;
            for(var key in databinding){
              var variable = databinding[key];
              if(variables.indexOf(variable)<0){
                variables.push(variable);
              }
            }
          }
          // the rest widget save at some oher place
          if(widget.props && widget.props.rest && widget.props.rest.output){
            variables.push(widget.props.rest.output.databinding)
          }
        }
      }
			return variables;
    },
    
    getHintsAppVariables (){
 
      var variables = [];
      if (this.model) {
        for(var id in this.model.widgets){
          var widget = this.model.widgets[id];
          // the rest widget save at some oher place
          if(widget.props && widget.props.rest && widget.props.rest.output){
            let hints = widget.props.rest.output.hints;
            if (hints) {
              for (let key in hints) {
                variables.push(key.replace(/_/g, '.'))
              }
            }
          }
        }
      }
			return variables;
		},

    /**
     * Returns a fixed index for a timestamp, so we can use
     * a map for lookup. It just round by 30 (30 ms for good framerate)
     */
    getAnimationIndex: function(t) {
      return t - (t % 30);
    },

    createTimeSeries: function(data, prop) {
      if (!prop) {
        prop = "time";
      }

      data.sort(function(a, b) {
        return a[prop] - b[prop];
      });

      return {
        values: data,

        lastPos: 0,

        prop: prop,

        /**
         * The get function returns the next element with a higher time stamp.
         *
         * e.g. you have the following time stamps:
         *
         * [1,2,3,4,10]
         *
         * get(1) > would return element two
         *
         * get(5) > Would return element 5
         *
         * The function is optimized for linear reads. We store
         * the last position and start only looking from there. If you have linear reads
         * this is 150x faster...
         */
        get: function(t) {
          var value = null;
          var p = this.prop;
          for (let i = this.lastPos; i < this.values.length; i++) {
            let e = this.values[i];
            if (e[p] > t) {
              break;
            }
            value = e;
            this.lastPos = i;
          }

          if (value == null) {
            // var lastPos = 0;

            /**
             * FIXME: We could do here a binary search
             */
            for (let i = 0; i < this.values.length; i++) {
              let e = this.values[i];
              if (e[p] > t) {
                break;
              }
              value = e;
              this.lastPos = i;
            }
          }
          return value;
        },

        reset: function() {}
      };
    },

    getModelVersion: function(model, version) {
      if (!version) {
        version = this._modelVersion;
      }
    },

    /***************************************************************************
     * Zoom Layout Functions
     ***************************************************************************/

    /**
     * Creates scalled down model and also adds inheritance.
     *
     * FIXME: Change name to createViewModel();
     */
    createZoomedModel: function(zoomX, zoomY, isPreview) {
      this.logger.log(4, "createZoomedModel", "enter > " + zoomX + " > " + zoomY + " > " + isPreview);

      return CoreUtil.createZoomedModel(zoomX, zoomY, isPreview, this.model)
    },

    getZoomed: function(v, zoom) {
      //			if(this.doNotRoundForPreview){
      //				return v * zoom;
      //			}
      return Math.round(v * zoom);
    },

    getUnZoomed: function(v, zoom) {
      return Math.round(v / zoom);
    },

    getZoomedBox: function(box, zoomX, zoomY) {
      if (box.x) {
        box.x = this.getZoomed(box.x, zoomX);
      }

      if (box.y) {
        box.y = this.getZoomed(box.y, zoomY);
      }

      if (box.w) {
        box.w = this.getZoomed(box.w, zoomX);
      }

      if (box.h) {
        box.h = this.getZoomed(box.h, zoomY);
      }

      if (box.min) {
        box.min.h = this.getZoomed(box.min.h, zoomY);
        box.min.w = this.getZoomed(box.min.w, zoomX);
      }

      box.isZoomed = true;

      return box;
    },

    getUnZoomedBox: function(box, zoomX, zoomY) {
      /**
       * Fall back
       */
      if (!zoomY) {
        zoomY = zoomX;
      }

      if (box.x) {
        box.x = this.getUnZoomed(box.x, zoomX);
      }

      if (box.y) {
        box.y = this.getUnZoomed(box.y, zoomY);
      }

      if (box.w) {
        box.w = this.getUnZoomed(box.w, zoomX);
      }

      if (box.h) {
        box.h = this.getUnZoomed(box.h, zoomY);
      }

      return box;
    },

    createInheritedModel: function(model) {
      let inModel = CoreUtil.createInheritedModel(model)
      //console.debug("createInheritedModel", inModel.widgets);
      return inModel;
    },

    /**
     * Mixing method for creating the VIEW model.
     * It copies all properties of a into b,
     * unless b has its own value.
     *
     * In contract to lang.mixin(), this method is
     * undefined and null aware mixin. Works better
     * than lang.mixin for our data
     *
     * Also, it keeps track on the overwriten props in
     * the _overwriten property if needed. This is
     * related to mixinNotOverwriten() below!
     */
    mixin: function(a, b, keepTrack) {
      if (a && b) {
        b = lang.clone(b);
        if (keepTrack) {
          b._mixed = {};
        }

        for (var k in a) {
          if (b[k] === undefined || b[k] === null) {
            b[k] = a[k];
            if (keepTrack) {
              b._mixed[k] = true;
            }
          }
        }
      }
      return b;
    },

    mixinNotOverwriten: function(a, b) {
      if (a && b) {
        var mixed = {};
        if (b._mixed) {
          mixed = b._mixed;
        }
        //console.debug("mixinNotOverwriten", overwriten)
        for (var k in a) {
          if (b[k] === undefined || b[k] === null || mixed[k]) {
            b[k] = a[k];
          }
        }
      }
      return b;
    },

    getStartScreen: function(model) {
      if (!model) {
        model = this.model;
      }
      for (var id in model.screens) {
        var screen = model.screens[id];
        if (screen.props.start) {
          return screen;
        }
      }
      return null;
    },

    /***************************************************************************
     * Render Functions
     ***************************************************************************/

    /**
     * returns the style for an widget. If it is templated,
     * the template style is returned!
     *
     * This method is called in _Render.js and RenderFactory
     */
    getStyle: function(model) {
      if (model.template) {
        if (this.model.templates) {
          var t = this.model.templates[model.template];
          if (t) {
            /**
             * Merge in overwriten styles
             */
            var merged = lang.clone(t.style);
            if (model.style) {
              for (var key in model.style) {
                // console.debug("Layout.getStyle() > replace ",key, ":",  merged[key], " ->  ", model.style[key])
                merged[key] = model.style[key];
              }
            }
            return merged;
          } else {
            console.warn(
              "Layout.getStyle() > No template found for widget",
              model.id,
              " with template ",
              model.template
            );
          }
        }
      }
      return model.style;
    },

    /**
     * Returns the inherited style. Mixing in the properties of the
     * parent widget.
     */
    getInheritedStyle: function(model, widgetViewMode) {
      if (model && model.parentWidget) {
        var parent = this.model.widgets[model.parentWidget];
        if (parent) {
          var style = lang.mixin(
            lang.clone(parent[widgetViewMode]),
            model[widgetViewMode]
          );
          return style;
        } else {
          console.warn(
            "Layout.getInheritedStyle() > No template found for widget",
            model.id,
            " with widgetViewMode ",
            widgetViewMode
          );
        }
      }
      return model.style;
    },

    /**
     * Gets the right line for a box. In case of
     * inherited widgets it takes the line of the parent
     */
    getLineFrom: function(box) {
      var boxID = box.id;
      if (box.inherited) {
        boxID = box.inherited;
      }

      for (var id in this.model.lines) {
        var line = this.model.lines[id];
        if (line.from == boxID) {
          return line;
        }
      }
      return null;
    },

    /**
     * Returns all lines where line.from is == box.id.
     *
     * The lines are ordered by id, which might be wrong...
     */
    getFromLines: function(box) {
      var result = [];
      for (var id in this.model.lines) {
        var line = this.model.lines[id];
        if (line.from == box.id) {
          result.push(line);
        }
      }
      result.sort(function(a, b) {
        return a.id.localeCompare(b.id);
      });
      return result;
    },

    getParentGroup: function(widgetID) {
      if (this.model.groups) {
        for (var id in this.model.groups) {
          var group = this.model.groups[id];
          var i = group.children.indexOf(widgetID);
          if (i > -1) {
            return group;
          }
        }
      }
      return null;
    },

    renderWidget: function(screen, widget) {
      var div = this.createBox(widget, screen);
      css.add(div, "MatcWidget");
      this.renderFactory.createWidgetHTML(div, widget);
      if (this.selectedWidgetID) {
        if (this.selectedWidgetID != widget.id) {
          css.add(div, "MatcWidgetPreviewPassive");
        } else {
          css.add(div, "MatcWidgetPreviewActive");
        }
      }
      return div;
    },

    createBox: function(box, parentBox) {
      var div = document.createElement("div");
      div.style.width = box.w + "px";
      div.style.height = box.h + "px";
      if (parentBox) {
        div.style.top = box.y - parentBox.y + "px";
        div.style.left = box.x - parentBox.x + "px";
      }
      return div;
    },

    createPreviewWrapper: function(model, node) {
      var wrapper = document.createElement("div");
      css.add(wrapper, "MatcPreviewWrapper");
      node.appendChild(wrapper);
      return wrapper;
    },

    /**
     * scale a pos into a box
     *
     * box : The child box to be properly scaled
     * type : how to scale
     * pos : The box to fit the child in
     */
    getScale: function(pos, type, box) {
      var scale = {};

      if (type == "width") {
        scale.x = (pos.w * 1.0) / box.w;
        scale.y = scale.x;
      } else if (type == "height") {
        scale.y = (pos.h * 1.0) / box.h;
        scale.x = scale.y;
      } else if (type == "all") {
        scale.x = (pos.w * 1.0) / box.w;
        scale.y = (pos.h * 1.0) / box.h;
      } else {
        if (box.w > box.h) {
          return this.getScale(pos, "width", box);
        } else {
          return this.getScale(pos, "height", box);
        }
      }

      return scale;
    },

    /**
     * check if app or box
     */
    getBoxToScale: function(model) {
      if (model.screenSize) {
        return model.screenSize;
      }
      return model;
    },

    getScaledSize: function(node, type, model) {
      var box = this.getBoxToScale(model);
      var scale = this.getScale(node, type, box);
      var s = {
        w: Math.ceil(box.w * scale.x),
        h: Math.ceil(box.h * scale.y)
      };
      return s;
    },

    /***************************************************************************
     * Helper functios
     ***************************************************************************/

    hasLogic: function(box) {
      if (box) {
        return box.type == "LogicOr";
      }
      return false;
    },

    hasRest: function(box) {
      if (box) {
        return box.type == "Rest";
      }
      return false;
    },

    hasOnClick: function(model) {
      if (model && model.has.onclick) {
        return true;
      }
      return false;
    },

    isClickable: function(model) {
      if (model && (model.has.onclick || model.has.editable)) {
        return true;
      }
      return false;
    },

    getEventScreenId: function(e) {
      if (e.overlay) {
        return e.overlay;
      }
      return e.screen;
    },

    /***************************************************************************
     * Layout Functions
     ***************************************************************************/

    getOrderedWidgets: function(widgets) {
      var result = [];
      for (var id in widgets) {
        var widget = widgets[id];
        if (widget) {
          this.fixMissingZValue(widget);
          result.push(widget);
        } else {
          var e = new Error("getOrderedWidgets() > no widget with id " + id);
          if (this.logger) {
            this.logger.sendError(e);
          }
        }
      }

      this.sortWidgetList(result);

      return result;
    },

    /**
     * Sort Screen children to render them in the correct order!
     *
     * Pass the children as parameter
     */
    sortChildren: function(children) {
      var result = [];
      for (var i = 0; i < children.length; i++) {
        var widgetID = children[i];
        var widget = this.model.widgets[widgetID];
        if (widget) {
          this.fixMissingZValue(widget);
          result.push(widget);
        }
      }

      this.sortWidgetList(result);

      //console.debug("sortChildren > ", result);
      return result;
    },

    /**
     * This method is super important for the correct rendering!
     *
     * We sort by:
     *
     *  1) style.fixed: fixed elements will be renderd last, therefore they come
     *  as the last elements in the list
     *
     * 	2) inherited : inherited values come first. They shall be rendered below the
     *  widget of the new screen
     *
     *  3) z : High z values come later
     *
     *  4) id: if the z value is the same, sort by id, which means the order the widgets have been
     *  added to the screen.
     */
    sortWidgetList: function(result) {
      /**
       * Inline function to determine if a widget is fixed.
       * we have to check if style exists, because the Toolbar.onToolWidgetLayer()
       * call the method without styles.
       */
      var isFixed = function(w) {
        if (w.style && w.style.fixed) {
          return true;
        }
        return false;
      };

      result.sort(function(a, b) {
        var aFix = isFixed(a);
        var bFix = isFixed(b);

        /**
         * 1) Sort by fixed. If both are fixed or not fixed,
         * continue sorting by inherited.
         */
        if (aFix == bFix) {
          /**
           * If both a inherited or not inherited,
           * continue sorting by z & id
           */
          if ((a.inherited && b.inherited) || (!a.inherited && !b.inherited)) {
            /**
             * 4) if the have the same z, sot by id
             */
            if (a.z == b.z && (a.id && b.id)) {
              return a.id.localeCompare(b.id);
            }

            /**
             * 3) Sort by z. Attention, Chrome
             * needs -1, 0, 1 or one. > does not work
             */
            return a.z - b.z;
          }
          if (a.inherited) {
            return -1;
          }

          return 1;
        }
        if (aFix) {
          return 1;
        }
        return -1;
      });
    },

    isFixedWidget: function(w) {
      if (w.style && w.style.fixed) {
        return true;
      }
      return false;
    },

    /**
     * FIX for old models without z-value
     */
    fixMissingZValue: function(box) {
      if (box.z === null || box.z === undefined) {
        box.z = 0;
      }
    }
  },
  mounted() {}
};
</script>