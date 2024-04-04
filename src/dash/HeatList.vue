
<template>
  <div class="MatcScreenList">
    <div class="MatcAppListContainer" data-dojo-attach-point="container"></div>
  </div>
</template>
<style lang="scss">
  @import "../style/components/list.scss";
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import Util from "core/Util";
import AppList from "page/AppList";
import HeatPreview from "dash/HeatPreview";
import Services from "services/Services";

export default {
  name: "HeatList",
  mixins: [AppList, Util, DojoWidget],
  props:['app', 'pub', "annotation", "events"],
  data: function() {
    return {
      add: false,
      hasSearch:false,
      popoverButtonLabel: "Design",
      maxElementsToRender: 20,
      resizePreview: false,
      isPublic: false,
      hasStackView: false
    };
  },
  components: {},
  methods: {
    /**
     * Is called from parent mounted
     */
    load () {
      this.jwtToken = Services.getUserService().getToken()
      if (this.app) {
        this.setValue(this.app)
      } else {
        console.warn('ScreenList.load() > No app')
      }
    },

    setValue(value) {
      this.model = value;
      this.value = this.getScreens();
      if (this.value.length == 0) {
        this.add = true;
      }
      this.render(this.value, this.animate);
    },

    setInvitation(h) {
      this.hash = h;
    },

    setMethod(phone) {
      if (this.pub) {
        phone.href = "#/examples/" + this.model.id + "/analyze/workspace.html";
      } else {
        phone.href = "#/apps/" + this.model.id + "/analyze/workspace.html";
      }
    },

    onTest(id, e) {
      this.stopEvent(e);
      this.emit("test", id);
    },


    createScreenWidget(screen) {
      var heatmap = this.$new(HeatPreview);
      heatmap.setJwtToken(this.jwtToken);
      heatmap.isFillBackground = true
      heatmap.setPublic(this.pub)
      if (this.hash) {
        heatmap.setInvitation(this.hash);
      }
      if (this.events) {
        heatmap.setEvents(this.events.filter(e => e.screen === screen.id))
      }

      return heatmap;
    },

    renderDescription(app, item) {
      var des = this.getDescription(app);
      var p = document.createElement("p");
      p.innerHTML = des;
      css.add(p, "MatcListItemDescription");
      item.appendChild(p);
    },

    getDescription(screen) {
      var des = "";
      if (screen.name) {
        des += screen.name;
      } else {
        des += "Click to edit";
      }
      return des;
    },

    onRenderDone() {
      for (var i = 0; i < this.value.length; i++) {
        var screen = this.value[i];
        if (this.widgets[i]) {
          this.widgets[i].setModel(this.model, screen.id);
        }
      }
    }
  },
  mounted() {}
};
</script>