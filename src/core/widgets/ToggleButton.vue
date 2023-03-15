
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
      if (this.model.props.isImageToggle) {
        return
      }
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
      if (this.model.props.isImageToggle) {
        if (!style.backgroundImage) {
          this.renderDefaultImage(model)
        }
      }
    },

    renderDefaultImage (model) {
      let w = model.w * 2;
      let h = model.h * 2;

      const c = document.createElement("canvas");
      const context = c.getContext("2d");
      c.width = w;
      c.height = h;
      h += 0.5;
      w += 0.5;
      const n = 0.5;
      context.moveTo(n, n);
      context.lineTo(w, h);
      context.moveTo(w, n);
      context.lineTo(n, h);
      context.strokeStyle = "#333";
      context.strokeWidth = 2;
      context.imageSmoothingEnabled = false;
      context.stroke();
      
      this.domNode.style.backgroundSize = "100% 100%"
      this.domNode.style.backgroundImage = "url(" + c.toDataURL("image/png") + ")";
      const borderWidth = Math.max(1,this._getBorderWidth(model.style.borderTopWidth))
      this.domNode.style.border = borderWidth + "px solid #777";


    },

    getValue () {
      return this.value;
    },

    setValue (value, ignoreValidation) {
      if (value == undefined || value == null) {
        value = false;
      }

      this.value = value;
      let valid = true;
      if (!ignoreValidation) {
        valid = this.validate(this.value, true);
      }

      if (value) {
        if (this.model.active && valid) {
          this.setStyle(this.model.active);
        }
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