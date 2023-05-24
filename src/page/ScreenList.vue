
<template>
  <div class="MatcAppList">
    <div class="MatcAppListContainer" data-dojo-attach-point="container"></div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import Util from "core/Util";
import AppList from "page/AppList";
import Preview from "page/Preview";
import Services from "services/Services";

export default {
  name: "AppScreenList",
  mixins: [AppList, Util, DojoWidget],
  props:['app', 'pub'],
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
    setValue (value) {
      this.model = value;
      this.value = this.getScreens();
      if (this.value.length == 0) {
        this.add = true;
      }
      this.render(this.value, this.animate);
    },

    setInvitation (h) {
      this.hash = h;
    },

    setMethod (phone, screen) {
      if (this.pub) {
        phone.href = "#/examples/" + this.model.id + "/design/" + screen.id + ".html";
      } else {
        phone.href = "#/apps/" + this.model.id + "/design/" + screen.id + ".html";
      }
    },

    onTest (id, e) {
      this.stopEvent(e);
      this.emit("test", id);
    },

    onRenderAdd (item) {
      css.add(item, " MatcContentBox MatcAppListBox ");

      var phone = document.createElement("a");

      css.add(phone, "MatcPointer");
      item.appendChild(phone);

      var wrapper = document.createElement("div");
      css.add(wrapper, " ");
      phone.appendChild(wrapper);

      var add = document.createElement("div");
      css.add(add, "MatcApplListAdd");
      wrapper.appendChild(add);

      var span = document.createElement("span");
      css.add(span, "mdi mdi-border-colo");
      add.appendChild(span);

      var p = document.createElement("p");
      css.add(p, "MatcHint MatcCenter MatcListItemDescription");

      p.innerHTML = "Click here to edit the prototype ";
      phone.href = "#/apps/" + this.model.id + "/design.html";

      item.appendChild(p);
    },

    createScreenWidget () {
      var heatmap = this.$new(Preview);
      heatmap.isFillBackground = true
      heatmap.setJwtToken(this.jwtToken);
      heatmap.setPublic(this.pub)
      if (this.hash) {
        heatmap.setInvitation(this.hash);
      }
      return heatmap;
    },

    renderDescription (app, item) {
      var des = this.getDescription(app);
      var p = document.createElement("p");
      p.innerHTML = des;
      css.add(p, "MatcListItemDescription");
      item.appendChild(p);
    },

    getDescription (screen) {
      var des = "";
      if (screen.name) {
        des += screen.name;
      } else {
        des += "Click to edit";
      }
      return des;
    },

    onRenderDone () {
      try {
        for (let i = 0; i < this.value.length; i++) {
          const scrn = this.value[i];
          if (this.widgets[i]) {
            this.widgets[i].setModel(this.model, scrn?.id);
          }
        }
      } catch (e) {
        console.error(e)
      }
     
    }
  },
  mounted() {}
};
</script>