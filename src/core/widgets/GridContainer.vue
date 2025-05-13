<template>
  <div class="MatcWidgetTypeGridContainer">

    <div :class="'MatcWidgetTypeGridContainerCntr ' + layout" :style="{
      'row-gap': rowGap + 'px',
      'column-gap': columnGap + 'px',
      'grid-template-columns': 'repeat(' + this.columns  +', ' + cellW + 'px)',
      'grid-auto-rows': 'repeat(' + this.rows  +', ' + cellH + 'px)',
    }">
      <div v-for="(i) in cells" 
        :key="i" 
        :class="['MatcWidgetTypeGridContainerPlaceholder']"  
        :style="{
          'width': cellW +'px', 
          'height': cellH + 'px'
        }" >  
      </div>
    </div>

  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
//import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";
import Logger from 'common/Logger'

export default {
  name: "GridContainer",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      value: null,
      cells: 0,
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
      this.rows = this.model.props.rows
      this.columns = this.model.props.columns
      this.cells = this.rows * this.columns
     
      this.columnGap = Math.floor(this.model.props.columnGap * this._scaleX)
      this.rowGap = Math.floor(this.model.props.rowGap * this._scaleY)

      let spaceW = box.w - Math.floor((style.paddingLeft + style.paddingRight) * this._scaleX)
      let spaceH = box.h - Math.floor((style.paddingTop + style.paddingBottom) * this._scaleY)
      let totalColumnGap = (this.columns - 1) * this.columnGap
      let totalRowGap = (this.rows - 1) * this.rowGap

      this.cellW = Math.floor((spaceW - totalColumnGap) / this.columns)
      this.cellH = Math.floor((spaceH - totalRowGap) / this.rows)

    },

    render(model, style, scaleX, scaleY) {

      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

  
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

    getMouse(e) {
      const result = {};
      result.x = e.pageX;
      result.y = e.pageY;
      return result;
    },

    getState() {
      return {
        type: "select",
        value: this.selection,
      };
    },

    setState(state) {
      if (state.type === 'select') {
        const selection = new Set(state.value)
        for (let i = 0; i < this.images.length; i++) {
          const img = this.images[i]
          if (selection.has(i)) {
            img.selected = true
          } else {
            img.selected = false
          }
        }
        this.resetStyles()
      }
    },

    cleanUp() {

    },

    destroy() {
      if (this._compositeState) {
        this.emitCompositeState();
      }
      this.cleanUp();
    },
  },
  mounted() {
    this.logger = new Logger('ImageGrid')
  },
};
</script>