
<template>
  <div class="vommondTable">
    <div class="MatcLoading">Loading...</div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import on from "dojo/on";
import lang from "dojo/_base/lang";
import touch from "dojo/touch";
import Logger from "common/Logger";
import DomBuilder from "common/DomBuilder";
import {iconDOM} from "../page/QIconUtil";

export default {
  name: "Table",
  mixins: [DojoWidget],
  data: function() {
    return {
      itemsPerPage: 100,
      itemPointer: 0,
      isSortable: true,
      order: true,
      hasPaging: false,
      totalCount: 0,
      columns: null,
      actions: null,
      rows: [],
      actionLabel: "Action"
    };
  },
  components: {},
  methods: {
    postCreate: function() {
      this.logger = new Logger("Table");
      this.logger.log(2, "constructor", "entry");
      this.actionLabel = this.getNLS("table.action");
    },

    setColumns: function(columns) {
      this.columns = columns;
    },

    setPaging: function(paging) {
      this.hasPaging = paging;
    },

    setPagingSize: function(itemsPerPage) {
      this.itemsPerPage = itemsPerPage;
    },

    setActions: function(actions) {
      this.actions = actions;
    },

    setValue: function(data) {
      this.logger.log(8, "setValue", "entry");
      this.rows = data;
      this.totalCount = data.length
      this.render();
      this.logger.log(10, "setValue", "exit");
    },

    render: function() {
      this.logger.log(
        2,
        "_refresh",
        "entry > pos : " + this.itemPointer + " _sortBy : " + this.sortBy
      );

      /**
       * clean up
       */
      this.cleanUpTempListener();
      this.domNode.innerHTML = "";

      var db = new DomBuilder();

      var table = db.table("table is-hoverable").build();

      this.renderHeader(table, db);

      this.renderBody(table, db);

      this.domNode.appendChild(table);

      // add paging...
      if (this.hasPaging) {
        this.createPagging();
      }
    },

    renderHeader: function(table, db) {
      var thead = db.element("thead").build(table);

      var header = db.element("tr").build(thead);

      for (var i = 0; i < this.columns.length; i++) {
        var column = this.columns[i];

        var td = db.td().build(header);

        if (column.width) {
          td.style.width = column.width + "%";
        }
        var label = column.label;

        if (this.isSortable) {
          var a = db.a("", label).build(td);

          //a.setAttribute("column",column);
          this.tempOwn(on(a, touch.press, lang.hitch(this, "_sort", column)));

          var span = db.span("vommondTableSortSymbol").build(td);
          if (this.sortBy == column.query) {
            if (this.order) {
              span.innerHTML =
                '<span class="mdi mdi-chevron-up"></span>';
            } else {
              span.innerHTML =
                '<span class="mdi mdi-chevron-down"></span';
            }
          } else {
            span.innerHTML = " ";
          }
        } else {
          td.innerHTML = label;
        }
      }

      if (this.actions) {
        db.td("action", this.actionLabel).build(header);
      }
    },

    renderBody: function(table, db) {
      this.logger.log(2, "createDataRows", "entry ");

      var tbody = db.element("tbody").build(table);

      var count = 0;
      var me = this;
      this.rows.forEach(function(row) {
        me.renderRow(row, tbody, count, db);
        count++;
      });
    },

    renderRow: function(row, tbody, j, db) {
      this.logger.log(4, "renderRow", "entry ");

      let tr = db.element("tr", "dataRow").build(tbody);
      if (j % 2 == 0) {
        css.add(tr, "evenRow");
      }

      // add data
      for (let i = 0; i < this.columns.length; i++) {
        let column = this.columns[i];

        let td = db.td(column.css, "").build(tr);
        if (column.edit) {
          let input = db.input("vommondInlineEdit").build(td);
          this.setInputValue(input, row, column);
          this.tempOwn(
            on(input, "change", lang.hitch(column, "edit", input, row, i))
          );
        } else {
          this.setTDValue(td, row, column);
        }
      }
      // add actions
      if (this.actions) {
        let td = db.td("action").build(tr);
        for (let i = 0; i < this.actions.length; i++) {
          let action = this.actions[i];

          if (action.render) {
            action.render(td, row, j);
          } else {
            let a = db.a(action.css, action.label).build(td);

            if (action.icon) {
              a.appendChild(iconDOM(action.icon))
            }
            if (action.callback) {
              this.tempOwn(
                on(a, touch.press, lang.hitch(action, "callback", row, j, td))
              );
            }
          }
        }
      }
    },

    setTDValue: function(td, row, column) {
      if (column.fct) {
        column.fct(td, row, column.query);
      } else {
        var value = row[column.query];
        if (value == null || value == undefined) {
          value = "-";
        }
        td.innerHTML = value + " ";
        if (column.suffix) {
          td.innerHTML += column.suffix;
        }
      }
    },

    setInputValue: function(td, row, column) {
      if (column.fct) {
        column.fct(td, row, column.query);
      } else {
        td.value = row[column.query] + " ";
      }
    },

    createPagging: function() {
      this.logger.log(
        -3,
        "createPagging",
        "entry > total : " +
          this.totalCount +
          " >  page : " +
          this.itemsPerPage +
          " > current:  " +
          this.itemPointer
      );

      if (this.totalCount > this.itemsPerPage) {
        var div = document.createElement("div");
        css.add(div, "pagination pagination-small");

        var ul = document.createElement("ul");
        div.appendChild(ul);
        var steps = Math.ceil(this._totalCount / this.itemsPerPage);
        for (var i = 0; i < steps; i++) {
          let li = document.createElement("li");
          ul.appendChild(li);
          li.innerHTML = i + 1 + "";
          if (i * this.itemsPerPage == this.itemPointer) {
            css.add(li, "active");
          } else {
            var connection = on(
              li,
              "click",
              lang.hitch(this, "setPos", i * this.itemsPerPage)
            );
            this.tempOwn(connection);
          }
        }
        this.domNode.appendChild(div);
      }
    },

    setPos: function(newValue) {
      this.logger.log(3, "setPos", "entry > pos : " + newValue);

      if (newValue != this.itemPointer) {
        this.itemPointer = newValue;
        this._updateRows();
        this._refresh();
      }
    },

    onBackward: function(event) {
      this.logger.log(3, "onBackward", "entry");
      this.stopEvent(event);
      this.itemPointer = Math.max(this.itemPointer - this.itemsPerPage, 0);
      this._updateRows();
      this._refresh();
    },

    onForward: function(event) {
      this.logger.log(
        3,
        "onForward",
        "entry > currentPos : " +
          this.itemPointer +
          ">  newPos : " +
          (this.itemPointer + this.itemsPerPage)
      );
      this.stopEvent(event);
      this.itemPointer = this.itemPointer + this.itemsPerPage;
      this._updateRows();
      this._refresh();
    },

    _sort: function(sortBy) {
      this.order = !this.order;
      this.sortBy = sortBy.query;

      this._updateRows();

      this.render();
    },

    _updateRows: function() {
      let key = this.sortBy;
      let order = this.order ? 1 : -1;
      this.rows = this.rows.sort((a, b) => {
        let valueA = a[key];
        let valueB = b[key];
        if (valueA.localeCompare && valueB.localeCompare) {
          return order * valueA.localeCompare(valueB);
        }
        return order * (valueA - valueB);
      });
    },

    _refresh: function() {
      this.render();
    },

    sort: function() {
      this._updateRows();
    },

    destroy: function() {}
  },
  mounted() {}
};
</script>