<script>
import DojoWidget from "dojo/DojoWidget";
import on from "dojo/on";
import touch from "dojo/touch";
import lang from "dojo/_base/lang";
import win from "dojo/_base/win";
import _Touch from "common/_Touch";

var gestureLastScroll = 0;

export default {
  name: "Gestures",
  mixins: [_Touch, DojoWidget],
  data: function() {
    return {
      GESTURE_PRESS_MAX_DURATION: 400,
      GESTURE_MIN_DISTANCE: 70,
      GESTURE_ANIM_START_DISTANCE: 70,
      GESTURE_ANIM_END_DISTANCE: 100,
      GESTURE_MAX_DURATION: 1000
    };
  },
  components: {},
  methods: {
    addGestureClickListener (node, clickCallback) {
      var listener = on(node, touch.press, lang.hitch(this, "onGestureClickStart", node, clickCallback));
      return listener;
    },

    onGestureClickStart (node, clickCallback, startEvent) {
      
      /**
       * We do not stop the event, this must be done by the clickCallback
       */
      //this.stopPropagation(startEvent);
      var start = this._getGestureMousePosition(startEvent);
      var releaseListener = null;
      var me = this;
      releaseListener = on(
        this.getGestureRootNode(node),
        touch.release,
        function(e) {
          me.onGestureClickEnd(
            start,
            clickCallback,
            releaseListener,
            startEvent,
            e
          );
        }
      );
      return true;
    },

    onGestureClickEnd (start, clickCallback, releaseListener, startEvent, stopEvent) {
      if (releaseListener) {
        releaseListener.remove();
      } else {
        console.error("onGestureClickEnd() > No relaseListener!");
      }

      /**
       * Oh no, we scrolled in the middle;
       */
      if (start.t < gestureLastScroll) {
        return;
      }

      var stop = this._getGestureMousePosition(stopEvent);
      if (this.isClickGesture(start, stop)) {
        if (clickCallback) {
          clickCallback(startEvent);
        }
      }
      return false;
    },

    /**********************************************************
     * Generic Gesture
     **********************************************************/

    addGestureListener (node, gestureCallback, hasGestures, gestureAnimCallback) {
      //console.debug('Gestures.addGestureListener', node)
      let callback = lang.hitch(this, "onGestureStart", node, gestureCallback, hasGestures, gestureAnimCallback)
      var listener = on(node, touch.press, callback);
      return listener;
    },

    onGestureStart (node, gestureCallback,hasGestures, gestureAnimCallback, startEvent ) {
      //console.debug('Gestures.start', node, startEvent)
      /**
       * We do not stop the event, this must be done by the clickCallback
       */
      this.stopPropagation(startEvent);
      var start = this._getGestureMousePosition(startEvent);
      var releaseListener = null;
      var mouseListener = null;
      var me = this;
      if (hasGestures) {
        mouseListener = this.addTouchMove(this.getGestureRootNode(node), function(e) {
            try {
              if (gestureAnimCallback) {
                var end = me._getGestureMousePosition(e);
                gestureAnimCallback(start, end);
              }
              e.preventDefault();
              e.stopPropagation();
              return false;
            } catch (e) {
              console.error(e);
            }
          }
        );
      }
      releaseListener = on(this.getGestureRootNode(node), touch.release, function(e) {
          me.onGestureEnd(start, gestureCallback, releaseListener, mouseListener, startEvent, e);
      });
      return false;
    },

    onGestureEnd (start, gestureCallback, releaseListener, mouseListener,startEvent, endEvent) {
      if (releaseListener) {
        releaseListener.remove();
      } else {
        console.error("onGestoreEnd() > No relaseListener!");
      }

      if (mouseListener) {
        mouseListener.remove();
      }

      /**
       * Oh no, we scrolled in the middle;
       */
      if (start.t < gestureLastScroll) {
        return;
      }

      if (gestureCallback) {
        var end = this._getGestureMousePosition(endEvent);
        var gesture = {
          type: null,
          start: start,
          end: end
        };

        var type = this.getGestureType(start, end);
        if (type) {
          gesture.type = type;
        }
        gestureCallback(gesture, startEvent, endEvent);
      }
      return false;
    },

    /**********************************************************
     * Click and Generic Gesture
     **********************************************************/

    addMultiGestureListener (node, clickCallback, gestureCallback) {
      var listener = on(node, touch.press, lang.hitch(this, "onMultiGestureStart", node, clickCallback,gestureCallback));
      return listener;
    },

    onMultiGestureStart (node, clickCallback, gestureCallback, startEvent) {
      /**
       * We do not stop the event, this must be done by the clickCallback
       */

      this.stopPropagation(startEvent);
      var start = this._getGestureMousePosition(startEvent);
      var releaseListener = null;
      var mouseListener = null;

      if (this._hasGestures) {
        mouseListener = this.addTouchMove(this.getGestureRootNode(node), (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
      }
     
      releaseListener = on(this.getGestureRootNode(node), touch.release, (e) => {
          this.onMultiGestureEnd(start, clickCallback, gestureCallback, releaseListener, mouseListener, startEvent, e);
      });
      return false;
    },

    onMultiGestureEnd (start, clickCallback, gestureCallback, releaseListener, mouseListener, startEvent, endEvent) {
      if (releaseListener) {
        releaseListener.remove();
      } else {
        console.error("onGestoreEnd() > No relaseListener!");
      }

      if (mouseListener) {
        mouseListener.remove();
      }

      /**
       * Oh no, we scrolled in the middle;
       */
      if (start.t < gestureLastScroll) {
        return;
      }

      var end = this._getGestureMousePosition(endEvent);

      /**
       * Figure out what kind of eent it is!
       */
      if (this.isClickGesture(start, end)) {
        if (clickCallback) {
          clickCallback(startEvent);
        }
      } else {
        if (gestureCallback) {
          var type = this.getGestureType(start, end);
          var gesture = {
            type: type,
            start: start,
            end: end
          };

          gestureCallback(gesture, startEvent, endEvent);
        }
      }

      return false;
    },

    /**********************************************************
     * Helpers
     **********************************************************/

    isClickGesture (start, end) {
      return (
        Math.abs(start.x - end.x) < 10 &&
        Math.abs(start.y - end.y) < 10 &&
        Math.abs(end.t - start.t) < this.GESTURE_PRESS_MAX_DURATION
      );
    },

    getGestureType (start, end) {
      if (Math.abs(start.x - end.x) < 10 && Math.abs(start.y - end.y) < 10) {
        if (Math.abs(end.t - start.t) < this.GESTURE_PRESS_MAX_DURATION) {
          return "click";
        } else {
          return "longclick";
        }
      }

      var difX = Math.abs(start.x - end.x);
      var difY = Math.abs(start.y - end.y);

      if (difX > difY) {
        if (start.x - end.x > this.GESTURE_MIN_DISTANCE) {
          return "swipeLeft";
        }

        if (end.x - start.x > this.GESTURE_MIN_DISTANCE) {
          return "swipeRight";
        }
      } else {
        if (start.y - end.y > this.GESTURE_MIN_DISTANCE) {
          return "swipeUp";
        }

        if (end.y - start.y > this.GESTURE_MIN_DISTANCE) {
          return "swipeDown";
        }
      }

      return "none";
    },

    hasGestures (lines) {
      if (lines) {
        for (var i = 0; i < lines.length; i++) {
          if (lines[i].event != "click") {
            return true;
          }
        }
      }
      return false;
    },

    /**
     * Can be overwritten by UIWidget??
     *
     * FIXME: If we have ever nested layouts this will not work. Mabye register on body?
     */
    getGestureRootNode () {
      return win.body();
    },

    _getGestureMousePosition (e) {
      var result = {};
      result.t = new Date().getTime();
      if (e.touches && e.touches.length > 0) {
        e = e.touches[0]
        result.x = e.clientX;
        result.y = e.clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0 ) {
        e = e.changedTouches[0]
        result.x = e.clientX;
        result.y = e.clientY;
      } else {
        result.x = e.pageX;
        result.y = e.pageY;
      }
      return result;
    }
  },
  mounted() {}
};
</script>