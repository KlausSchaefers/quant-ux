
<template>
     <div class="VommondLabelCheckBox">
		<div class="VommondCheckBox" data-dojo-attach-point="check">
			<span class="VommondCheckBoxHook">
			</span>
		</div>
		<span class="VommondCheckBoxLabel" data-dojo-attach-point="label">
		</span>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'

export default {
    name: 'LabelCheckBox',
    mixins:[DojoWidget],
    data: function () {
        return {
            value: false
        }
    },
    components: {},
    methods: {
        postCreate(){
			this.own(on(this.domNode, touch.press, lang.hitch(this, "onChange")));
			this.own(on(this.label, touch.press, lang.hitch(this, "onChange")));
		},

		getValue(){
			return this.value;
		},

		setValue(value){
			this.value = value;
			if(value){
				css.add(this.domNode,"VommondCheckBoxChecked") ;
			} else {
				css.remove(this.domNode,"VommondCheckBoxChecked") ;
			}
		},

		setLabel(label){
			this.setTextContent(this.label, label);
		},

		setLabelRaw(label){
			this.label.innerHTML= label;
		},

		onChange(e){
			this.stopEvent(e);
			this.setValue(!this.value);
			this.emit("change", this.value );
		}
    },
    mounted () {
    }
}
</script>