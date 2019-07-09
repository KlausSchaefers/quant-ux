<template>
  <div class="MatcApps">
    
    <div class="MatcContent">
      <div class="MatcSection">
        <div class="container" id="">
            <AppList :pub="true" :canAdd="false"/>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// import Services from 'services/Services'
// import hash from "dojo/hash";
// import lang from "dojo/_base/lang";
// import on from "dojo/on";
// import Form from 'common/Form'
// import Dialog from "common/Dialog";
// import DomBuilder from "common/DomBuilder";
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Services from "services/Services";
import AppList from 'page/AppList'
// import CheckBox from "common/CheckBox.vue";
// import UserImage from "page/UserImage.vue";

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
    this.logger = new Logger("Examples");
    this.user = Services.getUserService().getUser()
    this.load()
    this.logger.info('mounted', 'exit > ', this.user)
  }
};
</script>

