
<template>
  <div class="VommondProgress">
    <div class="VommondProgressContainer" data-dojo-attach-point="cntr">
      <div class="VommondProgressBar" data-dojo-attach-point="bar"></div>
    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import _Color from "common/_Color";

export default {
  name: "ProgressBar",
  mixins: [_Color, DojoWidget],
  data: function() {
    return {
      value: 0,
      max: 1,
      min: 0,
      hasLabel: false,
      color: false,
      invertColors: false
    };
  },
  components: {},
  methods: {
    postCreate() {},

    startup() {},

    setMax (m) {
      this.max = m;
    },

    setLabel (lbl) {
      const l = document.createElement("div");
      css.add(l, "VommondProgressBarLabel");
      if (this.value < 0.1) {
        css.add(l, "VommondProgressBarLabelRight");
      }
      l.innerHTML = lbl;
      this.bar.appendChild(l);
    },

    onDomPress (e) {
      this.stopEvent(e);
      this.onClick(e);
    },

    cleanup () {},

    setValue (value) {
      if (isNaN(value)) {
        value = 0;
      }
      this.bar.style.width = value * 100 + "%";
      if (this.color === true) {
        if (this.invertColors) {
          value = 1 - value;
        }
        this.bar.style.background = this.greenToRed(value);
      }
      this.value = value;
    }
  },
  mounted() {}
};
</script>