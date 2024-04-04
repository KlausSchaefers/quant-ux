
<template>
  <div class="MatcWidgetTypeRadioTable">
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";
//import {iconDOM} from 'page/QIconUtil'
import DomBuilder from "common/DomBuilder";
import css from 'dojo/css'
// import touch from "dojo/touch";
// import on from "dojo/on";
// import domGeom from "dojo/domGeom";

export default {
  name: "SortableList",
  mixins: [UIWidget, DojoWidget],
  data() {
    return {
      value: {},
      styleArrowColor: ''
    };
  },
  computed: {
    arrowStyle () {
      let result = ''
      if (this.styleArrowColor) {
        result += 'color:' + this.styleArrowColor
      }
      return result
    }
  },
  components: {},
  methods: {
    postCreate() {
      this.cleanupRender()
    },

    cleanupRender () {
      this.removeAllChildren(this.domNode)
      // this.domNode.innerHTML = "";
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._paddingNodes=[]
      this._shadowNodes = [];
      this._labelNodes = [this.domNode];
      this._radioNodes = []
      this._hookNodes = []
      this._rowLabelNodes = []
    },

    async moveUp (i, e) {
      if (i > 0) {
        await this.animateTransition(i, i-1)
        const a = this.value[i]
        const b = this.value[i-1]
        this.value[i-1] = a
        this.value[i] = b
      }
      this.renderChildren(this.value)
      this.wireEvents()
      this.onChange(e)
    },
 

    wireEvents () {      
      this._paddingNodes.forEach(node => {
        this.tempOwn(this.addClickListener(node, (e) => this.selectRadio(e, node)));
        // this.tempOwn(on(node, touch.over, () => this.hoveBtn(node)));
        // this.tempOwn(on(node, touch.out, () => this.hoveBtn()));
      })
    },

    selectRadio (e, node) {
      if (node.dataColName !== undefined && node.dataRowName !== undefined) {
        this.value[node.dataRowName] = node.dataColName;
        this.renderChecked(this.value)
      }
      this.onChange(e)
    },

    hoveBtn (node) {

      if (!this.model.hover) {
        return
      }
      if (this.currentHover) {
        this.currentHover.style.color = this.style.arrowColor
        this.currentHover.style.background = this.style.background
        this.setBorderColorForNode(this.currentHover, this.style)
      }
      this.currentHover = node
      if (node) {
        this.currentHover.style.color = this.style.arrowColorHover
        this.currentHover.style.background = this.model.hover.background
        this.setBorderColorForNode(this.currentHover, this.model.hover)
      }

    },
    

    resize() {
      //this.setChildSize(box, this.style, this.scaleX, this.scaleY);
    },


    render(model, style, scaleX, scaleY) {
      this.cleanupRender()
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      if (this.mode === 'simulator' && model.props.randomize) {
        this.shuffleArray(this.value)
      }

      const table = this.db.table().build()
      this.renderHeader(table, model.props.data)
      this.renderRows(table, model.props.data)

      this.setStyle(style, model);
      this.setValue(this.value)
      this.domNode.appendChild(table)
    },

    renderHeader(table, data) {
      const cols = data[0]
      const thead = this.db.thead(cols).build(table)
      return thead
    },

    renderRows (table, data) {
      const tbody = this.db.tbody().build(table)
      this._rowKeys = []
      this._rowRadios = {}
      const header = data[0]
      for (let i = 1; i < data.length; i++) {
        const row = data[i]
        const rowName = row[0]
        const tr = this.db.tr().build(table)

        const labelTD = this.db.td("MatcWidgetTypeRadioTableLabel").build(tr)
        this.db.span("", rowName).build(labelTD);
        this._rowLabelNodes.push(labelTD);
        this._rowKeys[i] = rowName
        this._rowRadios[rowName] = {}

        for (let j=1; j < header.length; j++) {
          const colName = header[j]

          const td = this.db.td("").build(tr)
          const cntr = this.db.div("MatcWidgetTypeRadioCell").build(td)
          cntr.dataRowName = rowName
          cntr.dataColName = colName

          const radio = this.db.div("MatcWidgetTypeRadioBox MatcWidgetTypeRadioBox2 ").build(cntr)
          const hook = this.db.div("MatcWidgetTypeRadioBoxCircle").build(radio)
          this._borderNodes.push(radio)
          this._backgroundNodes.push(radio)
          this._radioNodes.push(radio)
          this._hookNodes.push(hook)
          this._paddingNodes.push(cntr)
          this._shadowNodes.push(radio)

 
          this._rowRadios[row[0]][colName] = radio
        }

      }

      return tbody
    },

    renderChecked (value) {
      this._radioNodes.forEach(node => {
        css.remove(node, "MatcWidgetTypeRadioBoxChecked")
      })
      for (let k in value) {

        if (this._rowRadios[k]) {
          let v = value[k]
          if (this._rowRadios[k][v]) {
            let node = this._rowRadios[k][v]
            css.add(node, "MatcWidgetTypeRadioBoxChecked")
          }
        }
      }
    },

    _set_colorButton(parent, style) {
      const c = style.colorButton
      this._hookNodes.forEach(node => {
        node.style.background = c
      })
    },

    _set_labelWidth(parent, style) {
      const w = this._getBorderWidth(style.labelWidth);
      this._rowLabelNodes.forEach(node => {
        node.style.width = w + 'px'
      })
    },

    _set_radioSize(parent, style) {
        const s = this._getBorderWidth(style.radioSize);
        this._radioNodes.forEach(node => {
          node.style.width = s + "px"
          node.style.height = s + "px"
        })
    },

  
    getValue() {
      return this.value;
    },

    _setDataBindingValue(v) {
      if (!v) {
        v = {};
      }
      this.setValue(v);
    },

    setValue(value) {
      if (!value) {
        value = {};
      }
      this.value = value
      this.renderChecked(this.value)
    },

    getState() {
      return {
        type: "select",
        value: this.value
      };
    },

    setState(state) {
      if (state && state.type == "select") {
        this.setValue(state.value);
      }
    },


    onChange(e) {
      this.stopEvent(e);
      this.emitDataBinding(this.value);
      this.emitStateChange("select", this.value, e);
    }
  },
  mounted() {
    this.db = new DomBuilder();
  }
};
</script>