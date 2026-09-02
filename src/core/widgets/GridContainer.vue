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
      this.cells = []
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