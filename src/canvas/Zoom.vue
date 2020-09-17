
<script>
import on from 'dojo/on'
import lang from 'dojo/_base/lang'
// import touch from 'dojo/touch'
import win from 'dojo/win'
import has from 'dojo/has'


export default {
    name: 'Zoom',
    mixins:[],
    data: function () {
        return {
            zoom: 0.5,
            lastMouseWheel: 0,
            mouseZoomEnabled: true,
            mouseWheelMode: "scroll",
            zoomWithCSS: false,
            zoomLevels: [0.05, 0.1, 0.25, 0.5, 0.75, 1.0, 2],
            zoomLevelPos: 3,
            zoomAnimationRunning: false
        }
    },
	components: {},
	computed: {
		_zoom () {
			return this.zoom
		}
	},
    methods: {
		initZoom (){
			//this.own(on(this.zoomMinus, touch.press, lang.hitch(this, "onClickMinus")));
			//this.own(on(this.zoomPlus, touch.press, lang.hitch(this, "onClickPlus")));
			var eventType = this.getEventType();
			this.own(on(this.domNode, eventType, lang.hitch(this,"onMouseWheel")));
			this.onZoomChange();
			this.logger.log(2,"initZoom", "exit >  "+ eventType);
		},


		getZoomFactor (){
			return this.zoom;
		},

		setZoomFactor (zoom){
			this.zoomLevelPos = this.zoomLevels.findIndex(x => x === zoom)
			this._setCenterPos();
			this.zoom = zoom
			this.onZoomChange();
		},

		zoomOut (animate){
			this.zoomLevelPos = 0;
			this.zoom = this.zoomLevels[this.zoomLevelPos];
			this.onZoomChange(true, animate);
		},

		zoomIn (animate){
			this.zoomLevelPos = this.zoomLevels.length-2;
			this.zoom = this.zoomLevels[this.zoomLevelPos];
			this.onZoomChange(true, animate);
		},

		zoomHalf (animate){
			this.zoomLevelPos = (this.zoomLevels.length / 2) -1;
			this.zoom = this.zoomLevels[this.zoomLevelPos];
			this.onZoomChange(true, animate);
		},

		enableMouseZoom (e){
			this.mouseZoomEnabled = e;
		},


		onMouseWheel (e){

			var dir = e.wheelDelta ? e.wheelDelta : e.detail;
			if(!this.mouseZoomEnabled || dir==0){
				return;
			}

			var delta = this.getNormalizedDelatFB(e);


			this.stopEvent(e);

			var now = new Date().getTime();
			if(this.mouseWheelMode=="zoom" || e.metaKey || e.ctrlKey){

				/**
				 * FIXME: Use the spin property of the delta event to surpress small
				 * events on trackpad?
				 */
				if(Math.abs(this.lastMouseWheel -now) > 200 ){

					if(!this.zoomAnimationRunning){
						/**
						 * Put canvas at the right space. Mouse should be over the same element again,
						 * so we save the position relative!
						 */
						this._preZoomRelPos = this.getRelCanvasMousePosition(e);
						this._preZoomAbsPos = this.getCanvasMousePosition(e);

						if(dir < 0){
							this.onZoomMinus(e);
						} else {
							this.onZoomPlus(e);
						}
					} else {
						/**
						 * we could somehow to update the running animation...
						 */
						this.logger.log(3,"onMouseWheel", "exit > Zoom Request refused! Animation Running...");
					}

					this.lastMouseWheel = now;
				}

			} else {
				if(Math.abs(this.lastMouseWheel -now) > 1 ){
					this.canvasPos.y -= Math.round(delta.pixelY / 2);
					if(delta.pixelX){
						this.canvasPos.x -= Math.round(delta.pixelX / 2);
					}
					this.setContainerPos()
					this.lastMouseWheel = now;
				}
			}

		},


		getNormalizedDelta (e){
			var delta ={x:0,y:0};
			var o = e;
			var d = o.detail;
			var w = o.wheelDelta;
			var n = 225;
			var n1 = n-1;
			/**
			* FIXME: F was not defined
				*/
			let f = 1

				// Normalize delta
				d = d ? w && (f = w/d) ? d/f : -d/1.35 : w/120;
				// Quadratic scale if |d| > 1
				d = d < 1 ? d < -1 ? (-Math.pow(d, 2) - n1) / n : d : (Math.pow(d, 2) + n1) / n;
				// Delta *should* not be greater than 2...

			delta.y = Math.min(Math.max(d / 2, -1), 1);

			return delta;
		},

		getNormalizedDelatFB (event){
			// Reasonable defaults
			var PIXEL_STEP  = 10;
			var LINE_HEIGHT = 40;
			var PAGE_HEIGHT = 800;

			var sX = 0, sY = 0,       // spinX, spinY
							pX = 0, pY = 0;       // pixelX, pixelY

				// Legacy
				if ('detail'      in event) { sY = event.detail; }
				if ('wheelDelta'  in event) { sY = -event.wheelDelta / 120; }
				if ('wheelDeltaY' in event) { sY = -event.wheelDeltaY / 120; }
				if ('wheelDeltaX' in event) { sX = -event.wheelDeltaX / 120; }

				// side scrolling on FF with DOMMouseScroll
				if ( 'axis' in event && event.axis === event.HORIZONTAL_AXIS ) {
					sX = sY;
					sY = 0;
				}

				pX = sX * PIXEL_STEP;
				pY = sY * PIXEL_STEP;

				if ('deltaY' in event) { pY = event.deltaY; }
				if ('deltaX' in event) { pX = event.deltaX; }

				if ((pX || pY) && event.deltaMode) {
					if (event.deltaMode == 1) {          // delta in LINE units
						pX *= LINE_HEIGHT;
						pY *= LINE_HEIGHT;
					} else {                             // delta in PAGE units
						pX *= PAGE_HEIGHT;
						pY *= PAGE_HEIGHT;
					}
				}

				// Fall-back if spin cannot be determined
				if (pX && !sX) { sX = (pX < 1) ? -1 : 1; }
				if (pY && !sY) { sY = (pY < 1) ? -1 : 1; }

				return { spinX  : sX,
								spinY  : sY,
								pixelX : pX,
								pixelY : pY };

		},

		getEventType : function(){
			if(has("ff")){
				return "DOMMouseScroll";
			} else {
				return "wheel";
			}
		},

		_setCenterPos (){
			/**
			 * In case we have an selected element make zoom
			 * like the mouse was over it. making sure it stay in the focus.
			 */
			if(this._resizeHandlerBox){
				this._setCenterPosByBox(this._resizeHandlerBox);

			} else {

				var winBox = win.getBox();
				var y = (winBox.h/2) + this.canvasPos.y*-1;
				var x = (winBox.w/2) + this.canvasPos.x*-1;

				this._preZoomAbsPos = {
					y : y,
					x : x
				};
				this._preZoomRelPos ={
					y : y / this.getZoomed(this.canvasPos.h, this.zoom),
					x : x /this.getZoomed(this.canvasPos.w, this.zoom)
				};


			}

		},

		_setCenterPosByBox (box){
			var y = box.y + box.h/2;
			var x = box.x + box.w/2
			this._preZoomAbsPos = {
					y : y,
					x : x
			};
			this._preZoomRelPos ={
				y : y / this.getZoomed(this.canvasPos.h, this.zoom),
				x : x /this.getZoomed(this.canvasPos.w, this.zoom)
			};


		},

		onClickMinus (e){
			this._setCenterPos();
			this.onZoomMinus(e);
		},


		onClickPlus (e){
			this._setCenterPos();
			this.onZoomPlus(e);
		},

		onZoomMinus (e){
			this.stopEvent(e);

			if(!this.zoomAnimationRunning){
				if(this.zoomLevelPos >= 1){
					this.zoomLevelPos--;
					this.zoom = this.zoomLevels[this.zoomLevelPos];
				} else {
					this.showHint("You cannot zoom more");
				}
				this.onZoomChange();
			} else {
				this.logger.log(3,"onZoomMinus", "exit > Zoom Request refused! Animation Running...");
			}
		},

		onZoomPlus (e){
			this.stopEvent(e);

			if(!this.zoomAnimationRunning){
				if(this.zoomLevelPos < this.zoomLevels.length -1){
					this.zoomLevelPos++;
					this.zoom = this.zoomLevels[this.zoomLevelPos];
				} else {
					this.showHint("You cannot zoom more");
				}
				this.onZoomChange();
			} else {
				this.logger.log(3,"onZoomMinus", "exit > Zoom Request refused! Animation Running...");
			}

		},

		onZoomChange (forceRender, animate){

			if (this.zoom != this._lastZoom || forceRender){
				this.logger.log(2,"onZoomChange", "entry >" + this.zoom + "00% > animate : " + animate);
				this.onChangeCanvasViewConfig()
				if(this.controller){
					this.controller.render(null, true);
				}
			}
			this._lastZoom = this.zoom;
		},

		cleanUpZoom (){
			if(this.container){
				// css.remove(this.container, "MatcCanvasContainerAnimate");
			} else {
				this.logger.sendError(new Error("Could not cleanUpZoom. Container is null"));
			}
		},

		setZoomedContainerPosition (){
			if(	this._preZoomRelPos ){
				this.logger.log(3,"setZoomedContainerPosition", "entry >" + this.zoom + "00%");

				/**
				 * Assume mouse has not moved nor the container.
				 *
				 */
				var x = this._preZoomRelPos.x  *this.getZoomed(this.canvasPos.w, this.zoom);
				var y = this._preZoomRelPos.y  *this.getZoomed(this.canvasPos.h, this.zoom);

				var difX = Math.round(this._preZoomAbsPos.x - x);
				var difY = Math.round(this._preZoomAbsPos.y - y);

				this.canvasPos.x += difX;
				this.canvasPos.y += difY;

				this.setContainerPos();
			}
			delete this._preZoomRelPos;
			delete this._preZoomAbsPos;
		}
	},
	mounted () {
	}
}
</script>