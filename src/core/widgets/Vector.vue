
<template>
  <div class="MatcWidgetTypeVector" :style="{'background': backgroundImage}"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Vector",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      backgroundImage: ''
    };
  },
  components: {},
  methods: {
    postCreate: function() {
      this._borderNodes = [];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [];
    },

    wireEvents: function() {
      this.own(this.addClickListener(this.domNode, e => {
        this.onClick(e)
      }));
    },

    render: function(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      var figmaImage = model.props.figmaImage;
      if (figmaImage) {
        this.backgroundImage = `url(${figmaImage})`
      }
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