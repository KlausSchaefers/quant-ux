<template>
  <div class="MatcCanvasVector" :style="{'width': width + 'px', 'height': height + 'px'}">
      <canvas ref="canvas" :style="{'width': width + 'px', 'height': height + 'px'}"/>
  </div>
</template>

<style>
  @import url("../../public/style/matc.css");
</style>

<script>
import paper from 'paper'

export default {
  name: "VectorEditor",
  mixins: [],
  props: ['width', 'height'],
  data: function() {
    return {
      checkBoxChecked: true,
      options: [{ label: "a", value: "a" }, { label: "b", value: "b" }],
      user: "not loaded"
    };
  },
  components: {
  },
  methods: {
  
  },
  mounted() {
    console.debug(paper)

    let canvas = this.$refs.canvas

    paper.setup(canvas);
    // Create a Paper.js Path to draw a line into it:
    var path = new paper.Path();
    // Give the stroke a color
    path.strokeColor = 'black';
    var start = new paper.Point(100, 100);
    // Move to start and draw a line from there
    path.moveTo(start);
    // Note that the plus operator on Point objects does not work
    // in JavaScript. Instead, we need to call the add() function:
    path.lineTo(start.add([ 200, -50 ]));
    // Draw the view now:
    paper.view.draw();

    var tool = new paper.Tool();

    // Define a mousedown and mousedrag handler
    tool.onMouseDown = function(event) {
        path = new paper.Path();
        path.strokeColor = 'black';
        path.add(event.point);
    }
    // http://paperjs.org/tutorials/getting-started/using-javascript-directly/
    tool.onMouseDrag = function(event) {
        path.add(event.point);
    }
  }
};
</script>
