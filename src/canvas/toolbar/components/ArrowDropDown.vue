
<template>
    <div class=" MatcToolbarArrowDropDown MatcToolbarDropDownButton">
		<div :class="'MatcToolbarItem ' + css " type="button" ref="button">
			<label class="">
                <QIcon :icon="icon" />               
			</label>
            <span class="caret"></span>

		</div>
        <div class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup" @mousedown.stop>
            <div class="MatcToolbarPopUpWrapper">
                <ul class="" role="menu">
                    <li v-for="i in options" :key="i.value" @click.stop="onSelect(i, $event)" :class="i.css" class="MatcToolbarMenuItem">
                        <QIcon class="MatcToolbarPopUpIcon" :icon="i.icon" v-if="i.icon"/>
                        <label class="MatcToolbarPopUpLabel">{{i.label}}</label>
                        <label class="MatcToolbarPopUpLabelShortCut" v-if="i.shortcut" v-html="i.shortcut"></label>
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
    name: 'ArrowDropDown',
    mixins:[Util, DojoWidget, _DropDown],
    props:['options', 'icon', 'css'],
    data: function () {
        return {   
        }
    },
    components: {
        'QIcon':QIcon
    },
    methods: {    
        onSelect (t, e) {   
            this.$emit('select', t, e)
        },
		onHide (){   
			css.remove(this.domNode,"MatcToolbarItemActive");
		}
    },
    mounted () {
    }
}
</script>