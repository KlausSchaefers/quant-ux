<template>
    <div class="MatcLight">
     <div class="MatcAgentWorkSpace">
        <div class="MatcAgentWorkSpaceChat ">
            <AIChat :messages="messages" @add="add"></AIChat>
        </div>
        <div>Canvas</div>
     </div>
      
    </div>
  </template>
  
  <style lang="scss">
  @import "../style/matc.scss";
</style>
  <style>

   
    .MatcDialog {
        box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2), 0px 0px 2px rgba(0, 0, 0, 0.2);
        overflow: auto;
        margin: 10px;
        background: #fff;
    }
  </style>
    <style lang="scss">
     @import "../style/canvas/all.scss";
     @import './agent.scss';
     @import '../style/toolbar/tab.scss';
</style>
  <style lang="sass">
    @import "../style/bulma.sass"
  </style>
  
  <script>
import AIChat from '../canvas/toolbar/chat/AIChat.vue';


  
  export default {
    name: "FigmaTest",
    mixins: [],
    data: function() {
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
        add (result) {
          console.debug("add", result)
        },
        getPreview() {
        },
        onSelect (d) {
            this.selection = d
        },
        setAccessKey () {
        },
        async run() {
  
        }
    },
    mounted() {

    }
  };
  </script>
  