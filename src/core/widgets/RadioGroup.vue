
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
  data() {
    return {
      value: {},
      options: []
    };
  },
  components: {},
  methods: {
     
    renderChildren (options) {
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

    setChildStyles (model) {
      for (var i = 0; i < this._hookNodes.length; i++) {
        var hook = this._hookNodes[i];
        if (model.style.colorButton) {
          hook.style.background = model.style.colorButton;
        }
      }
    },

    renderChild (option, i, cntr, db) {
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

    getState () {
      return {
        type: "select",
        value: this.value
      };
    },

    setState (state) {
      if (state && state.type == "select") {
        this.setValue(state.value);
      }
    },

    _validateValue (value) {
      var validation = this.model.props.validation;
      if (validation) {
        if (validation.required && this.options) {
          var pos = this.options.indexOf(value);
          return pos >= 0;
        }
      }
      return true;
    },

    isValid (showError) {
      return this.validate(this.value, showError);
    },

    onChange (option, i, e) {
      this.stopEvent(e);
      this.setValue(option);
      this.emitDataBinding(this.value);
      this.emitStateChange("select", this.value, e);
    }
  },
  mounted() {}
};
</script>