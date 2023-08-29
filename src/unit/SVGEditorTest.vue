<template>
  <div class="MatcLight">
    <h1>SVg Editor Test</h1>
    <div class="toolbar">
      <a @click="createLine">Line </a>
      <a @click="createBezier"> Curve </a>
      <a @click="createArc"> Arc </a>
      <a @click="createRect"> Rect </a>
      <a @click="createTriangle"> Triangle </a>
      <a @click="createEllipse"> Ellipse </a>
      <a @click="createDiamond"> Diamond </a>
      
      <a @click="clear">Clear </a>
        <a @click="setZoom(1)">1.0 </a>
        <a @click="setZoom(0.66)">0.66 </a>
    </div>
    <div class="MatcTReeCntr" ref="cntr">
        <SVGEditor
          :zoom="zoom"
          :value="paths"
          @select="onSelect"
          :width="800"
          :height="400"
          :pos="pos"
          ref="editor"
          @qmouse="onMouseMove"/>
    </div>
    {{mouse}}

    {{svgs}}

    <div class="tests">
      <a @click="test_createLine" class="MatcButton"> Test Create Line </a>
      <a @click="test_createLineAndSelect" class="MatcButton"> Test Select Line </a>
    </div>

  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
  @import "../style/components/qux-svg-editor.scss";
</style>
<style>


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
import on from 'dojo/on'
import win from 'dojo/win'

export default {
  name: "SVFEditorTest",
  mixins: [],
  data: function() {
    return {
        paths: [],
        pos: {x:0 ,y:0},
        mouse: {},
        svgs: [],
        zoom: 0.8
    };
  },
  components: {
    'SVGEditor': SVGEditor
  },
  methods: {
      setZoom (z) {
        this.zoom = z
      },
      onMouseMove (p) {
          this.mouse = p
      },
      test_split () {
        const paths = [
          {
            "id": "pb1667599071427",
            "name": "Bezier", "hint": "Bezier", "type": "Path", "stroke": "#333333", "strokeWidth": 1, "fill": "", "d": 
              [
                { "t": "M", "x": 149, "y": 196 }, 
                { "t": "C", "x": 342, "y": 196, "x1": 217, "y1": 107, "x2": 270, "y2": 103 
              }]
          }]
          this.$refs.editor.value = paths
          this.$nextTick(() => {
            //this.$refs.editor.setShowAllBezier(true)
            this.$refs.editor.startMorphTool(true)
          })
       
      },
      onSelect (d) {
          this.selection = d
          this.svgs = JSON.stringify(d, null, 2)
      },
      createDiamond () {
        this.$refs.editor.startDiamondTool()
      },
      createRect () {
        this.$refs.editor.startRectangleTool(true)
      },
      createBezier () {
        this.$refs.editor.setShowAllBezier(true)
        this.$refs.editor.startBezierTool(true)
      },
      createLine () {
        this.$refs.editor.startPathTool(true)
      },
      createArc () {
        this.$refs.editor.startArcTool(true)
      },
      createEllipse () {
        this.$refs.editor.setShowAllBezier(true)
        this.$refs.editor.startEllipseTool(true)
      },
      createTriangle () {
        this.$refs.editor.startTriangleTool(true)
      },
      clear () {
        this.$refs.editor.clear()
      },
      test_createLine () {
        this.clear()
        let e = this.$refs.editor
        e.startPathTool()
        e.onMouseMove(this.e(30, 30))
        e.onMouseClick(this.e(30, 30))
        /** we need move */
        e.onMouseMove(this.e(60, 200))
        e.onMouseClick(this.e(60, 200))

        e.onMouseMove(this.e(200, 250))
        e.onMouseClick(this.e(200, 250))
        e.onMouseClick(this.e(300, 200))
        e.onMouseClick(this.e(350, 350))
        e.onMouseDoubleClick(this.e(300, 200))
        this.assertEquals(1, e.value.length)
      },
      test_createBezier () {
        this.clear()
        let e = this.$refs.editor
        //this.$refs.editor.setShowAllBezier(true)
        e.startBezierTool()
        e.onMouseMove(this.e(30, 30))
        e.onMouseClick(this.e(30, 30))
        /** we need move */
        e.onMouseMove(this.e(60, 200))
        e.onMouseClick(this.e(60, 200))

        e.onMouseDown(this.e(70, 220))
        e.onMouseMove(this.e(70, 220))


        e.onMouseMove(this.e(200, 250))
        e.onMouseClick(this.e(200, 250))

        e.onMouseDown(this.e(250, 220))
        e.onMouseMove(this.e(280, 210))
        
        e.onMouseMove(this.e(300, 200))
        e.onMouseClick(this.e(300, 200))

        e.onMouseMove(this.e(350, 350))
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
      },
      onKey (event) {
        let e = this.$refs.editor
        if (e) {
          e.onKeyDown(event)
        }
      }
  },
  mounted() {
      this.pos = domGeom.position(this.$refs.cntr)
      setTimeout(() => {
          //this.test_createLine()
          //this.test_createBezier()
          this.test_split()
      }, 100)

      this.keyBoardListener = on(win.body(), "keydown", this.onKey);
  }
};
</script>
