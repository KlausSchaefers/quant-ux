
<template>
  <div class="MatcWidgetTypePolyLine"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "PolyLine",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {};
  },
  components: {},
  methods: {
    postCreate: function() {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
    },

    wireEvents: function() {
    },

    render: function(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      var shape = model.props.shape;
      if (this["_render_" + shape]) {
        this["_render_" + shape](this.domNode, model, style);
      } else {
        console.warn("render() > Shape " + shape + " not supported");
      }
    },

    _render_rectange_left: function(parent, model, style) {
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

    _render_diamond: function(parent, model, style) {
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