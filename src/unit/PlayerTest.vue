<template>
  <div class="MatcLight">
    <h1>Player Test</h1>
    
    <Player :animation="animation" />

  </div>
</template>

<style>
  @import url("../../public/style/matc.css");

  .MatcAnimtationPlayer{
    width:400px;
    height: 400px;
    border: 1px dashed orange;
  }
</style>

<script>

import animation1 from './data/animation1.json'
import Player from 'page/Player'

export default {
  name: "AnimationTest",
  mixins: [],
  data: function() {
    return {
      animation: animation1
    };
  },
  components: {
    'Player': Player
  },
  methods: {
  
  },
  mounted() {
    
  }
};
</script>
