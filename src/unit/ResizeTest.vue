<template>
  <div class="MatcLight">
    <h1>Resize Test</h1>
    <div class="MatcToobarPropertiesSection">
        <Resize />
    </div>


  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
</style>

<script>

import Resize from 'canvas/toolbar/Resize'


export default {
  name: "ResizeTest",
  mixins: [],
  data: function() {
    return {
      checkBoxChecked: true,
      options: [{ label: "a", value: "a" }, { label: "b", value: "b" }],
      user: "not loaded"
    };
  },
  components: {
    Resize: Resize
  },
  methods: {

  },
  mounted() {

  }
};
</script>
