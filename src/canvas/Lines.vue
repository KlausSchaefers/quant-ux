<script>
import css from 'dojo/css'
import * as d3 from "d3";

export default {
    name: 'Lines',
    mixins:[],
    data: function () {
        return {
			straightLineFunction: d3.line().x(function(d) { return d.x-.5; }).y(function(d) { return d.y-.5; }),
			smoothLineFunction: d3.line().curve(d3.curveBasis).x(function(d) { return d.x-.5; }).y(function(d) { return d.y-.5; }), // basis
			defaultLineColor : "#3787f2",
			defaultLineWidth: 2,
			arrowCorrect : 3,
			arrowSize : 8,
			touchLineWidth: 15,
			bendFactorX : 0.5,
			bendFactorY : 0.5,
			lineEventType :"receives", // emits
			lineFromCorrect: 1,
			renderNavLines: false,
        }
    },
    components: {},
    methods: {
	    initSVG () {
			if (!this.svg) {
				this.logger.log(1, "initSVG", "entry");
				let pos = {
					h : this.getZoomed(this.canvasPos.h, this.zoom),
					w: this.getZoomed(this.canvasPos.w, this.zoom)
				};
				let bodySelection = d3.select(this.dndContainer);
				this.svg = bodySelection.append("svg").attr("width", pos.w).attr("height",pos.h );
			} else {
				this.updateSVG()
			}
	    },

		updateSVG () {
			let pos = {
			h : this.getZoomed(this.canvasPos.h, this.zoom),
			w: this.getZoomed(this.canvasPos.w, this.zoom)
		};
			this.svg.attr("width", pos.w).attr("height",pos.h );
		},

		lineFunction (line) {
			let start = line[0]
			let end = line[1]
			/**
			 * We render a curved line, only if we have no line points,
			 * and if they are not a vertical.
			 *
			 * FIXME: We might get here some weird flickering, due to
			 * zooming.. Dunno exactyl why. Maybe the anchor points get fucked up...
			 * 
			 * We could still distinnguish between left-right and right left and move the 
			 * points to eiter felt or right. This might be usefull to show circles
			 * in the analytc graphs
			 */
			if (line.length === 2 && (Math.abs(start.x - end.x) > 5)) {
				let curvedLine = []

				curvedLine.push(start)
				curvedLine.push({
					x: start.x - Math.round((start.x - end.x) / 2),
					y: start.y
				})
				curvedLine.push({
					x: start.x - Math.round((start.x - end.x) / 2),
					y: end.y
				})
				this.drawPoint(curvedLine[1])
				curvedLine.push(end)
				return this.smoothLineFunction(curvedLine)
			}
			return this.straightLineFunction(line)
		},

		renderLine (line){
			// this.logger.log(6,"renderLine", "entry > " + this.mode);

			const fromPos = this.getFromBox(line);
			const toPos = this.getToBox(line);

			if (fromPos && toPos){
				const layoutedLine = this.layoutLine(fromPos, toPos, line);
				if (layoutedLine){
					/**
					 * render line
					 */
					if (!this.lineSVGs[line.id]){

						/**
						 * create new line
						 */
						const svg = this.drawLine(line.id, layoutedLine, line.style);
						this.lineSVGs[line.id] = svg;

						/**
						 * render support point
						 */
						if (this.mode === "edit") {
							const l = layoutedLine.length;
							for (let i =1; i < l-1; i++) {
								const p = layoutedLine[i];
								const div = this.drawPoint(p,line.id, i);
								this.dndContainer.appendChild(div);
								this.linePoints[`${line.id}_${i}`] = div
							}

						}
					} else {
						/**
						 * update line
						 */
						const svg = this.lineSVGs[line.id];
						svg.attr("d", this.lineFunction(layoutedLine));

						if (this.mode === "edit") {
							const l = layoutedLine.length;
							for (let i =1; i < l-1; i++) {
								const p = layoutedLine[i];
								const div =	this.linePoints[`${line.id}_${i}`]
								if (div) {
									this.domUtil.setPos(div, p)
								} else {
									console.warn('Lines. Cannot update point')
								}
							}
						}
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

			const layoutedLine = this.layoutLine(from, to, line);

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
			if (this._lineUpdateJobs){
				for (let id in this._lineUpdateJobs){
					const job = this._lineUpdateJobs[id];
					const line = job.line;
					const svg = this.lineSVGs[id];
					if(svg){
						svg.attr("d", this.lineFunction(line));
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
				const distance = Math.sqrt( 
					Math.pow(this._lineMouseOverPos.x - pos.x, 2) + 
					Math.pow(this._lineMouseOverPos.y - pos.y, 2)
				);
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

		layoutLine (fromPos, toPos, line) {
			/**
			 * add support points that guide the line
			 */
			const supportedLine = this.layoutAddSupportPoints(fromPos, toPos, line);
			/**
			 * set anchor points
			 */
			const correctedLine = this.layoutCorrectAnchorPoints(supportedLine);
			/**
			 * correct last node for arrow
			 */
			let result = this.layoutCorrectArrow(correctedLine);
			// if the item is selected, we should reduce one, because
			// the border is outside
			//result = this.layoutCorrectFrom(correctedLine);
			return result;
		},


		layoutCorrectAnchorPoints (supportedLine) {
			const l = supportedLine.length;

			/**
			 * get "real" line with the correct anchor points
			 */
			const a1 = this.getAnchorLine(supportedLine[0], supportedLine[1]);
			const a2 = this.getAnchorLine(supportedLine[l-2], supportedLine[l-1]);

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
			const result = [from];
			const l = line.points.length;
			for(let i=0; i < l; i++){
				const x = line.points[i];
				const p = {
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

		layoutCorrectFrom (line) {
			const p = line[0];
			if (p) {
				if(p.d =="left"){
					p.x -= this.lineFromCorrect;
				}
				if(p.d == "right"){
					p.x += this.lineFromCorrect;
				}
				if(p.d == "top"){
					p.y -= this.lineFromCorrect;
				}
				if(p.d == "bottom"){
					p.y += this.lineFromCorrect;
				}
				p.corrected=true;
			}
			return line;
		},

		/**
		 * A very ugly method that has to be used
		 * to put the line a little shorted to
		 * make space for the arrow
		 */
		layoutCorrectArrow ( line){

			const p = line[line.length-1];

			if (p) {
				if(p.d=="left"){
					p.x -= this.arrowCorrect;
				}
				if(p.d=="right"){
					p.x += this.arrowCorrect;
				}
				if(p.d=="top"){
					p.y -= this.arrowCorrect;
				}
				if(p.d=="bottom"){
					p.y += this.arrowCorrect;
				}
				p.corrected=true;
			}
			return line;
		},

		getAnchorLine (from, to){
			if(!from || !to){
				return null;
			}
			let f = null;
			let t = null;
			const left = this.isLeft(from,to);
			const top = this.isTop(from, to);
			const fromIsLogic = this.hasLogic(from);
			const toIsLogic = this.hasLogic(to);
			const yOverlap = ((to.y <= from.y) && ((to.y + to.h) > from.y)) || ( (from.y <= to.y) && ( (from.y + from.h) > to.y));
			const xOverlap = ((to.x <= from.x) && ((to.x + to.w) > from.x)) || ( (from.x <= to.x) && ( (from.x + from.w) > to.x));

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


		isTop (from, to){
			return (from.y + from.h/2) > (to.y + to.h/2);
		},

		isLeft (from, to){
			return ( from.x + from.w/2) > (to.x + to.w/2);
		},


		getAnchorPoint (box, pos) {

			const a = {
					x : box.x + box.w/2,
					y :box.y + box.h/2,
					d : pos,
					h:0,
					w:0
			};

			if (pos== "top") {

				a.x = box.x + box.w/2;
				a.y = box.y;

			} else if (pos == "bottom"){

				a.x = box.x + box.w/2;
				a.y = box.y + box.h;

			} else if (pos == "left"){

				a.x = box.x;
				a.y = box.y + box.h/2;

			} else if (pos == "right"){

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
		drawPoint (x, id, i)  {
			/**
			 * Correct position so line goes through the middle
			 */
			let inner = document.createElement("div");
			css.add(inner, "MatcLineSupportPointTouch");
			inner._lineID = id
			inner._pointIndex = i
			inner.style.background = this.defaultLineColor

			let div = this.createBox({
				x : x.x,
				y : x.y,
				w : x.w,
				h : x.h
			});
			css.add(div, "MatcLineSupportPoint");

			div.appendChild(inner);

			return div;
		},


		/**********************************************************************
		 * SVG Stuff
		 **********************************************************************/

		setLineColor (id, color){
			var svg = this.lineSVGs[id];
			if(svg){
				if (color) {
					svg.attr("stroke", color);
				} else {
					svg.attr("stroke", this.defaultLineColor);
				}
			}
		},


		drawLine (id, line, style){
			return this.drawSVGLine(id, line,this.defaultLineColor, this.defaultLineWidth, 1, style);
		},

		drawSVGLineWidthArrow (id, line, color, width, op) {

			this.svg.append("path")
						.attr("d", this.lineFunction(line))
						.attr("stroke", color)
						.attr("stroke-width", width )
						.attr("fill", "none")				
						.style("opacity", op);

			return line
		},


		drawSVGLine (id, line, color, width, op, style){

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

			const lineGraph = this.svg.append("path")
						.attr("d", this.lineFunction(line))
						.attr("stroke", color)
						.attr("stroke-width", width )
						.attr("fill", "none")
						.style("opacity", op)
						.attr("marker-end", "url(#" + "arrowhead_"+id +")");

			if (style === 'dashed') {
				lineGraph.attr("stroke-dasharray", 4)
			}


			return lineGraph;
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

			this._lineListeners = []
			this.lineSVGs = {};
			this.linePoints = {}
		},

		cleanUpSVG () {
			/**
			 * Make this smarter. We get no also all the SVG widgets
			 */
			let nodes = this.dndContainer.querySelectorAll('svg')
			nodes.forEach(n => {
				if (n.parentNode === this.dndContainer) {
					this.dndContainer.removeChild(n)
				}
			})
			this.svg = null
			this.cleanUpSVGPoints()
		},

		cleanUpSVGPoints () {
			let points = this.dndContainer.querySelectorAll('.MatcLineSupportPoint')
			points.forEach(n => {
				this.dndContainer.removeChild(n)
			})
			this.linePoints = {}
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

				this.dndContainer.appendChild(div);

				if(!this.linesDebugPoints){
					this.linesDebugPoints = [];
				}
				this.linesDebugPoints.push(div);
			}


		},

		cleanUpDebugLines (){

			if (this.linesDebugPoints) {
				for (var i=0; i< this.linesDebugPoints.length;i++) {
					var div = this.linesDebugPoints[i];
					this.dndContainer.removeChild(div);
				}
			}

			this.linesDebugPoints = null;
		}
    },
    mounted () {
    }
}
</script>