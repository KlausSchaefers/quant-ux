<template>
  <div class="MatcLight">
    <h1>Layer Test</h1>
  
    <LayerList :value="app" class="Wrapper" />

  </div>
</template>

<style>
  @import url("../../public/style/matc.css");

  .Wrapper{
    display: inline-block;
    margin: 10px;
    border: 1px dashed orange;
    vertical-align: top;
    widows: 250px;
    height: 400px;;
  }
</style>

<script>

import layerapp from './data/layerapp.json'
import LayerList from 'canvas/toolbar/LayerList'

export default {
  name: "AnimationTest",
  mixins: [],
  data: function() {
    return {
      app: layerapp
    };
  },
  components: {
    'LayerList': LayerList
  },
  methods: {
  
  },
  mounted() {
    
  }
};
</script>
