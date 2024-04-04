
<template>
     <div class="MatcChildSection">
	 </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'

export default {
    name: 'ChildSection',
    mixins:[DojoWidget],
    data: function () {
        return {            
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.logger = new Logger("ChildSection");
			this.db = new DomBuilder();
		},
		
		setSectionHeader:function(header){
			this.header = header;
		},
		
		setModel:function(model){
			this.model = model;
		},
		
		setMulti:function(multi){	
			var temp = {
				children : multi
			};
			this.render(temp);
		},

		setGroupChildren (children) {
			var temp = {
				children : children
			};
			this.render(temp);
		},
		
		setGroup:function(group){		
			this.render(group);
		},
		
		setScreen:function(screen){	
			this.render(screen);
		},
		
		render (group){
		
			this.cleanUp();
			var cntr = this.db.div("MatcToolbarGridFull").build();
			
			var children = group.children
			for(var i=0; i< children.length; i++){
				var widgetID = children[i];
				if(this.model.widgets[widgetID]){
					var widget = this.model.widgets[widgetID];
					var name = widget.name? widget.name : widget.id;
					if(widget.props.label){
						var lbl = widget.props.label;
						lbl = this._getAbstract(lbl, 30);
						lbl = lbl.replace(/\n/g, " ");
						name+= " ( &quot;" + lbl + "&quot; )";
					}
					var div = this.db.div("MatcChildSectionChild MatcToolbarItem", name ).build(cntr);
					this.tempOwn(on(div, touch.press, lang.hitch(this, "onSelect", widget)));
				} else {
					console.warn("render() > No widget with id "+ widgetID);
				}
			}
			this.domNode.appendChild(cntr);
		},
		
		onSelect:function(widget){
		
			this.emit("select", widget.id);
		},
		
		_getAbstract:function(string,max){
			if(string.length > max){
				string = string.substring(0, max) + "...";
			}
			return string;	
		},
		
		cleanUp:function(){	
			this.cleanUpTempListener();
			this.domNode.innerHTML="";
		}
    }, 
    mounted () {
    }
}
</script>