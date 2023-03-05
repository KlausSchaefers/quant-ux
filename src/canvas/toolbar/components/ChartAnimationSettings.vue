
<template>
    <div class="MatcChartAnimationSettings">	
       <div class="container">
       <div class="row">		
               <div class="col-md-8" role="menu" data-dojo-attach-point="cntr">
               </div>		
               <div class="col-md-4" role="menu" data-dojo-attach-point="">				
                   <div class="MatcChartAnimationSettingsCntr" data-dojo-attach-point="display">					
                   </div>				
               </div>
           </div>
       </div>				
   </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import _Tooltip from 'common/_Tooltip'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import DropDownButton from 'page/DropDownButton'
import Chart from 'core/widgets/Chart'

export default {
   name: 'ActionSettings',
   mixins:[_Tooltip, DojoWidget],
   data: function () {
       return {
           arrowSize: 10,
           scaleFactor: 0
       }
   },
   components: {},
   methods: {
        postCreate (){
            this.logger = new Logger({"className":"de.vommond.matc.canvas.toolbar.ActionSettings"});
            this.db = new DomBuilder();
            this.logger.log(0, "postCreate", "enter > " + this.widgetType);
            this.animationFactory = new Animation();
            this.own(on(this.display, touch.press, lang.hitch(this, "showAnimation")));
        },
                
        
        setWidget (widget){
            this.widget = lang.clone(widget);
            this.scaleFactor = (150 / widget.w)
            this.widget.h = this.scaleFactor * widget.h
            this.widget.w = this.scaleFactor * widget.w

            if (!this.widget.props.animation) {
                this.widget.props.animation = {
                    type: null,
                    easing: 'linear',
                    duration: 1
                }
            }
            this.render(this.widget);
        },
        
        getValue (){
            return this.widget.props.animation;
        },
                
        render (widget){

            
            const animation = widget.props.animation

            this.cntr.innerHTML="";
            this.cleanUpTempListener();
            
            const parent = this.db.div("").build();
            const row = this.db.div("form-group").build(parent);

            const btn = this.$new(DropDownButton, {maxLabelLength:20});
            btn.setOptions([
                {value: null, label:"No Animation", icon:"mdi mdi-close"},
                {value:"grow", label:"All at once", icon:"mdi mdi-movie-open"},
                {value:"slide", label:"One by One", icon:"mdi mdi-movie-open-outline"},
            ]);
            btn.setValue(animation.type);
    
            btn.updateLabel = true;
            btn.placeAt(row);
            this.tempOwn(on(btn, "change", lang.hitch(this, "onChangeAnimation")));
        
        
            if(animation.type){
            
                let row = this.db.div("form-group").build(parent);
                let btn = this.$new(DropDownButton, {maxLabelLength:20});
                btn.setOptions([
                    {value:0.25, label: "0.25 s", icon:"mdi mdi-timer"},
                    {value:0.33, label: "0.33 s", icon:"mdi mdi-timer"},
                    {value:0.5, label: "0.5 s", icon:"mdi mdi-timer"},
                    {value:0.75, label: "0.75 ms", icon:"mdi mdi-timer"},
                    {value:1, label: "1.0 s", icon:"mdi mdi-timer"},
                    {value:1.5, label: "1.5 s", icon:"mdi mdi-timer"},
                    {value:2, label: "2.0 s", icon:"mdi mdi-timer"},
                    {value:3, label: "3.0 s", icon:"mdi mdi-timer"},
                    {value:5, label: "5.0 s", icon:"mdi mdi-timer"},
                ]);
                btn.setValue(animation.duration);
                btn.updateLabel = true;
                btn.placeAt(row);
                this.tempOwn(on(btn, "change", lang.hitch(this, "onChangeDuration")));
            
                row = this.db.div("form-group").build(parent);
                btn = this.$new(DropDownButton, {maxLabelLength:20});
                btn.setOptions([
                    {value: "linear", label:"Linear", icon:"mdi mdi-sigma"},
                    {value:"easeInQuad", label: "Ease-In", icon:"mdi mdi-sigma"},
                    {value:"easeOutQuad", label: "Ease-Out", icon:"mdi mdi-sigma"},
                    {value:"easeInOutQuad", label: "Ease-In-Out", icon:"mdi mdi-sigma"},
                    {value:"easeElasticIn" , label: "Ease-lastic-In", icon:"mdi mdi-sigma"},
                    {value:"easeElasticOut", label: "Ease-Elastic-Out", icon:"mdi mdi-sigma"},
                    {value:"easeBounceIn", label: "Ease-Bounce-In", icon:"mdi mdi-sigma"},
                    {value:"easeBounceOut", label: "Ease-Bounce-Out", icon:"mdi mdi-sigma"}	                
                ]);
                btn.setValue(animation.easing);
                btn.updateLabel = true;
                btn.placeAt(row);
                this.tempOwn(on(btn, "change", lang.hitch(this, "onChangeEasing")));	
            }		
            this.cntr.appendChild(parent);			
            this.initAnimation(widget);
        },
       
        initAnimation (widget){
            this.display.innerHTML = "";
            const h = (150 / widget.w) * widget.h
            const wrapper = this.db
                .div('MatcChartAnimationSettingsWrapper')
                .h(h)
                .build()
            this.chart = this.$new(Chart, {
                isSimulator:true, 
                type: this.getType(widget)
            })
            this.chart.placeAt(wrapper)
            this.chart.render(widget, widget.style, this.scaleFactor, this.scaleFactor)
            this.display.appendChild(wrapper)
        },


        showAnimation () {
            if (this.chart) {
                const widget = this.widget
                this.chart.render(widget, widget.style, this.scaleFactor, this.scaleFactor)
            }
        },

        getType (widget) {
            if (widget.type === 'BarChart') {
                return 'bar'
            }
            if (widget.type === 'RingChart') {
                return 'ring'
            }
            if (widget.type === 'PieChart') {
                return 'pie'
            }
            if (widget.type === 'MultiRingChart') {
                return 'multiring'
            }
            if (widget.type === 'StackedRingChart') {
                return 'stackedring'
            }
        },
        
        onChangeAnimation (value){
            this.widget.props.animation.type = value
            this.dirty = true;
            this.render(this.widget)
        },
       
        onChangeDuration (value){
            this.widget.props.animation.duration = value
            this.dirty = true;
            this.render(this.widget)
        },
       
        onChangeEasing (value){
            this.widget.props.animation.easing = value
            this.dirty = true;
            this.render(this.widget)
        },
   }, 
   mounted () {
   }
}
</script>