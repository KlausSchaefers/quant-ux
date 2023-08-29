<template>
  <div class="MatcLight">
    <h1>Player Test</h1>
    <!--
    <Player :animation="animation1" style="width:400px; height:400px;"/>
    -->
    <Player :animation="animation2" style="width:400px; height:600px;"/>

  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
</style>
<style>

  .MatcAnimtationPlayer{
    display: inline-block;
    margin: 10px;
    border: 1px dashed orange;
    vertical-align: top;
  }
</style>

<script>

import animation1 from './data/animation1.json'
import animation2 from './data/animation2.json'
import Player from 'page/Player'

export default {
  name: "AnimationTest",
  mixins: [],
  data: function() {
    return {
      animation1: animation1,
      animation2: animation2
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
