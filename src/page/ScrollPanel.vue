<template>
    <div class="MatcScrollPanel">      
        <slot></slot>
    </div>
  </template>
  <style lang="scss">
    @import "../style/components/split_view.scss";
  </style>
  <script>
  import * as ScrollUtil from '../util/ScrollUtil'
  export default {
    name: "ScrollPanel",
    mixins: [],
    props: [],
    data: function() {
      return {
        pos:0,
      };
    },
    watch: {},
    computed: {
       
    },
    components: {
    },
    methods: {
       
    },
    async mounted() {
        ScrollUtil.addScrollIfNeeded(this.$el, false)
    }
  };
  </script>
  
  