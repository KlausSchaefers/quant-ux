<template>
  <div class="MatcApps">
    <section class="section">
      <div class="container" id>
        <AppList :pub="false" :canAdd="true" />
      </div>
    </section>
  </div>
</template>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Services from "services/Services";
import AppList from "page/AppList";

export default {
  name: "Apps",
  mixins: [DojoWidget],
  data: function() {
    return {
      apps: [],
      user: null
    };
  },
  watch: {},
  components: {
    AppList: AppList
  },
  methods: {
    load() {}
  },
  async mounted() {
    this.logger = new Logger("Apps");
    this.user = Services.getUserService().getUser();
    this.load();
    this.logger.info("mounted", "exit > ", this.user);
  }
};
</script>

