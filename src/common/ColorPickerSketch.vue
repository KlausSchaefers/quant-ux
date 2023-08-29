
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
					<div data-dojo-attach-point="alphaCntr" class="VommondColorPickerSketchAlpha">
						<div class="VommondColorPickerSketchHuePointer" data-dojo-attach-point="alphaPointer">
							<div class="VommondColorPickerSketchHuePointerBox">
							</div>
						</div>
					</div>
					<div class="VommondColorPickerSketchControlCntr">
						<input class="VommondColorPickerHexInput MatcIgnoreOnKeyPress" data-dojo-attach-point="inputHex" />
						<input class="VommondColorPickerNumberInput MatcIgnoreOnKeyPress" data-dojo-attach-point="inputR" value="0" />
						<input class="VommondColorPickerNumberInput MatcIgnoreOnKeyPress" data-dojo-attach-point="inputG" value="0" />
						<input class="VommondColorPickerNumberInput MatcIgnoreOnKeyPress" data-dojo-attach-point="inputB" value="0" />
						<input class="VommondColorPickerNumberInput MatcIgnoreOnKeyPress" data-dojo-attach-point="inputA" value="1" />
					</div>
					<div class="VommondColorPickerSketchControlLabels">
						<span>Hex</span>
						<span>R</span>
						<span>G</span>
						<span>B</span>
						<span>A</span>
					</div>
				</div>
				<div class="VommondColorPickerSketchPreviewCntr">
					<div class="VommondColorPickerSketchPreview" data-dojo-attach-point="preview">
					</div>
					<div class="VommondColorPickerSketchEyeDropper" v-if="hasEyeDropper">
						<QIcon icon="ColorPicker" @click.stop="openEyeDropper"></QIcon>
			
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
  @import "../style/components/color_picker_sketch.scss";
</style>

<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import win from 'dojo/_base/win'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Color from 'dojo/_base/Color'
import QIcon from 'page/QIcon'
// import HSlider from 'common/HSlider'

export default {
    name: 'ColorPickerSketch',
    mixins:[DojoWidget],
    data: function () {
        return {
        }
    },
    components: {
		'QIcon': QIcon
	},
	computed: {
		hasEyeDropper () {
			return "EyeDropper" in window
		}
	},
    methods: {
		postCreate (){
			this.color = new Color({ r:0, g:0, b:0, a:0});

			this.own(on(this.inputR, "keyup", lang.hitch(this, "onRGBChange")));
			this.own(on(this.inputG, "keyup", lang.hitch(this, "onRGBChange")));
			this.own(on(this.inputB, "keyup", lang.hitch(this, "onRGBChange")));
			this.own(on(this.inputA, "keyup", lang.hitch(this, "onRGBChange")));
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

			this.own(on(this.alphaCntr, touch.press, lang.hitch(this, "onAlphaPress")));

			this.own(on(this.domNode, "mousedown", function(e){e.stopPropagation()}));
		},

		async openEyeDropper () {
			try {
				const eyeDropper = new window.EyeDropper();
				const selectedColorHex = await eyeDropper.open();
				if (selectedColorHex.sRGBHex) {
					const color = new Color(selectedColorHex.sRGBHex);
					this.setColor(color);
					this.onChange()
				}
			} catch (err) {
				console.log('ColorPickerSketch.openEyeDropper() Could not pick', err);
			}
		},


		onRGBChange (){
			const red = this.getInt(this.inputR);
			const green = this.getInt(this.inputG);
			const blue = this.getInt(this.inputB);
			const alpha = this.getFloat(this.inputA);
			const c = new Color([red, green, blue, alpha]);
			this.setColor(c);
			this.onChange()
		},

		onHexChange (){
			const c = new Color(this.inputHex.value);
			if (c) {
				css.remove(this.inputHex, "VommondFormInputError");
				this.setColor(c);
				this.onChange()
			} else {
				css.add(this.inputHex, "VommondFormInputError");
			}
		},

		getInt (input){
			const value = input.value;
			const er = /^[0-9]+$/;
			const valid =  er.test(value);
			if (!valid || value > 255){
				css.add(input, "VommondFormInputError");
				return 0;
			}
			css.remove(input, "VommondFormInputError");
			return value;
		},

		getFloat (input) {
			const value = input.value;
			const er = /^[+-]?\d+(\.\d+)?$/
			const valid =  er.test(value);
			if (!valid || value > 1) {
				css.add(input, "VommondFormInputError");
				return 0;
			}
			css.remove(input, "VommondFormInputError");
			return value;
		},

		onSatPress (e){
			this.cleanUp()
			this.stopEvent(e);
			const hsv = this.toHsv(this.color);
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
			const pos = this.getMousePos(e,this.satCntr)
			// calculate new sat and bright
			let saturation = pos.left;
			let bright = -(pos.top) + 1;
			bright = bright > 0 ? bright : 0;
			bright = bright > 1 ? 1 : bright;

			// update pointer
			this.satPointer.style.top = (-(bright * 100) + 1) + 100 + '%';
			this.satPointer.style.left = saturation * 100 + '%'

			// update controls and
			const c = this.hsvToRgb(hsv.h, saturation, bright, hsv.a);
			this.setControls(c);
			this.onChange();
		},

		onAlphaPress (e) {
			this.cleanUp()
			this.stopEvent(e);
			let rbga = this.color
			this._touchMoveListner = on(win.body(),touch.move, lang.hitch(this,"onAlphaMove",rbga));
			this._touchReleaseListner = on(win.body(),touch.release, lang.hitch(this,"onAlphaRelease", rbga));
			this.onAlphaMove(rbga, e);
		},

		onAlphaMove (rbga, e) {
			const pos = this.getMousePos(e,this.alphaCntr)
			const left = pos.left
			rbga.a = Math.round(left * 100) / 100
			this.setAlpha(rbga)
			this.setControls(rbga);
			this.onChange();
		},

		onAlphaRelease () {
			this.cleanUp();
		},

		onHuePress (e){
			this.cleanUp()
			this.stopEvent(e);
			const hsv = this.toHsv(this.color);
			this._touchMoveListner = on(win.body(),touch.move, lang.hitch(this,"onHueMove",hsv));
			this._touchReleaseListner = on(win.body(),touch.release, lang.hitch(this,"onHueRelease", hsv));
			this.onHueMove(hsv, e);
		},

		onHueMove (hsv, e){
			const pos = this.getMousePos(e,this.hueCntr)
			const left = pos.left
			let h = 0;
			let percent = 0
			if (left > 1) {
				h = 360
			} else {
				percent = left * 100
				h = (360 * percent / 100)
			}
			if (h != hsv.h){
				this.huePointer.style.left = percent + '%'
				this.satCntr.style.background = "hsl(" + (h) + ", 100%, 50%)";
				var c = this.hsvToRgb(h, hsv.s, hsv.v, hsv.a);
				this.setControls(c);
				this.onChange();
			}
		},

		onHueRelease (hsv, e){
			this.cleanUp();
			let pos = this.getMousePos(e,this.hueCntr)
			let left = pos.left
			let h = 0;
			let percent
			if (left > 1) {
				h = 360
			} else {
				percent = left * 100
				h = (360 * percent / 100)
			}
			if (h != hsv.h){
				this.huePointer.style.left = percent + '%'
				this.satCntr.style.background = "hsl(" + (h) + ", 100%, 50%)";
				var c = this.hsvToRgb(h, hsv.s, hsv.v, hsv.a);
				this.setControls(c);
				this.onChange();
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
			this.setAlpha(c)
			this.setControls(c);
		},

		setAlpha (c) {
			this.alphaPointer.style.left = (c.a * 100) + '%'
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
		},

		setColorInput (c){
			const rgb =  c.toRgba();
			if(rgb[0] != this.inputR.value){
				this.inputR.value = rgb[0];
			}
			if(rgb[1] != this.inputG.value){
				this.inputG.value = rgb[1];
			}
			if(rgb[2] != this.inputB.value){
				this.inputB.value = rgb[2];
			}
			if(rgb[3] != undefined && rgb[3] != this.inputA.value){
				this.inputA.value = rgb[3];
			}
			let colorString = c.toHex()
			if(colorString != this.inputHex.value){
				this.inputHex.value = colorString
			}
		},

		setColorPreview (c){
			this.preview.style.background = this.getColorString(c)
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

		onParentClose () {
			this.cleanUp()
		},

		getValue (){
			return this.color;
		},

		setValue (hex){
			if (hex && hex.toLowerCase) {
				if (hex !== 'transparent') {
					let c = new Color(hex);
					if (c){
						this.setColor(c);
					} else {
						console.warn("Error while setting value", hex);
					}
				}
			} else {
				if (hex && hex.colors) {
					hex = hex.colors[0].c
					let c = new Color(hex);
					if (c){
						this.setColor(c);
					} else {
						console.warn("Error while setting value", hex);
					}
				} else {
					console.debug("ColorPickerSketch.setValue() > No String. Use #333. ");
					let c = new Color('#333');
					this.setColor(c);
				}
			}
		},

		getValueAsString() {
			if (this.color) {
				return this.getColorString(this.color)
			}
			return 'transparent'
		},

		getColorString (c) {
			if (c.a < 1) {
				return c.toCss(true)
			} else {
				return c.toHex()
			}
		},

		onChange (){
			this.emit("change", this.getColorString(this.color));
		},

		toHsv (c) {
			var rgb =  c.toRgba();
			return this.rgbToHsv(rgb[0], rgb[1], rgb[2], rgb[3]);
		},

		rgbToHsv (r, g, b, a) {
			r= r/255;
			g= g/255;
			b= b/255;
			var min = Math.min(r, b, g);
			var max = Math.max(r, g, b);
			var delta = max-min;
			var h = null, s = (max==0)?0:(delta/max);
			if (s==0){
				h = 0;
			} else{
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
			return { h:h, s:(s), v:(max), a: a};	//	Object
		},

		hsvToRgb (hue, saturation, value, alpha){
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
			return new Color({ r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255), a:alpha});	//	dojox.color.Color
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