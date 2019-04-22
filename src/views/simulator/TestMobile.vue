<template>
  <div class="MatcApps">
      Loading...
  </div>
</template>
<script>
import Logger from "common/Logger";
import Services from "services/Services";

export default {
  name: "Overview",
  mixins: [],
  data: function() {
    return {
    };
  },
  async mounted() {
    this.logger = new Logger("TestMobile");
    let appID = this.$route.params.id
    let service = Services.getModelService(this.$route)
    let invitations = await service.findInvitation(appID)
    let temp = {}
    for(var key in invitations){
        temp[invitations[key]] = key;
    }
    let hash = temp[1]
    this.logger.info("mounted", "exit > " + hash);
    location.href = `#/simulate.html?qr=true&h=${hash}` 
  }
};
</script>

