<template>
  <div class="MatcWidgetTypeGridContainer">

      <div v-for="(c,i) in cells" 
        :key="i" 
        :class="['MatcWidgetTypeGridContainerPlaceholder']"  
        :style="{
          'width': c.w +'px', 
          'height': c.h + 'px',
          'left': c.x + 'px',
          'top': c.y + 'px' 
        }" > 
      </div>

  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
//import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";
import * as GridUtil from "../GridUtil";
import Logger from 'common/Logger'


export default {
  name: "GridContainer",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      value: null,
      cells: [],
      columns: 0,
      rows: 0,
      rowGap: 0,
      columnGap: 0,
      layout: 'grid',
      borderRadius: 0,
      cellW: 100,
      cellH: 100
    };
  },
  components: {},
  methods: {
    postCreate() {
      this._borderNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
    },

    wireEvents() {
      this.wired = true;
      console.debug('wireEvents', this.wired)
    },

    resize(box) {
      const style = this.style

      const borderTopWidth = Math.floor(style.borderTopWidth * this._scaleY)
      const borderLeftWidth = Math.floor(style.borderLeftWidth * this._scaleX)

      const updatedModel = {
        x: box.x,
        y: box.y,
        h: box.h,
        w: box.w,
        id: this.model.id,
        name: this.model.name,
        style: this.style,
        props: this.model.props
      }

      const lines = GridUtil.getGridContainerLines(updatedModel, 'All', this._scaleX, true)
      const cells = GridUtil.getCells(lines)
      const offsetX = box.x + borderLeftWidth
      const offsetY = box.y + borderTopWidth
      for (let i=0; i < cells.length; i++) {
        const c = cells[i]
        this.cells[i] = {
          x: c.x - offsetX,
          y: c.y - offsetY,
          w: c.w,
          h: c.h
        }
      }
     
      this.$forceUpdate()
    },

  

    resizeOld(box) {
      const style = this.style

      this.columnGap = Math.floor(this.model.props.columnGap * this._scaleX)
      this.rowGap = Math.floor(this.model.props.rowGap * this._scaleY)


      const paddingLeft = Math.floor(style.paddingLeft * this._scaleX)
      const paddingRight = Math.floor(style.paddingRight * this._scaleX)
      const paddingTop = Math.floor(style.paddingTop * this._scaleY)
      const paddingBottom = Math.floor(style.paddingBottom * this._scaleY)

      const borderBottomWidth = Math.floor(style.borderBottomWidth * this._scaleY)
      const borderTopWidth = Math.floor(style.borderTopWidth * this._scaleY)
      const borderLeftWidth = Math.floor(style.borderLeftWidth * this._scaleX)
      const borderRightWidth = Math.floor(style.borderRightWidth * this._scaleX)

      let spaceW = box.w - (paddingLeft + paddingRight + borderRightWidth + borderLeftWidth) 
      let spaceH = box.h - (paddingTop + paddingBottom + borderTopWidth + borderBottomWidth)
      let totalColumnGap = (this.columns - 1) * this.columnGap
      let totalRowGap = (this.rows - 1) * this.rowGap

      this.cellW = Math.floor((spaceW - totalColumnGap) / this.columns)
      this.cellH = Math.floor((spaceH - totalRowGap) / this.rows)


      let i = 0
      let y = paddingTop
      for (let r=0; r < this.rows; r++) {        
        let x = paddingLeft 
        for (let c=0; c < this.columns; c++) {   
          const cell = this.cells[i] 
          cell.w = this.cellW
          cell.h = this.cellH
          cell.x = x
          cell.y = y
          i++
          x += this.cellW + this.columnGap
          //this.$set(this.cells, i, cell)
        }
        y += this.cellH + this.rowGap
      }
      // find out why this does not auto render
      this.$forceUpdate()
    },

    render(model, style, scaleX, scaleY) {

      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.rows = this.model.props.rows
      this.columns = this.model.props.columns
      this.cells = []
      for (let i=0; i < this.rows * this.columns; i++) {
          this.cells[i] = {
            w: 0,
            h: 0,
            x: 0,
            y: 0
          }
      }
      this.layout = this.model.props.layout      
      this.setStyle(style);
      this.resize(this.model);
    },

  
    getValue() {
      return this.value;
    },

    setValue(v) {
      this.value = v
    },

    getState() {
      return {
      };
    },

    setState() {
    },

    cleanUp() {

    },

    destroy() {
      this.cleanUp();
    },
  },
  mounted() {
    this.logger = new Logger('GridContainer')
  },
};
</script>