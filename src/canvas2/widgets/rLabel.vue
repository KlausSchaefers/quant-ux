
<template>
  <div class="MatcInlineEditable MatcWidgetTypeLabelInlineEditable" v-html="label" :style="padding + font"></div>
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