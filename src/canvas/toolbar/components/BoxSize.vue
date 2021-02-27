
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

			setCanvasSettings (settings) {
				if (settings) {
					this.hasProtoMoto = settings.hasProtoMoto
				}
			},

			isDirty (){
				return this._dirty;
			},

			update (e){
				this.stopEvent(e);
				this._dirty = true;
				if (this.value){
					var h = this.inputH.value;
					var w = this.inputW.value;
					let hasChange = false

					if (h != this.value.h) {
							if (this.isPercent(h)) {
								this.scaleValueWH(h)
								hasChange = true
							}
							if (this.isValid(h, this.inputH)){
								this.value.h = h * 1;
								hasChange = true
							}
					}

					if (w != this.value.w) {
							if (this.isPercent(w)) {
								this.scaleValueWH(w)
								hasChange = true
							}
							if (this.isValid(w, this.inputW)){
								this.value.w = w * 1;
								hasChange = true
							}
					}

					if (this.mode == "all"){
						var parent= this.getParentScreen(this.value);
						if (parent){
							var x = this.inputX.value * 1 + parent.x;
							var y = this.inputY.value * 1 + parent.y;

							if (x != this.value.x) {
								let valueX = this.inputX.value
								if (this.isPercent(valueX)){
									this.scaleValueXY(valueX, parent)
									hasChange = true
								}

								if (this.isValid(x, this.inputX)) {
									this.value.x = x * 1;
									hasChange = true
								}
							}

							if(y != this.value.y) {
								let valueY = this.inputY.value
								if (this.isPercent(valueY)){
									this.scaleValueXY(valueY, parent)
									hasChange = true
								}
								if (this.isValid(y, this.inputY)) {
									this.value.y = y * 1;
									hasChange = true
								}
							}
						}
					}

					if (hasChange) {
						console.debug('BoxSize.update() > Change')
						this.emit("change", this.value);
					}
				}
			},

			scaleValueXY (value, parent) {
				let p = (this.getPercent(value) * 1) / 100
				this.value.x = Math.round((this.value.x - parent.x) * p + parent.x);
				this.value.y = Math.round((this.value.y - parent.y) * p + parent.y);
				this.inputX.value = this.value.x - parent.x
				this.inputY.value = this.value.y - parent.y
			},

			scaleValueWH (value) {
				let p = (this.getPercent(value) * 1) / 100
				this.value.w = Math.round(p * this.value.w)
				this.value.h = Math.round(p * this.value.h)
				this.inputH.value = this.value.h
				this.inputW.value = this.value.w
			},

			isPercent (value) {
					if (value.indexOf('%') === value.length - 1) {
						let str = this.getPercent(value)
						return this.isValid(str)
					}
					return false
			},

			getPercent(value) {
					if (value.indexOf('%') === value.length - 1) {
						return value.substring(0, value.length - 1)
					}
					return value
			},

			isValid (value){
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

			setModel (m){
				this.model = m;
			},

			setValue (box){
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