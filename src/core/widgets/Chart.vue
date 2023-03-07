
<template>
     <div class="MatcWidgetTypeChart">

						</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import DomBuilder from 'common/DomBuilder'
import UIWidget from 'core/widgets/UIWidget'
import * as Easing from  'core/Easing'
import * as CanvasUtil from  'core/CanvasUtil'

export default {
    name: 'Chart',
    mixins:[UIWidget, DojoWidget],
    data: function () {
        return {
            value: 0
        }
    },
    components: {},
    methods: {
        postCreate (){
			this._borderNodes = [this.domNode];
			this._backgroundNodes = [];
			this._shadowNodes = [];
			
		},

		wireEvents (){
			this.own(this.addClickListener(this.domNode, lang.hitch(this, "_onClick")));
			this.wireHover()
		},

		_onClick (e){
			this.emitClick(e);
		},

		render (model, style, scaleX, scaleY){

			this.model = model;
			this.style = style;
			this._scaleX = scaleX;
			this._scaleY = scaleY;
		

			let data = model.props.data
			let value = model.props.value

			this.lastValue = 0

			this.renderChart(model, style, data, value)
			this.setValue(value)
			this.setStyle(style, model);
		},

		renderChart (model, style, data, value) {

			const steps = []
			if (this.isSimulator && this.hasAnimation(model)) {
				const duration = model.props.animation.duration
				const easingFunction = Easing.getEasing(model.props.animation.easing)
				const count = (duration *1000) / 30
				const stepSize = 1 / count
				for (let i=0; i < count; i++) {
					const v = easingFunction((i * stepSize))
					steps.push(v)
				}			
			}
			steps.push(1)
			this.animationRunning = true
			this.renderChartType(model, style, data, value, steps)
		},




		hasAnimation (model) {
			return model?.props?.animation && model?.props?.animation.type && model?.props?.animation.duration > 0
		},


		renderChartType (model, style, data, value, steps) {
			const progress = steps.shift()
			
			this.removeAllChildren(this.domNode)
		
			if (this.type === "bar") {

				css.add(this.domNode, "MatcWidgetTypeBarChart");
				if (model.props.isHorizontal){
					this.renderHorizontal(model, style, data, value, progress);
				} else if(model.props.isLine){
					this.renderLine(model, style, data, value, progress);
				} else {
					this.renderVertical(model, style, data, value, progress);
				}

			} else if (this.type === "ring") {
			
				this.renderRing(model, style, data, value, progress);

			} else if (this.type === "multiring") {

				const r = Math.round(Math.min(model.w, model.h) / 2) ;
				const width = Math.min(r, this.getZoomed(style.lineWidth * 2, this._scaleY));
				this.renderPie(model, style, data, width, progress);

			} else if (this.type === "stackedring") {

				this.renderStackedRings(model, style, data, value, progress);

			} else if(this.type === "pie") {

				const width = Math.min(model.w,model.h)
				this.renderPie(model, style, data, width, progress);

			} else {
				console.warn("render() > Not supported type : " + this.type);
			}

			if (steps && steps.length > 0 && this.animationRunning) {
				requestAnimationFrame(() => {
					this.renderChartType(model, style, data, value, steps)
				})
			} else {
				this.animationRunning = false
				this.lastValue = value
				this.lastData = data
			}
		},

		renderStackedRings (model, style, data, value, progress) {

			data = this.flip(data);
			data = this.scaleData(data, progress, model)
			data = this.flip(data);
			const row = data[0];
			
			const db = new DomBuilder();
			const cntr = db.div("MatcWidgetTypeBarChartCntr").build();

			
			const w = model.w * 2;
			const h = model.h * 2;
			const x = Math.round(Math.min(w,h) / 2) ;

			const canvas = document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;
			const width = Math.min(x, this.getZoomed(style.lineWidth *2, this._scaleY));

		 	const ctx = canvas.getContext("2d");

			 for(let i=0; i< row.length; i++){
				const v = row[i]
				const p = v / 100
				const s = this.degreesToRadians(0)
				const e = this.degreesToRadians(360 * p)
				const r = (x- width/2) - (i * width)
			
				ctx.beginPath()
				ctx.arc(x,x, r, s, e) 
				if (style["background" + i]) {
					//ctx.strokeStyle = style["background" + i]
					this.setStrokeColor(ctx, style["background" + i], w, h)
				}
				//ctx.strokeStyle = style.color
				ctx.lineWidth = width
				ctx.stroke()
			
			}
			cntr.style.backgroundImage = "url(" + canvas.toDataURL("image/png")  + ")";
			this.removeAllChildren(this.domNode)
			this.domNode.appendChild(cntr);

		},


		renderRing (model, style, data, value, progress){
	
			const p = (this.lastValue + ((value - this.lastValue) * progress)) / 100
			
			const db = new DomBuilder();
			const cntr = db.div("MatcWidgetTypeBarChartCntr").build();

			const w = model.w * 2;
			const h = model.h * 2;
			const x = Math.round(Math.min(w,h) / 2) ;

			const canvas = document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;
			const width = Math.min(x, this.getZoomed(style.lineWidth *2, this._scaleY));

			const ctx = canvas.getContext("2d");

			ctx.beginPath();
			let s = this.degreesToRadians(p * 360);
			let e = this.degreesToRadians(360);
		
			ctx.arc(x,x, (x-width/2), s, e );
			this.setStrokeColor(ctx, style.background, w, h)
			//ctx.strokeStyle = style.background;
			ctx.lineWidth=width;
			ctx.stroke();

			ctx.beginPath();
			s = this.degreesToRadians(0);
			e = this.degreesToRadians(360 * p);
			ctx.arc(x,x, (x- width/2), s, e );
			this.setStrokeColor(ctx, style.color, w, h)
			//ctx.strokeStyle = style.color;
			ctx.lineWidth = width;
			ctx.stroke();

			cntr.style.backgroundImage = "url(" + canvas.toDataURL("image/png")  + ")";

			this.removeAllChildren(this.domNode)
			this.domNode.appendChild(cntr);
		},

		renderPie (model, style, data, width, progress = 1){

			/**
			 * ToDo: Check if array of arrays or simple array
			 */
			let row = data[0];
			let sum = 0;
			for (let i=0; i< row.length; i++){
				sum += row[i]*1;
			}

			data = this.flip(data);
			data = this.scaleData(data, progress, model)
			data = this.flip(data);
			row = data[0];

			const w = model.w * 2;
			const h = model.h * 2;
			const x = Math.round(Math.min(w,h) / 2) 

			const db = new DomBuilder();
			const cntr = db.div("MatcWidgetTypeBarChartCntr").build();
			const canvas= document.createElement("canvas");
			canvas.width=w;
			canvas.height=h;

			const ctx = canvas.getContext("2d")
			let lastP = 0
			for(let i=0; i< row.length; i++){
				const v = row[i]
				const p = (v/ sum) + lastP;
				const s = this.degreesToRadians(lastP * 360)
				const e = this.degreesToRadians(360 * p)
			
				ctx.beginPath()
				ctx.arc(x,x, (x- width/2), s, e) 
				if (style["background" + i]) {
					//ctx.strokeStyle = style["background" + i]
					this.setStrokeColor(ctx, style["background" + i], w, h)
				}
				//ctx.strokeStyle = style.color
				ctx.lineWidth = width
				ctx.stroke()
				lastP += (v/ sum)
			}
			cntr.style.backgroundImage = "url(" + canvas.toDataURL("image/png")  + ")";
			this.removeAllChildren(this.domNode)
			this.domNode.appendChild(cntr);
		},


		degreesToRadians  (degrees) {
			return (degrees * (Math.PI/180)) - Math.PI / 2;
		},


		renderLine (model, style, data, value, progress){

			data = this.flip(data);
			data = this.scaleData(data, progress, model)

			const isCurve = model?.props?.isCurve
		
			const w = model.w * 2;
			const h = model.h * 2;
			const max = this.max
			const n = 0.5;

			const db = new DomBuilder();
			const cntr = db.div("MatcWidgetTypeBarChartCntr").build();
			const canvas= document.createElement("canvas");
			canvas.width=w;
			canvas.height=h;
		
			const ctx = canvas.getContext("2d");

			/**
			 * Render lines
			 */
			for(let r =0; r< data.length; r++){
				const row = data[r];
				const step =  Math.round(w / (row.length -1)) ;

				ctx.beginPath();

				let y = 0
				let lastX = 0
				let lastY = 0
				for(let c = 0; c < row.length; c++){
					let v = row[c];
					v *= 0.95
					y = h - Math.round((v*1 / max) * h) ;
					const x = c * step
					if (isCurve) {
						if (c === 0) {
							ctx.moveTo(n,y +n);
						} else {
							const difX = (x - lastX) / 2;
							ctx.bezierCurveTo(
								lastX + difX, lastY,
							 	x - difX, y,
							 	x, y
							)
						}
					} else {
						if (c === 0) {
							ctx.moveTo(n,y +n);
						} else {
							ctx.lineTo(x + n, y + n);
						}
					}

					lastY = y
					lastX = x
					
				}

				if(model.has.fill){
					ctx.lineTo(w+n, y +n);
					ctx.lineTo(w+n, h +n);
					ctx.lineTo(n, h+n);
					ctx.closePath();
				}

				if(style.lineWidth){
					ctx.lineWidth = this.getZoomed(style.lineWidth*2, this._scaleY);
				}

				if (style["color" + r]) {
					this.setStrokeColor(ctx, style["color" + r], w, h)
				} else if(style["background" + r]){
					this.setStrokeColor(ctx, style["background" + r], w, h)
				}

				if(style["background" + r] && model.has.fill){
					this.setFillColor(ctx, style["background" + r], w, h)
					ctx.fill();
				}
				ctx.stroke();
			}

			if(model.has.circle){
				const radius = this.getZoomed(style.lineWidth*3, this._scaleY);
				for(let r =0; r< data.length; r++){
					const row = data[r];
					const step =  Math.round(w / (row.length -1)) +n;

					for(let c=1; c < row.length-1; c++){
						const v = row[c];
						const y = (h - Math.round((v*1 / this.max) * h)) + (radius / 2);
						const x = c * step;
						ctx.beginPath();
						ctx.arc(x+n,y+n,radius,0,2*Math.PI);
						if(style["background" + r]){
							this.setFillColor(ctx, style["background" + r], w, h)
							//ctx.fillStyle = style["background" + r];
						}
						ctx.fill();
					}

				}
			}

			cntr.style.backgroundImage = "url(" + canvas.toDataURL("image/png")  + ")";
			this.domNode.appendChild(cntr);
		},



		renderVertical (model, style, data, value, progress){
			const db = new DomBuilder();

			data = this.prepareData(data);
			data = this.scaleData(data, progress, model)
	
			const groupWidth = 100/(this.groups);
			const cntr = db.div("MatcWidgetTypeBarChartCntr").build();
			for(let r =0; r < data.length; r++){
				const group = data[r];

				const grp = db.div("MatcWidgetTypeBarChartGroup").build(cntr);
				grp.style.width = groupWidth + "%";
				grp.style.left = groupWidth * r + "%";

				let w =  100/(group.length+1);
				let o = w / 2;
				if (w === 100){
					w = 50;
					o = 25;
				}

				for(let c=0; c < group.length; c++){
					const v = group[c];
					const bar = db.div("MatcWidgetTypeBarChartBar").build(grp);
					bar.style.height = v*100 / this.max + "%";
					bar.style.width = w + "%";
					bar.style.left = c * w  +o  + "%";
					if(style["background" + c]){
						this.setBackgroundColor(bar, style["background" + c], model.w, model.h)
						bar.style.backgroundSize = `100% ${model.h}px`
						bar.style.backgroundPosition = 'bottom'
					}
					this._shadowNodes.push(bar);
				}
			}

			this.domNode.appendChild(cntr);

		},

		renderHorizontal (model, style, data, value, progress){

			const db = new DomBuilder();

			data = this.prepareData(data);
			data = this.scaleData(data, progress, model)

			const groupHeight = 100/(this.groups);
			const cntr = db.div("MatcWidgetTypeBarChartCntr").build();

			for(let r =0; r < data.length; r++){
				const group = data[r];

				const grp = db.div("MatcWidgetTypeBarChartHorizontalGroup").build(cntr);
				grp.style.height = groupHeight + "%";
				grp.style.top = groupHeight * r + "%";

				let w =  100/(group.length+1);
				let o = w/2;
				if(w === 100){
					w = 50;
					o = 25;
				}

				for(let c=0; c < group.length; c++){
					const v = group[c];
					const bar = db.div("MatcWidgetTypeBarChartHorizontalBar").build(grp);
					bar.style.width = v*100 / this.max + "%";
					bar.style.height = w + "%";
					bar.style.top = c * w  + o  + "%";
					if(style["background" + c]){
						//bar.style.background = style["background" + c];
						this.setBackgroundColor(bar, style["background" + c], model.w, model.h)
						bar.style.backgroundSize = `${model.w}px 100%`
						bar.style.backgroundPosition = 'left'
					}
					this._shadowNodes.push(bar);
				}
			}

			this.domNode.appendChild(cntr);


		},

		prepareData (data){
			this.max = -10000000;
			this.groups = 0;
			this.groups = data.length;
			for(let r =0; r < data.length; r++){
				const row = data[r];
				for(let c=0; c < row.length; c++){
					this.max = Math.max(this.max, row[c]);
				}
			}
			return data;
		},

		scaleData (data, p, model) {
			if (p === 1) {
				return data
			}
			const type = model?.props?.animation?.type
			if (type === 'slide') {
				return this.scaleDataSlide(data, p)
			} else {
				return this.scaleDataGrow(data, p)
			}
		},

		scaleDataSlide (data, p) {
			const result = []
			const buckets = []
			/**
			 * 
			 * We basically fill up by the entries in data
			 * each bucket can be growing, not started (0) 
			 * or full (1).
			 * 
			 * Example:
			 * 
			 * 5 buckets -> width 0.2
			 * Boundaries: 0 - 0.2, 0.2 - 0.4, ...
			 * p: 0.1 -> [grow, 0, 0, 0, 0]
			 * p: 0.3 -> [1, grow, 0, 0 ,0]
			 * p: 0.5 -> [1, 1, grow, 0 ,0]
			 */

			const bucketWidth = 1 / data.length
			for(let r =0; r < data.length; r++) {
				buckets[r] = 0
				const lowerBound = bucketWidth * r
				const upperBound = bucketWidth * (r + 1)
				if (p > lowerBound) {
					let scalledP = (p - lowerBound) / bucketWidth
					buckets[r] = scalledP
				}
				if (p > upperBound) {
					buckets[r] = 1
				}
			}
			for(let r =0; r < data.length; r++) {
				const v = data[r];
				const bucketP = buckets[r]
				if (Array.isArray(v)){
					result[r] = []
					const row = v
					for(let c = 0; c < row.length; c++){
						if (this.lastData && this.lastData[r] && this.lastData[r][c] !== undefined) {
							const value = row[c]
							const lastValue = this.lastData[r][c] * 1
							result[r][c] = lastValue + (value - lastValue) * bucketP
						} else {
							result[r][c] = row[c] * bucketP
						}
					}
				} else {
					if (this.lastData && this.lastData[r] !== undefined) {
						const lastValue = this.lastData[r] * 1
						result[r] = lastValue + (v - lastValue) * bucketP
					} else {
						result[r] = v * bucketP
					}
					
				}
			}
			return result
		},

		scaleDataGrow (data, p,) {
			const result = []
			for(let r =0; r < data.length; r++){
				const v = data[r];
				if (Array.isArray(v)){
					result[r] = []
					const row = v
					for(let c = 0; c < row.length; c++){
					
						if (this.lastData && this.lastData[r] && this.lastData[r][c] !== undefined) {
							const value = row[c]
							const lastValue = this.lastData[r][c] * 1
							result[r][c] = lastValue + (value - lastValue) * p
						} else {
							result[r][c] = row[c] * p
						}
						
					}
				} else {
					if (this.lastData && this.lastData[r] !== undefined) {
						const lastValue = this.lastData[r] * 1
						result[r] = lastValue + (v - lastValue) * p
					} else {
						result[r] = v * p
					}
					
				}
			}
			return result
		},

		flip (data){
			this.max = -10000000;
			this.groups = 0;
			this.count = 0;
			const flipped = [];
			for(let r =0; r < data.length; r++){
				const row = data[r];
				for(let c = 0; c < row.length; c++){
					if(!flipped[c]){
						flipped[c] = [];
					}
					flipped[c][r] = row[c];
					this.max = Math.max(this.max, row[c]);
					this.count++;
				}
			}
			return flipped;
		},

		setFillColor (ctx, color, w, h) {
			if (color.colors) {
				const gradient = CanvasUtil.getGradient(ctx, color, w, h)
				ctx.fillStyle = gradient
			} else {
				ctx.fillStyle = color;
			}
		},

		setStrokeColor (ctx, color, w, h) {
			if (color.colors) {
				const gradient = CanvasUtil.getGradient(ctx, color, w, h)
				ctx.strokeStyle = gradient
			} else {
				ctx.strokeStyle = color;
			}	
		},

		setBackgroundColor (node, color) {
			if (color.colors) {
				this._set_background_gradient(node, color)
			} else {
				node.style.background = color
			}
		},

		getValue (){
			return this.value;
		},


		/**
		 * Can be overwritten by children to have proper type conversion
		 */
		_setDataBindingValue (v) {
			this.animationRunning = false

			let data = this.model.props.data
			let value = this.model.props.value

			if (this.type == "ring") {
				let v2 = v * 1
				if (!isNaN (v2)) {
					value = v2
				} else {
					console.warn('Chart._setDataBindingValue() > Wrong value for ring', v)
					return
				}
			} else if (this.type === 'pie') {
				/**
				 * Expects array with one element of array
				 */
				data = [this.objectToArray(v)]
			} else {
				/**
				 * Expect columns wise array of arrays
				 * [ [1,2], [11, 22]...]
				 */
				if (Array.isArray(v)) {
					data = v
				} else {
					data = []
					const temp = this.objectToArray(v)
					for (let r in temp) {
						const row = this.objectToArray(temp[r])
						for (let c in row){
							if (!data[c]) {
								data[c] = []
							}
							data[c].push(row[c])
						}
					}	
				}
			}

			this.renderChart(this.model, this.style, data, value)
			this.setValue(v);
		},

		objectToArray (v) {
			if (Array.isArray(v)) {
				return v
			}
			let result = []
			for (let key in v) {
				result.push(v[key])
			}
			return result
		},

		setValue (v){
			this.value = v
		},

		getState (){
			return {
			};
		},

		setState (){
		},

		beforeDestroy () {
			this.animationRunning = false
		}
    },
    mounted () {
    }
}
</script>