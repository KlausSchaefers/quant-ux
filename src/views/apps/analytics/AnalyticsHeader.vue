
<template>
  <div class="columns has-text-centered mt-16 ">
    <div class="column mb-32">
      <div data-dojo-attach-point="userContainer"></div>
    </div>

    <div class="column mb-32">
      <div data-dojo-attach-point="coverageContainer"></div>
    </div>

    <div class="column mb-32">
      <div data-dojo-attach-point="durContainer"></div>
    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import Logger from "common/Logger";
import DomBuilder from "common/DomBuilder";
import Ring from "common/Ring";
import Util from "core/Util";

export default {
  name: "AnalyticsHeader",
  mixins: [DojoWidget, Util],
  props: ["value"],
  data: function() {
    return {
      size: 200,
      width: 10
    };
  },
  components: {},
  methods: {
    postCreate () {
      this.log = new Logger("AnalyticsHeader");

      this.userRing = this.$new(Ring, {
        width: this.width,
        size: this.size,
        color: this.RING_FOREGROUND,
        backgroundColor: this.RING_BACKGROUND
      });
      this.userRing.setLabel(this.getNLS("analytics.header.user"));
      this.userRing.setValue(0);
      this.userRing.setPs(0);
      this.userRing.placeAt(this.userContainer);

      this.covRing = this.$new(Ring, {
        width: this.width,
        size: this.size,
        color: this.RING_FOREGROUND,
        backgroundColor: this.RING_BACKGROUND
      });
      this.covRing.setLabel(this.getNLS("analytics.header.coverage"));
      this.covRing.setValue(0);
      this.covRing.setPs(0);
      this.covRing.placeAt(this.coverageContainer);

      var db = new DomBuilder();
      var cntr = db.div("MatcDashNumberContainer").build(this.durContainer);
      db.div("MatcDashLabel", this.getNLS("analytics.header.duration")).build(
        cntr
      );
      this.durLabel = db.div("MatcDashNumber", 0 + " ").build(cntr);
      this.durSTDLabel = db.div("MatcDashLabelHint", "+/- " + 0).build(cntr);

      this.log.log(0, "postCreate", "exit");
    },

    setUser (v, p) {
      this.userRing.setValue(v);
      this.userRing.setPs(p);
    },

    setDuration (v, std) {
      this.durLabel.innerHTML = v + "s";
      this.durSTDLabel.innerHTML = "+/- " + std;
    },

    setCovergae (v) {
      this.covRing.setValue(Math.round(v * 100) + "%");
      this.covRing.setPs(v);
    },

    setValue(data) {
      this.log.log(0, "setValue", "exit", data);
      this.setUser(data.sessionCount, data.sessionPercentage);
      this.setDuration(data.sessionDurationMean, data.sessionDurationStd);
      this.setCovergae(data.expRate);
    }
  },
  watch: {
    value(data) {
      this.value = data;
      this.setValue(data);
    }
  },
  mounted() {
    if (this.value) {
      this.setValue(this.value);
    }
  }
};
</script>