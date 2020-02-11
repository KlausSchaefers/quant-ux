<template>
  <div class="MatcLight">
    <h1>TabelConf Test</h1>

    <TableSettings />
  

  </div>
</template>

<style>
  @import url("../../public/style/matc.css");
</style>

<script>

import TableSettings from 'canvas/toolbar/TableSettings'

export default {
  name: "SketchTest",
  mixins: [],
  data: function() {
    return {
        files: [],
        previews: [],
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
