
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

export default {
    name: 'Chart',
    mixins:[UIWidget, DojoWidget],
    data: function () {
        return {
            value: false
        }
    },
    components: {},
    methods: {
        postCreate: function(){
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

			this.renderChart(model, style, data, value)
			this.setStyle(style, model);
		},

		renderChart (model, style, data, value) {
			this.removeAllChildren(this.domNode)
			// this.domNode.innerHTML="";

			if (this.type == "bar") {

				css.add(this.domNode, "MatcWidgetTypeBarChart");
				if (model.props.isHorizontal){
					this.renderHorizontal(model, style, data, value);
				} else if(model.props.isLine){
					this.renderLine(model, style, data, value);
				} else {
					this.renderVertical(model, style, data, value);
				}

			} else if (this.type == "ring") {

				this.renderRing(model, style, data, value);

			} else if (this.type == "multiring") {

				var r = Math.round(Math.min(model.w, model.h) / 2) ;
				var width = Math.min(r, this.getZoomed(style.lineWidth * 2, this._scaleY));
				this.renderPie(model, style, data, width);

			} else if(this.type == "pie") {

				let width = Math.min(model.w,model.h)
				this.renderPie(model, style, data, width);

			} else {
				console.warn("render() > Not supported type : " + this.type);
			}
		},


		renderRing (model, style, data, p){

			if (p > 1) {
				p = p / 100
			}

			var db = new DomBuilder();
			var cntr = db.div("MatcWidgetTypeBarChartCntr").build();

			var w = model.w * 2;
			var h = model.h * 2;
			var canvas= document.createElement("canvas");
			canvas.width=w;
			canvas.height=h;
			// var n = 0.5;
			var x = Math.round(Math.min(w,h) / 2) ;
			var width = Math.min(x, this.getZoomed(style.lineWidth *2, this._scaleY));

			var ctx = canvas.getContext("2d");

			ctx.beginPath();
			let s = this.degreesToRadians(p * 360);
			let e = this.degreesToRadians(360);
			ctx.arc(x,x, (x-width/2), s, e );
			ctx.strokeStyle= style.background;
			ctx.lineWidth=width;
			ctx.stroke();

			ctx.beginPath();
			s = this.degreesToRadians(0);
			e = this.degreesToRadians(360 * p);
			ctx.arc(x,x, (x- width/2), s, e );
			ctx.strokeStyle = style.color;
			ctx.lineWidth = width;
			ctx.stroke();

			cntr.style.backgroundImage = "url(" + canvas.toDataURL("image/png")  + ")";

			this.removeAllChildren(this.domNode)
			//this.domNode.innerHTML="";
			this.domNode.appendChild(cntr);
		},



		renderPie (model, style, data, width){

			var db = new DomBuilder();
			var cntr = db.div("MatcWidgetTypeBarChartCntr").build();
			var w = model.w * 2;
			var h = model.h * 2;
			var canvas= document.createElement("canvas");
			canvas.width=w;
			canvas.height=h;
			var x = Math.round(Math.min(w,h) / 2) ;

			/**
			 * ToDo: Check if array of arrays or simple array
			 */
			var row = data[0];
			var sum = 0;
			for (let i=0; i< row.length; i++){
				sum += row[i]*1;
			}

			var ctx = canvas.getContext("2d");
			var lastP = 0;
			for(let i=0; i< row.length; i++){
				let v = row[i];
				let p = (v/ sum) +lastP;

				ctx.beginPath();
				let s = this.degreesToRadians(lastP* 360);
				let e = this.degreesToRadians(360 * p);
				ctx.arc(x,x, (x- width/2), s, e );

				if(style["background" + i]){
					ctx.strokeStyle= style["background" + i];
				}
				ctx.strokeStyle = style.color;
				ctx.lineWidth = width;
				ctx.stroke();
				lastP += (v/ sum);
			}
			cntr.style.backgroundImage = "url(" + canvas.toDataURL("image/png")  + ")";
			this.removeAllChildren(this.domNode)
			//this.domNode.innerHTML="";
			this.domNode.appendChild(cntr);
		},


		degreesToRadians  (degrees) {
			return (degrees * (Math.PI/180)) - Math.PI / 2;
		},


		renderLine (model, style, data){
			data = this.flip(data);

			var db = new DomBuilder();
			var cntr = db.div("MatcWidgetTypeBarChartCntr").build();

			var w = model.w * 2;
			var h = model.h *2;
			var canvas= document.createElement("canvas");
			canvas.width=w;
			canvas.height=h;
			var n=0.5;

			var ctx = canvas.getContext("2d");

			/**
			 * Render lines
			 */
			for(let r =0; r< data.length; r++){
				let row = data[r];
				let step =  Math.round(w / (row.length -1)) ;

				ctx.beginPath();

				var y =0;
				for(let c=0; c < row.length; c++){
					let v = row[c];
					y = h - Math.round((v*1 / this.max) * h) ;
					if(c ==0){
						ctx.moveTo(n,y +n);
					} else {
						ctx.lineTo(c*step +n, y +n);
					}
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

				if(style["background" + r]){
					ctx.strokeStyle= style["background" + r];
					if(model.has.fill){
						ctx.fillStyle = style["background" + r];
						ctx.fill();
					}
				}
				ctx.stroke();
			}

			if(model.has.circle){
				var radius = this.getZoomed(style.lineWidth*3, this._scaleY);
				for(let r =0; r< data.length; r++){
					let row = data[r];
					let step =  Math.round(w / (row.length -1)) +n;

					for(let c=1; c < row.length-1; c++){
						let v = row[c];
						let y = h - Math.round((v*1 / this.max) * h);
						let x = c*step;
						ctx.beginPath();
						ctx.arc(x+n,y+n,radius,0,2*Math.PI);
						if(style["background" + r]){
							ctx.fillStyle = style["background" + r];
						}
						ctx.fill();
					}

				}
			}

			cntr.style.backgroundImage = "url(" + canvas.toDataURL("image/png")  + ")";
			this.domNode.appendChild(cntr);
		},



		renderVertical (model, style, data){

			var db = new DomBuilder();

			data = this.prepareData(data);

			var groupWidth = 100/(this.groups);
			var cntr = db.div("MatcWidgetTypeBarChartCntr").build();
			for(var r =0; r < data.length; r++){
				var group = data[r];

				var grp = db.div("MatcWidgetTypeBarChartGroup").build(cntr);
				grp.style.width = groupWidth + "%";
				grp.style.left = groupWidth * r + "%";

				var w =  100/(group.length+1);
				var o = w/2;
				if(w ==100){
					w = 50;
					o = 25;
				}

				for(var c=0; c < group.length; c++){
					var v = group[c];
					var bar = db.div("MatcWidgetTypeBarChartBar").build(grp);
					bar.style.height = v*100 / this.max + "%";
					bar.style.width = w + "%";
					bar.style.left = c * w  +o  + "%";
					if(style["background" + c]){
						bar.style.background = style["background" + c];
					}
					this._shadowNodes.push(bar);
				}
			}

			this.domNode.appendChild(cntr);

		},

		renderHorizontal (model, style, data){

			var db = new DomBuilder();

			data = this.prepareData(data);

			var groupHeight = 100/(this.groups);
			var cntr = db.div("MatcWidgetTypeBarChartCntr").build();
			for(var r =0; r < data.length; r++){
				var group = data[r];

				var grp = db.div("MatcWidgetTypeBarChartHorizontalGroup").build(cntr);
				grp.style.height = groupHeight + "%";
				grp.style.top = groupHeight * r + "%";

				var w =  100/(group.length+1);
				var o = w/2;
				if(w ==100){
					w = 50;
					o = 25;
				}

				for(var c=0; c < group.length; c++){
					var v = group[c];
					var bar = db.div("MatcWidgetTypeBarChartHorizontalBar").build(grp);
					bar.style.width = v*100 / this.max + "%";
					bar.style.height = w + "%";
					bar.style.top = c * w  +o  + "%";
					if(style["background" + c]){
						bar.style.background = style["background" + c];
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
			for(var r =0; r < data.length; r++){
				var row = data[r];
				for(var c=0; c < row.length; c++){
					this.max = Math.max(this.max, row[c]);
				}
			}
			return data;
		},

		flip (data){
			this.max = -10000000;
			this.groups = 0;
			this.count = 0;
			var flipped = [];
			for(var r =0; r < data.length; r++){
				var row = data[r];

				for(var c=0; c < row.length; c++){
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




		getValue (){
			return this.value;
		},


		/**
		 * Can be overwritten by children to have proper type conversion
		 */
		_setDataBindingValue (v) {

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
				data = []
				let temp = this.objectToArray(v)
				for (let r in temp) {
					let row = this.objectToArray(temp[r])
					for (let c in row){
						if (!data[c]) {
							data[c] = []
						}
						data[c].push(row[c])
					}
				}		}

			this.renderChart(this.model, this.style, data, value)
			this.setValue(v);
		},

		objectToArray (v) {
			let result = []
			for (let key in v) {
				result.push(v[key])
			}
			return result
		},

		setValue (){

		},

		getState (){
			return {
			};
		},

		setState (){
		}
    },
    mounted () {
    }
}
</script>