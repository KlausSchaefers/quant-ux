<template>
  <div class="MatcWidgetTypeTextBox"></div>
</template>
<script>
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import topic from "dojo/topic";
import win from "dojo/_base/win";
import DomBuilder from "common/DomBuilder";
import TextBox from "core/widgets/TextBox";


export default {
  name: "TypeAheadTextBox",
  mixins: [TextBox],
  data: function() {
    return {
      selectedPopupItem: -1
    };
  },
  components: {},
  methods: {
    onTextBoxRendered (model) {
      if (model?.props?.options) {
        this.hints = model?.props?.options
      }
      this.log.log(4, "onTextBoxRendered", "exit > ", this.hints);
    },
    onKeyUp (e) { 
      this.log.log(1, "onKeyUp", "enter > ", e);
    },
    onKeyDown (e) {
      this.log.log(-1, "onKeyPress", "enter > ");

      /**
       * Check for key codes and update selection if needed
       */

      if (this.suggestions) {
        const key = e.which || e.keyCode;

        this.log.log(-1, "onKeyPress", "enter > ", key);

        if (40 == key) {
          const selected = Math.min(this.suggestions.length - 1,this.selected + 1);
          this.setSelectedOption(selected);
          this.addCompositeSubState(this.getStateOptions());
          return;
        }

        if (38 == key) {
          const selected = Math.max(-1, this.selected - 1);
          this.setSelectedOption(selected);
          this.addCompositeSubState(this.getStateOptions());
          return;
        }

        if (13 == key) {
          if (this.selected >= 0 && this.selected < this.suggestions.length) {
            this.onSelect(this.suggestions[this.selected]);
            return;
          }
        }

      }

      this.value = this._readValue();

      this.setTypeAhead(this.value);

      this.addCompositeSubState(this.getStateOptions());
    },

    setTypeAhead (value) {
      const suggestions = this.getSuggestions(value);
      if (suggestions.length > 0) {
        if (value != this.currentTypeAheadValue) {
          this.showTypeAhead(suggestions);
          this.currentTypeAheadValue = value;
        }
      } else {
        this.hideTypeAhead();
      }
    },

    getSuggestions (value) {
      value = value.toLowerCase();
      const suggestions = [];
      if (value.length > 2) {
        for (let i = 0; i < this.hints.length; i++) {
          const hint = this.hints[i];
          const h = hint.toLowerCase();
          if (h.indexOf(value) == 0) {
            suggestions.push(hint);
          }
        }
      }
      return suggestions;
    },

    showTypeAhead (suggestions) {
      this.renderTypeAhead(suggestions);
    },

    renderTypeAhead (suggestions) {
      this.hideTypeAhead();

      const db = new DomBuilder();

      this.popup = db.div("MatcWidgetTypeDropDownPopUp ").build();
      this.optionNodes = [];
      this.suggestions = suggestions;

      const length = Math.min(10, suggestions.length);
      for (let i = 0; i < length; i++) {
        const option = suggestions[i];
        const node = db
          .div("MatcWidgetTypeDropDownOption", option)
          .build(this.popup);

        /**
         * Render the options like the entire drop down...
         */
        node.style.paddingTop = this._getBorderWidth(this.style["paddingTop"]) + "px";
        node.style.paddingLeft = this._getBorderWidth(this.style["paddingLeft"]) + "px";
        node.style.paddingRight = this._getBorderWidth(this.style["paddingRight"]) + "px";
        node.style.paddingBottom = this._getBorderWidth(this.style["paddingBottom"]) + "px";
        //node.style.height = this.model.h + "px";
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
        this.tempOwn(on(win.body(), touch.press, lang.hitch(this, "hideTypeAhead")));
        this.tempOwn(topic.subscribe("MatcSimulatorEvent",lang.hitch(this, "onSimulatorEvent")));
      }

      this.domNode.appendChild(this.popup);

   
      this.set_popupShadow(this.popup, this.style, this.model);
      this.set_popupBorderColor(this.popup, this.style, this.model);
      this.set_popupBorderWidth(this.popup, this.style, this.model);
      this.set_popupBackground(this.popup, this.style, this.model);
      this.set_popupColor(this.popup, this.style, this.model);
      this.set_popupMargin(this.popup, this.style, this.model);
    },

    set_popupMargin (parent, style, model) {
      if (model?.props?.hideUpperBorder) {
        
        if (model.props.popupPosition === 'MatcWidgetTypeDropDownPopUber') {
          const borderTopWidth = this._getBorderWidth(style.borderTopWidth) + 1
          parent.style.bottom = `calc(100% - ${borderTopWidth}px)`
          parent.style.borderBottomWidth = '0px'
          parent.style.borderBottomRightRadius = '0px'
          parent.style.borderBottomLeftRadius = '0px'
        } else {
          const borderBottomWidth = this._getBorderWidth(style.borderBottomWidth) + 1
          parent.style.top = `calc(100% - ${borderBottomWidth}px)`
          parent.style.borderTopWidth = '0px'
          parent.style.borderTopRightRadius = '0px'
          parent.style.borderTopLeftRadius = '0px'
        }
      }
    },


    set_popupShadow (parent, style) {
      if (style.popupShadow) {
        this._setShadow(this.popup, style.popupShadow);
      }
    },

    set_popupBorderColor (parent, style) {
      if (style.popupBorderColor) {
        this.popup.style.borderColor = style.popupBorderColor;
      } else {
        this.popup.style.borderColor = style.borderBottomColor;
      }
    },

    set_popupBorderWidth (parent, style) {
      var w = Math.max(1,this.getZoomed(style.borderBottomWidth, this._scaleY));
      if (style.popupBorderWidth) {
         w = Math.max(1, this.getZoomed(style.popupBorderWidth, this._scaleY));
      }
      this.popup.style.borderWidth = w + "px";
    },

    set_popupBackground (parent, style) {
      if (style.popupBackground) {
        this.popup.style.background = style.popupBackground;
      } else {
        this.popup.style.background = style.background;
      }
  
    },

    set_popupColor (parent, style) {
      this.popup.style.color = style.color;
    },

    onMouseOverOption (selected, e) {
      this.stopEvent(e);
      this.setSelectedOption(selected);
      this.addCompositeSubState(this.getStateOptions());
    },

    onMouseOutOption () {
      if (this.selected != -1) {
        this.setSelectedOption(-1);
        this.addCompositeSubState(this.getStateOptions());
      }
    },

    setSelectedOption (selected) {
      if (this.optionNodes) {
        if (this.selected != selected) {
          const style = this.style;
          for (let i = 0; i < this.optionNodes.length; i++) {
            const node = this.optionNodes[i];
            node.style.color = style.color;
            if (style.popupBackground) {
              node.style.background = style.popupBackground;
            } else {
              node.style.background = style.background;
            }
        
          }
          const node = this.optionNodes[selected];
          if (node) {
            if (style.selectedOptionColor) {
              node.style.color = style.selectedOptionColor;
            }
            if (style.selectedOptionBackground) {
              node.style.background = style.selectedOptionBackground;
            }
          }
        }
        this.selected = selected;
      }
    },

    onSelect (value, e) {
      this.stopEvent(e);
      this.hideTypeAhead();
      this.cleanUp();
      this.input.value = value;

      /**
       * Make sure we have a close event!
       */
      this.addCompositeSubState(this.getStateOptions());

      /**
       * it would be cool if we could add the mouse event here!
       */
      this.input.blur();
    },

    hideTypeAhead () {
      if (this.popup) {
        this.domNode.removeChild(this.popup);
        delete this.popup;
        this.cleanUpTempListener();
        delete this.optionNodes;
        delete this.currentTypeAheadValue;
      }
      this.selected = -1;
    },

    /*****************************************************************************************************
     * Overwrites
     *****************************************************************************************************/

    setState (state, t) {
      if (state && state.type == "text") {
        /**
         * If we have children its an animation...
         */
        if (state.children) {
          var substate = this.getLastSubState(state, t);
          if (substate) {
            var options = substate.value;
            this.setValue(options.txt);
            if (options.visible) {
              this.setTypeAhead(options.txt);
              this.setSelectedOption(options.selected);
            } else {
              this.hideTypeAhead();
            }
          }
        } else {
          this.hideTypeAhead();
          this.setValue(state.value);
        }
      } else {
        this.cleanUp();
      }
    },

    getState () {
      return {
        type: "text",
        value: this._readValue(),
        options: this.getStateOptions()
      };
    },

    getStateOptions () {
      var txt = this._readValue();
      var status = {
        txt: txt,
        selected: this.selected,
        visible: this.popup != null && this.popup != undefined,
        valid: this.lastValidation,
        focus: this.hasFocus
      };
      return status;
    },

    cleanUp () {
      this.hideTypeAhead();
      if (this.keyListener) {
        this.keyListener.remove();
      }
      delete this.keyListener;
    },

    afterFocus () {
      // call getStateOptions()!
      this.initCompositeState(this.getStateOptions());
    },

    /*****************************************************************************************************
     * Helper Methods
     *****************************************************************************************************/

    onSimulatorEvent (type, screenID, widgetID) {
      if (
        type != "ScreenScroll" &&
        type != "Animation" &&
        widgetID != this.model.id
      ) {
        if (this.popup) {
          this.emitNoTransitionStateChange("close", "");
          this.cleanUp();
        }
        if (this.hasFocus) {
          this.input.blur();
        }
      }
    }


  },
  mounted() {}
};
</script>