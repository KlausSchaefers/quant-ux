
<template>
     <div class="vommondBulletGraph">
		<div class="vommondBulletGraphContainer" data-dojo-attach-point="cntr">
		</div>
		<div class="vommondBulletGraphHelp" data-dojo-attach-point="help">
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import _Color from 'common/_Color'
import _Tooltip from 'common/_Tooltip'
import DomBuilder from 'common/DomBuilder'

export default {
    name: 'BulletGraph',
	mixins:[_Color, _Tooltip, DojoWidget],
	props:['value', 'sections'],
    data: function () {
        return {
			max:40,
			barFullHeigh: true
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			if(this.barFullHeigh){
				css.add(this.domNode, "vommondBulletGraphColor");
			}
		},

		setSections:function(sections){
			/**
			 * soft in reverse order
			 */
			sections.sort(function(a,b){
				return b.value - a.value;
			})
			var db = new DomBuilder();
			for(var i=0; i< sections.length; i++){
				var section = sections[i];
				var node = db.div("vommondBulletGraphSection vommondBulletGraphSection"+i).build(this.cntr);
				node.style.width = Math.round((section.value / this.max ) *100) +"%";
				if(section.background){
					node.style.background = section.color;
				}
				var lblCntr = db.span("vommondLegendBarItem").build(node)
				var lbl = db.div("vommondLegendBarItemLabel", section.value).build(lblCntr);
				this.addTooltip(lbl, section.label)
			}
			this.sections = sections;
		},

		setLabel:function(lbl){
			this.bar.innerHTML = ""
			var l = document.createElement("div");
			css.add(l, "vommondBulletGraphBarLbl");
			if((this.value / this.max) < 0.05){
				css.add(l, "vommondBulletGraphBarLblRight");
			}
			l.innerHTML = lbl;
			if(!this.bar){
				var db = new DomBuilder();
				this.bar = db.div("vommondBulletGraphBar").build(this.cntr);
			}
			this.bar.appendChild(l);
		},


		showHint:function(section){
			this.help.textContent = section.label;
		},

		hideHint:function(){
			this.help.textContent="";
		},


		setValue:function(value){
			if(!this.bar){
				var db = new DomBuilder();
				this.bar = db.div("vommondBulletGraphBar").build(this.cntr);
			}
			if(isNaN(value)){
				value =0 ;
			}
			this.bar.style.width = Math.min(100,Math.round((value / this.max ) *100)) +"%";
			this.value = value;
			if(this.color){
				let p = Math.min(value / this.max ,1);
				if(this.invertColors){
					p = 1-p;
				}
				this.bar.style.background = this.greenToRed(p);
			} else {
				var color = this.getSectionColor(value);
				if(color){
					this.bar.style.background = color;
				}
			}
		},

		getSectionColor:function(value){
			var color = null;
			for(var i=0; i< this.sections.length; i++){
				var section = this.sections[i];
				color = section.color;
				if(value >= section.value){
					break;
				}
			}
			return color;
		}
	},
	watch: {
		value (v) {
			this.value = v
			this.setValue(this.value)
			this.setLabel(this.value)
		}
	},
    mounted () {
		if (this.sections) {
			this.setSections(this.sections)
		}
		if (this.value) {
			this.setValue(this.value)
			this.setLabel(this.value)
		}
    }
}
</script>