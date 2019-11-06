<template>
  <div class="MatcLight">
    <h1 style="margin-left:20px; margin-bottom:20px;">DataBinding Test</h1>


   <div class="MatcDialogBack" style="display:inline-block; width:auto; vertical-align: top; margin-left:30px;">
        <DataBinding :app="app" @change="onChange" :value="selectedWidget" :canChangeVars="false"/>
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
  .MatcDataBinding {
      background: white;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
      padding:20px;
  }
</style>

<script>

import DataBinding from 'canvas/toolbar/DataBinding'
import rest from './data/rest.json'

export default {
  name: "DataBindingTest",
  mixins: [],
  data: function() {
    return {
      app: rest,
      settings: {},
      selectedTest: 3,
      selectedWidget: {
            "id" : "Rest",
            "name" : "Rest",
            "type":"Repeater",
            "x": 0,
            "y": 0,
            "w": 80,
            "h": 80,
            "props" : {
                "label" : "Rest",
                 "databinding" : {
                    "default" : "content",
                    "output": "image"
                },
                "hasOutputDataBinding": false
            }
      }
    };
  },
  components: {
    DataBinding: DataBinding
  },
  computed: {
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
