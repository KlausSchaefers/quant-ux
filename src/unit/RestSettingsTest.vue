<template>
  <div class="MatcLight">
    <h1>Resize Test</h1>
    <div class="MatcDialog">
        <RestSettings :app="app"/>
    </div>
   

  </div>
</template>

<style>
  @import url("../../public/style/matc.css");
  .MatcToolbarRestSettings {
      background: white;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
      padding:20px;
  }
</style>

<script>

import RestSettings from 'canvas/toolbar/RestSettings'
import rest from './data/rest.json'

export default {
  name: "ResizeTest",
  mixins: [],
  data: function() {
    return {
      app: rest
    };
  },
  components: {
    RestSettings: RestSettings
  },
  methods: {
  
  },
  mounted() {
    
  }
};
</script>
