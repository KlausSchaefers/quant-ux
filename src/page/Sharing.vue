
<template>
     <div class="MatcSharing">
							<div class="row"> 
								<div class="col-md-8"><h2>Sharing</h2></div> 
								<div class="col-md-4 MatcRight"> 
									<a class="MatcButton" data-dojo-attach-point="resetBtn"> Reset 
									</a>
								</div>
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
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import _Plan from 'page/_Plan'




export default {
    name: 'Sharing',
    mixins:[Evented, _Plan, DojoWidget],
    data: function () {
        return {
            appID: "", 
            userID: ""
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.logger = new Logger({className : "de.vommond.matc.page.Sharing"});
			this.logger.log(-1,"postCreate","enter >" + this.appID + " > " + this.userID);
			
			this.own(on(this.resetBtn, "click", lang.hitch(this, "reset")))
			
			if(this.appID && this.userID){
				this.load();
			}
		},
		
		setUser:function(u){
			this.user = u;
		},
		
		reset:function() {
			this.logger.log(-1,"reset","enter >" + this.appID);
			var result = this._doDelete("/rest/apps/invitation/" + this.appID);
			this.load();
		},
		
		load:function(){
			this.logger.log(-1,"load","enter >" + this.appID);
			var invitation = this._doGet("/rest/invitation/"+this.appID+ ".json");
			var app = this._doGet("/rest/apps/embedded/"+this.appID+ ".json");
			this.render(app, invitation)
		},
		
		render:function(app, invitation){
			this.cleanUp();
			
			var base = location.protocol + "//" + location.host;
			var temp = {};
			for(var key in invitation){
				temp[invitation[key]] = key;
			}
		
			var db = new DomBuilder();
			var col = db.div("row").div("col-md-12").build(this.cntr);
			
			var testInput = db
				.div("MatcMarginTop")
				.span("", this.getNLS("share.Test"))
				.input("form-control", base +"/test.html?h=" + temp[1])
				.build(col);
				
			var commentInput = db
				.div("MatcMarginTop")
				.span("", this.getNLS("share.Comment"))
				.input("form-control", base +"/share.html?h=" + temp[1])
				.build(col);
			
			if (this.planCanEmbed()) {
				var w = app.screenSize.w + "px";
				var h = app.screenSize.h + "px";
				var code = '<iframe src="' + base + "/em.html?h=" + temp[1] +'" width="' + w + '" height="' + h + '" allowTransparency="true" frameborder="0"></iframe>'
				var embeddedInput = db
					.div("MatcMarginTop")
					.span("", this.getNLS("share.Embed"))
					.input("form-control", code)
					.build(col);
		
			} 
	
			this.own(on(testInput, "focus", function(){
				testInput.select();
			}));
			this.own(on(commentInput, "focus", function(){
				commentInput.select();
			}));
			if (embeddedInput){
				this.own(on(embeddedInput, "focus", function(){
					embeddedInput.select();
				}));
			}
		},
		
		
		cleanUp:function(){
			this.cleanUpTempListener();
			this.cntr.innerHTML="";
		}
    }, 
    mounted () {
    }
}
</script>