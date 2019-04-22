
<template>
  <div class="MatcWidgetTypeRadioGroup"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import CheckBoxGroup from "core/widgets/CheckBoxGroup";
import DomBuilder from "common/DomBuilder";

export default {
  name: "RadioGroup",
  mixins: [CheckBoxGroup, DojoWidget],
  data: function() {
    return {
      value: {},
      options: []
    };
  },
  components: {},
  methods: {
    renderChildren: function(options) {
      if (this._borderNodes.length === 0) {
        var db = new DomBuilder();
        var cntr = db.div().build();
        for (var i = 0; i < options.length; i++) {
          var o = options[i];
          this.renderChild(o, i, cntr, db);
        }
        this.domNode.appendChild(cntr);
      }
    },

    setChildStyles: function(model) {
      for (var i = 0; i < this._hookNodes.length; i++) {
        var hook = this._hookNodes[i];
        if (model.style.colorButton) {
          hook.style.background = model.style.colorButton;
        }
      }
    },

    renderChild: function(option, i, cntr, db) {
      var row = db.div("MatcWidgetTypeCheckBoxRow").build(cntr);
      var back = db
        .div("MatcWidgetTypeRadioBox MatcWidgetTypeRadioBox2")
        .build(row);
      var hook = db.span("MatcWidgetTypeRadioBoxCircle").build(back);
      var label = db
        .div("MatcWidgetTypeCheckBoxLabel")
        .span(null, option)
        .build(row);

      this._borderNodes.push(back);
      this._backgroundNodes.push(back);
      this._hookNodes.push(hook);
      this._rowNodes.push(row);
      this._labelNodes.push(label);
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

      for (var i = 0; i < this._borderNodes.length; i++) {
        var back = this._borderNodes[i];
        var option = this.options[i];
        var checked = option === value;
        if (checked && valid) {
          css.add(back, "MatcWidgetTypeRadioBoxChecked");
        } else {
          //					if(valid || !this.model.error){
          //						back.style.background = this.model.style.background;
          //						this.setBorderColor();
          //					}
          css.remove(back, "MatcWidgetTypeRadioBoxChecked");
        }
      }
    },

    getState: function() {
      return {
        type: "select",
        value: this.value
      };
    },

    setState: function(state) {
      if (state && state.type == "select") {
        this.setValue(state.value);
      }
    },

    _validateValue: function(value) {
      var validation = this.model.props.validation;
      if (validation) {
        if (validation.required && this.options) {
          var pos = this.options.indexOf(value);
          return pos >= 0;
        }
      }
      return true;
    },

    isValid: function(showError) {
      return this.validate(this.value, showError);
    },

    onChange: function(option, i, e) {
      this.stopEvent(e);
      this.setValue(option);
      this.emitDataBinding(this.value);
      this.emitStateChange("select", this.value, e);
    }
  },
  mounted() {}
};
</script>