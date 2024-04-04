<template>
  <div class="Matc">
    <Simulator mode="standalone" hasPreload="true"/>
  </div>
</template>
<style lang="scss">
  @import "../../style/sim.scss";
</style>
<script>
import Logger from 'common/Logger'
import Simulator from 'core/Simulator'

export default {
  name: "SimulatorPage",
  mixins: [],
  data: function() {
    return {
      user: {
        id: -1,
        name: "Guest",
        email: "guest@quant-ux.com",
        role: "guest",
        lastlogin: 0,
        lastNotification: 0,
        tos: false,
        paidUntil: 0,
        plan: "Free"
      }
    }
  },
  components: {
    'Simulator': Simulator
  },
  methods: {
  },
  async mounted() {
    this.logger = new Logger('SimulatorPage')
    this.logger.info('mounted', 'exit >> ')
  }
};
</script>
