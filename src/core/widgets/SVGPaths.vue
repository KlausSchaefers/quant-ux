
<template>
  <div class="MatcWidgetTypeSVGPaths" >
      <svg xmlns="http://www.w3.org/2000/svg" 
        :width="width" :height="height" 
        v-if="model" isNotCanvas="true" 
        :viewBox="`0 0 ${viewBox.w} ${viewBox.h}`" 
        preserveAspectRatio="none"
      >
        <g id="main" fill="none">

            <path v-for="p in paths"
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
      paths: [],
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
      this.width = box.w
      this.height = box.h
    },

    render (model, style, scaleX, scaleY) {
     
      this.model = model;
      this.paths = model.props.paths
      this.viewBox = model.props.bbox
      this.style = style;
      this.scale = scaleX
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.renderElements(this.model, this.paths, scaleX, style)
    },

    renderElements (box, paths) {
      this.width = box.w
      this.height = box.h
      this.paths = paths.map(path => {
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
          return svg
        })
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