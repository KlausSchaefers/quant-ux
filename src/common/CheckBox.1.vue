
<template>
     <div class="VommondCheckBox">
								<span class="VommondCheckBoxHook">
								</span>
						</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Evented from 'dojo/Evented'


var value = false

export default {
    name: 'CheckBox',
    mixins:[Evented, DojoWidget],
    data: function () {
        return {
            value: false
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.own(on(this.domNode, touch.press, lang.hitch(this, "onChange")));
			if(this.value || this.value=="true"){
				this.setValue(true);
			}
		},
		

		getValue:function(){
			return this.value;
		},
		
		setValue:function(value){
			this.value = value;
			if(value){
				css.add(this.domNode,"VommondCheckBoxChecked") ;
			} else {
				css.remove(this.domNode,"VommondCheckBoxChecked") ;
			}
		},
		
		setLabel:function(label){
			//this.label.innerHTML=label;	
		},
		
		onChange:function(){
			this.setValue(!this.value);
			this.emit("change", this.value );
		}
    }, 
    mounted () {
    }
}
</script>