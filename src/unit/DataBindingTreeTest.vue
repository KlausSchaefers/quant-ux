<template>
  <div class="MatcLight">
    <h1 style="margin-left:20px; margin-bottom:20px;">DataBinding Test</h1>


   <div class="MatcDialog" style="display:inline-block; width:auto; vertical-align: top; margin-left:30px;">
        <DataBindingTree :app="app" @change="onChange" :value="selectedWidget" :canChangeVars="false" v-if="!waiting"/>
    </div>

     <code style="
          display: inline-block;
          width: 300px;
          height:300px;
          vertical-align: top;
          word-break: break-all;
          white-space: pre;
          word-wrap: break-word;">{{result}}</code>


  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
</style>
<style>

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
      result: {},
      settings: {},
      selectedTest: 3,
      selectedWidget:  {
        "id" : "w10007_32115",
        "type" : "Table",
        "name" : "Text Box 5",
        "props" : {
          "label" : "Enter a value",
          "placeholder" : true,
          "databinding" : {
            "default" : "address.int",
            "output": "address.out",
            "action": "address.action"
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
          this.result = JSON.stringify(d, null, 2)
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
