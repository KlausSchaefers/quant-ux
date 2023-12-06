<template>
  <div class="MatcAppList">
    <div class="MatcPageHeader">

      <div class="MatcPageHeaderLeft">
        <h1>
          {{ getNLS('app.projects') }}
        </h1>

      </div>

      <div class="MatcPageHeaderRight">

        <div class="MatcListSearchCntr" data-dojo-attach-point="searchCntr" v-if="hasSearch">
          <div class="MatcSearchForm">
            <input id="MatcAppListSearchField" placeholder="Search" data-dojo-attach-point="searchInput" />
            <QIcon icon="Search" class="MatcCreateSearchBtn" @click="showSearch" />
          </div>

        </div>
        <a @click="showNewDialog" class="MatcButton MatcButtonPrimary  MatcButtonXS" v-if="canAdd">
          {{ $t('app.create') }}
        </a>
      </div>



    </div>
    <CreateAppDialog ref="dialog"></CreateAppDialog>

    <div class="MatcAppListContainer" data-dojo-attach-point="container"></div>
  </div>
</template>
<style lang="scss">
@import "../style/components/list.scss";
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import has from "dojo/has";
import Logger from "common/Logger";
import List from "page/List";
import Plan from "page/Plan";
import Preview from "page/Preview";
import QIcon from "./QIcon";
import Services from "services/Services";
import DomBuilder from "common/DomBuilder";
import Dialog from "common/Dialog";
import Share from "page/Share";
import CreateAppDialog from "page/CreateAppDialog";
import * as UIUtil from '../util/UIUtil'

export default {
  name: "AppList",
  mixins: [DojoWidget, List, Plan],
  props: ["small", "big", "pub", "canAdd", "size", "popover", "hasSelect", "hasFocus"],
  data: function () {
    return {
      columns: -1,
      spacing: -1,
      colWidth: 240,
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
  components: {
    'QIcon': QIcon,
    'CreateAppDialog': CreateAppDialog
  },
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

      if (this.hasFocus) {
        this.showSearch()
      }
    },

    showNewDialog(e) {
      this.$refs.dialog.show(e)
    },

    initLoading() {
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

    initSearch() {
      this.searchInput.value = "";
      if (!this.hasSearch) {
        css.add(this.searchCntr, "hidden");
      } else {
        css.remove(this.searchCntr, "hidden");
        this.own(on(this.searchInput, "keypress", function (e) {
          e.stopPropagation();
        }));
        this.own(on(this.searchInput, "keydown", function (e) {
          e.stopPropagation();
        }));
        this.own(on(this.searchInput, "keyup", lang.hitch(this, "onSearch")));
      }
    },

    showSearch() {
      css.add(this.searchCntr, "MatcListSearchVisible");
      var me = this;
      setTimeout(function () {
        me.searchInput.focus();
      }, 10);
    },

    onSearch(e) {
      e.stopPropagation();

      this.cleanUp();
      this.onBeforeResize();

      let filter = this.searchInput.value;

      if (filter && filter.length >= 2) {
        filter = filter.toLowerCase();
        const filtered = [];
        for (let i = 0; i < this.value.length; i++) {
          const item = this.value[i];
          let added = false;
          for (let j = 0; j < this.searchFields.length; j++) {
            const field = this.searchFields[j];
            const fieldValue = item[field];
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

    initListeners() { },

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
      value.sort((a, b) => {
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

    setApps(value) {
      this.log.log(0, "setApps", "enter > " + value.length);
      value.sort(function (a, b) {
        return b.lastUpdate - a.lastUpdate;
      });
      value = this.filterApps(value);
      this.value = value;
      for (let i = 0; i < value.length; i++) {
        let app = value[i];
        if (this.widgets[i]) {
          this.widgets[i].loadingMessage = "No Start Screen!";
          this.widgets[i].setModel(app);
        }
      }
      css.remove(this.domNode, "MatcAppListLoading");
      this._list = value;
    },

    filterApps(apps) {
      const result = [];
      for (let i = 0; i < apps.length; i++) {
        let app = apps[i];
        if (!app.isDeleted) {
          result.push(app);
        } else {
          console.warn("Filter deleted app", app);
        }
      }
      return result;
    },

    setValue(value) {
      value.sort((a, b) => {
        return b.lastUpdate - a.lastUpdate;
      });
      this.value = value;
      this.render(value, false);
    },

    renderItem(item, app, i) {
      if (!this.widgets) {
        this.widgets = {};
      }

      const temp = document.createElement("a");
      item.appendChild(temp);
      item = temp;

      css.add(item, "MatcAppListItem MatcContentBox MatcAppListBox");

      const widget = this.createScreenWidget(app);
      if (widget) {
        if (this.hasStackView) {
          var stack = document.createElement("div");
          css.add(stack, "MatcAppListStack");
          item.appendChild(stack);
        }

        const wrapper = document.createElement("div");
        css.add(wrapper, "MatcPreviewWrapper MatcPreviewWrapperLoadable");
        this.setPreviewWrapperSize(wrapper);
        widget.loadingMessage = "Loading...";

        item.appendChild(wrapper);
        widget.placeAt(wrapper);
        this.widgets[i] = widget;
        this.setMethod(temp, app);
      }

      this.renderDescription(app, item);

      if (this.hasSelect) {
        this.tempOwn(on(temp, "click", () => {
          this.$emit("select", app)
        }))
      }
    },

    setPreviewWrapperSize(wrapper) {
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

    renderPopover(popoverContent) {
      var popoverBtn = document.createElement("span");
      css.add(popoverBtn, " MatcPopoverBtn MatcVerticleCenter");
      popoverBtn.innerHTML = this.popoverButtonLabel;
      popoverContent.appendChild(popoverBtn);
    },

    renderDescription(app, item) {

      const cntr = document.createElement("div");
      css.add(cntr, "MatcListItemDescription");

      const top = document.createElement("div");
      css.add(top, "MatcListItemDescriptionTop");
      cntr.appendChild(top)

      const name = document.createElement("h3")
      name.innerText = this.getDescription(app);
      top.appendChild(name)

      if (this.popover) {
        const dots = document.createElement("div")
        dots.innerText = "..."
        css.add(dots, "MatcListItemDescriptionDots");
        top.appendChild(dots)


        const menu = document.createElement("div")
        css.add(menu, "MatcListItemDescriptionMenu");
        dots.appendChild(menu)

        const shareBtn = document.createElement("div")
        shareBtn.innerHTML = this.getNLS("btn.share")
        menu.appendChild(shareBtn)
        this.own(on(shareBtn, "click", e => this.onShare(e, app)))

        const renameBtn = document.createElement("div")
        renameBtn.innerHTML = this.getNLS("btn.rename")
        menu.appendChild(renameBtn)
        this.own(on(renameBtn, "click", e => this.onRename(e, app)))

        const delBtn = document.createElement("div")
        delBtn.innerHTML = this.getNLS("btn.delete")
        menu.appendChild(delBtn)
        this.own(on(delBtn, "click", e => this.onDelete(e, app)))

      }

      const time = document.createElement("p")
      time.innerText = this.getNLS("app.lastEdit") + ": " + this.formatDate(app.lastUpdate, true)
      cntr.appendChild(time)


      const sessions = document.createElement("p")
      sessions.innerText = (app.sessionCount ? app.sessionCount : 0) + " " + this.getNLS("app.numberTests")
      cntr.appendChild(sessions)

      item.appendChild(cntr);
    },

    async onShare(e, app) {
      this.stopEvent(e)

      const invitations = await Services.getModelService().findInvitation(app.id)
      const hash = Object.entries(invitations).find(p => p[1] === 1)[0]

      const popup = this.db
        .div("MatcDialog MatcInfitationDialog MatcInfitationDialogLarge MatcPadding")
        .build();

      let cntr = this.db.div("container").build(popup);
      let row = this.db.div("row").build(cntr);
      let right = this.db.div("col-md-12").build(row);

      this.db.h3("", this.getNLS("share.Headline")).build(right);

      const share = this.$new(Share);
      share.placeAt(right);
      share.setInvitation(hash);
      share.setPublic(this.pub);

      row = this.db.div("row MatcMarginTop").build(cntr);
      right = this.db.div("col-md-12 MatcButtonBar").build(row);
      let write = this.db.div("MatcButton", "Close").build(right);

      const d = new Dialog();
      d.own(on(write, "click", lang.hitch(d, "close")));

      d.popup(popup, e.target);
    },

    onDelete(e, app) {
      this.stopEvent(e)

      const div = this.db.div("MatcDeleteDialog").build();
      this.db.h3("title is-4", 'Delete Prototype').build(div);
      this.db.p('MatcMarginBottomXL', `Do you want to delete the '${app.name}' prototype?`).build(div)
      const bar = this.db.div("MatcButtonBar").build(div);
      const write = this.db.a("MatcButton MatcButtonDanger", this.getNLS("btn.delete")).build(bar);
      const cancel = this.db.a("MatcLinkButton", this.getNLS("btn.cancel")).build(bar);

      const d = new Dialog();
      d.own(on(write, "click", () => this.deleteApp(d, app)));
      d.own(on(cancel, "click", () => d.close()));
      d.popup(div, e.target);

    },

    async deleteApp(d, app) {
      await Services.getModelService().deleteApp(app);
      d.close()
      const newApps = this.value.filter(a => a.id !== app.id)
      this.cleanUp();
      this.onBeforeResize();
      this.render(newApps)
    },

    onRename(e, app) {
      this.stopEvent(e)

      const div = this.db.div("MatcDeleteDialog").build();
      this.db.h3("title is-4", 'Rename Prototype').build(div);

      var inputName = this.db
        .div("MatcMarginBottomXL")
        .input("form-control input-lg MatcIgnoreOnKeyPress", app.name, "Name of the prototype")
        .build(div);

      const bar = this.db.div("MatcButtonBar").build(div);
      const write = this.db.a("MatcButton", this.getNLS("btn.rename")).build(bar);
      const cancel = this.db.a("MatcLinkButton", this.getNLS("btn.cancel")).build(bar);

      const d = new Dialog();
      d.own(on(write, "click", () => this.renameApp(d, app, inputName)));
      d.own(on(cancel, "click", () => d.close()));
      d.popup(div, e.target);
    },

    async renameApp(d, app, input) {
      let res = await Services.getModelService().updateAppProps(app.id, {
        id: app.id,
        name: input.value
      });

      d.close()
      if (res.status === "ok") {
        this.showSuccess("Name was saved...");
      } else {
        this.showError("Oooppps, Could not change the name. Try again!");
      }

      const listApp = this.value.find(a => a.id === app.id)
      if (listApp) {
        listApp.name = input.value
      }

      this.cleanUp();
      this.onBeforeResize();
      this.render(this.value)
    },

    formatDate(t, justDate) {
        return UIUtil.formatDate(t, justDate)
    },
    
    onBeforeResize() {
      this.log.log(4, "onBeforeResize", "enter");
      if (this.widgets) {
        for (let i = 0; i < this.widgets.length; i++) {
          this.widgets[i].destroy();
        }
      }
      this.widgets = [];
    },

    createScreenWidget() {
      let preview = this.$new(Preview);
      preview.mode = 'preview';
      preview.isFillBackground = true
      preview.setPublic(this.pub)
      preview.setJwtToken(this.jwtToken);
      return preview;
    },

    setMethod(phone, app) {
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

    getDescription(app) {
      let des = "";
      if (app.name) {
        des += this.stripHTML(app.name);
      }
      return des;
    },

    onRenderDone(value) {
      for (let i = 0; i < value.length; i++) {
        let app = value[i];
        if (this.widgets[i]) {
          this.widgets[i].setModel(app);
        }
      }
    }
  },
  mounted() {
    this.db = new DomBuilder()
    this.log = new Logger("AppList");
    this.log.log(2, "mounted", "enter");
    this.load();
  }
};
</script>