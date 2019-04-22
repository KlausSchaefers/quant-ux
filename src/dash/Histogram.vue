
<template>
     <div class="MatcDashHistogram">
						
						</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import Logger from 'common/Logger'
import _Color from 'common/_Color'
import _Tooltip from 'common/_Tooltip'
import DomBuilder from 'common/DomBuilder'
import DataFrame from 'common/DataFrame'

export default {
    name: 'Histogram',
    mixins:[_Color, _Tooltip, DojoWidget],
    data: function () {
        return {
            x_prefix: ""
        }
    },
    components: {},
    methods: {
        postCreate(){
			this.log = new Logger("Histogram");		
			if(this.counts){
				var values = this.counts.split(",");
				var df = new DataFrame(values);
				var hist = df.hist(null, this.bins);
				this.setValue(hist,df.mean());
			}
		},				
		
		setPopoverFct(f){
			this.popoverLabelFct = f;
		},
		
		setLabel(l){
			this.label.innerHTML = l;
		},
		
		setMaxMin(fct){
			this.minMaxFct = fct;
		},
		
		setFormTo(fct){
			this.toFromFct = fct;
		},
		
		onHover(fct){
			this.hoverFCT = fct;
		},
		
		setValue(hist, mean){
			
			var bins = hist.size();
			var max = hist.max("count");
			var min = hist.min("count");
			var from = hist.min("from");
			var to = hist.max("to");
			var width  = 100/ (bins *2 -1);
			var v_mean = (mean - from) / (to - from) ;
			
		
			var db = new DomBuilder();
			var cntr = db.div("MatcDashHistogramCntr").build();
			
			var me = this;
			hist.foreach(function(row, i){	
				var v = row.count;
				var bar = db.div("MatcDashHistogramBar").build(cntr);
				bar.style.height = Math.max(1, v*100 / max) + "%";
				bar.style.width = width + "%";
				bar.style.left = width*(i*2) + "%";
				
				if(me.hoverFCT){
					var tt = me.hoverFCT(row);
					css.add(bar, "MatcDashHistogramBarHover");
					me.addTooltip(bar, tt);
				}
			});
			
			if(this.toFromFct){
				to = this.toFromFct(to);
				from = this.toFromFct(from);
			}
			
			db.span("MatcDashHistogramLabelMax MatcDashHistogramLabel", max).build(cntr);
			db.span("MatcDashHistogramLabelMin MatcDashHistogramLabel", min).build(cntr);
			db.span("MatcDashHistogramLabelFrom MatcDashHistogramLabel", from + this.x_prefix).build(cntr);
			db.span("MatcDashHistogramLabelTo MatcDashHistogramLabel", to + this.x_prefix).build(cntr);
			
			this.domNode.innerHTML == "";
			this.domNode.appendChild(cntr);
			
			

			/**
			 * Mean of passed
			 */
			if(mean != null && mean != undefined){
				let lblCntr = db.div("MatcDashHistogramLabelMean").build(cntr);
				lblCntr.style.left = v_mean*100 + "%";
				if(this.toFromFct){
					mean = this.toFromFct(mean);
				} 
				db.span("MatcDashHistogramLabel MatcHorizontalMiddle", mean + this.x_prefix).build(lblCntr);
				let bar = db.div("MatcDashHistogramBarMean").build(cntr);
				bar.style.left = v_mean*100 + "%";
			}
		
		},
    }, 
    mounted () {
    }
}
</script>