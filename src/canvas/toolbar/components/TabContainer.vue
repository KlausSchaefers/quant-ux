
<template>
     <div class="MatcToolbarTabContainer ">
		
							<div class="MatcToolbarTabs" data-dojo-attach-point="tabsCntr">
								
							</div>
							
							<div class="" data-dojo-attach-point="cntr">
							
							</div>
							
						  </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import window from 'dojo/_base/window'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Evented from 'dojo/Evented'
import _Widget from 'common/_Widget'
import DomBuilder from 'common/DomBuilder'




export default {
    name: 'TabContainer',
    mixins:[Evented, DojoWidget],
    data: function () {
        return {
            
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.db = new DomBuilder();
			this.tabs = {};
			this.containers = {};
		},
		
		add:function(name, div){
		
			
			var tab = this.db.a("", name).build(this.tabsCntr);
			this.tabs[name] = tab;
			var container = this.db.div("MatcToolbarTab hidden").build(this.cntr);
			container.appendChild(div);
			this.containers[name] = container;
			
			this.own(on(tab, touch.press, lang.hitch(this, "setActive", name)));
		},
		
		hideTabs:function(){
			css.add(this.tabsCntr, "hidden");
		},
		
		showTabs:function(){
			css.remove(this.tabsCntr, "hidden");
		},
		
		setActive:function(name){
			for(var id in this.tabs){
				css.remove(this.tabs[id], "MatcToolbarTabActive");
				css.add(this.containers[id], "hidden");
			}
			if(this.tabs[name]){
				css.add(this.tabs[name], "MatcToolbarTabActive");
				css.remove(this.containers[name], "hidden");
			}
		}
    }, 
    mounted () {
    }
}
</script>