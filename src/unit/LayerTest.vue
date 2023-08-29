<template>
  <div class="MatcLight">

    <LayerList :value="app" class="Wrapper" ref="layerList" />

     <code style="
          display: inline-block;
          width: 300px;
          height:300px;
          margin-left:350px;
          font-size:8px;
          vertical-align: top;
          word-break: break-all;
          white-space: pre;
          word-wrap: break-word;">{{this.app.groups}}</code>

  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
</style>
<style>
  .Wrapper{
    display: inline-block;
    margin: 0px;
    border: 1px dashed orange;
    vertical-align: top;
    widows: 250px;
    height: 400px;;
  }
</style>

<script>

import layerapp from './data/layerapp.json'
import LayerList from 'canvas/toolbar/LayerList'
import Controller from 'canvas/controller/Controller'

export default {
  name: "AnimationTest",
  mixins: [],
  data: function() {
    return {
      app: layerapp,
      groups: {}
    };
  },
  components: {
    'LayerList': LayerList
  },
  methods: {

  },
  mounted() {

    this.controller = new Controller()
    this.controller.setModel(this.app)
    this.controller.saveModelChanges = () => {
      console.debug('onModelUpdate')
      this.app = this.controller.model
      this.$refs.layerList.render(this.app)
    }
    this.controller.addCommand = () => {}
    this.$refs.layerList.setController(this.controller)

  }
};
</script>
