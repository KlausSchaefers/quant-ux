
<template>
  <div class="MatcWidgetTypeCheckBoxGroup"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";
import DomBuilder from "common/DomBuilder";

export default {
  name: "CheckBoxGroup",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: [],
      options: []
    };
  },
  components: {},
  methods: {
    postCreate: function() {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
      this._hookNodes = [];
      this._labelNodes = [];
      this._rowNodes = [];
    },

    cleanupRender: function() {
      this.removeAllChildren(this.domNode)
      // this.domNode.innerHTML = "";
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
      this._hookNodes = [];
      this._labelNodes = [];
      this._rowNodes = [];
    },

    wireEvents: function() {
      for (var i = 0; i < this._borderNodes.length; i++) {
        var back = this._borderNodes[i];
        var label = this._labelNodes[i];
        var option = this.options[i];
        this.own(
          this.addClickListener(back, lang.hitch(this, "onChange", option))
        );
        this.own(
          this.addClickListener(label, lang.hitch(this, "onChange", option))
        );
      }
    },

    resize: function(box) {
      this.setChildSize(box, this.style, this.scaleX, this.scaleY);
    },

    arraysEqual: function(arr1, arr2) {
      if (arr1.length !== arr2.length) return false;
      for (var i = arr1.length; i--; ) {
        if (arr1[i] !== arr2[i]) return false;
      }
      return true;
    },

    render: function(model, style, scaleX, scaleY) {
      if (!this.arraysEqual(this.options, model.props.options)) {
        this.cleanupRender();
      }

      this.model = model;
      this.style = style;
      this.options = model.props.options;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.renderChildren(model.props.options);

      this.setStyle(style, model);
      this.setChildStyles(model, style, scaleX, scaleY);
      this.setChildSize(model, style, scaleX, scaleY);

      this.setValue(model.props.selected, true);
    },

    setChildStyles: function(model) {
      for (var i = 0; i < this._hookNodes.length; i++) {
        var hook = this._hookNodes[i];
        if (model.style.colorButton) {
          hook.style.borderBottomColor = model.style.colorButton;
          hook.style.borderRightColor = model.style.colorButton;
        }
      }
    },

    setChildSize: function(model, style) {
      var w = this._getBorderWidth(style.boxHeight);
      var length = this._borderNodes.length;
      var top = (model.h - length * w) / (length - 1);
      var marginRight = this._getBorderWidth(style.boxMarginRight);

      for (var i = 0; i < length; i++) {
        var back = this._borderNodes[i];
        back.style.width = w + "px";
        back.style.height = w + "px";
        back.style.marginRight = marginRight + "px";

        var hook = this._hookNodes[i];
        hook.style.borderBottomWidth =
          this._getBorderWidth(style.boxHeight / 10) + "px";
        hook.style.borderRightWidth =
          this._getBorderWidth(style.boxHeight / 10) + "px";

        var row = this._rowNodes[i];
        row.style.height = w + "px";
        row.style.top = Math.floor(i * (top + w)) + "px";
      }
    },

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

    renderChild: function(option, i, cntr, db) {
      var row = db.div("MatcWidgetTypeCheckBoxRow").build(cntr);
      var back = db.div("MatcWidgetTypeCheckBox").build(row);
      var hook = db.span("MatcWidgetTypeCheckBoxHook").build(back);
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
      if (!v) {
        v = [];
      }
      this.setValue(v);
    },

    setValue: function(value, ignoreValidation) {
      if (!value) {
        value = [];
      }

      this.value = value;
      var valid = true;
      if (!ignoreValidation) {
        valid = this.validate(this.value, true);
      }

      if (value && value.indexOf) {
        for (var i = 0; i < this._borderNodes.length; i++) {
          var back = this._borderNodes[i];
          var option = this.options[i];
          var checked = value.indexOf(option) >= 0;
          if (checked && valid) {
            css.add(back, "MatcWidgetTypeCheckBoxChecked");
          } else {
            //					if(valid || !this.model.error){
            //						back.style.background = this.model.style.background;
            //						this.setBorderColor();
            //					}
            css.remove(back, "MatcWidgetTypeCheckBoxChecked");
          }
        }
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
        if (validation.required && (!value || value.length === 0)) {
          return false;
        }
      }
      return true;
    },

    isValid: function(showError) {
      return this.validate(this.value, showError);
    },

    onChange: function(option, i, e) {
      this.stopEvent(e);

      if (!this.value) {
        this.value = []
      }
      if (!this.value.push) {
          // this can happen because the config sets strings not array.
          // FIXME: make option toolbox mutliselct and return array
         this.value = [this.value]
      }

      var pos = this.value.indexOf(option);
      if (pos < 0) {
        this.value.push(option);
      } else {
        this.value.splice(pos, 1);
      }

      this.setValue(this.value);
      this.emitDataBinding(this.value);
      this.emitStateChange("checked", this.value, e);
    }
  },
  mounted() {}
};
</script>