
<template>
     <div class=" MatcToolbarItem MatcBoxShadow2">
	    <div type="button" data-dojo-attach-point="button" class="MatcToolbarColorButton">
					<span data-dojo-attach-point="icon" class="MatcToolbarColorIndicator"></span>
					<span v-if="label" class="MatcToolbarItemLabel">{{label}}</span>
			</div>
			<div class="MatcToolbarPopUp MatcBoxShadowPopup MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup">
				<div class="MatcToolbarPopUpContainer" role="menu" data-dojo-attach-point="ctnr" @click.stop="" @mousedown.stop="" @keydown.stop="" @keypress.stop="" @keyup.stop="">
            <div class=" MatcToolbarTabs">
              <a :class="{'MatcToolbarTabActive' : tab === 'position'}" @click="setTab('position')">Postion</a>
              <a :class="{'MatcToolbarTabActive' : tab === 'color'}" @click="setTab('color')">Color</a>
            </div>
            <div v-show="tab === 'position'" >
                <div ref="hSliderCntr" class="MatcBoxShadowSliderCntr">
                  <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">X</span>
                </div>

                <div ref="vSliderCntr" class="MatcBoxShadowSliderCntr">
                  <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Y</span>
                </div>

                <div ref="bSliderCntr" class="MatcBoxShadowSliderCntr">
                  <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Blur</span>
                </div>

                <div ref="sSliderCntr" class="MatcBoxShadowSliderCntr">
                  <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Spread</span>
                </div>

                <div ref="insertCntr" class="MatcBoxShadowSliderCntr">
                  <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Insert</span>
                </div>

            </div>

            <div v-show="tab === 'color'" >
               <div ref="colorCntr" >
               </div>
            </div>

				</div>
				<div data-dojo-attach-point="removeBTN" class="MatcToolbarPopupFooter">
					<span class="MatcToolbarPopupFooterNone mdi mdi-close-circle"></span>
					<span class="MatcToolbarPopupFooterLabel">No Shadow</span>
				</div>
			</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import _DropDown from './_DropDown'
import ToolbarSlider from './ToolbarSlider'
import CheckBox from 'common/CheckBox'
import _Color from 'common/_Color'
import _DesignToken from './_DesignToken'
import ColorPickerSketch from 'common/ColorPickerSketch'

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
            reposition: true,
						arrowPosition: "right"
        }
    },
    components: {},
    methods: {

      setTab(t) {
        this.tab = t
        this.updatePosition()
      },

      onVisible (){
        this.tempValue = false
        this.setValuesInWidgets(this.value)
			},

      onHide () {
        if (this.tempValue) {
          this.emit('change', this.tempValue)
        }
      },

      init (){

				this.own(on(this.removeBTN, touch.press, lang.hitch(this, "_removeBoxShadow")));

        this.hSlider = this.renderIntBox(this.$refs.hSliderCntr, 'h')
        this.vSlider = this.renderIntBox(this.$refs.vSliderCntr, 'v')
        this.bSlider = this.renderIntBox(this.$refs.bSliderCntr, 'b')
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

      renderIntBox (parent, param){
        var input = this.$new(ToolbarSlider,{max:50, min:-50});
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


			setTempBoxShadow (){
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


			setValuesInWidgets (boxShadow){
				if(this.hSlider){
					this.vSlider.setValue(boxShadow.v);
					this.hSlider.setValue(boxShadow.h);
					this.bSlider.setValue(boxShadow.b);
					this.sSlider.setValue(boxShadow.s);
          this.picker.setValue(boxShadow.c)
          this.insertBox.setValue(boxShadow.i)
				}
			},

			_removeBoxShadow (e){
				this.stopEvent(e);
				this.onChange(null);
			},

			setValue (v){

				if (v) {
					this.value = lang.clone(v);
          if (this.icon) {
            this.icon.style.background = v.c
          }
          if (!v.i) {
            this.label = 'Drop Shadow'
          } else {
            this.label = 'Inner Shadow'
          }

				} else {
          this.value = lang.clone(this.defaultValue)
           if (this.icon) {
            this.icon.style.background = ''
          }
          this.label = 'No Shadow'
        }

      }
    },
    mounted () {
    }
}
</script>