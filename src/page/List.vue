
<template>
  <div class="MatcList">
    <div class="MatcListContainer" data-dojo-attach-point="container">Loading...</div>
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
import Logger from "common/Logger";
import DomBuilder from "common/DomBuilder";

export default {
  name: "List",
  mixins: [DojoWidget],
  data: function() {
    return {
      columns: 3,
      spacing: 20,
      minSpacing: 10,
      maxElementsToRender: 1000,
      maxElementsToRenderStep: 200,
      colWidth: -1,
      grid: false,
      add: false,
      table: false,
      animate: true,
      isMobile: false
    };
  },
  components: {},
  methods: {
    constructor() {
      this.log = new Logger("List");
      this.own(on(window, "resize", lang.hitch(this, "onResize")));
    },

    setValue(value) {
      this.render(value, this.animate);
    },

    setColumns(value) {
      this.columns = value;
    },

    setSpacing(value) {
      this.spacing = value;
    },

    setItemFct(fct) {
      this.itemRenderFct = fct;
    },

    render(list, animate) {
      this.log.log(0, "render", "enter > " + list.length);

      this.container.innerHTML = "";
      const parent = this.db.div("MatcListFlexCntr").build()
      const offSet = 0; 

      const end = this.getElementsToRender(list);
      for (let j = 0; j < end; j++) {
        let i = j + offSet;
        const element = list[j];
        const item = document.createElement("div");
        css.add(item, "MatcListItem");
        this.renderItem(item, element, j);
        parent.appendChild(item)
        if (animate) {
          css.add(item, "MatcListItemHidden MatcListItemAnimated");
          this.showItem(item, i);
        }
      }

      if (list.length === 0) {
        const div = this.renderDefault()
        if (div) {
          parent.appendChild(div)
        }
      } else {
        for (let j = 0; j < 5; j++) {
          const item = document.createElement("div");
          css.add(item, "MatcListPlaceHolder");      
          parent.appendChild(item)   
        }   
      }



      /**
       * Finalize rendering and attach to dom
       */
      this.container.appendChild(parent);
      this._list = list;
      this.onRenderDone(list);
      this.renderMore(list, this.container);
      this.log.log(0, "render", "exit > ");
    },

    renderDefault () {

    },

    renderMore(list, parent) {
      if (this.maxElementsToRender < list.length) {
        var more = this.db
          .div("MatcCenter MatcMarginBottom")
          .a("MatcButton", "Show More...")
          .build(parent);
        this.tempOwn(on(more, "click", lang.hitch(this, "showMore", list)));
      }
    },

    showMore(list) {
      this.maxElementsToRender = Math.min(
        list.length,
        this.maxElementsToRenderStep + this.maxElementsToRender
      );
      this.onResize();
    },

    getElementsToRender(list) {
      return Math.min(list.length, this.maxElementsToRender);
    },

    showItem(item, i) {
      setTimeout(() => {
        css.remove(item, "MatcListItemHidden");
      }, 100 + Math.min(i, 10) * 50);
    },

    /**
     * Template methods for child classes to overwrite
     */
    onRenderDone() {},

    /**
     * Template methods for child classes to overwrite
     */
    onRenderAdd() {},

    /**
     * Template methods for child classes to overwrite
     */
    renderItem(node, element, i) {
      if (this.itemRenderFct) {
        this.itemRenderFct(node, element, i);
      }
    },

    onBeforeResize() {},


    cleanUp() {
      this._colsCreated = false;
      this.cols = true;
    },

    onResize() {
      this.log.log(0, "onResize", "enter");

      this.cleanUp();

      this.onBeforeResize();

      if (this._list) {
        this.render(this._list);
      }
    }
  },
  mounted() {
    this.db = new DomBuilder();
  }
};
</script>