<template>
  <div class="MatcLight">
    <h1 style="margin-left:20px; margin-bottom:20px;">DesignTokenDialog Test</h1>


   <div class="MatcDialogBack MatcDialog MatcDesignTokenDialog MatcPadding" style="background: #fff;display:inline-block; vertical-align: top; margin-left:30px;">
        <DesignTokenDialog @change="onChange" ref="dialog"/>
    </div>

  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
</style>
<style>

  .MatcDataSettings {
      background: white;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
      padding:20px;
  }
</style>

<script>

import DesignTokenDialog from 'canvas/toolbar/dialogs/DesignTokenDialog'
import designGPT from './data/designGPT.json'

export default {
  name: "DataSettingsTest",
  mixins: [],
  data: function() {
    return {
      waiting: true

    };
  },
  components: {
    DesignTokenDialog: DesignTokenDialog
  },
  computed: {
  },
  methods: {
      onChange (d) {
          this.settings = JSON.stringify(d, null, 2)
      }
  },
  mounted() {
    this.$refs.dialog.setModel(designGPT)


  }
};
</script>
