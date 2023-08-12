
<template>
    <div class=" MatcToolbarArrowDropDown MatcToolbarDropDownButton MatcToobarHomeSection MatcToobarHomeSectionBlueX">
		<div class="MatcToolbarItem MatcToolbarPrimaryItem" type="button" data-dojo-attach-point="button">
			<img src="../../../style/img/QUXLogo5.svg">
            <span class="caret"></span>
		</div>
        <div class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup" @mousedown.stop>
            <div class="MatcToolbarPopUpWrapper">
                <ul class="" role="menu">
                    <li v-for="i in items" :key="i.value" @click.stop="onSelect(i, $event)" :class="i.css" class="MatcToolbarArrowDropDownItem">
                    
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
import _DropDown from './_DropDown'

export default {
    name: 'CreateBasicButton',
    mixins:[Util, DojoWidget, _DropDown],
    data: function () {
        return {
            selectedTool: null,
            tools: [
                {value: 'startSimilator', icon: '', label: this.getNLS('toolbar.menu.start')},
                {value: 'onShowSettings', icon: '', label: this.getNLS('toolbar.menu.settings')},
                {value: 'showShortCuts', icon: '', label: this.getNLS('toolbar.menu.shortcuts')},
                {value: 1, css:'MatcToolbarPopUpLine'},
                {value: 'showSharing', icon: '', label: this.getNLS('toolbar.menu.share')},
                {value: 'showImportDialog', icon: '', label: this.getNLS('toolbar.menu.import')},
                {value: 'showDownloadDialog', icon: '', label: this.getNLS('toolbar.menu.export')},
                {value: 2, css:'MatcToolbarPopUpLine'},
                {value: 'onChangeScreenSize', icon: '', label: this.getNLS('toolbar.menu.change-screen-size')},
                {value: 'onSaveAs', icon: '', label: this.getNLS('toolbar.menu.save-as')},
                {value: 3, css:'MatcToolbarPopUpLine'},
                {value: 'onExit', icon: '', label: this.getNLS('toolbar.menu.exit')},
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