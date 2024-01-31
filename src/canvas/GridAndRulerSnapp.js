import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import topic from 'dojo/topic'
import Logger from 'common/Logger'
import Core from 'core/Core'
import * as SnappUtil from 'core/SnappUtil'
import ModelUtil from '../core/ModelUtil'

export default class GridAndRulerSnapp extends Core {

	constructor() {
		super()
		this.logger = new Logger('GridAndRulerSnapp');
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
		this.isDebug = location.href.indexOf('debug=true') >= 0
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
		 * 1.a) If no screen, no snapping...
		 */
		 if (!this._lastScreen) {
			return absPos;
		}

		/**
		 * 2) No determine the direction of move... We buffer
		 * the last directions to make the thing less jumpy...
		 */
		this.updateMovements(absPos);
		let left = this.getMovementDir(this.xMovements);
		let top = this.getMovementDir(this.yMovements);
 
		const showDistanceXLeft = left
		const showDistanceYTop = top

	 
		/**
		 * Since 3.0.43 we snapp grid on top left corner
		 * 
		 * Since 4.1.24 we allow to snapp to the screen bottom
		 * or right corner
		 */
		if (this.snapGridOnlyToTopLeft && this.grid.enabled) {

			left = true
			top = true
		
			if (this._lastScreen && !showDistanceXLeft) {
				const screenRight = this._lastScreen.x + this._lastScreen.w
				const posRight = absPos.x + absPos.w
				if (Math.abs(screenRight - posRight) < this.snappDistance) {
					left = false
				}
			}

			if (this._lastScreen && !showDistanceYTop) {
				const screenBottom = this._lastScreen.y + this._lastScreen.h
				const posBottom = absPos.y + absPos.h
				if (Math.abs(screenBottom - posBottom) < this.snappDistance) {
					top = false
				}
			}

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
		if (e.ctrlKey || e.metaKey) {
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
		 * now compare all lines. For grid we just take to top left corner
		 */
		const corners = this.getCorners(absPos, this.grid.enabled);
		const closeXLine = SnappUtil.getCloseLines(this.showDistance, this._linesX, "x", corners.x, false, 'corner');
		const closeYLine = SnappUtil.getCloseLines(this.showDistance, this._linesY, "y", corners.y, false, 'corner');

	
		/**
		 * Since 4.3.0 we include for none grid both sides. We have
		 * to correct left and top, to make the snapping work in the controller
		 * 
		 * Since 4.3.11 we also do this in case of the grid, we removed
		 * if (!this.grid.enabled) {
		 */
		//if (!this.grid.enabled) {
		left = SnappUtil.correctSnappDirection(closeXLine, left)
		top = SnappUtil.correctSnappDirection(closeYLine, top)	
		//}

		/**
		 * Get close middle lines. We handle this a little special:
		 *
		 * 1) We ignore grid lines
		 *
		 * 2) New in 0.9973 => We just compare middle with middle!!
		 * 
		 * 3) Since 4.1.24 we do not snapp to the middle of the grid is enabled
		 *
		 */
		let closeXMiddle = null
		let closeYMiddle = null
		if (!this.grid.enabled) {
			closeXMiddle = SnappUtil.getCloseLines(this.showDistance, this._linesXMiddle, "x", corners.mx, "Grid", 'middle');
			closeYMiddle = SnappUtil.getCloseLines(this.showDistance, this._linesYMiddle, "y", corners.my, "Grid", 'middle');
		}


		/**
		 * Get patterns and create *virtual* lines (that are no rendered)
		 *
		 * Since 3.0.17 we do not do pattern matching if we snapp to the grid
		 */
		let closeXPattern = null
		let closeYPattern = null
		if (!this.grid.enabled) {
			let linesPattern = this.renderOverLapDistance(absPos, top, left);
			closeXPattern = SnappUtil.getCloseLines(this.showDistance, linesPattern.x, "x", corners.l, false, 'pattern');
			closeYPattern = SnappUtil.getCloseLines(this.showDistance, linesPattern.y, "y", corners.t, false, 'pattern');
		}

		/**
		 * Hide all lines
		 */
		this.hideLines();
		this.hideBoxes();


		/**
		 * Now show lines to snapp to
		 */
		absPos.snapp = {
			type: this.activePoint,
			left: left,
			top: top
		};

		/**
		 * Determine which lines to snapp too and correct X and Y values
		 */
		const diff = {x: 0, y: 0};
		const minLineX = SnappUtil.getMinLine([closeXLine, closeXMiddle, closeXPattern])
		if (minLineX) {			
			this.correctX(absPos, diff, minLineX);
		}
		const minLineY = SnappUtil.getMinLine([closeYLine, closeYPattern, closeYMiddle])
		if (minLineY) {			
			this.correctY(absPos, diff, minLineY);
		}

		SnappUtil.snapp(absPos, diff, this.activePoint);

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

		this.renderSnappLines(absPos)

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

	renderSnappLines (pos) {
		if (this.activePoint !== 'All') {
			return
		}

		if (this.grid.enabled) {
			return
		}

		const x1 = 'x' + pos.x
		const x2 = 'x' + (pos.x + pos.w)
		const y1 = 'y' + pos.y
		const y2 = 'y' + (pos.y + pos.h)


		if (this._linesX[x1]) {
			this.showLine(this._linesX[x1], 'x', true)
		}
		if (this._linesX[x2]) {
			this.showLine(this._linesX[x2], 'x', true)
		}
		if (this._linesY[y1]) {
			this.showLine(this._linesY[y1], 'y', true)
		}
		if (this._linesY[y2]) {
			this.showLine(this._linesY[y2], 'y', true)
		}
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
	 * Snapping Distance
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
		const scrn = this.getParentScreen(widget);
		if (scrn) {
			this.renderBoxDistance(widget, scrn);
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
			case "c":
				{
					const top = from.y - to.y;
					const lblTop = sourceFrom.y - sourceTo.y
					this._renderDistanceLineY(from.x + from.w/2, to.y , top, lblTop);

					const bottom = (to.y + to.h) - (from.y + from.h) ;
					const lblBottom = (sourceTo.y + sourceTo.h) - (sourceFrom.y + sourceFrom.h);
					this._renderDistanceLineY(from.x + from.w/2, from.y + from.h , bottom, lblBottom);
			
					const left = from.x - to.x;
					const lblLeft = sourceFrom.x - sourceTo.x
					this._renderDistanceLineX(to.x, from.y + from.h / 2, left, lblLeft);
		
					const right = (to.x + to.w) - (from.x + from.w);
					const lblRight = (sourceTo.x + sourceTo.w) - (sourceFrom.x + sourceFrom.w);
					this._renderDistanceLineX(from.x + from.w, from.y + from.h / 2, right, lblRight);
		
					break;
				}

			case "n":
				{
					let top = from.y - to.y - to.h;
					let lblTop = sourceFrom.y - sourceTo.y - sourceTo.h;
					let xMiddle = SnappUtil.getOverlayXMiddle(from, to);
					this._renderDistanceLineY(xMiddle, to.y + to.h, top, lblTop);
					break;
				}

			case "s":
				{
					let top = to.y - from.y - from.h;
					let lblTop = sourceTo.y - sourceFrom.y - sourceFrom.h;
					let xMiddle = SnappUtil.getOverlayXMiddle(from, to);
					this._renderDistanceLineY(xMiddle, from.y + from.h, top, lblTop);
					break;
				}

			case "w":
				{
					let left = from.x - to.x - to.w;
					let lbl = sourceFrom.x - sourceTo.x - sourceTo.w;
					let yMiddle = SnappUtil.getOverlayYMiddle(from, to);
					this._renderDistanceLineX(to.x + to.w, yMiddle, left, lbl);
					break;
				}


			case "e":
				{
					let left = to.x - from.x - from.w;
					let lbl = sourceTo.x - sourceFrom.x - sourceFrom.w;
					let yMiddle = SnappUtil.getOverlayYMiddle(from, to);
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
	 * Get all boxes that are somehow similar. If the number is to small,
	 * we return all boxes
	 */
	getSimilarBoxes(selectedBox, boxes) {
		let simBoxes = [];
		if (selectedBox) {
			for (let i = 0; i < boxes.length; i++) {
				const box = boxes[i];
				simBoxes.push(box);				
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
		xBoxes.sort((a, b) => {
			return (a.y) - (b.y);
		});


		
		/**
		 * FIXME: why not take the entire design??
		 */
		const simBoxes = xBoxes; //this.getSimilarBoxes(this.selectedModel, xBoxes);

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
				const xMiddle = SnappUtil.getOverlayXMiddle(from, topBox);
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
					const line = lines[i]
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

		const simBoxes = yBoxes

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
				let YMiddle = SnappUtil.getOverlayYMiddle(from, rightBox);
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
		const minCount = this.getSnappLineMinCount(simBoxes.length)
		for (let key in result) {
			if (result[key].count > minCount) {
				const lines = result[key].lines;
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i]
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
			let useSourceLabel = false
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
						let yMiddle = SnappUtil.getOverlayYMiddle(from, to);
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
						let yMiddle = SnappUtil.getOverlayYMiddle(from, to);
						this._renderDistanceLineX(from.x + from.w, yMiddle, distance, lbl, "", true);
					}
				}

				if (top || disTop < disBottom) {
					if (overlaps.minTop && disTop) {
						let from = overlaps.minTop.from;
						let to = overlaps.minTop.to;
						let distance = overlaps.minTop.distance;
						let lbl = this.getDistanceLabel(overlaps.minTop, useSourceLabel, 'y', 'top')
						let xMiddle = SnappUtil.getOverlayXMiddle(from, to);
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
						let xMiddle = SnappUtil.getOverlayXMiddle(from, to);
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
				let xMiddle = SnappUtil.getOverlayXMiddle(from, to);
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
				let xMiddle = SnappUtil.getOverlayXMiddle(from, to);
				this._renderDistanceLineY(xMiddle, from.y + from.h, distance, lbl, "", true);
			}
			if (isLeftHandle && overlaps.minLeft) {
				let from = overlaps.minLeft.from;
				let to = overlaps.minLeft.to;
				let distance = overlaps.minLeft.distance;
				let lbl = this.getDistanceLabel(overlaps.minLeft, useSourceLabel, 'x', 'left')
				let yMiddle = SnappUtil.getOverlayYMiddle(from, to);
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
				let yMiddle = SnappUtil.getOverlayYMiddle(from, to);
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
	
		const snappDistance = this.getSnappDictance()
		this.showLine(closeXLine, "x");
		if (Math.abs(closeXLine.dist) < snappDistance) {
			diff.x = closeXLine.dist;
			absPos.snapp.x = closeXLine.snapp;
		}
	}

	correctY(absPos, diff, closeYLine) {
		const snappDistance = this.getSnappDictance()
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

	getCorners(pos, isGrid) {

		const corners = {
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

				/**
				 * Since 4.3.0 we include for none grid both sides
				 */
				if (isGrid) {				
					corners.x.push(pos.x);
					corners.y.push(pos.y);

					if (!this.snapGridOnlyToTopLeft) {
						corners.x.push(pos.x + pos.w)
						corners.y.push(pos.y + pos.h);
					}
		
				} else {
					corners.x.push(pos.x);
					corners.x.push(pos.x + pos.w)
					corners.y.push(pos.y);
					corners.y.push(pos.y + pos.h);
				}


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






	initLines(absPos) {
		const screen = this.getHoverScreen(absPos);
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

			this.removeCloseLines()

			this.renderLines();

			this.initDebuglines()
		}
		this._lastScreen = screen;
		this._initLinesCalled += 1
	}

	removeCloseLines () {
		// remove here to close lines???
		// for (let id in this._linesX) {
		// 	let line = this._linesX[id]
		// }
		// for (let id in this._linesY) {
		// 	this.renderLine(this._linesY[id], id);
		// }
		// for (let id in this._linesXMiddle) {
		// 	this.renderLine(this._linesXMiddle[id], id, 'MatcRulerLineMiddle');
		// }
		// for (let id in this._linesYMiddle) {
		// 	this.renderLine(this._linesYMiddle[id], id, 'MatcRulerLineMiddle');
		// }
	}

	initDebuglines () {
		if (this.isDebug) {
			css.add(this.container, 'MatcRulerLineDebuger')			
		}
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
		const selectedGroup = this.getParentGroup(this.selectedID)
		if (selectedGroup && !this.ignoreGroup) {
			for (let i = 0; i < selectedGroup.children.length; i++) {
				ignore[selectedGroup.children[i]] = true
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
			const id = screen.children[i]
			if (!ignore[id]) {
				const group = this.getParentGroup(id)
				if (group && group.id !== selectedGroup?.id) {
					this.addGroupLines(group)
					const groupChildren = group.children
					for (let j = 0; j < groupChildren.length; j++) {
						const groupChildID = groupChildren[j]
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
			// we could calculate the distance and check that its close???
			if ((Math.abs(box.w - this.selectedModel.w) < 10) || Math.abs(box.h - this.selectedModel.h) < 10) {
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


				const columnCount = this.grid.columnCount;
				const columnOffset = (this.zoom * this.grid.columnOffset);
				const columnGutter = (this.zoom * this.grid.columnGutter);
				const columnWidth = (this.zoom * this.grid.columnWidth);


				let lastX = columnOffset;
				let count = 0;
				for (let i = 0; i < columnCount; i++) {
					this.addXLine(Math.round(screen.x + lastX), {
						id: screen.id,
						pos: "x",
						line: count,
						type: "Grid",
						_v: screen.x + lastX,
						column: true
					}, "Grid");
					count++;
					let x = lastX + columnWidth;
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

					/**
					 * Since 4.4.3 we add bottom line.
					 */
					if (this.snapGridOnlyToTopLeft) {
						const w = this.selectedModel.w
						const x = screen.x + screen.w - w
						this.addXLine(Math.round(x), {
							id: screen.id,
							pos: "x",
							_v: x,
							line: -1, // This is the magic key!!! Check Snapp.js
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

					/**
					 * Since 4.4.3 we add bottom line.
					 */
					if (this.snapGridOnlyToTopLeft) {
						const h = this.selectedModel.h
						const y = (screen.y + screen.h) - h
						this.addYLine(Math.round(y), {
							id: screen.id,
							pos: "y",
							line: -1, // This is the magic key!!! Check Snapp.js
							_v: y,
							type: "Grid"
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
			}, type, box, 0);
			this.addXLine(box.x + box.w, {
				id: box.id,
				type: type,
				pos: "right",
				_sourceV: sourceBox.x + sourceBox.w
			}, type, box, -1);
		}
		if (addY) {
			this.addYLine(box.y, {
				id: box.id,
				type: type,
				pos: "top",
				_sourceV: sourceBox.y
			}, type, box, 0);
			this.addYLine(box.y + box.h, {
				id: box.id,
				type: type,
				pos: "bottom",
				_sourceV: sourceBox.y + sourceBox.h
			}, type, box, -1);
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

	addXLine(x, snapp, type, box, offset=0) {
		if (!this._linesX["x" + x]) {
			this._linesX["x" + x] = {
				x: x,
				type: type,
				visible: false,
				id: "x" + x,
				snapp: snapp,
				count: 0,
				offset: offset,
				boxes: []
			};
		}
		this._linesX["x" + x].count++;
		if (box) {
			this._linesX["x" + x].boxes.push(box.id);
		}
	}

	addYLine(y, snapp, type, box, offset = 0) {
		if (!this._linesY["y" + y]) {
			this._linesY["y" + y] = {
				y: y,
				type: type,
				visible: false,
				id: "y" + y,
				snapp: snapp,
				count: 0,
				offset: offset,
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
				offset:0,
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
				offset:0,
				count: 0,
				boxes: []
			};
		}
		this._linesYMiddle["y" + y].count++;
		if (box) {
			this._linesYMiddle["y" + y].boxes.push(box.id);
		}
	}

	showLine(line, direction, forceHighlight = false) {

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
				if (forceHighlight || Math.abs(line.dist) < snappDistance) {
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
			//console.debug('render Miggle', this._linesXMiddle[id])
			this.renderLine(this._linesXMiddle[id], id, 'MatcRulerLineMiddle');
		}
		for (let id in this._linesYMiddle) {
			this.renderLine(this._linesYMiddle[id], id, 'MatcRulerLineMiddle');
		}
	}


	renderLine(line, id, middle = '') {

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
				css.add(div, "MatcRulerLine MatcRulerLineHidden MatcRulerLine" + line.type + ' ' + middle);
				if (line.snapp) {
					css.add(div, "MatcRulerLineSnapp" + line.snapp.pos);
				}
				div.style.width = "1px";
				div.style.height = "100%";
				div.style.left = (line.x + line.offset) + "px";
				div.style.top = "0px";
				this.container.appendChild(div);
				this._linesDivs[id] = div;
			}


			if (line.y) {
				let div = document.createElement("div");
				css.add(div, "MatcRulerLine MatcRulerLineHidden MatcRulerLine" + line.type + ' ' + middle);
				if (line.snapp) {
					css.add(div, "MatcRulerLineSnapp" + line.snapp.pos);
				}
				div.style.height = "1px";
				div.style.width = "100%";
				div.style.top = (line.y + line.offset) + "px";
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

	cleanUpDebugLines () {
		if (this.isDebug) {
			css.remove(this.container, 'MatcRulerLineDebuger')			
		}
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
		this.cleanUpDebugLines();

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