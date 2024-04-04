<template>
    <div class="MatcLight">
      <h1>DesignGPTDialog Test XXX</h1>
      <div class="MatcDialog MatchImportDialog MatchImportOpenAIDialog MatcPadding">
        <DesignGPTDialog ref="importDialog"/>
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
    @import '../style/toolbar/tab.scss';
</style>
  <style lang="sass">
    @import "../style/bulma.sass"
  </style>
  
  <script>
  
  import DesignGPTDialog from 'canvas/toolbar/dialogs/DesignGPTDialogSmall'
  import app from './data/designGPT.json'
  
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
      'DesignGPTDialog': DesignGPTDialog
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
          localStorage.setItem('quxFigmaTest', this.accessKey)
        },
        async run() {
  
        }
    },
    mounted() {
      this.$refs.importDialog.setModel(app)
      this.$refs.importDialog.setJwtToken('lalal')
    }
  };
  </script>
  