<template>
  <div class="MatcLight">
    <h1>SVg Editor Test</h1>
    <div class="MatcTReeCntr" ref="editor">
        <SVGEditor :value="paths" @select="onSelect" :width="400" :height="400" :pos="pos" @qmouse="onMouseMove"/>
    </div>
    {{mouse}}

  </div>
</template>

<style>
  @import url("../../public/style/matc.css");
  .MatcTReeCntr {
      background: #f2f2f2;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
      display: inline-block;
      width: 400px;
      height: 400px;
      overflow: scroll;
      margin-left: 30px;
      font-size: 14px;
  }
</style>

<script>
import SVGEditor from 'canvas/svg/SVGEditor'
import domGeom from 'dojo/domGeom'


export default {
  name: "SVFEditorTest",
  mixins: [],
  data: function() {
    return {
        paths: [],
        pos: {x:0 ,y:0},
        mouse: {}
    };
  },
  components: {
    'SVGEditor': SVGEditor
  },
  methods: {
      onMouseMove (p) {
          this.mouse = p
      },
      onSelect (d) {
          this.selection = d
      }
  },
  mounted() {
      this.pos = domGeom.position(this.$refs.editor)
      console.debug(this.pos)
  }
};
</script>
