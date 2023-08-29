<template>
  <div 
    :class="
        'qux-svg-editor qux-svg-editor_cursor_' + 
        cursor + 
        (!isBoundingBoxVisible ? ' qux-svg-editor-no-bbox' : '')" 
    :style="{'width': width + 'px', 'height': height + 'px'}"
    @click.stop="onMouseClick"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mousemove.stop="onMouseMove"
    @dblclick.stop="onMouseDoubleClick">
    <svg id="svg" xmlns="http://www.w3.org/2000/svg" :width="width" :height="height">

        <g id="main" fill="none">

            <defs v-if="hasGradient">
                <linearGradient v-for="g in gradients" :id="g.id" :key="g.id" :x1="g.angle.x1" :x2="g.angle.x2" :y1="g.angle.y1" :y2="g.angle.y2">
                    <stop v-for="(c,i) in g.fill.colors" :key="i" :offset="Math.round(c.p) + '%'" :stop-color="c.c" />
                </linearGradient>


                <template v-for="m in markers" >

                    <marker :key="m.id"  :id="m.id" markerWidth="3" markerHeight="3" refX="1.5" refY="1.5" orient="auto-start-reverse" v-if="m.type === 'triangleStart'">
                      <polygon points="0 0, 3 1.5, 0 3" :fill="m.stroke"/>
                    </marker>

                    <marker :key="m.id"  :id="m.id" markerWidth="3" markerHeight="3" refX="1.5" refY="1.5" orient="auto" v-if="m.type === 'triangleEnd'">
                      <polygon points="0 0, 3 1.5, 0 3" :fill="m.stroke"/>
                    </marker>

                    <marker :key="m.id"  :id="m.id" markerWidth="10" markerHeight="8" refX="4" refY="3.5" orient="auto-start-reverse" v-if="m.type === 'arrowStart'">
                      <polyline points="1 2, 4 3.5, 1 5" :stroke="m.stroke"        :stroke-linecap="m.strokeLineCap" />
                    </marker>

                    <marker :key="m.id"  :id="m.id" markerWidth="10" markerHeight="8" refX="4" refY="3.5" orient="auto" v-if="m.type === 'arrowEnd'">
                      <polyline points="1 2, 4 3.5, 1 5" :stroke="m.stroke"        :stroke-linecap="m.strokeLineCap"/>
                    </marker>

                    <marker :key="m.id"  :id="m.id" markerWidth="30" markerHeight="30" refX="1.5" refY="1.5" orient="auto" v-if="m.type === 'circle'">
                      <circle cx="1.5" cy="1.5" r="1.5"  :fill="m.stroke"/>
                    </marker>

                </template>
            </defs>


            <line :x1="zoomedSnappLineX" y1="0" :x2="zoomedSnappLineX" :y2="height" class="qux-svg-snapp-line-x"  v-if="hasSnappLineX"/>
            
            <line :x1="0" :y1="zoomedSnappLineY" :x2="width" :y2="zoomedSnappLineY" class="qux-svg-snapp-line-y"  v-if="hasSnappLineY"/>


            <!--
                Add here a transparent click layer to easy clicks
            -->
            <template v-if="showHover">
                <path v-for="p in paths"
                    :key="p.id + 's'"
                    :d="p.d"
                    class="qux-svg-editor-click-line"
                    @mouseover="onElementHover(p, $event)"
                    @mouseout="onElementBlur(p, $event)"
                    @click.stop="onElementClick(p, $event)"
                    fill=""
                    :stroke-width="p.strokeWidth + 5"/>

            </template>

            <path v-for="p in paths"
                :key="p.id"
                :d="p.d"
                :stroke="p.stroke"
                :stroke-width="p.strokeWidth"
                :stroke-dasharray="p.strokeDash"
                :stroke-linecap="p.strokeLineCap"
                :marker-end="p.markerEnd"
                :marker-start="p.markerStart"
                :fill="p.fill"
                :id="p.id"
                ref="paths"
                @mouseover="onElementHover(p, $event)"
                @mouseout="onElementBlur(p, $event)"
                />

            <!-- in morph mode we show all the points -->

            <template v-if="splitPoints">
                <circle v-for="(splitPoint,i) in splitPoints" :key="'sp' + i"
                    :cx="splitPoint.x + offSetTools"
                    :cy="splitPoint.y + offSetTools"
                    @mousedown.stop="onSplitPointMouseDown(splitPoint, $event)"
                    @mouseup.stop="onSplitPointMouseUp(splitPoint, $event)"
                    @click.stop="onSplitPointClick(splitPoint, $event)"
                    class="qux-svg-editor-splitpoint"
                    :r="splitPoint.r" />
            </template>

            <template v-if="showAllBezierPoints">
                <path v-for="p in allBezierPoints.lines"
                    :key="p.id"
                    :d="p.d"
                    stroke="rgba(0,0,0,0.4)"
                    class="qux-svg-editor-beziee-line qux-svg-editor-beziee-line-debug"
                    fill=""
                    :stroke-width="1"/>
      

                <rect v-for="bezierpoint in allBezierPoints.points"
                    :key="bezierpoint.id"              
                    :x="bezierpoint.x - bezierpoint.o"
                    :y="bezierpoint.y - bezierpoint.o"
                    @mouseover="onBezierMouseOver(bezierpoint, $event)"
                    :width="bezierpoint.w"
                    :height="bezierpoint.h"     
                    :class="['qux-svg-editor-bezier qux-svg-editor-bezier-debug', {'qux-svg-editor-bezier-selected': selectedBezier && bezierpoint.id === selectedBezier.id}]"
                    />
            </template>

   
            <template v-if="showJoints">

                <!-- Bezier lines-->
                <path v-for="p in selectedBezierElements.lines"
                    :key="p.id"
                    :d="p.d"
                    stroke="rgba(0,0,0,0.4)"
                    class="qux-svg-editor-beziee-line"
                    fill=""
                    :stroke-width="1"/>
      

                <!-- Bezier points-->
                <rect v-for="bezierpoint in selectedBezierElements.points"
                    :key="bezierpoint.id"
              
                    :x="bezierpoint.x - bezierpoint.o"
                    :y="bezierpoint.y - bezierpoint.o"
                    :width="bezierpoint.w"
                    :height="bezierpoint.h"
                    @mousedown.stop="onBezierMouseDown(bezierpoint, $event)"
                    @mouseup.stop="onBezierMouseUp(bezierpoint, $event)"
                    @mouseover="onBezierMouseOver(bezierpoint, $event)"
                    @click.stop="onBezierClick(bezierpoint, $event)"
                    :class="[
                        'qux-svg-editor-bezier ', 
                        {'qux-svg-editor-bezier-x1': bezierpoint.isX1}, 
                        {'qux-svg-editor-bezier-selected': selectedBezier && bezierpoint.id === selectedBezier.id}
                    ]"
                    />


                <!-- joints-->
                <circle v-for="joint in joints" :key="joint.id"
                    :cx="joint.x + offSetTools"
                    :cy="joint.y + offSetTools"
                    @mousedown.stop="onJointMouseDown(joint, $event)"
                    @mouseup.stop="onJointMouseUp(joint, $event)"
                    @click.stop="onJointClick(joint, $event)"
                    :class="['qux-svg-editor-joint', {'qux-svg-editor-joint-selected': joint.selected}]"
                    :r="joint.r" />

            </template>

            <rect v-if="selectBox"
                    :x="selectBox.x + offSetTools"
                    :y="selectBox.y + offSetTools"
                    :width="selectBox.w + 1"
                    :height="selectBox.h + 1"
                    class="qux-svg-editor-select-box" />


            <template v-if="boundingBox">
                <!-- Bounding box rectangle-->
                <rect
                    :x="boundingBox.x + offSetTools -1"
                    :y="boundingBox.y + offSetTools - 1"
                    :width="boundingBox.w + 2"
                    :height="boundingBox.h + 2"
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

<style lang="scss">
  @import "../style/components/qux-svg-editor.scss";
</style>

<script>


import * as SVGUtil from './SVGUtil'
import * as GradientUtil from './GradientUtil'
import Logger from '../common/Logger'
import Events from './mixins/Events.vue'
import Tools from './mixins/Tools.vue'
import Actions from './mixins/Actions.vue'
import CommandStack from './CommandStack'
import KeyBoardDispatcher from './mixins/KeyBoardDispatcher.vue'

export default {
  name: "SVGEditor",
  mixins: [Events, KeyBoardDispatcher, Tools, Actions],
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
    'isMultiPath': {
        type: Boolean,
        default: true
    }
  },
  data: function() {
    return {
        value: [],
        isBoundingBoxVisible: true,
        mode: 'select',
        cursor: 'default',
        hover: null,
        selection: [],
        splitPoints: null,
        selectedJoints: null,
        selectedBezier: null,
        boundingBox: null,
        selectBox: null,
        offSetTools: 0,
        offSetValue: 0,
        showAllBezierPoints: false,
        snapLineX: -1,
        snapLineY: -1,
        config: {
            pointRadius: 3,
            colorHover: '#49C0F0',
            colorSelect: '#49C0F0',
            handlerSize: 7
        },
        hasGradient: true,
        isDirty: false
    };
  },
  computed: {
      hasSnappLineX () {
        return this.snapLineX > 0
      },
      hasSnappLineY () {
        return this.snapLineY > 0
      },
      zoomedSnappLineX () {
        return Math.round(this.snapLineX * this.zoom) + 0.5
      },
      zoomedSnappLineY () {
        return Math.round(this.snapLineY * this.zoom) + 0.5
      },
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
            return path.d.filter(point => {
                return point.t !== 'Z' && point.t !== 'CZ'
            }).map((point, i) => {
                return {
                    parent: path.id,
                    x: point.x,
                    y: point.y,
                    id:i,
                    selected: this.isSelectedJoint(i),
                    r: this.config.pointRadius
                }
            })
        })
        return points
      },
      allBezierPoints () {
        const points = []
        const lines = []
        const offset = this.config.pointRadius
        const witdhHeight = offset * 2
        if (this.selectedJoints) {
           return {
              points: points,
              lines: lines
          }
        }
        this.selectedPaths.forEach(path => {
            path.d.forEach((current, pos) => {
                
                const tempPoints = []

                if (current && current.t === 'C') {
                    tempPoints.push({
                            id: 'x2' + path.id + pos,
                            parent: pos,
                            isX2: true,
                            o: offset,
                            x: current.x2,
                            y: current.y2,
                            h: witdhHeight,
                            w: witdhHeight
                    })
                }
               
                const next = path.d[pos + 1]
                if (next && next.t === 'C') {
                    tempPoints.push({
                        id: 'x1' + path.id + pos,
                        parent: pos + 1,
                        isX1: true,
                        o: offset,
                        x: next.x1,
                        y: next.y1,
                        h: witdhHeight,
                        w: witdhHeight
                    })
                }

                 /** add lines */
                 tempPoints.forEach(point => {
                    points.push(point)
                    lines.push({
                        id: point.id + '_line' + path.id,
                        d: `M ${current.x} ${current.y} L ${point.x} ${point.y}`
                    })
                })
            })
        })
        return {
              points: points,
              lines: lines
          }
      },
      selectedBezierElements () {
          if (this.selectedJoints && this.selectedPaths && this.selectedPaths.length === 1) {                  
                const path = this.selectedPaths[0]
                const joints = this.selectedJoints.map(j => j.id)
                return SVGUtil.getBezierPoints(path, joints, this.config.pointRadius)
          }
          return {
              points: [],
              lines: []
          }
      },
      selectedPaths () {
        return this.scalledValue.filter(p => this.isSelected(p))
      },
      scalledValue () {
        return SVGUtil.getZoomedPaths(this.value, this.zoom)  
      },
      gradients () {
        const result = this.value.map((path, i) =>{
          if (path?.fill.gradient) {
            return {
              // we need to here a prefix, because the widget is hidden, and therewold be
              // two gardients with the same number
              id: GradientUtil.getGradientID(i, path, 'e'),
              fill: path.fill,
              angle: GradientUtil.getGradientAngle(path.fill)
            }
          }
          return null
        })
        .filter(path => {
            return path !== null
        })
        return result
      },
      paths () {
        const result = this.scalledValue.map((path, i) => {
            const svg = {
                id: path.id,
                stroke: path.stroke,
                strokeWidth: path.strokeWidth,
                strokeDash: path.strokeDash,
                strokeLineCap: path.strokeLineCap,
                fill: path.fill,
                d: ''
            }
            if (path.fill.gradient && i >-1) {
                svg.fill = GradientUtil.getGradientURL(i, path, 'e')
            }
            if (path.d) {
                svg.d = SVGUtil.pathToSVG(path.d, this.offSetValue, this.offSetValue, path.closed)
            }
            if (path.markerStart) {
              svg.markerStart = SVGUtil.getMarkerURL(i, path, 'start', 'e')
            }
            if (path.markerEnd) {
              svg.markerEnd = SVGUtil.getMarkerURL(i, path,'end', 'e')
            }
            if (this.hover === path.id) {
                svg.stroke = this.config.colorHover
            }
            return svg
        })
        return result
      },
    markers () {
      const markers =  SVGUtil.getMarkers(this.value, 'e')
      return markers
    }
  },
  components: {
  },
  methods: {

    isSelectedJoint (jointId) {
        if (this.selectedJoints) {
            const pos = this.selectedJoints.findIndex(j => {
                return j.id === jointId
            })
            return pos >= 0
        }
        return false
    },

    /******************************************
     * getters & setters
     *****************************************/

    setBoundingBoxVisible (isBoundingBoxVisible) {
        this.isBoundingBoxVisible = isBoundingBoxVisible
    },

    setShowAllBezier (v) {
        this.showAllBezierPoints = v
        this.logger.log(-5, 'setShowAllBezier ', 'enter', this.showAllBezierPoints)
    },

    setCursor (c = 'default') {
        this.logger.log(5, 'setCursor ', 'enter', c)
        this.cursor = c
    },

    reset () {
        this.isBoundingBoxVisible = true
        this.isBoundingBoxHandlersVisible = true
        this.setSplitPoints()
        this.unSelect()
    },

    setSelectedJoints (joints) {
        this.selectedJoints = joints
    },

    getSelectedJoints () {
        return this.selectedJoints
    },

    addSelectedJoint (joint) {
        if (this.selectedJoints) {
            this.selectedJoints.push(joint)
        }
    },


    setSelectedBezier (bezier) {
        this.selectedBezier = bezier
    },

    setBoundingBox (bbox) {
        this.boundingBox = bbox
    },

    setSelectBox (bbox) {
        this.selectBox = bbox
    },

    setSplitPoints (positions) {
        if (positions) {
            this.splitPoints = positions.map(pos => {
                return {
                    x: pos.x,
                    y: pos.y,
                    r: this.config.pointRadius
                }
            })
        } else {
            this.splitPoints = null
        }
    },

    setHover (id) {
        this.hover = id
    },

    select (ids) {
        this.logger.log(3, 'select ', 'enter', ids)
        if (!ids) {
            this.logger.warn('select', 'Should use NULL')
            ids = []
        }
        if (!Array.isArray(ids)) {
            this.logger.warn('select', 'Should use array', ids)
            ids = [ids]
        }
        this.selection = ids
        const bbox = this.getSelectedUnZoomedBoundingBox()
        this.$emit('select', this.getSelectedElements(), bbox)
    },
    
    addSelect (id) {
        this.logger.log(1, 'addSelect ', id)
        this.selection.push(id)
        this.$emit('select', this.getSelectedElements())
    },

    unSelect () {
        this.logger.log(-1, 'unSelect ')
        this.selection = []
        this.selectedJoints = []
        this.$emit('unselect')
        this.setBoundingBox()
    },

    getSelectedUnZoomedBoundingBox () {
        const elements = this.getSelectedSVGElements()
        if (elements.length === 0) {
            return {
                x:0, y:0, w:0, h:0, zoom: this.zoom
            }
        }
        const boxes = SVGUtil.getBBoxes(elements)
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



    setValue (paths, editingBoundingBox, currentBoundingBox) {
        this.logger.log(2, 'setValue', 'enter')
        const scalledPaths = SVGUtil.strechPaths(paths, editingBoundingBox, currentBoundingBox)
        const translatedPaths = SVGUtil.addBoundingBox(scalledPaths, currentBoundingBox)
        this.value = translatedPaths
        this.isDirty = false
        this.commandStack.init(this.value)
        this.$emit('changeCommandStack', this.commandStack.hasUndo(), this.commandStack.hasRedo())
    },

    getValue () {
        this.logger.log(-2, 'getValue', 'enter', this.isDirty)
        
        this.value.forEach(path => {
            path.d = SVGUtil.filterTempPoints(path.d)
        })
        // FIXME: here is a bug. We should rerender to make sure the 
        // temp nodes are not in the bounding box
        const boxes = SVGUtil.getBBoxes(this.$refs.paths)
        let zoomedPos = SVGUtil.getBoundingBoxByBoxes(boxes)
        zoomedPos = SVGUtil.addStrokeBBox(zoomedPos, this.value, this.zoom)  
        const minZoomPos = SVGUtil.getMinBBox(zoomedPos)
        const bbox = SVGUtil.getUnZoomedBox(minZoomPos, this.zoom)    
        const paths = SVGUtil.removeBoundingBox(this.value, bbox)
    
        return {
            dirty: this.isDirty,
            paths: paths,
            pos: zoomedPos,
            bbox: bbox
        } 
    },
    

    clear () {
        this.logger.log(0, 'clear', 'enter')
        this.value = []
        this.setSelectedJoints()
        this.reset()
        this.setBoundingBox()
        this.hideSnappLineX()
        this.hideSnappLineY()
    },


    /*****************************************
     *  Model Lifecycle hooks
     *****************************************/

    onChange () {
        this.logger.log(2, 'onChange', 'enter')
        this.$emit('change', this.value)
        this.commandStack.push(this.value)
        this.$emit('changeCommandStack', this.commandStack.hasUndo(), this.commandStack.hasRedo())
        this.isDirty = true
    },

    onTempChange () {
        this.$emit('tempChange', this.value)
    },

  

    /******************************************
     * Undo / Redo
     *****************************************/

    undo () {
        this.logger.log(1, 'undo ', 'enter')
        if (this.commandStack.hasUndo()) {
            const lastValue =  this.commandStack.undo()
            this.$set(this, 'value', lastValue)
            this.unSelect()
            this.startSelectTool()
        } else {
            this.logger.log(-1, 'undo ', 'No undo')
        }
        this.$emit('changeCommandStack', this.commandStack.hasUndo(), this.commandStack.hasRedo())
    },

    redo () {
        this.logger.log(1, 'redo ', 'enter')
        if (this.commandStack.hasRedo()) {
            const lastValue =  this.commandStack.redo()
            this.$set(this, 'value', lastValue)
            this.unSelect()
            this.startSelectTool()
        } else {
            this.logger.log(-1, 'undo ', 'No redo')
        }
        this.$emit('changeCommandStack', this.commandStack.hasUndo(), this.commandStack.hasRedo())
    },


    /*****************************************
     *  Helper
     *****************************************/
    showSnappLineX (x) {
        this.snapLineX = x
    },

    hideSnappLineX () {
        this.snapLineX = -1
    },

    hideSnappLineY () {
        this.snapLineY = -1
    },

    showSnappLineY (y) {
        this.snapLineY = y
    },

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
        pos.shiftKey = e.shiftKey
        pos.altKey = e.altKey
        pos.metaKey = e.metaKey
     
        pos.x = Math.round(pos.x / this.zoom)
        pos.y = Math.round(pos.y / this.zoom)
        pos.zoom = 1
        
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
    },
    stop () {
        this.logger.log(-1, 'stop', 'enter')
        this.$emit('stop')
    },

    setGrid(grid) {
        this.logger.log(-1, 'setGrid', 'enter', grid)
        this.grid = grid
    },

    setApp(app) {
        this.logger.log(-1, 'setApp', 'enter', app)
        this.app = app
    }


  },
  watch: {
      pos (p) {
          this.pos = p
      },
      zoom (z) {
        this.zoom = z
        this.onZoom(z)
      },
      grid (g) {
        this.grid = g
      }
  },
  mounted() {
    this.logger = new Logger('SVGEditor')
    this.commandStack = new CommandStack()
    this.app = {} // not responsive because huge!!
  }
};
</script>