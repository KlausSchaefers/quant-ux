
<template>
  <div class="MatcToolbarEditMode">
    <a @click="setDesign" :class="['MatcToolbarItem', {'MatcToolbarEditModeActive': canvasViewMode === 'design'  }]">
        Design
    </a>
     <a @click="setPrototype" :class="['MatcToolbarItem', {'MatcToolbarEditModeActive': canvasViewMode === 'prototype' }]">
        Prototype
    </a>
    <a @click="setCode" :class="['MatcToolbarItem', {'MatcToolbarEditModeActive': canvasViewMode === 'data'  }]">
        LowCode
    </a>
  </div>
</template>
<script>

import Logger from "common/Logger";


export default {
  name: "EditModeButton",
  mixins: [],
  props: ['value'],
  data: function() {
    return {
      canvasViewMode: 'design'
    };
  },
  computed: {
    hasData () {
      if (this.value) {
          return this.value.hasDataView
      }
      return true
    }
  },
  components: {},
  methods: {
    setDesign() {
      this.log.log(-1, 'setDesign', 'enter')
      this.value.hasDataView = false
      this.canvasViewMode = 'design'
      this.$emit('canvasViewMode', this.canvasViewMode)
      this.$emit('change', 'hasDataView', false)
    },
    setCode () {
      this.log.log(-1, 'setCode', 'enter')
      this.value.hasDataView = true
      this.canvasViewMode = 'data'
      this.$emit('canvasViewMode', this.canvasViewMode)
      this.$emit('change', 'hasDataView', true)
    },
    setPrototype () {
      this.log.log(-1, 'setPrototype', 'enter')
      this.value.hasDataView = false
      this.canvasViewMode = 'prototype'
      this.$emit('canvasViewMode', this.canvasViewMode)
      this.$emit('change', 'hasDataView', false)
    }
  },
  watch: {
    value (v) {
        this.log.log(2, 'watch(value)', 'enter', v)
        this.value = v
    }
   },
  async mounted() {
    this.log = new Logger("EditModeButton")
  }
};
</script>