
<template>
	  <div class="MatcDesignTokenMixin">
      <DesignTokenView v-show="hasDesignToken" :designtoken="currentDesignToken"/>
      <div class="MatcBoxShadow2" v-show="!hasDesignToken">
        <div type="button" ref="button" class="MatcToolbarItem MatcToolbarDropDownButton MatcToolbarIconButton">
            <QIcon :icon="icon"/>
            <span v-if="label" class="MatcToolbarItemLabel">{{label}}</span>
        </div>
      </div>

        <div class="MatcToolbarPopUp MatcBoxShadowPopup MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup" @click.stop="" @mousedown.stop="" >
          <ShadowSettings ref="settings" @changing="onTempChange" @resize="onResize"/>
           <div class="MatcToolbarPopupFooter" @click="onRemove">
            <QIcon icon="Delete"/>
            <span class="MatcToolbarPopupFooterLabel">No Shadow</span>
          </div>
        </div>

	</div>

</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import _DropDown from './_DropDown'
import _Color from 'common/_Color'
import _DesignToken from './_DesignToken'
import DesignTokenView from './DesignTokenView'
import ShadowSettings from './ShadowSettings'
import QIcon from 'page/QIcon'

export default {
    name: 'BoxShadow',
    mixins:[_Color, DojoWidget, _DesignToken, _DropDown],
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
            activeLabel: '',
            reposition: true,
						arrowPosition: "right",
            labelPrefixFix: '',
            icon: 'BoxShadowNone'
        }
    },
    components: {
      'DesignTokenView': DesignTokenView,
      'ShadowSettings': ShadowSettings,
      'QIcon': QIcon
    },
    methods: {

      setLabelPrefixFix (l) {
        this.labelPrefixFix = l
      },

      setLabelPostFix (l) {
        this.labelPostFix = l
      },

      onVisible (){
        this.tempValue = false
        this.$refs.settings.setValue(this.value)
			},

      onResize () {
        this.updatePosition()
      },

      setHasInsertAndSpread (v) {
        if (this.$refs.settings) {
          this.$refs.settings.setHasInsertAndSpread(v)
        }
      },

      onHide () {
        if (this.tempValue && (this.tempValue.v !== 0 || this.tempValue.h !== 0 || this.tempValue.s !== 0 || this.tempValue.b !== 0)) {
          this.emit('change', this.tempValue)
        }
      },

      onTempChange (v) {
        this.tempValue = v
        this.emit('changing', this.tempValue)
      },

			onRemove (e){
        this.tempValue = false
				this.stopEvent(e);
				this.onChange(null);
			},

			setValue (v){

				if (v) {
					this.value = lang.clone(v);
          this.icon = 'BoxShadow'
          
          if (!v.i) {
            this.label = 'Drop Shadow'
          } else {
            this.label = 'Inner Shadow'
          }

				} else {
          this.value = lang.clone(this.defaultValue)
          this.icon = 'BoxShadowNone'
          this.label = 'No Shadow'
        }

        if (this.labelPrefixFix) {
          this.label = this.labelPrefixFix + ' ' + this.label;
        }

        if (this.labelPostFix) {
          this.label += ' (' + this.labelPostFix +')'
        }
      }
    },
    mounted () {
      this.setCssProps(['boxShadow'])
    }
}
</script>