<template>
  <div class="MatcWidgetTypeDropDown">
    <div data-dojo-attach-point="button" class="MatcWidgetTypeDropDownCntr">
      <div class="MatcWidgetTypeDropDownLabelCntr" data-dojo-attach-point="labelCntr">
        <div data-dojo-attach-point="label" class="MatcWidgetTypeDropDownLabel">F</div>
      </div>
      <div data-dojo-attach-point="caretCnr" class="MatcWidgetTypeDropDownCarretCntr">
        <span data-dojo-attach-point="caret" class="MatcWidgetTypeDropDownCarret"></span>
      </div>
    </div>
    <div class="MatcWidgetTypeDropDownPopUp" role="menu" data-dojo-attach-point="popup"></div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import topic from "dojo/topic";
import win from "dojo/_base/win";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "DropDown",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: false,
      hoverAnimationDuration: 0
    };
  },
  components: {},
  methods: {
    postCreate: function() {
      this._borderNodes = [this.button, this.popup];
      this._shadowNodes = [this.button];
      this._backgroundNodes = [this.button];
      this._paddingNodes = [this.button];
      this.cleanUpTempListener();
      this._isOpen = false;
    },

    wireEvents: function() {
      this.own(
        this.addClickListener(this.domNode, lang.hitch(this, "onOpenPopup"))
      );
      this.own(on(this.domNode, touch.over, lang.hitch(this, "onDomMouseOver")));
      this.own(on(this.domNode, touch.out, lang.hitch(this, "onDomMouseOut")));
      this.wired = true;
    },

    onDomMouseOver: function(e) {
      if (this.lastValidation) {
        if (this.model.hover && !this._isOpen) {
          this.emitAnimation(
            this.model.id,
            this.hoverAnimationDuration,
            this.model.hover
          );
        }
      }

      this.emitMouseOver(e);
    },

    onDomMouseOut: function(e) {
      if (this.lastValidation) {
        if (this.model.hover && !this._isOpen) {
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
      }
      this.emitMouseOut(e);
    },

    resize: function(box) {
      var s = 4;
      if (this.style.fontSize) {
        s = Math.floor(this.style.fontSize / 3);
      }

      if (this.caret && !this.model.props.icon) {
        var w = this._getBorderWidth(s) + "px";
        this.caret.style.borderLeftWidth = w;
        this.caret.style.borderRightWidth = w;
        this.caret.style.borderTopWidth = w;
      }

      if (this.icon) {
        this.icon.style.fontSize = box.h + "px";
        this.button.style.padding = "0px";
      }

      /**
       * Make sure carent
       */
      if (this.caretCnr) {
        // var border = this._getBorderWidth(s);
        var width = this._getBorderWidth(40);
        this.caretCnr.style.width = width + "px";
      }
    },

    render: function(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      if (model.props.selected) {
        this.setValue(model.props.selected, true);
      } else if (model.props.options && model.props.options.length > 0) {
        this.setValue(model.props.options[0], true);
      } else {
        this.setValue("- No Options - ", true);
      }

      if (model.props.popupPosition) {
        css.add(this.domNode, model.props.popupPosition);
      }

      this.renderIcon(model);

      if (this.model.props.caretBorderColor) {
        this.caret.style.color = style.background;
        this.caretCnr.style.background = style.borderRightColor;
      }

      this.setStyle(style, model);

      this.resize(model);

      if (style.iconSize && this.caret) {
        var s = Math.max(1, this.getZoomed(style.iconSize, this._scaleY));
        this.caret.style.fontSize = s + "px";
      }
    },

    renderIcon: function(model) {
      if (model.props.icon) {
        if (model.props.hidetext) {
          this.labelCntr.innerHTML = "";

          this.icon = document.createElement("span");
          css.add(this.icon, "MatcWidgetTypeDropDownIcon " + model.props.icon);
          this.labelCntr.appendChild(this.icon);

          css.add(this.domNode, "MatcWidgetTypeDropDownWithIcon MatcWidgetTypeDropDownNoText");
          this.button.style.padding = "0px";
          this.button.style.borderRadius = "0px";

          this.popup.style.width = this._getBorderWidth(200) + "px";

          if (this.caretCnr) {
            this.button.removeChild(this.caretCnr);
            delete this.caretCnr;
            delete this.caret;
            delete this.label;
          }
        } else {
          css.remove(this.caret, "MatcWidgetTypeDropDownCarret");
          this.caret.style.border = "none";
          css.add(this.caret, model.props.icon + " MatcWidgetTypeDropDownCarretIcon");
        }
      }
    },

    onOpenPopup: function(e) {
      this.stopEvent(e);
      /**
       * We will collect the hover events in the copmposite events
       * and only flush when we close the popup
       */
      //this.emitNoTransitionStateChange("open", "", e);
      this.emitOpenPopup();

      this.renderPopup();
      this.initCompositeState(this.getStateOptions(), e);
      return false;
    },

    flushOpen: function() {
      this.emitCompositeState("openWithHover", this.getStateOptions());
    },

    onSimulatorEvent: function(type, screenID, widgetID) {
      if (
        type != "ScreenScroll" &&
        type != "Animation" &&
        type != "ScreenGesture" &&
        widgetID != this.model.id
      ) {
        this.cleanUp();
        this.emitNoTransitionStateChange("close", "");
      }
    },

    onSelect: function(value, e) {
      this.stopEvent(e);

      this.emitDataBinding(value);
      this.setValue(value);
      this.cleanUp();

      var event = {
        type: "select",
        value: value,
        runTransition: true,
        noheat: true,
        e: e
      };
      this.emit("stateChange", event);
    },

    onClose: function(e) {
      this.stopEvent(e);
      this.cleanUp();
      this.emitNoTransitionStateChange("close", "", e);
    },

    renderPopup: function() {
      if (!this._isOpen) {
        var db = new DomBuilder();
        this.optionNodes = [];
        var options = this.model.props.options;
        var style = this.style;
        for (var i = 0; i < options.length; i++) {
          var option = options[i];
          var node = db
            .div("MatcWidgetTypeDropDownOption", option)
            .build(this.popup);

          node.style.paddingTop = this._getBorderWidth(this.style["paddingTop"]) + "px";
          node.style.paddingLeft = this._getBorderWidth(this.style["paddingLeft"]) + "px";
          node.style.paddingRight = this._getBorderWidth(this.style["paddingRight"]) + "px";
          node.style.paddingBottom = this._getBorderWidth(this.style["paddingBottom"]) + "px";

          if (this.value == option) {
            if (style.selectedOptionColor) {
              node.style.color = style.selectedOptionColor;
            }
            if (style.selectedOptionBackground) {
              node.style.background = style.selectedOptionBackground;
            }
          }

          if (this.wired) {
            this.tempOwn(on(node, touch.press, lang.hitch(this, "onSelect", option)));
            this.tempOwn(on(node, touch.over, lang.hitch(this, "onMouseOverOption", i)));
          }
          this.optionNodes.push(node);
        }

        css.add(this.domNode, "MatcWidgetTypeDropDownOpen");
        if (this.domNode.parentNode) {
          css.add(this.domNode.parentNode, "MatcWidgetTypeDropDownFront");
        }

        if (this.wired) {
          this.tempOwn(on(win.body(), touch.over, lang.hitch(this, "onMouseOutOption")));
          this.tempOwn(on(win.body(), touch.press, lang.hitch(this, "onClose")));
          this.tempOwn(topic.subscribe("MatcSimulatorEvent", lang.hitch(this, "onSimulatorEvent")));
        }

        if (this.model.focus) {
          this.emitAnimation(this.model.id, 0, this.model.focus);
        }

        this._isOpen = true;
      }
    },

    onMouseOverOption: function(hover, e) {
      this.stopEvent(e);
      if (this.hover != hover) {
        this.setHoverOption(hover);
        this.addCompositeSubState(this.getStateOptions());
      }
    },

    onMouseOutOption: function() {
      if (this.selected != -1) {
        this.setHoverOption(-1);
        this.addCompositeSubState(this.getStateOptions());
      }
    },

    setHoverOption: function(hover) {
      if (this.optionNodes) {
        if (this.hover != hover) {
          var style = this.style;
          var options = this.model.props.options;
          for (var i = 0; i < this.optionNodes.length; i++) {
            let node = this.optionNodes[i];
            var option = options[i];
            if (this.value == option && hover < 0) {
              if (style.selectedOptionColor) {
                node.style.color = style.selectedOptionColor;
              }
              if (style.selectedOptionBackground) {
                node.style.background = style.selectedOptionBackground;
              }
            } else {
              node.style.color = style.popupColor;
              node.style.background = style.popupBackground;
            }
          }
          let node = this.optionNodes[hover];
          if (node) {
            if (style.selectedOptionColor) {
              node.style.color = style.selectedOptionColor;
            }
            if (style.selectedOptionBackground) {
              node.style.background = style.selectedOptionBackground;
            }
          }
        }
        this.hover = hover;
      }
    },

    cleanUp: function() {
      this.cleanUpTempListener();

      this.cleanUpPopup();

      if (this.model.focus && this.lastValidation) {
        this.emitAnimation(this.model.id, 0, this.model.style);
      }
    },

    cleanUpPopup: function() {
      if (this._isOpen) {
        /**
         * After some changes in the canvas this can somehow fail
         */
        if (this.popup) {
          this.popup.innerHTML = "";
        } else {
          console.warn(
            "DropDown.cleanUp() > Called in wrong state. Popup is null"
          );
        }

        delete this.optionNodes;

        if (this.domNode) {
          css.remove(this.domNode, "MatcWidgetTypeDropDownOpen");
        }

        this.hover = -1;
        this._isOpen = false;

        this.flushOpen();
      }
    },

    getValue: function() {
      return this.value;
    },

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue: function(v) {
      var options = this.model.props.options;
      if (options) {
        if (isNaN(v)) {
          var i = options.indexOf(v);
          if (i >= 0 && i < options.length) {
            v = options[i];
            this.setValue(v);
          }
        } else {
          if (v >= 0 && v < options.length) {
            v = options[v];
            this.setValue(v);
          }
        }
      }
    },

    setValue: function(value, ignoreValidation) {
      this.value = value;
      if (!ignoreValidation) {
        this.validate(this.value, true);
      }
      if (this.label) {
        this.setTextContent(this.label, this.value);
      }
    },

    getStateOptions: function() {
      return {
        hover: this.hover
      };
    },

    getState: function() {
      return {
        type: "select",
        value: this.value
      };
    },

    setState: function(state, t) {
      if (state) {
        var type = state.type;

        switch (type) {
          case "select":
            this.setValue(state.value);
            /**
             * And set selected??
             */
            setTimeout(lang.hitch(this, "cleanUp"), 200);
            break;
          case "close":
            this.cleanUp();
            break;

          case "open":
            this.renderPopup();
            break;

          case "openWithHover":
            this.renderPopup();

            if (state.children) {
              var substate = this.getLastSubState(state, t);
              if (substate) {
                var options = substate.value;
                this.setHoverOption(options.hover);
              }
            }
            break;

          default:
            this.cleanUp();
            break;
        }
      } else {
        this.cleanUp();
      }
    },

    _validateValue: function(value) {
      var validation = this.model.props.validation;
      if (validation) {
        if (validation.required && value === this.model.props.options[0]) {
          return false;
        }
      }
      return true;
    },

    isValid: function(showError) {
      return this.validate(this.value, showError);
    },

    _set_caretBackground: function(parent, style) {
      if (this.caretCnr) {
        this.caretCnr.style.background = style.caretBackground;
      }
    },

    _set_caretColor: function(parent, style) {
      if (this.caret) {
        this.caret.style.color = style.caretColor;
      }
      if (this.icon) {
        this.icon.style.color = style.caretColor;
      }
    },

    _set_popupShadow: function(parent, style) {
      this._setShadow(this.popup, style.popupShadow);
    },

    _set_popupBorderColor: function(parent, style) {
      this.popup.style.borderColor = style.popupBorderColor;
    },

    _set_popupBorderWidth: function(parent, style) {
      if (style.popupBorderWidth) {
        var w = Math.max(
          1,
          this.getZoomed(style.popupBorderWidth, this._scaleY)
        );
        this.popup.style.borderWidth = w + "px";
      } else {
        this.popup.style.borderWidth = "0px";
      }
    },

    _set_popupBackground: function(parent, style) {
      this.popup.style.background = style.popupBackground;
    },

    _set_popupColor: function(parent, style) {
      this.popup.style.color = style.popupColor;
    },

    beforeDestroy: function() {
      this.cleanUp();
    }
  },
  mounted() {}
};
</script>