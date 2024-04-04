
<template>
    <div class="MatcToolbarPopUpContainer " role="menu" data-dojo-attach-point="ctnr" @keydown.stop="" @keypress.stop="" @keyup.stop="">
        <div class=" MatcToolbarTabContainer">
          <div class=" MatcToolbarTabs">
            <a :class="{'MatcToolbarTabActive' : tab === 'position'}" @mousedown.stop="setTab('position')">Position</a>
            <a :class="{'MatcToolbarTabActive' : tab === 'color'}" @mousedown.stop="setTab('color')">Color</a>
          </div>
        </div>
        <div v-show="tab === 'position'" class="MatcShadowSettings">
            <div ref="hSliderCntr" class="MatcBoxShadowSliderCntr">
              <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">X</span>
            </div>

            <div ref="vSliderCntr" class="MatcBoxShadowSliderCntr">
              <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Y</span>
            </div>

            <div ref="bSliderCntr" class="MatcBoxShadowSliderCntr">
              <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Blur</span>
            </div>

            <div ref="sSliderCntr" class="MatcBoxShadowSliderCntr" v-show="type !== 'textShadow' && hasInsertAndSpread">
              <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Spread</span>
            </div>

            <div ref="insertCntr" class="MatcBoxShadowSliderCntr" v-show="type !== 'textShadow' && hasInsertAndSpread">
              <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Insert</span>
            </div>

        </div>

        <div v-show="tab === 'color'" >
          <div ref="colorCntr" >
          </div>
        </div>
	</div>

</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import _DropDown from './_DropDown'
import ToolbarSlider from './ToolbarSlider'
import CheckBox from 'common/CheckBox'
import _Color from 'common/_Color'
import _DesignToken from './_DesignToken'
import ColorPickerSketch from 'common/ColorPickerSketch'

export default {
    name: 'ShadowSettings',
    props:['type'],
    mixins:[_Color, DojoWidget, _DesignToken, _DropDown],
    data: function () {
        return {
            tab: 'position',
            hasInsertAndSpread: true,
            defaultValue: {
              v: 0,
              h: 0,
              b: 0,
              s: 0,
              c: 'rgba(0,0,0,0.25)'
            },
            value: false,
            tempValue: false,
						arrowPosition: "right"
        }
    },
    components: {

    },
    methods: {

      setTab(t) {
        this.tab = t
        this.emit('resize')
      },

      init () {
        if (this.hSlider) {
          return
        }
        this.hSlider = this.renderIntBox(this.$refs.hSliderCntr, 'h')
        this.vSlider = this.renderIntBox(this.$refs.vSliderCntr, 'v')
        this.bSlider = this.renderIntBox(this.$refs.bSliderCntr, 'b', 0, 100, false)
        this.sSlider = this.renderIntBox(this.$refs.sSliderCntr, 's')
        this.renderInset(this.$refs.insertCntr)
				this.picker = this.$new(ColorPickerSketch, {isDialog: true});
				this.picker.placeAt(this.$refs.colorCntr);
				this.own(on(this.picker, "change", lang.hitch(this, "onColorChange")));
				this.own(on(this.picker, "changing", lang.hitch(this, "onTempColorChange")));
			},

			renderInset (parent) {
				this.insertBox = this.$new(CheckBox);
				this.insertBox.placeAt(parent);
				this.tempOwn(on(this.insertBox, "change", lang.hitch(this, "onInsertChange")))
			},

      renderIntBox (parent, param, min = -50, max =50, center = true){
        var input = this.$new(ToolbarSlider,{max:max, min:min, center: center});
        input.placeAt(parent);
        input.render();
				this.own(on(input, "change", lang.hitch(this, "setIntValue", param)));
				this.own(on(input, "changing", lang.hitch(this, "setTempIntValue", param)));
        return input;
      },

      onInsertChange () {
        this.setTempBoxShadow()
      },

      setIntValue () {
        this.setTempBoxShadow()
      },

      setTempIntValue () {
        this.setTempBoxShadow()
      },

			onColorChange (){
        this.setTempBoxShadow()
			},

      onTempColorChange () {
        this.setTempBoxShadow()
      },

			setTempBoxShadow () {
				this.tempValue = {
					v: Math.round(this.vSlider.getValue()),
					h: Math.round(this.hSlider.getValue()),
					b: Math.round(this.bSlider.getValue()),
					s: Math.round(this.sSlider.getValue()),
					i : this.insertBox.getValue(),
					c: this.picker.getValueAsString()
				}
        this.emit('changing', this.tempValue)
			},

      setHasInsertAndSpread (v) {
        this.hasInsertAndSpread = v
      },

			setValuesInWidgets (boxShadow){
				if (this.hSlider){
					this.vSlider.setValue(boxShadow.v);
					this.hSlider.setValue(boxShadow.h);
					this.bSlider.setValue(boxShadow.b);
					this.sSlider.setValue(boxShadow.s);
          this.picker.setValue(boxShadow.c)
          this.insertBox.setValue(boxShadow.i)
				} else {
          console.debug('ShadowSettings.setValuesInWidgets() > No widgets', boxShadow)
        }
			},

			_removeBoxShadow (e){
				this.stopEvent(e);
				this.onChange(null);
			},

			setValue (v){
        this.init()
        this.tab = 'position'
				if (v) {
					this.value = lang.clone(v);
          this.setValuesInWidgets(this.value)
        }
      }
    },
    mounted () {
        this.init()
    }
}
</script>