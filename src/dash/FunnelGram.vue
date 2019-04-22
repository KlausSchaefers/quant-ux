
<template>
     <div class="MatcFunnelGram">
						
						</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import dom-geometry from 'dojo/dom-geometry'
import _Widget from 'common/_Widget'
import Logger from 'common/Logger'
import _Color from 'common/_Color'
import _Tooltip from 'common/_Tooltip'
import DomBuilder from 'common/DomBuilder'
import DataFrame from 'common/DataFrame'
import Util from 'core/Util'




export default {
    name: 'FunnelGram',
    mixins:[Color, _ToolTip, Util, DojoWidget],
    data: function () {
        return {
            x_prefix: ""
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.log = new Logger({className : "de.vommond.matc.dash.FunnelGram"});
		
			
		},
		
		
		
		setPopoverFct:function(f){
			this.popoverLabelFct = f;
		},
		
		setLabel:function(l){
			this.label.innerHTML = l;
		},
		
		setMaxMin:function(fct){
			this.minMaxFct = fct;
		},
		
		setFormTo:function(fct){
			this.toFromFct = fct;
		},
		
		onHover:function(fct){
			this.hoverFCT = fct;
		},
		
		setValue:function(funnel){
	
			
			var db = new DomBuilder();
			var cntr = db.div("MatcFunnelGramCntr").build();
			
			var height = Math.min(10, (100 / (funnel.length*2 - 1)));
			
			var table = db.table("MatcFunnelGramTable").build(cntr);
			for(var i=0; i< funnel.length; i++){
				var summary = funnel[i];
				var v = summary.p;
				
				
				var label = "All"
				if(summary.event){
					var labels = this.getNiceEventLabel(summary.event);
					label =  labels[0] + " &quot;" +labels[1]+ " &quot;";
				

					
		
					var tr = db.tr().build(table);
					var tdLabel = db.td("MatcFunnelGramTableLabel", label).build(tr);
					
					var tdBar = db.td("MatcFunnelGramTableBar").build(tr);
		
					var bar = db.div("MatcFunnelGramBar", summary.value + " / " + summary.sessionCount).build(tdBar);
					bar.style.width = Math.max(1, v*100) + "%";
					bar.style.backgroundColor = this.greenToRed(v);
				
				}
			}
			
		
			
			this.domNode.innerHTML == "";
			this.domNode.appendChild(cntr);
			
			

		
		},
		
		
		getNiceEventLabel:function(event){
			
			var row = [];
			if(event.widget){
				
				if(event.type =="WidgetGesture" && event.gesture){
	
					var gesture = event.gesture;
					row = [this.getGestureLabel(gesture.type),  this.getWidgetName(event.widget)];
					
				} else if(event.state && (event.type == "WidgetClick" || event.type == "WidgetChange")  ){	
					row = [this.getEventStateLabel(event.state), this.getWidgetName(event.widget)];
				} else {
					row = [this.getEventLabel(event.type), this.getWidgetName(event.widget)];
				}

			} else if(event.type =="ScreenGesture" && event.gesture){					
				var gesture = event.gesture;									
				row = ["Screen " + this.getGestureLabel(gesture.type), this.getScreenName(event.screen)];
			}else {					
				row = [this.getEventLabel(event.type), this.getScreenName(event.screen)];
			}
		
			return row;
		},
    }, 
    mounted () {
    }
}
</script>