<template>
  <div class="MatcLight">
    <h1>ConditionalStyleSettings Test</h1>

   <div class="MatcDialog">
      <ConditionalStyleSettings ref="dialog"/>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
</style>
<style>

  .MatcDialog {
      box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2), 0px 0px 2px rgba(0, 0, 0, 0.2);
      overflow: auto;
      margin: 40px;
      background: #fff;
     width: unset;
        display: inline-block;
      padding: 20px;
  }
</style>

<style lang="sass">
  @import "../style/bulma.sass"
</style>


<script>


import Logger from '../core/Logger'
import ConditionalStyleSettings from 'canvas/toolbar/dialogs/ConditionalStyleSettings'
import app from './data/conditonal_style.json'


export default {
  name: "CondStyleTest",
  mixins: [],
  data: function() {
    return {

    };
  },
  components: {
    'ConditionalStyleSettings': ConditionalStyleSettings
  },
  computed: {

  },
  methods: {

  },
  mounted() {
    Logger.setLogLevel(4)
    this.$refs.dialog.setModel(app)
    const w = app.widgets.w10001_42249
    w.conditional = {
        styles: [
            {
                    id: 'cs_' + new Date().getTime(),
                    label: 'Rule 1',
                    databinding : "isVisible",
                    operation: "==",
                    parameter : "12",
                    style: {}
            }
        ]
    }
    this.$refs.dialog.setValue(w)
  }
};
</script>
