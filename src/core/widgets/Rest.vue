
<template>
  <div class="MatcWidgetTypeRest">
    <span class="MatcWidgetTypeIconToggleIcon mdi mdi-cloud-sync" data-dojo-attach-point="icon"></span>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Rest",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: false
    };
  },
  components: {},
  methods: {
    postCreate: function() {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
      this._paddingNodes = [];
    },

    getLabelNode: function() {
      return this.domNode;
    },

    resize: function(box) {
      var h = Math.min(box.h, box.w);
      this.icon.style.fontSize = h + "px";
    },

    render: function(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.domNode.style.color = style.color;
      this.setValue(model.props.active, true);
      this.resize(model);
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