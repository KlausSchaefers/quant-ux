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
          word-wrap: break-word;">{{settings}}</code>


  </div>
</template>

<style>
  @import url("../../public/style/matc.css");
  .MatcDataSettings {
      background: white;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
      padding:20px;
  }
</style>

<script>

import DataBindingTree from 'canvas/toolbar/DataBindingTree'
import rest from './data/rest.json'

export default {
  name: "DataSettingsTest",
  mixins: [],
  data: function() {
    return {
      waiting: true,
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
    this.app.dataModel = {
      variables: [
        {
          name: "objectVar",
          type: "Object",
          children: [
            {
              name: "id",
              type: "String",
              value: ""
            },
            {
              name: "email",
              type: "String",
              value: ""
            },
            {
              name: "lastname",
              type: "String",
              value: ""
            },
            {
              name: "address",
              type: "Object",
              children: [
                {
                  name: "street",
                  type: "String",
                  value: ""
                },
                {
                  name: "city",
                  type: "String",
                  value: ""
                },
                {
                  name: "zip",
                  type: "Number",
                  value: null,
                },
                {
                  name: "country",
                  type: "String",
                  value: ""
                },
              ]
            }
          ]
        },
        {
          name: "intVar",
          type: "Number",
          value: 1
        },
        {
          name: "stringVar",
          type: "String",
          value: "abc"
        },
        {
          name: "boolVar",
          type: "Boolean",
          value: true
        },
        {
          name: "arrayVar",
          type: "Array"
        }
      ]
    }
    this.waiting = false
  }
};
</script>
