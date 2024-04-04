
<template>
    <div class=" MatcToolbarDropDownTree MatcToolbarPopUpCntr ">
		<div type="button" ref="button" class="MatcToolbarDropDownButton MatcToolbarItem MatcToolbarIconButton">
            <QIcon :icon="icon"/>
			<label data-dojo-attach-point="label" class="MatcToolbarItemLabel"></label>
			<span data-dojo-attach-point="caret" class="caret"></span>
		</div>
		<div class="MatcToolbarPopUp MatcToolbarDropDownTree MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup" @click.stop="" @mousedown.stop="">
            <ul v-show="view === 'options'" ref="optionCntr" style="width:200px">
                <li v-for="(option,i) in options" :key="i" @click="selectOption(option)" class="MatcToolbarMenuItem">

                    <template v-if="option.type === 'color'" >
                        <span :class="'MatcToolbarColorIndicator'" :style="{'background': option.value}"/>
                        <span class="MatcToolbarPopUpLabel"> {{option.label}}</span>
                    </template>

                    <CheckBox v-if="option.type === 'check'" :value="option.value" :label="option.label"/>

                    <template v-if="option.type === 'list'"  >
                        <QIcon :icon="option.icon" class="MatcToolbarPopUpIcon"/>
                        <span class="MatcToolbarPopUpLabel"> {{option.label}}</span>
                 
                    </template>

                    <template v-if="option.type === 'int'">
                        <QIcon :icon="option.icon"/>
                        <span class="MatcToolbarPopUpLabel"> {{option.label}}</span>
                    </template>
                </li>
            </ul>
            <div v-show="view === 'color'" ref="colorCntr">
            </div>
            <ul v-show="view === 'list'" ref="listCntr" style="width:200px">
                <template v-if="view === 'list'">

                    <li v-for="(option,i) in selectedOption.options"
                        :key="i"
                        @click="selectListOption(option)"
                        :class="{'MatcToolbarPopupSelected': option.value === value}">
                        <template >
                            <QIcon :icon="option.icon" class="MatcToolbarPopUpIcon" v-if="option.icon"/>
                            <span class="MatcToolbarPopUpLabel"> {{option.label}}</span>
                        </template>
                    </li>
                </template>
            </ul>
            <ul v-show="view === 'int'" ref="intCntr" style="width:50px">
               <template v-if="view === 'int'">
                 <li v-for="option in selectedOption.options"
                        :key="option"
                        @click="selectIntOption(option)"
                        :class="{'MatcToolbarPopupSelected': option === value}">
                        <label class="MatcToolbarPopUpLabel" >
                                {{option}}
                        </label>
                </li>
               </template>
            </ul>

		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import ToolbarColor from './ToolbarColor'
import domGeom from 'dojo/domGeom'
import CheckBox from 'common/CheckBox'
import Logger from 'common/Logger'
import Util from 'core/Util'
import QIcon from 'page/QIcon'

export default {
    name: 'DropDownTree',
	mixins:[Util, DojoWidget, ToolbarColor],
    data: function () {
        return {
            icon: null,
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
            view: 'options',
            selectedOption: null
        }
    },
    components: {
        'CheckBox': CheckBox,
        'QIcon': QIcon
    },
    methods: {
	    init (){

        },

        setLabel (lbl) {
            this.label.innerHTML = lbl
        },

        closeColors () {
            this.flush()
            this.showOptions()
        },

        setIcon (icon) {
            this.icon = icon
        },

        selectOption (option) {
            this.logger.log(-1, 'showColors', 'selectOption > ' + option.label, option.type)
            this.selectedOption = option
            if (option.type === 'color') {
                this.showColors(option)
            } else if (option.type === 'check') {
                this.toggleOption(option)
            } else if (option.type === 'list') {
                this.showList(option)
            } else if (option.type === 'int') {
                this.showInt(option)
            } else {
                this.logger.warn('showColors', 'Not supported type', option.type)
            }
        },

        selectListOption (listOption) {
            this.logger.log(-1, 'showList', 'selectListOption', listOption.value)
            this.value = listOption.value
            setTimeout( () => {
                this.onChange(listOption.value)
            }, 150)
        },

        selectIntOption (value) {
            this.logger.log(-1, 'showList', 'selectListOption', value)
            this.value = value
            setTimeout( () => {
                this.onChange(value)
            }, 150)
        },

        toggleOption (option) {
            option.value = !option.value
            let value = option.value ? option.valueTrue : option.valueFalse
            this.logger.log(-1, 'toggleOption', 'enter >' + option.key, value)
            setTimeout( () => {
                this.onChange(value)
            }, 150)
        },

        showInt (option) {
            this.removePopupFooter()
            this.view = 'int'
            this.value = option.value
            this.resizeAndRepositon(this.$refs.intCntr)
        },

        showList (option) {
            this.logger.log(-1, 'showList', 'enter', option.key)
            this.removePopupFooter()
            this.view = 'list'
            this.value = option.value
            this.resizeAndRepositon(this.$refs.listCntr)
        },

        showColors (option) {
            this.logger.log(-1, 'showColors', 'enter', option.key)
            this.view = 'color'
            this.value = option.value

            this.$refs.colorCntr.innerHTML = ''
            let cntr = this._renderColorWidgets(this.$refs.colorCntr)
            this.renderRemovePopupFooter("No Color", () => this.setNoColor());
            this.setColorValues()
            this.onSelectTab(0, true)
            this.resizeAndRepositon(cntr)
        },

        showOptions () {
            this.removePopupFooter()
            this.view = 'options'
            this.resizeAndRepositon(this.$refs.optionCntr)
        },

        resizeAndRepositon (cntr) {
            this.$nextTick(() => {
                let pos = domGeom.position(cntr)
                this.popup.style.width = pos.w + 'px'
                this.updatePosition(true)
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

        setNoColor () {
            this.onChange('transparent')
        },

        onChange (value) {
            this.hideDropDown();
            //this.setValue(value);
            this.emit("change", this.selectedOption, value);
        },

		onTempColorSelected (value){
			if (this.value != value) {
				this.tempValue = value;
				this.emit("changing", this.selectedOption, value);
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