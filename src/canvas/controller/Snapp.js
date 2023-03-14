import Screen from './Screen'
import ModelUtil from '../../core/ModelUtil'

export default class Snapp extends Screen {

	correctPostion (id, pos, fromToolbar){
		this.logger.log(4,"correctPostion", "enter > " , pos);

		const z = this._canvas.getZoomFactor()
		// if (z === 1) {
		// 	this.logger.log(1,"correctPostion", "DO NOT SNAPP  > " , pos);
		// 	return pos
		// }

		if(!fromToolbar){
			pos = this.getUnZoomedBox(pos, z);
		}

		if(pos.snapp){
			/**
			 * Group snapps do not have a .snapp object
			 */
			const snapp = pos.snapp;
			const screen = this.getHoverScreen(pos);
			const widget = this.model.widgets[id];
			if(screen && widget) {
				if(snapp.type=="All"){
					this.snappAll(widget,screen, pos, snapp);
				}else {
					this.snappResize(widget,screen, pos, snapp)
				}
			}
		}
		this.logger.log(4,"correctPostion", "exit > " , pos);
		return pos;
	}

	snappResize (widget,screen, pos, snapp){
		this.logger.log(0,"snappResize", "enter > " + snapp.type);
		const type = snapp.type;

		if (snapp.x || snapp.y) {
			/**
			 * We have snapping, so we ensure here that the all not changed values stay the same.
			 * hence we copy the values form the unzoomed model and update only the snapped
			 * values
			 */
			if(snapp.x){
				const line = snapp.x;
				const x = this.getSnappXValue(line, screen);

				if (type === "RightDown" || type === "RightUp" || type === "East") {
					pos.w = x - widget.x;
					/**
					 * Snapp pos.x to old x to avoid jumps
					 */
					pos.x = widget.x;
				} else if (type === "LeftUp" || type === "LeftDown" || type === "West"){
					pos.w = widget.w+ (widget.x -x);
					pos.x = x;
				} else {
					console.warn("snappResize() : X with unsupported type", type, snapp.x);
				}


			}

			if(snapp.y){
				const line = snapp.y;
				const y = this.getSnappYValue(line, screen);
				if (type === "RightDown" || type === "South" || type === "LeftDown") {
					pos.h = y - widget.y;
					/**
					 * Snapp pos.y to old y to avoid jumps
					 */
					pos.y = widget.y;
				} else if (type === "LeftUp" || type === "RightUp" || type === "North") {
					pos.h = widget.h+ (widget.y -y);
					pos.y = y;
				} else {
					console.warn("snappResize() : X with unsupported type", type, snapp.x);
				}
			}
		}


		/**
		 * If there is no snapp, there might be a pos.x / pos.y value that has been updated
		 * in the canvas and has a pixel rounding error because of zooming. This we stop here
		 */
		if(type == "South" || type=="North"){
			pos.x = widget.x;
		}

		if(type == "East" || type=="West"){
			pos.y = widget.y;
		}

		if(snapp.square){
			const min = Math.min(pos.w, pos.h);
			pos.h = min;
			pos.w = min;
		}

		if(snapp.scale){
			const scalledPos = ModelUtil.scaleToSelection(widget, pos, snapp.type)
			pos.h = scalledPos.h;
			pos.w = scalledPos.w;
			pos.x = scalledPos.x
			pos.y = scalledPos.y
		}
	}

	snappAll (widget,screen, pos, snapp){
		this.logger.log(1,"snappAll", "enter > ", snapp, pos);

		if(snapp.x){
			pos.x = widget.x;
			pos.w = widget.w;
			let line = snapp.x;
			let x = this.getSnappXValue(line, screen, pos);
			if (x > 0) {
				if(snapp.x.middle){
					/**
					 * Should not happen for grid lines and groups!
					 * We filter before so no problem...
					 */
					pos.x = x - Math.floor(pos.w/2);
				} else if(snapp.left){
					pos.x = x;
				} else {
					pos.x = x - pos.w;
				}
			} else {
				this.logger.error("snappAll", " getSnappXValue return 0");
			}
		}

		if(snapp.y){
			let line = snapp.y;
			pos.y = widget.y;
			pos.h = widget.h;
			let y = this.getSnappYValue(line, screen, pos);
			if (y > 0) {
				if(snapp.y.middle){
					/**
					 * Should not happen for grid lines and groups!
					 */
					pos.y = y - Math.floor(pos.h/2);
				} else if(snapp.top){
					pos.y = y;
				} else {
					pos.y = y - pos.h;
				}
			} else {
				this.logger.error("snappAll", " getSnappYValue return 0");
			}
		}
	}

	getSnappXValue (line, screen, pos){
		if("Grid" == line.type){

			if (line.line === -1) {
				this.logger.log(-1, "snappAll", " getSnappXValue > right");
				return (screen.x + screen.w - pos.w);
			} else if (line.column === true){

				var columnCount = this.model.grid.columnCount * 1;
				var columnOffset = this.model.grid.columnOffset * 1;
				var columnGutter = this.model.grid.columnGutter * 1;
				var columnWidth =  this.model.grid.columnWidth * 1;

				/**
				 * FIXME: we reproduce here the method from the rendering and GridAndRuler...
				 */
				var count = 0;
				var lastX = columnOffset;
				for (let i=0; i< columnCount; i++){
					if (line.line == count){
						return (screen.x + lastX);
					}
					count++;
					let x = lastX + columnWidth;
					if (line.line == count){
						return (screen.x + x);
					}
					count++;
					lastX = x + columnGutter;
				}
				return (screen.x + screen.w);
			} else {
				return (screen.x + this.model.grid.w * line.line);
			}

		} else if("Screen" == line.type || "Widget" == line.type){
			let box = this.getBoxById(line.id);
			return this.getSnappValue(box, line);
		} else if ("Mirror" == line.type) {
			let box = this.getBoxById(line.id);
			let difX = box.x - screen.x;
			return (screen.x + screen.w) - difX
		} else if ("Ruler" == line.type) {
			let rulers = this.getAllRulers(this.model, screen)
			if (rulers) {
				let ruler = rulers.find(r => r.id === line.id)
				if (ruler) {
					return screen.x + (ruler.v * 1)
				} else {
					this.logger.error("getSnappXValue", "No ruler with id " + line.id);
					this.logger.sendError(new Error('Could not snapp to X ruler'));
				}
			}
		} else {
			console.warn("getSnappXValue() >Unsupported snapp type for x", line.type);
		}
		return 0;
	}

	getSnappYValue (line, screen, pos){
		if ("Grid" == line.type) {
			if (line.line === -1) {
				this.logger.log(-1, "snappAll", " getSnappYValue > bottom");
				return (screen.y + screen.h - pos.h);
			} else {
				return (screen.y + (this.model.grid.h * line.line));
			}
	
		} else if ("Screen" == line.type || "Widget" == line.type){
			let box = this.getBoxById(line.id);
			return this.getSnappValue(box, line);
		} else if ("Mirror" == line.type) {
			let box = this.getBoxById(line.id);
			let difY = box.y - screen.y;
			return (screen.y + screen.h) - difY
		} else if ("Ruler" == line.type) {
			let rulers = this.getAllRulers(this.model, screen)
			if (rulers) {
				let ruler = rulers.find(r => r.id === line.id)
				if (ruler) {
					return screen.y + (ruler.v * 1)
				} else {
					this.logger.error("getSnappYValue", "No ruler with id " + line.id);
					this.logger.sendError(new Error('Could not snapp to Y ruler'));
				}
			}
		} else {
			console.warn("getSnappYValue() > Unsupported snapp type for ", line.type);
		}
		return 0;
	}

	getSnappValue(box, line){
		var pos = line.pos;
		switch(pos){
			case "top":
				return box.y;
			case "bottom":
				return box.y + box.h;
			case "left":
				return box.x;
			case "right":
				return box.x+ box.w;
			case "middleY":
				return box.y+ Math.round(box.h/2);
			case "middleX":
				return box.x+ Math.round(box.w/2);
			case "minY":
				if (box.min) {
					return box.y + box.min.h
				} else {
					console.warn("BaseController.getSnappValue() > minY without min property");
				}
				return box.y + box.h
			default:
				console.warn("BaseController.getSnappValue() > Not supported line position", pos, line);
		}
		return 0;
	}
}