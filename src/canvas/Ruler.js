import css from 'dojo/css'
import Logger from 'common/Logger'
import Core from 'core/Core'

export default class Ruler extends Core{
	constructor () {
		super()
		this.logger = new Logger("Ruler");
		this.logger.log(1,"constructor", "entry");
		this.displayDistance = 20
		this.snapDistance = 10
	}

	start ( canvas,selectedType, selectedModel, activePoint){
		this.model = canvas.model;
		this.container = canvas.dndContainer;
		this.selectedModel = selectedModel;
		this.selectedID = selectedModel.id;
		this.selectedType = selectedType;
		this.activePoint = activePoint;

		this._lines = {};
		this._linesDivs = {};

		this.logger.log(3,"start", "exit > type :" +  this.selectedType +">  id :"+ this.selectedID + " > activePoint : " + activePoint);
	}

	correct (box){
		// console.debug('correct', box)

		var result = box;

		/**
		 * only work if we have the last box,
		 * so we can determine the direction
		 * of movement!
		 */
		if(this._lastBox){

			var corners = this.getActiveCorners(box, this._lastBox);

			/**
			 * get all elements that are close
			 */
			var lines = this.getCloseLines(corners);

			/**
			 * remove not used lines
			 */
			this.removeNotUsedLines(lines);

			var closeX = 10000000;
			var cornerX = null;
			var closeY = 10000000;
			var cornerY = null;

			for(var id in lines){

				var line = lines[id];

				/**
				 * render line
				 */
				this.renderLine(line,id, box);

				/**
				 * check what are the closest lines
				 */
				for (var c=0; c < corners.length; c++){
					var corner = corners[c];
					if (line.x && (Math.abs(corner.x - line.x) < this.snapDistance) && (line.x < closeX)){
						closeX = line.x;
						cornerX = corner;
						if(line.box){
							cornerX.box = line.box;
						}
					}
					if (line.y && (Math.abs(corner.y - line.y) < this.snapDistance) && (line.y < closeY)){
						closeY = line.y;
						cornerY = corner;
						if(line.box){
							cornerY.box = line.box;
						}
					}
				}
			}
			result = this.snapp(closeX, closeY, box, cornerX, cornerY);
		}

		this._lastBox = box;

		return result;
	}


	/**
	 * Snapping is a dirty business. depending on dragNrop or resize
	 * we have to handle the snapping totally different. That makes
	 * this methods quite nested.
	 */
	snapp (closeX, closeY, box, cornerX, cornerY){

		/**
		 * correct absPos by snapping to a line.
		 *
		 * We also store the element we have snapped to!
		 */
		var snappedBox = {
			x : box.x,
			y : box.y,
			w : box.w,
			h : box.h,
			id : box.id,
			box : {}
		};

		if(cornerX && Math.abs(cornerX.x -closeX) < this.snapDistance){


			/**
			 * store the snap info so later the controller
			 * can operate on the un-zoomed model
			 */
			snappedBox.box.x = cornerX.box;
			snappedBox.xdnd =cornerX.dnd;
			snappedBox.r = cornerX.r;

			if(cornerX.r){
				if(cornerX.dnd){
					snappedBox.x = closeX - box.w;
				} else{
					snappedBox.w  = closeX - box.x;
				}
			} else {
				if(cornerX.dnd){
					snappedBox.x  = closeX;
				} else {
					snappedBox.x  = closeX;
					snappedBox.w  = (box.x+box.w) - closeX;
				}
			}

			this.setSelectedLine("x"+closeX);
		}

		if(cornerY && Math.abs(cornerY.y -closeY) < this.snapDistance){
			/**
			 * store the snap info so later the controller
			 * can operate on the un-zoomed model
			 */
			snappedBox.box.y = cornerY.box;
			snappedBox.ydnd =cornerY.dnd;
			snappedBox.d = cornerY.d;
			if(cornerY.d){
				if(cornerY.dnd){
					snappedBox.y  = closeY - box.h;
				} else {
					snappedBox.h  = closeY - box.y;
				}
			} else {
				if(cornerY.dnd){
					snappedBox.y  = closeY;
				} else {
					snappedBox.y  = closeY;
					snappedBox.h  = (box.h+box.y) -closeY;
				}
			}

			this.setSelectedLine("y"+closeY);
		}
		return snappedBox;
	}



	/**
	 * This method get the active corner that shall do the snapping!
	 *
	 * In case there is a corner predefined (should just happen for resize)
	 * use this corner, other wise check direction and select the best corner.
	 */
	getActiveCorners (n){

		var corners = [];

		/**
		 * If we drag n drop a widget activePoint is "All". If we do resize
		 * we get specific points!
		 *
		 */
		if( this.activePoint !== "All") {

			var result = {
					x: 0,
					y: 0
			};
			corners.push(result)

			switch (this.activePoint) {
				case "RightUp":
					result.x = n.x + n.w;
					result.y = n.y;
					result.r = true;
					result.d = false;
					break;
				case "RightDown":
					result.x = n.x + n.w;
					result.y = n.y + n.h;
					result.r = true;
					result.d = true;
					break;
				case "LeftDown":
					result.x = n.x;
					result.y = n.y + n.h;
					result.r = false;
					result.d = true;
					break;
				case "Center":
					result.x = n.x + Math.floor(n.w/2);
					result.y = n.y + Math.floor(n.h/2);
					result.r = false;
					result.d = false;
					result.c  = true;
					break;
				case "LeftUp":
					result.x = n.x;
					result.y = n.y;
					result.r = false;
					result.d = false;
					break;
				default:
					//console.warn("No supported",this.activePoint );
					result.x = n.x;
					result.y = n.y;
					result.r = false;
					result.d = false;
					break;
			}

		} else {

			corners.push({
				x : n.x + n.w,
				y : n.y,
				r : true,
				d : false,
				dnd : true
			});

			corners.push({
				x : n.x,
				y : n.y + n.h,
				r : false,
				d : true,
				dnd : true
			});


			corners.push({
				x : n.x + n.w,
				y : n.y + n.h,
				r : true,
				d : true,
				dnd : true
			});


			corners.push({
				x : n.x,
				y : n.y,
				r : false,
				d : false,
				dnd : true
			});

		}
		return corners;
	}

	getCloseLines (corners){
		var lines = {};
		var boxes = this.getPotentialBoxes();
		/**
		 * maybe exclude some stuff depending on the type
		 */
		for(let c=0; c < corners.length; c++){
			let corner = corners[c];
			for(let i=0; i < boxes.length; i++){
				this._getCloseLinesForBox(corner, boxes[i], lines);
			}
		}

		return lines;
	}

	getPotentialBoxes (){
		var boxes = [];

		/**
		 * TODO: think about caching this! This would have some issues
		 * for the anchor points
		 */
		if(this.selectedType == "screen"){
			for(let id in this.model.screens){
				if(this.selectedID != id){
					let box =  this.model.screens[id];
					boxes.push(box);
				}
			}
		}

		if(this.selectedType == "widget"){
			let parent = this.getParentScreen(this.selectedModel);
			if(parent){
				for(let i=0; i< parent.children.length; i++){
					let id = parent.children[i];

					if(this.selectedID != id){
						let box =  this.model.widgets[id];
						if(box){
							boxes.push(box);
						} else {
							console.debug("No child box", parent, id);
						}
					}
				}

				// also add the parent to align on its borders
				boxes.push(parent);
			} else {
				for(let id in this.model.widgets){
					if(this.selectedID != id){
						let box =  this.model.widgets[id];
						boxes.push(box);
					}
				}
			}
		}

		if (this.selectedType === "line"){
			var point = this.selectedModel;
			/**
			 * get the other line points that are static!
			 */
			var line = this.model.lines[point.id];
			var pointID = point.i-1; // becasue we ignore the pass the index of the layout line

			/**
			 * get the points from the real model!
			 */
			for(let i = 0; i< line.points.length; i++){
				if(i != pointID ){
					let p = line.points[i];
					p.h =1;
					p.w=1;
					boxes.push(p);
				}
			}

			/**
			 * get also the anchor points.
			 *
			 * FIXME: we should call the real anchor point methods here,
			 * because we have a reference to the intitial points!
			 */
			//var fromPos = this.getFromBox(line);
			//var toPos = this.getToBox(line);
			//boxes.push(fromPos);
			//boxes.push(toPos);
		}

		return boxes;
	}

	_getCloseLinesForBox (pos, box, lines){

		// left border
		if(Math.abs(box.x - pos.x) < this.displayDistance){
			lines["x"+box.x] = {x : box.x , box  : box};
		}

		// top border
		if(Math.abs(box.y - pos.y) < this.displayDistance){
			lines["y"+(box.y)] = {y :box.y, box: box};
		}


		/**
		 * if not a line also try right and bottom
		 */
		if(this.selectedType != "line"){

			// right border: only check this if the min height is larger than the
			// line points
			if(Math.abs((box.x + box.w) - pos.x) < this.displayDistance){
				lines["x"+(box.x+box.w)] = {x :box.x + box.w, box: box};
			}

			// bottom: only check this if the min height is larger than the
			// line points
			if(Math.abs((box.y + box.h)- pos.y) < this.displayDistance){
				lines["y"+(box.y + box.h)] = {y :(box.y + box.h), box: box};
			}
		}
	}

	renderLine (line, id){

		/**
		 * only draw a line if there is none
		 */
		if(!this._linesDivs[id]){
			if(line.x){
				let div = document.createElement("div");
				css.add(div, "MatcRulerLine");
				div.style.width="1px";
				div.style.height ="100%";
				div.style.left = line.x +"px";
				div.style.top = "0px";
				this.container.appendChild(div);
				this._linesDivs[id] = div;
			}

			if(line.y){
				let div = document.createElement("div");
				css.add(div, "MatcRulerLine");
				div.style.height="1px";
				div.style.width ="100%";
				div.style.top = line.y +"px";
				div.style.left = "0px";
				this.container.appendChild(div);
				this._linesDivs[id] = div;
			}
		}
	}

	setSelectedLine (){
	}

	removeNotUsedLines (lines){
		for(let id in this._linesDivs){
			if(!lines[id]){
				let div = this._linesDivs[id];
				this.container.removeChild(div);
				delete this._linesDivs[id];
			}
		}
	}

	cleanUp (){

		for(var id in this._linesDivs){

			var div = this._linesDivs[id];
			this.container.removeChild(div);
		}
		this._linesDivs = null;
	}
}