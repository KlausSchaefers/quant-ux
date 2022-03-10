<template>
  <div class="MatcLight">
    <h1 style="margin-left:20px; margin-bottom:20px;">DataBinding Test</h1>


   <div class="MatcDialogBack" style="display:inline-block; width:auto; vertical-align: top; margin-left:30px;">
        <DataBindingTree :app="app" @change="onChange" :value="selectedWidget" :canChangeVars="false" v-if="!waiting"/>
    </div>

     <code style="
          display: inline-block;
          width: 300px;
          height:300px;
          vertical-align: top;
          word-break: break-all;
          white-space: pre;
          word-wrap: break-word;">{{app}}</code>


  </div>
</template>

<style>
  @import url("../style/matc.css");
  .MatcDataSettings {
      background: white;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
      padding:20px;
  }
</style>

<script>

import DataBindingTree from 'canvas/toolbar/components/DataBindingTree'
import databinging from './data/databinging.json'

export default {
  name: "DataSettingsTest",
  mixins: [],
  data: function() {
    return {
      waiting: true,
      app: databinging,
      settings: {},
      selectedTest: 3,
      selectedWidget:  {
        "id" : "w10007_32115",
        "type" : "TextBox",
        "name" : "Text Box 5",
        "props" : {
          "label" : "Enter a value",
          "placeholder" : true,
          "databinding" : {
            "default" : "address.zip"
          }
        }
      },
    };
  },
  components: {
    DataBindingTree: DataBindingTree
  },
  computed: {
  },
  methods: {
      onChange (d) {
          this.settings = JSON.stringify(d, null, 2)
      }
  },
  mounted() {
    this.app.schemas = {
      "user": {
        "type": "Object",
        "default": {},
        "children": {
          "name": {
            "type": "String",
            "default": "Peter",
            "required": true
          }
        }
      }
      
    }
    this.waiting = false
  }
};
</script>
