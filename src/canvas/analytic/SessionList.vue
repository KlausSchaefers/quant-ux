
<template>
    <div class="MatcSessionList">
        {{events}}
    </div>
  </template>
  

  <style lang="scss">
    @import "../../style/components/session_list.scss";
  </style>
  
  <script>
  import DojoWidget from "dojo/DojoWidget";  
  import Logger from "common/Logger";

  
  export default {
    name: "SessionList",
    props:['events'],
    mixins: [DojoWidget],
    data: function () {
      return {
      };
    },
    components: {},
    methods: {
      postCreate() {

      }
    },
    mounted() {
        this.logger = new Logger("AnalyticCanvas");
        this.logger.log(2, "constructor", "entry");
    },
  };
  </script>