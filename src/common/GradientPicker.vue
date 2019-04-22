
<template>
     <div class="VommondGradientPicker">
		<div class="VommondGradientPickerTopRow">
			<div class="VommondGradientPickerTopLeft" data-dojo-attach-point="topLeft">

			</div>
			<div class="VommondGradientPickerTopRight">
				<div class="VommondGradientPickerPreviewCntr" data-dojo-attach-point="topRight">
				</div>
				<div>
					<input class="VommondGradientPickerRotationInput MatcIgnoreOnKeyPress" data-dojo-attach-point="inputDegree"/>
				</div>
				<div class="VommondGradientPickerSketchControlLabels"> 
					<span>Rotation</span> 
				</div>
			</div>
		
		</div>
		<div class="VommondGradientPickerBottomRow">
			<div class="VommondGradientPickerSelector" data-dojo-attach-point="selector">
			</div>
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import win from 'dojo/_base/win'
import on from 'dojo/on'
import touch from 'dojo/touch'
import domGeom from 'dojo/domGeom'
import ColorPickerSketch from 'common/ColorPickerSketch'
import DomBuilder from 'common/DomBuilder'

export default {
    name: 'GradientPicker',
    mixins:[DojoWidget],
    data: function () {
        return {
            value: {
				colors : [
					{c:"#fff", p:0},
					{c:"#ccc", p:100},
				],
				gradient: true, 
				direction: 90, 
				gradientHeight: 300, 
				gradientWidth: 30, 
				selectedHandle: 0
			}
		}
    },
    components: {},
    methods: {
        postCreate: function(){			
			var db =new DomBuilder();
			this.colorPicker = this.$new(ColorPickerSketch);
			this.colorPicker.placeAt(this.topLeft);
			this.own(this.colorPicker.on("change", lang.hitch(this, "onColorChange")));

			this.preview = db.div("VommondGradientPickerPreview").build(this.topRight);
			
			this.own(on(this.inputDegree, "keypress", function(e){e.stopPropagation()}));
			this.own(on(this.inputDegree, "keydown", function(e){e.stopPropagation()}));
			this.own(on(this.inputDegree, "change", lang.hitch(this, "onDirectionChange")));
			
			this.setValue(this.value);
		},
		
		
		
		

		getValue:function(){
			return this.value;
		},
		
		setValue:function(value){
			this.value = lang.clone(value);
			this._setGradientCSS(this.preview, this.value );
			this.inputDegree.value = value.direction;
			
			/**
			 * set selector
			 */
			this.setSelectorColor(value);
			this.setSelectorPos(value);
		},
		
		setSelectorColor:function(value){
			var l = lang.clone(value);
			l.direction  =90;
			this._setGradientCSS(this.selector, l );
		},
		
		setSelectorPos:function(gradient){
			var pos = domGeom.position(this.selector);
			
			if(!this.selectorButtons){
				this.selectorButtons = [];
				this.selectorButtonsColor = [];
				this.cleanUpTempListener();
				var db = new DomBuilder();
				
				this.selector.innerHTML="";
				for(let i=0; i < gradient.colors.length; i++){
					// let color = gradient.colors[i];
					let cntr = db.div("VommondGradientPickerSelectorHandleCntr").build(this.selector);
					let handle = db.div("VommondGradientPickerSelectorHandle").build(cntr);
					this.selectorButtons[i] = cntr;
					this.selectorButtonsColor[i] = handle;					
					this.tempOwn(on( cntr, touch.press,lang.hitch(this, "onSelectorPress", i)));
				}				
				this.selectHandle(0);
			}
			
			for(let i=0; i < gradient.colors.length; i++){
				let color = gradient.colors[i];
				this.selectorButtonsColor[i].style.background = color.c;
				this.selectorButtons[i].style.left =  (color.p /100 * pos.w) +"px";
			}
		
			
		},
		
		onSelectorPress:function(i, e){
			this.stopEvent(e);		
			this.selectHandle(i);			
			this._touchMoveListner = on(win.body(),touch.move, lang.hitch(this,"onSelectorMove"));
			this._touchReleaseListner = on(win.body(),touch.release, lang.hitch(this,"cleanUp"));
			this.onSelectorMove(e);
			
		},
		
		onSelectorMove:function(e){		
			var pos = this.getMousePos(e, this.selector);			
			var p = Math.min(100,Math.max(0,Math.round(pos.x *100 / pos.w) ));			
			if(this.selectedHandle < this.value.colors.length){
				this.value.colors[this.selectedHandle].p = p;
				this.setValue(this.value);
			}			
		},
		
		selectHandle:function(i){
			this.selectedHandle = i;
			for(var j =0; j < this.selectorButtons.length; j++){
				css.remove(this.selectorButtons[j], "VommondGradientPickerSelectorHandleCntrSelected");
			}			
			css.add(this.selectorButtons[i], "VommondGradientPickerSelectorHandleCntrSelected");			
			var selectedColor = this.value.colors[i];
			this.colorPicker.setValue(selectedColor.c);			
		},
		
		onColorChange:function(c){
			if(this.selectedHandle < this.value.colors.length){
				this.value.colors[this.selectedHandle].c = c
				this.setValue(this.value);
			}
		},
		
		setLabel:function(){
			//this.label.innerHTML=label;	
		},
		
		onDirectionChange:function(){
			this.value.direction = this.inputDegree.value;
			this.setValue(this.value);
		},
		
		

		cleanUp:function(){
			if(this._touchMoveListner){
				this._touchMoveListner.remove();
			}
			if(this._touchReleaseListner){
				this._touchReleaseListner.remove();
			}
			this._touchReleaseListner = null;
			this._touchMoveListner = null;
		},
		
		getMousePos:function(evt, div) {
	        var pos = domGeom.position(div);
	        	
	        return {
	          x: (evt.clientX - pos.x),
	          y: (evt.clientY - pos.y),
	          w: pos.w,
	          h: pos.y
	        };
	    },
		
		
		_setGradientCSS:function(node, gradient){
			var value = "(" + gradient.direction + "deg";
			for(var i=0; i < gradient.colors.length; i++){
				var color = gradient.colors[i];
				value += "," + color.c + " " + color.p+"% ";
			}
			value +");";
			node.style.background = "linear-gradient" + value;
			node.style.background = "-webkit-linear-gradient" + value;
		}
    }, 
    mounted () {
    }
}
</script>