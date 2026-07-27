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
    <div class="MatcAgentWorkSpacePreview" ref="iFramePreview">

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
//import agent_demo_1 from './data/agent_demo_1.json'
import agent_demo_empty from './data/agent_demo_empty'
import ZoomableCanvas from './ZoomableCanvas'
// eslint-disable-next-line no-unused-vars
import Preview from 'page/Preview'

export default {
  name: "FigmaTest",
  mixins: [],
  data: function () {
    return {
      model: agent_demo_empty,
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
      this.mergeScreenInApp(result, this.model)
      console.debug(this.model)
      this.$forceUpdate()
      // now we would have to offset things. based on a pos
      //const html = Object.values(result._html)[0]
      //const scrn = Object.values(result.screens)[0]
      //this.renderIframe(html, scrn.w, scrn.h)

    },

    mergeScreenInApp(app, result) {
      result.screens = Object.assign({}, result.screens, app.screens);
      result.widgets = Object.assign({}, result.widgets, app.widgets);
      result.groups = Object.assign({}, result.groups, app.groups);
      result.lines = Object.assign({}, result.lines, app.lines);
      return result;
    },

    renderIframe(html, width, height) {
        const cntr = this.$refs.iFramePreview
        cntr.innerText = ''
        const iframe = document.createElement('iframe')
        iframe.style.width = width + 'px'
        iframe.style.height = height + 'px'
        iframe.srcdoc = html
        cntr.appendChild(iframe)
    },

    offsetApp(app, pos) {
      Object.values(app.screens).forEach(scrn => {
        scrn.x += pos.x;
        scrn.y += pos.y;
      });
      Object.values(app.widgets).forEach(widget => {
        widget.x += pos.x;
        widget.y += pos.y;
      });
      return app;
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


