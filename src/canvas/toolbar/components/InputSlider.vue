
<template>
    <div class="MatcToolbarPopUpCntr">
		<div ref="button" class="MatcToolbarItem MatcToolbarDropDownButton MatcToolbarInputDropDownButton">
			<span :class="'MatcToolbarInputDropDownButtonIcon ' + qIcon" v-if="qIcon"/>
			<input type="test" data-dojo-attach-point="inputBox" class="MatcIgnoreOnKeyPress MatcToobarInputInlineEdit" />
			<span class="caret" v-if="!qIcon"></span>
		</div>
		<div class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup">
			Papa was here
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import ToolbarDropDownButton from './ToolbarDropDownButton'

export default {
    name: 'InputDropDownButton',
	mixins:[ToolbarDropDownButton, DojoWidget],
	props: ['qIcon', 'qIsDropDown'],
    data: function () {
        return {
            type: "int",
            allowA: false
        }
    },
    components: {},
    methods: {
		postCreate (){
			this.own(on(this.domNode, touch.press, lang.hitch(this, "showDropDown")));
			this.own(on(this.inputBox, "change", lang.hitch(this,"onInputChange")));
            this.reposition = true
			this.button = this.$refs.button
		},

		setLabel (value){
			if(value == null || value == undefined){
				value = 0 ;
			}
			if (this.hasObjects && this._options) {
				let found = this._options.find(o => o.value === value)
				if (found) {
					value = found.label;
				}
			}
			if (this.postfix){
				value+= this.postfix;
			}
			this.inputBox.value = value;
		},

		blur (){
			this.inputBox.blur();
		},

		onInputChange (){
			if(this._value != this.inputBox.value){
				if(this.type =="float") {
					if(this.isValidFloat(this.inputBox.value)){
						this.onChange(this.inputBox.value);
					} else {
						this.inputBox.value=this._value;
					}
				} else if(this.type =="int"){
					if(this.isValidInt(this.inputBox.value)){
						this.onChange(this.inputBox.value);
					} else {
						this.inputBox.value=this._value;
					}

				} else {
					this.onChange(this.inputBox.value);
				}
			}
		},

		onVisible () {
			this.inputBox.select();
			this.inputBox.focus();
		},

		setValue (value) {
			if(this._selectedLi){
				css.remove(this._selectedLi, "MatcToolbarPopupSelected");
			}
			if(this._lis[value] && this.updateSelection){
				css.add(this._lis[value], "MatcToolbarPopupSelected");
				this._selectedLi = this._lis[value];
			}
			if(this.updateLabel){
				this.setLabel(value);
			}
			this._value = value;
		},

		isValidFloat (value) {
			const er = /^[0-9]+\.?[0-9]*$/;
			const valid =  er.test(value);
			if(!valid){
				return false;
			}
			return value >= 0
		},

		isValidInt (value){
			if(this.allowA && (value == "a" || value == "A")){
				return true;
			}
			const er = /^[0-9]+$/;
			const valid =  er.test(value);
			if(!valid){
				return false;
			}
			return value >= 0
		}
    },
    mounted () {
		if (this.qIsDropDown) {
			this.isChildDropDown = this.qIsDropDown
		}
    }
}
</script>x