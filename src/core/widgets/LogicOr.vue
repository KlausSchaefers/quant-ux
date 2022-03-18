
<template>
  <div class="MatcWidgetTypeLogicOr">
    <div class="MatcWidgetTypeLogicOrLabel" data-dojo-attach-point="label"></div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "LogicOr",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: false,
      topic: "MatcWidgetRadioBoxChange"
    };
  },
  components: {},
  methods: {
    postCreate () {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
    },

    /**
     * Get the node for inline editing
     */
    getLabelNode () {
      return this.label;
    },

    resize (box) {
      var h = Math.min(box.h, box.w);
      this.label.style.fontSize = (h * 0.4) + "px";
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this._drawRaute(this.domNode, model, style);
      this.resize(model)

      if (model.props.label) {
        this.setTextContent(this.label, model.props.label);
      }
    },

    _drawRaute (parent, model, style) {
      var w = model.w * 2;
      var h = model.h * 2;
      var c = document.createElement("canvas");

      

      c.width = w;
      c.height = h;
      h += 0.5;
      w += 0.5;
      var n = 0.5;

      var ctx = c.getContext("2d");
      ctx.beginPath();
      ctx.moveTo(w / 2, n);
      ctx.lineTo(w, h / 2);
      ctx.lineTo(w / 2, h);
      ctx.lineTo(n, h / 2);
      ctx.lineTo(w / 2, n);
      ctx.closePath();
      ctx.strokeWidth = 0;
      ctx.stroke();

      ctx.fillStyle = style.background;
      ctx.fill();

      parent.style.backgroundImage = "url(" + c.toDataURL("image/png") + ")";
    },

    getValue: function() {},

    setValue: function() {},

    getState: function() {
      return {};
    },

    setState: function() {}
  },
  mounted() {}
};
</script>