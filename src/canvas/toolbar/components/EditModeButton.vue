
<template>
  <div class="MatcToolbarEditMode">
    <a @click="setDesign" :class="['MatcToolbarItem', {'MatcToolbarEditModeActive': canvasViewMode === 'design'  }]">
      <span class="MatcToolbarResponsiveIcon mdi  mdi-file-edit-outline"/>
      <span class="MatcToolbarResponsiveLabel">
        Design
      </span>
    </a>
     <a @click="setPrototype" :class="['MatcToolbarItem', {'MatcToolbarEditModeActive': canvasViewMode === 'prototype' }]">
        <span class="MatcToolbarResponsiveIcon mdi mdi-vector-line"/>
        <span class="MatcToolbarResponsiveLabel">
          Prototype
        </span>
    </a>
    <a @click="setCode" :class="['MatcToolbarItem', {'MatcToolbarEditModeActive': canvasViewMode === 'data'  }]">
        <span class="MatcToolbarResponsiveIcon mdi mdi-code-tags"/>
        <span class="MatcToolbarResponsiveLabel">
          LowCode
        </span>
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
      this.log.log(1, 'setDesign', 'enter')
      this.value.hasDataView = false
      this.canvasViewMode = 'design'
      this.$emit('canvasViewMode', this.canvasViewMode)
      this.$emit('change', 'hasDataView', false)
      this.$emit('change', 'renderLines', false)
    },
    setCode () {
      this.log.log(1, 'setCode', 'enter')
      this.value.hasDataView = true
      this.canvasViewMode = 'data'
      this.$emit('canvasViewMode', this.canvasViewMode)
      this.$emit('change', 'hasDataView', true)
      this.$emit('change', 'renderLines', false)
    },
    setPrototype () {
      this.log.log(1, 'setPrototype', 'enter')
      this.value.hasDataView = false
      this.canvasViewMode = 'prototype'
      this.$emit('canvasViewMode', this.canvasViewMode)
      this.$emit('change', 'hasDataView', false)
      this.$emit('change', 'renderLines', true)
    },
    nextView() {
        if (this.canvasViewMode === 'design') {
          this.setPrototype()
          return
        }
        if (this.canvasViewMode === 'prototype') {
          this.setCode()
          return
        }
        if (this.canvasViewMode === 'data') {
          this.setDesign()
          return
        }
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