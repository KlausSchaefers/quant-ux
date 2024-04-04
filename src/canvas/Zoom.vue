
<script>
import on from 'dojo/on'
import win from 'dojo/win'
import has from 'dojo/has'
import ZoomSessionHandler from 'canvas/ZoomSessionHandler'

export default {
    name: 'Zoom',
    mixins:[],
    data: function () {
        return {
			zoomStep: 0.05,
			isFireFox: false,
			zoom: 1.0,
			lastMouseWheel: 0,
			mouseZoomEnabled: true,
			mouseWheelMode: "scroll",
			zoomWithCSS: false,
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
			var eventType = this.getEventType();
			if (!this.zoomSessionHandler) {
				this.zoomSessionHandler = new ZoomSessionHandler(this.zoom, [0.25, 0.5, 0.75, 1, 1.5, 2])
			}
			this.own(on(this.domNode, eventType, e => this.onMouseWheel(e)));
			this.onZoomChange();
			this.logger.log(2,"initZoom", "exit >  "+ eventType);
		},

		setSettingZoomSnap (active) {
			this.logger.log(2,"setSettingZoomSnap", "enter >  "+ active);
			if (active) {
				this.zoomSessionHandler = new ZoomSessionHandler(this.zoom, [0.25, 0.5, 0.75, 1, 1.5, 2])
			} else {
				this.zoomSessionHandler = new ZoomSessionHandler(this.zoom, [])
			}
		},
		getZoomFactor () {
			return this.zoom;
		},

		setZoomFactor (zoom){
			this._setCenterPos();
			this.zoom = zoom
			this.zoomSessionHandler.setZoom(zoom)
			this.onZoomChange();
		},

		enableMouseZoom (e){
			this.mouseZoomEnabled = e;
		},


		onMouseWheel (e){
			var dir = this.getWheelDir(e)
			var delta = this.getNormalizedDeltaFB(e);

			if(!this.mouseZoomEnabled || dir === 0) {
				return;
			}

			this.stopEvent(e);

			const now = new Date().getTime();
			if(e.metaKey || e.ctrlKey) {
				if (Math.abs(this.lastMouseWheel -  now) > 5) {

					this._preZoomRelPos = this.getRelCanvasMousePosition(e)
					this._preZoomAbsPos = this.getCanvasMousePosition(e);

					if (dir < 0){
						this.onZoomMinus(e, delta.pixelY);
					} else {
						this.onZoomPlus(e, delta.pixelY);
					}
					this.lastMouseWheel = now;
				}

			} else {
				if (Math.abs(this.lastMouseWheel - now) > 1 ){
					this.canvasPos.y -= Math.round(delta.pixelY / 2);
					if(delta.pixelX){
						this.canvasPos.x -= Math.round(delta.pixelX / 2);
					}
					this.setContainerPos()
					this.lastMouseWheel = now;
				}
			}
		},

		getWheelDir (e) {
			let dir = e.wheelDelta ? e.wheelDelta : e.detail;
			/**
			 * Flip direction in FireFox
			 */
			if (this.isFireFox) {
				dir *= -1
			}
			return dir
		},

		getEventType () {
			/**
			 * In FireFox we have to use the MouseScroll. If we use 'wheel' we cannot
			 * stop the CTRL + WHEEL and browser zooming get's triggered.
			 * Attention: FireFox will return 'flipped' wheel events.
			 */
			if (has("ff")) {
				this.isFireFox = true
				return "DOMMouseScroll";
			} else {
				return "wheel";
			}
		},

		onClickMinus (){
			this._setCenterPos();
			this.zoom = Math.round((this.zoom - 0.05) * 100)
			this.zoom -= this.zoom % 5
			this.zoom = Math.max(2, this.zoom)
			this.zoom /= 100
			this.onZoomChange();
		},

		onClickPlus (){
			this._setCenterPos();
			this.zoom = Math.round((this.zoom + 0.05) * 100)
			this.zoom -= this.zoom % 5
			this.zoom /= 100
			this.onZoomChange();
		},

		onZoomMinus (e, speed = 1){
			this.stopEvent(e);
			this.zoom = this.zoomSessionHandler.minus(speed)
			this.onZoomChange();
		},

		onZoomPlus (e, speed = 1){
			this.stopEvent(e);
			this.zoom = this.zoomSessionHandler.plus(speed)
			this.onZoomChange();
		},

		onZoomChange (forceRender) {
			if (this.zoom != this._lastZoom || forceRender){
				this.onChangeCanvasViewConfig()
				// put this into a reuqestNaimationFraem
				this.setZoomedContainerPosition()
				this.renderZoom()
			}
			this._lastZoom = this.zoom;
			this.onViewportChange()
		},


		cleanUpZoom () {
		},

		setZoomedContainerPosition (){
			if(	this._preZoomRelPos ){
				var x = this._preZoomRelPos.x  * this.getZoomed(this.canvasPos.w, this.zoom);
				var y = this._preZoomRelPos.y  * this.getZoomed(this.canvasPos.h, this.zoom);
				var difX = Math.round(this._preZoomAbsPos.x - x);
				var difY = Math.round(this._preZoomAbsPos.y - y);
				this.canvasPos.x += difX;
				this.canvasPos.y += difY;
			}
			delete this._preZoomRelPos;
			delete this._preZoomAbsPos;
		},

		_setCenterPos (){
			/**
			 * In case we have an selected element make zoom
			 * like the mouse was over it. making sure it stay in the focus.
			 */
			if(this._resizeHandlerBox){
				this._setCenterPosByBox(this._resizeHandlerBox);
			} else {
				var winBox = win.getBox()
				var y = (winBox.h/2) + this.canvasPos.y * -1
				var x = (winBox.w/2) + this.canvasPos.x * -1
				this._preZoomAbsPos = {
					y : y,
					x : x
				}
				this._preZoomRelPos = {
					y : y / this.getZoomed(this.canvasPos.h, this.zoom),
					x : x /this.getZoomed(this.canvasPos.w, this.zoom)
				}
			}
		},

		_setCenterPosByBox (box){
			var y = box.y + box.h / 2
			var x = box.x + box.w / 2
			this._preZoomAbsPos = {
					y : y,
					x : x
			}
			this._preZoomRelPos ={
				y : y / this.getZoomed(this.canvasPos.h, this.zoom),
				x : x /this.getZoomed(this.canvasPos.w, this.zoom)
			}
		},



		getNormalizedDeltaFB (event){
			// Reasonable defaults
			var PIXEL_STEP  = 10;
			var LINE_HEIGHT = 40;
			var PAGE_HEIGHT = 800;

			var sX = 0, sY = 0, pX = 0, pY = 0;

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
				if (event.deltaMode === 1) {          // delta in LINE units
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

		}
	},
	mounted () {
	}
}
</script>