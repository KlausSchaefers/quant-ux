
<template>
  <div class="MatcWidgetTypeCountingStepper"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Stepper",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: 0,
      min: false,
      max: false
    };
  },
  components: {},
  methods: {
    postCreate () {
      this._borderNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
    },

    wireEvents() {
      this.wired = true;
      this.own(this.addClickListener(this.plusBtn, lang.hitch(this, "onPlus")));
      this.own(this.addClickListener(this.minusBtn, lang.hitch(this, "onMinus")));
      this.wireHover()
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;

      if (model.min) {
        this.min = model.min;
      }
      if (model.max) {
        this.max = model.max;
      }

      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;


      var db = new DomBuilder();

      this.removeAllChildren(this.domNode)
     

      this.minusBtn = db.div("MatcWidgetTypeStepperBtn").build(this.domNode);
      this.minusLbl = db.div("MatcWidgetTypeStepperLabel", "-").build(this.minusBtn);

      let lblBtnCntr = db.div("MatcWidgetTypeStepperLblCntr").build(this.domNode);
      this.lblBtn = db.div("MatcWidgetTypeStepperLabel", "").build(lblBtnCntr);

      this.plusBtn = db.div("MatcWidgetTypeStepperBtn").build(this.domNode);
      this.plusLbl = db.div("MatcWidgetTypeStepperLabel", "+").build(this.plusBtn);


      this.resize(model)
      if (model.props.value !== undefined && model.props.value !== null) {
        this.setValue(model.props.value * 1, true);
      }

      this.setStyle(style);
    },

    resize (box) {
        let h = box.h
        if (this.model.style.sizeButton < 1) {
          h = h * this.model.style.sizeButton

          this.minusBtn.style.height = h + 'px'
          this.plusBtn.style.height = h + 'px'
        }

        this.minusBtn.style.width = h + 'px'
        this.plusBtn.style.width = h + 'px'
    },

    _set_colorButton (parent, style) {
        this.plusBtn.style.color = style.colorButton
        this.minusBtn.style.color = style.colorButton
    },

    _set_backgroundButton (parent, style) {
        this.plusBtn.style.background = style.backgroundButton
        this.minusBtn.style.background = style.backgroundButton
    },

    _set_radiusButton (parent, style) {
        let r = this._getBorderWidth(style.radiusButton) + 'px'
        this.plusBtn.style.borderRadius = r
        this.minusBtn.style.borderRadius = r
    },

    onPlus (e) {
      this.stopEvent(e);
      if (this.max === false || this.value < this.max) {
        var v = this.value + 1;
        this.emitDataBinding(v);
        this.setValue(v);
      }
      this.emitStateChange("select", this.value, e);
    },

    onMinus (e) {
      this.stopEvent(e);
      if (this.min === false || this.min > this.value) {
        var v = this.value - 1;
        this.emitDataBinding(v);
        this.setValue(v);
      }
      this.emitStateChange("select", this.value, e);
    },

    getValue () {
      return this.value;
    },

    _setDataBindingValue (v) {
      v = v * 1;
      if (!isNaN(v)) {
        this.setValue(v);
      } else {
        console.debug("_setDataBindingValue() > not int value" + v);
      }
    },

    setValue (value, doNoUpdate) {
      this.value = value;
      this.lblBtn.innerHTML = this.value
      if (!doNoUpdate) {
        this.setValueLabel(value);
      }
    },

    getState: function() {
      return {
        type: "select",
        value: this.value
      };
    },

    setState: function(state) {
      if (state) {
        if (state.type == "select") {
          this.setValue(state.value);
        }
      }
    },

    beforeDestroy: function() {
    }
  },
  mounted() {}
};
</script>