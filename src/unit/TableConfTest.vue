<template>
  <div class="MatcLight">
    <h1>TabelConf Test</h1>

    <TableSettings :app="app" :value="widget"/>
  

  </div>
</template>

<style>
  @import url("../../public/style/matc.css");
</style>

<script>

import app from './data/tableapp.json'
import TableSettings from 'canvas/toolbar/TableSettings'

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
    'TableSettings': TableSettings
  },
  computed: {
  },
  methods: {
  },
  mounted() {
  }
};
</script>
