
<template>
     <div class="VommondSlider">
		<div class="VommondSliderPos">
			<div class="VommondSliderContainer" data-dojo-attach-point="cntr">
				<div class="VommondSliderBar" data-dojo-attach-point="bar">
				</div>
				<div class="VommondSliderHandle" data-dojo-attach-point="hndlLeft">
					<div class="VommondSliderHandleIcon">
					</div>
					<div class="VommondSliderHandleLabel" data-dojo-attach-point="labelLeft">
					</div>
				</div>
				<div class="VommondSliderHandle" data-dojo-attach-point="hndlRight">
					<div class="VommondSliderHandleIcon">
					</div>
					<div class="VommondSliderHandleLabel" data-dojo-attach-point="labelRight">
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
import win from 'dojo/_base/win'
import on from 'dojo/on'
import touch from 'dojo/touch'
import domGeom from 'dojo/domGeom'
import DomBuilder from 'common/DomBuilder'

export default {
    name: 'RangeSlider',
    mixins:[DojoWidget],
    data: function () {
			return {
				value: {start:10, value:90},
				max: 100,
				min: 0,
				hasLabel: false,
				minRange: -1,
				round: true,
				legend: 0,
				showValues: false
			}
    },
    components: {},
    methods: {
      postCreate: function(){
				this.own(on(this.bar, touch.press, lang.hitch(this, "onBarPress")));
				this.own(on(this.domNode, touch.press, lang.hitch(this, "onDomPress")));
				this.own(on(this.hndlLeft, touch.press, lang.hitch(this, "onLeftHandlePress")));
				this.own(on(this.hndlRight, touch.press, lang.hitch(this, "onRightHandlePress" )));
			},

			startup (){
				this.init();
			},

			setMax (m){
				this.max = m*1;
			},

			setMinRange (m){
				this.minRange = m;
			},

			setMin (m){
				this.min = m*1;
			},

			setLegend (l) {
				this.legend = l;
			},

			/**
			 * Changed because of live cycle
			 */
			afterPlaceAt (){
				this.init();
			},

			init (){
				var pos = domGeom.position(this.domNode);

				this.min= this.min*1;
				this.max= this.max*1;
				this.legend= this.legend*1;
				this.minRange = this.minRange*1;

				/**
				 * center everything to the container
				 */
				var bPos = domGeom.position(this.bar);
				var hPos = domGeom.position(this.hndlLeft);
				this.cntr.style.top = Math.round((pos.h - bPos.h) /2) + "px";

				this.hndlWidth = hPos.w/2;

				this.initLegend();
			},

			initLegend (){
				if(this.legend>0){
					var pos = domGeom.position(this.domNode);
					var db = new DomBuilder();
					var cntr = db.div("vommondLegendBar").build(this.domNode);
					var s = this.max -this.min;
					for(var i=0; i<= this.legend; i++){
						var p = i/this.legend;
						var lblCntr = db.span("vommondLegendBarItem").build(cntr)
						lblCntr.style.left = Math.min(pos.w* p, pos.w-1) + "px";
						db.div("vommondLegendBarItemLabel", Math.round(this.min + p*s)).build(lblCntr);
					}
				}
			},

			onBarPress (e) {

				this.stopEvent(e)
				this.cleanup();
				this._startW = this.getW(e);
				this._startStart = this.value.start
				this._startEnd = this.value.end

				this._touchMoveListner = on(win.body(),touch.move, lang.hitch(this,"onBarMove"));
				this._touchReleaseListner = on(win.body(),touch.release, lang.hitch(this,"onBarRelease"));
				css.add(this.domNode, "VommondSliderMoving" );
			},

			onBarMove (e) {
				let w = this.getW(e);
				let dif = this._startW - w
				this.value.start = this._startStart - dif
				this.value.end = this._startEnd - dif
				this.setValue(this.value);
				this.emit("change", this.value);
			},

			onBarRelease (e) {
				this.stopEvent(e)
				this.cleanup()
				this.emit("change", this.value);
			},

			onDomPress (e){
				console.debug('onDomPress')
				this.stopEvent(e);
				this.onClick(e);
			},

			onClick (e){
				var w = this.getW(e);
				var distanceLeft = w - this.value.start;
				var distanceRight = this.value.end - w;
				if(w < this.value.start || distanceLeft < distanceRight){
					this.value.start = w;
					this.correctLeft(w);
				} else {
					this.value.end = w;
					this.correctRight(w);
				}
				this.setValue(this.value);
				this.emit("change", this.value);
			},

			correctLeft (w){
				var range = this.value.end - this.value.start;
				if(this.minRange >=0 && (range <= this.minRange)){
					this.value.end = w + this.minRange;
					if(this.value.end > this.max){
						this.value.end = this.max;
						this.value.start = this.max - this.minRange;
					}
				}
			},

			correctRight (w){
				var range = this.value.end - this.value.start;
				if(this.minRange >=0 && (range <= this.minRange)){
					this.value.start = w - this.minRange;
					if(this.value.start < this.min){
						this.value.start = this.min;
						this.value.end = this.min + this.minRange;
					}
				}
			},

			getW (e){
				var mPos = this._getMousePosition(e);
				var pos = domGeom.position(this.domNode);
				var dif = mPos.x - pos.x;
				var p = dif / pos.w;
				p = Math.min(Math.max(0,p),1);
				var s = this.max - this.min;
				var w = s * p + this.min;
				if(this.round){
					w = Math.floor(w);
				}
				return w;
			},

			onLeftHandlePress (e){
				this.stopEvent(e);
				this.cleanup();
				this._touchMoveListner = on(win.body(),touch.move, lang.hitch(this,"onHandleMove"));
				this._touchReleaseListner = on(win.body(),touch.release, lang.hitch(this,"onHandleRelease"));
				css.add(this.domNode, "VommondSliderMoving" );
				this._touchDir ="left";
				this.onMove(e);
			},

			onRightHandlePress (e){
				this.stopEvent(e);
				this.cleanup();
				this._touchMoveListner = on(win.body(),touch.move, lang.hitch(this,"onHandleMove"));
				this._touchReleaseListner = on(win.body(),touch.release, lang.hitch(this,"onHandleRelease"));
				css.add(this.domNode, "VommondSliderMoving" );
				this._touchDir ="right";
				this.onMove(e);
			},

			onHandleMove (e){
				this.stopEvent(e);
				this.onMove(e);
			},

			onMove (e){
				var w = this.getW(e);
				if(this._touchDir =="left"){
					this.value.start = w;
					this.correctLeft(w);
				} else {
					this.value.end = w;
					this.correctRight(w);
				}
				this.setValue(this.value);
				this.emit("change", this.value);
			},

			onHandleRelease (e){
				this.stopEvent(e);
				this.cleanup();
			},

			cleanup (){
				if(this._touchMoveListner){
					this._touchMoveListner.remove();
				}
				if(this._touchReleaseListner){
					this._touchReleaseListner.remove();
				}
				delete this._touchReleaseListner;
				delete this._touchMoveListner;
				delete this._touchDir;
				delete this._startW
				delete this._startStart
				delete this._startEnd
				css.remove(this.domNode, "VommondSliderMoving" );
			},


			setValue (value){

				if(this.round){
					value.start = Math.round(value.start);
					value.end = Math.round(value.end);
				}

				var start = Math.max(this.min, value.start);
				var end = Math.min(this.max, value.end);
				var s = this.max - this.min;

				/**
				 * left handle
				 */
				var startP = Math.abs((start -this.min) / s);
				var startX = domGeom.position(this.domNode).w;
				var startW = ( (startP * startX) - this.hndlWidth );
				this.hndlLeft.style.left = startW+ "px";

				/**
				 * Right handle
				 */
				var endP = Math.abs((end -this.min) / s);
				var endX = domGeom.position(this.domNode).w;
				var endW  =( (endP * endX) - this.hndlWidth );
				this.hndlRight.style.left = endW + "px";


				/**
				 * bar
				 */

				this.bar.style.left = startW + "px";
				this.bar.style.width = (endW - startW)+ "px";

				if(this.valueFunction){
					this.labelLeft.innerHTML = this.valueFunction(value.start);
					this.labelRight.innerHTML = this.valueFunction(value.end);
	//				if(!this.valueLableStart){
	//					this.valueLableStart = document.createElement("div");
	//					css.add
	//				}
				}

				this.value = value;
			},

			getValue (){
				return this.value;
			}
    },
    mounted () {
    }
}
</script>