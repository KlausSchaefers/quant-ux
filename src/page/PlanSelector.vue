
<template>
     <div class="MatcPlanSelector">
							
						  </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import window from 'dojo/_base/window'
import on from 'dojo/on'
import touch from 'dojo/touch'
import _Widget from 'common/_Widget'
import DomBuilder from 'common/DomBuilder'
import CheckBox from 'common/CheckBox'
import _Plan from 'page/_Plan'
import Util from 'core/Util'


var billingDiv = ""

export default {
    name: 'PlanSelector',
    mixins:[_TemplatedMixin, Plan, Util, DojoWidget],
    data: function () {
        return {
            billingDiv: ""
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.plans = this.getPlans();
			this.render();
		},
		
		
		
		getValue:function(plan) {
			return this.value;
		},
		
		render:function(){
			this._divs = [];
			this._checks = [];
		
			
			var db = new DomBuilder();
			
			var parent = db.div("MatcPlanSelectorItemCntr").build();
		
			for(var id in this.plans){
				var plan = this.plans[id];
				var div = db.div("MatcPlanSelectorItem MatcPlanSelectorItem" + id).build(parent);
				
				db.div("MatcPlanSelectorItemName", plan.name ).build(div);
				db.div("MatcPlanSelectorItemPrice", plan.price + "&#8364;" ).build(div);
				
			
				db.div("MatcHint MatcFontSmall",plan.des, true).build(div);
				
				var c = new CheckBox();
				css.add(c.domNode, "MatcPlanSelectorItemCheck");
				c.placeAt(div);
				
				this.own(on(div, touch.press, lang.hitch(this, "setValue", id)));
				
				this._checks[id] = c;
				this._divs[id] = div;
			}
			
			this.domNode.appendChild(parent);
		},
		
		setValue:function(type){
			this.cleanup();
			
			if (this._checks[type]) {
				this._checks[type].setValue(true);
				css.add(this._divs[type], "MatcPlanSelectorItemSelected");
			} else {
				console.error("setValue() > Not supported plan ",type);
			}
		
			if(this.billingDiv){
				if (type === "Free") {
					css.remove(this.billingDiv, "MatcFadeInt");
				} else {
					css.add(this.billingDiv, "MatcFadeInt");
				}
			}
			
			this.value = type;
		},
		
		setRequest:function(request){
			//this.cleanup();
			var type = request.plan;
			if (type != this.value) {
				
				if (this._checks[type]) {
					this._checks[type].setValue(true);
					css.add(this._divs[type], "MatcPlanSelectorItemRequested");
					
					var db = new DomBuilder();
					db.div("MatcHint MatcPlanSelectorItemMsg", this.getNLS("planSelector.requested.msg")).build(this._divs[type]);
					
				}
				
				if(this.billingDiv){
					if (type === "Free") {
						css.remove(this.billingDiv, "MatcFadeInt");
					} else {
						css.add(this.billingDiv, "MatcFadeInt");
					}
				}
			}
		},
		
		setPaidUntil:function(paidUntil){
			this.paidUntil = paidUntil;
			if (this.value != "Free" && this._divs[this.value] && paidUntil > 0) {
				var div = this._divs[this.value];
				
				var db = new DomBuilder();
				db.div("MatcPlanSelectorItemPaidUntilMsg", this.getNLS("planSelector.paidUntil.msg") + this.formatDate(paidUntil, true)).build(div);
			}
		},
		
		cleanup:function(){
			for(var t in this._checks ){
				this._checks[t].setValue(false);
				css.remove(this._divs[t], "MatcPlanSelectorItemSelected MatcPlanSelectorItemRequested");
			}
		}
    }, 
    mounted () {
    }
}
</script>