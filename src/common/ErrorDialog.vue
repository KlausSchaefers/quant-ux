<template>
    <ZoomDialog ref="dialog">
      <div class="MatcDialog MatcErrorDialog">  
        <h2 class="title">{{message}}</h2>
        <label>Stack</label>
        <pre class="MatcErrorStackTrace">{{stack}}</pre>
        <label>Trace</label>
        <pre class="MatcErrorStackTrace">{{trace}}</pre>  
        <div class="MatcButtonBar MatcMarginTop">
            <a @click="close" class="MatcButton">Close</a>
            <a @click="doNotShowAgain = true; close()" class="MatcButton">Do not show again</a>
        </div>
      </div>  

    </ZoomDialog>
  </template>
  <style lang="css">
    .MatcErrorDialog {
        width:800px;
    }
    .MatcErrorStackTrace{
        padding: 16px;
        font-size: 12px;
        height: 200px;
        overflow: auto;
    }
  </style>
  <script>
  import Logger from "common/Logger";
  import ZoomDialog from 'common/ZoomDialog'
  
  export default {
    name: "ErrorDialog",
    props: ['pub'],
    mixins: [],
    data: function () {
      return {
        message: '',
        stack: '',
        trace: '',
        doNotShowAgain: false
      };
    },
    watch: {},
    components: {
      'ZoomDialog': ZoomDialog
    },
    methods: {
      close() {
        this.$refs.dialog.close()
      },
      show(e, trace) {
        if (this.doNotShowAgain) {
            return
        }
        this.$refs.dialog.show()
        this.message = e
        this.stack = e.stack.trim()
        this.trace = trace
      }
    },
    async mounted() {
      this.logger = new Logger("ErrorDialog");
    }
  };
  </script>
    
    
    