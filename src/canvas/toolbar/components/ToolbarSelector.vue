
<template>
     <div class="MatcToolbarSelector">						
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'

export default {
    name: 'ToolbarSelector',
    mixins:[DojoWidget],
	props: ['options', 'selected'],
    data: function () {
        return {
            value: false
        }
    },
    components: {},
    methods: {
        postCreate (){			
		},		
		
		setOptions (list){
			
			this._nodes = {};
			this.domNode.innerHTML="";
			this.cleanUpTempListener();
			
			for(var i=0; i < list.length; i++){
				
				var o = list[i];
				
				var a = document.createElement("a");
				css.add(a, "MatcToolbarItem MatcToolbarToggleButton");
				
				if(o.icon){
					var span = document.createElement("span");
					css.add(span, o.icon);
					a.appendChild(span);
				}
			
				
				if(o.label){
					a.innerHTML+= o.label;
				}
				
				if(o.value == this.value){
					css.add(a, "MatcToolbarItemActive");
				}
				
				this.tempOwn(on(a, touch.press, lang.hitch(this, "onChange",  o.value)));
				this.domNode.appendChild(a);
				this._nodes[o.value] = a;
			}

			
			
		},


		
		setValue:function(value){
			for(var key in this._nodes){
				var a = this._nodes[key];
				if(key == value){
					css.add(a, "MatcToolbarItemActive");
				} else {
					css.remove(a, "MatcToolbarItemActive");
				}
				
			}
			this.value = value;
		},
		
		hideOption:function(key){
			var a = this._nodes[key];
			if(a){
				css.add(a, "hidden");
			}
		},
		
		showOption:function(key){
			var a = this._nodes[key];
			if(a){
			
				css.remove(a, "hidden");
			}
		},
		
		getValue:function(){
			return this.value;
		},
		
		
		onChange:function(value){
			this.setValue(value);
			this.emit("change", value);
		}
    }, 
    mounted () {
		if (this.options) {
			console.debug('mounted', this.options)
			this.setOptions(this.options)
		}
    }
}
</script>