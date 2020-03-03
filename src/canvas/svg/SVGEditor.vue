<template>
  <div class="MatcCanvasVector" :style="{'width': width + 'px', 'height': height + 'px'}" 
    @click="onMouseClick" 
    @mousemove="onMouseMove"
    @dblclick="onDoubleClick">
    <svg id="svg" xmlns="http://www.w3.org/2000/svg" :width="width" :height="height">
        <g id="main" fill="none">

            <path v-for="p in paths" 
                :key="p.id" 
                :d="p.d" 
                :stroke="p.stroke" 
                :fill="p.fill"
                @mouseover="onPathHover(p, $event)"
                @mouseout="onPathBlur(p, $event)"
                :stroke-width="p.strokeWidth"/>

            <!-- 
                Add here a transparent click layer. 
                FIXME: Just show for the thing lines?
            -->
            <template v-if="mode === 'select'">
                <path v-for="p in paths" 
                    :key="p.id + 's'" 
                    :d="p.d" 
                    stroke="rgba(0,0,0,0)"
                    @mouseover="onPathHover(p, $event)"
                    @mouseout="onPathBlur(p, $event)"
                    @click.stop="onPathClick(p, $event)"
                    fill="" 
                    :stroke-width="p.strokeWidth + 2"/>

            </template>


        </g>
    </svg>
  </div>
</template>

<style>
</style>

<script>

import PathTool from './PathTool'
import SelectTool from './SelectTool'
import SVGRuler from './SVGRuler'
import Logger from 'common/Logger'

export default {
  name: "SVgEditor",
  mixins: [],
  props: ['width', 'height', 'pos'],
  data: function() {
    return {
        value: [],
        mode: 'add',
        hover: null,
        selection: [],
        colorHover: 'red',
        colorSelect: 'blue'
    };
  },
  computed: {
      paths () {
          let result = this.value.map(path => {
              let svg = {
                  id: path.id,
                  stroke: path.stroke,
                  strokeWidth: path.strokeWidth,
                  fill: path.fill,
                  d: ''
              }
              if (path.d) {
                  svg.d = path.d.map(point => {
                      return `${point.t}${point.x},${point.y}`
                  }).join(' ')
              }
              if (this.hover === path.id) {
                  svg.stroke = this.colorHover
              }
              if (this.selection.indexOf(path.id) >=0 ) {
                  svg.stroke = this.colorSelect
              }
              // console.debug(svg.d)
              return svg
          })
          return result
      }
  },
  components: {
  },
  methods: {

    onPathBlur () {
        if (this.currentTool) {
            this.currentTool.onBlur()
        }
    },

    onPathHover (path) {
        if (this.currentTool) {
            this.currentTool.onHover(path)
        }
    },

    onPathClick (path) {
        this.select(path.id)
    },

    onMouseClick (e) {
        let pos = this.getCanvasMousePosition(e)
        this.logger.log(-1, 'onMouseClick ', 'enter', pos)
        if (this.currentTool) {
            this.currentTool.onClick(pos)
        }
    },

    onMouseMove (e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onMove(pos)
        }
        this.$emit('qmouse', pos)
    },

    onDoubleClick (e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onDoubleClick(pos)
            // check if we added something. If see,
            // do the skecth kind of vector editing
            // https://bl.ocks.org/mbostock/8027637
            // https://stackoverflow.com/questions/2742610/closest-point-on-a-cubic-bezier-curve/44993719#44993719
            delete this.currentTool
            this.startSelectTool()
        }
    },

    onEsc () {
        if (this.currentTool) {
            this.currentTool.onEsc()
        }
    },

    startSelectTool () {
        this.logger.log(-1, 'startPathTool ', 'enter')
        this.mode = 'select'
        this.currentTool = new SelectTool(this)
    },

    startPathTool (pos) {
        this.logger.log(-1, 'startPathTool ', 'enter', pos)
        this.mode = 'add'
        this.currentTool = new PathTool(this)
        if (pos) {
            this.currentTool.onClick(pos)
        }
        this.initRuler(this.selection)
    },

    setHover (id) {
        this.hover = id
    },

    select (id) {
        this.logger.log(-1, 'select ', id)
        this.selection= [id]
    },

    unSelect () {
        this.selection = []
    },

    initRuler (selection) {
        this.ruler = new SVGRuler(this.value, selection)
    },

    getCanvasMousePosition (e){
        var pos = this._getMousePosition(e);
        pos.x -= this.pos.x;
        pos.y-= this.pos.y;
        if (this.ruler) {
            pos = this.ruler.correct(pos)
        }
        return pos;
    },
    
    _getMousePosition: function(e){
        var result = {x: 0, y: 0};
        if (e) {
            if (e.touches && e.touches.length > 0) {
                e = e.touches[0]
                result.x = e.clientX;
                result.y = e.clientY;
            } else if (e.changedTouches && e.changedTouches.length > 0 ) {
                e = e.changedTouches[0]
                result.x = e.clientX;
                result.y = e.clientY;
            } else {
                result.x = e.pageX;
                result.y = e.pageY;
            }
        } 
        return result;
    }
  },
  watch: {
      pos (p) {
          this.pos = p
      }
  },
  mounted() {
    this.logger = new Logger('SVGEditor')
    this.startPathTool()
  }
};
</script>