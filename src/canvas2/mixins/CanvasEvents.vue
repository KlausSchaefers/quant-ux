
<template>
     <div class="MatcToolbar">

		</div>

</template>
<script>

import Logger from 'core/Logger'
import DomUtil from 'core/DomUtil'
import win from 'dojo/win'

export default {
  name: 'CanvasEvents',
  data: function () {
    return {
      mouseZoomEnabled: true,
      lastMouseWheel: 0,
      zoomDelay: 50,
      canvasPos: {
        x: 100,
        y: 100,
        w: 16000,
        h: 8000
      },
    }
  },
  methods: {
    onCanvasMouseDown (e) {
      Logger.log(-1, 'CanvasMixin.onCanvasMouseDown', e)
    },
    onWidgetMouseDown (e) {
      Logger.log(-1, 'CanvasMixin.onWidgetMouseDown', e)
    },
    onScreenMouseDown (e) {
      Logger.log(-1, 'CanvasMixin.onScreenMouseDown', e)
    },
    onMouseWheel (e) {
      Logger.log(5, 'CanvasMixin.onMouseWheel')

      var dir = e.wheelDelta ? e.wheelDelta : e.detail;


      var delta = this.getNormalizedDelatFB(e);
      DomUtil.stopEvent(e);



			var now = new Date().getTime();
			if (this.mouseWheelMode === 'zoom' || e.metaKey || e.ctrlKey) {

				/**
				 * FIXME: Move into tool
				 */
				if (Math.abs(this.lastMouseWheel - now) > this.zoomDelay ){
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


					this.lastMouseWheel = now;
				}

			} else {
				if (Math.abs(this.lastMouseWheel - now) > 1 ){
					this.canvasPos.y -= Math.round(delta.pixelY / 2);
					if(delta.pixelX){
						this.canvasPos.x -= Math.round(delta.pixelX / 2);
          }
					this.lastMouseWheel = now;
				}
			}
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
			DomUtil.stopEvent(e);

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
			DomUtil.stopEvent(e);

			if(!this.zoomAnimationRunning){
				if(this.zoomLevelPos < this.zoomLevels.length -1){
					this.zoomLevelPos++;
					this.zoom = this.zoomLevels[this.zoomLevelPos];
				} else {
					// this.showHint("You cannot zoom more");
				}
				this.onZoomChange();
			} else {
				Logger.log(3,"onZoomMinus", "exit > Zoom Request refused! Animation Running...");
			}

		},

		onZoomChange (forceRender, animate){
			if(this.zoom != this._lastZoom || forceRender){
				Logger.log(2,"onZoomChange", "entry >" + this.zoom + "00% > animate : " + animate);
        this.onChangeCanvasViewConfig()
        this.render()
			}
			this._lastZoom = this.zoom;
		},
  }
}
</script>