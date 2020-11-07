<template>
  <div></div>
</template>
<script>
import domGeom from "dojo/domGeom";
import Services from "services/Services";

export default {
  name: "MouseMixin",
  methods: {
    onWidgetMouse(e, clicked) {
      if (this.logMouse) {
        var pos = this.getMouse(e);
        var now = new Date().getTime();

        /**
         * Widget events we sample with a higher precision,
         * as otherwise the animations get bumpy
         */
        if (now - this.lastMouse > this.mouseSampleRate) {
          this.initMouseEvent(this.mouseSampleRate);
          this._mouseMoveEvent.x.push(pos.x);
          this._mouseMoveEvent.y.push(pos.y);
          this._mouseMoveEvent.c.push(clicked);
          this._mouseMoveEvent.t.push(now);
          this.flushMouse();
          this.lastMouse = now;
        }
      }
    },

    onMouseWheel(e) {
      this.onMouseMove(e);
    },

    onMouseMove(e) {
      if (this.logMouse) {
        var pos = this.getMouse(e);
        var now = new Date().getTime();
        /**
         * Sample rate 200ms. the rest will be interpolated in the
         * browser via css animations... Anyhow store the sample rate
         * so we adapt later in the browser
         */
        if (now - this.lastMouse > this.mouseSampleRate) {
          this.initMouseEvent(this.mouseSampleRate);

          this._mouseMoveEvent.x.push(pos.x);
          this._mouseMoveEvent.y.push(pos.y);
          this._mouseMoveEvent.c.push(0);
          this._mouseMoveEvent.t.push(now);

          this.flushMouse();

          this.lastMouse = now;
        }
      }
    },

    initMouseEvent(sampleRate) {
      if (!this._mouseMoveEvent) {
        var user = this.getUser();
        var session = this.getSession();

        this._mouseMoveEvent = {
          x: [],
          y: [],
          c: [],
          t: [],
          user: user,
          session: session,
          screen: this.currentScreen.id,
          sample: sampleRate,
        };

        if (this.currentOverlay) {
          this._mouseMoveEvent.screen = this.currentOverlay.id;
        }
      }
    },

    flushMouse() {
      /**
       * flush only 20 events. Attention this is correlated to the sample rate...
       */
      if (this._mouseMoveEvent && this._mouseMoveEvent.x.length >= 20) {
        this.sendMouse();
      }
    },

    async sendMouse() {
      this.logger.log(3, "sendMouse", "enter");
      if (this._mouseMoveEvent) {
        this.eventCount++;
        if (this.eventCount > this.maxEventCount) {
          console.warn("sendMouse() Too many events");
        }
        if (this.logData && this.hash && this._mouseMoveEvent) {
          let res = await Services.getModelService().saveMouse(
            this.model.id,
            this.hash,
            this._mouseMoveEvent
          );
          this.onMouseSaved(res);
          // this._doPost("rest/invitation/" + this.model.id + "/"+ this.hash + "/mouse.json", this._mouseMoveEvent, "onMouseSaved");
        } else {
          this.logger.log(2, "sendMouse", "enter");
        }
      }
      delete this._mouseMoveEvent;
    },

    onMouseSaved() {},

    getMouse(e, isFixedPosition) {
      if (e && this.currentScreen) {
				var domPos = domGeom.position(this.domNode);
				var pos = this._getMousePosition(e); // use form dojo widget

				/**
				 * Somehow compensate of scrolling. If we have fixed position
				 * ignore the scroll.
				 *
				 * FIXME: This does not work at all!
				 */
				if (!isFixedPosition) {
					var doc = document.documentElement;
					var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
					domPos.y += top;
				} else {
					/**
					 * FIXME: What about the Scroller.js which set the x to negative... we should check that somehow...
					 */
				}

				/**
				 * get pixel position in domNode
				 */
				pos.x -= domPos.x;
				pos.y -= domPos.y;

				/**
				 * make relative to compensate different scalings
				 */
				pos.x = Math.min(1, Math.round((pos.x / this.currentScreen.w) * 1000) / 1000 );
				pos.y = Math.min(1, Math.round((pos.y / this.currentScreen.h) * 1000) / 1000 );
				return pos;
			}
			return { x: -1, y: -1 };
    },
  },
};
</script>