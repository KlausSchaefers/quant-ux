
<template>
  <div class="VommondSlider">
    <div class="VommondSliderPos">
      <div class="VommondSliderContainer" data-dojo-attach-point="cntr">
        <div class="VommondSliderMarkContainer" data-dojo-attach-point="markCntr"></div>
        <div class="VommondSliderBar" data-dojo-attach-point="bar"></div>
        <div class="VommondSliderHandle" data-dojo-attach-point="hndl"></div>
      </div>
    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import win from "dojo/_base/win";
import domGeom from "dojo/domGeom";

export default {
  name: "Slider",
  mixins: [DojoWidget],
  data: function() {
    return {
      value: 50,
      max: 100,
      min: 0,
      hasLabel: false,
      center: false,
      round: true,
      wire: true,
      hndlWidth: 5
    };
  },
  components: {},
  methods: {
    postCreate: function() {
      if (this.wire) {
        this.wireEvents();
      }
    },

    wireEvents: function() {
      this.own(
        this.addTouchStart(this.domNode, lang.hitch(this, "onDomPress"))
      );
      this.own(
        this.addTouchStart(this.hndl, lang.hitch(this, "onHandlePress"))
      );
    },

    startup: function() {
      this.init();
    },

    setMax: function(m) {
      this.max = m * 1;
    },

    setCenter: function(c) {
      this.center = c;
    },

    setMin: function(m) {
      this.min = m * 1;
    },

    setLegend: function(l) {
      this.legend = l * 1;
    },

    /**
     * Marks indicate some part on the slider, this is use full for the video player
     */
    setMarks: function(marks) {
      this.marks = marks;
    },

    placeAt: function(node) {
      if (node && node.toLowerCase) {
        node = document.getElementById(node);
      }
      node.appendChild(this.$el);
      this.init();
    },

    init: function(p) {
      if (p) {
        console.error('init called with pos???', new Error().stack)
      }
      this.min = this.min * 1;
      this.max = this.max * 1;

      /**
       * This is for the session player!
       */
      this.setValue(this.value)
    },

    getWidth: function() {
      if (this._width) {
        return this._width;
      }
      return domGeom.position(this.domNode).w;
    },

    onDomPress: function(e) {
      this.stopEvent(e);
      this.onClick(e);
      this.emit("click", this._value, e);
    },

    onHandlePress: function(e) {
      this.stopEvent(e);
      this.cleanup();
      this._touchMoveListner = this.addTouchMove(win.body(), lang.hitch(this, "onHandleMove"));
      this._touchReleaseListner = this.addTouchRelease(win.body(), lang.hitch(this, "onHandleRelease"));
      css.add(this.domNode, "VommondSliderMoving");
      this.emit("press", e);
      this.onClick(e);
    },

    onHandleMove: function(e) {
      this.stopEvent(e);
      this.onClick(e);
    },

    onHandleRelease: function(e) {
      this.stopEvent(e);
      this.cleanup();
      this.emit("release", e, this._value);
    },

    cleanup: function() {
      if (this._touchMoveListner) {
        this._touchMoveListner.remove();
      }
      if (this._touchReleaseListner) {
        this._touchReleaseListner.remove();
      }
      delete this._touchReleaseListner;
      delete this._touchMoveListner;
      css.remove(this.domNode, "VommondSliderMoving");
    },

    onClick: function(e) {
      var mPos = this._getMousePosition(e);
      var pos = domGeom.position(this.domNode);

      var dif = mPos.x - pos.x;
      var p = dif / pos.w;

      p = Math.min(Math.max(0, p), 1);

      var s = this.max - this.min;
      var w = s * p + this.min;

      if (this.round) {
        w = Math.round(w);
      }

      this.setValue(w);
      this.emit("change", w, e);
    },

    setValue: function(value) {
      value = Math.min(this.max, Math.max(this.min, value));

      var s = this.max - this.min;
      var p = Math.abs((value - this.min) / s);
      var w = this.getWidth();
      this.hndl.style.left = p * w - this.hndlWidth + "px";
      if (this.center) {
        if (value >= 0) {
          this.bar.style.left = 0.5 * w + "px";
          this.bar.style.width = (p - 0.5) * w + "px";
        } else {
          this.bar.style.left = p * w + "px";
          this.bar.style.width = (0.5 - p) * w + "px";
        }
      } else {
        this.bar.style.width = p * w + "px";
      }

      this._value = value;
    },

    getValue: function() {
      return this._value;
    }
  },
  mounted() {}
};
</script>