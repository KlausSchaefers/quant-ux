
<template>
    <div class=" MatcToolbarArrowDropDown  MatcToolbarDropDownButton">
		<div class="MatcToolbarItem MatcMultiIcon" type="button" ref="button">
			<label data-dojo-attach-point="label" class="">
                <QIcon icon="Cloud" />     
			</label>
		</div>
        <div class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup">
            <div class="MatcToolbarPopUpWrapper">
                <ul class="" role="menu" data-dojo-attach-point="ul">
                    <li v-for="t in tools" :key="t.id" @click="onSelect(t)">
                        <QIcon class="MatcToolbarPopUpIcon" :icon="t.icon" />
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
import QIcon from 'page/QIcon'
import _DropDown from './_DropDown'

export default {
    name: 'CreateButton2',
    mixins:[Util, DojoWidget, _DropDown],
    data: function () {
        return {
            tools: [
                {value: 'rest', icon: 'Cloud', label: 'Rest'},
                {value: 'logic', icon: 'OR', label: 'OR'},
                {value: 'script', icon: 'JS', label: 'Script'}
            ]
        }
    },
    components: {
        'QIcon':QIcon
    },
    methods: {
    
        onSelect (t) {          
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