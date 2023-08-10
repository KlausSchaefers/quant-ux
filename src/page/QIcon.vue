
<template>
    <div class="MatcQIcon" @click="onClick" v-if="icons[icon]">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        :class="'MatcQIconSVG ' + icon"
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        stroke-width="1.25" 
        stroke="currentColor" 
        fill="none" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        v-html="icons[icon]">
      </svg>
    </div>
    <span v-else :class="icon" @click="onClick"></span>
  </template>
  <style lang="scss">
  @import "../style/scss/icon.scss";
</style>
  <script>
  import DojoWidget from "dojo/DojoWidget";
  import {icons} from './QIconsSVG'
  export default {
    name: "QIcon",
    props:['icon'],
    mixins: [DojoWidget],
    data: function() {
      return {
        icons: icons
      };
    },
    components: {},
    methods: {
      onClick (e) {
        this.$emit('click', e)
      }
    },
    mounted() {
    }
  };
  </script>