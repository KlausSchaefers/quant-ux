<template>
  <div class="MatcCanvasVector" :style="{'width': width + 'px', 'height': height + 'px'}" 
    @click="onMouseClick" 
    @mousemove="onMouseMove"
    @dblclick="onDoubleClick">
    <svg id="svg" xmlns="http://www.w3.org/2000/svg" :width="width" :height="height">
        <g id="main" fill="none">

            <path v-for="p in paths" 
                @click.stop="onPathClick(p, $event)"
                :key="p.id" 
                :d="p.d" 
                :stroke="p.stroke" 
                :fill="p.fill" 
                :strokeWidth="p.strokeWidth"/>
        </g>
    </svg>
  </div>
</template>

<style>
</style>

<script>

import AddPathTool from './AddPathTool'
import SVGRuler from './SVGRuler'
import Logger from 'common/Logger'

export default {
  name: "SVgEditor",
  mixins: [],
  props: ['width', 'height', 'pos'],
  data: function() {
    return {
        value: [],
        selectedTool: 'AddPath',
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
              // console.debug(svg.d)
              return svg
          })
          return result
      }
  },
  components: {
  },
  methods: {
    onPathClick (path, e) {
        console.debug('onPathClick', path, e)
    },

    onMouseClick (e) {
        let pos = this.getCanvasMousePosition(e)
        this.logger.log(-1, 'onMouseClick ', 'enter', pos)
        if (this.currentTool) {
            this.currentTool.onClick(pos)
        } else {
            //this.startTool(pos)
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
            this.currentTool.onEnd(pos)
            // check if we added something. If see,
            // do the skecth kind of vector editing
            // https://bl.ocks.org/mbostock/8027637
            delete this.currentTool
        }
        this.$emit('qmouse', pos)
    },

    onEsc () {
        if (this.currentTool) {
            this.currentTool.onEnd()
        }
    },

    startTool (pos) {
        if (this.selectedTool === 'AddPath'){
            this.startAddTool(pos)
        }
    },

    startAddTool (pos) {
        this.logger.log(-1, 'startAddTool ', 'enter', pos)
        let path = {
            id: new Date().getTime(),
            name: 'Path',
            type: 'Path',
            stroke: '#333333',
            strokeWidth: 1,
            fill:'',
            d: []
        }
        this.value.push(path)
        this.selection = [path]
        this.currentTool = new AddPathTool(path)
        if (pos) {
            this.currentTool.onClick(pos)
        }
        this.initRuler(this.selection)
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
    this.startTool()
  }
};
</script>