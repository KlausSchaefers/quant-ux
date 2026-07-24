<template>
  <div class="MatcLight">
    <div class="MatcAgentWorkSpace">
      <div class="MatcAgentWorkSpaceChat ">
        <AIChat :messages="messages" @add="add" ref="chat" defaultMessage="Generate a landing page for a petshop"></AIChat>
      </div>
      <div>Canvas</div>
    </div>

  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
  @import "../style/canvas/all.scss";
  @import './agent.scss';
  @import '../style/toolbar/tab.scss';
</style>
<style lang="sass">
    @import "../style/bulma.sass"
</style>

<script>
import AIChat from '../canvas/toolbar/chat/AIChat.vue';
import agent_demo_1 from './data/agent_demo_1.json'


export default {
  name: "FigmaTest",
  mixins: [],
  data: function () {
    return {
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
    AIChat
  },
  computed: {

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

    }
  },
  mounted() {
    this.$refs.chat.setModel(agent_demo_1)
  }
};
</script>