import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import topic from 'dojo/topic'
import Logger from 'common/Logger'
import Core from 'core/Core'
import ModelUtil from '../core/ModelUtil'

export default class GridAndRuler extends Core {

	constructor() {
		super()
		this.logger = new Logger('GridAndRuler');
		this.logger.log(2, "constructor", "entry");
		this.snappDistance = 8
		this.fastSnappMouseVelcity = 10
		this.showDistance = 15
		this.patternNeibhourhood = 10
		this._initLinesCalled = 0
		this._gridType = "Grid"
		this.ignoreGroup = false,
		this.showDndDistance = true
		this.highlightBoxes = true
		this.showDimensions = false
		this.snapGridOnlyToTopLeft = false
		this.adjustSnappDistanceToMouseSpeed =  false
		this.xMovements = [];
		this.yMovements = [];
		this.mousePositions = []
		this.selectedIDs = {};
	}

	setSelectedIDs(ids) {
		for (var i = 0; i < ids.length; i++) {
			this.selectedIDs[ids[i]] = true;
		}
	}

	setCopyReference (ref) {
		this.copyReferenceID = ref
		if (this.copyReferenceID) {
			delete this._lastScreen
		}
	}

	/**
	 * called when widget drag and drop starts
	 *
	 *
	 */
	start(canvas, selectedType, selectedModel, activePoint, grid, zoom) {
		
		this.zoom = canvas.getZoomFactor();
		if (grid.h > 0 && grid.enabled) {
			/**
			 * Fixed 5.5.2019 to make grid be more strict!
			 */
			this.snappDistance = Math.ceil(grid.h * this.zoom );
			this.showDistance = this.snappDistance + 5;
			this.adjustSnappDistanceToMouseSpeed = false
			this.gridEnabled = true
		}
		this.logger.log(1, "start", "snappDistance " + this.snappDistance);

		this.grid = grid;
		this.model = canvas.model;
		this.sourceModel = canvas.sourceModel;

		this.container = canvas.dndContainer;
		this.selectedModel = selectedModel;
		this.selectedID = selectedModel.id;
		this.selectedType = selectedType;
		this.widgetDivs = canvas.widgetDivs;


		this.activePoint = activePoint;
		this.gridHeight = (grid.h * zoom);
		this.gridWidth = (grid.w * zoom);

		this.hasMiddleX = !(selectedModel.w == this.model.screenSize.w);
		this.hasMiddleY = !(selectedModel.h == this.model.screenSize.h);

		if (this.selectedType == "boundingbox" && selectedModel.id) {
			var source = this.model.widgets[selectedModel.id];
			if (source) {
				this.boundingBoxOffsetX = source.x - selectedModel.x;
				this.boundingBoxOffsetY = source.y - selectedModel.y;
			}
		}

		/**
		 * Lines
		 */
		this._lines = {};
		this._linesDivs = {};

		this.logger.log(1, "start", "exit > type :" + this.selectedType + ">  id :" + this.selectedID + " > activePoint : " + activePoint + " > hasMiddleX : " + this.hasMiddleX);
	}

	correct(absPos, e, mouse) {
		try {
			return this._correct(absPos, e, mouse)
		} catch (error) {
			this.logger.error("correct", "Something went wrong", error);
			this.logger.sendError(error);
		}
		return absPos;
	}


	_correct(absPos, e, mouse) {

		this.cleanupDistanceLines();

		/**
		 * No determine the direction of move... We buffer
		 * the last directions to make the thing less jumpy...
		 */
		this.updateMovements(absPos);
		var left = this.getMovementDir(this.xMovements);
		var top = this.getMovementDir(this.yMovements);

		let showDistanceXLeft = left
		let showDistanceYTop = top

		/**
		 * Since 3.0.43 we snapp grid on top left corner
		 */
		if (this.snapGridOnlyToTopLeft && this.grid.enabled) {
			left = true
			top = true
		}

		/**
		 * If SHIFT is pressed, we already rescale the selection, so snapping
		 * can work.
		 */
		if (e.shiftKey) {
			const scalledPos = ModelUtil.scaleToSelection(this.selectedModel, absPos, this.activePoint)
			absPos.w = scalledPos.w
			absPos.h = scalledPos.h
			absPos.x = scalledPos.x
			absPos.y = scalledPos.y
		}

		/**
		 * When the user presses CTRL during dnd or resize
		 * we ignore the snapping
		 */
		if (e.ctrlKey) {
			this.hideLines();
			this.hideBoxes();

			if (this.showDndDistance && this.selectedType != "Xboundingbox") {
				try {
					this.renderNNDistance(absPos, top, left);
				} catch (e) {
					console.debug(e)
				}
			}
			return absPos;
		}

		/**
		 * For bounding boxes we might get in case of dnd the pos is the
		 * selected widget, not the entire box, so the width and height
		 * are wrong. we correct this here.
		 * *ATTENTION* This might not work for resize
		 */
		if (this.selectedType == "boundingbox") {
			absPos.w = this.selectedModel.w;
			absPos.h = this.selectedModel.h;
		}

		absPos.type = this.selectedType;
		absPos.source = this.selectedID;

		/**
		 * 1) get the screen. Check if the last screen is still ok. If screen
		 * change we compute all lines for the screen
		 */
		if (!this._lastScreen || !this._isBoxChild(absPos, this._lastScreen)) {
			this.initLines(absPos);
		}

		/**
		 * If no screen, no snapping...
		 */
		if (!this._lastScreen) {
			return absPos;
		}


		/**
		 * now compare all lines in the direction of and the middle
		 *
		 * FIXME: If we do dnd, for the grid we should only snapp
		 * on north-west corner
		 */
		var corners = this.getCorners(absPos, left, top);
		let closeXLine = this.getCloseLines(this._linesX, "x", corners.x);
		let closeYLine = this.getCloseLines(this._linesY, "y", corners.y);

		/**
		 * Get close middle lines. We handle this a little special:
		 *
		 * 1) We ignore grid lines
		 *
		 * 2) New in 0.9973 => We just compare middle with middle!!
		 *
		 */
		let closeXMiddle = this.getCloseLines(this._linesXMiddle, "x", corners.mx, "Grid");
		let closeYMiddle = this.getCloseLines(this._linesYMiddle, "y", corners.my, "Grid");

		/**
		 * Get patterns and create *virtual* lines (that are no rendered)
		 *
		 * Since 3.0.17 we do not do pattern matching if we snapp to the grid
		 */
		let closeXPattern = null
		let closeYPattern = null
		if (!this.grid.enabled) {
			let linesPattern = this.renderOverLapDistance(absPos, top, left);
			closeXPattern = this.getCloseLines(linesPattern.x, "x", corners.l);
			closeYPattern = this.getCloseLines(linesPattern.y, "y", corners.t);
		}

		/**
		 * Hide all lines
		 */
		this.hideLines();
		this.hideBoxes();

		/**
		 * No show lines to snapp to
		 */
		absPos.snapp = {
			type: this.activePoint,
			left: left,
			top: top
		};
		var diff = {
			x: 0,
			y: 0
		};


		/**
		 * Snapp X : Pattern lines have prio
		 */
		if (closeXPattern && closeXLine) {
			let isBiggerX = Math.abs(closeXLine.dist) - Math.abs(closeXPattern.dist);
			if (isBiggerX > 2) {
				delete closeXPattern.snapp;
				this.correctX(absPos, diff, closeXPattern);
			} else {
				this.correctX(absPos, diff, closeXLine);
			}
		} else if (closeXPattern) {

			delete closeXPattern.snapp;
			this.correctX(absPos, diff, closeXPattern);

		} else if (closeXLine && closeXMiddle) {
			let isBiggerX = Math.abs(closeXLine.dist) - Math.abs(closeXMiddle.dist);
			if (isBiggerX > 0) {
				closeXMiddle.snapp.middle = true;
				this.correctX(absPos, diff, closeXMiddle);
			} else {
				this.correctX(absPos, diff, closeXLine);
			}
		} else if (closeXMiddle) {
			closeXMiddle.snapp.middle = true;
			this.correctX(absPos, diff, closeXMiddle);
		} else if (closeXLine) {
			this.correctX(absPos, diff, closeXLine);
		}


		/**
		 * Snapp Y: Pattern lines have prio in general, except we
		 * are super close
		 */
		if (closeYLine && closeYPattern) {
			// To ensure that we snapp to close lines...
			// if we have a pattern and a close line, and the close line is
			// < 2 we choose the close line, else we go for the pattern.
			let isBiggerX = Math.abs(closeYLine.dist) - Math.abs(closeYPattern.dist);
			if (isBiggerX > 2) {
				delete closeYPattern.snapp;
				this.correctY(absPos, diff, closeYPattern);
			} else {
				this.correctY(absPos, diff, closeYLine);
			}
		} else if (closeYPattern) {
			// FIXME: Do not delete the snapp, if we have it implemented in the
			delete closeYPattern.snapp;
			this.correctY(absPos, diff, closeYPattern);
		} else if (closeYLine && closeYMiddle) {

			let isBiggerY = Math.abs(closeYLine.dist) - Math.abs(closeYMiddle.dist);
			if (isBiggerY > 0) {
				closeYMiddle.snapp.middle = true;
				this.correctY(absPos, diff, closeYMiddle);
			} else {
				this.correctY(absPos, diff, closeYLine);
			}
		} else if (closeYMiddle) {
			closeYMiddle.snapp.middle = true;
			this.correctY(absPos, diff, closeYMiddle)
		} else if (closeYLine) {
			this.correctY(absPos, diff, closeYLine)
		}

		this.snapp(absPos, diff, this.activePoint);

		/**
		 * Correct the finall snapping if SHIFT was pressed
		 */
		if (e.shiftKey) {
			const scalledPos = ModelUtil.scaleToSelection(this.selectedModel, absPos, absPos.snapp.type)
			absPos.w = scalledPos.w
			absPos.h = scalledPos.h
			absPos.x = scalledPos.x
			absPos.y = scalledPos.y
			if(absPos.snapp){
				absPos.snapp.scale = true;
			}
		}


		/**
		 * Ensure we do not have negative snapping
		 */
		if (absPos.w < 0) {
			absPos.w = 1
		}

		if (absPos.h < 0) {
			absPos.h = 1
		}

		if (this.showDndDistance && this.selectedType != "Xboundingbox") {
			try {
				this.renderNNDistance(absPos, showDistanceYTop, showDistanceXLeft);
			} catch (e) {
				console.error(e);
				console.error(e.stack);
			}
		}

		if (this.showDimensions) {
			try {
				this.renderDimension(absPos, mouse)
			} catch (e) {
				console.error(e);
				console.error(e.stack);
			}
		}

		/**
		 * public the unzoomed position
		 */
		topic.publish("matc/box/move", absPos);

		this._lastTop = top;
		this._lastLeft = left;
		return absPos;
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
		this.dimDiv.innerHTML = this._getHackedUnZoomed(pos.w, this.zoom) + " x " + this._getHackedUnZoomed(pos.h, this.zoom);
	}

	/***********************************************************************
	 * Snapping Distabce
	 ***********************************************************************/

	getSnappDictance () {
		if (this.adjustSnappDistanceToMouseSpeed) {
			if (this.mousePositions.length > 2) {
				/**
				 * We calculate the miuse velicty as pixel per second. If we
				 * have a fast movement (> 10 p/s), we set the snapp to 10
				 * pixel. If we move slow, it's half of the snapp distance
				 */
				let v = this.getMouseVelocity(this.mousePositions)
				if (v > this.fastSnappMouseVelcity) {
					return this.snappDistance
				}
				return this.snappDistance / 2
			}
		}
		return this.snappDistance
	}

	/**
	 * Returns the pixel per second velociy
	 */
	getMouseVelocity (list) {
		let distanceInPixel = 0;
		const end = list.length - 1
		for (let i=0; i < end; i++) {
			const a = list[i]
			const b = list[i+1]
			distanceInPixel += Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y))
		}
		const timeInSec = (list[list.length - 1].t - list[0].t) / 1000
		return distanceInPixel / timeInSec
	}

	/***********************************************************************
	 * Distance
	 ***********************************************************************/

	showDistribution(lines) {

		this.cleanupDistributionLines();
		this.distributionLines = {};
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.x) {
				const xLine = line.x
				const lbl = this._getHackedUnZoomed(xLine.w, this.zoom);
				this._renderDistributionLineX(xLine.x, xLine.y, xLine.w, lbl);
			}
			if (line.y) {
				const yLine = line.y
				const lbl = this._getHackedUnZoomed(yLine.h, this.zoom);
				this._renderDistributionLineY(yLine.x, yLine.y, yLine.h, lbl);
			}
		}
	}

	/**
	 * Show the distance of the widget to it's parent screen
	 * Should be called when pressed ALET and NO dnd..
	 */
	showScreenDistance(widget) {
		this.cleanupDistanceLines();
		this.distanceLines = {};
		var screen = this.getParentScreen(widget);
		if (screen) {
			this.renderBoxDistance(widget, screen);
			this.renderDistanceHighLight(widget.id);
		}
	}


	renderBoxDistance(widget, screen) {

		/**
		 * Since 4.0.60 we take the source widget
		 */
		let sourceWidget = widget
		let sourceScreen = screen
		if (this.sourceModel.widgets[widget.id] && this.sourceModel.screens[screen.id]) {
			sourceWidget = this.sourceModel.widgets[widget.id]
			sourceScreen = this.sourceModel.screens[screen.id]
		} else {
			this.logger.warn('renderBoxDistance', 'Cannot find widget or screen in sourceModel')
		}
		
		const top = widget.y - screen.y;
		const lblTop = sourceWidget.y - sourceScreen.y;
		this._renderDistanceLineY((widget.x + widget.w / 2), screen.y, top, lblTop);

		const bottom = (screen.y + screen.h) - (widget.y + widget.h);
		const lblBottom = (sourceScreen.y + sourceScreen.h) - (sourceWidget.y + sourceWidget.h);
		this._renderDistanceLineY((widget.x + widget.w / 2), widget.y + widget.h, bottom, lblBottom);

		const left = widget.x - screen.x;
		const lblLeft = sourceWidget.x - sourceScreen.x;
		this._renderDistanceLineX(screen.x, widget.y + widget.h / 2, left, lblLeft);

		const right = (screen.x + screen.w) - (widget.x + widget.w);
		const lblRight = (sourceScreen.x + sourceScreen.w) - (sourceWidget.x + sourceWidget.w);
		this._renderDistanceLineX(widget.x + widget.w, widget.y + widget.h / 2, right, lblRight);

	}


	showWidgetDistance(from, to) {
	
		this.cleanupDistanceLines();
		this.distanceLines = {};

		const rPos = this.getRelPosition(from, to);
		const [sourceFrom, sourceTo] = this.getSourceFromTo(from, to)
		
		switch (rPos) {
			case "n":
				{
					let top = from.y - to.y - to.h;
					let lblTop = sourceFrom.y - sourceTo.y - sourceTo.h;
					let xMiddle = this.getOverlayXMiddle(from, to);
					this._renderDistanceLineY(xMiddle, to.y + to.h, top, lblTop);
					break;
				}

			case "s":
				{
					let top = to.y - from.y - from.h;
					let lblTop = sourceTo.y - sourceFrom.y - sourceFrom.h;
					let xMiddle = this.getOverlayXMiddle(from, to);
					this._renderDistanceLineY(xMiddle, from.y + from.h, top, lblTop);
					break;
				}

			case "w":
				{
					let left = from.x - to.x - to.w;
					let lbl = sourceFrom.x - sourceTo.x - sourceTo.w;
					let yMiddle = this.getOverlayYMiddle(from, to);
					this._renderDistanceLineX(to.x + to.w, yMiddle, left, lbl);
					break;
				}


			case "e":
				{
					let left = to.x - from.x - from.w;
					let lbl = sourceTo.x - sourceFrom.x - sourceFrom.w;
					let yMiddle = this.getOverlayYMiddle(from, to);
					this._renderDistanceLineX(from.x + from.w, yMiddle, left, lbl);
					break;
				}


			case "nw":
				{
					let y = from.y - to.y - to.h;
					let lblY = sourceFrom.y - sourceTo.y - sourceTo.h;
					this._renderDistanceLineY(from.x, to.y + to.h, y, lblY);
					this._renderDistanceLineY(to.x + to.w, to.y + to.h, y, "", "MatcRulerDistanceLineDottedY");

					let x = from.x - to.x - to.w;
					let lblX = sourceFrom.x - sourceTo.x - sourceTo.w;
					this._renderDistanceLineX(to.x + to.w, from.y, x, lblX);
					this._renderDistanceLineX(to.x + to.w, to.y + to.h, x, "", "MatcRulerDistanceLineDottedX");
					break;
				}


			case "ne":
				{
					let y = from.y - to.y - to.h;
					let lblY = sourceFrom.y - sourceTo.y - sourceTo.h;
					this._renderDistanceLineY(from.x + from.w, to.y + to.h, y, lblY);
					this._renderDistanceLineY(to.x, to.y + to.h, y, "", "MatcRulerDistanceLineDottedY");

					let x = to.x - from.x - from.w;
					let lblX = sourceTo.x - sourceFrom.x - sourceFrom.w;
					this._renderDistanceLineX(from.x + from.w, from.y, x, lblX);
					this._renderDistanceLineX(from.x + from.w, to.y + to.h, x, "", "MatcRulerDistanceLineDottedX");
					break;
				}

			case "sw":
				{
					let y = to.y - from.y - from.h;
					let lblY = sourceTo.y - sourceFrom.y - sourceFrom.h;
					this._renderDistanceLineY(from.x, from.y + from.h, y, lblY);
					this._renderDistanceLineY(to.x + to.w, from.y + from.h, y, "", "MatcRulerDistanceLineDottedY");


					let x = from.x - to.x - to.w;
					let lblX = sourceFrom.x - sourceTo.x - sourceTo.w;
					this._renderDistanceLineX(to.x + to.w, from.y + from.h, x, lblX);
					this._renderDistanceLineX(to.x + to.w, to.y, x, "", "MatcRulerDistanceLineDottedX");
					break;
				}

			case "se":
				{
					let y = to.y - from.y - from.h;
					let lblY = sourceTo.y - sourceFrom.y - sourceFrom.h;
					this._renderDistanceLineY(from.x + from.w, from.y + from.h, y, lblY);
					this._renderDistanceLineY(to.x, from.y + from.h, y, "", "MatcRulerDistanceLineDottedY");


					let x = to.x - from.x - from.w;
					let lblX = sourceTo.x - sourceFrom.x - sourceFrom.w;
					this._renderDistanceLineX(from.x + from.w, from.y + from.h, x, lblX);
					this._renderDistanceLineX(from.x + from.w, to.y, x, "", "MatcRulerDistanceLineDottedX");

					break;
				}


			default:
				break;

		}


		this.renderDistanceHighLight(from.id);
		this.renderDistanceHighLight(to.id);
	}



	getOverlayXMiddle(from, to) {
		const xDif = to.x - from.x;
		if (to.x >= from.x && to.x + to.w <= from.x + from.w) {
			return to.x + Math.round(to.w / 2);
		} else if (from.x >= to.x && from.x + from.w <= to.x + to.w) {
			return from.x + Math.round(from.w / 2);
		} else if (to.x <= from.x) {
			let s = to.x - xDif;
			let e = to.x + to.w;
			return s + Math.round((e - s) / 2);
		} else {
			let s = from.x + xDif;
			let e = from.x + from.w;
			return s + Math.round((e - s) / 2);
		}
	}

	getOverlayYMiddle(from, to) {
		const yDif = to.y - from.y;
		if (to.y >= from.y && to.y + to.h <= from.y + from.h) {
			return to.y + Math.round(to.h / 2);
		} else if (from.y >= to.y && from.y + from.h <= to.y + to.h) {
			return from.y + Math.round(from.h / 2);
		} else if (to.y <= from.y) {
			let s = to.y - yDif;
			let e = to.y + to.h;
			return s + Math.round((e - s) / 2);
		} else {
			let s = from.y + yDif;
			let e = from.y + from.h;
			return s + Math.round((e - s) / 2);
		}
	}


	getRelPosition(from, to) {
		const left = this.isLeft(from, to);
		const top = this.isTop(from, to);
		const right = this.isRight(from, to);
		const bottom = this.isBottom(from, to);

		if (!top && !bottom) {

			if (!left && !right) {
				return "c";
			} else if (left) {
				return "w";
			} else {
				return "e";
			}

		} else if (top) {

			if (!left && !right) {
				return "n";
			} else if (left) {
				return "nw";
			} else {
				return "ne";
			}


		} else {

			if (!left && !right) {
				return "s";
			} else if (left) {
				return "sw";
			} else {
				return "se";
			}
		}
	}


	isTop(from, to) {
		return (from.y) > (to.y + to.h);
	}

	isStartingTop(from, to) {
		return (from.y) >= (to.y); // && (from.y + from.h) <= (to.y + to.h);
	}

	isBottom(from, to) {
		return (from.y + from.h) < (to.y);
	}

	isLeft(from, to) {
		return (from.x) > (to.x + to.w);
	}

	isStartingLeft(from, to) {
		return (from.x) >= (to.x);
	}

	isRight(from, to) {
		return (from.x + from.w) < (to.x);
	}

	isOverLappingX(pos, box) {
		return !this.isLeft(pos, box) && !this.isRight(pos, box);
	}

	isOverLappingY(pos, box) {
		return !this.isTop(pos, box) && !this.isBottom(pos, box);
	}

	renderDistance() {}


	renderDistanceHighLight(widgetID) {
		const div = this.widgetDivs[widgetID];
		if (div) {
			css.add(div, "MatcRulerDistanceBox");
			this.distanceBoxes[widgetID] = div;
		}
	}


	/**
	 * We have to use ceil here, otherwise we have stupid effects...
	 */
	_getHackedUnZoomed(v, zoom = 1) {
		return Math.ceil(v / zoom);
	}


	/***********************************************************************
	 * Pattern lines
	 ***********************************************************************/

	renderOverLapDistance(absPos, top, left) {
		const pattern = {
			x: {},
			y: {}
		};
		if (this.showDndDistance) {
			try {
				const overlaps = this._getOverLappingWidgetsSmart(absPos)
				if (this.activePoint != "West" && this.activePoint != "East") {
					pattern.y = this.renderOverLapDistanceY(overlaps, absPos, top, left);
				}
				if (this.activePoint != "North" && this.activePoint != "South") {
					pattern.x = this.renderOverLapDistanceX(overlaps, absPos, top, left);
				}
			} catch (error) {
				this.logger.error("renderOverLapDistance", "Something went wrong", error);
				this.logger.sendError(error);
			}
		}
		return pattern;
	}

	/**
	 * Calculates the similarity between two widgets.
	 */
	isSimilar(a, b) {
		let score = 0;
		if (Math.abs(a.w - b.w) < 5) {
			score++;
		}
		if (Math.abs(a.h - b.h) < 5) {
			score++;
		}
		if (a.style && b.style && a.style.background === b.style.background) {
			score++;
		}
		if (a.type === b.type) {
			score++;
		}
		// TODO: We should also check if we have some kind of container or so.
		//console.debug(a.name, b.name, " ", score)
		return score > 1; // or what is a good similarity threshold;
	}

	/**
	 * Get all boxes that are somehow similar. If the number is to small,
	 * we return all boxes
	 */
	getSimilarBoxes(selectedBox, boxes) {
		let simBoxes = [];
		if (selectedBox) {
			for (let i = 0; i < boxes.length; i++) {
				const box = boxes[i];
				if (this.isSimilar(selectedBox, box)) {
					simBoxes.push(box);
				}
			}
		}
		if (simBoxes.length < 1) {
			simBoxes = boxes;
		}
		return simBoxes;
	}

	/**
	 * Find the vertical patterns on the Y axix
	 */
	renderOverLapDistanceY(overlaps, absPos) {
		const result = {}
		const x = overlaps.x;
		const xBoxes = [];

		// we just inlude lines that are above for now
		for (let i = 0; i < x.length; i++) {
			const box = x[i].to;
			if (box.y < absPos.y) { // removed (box.y + box.h) <  absPos.y
				xBoxes.push(box);
			}
		}
		xBoxes.sort(function (a, b) {
			return (a.y) - (b.y);
		});

		/**
		 * FIXME: why not take the entire design??
		 */
		const simBoxes = this.getSimilarBoxes(this.selectedModel, xBoxes);

		// var temp = {};
		/**
		 * For each overlapping widget, we compare it with the other (n-closest)
		 * widgets and compute the closet TOP distance. This will be shown as
		 * a pattern.
		 *
		 * @FIXME: This is top!!!
		 */
		// var n = this.patternNeibhourhood;
		for (let i = 0; i < simBoxes.length; i++) {
			const from = simBoxes[i];
			let topMinDistance = 10000000;
			let topBox = null;
			for (let j = 0; j < xBoxes.length; j++) {
				const to = xBoxes[j];
				/**
				 * First check the distance from the top line
				 * - To the bottom of the other
				 * - To the top of the other
				 * - TODO: Give a score on similarity Give somehow a
				 */
				let distance = from.y - (to.y + to.h);
				if (distance > 3 && distance < topMinDistance) {
					topMinDistance = distance;
					topBox = to;
				}
				distance = from.y - (to.y);
				if (distance > 3 && distance < topMinDistance) {
					topMinDistance = distance;
					topBox = to;
				}
			}


			if (topBox) {
				// FIXME: if we have similarity, we should somehow compute the distance again...
				//console.debug("top", from.name, "=>", topBox.name, topMinDistance )
				const lbl = this._getHackedUnZoomed(topMinDistance, this.zoom);
				const xMiddle = this.getOverlayXMiddle(from, topBox);
				const line = {
					x: xMiddle,
					y: 0,
					lbl: lbl,
					l: topMinDistance
				};
				if (topBox.y + topBox.h < from.y) {
					line.y = topBox.y + topBox.h;
				} else {
					line.y = topBox.y * 1;
				}

				if (overlaps.minTop && overlaps.minTop.to) {
					const minTop = overlaps.minTop.to;
					let snappY = minTop.y + minTop.h + topMinDistance;
					if (overlaps.minTop.attach === "top") {
						snappY = minTop.y + topMinDistance;
					}

					if (!result["py" + snappY]) {
						result["py" + snappY] = {
							snapp: {
								type: "PatternY",
								from: from.id,
								to: topBox.id,
								ref: minTop
							}, // what is the ref needed for
							id: "py" + snappY,
							type: "Pattern",
							y: snappY,
							l: lbl,
							count: 0,
							lines: []
						}
					}
					result["py" + snappY].count++;
					result["py" + snappY].lines.push(line);
				}
			}
		}

		/**
		 * Since 3.0.2 we have a min count that depends in the similar boxes above
		 */
		const minCount = this.getSnappLineMinCount(simBoxes.length)
		for (let key in result) {
			if (result[key].count > minCount) {
				const lines = result[key].lines;
				for (let i = 0; i < lines.length; i++) {
					let line = lines[i]
					this._renderDistanceLineY(line.x, line.y, line.l, line.lbl, "", true)
				}
			}
		}

		return result;
	}


	renderOverLapDistanceX(overlaps, absPos) {
		const result = {}

		let y = overlaps.y;
		let yBoxes = [];
		for (let i = 0; i < y.length; i++) {
			const box = y[i].to;
			if (box.x < absPos.x) { // removed
				yBoxes.push(box);
			}
		}

		yBoxes.sort((a, b) => {
			return (a.x - b.x);
		});

		const simBoxes = this.getSimilarBoxes(this.selectedModel, yBoxes);
		//console.debug("simBoxes X", simBoxes);
		/**
		 * Loop over all overlaps and compute the shortest RIGHT
		 * distance.
		 */
		for (let i = 0; i < simBoxes.length; i++) {
			let from = simBoxes[i];
			let rightMinDistance = 10000000;
			let rightBox = null;

			for (let j = 0; j < yBoxes.length; j++) {
				let to = yBoxes[j];
				let distance = from.x - (to.x + to.w);
				if (distance > 0 && distance < rightMinDistance) {
					rightMinDistance = distance;
					rightBox = to;
				}
				// check top of to
				distance = (from.x) - to.x
				if (distance > 0 && distance < rightMinDistance) {
					rightMinDistance = distance;
					rightBox = to;
				}
			}


			if (rightBox) {
				//console.debug("right", from.name, " => ", rightBox.name, ": ", rightMinDistance)
				let lbl = this._getHackedUnZoomed(rightMinDistance, this.zoom);
				let YMiddle = this.getOverlayYMiddle(from, rightBox);
				let line = {
					x: 0,
					y: YMiddle,
					lbl: lbl,
					l: rightMinDistance
				};
				if (rightBox.x + rightBox.w < from.x) {
					line.x = rightBox.x + rightBox.w;
				} else {
					line.x = rightBox.x;
				}

				if (overlaps.minLeft && overlaps.minLeft.to) {
					let minLeft = overlaps.minLeft.to;
					let snappX = minLeft.x + minLeft.w + rightMinDistance;
					if (overlaps.minLeft.attach === "left") {
						snappX = minLeft.x + rightMinDistance;
					}
					if (!result["px" + snappX]) {
						result["px" + snappX] = {
							snapp: {
								type: "PatternX",
								from: from.id,
								to: rightBox.id,
								ref: minLeft
							},
							id: "px" + snappX,
							type: "Pattern",
							x: snappX,
							l: lbl,
							count: 0,
							lines: []
						}
					}
					result["px" + snappX].count++;
					result["px" + snappX].lines.push(line);
				}
			}

		}

		/**
		 * Since 3.0.2 we have a min count that depends in the similar boxes above
		 */
		let minCount = this.getSnappLineMinCount(simBoxes.length)
		for (let key in result) {
			if (result[key].count > minCount) {
				let lines = result[key].lines;
				for (let i = 0; i < lines.length; i++) {
					let line = lines[i]
					this._renderDistanceLineX(line.x, line.y, line.l, line.lbl, "", true)
				}
			}
		}
		return result;
	}

	getSnappLineMinCount (boxAboveCount) {
		return boxAboveCount > 4 ? 2 : 0
	}

	/**
	 * Get a list of overlapping widgets and their distance
	 */
	_getOverLappingWidgetsSmart(absPos) {

		/**
		 * 1st compute all elements that are somehow overlapping
		 */
		const result = {
			x: [],
			y: []
		};
		let minTop = 1000000;
		let minBottom = 1000000;

		let minLeft = 1000000;
		let minRight = 1000000;

		let boxes = this._getOverlappingBoxes();
		let length = boxes.length
		for (let i = 0; i < length; i++) {
			const widget = boxes[i]
			if (widget && (widget.id != this.selectedID) ) {

				if (this.isOverLappingX(absPos, widget)) {
					let widgetDistance = {
						from: absPos,
						to: widget,
						attach: null,
					};

					if (this.isStartingTop(absPos, widget)) {
						if (absPos.y - (widget.y + widget.h) > 0) {
							widgetDistance.distance = absPos.y - (widget.y + widget.h);
						} else {
							widgetDistance.distance = absPos.y - (widget.y);
							widgetDistance.attach = "top";
						}
						result.x.push(widgetDistance);
						if (widgetDistance.distance < minTop) {
							minTop = widgetDistance.distance;
							result.minTop = widgetDistance;
						}

					} else if (this.isBottom(absPos, widget)) {
						widgetDistance.distance = (widget.y) - (absPos.y + absPos.h);
						result.x.push(widgetDistance);
						if (widgetDistance.distance < minBottom) {
							minBottom = widgetDistance.distance;
							result.minBottom = widgetDistance;
						}
					}

				} // isOverLappingX
				if (this.isOverLappingY(absPos, widget)) {

					let widgetDistance = {
						from: absPos,
						to: widget
					};
					if (this.isStartingLeft(absPos, widget)) {
						if (absPos.x - (widget.x + widget.w) > 0) {
							widgetDistance.distance = absPos.x - (widget.x + widget.w);
						} else {
							widgetDistance.distance = absPos.x - (widget.x);
							widgetDistance.attach = "left";
						}
						result.y.push(widgetDistance);
						if (widgetDistance.distance < minLeft) {
							minLeft = widgetDistance.distance;
							result.minLeft = widgetDistance;
						}
					} else if (this.isRight(absPos, widget)) {
						widgetDistance.distance = (widget.x) - (absPos.x + absPos.w);
						result.y.push(widgetDistance);
						if (widgetDistance.distance < minRight) {
							minRight = widgetDistance.distance;
							result.minRight = widgetDistance;
						}
					}
				} // end isOverLappingY
			}
		}
		return result;
	}


	/***********************************************************************
	 * NN Distance
	 ***********************************************************************/


	/**
	 * Show distance to
	 *
	 * a) closest overlapping element
	 *
	 * b) element is overlapping and we are aligning too!
	 *
	 */
	renderNNDistance(absPos, top, left) {

		/**
		 * We have to fix bounding box offset in here
		 */
		absPos = lang.clone(absPos);
		if (this.boundingBoxOffsetX > 0) {
			absPos.x -= this.boundingBoxOffsetX;
		}

		if (this.boundingBoxOffsetY > 0) {
			absPos.y -= this.boundingBoxOffsetY;
		}

		if (this._lastScreen) {

			const overlaps = this._getNNDistance(absPos, top, left);
			let useSourceLabel = true
			/**
			 *
			 *
			 * 1) If we are moving (activePoint == All), we take the movement
			 * direction (top, left) into account and the distance to the next line.
			 * If we are pixel wise positioning we do not want the lines to flip all
			 * the time
			 *
			 * 2) If we are resizing we just take the one depending on the handle!
			 *
			 * 3) If we are top or left we have to check if we are in the widget or not
			 *
			 */
			if (this.activePoint == "All") {


				const disTop = overlaps.minTop ? overlaps.minTop.distance : 100000
				const disBottom = overlaps.minBottom ? overlaps.minBottom.distance : 100000
				const disLeft = overlaps.minLeft ? overlaps.minLeft.distance : 100000
				const disRight = overlaps.minRight ? overlaps.minRight.distance : 100000

			
				if (left || disLeft < disRight) {
					if (overlaps.minLeft && disLeft) {
						let from = overlaps.minLeft.from;
						let to = overlaps.minLeft.to;
						let distance = overlaps.minLeft.distance;
						let lbl = this.getDistanceLabel(overlaps.minLeft, useSourceLabel, 'x', 'left')
						let yMiddle = this.getOverlayYMiddle(from, to);
						if (overlaps.minLeft.left == 0) {
							this._renderDistanceLineX(to.x, yMiddle, distance, lbl, "", true);
						} else {
							this._renderDistanceLineX(to.x + to.w, yMiddle, distance, lbl, "", true);
						}
					}
				} else {
					if (overlaps.minRight && disRight) {
						let from = overlaps.minRight.from;
						let to = overlaps.minRight.to;
						let distance = overlaps.minRight.distance;
						let lbl = this.getDistanceLabel(overlaps.minRight, useSourceLabel, 'x', 'right')
						let yMiddle = this.getOverlayYMiddle(from, to);
						this._renderDistanceLineX(from.x + from.w, yMiddle, distance, lbl, "", true);
					}
				}

				if (top || disTop < disBottom) {
					if (overlaps.minTop && disTop) {
						let from = overlaps.minTop.from;
						let to = overlaps.minTop.to;
						let distance = overlaps.minTop.distance;
						let lbl = this.getDistanceLabel(overlaps.minTop, useSourceLabel, 'y', 'top')
						let xMiddle = this.getOverlayXMiddle(from, to);
						if (overlaps.minTop.top == 0) {
							this._renderDistanceLineY(xMiddle, to.y, distance, lbl, "", true);
						} else {
							this._renderDistanceLineY(xMiddle, to.y + to.h, distance, lbl, "", true);
						}
					}

				} else {
					if (overlaps.minBottom && disBottom) {
						let from = overlaps.minBottom.from;
						let to = overlaps.minBottom.to;
						let distance = overlaps.minBottom.distance;
						let lbl = this.getDistanceLabel(overlaps.minBottom, useSourceLabel, 'y', 'bottom')
						let xMiddle = this.getOverlayXMiddle(from, to);
						this._renderDistanceLineY(xMiddle, from.y + from.h, distance, lbl, "", true);
					}
				}


			}

			const isTopHandle = this.activePoint == "North" || this.activePoint == "RightUp" || this.activePoint == "LeftUp";
			const isBottomHandle = this.activePoint == "South" || this.activePoint == "RightDown" || this.activePoint == "LeftDown";
			const isLeftHandle = this.activePoint == "West" || this.activePoint == "LeftDown" || this.activePoint == "LeftUp";
			const isRightHandle = this.activePoint == "East" || this.activePoint == "RightDown" || this.activePoint == "RightUp";

			// FIXME: for resize sourceLabels do not work
			useSourceLabel = false

			if (isTopHandle && overlaps.minTop) {
				let from = overlaps.minTop.from;
				let to = overlaps.minTop.to;
				let distance = overlaps.minTop.distance;
				let lbl = this.getDistanceLabel(overlaps.minTop, useSourceLabel, 'y', 'top')
				let xMiddle = this.getOverlayXMiddle(from, to);
				if (overlaps.minTop.top == 0) {
					this._renderDistanceLineY(xMiddle, to.y, distance, lbl, "", true);
				} else {
					this._renderDistanceLineY(xMiddle, to.y + to.h, distance, lbl, "", true);
				}
			}
			if (isBottomHandle && overlaps.minBottom) {
				let from = overlaps.minBottom.from;
				let to = overlaps.minBottom.to;
				let distance = overlaps.minBottom.distance;
				let lbl = this.getDistanceLabel(overlaps.minBottom, useSourceLabel, 'y', 'bottom')
				let xMiddle = this.getOverlayXMiddle(from, to);
				this._renderDistanceLineY(xMiddle, from.y + from.h, distance, lbl, "", true);
			}
			if (isLeftHandle && overlaps.minLeft) {
				let from = overlaps.minLeft.from;
				let to = overlaps.minLeft.to;
				let distance = overlaps.minLeft.distance;
				let lbl = this.getDistanceLabel(overlaps.minLeft, useSourceLabel, 'x', 'left')
				let yMiddle = this.getOverlayYMiddle(from, to);
				if (overlaps.minLeft.left == 0) {
					this._renderDistanceLineX(to.x, yMiddle, distance, lbl, "", true);
				} else {
					this._renderDistanceLineX(to.x + to.w, yMiddle, distance, lbl, "", true);
				}
			}
			if (isRightHandle && overlaps.minRight) {
				let from = overlaps.minRight.from;
				let to = overlaps.minRight.to;
				let distance = overlaps.minRight.distance;
				let lbl = this.getDistanceLabel(overlaps.minRight, useSourceLabel, 'x', 'right')
				let yMiddle = this.getOverlayYMiddle(from, to);
				this._renderDistanceLineX(from.x + from.w, yMiddle, distance, lbl, "", true);
			}

			if (this._lastScreen) {
				const box = this._lastScreen;
				const widget = absPos;
				if (absPos.snapp && absPos.snapp.x) {
					const snappX = absPos.snapp.x;
					if (snappX.type == "Mirror") {
						let left = widget.x - box.x;
						var lblLeft = this._getHackedUnZoomed(left, this.zoom);
						this._renderDistanceLineX(box.x, widget.y + widget.h / 2, left, lblLeft);
					}
				}

				if (absPos.snapp && absPos.snapp.y) {
					const snappY = absPos.snapp.y;
					if (snappY.type == "Mirror") {
						let top = widget.y - box.y;
						var lblTop = this._getHackedUnZoomed(top, this.zoom);
						this._renderDistanceLineY((widget.x + widget.w / 2), box.y, top, lblTop);
					}
				}
			}
		}
	}

	getDistanceLabel (minObject, useSourceLabel = false) {
		if (useSourceLabel && minObject.label) {
			return minObject.label
		} else {
			let distance =  Math.round(minObject.distance / this.zoom);
			return distance
		}
	}

	_getNNDistance(absPos) {

		/**
		 * 1st compute all elements that are somehow overlapping
		 */
		const result = {};
		let minTop = 1000000;
		let minBottom = 1000000;
		let minLeft = 1000000;
		let minRight = 1000000;

		// the snapp source might be corrected to the grid or ruler.
		// FIXME: ruler is not working yet
		const sourceAbsPos = this.getSnappSource(absPos)

		const boxes = this._getOverlappingBoxes();
		boxes.push(this._lastScreen);
		const length = boxes.length
		for (let i = 0; i < length; i++) {
			const widget = boxes[i]
			const sourceWidget = this.getSourceBox(widget)
			if (widget && (widget.id != this.selectedID || this.copyReferenceID === widget.id)) {

				/**
				 * For all x overlapping boxes
				 */
				if (this.isOverLappingX(absPos, widget)) {
					/**
					 * we take the top and bottom line
					 */
					const lines = [widget.y, widget.y + widget.h];
					const sourceLines = [sourceWidget.y, sourceWidget.y + sourceWidget.h]
					for (let l = 0; l < lines.length; l++) {
						const line = lines[l];
						const sourceLine = sourceLines[l]
						/**
						 * If it above the box check to update minTop
						 */
						if (line <= absPos.y) {
							let distance = absPos.y - line;
							let label = sourceAbsPos.y - sourceLine
							if (distance < minTop) {
								minTop = distance;
								result.minTop = {
									from: absPos,
									to: widget,
									distance: distance,
									label: label,
									top: l
								};
							}
						}
						/**
						 * If it below the box check to update minBottom
						 */
						if (line >= (absPos.y + absPos.h)) {
							let distance = line - (absPos.y + absPos.h);
							let label = sourceLine - (sourceAbsPos.y + sourceAbsPos.h)
							if (distance < minBottom) {
								minBottom = distance;
								result.minBottom = {
									from: absPos,
									to: widget,
									distance: distance,
									label: label,
									top: l
								};
							}
						}
					}
				}
				/**
				 * For all y overlapping boxed
				 */
				if (this.isOverLappingY(absPos, widget)) {

					/**
					 * we take the left and right line
					 */
					const lines = [widget.x, widget.x + widget.w];
					const sourceLines = [sourceWidget.x, sourceWidget.x + sourceWidget.w]
					for (let l = 0; l < lines.length; l++) {
						const line = lines[l];
						const sourceLine = sourceLines[l]

						/**
						 * If it left the box check to update minTop
						 */
						if (line <= absPos.x) {
							let distance = absPos.x - line;
							let label = sourceAbsPos.x - sourceLine
							if (distance < minLeft) {
								minLeft = distance;
								result.minLeft = {
									from: absPos,
									to: widget,
									distance: distance,
									label: label,
									left: l
								};
							}

						}
						/**
						 * If it below the box check to update minBottom
						 */
						if (line >= (absPos.x + absPos.w)) {
							var distance = line - (absPos.x + absPos.w);
							let label = sourceLine - (sourceAbsPos.x + sourceAbsPos.w)
							if (distance < minRight) {
								minRight = distance;
								result.minRight = {
									from: absPos,
									to: widget,
									distance: distance,
									label: label,
									left: l
								};
							}
						}
					}
				} // end isOverLappingY
			}
		}


		return result;
	}

	getSnappSource(absPos) {
		const box = lang.clone(absPos)
        if (box.x) {
            box.x = Math.floor(box.x / this.zoom);
        }
        if (box.y) {
            box.y = Math.floor(box.y / this.zoom);
        }
        if (box.w) {
            box.w = Math.floor(box.w / this.zoom);
        }

        if (box.h) {
            box.h = Math.floor(box.h / this.zoom);
        }

		if (absPos.snapp) {
			const snapp = absPos.snapp
			if (snapp.x && snapp.x._sourceV !== undefined) {
				if (snapp.x.type === 'Grid') {
					box.x = snapp.x._sourceV
				}
				// FIXME: we should also support this for Rulers, but there is somehow a bug.
			}
			if (snapp.y && snapp.y._sourceV !== undefined) {
				if (snapp.y.type === 'Grid') {
					box.y = snapp.y._sourceV
				}
			}
		}

	
		return box
	}

	_getOverlappingBoxes() {

		const result = []
		let children = this._lastScreen.children;

		let selectedIDs = {};
		

		if (!this.copyReferenceID) {
			if (this.selectedIDs) {
				selectedIDs = lang.clone(this.selectedIDs);
			}
			selectedIDs[this.selectedID] = true
	
			if (this.selectedModel && this.selectedModel.children) {
				children = this.selectedModel.children;
				for (let i = 0; i < children.length; i++) {
					selectedIDs[children[i]] = true;
				}
			}
		}

		const length = children.length;
		for (let i = 0; i < length; i++) {
			const id = children[i];
			const widget = this.model.widgets[id];
			if (!selectedIDs[id] && widget) {
				const group = this.getParentGroup(id);
				if (group) {
					const box = this.getBoundingBox(group.children);
					result.push(box);
					// do not include other group members
					for (var j = 0; j < group.children.length; j++) {
						var childID = group.children[j];
						selectedIDs[childID] = true;
					}
				} else {
					result.push(widget)
				}
			}
		}

		return result;
	}

	/**
	 * Distribution lines
	 */
	_renderDistributionLineX(x, y, w, l, clazz, hasEndLines) {
		this._renderLineX(this.distributionLines, x, y, w, l, clazz, hasEndLines)
	}

	_renderDistributionLineY(x, y, h, l, clazz, hasEndLines) {
		this._renderLineY(this.distributionLines, x, y, h, l, clazz, hasEndLines)
	}

	/**
	 * Distance lines
	 */
	_renderDistanceLineX(x, y, w, l, clazz, hasEndLines) {
		this._renderLineX(this.distanceLines, x, y, w, l, clazz, hasEndLines)
	}

	_renderDistanceLineY(x, y, h, l, clazz, hasEndLines) {
		this._renderLineY(this.distanceLines, x, y, h, l, clazz, hasEndLines)
	}

	/**
	 * Line rending
	 */
	_renderLineX(lines, x, y, w, l, clazz, hasEndLines) {

		const key = "X" + y + w + x;

		if (w > 0 && !lines[key]) {
			const div = document.createElement("div");
			css.add(div, "MatcRulerDistanceLine MatcRulerDistanceLineX");

			if (clazz) {
				css.add(div, clazz);
			}

			div.style.height = "1px";
			div.style.width = w + "px";
			div.style.left = x + "px";
			div.style.top = y + "px";


			const lbl = document.createElement("div");
			css.add(lbl, "MatcRulerDistanceLabelX");
			lbl.innerHTML = l;
			div.appendChild(lbl);

			if (hasEndLines) {
				const end = document.createElement("div");
				css.add(end, "MatcRulerDistanceXEnd");
				div.appendChild(end);

				const start = document.createElement("div");
				css.add(start, "MatcRulerDistanceXStart");
				div.appendChild(start);
			}

			this.container.appendChild(div);
			lines[key] = div;
		}
	}


	_renderLineY(lines, x, y, h, l, clazz, hasEndLines) {
		const key = "y" + y + h + x;
		if (h > 0 && !lines[key]) {
			const div = document.createElement("div");
			css.add(div, "MatcRulerDistanceLine MatcRulerDistanceLineY");
			if (clazz) {
				css.add(div, clazz);
			}
			div.style.width = "1px";
			div.style.height = h + "px";
			div.style.left = x + "px";
			div.style.top = y + "px";


			const lbl = document.createElement("div");
			css.add(lbl, "MatcRulerDistanceLabelY");
			lbl.innerHTML = l;
			div.appendChild(lbl);


			if (hasEndLines) {
				const end = document.createElement("div");
				css.add(end, "MatcRulerDistanceYEnd");
				div.appendChild(end);

				const start = document.createElement("div");
				css.add(start, "MatcRulerDistanceYStart");
				div.appendChild(start);
			}
			this.container.appendChild(div);
			lines[key] = div;
		}
	}


	/***********************************************************************
	 * Snapping
	 ***********************************************************************/

	correctX(absPos, diff, closeXLine) {
		let snappDistance = this.getSnappDictance()
		this.showLine(closeXLine, "x");
		if (Math.abs(closeXLine.dist) < snappDistance) {
			diff.x = closeXLine.dist;
			absPos.snapp.x = closeXLine.snapp;
		}
	}

	correctY(absPos, diff, closeYLine) {
		let snappDistance = this.getSnappDictance()
		this.showLine(closeYLine, "y");
		if (Math.abs(closeYLine.dist) < snappDistance) {
			diff.y = closeYLine.dist;
			absPos.snapp.y = closeYLine.snapp;
		}
	}

	updateMovements(absPos) {

		if (this.mousePositions.length > 20) {
			this.mousePositions.shift()
		}
		this.mousePositions.push({
			x: absPos.x,
			y: absPos.y,
			t: new Date().getTime()
		})

		if (this.xMovements.length > 2) {
			this.xMovements.shift()
		}
		if (this.yMovements.length > 2) {
			this.yMovements.shift()
		}

		if (this._lastPos) {
			if (absPos.x > this._lastPos.x) {
				this.xMovements.push(-1);
			}
			if (absPos.x < this._lastPos.x) {
				this.xMovements.push(1);
			}
			if (absPos.y > this._lastPos.y) {
				this.yMovements.push(-1);
			}
			if (absPos.y < this._lastPos.y) {
				this.yMovements.push(1);
			}
		}
		this._lastPos = lang.clone(absPos);

	}

	getMovementDir(list) {
		var sum = 0;
		for (var i = 0; i < list.length; i++) {
			sum += list[i];
		}
		return sum > 0;
	}

	getCorners(pos, left, top) {

		var corners = {
			x: [],
			y: [],
			mx: [],
			my: [],
			t: [],
			l: []
		};

		corners.t.push(pos.y);
		corners.l.push(pos.x);


		switch (this.activePoint) {

			/**
			 * Here we take the direction of the movement into account.
			 * Since 3.0.43 top and left might be fixed because of gridSnapTopLeft
			 */
			case "All":

				var x = left ? pos.x : pos.x + pos.w;
				corners.x.push(x);
				var y = top ? pos.y : pos.y + pos.h;
				corners.y.push(y);

				/**
				 * Middle. Floor like in the controller Widget.js snappAll()
				 * FIXME: round, but in unzoomed
				 */
				if (this.hasMiddleX) {
					corners.mx.push(Math.floor(pos.x + pos.w / 2));
				}
				if (this.hasMiddleY) {
					corners.my.push(Math.floor(pos.y + (pos.h / 2)));
				}
				break;

			case "LeftUp":
				corners.x.push(pos.x);
				corners.y.push(pos.y);
				break;

			case "RightDown":
				corners.x.push(pos.x + pos.w);
				corners.y.push(pos.y + pos.h);
				break;

			case "LeftDown":
				corners.x.push(pos.x);
				corners.y.push(pos.y + pos.h);
				break;

			case "RightUp":
				corners.x.push(pos.x + pos.w);
				corners.y.push(pos.y);
				break;

			case "North":
				//corners.x.push(pos.x + Math.round(pos.w/2));
				corners.y.push(pos.y);
				break;

			case "South":
				//corners.x.push(pos.x + Math.round(pos.w/2));
				corners.y.push(pos.y + pos.h);
				break;

			case "West":
				corners.x.push(pos.x);
				//corners.y.push(pos.y + Math.round(pos.h/2));
				break;

			case "East":
				corners.x.push(pos.x + pos.w);
				//corners.y.push(pos.y + Math.round(pos.h/2));
				break;

			default:
				console.warn("Type not supported!");
				break;
		}

		/**
		 * Here we fix the bounding box issues
		 */
		if (this.boundingBoxOffsetX) {
			for (let i = 0; i < corners.x.length; i++) {
				corners.x[i] -= this.boundingBoxOffsetX;
			}
			for (let i = 0; i < corners.mx.length; i++) {
				corners.mx[i] -= this.boundingBoxOffsetX;
			}
		}
		if (this.boundingBoxOffsetY) {
			for (let i = 0; i < corners.y.length; i++) {
				corners.y[i] -= this.boundingBoxOffsetY;
			}
			for (let i = 0; i < corners.my.length; i++) {
				corners.my[i] -= this.boundingBoxOffsetY;
			}
		}


		return corners;
	}




	snapp(absPos, diff, type) {
		//this.logger.log(0,"snapp", "enter " +diff.x + " " + diff.y + " > " + type);

		switch (type) {

			case "All":
				/**
				 * Simply substract the difference
				 */
				absPos.x += diff.x;
				absPos.y += diff.y;
				break;

			case "LeftUp":
				absPos.x += diff.x;
				absPos.w -= diff.x;
				absPos.y += diff.y;
				absPos.h -= diff.y;
				break;


			case "RightUp":
				absPos.w += diff.x;
				absPos.y += diff.y;
				absPos.h -= diff.y;
				break;

			case "RightDown":
				absPos.w += diff.x;
				absPos.h += diff.y;
				break;

			case "LeftDown":
				absPos.x += diff.x;
				absPos.w -= diff.x;
				absPos.h += diff.y;
				break;


			case "North":
				absPos.y += diff.y;
				absPos.h -= diff.y;
				break;

			case "South":
				absPos.h += diff.y;
				break;

			case "West":
				absPos.x += diff.x;
				absPos.w -= diff.x;
				break;

			case "East":
				absPos.w += diff.x;
				break;

			default:
				// leftup
				console.warn("Type not supported!");
				break;
		}

		return absPos;
	}


	getCloseLines(lines, key, vales, ignoreType) {

		let result = null;
		let min = this.showDistance;
		const weights = {
			"Grid": 0,
			"Widget": 0,
			"Screen": 0,
			"Pattern": 0
		};


		for (var id in lines) {
			var line = lines[id];

			if (!ignoreType || ignoreType != line.type) {
				line.dist = 1000;
				for (let i = 0; i < vales.length; i++) {
					let v = vales[i];

					/**
					 * We add here a penalty of 10 pixel for Grid lines to avoid that the user
					 * "fight" the grid. For example the snapp line of another widget is 5px away,
					 * but the nearest grid is 4. Normally we would snapp to the grid and then on the
					 * next mouse move only to the other widget. This is stupid. Therefore we add a penalty
					 * of 10 px to the grid line. This means in "white" space the grid works, close to widgets
					 * not.
					 *
					 * TODO: Also we should have here some kind of penalty of the widget that causes the line is
					 * very far in the other axis...
					 */
					const cost = Math.abs(v - line[key]) + weights[line.type];
					if (cost >= 0 && cost < min) {
						min = cost;
						result = line;
						result.dist = line[key] - v;
					}
				}
			}
		}

		return result;
	}

	initLines(absPos) {
		var screen = this.getHoverScreen(absPos);
		if (screen) {
			this.logger.log(2, "initLines", "entry > " + screen.id);

			this.cleanUp();

			/**
			 * add lines for screen
			 */
			this.addLines(screen, "Screen", true, true, true);

			/**
			 * Now compute all lines for the widgets.
			 * Update 5.5.2019: We just use the lines iff the grid
			 * is enabled!
			 */
			if (!this.grid.enabled) {
				this.initScreen(screen, true, true);
			} else {
				this.logger.log(1, "initLines", "ignore widget lines");
			}

			this.initGrid(screen);

			this.initRulers(screen)

			this.renderLines();
		}
		this._lastScreen = screen;
		this._initLinesCalled += 1
	}

	initRulers (screen) {
		//const sourceScreen = this.getSourceBox(screen)
		if (screen.rulers){
			screen.rulers.forEach(ruler => {
				const v = ruler.v * this.zoom
				//let sourceV = ruler.v
				if (ruler.type === 'x') {
					this.addXLine(screen.x +  v, {
						id: ruler.id,
						type: "Ruler",
						pos: "x",
						_v: screen.x +  v,
						//_sourceV: sourceScreen.x + sourceV
					}, "Screen")
				} else {
					this.addYLine(screen.y +  v, {
						id: ruler.id,
						type: "Ruler",
						pos: "y",
						_v: screen.y +  v,
						//_sourceV: sourceScreen.y + sourceV
					}, "Screen")
				}
			})
		}
	}

	initScreen(screen, onlyX, onlyY) {

		
		let ignore = {};
		if (!this.copyReferenceID) {
			ignore = this.getSnappIgnores(screen)
		}

		/**
		 * now create the snapp lines for all other widgets in the screen
		 */
		for (let i = 0; i < screen.children.length; i++) {
			let id = screen.children[i];
			const snappToBox = !this.ignoreIds || this.ignoreIds.indexOf(id) < 0 || this.copyReferenceID
			if (snappToBox) {
				if (!ignore[id]) {
					const box = this.model.widgets[id];
					if (box) {
						var addMiddle = this.canShowMiddleLines(box);
						this.addLines(box, "Widget", addMiddle, onlyX, onlyY, true);
					} else {
						console.debug("No child box", parent, id);
					}
				}
			}
		}

		/**
		 * Add mirror lines to enable fast centering
		 */
		if (this.activePoint != "All") {
			let box = this.model.widgets[this.selectedID];
			if (box) {
				const difX = box.x - screen.x;
				const difY = box.y - screen.y;
				this.addXLine((screen.x + screen.w) - difX, {
					id: box.id,
					type: "Mirror",
					pos: "left"
				}, "Widget", box);
				this.addYLine((screen.y + screen.h) - difY, {
					id: box.id,
					type: "Mirror",
					pos: "bottom"
				}, "Widget", box);
			}
		}

	}


	getSnappIgnores(screen) {
		const ignore = {}
		/**
		 * Ignore elements in the same group right...
		 */
		const group = this.getParentGroup(this.selectedID)
		if (group && !this.ignoreGroup) {
			for (let i = 0; i < group.children.length; i++) {
				ignore[group.children[i]] = true
			}
		}

		/** 
		 * Do not snapp on itself
		 */
		if (this.selectedModel && this.selectedModel.id) {
			ignore[this.selectedModel.id] = true
		}

		/**
		 * ignore multi
		 */
		if (this.selectedModel && this.selectedModel.children) {
			let children = this.selectedModel.children
			for (let i = 0; i < children.length; i++) {
				ignore[children[i]] = true
			}
		}

		/**
		 * Just get group lines and ignore the children!
		 */
		for (let i = 0; i < screen.children.length; i++) {
			let id = screen.children[i]
			if (!ignore[id]) {
				let group = this.getParentGroup(id)
				if (group) {
					this.addGroupLines(group)
					var groupChildren = group.children
					for (var j = 0; j < groupChildren.length; j++) {
						let groupChildID = groupChildren[j]
						ignore[groupChildID] = true
					}
				}
			}
		}
		return ignore
	}

	/**
	 * We do not want to show middle lines, for boxes that have the same size!
	 */
	canShowMiddleLines(box) {
		if (this.selectedModel && box) {
			if ((box.w == this.selectedModel.w) || (box.h == this.selectedModel.h)) {
				return false;
			}
		}
		return true;
	}

	initGrid(screen) {

		const sourceScreen = this.getSourceBox(screen)
		const sourceGridHeight = this.sourceModel.grid.h
		const sourceGridWidth = this.sourceModel.grid.w

		/**
		 * Now add grid lines
		 */
		if (this.grid.enabled) {

			if (this.grid.type === "columns") {


				var columnCount = this.grid.columnCount;
				var columnOffset = (this.zoom * this.grid.columnOffset);
				var columnGutter = (this.zoom * this.grid.columnGutter);
				var columnWidth = (this.zoom * this.grid.columnWidth);


				var lastX = columnOffset;
				var count = 0;
				for (var i = 0; i < columnCount; i++) {
					this.addXLine(Math.round(screen.x + lastX), {
						id: screen.id,
						pos: "x",
						line: count,
						type: "Grid",
						_v: screen.x + lastX,
						column: true
					}, "Grid");
					count++;
					var x = lastX + columnWidth;
					this.addXLine(Math.round(screen.x + x), {
						id: screen.id,
						pos: "x",
						line: count,
						type: "Grid",
						_v: screen.x + x,
						column: true
					}, "Grid");
					count++;
					lastX = x + columnGutter;
				}

			} else {
				if (this.gridWidth > 0) {
					let columns = Math.ceil(screen.w / this.gridWidth);
					this.logger.log(4, "initLines", "add columns > " + columns);
					for (let i = 0; i < columns; i++) {
						this.addXLine(Math.round(screen.x + i * this.gridWidth), {
							id: screen.id,
							pos: "x",
							line: i,
							_v: screen.x + i * this.gridWidth,
							_sourceV: sourceScreen.x + i * sourceGridWidth,
							type: "Grid"
						}, "Grid");
					}
				}


				if (this.gridHeight > 0) {
					let rows = Math.ceil(screen.h / this.gridHeight);
					this.logger.log(4, "initLines", "add rows > " + rows);
					for (let i = 0; i < rows; i++) {
						this.addYLine(Math.round(screen.y + i * this.gridHeight), {
							id: screen.id,
							pos: "y",
							type: "Grid",
							line: i,
							_v: screen.y + i * this.gridWidth,
							_sourceV: sourceScreen.y + i * sourceGridHeight,
						}, "Grid");
					}
				}
			}

		} else {
			//console.debug("Grid disabled")
		}

	}


	/**
	 * Just add the bounding box lines here...
	 */
	addGroupLines(group) {

		let left, right, top, bottom = null;

		/**
		 * Get bounding box
		 */
		const children = group.children;
		for (let i = 0; i < children.length; i++) {
			const id = children[i];
			const widget = this.model.widgets[id];
			if (widget) {
				if (!left || left.x > widget.x) {
					left = widget;
				}

				if (!top || top.y > widget.y) {
					top = widget;
				}

				if (!right || (right.x + right.w) < (widget.x + widget.w)) {
					right = widget;
				}

				if (!bottom || (bottom.y + bottom.h) < (widget.y + widget.h)) {
					bottom = widget;
				}
			}
		}

		if (left) {
			this.addXLine(left.x, {
				id: left.id,
				type: "Widget",
				pos: "left"
			}, "Widget");
		}

		if (top) {
			this.addYLine(top.y, {
				id: top.id,
				type: "Widget",
				pos: "top"
			}, "Widget");
		}

		if (right) {
			this.addXLine(right.x + right.w, {
				id: right.id,
				type: "Widget",
				pos: "right"
			}, "Widget");
		}

		if (bottom) {
			this.addYLine(bottom.y + bottom.h, {
				id: bottom.id,
				type: "Widget",
				pos: "bottom"
			}, "Widget");
		}

	}

	addLines(box, type, addMiddle, addX, addY, addPadding) {
		const sourceBox = this.getSourceBox(box)
		if (addX) {
			this.addXLine(box.x, {
				id: box.id,
				type: type,
				pos: "left",
				_sourceV: sourceBox.x
			}, type, box);
			this.addXLine(box.x + box.w, {
				id: box.id,
				type: type,
				pos: "right",
				_sourceV: sourceBox.x + sourceBox.w
			}, type, box);
		}
		if (addY) {
			this.addYLine(box.y, {
				id: box.id,
				type: type,
				pos: "top",
				_sourceV: sourceBox.y
			}, type, box);
			this.addYLine(box.y + box.h, {
				id: box.id,
				type: type,
				pos: "bottom",
				_sourceV: sourceBox.y + sourceBox.h
			}, type, box);
		}

		if (addMiddle) {
			if (box.h > 10) {
				this.addMiddleYLine(box.y + Math.round(box.h / 2), {
					id: box.id,
					type: type,
					pos: "middleY",
					_sourceV: sourceBox.y + Math.round(sourceBox.h / 2)
				}, type, box);
			}
			if (box.w > 10) {
				this.addMiddleXLine(box.x + Math.round(box.w / 2), {
					id: box.id,
					type: type,
					pos: "middleX",
					_sourceV: sourceBox.x + Math.round(sourceBox.w / 2)
				}, type, box);
			}
		}

		if (box.min && sourceBox.min) {
		
			this.addYLine(box.y + box.min.h, {
				id: box.id,
				type: type,
				pos: "minY",
				_sourceV: sourceBox.y + sourceBox.min.h
			}, type, box);
		}

		if (addPadding) {
			// FIXME: Add here also Padding lines
		}
	}

	addXLine(x, snapp, type, box) {
		if (!this._linesX["x" + x]) {
			this._linesX["x" + x] = {
				x: x,
				type: type,
				visible: false,
				id: "x" + x,
				snapp: snapp,
				count: 0,
				boxes: []
			};
		}
		this._linesX["x" + x].count++;
		if (box) {
			this._linesX["x" + x].boxes.push(box.id);
		}
	}

	addYLine(y, snapp, type, box) {
		if (!this._linesY["y" + y]) {
			this._linesY["y" + y] = {
				y: y,
				type: type,
				visible: false,
				id: "y" + y,
				snapp: snapp,
				count: 0,
				boxes: []
			};
		}
		this._linesY["y" + y].count++;

		if (box) {
			this._linesY["y" + y].boxes.push(box.id);
		}
	}

	addMiddleXLine(x, snapp, type, box) {
		if (!this._linesXMiddle["x" + x]) {
			this._linesXMiddle["x" + x] = {
				x: x,
				type: type,
				visible: false,
				id: "x" + x,
				snapp: snapp,
				count: 0,
				boxes: []
			};
		}
		this._linesXMiddle["x" + x].count++;
		if (box) {
			this._linesXMiddle["x" + x].boxes.push(box.id);
		}
	}

	addMiddleYLine(y, snapp, type, box) {
		if (!this._linesYMiddle["y" + y]) {
			this._linesYMiddle["y" + y] = {
				y: y,
				type: type,
				visible: false,
				id: "y" + y,
				snapp: snapp,
				count: 0,
				boxes: []
			};
		}
		this._linesYMiddle["y" + y].count++;
		if (box) {
			this._linesYMiddle["y" + y].boxes.push(box.id);
		}
	}

	showLine(line, direction) {

		if ("y" === direction && (this.activePoint === "West" || this.activePoint === "East")) {
			return;
		}

		if ("x" === direction && (this.activePoint === "North" || this.activePoint === "South")) {
			return;
		}

		if (this._gridType != line.type) {
			if (this._linesDivs[line.id]) {
				css.remove(this._linesDivs[line.id], "MatcRulerLineHidden");
				let snappDistance = this.getSnappDictance()
				if (Math.abs(line.dist) < snappDistance) {
					css.add(this._linesDivs[line.id], "MatcRulerLineSelected");
					if (this.highlightBoxes) {
						if (line.boxes) {
							const boxes = line.boxes;
							for (let i = 0; i < boxes.length; i++) {
								const widgetID = boxes[i];
								const div = this.widgetDivs[widgetID];
								if (div) {
									if (line.snapp && (line.snapp.pos == "middleX" || line.snapp.pos == "middleY")) {
										css.add(div, "MatcRulerBoxSelectedMiddle");
									} else {
										css.add(div, "MatcRulerBoxSelectedBorder");
									}

									this.highlightBoxesDivs.push(div);
								}

							}
						}
					}
				}
			}
		}
	}

	hideBoxes() {
		if (this.highlightBoxes) {
			if (this.highlightBoxesDivs) {
				for (var i = 0; i < this.highlightBoxesDivs.length; i++) {
					css.remove(this.highlightBoxesDivs[i], "MatcRulerBoxSelectedBorder MatcRulerBoxSelectedMiddle");
				}
			}
			this.highlightBoxesDivs = [];
		}
	}

	hideLines() {
		for (let id in this._linesX) {
			if (this._linesDivs[id]) {
				css.add(this._linesDivs[id], "MatcRulerLineHidden");
				css.remove(this._linesDivs[id], "MatcRulerLineSelected");
			}
		}

		for (let id in this._linesY) {
			if (this._linesDivs[id]) {
				css.add(this._linesDivs[id], "MatcRulerLineHidden");
				css.remove(this._linesDivs[id], "MatcRulerLineSelected");
			}
		}

		for (let id in this._linesXMiddle) {
			if (this._linesDivs[id]) {
				css.add(this._linesDivs[id], "MatcRulerLineHidden");
				css.remove(this._linesDivs[id], "MatcRulerLineSelected");
			}
		}
		for (let id in this._linesYMiddle) {
			if (this._linesDivs[id]) {
				css.add(this._linesDivs[id], "MatcRulerLineHidden");
				css.remove(this._linesDivs[id], "MatcRulerLineSelected");
			}
		}
	}

	renderLines() {
		for (let id in this._linesX) {
			this.renderLine(this._linesX[id], id);
		}
		for (let id in this._linesY) {
			this.renderLine(this._linesY[id], id);
		}
		for (let id in this._linesXMiddle) {
			this.renderLine(this._linesXMiddle[id], id);
		}
		for (let id in this._linesYMiddle) {
			this.renderLine(this._linesYMiddle[id], id);
		}
	}


	renderLine(line, id) {

		if (this._linesDivs[id]) {
			/**
			 * Should not happen...
			 */
			return;
		}

		/**
		 * We do not render grid lines to make dom faster...
		 */
		if (this._gridType != line.type) {
			if (line.x) {
				let div = document.createElement("div");
				css.add(div, "MatcRulerLine MatcRulerLineHidden MatcRulerLine" + line.type);
				if (line.snapp) {
					css.add(div, "MatcRulerLineSnapp" + line.snapp.pos);
				}
				div.style.width = "1px";
				div.style.height = "100%";
				div.style.left = line.x + "px";
				div.style.top = "0px";
				this.container.appendChild(div);
				this._linesDivs[id] = div;
			}


			if (line.y) {
				let div = document.createElement("div");
				css.add(div, "MatcRulerLine MatcRulerLineHidden MatcRulerLine" + line.type);
				if (line.snapp) {
					css.add(div, "MatcRulerLineSnapp" + line.snapp.pos);
				}
				div.style.height = "1px";
				div.style.width = "100%";
				div.style.top = line.y + "px";
				div.style.left = "0px";
				this.container.appendChild(div);
				this._linesDivs[id] = div;
			}

		}


	}



	cleanupDistanceLines() {
		if (this.distanceLines) {
			for (let id in this.distanceLines) {
				let div = this.distanceLines[id];
				if (div && div.parentNode) {
					div.parentNode.removeChild(div);
				} else {
					console.debug("cleanupDistanceLines() > no div", id)
				}
			}
		}

		if (this.distanceBoxes) {
			for (let id in this.distanceBoxes) {
				let div = this.distanceBoxes[id];
				css.remove(div, "MatcRulerDistanceBox");
			}
		}

		this.distanceLines = {};
		this.distanceBoxes = {};
	}

	cleanupDistributionLines() {
		if (this.distributionLines) {
			for (let id in this.distributionLines) {
				const div = this.distributionLines[id];
				if (div && div.parentNode) {
					div.parentNode.removeChild(div);
				} else {
					console.debug("cleanupDistributionLines() > no div", id)
				}
			}
		}
		this.distributionLines = {};
	}

	/**
	 * Copies from layout
	 */
	getParentScreen(widget) {
		for (let id in this.model.screens) {
			const screen = this.model.screens[id];
			const i = screen.children.indexOf(widget.id);
			if (i > -1) {
				return screen;
			}
		}
		return null;
	}

	getSourceFromTo (from, to) {
		let sourceTo = to
		let sourceFrom = from
		if (this.sourceModel.widgets[to.id] && this.sourceModel.widgets[from.id]) {
			sourceTo = this.sourceModel.widgets[to.id]
			sourceFrom = this.sourceModel.widgets[from.id]
		} else {
			this.logger.warn('getSourceFromTo', 'Cannot find widgets in sourceModel > from:' + from.id + ' > to: '+ to.id)
		}
		return [sourceFrom, sourceTo]
	}

	getSourceBox (box) {
		if (box.id) {
			if (this.sourceModel.widgets[box.id] ) {
				return this.sourceModel.widgets[box.id]
			} 
			if (this.sourceModel.screens[box.id] ) {
				return this.sourceModel.screens[box.id]
			}
			this.logger.warn('getSourceBox', 'Cannot find widget in sourceModel >' + box.id)
		}
		
		return this.getUnZoomedBox(lang.clone(box), this.zoom, this.zoom)
	}



	cleanUp() {
		this.logger.log(4, "cleanUp", "enter");
		this.hideBoxes();
		for (let id in this._linesDivs) {
			let div = this._linesDivs[id];
			if (div && div.parentNode) {
				div.parentNode.removeChild(div);
			}
		}

		if (this.dimDiv && this.dimDiv.parentNode) {
			this.dimDiv.parentNode.removeChild(this.dimDiv);
		}

		this.cleanupDistanceLines();
		this.cleanupDistributionLines();

		this._linesDivs = {};
		this._linesX = {};
		this._linesY = {};
		this._linesYMiddle = {};
		this._linesXMiddle = {};
		delete this._distanceYDiv;
		delete this._distanceXDiv;
		delete this.distributionLines;
		delete this.dimDiv;
		this.logger.log(4, "cleanUp", "exit");
	}
}