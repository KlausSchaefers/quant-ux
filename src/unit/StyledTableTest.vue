<template>
  <div class="MatcLight">
    <h1>Styled Table Test</h1>

    <div class="dialog MatcOptionDialog">
      <StyledTable :app="app" :value="widget"/>
    </div>


  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
</style>
<style>

  .dialog {
    width: 1200px;
    margin: 20px;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
    background: #fff;
  }
</style>

<script>

import app from './data/tableapp.json'
import StyledTable from 'canvas/toolbar/components/StyledTable'

export default {
  name: "SketchTest",
  mixins: [],
  data: function() {
    return {
        app: app,
        widget: app.widgets.w10868,
        model: null
    };
  },
  components: {
    'StyledTable': StyledTable
  },
  computed: {
  },
  methods: {
  },
  mounted() {
  }
};
</script>
