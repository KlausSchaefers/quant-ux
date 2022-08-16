
<template>
  <div class="MatcWidgetTypeToggleButton">
      <div data-dojo-attach-point="labelNode" class="MatcInlineEditable"></div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "ToggleButton",
  mixins: [DojoWidget, UIWidget],
  data: function() {
    return {
      value: false
    };
  },
  components: {},
  methods: {
    postCreate () {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
      this._labelNodes = [this.labelNode];
    },

    wireEvents () {
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onChange")));
      this.wireHover()
    },

    getLabelNode () {
      return this.labelNode;
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.setStyle(style, model);

      this.setInnerHTML(this.labelNode, this.model.props.label);
      this.setValue(model.props.active, true);
    },

    getValue () {
      return this.value;
    },

    setValue (value, ignoreValidation) {
      if (value == undefined || value == null) {
        value = false;
      }

      this.value = value;
      var valid = true;
      if (!ignoreValidation) {
        valid = this.validate(this.value, true);
      }

      if (value) {
        if (this.model.active && valid) {
          this.setStyle(this.model.active);
        }
        //	console.debug(this.model.props.label);
        this.setInnerHTML(this.labelNode, this.model.props.label);
      } else {
        if (valid) {
          this.setStyle(this.model.style);
        }
        if (this.model.props.activeLabel) {
          this.setInnerHTML(this.labelNode, this.model.props.activeLabel);
        }
      }
    },

    getState () {
      return {
        type: "checked",
        value: this.value
      };
    },

    setState (state) {
      if (state && state.type == "checked") {
        this.setValue(state.value);
      }
    },

    _validateValue (value) {
      var validation = this.model.props.validation;
      if (validation) {
        if (validation.required && value === false) {
          return false;
        }
      }
      return true;
    },

    isValid (showError) {
      return this.validate(this.value, showError);
    },

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue (v) {
      if (v !== true && v !== false && v >= 1) {
        v = true;
      }
      this.setValue(v);
    },

    onChange (e) {
      this.stopEvent(e);
      this.setValue(!this.value);
      this.emitDataBinding(this.value);
      this.emitStateChange("checked", this.value, e);
    }
  },
  mounted() {}
};
</script>