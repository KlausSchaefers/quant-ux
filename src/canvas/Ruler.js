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
		this.showDimensions = true
		this.ignore
	}

	start ( canvas,selectedType, selectedModel, activePoint, grid = {enabled:false}, zoom = 1, ignoreIds = []){
		this.model = canvas.model;
		this.grid = grid
		this.zoom = zoom
		this.container = canvas.dndContainer;
		this.selectedModel = selectedModel;
		this.selectedID = selectedModel.id;
		this.selectedType = selectedType;
		this.activePoint = activePoint;
		this.widgetDivs = canvas.widgetDivs;
		this.ignoreIds = {}
		this.ignoreIds[selectedModel.id] = true
		if (ignoreIds) {
			ignoreIds.forEach(id => {
				this.ignoreIds[id] = true
			})
		}



		this._lines = {};
		this._linesDivs = {};

		if (grid && grid.enabled) {
			this.gridHeight = (grid.h * zoom);
			this.gridWidth = (grid.w * zoom);
		} else{
			this.gridHeight = 1;
			this.gridWidth = 1;
		}
		this.initScreenSegments()
		this.logger.log(-1,"start", "exit > type :" +  this.selectedType +">  id :"+ this.selectedID + " > activePoint : " + activePoint);
	}

	initScreenSegments () {
	
		this._screenSegementTargets = []
		if (this.selectedModel.segment === true && this.activePoint !== "All") {
			this.logger.log(-1,"initScreenSegments", "");
			for(let id in this.model.widgets){
				const widget = this.model.widgets[id]
				if (widget.type === 'ScreenSegment') {
					if (widget?.props?.screenID === this.selectedModel.id) {
						this._screenSegementTargets.push({
							type: 'screen',
							name: widget.name + 'Fake',
							widgetReference: widget.id,
							x: this.selectedModel.x,
							y: this.selectedModel.y,
							h: widget.h,
							w: widget.w,
						})
					}
				}
			}
		}


	}

	correct (box, e, mouse){

	
		let result = box;

		// if we have a grid, the screens should 
		// be a multiple of the grid height
		if (this.activePoint === 'South' && this.gridHeight > 1) {
			const mod = box.h % this.gridHeight
			if (mod > this.gridHeight / 2) {
				box.h += (this.gridHeight - mod)
			} else {
				box.h -= mod
			}
			if (this.selectedModel.min && this.selectedModel.min.h > box.h) {
				box.h = this.selectedModel.min.h
			}
		}

		/**
		 * only work if we have the last box,
		 * so we can determine the direction
		 * of movement!
		 */
		if(this._lastBox){

			const corners = this.getActiveCorners(box, this._lastBox);

		
			/**
			 * get all elements that are close
			 */
			 const lines = this.getCloseLines(corners);

			/**
			 * remove not used lines
			 */
			this.removeNotUsedLines(lines);
			this.cleanUpHighLight()

			let closeX = 10000000;
			let cornerX = null;
			let closeY = 10000000;
			let cornerY = null;

			for(let id in lines){

				const line = lines[id];

				/**
				 * render line
				 */
				this.renderLine(line, id, box);
				this.renderHighlight(line, id, box);

				/**
				 * check what are the closest lines
				 */
				for (let c=0; c < corners.length; c++){
					const corner = corners[c];
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

		if (this.showDimensions && (this.activePoint === 'South' || this.activePoint === 'East') ) {
			try {
				this.renderDimension(box, mouse)
			} catch (e) {
				console.error(e);
				console.error(e.stack);
			}
		}

		return result;
	}

	renderDimension(pos, mouse) {
		if (!this.dimDiv) {
			var div = document.createElement("div");
			css.add(div, "MatcRulerDimensionLabel");
			this.container.appendChild(div);
			this.dimDiv = div;
		}
		this.dimDiv.style.left = (mouse.x + 10) + "px";
		this.dimDiv.style.top = (mouse.y + 10) + "px";
		if (this.activePoint === 'East' ) {
			const width = Math.ceil(pos.w / this.zoom)
			this.dimDiv.innerHTML = width;
		} else {
			const height = Math.ceil(pos.h / this.zoom)
			this.dimDiv.innerHTML = height;
		}
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
		const snappedBox = {
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
	
		const corners = [];

		/**
		 * If we drag n drop a widget activePoint is "All". If we do resize
		 * we get specific points!
		 *
		 */
		if( this.activePoint !== "All") {
			const result = {
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
				case "South":
					result.x = n.x + n.w;
					result.y = n.y + n.h;
					result.r = true;
					result.d = true;
					break;
				case "East":
					result.x = n.x + n.w;
					result.y = n.y + n.h;
					result.r = true;
					result.d = true;
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
	
		const lines = {};
		const boxes = this.getPotentialBoxes();
		/**
		 * maybe exclude some stuff depending on the type
		 */
		for(let c=0; c < corners.length; c++){
			const corner = corners[c];
			for(let i=0; i < boxes.length; i++){
				this._getCloseLinesForBox(corner, boxes[i], lines);
			}
		}

	

		return lines;
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


	getPotentialBoxes (){
		const boxes = [];

		/**
		 * TODO: think about caching this! This would have some issues
		 * for the anchor points
		 */
		if(this.selectedType == "screen"){
			for(let id in this.model.screens){
				if (!this.ignoreIds[id]){
					const box =  this.model.screens[id];
					boxes.push(box);
				}
			}

			if (this._screenSegementTargets) {
				this._screenSegementTargets.forEach(box => {
					boxes.push(box);
				})
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
		}

		return boxes;
	}

	renderHighlight (line) {
		this._highlightDivs = []
		if (line.box && line.box.widgetReference) {
			let div = this.widgetDivs[line.box.widgetReference]
			if (div) {
				css.add(div, "MatcRulerBoxSelectedBorder");
				this._highlightDivs.push(div)
			}
		}
	}

	cleanUpHighLight () {
		if (this._highlightDivs) {
			this._highlightDivs.forEach(div => {
				css.remove(div, "MatcRulerBoxSelectedBorder");
			})
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
				if (line.box && line.box.widgetReference) {
					css.add(div, "MatcRulerLineReference");
				}
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
				if (line.box && line.box.widgetReference) {
					css.add(div, "MatcRulerLineReference");
				}
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
				const div = this._linesDivs[id];
				if (div && div.parentNode){
					div.parentNode.removeChild(div);
				}
				delete this._linesDivs[id];
			}
		}
	}

	cleanUp () {
		this.logger.log(3,"cleanUp", "entry");
		for (let id in this._linesDivs) {
			const div = this._linesDivs[id];
			if (div && div.parentNode) {
				div.parentNode.removeChild(div);
			}
		}

		if (this.dimDiv && this.dimDiv.parentNode) {
			this.dimDiv.parentNode.removeChild(this.dimDiv);
		}
		this.cleanUpHighLight()

		this.dimDiv = null
		this._linesDivs = null;
	}
}