<template>
  <div class="MatcWidgetTypeFlexContainer">
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";
import Logger from 'common/Logger'


export default {
  name: "FlexContainer",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      value: null
    };
  },
  components: {},
  methods: {
    postCreate() {
      this._borderNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
    },

    wireEvents() {
      this.wired = true;
    },

    render(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.setStyle(style);
    },

    getValue() {
      return this.value;
    },

    setValue(v) {
      this.value = v
    },

    getState() {
      return {};
    },

    setState() {
    },

    cleanUp() {
    },

    destroy() {
      this.cleanUp();
    },
  },
  mounted() {
    this.logger = new Logger('FlexContainer')
  },
};
</script>
