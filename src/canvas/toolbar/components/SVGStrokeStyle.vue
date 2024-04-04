
<template>
    <div class=" MatcToolbarItem MatcToolbarDropDownButton MatcVectorStrokeProps">
		<div class="" type="button" ref="button">
			<label data-dojo-attach-point="label" class="">
				<span class="mdi mdi-dots-vertical"></span>	
			</label>
		</div>
        <div class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup MatcVectorStrokePropsPopup" role="menu" data-dojo-attach-point="popup">
            <div class="" @click.stop="" @mousedown.stop="">
               
                <div class="MatcToolbarPopUpSection">
                                   
                    <div class="MatcShadowSettings">
                        <h3>Stroke Style</h3>
                        <div ref="dashSliderCntr" class="MatcBoxShadowSliderCntr">
                            <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Dash</span>
                        </div>
                        <div ref="gapSliderCntr" class="MatcBoxShadowSliderCntr">
                            <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Gap</span>
                        </div>                      
                    </div>

                </div>
              
            </div>        
            
            <div class="MatcToolbarPopupFooter" @click.stop="onReset" @mousedown.stop="">
                <span class="MatcToolbarPopupFooterNone mdi mdi-close-circle"></span>
                <span class="MatcToolbarPopupFooterLabel">Reset to Solid</span>
            </div>

           
        </div>
    </div>

</template>
<style scoped>

</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import _DropDown from './_DropDown'
import ToolbarSlider from './ToolbarSlider'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'

export default {
    name: 'SVgStrokeStyle',
    mixins:[Util, DojoWidget, _DropDown],
    data: function () {
        return {
            value: {
                dash:0,
                gap:0
            },
            reposition: true,
            arrowPosition: true,
            selectedStyle: null,
            selectedCap: null,
            styles: [
                {value: null, label: 'Solid'},
                {value: 'dash', label: 'Dash'},
            ],
            caps: [
                { value:null, label: 'Square'},
                { value:"round", label:'Round'}
            ]
        }
    },
    components: {        
    },
    methods: {

        renderIntBox (parent, param, min = 0, max = 24, center = false){
            const input = this.$new(ToolbarSlider,{max:max, min:min, center: center});
            input.placeAt(parent);
            input.render();
            this.own(on(input, "change", lang.hitch(this, "setIntValue", param)));
            this.own(on(input, "changing", lang.hitch(this, "setIntValue", param)));
            return input;
        },

        setIntValue (key, value) {
            this.isDirty = true
            this.value[key] = value
            this.emit('changing', 'strokeDash', `${this.value.dash},${this.value.gap}`)
        },

        onReset () {
            console.debug('onReset')
            this.value.dash = 0
            this.value.gap = 0
            this.isDirty = true
            this.dashSlider.setValue(0)
            this.gapSlider.setValue(0)    
            this.emit('changing', 'strokeDash', `${this.value.dash},${this.value.gap}`)
        },

        setValue (value) {
            this.dashSlider.setValue(0)
            this.gapSlider.setValue(0)    
            if (!value || !value.split) {
                return
            }
            const parts = value.split(',')
            if (parts.length !== 2) {
                return
            }

            this.dashSlider.setValue(parts[0] * 1)
            this.gapSlider.setValue(parts[1] * 1)         
            this.isDirty = false
        },

		onHide (){
			if (this.isDirty) {
                this.emit('change', 'strokeDash', `${this.value.dash},${this.value.gap}`)
            }
		},

    },
    mounted () {
        this.dashSlider = this.renderIntBox(this.$refs.dashSliderCntr, 'dash')
        this.gapSlider = this.renderIntBox(this.$refs.gapSliderCntr, 'gap')
    }
}
</script>