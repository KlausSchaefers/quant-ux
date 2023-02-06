
<template>
  <div class="MatcWidgetTypeSVGPaths" >
      <svg xmlns="http://www.w3.org/2000/svg" 
        :width="width + overflowOffset * 2" :height="height + overflowOffset * 2" 
        v-if="model" isNotCanvas="true"
        :style="`top:${overflowOffset *-1}px; left:${overflowOffset * -1}px`"
      >
        <g id="main" fill="none">
            <defs v-if="hasGradient">
                <linearGradient v-for="g in gradients" :id="g.id" :key="g.id" :x1="g.angle.x1" :x2="g.angle.x2" :y1="g.angle.y1" :y2="g.angle.y2" >
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

  
            <path v-for="p in svgPaths"
                :key="p.id"
                :d="p.d"
                :stroke="p.stroke"
                :stroke-dasharray="p.strokeDash"
                :stroke-linecap="p.strokeLineCap"
                :marker-end="p.markerEnd"
                :marker-start="p.markerStart"
                :fill="p.fill"
                :id="p.id"
                ref="paths"
           
                :stroke-width="p.strokeWidth"/>
            </g>
         
            
        </svg>
      </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";
import Logger from 'common/Logger'
import * as SVGUtil from '../../svg/SVGUtil'
import * as GradientUtil from '../../svg/GradientUtil'

export default {
  name: "SVGPaths",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      model: null,
      scale: 1,
      width: 0,
      height: 0,
      overflowOffset: 40, // avoid cutoffs. Maybe make it flexible?
      offSetValue: 40, // add here the overflowOffset + 0.5
      paths: [],
      svgPaths: [],
      viewBox: {
        w: 0, h: 0
      },
      hasGradient: true
    };
  },
  components: {},
  computed: {
    markers () {
      const markers = SVGUtil.getMarkers(this.paths, this.model.id, false)

      return markers
    },
    gradients () {
        const result = this.paths.map((path, i) =>{
          if (path?.fill.gradient) {
            return {
              id:GradientUtil.getGradientID(i, path, this.model.id),
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
  },
  methods: {
    postCreate () {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
    },

    wireEvents () {
      this.own(this.addClickListener(this.domNode, e => {
        this.emitClick(e);
      }));
      this.wireHover()
    },

    resize (box) {
      this.renderElements(box, this.paths, this.viewBox)
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.paths = model.props.paths
      this.viewBox = model.props.bbox
      this.style = style;
      this.scale = scaleX
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.renderElements(this.model, this.paths, this.viewBox)
    },

    renderElements (box, paths, viewBox) {
      this.width = box.w
      this.height = box.h
      const zoom = this._scaleX
      // FIXME: If this takes too long, this could be done in the 
      // Controller. But tehn we would need some special condition :(
      const scalledPaths = SVGUtil.strechPaths(paths, viewBox, box)
      if (scalledPaths) {
          this.svgPaths = scalledPaths.map((path,i) => {
            const svg = {
                id: path.id,
                stroke: path.stroke,
                strokeWidth: path.strokeWidth * zoom,
                strokeDash: path.strokeDash,
                strokeLineCap: path.strokeLineCap,
                fill: path.fill,
                d: ''
            }
            if (path.markerStart) {
              svg.markerStart = SVGUtil.getMarkerURL(i, path, 'start', this.model.id)
            }
            if (path.markerEnd) {
              svg.markerEnd = SVGUtil.getMarkerURL(i, path,'end', this.model.id)
            }
            if (svg.strokeDash) {
                svg.strokeDash = path.strokeDash
                    .split(',')
                    .map(v => v * zoom)
                    .join(',')
            }
            if (path.fill.gradient) {
              // prefix the id with the model id to avoid multiple 
              // devs with the same ids
              svg.fill = GradientUtil.getGradientURL(i, path, this.model.id)
            }
            if (path.d) {
                svg.d = SVGUtil.pathToSVG(path.d, this.offSetValue, this.offSetValue, path.closed)
            }
            return svg
          })
      }
     
    },

    getValue () {},

    setValue() {},

    getState () {
      return {};
    },

    setState () {}
  },
  mounted() {
    this.logger = new Logger('SVGPaths')
  }
};
</script>