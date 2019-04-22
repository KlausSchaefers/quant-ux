
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
		
		wireEvents:function(){
			//this.own(on(this.domNode, touch.press, lang.hitch(this, "onChange")));	
			this.own(this.addClickListener(this.domNode, lang.hitch(this, "_onClick")));
		},
		
		_onClick:function(e){
			this.emitClick(e);
		},
		
		render:function(model, style, scaleX, scaleY){
	
			this.domNode.innerHTML="";
			
			this.model = model;
			this.style = style;
			this._scaleX = scaleX;
			this._scaleY = scaleY;
			
			
			if(this.type == "bar"){
				css.add(this.domNode, "MatcWidgetTypeBarChart");
				if(model.props.isHorizontal){
					this.renderHorizontal(model, style);
				} else if(model.props.isLine){
					this.renderLine(model, style);
				} else {
					this.renderVertical(model, style);
				}
			} else if(this.type == "ring"){
				this.renderRing(model, style, model.props.value);
			} else if(this.type == "multiring"){
				var x = Math.round(Math.min(model.w,model.h) / 2) ;
				var width = Math.min(x, this.getZoomed(style.lineWidth *2, this._scaleY));
				this.renderPie(model, style, width);
			} else if(this.type == "pie"){
				this.renderPie(model, style,Math.min(model.w,model.h));
			} else {
				console.warn("render() > Not supported type : " + this.type);
			}
			this.setStyle(style, model);
		},
		
		
		renderRing:function(model, style, p){
		
				
			var db = new DomBuilder();
			var cntr = db.div("MatcWidgetTypeBarChartCntr").build();
	
			var w = model.w * 2;
			var h = model.h *2;
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
			
			
			this.domNode.innerHTML="";
			this.domNode.appendChild(cntr);
		},
		
		
		
		renderPie:function(model, style, width){
		
			//if(p > 1){
			//	p /= 100;
			// }
			var db = new DomBuilder();
			var cntr = db.div("MatcWidgetTypeBarChartCntr").build();
			var w = model.w * 2;
			var h = model.h *2;
			var canvas= document.createElement("canvas");	
			canvas.width=w;
			canvas.height=h;
			var x = Math.round(Math.min(w,h) / 2) ;
			var data = model.props.data;
			var row = data[0];
			var sum  =0;
			for(let i=0; i< row.length; i++){
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
			
			
			this.domNode.innerHTML="";
			this.domNode.appendChild(cntr);
		},
		
		
		degreesToRadians:function (degrees) {
			return (degrees * (Math.PI/180)) - Math.PI / 2;     
		},
		
		
		renderLine:function(model, style){
			
			var db = new DomBuilder();
			var data = this.flip(model.props.data);	
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
		
		
		
		renderVertical:function(model, style){
			
			var db = new DomBuilder();
								
			var data = this.prepareData(model.props.data);	
			
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
		
		renderHorizontal:function(model, style){
			
			var db = new DomBuilder();
			
			var data = this.prepareData(model.props.data);	
			
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
		
		prepareData:function(data){
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
		
		flip:function(data){
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
		
		

								
		getValue:function(){
			return this.value;
		},
		

		/**
		 * Can be overwritten by children to have proper type conversion
		 */
		_setDataBindingValue:function(v){
			if(v !== true && v !== false && v >= 1){
				v = true;
			}
			this.setValue(v);
		},
						
		setValue:function(){			
		},
		
		getState:function(){
			return {				
			};
		},
		
		setState:function(){			
		}
    }, 
    mounted () {
    }
}
</script>