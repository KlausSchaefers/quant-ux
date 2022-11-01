
<template>
    <div class=" MatcToolbarItem MatcToolbarDropDownButton MatcVectorStrokeProps">
		<div class="" type="button" data-dojo-attach-point="button">
			<label data-dojo-attach-point="label" class="">
				<span class="mdi mdi-dots-vertical"></span>	
			</label>
		</div>
        <div class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup MatcVectorStrokePropsPopup" role="menu" data-dojo-attach-point="popup">
            <div class="" @click.stop="" @mousedown.stop="">
                <div class="MatcToolbarPopUpSection">
                    <label class="MatcToolbarPopUpLabel">Stroke style</label>
                    <SegmentButton :options="styles" @change="setStyle" :value="selectedStyle"/>
                </div>
                <div class="MatcToolbarPopUpSection" v-if="selectedStyle === 'dash'">
                    <div>
                        <label class="MatcToolbarPopUpLabel">Dash</label>
                        <input @change="onDash"/> 
                    </div>

                    <div>
                        <label class="MatcToolbarPopUpLabel">Gap</label>
                        <input @change="onDash"/> 
                    </div>
                  
                </div>
                <div class="MatcToolbarPopUpSection">
                    <label class="MatcToolbarPopUpLabel">Joint Style</label>
                    <SegmentButton :options="caps" @change="setCap" :value="selectedCap"/>
                </div>
            </div>           

           
        </div>
    </div>

</template>
<style scoped>

</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import Util from 'core/Util'
import _DropDown from './_DropDown'
import SegmentButton from 'page/SegmentButton'

export default {
    name: 'SVgStrokeStyle',
    mixins:[Util, DojoWidget, _DropDown],
    data: function () {
        return {
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
        SegmentButton
    },
    methods: {

        setCap (s) {
            this.selectedCap = s
            this.emit("changeCap", s)
            this.hideDropDown()
        },
    
        setStyle (s) {
            this.selectedStyle = s
            //this.updatePosition()
            //this.emit("changeDash", s)
            //this.hideDropDown()
        },

        onDash () {

        },

		onHide (){
			css.remove(this.domNode,"MatcToolbarItemActive");
		},

		async init (){
			
		},

    },
    mounted () {
    }
}
</script>