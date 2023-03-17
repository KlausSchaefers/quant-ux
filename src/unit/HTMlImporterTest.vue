<template>
    <div class="MatcPadding" id="">
      <h1>HTML Importer</h1>

      <div class="panel">
        <textarea v-model="html" style="">
        
        </textarea>

        <div class="inner" ref="inner"></div>
        <pre>{{result}}</pre>

      </div>

      <div>
        <button @click="run()">Run</button>
      </div>

  

    </div>
  </template>
    
  <style lang="css">
  @import url("../style/matc.css");

  .panel {
    display: flex;
    gap:40px
  }

  textarea, pre {
    border: 1px solid #333;
    height: 600px;
    flex-grow: 1;
  }

  .inner {
    height: 600px;
    width: 400px;
    overflow: hidden;
    border: 1px solid #333;
    border-radius: 16px;
  }

  .inner iframe {
    height: 600px;
    width: 400px;
    border: none;
  }
  </style>
    
  <script>

import * as HTMLImporter from '../core/ai/HTMLImporter'
import {html} from './data/htmlLogin'

  export default {
    name: "home",
    mixins: [],
    data: function () {
      return {
        result: {},
        html: html
      };
    },
    components: {
    },
    methods: {
     
      async run() {
        let result = await HTMLImporter.html2QuantUX(this.html, this.$refs.inner)
        this.result = JSON.stringify(result, null, 2)
      },
     
    },
    mounted() {
      this.run()
    }
  };
  </script>
    