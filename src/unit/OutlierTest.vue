<template>
     <div class="MatcLight">
      <h1>Outlier Test</h1>
      <div class="MatcPadding">
        <ScatterSection></ScatterSection>
      </div>
 
    </div>
   
  </template>
<style lang="scss">
@import "../style/matc.scss";
</style>
  
  <script>
  
  import layerapp from './data/outlier1.json'
  import ScatterSection from '../views/apps/analytics/DistributionSection.vue'
  
  export default {
    name: "OutlierTest",
    mixins: [],
    data: function() {
      return {
        app: layerapp,
        groups: {}
      };
    },
    components: {
        ScatterSection
    },
    methods: {
  
    },
    mounted() {
  
  
    }
  };
  </script>
  