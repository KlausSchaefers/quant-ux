
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

			<div class=" MatcBoxSizeLink" >
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
			<div class=" MatcBoxSizeLink" @click="toggleLinked()">
				<template v-if="mode == 'all'">
					<span class=" mdi mdi-link" v-if="isLinked"></span>
					<span class="mdi mdi-link-off" v-else></span>
				</template>
			</div>
		</div>

	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import Util from 'core/Util'

export default {
    name: 'BoxSize',
    mixins:[Util, DojoWidget],
    data: function () {
        return {
			linkedStatusByWidget: {},
			widgetId: '',
            value: null,
            inputEvent: "change",
            mode: "all",
			isHoverParent: false
        }
    },
    components: {},
	computed: {
		isLinked () {
			if (this.widgetId) {
				return this.linkedStatusByWidget[this.widgetId]
			}
			return true
		}
	},
    methods: {
      postCreate: function(){
			this.own(on( this.inputX, this.inputEvent, lang.hitch(this,"update", 'x')));
			this.own(on( this.inputY, this.inputEvent, lang.hitch(this,"update", 'y')));
			this.own(on( this.inputH, this.inputEvent, lang.hitch(this,"update", 'h')));
			this.own(on( this.inputW, this.inputEvent, lang.hitch(this,"update", 'w')));

			this.own(on( this.inputX, "focus", function(e) {e.target.select()}));
			this.own(on( this.inputY, "focus", function(e) {e.target.select()}));
			this.own(on( this.inputH, "focus", function(e) {e.target.select()}));
			this.own(on( this.inputW, "focus", function(e) {e.target.select()}));
		},

		toggleLinked () {
			this.$set(this.linkedStatusByWidget, this.widgetId, !this.linkedStatusByWidget[this.widgetId])
		},

		setCanvasSettings (settings) {
			if (settings) {
				this.hasProtoMoto = settings.hasProtoMoto
			}
		},

		isDirty (){
			return this._dirty;
		},

		update (type, e){
		
			this.stopEvent(e);
			this._dirty = true;
			if (this.value){
				var h = this.inputH.value;
				var w = this.inputW.value;
	

				if (type === 'h') {
					
					if (this.isPercent(h)) {
						this.scaleValueWH(h)
					}
					
					if (this.isValid(h, this.inputH)){
						if (this.isLinked) {
							const p = h / this.value.h
							this.value.w = Math.round(this.value.w * p)
							this.inputW.value = this.value.w
						}
						this.value.h = h * 1;
					}
				} 
				 
				if (type === 'w') {
				
					if (this.isPercent(w)) {
						this.scaleValueWH(w)
					}
					if (this.isValid(w, this.inputW)){
						if (this.isLinked) {
							const p = w / this.value.w
							this.value.h = Math.round(this.value.h * p)
							this.inputH.value = this.value.h
						}
						this.value.w = w * 1;
					}
				}

			
				const parent = this.getParent(this.value);
				if (parent){
					const x = this.inputX.value * 1 + parent.x;
					const y = this.inputY.value * 1 + parent.y;

					if (type === 'x') {
						const valueX = this.inputX.value
						if (this.isPercent(valueX)){
							this.scaleValueXY(valueX, parent)
						}

						if (this.isValid(x, this.inputX)) {
							this.value.x = x * 1;
						}
					}

					if(type === 'y') {
						const valueY = this.inputY.value
						if (this.isPercent(valueY)){
							this.scaleValueXY(valueY, parent)
						}
						if (this.isValid(y, this.inputY)) {
							this.value.y = y * 1;
						}
					}
				}

				
				this.emit("change", this.value, type);
				
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
			const er = /^-?[0-9]+$/
			const valid =  er.test(value)
			if(!valid){
				return false
			}
			return value > 0
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
			this.widgetId = box.id ? box.id : 'No'
			if (this.linkedStatusByWidget[this.widgetId] === undefined) {
				this.$set(this.linkedStatusByWidget, this.widgetId, false)
			}
			this.render();
		},

		render (){
			/**
			 * w and h
			 */
			this.inputH.value = this.value.h;
			this.inputW.value = this.value.w;

			/**
			 * x and y
			 */
			const parent = this.getParent(this.value);
			if(parent){
				this.inputX.value = this.value.x - parent.x;
				this.inputY.value = this.value.y - parent.y;
			} else {
				this.inputX.value = "-";
				this.inputY.value = "-";
			}
			
		},

		getParent (value) {
			if (this.isHoverParent === true) {
				return this.getHoverScreen(value);
			}
			return this.getParentScreen(value);
		},

		blur (){
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