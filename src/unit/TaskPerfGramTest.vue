<template>
  <div class="MatcLight">
    <h1>TabelConf Test</h1>

    <div class="dialog MatcDashTaskPerfGramDialog">
      <div ref="cntr"/>
    </div>


  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
  @import "../style/qux.scss";
</style>
<style>

  .dialog {
    background: #fff;
    padding: 20px;
    display: inline-block;
    margin: 20px;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2)
  }
</style>

<style lang="sass">
  @import "../style/bulma.sass"
</style>

<script>

import funnelApp from './data/funnelApp.json'
import funnelEvents from './data/funnelEvents.json'
import funnelTestSettings from './data/funnelTestSettings.json'
import DataFrame from "common/DataFrame";

import TaskPerfGram from '../../src/views/apps/analytics/TaskPerfGram'
import DojoWidget from "dojo/DojoWidget";
import TestSettings from "views/apps/test/TestSettings";
export default {
  name: "TaskPerfGramTest",
  mixins: [TestSettings, DojoWidget],
  data: function() {
    return {
        model: null
    };
  },
  components: {
    
  },
  computed: {
    df() {
      let events = this.filterEvents(funnelEvents, []);
      var actionEvents = this.getActionEvents(new DataFrame(events));
      events = actionEvents.as_array();
      var df = new DataFrame(events);
      df.sortBy("time");
      return df;
    }
  },
  methods: {
  },
  mounted() {
      const task = funnelTestSettings.tasks[0]

        const gram = this.$new(TaskPerfGram, {
          model: funnelApp,
          dialog: null,
          mode: ''
        })
        gram.setValue(this.df, task, [], funnelTestSettings.tasks);
        gram.placeAt(this.$refs.cntr);
  }
};
</script>
