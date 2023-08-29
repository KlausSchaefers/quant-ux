<template>
  <div class="MatcLight">
    <h1>Resize Test</h1>
    <div class="MatcToolbarRestSettings" style="display: inline-block; width:auto; vertical-align: top; margin-left:30px; width:340px; height:500px">
        <Rule :app="app" :l="line"/>
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
  }
</style>

<script>

import Rule from 'canvas/toolbar/components/Rule'
import rest from './data/rest.json'

export default {
  name: "RukeTest",
  mixins: [],
  data: function() {
    return {
      app: rest,
      line: {
        "id" : "l10020",
        "from" : "w10001",
        "to" : "w10019",
        "points" : [ ],
        "event" : "click"
      }
    };
  },
  components: {
    'Rule': Rule
  },
  methods: {
      onChange (d) {
          this.settings = d
      }
  },
  mounted() {

  }
};
</script>
