
<template>
  <div class="MatcWidgetTypeStepper"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";
import touch from "dojo/touch";
import on from "dojo/on";

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
    postCreate: function() {
      this._borderNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._paddingNodes = [];
    },

    wireEvents: function() {
      this.wired = true;
      this.own(this.addClickListener(this.plusBtn, lang.hitch(this, "onPlus")));
      this.own(this.addClickListener(this.minusBtn, lang.hitch(this, "onMinus")));
      if (this.model.hover) {
         this.own(on(this.plusBtn, touch.over, () => {
            this.onBtnOver(this.plusBtn)
         }));
         this.own(on(this.plusBtn, touch.out, () => {
            this.onBtnOut(this.plusBtn)
         }));
         this.own(on(this.minusBtn, touch.over, () => {
            this.onBtnOver(this.minusBtn)
         }));
         this.own(on(this.minusBtn, touch.out, () => {
            this.onBtnOut(this.minusBtn)
         }));
      }
    },

    onBtnOut (btn) {
      btn.style.background = this.style.background,
      btn.style.color = this.style.color
    },

    onBtnOver (btn) {
      if (this.model.hover) {
        btn.style.background = this.model.hover.background
        btn.style.color = this.model.hover.color
      }
    },

    render: function(model, style, scaleX, scaleY) {
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
      this.withLabel = model.props.withLabel;

      var db = new DomBuilder();

      this.removeAllChildren(this.domNode)
      //this.domNode.innerHTML = "";

      if (!this.withLabel) {
        this.minusBtn = db.div("MatcWidgetTypeStepperBtn").build(this.domNode);
        db.div("MatcWidgetTypeStepperLabel", "-").build(this.minusBtn);

        this.plusBtn = db.div("MatcWidgetTypeStepperBtn").build(this.domNode);
        db.div("MatcWidgetTypeStepperLabel", "+").build(this.plusBtn);

        this._paddingNodes.push(this.plusBtn);
        this._paddingNodes.push(this.minusBtn);

        var w = this._getBorderWidth(style.borderLeftWidth);
        this.plusBtn.style.borderLeftWidth = w + "px";
        this.plusBtn.style.borderLeftColor = style.borderLeftColor;
      }

      if (model.props.value) {
        this.setValue(model.props.value * 1, true);
      }

      this.setStyle(style);
    },

    resize: function() {},

    onPlus: function(e) {
      this.stopEvent(e);
      if (this.max === false || this.value < this.max) {
        var v = this.value + 1;
        this.emitDataBinding(v);
        this.setValue(v);
      }
      this.emitStateChange("select", this.value, e);
    },

    onMinus: function(e) {
      this.stopEvent(e);
      if (this.min === false || this.min > this.value) {
        var v = this.value - 1;
        this.emitDataBinding(v);
        this.setValue(v);
      }
      this.emitStateChange("select", this.value, e);
    },

    getValue: function() {
      return this.value;
    },

    _setDataBindingValue: function(v) {
      v = v * 1;
      if (!isNaN(v)) {
        this.setValue(v);
      } else {
        console.debug("_setDataBindingValue() > not int value" + v);
      }
    },

    setValue: function(value, doNoUpdate) {
      this.value = value;
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