<template>
  <div class="MatcLight">
    <h1>Sketch Test</h1>

    <div class="MatcTReeCntr" v-for="file in files" :key="file.name">
        {{file.json}}
    </div>

    <div class="MatcTReeCntr">
        {{model}}
    </div>


  </div>
</template>

<style>
  @import url("../../public/style/matc.css");
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
</style>

<script>

import SketchService from 'services/SketchService'

export default {
  name: "SketchTest",
  mixins: [],
  data: function() {
    return {
        files: [],
        model: {}
    };
  },
  components: {
  },
  methods: {
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
            }) 
        })
   
      }
  },
  mounted() {
      this.run()
  }
};
</script>
