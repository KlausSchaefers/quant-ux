<template>
  <div class="MatcAppList">
    <div class="MatcListSearchCntr" data-dojo-attach-point="searchCntr">
      <div class="MatcSearchForm">
        <input
          id="MatcAppListSearchField"
          placeholder="Search"
          data-dojo-attach-point="searchInput"
        />
        <span
          class="mdi mdi-magnify MatcCreateSearchBtn"
          aria-hidden="true"
          data-dojo-attach-point="searchBtn"
        ></span>
      </div>
    </div>
    <div class="MatcAppListContainer" data-dojo-attach-point="container"></div>
  </div>
</template>
<style>
  @import url("../style/list.css");
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import has from "dojo/has";
import touch from "dojo/touch";
import Logger from "common/Logger";
import List from "page/List";
import Plan from "page/Plan";
import Preview from "page/Preview";
import Services from "services/Services";

export default {
  name: "AppList",
  mixins: [DojoWidget, List, Plan],
  props: ["small", "big", "pub", "canAdd", "size"],
  data: function() {
    return {
      columns: -1,
      spacing: -1,
      colWidth: 252,
      maxElementsToRender: 50,
      resizePreview: false,
      popoverButtonLabel: "View",
      popoverVisible: false,
      hasLink: true,
      hasSearch: true,
      searchFields: ["name"],
      animate: true,
      hasStackView: false,
      isMobile: false
    };
  },
  components: {},
  methods: {
    postCreate() {
      this.jwtToken = Services.getUserService().getToken()

      this.isMobile = has("mobile");

      if (this.big) {
        this.colWidth = 352;
        css.add(this.domNode, "MatcAppListBig");
        this.columns = 3;
      }

      if (this.small) {
        this.colWidth = 180;
        css.add(this.domNode, "MatcAppListSmall");
        this.columns = 1;
      }

      if (this.isMobile) {
        css.add(this.domNode, "MatcAppListMobile");
      }

      this.initListeners();

      this.initLoading();

      this.initSearch();
    },

    initLoading: function() {
      try {
        this.container.innerHTML = "";
        var parent = document.createElement("div");

        if (this.canAdd && this.isMobile) {
          var item = document.createElement("div");
          item.style.width = this.colWidth + "px";
          css.add(item, "MatcListItem MatcAppListBox");
          this.onRenderAdd(item);
          parent.appendChild(item);
        }

        var loading = document.createElement("div");
        css.add(loading, "MatcLoading");
        loading.innerHTML = "Loading...";
        parent.appendChild(loading);

        this.container.appendChild(parent);
      } catch (e) {
        this.log.error("initLoading", "Some error occuored");
        this.log.sendError(e);
      }
      this.cleanUp();
    },

    initSearch: function() {
      this.searchInput.value = "";
      if (!this.hasSearch) {
        css.add(this.searchCntr, "hidden");
      } else {
        css.remove(this.searchCntr, "hidden");
        this.own(on(this.searchBtn, touch.press, lang.hitch(this, "showSearch")));
        this.own(on(this.searchInput, "keypress", function(e) {
              e.stopPropagation();
        }));
        this.own(on(this.searchInput, "keydown", function(e) {
            e.stopPropagation();
        }));
        this.own(on(this.searchInput, "keyup", lang.hitch(this, "onSearch")));
      }
    },

    showSearch: function() {
      css.add(this.searchCntr, "MatcListSearchVisible");
      var me = this;
      setTimeout(function() {
        me.searchInput.focus();
      }, 10);
    },

    onSearch: function(e) {
      e.stopPropagation();

      this.cleanUp();
      this.onBeforeResize();

      var filter = this.searchInput.value;

      if (filter && filter.length >= 2) {
        filter = filter.toLowerCase();
        var filtered = [];
        for (var i = 0; i < this.value.length; i++) {
          var item = this.value[i];
          var added = false;
          for (var j = 0; j < this.searchFields.length; j++) {
            var field = this.searchFields[j];
            var fieldValue = item[field];
            if (
              !added &&
              fieldValue &&
              fieldValue.indexOf &&
              fieldValue.toLowerCase().indexOf(filter) >= 0
            ) {
              filtered.push(item);
              added = true;
            }
          }
        }
        this.render(filtered);
        // for some stupid reason chrome pastes sometimes a value in here
        if (filtered.length === 0) {
          css.add(this.searchCntr, "MatcListSearchVisible");
        }
      } else {
        this.onBeforeResize();
        this.render(this.value);
      }
    },

    initListeners() {},

    async load() {
      /**
       * Make the loading somehow faster!
       *
       * 1) We load the summary! And render empty boxes
       *
       * 2) Then we load the real apps and set the values
       */
      if (this.pub) {
        let summaries = await Services.getModelService().findPublicSummaries();
        this.setLoadingPreview(summaries);
      } else {
        let summaries = await Services.getModelService().findMyAppSummaries();
        this.setLoadingPreview(summaries);
      }
    },

    async setLoadingPreview(value) {
      this.log.log(0, "setLoadingPreview", "enter > " + value.length);
      value.sort(function(a, b) {
        return b.lastUpdate - a.lastUpdate;
      });
      value = this.filterApps(value);
      this.value = value;
      this.render(value, this.animate);
      css.add(this.domNode, "MatcAppListLoading");

      if (this.pub) {
        let apps = await Services.getModelService().findPublic();
        this.setApps(apps);
      } else {
        let apps = await Services.getModelService().findMyApps();
        this.setApps(apps);
      }
    },

    setApps (value) {
      this.log.log(0, "setApps", "enter > " + value.length);
      value.sort(function(a, b) {
        return b.lastUpdate - a.lastUpdate;
      });
      value = this.filterApps(value);
      this.value = value;
      for (var i = 0; i < value.length; i++) {
        var app = value[i];
        if (this.widgets[i]) {
          this.widgets[i].loadingMessage = "No Start Screen!";
          this.widgets[i].setModel(app);
        }
      }
      css.remove(this.domNode, "MatcAppListLoading");
      this._list = value;
    },

    filterApps (apps) {
      var result = [];
      for (var i = 0; i < apps.length; i++) {
        var app = apps[i];
        if (!app.isDeleted) {
          result.push(app);
        } else {
          console.warn("Filter deleted app", app);
        }
      }
      return result;
    },

    setValue (value) {
      value.sort(function(a, b) {
        return b.lastUpdate - a.lastUpdate;
      });
      this.value = value;
      this.render(value, false);
    },

    onRenderAdd (item) {
      css.add(
        item,
        " MatcContentBox MatcShadowBox MatcAppListBox MatcAppListAddBox"
      );

      var phone = document.createElement("a");

      css.add(phone, "MatcPointer");
      item.appendChild(phone);

      var wrapper = document.createElement("div");
      css.add(wrapper, "MatcPreviewWrapper");
      this.setPreviewWrapperSize(wrapper);
      phone.appendChild(wrapper);

      var add = document.createElement("div");
      css.add(add, "MatcApplListAdd");
      wrapper.appendChild(add);

      var span = document.createElement("span");
      css.add(span, "mdi mdi-plus-circle");
      add.appendChild(span);

      var p = document.createElement("p");
      css.add(p, "MatcHint MatcCenter MatcListItemDescription");

      if (this.pub) {
        p.innerHTML = this.getNLS("applist.sign-in");
        phone.href = "#/apps/signup-and-create-app.html";
      } else {
        p.innerHTML = this.getNLS("applist.add");
        phone.href = "#/apps/create-app.html";
      }

      item.appendChild(p);
    },

    renderItem (item, app, i) {
      if (!this.widgets) {
        this.widgets = {};
      }

      var temp = document.createElement("a");
      item.appendChild(temp);
      item = temp;

      css.add(item, "MatcAppListItem MatcContentBox MatcShadowBox MatcAppListBox");

      var widget = this.createScreenWidget(app);
      if (widget) {
        if (this.hasStackView) {
          var stack = document.createElement("div");
          css.add(stack, "MatcAppListStack");
          item.appendChild(stack);
        }

        var wrapper = document.createElement("div");
        css.add(wrapper, "MatcPreviewWrapper MatcPreviewWrapperLoadable");
        this.setPreviewWrapperSize(wrapper);
        widget.loadingMessage = "Loading...";

        if (this.popoverVisible) {
          var popover = document.createElement("div");
          css.add(popover, "MatcPopoverCntr");
          item.appendChild(popover);

          var popoverContent = document.createElement("a");
          css.add(popoverContent, "MatcPopover MatcPointer MatcCenter ");
          popover.appendChild(popoverContent);

          this.renderPopover(popoverContent, app, i);

          popover.appendChild(wrapper);
        } else {
          item.appendChild(wrapper);
        }

        widget.placeAt(wrapper);
        this.widgets[i] = widget;
        this.setMethod(temp, app);
      }

      this.renderDescription(app, item);
    },

    setPreviewWrapperSize (wrapper) {
      if (this.resizePreview) {
        var scale = this.colWidth / this.model.screenSize.w;
        /**
         * Golden cut: 61.8% - 38.2%
         * width = 61,8 = 100 // * 1.61
         * height = 38,2 = 61.6 // *1.61
         */
        let screenHeight = Math.min(
          Math.round(this.model.screenSize.h * scale),
          this.colWidth * 0.616
        );
        wrapper.style.height = screenHeight + "px";
      }
    },

    renderPopover (popoverContent) {
      var popoverBtn = document.createElement("span");
      css.add(popoverBtn, " MatcPopoverBtn MatcVerticleCenter");
      popoverBtn.innerHTML = this.popoverButtonLabel;
      popoverContent.appendChild(popoverBtn);
    },

    renderDescription (app, item) {
      var des = this.getDescription(app);
      var p = document.createElement("p");
      p.innerHTML = des;
      css.add(p, "MatcListItemDescription");
      item.appendChild(p);
    },

    onBeforeResize () {
      this.log.log(4, "onBeforeResize", "enter");
      if (this.widgets) {
        for (var i = 0; i < this.widgets.length; i++) {
          this.widgets[i].destroy();
        }
      }
      this.widgets = [];
    },

    createScreenWidget () {
      let preview = this.$new(Preview);
      preview.mode = 'preview';
      preview.isFillBackground = true
      preview.setPublic(this.pub)
      preview.setJwtToken(this.jwtToken);
      return preview;
    },

    setMethod (phone, app) {
      if (!this.pub) {
        if (this.isMobile) {
          phone.href = "#/test/mobile/" + app.id + ".html";
        } else {
          phone.href = "#/apps/" + app.id + ".html";
        }
      } else {
        phone.href = "#/examples/" + app.id + ".html";
      }
    },

    getDescription (app) {
      var des = "";
      if (app.name) {
        des += this.stripHTML(app.name);
      }
      return des;
    },

    onRenderDone (value) {
      for (var i = 0; i < value.length; i++) {
        var app = value[i];
        if (this.widgets[i]) {
          this.widgets[i].setModel(app);
        }
      }
    }
  },
  mounted() {
    this.log = new Logger("AppList");
    this.log.log(2, "mounted", "enter");
    this.load();
  }
};
</script>