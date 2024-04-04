
<template>
  <div class=" MatcToolbarItem MatcBoxShadow2 MatcTextShadow" ref="button">
      <div type="button" >
        <QIcon icon="TextShadow"></QIcon>
      </div>
      <div class="MatcToolbarPopUp MatcBoxShadowPopup MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup" @click.stop="" @mousedown.stop="" >
        <ShadowSettings ref="settings" @changing="onTempChange" @resize="onResize" type="textShadow"/>
         <div class="MatcToolbarPopupFooter" @click="onRemove">
          <span class="MatcToolbarPopupFooterNone mdi mdi-close-circle"></span>
          <span class="MatcToolbarPopupFooterLabel">No Shadow</span>
        </div>
      </div>
  </div>
</template>
<script>

import BoxShadow2 from './BoxShadow2'
import QIcon from 'page/QIcon'

export default {
  name: 'TextShadow2',
  mixins:[BoxShadow2],
  data: function () {
      return {
          tab: 'position',
          defaultValue: {
            v: 0,
            h: 0,
            b: 0,
            s: 0,
            c: 'rgba(0,0,0,0.25)'
          },
          value: false,
          tempValue: false,
          label: '',
          reposition: true,
          arrowPosition: "right"
      }
  },
  components: {
    'QIcon': QIcon
  },
  methods: {

    onHide () {
      if (this.tempValue && (this.tempValue.v !== 0 || this.tempValue.h !== 0 || this.tempValue.b !== 0)) {
        this.emit('change', this.tempValue)
      }
    },

    onTempChange (v) {
      this.tempValue = v
      this.emit('changing', this.tempValue)
    },

  }

}
</script>