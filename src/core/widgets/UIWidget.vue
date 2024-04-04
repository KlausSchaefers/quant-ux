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
import Logger from 'common/Logger'
import on from "dojo/on";
import touch from "dojo/touch";


const styleKeysForResize = [
			'fontSize',
			"borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius",
			"borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
			'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'boxShadow', 'textShadow', 'letterSpacing', 'icon']

export default {
  name: "UIWidget",
  props: ['qWidget', 'qQcaleX', 'qQcaleY'],
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
      erroAnimationDuration: 0,
      isPublic: false
    };
  },
  components: {},
  methods: {

  

    /**
     * Is called when in simulator to wire only when needed.
     */
    wireEvents () {},

    wireHover (over = touch.over, out = touch.out) {
      this.own(on(this.domNode, over, lang.hitch(this, "onDomMouseOver")));
      this.own(on(this.domNode, out, lang.hitch(this, "onDomMouseOut")));
    },

   

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
    onSimulatoStarted () {
    },

    /**
     * Widget can expose here some properties
     */
    getValidationProperties () {
    },

    setJwtToken(t) {
      this.jwtToken = t
    },

    setPublic(p) {
      this.isPublic = p
    },


    /**
     * Gets called from the RenderFactory. Simple classes do not need to overwrite
     */
    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model);
    },

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
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
    resize (box) {
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

    setGestures (hasGestures) {
      this._hasGestures = hasGestures;
    },

    _onWidgetGesture (gesture, startEvent, endEvent) {
      this.emit("gesture", gesture, startEvent, endEvent);
    },

    /**
     * Notify all other widgets to b
     */
    emitOpenPopup () {
      topic.publish("MatcSimulatorEvent", "popupOpen", null, this.model.id);
    },

    /**
     * Gets called by RenderFactory...
     */
    beforeDestroy () {
      if (this._compositeState) {
        this.emitCompositeState();
      }
    },

    /**
     * Get the node for inline editing
     */
    getLabelNode () {
      return null;
    },

    getValue () {
    },

    setFactory (m) {
      this.factory = m;
    },

    emitDataBinding (value, key = "default") {
      if (!key) {
        key = "default";
      }
      const databinding = this.getDataBinding(this.model);
      if (databinding && databinding[key]) {
        const variable = databinding[key];
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
      const databinding = this.getDataBinding(this.model);
      if (databinding && databinding["default"]) {
        const widgetVarialbe = databinding["default"];
        if (widgetVarialbe === variable) {
          this._setDataBindingValue(value);

          /**
           * Since 4.0.41 we force a validation
           * after the data set set! We do this with some delay,
           * 
           * FIXME: because the setDataBindign is called before 
           * the animation hooks are regsitered we need a timeout
           */
          setTimeout(() => {
            this.validate(value, true, true);
          }, 10)
      
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
    _setDataBindingValue(v) {
      this.setValue(v);
    },

    setAutoFocus (node) {
      if (node && this.model && this.model.props.focus === true) {
        setTimeout(function() {
          node.focus();
        }, 100);
      }
    },

    emitClick (e) {
      this.emit("click", e);
    },

    emitFocus (e) {
      this.emit("focus", e);
    },

    emitHoverStart (e) {
      this.emit("hoverStart", e);
    },

    emitHoverEnd (e) {
      this.emit("hoverEnd", e);
    },

    emitMouseMove (e, clicked) {
      if (!clicked) {
        clicked = 0;
      } else {
        clicked = 1;
      }
      this.emit("mousemove", e, clicked);
    },

    emitMouseOver (e) {
      this.emit("mouseover", e);
    },

    emitMouseOut (e) {
      this.emit("mouseout", e);
    },

    emitValidationError (value) {
      this.emit("validationError", { value: value });
    },

    emitValidationOK () {
      this.emit("validationOK");
    },

    /**
     * stateChange events will be translated to click events, iff the event e was passed. Like this
     * the simulator know there was a click...
     *
     * *ATTENTION* Also transition will be executed of exists...
     */
    emitStateChange (type, value, e, time) {
      const event = {
        type: type,
        value: value,
        runTransition: true,
        e: e
      };
      if (time) {
        event.time = time;
      }
      const options = this.getStateOptions();
      if (options) {
        event.options = options;
      }
      this.emit("stateChange", event);
    },

    emitHiddenStateChange (type, value, e, time) {
      const event = {
        hidden: true,
        type: type,
        value: value,
        runTransition: false,
        e: e
      };
      if (time) {
        event.time = time;
      }
      const options = this.getStateOptions();
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
    emitNoTransitionStateChange (type, value, e, time) {
      const event = {
        type: type,
        value: value,
        runTransition: false,
        e: e
      };
      if (time) {
        event.time = time;
      }
      const options = this.getStateOptions();
      if (options) {
        event.options = options;
      }
      this.emit("stateChange", event);
    },

    /**
     * Returns the state of the widget
     */
    getState () {
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
    setState () {},

    /**
     * Composite states
     */

    initCompositeState (value, e) {
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

    addCompositeSubState (value) {
      if (this._compositeState) {
        this._compositeState.children.push({
          time: new Date().getTime(),
          value: value
        });
      }
    },

    emitCompositeState (type, value, e) {
      if (this._compositeState) {
        this._compositeState.type = type;
        this._compositeState.value = value;
        const options = this.getStateOptions();
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

    getStateOptions () {
      return null;
    },

    emitAnimation (id, duration, style, pos) {
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

    onDomMouseOver (e) {
      if (this.model.hover) {
        this.emitAnimation(
          this.model.id,
          this.hoverAnimationDuration,
          this.model.hover
        );
      }
      this.emitMouseOver(e);
    },

    onDomMouseOut (e) {
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
    getLastSubState (state, t) {
      const result = null;
      if (state.children) {
        const values = state.children;

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

    onScreenRendered () {
      if (!this._onScreenRenderedCalled) {
        this.hideErrorLabel();
        this._onScreenRenderedCalled = true;
      }
    },

    isHidden () {
      return this.model?.style?.display === 'none'
    },

    /**
     * Gets called on transitions and so on. Returns true if
     * the input is valid, otherwise false.
     */
    isValid () {
      return true;
    },

    _validateValue () {
      return true;
    },

    validate (value, showError, forceValidation) {
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
        if (this.lastValidation != isValid || forceValidation) {
          if (!isValid) {
            if (showError) {
              console.debug('SHOW ERROR')
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

    getRef (id) {
      if (this.model.props.refs && this.model.props.refs[id]) {
        var refs = this.model.props.refs[id];
        //				if(refs.length == 1){
        //					return refs[0];
        //				}
        return refs;
      }
      return null;
    },

    getErrorLabels () {
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

    hideErrorLabel () {
      const errorLabels = this.getErrorLabels();

      if (this.model.props.validation && errorLabels) {
        for (let i = 0; i < errorLabels.length; i++) {
          const target = errorLabels[i];
          this.emitAnimation(target, this.erroAnimationDuration, {
            opacity: 0
          });
        }
      }
    },

    showErrorLabel () {
      const errorLabels = this.getErrorLabels();
      if (this.model.props.validation && errorLabels) {
        for (let i = 0; i < errorLabels.length; i++) {
          const target = errorLabels[i];
          this.emitAnimation(target, this.erroAnimationDuration, {
            opacity: 1
          });
        }
      }
    },

    /**
     * DEPRECTAD: Use DataBinding instead!
     */
    setValueLabel (value) {
      const refs = this.getRef("valueLabel");
      if (refs) {
        const id = refs[0];
        if (id) {
          /**
           * FIXME: EVIL HACK:
           * We have to hack to old ref[valueLabel] mechanism. We have since
           * the data binding a widget, which has it's own state and get's therefore updated...
           */
          const uiWidget = this.factory.getUIWidgetByID(id);
          if (uiWidget) {
            uiWidget.hackValueLabel = true;
          }

          const btn = this.factory.getLabelNodeById(id);
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

    setAnimatedPos (pos, style) {
      // FIXME: For rotate we ignore positioning!! This will
      // cause issues for transform things with onLoad.
      if (style && (style.rotate != null || style.rotate != undefined)) {
        return;
      }

      if (this.domNode) {
        /**
         * X and Y as css3 translate
         */
        let trans = "translate(" + pos.x + "px," + pos.y + "px) ";

        let w = pos.w + this.model.w;
        let h = pos.h + this.model.h;
        // this.resize({w:w,h:h});

        if (pos.w != undefined || pos.h != undefined) {
          w = w / this.model.w;
          h = h / this.model.h;
          trans += " scale(" + w + "," + h + ")";
          this.domNode.style.transformOrigin = "0% 0%";
          this.domNode.style.webkitTransformOrigin = "0% 0%";
        }

        const node = this.getAnimationNode();
        if (node) {
          node.style.transform = trans;
          node.style.webkitTransform = trans;
        } else {
          console.warn("No anim node");
        }
        this._lastAnimPos = pos;
      }


    },

    /**
     * Some widgets might need to animate the parent node, e.g. all text boxes.
     */
    getAnimationNode () {
      return this.domNode;
    },

    setAnimatedStyle (style) {
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

    getAnimatedStyle () {
      if (this.animatedStyle) {
        return this.animatedStyle;
      }

      return this.style;
    },

    setClickable () {
      css.add(this.domNode, "MatcSimulatorClickable");
    },

    stripHTML (s) {
      if (!s) {
        s = "";
      }
      s = s.replace(/<\/?[^>]+(>|$)/g, "");
      s = s.replace(/%/g, "$perc;");
      return s;
    },

    setInnerHTML (e, txt) {
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

    setScalledNodeStyle (node, style, list) {
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        var w = this._getBorderWidth(style[p]);
        node.style[p] = w + "px";
      }
    },

    setBorderColorForNode (node, style) {
      this._setBorderStyle("borderTopColor", node, style, this.model);
      this._setBorderStyle( "borderBottomColor", node, style, this.model);
      this._setBorderStyle( "borderRightColor", node, style, this.model);
      this._setBorderStyle( "borderLeftColor", node, style, this.model);
    },

    setBorderColor () {
      this._setBorderStyle("borderTopColor", this.domNode, this.style, this.model);
      this._setBorderStyle( "borderBottomColor", this.domNode, this.style, this.model);
      this._setBorderStyle( "borderRightColor", this.domNode, this.style, this.model);
      this._setBorderStyle( "borderLeftColor", this.domNode, this.style, this.model);
    },

    _setBorderRadius (node, style) {
      for (var i = 0; i < this.borderRadius.length; i++) {
        var key = this.borderRadius[i];
        var w = this._getBorderWidth(style[key]);
        node.style[key] = w + "px";
      }
    },

   _setBorderRadiusAt (node, style, borderRadius = []) {
      for (let i = 0; i < borderRadius.length; i++) {
        const key = borderRadius[i];
        const w = this._getBorderWidth(style[key]);
        node.style[key] = w + "px";
      }
    },

    _setBorder (node, style) {
      this._setBorderRadius(node, style);
    },

    setStyle (style, model, isResize = false ) {
    
      /**
       * Since 3.0.32 we to selective updates on zooms
       */
      if (isResize) {
        for (let i=0; i < styleKeysForResize.length; i++) {
          let p = styleKeysForResize[i]
          if (style[p] !== null && style[p] !== 0) {
           if (this["_set_" + p]) {
            this["_set_" + p](this.domNode, style, model);
            } else {
              this.domNode.style[p] = style[p];
            }
          }
			  }
      } else {
        /**
         * For design tokens we might have the weird situation, that the
         * shadow styles were injected in ModelUtils. After detaching the token,
         * the none method would not be called.
         */
        /*
        if (style['textShadow'] === undefined) {
          this._set_textShadow(this.domNode, style)
        }
        if (style['boxShadow'] === undefined) {
          this._set_boxShadow(this.domNode, style)
        }
        */
        for (let p in style) {
          // we have to call the method, to be sure to also handle nulls,
          // e.g. for background images
          if (this["_set_" + p]) {
            this["_set_" + p](this.domNode, style, model);
          } else {
            if (style[p] != null) {
              this.domNode.style[p] = style[p];
            }
          }
        }
      }
    },

    /**
     * Rotate around middle! This would cause problems if there is any deformation like
     * scale going on!
     */
    _set_rotate (parent, style) {
      var trans = "rotate(" + Math.round(style.rotate) + "deg)";
      this.domNode.style.transform = trans;
      this.domNode.style.webkitTransform = trans;
      this.domNode.style.transformOrigin = "50% 50%";
      this.domNode.style.webkitTransformOrigin = "50% 50%";

      this._currentTransform = trans;
    },

    _set_fontSize (parent, style) {
      let size = style.fontSize * this._scaleX;
      if (this._scaleX < 1) {
        size = size * 0.95;
      }
      parent.style.fontSize = Math.round(size) + "px";
    },

    _set_css: function(parent, style) {
      css.add(parent, style.css);
    },

    _set_boxShadow: function(parent, style) {
      const shadow = style.boxShadow;
      if (shadow) {
        const v = this.getZoomed(shadow.v, this._scaleY);
        const h = this.getZoomed(shadow.h, this._scaleX);
        const b = this.getZoomed(shadow.b, Math.max(this._scaleY, this._scaleX));
        var s = this.getZoomed(shadow.s, Math.max(this._scaleY, this._scaleX));
        const inset = shadow.i ? "inset" : "";
        const value = h + "px " + v + "px " + b + "px " + s + "px " + shadow.c + " " + inset;
        if (this._shadowNodes) {
          for (let i = 0; i < this._shadowNodes.length; i++) {
            const node = this._shadowNodes[i];
            node.style.boxShadow = value;
          }
        } else {
          parent.style.boxShadow = value;
        }
      } else {
        parent.style.boxShadow = "none";
      }
    },

    _setShadow (parent, shadow) {
      if (shadow) {
        const v = this.getZoomed(shadow.v, this._scaleY);
        const h = this.getZoomed(shadow.h, this._scaleX);
        const b = this.getZoomed(shadow.b, Math.max(this._scaleY, this._scaleX));
        const s = this.getZoomed(shadow.s, Math.max(this._scaleY, this._scaleX));
        const inset = shadow.i ? "inset" : "";
        const value = h + "px " + v + "px " + b + "px " + s + "px " + shadow.c + " " + inset;
        parent.style.boxShadow = value;
      }

    },

    _set_textShadow: function(parent, style) {
      const shadow = style.textShadow;
      if (shadow) {
        const v = this.getZoomed(shadow.v, this._scaleY);
        const h = this.getZoomed(shadow.h, this._scaleX);
        const b = this.getZoomed(shadow.b, Math.max(this._scaleY, this._scaleX));
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

   _set_backdropFilter(parent, style) {
      let backdropFilter = style.backdropFilter
      if (this._backgroundNodes) {
        for (let i = 0; i < this._backgroundNodes.length; i++) {
          let node = this._backgroundNodes[i];
          if (backdropFilter) {
            let blur = backdropFilter.blur
            blur = this.getZoomed(blur, this._scaleX)
            node.style.backdropFilter = `blur(${blur}px)`
          } else {
            node.style.backdropFilter = 'none';
          }
        }
      }
    },

  _set_filter(parent, style) {
		let filter = style.filter
		if (filter) {
			let result = []

			if (filter.blur) {
				let blur = filter.blur
				blur = this.getZoomed(blur, this._scaleX)
				result.push(`blur(${blur}px)`)
			}

			if (filter.grayscale) {
				result.push(`grayscale(${filter.grayscale}%)`)
			}

			if (filter.opacity) {
				result.push(`opacity(${filter.opacity}%)`)
			}

			if (filter.contrast !== undefined) {
				result.push(`contrast(${filter.contrast}%)`)
			}

			if (filter.brightness !== undefined) {
				result.push(`brightness(${filter.brightness}%)`)
			}

			if (filter.saturate !== undefined) {
				result.push(`saturate(${filter.saturate}%)`)
			}

			if (filter.hueRotate !== undefined) {
				result.push(`hue-rotate(${filter.hueRotate * 360 / 100}deg)`)
			}

			parent.style.filter = result.join(' ')
		} else {
			parent.style.filter = 'none';
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
          const node = this._backgroundNodes[i];
     
          const background = style.background;
          if (node) {
            if (background && background.colors) {
              let value = "(" + background.direction + "deg";
              const sortedColors = background.colors.slice()
              sortedColors.sort((a, b) => {
                return a.p - b.p
              })
              for (let i = 0; i < sortedColors.length; i++) {
                const color = sortedColors[i];
                value += "," + color.c + " " + color.p + "% ";
              }
              value + ");";
              node.style.background = "linear-gradient" + value;
              node.style.background = "-webkit-linear-gradient" + value;
            } else {
              node.style.background = style.background;
            }
          } else {
            console.warn("UIWidget._set_background() > No node ", this.model);
          }
        }
      }
    },

    _set_background_gradient(node, background) {
        if (background && background.colors) {
          let value = "(" + background.direction + "deg";
          const sortedColors = background.colors.slice()
          sortedColors.sort((a, b) => {
            return a.p - b.p
          })
          for (let i = 0; i < sortedColors.length; i++) {
            const color = sortedColors[i];
            value += "," + color.c + " " + color.p + "% ";
          }
          value + ");";
          node.style.backgroundImage = "linear-gradient" + value;
          node.style.backgroundImage = "-webkit-linear-gradient" + value;
        } else {
          node.style.background = background;
        }
    },


    _set_backgroundImageRotation (parent, style) {
      if (this._iconNodes) {
        this._iconNodes.forEach(node => {
          if (node) {
            node.style.transform = `rotate(${style.backgroundImageRotation}deg)`
          }
        })
        css.add(parent, 'MatchWidgetTypeIconRotated')
      }
      /**
       * Here is still a bug, because this we sets the background image on the parent.
       * This does not matter much, because, animation look anohow shit when not cropped.
       */
      if (this._imageNodes) {
        this._imageNodes.forEach(node => {
          if (node) {
            node.style.transform = `rotate(${style.backgroundImageRotation}deg)`
          }
        })
      }
    },


    /**
     * background image
     */
    _set_backgroundImage: function(parent, style, model) {
      /**
       * With the new update of the RemderFacory, this should be set in the image node...
       */
      const img = style.backgroundImage;
      if (img) {
        if (this._imageNodes) {
            this._imageNodes.forEach(node => {
              if (node) {
                this._set_backgroundImageInNode(node, style, model)
              }
            })
        } else {
          //console.warn('UIWidget._set_backgroundImage() > no image nodes passed...')
          this._set_backgroundImageInNode(parent, style, model)
        }
      }
    },

    _set_backgroundImageInNode (parent, style) {
      var img = style.backgroundImage;
      css.add(parent, "MatcScreenImage");
      if (img) {
        if (img.w > img.h) {
          css.add(parent, "MatcScreenImageHorizontal");
        } else {
          css.add(parent, "MatcScreenImageVertical");
        }
        if (this.hash) {
          parent.style.backgroundImage = "url(/rest/images/" + this.hash + "/" + img.url + ")";
        } else if (this.jwtToken) {
          parent.style.backgroundImage = "url(/rest/images/" + img.url + "?token=" + this.jwtToken + ")";
        } else {
          this.logger.warn('_set_backgroundImageInNode', 'error > no token or hash')
          if (!this.isPublic) {
            this.logger.sendError(new Error('No hash for image'))
          }
          const url = "url(/rest/images/" + img.url + ")";
          parent.style.backgroundImage = url;
        }

        if (style.backgroundSize) {
          parent.style.backgroundSize = style.backgroundSize + "%";
        } else {
          parent.style.backgroundSize = "100%"; // 100%
        }

        if (style.backgroundPosition && this.model) {
          const pos = style.backgroundPosition;
          parent.style.backgroundPosition = Math.round(pos.left * this.model.w) + "px " + Math.round(pos.top * this.model.h) + "px";
          parent.style.webkitBackgroundPosition = Math.round(pos.left * this.model.w) + "px " + Math.round(pos.top * this.model.h) + "px";
        } else {
          parent.style.backgroundPosition = "0 0"; // 100%
        }

        parent.style.backgroundRepeat = "no-repeat";
      } else {
        parent.style.backgroundImage = "none";
      }

    },

    _set_verticalAlign: function(parent, style) {
      if (this._labelNodes) {
        for (var i = 0; i < this._labelNodes.length; i++) {
          var label = this._labelNodes[i];
          // reset class.. this is a little hacky! We should not do this too often!
          label.className = "MatcInlineEditable";
          if (style.textAlign) {
            css.add(label, "MatcInlineEditVAlign-" + style.verticalAlign + "-" + style.textAlign);
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
  mounted() {
    if (this.qWidget) {
      this.render(this.qWidget, this.qWidget.style, this.qQcaleX, this.qQcaleX, false);
    }
    this.logger = new Logger('UIWidget')
  }
};
</script>