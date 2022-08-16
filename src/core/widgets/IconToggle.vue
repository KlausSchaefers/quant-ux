
<template>
  <div class="MatcWidgetTypeIconToggle">
    <span class="MatcWidgetTypeIconToggleIcon" data-dojo-attach-point="icon"></span>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "IconToggle",
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
      this._paddingNodes = [];
    },

    wireEvents: function() {
      this.own(
        this.addClickListener(this.domNode, lang.hitch(this, "onChange"))
      );
      this.wireHover()
    },

    getLabelNode: function() {
      return this.domNode;
    },

    resize: function(box) {
      var h = Math.min(box.h, box.w);
      this.icon.style.fontSize = h + "px";
    },

    render: function(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.domNode.style.color = style.color;
      if (style.boxShadow) {
        this._setBoxShadow(this.domNode, style)
      }
      this.setValue(model.props.active, true);
      this.resize(model);
    },

    getValue: function() {
      return this.value;
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

    isValid (showError) {
      return this.validate(this.value, showError);
    },


    _setBoxShadow (node, style) {
      var shadow = style.boxShadow;
      if (shadow) {
        var v = this.getZoomed(shadow.v, this._scaleY);
        var h = this.getZoomed(shadow.h, this._scaleX);
        var b = this.getZoomed(shadow.b, Math.max(this._scaleY, this._scaleX));
        node.style.textShadow = h + "px " + v + "px " + b + "px " + shadow.c;
      } else {
        node.style.textShadow = "none";
      }
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