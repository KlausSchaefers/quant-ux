
<template>
  <div class="MatcDashRing">
    <div class="MatcDashRingLabel MatcDashLabel" data-dojo-attach-point="label"></div>
    <div data-dojo-attach-point="container" class="MatcDashRingCntr">
      <div class="MatcDashRingValue MatcVerticleMiddle" data-dojo-attach-point="value"></div>
    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import css from "dojo/css";
import on from "dojo/on";
import touch from "dojo/touch";
import Logger from "common/Logger";
import _Color from "common/_Color";

export default {
  name: "Ring",
  mixins: [_Color, DojoWidget],
  data: function() {
    return {
      size: 200,
      width: 20,
      backgroundColor: null,
      color: null,
      color2: null,
      label: "",
      animationSpeed: 30,
      noLabel: false
    };
  },
  components: {},
  methods: {
    postCreate() {
      this.log = new Logger("Ring");

      this._canvas = document.createElement("canvas");
      this._canvas.height = this.size;
      this._canvas.width = this.size;
      this.container.appendChild(this._canvas);
      if (this.noLabel) {
        this.domNode.removeChild(this.label);
      }
      if (this.width) {
        this.width *= 1;
      }
      if (this.l) {
        this.setLabel(this.l);
      }
      if (this.v) {
        this.setValue(this.v);
      }
      if (this.p) {
        this.setPercent(this.p * 1);
      }
      if (this.p2) {
        this.setPercent2(this.p2 * 1);
      }
      if (this.css) {
        css.add(this.domNode, this.css);
      }
    },

    setValue(v) {
      this.value.innerHTML = v;
    },

    setLabel(l) {
      this.label.innerHTML = l;
    },

    setHelp() {
      var span = document.createElement("span");
      css.add(span, "mdi mdi-help-circle MatcHelpIcon");
      this.label.appendChild(span);
      this.own(on(span, touch.press, lang.hitch(this, "onHelp")));
    },

    setAction(icon) {
      var span = document.createElement("span");
      css.add(span, icon + " MatcHelpIcon");
      this.label.appendChild(span);
      this.own(on(span, touch.press, lang.hitch(this, "onAction")));
    },

    onHelp(e) {
      this.emit("help", e);
    },

    onAction(e) {
      this.emit("action", e);
    },

    setColor(c) {
      this.color = c;
    },

    hideLabel() {
      this.domNode.removeChild(this.label);
    },

    setSize(size) {
      this.domNode.style.height = size + "px";
      this.domNode.style.width = size + "px";
      this.container.style.height = size + "px";
      this.container.style.width = size + "px";
    },

    setDomSize(w, h) {
      this.domNode.style.height = h + "px";
      this.domNode.style.width = w + "px";
    },

    setPercent(p) {
      var x = this.size / 2;
      var radius = x - this.width / 2;
      this.clearProgress();
      this.drawArc(x, radius, p, this.getForeGroundColor(p));
    },

    setPercent2(p) {
      var x = this.size / 2;
      var radius = x - this.width / 2 - (this.width + 4);
      this.drawArc(x, radius, p, this.getForeGroundColor2(p));
    },

    setPercent3(p) {
      var x = this.size / 2;
      var radius = x - this.width / 2 - (this.width + 4);
      this.drawArc(x, radius, p, this.getForeGroundColor3(p));
    },

    /**
     * HD rendering for perfect quality!
     */
    setPs(p1, p2) {
      var x = this.size;
      var w = this.width * 2;
      var canvas = document.createElement("canvas");
      canvas.height = this.size * 2;
      canvas.width = this.size * 2;
      var ctx = canvas.getContext("2d");

      if (isNaN(p1)) {
        p1 = 0;
      }

      if (this.backgroundColor) {
        let radius = x - w;
        ctx.beginPath();
        let s = this.degreesToRadians(360 * p1);
        let e = this.degreesToRadians(360);
        ctx.arc(x, x, radius, s, e);
        ctx.strokeStyle = this.backgroundColor;
        ctx.lineWidth = w;
        ctx.stroke();
      }

      if (p1 != undefined && p1 != null) {
        let radius = x - w;
        ctx.beginPath();
        let s = this.degreesToRadians(0);
        let e = this.degreesToRadians(360 * p1);
        ctx.arc(x, x, radius, s, e);
        ctx.strokeStyle = this.getForeGroundColor(p1);
        ctx.lineWidth = w;
        ctx.stroke();
      }

      if (p2) {
        let radius2 = x - w - (w + 4);
        if (this.backgroundColor) {
          ctx.beginPath();
          let s = this.degreesToRadians(p1 * 360);
          let e = this.degreesToRadians(360);
          ctx.arc(x, x, radius2, s, e);
          ctx.strokeStyle = this.backgroundColor;
          ctx.lineWidth = w;
          ctx.stroke();
        }
        ctx.beginPath();
        let s = this.degreesToRadians(0);
        let e = this.degreesToRadians(360 * p2);
        ctx.arc(x, x, radius2, s, e);
        ctx.strokeStyle = this.getForeGroundColor2(p2);
        ctx.lineWidth = w;
        ctx.stroke();
      }

      if (this._canvas) {
        this.container.removeChild(this._canvas);
        delete this._canvas;
      }
      this.container.style.backgroundSize = "100% 100%";
      this.container.style.backgroundImage = "url(" + canvas.toDataURL("image/png") + ")";
      this.container.style.height = this.size + "px";
      this.container.style.width = this.size + "px";
    },

    /**
     * Render cool graph like this
     */
    setPs2(p1, p2) {
      var x = this.size;
      var w = this.width * 2;

      var canvas = document.createElement("canvas");
      canvas.height = this.size * 2;
      canvas.width = this.size * 2;
	    var ctx = canvas.getContext("2d");
	  
      if (this.backgroundColor) {
        let radius = x - w - w;
        ctx.beginPath();
        let s = this.degreesToRadians(0);
        let e = this.degreesToRadians(360);
        ctx.arc(x, x, radius, s, e);
        ctx.strokeStyle = this.backgroundColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (p1) {
        let radius = x - w;
        ctx.beginPath();
        let s = this.degreesToRadians(0);
        let e = this.degreesToRadians(360 * p1);
        ctx.arc(x, x, radius, s, e);
        ctx.strokeStyle = this.getForeGroundColor(p1);
        ctx.lineWidth = w;
        ctx.stroke();
      }

      if (p2) {
        let radius2 = x - w - (2 * w + 2);
        ctx.beginPath();
        let s = this.degreesToRadians(0);
        let e = this.degreesToRadians(360 * p2);
        ctx.arc(x, x, radius2, s, e);
        ctx.strokeStyle = this.getForeGroundColor2(p2);
        ctx.lineWidth = w;
        ctx.stroke();
      }

      if (this._canvas) {
        this.container.removeChild(this._canvas);
        delete this._canvas;
      }
      this.container.style.backgroundSize = "100% 100%";
      this.container.style.backgroundImage =
        "url(" + canvas.toDataURL("image/png") + ")";
    },

    drawArc(x, radius, p, color, scale) {
      let c = this._canvas;
      let ctx = c.getContext("2d");
      if (scale) {
        ctx.scale(2, 2);
      }

      if (this.backgroundColor) {
        ctx.beginPath();
        let s = this.degreesToRadians(p * 360);
        let e = this.degreesToRadians(360);
        ctx.arc(x, x, radius, s, e);
        ctx.strokeStyle = this.backgroundColor;
        ctx.lineWidth = this.width;
        ctx.stroke();
      }

      ctx.beginPath();
      let s = this.degreesToRadians(0);
      let e = this.degreesToRadians(360 * p);
      ctx.arc(x, x, radius, s, e);
      ctx.strokeStyle = color;
      ctx.lineWidth = this.width;
      ctx.stroke();
    },

    getForeGroundColor(p) {
      if (this.color) {
        return this.color;
      }
      return this.greenToRed(p);
    },

    getForeGroundColor2(p) {
      if (this.color2) {
        return this.color2;
      }
      return this.greenToRed(p);
    },

    getForeGroundColor3(p) {
      if (this.color3) {
        return this.color3;
      }
      return this.greenToRed(p);
    },

    clearProgress() {
      var c = this._canvas;
      var ctx = c.getContext("2d");
      ctx.clearRect(0, 0, c.width, c.height);
    },

    degreesToRadians(degrees) {
      return degrees * (Math.PI / 180) - Math.PI / 2;
    },

    startAnimation() {
      this.animationRunning = true;
      this.animationState = 0;
      this.animate();
      css.add(this.domNode, "MatcRingLoading");
    },

    stopAnimation() {
      this.animationRunning = false;
      this.clearProgress();
      css.remove(this.domNode, "MatcUploaderLoading");
    },

    animate() {
      if (this.animationRunning) {
        this.setPercent(this.animationState);

        this.animationState += 0.01;
        if (this.animationState > 1.1) {
          this.animationState = 0;
        }

        if (!window.requestAnimationFrame) {
          setTimeout(lang.hitch(this, "animate"), this.animationSpeed);
        } else {
          var callback = lang.hitch(this, "animate");
          requestAnimationFrame(callback);
        }
      }
    }
  },
  mounted() {}
};
</script>