<script>
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import * as d3 from "d3";

export default {
    name: 'Lines',
    mixins:[],
    data: function () {
        return {
					lineFunction: d3.line().x(function(d) { return d.x-.5; }).y(function(d) { return d.y-.5; }),
					defaultLineColor : "#333",			
					defaultLineWidth: 1,			
					arrowCorrect : 3,			
					arrowSize : 8,			
					touchLineWidth: 15,			
					bendFactorX : 0.5,			
					bendFactorY : 0.5,
					lineEventType :"receives", // emits
        }
    },
    components: {},
    methods: {
	    initSVG (){
	    	this.logger.log(0,"initSVG", "entry");	    	
	    	var pos = {
	    		h : this.getZoomed(this.canvasPos.h, this.zoom),
	    		w: this.getZoomed(this.canvasPos.w, this.zoom)
	    	};	    	
	    	var bodySelection = d3.select(this.widgetContainer);		 
			this.svg = bodySelection.append("svg").attr("width", pos.w).attr("height",pos.h );			
	    },
	      
		
		renderLine (line){
			// this.logger.log(6,"renderLine", "entry > " + this.mode);
			
			var fromPos = this.getFromBox(line);
			var toPos = this.getToBox(line);			
			
			if(fromPos && toPos){
				let layoutedLine = this.layoutLine(fromPos, toPos, line);				
				if(layoutedLine){
					/**
					 * render line
					 */
					
					if(!this.lineSVGs[line.id]){
					
						/**
						 * create new line
						 */
						let svg = this.drawLine(line.id, layoutedLine);
						this.lineSVGs[line.id] = svg;
						/**
						 * render listener line
						 */
						let touch = this.drawTouchLine(line.id, layoutedLine);
						this.touchLineSVGs[line.id] = touch;
						
						/**
						 * render support point
						 */
						if(this.mode=="edit"){
							let l = layoutedLine.length;
							for(let i =1; i < l-1; i++){
								let p = layoutedLine[i];
								let div = this.drawPoint(p);
								this.widgetContainer.appendChild(div);	
								this.registerDragOnDrop(div, { id : line.id, i : i, l : layoutedLine}, "onLinePointDnDStart", "onLinePointDnDMove", "onLinePointDnDEnd", "onLinePointDnDClikc");
							}
											
						} 
					} else {
						/**
						 * update line
						 */
						let svg = this.lineSVGs[line.id];
						let touch = this.touchLineSVGs[line.id];
						svg.attr("d", this.lineFunction(layoutedLine));
						touch.attr("d", this.lineFunction(layoutedLine));						
						/**
						 * FIXME: update the line points in here too!
						 */
					}					
				}
			} else {
				console.warn("Cannot render line", line, fromPos, toPos);
			}
		},
		
		updateLine (line, from, to){
						
			if(line.hidden){
				return;
			}
			
			if(!this._lineUpdateJobs){
				this._lineUpdateJobs = {};
			}
			
			/**
			 * FIXME: here is a bug with group lines!
			 */
			var layoutedLine = this.layoutLine(from, to, line);

			if(layoutedLine){
				var job = {
					line : layoutedLine
				};				
				this._lineUpdateJobs[line.id] = job;				
			}			

			if(!window.requestAnimationFrame){
					console.warn("No requestAnimationFrame()");
		    	this._lineUpdateUI();
		    } else {
		    	// var callback = lang.hitch(this, "_lineUpdateUI");
	        requestAnimationFrame(() => {
						this._lineUpdateUI()
					});
		    }
		},		
		
		_lineUpdateUI (){
			if(this._lineUpdateJobs){								
				for(let id in this._lineUpdateJobs){					
					var job = this._lineUpdateJobs[id];					
					/**
					 * update line graph
					 */
					var line = job.line;
					var svg = this.lineSVGs[id];
					if(svg){
						svg.attr("d", this.lineFunction(line));	
						let touchSvg = this.touchLineSVGs[id];
						if (touchSvg) {		
							touchSvg.attr("d", this.lineFunction(line));
						}
					}					
				}
			}			
			this._lineUpdateJobs = null;
		},
		
		onLineClick (id){
			this.onLineSelected(id);
		},
		
		onLineMouseOver (id, e){
			this._lineMouseOver = id; 
			this._lineMouseOverPos = this.getCanvasMousePosition(e);
		},
		
		onLineMouseOut (){			
		},
		
		/**
		 * This method is an evil hack because d3.js sucks so much at
		 * mouse handling. We now listen to hoover events and store 
		 * the position of the last event. In case the canvas is clicked
		 * DnD.js will call this method with the mouse position of the
		 * click and we check if it was close the last hoover event. 
		 * This works more or less good!
		 */
		checkIfLineWasCLicked (pos){
			if(this._lineMouseOver){		
				var distance = Math.sqrt( Math.pow(this._lineMouseOverPos.x - pos.x, 2) + Math.pow(this._lineMouseOverPos.y - pos.y, 2));
				if(distance < this.touchLineWidth){
					this.onLineSelected(this._lineMouseOver);
					return true;
				}
			}
			return false;
		},
		

		
		
		
		/**********************************************************************
		 * Layout stuff : calculate anchor points, smoothing etc
		 **********************************************************************/
		
		layoutLine (fromPos, toPos, line){				
				
			
			
			/**
			 * add support points that guide the line
			 */
			var supportedLine = this.layoutAddSupportPoints(fromPos, toPos, line);
			
			/**
			 * set anchor points
			 */
			var correctedLine = this.layoutCorrectAnchorPoints(supportedLine);
			
			/**
			 * correct last node for arrow
			 */
			var result =  this.layoutCorrectArrow(correctedLine);
			
		
			return result;
		},
		
		
		layoutCorrectAnchorPoints (supportedLine){
			var l = supportedLine.length;
			
			/**
			 * get "real" line with the correct anchor points
			 */
			var a1 = this.getAnchorLine(supportedLine[0], supportedLine[1]);
			var a2 = this.getAnchorLine(supportedLine[l-2], supportedLine[l-1]);
		
			/**
			 * update line
			 */
			if(a1){
				supportedLine[0] = a1[0];
			}
			if(a2){
				supportedLine[l-1] = a2[1];
			}
			

		
			return supportedLine;
		},
		
		
		/**
		 * assemble line with support points
		 */
		layoutAddSupportPoints (from, to, line){
			var result = [from];
			var l = line.points.length;
			for(var i=0; i < l; i++){
				var x = line.points[i];
				var p = {
					x : x.x,
					y : x.y,
					w : 1,
					h : 1
				};
				result.push(p);
			}
			result.push(to);	
			return result;
		},
		
		
		/**
		 * A very ugly method that has to be used
		 * to put the line a little shorted to 
		 * make space for the arrow
		 */
		layoutCorrectArrow ( line){
				
			var p = line[line.length-1];

			if(p){
				if(p.d=="left"){
					p.x -= this.arrowCorrect;
				}
				if(p.d=="right"){
					p.x+= this.arrowCorrect;
				}
				if(p.d=="top"){
					p.y -= this.arrowCorrect;
				}
				if(p.d=="bottom"){
					p.y+= this.arrowCorrect;
				}
				p.corrected=true;
			}			
			return line;
		},		
		
		getAnchorLine (from, to){			
			if(!from || !to){
				return null;
			}			
			var f = null;
			var t = null;			
			var left = this.isLeft(from,to);
			var top = this.isTop(from, to);			
			var fromIsLogic = this.hasLogic(from);
			var toIsLogic = this.hasLogic(to);		
			var yOverlap = ((to.y < from.y) && ((to.y + to.h) > from.y)) || ( (from.y < to.y) && ( (from.y + from.h) > to.y));
			var xOverlap = ((to.x < from.x) && ((to.x + to.w) > from.x)) || ( (from.x < to.x) && ( (from.x + from.w) > to.x));
			
			if(yOverlap){
				if(!left){
					f = this.getAnchorPoint(from, "right");
					t = this.getAnchorPoint(to, "left");
				} else {
					f = this.getAnchorPoint(from, "left");
					t = this.getAnchorPoint(to, "right");
				}				
				let o = Math.min(to.y+to.h, from.y + from.h) - Math.max(to.y, from.y);
				if(((to.y < from.y) && ((to.y + to.h) > from.y))){			
					if(!toIsLogic){
						t.y = Math.floor(from.y + o/2);
					}
					if(!fromIsLogic){
						f.y = Math.floor(from.y + o/2)
					}	
				} else {
					if(!toIsLogic){
						t.y = Math.floor(to.y + o/2);
					}
					if(!fromIsLogic){
						f.y = Math.floor(to.y + o/2);
					}				
				}				
			} else if(xOverlap){				
				if(!top){
					f = this.getAnchorPoint(from, "bottom");
					t = this.getAnchorPoint(to, "top");
				} else {
					f = this.getAnchorPoint(from, "top");
					t = this.getAnchorPoint(to, "bottom");
				}				
				let o = Math.min(to.x+to.w, from.x + from.w) - Math.max(to.x, from.x);
				if(((to.x < from.x) && ((to.x + to.w) > from.x))){
					if(!toIsLogic){
						t.x = Math.floor(from.x + o/2);
					}
					if(!fromIsLogic){
						f.x = Math.floor(from.x + o/2);
					}				
				} else {
					if(!toIsLogic){
						t.x = Math.floor(to.x + o/2);
					}
					if(!fromIsLogic){
						f.x = Math.floor(to.x + o/2);
					}
				}				
			} else if(left){				
				f = this.getAnchorPoint(from, "left");
				t = this.getAnchorPoint(to, "right");				
			}else if(!left){				
				f = this.getAnchorPoint(from, "right");
				t = this.getAnchorPoint(to, "left");				
			} else {
				/**
				 * default
				 */
				f = this.getAnchorPoint(from, "center");
				t = this.getAnchorPoint(to, "center");
			}
		
			var line = [];		
			line.push(f);
			line.push(t);
			return line;			
		},
		
		
		getAnchorLineOld (from, to){
			
			//console.debug("getAnchorLine",from.h, to.h);
			
			
			var f = null;
			var t = null;
			
			var left = this.isLeft(from,to);
			var top = this.isTop(from, to);
			
			var yOverlap = (to.y >= from.y && to.y <= from.y + from.h ) || (from.y+from.h >= to.y && (from.y + from.y) <= (to.y + to.h));
			var xOverlap = (to.x >= from.x && to.x <= (from.x + from.w)) || ((from.x+ from.w) >= to.x && (from.x + from.w) <= (to.x + to.w));
			
			
			
			
			if(yOverlap){
				if(!left){
					f = this.getAnchorPoint(from, "right");
					t = this.getAnchorPoint(to, "left");
				} else {
					f = this.getAnchorPoint(from, "left");
					t = this.getAnchorPoint(to, "right");
				}
			} else if(xOverlap){
				
				if(!top){
					f = this.getAnchorPoint(from, "bottom");
					t = this.getAnchorPoint(to, "top");
				} else {
					f = this.getAnchorPoint(from, "top");
					t = this.getAnchorPoint(to, "bottom");
				}
				
			} else if(left){
				
				f = this.getAnchorPoint(from, "left");
				t = this.getAnchorPoint(to, "right");
				
			}else if(!left){
				
				f = this.getAnchorPoint(from, "right");
				t = this.getAnchorPoint(to, "left");
				
			} else {
				/**
				 * default
				 */
				f = this.getAnchorPoint(from, "center");
				t = this.getAnchorPoint(to, "center");
			}
			
			var line = [];		
			line.push(f);
			line.push(t);
		
			return line;
		},
		
		isTop (from, to){
			return (from.y + from.h/2) > (to.y + to.h/2);
		},
		
		isLeft (from, to){
			return ( from.x + from.w/2) > (to.x + to.w/2);
		},
		
		
		getAnchorPoint (box, pos){
			
			
				
		
			
			var a = {
					x : box.x + box.w/2,
					y :box.y + box.h/2,
					d : pos,
					h:0,
					w:0
			};
			
		
			if(pos== "top"){
				
				a.x = box.x + box.w/2;
				a.y = box.y;
		
				
			} else if(pos == "bottom"){
				
				a.x = box.x + box.w/2;
				a.y = box.y + box.h;
				
			} else if( pos == "left"){
				
				a.x = box.x;
				a.y = box.y + box.h/2;
				
			} else if(pos == "right"){
				
				a.x = box.x + box.w;
				a.y = box.y + box.h/2;
				
			} else if(pos != "center"){
				this.logger.error("getAnchorPoint", pos + " not supported!");
			}
		
			
			return a;
		},
	    
		
		/**********************************************************************
		 * Point
		 **********************************************************************/
		drawPoint (x){
			
			/**
			 * Correct position so line goes through the middle
			 */
			var p = {
				x : x.x,
				y : x.y,
				w : x.w,
				h : x.h
			};
			
			var div = this.createBox(p);
			css.add(div, "MatcLineSupportPoint");
			
			var inner = document.createElement("div");
			css.add(inner, "MatcLineSupportPointTouch");
			
			div.appendChild(inner);
			
			return div;
		},
		
	
		/**********************************************************************
		 * SVG Stuff
		 **********************************************************************/

		setLineColor (id, color){
			var svg = this.lineSVGs[id];
			
			if(svg){
				if(color){
					svg.attr("stroke", color);
				} else {
					svg.attr("stroke", this.defaultLineColor);
				}
			}
			
		},
		
		
		drawLine (id, line){
			return this.drawSVGLine(id, line,this.defaultLineColor, this.defaultLineWidth, 1);
		},
		
		drawSVGLineWidthArrow (id, line, color, width, op){
			
			this.svg.append("path")
		        .attr("d", this.lineFunction(line))
		        .attr("stroke", color)
		        .attr("stroke-width", width )
		        .attr("fill", "none")
		        .style("opacity", op);
		       

			return line
		},
		
		
		drawSVGLine (id, line, color, width, op){

			this.svg.append("defs").append("marker")
			    .attr("id", "arrowhead_"+id)
			    .attr("viewBox", "0 -5 12 12")
				.attr("refX", 7)
				.attr("markerWidth", this.arrowSize)
				.attr("markerHeight", this.arrowSize)
				.attr("orient", "auto")
				.append("svg:path")
				.attr("d", "M0,-5L10,0L0,5")
				.attr("stroke", color)
				.attr("fill", color)
				.style("opacity", op);							    
			
			var lineGraph = this.svg.append("path")
		        .attr("d", this.lineFunction(line))
		        .attr("stroke", color)
		        .attr("stroke-width", width )
		        .attr("fill", "none")
		        .style("opacity", op)
		        .attr("marker-end", "url(#" + "arrowhead_"+id +")");
  
			return lineGraph;
		},
		
		
		drawTouchLine (id, line){
			
			if(!this._lineListeners){
				this._lineListeners = [];
			}
			var callback = lang.hitch(this, "onLineClick", id);
			
			var callback2 = lang.hitch(this, "onLineMouseOver", id);
			
			var callback3 = lang.hitch(this, "onLineMouseOut", id);
			
			var touchLine = this.svg.append("path")
				.attr("d", this.lineFunction(line))
				.attr("stroke", "red")
				.attr("stroke-width", this.touchLineWidth )
				.attr("fill", "none")
				.attr("class","MatcTouchLine" )
				.style("opacity", 0)
				.on("mouseover", function() {
					d3.event.stopPropagation();
					callback2(d3.event);
				})
				.on("mouseout", function() {
					d3.event.stopPropagation();
					var m = d3.mouse(this);
					callback3(m[0], m[1]);
				});						      

			this._lineListeners.push(callback);
			this._lineListeners.push(callback2);
			this._lineListeners.push(callback3);

			return touchLine;
		},
		
		

		/**********************************************************************
		 * CleanUp
		 **********************************************************************/
		cleanUpLines (){
			if(this.svg){
				/**
				 * FIXME: This is a performance bottleneck:
				 * The * selector seems to be quite fast (then the old .line and .marker),
				 * however we still might want to use a list of things
				 */
				this.svg.selectAll("*").remove();
			}
			
			if(	this._lineListeners){
				/**
				 * I don't know where the remove was comming from in the old code...
				 */
				// for(var i =0;this._lineListeners.length;i++){
				// 	console.debug(this._lineListeners[i])
				// 	this._lineListeners[i].remove();
				// }
			}
			
			this._lineListeners = []
			this.lineSVGs = {};
			this.touchLineSVGs = {};
		},

		cleanUpSVG () {
			let nodes = this.widgetContainer.querySelectorAll('svg')
			nodes.forEach(n => {
				this.widgetContainer.removeChild(n)
			})

			let points = this.widgetContainer.querySelectorAll('.MatcLineSupportPoint')
			points.forEach(n => {
				this.widgetContainer.removeChild(n)
			})
		},
		

		/**********************************************************************
		 * Debug Stuff
		 **********************************************************************/
		
		_renderDebugLinePoints (p){
			
			if(this.debug){
	
				var div = document.createElement("div");
				css.add(div, "MatcLineDebugPoint");
				
				div.style.left = p.x-5 + "px";
				div.style.top = p.y-5 + "px";
				div.style.width = "11px";
				div.style.height = "11px";
				
				this.widgetContainer.appendChild(div);
				
				if(!this.linesDebugPoints){
					this.linesDebugPoints = [];
				}
				this.linesDebugPoints.push(div);
			}
			
	
		},
		
		cleanUpDebugLines (){
			
			if(this.linesDebugPoints){
				
				//console.debug("cleanUpDebugLines");
				
				for(var i=0; i< this.linesDebugPoints.length;i++){
					
					var div = this.linesDebugPoints[i];
					this.widgetContainer.removeChild(div);
				}
			}
			
			this.linesDebugPoints = null;
		}
    }, 
    mounted () {
    }
}
</script>