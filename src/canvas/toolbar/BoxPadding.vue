
<template>
     <div class="MatcBoxBorder  MatcBoxPadding">
		<div class="MatcBoxBorderContainer" data-dojo-attach-point="cntr">
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import DomBuilder from 'common/DomBuilder'
// import ToolbarColor from 'canvas/toolbar/ToolbarColor'
import InputDropDownButton from 'canvas/toolbar/InputDropDownButton'
import BoxBorder from 'canvas/toolbar/BoxBorder'

export default {
    name: 'BoxPadding',
    mixins:[BoxBorder, DojoWidget],
    data: function () {
        return {
            value: false, 
            padding: ["paddingTop","paddingBottom", "paddingLeft", "paddingRight" ], 
            inputEvent: "change"
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			
			this.db = new DomBuilder();
		
				
			this.render();
		},
		
		render:function(){
			if(!this.rendered){
	
				/**
				 * Width
				 */
				var cntrPos = {w : 150, h:70};
				var inputPos= {w: 40, h : 24};
				
				var options = [0,1,2,3,4,5,6,7,8,9,10,12,14,16,20,24,32];
				
				this.paddingTop = this.renderIntBox(this.cntr,options );	
				this.paddingTop.domNode.style.top = -1 * ((inputPos.h/2)-1)+"px";
				this.paddingTop.domNode.style.left = (cntrPos.w - inputPos.w) /2+"px";
				
				this.paddingBottom = this.renderIntBox(this.cntr, options);	
				this.paddingBottom.domNode.style.bottom = -1 * ((inputPos.h/2)-1)+"px";
				this.paddingBottom.domNode.style.left = (cntrPos.w - inputPos.w) /2+"px";
				
	
				this.paddingLeft = this.renderIntBox(this.cntr, options);	
				this.paddingLeft.domNode.style.top =  (cntrPos.h - inputPos.h) /2-1+"px";
				this.paddingLeft.domNode.style.left = -1 * ((inputPos.w /2)-1)+"px";
				
				this.paddingRight = this.renderIntBox(this.cntr, options);	
				this.paddingRight.domNode.style.top =  (cntrPos.h - inputPos.h) /2 -1+"px";
				this.paddingRight.domNode.style.right = -1 * ((inputPos.w /2)-1)+"px";
				
				this.lockWidth = this.renderLock(this.cntr, cntrPos);
				
				this.own(on( this.paddingTop, this.inputEvent, lang.hitch(this,"setPadding", "paddingTop", this.paddingTop)));
				this.own(on( this.paddingBottom, this.inputEvent, lang.hitch(this,"setPadding", "paddingBottom", this.paddingBottom)));
				this.own(on( this.paddingLeft, this.inputEvent, lang.hitch(this,"setPadding", "paddingLeft", this.paddingLeft)));
				this.own(on( this.paddingRight, this.inputEvent, lang.hitch(this,"setPadding", "paddingRight", this.paddingRight)));
				this.own(on( this.lockWidth, touch.press, lang.hitch(this,"toggleLock", this.lockWidth)));
			
				
				this.rendered = true;

			}
		},
		
		setPadding:function(key, input, value){		
			value = value* 1;
			if(this.isValid(value)){
				this.value[key] = value;				
				if(this.isLocked){
					for(var i=0; i < 4; i++){
						var k = this.padding[i];
						this.value[k] = value;
					}
				}				
				this.emit("change", this.getDelta(this.value));
			}			
			//this.showPadding();
		},
		
		
		showPadding:function(){		
			this.isLocked = this.isEqual(this.padding);
			this.setLock(this.lockWidth);	
			
			/**
			 * set values
			 */
			this.paddingTop.setValue(this.value.paddingTop);
			this.paddingBottom.setValue(this.value.paddingBottom);
			this.paddingLeft.setValue(this.value.paddingLeft);
			this.paddingRight.setValue(this.value.paddingRight);			
	
		},
		
		renderIntBox:function(parent, options){
			var input =  this.$new(InputDropDownButton);
			input.setOptions(options);
			input.placeAt(parent);
			input.reposition = true;
			return input;
		},
		
		isValid:function(value){
			var er = /^-?[0-9]+$/;
			var valid =  er.test(value);
			if(!valid){
				return false;
			}
			if(value >= -1){
				return true;
			}
			return false;
		},
		
		setValue:function(v){
			/**
			 * Clone object as we toggle the value in the toogle()
			 * method and as consequence the command delta 
			 * would be null!
			 */
			var clone = {};
			for(var i=0; i < 4; i++){
				var s = this.padding[i];
				clone[s] = v[s];	
			}			
			this.value = clone;
			this.orginalValue = v;
			this.showPadding();
		}
    }, 
    mounted () {
    }
}
</script>