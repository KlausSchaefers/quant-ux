
<template>
    <div class=" MatcToolbarArrowDropDown MatcToolbarDropDownButton MatcToobarHomeSection MatcToobarHomeSectionBlueX" @keyup.stop @keydown.stop>
		<div class="MatcToolbarItem MatcToolbarPrimaryItem" type="button" ref="button" @dblclick.stop="onDoubleClick">
			<img src="../../../style/img/QUXLogoWhite.svg">
            <span class="MatcToobarHomeSectionAppNameLabel" v-if="!isEdit">{{modelName}}</span>
            <input class="MatcToobarHomeSectionAppNameInput" v-model="modelName" v-else @change="onBlur" ref="inputName" >
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
import _DropDown from './_DropDown'

export default {
    name: 'CreateBasicButton',
    props: ['name'],
    mixins:[Util, DojoWidget, _DropDown],
    data: function () {
        return {
            isEdit: false,
            modelName: "...",
            tools: [
                {value: 'onExit', icon: '', label: this.getNLS('toolbar.menu.exit')},
                {value: 'startSimilator', icon: '', label: this.getNLS('toolbar.menu.start')},
                {value: 3, css:'MatcToolbarPopUpLine'},
                {value: 'onSaveAs', icon: '', label: this.getNLS('toolbar.menu.save-as')},
                {value: 'showImportDialog', icon: '', label: this.getNLS('toolbar.menu.import')},
                {value: 'showDownloadDialog', icon: '', label: this.getNLS('toolbar.menu.export')},
                {value: 'onChangeScreenSize', icon: '', label: this.getNLS('toolbar.menu.change-screen-size')},
                {value: 'showSharing', icon: '', label: this.getNLS('toolbar.menu.share')},
                {value: 2, css:'MatcToolbarPopUpLine'},
                {value: 'onShowSettings', icon: '', label: this.getNLS('toolbar.menu.settings')},
                {value: 'showShortCuts', icon: '', label: this.getNLS('toolbar.menu.shortcuts')},
                {value: 'showHelp', icon: '', label: this.getNLS('toolbar.menu.help')}
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

        onDoubleClick () {
            this.isEdit = true
            setTimeout(() =>{
                this.$refs.inputName.focus();
                this.$refs.inputName.select();
            }, 100)

        },

        onBlur () {
            const newName = this.$refs.inputName.value
            this.isEdit = false
            this.$emit("change", newName)
        },
    
        onSelect (t, e) {        
            this.$emit('select', t, e)
        },

		onHide (){   
			css.remove(this.domNode,"MatcToolbarItemActive");
		},

		async init (){
			
		},

    },
    watch: {
        name(v) {
            this.modelName = v
        }
    },
    mounted () {
        this.modelName = this.name
    }
}
</script>