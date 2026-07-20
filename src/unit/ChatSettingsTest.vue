<template>
  <div class="MatcLight">
    <h1>ChatSettings Test</h1>

    <div class="dialog MatcDialog VommondDialogContent">
      <ChatSettings :app="app" :value="widget" />
    </div>


  </div>
</template>

<style lang="scss">
@import "../style/matc.scss";
@import "../style/common.scss";
@import "../style/canvas/all.scss";
@import '../style/toolbar/tab.scss';
@import '../style/toolbar/all.scss';
</style>
<style>
.dialog {
  padding: 20px;
  width: 840px;
  margin: 20px;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2)
}
</style>

<script>

import app from './data/tableapp.json'
import ChatSettings from 'canvas/toolbar/components/ChatSettings'

export default {
  name: "ChatSettingsTest",
  mixins: [],
  data: function () {
    return {
      app: app,
      widget: {
        "id": "Chat",

        "props": {
          "label": "Type a message",
          "placeholder": false,
          "messageAsBubble": true,
          "value": [
            {
              "type": "message",
              "role": "assistant",
              "content": "Hello there!"
            },
            {
              "type": "message",
              "role": "user",
              "content": "Tell me something in latin!"
            },
            {
              "type": "message",
              "role": "assistant",
              "content": "**Lorem** ipsum __dolor__ sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n"
            }

          ],
          "responses": [
            {
              "type": "message",
              "role": "assistant",
              "content": "Thanks!"
            }
          ]
        },
      },
      model: null
    };
  },
  components: {
    'ChatSettings': ChatSettings
  },
  computed: {
  },
  methods: {
  },
  mounted() {
  }
};
</script>
