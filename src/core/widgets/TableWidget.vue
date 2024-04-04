
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
      this.wireHover()
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

      const pos = this.selected.indexOf(box.id);
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

    onInputChange (r, c, value) {
      console.debug('onInputChange', r, c, value)
      if (this.value) {
        //const isArray = this.isArrayOfArray(this.value)
      }
      
      // FIXME find out if we have data binding???
      // if see, chekc if isArrray?
    },

    rerender () {
      this.render(this.model, this.style, this._scaleX, this._scaleY)
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this.props = model.props;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.cleanUpTempListener()
      this.removeAllChildren(this.domNode)
  
      this.checkBoxes = []
      this.cells = []
      this.trs = []
      this.actions = []

      const data = this.getTable()
      const columns = this.getColumns(data, style)
      const rows = data.rows

      const widths = this.getWidths(model.props, this.style);
      const borderStyle = this.getBorderStyle(model);
   
      const db = new DomBuilder();
      const tableHeader = this.renderTable(db, style, borderStyle)
      this.renderHeader(rows, columns, tableHeader, style, borderStyle, widths, db)
      this.renderRows(rows, columns, tableHeader, style, borderStyle, this.props.tableActions, db)
      this.domNode.appendChild(tableHeader);


      // FIXME: add pagination?

      this.setStyle(style, model);
      this.renderOddRows(rows, style)
    },

    renderTable (db, style , borderStyle) {
      const table = db.table("MatcWidgetTypeTableBorder" + borderStyle).build();
      if ("Out" == borderStyle || "Cell" == borderStyle) {
        table.style.borderColor = style.borderBottomColor;
        table.style.borderWidth = this._getBorderWidth(style.borderBottomWidth) + "px";
        table.style.borderStyle = "solid";
      } else {
        table.style.border='none'
      }
      return table
    },

   
    renderHeader (rows, columns, table, style, borderStyle, widths, db) {

      // since 4.0.70 we have stikcy headers
      let tr = db
        .element("thead", style.headerSticky ? 'MatcWidgetTypeTableSticky': '')
        .element("tr")
        .build(table);


      this.setHeaderStyle(tr, style)

      this.renderRowBorder(tr, 0, style, borderStyle, rows.length);

      /**
       * 3.0.19. Bulma set somehow stupid default table widths!
       */
      const fontSize = this._getBorderWidth(style.fontSize) + 'px'

      for (let j = 0; j < columns.length; j++) {
        const td = document.createElement("td");
        td.setAttribute("valign", "top");
        td.textContent = columns[j].label;
        td.style.fontSize = fontSize

        this.renderCellBorder(td, 0, j, style, borderStyle, rows.length, columns.length);

        if (style.headerBottomBorderWidth) {
          td.style.borderBottomWidth = style.headerBottomBorderWidth + 'px'
        }

        tr.appendChild(td);
        this._paddingNodes.push(td);

        if (widths[j]) {
          this.setCellWidth(td, widths[j])
        }
      }
    },

    setCellWidth (td, width) {
      td.style.width = Math.round(width * 100) + "%";
    },


    setHeaderStyle (tr, style) {
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
        this.renderRowBorder(tr, i, style, borderStyle, rows.length);

        let start = style.checkBox ? -1 : 0
        for (let j = start; j < row.length; j++) {
          const colNumber = j-start // because of start slack
          let td = document.createElement("td");
          td.setAttribute("valign", "top");

          this.setColumnColor(td, columns, colNumber)

        
          if (j === -1) {
            this.renderCheckBox(row, i, td, style, db)
            this._paddingNodes.push(td);
          } else {
            if (columns[colNumber]?.isEditable) {
              const input = db.input('MatcWidgetTypeTableInput').build(td)
              input.value = row[j];
              this._paddingNodes.push(input);
              this.tempOwn(on(input, 'change', (e => this.onInputChange(i, j, input.value, e))))
            } else {
              td.textContent = row[j];
              this._paddingNodes.push(td);
            }
          }

          tr.appendChild(td);
        
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
            if (action.background) {
              a.style.background = action.background
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

    setColumnColor (td, columns, j) {
      if (columns[j] && columns[j].color) {
        td.style.color = columns[j].color
      }

      if (columns[j] && columns[j].background) {
        td.style.background = columns[j].background
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
        const width = this._getBorderWidth(style.borderBottomWidth) + 'px'
        if (c < columns - 1) {
          td.style.borderRightColor = style.borderBottomColor;
          td.style.borderRightWidth =  width
          td.style.borderRightStyle = "solid";
        }
        if (r < rows -1) {
          td.style.borderBottomColor = style.borderBottomColor;
          td.style.borderBottomWidth =  width
          td.style.borderBottomStyle = "solid";
        }
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
      let table = this.getCVSData()
      // since 4.0.70 we support data binding
      if (this.value) {
        table = this.getDataBindingTable(table)
      }
      return table
    },

    getCVSData() {
      const data = lang.clone(this.parseData(this.model.props.data))
      const table = {
        columns: data[0].map(c => {
          return {
            label: c,
            isEditable: false,
            isSortable: false,
            isSearchable: false
          }
        }),
        rows: data
      }

      if (this.model.props.columns) {

        table.columns = this.model.props.columns
        this.model.props.columns.forEach((c,i) => {
          table.rows.forEach(r => {
            if (r[i] === undefined) {
              r[i] = "-"
            }
          }) 
        })
      } else {
        table.rows = table.rows.splice(1)
      }

      // since 4.0.70 we overwrite columns
      //this.setTabelColumns(table)
      return table
    },

    setTabelColumns (table) {
      if (this.model.props.columns) {
        this.model.props.columns.forEach((c,i) => {
          if (table.columns[i]) {
           
            table.columns[i].isEditable = c.isEditable
            table.columns[i].isSortable = c.isSortable
            table.columns[i].isSearchable = c.isSearchable
            table.columns[i].databinding = c.databinding
            table.columns[i].color = c.color
            table.columns[i].background = c.background
          }
        })
      }
      return table
    },


    getDataBindingTable (table) {
        // remove csv data, header come still from cvs!
        table.rows = []

        // 2) for obejct we just take the values
        let value = this.value
        if (lang.isObject(value)) {
          value = Object.values(value)
        }

        // 3) now we loop. We need to know if children are
        // objects or arrays
        const isArray = this.isArrayOfArray(value)
        value.forEach(row => {
          let values = []
          table.columns.forEach((col,i) => {
              if (isArray) {
                values.push(row[i])
              } else if (col.databinding) {
                values.push(row[col.databinding])
              } else {
                let key = col.label
                if (!row[key]) {
                  key = key.toLowerCase()
                }
                values.push(row[key])
              }
          })
          table.rows.push(values)
        })
      
        return table      
    },

    isArrayOfArray (value) {
      if (Array.isArray(value)) {
        let child = value[0]
        return Array.isArray(child)
      }
      return false
    },

    parseData (data) {
      /**
       * for now assume csv
       */
      if (data.substring) {
        const table = [];
        const lines = data.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          table.push(line.split(","));
        }
        return table;
      }
      // FIXME: check for Array of Dicts
      return data;
    },

     getColumns (data, style) {
      let columns = data.columns

      // if we have a checkbox we need to add
      // an empty row and also some adjustments to the table
      if (style.checkBox) {
        columns = [''].concat(columns)
      }

      if (this.props.tableActions && this.props.tableActions.length > 0) {
        columns = columns.concat([''])
      }
      return columns
    },

    getRowHeight(style) {
      const h = this._getBorderWidth(style.fontSize) + 
              this._getBorderWidth(style.paddingLeft) + 
              this._getBorderWidth(style.paddingRight) + 
              this._getBorderWidth(style.borderBottomWidth) + 
              this._getBorderWidth(style.borderTopWidth) 
      
      return h
    },

    getWidths (props, style, fontFactor = 0.6) {
      const result = [];
      
      let widths = this.getRawWidths(props)
      if (widths) {
        let sum = 0;
        const padding = this._getBorderWidth(style.paddingLeft) + this._getBorderWidth(style.paddingRight)

        if (style.checkBox) {
          const w = style.checkBoxSize ? style.checkBoxSize : style.fontSize
          widths = [w + padding].concat(widths);
        }
        if (props.tableActions && props.tableActions.length > 0) {
          const text = props.tableActions.map(a => a.label).join()
          const w = text.length * style.fontSize * fontFactor + padding * props.tableActions.length
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

    getRawWidths (props) {
      let widths = []
      if (props.columns) {
        props.columns.forEach((col, i) => {
          if (col.width) {
            widths[i] = col.width * 1
          }
        })
      }
      return widths
    },

    setValue (value) {
      this.value = value
      this.rerender()
    }
  },
  mounted() {}
};
</script>