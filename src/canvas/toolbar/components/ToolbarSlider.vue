
<template>
     <div class="MatcToolbarSlider" @mousedown.stop="">
		<div class="MatcToolbarSliderCntr MatcBoxShadowSlider" data-dojo-attach-point="cntr">
		</div>
		<input class="MatcIgnoreOnKeyPress MatcToobarInput" data-dojo-attach-point="input"/>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import HSlider from 'common/HSlider2'

export default {
    name: 'ToolbarSlider',
    mixins:[DojoWidget],
    data: function () {
        return {
            value: null,
            inputEvent: "change",
            mode: "all",
            min: 0,
            max: 100,
						center: false
        }
    },
    components: {},
    methods: {
    postCreate (){
			this.own(on( this.input, this.inputEvent, lang.hitch(this,"onChangeInput")));
		},

		render (){
			this.slider = this.$new(HSlider);
			this.slider.max = this.max;
			this.slider.min = this.min;
			this.slider.center = this.center;
			this.slider.placeAt(this.cntr);
			this.own(on( this.slider, "change", lang.hitch(this,"onMoveSlider")));
			this.own(on( this.slider, "click", lang.hitch(this,"onClickSlider")));
			this.own(on( this.slider, "release", lang.hitch(this,"onChangeSlider")));
			this.own(on( this.input, "focus", lang.hitch(this,"selectInput")));
		},

		selectInput () {
			this.input.select()
		},

		isDirty (){
			return this._dirty;
		},

		onChangeInput (){
			if (this.isValid(this.input.value)){
				if (this.input.value != this.value){
					this.setValue(this.input.value);
					this.emit("change", this.value);
					this.input.select()
					this.input.focus()
				}
			}
		},

		onMoveSlider (){
			this.setValue(this.slider.getValue());
			this.emit("changing", this.value);
			this.focusInput()
		},

		onChangeSlider (){
			if (this.slider != this.slider.getValue()){
				this.setValue(this.slider.getValue());
				this.emit("change", this.value);
				this.focusInput()
			}
		},

		onClickSlider (){
			this.setValue(this.slider.getValue());
			this.emit("change", this.value);
			this.focusInput()
		},

		focusInput () {
			this.input.select()
			this.input.focus()
		},

		setValue (v){
			if (this.value != v) {
				this.value = v;
				this.input.value = v;
				this.slider.setValue(v);
			}
		},

		getValue () {
			return this.value
		},

		isValid (value){
			var er = /^-?[0-9]+$/;
			var valid =  er.test(value);
			if(!valid){
				return false;
			}
			if(value >= this.min){
				return true;
			}
			return false;
		},

		setModel (m){
			this.model = m;
		},

		blur (){
			this.input.blur();
		}
    },
    mounted () {
    }
}
</script>