
<template>
    <div class=" MatcToolbarArrowDropDown  MatcToolbarDropDownButton">
		<div class="MatcToolbarItem MatcMultiIcon" type="button" ref="button">
			<label data-dojo-attach-point="label" class="">
                <QIcon icon="VectorBezier" />        

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
import _DropDown from './_DropDown'
import QIcon from 'page/QIcon'

export default {
    name: 'CreateButton2',
    mixins:[Util, DojoWidget, _DropDown],
    data: function () {
        return {
            tools: [
                {value: 'bezier', icon: 'VectorBezier2', label: 'Curve'},
                {value: 'path', icon: 'VectorPath', label: 'Path'},
                {value: 'rectangle', icon: 'VectorRectangle', label: 'Rectangle'},
                {value: 'triangle', icon: 'VectorTriangle', label: 'Triangle'}
            ]
        }
    },
    components: {QIcon},
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