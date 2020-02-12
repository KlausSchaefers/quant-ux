
<template>
    <div class="MatcToolbarDropDownButton MatcToolbarItem ">
		<div type="button" data-dojo-attach-point="button">
			<label data-dojo-attach-point="label" class="MatcToolbarItemIcon"></label>
			<span data-dojo-attach-point="caret" class="caret"></span>
		</div>
		<div class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup">
            <ul @click.stop="" @mousedown.stop="" @mouseup.stop="" v-show="!hasColors" ref="optionCntr" style="width:200px">
                <li v-for="(option,i) in options" :key="i" @click="selectOption(option)">
                    <label v-if="option.type === 'color'" class="MatcToolbarPopUpLabel" >
                        <span :class="'MatcToolbarPopUpIcon MatcToolbarPopUpIconTextShadow ' + option.icon" :style="{'color': option.value}"/>
                        {{option.label}}
                    </label>
                    <CheckBox v-if="option.type === 'check'" :value="option.value" :label="option.label"/>
                    <input v-if="option.type === 'int'" class=""/>
                </li>
            </ul>
            <div v-show="hasColors" ref="colorCntr">
            </div>
            <span 
                class="mdi mdi-chevron-left MatcToolbarPopUpBackBtn" 
                v-show="hasColors" 
                @mousedown.stop="" 
                @mouseup.stop="" 
                @click.stop="showOptions"/>
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import ToolbarColor from 'canvas/toolbar/ToolbarColor'
import domGeom from 'dojo/domGeom'
import CheckBox from 'common/CheckBox'
import Logger from 'common/Logger'
import Util from 'core/Util'

export default {
    name: 'DropDownTree',
	mixins:[Util, DojoWidget, ToolbarColor],
    data: function () {
        return {
            value: null,
            updateColor: false,
            updateBackground: false,
            updateLabel: false,
            updateLabelBackground: false,
            hasCustomColor: true,
            reposition: true,
            columns: 10,
            hasGradient: false,
            arrowPosition: "right",
            options: [],
            model: null,
            hasColors: false
        }
    },
    components: {
        'CheckBox': CheckBox
    },
    methods: {
	    init (){
		
        },

        selectOption (option) {
            this.logger.log(-1, 'showColors', 'selectOption', option.label)
            this.selectedOption = option
            if (option.type === 'color') {
                this.showColors(option)
            }
            if (option.type === 'check') {
                this.toggleOption(option)
            }
        },

        toggleOption (option) {
            option.value = !option.value
            let value = option.value ? option.valueTrue : option.valueFalse
            this.logger.log(-1, 'toggleOption', 'enter >' + option.key, value)
            setTimeout( () => {
                this.onChange(value)
            }, 150)
        },
        
        showColors (option) {
            this.logger.log(-1, 'showColors', 'enter', option.key)
            this.hasColors = true
            this.value = option.value
            
            this.$refs.colorCntr.innerHTML = ''
            let cntr = this._renderColorWidgets(this.$refs.colorCntr)
            this.renderRemovePopupFooter("No Color", () => this, "setTransparent");
            this.setColorValues()
            this.onSelectTab(0, true)
            this.resizeAndRepositon(cntr)
        },

        showOptions () {
            console.debug('showOption')
            this.removePopupFooter()
            this.hasColors = false
            this.resizeAndRepositon(this.$refs.optionCntr)
        },

        resizeAndRepositon (cntr) {
            this.$nextTick(() => {
                let pos = domGeom.position(cntr)
                this.popup.style.width = pos.w + 'px'
                this.updatePosition(false)
            })
        },

		onVisible (){
		    this.cleanUpTempListener();
            this.showOptions()
        },
        
        setOptions (o) {
            this.options = o
        },

        setModel (m) {
            this.model = m
        },

        onChange (value) {
            this.hideDropDown();
            this.setValue(value);
            this.emit("change", this.selectedOption, value);
        },

		onTempColorSelected (value){
			if (this.value != value) {
				this.tempValue = value;
				this.emit("changing", this.selectedOption, value);
				this.setLabelColor(value);
			}
		},

		flush  (){
			if (this.tempValue && this.tempValue){
				this.emit("change", this.selectedOption, this.tempValue);
				delete this.tempValue
			}
		}

	},
	watch: {
	},
    mounted () {
		this.logger = new Logger('DropDownTree')
    } 
}
</script>