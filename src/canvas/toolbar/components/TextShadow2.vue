
<template>
		<div class=" MatcToolbarItem MatcBoxShadow2 MatcTextShadow">
				<div type="button" data-dojo-attach-point="button" class="MatcToolbarColorButton">
				<span data-dojo-attach-point="lbl" class="MatcToolbarItemIcon MatcTexShadowIcon">T</span>
				<span class="caret"></span>
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

import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import ColorPickerSketch from 'common/ColorPickerSketch'
import BoxShadow2 from './BoxShadow2'

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
    components: {},
    methods: {

      init (){

				this.own(on(this.removeBTN, touch.press, lang.hitch(this, "_removeBoxShadow")));

        this.hSlider = this.renderIntBox(this.$refs.hSliderCntr, 'h')
        this.vSlider = this.renderIntBox(this.$refs.vSliderCntr, 'v')
        this.bSlider = this.renderIntBox(this.$refs.bSliderCntr, 'b')

				this.picker = this.$new(ColorPickerSketch, {isDialog: true});
				this.picker.placeAt(this.$refs.colorCntr);

				this.own(on(this.picker, "change", lang.hitch(this, "onColorChange")));
				this.own(on(this.picker, "changing", lang.hitch(this, "onTempColorChange")));

			},

      setTempBoxShadow (){
				this.tempValue = {
					v: Math.round(this.vSlider.getValue()),
					h: Math.round(this.hSlider.getValue()),
					b: Math.round(this.bSlider.getValue()),
					c: this.picker.getValueAsString()
				}
        this.emit('changing', this.tempValue)
			},


			setValuesInWidgets (boxShadow){
				if(this.hSlider){
					this.vSlider.setValue(boxShadow.v);
					this.hSlider.setValue(boxShadow.h);
					this.bSlider.setValue(boxShadow.b);
          this.picker.setValue(boxShadow.c)
				}
			}

    },
    mounted () {
    }
}
</script>