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
            <template v-if="showHover">
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


            <template v-if="showJoints">

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
                <circle
                    v-for="handler in resizeHandles"
                    :key="handler.id"
                    :cx="handler.x + offSetTools"
                    :cy="handler.y + offSetTools"
                    :r="handler.r"
                    @mousedown.stop="onResizeMouseDown(handler, $event)"
                    @mouseup.stop="onResizeMouseUp(handler, $event)"
                    @click.stop="onResizeMouseClick(handler, $event)"
                    :class="'qux-svg-editor-resize-handler ' + handler.type" />
            </template>



        </g>
    </svg>
  </div>
</template>

<style>
  @import url("../style/qux-svg-editor.css");
</style>

<script>


import * as SVGUtil from './SVGUtil'
import Logger from '../common/Logger'
import Events from './mixins/Events.vue'
import Tools from './mixins/Tools.vue'

export default {
  name: "SVGEditor",
  mixins: [Events, Tools],
  props: {
    'width': Number, 
    'height': Number, 
    'pos': {
        type: Object,
        default() {
            return {x:0, y:0}
        }
    }, 
    'zoom': {
        type: Number,
        default: 1
    },
    'grid': {
        type: Object,
        default() {
            return undefined
        }
    }
  },
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
            pointRadius: 3,
            colorHover: '#49C0F0',
            colorSelect: '#49C0F0',
            handlerSize: 7
        }
    };
  },
  computed: {
      showHover () {
        return this.mode === 'select' || this.mode === 'move'
      },
      showJoints () {
        return this.mode === 'morph' //|| this.mode === 'add'
      },
      resizeHandles () {
          const result = []
          if (this.boundingBox) {
             return SVGUtil.getResizeHandles(this.boundingBox, this.config.handlerSize, this.config.pointRadius )
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
        const result = this.scalledValue.flatMap(path => {
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
          /** FIXME: thi sis somehopw top slow!! should this be done by the morp tool, and we just have here a property? */
          const points = []
          const lines = []
          if (this.selectedJoint && this.selectedPaths && this.selectedPaths.length === 1) {
                const path = this.selectedPaths[0]
                const pos = this.selectedJoint.id
                const current = path.d[pos]
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
                const next = path.d[pos + 1]
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
        return this.scalledValue.filter(p => this.isSelected(p))
      },
      scalledValue () {
        return SVGUtil.getZoomedPaths(this.value, this.zoom)  
      },
      paths () {
        const result = this.scalledValue.map(path => {
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
            return svg
        })
        return result
      }
  },
  components: {
  },
  methods: {


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
        const bbox = this.getSelectedBoundingBox()
        this.$emit('select', this.getSelectedElements(), bbox)
    },
    
    addSelect (id) {
        this.logger.log(-1, 'addSelect ', id)
        this.selection.push(id)
        this.$emit('select', this.getSelectedElements())
    },

    unSelect () {
        this.logger.log(-1, 'unSelect ')
        this.selection = []
        this.$emit('unselect')
        this.setBoundingBox()
    },

    getSelectedBoundingBox () {
        const elements = this.getSelectedSVGElements()
        if (elements.length === 0) {
            return {
                x:0, y:0, w:0, h:0
            }
        }
        const boxes = SVGUtil.getBoxes(elements)
        const zoomedPos = SVGUtil.getBoundingBoxByBoxes(boxes)
        const bbox = SVGUtil.getUnZoomedBox(zoomedPos, this.zoom)
        return bbox
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

    getSelectedSVGElements () {
        return this.getSelectedElements().map(path => {
            return this.getSVGElement(path)
        }).filter(e => e !== undefined)
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

    setValue (paths, editingBoundingBox, currentBoundingBox) {
        this.logger.log(-1, 'setValue', 'enter')
        const scalledPaths = SVGUtil.strechPaths(paths, editingBoundingBox, currentBoundingBox)
        const translatedPaths = SVGUtil.addBoundingBox(scalledPaths, currentBoundingBox)
        this.value = translatedPaths
    },

    getValue () {
        this.logger.log(-1, 'getValue', 'enter')
        const boxes = SVGUtil.getBoxes(this.$refs.paths)
        const zoomedPos = SVGUtil.getBoundingBoxByBoxes(boxes)
        // add here a small padding, otherwise bezier curves might be cutted off!
        const paddedZoomedBox = SVGUtil.addPadding(zoomedPos)
        const bbox = SVGUtil.getUnZoomedBox(paddedZoomedBox, this.zoom)
        const paths = SVGUtil.removeBoundingBox(this.value, bbox)
        return {
            paths: paths,
            pos: paddedZoomedBox,
            bbox: bbox
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
     *  Model Lifecycle hooks
     *****************************************/

    beforeValueChange () {
        this.logger.log(1, 'beforeValueChange ', 'enter')
    },

    onValueChanged (type, ids) {
        this.logger.log(-1, 'onValueChanged ', 'enter > ' + type, ids)
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
        pos.y -= this.pos.y;
  
        pos.x = Math.round(pos.x / this.zoom)
        pos.y = Math.round(pos.y / this.zoom)
        pos.zoomed = false
        
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
      },
      zoom (z) {
        this.zoom = z
        this.onZoom(z)
      }
  },
  mounted() {
    this.logger = new Logger('SVGEditor')
  }
};
</script>