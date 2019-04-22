
<template>
     <div class="MatcContentWidget">
							<div data-dojo-attach-point="containerNode"></div
						 </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import window from 'dojo/window'
import query from 'dojo/query'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Evented from 'dojo/Evented'
import _Widget from 'common/_Widget'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'


var role = "user"
var key = ""
var category = "default"

export default {
    name: 'Content',
    mixins:[Evented, DojoWidget],
    data: function () {
        return {
            role: "user", 
            key: "", 
            category: "default"
        }
    },
    components: {},
    methods: {
        startup : function() {	
		
			if(this.role =="admin"){
				css.add(this.containerNode, "MatcContentWidgetInlineEdit");
				this.own(on(this.containerNode, touch.release, lang.hitch(this,"onEdit")));
			}
		},
		
		
		onEdit:function(){
		
			
			var db = new DomBuilder();
			
			var div = db.div("MatcDialogXL MatcPadding").build();
			
			var txt = db.textarea("form-control MatcContentWidgetEditor").build(div);
			txt.value = this.containerNode.innerHTML;
			
			var bar = db.div("MatcButtonBar MatcMarginTop").build(div);
			
			var cancel = db.a("MatcLinkButton", "Cancel").build(bar);
			var write = db.div("MatcButton", "Save").build(bar);
			
			var d = new Dialog({overflow:true});
			d.own(on(write, touch.release, lang.hitch(this,"saveContent", txt, d)));
			d.own(on(cancel, touch.release, lang.hitch(d, "close")));
			d.popup(div, this.domNode);
			
		},
		
		
		saveContent:function(txt, d,e){
			this.stopEvent(e);
			
			var data = {
				key : this.key,
				txt : txt.value,
				category : this.category
			};
			
			var result = this._doPost("/rest/cms/" + this.key + ".json", data);
			
			d.close();
			this.containerNode.innerHTML = txt.value;
		}
    }, 
    mounted () {
    }
}
</script>