
<template>
  <div class="MatcWidgetTypeIconToggle">
    <span :class="'MatcWidgetTypeIconToggleIcon ' + icon" :style="{color:color, fontSize: fontSize}"></span>
  </div>
</template>
<script>

//import lang from "dojo/_base/lang";
//import on from "dojo/on";
//import touch from "dojo/touch";
import ReactiveWidget from './ReactiveWidget'


export default {
  name: "iIcon",
  mixins: [ReactiveWidget],
  data: function () {
    return  {
      value: "",
    };
  },
  components: {},
  computed: {
    fontSize () {
      if (this.qWidget) {
        var height = this.qWidget.h;
       return height + 'px'
      }
      return ''
    },
    icon () {
      if (this.qWidget) {
        return this.qWidget.style.icon
      }
      return ''
    },
    color () {
      if (this.qWidget) {
        return this.qWidget.style.color
      }
      return ''
    }
  },
  methods: {
  },
  mounted() {}
};
</script>