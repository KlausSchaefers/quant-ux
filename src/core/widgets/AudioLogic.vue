
<template>
  <div class="MatcWidgetTypeRest">
    <span class="MatcWidgetTypeIconToggleIcon mdi mdi-music " data-dojo-attach-point="icon"></span>
    <span class="MatcWidgetTypeRestLabel" data-dojo-attach-point="labelNode">{{label}}</span>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "AudioLogic",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: false,
      model: null
    };
  },
  components: {},
  computed: {
    label () {
      if (this.model && this.model && this.model.props?.label) {
        return this.model.props?.label
      }
      if (this.model && this.model) {
        return this.model.name
      }
      return 'Audio'
    }
  },
  methods: {
    postCreate () {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
      this._paddingNodes = [];
    },

    resize (box) {
      var h = box.h
      this.icon.style.fontSize = (h * 0.7) + "px";
      this.labelNode.style.fontSize = (h * 0.2) + "px";
    },

    render (model, style, scaleX, scaleY) {
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
    _setDataBindingValue (v) {
      if (v !== true && v !== false && v >= 1) {
        v = true;
      }
      this.setValue(v);
    },

    getValue () {},

    setValue () {},

    getState() {
      return {};
    },

    setState () {}
  },
  mounted() {}
};
</script>