<template>
  <div class="MatcLight">
    <h1>Sketch Test</h1>

    <div class="MatcTReeCntr" v-for="file in files" :key="file.name">
        {{file.json}}
    </div>

    <div class="MatcTReeCntr" v-if="false">
        {{model}}
    </div>

    <div
        class="MatcPreviewCntr"
        v-for="screen in screens"
        :key="screen.id"
        :style="{'width:': width, 'height':height}">
        <Preview :app="model" :screen="screen.id" />
    </div>

    <img :src="getPreview(preview)" v-for="preview in previews" :key="preview.name">

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
      width: 250px;
      height: 400px;
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

import SketchService from 'services/SketchService'
import Preview from 'page/Preview'

export default {
  name: "SketchTest",
  mixins: [],
  data: function() {
    return {
        files: [],
        previews: [],
        model: null
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
      return null
    },
    width () {
      if (this.model) {
        return this.model.screenSize.w + 'px'
      }
      return 0
    },
    height () {
      if (this.model) {
        return this.model.screenSize.h + 'px'
      }
      return 0
    }
  },
  methods: {
      getPreview(preview) {
        var blob = new Blob( [ preview.bytes ], { type: "image/jpeg" } );
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL( blob );
        return imageUrl
      },
      onSelect (d) {
          this.selection = d
      },
      async run() {
        fetch('/public/test/sketch1.sketch').then(resp => {
            resp.arrayBuffer().then(async bytes => {
                let service = new SketchService()
                let result = await service.run(bytes)
                // this.files = result.files
                this.model = result.model
                // this.previews = result.previews
                console.debug(this.previews)
            })
        })

      }
  },
  mounted() {
      this.run()
  }
};
</script>
