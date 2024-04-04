
<template>
    <div class="MatcWidgetTypeSVGIcon" >
        <div class="MatcWidgetTypeSVGIconWrapper" ref="wrapper">
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                :class="'MatcWidgetTypeSVGIconSVG'"
                :width="width" 
                :height="height" 
                viewBox="0 0 24 24" 
                stroke-width="1.5" 
                stroke="currentColor" 
                fill="none" 
                stroke-linecap="round" 
                stroke-linejoin="round"
                v-html="path"
                ref="svg"
                >
            </svg>
        </div>
    </div>
  </template>
  <script>
  import DojoWidget from "dojo/DojoWidget";
  import UIWidget from "core/widgets/UIWidget";

  export default {
    name: "SVGIcon",
    mixins: [UIWidget, DojoWidget],
    data: function() {
      return {
        width: 40,
        height: 40,
        path: ''
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
          this.emitClick(e)
        }));
        this.wireHover()
      },
  
      resize (box) {
        this.width = box.w
        this.height = box.h
      },
  
      render (model, style, scaleX) {
        this.style = style
        this.model = model
        this.scale = scaleX
        this.path = model.props.svg
        this.$refs.svg.style.color = style.color
        this.$refs.svg.style.strokeWidth = style.strokeWidth * scaleX
        if (style.backgroundImageRotation !== undefined) {
            this.$refs.wrapper.style.transform  = `rotate(${style.backgroundImageRotation}deg)`
        }
        this.resize(model)
      },

      setAnimatedStyle (style) {
        this.$refs.svg.style.color = style.color
      },    
  
      getValue () {},
  
      setValue() {},
  
      getState () {
        return {};
      },
  
      setState () {}
    },
    mounted() {
    }
  };
  </script>