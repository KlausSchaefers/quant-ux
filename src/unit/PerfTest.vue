<template>
  <div class="MatcLight">
    Perf

    <button class="MatcButton" @click="runScale">Run scale</button>

    <button class="MatcButton" @click="runScaleFast">Run scale fast</button>

    <button class="MatcButton" @click="runInherit">Run inherit</button>
  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
</style>

<script>

import bigApp from './data/bigApp.json'
import ModelUtil from 'core/ModelUtil'
import CoreUtil from 'core/CoreUtil'

export default {
  name: "ResizeTest",
  mixins: [],
  data: function() {
    return {
      checkBoxChecked: true,
      options: [{ label: "a", value: "a" }, { label: "b", value: "b" }],
      user: "not loaded"
    };
  },
  components: {
  },
  methods: {
    runScale () {
        console.debug("runScale() ", Object.values(bigApp.widgets).length)
        console.time("runScale")
        ModelUtil.createScalledModel(bigApp)

        console.timeEnd("runScale")
    },

    runScaleFast () {
        console.debug("runScaleFast() ", Object.values(bigApp.widgets).length)
        console.time("runScaleFast")
        ModelUtil.createScalledModelFast(bigApp)

        console.timeEnd("runScaleFast")
    },
    runInherit () {
        console.time("runInherit")
        CoreUtil.createInheritedModel(bigApp)
        console.timeEnd("runInherit")
    }
  },
  mounted() {

  }
};
</script>
