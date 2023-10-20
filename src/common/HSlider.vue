
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
import DomBuilder from "common/DomBuilder";

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
      showLabel: false
    };
  },
  components: {},
  methods: {
    postCreate () {
      if (this.wire) {
        this.wireEvents();
      }
    },

    wireEvents () {
      this.own(this.addTouchStart(this.domNode, lang.hitch(this, "onDomPress")));
      this.own(this.addTouchStart(this.hndl, lang.hitch(this, "onHandlePress")));
    },

    startup () {
      this.init();
    },

    setShowLabel (show) {
      this.showLabel = show
    },

    setMax (m) {
      this.max = m * 1;
    },

    setCenter (c) {
      this.center = c;
    },

    setMin (m) {
      this.min = m * 1;
    },

    setLegend (l) {
      this.legend = l * 1;
    },

    /**
     * Marks indicate some part on the slider, this is use full for the video player
     */
    setMarks (marks) {
      this.marks = marks;
    },

    placeAt (node) {
      if (node && node.toLowerCase) {
        node = document.getElementById(node);
      }
      node.appendChild(this.$el);
      this.init();
    },

    init (p) {
      if (p) {
        console.error('init called with pos???', new Error().stack)
      }
      this.min = this.min * 1;
      this.max = this.max * 1;

      /**
       * center everything to the container
       */
      var pos = domGeom.position(this.domNode);
      var bPos = domGeom.position(this.bar);
      var hPos = domGeom.position(this.hndl);

      this.render(pos, bPos, hPos);

      /**
       * This is for the session player!
       */
      this.initBars();
      this.initLegend();
      this.setValue(this.value)
    },

    getWidth: function() {
      if (this._width) {
        return this._width;
      }
      return domGeom.position(this.domNode).w;
    },

    render (pos, bPos, hPos) {
      this.cntr.style.top = Math.round((pos.h - bPos.h) / 2) + "px";
      this.hndl.style.top = Math.round((bPos.h - hPos.h) / 2) - 1 + "px";
      this.hndlWidth = hPos.w / 2;
      this._width = pos.w;
    },

    initLegend () {
      if (this.legend > 0) {
        var pos = domGeom.position(this.domNode);
        var db = new DomBuilder();
        var cntr = db.div("vommondLegendBar").build(this.domNode);
        var s = this.max - this.min;
        for (var i = 0; i <= this.legend; i++) {
          var p = i / this.legend;
          var lblCntr = db.span("vommondLegendBarItem").build(cntr);
          lblCntr.style.left = Math.min(pos.w * p, pos.w - 1) + "px";
          db.div( "vommondLegendBarItemLabel", Math.round(this.min + p * s)).build(lblCntr);
        }
      }
    },

    initBars () {
      if (this.marks) {
        const width = domGeom.position(this.domNode).w;
        const marks = this.marks;
        for (let i = 0; i < marks.length; i++) {
          const mark = marks[i];
          const s = this.max - this.min;
          const p = Math.min(Math.abs((mark.start - this.min) / s), 0.95);
      
          const marker = document.createElement("div");
          css.add(marker, "VommondSliderMarker");
          marker.style.left = p * 100 + "%";

          if (marker.w) {
            const w = (mark.length / s)
            marker.style.width = w * width + "px";
          }
     
          if (mark.label) {
            const lbl = document.createElement("div");
            css.add(lbl, "VommondSliderMarkPopup");
            lbl.innerHTML = mark.label;
            marker.appendChild(lbl);
          }

          this.markCntr.appendChild(marker);
        }
      }
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

      if (this.showLabel) {
        this.hndl.innerText = value
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