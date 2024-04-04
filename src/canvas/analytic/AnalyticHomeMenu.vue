
<template>
    <div class=" MatcToolbarArrowDropDown MatcToolbarDropDownButton MatcToobarHomeSection MatcToobarHomeSectionBlueX">
		<div class="MatcToolbarItem MatcToolbarPrimaryItem" type="button" ref="button">
			<img src="../../style/img/QUXLogoWhite.svg">
            <span class="MatcToobarHomeSectionAppNameLabel" >{{name}}</span>
            <span class="caret"></span>
		</div>
        <div class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup" @mousedown.stop>
            <div class="MatcToolbarPopUpWrapper">
                <ul class="" role="menu">
                    <li v-for="i in items" :key="i.value" @click.stop="onSelect(i, $event)" :class="i.css" class="MatcToolbarMenuItem">
                    
                        <label class="MatcToolbarPopUpLabel">{{i.label}}</label>

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
//import QIcon from 'page/QIcon'
import _DropDown from '../toolbar/components/_DropDown'


export default {
    name: 'CreateBasicButton',
    mixins:[Util, DojoWidget, _DropDown],
    props:['name'],
    data: function () {
        return {
            selectedTool: null,
            tools: [               
                {value: 'onExit', icon: '', label: this.getNLS('toolbar.menu.exit')},
                {value: 3, css:'MatcToolbarPopUpLine'},
                {value: 'onShowSettings', icon: '', label: this.getNLS('toolbar.menu.settings')},       
                {value: 'showHelp', icon: '', label: this.getNLS('toolbar.menu.help')},         
            ]
        }
    },
    computed: {
        items () {       
            return this.tools
        }
    },
    components: {
        //'QIcon':QIcon
    },
    methods: {

    
        onSelect (t, e) {        
            this.$emit('select', t, e)
        },

		onHide (){   
			css.remove(this.domNode,"MatcToolbarItemActive");
            this.selectedTool = null
		},

		async init (){
			
		},

    },
    mounted () {
    }
}
</script>