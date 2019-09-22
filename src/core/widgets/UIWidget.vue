<template>
  <div class="MatcWidgetTypeNone">NO IMPLEMENTED</div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import topic from "dojo/topic";
import domStyle from "dojo/domStyle";
import _Touch from "common/_Touch";
import Layout from "core/Layout";
import Gestures from "core/Gestures";

export default {
  name: "UIWidget",
  mixins: [Layout, _Touch, Gestures, DojoWidget],
  data: function() {
    return {
      // eslint-disable-next-line vue/no-reserved-keys
      _scaleX: 1,
      // eslint-disable-next-line vue/no-reserved-keys
      _scaleY: 1,
      // eslint-disable-next-line vue/no-reserved-keys
      _onScreenRenderedCalled: false,
      borderRadius: [
        "borderTopLeftRadius",
        "borderTopRightRadius",
        "borderBottomLeftRadius",
        "borderBottomRightRadius"
      ],
      lastValidation: true,
      hoverAnimationDuration: 150,
      erroAnimationDuration: 0
    };
  },
  components: {},
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

    setScalledNodeStyle: function(node, style, list) {
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        var w = this._getBorderWidth(style[p]);
        node.style[p] = w + "px";
      }
    },

    setBorderColor: function() {
      this._setBorderStyle(
        "borderTopColor",
        this.domNode,
        this.style,
        this.model
      );
      this._setBorderStyle(
        "borderBottomColor",
        this.domNode,
        this.style,
        this.model
      );
      this._setBorderStyle(
        "borderRightColor",
        this.domNode,
        this.style,
        this.model
      );
      this._setBorderStyle(
        "borderLeftColor",
        this.domNode,
        this.style,
        this.model
      );
    },

    _setBorderRadius: function(node, style) {
      for (var i = 0; i < this.borderRadius.length; i++) {
        var key = this.borderRadius[i];
        var w = this._getBorderWidth(style[key]);
        node.style[key] = w + "px";
      }
    },

    _setBorder: function(node, style) {
      this._setBorderRadius(node, style);
    },

    setStyle: function(style, model) {
      for (var p in style) {
        if (this["_set_" + p]) {
          this["_set_" + p](this.domNode, style, model);
        } else {
          if (style[p] != null) {
            this.domNode.style[p] = style[p];
          } else {
            //console.warn("The style", p ," is no value!", model);
          }
        }
      }
    },

    /**
     * Rotate around middle! This would cause problems if there is any deformation like
     * scale going on!
     */
    _set_rotate: function(parent, style) {
      var trans = "rotate(" + Math.round(style.rotate) + "deg)";
      this.domNode.style.transform = trans;
      this.domNode.style.webkitTransform = trans;
      this.domNode.style.transformOrigin = "50% 50%";
      this.domNode.style.webkitTransformOrigin = "50% 50%";

      this._currentTransform = trans;
    },

    _set_fontSize: function(parent, style) {
      var size = style.fontSize * this._scaleX;
      if (this._scaleX < 1) {
        size = size * 0.95;
      }
      parent.style.fontSize = size + "px";
    },

    _set_css: function(parent, style) {
      css.add(parent, style.css);
    },

    _set_boxShadow: function(parent, style) {
      var shadow = style.boxShadow;
      if (shadow) {
        var v = this.getZoomed(shadow.v, this._scaleY);
        var h = this.getZoomed(shadow.h, this._scaleX);
        var b = this.getZoomed(shadow.b, Math.max(this._scaleY, this._scaleX));
        var s = this.getZoomed(shadow.s, Math.max(this._scaleY, this._scaleX));
        var inset = shadow.i ? "inset" : "";

        var value =
          h +
          "px " +
          v +
          "px " +
          b +
          "px " +
          s +
          "px " +
          shadow.c +
          " " +
          inset;
        if (this._shadowNodes) {
          for (var i = 0; i < this._shadowNodes.length; i++) {
            var node = this._shadowNodes[i];
            node.style.boxShadow = value;
          }
        } else {
          parent.style.boxShadow = value;
        }
      } else {
        parent.style.boxShadow = "none";
      }
    },

    _setShadow: function(parent, shadow) {
      var v = this.getZoomed(shadow.v, this._scaleY);
      var h = this.getZoomed(shadow.h, this._scaleX);
      var b = this.getZoomed(shadow.b, Math.max(this._scaleY, this._scaleX));
      var s = this.getZoomed(shadow.s, Math.max(this._scaleY, this._scaleX));
      var inset = shadow.i ? "inset" : "";
      var value =
        h + "px " + v + "px " + b + "px " + s + "px " + shadow.c + " " + inset;
      parent.style.boxShadow = value;
    },

    _set_textShadow: function(parent, style) {
      var shadow = style.textShadow;
      if (shadow) {
        var v = this.getZoomed(shadow.v, this._scaleY);
        var h = this.getZoomed(shadow.h, this._scaleX);
        var b = this.getZoomed(shadow.b, Math.max(this._scaleY, this._scaleX));
        parent.style.textShadow = h + "px " + v + "px " + b + "px " + shadow.c;
      } else {
        parent.style.textShadow = "none";
      }
    },

    _set_padding: function(parent, style) {
      parent.style.padding = Math.round(style.padding * this._scaleX) + "px";
    },

    _setBorderStyle: function(key, parent, style) {
      if (this._borderNodes) {
        for (var i = 0; i < this._borderNodes.length; i++) {
          var node = this._borderNodes[i];
          node.style[key] = style[key];
        }
      }
    },

    _setScalledBorderStyle: function(key, parent, style) {
      if (this._borderNodes) {
        for (var i = 0; i < this._borderNodes.length; i++) {
          var node = this._borderNodes[i];
          var w = this._getBorderWidth(style[key]);
          node.style[key] = w + "px";
        }
      } else {
        //console.warn("UIWidget._setScalledBorderStyle() > Cannot apply " + key);
      }
    },

    _set_opacity: function(parent, style) {
      /**
       * Invisible elements should let clicks through...
       */
      if (style.opacity === 0) {
        css.add(parent, "MatcHidden");
      } else {
        css.remove(parent, "MatcHidden");
      }
      if (style.opacity <= 1) {
        parent.style.opacity = style.opacity;
      }
    },

    _set_borderTopWidth: function(parent, style) {
      this._setScalledBorderStyle("borderTopWidth", parent, style);
    },

    _set_borderBottomWidth: function(parent, style) {
      this._setScalledBorderStyle("borderBottomWidth", parent, style);
    },

    _set_borderLeftWidth: function(parent, style) {
      this._setScalledBorderStyle("borderLeftWidth", parent, style);
    },

    _set_borderRightWidth: function(parent, style) {
      this._setScalledBorderStyle("borderRightWidth", parent, style);
    },

    /**
     * Border radius
     */

    _set_borderRadius: function(parent, style) {
      this._setScalledBorderStyle("borderRadius", parent, style);
    },

    _set_borderTopLeftRadius: function(parent, style) {
      this._setScalledBorderStyle("borderTopLeftRadius", parent, style);
    },

    _set_borderTopRightRadius: function(parent, style) {
      this._setScalledBorderStyle("borderTopRightRadius", parent, style);
    },

    _set_borderBottomLeftRadius: function(parent, style) {
      this._setScalledBorderStyle("borderBottomLeftRadius", parent, style);
    },

    _set_borderBottomRightRadius: function(parent, style) {
      this._setScalledBorderStyle("borderBottomRightRadius", parent, style);
    },

    /**
     * color
     */

    _set_borderColor: function(parent, style) {
      this._setBorderStyle("borderColor", parent, style);
    },

    _set_borderTopColor: function(parent, style) {
      this._setBorderStyle("borderTopColor", parent, style);
    },

    _set_borderBottomColor: function(parent, style) {
      this._setBorderStyle("borderBottomColor", parent, style);
    },

    _set_borderRightColor: function(parent, style) {
      this._setBorderStyle("borderRightColor", parent, style);
    },

    _set_borderLeftColor: function(parent, style) {
      this._setBorderStyle("borderLeftColor", parent, style);
    },

    /**
     * Style
     */
    _set_borderTopStyle: function(parent, style) {
      this._setBorderStyle("borderTopStyle", parent, style);
    },

    _set_borderBottomStyle: function(parent, style) {
      this._setBorderStyle("borderBottomStyle", parent, style);
    },

    _set_borderRightStyle: function(parent, style) {
      this._setBorderStyle("borderRightStyle", parent, style);
    },

    _set_borderLeftStyle: function(parent, style) {
      this._setBorderStyle("borderLeftStyle", parent, style);
    },

    /**
     * Padding
     */
    _setScalledPadding: function(key, parent, style) {
      if (this._paddingNodes) {
        for (var i = 0; i < this._paddingNodes.length; i++) {
          var node = this._paddingNodes[i];
          var w = this._getBorderWidth(style[key]);
          node.style[key] = w + "px";
        }
      } else {
        //console.warn("UIWidget._setScalledPadding() > Cannot apply " + key);
      }
    },

    _set_paddingTop: function(parent, style) {
      this._setScalledPadding("paddingTop", parent, style);
    },

    _set_paddingLeft: function(parent, style) {
      this._setScalledPadding("paddingLeft", parent, style);
    },

    _set_paddingRight: function(parent, style) {
      this._setScalledPadding("paddingRight", parent, style);
    },

    _set_paddingBottom: function(parent, style) {
      this._setScalledPadding("paddingBottom", parent, style);
    },

    /**
     * Background
     */
    _set_background: function(parent, style) {
      if (this._backgroundNodes) {
        for (var i = 0; i < this._backgroundNodes.length; i++) {
          var node = this._backgroundNodes[i];
          if (node) {
            node.style.background = style.background;
          } else {
            console.warn("UIWidget._set_background() > No node ", this.model);
          }
        }
      }
    },

    /**
     * background image
     */
    _set_backgroundImage: function(parent, style, model) {
      if (this._borderNodes) {
        var node = this._borderNodes[model.id];
        if (node) {
          parent = node;
        }
      }

      var img = style.backgroundImage;
      if (img) {
        css.add(parent, "MatcScreenImage");
        if (img) {
          if (img.w > img.h) {
            css.add(parent, "MatcScreenImageHorizontal");
          } else {
            css.add(parent, "MatcScreenImageVertical");
          }
          if (this.hash) {
            parent.style.backgroundImage =
              "url(/rest/images/" + this.hash + "/" + img.url + ")";
          } else {
            var url = "url(/rest/images/" + img.url + ")";
            parent.style.backgroundImage = url;
          }

          if (style.backgroundSize) {
            parent.style.backgroundSize = style.backgroundSize + "%";
          } else {
            parent.style.backgroundSize = "100%"; // 100%
          }

          if (style.backgroundPosition && this.model) {
            var pos = style.backgroundPosition;
            parent.style.backgroundPosition =
              Math.round(pos.left * this.model.w) +
              "px " +
              Math.round(pos.top * this.model.h) +
              "px";
            parent.style.webkitBackgroundPosition =
              Math.round(pos.left * this.model.w) +
              "px " +
              Math.round(pos.top * this.model.h) +
              "px";
          } else {
            parent.style.backgroundPosition = "0 0"; // 100%
          }

          parent.style.backgroundRepeat = "no-repeat";
        } else {
          parent.style.backgroundImage = "none";
        }
      }
    },

    _set_verticalAlign: function(parent, style) {
      if (this._labelNodes) {
        for (var i = 0; i < this._labelNodes.length; i++) {
          var label = this._labelNodes[i];
          // reset class.. this is a little hacky! We should not do this too often!
          label.className = "MatcInlineEditable";
          if (style.textAlign) {
            css.add(
              label,
              "MatcInlineEditVAlign-" +
                style.verticalAlign +
                "-" +
                style.textAlign
            );
          } else {
            css.add(label, "MatcInlineEditVAlign-" + style.verticalAlign);
          }
        }
      }
    },

    _set_letterSpacing: function(parent, style) {
      parent.style.letterSpacing = style.letterSpacing * this._scaleX + "px";
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

    inherited () {
      console.warn(this.name + '().inherected() > DEPRECTAED')
    }
  },
  destroyed () {
    this.beforeDestroy()
  },
  mounted() {}
};
</script>