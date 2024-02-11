
<template>
  <div class="VommondScrollContainer">
    <div class="VommondScrollContainerWrapper" data-dojo-attach-point="wrapper">
      <div class="VommondScrollContainerCntr" data-dojo-attach-point="cntr"></div>
    </div>
    <div class="VommondScrollContainerBar" data-dojo-attach-point="bar">
      <div class="VommondScrollContainerBarButton" data-dojo-attach-point="handle"></div>
    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import win from "dojo/_base/win";
import on from "dojo/on";
import has from 'dojo/has'
import touch from "dojo/touch";
import topic from "dojo/topic";
import domGeom from "dojo/domGeom";

export default {
  name: "ScrollContainer",
  mixins: [DojoWidget],
  data: function() {
    return {
      reverseMouseWheel: false,
      lastMouseWheel: 0,
      debug: false,
      canDestroy: true
    };
  },
  components: {},
  methods: {
    wrap (node, offset) {
      if (!this.debug) {
        if (has("android") || has("ios") || has("mac")) {
          /**
           * The default behavior for *cool* OSes is to remove and use native scrolling.
           * However the stupid simulator has a bug, so we have to trick a litte to make the native work
           */
          if (this.canDestroy) {
            if (this.domNode.parentNode) {
              this.domNode.parentNode.appendChild(node);
              var parent = this.domNode.parentNode;
              parent.removeChild(this.domNode);
              parent.style.overflow = "auto";
              parent.style.overflowX = "hidden";
              this.destroy();
            }

            this.initValues();
            return;
          } else {
            css.add(this.bar, "hidden");
            this.fixNativeScroller = true;
          }
        }
      }

      if (has("chrome")) {
        this.reverseMouseWheel = true;
        console.warn("ScrollContainer.wrap() > Reverse mousewheel for chrome");
      }

      this.cntr.appendChild(node);
      this.node = node;

      if (this.fixNativeScroller) {
        //console.debug("Will fix natie scrolling to present unnessary scrollbars")
        this.own(
          on(this.domNode, touch.over, lang.hitch(this, "onNativeHover"))
        );

        this.own(on(this.cntr, "scroll", lang.hitch(this, "onNativeScroll")));
      } else {
        this.own(on(this.domNode, touch.over, lang.hitch(this, "onHover")));
        this.own(on(this.domNode, touch.out, lang.hitch(this, "onBlur")));
        this.own(on(this.bar, touch.press, lang.hitch(this, "onClick")));
        this.own(on(this.handle, touch.press, lang.hitch(this, "onHandlePress")));
      }

      this.offset = offset;

      this.domNode.style.height = this.cntrHeight + "px";

      /**
       * Init all values
       */
      this.initValues();

      this.own(
        topic.subscribe(
          "VommondScrollContainerScrollToTop",
          lang.hitch(this, "scrollToTop")
        )
      );
    },

    initValues () {
      this.visibleHeight = 1;
      this.distanceTop = 0;
      this.position = 0;
      if (this.cntr) {
        this.cntr.scrollTop = 0;
        this.wrapper.scrollTop = 0;
      }
    },

    /**
     * The simulator can reload the div, which will set the scrolling to top. We
     * have to keep track of this...
     */
    scrollToTop () {
      if (this.fixNativeScroller) {
        this.cntr.scrollTop = 0;
        this.wrapper.scrollTop = 0;
      } else {
        this.distanceTop = 0;
        this.position = 0;
      }
    },

    setScrollTop (pos) {
      if (this.fixNativeScroller) {
        this.cntr.scrollTop = pos;
        this.wrapper.scrollTop = pos;
      } else {
        this.setScroll(pos);
      }
    },

    getScrollTop () {
      if (this.cntr) {
        console.debug(this.cntr.scrollTop);
        console.debug(this.wrapper.scrollTop);
        return this.wrapper.scrollTop;
      }
      return -1;
    },

    getCntrHeight () {
      var cntrHeight = domGeom.position(this.domNode.parentNode).h;
      if (this.offset) {
        cntrHeight -= this.offset;
      }
      return cntrHeight;
    },

    onHover () {
      this.cntrHeight = this.getCntrHeight();
      var nodePos = domGeom.position(this.node);

      if (nodePos.h > this.cntrHeight) {
        css.remove(this.bar, "hidden");
        this.visibleHeight = this.cntrHeight / nodePos.h;
        this.handle.style.height =
          Math.max(5, Math.floor(this.visibleHeight * 100)) + "%";

        this.scrollListener1 = on(
          this.domNode,
          "onmousewheel",
          lang.hitch(this, "onMouseWheel")
        );
        this.scrollListener2 = on(
          this.domNode,
          "mousewheel",
          lang.hitch(this, "onMouseWheel")
        );
        this.scrollListener3 = on(
          this.domNode,
          "DOMMouseScroll",
          lang.hitch(this, "onMouseWheel")
        );
      } else {
        this.cntr.style.top = "0px";
        this.handle.style.top = "0px";
        css.add(this.bar, "hidden");
      }
    },

    onNativeScroll (e) {
      e.stopPropagation();
      e.preventDefault();
      e.returnValue = false;
      return false;
    },

    onNativeMouseWheel (e) {
      this.stopPropagation(e);
    },

    /**
     * This methods fixes the stupid bug with the simulator having always a scroll bar...
     * we check if we have to scroll, of so we use our container to do the scrolling.
     */
    onNativeHover () {
      this.cntrHeight = this.getCntrHeight();
      var nodePos = domGeom.position(this.node);

      /**
       * We allow 5px of hidden overflow before showing the scrolling
       */
      if (Math.abs(nodePos.h - this.cntrHeight) > 5) {
        var scrollTop = this.cntr.scrollTop;

        this.cntr.style.overflow = "auto";
        this.cntr.style.overflowX = "hidden";
        /**
         * HACK: We have to remember the scrollTop value, otherwise the browser (FF) might for some
         * *strange* reason jump back to the  position of the previous page load (!!!).
         */
        this.cntr.scrollTop = scrollTop;
      } else {
        this.cntr.style.overflow = "hidden";
      }
    },

    onMouseWheel (e) {
      this.stopEvent(e);
      var dir = e.wheelDelta ? e.wheelDelta : e.detail;
      var p = this.distanceTop + this.visibleHeight;

      var now = new Date().getTime();

      /**
       * Chrome does other wise some shity backscroll
       */
      if (now - this.lastMouseWheel > 10) {
        if (this.reverseMouseWheel) {
          if (dir < 0) {
            p += 0.025;
          } else {
            p -= 0.025;
          }
        } else {
          if (dir > 0) {
            p += 0.025;
          } else {
            p -= 0.025;
          }
        }
      }
      this.lastMouseWheel = now;

      this.setScroll(p);
    },

    onHandlePress (e) {
      this.stopEvent(e);
      this.cleanup();
      this._touchMoveListner = on(
        win.body(),
        touch.move,
        lang.hitch(this, "onHandleMove")
      );
      this._touchReleaseListner = on(
        win.body(),
        touch.release,
        lang.hitch(this, "onHandleRelease")
      );
      this._startClickPosition = this.getClickPosition(e);
      this._startPosition = this.distanceTop + this.visibleHeight;
      css.add(this.domNode, "VommondScrollContainerScrolling");
    },

    onHandleMove (e) {
      this.stopEvent(e);
      var pos = this.getClickPosition(e);
      var dif = pos - this._startClickPosition;
      this.setScroll(this._startPosition + dif);
    },

    onHandleRelease (e) {
      this.stopEvent(e);
      this.cleanup();
    },

    getClickPosition (e) {
      this.stopEvent(e);
      var mPos = this._getMousePosition(e);
      var pos = domGeom.position(this.domNode);

      var dif = mPos.y - pos.y;
      var p = dif / pos.h;
      return p;
    },

    onClick (e) {
      var p = this.getClickPosition(e);
      this.setScroll(p);
    },

    setScroll (p) {
      p = Math.min(1, p);
      p = Math.max(0, p);

      var dif = Math.max(0, p - this.visibleHeight);
      var nodePos = domGeom.position(this.node);
      /**
       * FIXME: ScrollTop? That would be nice, but we would have to some
       * how set the cntr to overflow:scroll, which would make the entire widget
       * useless. So we should maybe publish to a dojo.topic and make for
       * instance the simulator listen to it.
       */
      this.cntr.style.top = -1 * (nodePos.h * dif) + "px";
      //this.cntr.scrollTop = Math.round(nodePos.h * dif);
      this.handle.style.top = this.cntrHeight * dif + "px";
      this.distanceTop = dif;
      this.position = p;

      topic.publish("VommondScrollContainer", p, Math.round(nodePos.h * dif));
    },

    onBlur: function() {
      if (this.scrollListener1) {
        this.scrollListener1.remove();
        this.scrollListener2.remove();
        this.scrollListener3.remove();
      }
    },

    cleanup () {
      if (this._touchMoveListner) {
        this._touchMoveListner.remove();
      }
      if (this._touchReleaseListner) {
        this._touchReleaseListner.remove();
      }
      this._touchReleaseListner = null;
      this._touchMoveListner = null;
      this._startPosition = 0;
      this._startClickPosition = 0;
      css.remove(this.domNode, "VommondScrollContainerScrolling");
    },

    destroy () {
      if (!this._isDestroyed) {
        this.cleanup();
        if (this.scrollListener1) {
          this.scrollListener1.remove();
          this.scrollListener2.remove();
          this.scrollListener3.remove();
        }
      }

      this._isDestroyed = true;
    }
  },
  mounted() {}
};
</script>