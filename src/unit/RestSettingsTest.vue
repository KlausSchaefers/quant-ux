<template>
  <div class="MatcLight">
    <h1>Resize Test</h1>
    <div class="" style="display: inline-block; width:auto; vertical-align: top; margin-left:30px;">
        <RestSettings :app="app" @change="onChange" :value="widget"/>
    </div>
  <code style="
        display: inline-block;
        width: 300px; 
        height:300px; 
        vertical-align: top; 
        word-break: break-all; 
        white-space: pre;
        word-wrap: break-word;">{{settings}}</code>

  </div>
</template>

<style>
  @import url("../../public/style/matc.css");
  .MatcToolbarRestSettings {
      background: white;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
      padding:20px;
      display: inline-block;
  }
</style>

<script>

import RestSettings from 'canvas/toolbar/RestSettings'
import rest from './data/rest.json'

export default {
  name: "ResizeTest",
  mixins: [],
  data: function() {
    return {
      app: rest,
      settings: {},
      widget: {
            "id" : "Rest",
            "name" : "Rest",
            "type":"Rest",
            "x": 0,
            "y": 0,
            "w": 80,
            "h": 80,
            "props" : {
                "label" : "Rest",
                "rest": {
                   	"method": "GET",
                    "url": "http://localhost:8081/public/test/1.json",
                    "token": "",
                    "input": {
                        "type": "JSON",
                        "template": "{\n\"a\": ${test}\n}"
                    },
                    "output": {
                        "databinding": "abc",
                        "template": "",
                        "type": "JSON",
                        "hints": []
                    }
                }
            },
            "has" :{
                "rest" : true
            },
            "style" : {
                "background": "#777"
            }
        } 
    };
  },
  components: {
    RestSettings: RestSettings
  },
  methods: {
      onChange (d) {
          this.settings = JSON.stringify(d, null, 2)
      }
  },
  mounted() {
    
  }
};
</script>
