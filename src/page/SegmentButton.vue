
<template>
	<div class="MatcSegmentButton">
		<div type="button" class="MatcSegmentButtonCntr" ref="button"> 
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'

export default {
    name: 'SegmentButton',
	mixins:[DojoWidget],
	props: ["options", "value"],
    data: function () {
        return {    
        }
    },
    components: {},
    methods: {  
		setOptions (list){
			this._lis = {};			
			const first = list.slice(0, 6);			
			for(let i=0; i < first.length; i++){
				const o = list[i];
				var li = document.createElement("span");	
				css.add(li, "MatcButton");
				if (o.label){
					li.innerHTML = o.label;
				}
				if (o.icon){
					var icon = document.createElement("span");
					css.add(icon, o.icon);
					li.appendChild(icon);
				}
				this.$refs.button.appendChild(li);
				this._lis[o.value] = li;
				this.own(on(li, touch.press, lang.hitch(this, "onChange", o)));
			}		
		},
		
		setValue (v){
			this.selected = v;
			for (var id in this._lis){
				var li = this._lis[id];
				css.remove(li, "MatcButtonActive");
			}
			if (this._lis[v]){
				css.add(this._lis[v], "MatcButtonActive");
			}
		},
		
		getValue (){
			return this.selected;
		},
		
		onChange (o){
			this.setValue(o.value);
			this.emit("change", this.selected );
			this.emit("input", this.selected );
		}
	},
	watch: {
		value (v) {
			this.setValue(v)
		}
	},
    mounted () {
		if (this.options) {
			this.setOptions(this.options)
		}
		if (this.value !== undefined) {
			this.setValue(this.value)
		}
    }
}
</script>