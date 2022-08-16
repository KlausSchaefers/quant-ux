
<template>
  <div class="MatcWidgetTypeCheckBox">
    <div data-dojo-attach-point="back">
      <span class="MatcWidgetTypeCheckBoxHook" data-dojo-attach-point="hook"></span>
    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";
import Logger from 'common/Logger'

export default {
  name: "CheckBoxWidget",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: false
    };
  },
  components: {},
  methods: {
    postCreate () {
      this.log = new Logger('CheckBoxWigdet')
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
    },

    wireEvents () {
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onChange")));
      this.wireHover()
    },

    resize (box) {
      this.hook.style.borderBottomWidth =
      this._getBorderWidth(box.w / 10) + "px";
      this.hook.style.borderRightWidth =
      this._getBorderWidth(box.w / 10) + "px";
    },

    render: function(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model);

      this.hook.style.borderBottomWidth = this._getBorderWidth(model.w / 10) + "px";
      this.hook.style.borderRightWidth = this._getBorderWidth(model.w / 10) + "px";

      if (model.props.colorButton) {
        /**
         * legacy
         */
        this.hook.style.borderBottomColor = model.props.colorButton;
        this.hook.style.borderRightColor = model.props.colorButton;
      }

      if (model.style.colorButton) {
        this.hook.style.borderBottomColor = model.style.colorButton;
        this.hook.style.borderRightColor = model.style.colorButton;
      }

      this.setValue(model.props.checked, true);
    },

    getValue () {
      return this.value;
    },

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue(v) {
      if (v === 'false') {
        v = false
      }
      if (v === 'true') {
        v = true
      }
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
        if (this.model.checked && valid) {
          this.setStyle(this.model.checked);
        }
        css.add(this.domNode, "MatcWidgetTypeCheckBoxChecked");
      } else {
        if (valid || !this.model.error) {
          this.domNode.style.background = this.model.style.background;
          this.setBorderColor();
        }
        css.remove(this.domNode, "MatcWidgetTypeCheckBoxChecked");
      }
    },

    getState: function() {
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