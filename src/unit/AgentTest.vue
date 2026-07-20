<template>
    <div class="MatcLight">
     <div class="MatcAgentWorkSpace">
        <div class="MatcAgentWorkSpaceChat">
            <Chat></Chat>
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
     @import '../style/agent.scss';
     @import '../style/toolbar/tab.scss';
</style>
  <style lang="sass">
    @import "../style/bulma.sass"
  </style>
  
  <script>
import Chat from '../canvas/toolbar/chat/Chat.vue';

  
  export default {
    name: "FigmaTest",
    mixins: [],
    data: function() {
      return {
          files: [],
          previews: [],
          model: null,
          accessKey: '',
      };
    },
    components: {
        Chat
    },
    computed: {
      screens () {
        if (this.model) {
          return Object.values(this.model.screens)
        }
        return null
      },
      width () {
        if (this.model) {
          return this.model.screenSize.w + 'px'
        }
        return 0
      },
      height () {
        if (this.model) {
          return this.model.screenSize.h + 'px'
        }
        return 0
      }
    },
    methods: {
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
  