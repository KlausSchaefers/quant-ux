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

<style lang="scss">
  @import "../style/matc.scss";
</style>
<style>

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
import Logger from '../core/Logger'


export default {
  name: "FigmaTest",
  mixins: [],
  data: function() {
    return {
        files: [],
        previews: [],
        model: null,
        accessKey: '',
        figma1: figma,
        fileLogin: 'eRXU9ZlV1m2zLJdEUJIOvF',
        fileComplex: 'VtVe96tDjhA0OByfcvJIlE9o',
        fileBug: 'bUyZvfdtErxaljjuboyYHY',
        pluginSimple: 'r4DTXpFJOTrWG3b7MVRc5v',
        selectedFile: ''
    };
  },
  components: {
    'Preview': Preview
  },
  computed: {
    screens () {
      if (this.model) {
        let screens = Object.values(this.model.screens)
        if (screens.length > 10) {
          screens = screens.slice(0, 10)
        }
        return screens
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
        let fService = new FigmaService(this.accessKey)
        let fModel = await fService.get(this.selectedFile)
        if (fModel) {
          let fPages = fService.getPages(fModel)
          let app = await fService.parse(this.selectedFile, fModel, false, {w: 375, h: 667}, fPages.map(page => page.id))
          if (app) {
            Object.values(app.screens).forEach(screen => {
              if (screen.props.figmaImage) {
                screen.style.backgroundImage = {
                  url: screen.props.figmaImage
                }
              }
            })
            app.widgets = {}
          }
          console.debug(app.screenSize)
          this.model = app
        }
      }
  },
  mounted() {
    Logger.setLogLevel(4)
    this.accessKey = localStorage.getItem('quxFigmaTest')
    this.selectedFile = this.fileBug
    this.run()
  }
};
</script>
