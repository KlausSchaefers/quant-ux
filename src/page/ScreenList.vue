
<template>
  <div :class="'MatcScreenList ' + screenType">
    <div class="MatcAppListContainer" data-dojo-attach-point="container"></div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import Util from "core/Util";
import AppList from "page/AppList";
import Preview from "page/Preview";
import {iconDOM} from "page/QIconUtil";
import Services from "services/Services";

export default {
  name: "AppScreenList",
  mixins: [AppList, Util, DojoWidget],
  props:['app', 'pub'],
  data: function() {
    return {
      model: null,
      add: false,
      hasSearch:false,
      popoverButtonLabel: "Design",
      maxElementsToRender: 20,
      resizePreview: false,
      isPublic: false,
      hasStackView: false,
      animate: false
    };
  },
  components: {},
  computed: {
    screenType () {

      if (this.model) {
        return this.model.type
      }
      return ""
    },
  },
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
      // if (this.model.type === 'desktop') {
      //   this.colWidth = 320;
      // }
    
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

    renderDefault () {

      const item = document.createElement("a");
      css.add(item, "MatcAppListItem MatcContentBox MatcAppListBox");
     
      const wrapper = document.createElement("div");
      css.add(wrapper, "MatcPreviewWrapper MatcPreviewWrapperLoadable");
      item.appendChild(wrapper)
      this.setPreviewWrapperSize(wrapper);

      const add = document.createElement("div");
      css.add(add, "MatcAppListAdd");
      wrapper.appendChild(add);

      const span = document.createElement("span");
      css.add(span, "mdi mdi-border-color");
      add.appendChild(iconDOM('Plus', '', 64, 64));

      // const p = document.createElement("p");
      // css.add(p, "MatcHint MatcCenter MatcListItemDescription");
      // p.innerHTML = "";
      // add.appendChild(p)

      item.href = "#/apps/" + this.model.id + "/design/start.html";
      return item
    },

    createScreenWidget () {
      const heatmap = this.$new(Preview);
      heatmap.isFillBackground = true
      heatmap.setJwtToken(this.jwtToken);
      heatmap.setPublic(this.pub)
      if (this.hash) {
        heatmap.setInvitation(this.hash);
      }
      return heatmap;
    },

    renderDescription (app, item) {
      let des = this.getDescription(app);
      let p = document.createElement("p");
      p.innerHTML = des;
      css.add(p, "MatcListItemDescription");
      item.appendChild(p);
    },

    getDescription (screen) {
      let des = "";
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