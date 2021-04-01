
<template>
  <div class="MatcWidgetTypeSVGBox" >
      <svg id="svg" xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" v-if="model">
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
            </g>
        </svg>
      </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";
import Logger from 'common/Logger'
import * as SVGUtil from './../../svg/SVGUtil'

export default {
  name: "SVGBox",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      model: null,
      width: 0,
      height: 0,
      paths: []
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
    },

    resize (box) {
      this.renderElements(box, this.elements, this._scaleX)
    },

    render (model, style, scaleX, scaleY) {

      this.model = model;
      this.elements = model.elements
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.renderElements(this.model, this.elements, scaleX)
    },

    renderElements (box, elements, scale) {
      this.width = box.w
      this.height = box.h
      let w = box.w
      let h = box.h
      let paths = []
      elements.forEach(element => {
        if (element.type === 'path') {
          let d = element.d.map(p => {
            return {
              t: p.t,
              x: Math.round(p.x * scale * w) + 0.5,
              y: Math.round(p.y * scale  * h) + 0.5
            }
          })

          d = SVGUtil.pathToSVG(d)
          let path = {
            d: d,
            stroke: element.stroke,
            strokeWith: element.strokeWith
          }
          paths.push(path)
        }

      });
      this.paths = paths
    },

    getValue () {},

    setValue() {},

    getState () {
      return {};
    },

    setState () {}
  },
  mounted() {
    this.logger = new Logger('Vector')
  }
};
</script>