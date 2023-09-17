<template>
    <div class="MatcLight">
      <h1>Responsive Test</h1>
      <div class="max" ref="cntr" @mouseup="onResize">
      
      </div>
  
  
    </div>
  </template>
  <style lang="scss">
  @import "../style/matc.scss";
</style>
  <style>
    .max {
        width: 375px;
        height: 600px;
        border: 1px solid red;
        overflow: hidden;
        resize: both;
    }
  </style>
  
  <script>
  import DojoWidget from 'dojo/DojoWidget'
  import app from '../../tests/unit/data/responsiveAppMax.json'
  import Simulator from 'core/Simulator'
  import DomBuilder from 'common/DomBuilder'
  import domGeom from 'dojo/domGeom'
  import ResponsiveLayout from 'core/responsive/ResponsiveLayout'
  
  export default {
    name: "ResizeTest",
    mixins: [DojoWidget],
    data: function() {
      return {
        app: app,
        checkBoxChecked: true,
        options: [{ label: "a", value: "a" }, { label: "b", value: "b" }],
        user: "not loaded"
      };
    },
    components: {
 
    },
    methods: {
        onResize () {
            const pos = domGeom.position(this.$refs.cntr)
            console.debug(pos)
            const app = this.responsive.resize(pos.w, pos.h)

            this.sim.destroy()
            this.$refs.cntr.innerHTML = ''
            this.createSim(app)
        },

        createSim (app) {
            const pos = domGeom.position(this.$refs.cntr)
             const wrapper = this.db.div("MatchSimulatorWrapper").build(this.$refs.cntr);
            wrapper.style.width = Math.round(pos.w) + "px";
            wrapper.style.height = Math.round(pos.h) + "px";
            this.wrapper = wrapper

            const sim = this.$new(Simulator, {mode : "debug", logData : false, runTimerLinesOnScreenLoad : false, isDesktopTest:true, isWiringEvents:true});
            sim.mode = "debug"
            sim.logData = false
            sim.setStartScreen(Object.values(app.screens)[0])
            sim.placeAt(wrapper)
            sim.setModel(app)
            this.sim = sim

        }
    },
    mounted() {
        //delete this.app.screens['s10000_15630']
        delete this.app.screens['s10026_36526']
        delete this.app.screens['s10065_99805']
        delete this.app.screens['s10078_42217']
        delete this.app.screens['s10101_82448']


        this.db = new DomBuilder()
        this.createSim(this.app)
        this.responsive = new ResponsiveLayout()
        this.responsive.initApp(this.app)
    }
  };
  </script>
  