
<template>
   <div :class="['MatcToolbarEditMode', {'MatcToolbarEditModeAnimated': animated}]">
  
    <div class="MatcToolbarEditModeCntr" ref="cntr">
      <div class="MatcToolbarEditModeHighlight" :style="{'width': highlightWidth + 'px', 'left': highlightX + 'px'}">

      </div>
      <a @click="setDesign" :class="['MatcToolbarItem', {'MatcToolbarEditModeActive': canvasViewMode === 'design'  }]" ref="btnEdit">     
          Design
      </a>
      <a @click="setPrototype" :class="['MatcToolbarItem', {'MatcToolbarEditModeActive': canvasViewMode === 'prototype' }]" ref="btnProto">
            Prototype
      </a>
      <!-- <a @click="setPrototype" :class="['MatcToolbarItem', {'MatcToolbarEditModeActive': canvasViewMode === 'analytics' }]" ref="btnProto">
            Analytics
      </a>
      -->
    </div>

  </div>
</template>
<script>

import Logger from "common/Logger";
import _Tooltip from 'common/_Tooltip'
import NLS from 'common/NLS'
import domGeom from 'dojo/domGeom'

export default {
  name: "EditModeButton",
  mixins: [_Tooltip, NLS],
  props: ['value'],
  data: function() {
    return {
      animated: false,
      highlightWidth: 0,
      highlightX: 0,
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
      this.setSelected(this.$refs.btnEdit)
    },
    setCode () {
      this.log.log(1, 'setCode', 'enter')
      this.value.hasDataView = true
      this.canvasViewMode = 'data'
      this.$emit('canvasViewMode', this.canvasViewMode)
      this.$emit('change', 'hasDataView', true)
      this.$emit('change', 'renderLines', false)
      this.setSelected(this.$refs.btnCode)
    },
    setPrototype () {
      this.log.log(1, 'setPrototype', 'enter')
      this.value.hasDataView = false
      this.canvasViewMode = 'prototype'
      this.$emit('canvasViewMode', this.canvasViewMode)
      this.$emit('change', 'hasDataView', false)
      this.$emit('change', 'renderLines', true)
      this.setSelected(this.$refs.btnProto)
    },
    setSelected (node) {
      const pos = domGeom.position(node)
      const cPos = domGeom.position(this.$refs.cntr)
      this.highlightWidth = pos.w
      this.highlightX = pos.x- cPos.x -1
    },
    nextView() {
        if (this.canvasViewMode === 'design') {
          this.setPrototype()
          return
        }
        if (this.canvasViewMode === 'prototype') {
          this.setDesign()
          return
        }
        // if (this.canvasViewMode === 'data') {
        //   this.setDesign()
        //   return
        // }
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
    this.addTooltip(this.$el, this.getNLS("tooltip.editmode"))
    // this.addTooltip(this.$refs.btnEdit, this.getNLS("tooltip.editmode"))
    // this.addTooltip(this.$refs.btnProto, this.getNLS("tooltip.protomode"), "vommondToolTipRightBottom")
    // some evil hack, because on startup, the
    // flex because is not for sure correctly rendered
    setTimeout(() => {
      this.setSelected(this.$refs.btnEdit)
    }, 30)

    setTimeout(() => this.animated = true, 500)
  }
};
</script>