<template>
  <div :class="'qux-svg-editor qux-svg-editor_cursor_' + cursor" :style="{'width': width + 'px', 'height': height + 'px'}"
    @click.stop="onMouseClick"
    @mousedown.stop="onMouseDown"
    @mouseup.stop="onMouseUp"
    @mousemove.stop="onMouseMove"
    @dblclick.stop="onMouseDoubleClick">
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
                :cx="splitPoint.x + offSetTools"
                :cy="splitPoint.y + offSetTools"
                class="qux-svg-editor-splitpoint"
                :r="splitPoint.r" />

            <template v-if="showBezierPoints">
                   <circle v-for="bezierpoint in allBezierPoints" :key="bezierpoint.id"
                    :cx="bezierpoint.x"
                    :cy="bezierpoint.y"
                    :r="bezierpoint.r"
                    @mousedown.stop="onBezierMouseDown(bezierpoint, $event)"
                    @mouseup.stop="onBezierMouseUp(bezierpoint, $event)"
                    @click.stop="onBezierClick(bezierpoint, $event)"
                    :class="['qux-svg-editor-bezier-debug', { 'qux-svg-editor-bezier-debug-x1' : bezierpoint.isX1}]"
                    />
            </template>


            <template v-if="mode === 'morph' || mode === 'add'">

                <!-- joints-->
                <circle v-for="joint in joints" :key="joint.id"
                    :cx="joint.x + offSetTools"
                    :cy="joint.y + offSetTools"
                    @mousedown.stop="onJointMouseDown(joint, $event)"
                    @mouseup.stop="onJointMouseUp(joint, $event)"
                    @click.stop="onJointClick(joint, $event)"
                    :class="['qux-svg-editor-joint', {'qux-svg-editor-joint-selected': joint.selected}]"
                    :r="joint.r" />

                <!-- Bezier lines-->
                <path v-for="p in selectedBezierElements.lines"
                    :key="p.id"
                    :d="p.d"
                    stroke="rgba(0,0,0,0.4)"
                    class="qux-svg-editor-beziee-line"
                    fill=""
                    :stroke-width="1"/>

                <!-- Bezier points-->
                <circle v-for="bezierpoint in selectedBezierElements.points"
                    :key="bezierpoint.id"
                    :cx="bezierpoint.x"
                    :cy="bezierpoint.y"
                    :r="bezierpoint.r"
                    @mousedown.stop="onBezierMouseDown(bezierpoint, $event)"
                    @mouseup.stop="onBezierMouseUp(bezierpoint, $event)"
                    @click.stop="onBezierClick(bezierpoint, $event)"
                    :class="['qux-svg-editor-bezier', {'qux-svg-editor-bezier-selected': selectedBezier && bezierpoint.id === selectedBezier.id}]"
                    />


            </template>


            <template v-if="boundingBox">
                <!-- Bounding box rectangle-->
                <rect
                    :x="boundingBox.x + offSetTools"
                    :y="boundingBox.y + offSetTools"
                    :width="boundingBox.w"
                    :height="boundingBox.h"
                    @mousedown.stop="onBBoxMouseDown($event)"
                    @mouseup.stop="onBBoxMouseUp($event)"
                    @click.stop="onBBoxMouseClick($event)"
                    class="qux-svg-editor-bounding" />
                <!-- handlers rectangle-->
                <rect
                    v-for="handler in resizeHandles"
                    :key="handler.id"
                    :x="handler.x + offSetTools"
                    :y="handler.y + offSetTools"
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
  @import url("../style/qux-svg-editor.css");
</style>

<script>


import PathTool from './tools/PathTool'
import SelectTool from './tools/SelectTool'
import MorphTool from './tools/MorphTool'
import MoveTool from './tools/MoveTool'
import SVGRuler from './SVGRuler'
import BezierTool from './tools/BezierTool'
import * as SVGUtil from './SVGUtil'
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
        selectedBezier: null,
        boundingBox: null,
        offSetTools: 0,
        offSetValue: 0.5,
        showBezierPoints: false,
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
          const result = []
          if (this.boundingBox) {
             return SVGUtil.getResizeHandles(this.boundingBox, this.config.handlerSize)
          }
          return result
      },
      joints () {
        const paths = this.selectedPaths
        const points = paths.flatMap(path => {
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
      allBezierPoints () {
        let result = this.value.flatMap(path => {
            return path.d.flatMap((point,j) => {
                if (point.t === 'C') {
                    return [{
                        id: path.id + '_' + j + 'x1',
                        r: this.config.pointRadius - 2,
                        x: point.x1,
                        y: point.y1,
                        isX1: true
                    }, {
                        id: path.id + '_' + j + 'x2',
                        r: this.config.pointRadius - 2,
                        x: point.x2,
                        y: point.y2
                    }]
                }
                return []
            })
        })
        return result
      },
      selectedBezierElements () {
          console.debug('FIXME: To slow')
          /** FIXME: thi sis somehopw top slow!! should this be done by the morp tool, and we just have here a property? */
          let points = []
          let lines = []
          if (this.selectedJoint && this.selectedPaths && this.selectedPaths.length === 1) {
                let path = this.selectedPaths[0]
                let pos = this.selectedJoint.id
                let current = path.d[pos]
                if (current && current.t === 'C') {
                    points.push({
                            id: 'x2',
                            parent: pos,
                            isX2: true,
                            x: current.x2,
                            y: current.y2,
                            r: this.config.pointRadius
                    })
                }
                let next = path.d[pos + 1]
                    if (next && next.t === 'C') {
                    points.push({
                        id: 'x1',
                        parent: pos + 1,
                        isX1: true,
                        x: next.x1,
                        y: next.y1,
                        r: this.config.pointRadius
                    })
                }

                /** add lines */
                points.forEach(point => {
                    lines.push({
                        id: point.id + '_line',
                        d: `M ${current.x} ${current.y} L ${point.x} ${point.y}`
                    })
                })
          }
          return {
              points: points,
              lines: lines
          }
      },
      selectedPaths () {
        return this.value.filter(p => this.isSelected(p))
      },
      paths () {
            const result = this.value.map(path => {
              const svg = {
                  id: path.id,
                  stroke: path.stroke,
                  strokeWidth: path.strokeWidth,
                  fill: path.fill,
                  d: ''
              }
              if (path.d) {
                  svg.d = SVGUtil.pathToSVG(path.d, this.offSetValue)
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
        this.logger.log(6, 'onJointMouseDown ', 'enter')
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onJointMouseDown(joint, pos)
        }
    },
    onJointMouseUp (joint, e) {
        this.logger.log(6, 'onJointMouseUp ', 'enter')
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

    // bezier
    onBezierMouseDown (joint, e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBezierMouseDown(joint, pos)
        }
    },
    onBezierMouseUp (joint, e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBezierMouseUp(joint, pos)
        }
    },
    onBezierClick (joint, e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onBezierClick(joint, pos)
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

    // canvas mouse
    onMouseClick (e) {
        this.logger.log(5, 'onMouseClick ', 'enter')
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
    onMouseDown (e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onMouseDown(pos)
        }
        this.logger.log(-5, 'onMouseUp ', 'exit', pos)
    },
    onMouseUp (e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onMouseUp(pos)
        }
        this.logger.log(-5, 'onMouseUp ', 'exit', pos)
    },
    onMouseDoubleClick (e) {
        let pos = this.getCanvasMousePosition(e)
        if (this.currentTool) {
            this.currentTool.onDoubleClick(pos)
        }
    },

    // keyboard
    onKeyUp (e) {
        if (e.key === 'Escape') {
            this.onEsc()
        }
        if (e.key === 'Enter') {
            this.onEnter()
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
            this.onDelete()
        }
    },
    onEsc () {
        this.logger.log(-1, 'onEsc ', 'enter')
        if (this.currentTool) {
            this.currentTool.onEsc()
        }
    },
    onEnter () {
        this.logger.log(-1, 'onEnter ', 'enter')
        if (this.currentTool) {
            this.currentTool.onEnter()
        }
    },
    onDelete () {
        this.logger.log(-1, 'onDelete ', 'enter')
        if (this.currentTool) {
            this.currentTool.onDelete()
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

    startBezierTool (pos) {
        this.logger.log(-1, 'startBezierTool ', 'enter', pos)
        this.mode = 'add'
        this.reset()
        this.setCursor('crosshair')
        this.currentTool = new BezierTool(this)
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

    setSelectedJointId (id) {
        if (!this.selectedJoint || this.selectedJoint.id !== id) {
            this.selectedJoint = {id: id}
        }
    },

    setSelectedBezier (bezier) {
        this.selectedBezier = bezier
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

    setValue (v) {
        this.value = v
        // convert from relative to absolute
        // position.
    },

    getValue () {
        this.logger.log(-1, 'clear', 'enter')
        const boxes = SVGUtil.getBoxes(this.$refs.paths)
        const bbox = SVGUtil.getBoundingBoxByBoxes(boxes)
        return {
            paths: SVGUtil.getZeroPath(this.value, bbox),
            pos: bbox
        } 
    },
    

    clear () {
        this.logger.log(0, 'clear', 'enter')
        this.value = []
        this.setSelectedJoint()
        this.reset()
        this.setBoundingBox()
    },

    /*****************************************
     *  Helper
     *****************************************/
    isSelected (element) {
        return this.selection.indexOf(element.id) >=0
    },

    stopEvent(e) {
        if (e && e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }
    },

    getCanvasMousePosition (e){
        let pos = this._getMousePosition(e);
        pos.x -= this.pos.x;
        pos.y-= this.pos.y;
        if (this.ruler) {
            pos = this.ruler.correct(pos)
        }
        return pos;
    },

    _getMousePosition (e){
        const result = {x: 0, y: 0};
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