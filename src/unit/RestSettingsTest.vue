<template>
  <div class="MatcLight">
    <h1 style="display:inline-block;margin-left:20px; margin-bottom:20px;">REST Test</h1>

      <SegmentButton :options="options" v-model="selectedTest" style="width:600px; display: inline-block"/>


    <div class="MatcDialog" style="display: inline-block; width:auto; vertical-align: top; margin-left:30px;">
        <RestSettings :app="app" @change="onChange" :value="selectedWidget"/>
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

<style lang="scss">
  @import "../style/matc.scss";
</style>

<style lang="scss">
@import '../style/toolbar/tab.scss';
</style>

<script>

import RestSettings from 'canvas/toolbar/components/RestSettings'
import rest from './data/rest.json'
import SegmentButton from 'page/SegmentButton'

export default {
  name: "ResizeTest",
  mixins: [],
  data: function() {
    return {
      app: rest,
      settings: {},
      tests: [
          {
            "method": "GET",
            "url": "http://localhost:8080/test/${url}.json",
            "token": "",
            "input": {
                "type": "JSON",
            "template": "{\n  \"a\": ${radio},\n  \"b\": ${text}\n}"
            },
            "output": {
                "databinding": "abc",
                "template": "",
                "type": "JSON",
                "hints": []
            },
            headers: [
              {key: 'a', value: '1'},
              {key: '${key}', value: '2'},
              {key: 'c', value: '${value}'}
            ]
        },
        {
          "method": "POST",
          "url": "http://localhost:3000/test/post/json",
          "token": "",
          "input": {
              "type": "JSON",
             "template": '{\n  "a": "${radio}",\n  "b": "${text}"\n}'
          },
          "output": {
              "databinding": "def",
              "template": "",
              "type": "JSON",
              "hints": []
          },
          headers: [
              {key: 'a', value: 'b'}
          ]
        },
        {
          "method": "GET",
          "url": "http://localhost:8081/public/../style/img/AB1.png",
          "token": "",
          "input": {
              "type": "JSON",
              "template": "{\n  \"a\": ${radio},\n  \"b\": ${text}\n}"
          },
          "output": {
              "databinding": "xyz",
              "template": "",
              "type": "IMAGE",
              "hints": []
          },
          header: [
              {key: 'a', value: 'b'}
          ]
        },
        {
          "method": "POST",
          "url": "http://localhost:3000/test/post/image",
          "token": "",
          "input": {
            "type": "FILE",
            "fileDataBinding": "selfie",
            "template": "{}"
          },
          "output": {
              "databinding": "lala",
              "template": "",
              "type": "JSON",
              "hints": []
          },
          header: [
              {key: 'a', value: 'b'}
            ]
        },
        // https://cloud.google.com/vision/docs/labels
        {
          "method": "POST",
          "url": "https://vision.googleapis.com/v1/images:annotate?key=${key}",
          "token": "",
          "input": {
            "type": "JSON",
            "fileDataBinding": "",
            "template": `
{
  "requests": [
    {
      "image": {
        "content": "\${image}"
      },
      "features": [
        {
          "maxResults": 5,
          "type": "LABEL_DETECTION"
        }
      ]
    }
  ]
}
          `
          },
          "output": {
              "databinding": "lala",
              "template": "",
              "type": "JSON",
              "hints": []
          }
        },
        {
          "method": "POST",
          "url": "http://localhost:8083/api/form",
          "token": "",
          "input": {
            "type": "FORM",
            "fileDataBinding": "selfie",
            "template": "a: 'ABC\nb: ${text}"
            
          },
          "output": {
              "databinding": "FORM",
              "template": "",
              "type": "JSON",
              "hints": []
          },
          header: [
              {key: 'a', value: 'b'}
            ]
        },
      ],
      options : [
        {label: "JSON Get", value: 0},
        {label: "JSON Post", value: 1},
        {label: "Image Get", value: 2},
        {label: "Image Post", value: 3},
        {label: "Goolge Vision", value: 4},
        {label: "FORM Post", value: 5},
      ],
      selectedTest: 0
    };
  },
  components: {
    RestSettings: RestSettings,
    SegmentButton: SegmentButton
  },
  computed: {
    selectedWidget () {
      return  {
            "id" : "Rest",
            "name" : "Rest",
            "type":"Rest",
            "x": 0,
            "y": 0,
            "w": 80,
            "h": 80,
            "props" : {
                "label" : "Rest",
                "rest": this.tests[this.selectedTest]
            }
      }
    }
  },
  methods: {
      onFileChange (f) {
        console.debug(f)
      },
      onChange (d) {
          this.settings = JSON.stringify(d, null, 2)
      }
  },
  mounted() {

  }
};
</script>
