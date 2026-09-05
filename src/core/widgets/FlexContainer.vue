<template>
  <div class="MatcWidgetTypeFlexContainer">
    <div :class="'MatcWidgetTypeFlexContainerPlaceholder matc' + direction">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="icon icon-tabler icons-tabler-outline icon-tabler-chevrons-right">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M7 7l5 5l-5 5" />
        <path d="M13 7l5 5l-5 5" />
      </svg>
    </div>
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
      value: null,
      direction: 'row'
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

      

      this.direction = style.flexDirection

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
