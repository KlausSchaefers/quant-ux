
<template>
  <div class="MatcWidgetTypeSortableList">
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";
import {iconDOM} from 'page/QIconUtil'
import DomBuilder from "common/DomBuilder";
import touch from "dojo/touch";
import on from "dojo/on";
import domGeom from "dojo/domGeom";

export default {
  name: "SortableList",
  mixins: [UIWidget, DojoWidget],
  data() {
    return {
      value: [],
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
      this._labelNodes = [];
      this._upNodes = [];
      this._downNodes = [];
      this._rowNodes = []
    },

    async moveDown (i, e) {

      if (i < this.value.length-1) {
        await this.animateTransition(i, i+1)
        const a = this.value[i]
        const b = this.value[i+1]
        this.value[i+1] = a
        this.value[i] = b
      }
      this.renderChildren(this.value)
      this.wireEvents()
      this.onChange(e)
    },

    animateTransition(i,j) {
      return new Promise(resolve => {
        const a = this._rowNodes[i]
        const b = this._rowNodes[j]
        if (a && b) {
          const posA = domGeom.position(a)
          const posB = domGeom.position(b)
          const dif = posA.y - posB.y
          b.style.transform = `translateY(${dif}px)`;
          a.style.transform = `translateY(${-1 * dif}px)`;
          setTimeout(() => {
            resolve()
          }, 500) // keep in sync with widget.css
        } else {
          resolve()
        }
      })
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
      for (let i = 0; i < this._upNodes.length; i++) {
        const node = this._upNodes[i];
        this.tempOwn(this.addClickListener(node, e => this.moveUp(i, e)));
        this.tempOwn(on(node, touch.over, () => this.hoveBtn(node)));
        this.tempOwn(on(node, touch.out, () => this.hoveBtn()));
      }
     
      for (let i = 0; i < this._downNodes.length; i++) {
        const node = this._downNodes[i];
        this.tempOwn(this.addClickListener(node, e => this.moveDown(i, e)));
        this.tempOwn(on(node, touch.over, () => this.hoveBtn(node)));
        this.tempOwn(on(node, touch.out, () => this.hoveBtn()));
      }
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

    arraysEqual(arr1, arr2) {
      if (arr1.length !== arr2.length) return false;
      for (var i = arr1.length; i--; ) {
        if (arr1[i] !== arr2[i]) return false;
      }
      return true;
    },

    render(model, style, scaleX, scaleY) {

      this.model = model;
      this.style = style;
      this.value = model.props.options
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.renderChildren(this.value, style)

    },

    renderChildren (options) {
      this.cleanupRender()
      this.cleanUpTempListener();
      const db = new DomBuilder();
      const cntr = db.div("MatcWidgetTypeSortableListCntr").build()
      for (let i = 0; i < options.length; i++) {
        var o = options[i];
        this.renderChild(o, i, cntr, db, this.style);
      }
      this.domNode.appendChild(cntr)
      this.setStyle(this.style, this.model);
    },

    renderChild (option, i, cntr, db, style) {

        const stroke = style.arrowWidth ? this._getBorderWidth(style.arrowWidth): 2
        const size = this._getBorderWidth(style.fontSize)
        const gap = this._getBorderWidth(style.buttonGap ) + "px";

        const row = db.div("MatcWidgetTypeSortableListItem").build(cntr)
        this._rowNodes.push(row)
        row.style.gap = gap

        const label = db.div("MatcWidgetTypeSortableListItemLabel", option).build(row)
        this._labelNodes.push(label)

        const up = db.div('MatcWidgetTypeSortableListItemBtn').build(row)
        up.style.color = style.arrowColor;

        const upIcon = iconDOM("SortableListUp", '', size, size, stroke)
        upIcon.style.width = size + 'px'
        upIcon.style.height = size + 'px'
        up.appendChild(upIcon);

        this._borderNodes.push(up)
        this._paddingNodes.push(up)
        this._backgroundNodes.push(up)
        this._upNodes.push(up);

        const down = db.div('MatcWidgetTypeSortableListItemBtn').build(row)
        down.style.color = style.arrowColor;

        const downIcon = iconDOM("SortableListDown", '', size, size, stroke)
        downIcon.style.width = size + 'px'
        downIcon.style.height = size + 'px'
        down.appendChild(downIcon);

        this._borderNodes.push(down)
        this._paddingNodes.push(down)
        this._backgroundNodes.push(down)
        this._downNodes.push(down)

    },

    getValue() {
      return this.value;
    },

    _setDataBindingValue(v) {
      if (!v) {
        v = [];
      }
      this.setValue(v);
    },

    setValue(value) {
      if (!value) {
        value = [];
      }

      this.value = value
      this.renderChildren(this.value)
      this.wireEvents()
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
  mounted() {}
};
</script>