
<template>
    <div class="MatcLabeledCheckBox">
        <div :class="['MatcWidgetTypeCheckBox', {'MatcWidgetTypeCheckBoxChecked': value}]" ref="box">
            <div>
                <span class="MatcWidgetTypeCheckBoxHook" ref="button"></span>
            </div>
        </div>
        <div class="MatchWidgetTypeLabel" >
            <div class="MatcInlineEditable MatcWidgetTypeLabelInlineEditable" ref="label">
                {{label}}
            </div>
        </div>

    </div>
  </template>
  <script>
  import DojoWidget from "dojo/DojoWidget";
  import lang from "dojo/_base/lang";
  import UIWidget from "core/widgets/UIWidget";
  
  export default {
    name: "LabeledCheckBox",
    mixins: [UIWidget, DojoWidget],
    data: function() {
      return {
        label: '',
        value: false
      };
    },
    components: {},
    methods: {
      postCreate: function() {
        this._borderNodes = [this.$refs.box];
        this._backgroundNodes = [this.$refs.box];
        this._shadowNodes = [this.$refs.box];
        this._paddingNodes = [this.$refs.label];
        this._labelNodes = [this.$refs.label];
      },
  
      wireEvents() {
        this.own(this.addClickListener(this.domNode, lang.hitch(this, "onChange")));
        this.wireHover()
      },
  
      getLabelNode () {
        return this.$refs.label;
      },

      resize(pos) {
        const box = this.$refs.box
        box.style.width = pos.h + 'px'
      },
  
  
      render (model, style, scaleX, scaleY) {
        this.model = model;
        this.style = style;
        this._scaleX = scaleX;
        this._scaleY = scaleY;

  
        if (model.props.label) {
          this.label = model.props.label
        }
        if (model.props.gap !== undefined && model.props.gap !== null) {
            this.domNode.style.gap =  model.props.gap + 'px'
        }  
        this.setValue(model.props.checked, true);
        this.resize(model);  
        this.setStyle(style, model);
      },

      _set_colorButton(parent, style) {
        this.$refs.button.style.borderColor = style.colorButton
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
      
        if (!ignoreValidation) {
          this.validate(this.value, true);
        }
        
      },
  
      getState() {
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
        const validation = this.model.props.validation;
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