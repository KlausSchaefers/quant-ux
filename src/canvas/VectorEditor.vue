<template>
  <div class="MatcCanvasVector" :style="{'width': width + 'px', 'height': height + 'px'}">
      <canvas ref="canvas" :style="{'width': width + 'px', 'height': height + 'px'}"/>
  </div>
</template>

<style>
  @import url("../style/matc.css");
</style>

<script>

export default {
  name: "VectorEditor",
  mixins: [],
  props: ['width', 'height'],
  data: function() {
    return {
      checkBoxChecked: true,
      options: [{ label: "a", value: "a" }, { label: "b", value: "b" }],
      user: "not loaded"
    };
  },
  components: {
  },
  methods: {

  },
  mounted() {

  }
};
</script>
