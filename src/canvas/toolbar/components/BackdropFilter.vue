
<template>
	  <div class="MatcDesignTokenMixin">
      <DesignTokenView v-show="hasDesignToken" :designtoken="currentDesignToken"/>
      <div class="MatcBoxShadow2" v-show="!hasDesignToken">
        <div type="button" ref="button" class="MatcToolbarItem MatcToolbarDropDownButton MatcToolbarIconButton">
            <QIcon :icon="icon"/>
            <span v-if="label" class="MatcToolbarItemLabel">{{label}}</span>
        </div>
      </div>

        <div class="MatcToolbarPopUp MatcBoxShadowPopup MatcToolbarDropDownButtonPopup " role="menu" data-dojo-attach-point="popup" @click.stop="" @mousedown.stop="" >

         <div class="MatcToolbarPopUpContainer">
            <div class="MatcShadowSettings">
              <div ref="blurSliderCntr" class="MatcBoxShadowSliderCntr">
                  <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Blur</span>
              </div>
            </div>
          </div> 
           <div class="MatcToolbarPopupFooter" @click="onRemove">
            <QIcon icon="Delete"/>
            <span class="MatcToolbarPopupFooterLabel">No Background Blur</span>
          </div>
        </div>

	</div>

</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import _DropDown from './_DropDown'
import _Color from 'common/_Color'
import _DesignToken from './_DesignToken'
import DesignTokenView from './DesignTokenView'
import ToolbarSlider from './ToolbarSlider'
import QIcon from 'page/QIcon'

export default {
    name: 'BackgroundBlur',
    mixins:[_Color, DojoWidget, _DesignToken, _DropDown],
    data: function () {
        return {
            tab: 'position',
            defaultValue: {
              blur: 0
            },
            value: false,
            tempValue: false,
            label: '',
            reposition: true,
						arrowPosition: "right",
            icon: 'BlurNone'
        }
    },
    components: {
      'DesignTokenView': DesignTokenView,
      'QIcon': QIcon
    },
    methods: {

      init () {
        if (this.blurSlider) {
          return
        }
        this.blurSlider = this.renderIntBox(this.$refs.blurSliderCntr, 'blur')

			},

      renderIntBox (parent, param){
        var input = this.$new(ToolbarSlider,{max:100, min:0});
        input.placeAt(parent);
        input.render();
				this.own(on(input, "change", lang.hitch(this, "setIntValue", param)));
				this.own(on(input, "changing", lang.hitch(this, "setTempIntValue", param)));
        return input;
      },

      setIntValue () {
        this.setTempFilter()
      },

      setTempIntValue () {
        this.setTempFilter()
      },

      setTempFilter () {
        this.tempValue = {
					blur: Math.round(this.blurSlider.getValue())
				}
        this.emit('changing', this.tempValue)
      },

      setValuesInWidgets (backFilter){
				if (this.blurSlider){
					this.blurSlider.setValue(backFilter.blur)
				}
			},


      onVisible (){
        this.tempValue = false
			},

      onResize () {
        this.updatePosition()
      },

      onHide () {
        if (this.tempValue && (this.tempValue.blur !== 0)) {
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
          this.label = 'Backdrop Blur (' + this.value.blur + ')'
          this.icon = 'Blur'
				} else {
          this.value = lang.clone(this.defaultValue)
          this.label = 'No Blur'
          this.icon = 'BlurNone'
        }
        this.setValuesInWidgets(this.value)

      }
    },
    mounted () {
      this.setCssProps(['backdropFilter'])
      this.init()
    }
}
</script>