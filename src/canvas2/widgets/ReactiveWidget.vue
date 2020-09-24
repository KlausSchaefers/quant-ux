<template>
  <div class="MatcWidgetTypeNone">NO IMPLEMENTED</div>
</template>
<script>

import css from "dojo/css";
import lang from "dojo/_base/lang";
import topic from "dojo/topic";
import domStyle from "dojo/domStyle";
import CSSMixin from './CSSMixin'

export default {
  name: "UIWidget",
  props: ['qWidget'],
  mixins: [CSSMixin],
  data: function() {
    return {
      scale: 1,
      model: null,
      lastValidation: true,
      hoverAnimationDuration: 150,
      erroAnimationDuration: 0,
      qZoom: 1
    };
  },
  components: {},
  computed: {
    label () {
      if (this.qWidget) {
        return this.qWidget.props.label
      }
      return ''
    },
    style () {
       if (this.qWidget) {
        return this.qWidget.style
      }
      return {}
    },
    props () {
       if (this.qWidget) {
        return this.qWidget.props
      }
      return {}
    }
  },
  methods: {
    /**
     * Is called when in simulator to wire only when needed.
     */
    wireEvents () {},

    /**
     * Nmae to be shown in property sections
     */
    getName() {},

    /**
     * Widgets can here expose the templates for creation
    */
    getCreateTemplates () {
    },

    /**
     * Widget can expose here some properties
     */
    getDataProperties () {
    },

    /**
     * Widget can expose here some properties
     */
    getValidationProperties () {
    },

    /**
     * Gets called from the RenderFactory. Simple classes do not need to overwrite
     */
    render: function(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model);
    },

    /*
     * should be called when the widget was scalled, e.g. by
     */
    updateScale (model, style, scaleX, scaleY) {
      this.render(model, style, scaleX, scaleY)
    },

    getScaledValue (v ) {
      return this._scaleX * v
    },

    /**
     * Gets called after resizing in canvas
     */
    resize: function(box) {
      if (this.domNode.parentNode) {
        this.domNode.style.height = Math.round(box.h) + "px";
        this.domNode.style.width = Math.round(box.w) + "px";
      }
    },

    addClickListener: function(node, clickCallback) {
      return this.addMultiGestureListener(
        node,
        clickCallback,
        lang.hitch(this, "_onWidgetGesture")
      );
    },

    setGestures: function(hasGestures) {
      this._hasGestures = hasGestures;
    },

    _onWidgetGesture: function(gesture, startEvent, endEvent) {
      this.emit("gesture", gesture, startEvent, endEvent);
    },

    /**
     * Notify all other widgets to b
     */
    emitOpenPopup: function() {
      topic.publish("MatcSimulatorEvent", "popupOpen", null, this.model.id);
    },

    /**
     * Gets called by RenderFactory...
     */
    beforeDestroy: function() {
      if (this._compositeState) {
        this.emitCompositeState();
      }
    },

    /**
     * Get the node for inline editing
     */
    getLabelNode: function() {
      return null;
    },

    getValue () {
    },

    setFactory: function(m) {
      this.factory = m;
    },

    emitDataBinding: function(value, key) {
      if (!key) {
        key = "default";
      }
      var databinding = this.getDataBinding(this.model);
      if (databinding && databinding[key]) {
        var variable = databinding[key];
        this.emit("databinding", variable, value);
      }
    },

    /**
     * Gets called by the simulator.
     *
     * The method has to check if it is bound the the variable.
     * If so, it should return true, else false
     *
     */
    setDataBinding (variable, value) {
      var databinding = this.getDataBinding(this.model);
      if (databinding && databinding["default"]) {
        var widgetVarialbe = databinding["default"];
        if (widgetVarialbe === variable) {
          this._setDataBindingValue(value);
          return true;
        }
      }
      return false;
    },

    /**
     * Widgets can have some kind of output value!
     */
    getOutputDataBindingValue () {
    },

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue: function(v) {

      this.setValue(v);
    },

    setAutoFocus: function(node) {
      if (node && this.model && this.model.props.focus === true) {
        setTimeout(function() {
          node.focus();
        }, 100);
      }
    },

    emitClick: function(e) {
      this.emit("click", e);
    },

    emitFocus: function(e) {
      this.emit("focus", e);
    },

    emitHoverStart: function(e) {
      this.emit("hoverStart", e);
    },

    emitHoverEnd: function(e) {
      this.emit("hoverEnd", e);
    },

    emitMouseMove: function(e, clicked) {
      if (!clicked) {
        clicked = 0;
      } else {
        clicked = 1;
      }
      this.emit("mousemove", e, clicked);
    },

    emitMouseOver: function(e) {
      this.emit("mouseover", e);
    },

    emitMouseOut: function(e) {
      this.emit("mouseout", e);
    },

    emitValidationError: function(value) {
      this.emit("validationError", { value: value });
    },

    emitValidationOK: function() {
      this.emit("validationOK");
    },

    /**
     * stateChange events will be translated to click events, iff the event e was passed. Like this
     * the simulator know there was a click...
     *
     * *ATTENTION* Also transition will be executed of exists...
     */
    emitStateChange: function(type, value, e, time) {
      var event = {
        type: type,
        value: value,
        runTransition: true,
        e: e
      };
      if (time) {
        event.time = time;
      }
      var options = this.getStateOptions();
      if (options) {
        event.options = options;
      }
      this.emit("stateChange", event);
    },

    /**
     * stateChange events will be translated to click events, iff the event e was passed. Like this
     * the simulator know there was a click...
     *
     * ATTENTION* Transition will NOT be executed!
     */
    emitNoTransitionStateChange: function(type, value, e, time) {
      var event = {
        type: type,
        value: value,
        runTransition: false,
        e: e
      };
      if (time) {
        event.time = time;
      }
      var options = this.getStateOptions();
      if (options) {
        event.options = options;
      }
      this.emit("stateChange", event);
    },

    /**
     * Returns the state of the widget
     */
    getState: function() {
      return null;
    },

    /**
     * Set the state for a widget.
     *
     * @param state: The state object. Has a key and value. The value can be
     * also a composite state, for instance for input key down
     *
     * @param time: The player will also set the current time. This is important
     * for composite states that capture more complex interactions that take
     * several steps.
     */
    setState: function() {},

    /**
     * Composite states
     */

    initCompositeState: function(value, e) {
      if (this._compositeState) {
        //console.warn("initCompositeState() > state already registered.. we will overwrite")
      }

      this._compositeState = {
        time: new Date().getTime(),
        children: []
      };

      if (e) {
        this._compositeState.e = e;
      }

      if (value != null && value != undefined) {
        this.addCompositeSubState(value);
      }
    },

    addCompositeSubState: function(value) {
      if (this._compositeState) {
        this._compositeState.children.push({
          time: new Date().getTime(),
          value: value
        });
      }
    },

    emitCompositeState: function(type, value, e) {
      if (this._compositeState) {
        this._compositeState.type = type;
        this._compositeState.value = value;
        var options = this.getStateOptions();
        if (options) {
          this._compositeState.options = options;
        }
        if (e) {
          this._compositeState.e = e;
        }
        this.emit("stateChange", this._compositeState);
        delete this._compositeState;
      }
    },

    getStateOptions: function() {
      return null;
    },

    emitAnimation: function(id, duration, style, pos) {
      var animation = {
        id: id,
        to: {
          style: style,
          pos: pos
        },
        from: {},
        duration: duration,
        delay: 0
      };
      this.emit("animation", animation);
    },

    onDomMouseOver: function(e) {
      if (this.model.hover) {
        this.emitAnimation(
          this.model.id,
          this.hoverAnimationDuration,
          this.model.hover
        );
      }
      this.emitMouseOver(e);
    },

    onDomMouseOut: function(e) {
      if (this.model.hover) {
        if (this.value && this.model.active) {
          this.emitAnimation(
            this.model.id,
            this.hoverAnimationDuration,
            this.model.active
          );
        } else {
          this.emitAnimation(
            this.model.id,
            this.hoverAnimationDuration,
            this.model.style
          );
        }
      }
      this.emitMouseOut(e);
    },

    /**
     * Just in the setState method...
     */
    getLastSubState: function(state, t) {
      var result = null;
      if (state.children) {
        var values = state.children;

        /**
         * Use time series here as i expect linear reads from the player.
         */
        if (!state._ts) {
          state._ts = this.createTimeSeries(values);
        }
        return state._ts.get(t);
      }

      return result;
    },

    onScreenRendered: function() {
      if (!this._onScreenRenderedCalled) {
        this.hideErrorLabel();
        this._onScreenRenderedCalled = true;
      }
    },

    /**
     * Gets called on transitions and so on. Returns true if
     * the input is valid, otherwise false.
     */
    isValid: function() {
      return true;
    },

    _validateValue: function() {
      return true;
    },

    validate: function(value, showError) {
      /**
       * backup for legacy
       */
      if (showError == undefined) {
        console.warn("validate() > Show error not passed > ", this.model);
        showError = true;
      }
      var validation = this.model.props.validation;
      if (validation) {
        var isValid = this._validateValue(value);

        /**
         * This can cause some validation messages to be swallowed.
         */
        if (this.lastValidation != isValid) {
          if (!isValid) {
            if (showError) {
              this.showErrorLabel();
              if (this.model.error) {
                this.emitAnimation(
                  this.model.id,
                  this.erroAnimationDuration,
                  this.model.error
                );
              }
            }

            this.emitValidationError(value);
          } else {
            if (showError) {
              this.hideErrorLabel();
              if (this.model.error) {
                this.emitAnimation(
                  this.model.id,
                  this.erroAnimationDuration,
                  this.style
                );
              }
            }
            this.emitValidationOK(value);
          }
        }

        this.lastValidation = isValid;
      } else {
        this.lastValidation = true;
      }

      return this.lastValidation;
    },

    getRef: function(id) {
      if (this.model.props.refs && this.model.props.refs[id]) {
        var refs = this.model.props.refs[id];
        //				if(refs.length == 1){
        //					return refs[0];
        //				}
        return refs;
      }
      return null;
    },

    getErrorLabels: function() {
      var errorLabels = this.getRef("errorLabels");
      if (!errorLabels) {
        if (
          this.model.props.validation &&
          this.model.props.validation.errorLabels
        ) {
          console.warn("getErrorLabels() > legacy code!!!", this.model.id);
          errorLabels = this.model.props.validation.errorLabels;
        }
      }
      return errorLabels;
    },

    hideErrorLabel: function() {
      var errorLabels = this.getErrorLabels();

      if (this.model.props.validation && errorLabels) {
        for (var i = 0; i < errorLabels.length; i++) {
          var target = errorLabels[i];

          this.emitAnimation(target, this.erroAnimationDuration, {
            opacity: 0
          });
        }
      }
    },

    showErrorLabel: function() {
      var errorLabels = this.getErrorLabels();
      if (this.model.props.validation && errorLabels) {
        for (var i = 0; i < errorLabels.length; i++) {
          var target = errorLabels[i];
          this.emitAnimation(target, this.erroAnimationDuration, {
            opacity: 1
          });
        }
      }
    },

    /**
     * DEPRECTAD: Use DataBinding instead!
     */
    setValueLabel: function(value) {
      var refs = this.getRef("valueLabel");
      if (refs) {
        var id = refs[0];
        if (id) {
          /**
           * FIXME: EVIL HACK:
           * We have to hack to old ref[valueLabel] mechanism. We have since
           * the data binding a widget, which has it's own state and get's therefore updated...
           */
          var uiWidget = this.factory.getUIWidgetByID(id);
          if (uiWidget) {
            uiWidget.hackValueLabel = true;
          }

          var btn = this.factory.getLabelNodeById(id);
          if (btn) {
            btn.innerHTML = value;
          } else {
            /**
             * FIXME: Might happen on page reload!
             */
            //console.warn("setValueLabel() > Label with ID", id , "gone");
          }
        }
      }
    },

    setAnimatedPos: function(pos, style) {
      // FIXME: For rotate we ignore positioning!! This will
      // cause issues for transform things with onLoad.
      if (style && (style.rotate != null || style.rotate != undefined)) {
        return;
      }

      if (this.domNode) {
        /**
         * X and Y as css3 translate
         */
        var trans = "translate(" + pos.x + "px," + pos.y + "px) ";

        var w = pos.w + this.model.w;
        var h = pos.h + this.model.h;
        // this.resize({w:w,h:h});

        if (pos.w != undefined || pos.h != undefined) {
          w = w / this.model.w;
          h = h / this.model.h;
          trans += " scale(" + w + "," + h + ")";
          this.domNode.style.transformOrigin = "0% 0%";
          this.domNode.style.webkitTransformOrigin = "0% 0%";
        }

        var node = this.getAnimationNode();
        if (node) {
          node.style.transform = trans;
          node.style.webkitTransform = trans;
        } else {
          console.warn("No anim node");
        }
        this._lastAnimPos = pos;
      }

      //
    },

    /**
     * Some widgets might need to animate the parent node, e.g. all text boxes.
     */
    getAnimationNode: function() {
      return this.domNode;
    },

    setAnimatedStyle: function(style) {
      if (this.domNode) {
        /**
         * FIXME: This will cause fat animations in the log!! Maybe
         * we could do it better in Animation.js... The problem
         * are undo animation, where suddenly textSize is
         * undefined and set to 0
         */
        if (!this.animatedStyle) {
          this.animatedStyle = lang.clone(this.style);
        }
        for (var key in style) {
          this.animatedStyle[key] = style[key];
        }

        this.setStyle(this.animatedStyle);
      } else {
        console.debug("setAnimatedStyle() > No DomNode");
      }
    },

    getAnimatedStyle: function() {
      if (this.animatedStyle) {
        return this.animatedStyle;
      }

      return this.style;
    },

    setClickable: function() {
      css.add(this.domNode, "MatcSimulatorClickable");
    },

    stripHTML: function(s) {
      if (!s) {
        s = "";
      }
      s = s.replace(/<\/?[^>]+(>|$)/g, "");
      s = s.replace(/%/g, "$perc;");
      return s;
    },

    setInnerHTML: function(e, txt) {
      if (e) {
        txt = this.stripHTML(txt);
        txt = txt.replace(/\n/g, "<br>");
        txt = txt.replace(/\$perc;/g, "%");
        e.innerHTML = txt;
      } else {
        console.warn("setInnerHTML() > No node to set test > ", txt);
      }
    },

    setTextContent (e, txt) {
      if (e) {
        txt = this.stripHTML(txt);
        txt = txt.replace(/\n/g, "<br>");
        txt = txt.replace(/\$perc;/g, "%");
        e.textContent = txt;
      } else {
        console.warn("setTextContent() > No node to set test > ", txt);
      }
    },

    removeAllChildren (node) {
       while (node.lastChild) {
        node.removeChild(node.lastChild);
      }
    },

    /**********************************************************************
     * QDate methods!
     **********************************************************************/

    convertQDateToString: function(qdate) {
      var d = this.convertQDateToDate(qdate);
      return d.toLocaleDateString();
    },

    isEqualDate: function(a, b) {
      if (a && b) {
        return a.d == b.d && a.m == b.m && a.y == b.y;
      }
      return false;
    },

    isQDate: function(d) {
      return d && d.d != null && d.m != null && d.y != null;
    },

    createNow: function() {
      return this.convertDateToQdate(new Date());
    },

    createQDate: function(year, month, day) {
      // use date object to parse correctly..
      var d = new Date(year, month, day);
      return this.convertDateToQdate(d);
    },

    convertDateToQdate: function(d) {
      return {
        d: d.getDate(),
        m: d.getMonth(),
        y: d.getFullYear()
      };
    },

    convertQDateToDate: function(qdate) {
      return new Date(qdate.y, qdate.m, qdate.d);
    },

    convertMillisToQDate: function(ms) {
      var d = new Date(ms);
      return this.convertDateToQdate(d);
    },

    convertQDateToMillis: function(qdate) {
      return new Date(qdate.y, qdate.m, qdate.d).getTime();
    },

    /**********************************************************************
     * helper methods!
     **********************************************************************/

    stopPropagation: function(e) {
      if (e) {
        e.stopPropagation();
      }
      return false;
    },

    stopEvent: function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      return false;
    },

    getScreenDiv: function() {
      var parent = this.domNode.parentNode;
      while (parent) {
        if (css.contains(parent, "MatcScreen")) {
          return parent;
        }
        parent = parent.parentNode;
      }
    },

    getMouse: function(e) {
     // console.debug('UIWidget.getMouse', e)
     if (e) {
        var result = {};
        if (e.touches && e.touches.length > 0) {
          e = e.touches[0]
          result.x = e.clientX;
          result.y = e.clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0 ) {
          e = e.changedTouches[0]
          result.x = e.clientX;
          result.y = e.clientY;
        } else {
          result.x = e.pageX;
          result.y = e.pageY;
        }
        return result;
      }
      return {x: 0, y: 0};
    },

    _getBorderWidth: function(w) {
      if (w > 0) {
        return Math.max(1, this.getZoomed(w, this._scaleX));
      }
      return 0;
    },

    getCanvasPosition: function(node) {
      var s = domStyle.get(node);
      return {
        x: this.removePx(s.left),
        y: this.removePx(s.top)
      };
    },

    removePx: function(v) {
      var pos = v.indexOf("px");
      if (pos >= 0) {
        v = v.substring(0, pos);
      }
      return v * 1;
    },

    initStyles () {

    }
  },
  destroyed () {
    this.beforeDestroy()
  },
  watch: {
    qWidget (qWidget) {
      this.qWidget = qWidget
      this.qZoom = qWidget._zoom
      this.initStyles(this.qWidget, this.qZoom)
    }
  },
  mounted() {
    this.qZoom = this.qWidget._zoom
    this.initStyles(this.qWidget, this.qZoom)
  }
};
</script>