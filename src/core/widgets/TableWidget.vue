
<template>
  <div class="MatcWidgetTypeTable"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "TableWidget",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: null,
      mode: "edit"
    };
  },
  components: {},
  methods: {
    postCreate: function() {
      this._borderNodes = [];
      this._backgroundNodes = [this.domNode];
      this._paddingNodes = [];
      this._shadowNodes = [this.domNode];
    },

    wireEvents: function() {
      this.own(
        this.addClickListener(this.domNode, lang.hitch(this, "onClick"))
      );
    },

    onClick: function(e) {
      this.stopEvent(e);
      this.emitClick(e);
    },

    render: function(model, style, scaleX, scaleY) {
      // On (re)render ( called when style or props are updated)
      // make sure things are properly cleaned up.
      this.domNode.innerHTML = "";
      this.model = model;
      this.style = style;
      let data = this.parseData(model.props.data);
      let widths = this.getWidths(data, model.props.widths);
      let borderStyle = this.getBorderStyle(model);
      let db = new DomBuilder();
      let table = db.table("MatcWidgetTypeTableBorder" + borderStyle).build();

      if ("Out" == borderStyle || "Cell" == borderStyle) {
        table.style.borderColor = style.borderBottomColor;
        table.style.borderWidth =
          this._getBorderWidth(style.borderBottomWidth) + "px";
        table.style.borderStyle = "solid";
      }

      let headerTDs = [];
      let bodyTDs = [];
      if (data.length > 0) {
        let header = data[0];
        let tr = db
          .element("thead")
          .element("tr")
          .build(table);
        tr.style.color = style.headerColor;
        tr.style.background = style.headerBackground;

        if (style.headerFontStyle) {
          tr.style.fontStyle = style.headerFontStyle;
        }
        if (style.headerFontWeight) {
          tr.style.fontWeight = style.headerFontWeight;
        }

        this.renderRowBorder(tr, 0, style, borderStyle, data.length);

        for (let j = 0; j < header.length; j++) {
          let td = document.createElement("td");
          td.setAttribute("valign", "top");

          td.innerHTML = header[j];
          this.renderCellBorder(td, 0, j, style, borderStyle, data.length, header.length);
          //this._borderNodes.push(td);

          tr.appendChild(td);
          this._paddingNodes.push(td);
          headerTDs.push(td);

          if (widths[j]) {
            td.style.width = Math.round(widths[j] * 100) + "%";
          }
        }
      }
      if (data.length > 1) {
        let tbody = db.tbody().build(table);
        for (let i = 1; i < data.length; i++) {
          let row = data[i];
          bodyTDs[i] = [];
          let tr = db.element("tr").build(tbody);
          this.renderRowBorder(tr, i, style, borderStyle, data.length);

          for (let j = 0; j < row.length; j++) {
            let td = document.createElement("td");
            td.setAttribute("valign", "top");
            td.innerHTML = row[j];
            tr.appendChild(td);
            this._paddingNodes.push(td);
            this.renderCellBorder(td, i, j,style, borderStyle, data.length, row.length);
            bodyTDs[i].push(td);
          }
        }
      }

      this.domNode.appendChild(table);

      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model);

      if (style.evenRowBackground || style.evenRowColor) {
        for (let i = 2; i < data.length; i += 2) {
          let tds = bodyTDs[i];
          for (let j = 0; j < tds.length; j++) {
            let td = tds[j];
            td.style.background = style.evenRowBackground;
            td.style.color = style.evenRowColor;
          }
        }
      }
    },

    renderRowBorder: function(tr, r, style, borderStyle, rows) {
      if ("HLines" == borderStyle) {
        tr.style.border = "none";
        if (r < rows - 1) {
          tr.style.borderBottomColor = style.borderBottomColor;
          tr.style.borderBottomWidth =
            this._getBorderWidth(style.borderBottomWidth) + "px";
          tr.style.borderBottomStyle = "solid";
        }

        return;
      }
    },

    renderCellBorder: function(td, r, c, style, borderStyle, rows, columns) {
      if ("Cell" == borderStyle) {
        td.style.borderColor = style.borderBottomColor;
        td.style.borderWidth =
          this._getBorderWidth(style.borderBottomWidth) + "px";
        td.style.borderStyle = "solid";
      }
      if ("VLines" == borderStyle) {
        if (c < columns - 1) {
          td.style.borderRightColor = style.borderBottomColor;
          td.style.borderRightWidth =
            this._getBorderWidth(style.borderBottomWidth) + "px";
          td.style.borderRightStyle = "solid";
        }
      }
    },

    getBorderStyle: function(model) {
      if (model.props.borderStyle) {
        return model.props.borderStyle;
      }
      return "Cell";
    },

    parseData: function(data) {
      /**
       * for now assume csv
       */
      if (data.substring) {
        var table = [];
        var lines = data.split("\n");
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          table.push(line.split(","));
        }
        return table;
      } else {
        return data;
      }
    },

    getWidths: function(data, widths) {
      var result = [];
      if (widths) {
        var sum = 0;
        for (let i = 0; i < widths.length; i++) {
          sum += widths[i];
        }
        for (let i = 0; i < widths.length; i++) {
          result[i] = widths[i] / sum;
        }
      }
      return result;
    }
  },
  mounted() {}
};
</script>