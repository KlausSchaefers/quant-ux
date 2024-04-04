<template>
    <div class="MatcLight">
      <h1>InputSlider Test</h1>
      <div class="MatcTReeCntr">
          <InputSlider :value="3" min="0" max="100" @select="onSelect"/>

          <VSlider></VSlider>
      </div>
   
  
  
    </div>
  </template>
  <style lang="scss">
    @import "../style/matc.scss";
    @import "../style/qux.scss";
    @import "../style/toolbar/all.scss";
  </style>
  <style>

  .MatcSlider {
    
  }

    .MatcToolbarPopUp{
        background: #fff;
        box-shadow: 0 0 16px rgba(0, 0, 0, 0.2);

        height: 100px;
        
    }

    .MatcToolbarPopUpArrow {
        background: #fff;
    }
  
    .MatcTReeCntr {
        background: #f2f2f2;
        border:1px solid #cecece;
        display: inline-block;
        padding: 5px;
        width: 250px;
        height: 400px;
        overflow: scroll;
        margin-left: 120px;
        font-size: 14px;
    }
  </style>
  
  <script>
  
  import InputSlider from '../canvas/toolbar/components/InputSlider'
  import VSlider from '../common/VSlider.vue'
  

  export default {
    name: "RukeTest",
    mixins: [],
    data: function() {
      return {
        tree: {
          id: "s1",
          name: 'Screen1'
        },
        selection: []
      };
    },
    components: {
      'InputSlider': InputSlider,
      'VSlider': VSlider
    },
    methods: {
        onSelect (d) {
            this.selection = d
        }
    },
    mounted() {
  
    }
  };
  </script>
  