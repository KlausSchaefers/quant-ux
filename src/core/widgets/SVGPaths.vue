
<template>
  <div class="MatcWidgetTypeSVGPaths" >
      <svg xmlns="http://www.w3.org/2000/svg" 
        :width="width + 10" :height="height + 10" 
        v-if="model" isNotCanvas="true" 
      >
        <g id="main" fill="none">

            <path v-for="p in svgPaths"
                :key="p.id"
                :d="p.d"
                :stroke="p.stroke"
                :fill="p.fill"
                :id="p.id"
                ref="paths"
                :stroke-width="p.strokeWidth"/>
            </g>
            <defs v-if="hasSVG">
                <linearGradient v-for="p in gradients" :id="p.id" :key="p.id" x1="0" x2="0" y1="0" y2="1">
                    <stop v-for="(c,i) in p.fill.colors" :key="i" :offset="Math.round(c.p) + '%'" :stop-color="c.c" />
                </linearGradient>
              
            </defs>
        </svg>
      </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";
import Logger from 'common/Logger'
import * as SVGUtil from '../../svg/SVGUtil'

export default {
  name: "SVGPaths",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      model: null,
      scale: 1,
      width: 0,
      height: 0,
      offSetValue: 5.5, // 2 because we make set the svg to top and left to -2 to avoid cutoffs
      paths: [],
      svgPaths: [],
      viewBox: {
        w: 0, h: 0
      },
      hasSVG: false
    };
  },
  components: {},
  computed: {
     gradients () {
        const result = this.paths.map((path, i) =>{
          if (path?.fill.gradient) {
            return {
              id:'Gradient' + i,
              fill: path?.fill
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
      // FIXME: If this takes too long, this could be done in the 
      // Controller. But tehn we would need some special condition :(
      const scalledPaths = SVGUtil.strechPaths(paths, viewBox, box)
      if (scalledPaths) {
          this.svgPaths = scalledPaths.map((path) => {
            const svg = {
                id: path.id,
                stroke: path.stroke,
                strokeWidth: path.strokeWidth,
                fill: path.fill,
                d: ''
            }
            // if (path.fill.gradient) {
            //     svg.fill = 'url(#Gradient' + i + ')'
            // }
            if (path.d) {
                svg.d = SVGUtil.pathToSVG(path.d, this.offSetValue, this.offSetValue )
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