

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
    onKeyPress: function(e) {
      this.log.log(3, "onKeyPress", "enter > ");

      /**
       * Check for key codes and update selection if needed
       */

      if (this.suggestions) {
        var key = e.which || e.keyCode;

        if (40 == key) {
          let selected = Math.min(this.suggestions.length - 1,this.selected + 1);
          this.setSelectedOption(selected);
          this.addCompositeSubState(this.getStateOptions());
          return;
        }

        if (38 == key) {
          var selected = Math.max(-1, this.selected - 1);
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

    setTypeAhead: function(value) {
      var suggestions = this.getSuggestions(value);
      if (suggestions.length > 0) {
        if (value != this.currentTypeAheadValue) {
          this.showTypeAhead(suggestions);
          this.currentTypeAheadValue = value;
        }
      } else {
        this.hideTypeAhead();
      }
    },

    getSuggestions: function(value) {
      value = value.toLowerCase();
      var suggestions = [];
      if (value.length > 2) {
        for (var i = 0; i < this.hints.length; i++) {
          var hint = this.hints[i];
          let h = hint.toLowerCase();
          if (h.indexOf(value) == 0) {
            suggestions.push(hint);
          }
        }
      }
      return suggestions;
    },

    showTypeAhead: function(suggestions) {
      this.renderTypeAhead(suggestions);
    },

    renderTypeAhead: function(suggestions) {
      this.hideTypeAhead();

      var db = new DomBuilder();

      this.popup = db.div("MatcWidgetTypeDropDownPopUp").build();
      this.optionNodes = [];
      this.suggestions = suggestions;

      var length = Math.min(10, suggestions.length);
      for (var i = 0; i < length; i++) {
        var option = suggestions[i];
        var node = db
          .div("MatcWidgetTypeDropDownOption", option)
          .build(this.popup);

        /**
         * Render the options like the entire drop down...
         */
        node.style.paddingTop =
          this._getBorderWidth(this.style["paddingTop"]) + "px";
        node.style.paddingLeft =
          this._getBorderWidth(this.style["paddingLeft"]) + "px";
        node.style.paddingRight =
          this._getBorderWidth(this.style["paddingRight"]) + "px";
        node.style.paddingBottom =
          this._getBorderWidth(this.style["paddingBottom"]) + "px";
        //node.style.height = this.model.h + "px";
        if (this.wired) {
          this.tempOwn(
            on(node, touch.press, lang.hitch(this, "onSelect", option))
          );
          this.tempOwn(
            on(node, touch.over, lang.hitch(this, "onMouseOverOption", i))
          );
        }
        this.optionNodes.push(node);
      }

      css.add(this.domNode, "MatcWidgetTypeDropDownOpen");
      if (this.domNode.parentNode) {
        css.add(this.domNode.parentNode, "MatcWidgetTypeDropDownFront");
      }

      if (this.wired) {
        this.tempOwn(
          on(win.body(), touch.over, lang.hitch(this, "onMouseOutOption"))
        );
        this.tempOwn(
          on(win.body(), touch.press, lang.hitch(this, "hideTypeAhead"))
        );
        this.tempOwn(
          topic.subscribe(
            "MatcSimulatorEvent",
            lang.hitch(this, "onSimulatorEvent")
          )
        );
      }

      this.domNode.appendChild(this.popup);

      this._set_popupShadow(this.popup, this.style, this.model);
      this._set_popupBorderColor(this.popup, this.style, this.model);
      this._set_popupBorderWidth(this.popup, this.style, this.model);
      this._set_popupBackground(this.popup, this.style, this.model);
      this._set_popupColor(this.popup, this.style, this.model);
    },

    onMouseOverOption: function(selected, e) {
      this.stopEvent(e);
      this.setSelectedOption(selected);
      this.addCompositeSubState(this.getStateOptions());
    },

    onMouseOutOption: function() {
      if (this.selected != -1) {
        this.setSelectedOption(-1);
        this.addCompositeSubState(this.getStateOptions());
      }
    },

    setSelectedOption: function(selected) {
      if (this.optionNodes) {
        if (this.selected != selected) {
          var style = this.style;
          for (var i = 0; i < this.optionNodes.length; i++) {
            let node = this.optionNodes[i];
            node.style.color = style.color;
            node.style.background = style.background;
          }
          let node = this.optionNodes[selected];
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

    onSelect: function(value, e) {
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

    hideTypeAhead: function() {
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

    setState: function(state, t) {
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

    getState: function() {
      return {
        type: "text",
        value: this._readValue(),
        options: this.getStateOptions()
      };
    },

    getStateOptions: function() {
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

    cleanUp: function() {
      this.hideTypeAhead();
      if (this.keyListener) {
        this.keyListener.remove();
      }
      delete this.keyListener;
    },

    afterFocus: function() {
      // call getStateOptions()!
      this.initCompositeState(this.getStateOptions());
    },

    /*****************************************************************************************************
     * Helper Methods
     *****************************************************************************************************/

    onSimulatorEvent: function(type, screenID, widgetID) {
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
    },

    _set_popupShadow: function(parent, style) {
      if (style.popupShadow) {
        this._setShadow(this.popup, style.popupShadow);
      }
    },

    _set_popupBorderColor: function(parent, style) {
      if (style.popupBorderColor) {
        this.popup.style.borderColor = style.popupBorderColor;
      } else {
        this.popup.style.borderColor = style.borderBottomColor;
      }
    },

    _set_popupBorderWidth: function(parent, style) {
      var w = Math.max(1,this.getZoomed(style.borderBottomWidth, this._scaleY));
      if (style.popupBorderWidth) {
         w = Math.max(1, this.getZoomed(style.popupBorderWidth, this._scaleY));
      }
      this.popup.style.borderWidth = w + "px";
    },

    _set_popupBackground: function(parent, style) {
      this.popup.style.background = style.background;
    },

    _set_popupColor: function(parent, style) {
      this.popup.style.color = style.color;
    }
  },
  mounted() {}
};
</script>