
<template>
     <div class="MatcAppTypeSelector MatcFormGroup">
							<div class="" data-dojo-attach-point="cntr"> 
		 					</div>
		 					<div class="" data-dojo-attach-point="details"> 
		 					</div>
						  </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import window from 'dojo/window'
import on from 'dojo/on'
import touch from 'dojo/touch'
import ioQuery from 'dojo/ioQuery'
import Evented from 'dojo/Evented'
import dom-geometry from 'dojo/dom-geometry'
import _Widget from 'common/_Widget'
import Logger from 'common/Logger'
import CheckBox from 'common/CheckBox'




export default {
    name: 'AppTypeSelector',
    mixins:[Evented, DojoWidget],
    data: function () {
        return {
            _value: "smartphone", 
            _types: {
            "smartphone": {id :"smartphone", screenSize : {w:768/2, h : 1280/2}}, 
            "tablet": {id :"tablet", screenSize : {w:768/2, h : 1024/2}}, 
            "desktop": {id :"desktop", screenSize : {w:1280
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.logger = new Logger({className : "de.vommond.matc.page.AppTypeSelector"});
			this.logger.log(2,"postCreate","enter >" + this.mode);
			
			this._divs = [];
			this._checks = [];
		
			this.renderType("smartphone", "SmartPhone", "iphone");
			this.renderType("tablet", "Tablet", "ipad");
			this.renderType("desktop", "Desktop", "macbook");
	
			this._checks[this._value].setValue(true);
			css.add(this._divs[this._value], "MatcAppTypeSelected");
		},
		
		renderType:function(type, label, icon){
			var t = document.createElement("div");
			css.add(t, "MatcAppType");
			
			var i = document.createElement("div");
			css.add(i, "MatcAppTypeIcon");
			css.add(i, "MatcAppTypeIcon"+type);
			t.appendChild(i);
			
			var g = document.createElement("span");
			css.add(g, "glyphicons glyphicons-" + icon);
			i.appendChild(g);
			
			var l = document.createElement("div");
			css.add(l, "MatcAppTypeBar");
			t.appendChild(l);
			
			var c = new CheckBox();
			c.placeAt(i);
			
			
			var s = document.createElement("span");
			css.add(s, "MatcAppTypeLabel");
			s.innerHTML =label;
			l.appendChild(s);
			
			this.own(on(t, touch.press, lang.hitch(this, "onTypePress", type)));
			
			this.cntr.appendChild(t);
			
			this._checks[type] = c;
			this._divs[type] = t;
		},
		
		onTypePress:function(type){
			//console.debug("onTypePress", type);
			
			this.cleanup();
			
			this._checks[type].setValue(true);
			css.add(this._divs[type], "MatcAppTypeSelected");
			
			this._value = type;
		},
		
		getValue:function(){
			return this._types[this._value];
		},
		
		cleanup:function(){
			for(var t in this._checks ){
				this._checks[t].setValue(false);
				css.remove(this._divs[t], "MatcAppTypeSelected");
			}
		}
    }, 
    mounted () {
    }
}
</script>