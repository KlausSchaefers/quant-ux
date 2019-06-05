<template>
  <div class="MatcApps">
    <div class="MatcHeader MactMainGradient MatcHeaderTab bs-docs-header">
      <div class="container-fluid">
        <div class="row MatcHeaderTopRow">
          <div class="col-md-12">
              <br>
                Create a new project or edit an exiting one
          </div>
        </div>

        <div class="row MatcHeaderBottomRow">
          <div class="col-md-12 MatcRight" id></div>
        </div>
      </div>
    </div>

    <div class="MatcContent">
      <div class="MatcSection">
        <div class="container" id="">
            <AppList :pub="false" :canAdd="true"/>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Services from "services/Services";
import AppList from 'page/AppList'

export default {
  name: "Apps",
  mixins: [DojoWidget],
  data: function() {
    return {
      apps: [],
      user: null
    }
  },
  watch: {},
  components: {
      'AppList': AppList
  },
  methods: {
      load () {

      }
  },
  async mounted() {
    this.logger = new Logger("Apps");
    this.user = Services.getUserService().getUser()
    this.load()
    this.logger.info('mounted', 'exit > ', this.user)
  }
};
</script>

