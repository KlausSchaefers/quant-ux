
<template>
  <div class="MatcWidgetTypeSVGPaths" >
      <svg xmlns="http://www.w3.org/2000/svg" 
        :width="width + 4" :height="height + 4" 
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
      offSetValue: 2.5, // 2 because we make set the svg to top and left to -2 to avoid cutoffs
      svgPaths: [],
      viewBox: {
        w: 0, h: 0
      }
    };
  },
  components: {},
  computed: {
  },
  methods: {
    postCreate () {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
    },

    wireEvents () {
      this.own(this.addClickListener(this.domNode, e => {
        this.onClick(e)
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
          this.svgPaths = scalledPaths.map(path => {
            const svg = {
                id: path.id,
                stroke: path.stroke,
                strokeWidth: path.strokeWidth,
                fill: path.fill,
                d: ''
            }
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