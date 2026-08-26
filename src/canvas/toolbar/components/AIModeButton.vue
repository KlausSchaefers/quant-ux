
<template>
   <div :class="['MatcToolbarEditMode', {'MatcToolbarEditModeAnimated': animated}]">
  
    <div class="MatcToolbarEditModeCntr" ref="cntr">
      <div class="MatcToolbarEditModeHighlight" :style="{'width': highlightWidth + 'px', 'left': highlightX + 'px'}">

      </div>
      <a @click="setLayers" :class="['MatcToolbarItem', {'MatcToolbarEditModeActive': mode === 'layers'  }]" ref="btnLayers">     
          Layers
      </a>
      <a @click="setAI" :class="['MatcToolbarItem', {'MatcToolbarEditModeActive': mode === 'ai' }]" ref="btnAI">
            AI (Beta)
      </a>
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
      mode: 'layers'
    };
  },
  computed: {
    
  },
  components: {},
  methods: {
    setLayers() {
      this.log.log(1, 'setLayers', 'enter')   
      this.mode = 'layers'
      this.setSelected(this.$refs.btnLayers)
      
    },
    setAI () {
      this.log.log(1, 'setCode', 'enter')
      this.mode = 'ai'
      this.setSelected(this.$refs.btnAI)
    },
    setSelected (node) {
      const pos = domGeom.position(node)
      const cPos = domGeom.position(this.$refs.cntr)
      this.highlightWidth = pos.w
      this.highlightX = pos.x- cPos.x -1
      this.$emit('change', this.mode)
    },
    // nextView() {
    //     if (this.canvasViewMode === 'design') {
    //       this.setPrototype()
    //       return
    //     }
    //     if (this.canvasViewMode === 'prototype') {
    //       this.setDesign()
    //       return
    //     }
    //     // if (this.canvasViewMode === 'data') {
    //     //   this.setDesign()
    //     //   return
    //     // }
    // }
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
      this.setSelected(this.$refs.btnLayers)
    }, 30)

    setTimeout(() => this.animated = true, 500)
  }
};
</script>