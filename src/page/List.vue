
<template>
  <div class="MatcList">
    <div class="MatcListContainer" data-dojo-attach-point="container">Loading...</div>
  </div>
</template>
<style>
  @import url("../style/list.css");
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import domGeom from "dojo/domGeom";
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
    constructor: function() {
      this.log = new Logger("List");
      this.own(on(window, "resize", lang.hitch(this, "onResize")));
    },

    setValue: function(value) {
      this.render(value, this.animate);
    },

    setColumns: function(value) {
      this.columns = value;
    },

    setSpacing: function(value) {
      this.spacing = value;
    },

    setItemFct: function(fct) {
      this.itemRenderFct = fct;
    },

    render: function(list, animate) {
      this.log.log(0, "render", "enter > " + list.length);

      if (this.colWidth > 0) {
        let w = domGeom.position(this.container).w;
        this.columns = Math.floor(w / (this.colWidth + this.minSpacing));
        this.log.log(3, "render", "Set columns to " + this.columns);
      }

      var width = this.getColWidth();
      var spacing = this.getSpacing();

      this.container.innerHTML = "";

      var parent = document.createElement("div");

      var offSet = 0;
      if (this.canAdd && !this.isMobile) {
        this._renderRow(0, parent, width, spacing);

        let item = document.createElement("div");
        css.add(item, "MatcListItem");

        this.onRenderAdd(item);

        let col = this.cols[0 % this.columns];
        col.appendChild(item);
        offSet++;
      }

      var end = this.getElementsToRender(list);
      for (let j = 0; j < end; j++) {
        var i = j + offSet;
        /**
         * make sure there is a row
         */
        this._renderRow(i, parent, width, spacing);
        let element = list[j];

        let item = document.createElement("div");
        css.add(item, "MatcListItem");

        this.renderItem(item, element, j);

        let col = this.cols[i % this.columns];
        col.appendChild(item);

        if (animate) {
          css.add(item, "MatcListItemHidden MatcListItemAnimated");
          this.showItem(item, i);
        }
      }

      /**
       * Finalize rendering and attach to dom
       */
      this.container.appendChild(parent);

      this._list = list;

      this.onRenderDone(list);

      this.renderMore(list, parent);

      this.log.log(0, "render", "exit > ");
    },

    renderMore: function(list, parent) {
      this.log.log(
        2,
        "renderMore",
        "enter " + this.maxElementsToRender + " < " + list.length
      );
      if (this.maxElementsToRender < list.length) {
        var db = new DomBuilder();
        var more = db
          .div("MatcCenter MatcMarginBottom")
          .a("MatcButton", "Show More...")
          .build(parent);
        this.tempOwn(on(more, "click", lang.hitch(this, "showMore", list)));
      }
    },

    showMore: function(list) {
      this.maxElementsToRender = Math.min(
        list.length,
        this.maxElementsToRenderStep + this.maxElementsToRender
      );
      this.log.log(
        2,
        "showMore",
        "exit " + this.maxElementsToRender + " > " + list.length
      );
      this.onResize();
    },

    getElementsToRender: function(list) {
      this.log.log(
        2,
        "getElementsToRender",
        "enter " + Math.min(list.length, this.maxElementsToRender)
      );
      return Math.min(list.length, this.maxElementsToRender);
    },

    showItem: function(item, i) {
      setTimeout(function() {
        css.remove(item, "MatcListItemHidden");
      }, 100 + Math.min(i, 10) * 50);
    },

    /**
     * Template methods for child classes to overwrite
     */
    onRenderDone: function() {},

    /**
     * Template methods for child classes to overwrite
     */
    onRenderAdd: function() {},

    /**
     * Template methods for child classes to overwrite
     */
    renderItem: function(node, element, i) {
      if (this.itemRenderFct) {
        this.itemRenderFct(node, element, i);
      }
    },

    onBeforeResize: function() {},

    _renderRow: function(i, parent, width, spacing) {
      if (this.grid && i % this.columns == 0) {
        this._colsCreated = false;
      }

      if (!this._colsCreated) {
        var row = document.createElement("div");
        css.add(row, "MatcListRow");
        parent.appendChild(row);

        this.cols = [];
        for (var c = 0; c < this.columns; c++) {
          var col = document.createElement("div");
          css.add(col, "MatcListColumn");
          col.style.width = width + "px";
          if (c < this.columns - 1) {
            col.style.marginRight = spacing + "px";
          }
          row.appendChild(col);
          this.cols[c] = col;
        }

        this._colsCreated = true;
      }
    },

    getColWidth: function() {
      if (this.colWidth < 0) {
        var width = domGeom.position(this.container).w;
        return Math.floor(
          (width - (this.columns - 1) * this.spacing) / this.columns
        );
      }
      return this.colWidth;
    },

    getSpacing: function() {
      if (this.spacing < 0) {
        var width = domGeom.position(this.container).w;
        return Math.floor(
          (width - this.columns * this.colWidth) / (this.columns - 1)
        );
      }
      return this.spacing;
    },

    cleanUp: function() {
      this._colsCreated = false;
      this.cols = true;
    },

    onResize: function() {
      this.log.log(0, "onResize", "enter");

      this.cleanUp();

      this.onBeforeResize();

      if (this._list) {
        this.render(this._list);
      }
    }
  },
  mounted() {}
};
</script>