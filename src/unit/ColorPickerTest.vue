<template>
  <div class="MatcLight">
    <h1>ColorPicker Test</h1>
    <div class="MatcToolbarRestSettings" style="" ref="cntr">

    </div>


  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
</style>
<style>

  .MatcToolbarRestSettings {
      background: white;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
      display: inline-block;
      padding: 20px;
      position: absolute;
      right:200px;
      top:300px
  }
</style>

<script>

import ToolbarColor from 'canvas/toolbar/components/ToolbarColor'
import * as DojoUtil from 'dojo/DojoUtil';

export default {
  name: "ColorPickerTest",
  mixins: [],
  data: function() {
    return {

    };
  },
  components: {

  },
  methods: {
      onChange (d) {
          this.settings = d
      }
  },
  mounted() {
    this.colorPicker = DojoUtil.$new(ToolbarColor, {hasGradient:true})
    this.colorPicker.placeAt(this.$refs.cntr)
    this.colorPicker.setValue('#333')
    this.colorPicker.showDropDown()
  }
};
</script>
