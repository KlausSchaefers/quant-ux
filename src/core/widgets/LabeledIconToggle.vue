
<template>
  <div class="MatcWidgetTypeIconToggle MatcWidgetTypeLabeledIconToggle">
    <span class="MatcWidgetTypeIconToggleIcon" data-dojo-attach-point="icon"></span>
    <span class="MatcWidgetTypeIconToggleIconLabel" data-dojo-attach-point="label"></span>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "LabeledIconToggle",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: false
    };
  },
  components: {},
  methods: {
    postCreate: function() {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
      this._paddingNodes = [this.label];
      this._labelNodes = [this.label];
    },

    wireEvents: function() {
      this.own(
        this.addClickListener(this.domNode, lang.hitch(this, "onChange"))
      );
      this.wireHover()
    },

    getLabelNode: function() {
      return this.label;
    },

    resize: function(box) {
      var h = box.h;
      this.icon.style.fontSize = h + "px";
      if (this.style.fontSize === "Auto") {
        this.label.style.fontSize = h * 0.95 + "px";
      }
    },

    render: function(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      if (model.props.label) {
        this.setTextContent(this.label, model.props.label);
      }

      this.setValue(model.props.active, true);
      this.resize(model);

      this.setStyle(style, model);
    },

    getValue: function() {
      return this.value;
    },

    _set_color: function(parent, style) {
      if (style.color) {
        if (style.color !== "transparent") {
          this.label.style.color = style.color;
        } else {
          this.label.style.color = "";
        }
      }
    },

    _set_fontSize: function(parent, style) {
      if (style.fontSize === "Auto" || this.style.fontSize === "a") {
        this.label.style.fontSize = this.model.h * 0.95 + "px";
      } else {
        this.label.style.fontSize = style.fontSize * this._scaleX + "px";
      }
    },

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue: function(v) {
      if (v !== true && v !== false && v >= 1) {
        v = true;
      }
      this.setValue(v);
    },

    setValue: function(value, ignoreValidation) {
      this.value = value;
      var valid = true;
      if (!ignoreValidation) {
        valid = this.validate(this.value, true);
      }

      if (value) {
        if (this.style.activeColor && valid) {
          this.domNode.style.color = this.style.activeColor;
        }
        css.remove(this.icon, this.model.props.passiveIcon);
        css.add(this.icon, this.model.props.activeIcon);
      } else {
        if (valid) {
          this.domNode.style.color = this.style.passiveColor;
        }
        css.remove(this.icon, this.model.props.activeIcon);
        css.add(this.icon, this.model.props.passiveIcon);
      }
    },

    getState: function() {
      return {
        type: "checked",
        value: this.value
      };
    },

    setState: function(state) {
      if (state && state.type == "checked") {
        this.setValue(state.value);
      }
    },

    _validateValue: function(value) {
      var validation = this.model.props.validation;
      if (validation) {
        if (validation.required && value === false) {
          return false;
        }
      }
      return true;
    },

    isValid: function(showError) {
      return this.validate(this.value, showError);
    },

    onChange: function(e) {
      this.stopEvent(e);
      this.setValue(!this.value);
      this.emitDataBinding(this.value);
      this.emitStateChange("checked", this.value, e);
    }
  },
  mounted() {}
};
</script>