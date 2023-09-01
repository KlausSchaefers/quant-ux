
<template>
    <div class=" MatcToolbarArrowDropDown MatcToolbarDropDownButton">
		<div class="MatcToolbarItem MatcToolbarPrimaryItem" type="button" data-dojo-attach-point="button">
            <QIcon icon="Plus" />
            <span class="MatcToolbarResponsiveLabel">Insert</span>    
            <!-- <span class="caret"></span> -->

		</div>
 

        <div class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup" @mousedown.stop>
            <div class="MatcToolbarPopUpWrapper">
                <ul class="" role="menu">
                    <li v-for="i in items" :key="i.value" @click.stop="onSelect(i, $event)" @mouseover="onHover(i)" :class="i.css" class="MatcToolbarMenuItem">
                        <QIcon class="MatcToolbarPopUpIcon" :icon="i.icon" />
                        <label class="MatcToolbarPopUpLabel">{{i.label}}</label>
                        <label class="MatcToolbarPopUpLabelShortCut" v-if="i.shortcut">{{i.shortcut}}</label>

                        <div v-if="i.value === selectedTool" class="MatcToolbarPopUpSubMenu">
                            <ul class="MatcToolbarPopUpWrapper" role="menu" >
                                <li v-for="c in i.children" :key="c.value" @click.stop="onSelect(c)" class="MatcToolbarMenuItem" >
                                    <QIcon class="MatcToolbarPopUpIcon" :icon="c.icon" />
                                    <label class="MatcToolbarPopUpLabel">{{c.label}}</label>
                                    <label class="MatcToolbarPopUpLabelShortCut" v-if="i.shortcut">{{i.shortcut}}</label>
                                </li>
                            </ul>
                            <div class="MatcToolbarPopUpArrowCntr">
                                <div class="MatcToolbarPopUpArrow">
                                </div>
                            </div>
                        </div>
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
import css from 'dojo/css'
import Util from 'core/Util'
import QIcon from 'page/QIcon'
import _Tooltip from 'common/_Tooltip'
import _DropDown from './_DropDown'


export default {
    name: 'CreateBasicButton',
    mixins:[Util, _DropDown, _Tooltip],
    data: function () {
        return {
            selectedTool: null,
            tools: [
                // {value: 'screen', icon: 'DeviceMobile', label: 'Screen', shortcut: 'S'},
                {value: 'box', icon: 'BoxWide', label: 'Rectangle', shortcut:'R'},
                {value: 'text', icon: 'Text', label: 'Text', shortcut:'T'},
                {value: 'hotspot', icon: 'Hotspot', label: 'Hotspot', shortcut:'H'},
                {value: 1, css:'MatcToolbarPopUpLine'},
                {value: 'logic', icon: 'Cloud', label: 'Logic', children:[
                    {value: 'rest', icon: 'Cloud', label: 'Rest'},
                    {value: 'logic', icon: 'OR', label: 'OR'},
                    {value: 'ab', icon: 'AB', label: 'AB'},
                    {value: 'script', icon: 'JS', label: 'Script'}
                ]},

                {value: 'vector', icon: 'VectorBezier', label: 'Vector', children:[
                    {value: 'bezier', icon: 'VectorBezier2', label: 'Curve', type:'vector'},
                    {value: 'path', icon: 'VectorPath', label: 'Path', type:'vector'},
                    {value: 'rectangle', icon: 'VectorRectangle', label: 'Rectangle', type:'vector'},
                    {value: 'triangle', icon: 'VectorTriangle', label: 'Triangle', type:'vector'}
                ]},
                {value: 2, css:'MatcToolbarPopUpLine'},
                {value: 'designgpt', icon: 'Robot', label: 'Design GPT'},
            ]
        }
    },
    computed: {
        items () {       
            return this.tools
        }
    },
    components: {
        'QIcon':QIcon
    },
    methods: {

        onHover (t) {
            if (t.children) {
                this.selectedTool = t.value
                return
            }
            this.selectedTool = null
        },
    
        onSelect (t, e) {          
            if (t.children) {
                this.selectedTool = t.value
                return
            }
            this.$emit('add', t, e)
            this.selectedTool = null
        },

		onHide (){   
			css.remove(this.domNode,"MatcToolbarItemActive");
            this.selectedTool = null
		},

		async init (){
			
		},

    },
    mounted () {
        this.addTooltip(this.$el, "Add basic elements")
    }
}
</script>