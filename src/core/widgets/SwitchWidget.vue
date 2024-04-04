
<template>
  <div class="MatcWidgetTypeSwitch">
    <div data-dojo-attach-point="cntr" class="MatcWidgetTypeSwitchCntr">
      <div class="MatcWidgetTypeSwitchBackground" data-dojo-attach-point="backgroundDiv"></div>
      <div data-dojo-attach-point="foregroundDiv" class="MatcWidgetTypeSwitchForeground"></div>
    </div>
    <span class="MatcWidgetTypeSwitchHandle" data-dojo-attach-point="handle">
      <span class="MatcWidgetTypeSwitchHandleBtn" data-dojo-attach-point="button"></span>
    </span>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
// import on from "dojo/on";
// import touch from "dojo/touch";
// import domGeom from "dojo/domGeom";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "SwitchWidget",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: false
    };
  },
  components: {},
  methods: {
    postCreate () {
      this._borderNodes = [this.cntr, this.backgroundDiv];
      this._backgroundNodes = [this.backgroundDiv];
      this._shadowNodes = [this.handle];
    },

    wireEvents () {
        this.own(this.addClickListener(this.domNode, lang.hitch(this, "onChange")))
        this.wireHover()
    },

    resize (box) {
      this._setBorderRadius(this.foregroundDiv, this.style);
      this._setBorderRadius(this.handle, this.style);
      this._setBorderRadius(this.button, this.style);

      if (this.model.props && this.model.props.roundButton) {
        let h = box.h;
        if (this.style.paddingButton) {
          h -= this._getBorderWidth(this.style.paddingButton / 2) - 1;
        }
        this.handle.style.width = h + "px";
        this.handle.style.height = h + "px";
      } else {
        let h = Math.ceil(box.w / 2) + 1;
        if (this.style.paddingButton) {
          h -= this._getBorderWidth(this.style.paddingButton / 2) - 1;
        }
        this.handle.style.width = h + "px";
      }
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model);

      /**
       * No apply border radius to handler and foreground
       */
      this.resize(model);

      this.setValue(model.props.checked, true);
    },

    _set_paddingButton (parent, style) {
      var w = this._getBorderWidth(style.paddingButton);
      this.handle.style.padding = w + "px";
    },

    _set_colorForeGround (parent, style) {
      this.foregroundDiv.style.background = style.colorForeGround;
    },

    _set_cssClass (parent, style) {
      css.add(this.domNode, style.cssClass);
    },

    _set_borderWidthButton (parent, style) {
      var w = this._getBorderWidth(style.borderWidthButton);
      this.button.style.borderWidth = w + "px";
    },

    _set_borderColorButton (parent, style) {
      this.button.style.borderColor = style.borderColorButton;
    },

    _set_colorButton (parent, style) {
      this.button.style.background = style.colorButton;
    },

    _set_boxShadowButton (parent, style) {
      this._setShadow(this.button, style.boxShadowButton);
    },

    getValue () {
      return this.value;
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

    setValue (value, ignoreValidation) {
      this.value = value;
      var valid = true;
      if (!ignoreValidation) {
        valid = this.validate(this.value, true);
      }
      if (value) {
        css.add(this.domNode, "MatcWidgetTypeSwitchChecked");

        if (this.model.active && valid) {
          this.setStyle(this.model.active, this.model);
        }
      } else {
        css.remove(this.domNode, "MatcWidgetTypeSwitchChecked");

        if (this.model.active && valid) {
          this.setStyle(this.model.style, this.model);
        }
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