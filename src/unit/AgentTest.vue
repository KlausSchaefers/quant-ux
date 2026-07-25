<template>
  <div class="MatcLight">
    <div class="MatcAgentWorkSpace">
      <div class="MatcAgentWorkSpaceChat MatcToobarPropertiesSection ">
        <AIChat :messages="messages" @add="add" ref="chat" defaultMessage="Generate a landing page for a petshop"></AIChat>
      </div>
      <div>
        <ZoomableCanvas :cellWidth="model.screenSize.w" :cellHeight="maxScreenHeight">
         
          <div v-for="scrn in screens" :key="scrn.id" class="MatcAgentWorkSpaceScreen" :style="{width: scrn.w + 'px', height: scrn.h + 'px'}">
            <Preview :app="model" :screen="scrn.id"></Preview>
          </div>
         
        </ZoomableCanvas>
      </div>
    </div>

  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
  @import "../style/canvas/all.scss";
  @import './agent.scss';
  @import '../style/toolbar/all.scss';
</style>
<style lang="sass">
    @import "../style/bulma.sass"
</style>

<script>
import AIChat from '../canvas/toolbar/chat/AIChat.vue';
import agent_demo_1 from './data/agent_demo_1.json'
import ZoomableCanvas from './ZoomableCanvas'
// eslint-disable-next-line no-unused-vars
import Preview from 'page/Preview'

export default {
  name: "FigmaTest",
  mixins: [],
  data: function () {
    return {
      model: agent_demo_1,
      messages: [{
        content: 'Hi',
        role: 'assistant'
      }, {
        content: 'There',
        role: 'user'
      }]
    };
  },
  components: {
    AIChat, ZoomableCanvas, Preview
  },
  computed: {
    screens () {
      if (this.model) {
        return Object.values(this.model.screens)
      }
      return []
    },
    maxScreenHeight () {
      return this.screens.reduce((max, scrn) => Math.max(max, scrn.h), 0)
    }
  },
  methods: {
    add(result) {
      console.debug("add", result)
    },
    getPreview() {
    },
    onSelect(d) {
      this.selection = d
    },
    setAccessKey() {
    },
    async run() {
      // const messages = [
      //   {
      //     content: 'generate a html page for a pet shop'
      //   }
      // ]

      // const ollama = new Ollama('/api/generate', '')
      // //const result = ollama.runPrompt(messages)
    }
  },
  mounted() {
    this.$refs.chat.setModel(this.model)
   
  }
};
</script>


