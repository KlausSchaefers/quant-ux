
<template>
     <div class="VommondInput">
		<form autocomplete="off">
			<input type="text" data-dojo-attach-point="input" autocomplete="false" >
			<ul class="" role="menu" data-dojo-attach-point="ul">		
			</ul>
		</form>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import win from 'dojo/_base/win'
import on from 'dojo/on'
import touch from 'dojo/touch'
import domGeom from 'dojo/domGeom'
import Logger from 'common/Logger'

export default {
    name: 'Input',
    mixins:[DojoWidget],
    data: function () {
        return {            
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.log = new Logger({className : "de.vommond.Input"});
			this.own(on(this.input, "keyup", lang.hitch(this, "onKey")));
		},	
		
		onKey:function(e){
			
			if(!this.hints){
				return;
			}	
			
			if(this.suggestions){
				var key = e.which || e.keyCode;
				
				if(40 == key){
					this.stopEvent(e);
					this.selected = Math.min(this.suggestions.length, this.selected+1);
					this.highlight(this.selected);
					return;
				} 
				
				if(38 == key){
					this.stopEvent(e);
					this.selected = Math.max(-1, this.selected-1);
					this.highlight(this.selected);
					return;
				}
				
				if(13 == key){
					if(this.selected >=0 && this.selected < this.suggestions.length){
						this.stopEvent(e);
						this.onSelect(this.suggestions[this.selected]);
						return;
					}
					if (this.suggestions.length == 1) {
						this.stopEvent(e);
						this.onSelect(this.suggestions[0]);
						return;
					}
				}
			}
			
			

			var suggestions = [];
			var value = this.input.value;
			if(value.length >=1){
				value = value.toLowerCase();
				for(var i=0; i< this.hints.length; i++){
					var hint = this.hints[i];
					if(hint._label.indexOf(value)>=0){
						suggestions.push(hint);
					}
				}
			}
			
			if(suggestions.length >0){
				this.showSuggestion(suggestions);
			} else {
				this.showSuggestion([]);
			}
		},
		
		showSuggestion:function(suggestions){
			
			
			if(!this.visible){
				var pos =domGeom.position(this.input);
				this.ul.style.width = pos.w + "px";
				css.add(this.domNode, "VommondInputOpen");
				this._mouseDownListener = on(win.body(),"mousedown", lang.hitch(this,"hideSuggestion"));
				this.visible = true;
				this.selected = -1;
			}
		
			this.cleanUpTempListener();
			this.ul.innerHTML = "";
			this.lis = [];
			for(var i=0; i < suggestions.length; i++){
				var s = suggestions[i];
				var li = document.createElement("li");
				li.innerHTML= s.label;
				this.ul.appendChild(li);
				this.lis.push(li);
				this.tempOwn(on(li, touch.press, lang.hitch(this, "onSelect", s)));
			}
			
			this.suggestions = suggestions;
			
		},
		
		highlight:function(pos){
		
			if(this.lis){
				for(var i=0; i< this.lis.length; i++){
					if(i== pos){
						css.add(this.lis[i], "VommonInputSelected");
					} else {
						css.remove(this.lis[i], "VommonInputSelected");
					}
				}
				
			}
			
		},
		
		onSelect:function(s){
			this.input.value = s.value;
			this.hideSuggestion();
		},
		
		
		hideSuggestion:function(){
			css.remove(this.domNode, "VommondInputOpen");
			if(this._mouseDownListener){
				this._mouseDownListener.remove();
			}
			this.visible = false;
			this.lis = null;
			this.selected = -1;
			this.cleanUpTempListener();
		},
		
	
	
		setCss:function(clazz){
			css.add(this.input, clazz);
		},
	
		setPlaceholder:function(plchldr){
			this.input.placeholder = plchldr;
		},
	
		focus:function(){
			this.input.focus();
		},
		
		getValue:function(){
			return this.input.value;
		},
		
		setHints:function(hints){
			
			for(var i=0; i< hints.length; i++){
				hints[i]._label = hints[i].label.toLowerCase();
			}
			
			this.hints = hints;
		},
		
		
		destroy:function(){
			this.hideSuggestion();
			this.cleanUpTempListener();
		}
    }, 
    mounted () {
    }
}
</script>