
<template>
  <div class="MatcWidgetTypeTable"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";
import css from "dojo/css";
import touch from "dojo/touch";
import on from "dojo/on";

export default {
  name: "TableWidget",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: null,
      selected: [],
      mode: "edit"
    };
  },
  components: {},
  methods: {
    postCreate () {
      this._borderNodes = [];
      this._backgroundNodes = [this.domNode];
      this._paddingNodes = [];
      this._shadowNodes = [this.domNode];
    },

    wireEvents () {
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onClick")));
      if (this.checkBoxes) {
        this.checkBoxes.forEach((box) => {
          this.own(this.addClickListener(box.div, (e) => {
            this.toggleCheckBox(e, box)
          }))
        })
      }

      this.trs.forEach((tr, i) => {
        this.own(on(tr, touch.over, () => this.onHoverStart(tr,i)))
        this.own(on(tr, touch.out, () => this.onHoverEnd(tr,i)))
      })

      this.trs.forEach((tr, i) => {
        this.own(on(tr, touch.over, () => this.onHoverStart(tr,i)))
        this.own(on(tr, touch.out, () => this.onHoverEnd(tr,i)))
      })

      if (this.model.props && this.model.props.databinding && this.model.props.databinding.action) {
        this.actions.forEach(action => {
          this.own(this.addClickListener(action.div, (e) => this.onActionClick(e, action)))
        })
      }
    },

    onClick (e) {
      this.stopEvent(e);
      this.emitClick(e);
    },

    onActionClick (e, action) {
      this.stopEvent(e);
      if (this.model.props.databinding && this.model.props.databinding.action) {
        this.emitDataBinding(action.action.label, 'action')
      }
      this.emitClick(e);
    },

    toggleCheckBox (e, box) {
      this.stopEvent(e);

      var pos = this.selected.indexOf(box.id);
      if (pos < 0) {
        this.selected.push(box.id);
      } else {
        this.selected.splice(pos, 1);
      }

      if (this.model.props.databinding && this.model.props.databinding.output) {
        this.emitDataBinding(this.selected, 'output')
      }

      this.setSelected(this.selected)
      this.emitClick(e);
    },

    onHoverStart (tr) {
      if (this.style.hoverBackground) {
        tr.style.background = this.style.hoverBackground
      }
      if (this.style.hoverColor) {
        tr.style.color = this.style.hoverColor
      }
      css.add(tr, 'MatcWidgetTypeTableRowHover')
      //FIXME: emit some state
    },

    onHoverEnd (tr, i) {
      let isEven = i % 2 !== 0
      if (this.style.evenRowBackground && isEven) {
        tr.style.background = this.style.evenRowBackground;
      } else {
        tr.style.background = this.style.background
      }

      if (this.style.evenRowColor && isEven) {
        tr.style.color = this.style.evenRowColor;
      } else {
        tr.style.color = this.style.color
      }
      css.remove(tr, 'MatcWidgetTypeTableRowHover')
      //FIXME: emit some state
    },

    setSelected (selected) {
      if (this.checkBoxes) {
        this.checkBoxes.forEach((box) => {
          let id = box.id
          if (selected.indexOf(id) >= 0) {
            css.add(box.div, 'MatcWidgetTypeCheckBoxChecked')
          } else {
            css.remove(box.div, 'MatcWidgetTypeCheckBoxChecked')
          }
        })
      }
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this.props = model.props;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.removeAllChildren(this.domNode)
      // this.domNode.innerHTML = "";
      this.checkBoxes = []
      this.cells = []
      this.trs = []
      this.actions = []

      let data = this.getTable()
      let columns = data.columns
      let rows = data.rows

      let widths = this.getWidths(model.props.widths, this.style, this.props );
      let borderStyle = this.getBorderStyle(model);

      let db = new DomBuilder();
      let table = db.table("MatcWidgetTypeTableBorder" + borderStyle).build();

      if ("Out" == borderStyle || "Cell" == borderStyle) {
        table.style.borderColor = style.borderBottomColor;
        table.style.borderWidth = this._getBorderWidth(style.borderBottomWidth) + "px";
        table.style.borderStyle = "solid";
      }

      // if we have a checkbox we need to add
      // an empty row and also some adjustments to the table
      if (style.checkBox) {
        columns = [''].concat(columns)
        // FIXME: we should only do this if we miss widths. Later we could add this
        // with some handlers
        //widths = [0.10].concat(widths)
        //widths = widths.map(w => w / 1.10)
      }

      if (this.props.tableActions && this.props.tableActions.length > 0) {
        columns = columns.concat([''])
        //let w = 0.2 * this.props.tableActions.length
        //widths = widths.concat([w])
        //widths = widths.map(w => w / (1 + w))
      }

      this.renderHeader(rows, columns, table, style, borderStyle, widths, db)

      this.renderRows(rows, columns, table, style, borderStyle, this.props.tableActions, db)

      this.domNode.appendChild(table);
      this.setStyle(style, model);

      this.renderOddRows(rows, style)
    },

    getWidths (widths,style, props, fontFactor = 0.6) {
      var result = [];
      if (widths) {
        var sum = 0;
        let padding = this._getBorderWidth(style.paddingLeft) + this._getBorderWidth(style.paddingRight)

        if (style.checkBox) {
          let w = style.checkBoxSize ? style.checkBoxSize : style.fontSize
          widths = [w + padding].concat(widths);
        }
        if (props.tableActions && props.tableActions.length > 0) {
          let text = props.tableActions.map(a => a.label).join()
          let w = text.length * style.fontSize * fontFactor + padding * props.tableActions.length
          widths = widths.concat(w)
        }
        for (let i = 0; i < widths.length; i++) {
          sum += widths[i];
        }
        for (let i = 0; i < widths.length; i++) {
          result[i] = widths[i] / sum;
        }
      }
      return result;
    },

    renderHeader (rows, columns, table, style, borderStyle, widths, db) {
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
      if (style.headerTextDecoration) {
        tr.style.textDecoration = style.headerTextDecoration;
      }

      this.renderRowBorder(tr, 0, style, borderStyle, rows.length);

      for (let j = 0; j < columns.length; j++) {
        let td = document.createElement("td");
        td.setAttribute("valign", "top");
        td.textContent = columns[j];
        this.renderCellBorder(td, 0, j, style, borderStyle, rows.length, columns.length);

        tr.appendChild(td);
        this._paddingNodes.push(td);

        if (widths[j]) {
          td.style.width = Math.round(widths[j] * 100) + "%";
        }
      }
    },


    renderOddRows (rows, style) {
      if (style.evenRowBackground || style.evenRowColor) {
        for (let i = 1; i < this.trs.length; i += 2) {
          let tr = this.trs[i];
          tr.style.background = style.evenRowBackground;
          tr.style.color = style.evenRowColor;
        }
      }
    },

    renderRows (rows, columns, table, style, borderStyle, actions, db) {
      let tbody = db.tbody().build(table);
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        this.cells[i] = [];
        let tr = db.element("tr", "MatcWidgetTypeTableRow").build(tbody);
        this.trs.push(tr)
        this.renderRowBorder(tr, i, style, borderStyle, columns.length);

        let start = style.checkBox ? -1 : 0
        for (let j = start; j < row.length; j++) {
          let td = document.createElement("td");
          td.setAttribute("valign", "top");
          if (j === -1) {
            this.renderCheckBox(row, i, td, style, db)
          } else {
            td.textContent = row[j];
          }

          tr.appendChild(td);
          this._paddingNodes.push(td);
          this.renderCellBorder(td, i, j,style, borderStyle, rows.length, columns.length);
          this.cells[i].push(td);

        }


        if (actions && actions.length > 0) {
          let td = document.createElement("td");
          css.add(td, 'MatcWidgetTypeTableActionCntr')
          tr.appendChild(td);

          this.renderCellBorder(td, i, columns.length ,style, borderStyle, rows.length, columns.length);

          actions.forEach(action => {
            let a = db.a('MatcWidgetTypeTableAction', action.label).build(td)
            this._paddingNodes.push(a);
            if (action.color) {
              a.style.color = action.color
            }
            if (action.isHover) {
              css.add(a, 'MatcWidgetTypeTableActionOnlyHover')
            }

            this.actions.push({
              div: a,
              row: row,
              id: i,
              action: action
            })
          })
        }
      }
    },

    renderCheckBox (row, i, td, style, db) {
      let checkBox = db.div('MatcWidgetTypeCheckBox').build(td)
      let hook = db.span('MatcWidgetTypeCheckBoxHook').build(checkBox)

      if (style.checkBoxSize) {
        checkBox.style.width = this._getBorderWidth(style.checkBoxSize) + "px";
        checkBox.style.height = this._getBorderWidth(style.checkBoxSize) + "px";
      } else {
        checkBox.style.width = this._getBorderWidth(style.fontSize) + "px";
        checkBox.style.height = this._getBorderWidth(style.fontSize) + "px";
      }

      if (style.checkBoxHookColor) {
        hook.style.borderColor = style.checkBoxHookColor
      }

      if (style.checkBoxBackground) {
        checkBox.style.background = style.checkBoxBackground
      }

      if (style.checkBoxBorderColor) {
        checkBox.style.borderColor = style.checkBoxBorderColor
      }

      if (style.checkBoxBorderRadius) {
        checkBox.style.borderRadius = this._getBorderWidth(style.checkBoxBorderRadius) + "px";
      }

      if (style.checkBoxBorderWidth) {
        checkBox.style.borderWidth = this._getBorderWidth(style.checkBoxBorderWidth) + "px";
      }

      this.checkBoxes.push({
        div: checkBox,
        row: row,
        td: td,
        id: i
      })
    },

    renderRowBorder (tr, r, style, borderStyle, rows) {
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

    renderCellBorder (td, r, c, style, borderStyle, rows, columns) {
      if ("Cell" === borderStyle) {
        td.style.borderColor = style.borderBottomColor;
        td.style.borderWidth = this._getBorderWidth(style.borderBottomWidth) + "px";
        td.style.borderStyle = "solid";
      }
      if ("VLines" === borderStyle) {
        if (c < columns - 1) {
          td.style.borderRightColor = style.borderBottomColor;
          td.style.borderRightWidth = this._getBorderWidth(style.borderBottomWidth) + "px";
          td.style.borderRightStyle = "solid";
        }
      }
    },

    getBorderStyle (model) {
      if (model.props.borderStyle) {
        return model.props.borderStyle;
      }
      return "Cell";
    },

    getTable () {
      /**
       * FIXME: I am not sure where I am messing with the rows,
       * but I do not clone temp updates will produce blank rows...
       */
      let data = lang.clone(this.parseData(this.model.props.data))
      return {
        columns: data[0],
        rows: data.splice(1)
      }
    },

    parseData (data) {
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
    }
  },
  mounted() {}
};
</script>