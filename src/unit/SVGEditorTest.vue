<template>
  <div class="MatcLight">
    <h1>SVg Editor Test</h1>
    <div class="toolbar">
      <a @click="createLine">Add Line </a>
      <a @click="createBezier">Add Curve </a>
      <a @click="clear">Clear </a>
    </div>
    <div class="MatcTReeCntr" ref="cntr">
        <SVGEditor
          :value="paths"
          @select="onSelect"
          :width="800"
          :height="400"
          :pos="pos"
          ref="editor"
          @qmouse="onMouseMove"/>
    </div>
    {{mouse}}

    <div class="tests">
      <a @click="test_createLine" class="MatcButton"> Test Create Line </a>
      <a @click="test_createLineAndSelect" class="MatcButton"> Test Select Line </a>
      <a @click="test_showBezier" class="MatcButton"> Test Curved Line </a>
    </div>

  </div>
</template>

<style>
  @import url("../style/matc.css");
  @import url("../style/qux-svg-editor.css");
  .toolbar {
    margin-left: 30px;
    background: #eee;
    width: 800px;
  }

  .tests {
    position: fixed;
    right: 0px;
    top:0px;
    width: 800px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  }

  .MatcButton {
    margin: 10px;
  }

  .toolbar a {
    cursor: pointer;
    display: inline-block;
    padding: 5px;
  }

  .MatcTReeCntr {
      background: #f2f2f2;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
      display: inline-block;
      width: 800px;
      height: 400px;
      overflow: scroll;
      margin-left: 30px;
      font-size: 14px;
  }
</style>

<script>
import SVGEditor from '../svg/SVGEditor'
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
      },
      createBezier () {
        this.$refs.editor.startBezierTool()
      },
      createLine () {
        this.$refs.editor.startPathTool()
      },
      clear () {
        this.$refs.editor.clear()
      },
      test_createLine () {
        this.clear()
        let e = this.$refs.editor
        e.startPathTool(this.p(30, 30))
        e.onMouseClick(this.e(60, 200))
        e.onMouseClick(this.e(200, 250))
        e.onMouseClick(this.e(300, 200))
        e.onMouseClick(this.e(350, 350))
        e.onMouseDoubleClick(this.e(300, 200))
        this.assertEquals(1, e.value.length)
      },
      test_createLineAndSelect () {
        this.test_createLine()
        let e = this.$refs.editor
        let path = e.value[0]
        // TODO: test oclick as well
        // test here the hover thingy. Test async
        setTimeout( () => {
          e.onElementHover(path)
          e.onMouseClick(this.e(350, 350))
          this.assertEquals(1, e.selection.length)
          this.assertEquals(path.id, e.selection[0])
        }, 100)

      },
      test_showBezier () {
        let e = this.$refs.editor
        e.setValue([{
            id: 'pbezier',
            name: 'Path',
            type: 'Path',
            stroke: '#333333',
            strokeWidth: 1,
            fill:'',
            d: [{
              t: 'M',
              x: 100,
              y: 100
            }, {
              t: 'C',
              x: 500,
              y: 100,
              x1: 200,
              y1: 200,
              x2: 400,
              y2: 200
            }, {
              t: 'C',
              x: 700,
              y: 100,
              x1: 550,
              y1: 200,
              x2: 650,
              y2: 200
            }]
        }])
        setTimeout( () => {
          e.startSelectTool()
          e.select('pbezier')
          e.setState('moveDoubleClick')
        }, 300)
      },
      // helper methods
      e (x,y) {
        return {
          pageX: x + this.pos.x,
          pageY: y + this.pos.y
        }
      },
      p (x,y) {
        return {
          x: x,
          y: y
        }
      },
      assertEquals (expected, observed) {
        if (expected != observed) {
          console.error('assertEquals() > ', expected, " NOT ", observed, new Error().stack)
        }
      },
      assertTrue (value) {
        if (!value) {
          console.error('assertTrue() > Wrong', new Error().stack)
        }
      }
  },
  mounted() {
      this.pos = domGeom.position(this.$refs.cntr)
      setTimeout(() => {
        // this.test_showBezier()
      }, 300)
  }
};
</script>
