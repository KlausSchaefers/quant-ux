<template>
  <div class="MatcWidgetTypeTextBox MatcWidgetTypeTextArea"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import Logger from "common/Logger";
import TextBox from "core/widgets/TextBox";

export default {
  name: "Password",
  mixins: [TextBox, DojoWidget],
  data: function() {
    return {
      value: null,
      mode: "edit",
      passwordHidden: true
    };
  },
  components: {},
  methods: {
    postCreate: function() {
      this.log = new Logger("Password");

      if (this.mode == "simulator") {
        this.input = document.createElement("input");
        this.input.type = "password";
        this.input.autocomplete = "off";
      } else {
        this.input = document.createElement("div");
        css.add(this.input, "MatcWidgetTypeTextBoxPreview");
      }
      css.add(this.input, "MatcWidgetTypeTextBoxInput");

      var formElement = document.createElement("form");
      formElement.appendChild(this.input);
      formElement.autocomplete = "off";
      css.add(formElement, "MatcWidgetTypeTextBoxInputForm");
      this.domNode.appendChild(formElement);

      this._borderNodes = [this.input];
      this._backgroundNodes = [this.input];
      this._paddingNodes = [this.input];
      this._shadowNodes = [this.input];
    },

    getLabelNode: function() {
      return null;
    },

    afterWiredEvents: function() {
      if (this.hideLabel) {
        this.tempOwn(
          on(
            this.hideLabel,
            touch.press,
            lang.hitch(this, "togglePasswordHiddden")
          )
        );
      }
      this.setAutoFocus(this.input);
    },

    /**
     * Child classes can do something in here
     */
    beforeSetStyle: function(style, model) {
      if (model.props.cleartextVisible) {
        this.passwordHidden = !model.props.cleartextVisible;
      } else {
        this.passwordHidden = true;
      }

      if (model.props.cleartext) {
        if (!this.hideLabel) {
          this.hideLabel = document.createElement("span");
          css.add(this.hideLabel, "MatcWidgetTypePasswordClearTextLabel");
          this.domNode.appendChild(this.hideLabel);
        }
        this.setPasswordHiddenLabel();
      } else {
        if (this.hideLabel) {
          this.domNode.removeChild(this.hideLabel);
        }
      }
    },

    setPasswordHiddenLabel: function() {
      if (this.hideLabel) {
        if (this.passwordHidden) {
          this.hideLabel.innerHTML = this.model.props.cleartextShowLabel;
        } else {
          this.hideLabel.innerHTML = this.model.props.cleartextHideLabel;
        }
      }
      if (this.passwordHidden) {
        this.input.type = "password";
      } else {
        this.input.type = "text";
      }
    },

    togglePasswordHiddden: function(e) {
      this.log.log(
        0,
        "togglePasswordHiddden",
        "enter > focus: " + this.hasFocus + " > hidden: " + this.passwordHidden
      );

      //this.stopPropagation(e);
      /**
       * Flush already, because otherwise the new passwordHidden value
       * will be flushed...
       */
      this.emitCompositeState("text", this._readValue());

      this.passwordHidden = !this.passwordHidden;
      this.setPasswordHiddenLabel();

      /**
       * pass event to create WidgeClick
       */
      this.emitNoTransitionStateChange("hidden", this.passwordHidden, e);

      /**
       * Make sure the input is blured.
       */
      this.input.blur();
    },

    setCursor: function(el, st, end) {
      if (el.setSelectionRange) {
        el.focus();
        el.setSelectionRange(st, end);
      } else {
        if (el.createTextRange) {
          let range = el.createTextRange();
          range.collapse(true);
          range.moveEnd("character", end);
          range.moveStart("character", st);
          range.select();
        }
      }
    },

    _set_cleartextColor: function(parent, style) {
      if (this.hideLabel) {
        this.hideLabel.style.color = style.cleartextColor;
      }
    },

    /**
     * we do not want to store any passwords...
     */
    _readValue: function() {
      return this.input.value;
    },

    setValue: function(value) {
      if (value != null && value != undefined && this.value != value) {
        this.value = value;
        css.remove(this.input, "MatcWidgetTypeTextBoxInputPlaceholder");
        this.input.value = value;
      }
    },

    getStateOptions: function() {
      return {
        hidden: this.passwordHidden,
        valid: this.lastValidation,
        focus: this.hasFocus
      };
    },

    getState: function() {
      return {
        type: "text",
        value: this._readValue(),
        options: {
          hidden: this.passwordHidden,
          valid: this.lastValidation,
          focus: this.hasFocus
        }
      };
    },

    /**
     * called after setState to handle option like focus
     * and or visibility
     */
    afterSetState: function(state) {
      if (state.options && (state.options.hidden === false || state.options.hidden === true)) {
        this.passwordHidden = state.options.hidden;
        this.setPasswordHiddenLabel();
      }
    }
  },
  mounted() {}
};
</script>