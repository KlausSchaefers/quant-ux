<template>
  <div class="MatcWidgetTypeTextBox"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import topic from "dojo/topic";
import Color from "dojo/_base/Color";
import Logger from "common/Logger";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "TextBox",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: null,
      mode: "edit",
      hasFocus: false
    };
  },
  components: {},
  methods: {
    postCreate () {
      this.log = new Logger("TextBox");
      if (this.mode == "simulator") {
        this.input = document.createElement("input");
        this.input.type = "text";
      } else {
        this.input = document.createElement("div");
        css.add(this.input, "MatcWidgetTypeTextBoxPreview");
      }
      css.add(this.input, "MatcWidgetTypeTextBoxInput");
      this.domNode.appendChild(this.input);
      this._borderNodes = [this.input];
      this._backgroundNodes = [this.input];
      this._paddingNodes = [this.input];
      this._shadowNodes = [this.input];
    },

    getAnimationNode () {
      return this.domNode.parentNode;
    },

    onSimulatorEvent (type, screenID, widgetID) {
      this.log.log(5, "onSimulatorEvent", this.model.id, type, "@" , screenID, widgetID)
      if (type != "ScreenScroll" && type != "Animation" && type != "ScreenGesture" && widgetID != this.model.id) {
        if (this.hasFocus) {
          this.input.blur();
        }
      }
    },

    wireEvents () {
      if (!this.wired) {
        this.own(this.addClickListener(this.domNode, lang.hitch(this, "onInputClick")));
        this.own(on(this.input, "focus", lang.hitch(this, "onFocus")));
        if (this.mode == "simulator") {
          this.own(on(this.input, "blur", lang.hitch(this, "onBlur")));
          this.own(on(this.input, "change", lang.hitch(this, "onChange")));
          this.own(topic.subscribe("MatcSimulatorEvent",lang.hitch(this, "onSimulatorEvent")));
        }
      }
      this.afterWiredEvents();
      this.wired = true;
      this.setAutoFocus(this.input);
      this.wireHover()
    },

    onDomMouseOver (e) {
      if (this.hasFocus || this.lastValidation === false) {
        return
      }
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
      if (this.hasFocus || this.lastValidation === false) {
        return
      }
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
     * For child classes to hook in
     */
    afterWiredEvents () {},

    getLabelNode () {
      return this.input;
    },

    onInputClick (e) {
      this.log.log(0, "onInputClick", "enter");
      this.stopPropagation(e);
      this.emitClick(e);
    },

    onFocus (e) {
      this.log.log(0, "onFocus", "enter >" + this.lastValidation);
      this.stopPropagation(e);
      this.hasFocus = true;
      this.keyUpListener = on(this.input,"keyup", lang.hitch(this, "onKeyUp"));
      this.keyDownListener = on(this.input,"keydown", lang.hitch(this, "onKeyDown"));
      if (this.model.focus && this.lastValidation) {
        console.debug("onFocus", this.model.focus.color)
        this.emitAnimation(this.model.id, 200, this.model.focus);
      }

      this.emit("focus", {});
      this.afterFocus();
    },

    afterFocus () {
      this.initCompositeState(this._readValue());
    },

    onKeyUp () {
      this.log.log(3, "onKeyUp", "enter > ");
      this.addCompositeSubState(this._readValue());
      this.value = this._readValue();
      this.emit("keyUp", this._readValue());
    },

    onKeyDown(e) {
      this.log.log(3, "onKeyDown", "enter > ");
      const key = e.which || e.keyCode;
      if (13 == key) {
        this.onEnterPressed();
      }
    },

    onEnterPressed () {
      this.input.blur();
      var gesture = {
        type: "KeyboardEnter"
      };
      this.emit("gesture", gesture);
    },

    onChange () {
      // force blur to flush out data binding before
      // any transitions are fired
      this.onBlur()
      const gesture = {
        type: "InputChange"
      };
      this.emit("gesture", gesture);
    }, 


    onBlur (e) {
      this.log.log(1, "onBlur", "enter");
      this.stopPropagation(e);

      const v = this._readValue();

      this.emitCompositeState("text", v);
      this.emitDataBinding(v);

      const valid = this.validate(this._readValue(), true);
      if (valid) {
        if (this.model.focus) {
          this.emitAnimation(this.model.id, 0, this.style);
        }
      }
      this.value = this._readValue();
      this.cleanUp();
      this.hasFocus = false;
      this.emit("blur", {});
    },

    getStateOptions () {
      return {
        valid: this.lastValidation,
        focus: this.hasFocus
      };
    },

    getState () {
      return {
        type: "text",
        value: this._readValue(),
        options: {
          valid: this.lastValidation,
          focus: this.hasFocus
        }
      };
    },

    /**
     * Subclasses my overwrite this...
     */
    _readValue () {
      if (this.mode == "simulator") {
        return this.input.value;
      } else {
        return this.input.innerHTML;
      }
    },

    setState (state, t) {
      if (state && state.type == "text") {
        /**
         * If we have children its an animation...
         */
        if (state.children) {
          let substate = this.getLastSubState(state, t);
          if (substate) {
            let value = substate.value;
            this.setValue(value);
          }
        } else {
          this.setValue(state.value);
        }
      }
      if (state && state.type == "typing") {
        /**
         * DEPRECTAED:
         */
        let substate = this.getLastSubState(state, t);
        if (substate) {
          let value = substate.value;
          this.setValue(value);
        }
      }

      this.afterSetState(state, t);
    },

    /**
     * child classes can overwrite
     */
    afterSetState () {},

    cleanUp () {
      if (this.keyUpListener) {
        this.keyUpListener.remove();
      }
      delete this.keyUpListener;
      if (this.keyDownListener) {
        this.keyDownListener.remove();
      }
      delete this.keyDownListener;
    },

    render (model, style, scaleX, scaleY) {

      this.model = model;
      this.style = style;
      this._validStyle = lang.clone(style);
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      if (model.props.options) {
        this.hasTypeahead = true;
        this.hints = model.props.options;
      } else {
        this.hints = [];
      }

      if (model.props.stringCase) {
        css.add(this.domNode, "MatcWidgetTypeTextBox" + model.props.stringCase);
      } else {
        css.remove(this.domNode, "MatcWidgetTypeTextBoxUpperCase");
        css.remove(this.domNode, "MatcWidgetTypeTextBoxLowerCase");
      }

      this.initLabel(model)

      if (model.props.validation && this.mode == "simulator") {
        const validation = model.props.validation;
        let type = validation.type;
        if (type == "custom") {
          type = validation.subtype;
        }
        switch (type) {
          case "int":
            this.input.type = "number";
            break;
          case "double":
            this.input.type = "number";
            break;
          case "email":
            this.input.type = "email";
            break;
          case "phone":
            this.input.type = "tel";
            break;
          default:
            break;
        }
      }

      /**
       * WbeKit cannot show the placeholder in the right color.. fucker. So
       * we have to set a pseudo class...
       */
      if (this.mode == "simulator") {
        /**
         * Create a unique class for this run of the simulator to avoid overwriting or some other
         * stuff
         *
         */
        const selector = model.id + "" + new Date().getTime();

        const placeholderStyle = {
          color: this.getPlaceHolderColor(style)
        };

        this.addCssClass(selector + "::-webkit-input-placeholder", placeholderStyle);

        /**
         * Add the pseudo class
         */
        css.add(this.input, selector);
      }

      this.beforeSetStyle(style, model);

      this.setStyle(style, model);
      this.onTextBoxRendered(model)
    },

    initLabel (model) {
      if (model.props.label) {
        if (model.props.placeholder) {
          this.setPlaceholder(model.props.label);
        } else {
          this.setValue(model.props.label, true);
        }
      }
    },

    onTextBoxRendered () {

    },

    /**
     * Child classes can do something in here
     */
    beforeSetStyle () {},

    getPlaceHolderColor (style) {
      const c = new Color(style.color);
      c.a = 0.5;
      return c.toString();
    },

    addCssClass (selector, styles) {
      if (!this._styleNode) {
        this._styleNode = [];
      }
      const style = document.createElement("style");
      style.type = "text/css";
      style.setAttribute("matc", "true");
      let s = "." + selector + "{";
      for (let key in styles) {
        s += key + " :" + styles[key] + ";";
      }
      s += "}";
      style.innerHTML = s;
      document.getElementsByTagName("head")[0].appendChild(style);
      this._styleNode.push(style);
    },

    getValue () {
      return this.value;
    },

    unsetPlaceHolder () {
      css.remove(this.input, "MatcWidgetTypeTextBoxInputPlaceholder");
      this.input.style.color = this.style.color;
    },

    setPlaceholder (msg) {
      if (this.mode == "simulator") {
        this.input.placeholder = msg;
      } else {
        css.add(this.input, "MatcWidgetTypeTextBoxInputPlaceholder");
        this.input.innerHTML = msg;
        this.input.style.color = this.getPlaceHolderColor(this.style);
      }
    },

    setValue (value, ignoreValidation) {
      this.unsetPlaceHolder()
      if (value != null && value != undefined && this.value != value) {
        this.value = value;
        if (this.mode == "simulator") {
          this.input.value = value;
        } else {
          this.input.innerHTML = value;
          if (this.model.props.placeholder) {
            if (this.model.props.label != value) {
              this.input.style.color = this.style.color;
            } else {
              this.input.style.color = this.getPlaceHolderColor(this.style);
            }
          }
        }

        if (!ignoreValidation) {
          this.validate(this.value, true);
        }
      }
    },

    _validateValue (value) {
      const validation = this.model.props.validation;
      if (validation) {
        let type = validation.type;
        if (type == "custom") {
          type = validation.subtype;
        }

        /**
         * Now come the rules
         */
        if (validation.required && value == "") {
          return false;
        }

        if (!value) {
          return true;
        }

        if (type == "int") {
          let re = /^-?[0-9]+$/;
          if (re.test(value)) {
            let inRange = true;
            if (validation.min != null && validation.min != undefined) {
              inRange = inRange && value >= validation.min;
            }

            if (validation.max != null && validation.max != undefined) {
              inRange = inRange && value <= validation.max;
            }

            return inRange;
          } else {
            return false;
          }
        }

        if (type == "email") {
          let re = /\S+@\S+\.\S+/;
          return re.test(value);
        }

        if (type == "phone") {
          let re = /^[\+]?([0-9]|[-\s\.])*$/;
          return re.test(value);
        }

        if (type == "date") {
          let re = /^[0-9]{1,2}(\/|-|\.)[0-9]{1,2}(\/|-|\.)[0-9]{2,4}$/;
          return re.test(value);
        }
        if (type == "time") {
          let re = /^[0-9]{2}(\/|-|\.|\:)[0-9]{1,2}$/;
          return re.test(value);
        }

        if (type == "double") {
          var re = /^-?[0-9]+((\.|,)[0-9]+)?$/;
          if (re.test(value)) {
            let inRange = true;
            if (validation.min != null && validation.min != undefined) {
              inRange = inRange && value >= validation.min;
            }

            if (validation.max != null && validation.max != undefined) {
              inRange = inRange && value <= validation.max;
            }

            return inRange;
          } else {
            return false;
          }
        }

        if (type == "string") {
          var operator = validation.operator;

          /**
           * if the value is undefined that is fine for me
           */
          if (value) {
            if (operator == "contains" && validation.text) {
              return value.indexOf(validation.text) >= 0;
            }

            if (operator == "equals" && validation.text) {
              return value == validation.text;
            }

            if (operator == "pattern" && validation.pattern) {
              // eslint-disable-next-line no-undef
              var reg = new Regex(validation.pattern);
              return reg.test(value);
            }

            if (operator == "length") {
              let validString = true;
              if (validation.min != null && validation.min != undefined) {
                validString = validString && value.length >= validation.min;
              }
              if (validation.max != null && validation.max != undefined) {
                validString = validString && value.length <= validation.max;
              }
              return validString;
            }
          }
        }
      }

      return true;
    },

    isValid: function(showError) {
      return this.validate(this._readValue(), showError);
    },

    _setDataBindingValue (v) {
      if (this.isQDate(v)) {
        v = this.convertQDateToString(v);
      }
      this.setValue(v);
    },

  

    beforeDestroy () {
      if (this._compositeState) {
        this.emitCompositeState("text", this.input.value);
      }

      this.cleanUpTempListener();

      try {
        if (this._styleNode) {
          for (var i = 0; i < this._styleNode.length; i++) {
            var node = this._styleNode[i];
            node.parentNode.removeChild(node);
          }
          delete this._styleNode;
        }
      } catch (e) {
        console.warn("TextBox.destroy()", e);
      }

      this.cleanUp();
    }
  },
  mounted() {}
};
</script>