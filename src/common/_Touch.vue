<script>
import on from "dojo/on";
import touch from "dojo/touch";
import has from 'dojo/has'

var mactHasTouch = "notChecked";

export default {
  name: "_Touch",
  methods: {
    hasTouch () {
      if (mactHasTouch === "notChecked") {
        mactHasTouch = has("touch") === true;
      }
      return mactHasTouch;
    },

    addTouchStart (node, callback) {
      if (this.hasTouch()) {
        return on(node, touch.press, callback, {passive:false});
      } else {
        return on(node, touch.press, callback);
      }
    },

    /**
     * Workaround for android screwups
     * https://bugs.chromium.org/p/chromium/issues/detail?id=682795#
     */
    addTouchMove (node, callback) {
      if (this.hasTouch()) {
        return on(node, "touchmove", callback, {passive:false});
      } else {
        return on(node, touch.move, callback);
      }
    },

    addTouchRelease (node, callback) {
      if (this.hasTouch()) {
        return on(node, "touchend", callback, {passive:false});
      } else {
        return on(node, touch.release, callback);
      }
    }
  },
  mounted() {}
};
</script>