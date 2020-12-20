
<template>
     <a class="MatcButton">Test</a>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import _Widget from 'common/_Widget'
import Logger from 'common/Logger'




export default {
    name: 'TestButton',
    mixins:[DojoWidget],
    data: function () {
        return {
            appID: "", 
            userID: "", 
            isPublic: false
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.logger = new Logger({className : "de.vommond.matc.page.TestButton"});	
			this.logger.log(2,"constructor", "enter > " + this.appID  + " > "+ this.isPublic);
			if (this.appID) {
				this._doGet("rest/invitation/"+this.appID + ".json", "setInvitation");
			}
		},
		
		setInvitation:function(invitation){
		
			var temp = {};
			for(var key in invitation){
				temp[invitation[key]] = key;
			}
			
			var base = location.protocol +"//" + location.host;
			var url  =base +"/test.html?h=" + temp[1];
	
			if(this.isPublic){
				url+="&log=false";
			}
			this.domNode.href = url;
			this.logger.log(-1,"setInvitation", "exit > " + url);
		}
    }, 
    mounted () {
    }
}
</script>