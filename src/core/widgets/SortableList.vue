
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
import lang from 'dojo/_base/lang'
import css from "dojo/css";

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
      const isOutline = this.style.borderModel === "outline"
      for (let i = 0; i < this._upNodes.length; i++) {
        const node = this._upNodes[i];
        this.tempOwn(this.addClickListener(node, e => this.moveUp(i, e)));
        if (i > 0) {
          this.tempOwn(on(node, touch.over, () => this.hoveBtn(node, isOutline)));
          this.tempOwn(on(node, touch.out, () => this.hoveBtn(null, isOutline)));
        }

      }
     
      for (let i = 0; i < this._downNodes.length; i++) {
        const node = this._downNodes[i];
        this.tempOwn(this.addClickListener(node, e => this.moveDown(i, e)));
        if (i < this._downNodes.length -1 ) {
          this.tempOwn(on(node, touch.over, () => this.hoveBtn(node, isOutline)));
          this.tempOwn(on(node, touch.out, () => this.hoveBtn(null, isOutline)));
        }

      }
    },

    hoveBtn (node, isOutline=false) {

      if (!this.model.hover) {
        return
      }
      if (this.currentHover) {
        this.currentHover.style.color = this.style.arrowColor
        if (!isOutline) {
          this.currentHover.style.background = this.style.background
          this.setBorderColorForNode(this.currentHover, this.style)
        }

      }
      this.currentHover = node
      if (node) {
        this.currentHover.style.color = this.style.arrowColorHover
        if (!isOutline) {
          this.currentHover.style.background = this.model.hover.background
          this.setBorderColorForNode(this.currentHover, this.model.hover)
        }
      }

    },
    

    resize() {
      //this.setChildSize(box, this.style, this.scaleX, this.scaleY);
    },

    render(model, style, scaleX, scaleY) {

      this.model = model;
      this.style = style;
      this.value = model.props.options
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      if (this.mode === 'simulator' && model.props.randomize) {
        this.shuffleArray(this.value)
      }
      
      this.renderChildren(this.value, style)

    },

    renderChildren (options) {
      this.cleanupRender()
      this.cleanUpTempListener();
      const db = new DomBuilder();
      const cntr = db.div("MatcWidgetTypeSortableListCntr").build()
      for (let i = 0; i < options.length; i++) {
        var o = options[i];
        this.renderChild(o, i, options.length, cntr, db, this.style);
      }
      this.domNode.appendChild(cntr)
      this.setStyle(this.style, this.model);
    },

    renderChild (option, i, total, cntr, db, style) {

        const isOutline = style.borderModel === "outline"
        const stroke = style.arrowWidth ? this._getBorderWidth(style.arrowWidth): 2
        const fontSize = this._getBorderWidth(style.fontSize)
        const buttonSize = this._getBorderWidth(style.buttonSize)
        const gap = this._getBorderWidth(style.buttonGap ) + "px";

        const row = db.div("MatcWidgetTypeSortableListItem").build(cntr)
        this._rowNodes.push(row)
        row.style.gap = gap

        const label = db.div("MatcWidgetTypeSortableListItemLabel", option).build(row)
        this._labelNodes.push(label)

        const up = db.div('MatcWidgetTypeSortableListItemBtn').build(row)
        up.style.color = style.arrowColor;
        if (i === 0) {
          css.add(up, 'MatcWidgetTypeSortableListItemBtnPassive')
          up.style.color = style.arrowColorPassive
        }
    

        const upIcon = iconDOM("SortableListUp", '', fontSize, fontSize, stroke)
        upIcon.style.width = buttonSize + 'px'
        upIcon.style.height = buttonSize + 'px'
        up.appendChild(upIcon);
        this._upNodes.push(up);

   

        const down = db.div('MatcWidgetTypeSortableListItemBtn').build(row)
        down.style.color = style.arrowColor;
        if (i === total-1) {
          css.add(down, 'MatcWidgetTypeSortableListItemBtnPassive')
          down.style.color = style.arrowColorPassive
        }

        const downIcon = iconDOM("SortableListDown", '', fontSize, fontSize, stroke)
        downIcon.style.width = buttonSize + 'px'
        downIcon.style.height = buttonSize + 'px'
        down.appendChild(downIcon);
        this._downNodes.push(down)

        if (isOutline) {
          this._borderNodes.push(row)
          this._paddingNodes.push(row)
          this._backgroundNodes.push(row)
          this._shadowNodes.push(row)
        } else {

          this._borderNodes.push(down)
          this._paddingNodes.push(down)
          this._backgroundNodes.push(down)
          this._shadowNodes.push(down)

          this._borderNodes.push(up)
          this._paddingNodes.push(up)
          this._backgroundNodes.push(up)
          this._shadowNodes.push(up)
        }

    },

    getValue() {
      return this.value;
    },

    _setDataBindingValue(v) {
      if (!v) {
        v = [];
      }
      this.setValue(v, true);
    },

    async setValue(value, animate = false) {
      if (!value) {
        value = [];
      }

      if (this.arraysEqual(value, this.value)) {
        return
      }

      if (this.animationRunning) {
        return
      }

      if (animate) {
       
        const differentPositions = new Set()
        this.value.forEach((v, i) => {
          const j = value.indexOf(v)

          if (j !== i) {
            differentPositions.add(j)
            differentPositions.add(i)
          }

        })
        if (differentPositions.size === 2) {
          const pos = [...differentPositions]
           // a little buggy in the video player. Maybe it schedules too many changes??
          this.animationRunning = true
          await this.animateTransition(pos[0], pos[1])
          this.animationRunning = false
        }     
      }
      this.value = lang.clone(value)
      this.renderChildren(this.value)
      if (this.mode === 'simulator') {
        this.wireEvents()
      }
    },

    arraysEqual(arr1, arr2) {
      if (arr1.length !== arr2.length) return false;
      for (let i = arr1.length; i--; ) {
        if (arr1[i] !== arr2[i]) return false;
      }
      return true;
    },

    getState() {
      return {
        type: "select",
        value: this.value
      };
    },

    setState(state) {
      if (state && state.type == "select") {
        this.setValue(state.value, true);
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