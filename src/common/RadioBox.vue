
<template>
     <div class="VommondRadioBox">
			<span class="VommondRadioBoxMark">
			</span>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import touch from 'dojo/touch'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'

export default {
    name: 'RadioBox',
    mixins:[ DojoWidget],
	props: ['selected'],
    data: function () {
        return {
            value: false
        }
    },
    components: {},
    methods: {
        postCreate (){		
			this.own(on(this.domNode, touch.press, lang.hitch(this, "onChange")));
		},		

		getValue (){
			return this.value;
		},
		
		setValue (value){
			this.value = value;
			if(value){
				css.add(this.domNode,"VommondRadioBoxChecked") ;
			} else {
				css.remove(this.domNode,"VommondRadioBoxChecked") ;
			}
		},
		
		setLabel (){
		},
		
		onChange(){
			this.setValue(!this.value);
			this.emit("change", this.value );
		}
    }, 
	watch: {
		selected (v) {
			this.setValue(v)
		}
	},
    mounted () {
		if (this.selected) {
			this.setValue(this.selected)
		}
    }
}
</script>