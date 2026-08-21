<template>
  <div class="MatcLight">
    <div class="MatcAgentWorkSpace">
      <div class="MatcAgentWorkSpaceChat MatcToobarPropertiesSection ">
        <div class="MatcAgentWorkSpaceChatHeader">
          <QIcon icon="Visible" @click="showIframe = !showIframe" v-if="showIframe"/>
          <QIcon icon="Hidden" @click="showIframe = !showIframe" v-if="!showIframe"/>

          <QIcon icon="Code" @click="showHTML = !showHTML"/>
          <QIcon icon="CSS" @click="showCSS = !showCSS; renderCSS()"/>
          <QIcon icon="AddWidget" @click="showIntend"/>
          <QIcon icon="DataBinding" @click="showMemory"/>
        </div>
        <AIChat 
          :messages="messages" 
          @settings="showSettings"
          @agentResult="onAgentResult" 
          ref="chat" 
          :isDebug="true"
          :defaultMessage="examples[4]"></AIChat>
      </div>
      <div>
        <ZoomableCanvas :cellWidth="model.screenSize.w" :cellHeight="maxScreenHeight">
    
          <div @click="onSelectScreen(scrn)" v-for="scrn in screens" :key="scrn.id" class="MatcAgentWorkSpaceScreen" :style="{width: scrn.w + 'px', height: scrn.h + 'px'}">
            <Preview :app="model" :screen="scrn.id"></Preview>
          </div>
         
        </ZoomableCanvas>
      </div>
    </div>
    <div class="MatcAgentWorkSpacePreview" ref="iFramePreview" v-show="showIframe">

    </div>

    <div class="MatcAgentWorkSpacePreview" ref="htmlPreview" :style="{'width': model.screenSize.w + 'px'}" v-show="showHTML">
      Lala
    </div>

    <div class="MatcAgentWorkSpacePreview" :style="{'width': model.screenSize.w + 'px'}" v-show="showCSS">
      <code ref="cssPreview" >

      </code>
    </div>

    <ZoomDialog ref="settingsDialog">
      <div class="MatcDialogM  MatcPadding">
        <AISettings @close="closeSettings" />
      </div>
      
    </ZoomDialog>

    <ZoomDialog ref="intendDialog">
      <div class="MatcDialogM  MatcPadding">
          <h1>Intend</h1>
      </div>
     

    </ZoomDialog>

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
// eslint-disable-next-line no-unused-vars
import QUX2HTML from '../ai/QUX2HTML'
// eslint-disable-next-line no-unused-vars
import agent_demo_1 from './data/agent_demo_1.json'
// eslint-disable-next-line no-unused-vars
import agent_demo_empty from './data/agent_demo_empty'
import ZoomableCanvas from './ZoomableCanvas'
import ZoomDialog from 'common/ZoomDialog'
import AISettings from 'canvas/toolbar/dialogs/AISettings'
import Preview from 'page/Preview'
import QIcon from 'page/QIcon'
import QUX2CSS from '../ai/QUX2CSS.js';
import * as Util from '../ai/AIUtil';

export default {
  name: "FigmaTest",
  mixins: [],
  data: function () {
    return {
      model: agent_demo_1, //agent_demo_empty,
      showIframe: true,
      showHTML: false,
      showCSS: false,
      messages: [{
        content: 'Hi',
        role: 'assistant'
      }, {
        content: 'There',
        role: 'user'
      }],
      examples: [
        'Generate a landing page for a petshop',
        'Generate a landing page for horse tinder',
        'Generate a web form for a pet clinic. The users want to register for an appointment. The form should aks for the name, the email, the type of animal (cat, dog, other) and the age of the animal.',
        'Delete the image from the screen',
        'Create a login page for the app.'
      ]
    };
  },
  components: {
    AIChat, ZoomableCanvas, Preview, QIcon, ZoomDialog, AISettings
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
    onAgentResult(result) {
      //console.debug(result)
      this.showMemory()
      for (let change of result.changes) {
        //console.debug('onAgentResult() > ', result)
        if (change.type === 'addScreen') {
          this.add(change)
        }
      }
    },

    add(change) {
      const result = change.value
      Util.mergeScreenInApp(result, this.model)
      const html = change.html
      const scrn = Object.values(result.screens)[0]
      this.renderIframe(html, scrn.w, scrn.h)
      if (this.showHTML) {
        this.renderHTML(scrn, scrn.w, scrn.h)
      }
      if (this.showCSS) {
        this.renderCSS(scrn, scrn.w, scrn.h)
      }
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

    renderHTML(scrn, width, height) {
        const qux = new QUX2HTML();
        const html = qux.toHTML(this.model, scrn.id)
        console.debug('AgentTest.renderHTML() > ', Math.ceil(html.length / 1000) + 'kb')
        //console.debug(html)
        const cntr = this.$refs.htmlPreview
        cntr.innerText = ''
        const iframe = document.createElement('iframe')
        iframe.style.width = width + 'px'
        iframe.style.height = height + 'px'
        iframe.srcdoc = html
        cntr.appendChild(iframe)
    },

    renderCSS () {
      const qux2CSS = new QUX2CSS();
      const css = qux2CSS.toCSS(this.model, true)
      const cntr = this.$refs.cssPreview
      cntr.innerText = css
    },

    onSelectScreen (scrn) {
      console.debug('onSelectScreen', scrn)
      this.renderHTML(scrn, scrn.w, scrn.h)
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
    showIntend(e) {
      this.$refs.intendDialog.show(e.target)
    },
    showMemory () {
      const m = this.$refs.chat.getMemory()
      console.debug('showMemory() > ', m.data)
    },
    showSettings(e) {
      this.$refs.settingsDialog.show(e.target)
    },
    closeSettings() {
      this.$refs.settingsDialog.close()
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
    if (this.showCSS) {
        this.renderCSS()
    }
  }
};
</script>


