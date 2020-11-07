
<template>
     <div class="MatcToolbarSlider">
		<div class="MatcToolbarSliderCntr MatcBoxShadowSlider" data-dojo-attach-point="cntr">
		</div>
		<input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit" data-dojo-attach-point="input"/>
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
            max: 100
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.own(on( this.input, this.inputEvent, lang.hitch(this,"onChangeInput")));
		},

		render:function(){
			this.slider = this.$new(HSlider);
			this.slider.max = this.max;
			this.slider.placeAt(this.cntr);
			this.own(on( this.slider, "change", lang.hitch(this,"onMoveSlider")));
			this.own(on( this.slider, "click", lang.hitch(this,"onClickSlider")));
			this.own(on( this.slider, "release", lang.hitch(this,"onChangeSlider")));
			this.own(on( this.input, "focus", lang.hitch(this,"focusInput")));
		},

		focusInput () {
			this.input.select()
		},

		isDirty:function(){
			return this._dirty;
		},

		onChangeInput: function(){
			if (this.isValid(this.input.value)){
				if (this.input.value != this.value){
					this.setValue(this.input.value);
					this.emit("change", this.value);
					this.input.select()
					this.input.focus()
				}
			}
		},

		onMoveSlider:function(){
			this.setValue(this.slider.getValue());
			this.emit("changing", this.value);
		},

		onChangeSlider:function(){
			if (this.slider != this.slider.getValue()){
				this.setValue(this.slider.getValue());
				this.emit("change", this.value);
			}
		},

		onClickSlider:function(){
			this.setValue(this.slider.getValue());
			this.emit("change", this.value);
		},

		setValue:function(v){
			if (this.value != v) {
				this.value = v;
				this.input.value = v;
				this.slider.setValue(v);
			}
		},


		isValid:function(value){
			var er = /^-?[0-9]+$/;
			var valid =  er.test(value);
			if(!valid){
				return false;
			}
			if(value > 0){
				return true;
			}
			return false;
		},

		setModel:function(m){
			this.model = m;
		},

		blur:function(){
			this.input.blur();
		}
    },
    mounted () {
    }
}
</script>