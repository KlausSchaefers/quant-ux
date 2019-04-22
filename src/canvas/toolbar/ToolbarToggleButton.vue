
<template>
     <a class="MatcToolbarItem MatcToolbarToggleButton" >
		<span class="MatcToolbarIcon" data-dojo-attach-point="icon">
		</span>
	</a>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'

export default {
    name: 'ToolbarToggleButton',
    mixins:[DojoWidget],
    data: function () {
        return {
            value: false
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.own(on(this.domNode, touch.press, lang.hitch(this, "onChange")));
			
		},
		
		setLabel:function(label){
			this.domNode.innerHTML+=label;
		},
		
		setIcon:function(icon){
			css.add(this.icon, icon);
		},
		
		setCss:function(clazz){
			css.add(this.domNode, clazz);
		},


		setValue:function(value){
			
			if(value){
				css.add(this.domNode, "MatcToolbarItemActive");
			} else {
				css.remove(this.domNode, "MatcToolbarItemActive");
			}
			
			this.value = value;
			
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