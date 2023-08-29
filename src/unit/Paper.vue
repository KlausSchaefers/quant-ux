<template>
  <div class="MatcLight">
    <VectorEditor height="500" width="500"/>
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
import VectorEditor from 'canvas/VectorEditor'

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
    Resize: Resize,
    VectorEditor: VectorEditor
  },
  methods: {

  },
  mounted() {

  }
};
</script>
