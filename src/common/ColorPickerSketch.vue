
<template>
     <div class="VommondColorPickerSketch">
		<div class="VommondColorPickerSketchSaturationCntr" data-dojo-attach-point="satCntr">				
			<div class="VommondColorPickerSketchSaturationCntrWhite"></div>
			<div class="VommondColorPickerSketchSaturationCntrBlack"></div>
			<div class="VommondColorPickerSketchSaturationPointer" data-dojo-attach-point="satPointer"> 
				<div class="VommondColorPickerSketchSaturationPointerCirle"> 
				</div> 
			</div> 				
		</div>
		<div class="VommondColorPickerSketchBody">				
			<div class="VommondColorPickerSketchSliderAndPreview"> 
				<div class="VommondColorPickerSketchSliderCntr"> 
					<div class="VommondColorPickerSketchHue" data-dojo-attach-point="hueCntr"> 
							<div class="VommondColorPickerSketchHuePointer" data-dojo-attach-point="huePointer"> 
							<div class="VommondColorPickerSketchHuePointerBox"> 
							</div> 
						</div> 
					</div> 
					<div class="VommondColorPickerSketchAlpha"> 
					</div> 
					<div class="VommondColorPickerSketchControlCntr"> 							
						<input class="VommondColorPickerHexInput vommondLineInput MatcIgnoreOnKeyPress" data-dojo-attach-point="inputHex" />
						<input class="VommondColorPickerNumberInput vommondLineInput MatcIgnoreOnKeyPress" data-dojo-attach-point="inputR" value="0" />
						<input class="VommondColorPickerNumberInput vommondLineInput MatcIgnoreOnKeyPress" data-dojo-attach-point="inputG" value="0" />
						<input class="VommondColorPickerNumberInput vommondLineInput MatcIgnoreOnKeyPress" data-dojo-attach-point="inputB" value="0" />
					</div>
					<div class="VommondColorPickerSketchControlLabels"> 							
						<span>Hex</span> 
						<span>R</span> 
						<span>G</span> 
						<span>B</span> 
					</div>
				</div> 							
				<div class="VommondColorPickerSketchPreview" data-dojo-attach-point="preview"> 
				</div> 
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
import Color from 'dojo/_base/Color'
// import HSlider from 'common/HSlider'

export default {
    name: 'ColorPickerSketch',
    mixins:[DojoWidget],
    data: function () {
        return {
            
        }
    },
    components: {},
    methods: {
      postCreate: function(){
				
				this.color = new Color({ r:0, g:0, b:0});
				
				
				this.own(on(this.inputR, "keyup", lang.hitch(this, "onRGBChange")));
				this.own(on(this.inputG, "keyup", lang.hitch(this, "onRGBChange")));
				this.own(on(this.inputB, "keyup", lang.hitch(this, "onRGBChange")));
				this.own(on(this.inputHex, "change", lang.hitch(this, "onHexChange")));
				
				this.own(on(this.inputR, "keypress", function(e){e.stopPropagation()}));
				this.own(on(this.inputR, "keydown", function(e){e.stopPropagation()}));
					
				this.own(on(this.inputG, "keypress", function(e){e.stopPropagation()}));
				this.own(on(this.inputG, "keydown", function(e){e.stopPropagation()}));
				
				this.own(on(this.inputB, "keypress", function(e){e.stopPropagation()}));
				this.own(on(this.inputB, "keydown", function(e){e.stopPropagation()}));
				
				this.own(on(this.inputHex, "keypress", function(e){e.stopPropagation()}));
				this.own(on(this.inputHex, "keydown", function(e){e.stopPropagation()}));
				
				this.own(on(this.satCntr, touch.press, lang.hitch(this, "onSatPress")));
				this.own(on(this.hueCntr, touch.press, lang.hitch(this, "onHuePress")));
				
				this.own(on(this.domNode, "mousedown", function(e){e.stopPropagation()}));
			},
			
			
			
			
			onRGBChange (){		
				var red = this.getInt(this.inputR);
				var green = this.getInt(this.inputG);
				var blue = this.getInt(this.inputB);
				var c = new Color([red, green, blue]);
				this.setColor(c);
			},
			
			onHexChange (){
				var c = new Color(this.inputHex.value);
				if(c){
					css.remove(this.inputHex, "VommondFormInputError");
					this.setColor(c);
				} else {
					css.add(this.inputHex, "VommondFormInputError");
				}
			},
			
			getInt (input){
				var value = input.value;
				var er = /^[0-9]+$/;
				var valid =  er.test(value);
				if(!valid || value > 255){
					css.add(input, "VommondFormInputError");
					return 0;
				}
				css.remove(input, "VommondFormInputError");
				return value;
			},
		
			onSatPress (e){
				this.stopEvent(e);
				var hsv = this.toHsv(this.color);
				/**
				 * Sometimes the hue value is not converted correctly when
				 * the hue is changed as sat values are 0. E.g. #333 will 
				 * stay the same, although hue is moved. we fix this be overwriting
				 * the h value
				 */
				if (this.lastHue){
					hsv.h = this.lastHue;
				}
				this._touchMoveListner = on(win.body(),touch.move, lang.hitch(this,"onSatMove", hsv));
				this._touchReleaseListner = on(win.body(),touch.release, lang.hitch(this,"cleanUp",hsv));
				this.onSatMove(hsv, e);
			},
			
			onSatMove (hsv, e){
		
				this.stopEvent(e);
				var pos = this.getMousePos(e,this.satCntr)
				// calculate new sat and bright
				var saturation = pos.left;
				var bright = -(pos.top) + 1;
				bright = bright > 0 ? bright : 0;
				bright = bright > 1 ? 1 : bright;
				
				// update pointer
				this.satPointer.style.top = (-(bright * 100) + 1) + 100 + '%';
				this.satPointer.style.left = saturation * 100 + '%'
				
				// update controls and 
				var c = this.hsvToRgb(hsv.h, saturation, bright);
				this.setControls(c);
			},
			
			
			onHuePress (e){
				this.stopEvent(e);
				var hsv = this.toHsv(this.color);
				this._touchMoveListner = on(win.body(),touch.move, lang.hitch(this,"onHueMove",hsv));
				this._touchReleaseListner = on(win.body(),touch.release, lang.hitch(this,"onHueRelease", hsv));
				this.onHueMove(hsv, e);
			},
			
			onHueMove (hsv, e){
				var pos = this.getMousePos(e,this.hueCntr)
				var left = pos.left
				var h = 0;
					var percent
						if (left > 1) {
							h = 360
						} else {
							percent = left * 100
							h = (360 * percent / 100)
						}
					if (h != hsv.h){
						this.huePointer.style.left = percent + '%'
						this.satCntr.style.background = "hsl(" + (h) + ", 100%, 50%)";
						var c = this.hsvToRgb(h, hsv.s, hsv.v);
						this.setControls(c);
					}
			},
			
			onHueRelease (hsv, e){
				this.cleanUp();
				var pos = this.getMousePos(e,this.hueCntr)
				var left = pos.left
				var h = 0;
					var percent
						if (left > 1) {
							h = 360
						} else {
							percent = left * 100
							h = (360 * percent / 100)
						}
					if (h != hsv.h){
						this.huePointer.style.left = percent + '%'
						this.satCntr.style.background = "hsl(" + (h) + ", 100%, 50%)";
						var c = this.hsvToRgb(h, hsv.s, hsv.v);
						this.setControls(c);
					}
					/**
				 * Sometimes the hue value is not converted correctly when
				 * the hue is changed as sat values are 0. E.g. #333 will 
				 * stay the same, although hue is moved. we fix this be overwriting
				 * the h value
				 */
				this.lastHue = h;
			},
				
			setColor (c, ignoreBackground){
				this.setSaturation(c, ignoreBackground);
				this.setHue(c, ignoreBackground);
				this.setControls(c);
			},
			

			setHue (c){
				var hsv = this.toHsv(c);
					this.huePointer.style.left = (hsv.h * 100/ 360) + '%'
			},
			
			setSaturation (c){
				var hsv = this.toHsv(c);
				this.satCntr.style.background = "hsl(" + (hsv.h) + ", 100%, 50%)";
				this.satPointer.style.top = (-(hsv.v * 100) + 1) + 100 + '%';
				this.satPointer.style.left = hsv.s * 100 + '%'
				},
			
			setControls (c){
				this.setColorPreview(c);
				this.setColorInput(c);
				this.color = c;
				this.onChange();
			},
			
			setColorInput (c){
				var rgb =  c.toRgb();
				if(rgb[0] != this.inputR.value){
					this.inputR.value = rgb[0];
				}
				if(rgb[1] != this.inputG.value){
					this.inputG.value = rgb[1];
				}
				if(rgb[2] != this.inputB.value){
					this.inputB.value = rgb[2];
				}
				if(c.toHex() != this.inputHex.value){
					this.inputHex.value = c.toHex();
				}
			},
			
			setColorPreview (c){
				this.preview.style.background=c.toHex();
			},
			
			
			cleanUp (){
				if(this._touchMoveListner){
					this._touchMoveListner.remove();
				}
				if(this._touchReleaseListner){
					this._touchReleaseListner.remove();
				}
				this._touchReleaseListner = null;
				this._touchMoveListner = null;
			},
			
			getValue (){
				return this.color;
			},
			
			setValue (hex){
				if (hex && hex.toLowerCase) {
					if (hex !== 'transparent') {
						var c = new Color(hex);
						if (c){
							this.setColor(c);
						} else {
							console.warn("Error while setting value", hex);
						}
					}
				} else {
					console.debug("ColorPickerSketch.setValue() > No String", hex);
				}
			},
			
			onChange (){
				this.emit("change", this.color.toHex());
			},
			
			toHsv: function(c) {
				var rgb =  c.toRgb();
				return this.rgbToHsv(rgb[0], rgb[1], rgb[2]);
			},
			
			rgbToHsv (r, g, b) {	
				r= r/255;
				g= g/255;
				b= b/255;
				var min = Math.min(r, b, g);
				var max = Math.max(r, g, b);
				var delta = max-min;
				var h = null, s = (max==0)?0:(delta/max);
				if (s==0){
					h = 0;
				}else{
					if (r==max){
						h = 60*(g-b)/delta;
					}else if (g==max){
						h = 120 + 60*(b-r)/delta;
					}else{
						h = 240 + 60*(r-g)/delta;
					}
					if (h<0){ 
						h+=360;
					}
				}
				return { h:h, s:(s), v:(max) };	//	Object
			},
			
			hsvToRgb (hue, saturation, value){
				if(hue==360){ 
					hue=0;
				}
				var r, g, b;
				if(saturation==0){
					r=value, b=value, g=value;
				}else{
					var hTemp=hue/60, i=Math.floor(hTemp), f=hTemp-i;
					var p=value*(1-saturation);
					var q=value*(1-(saturation*f));
					var t=value*(1-(saturation*(1-f)));
					switch(i){
						case 0:{ r=value, g=t, b=p; break; }
						case 1:{ r=q, g=value, b=p; break; }
						case 2:{ r=p, g=value, b=t; break; }
						case 3:{ r=p, g=q, b=value; break; }
						case 4:{ r=t, g=p, b=value; break; }
						case 5:{ r=value, g=p, b=q; break; }
					}
				}
				return new Color({ r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255) });	//	dojox.color.Color
			},
			
			getMousePos (e, container){
				var containerWidth = container.clientWidth;
				var containerHeight = container.clientHeight;
				var xOffset = container.getBoundingClientRect().left + window.pageXOffset;
				var yOffset = container.getBoundingClientRect().top + window.pageYOffset;
				var pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
				var pageY = e.pageY || (e.touches ? e.touches[0].pageY : 0);
				var left = pageX - xOffset;
				var top = pageY - yOffset;
				if (left < 0) {
					left = 0;
				} else if (left > containerWidth) {
					left = containerWidth;
				} else if (top < 0) {
					top = 0;
				} else if (top > containerHeight) {
					top = containerHeight;
				}
				return {
					top:top / containerHeight,
					left:left / containerWidth
				}
			},
			destroy (){
				this.cleanUp();
			}
    }, 
    mounted () {
    }
}
</script>