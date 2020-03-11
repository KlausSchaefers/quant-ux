<template>
  <div :class="'qux-svg-editor qux-svg-editor_cursor_' + cursor" :style="{'width': width + 'px', 'height': height + 'px'}"
    @click="onMouseClick"
    @mousemove="onMouseMove"
    @dblclick="onMouseDoubleClick">
    <svg id="svg" xmlns="http://www.w3.org/2000/svg" :width="width" :height="height">
        <g id="main" fill="none">

            <path v-for="p in paths"
                :key="p.id"
                :d="p.d"
                :stroke="p.stroke"
                :fill="p.fill"
                :id="p.id"
                ref="paths"
                @mouseover="onElementHover(p, $event)"
                @mouseout="onElementBlur(p, $event)"
                :stroke-width="p.strokeWidth"/>

            <!--
                Add here a transparent click layer to easy clicks
            -->
            <template v-if="mode === 'select'">
                <path v-for="p in paths"
                    :key="p.id + 's'"
                    :d="p.d"
                    stroke="rgba(0,0,0,0.0)"
                    class="qux-svg-editor-click-line"
                    @mouseover="onElementHover(p, $event)"
                    @mouseout="onElementBlur(p, $event)"
                    @click.stop="onElementClick(p, $event)"
                    fill=""
                    :stroke-width="p.strokeWidth + 5"/>

            </template>

            <!-- in morph mode we show all the points -->

              <circle v-if="splitPoint"
                    :cx="splitPoint.x"
                    :cy="splitPoint.y"
                    class="qux-svg-editor-splitpoint"
                    :r="splitPoint.r" />

            <template v-if="mode === 'morph'">
                <circle v-for="joint in joints" :key="joint.id"
                    :cx="joint.x"
                    :cy="joint.y"
                    @mousedown.stop="onJointMouseDown(joint, $event)"
                    @mouseup.stop="onJointMouseUp(joint, $event)"
                    @click.stop="onJointClick(joint, $event)"
                    :class="['qux-svg-editor-joint', {'qux-svg-editor-joint-selected': joint.selected}]"
                    :r="joint.r" />
            </template>

            <rect 
                :x="boundingBox.x" 
                :y="boundingBox.y" 
                :width="boundingBox.w" 
                :height="boundingBox.h" 
                v-if="boundingBox"
                @mousedown.stop="onBBoxMouseDown($event)"
                @mouseup.stop="onBBoxMouseUp($event)"
                @click.stop="onBBoxMouseClick($event)"
                class="qux-svg-editor-bounding" />

            <template v-if="boundingBox">
                <rect 
                    v-for="handler in resizeHandles"
                    :key="handler.id"
                    :x="handler.x" 
                    :y="handler.y" 
                    :width="handler.w" 
                    :height="handler.h" 
                    @mousedown.stop="onResizeMouseDown(handler, $event)"
                    @mouseup.stop="onResizeMouseUp(handler, $event)"
                    @click.stop="onResizeMouseClick(handler, $event)"
                    class="qux-svg-editor-resize-handler" />
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
import MorphTool from './MorphTool'
import MoveTool from './MoveTool'
import SVGRuler from './SVGRuler'
import Logger from '../common/Logger'

export default {
  name: "SVgEditor",
  mixins: [],
  props: ['width', 'height', 'pos'],
  data: function() {
    return {
        value: [],
        mode: 'select',
        cursor: 'default',
        hover: null,
        selection: [],
        splitPoint: null,
        selectedJoint: null,
        boundingBox: null,
        config: {
            pointRadius: 5,
            colorHover: 'red',
            colorSelect: '#49C0F0',
            handlerSize: 7
        }
    };
  },
  computed: {
      resizeHandles () {
          let result = []
          if (this.boundingBox) {
              let size = this.config.handlerSize
              let offset = Math.floor(size / 2)
              let bbox = this.boundingBox
              let wHalf = Math.round(bbox.w / 2)
              let hHalf = Math.round(bbox.h / 2)
              result.push({
                  x: bbox.x - offset,
                  y: bbox.y - offset,
                  w: size,
                  h: size,
                  type: 'LeftUp',
                  vertical: true,
                  horizontal: true
              })
              result.push({
                  x: bbox.x - offset,
                  y: bbox.y + bbox.h - offset,
                  w: size,
                  h: size,
                  type: 'LeftDown'
              })
              result.push({
                  x: bbox.x + bbox.w - offset,
                  y: bbox.y - offset,
                  w: size,
                  h: size,
                  type: 'RightUp'
              })
              result.push({
                  x: bbox.x + bbox.w - offset,
                  y: bbox.y + bbox.h - offset,
                  w: size,
                  h: size,
                  type: 'RighDown'
              })

              result.push({
                  x: bbox.x + bbox.w - offset,
                  y: bbox.y + hHalf - offset,
                  w: size,
                  h: size,
                  type: 'East'
              })

              result.push({
                  x: bbox.x - offset,
                  y: bbox.y + hHalf - offset,
                  w: size,
                  h: size,
                  type: 'West'
              })

              result.push({
                  x: bbox.x + wHalf - offset,
                  y: bbox.y - offset,
                  w: size,
                  h: size,
                  type: 'North'
              })

              result.push({
                  x: bbox.x + wHalf - offset,
                  y: bbox.y + bbox.h - offset,
                  w: size,
                  h: size,
                  type: 'South'
              })
          }
          return result
      },
      joints () {
        let paths = this.selectedPaths
        let points = paths.flatMap(path => {
            return path.d.map((point, i) => {
                return {
                    parent: path.id,
                    x: point.x,
                    y: point.y,
                    id:i,
                    selected: this.selectedJoint ? this.selectedJoint.id === i : false,
                    r: this.config.pointRadius
                }
            })
        })
        return points
      },
      selectedPaths () {
        return this.value.filter(p => this.isSelected(p))
      },
      paths () {
          // this should move into a destinct component once we
          // have groupings and masks
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
                  svg.stroke = this.config.colorHover
              }
              // if (this.isSelected(path)) {
              //    svg.stroke = this.config.colorSelect
              //}
              // console.debug(path.d.length, svg.d)
              return svg
          })
          return result
      }
  },
  components: {
  },
  methods: {

    /******************************************
     * Event handler
     *****************************************/

    onResizeMouseDown (handler, e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onResizeMouseDown(handler, this.boundingBox, pos)
        }
    },

    onResizeMouseUp (handler, e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onResizeMouseUp(handler,this.boundingBox, pos)
        }
    },

    onResizeMouseClick (handler, e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onResizeMouseClick(handler, this.boundingBox, pos)
        }
    },

    // bounding box
    onBBoxMouseDown (e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBBoxMouseDown(this.boundingBox, pos)
        }
    },

    onBBoxMouseUp (e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBBoxMouseUp(this.boundingBox, pos)
        }
    },

    onBBoxMouseClick (e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBBoxMouseClick(this.boundingBox, pos)
        }
    },

    // joints
    onJointMouseDown (joint, e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onJointMouseDown(joint, pos)
        }
    },

    onJointMouseUp (joint, e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onJointMouseUp(joint, pos)
        }
    },

    onJointClick (joint, e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onJointClick(joint, pos)
        }
    },

    // element
    onElementBlur () {
        if (this.currentTool) {
            this.currentTool.onElementBlur()
        }
    },

    onElementHover (path) {
        if (this.currentTool) {
            this.currentTool.onElementHover(path)
        }
    },

    onElementClick (path, e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onElementClick(path, pos)
        }
    },

    // canvas
    onMouseClick (e) {
        let pos = this.getCanvasMousePosition(e)
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

    onMouseDoubleClick (e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onDoubleClick(pos)
        }
    },

    // keyboard
    onEsc () {
        if (this.currentTool) {
            this.currentTool.onEsc()
        }
    },

    /******************************************
     * State maschine
     *   Implement here a simple state machine
     *   to transition from tool to tool. This
     *   method is usualy called from the tools
     *   after they finished
     *****************************************/
    setState (state) {
        this.logger.log(-1, 'setState ', 'enter', state)
        delete this.currentTool
        this.setCursor('default')
        this.setBoundingBox()

        switch (state) {
            case 'addEnd':
                this.startSelectTool()
                break
            case 'selectEnd':
                this.startMoveTool()
                break
            case 'moveDoubleClick':
                this.startMorphTool()
                break
            case 'morphEnd':
                this.startSelectTool()
                break
            default:
                this.startSelectTool()
        }
    },

    /******************************************
     * Tools
     *****************************************/

    startMoveTool () {
        this.logger.log(-1, 'startMoveTool ', 'enter')
        this.mode = 'move'
        this.currentTool = new MoveTool(this, this.selection)
    },

    startMorphTool () {
        this.logger.log(-1, 'startPathTool ', 'enter')
        this.mode = 'morph'
        this.currentTool = new MorphTool(this, this.config.pointRadius)
    },

    startSelectTool () {
        this.logger.log(-1, 'startPathTool ', 'enter')
        this.mode = 'select'
        this.reset()
        this.currentTool = new SelectTool(this)
    },

    startPathTool (pos) {
        this.logger.log(-1, 'startPathTool ', 'enter', pos)
        this.mode = 'add'
        this.reset()
        this.setCursor('crosshair')
        this.currentTool = new PathTool(this)
        if (pos) {
            this.currentTool.onClick(pos)
        }
        this.initRuler(this.selection)
    },

    initRuler (selection) {
        this.ruler = new SVGRuler(this.value, selection)
    },

    /******************************************
     * getters & setters
     *****************************************/

    setCursor (c = 'default') {
         this.logger.log(-1, 'setCursor ', 'enter', c)
        this.cursor = c
    },

    reset () {
        this.setSplitPoint()
        this.unSelect()
    },

    setSelectedJoint (joint) {
        this.selectedJoint = joint
    },

    setBoundingBox (bbox) {
        this.boundingBox = bbox
    },

    setSplitPoint (pos) {
        if (pos) {
            this.splitPoint = {
                x: pos.x,
                y: pos.y,
                r: this.config.pointRadius
            }
        } else {
            this.splitPoint = null
        }
    },

    setHover (id) {
        this.hover = id
    },

    select (id) {
        this.logger.log(-1, 'select ', id)
        this.selection = [id]
    },

    unSelect () {
        this.logger.log(-1, 'unSelect ')
        this.selection = []
        this.setBoundingBox()
    },

    getSVGElement (element) {
        if (this.$refs.paths) {
            let result = this.$refs.paths.find(p => {
                return p.id === element.id
            })
            return result
        } else {
            this.logger.warn('getSVGElement', 'paths not there')
        }
    },

    getSelectedElements () {
        return this.value.filter(value => this.isSelected(value))
    },

    getElementById (id) {
        // this should be recursive... getFaltList()...
        return this.value.find(value => value.id === id)
    },

    onChange () {
        this.logger.log(-1, 'onChange', 'enter')
        this.$emit('change', this.value)
    },

    setValue () {
        // convert from relative to absolute
        // position.
    },

    getValue () {
        // convert from relative to absolute
        // position
    },

    clear () {
        this.logger.log(0, 'clear', 'enter')
        this.value = []
    },

    /*****************************************
     *  Helper
     *****************************************/
    isSelected (element) {
        return this.selection.indexOf(element.id) >=0
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

    _getMousePosition (e){
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
  }
};
</script>