
<template>
     <div class="MatcAppSettings">
							<div class="" data-dojo-attach-point="cntr"> 
		 					</div>
						  </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Evented from 'dojo/Evented'
import _Widget from 'common/_Widget'
import Logger from 'common/Logger'
import DropDownButton from 'page/DropDownButton'




export default {
    name: 'AppSettings',
    mixins:[Evented, DojoWidget],
    data: function () {
        return {
            appID: "", 
            isPublic: false
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.logger = new Logger({className : "de.vommond.matc.AppSettings"});
			this.logger.log(0,"postCreate","enter >" + this.appID + " > " + this.isPublic);
			
			this.btn= new DropDown();
			css.add(this.btn.domNode, "MatcButton ");
			css.remove(this.btn.domNode, "MatcToolbarItem");
			
		
			
			this.btn.setOptions([
			     {label : "Everybody can test", value:true, css:"MatcButtonGreen", icon:""},
			     {label : "The app is private", value:false, css:"MatcButtonRed", icon:""},
			]);
			if(this.isPublic== "true" || this.isPublic==true){
				this.btn.setValue(true);
			} else {
				this.btn.setValue(false);
			}
			
			this.btn.placeAt(this.cntr);
			this.own(on( this.btn, "change", lang.hitch(this,"onChange")));
			
		},
		
		
		onChange:function(value){
			var app={
				isPublic : value,
			};
			this._doPost("/rest/apps/props/" +this.appID +".json", app);
			
			this.isPublic = value;
		}
    }, 
    mounted () {
    }
}
</script>