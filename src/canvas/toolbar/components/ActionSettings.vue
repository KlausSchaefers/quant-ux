
<template>
     <div class="MatcActionSettings">	
		<div class="container">
		<div class="row">		
				<div class="col-md-8" role="menu" data-dojo-attach-point="cntr">
				</div>		
				<div class="col-md-4" role="menu" data-dojo-attach-point="">				
					<div class="MatcActionSettingsAnimCntr" data-dojo-attach-point="display"> Preview					
					</div>				
				</div>
			</div>
		</div>				
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import _Tooltip from 'common/_Tooltip'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import DropDownButton from 'page/DropDownButton'
import Animation from 'core/Animation'

export default {
    name: 'ActionSettings',
    mixins:[_Tooltip, DojoWidget],
    data: function () {
        return {
            arrowSize: 10
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
		
			
		setScreen (s){
			this.screen = s;
		},
		
		setValue (line){
			this.value = lang.clone(line);
			this.render(this.value);
		},
		
		getValue (){
			return this.value;
		},
		
		
		
		render (line){
		
			this.cntr.innerHTML="";
			this.cleanUpTempListener();
			
			const parent = this.db.div("").build();

			const row = this.db.div("form-group").build(parent);
				
			const btn = this.$new(DropDownButton, {maxLabelLength:20});

			let animationOptions = [
                {value:null, label:"No Animation", icon:"DeleteX"},
                {value:"transform", label:"Transform", icon:"AnimationTransform"},

                {value:"slideLeft", label:"Left Slide", icon:"AnimationLeft"},
                {value:"slideRight", label: "Right Slide", icon:"AnimationRight"},
                {value:"slideUp", label: "Up Slide", icon:"AnimationUp"},
                {value:"slideDown", label: "Down Slide", icon:"AnimationDown"},          
                
                {value:"fadeIn", label: "Fade In", icon:"AnimationFadeIn"},
                {value:"zoomIn", label:"Zoom In", icon:"AnimationZoom"}
          	
            ]
			if(line.scroll){ 
				animationOptions = [
					{value:"scroll", label:"Scroll", icon:"AnimationScroll"}
				]
			}

			btn.setOptions(animationOptions);
			btn.setValue(line.animation);
	
			btn.updateLabel = true;
			btn.placeAt(row);
			this.tempOwn(on(btn, "change", lang.hitch(this, "onLineAnimation")));
		
						
			if(line.animation){
							
				let row = this.db.div("form-group").build(parent);
				let btn = this.$new(DropDownButton, {maxLabelLength:20});
				btn.setOptions([
	                {value:null, label:"Default Duration", icon:"AnimationDuration"},
	                {value:100, label:"0.1 s", icon:"AnimationDuration"},
	                {value:250, label: "0.25 s", icon:"AnimationDuration"},
	                {value:333, label: "0.33 s", icon:"AnimationDuration"},
	                {value:500, label: "0.5 s", icon:"AnimationDuration"},
	                {value:750, label: "0.75 ms", icon:"AnimationDuration"},
	                {value:1000, label: "1.0 s", icon:"AnimationDuration"},
	                {value:1500, label: "1.5 s", icon:"AnimationDuration"},
	                {value:2000, label: "2.0 s", icon:"AnimationDuration"}
	            ]);
				btn.setValue(line.duration);
				btn.updateLabel = true;
				btn.placeAt(row);
				this.tempOwn(on(btn, "change", lang.hitch(this, "onLineDuation")));
			
				row = this.db.div("form-group").build(parent);
				btn = this.$new(DropDownButton, {maxLabelLength:20});
				btn.setOptions([
	                {value:null, label:"Default Easing", icon:"AnimationEasing"},
	                {value:"linear", label:"Linear", icon:"AnimationEasing"},
	                {value:"easeInQuad", label: "Ease-In", icon:"AnimationEasing"},
	                {value:"easeOutQuad", label: "Ease-Out", icon:"AnimationEasing"},
	                {value:"easeInOutQuad", label: "Ease-In-Out", icon:"AnimationEasing"},
	                {value:"easeElasticIn" , label: "Ease-lastic-In", icon:"AnimationEasing"},
	                {value:"easeElasticOut", label: "Ease-Elastic-Out", icon:"AnimationEasing"},
	                {value:"easeBounceIn", label: "Ease-Bounce-In", icon:"AnimationEasing"},
	                {value:"easeBounceOut", label: "Ease-Bounce-Out", icon:"AnimationEasing"}	                
	            ]);
				btn.setValue(line.easing);
				btn.updateLabel = true;
				btn.placeAt(row);
				this.tempOwn(on(btn, "change", lang.hitch(this, "onLineEasing")));	
			}		
			this.cntr.appendChild(parent);			
			this.showAnimation();
		},
		
		showAnimation:function(){
			
			this.display.innerHTML="";

			const db = new DomBuilder();
			const node = this.display;
			
			const sOld = db.div("MatcActionSettingsScreenOld").build(node);
			const sNew = db.div("MatcActionSettingsScreenNew").build(node);


			if(this.animationFactory["createScreen_"+ this.value.animation]){
				
				const animation = this.animationFactory["createScreen_"+ this.value.animation]({w:150,h:130}, sOld,sNew , false);
				animation.onEnd(function(){						
					css.remove(node, "MatcActionSettingsAnimCntrPlaying");
					db.div("MatcActionSettingsPlay MatcMiddle mdi mdi-play").build(sNew);
				});
				
				if(this.value.duration){
					animation.setDuration(this.value.duration);
				}
				if(this.value.easing){
					animation.setEasing(this.value.easing);
				}
				
				animation.run();
			} else {
				db.div("MatcActionSettingsPlay MatcMiddle mdi mdi-play").build(sNew);
			}
		},
		
		onLineValidation (value){
			var val ={ all: value}
			this.value.validation = val;
			this.dirty = true;
		},
		
		onLineEasing (value){
			this.value.easing = value;
			this.dirty = true;
			this.render(this.value);	
		},
		
		onLineHide (value){
			this.dirty = true;
			this.value.hidden = value;
			this.render(this.value);
		},
		
		onLineAnimation (value){
			this.dirty = true;
			this.value.animation = value;
			this.render(this.value);	
		},
		
		onLineOverLay (value){
			this.dirty = true;
			this.value.overlay = value;
			this.render(this.value);
		},
		
		onLineDuation (value){
			this.dirty = true;
			this.value.duration = value;
			this.render(this.value);
		}
    }, 
    mounted () {
    }
}
</script>