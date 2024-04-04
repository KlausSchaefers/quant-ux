<template>
  <div class="MatcLight">
    <h1>Simulator Test</h1>
    <div class="MatcToolbarRestSettings" style="display: inline-block; width:auto; vertical-align: top; margin-left:30px; width:300px; height:500px">
        <Simulator :app="app2" @onDataBindingChange="onChange"/>
    </div>


      <code style="
        display: inline-block;
        width: 300px;
        height:300px;
        font-size:12px;
        vertical-align: top;
        word-break: break-all;
        white-space: pre;
        word-wrap: break-word;">{{dataBindings}}</code>


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
  }
</style>

<script>

import Simulator from 'core/Simulator'
import rest from './data/rest.json'
import rest2 from './data/rest2.json'

export default {
  name: "SimilatorTest",
  mixins: [],
  data: function() {
    return {
      app: rest,
      app2: rest2,
      dataBindings: ''
    };
  },
  components: {
    'Simulator': Simulator
  },
  methods: {
      onChange (d) {
        this.dataBindings = JSON.stringify(d, null, 2)
        console.debug('onDataBindingChange', d)
      }
  },
  mounted() {

  }
};
</script>
