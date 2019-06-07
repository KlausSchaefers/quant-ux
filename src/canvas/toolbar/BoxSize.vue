
<template>
     <div class="MatcBoxSize">
		
		<div data-dojo-attach-point="layerX" class="MatcToolbarFlexCntr">
			<div class="MatcToolbarItem MatcToolbarItemSmall " >
				<span class="MatcBoxSizeLabel">X :</span>
				<input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput" data-dojo-attach-point="inputX"/>
			</div>			
			<div class="MatcToolbarItem MatcToolbarItemSmall" >
				<span class="MatcBoxSizeLabel">Y :</span>
				<input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput" data-dojo-attach-point="inputY"/>
			</div>		
		</div>
		
		<div class="MatcToolbarFlexCntr" >
			<div class="MatcToolbarItem MatcToolbarItemSmall" >
				<span class="MatcBoxSizeLabel">W :</span>
				<input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput" data-dojo-attach-point="inputW"/>
			</div>		
			<div class="MatcToolbarItem MatcToolbarItemSmall" >
				<span class="MatcBoxSizeLabel">H :</span>
				<input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput" data-dojo-attach-point="inputH"/>
			</div>			
		</div>
		
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
// import win from 'dojo/win'
import on from 'dojo/on'
import Util from 'core/Util'

export default {
    name: 'BoxSize',
    mixins:[Util, DojoWidget],
    data: function () {
        return {
            value: null, 
            inputEvent: "change", 
            mode: "all"
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.own(on( this.inputX, this.inputEvent, lang.hitch(this,"update")));
			this.own(on( this.inputY, this.inputEvent, lang.hitch(this,"update")));
			this.own(on( this.inputH, this.inputEvent, lang.hitch(this,"update")));
			this.own(on( this.inputW, this.inputEvent, lang.hitch(this,"update")));
			
			this.own(on( this.inputX, "focus", function(e) {e.target.select()}));
			this.own(on( this.inputY, "focus", function(e) {e.target.select()}));
			this.own(on( this.inputH, "focus", function(e) {e.target.select()}));
			this.own(on( this.inputW, "focus", function(e) {e.target.select()}));
			
	
			if(this.mode == "widthAndHeight"){
				css.add(this.layerX, "hidden");
				this.inputW.disabled = true;
				css.add(this.inputW, "MatcToobarInlineEditDisabled");
			}
		},
	
		isDirty:function(){
			return this._dirty;
		},
		
		update:function(e){
						
			this.stopEvent(e);
			
			this._dirty = true;
			if(this.value){
				var h = this.inputH.value;
				var w =this.inputW.value;
				
				if( (this.isValid(h, this.inputH) && h != this.value.h) || 
					(this.isValid(w, this.inputW) && w != this.value.w)){	
					this.value.h = h*1;
					this.value.w =w*1;
				
					this.emit("change", this.value);
				}
				
				if(this.mode == "all"){
					var parent= this.getParentScreen(this.value);
					if(parent){
						var x = this.inputX.value*1 + parent.x;
						var y =this.inputY.value*1 + parent.y;
						
						
						if((this.isValid(x, this.inputX) && x != this.value.x) || 
						   (this.isValid(y, this.inputY) && y != this.value.y)){	
							this.value.y = y*1;
							this.value.x =x*1;
							
							this.emit("change", this.value);
						}
					}
				}
			}
			
		},
		
		isValid:function(value){
			var er = /^-?[0-9]+$/;
			var valid =  er.test(value);
			if(!valid){
				/**
				 * FIXME: add here some kind if css class or so?
				 */
				return false;
			}
			
			if(value > 0){
				return true;
			}
			
			return false;
		},
		
		setModel:function(m){
			this.model = m;
		},
	
		
		setValue:function(box){
			this._dirty = false;
			
			/**
			 * make a copy so we do not modify the real model!
			 */
			this.value = {
				h: box.h,
				w: box.w,
				x: box.x,
				y: box.y,
				id : box.id
			};
			
			this.render();
		
		},
		
		
		render:function(){
			/**
			 * w and h
			 */
			this.inputH.value = this.value.h;
			this.inputW.value = this.value.w;
			
			
			if(this.mode == "all"){
				/**
				 * x and y
				 */
				var parent= this.getParentScreen(this.value);
				if(parent){
					this.inputX.value = this.value.x - parent.x;
					this.inputY.value = this.value.y - parent.y;
				} else {
					/**
					 * DISABLE?
					 */
					this.inputX.value = "-";
					this.inputY.value = "-";
				}
			
			}
			

			
		},
		
		blur:function(){
			this.inputH.blur();
			this.inputW.blur();
			this.inputX.blur();
			this.inputY.blur();
		}
    }, 
    mounted () {
    }
}
</script>