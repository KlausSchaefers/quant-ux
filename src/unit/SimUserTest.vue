<template>
    <div class="MatcLight">
      <h1>SimUserDialog Test</h1>
      <div class="MatcDialog MatchOpenAIChatDialog MatcPadding">
        <SimUserDialog ref="importDialog" @done="showResult"/>
      </div>

      <div class="Preview">
         {{result}}
      </div>
    </div>
  </template>
  
  <style lang="scss">
  @import "../style/matc.scss";
</style>
  <style>

  .Preview {
    position: absolute;
    top:0px;
    right: 0px;
    width: 300px;
    height: 100%;
    background: orange;
    font-size: 8px;
    white-space: pre;
    word-wrap: normal;
    padding: 8px;
  }

    .MatcDialog {
        box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2), 0px 0px 2px rgba(0, 0, 0, 0.2);
        overflow: auto;
        margin: 10px;
        background: #fff;
        width: 800px;
    }
  </style>
  
  <style lang="scss">
    @import "../style/canvas/all.scss";
    @import '../style/toolbar/tab.scss';
</style>

  <style lang="sass">
    @import "../style/bulma.sass"
  </style>
  
  <script>
  
  import SimUserDialog from 'canvas/toolbar/dialogs/SimUserDialog.vue'
  import app from './data/simUserForm1.json'
  
  export default {
    name: "FigmaTest",
    mixins: [],
    data: function() {
      return {
          files: [],
          previews: [],
          model: null,
          accessKey: '',
          result: ''
      };
    },
    components: {
      'SimUserDialog': SimUserDialog
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
        showResult (events) {
          this.result = JSON.stringify(events, null, 2)

        },
        getPreview() {
        },
        onSelect (d) {
            this.selection = d
        },
        setAccessKey () {
          localStorage.setItem('quxFigmaTest', this.accessKey)
        },
        async run() {
  
        }
    },
    mounted() {
      this.$refs.importDialog.setModel(app)
    }
  };
  </script>
  