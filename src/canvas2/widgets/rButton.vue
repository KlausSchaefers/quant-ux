
<template>
  <div class="MatcWidget MatchWidgetTypeButton MatcEventedWidget MatcSimulatorClickable" :style="padding + font + border + background">
      <div v-html="label" :class="verticalAlign + ' MatcInlineEditable'"></div>
  </div>
</template>
<script>

//import lang from "dojo/_base/lang";
//import on from "dojo/on";
//import touch from "dojo/touch";
import ReactiveWidget from './ReactiveWidget'


export default {
  name: "rLabel",
  mixins: [ReactiveWidget],
  data: function () {
    return  {
      value: "",
      hackValueLabel: false
    };
  },
  components: {},
  computed: {

  },
  methods: {

  },
  mounted() {}
};
</script>