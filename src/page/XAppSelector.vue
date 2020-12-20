
<template>
     <div class="MatcAppSelector">
						  </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import hash from 'dojo/hash'
import _Widget from 'common/_Widget'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import Dialog from 'common/Dialog'
import ScrollContainer from 'common/ScrollContainer'
import DropDownButton from 'page/DropDownButton'




export default {
    name: 'AppSelector',
    mixins:[DojoWidget],
    data: function () {
        return {
            appID: "", 
            otherAppID: "", 
            userID: ""
        }
    },
    components: {},
    methods: {
        postCreate: function(){	
			this.log = new Logger({className : "de.vommond.matc.page.MatcAppSelector"});
			this.log.log(2, "postCreate","enter : " + this.appID + " > "+ this.otherAppID);			
			this._doGet("rest/apps?summary=true", "onAppsLoaded");
		},
		
		onAppsLoaded:function(apps){
			
			this.domNode.innerHTML="";
			
			this.apps = apps;
					
			
			/**
			 * Get the list of related projects...
			 */
			var nodes = this._getAppParentChildStructure(apps);
		
			var currentProject = nodes[this.appID];
			while(currentProject&& currentProject.parent && nodes[currentProject.parent]){
				currentProject = nodes[currentProject.parent];		
			}
		
	
			
			var list = [];
			this._flattenChildren(currentProject, list);
			
		
			var options = [];
			var optionIDs ={};
			for(var i=0; i < list.length; i++){
				var app = list[i];
				if(app.id != this.appID){
					var id = app.id;
					options.push({label:app.name, value:id});		
					optionIDs[id]  =true;
				} 
			}
			/**
			 * Also included the "alien" app
			 */
			if(this.otherAppID && !optionIDs[this.otherAppID] ){
				var app = this._getAppByName(this.otherAppID, apps);
				options.push({label:app.name, value:app.id});			
			}
			options.push({label:"All Apps", value:-1});			

		
			this.btn= new DropDown();
			this.btn.setLabel("Compare with...")
			this.btn.setOptions(options);
			css.add(this.btn.domNode, "MatcButton");
			this.btn.placeAt(this.domNode)
			if(this.otherAppID){
				this.btn.setValue(this.otherAppID);
			}
			this.own(on( this.btn, "change", lang.hitch(this,"onSelection")));
		},
		
		_getAppByName:function(id, apps){
		
			for(var i=0; i < apps.length; i++){
				var app = apps[i];
				if(app.id == id){
					return app;
				}
			}
			return null;
		},
		
		onSelection:function(value){
			this.log.log(0, "onSelection","enter : " + this.appID + " > "+ value);
			
			if(value==-1){			
				this.showDialog(this.apps);				
			} else {
				this.dipatch(value);
			}
		},
		
		dipatch:function(value,d){
			hash("#/apps/" +this.appID + "/analytics/compare/" + value + ".html");
			if(d){
				d.close();
			}
		},
		
		showDialog:function(apps){
			
			
			apps.sort(function(a,b){
				if(!a.name){
					a.name="";
				}
				if(!b.name){
					b.name="";
				}
				return a.name.localeCompare(b.name);
			});
			
			var d = new Dialog();
			
			var btn = document.getElementById("testCompareBtn");
			var db = new DomBuilder();
			
			var div = db.div("MatcDialog").build();
			var h3 = db.h3("MatcDialogHeader", "Compare with").build(div);
			
			var cntr = db.div("MatcDialogTable").build(div);
		
			var tbl = db.table().build();
			var tbody = db.tbody().build(tbl);
			
			
			
			var scroller = new ScrollContainer();
			scroller.placeAt(cntr);
			scroller.wrap(tbl);
		
			
			for(var i=0; i < apps.length; i++){
				var app = apps[i];
				if(app.id != this.appID){
					var id = app.id;
					var a = db.tr().td("MatcDialogTableAction", app.name).build(tbody);			
					d.own(on(a, touch.press, lang.hitch(this, "dipatch", id, d)));
				} 
			}
			
			
			var bar = db.div("MatcButtonBar MatcMarginTop").build(div);			
			var cancel = db.a("MatcLinkButton", "Cancel").build(bar);
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.popup(div, this.domNode);
			
			
		},
		
		/***************************************************************************
		 * Helpers
		 ***************************************************************************/
	
		

		_flattenChildren:function(node, result, level){
			if(!level){
				result.push(node);
			}
			if(node._children && node._children.length >0){
				for(var i=0; i< node._children.length; i++){
					var child = node._children[i];
					result.push(child);
					this._flattenChildren(child, result,1);
				}
			}
		},
		
		/**
		 * returns a object with the app ids as keys. also for every
		 * app that has children the children are included.
		 */
		_getAppParentChildStructure:function(apps){
			var nodes = {};
			for(var i=0; i < apps.length; i++){
				var app = apps[i];
				nodes[app.id] = app;
				app._children = [];
			}
			for(var i=0; i < apps.length; i++){
				var app = apps[i];
				if(app.parent){
					var parentNode = nodes[app.parent];
					if(parentNode){
						parentNode._children.push(app);
					} else {
						//console.debug("No parent for ", app);
					}
				}
			}
			return nodes;
		}
    }, 
    mounted () {
    }
}
</script>