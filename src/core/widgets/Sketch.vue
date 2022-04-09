<template>
  <div class="MatcWidgetTypeSketch">X</div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Sketch",
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