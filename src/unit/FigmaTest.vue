<template>
  <div class="MatcLight">
    <h1>Figma Test</h1>
    <input v-model="accessKey" @change="setAccessKey" v-if="!accessKey"/>

    <div class="MatcTReeCntr" v-for="file in files" :key="file.name">
        {{file.json}}
    </div>

    {{height}} {{width}}

    <div
        class="MatcPreviewCntr"
        v-for="screen in screens"
        :key="screen.id"
        :style="{'width': width, 'height':height}">
        <Preview :app="model" :screen="screen.id" />
    </div>

  </div>
</template>

<style>
  @import url("../style/matc.css");
  .MatcTReeCntr {
      background: #f2f2f2;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
      display: inline-block;
      padding: 5px;
      overflow: scroll;
      margin-left: 30px;
      font-size: 14px;
  }
  .MatcPreviewCntr {
      background: #f2f2f2;
      box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2), 0px 0px 2px rgba(0, 0, 0, 0.2);
      display: inline-block;
      width: 250px;
      height: 400px;
      overflow: scroll;
      margin-left: 30px;
      font-size: 14px;
      vertical-align: top;
      overflow: auto;
      border-radius: 10px;
  }
</style>

<script>

import FigmaService from 'services/FigmaService'
import Preview from 'page/Preview'
import figma from './data/figma.json'

export default {
  name: "FigmaTest",
  mixins: [],
  data: function() {
    return {
        files: [],
        previews: [],
        model: null,
        accessKey: '',
        figma1: figma
    };
  },
  components: {
    'Preview': Preview
  },
  computed: {
    screens () {
      if (this.model) {
        return Object.values(this.model.screens)
      }
      return []
    },
    width () {
      if (this.model && this.model.screenSize) {
        return this.model.screenSize.w + 'px'
      }
      return 0
    },
    height () {
      if (this.model && this.model.screenSize) {
        return this.model.screenSize.h + 'px'
      }
      return 0
    }
  },
  methods: {
      getPreview() {
      },
      onSelect (d) {
          this.selection = d
      },
      setAccessKey () {
        localStorage.setItem('quxFigmaTest', this.accessKey)
      },
      async run() {
        //let app = await FigmaService.get('vABDxPscPKnF2qV4yTroUB')
        let app = await FigmaService.get('VtVe96tDjhA0OByfcvJIlE9o', true)
        if (app) {
          Object.values(app.screens).forEach(screen => {
            if (screen.props.figmaImage) {
              screen.style.backgroundImage = {
                url: screen.props.figmaImage
              }
            }
          })
        }
        console.debug(app)
        this.model = app
      }
  },
  mounted() {
    this.accessKey = localStorage.getItem('quxFigmaTest')
    FigmaService.setAccessKey(this.accessKey)
    console.debug(this.accessKey)
    this.run()
  }
};
</script>
