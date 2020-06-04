
<template>
  <div class="MatcWidgetTypeSVG">X</div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Vector",
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
      //this.own(on(this.domNode, touch.press, lang.hitch(this, "onChange")));
      //this.own(topic.subscribe(this.topic, lang.hitch(this, "onOtherChecked")));
    },

    render: function(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      var paths = model.props.paths;
      this.domNode.innerHTML = JSON.stringify(paths);
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