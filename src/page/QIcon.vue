
<template>
    <div class="MatcQIcon" @click="onClick" @mouseover="onMouseOver" @mouseout="onMouseOut" v-if="icons[icon]">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        :class="'MatcQIconSVG ' + icon"
        :width="w" 
        :height="h" 
        viewBox="0 0 24 24" 
        stroke-width="1.25" 
        stroke="currentColor" 
        fill="none" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        v-html="icons[icon]">
      </svg>
      <span v-if="bubble" class="MatcQIconBubble" ></span>
    </div>
    <span v-else :class="'MatcQIcon ' + icon" @click="onClick" @mouseover="onMouseOver" @mouseout="onMouseOut"></span>

  </template>
  <style lang="scss">
  @import "../style/components/icon.scss";
</style>
  <script>
  import DojoWidget from "dojo/DojoWidget";
  import _Tooltip from "common/_Tooltip";
  import {icons} from './QIconsSVG'
  export default {
    name: "QIcon",
    props:['icon', 'tooltip', 'bubble', 'attachToParent', 'width', 'height'],
    mixins: [DojoWidget, _Tooltip],
    data: function() {
      return {
        icons: icons,
        w: 18,
        h: 16
      };
    },
    components: {},
    methods: {
      onMouseOver (e) {
        this.$emit('mouseover', e)
      },
      onMouseOut (e) {
        this.$emit('mouseout', e)
      },
      onClick (e) {
        this.$emit('click', e)
      }
    },
    mounted() {
      if (this.tooltip) {
        if (this.attachToParent && this.$el.parentNode) {
          this.addTooltip(this.$el.parentNode, this.tooltip)
        } else {
          this.addTooltip(this.$el, this.tooltip)
        }
      }
      if (this.width) {
        this.w = this.width
      }
      if (this.height) {
        this.h = this.height
      }

    }
  };
  </script>