
<template>
    <div class=" MatcCreateVectorBtn  MatcToolbarDropDownButton">
		<div class="MatcToolbarItem MatcMultiIcon" type="button" data-dojo-attach-point="button">
			<label data-dojo-attach-point="label" class="">
				<span class="mdi mdi-vector-curve"></span>
				<span class="mdi mdi-plus-circle MatcTinyIcon MatcTinyIconAnimated"></span>
			</label>

		</div>
        <div class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup">
            <div class="">
                <ul class="" role="menu" data-dojo-attach-point="ul">
                    <li v-for="t in tools" :key="t.id" @click="onSelect(t)">
                        <span :class="'MatcToolbarPopUpIcon ' + t.icon"/>
                        <label class="MatcToolbarPopUpLabel">{{t.label}}</label>
                    </li>
                  
			    </ul>
            </div>
            

            <div class="MatcToolbarPopUpArrowCntr">
                <div class="MatcToolbarPopUpArrow">
                </div>
            </div>
        </div>
    </div>

</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import Util from 'core/Util'
import _DropDown from './_DropDown'

export default {
    name: 'CreateButton2',
    mixins:[Util, DojoWidget, _DropDown],
    data: function () {
        return {
            tools: [
                {value: 'bezier', icon: 'mdi mdi-vector-bezier', label: 'Curve'},
                {value: 'path', icon: 'mdi mdi-vector-line', label: 'Path'},
                {value: 'rectangle', icon: 'mdi mdi-vector-rectangle', label: 'Rectangle'},
                {value: 'triangle', icon: 'mdi mdi-vector-triangle', label: 'Triangle'}
            ]
        }
    },
    components: {},
    methods: {
    
        onSelect (t) {
            console.debug('onSelect', t)
            this.$emit('add', t)
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