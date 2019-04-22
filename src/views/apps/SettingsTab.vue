<template>
  <div class="MatcContent">
    <div class="MatcSection">
      <div class="container">
        <div class="row MatcHeaderTopRow MatcMarginBottom">
          <div class="col-md-8" id="appSettingCntr"></div>
          <div class="col-md-4 MatcRight">
            <a @click="deleteApp">
              <span class="MatcButton MatcButtonRed">Delete Project</span>
            </a>
          </div>
        </div>

        <div class="row">

            <div class="form-group">
              <label>Name</label>
              <input
                type="text"
                class="form-control input-lg"
                v-model="app.name"
                @change="setAppName"
                placeholder="Enter App name">
            </div>
 
        </div>
      </div>
    </div>

    <div class="MatcSection MatcSettings">
      <div class="container">
        <h2>Team</h2>
        <Team v-if="app && user" :appID="app.id" :userID="user.id"/>
      </div>
    </div>

    <div class="MatcSection MatcSettings">

        <div class="container">

          <div class="row">
              <div class="col-md-8"><h2>Sharing</h2>
              </div>
              <div class="col-md-4 MatcRight">
                  <a class="MatcButton" @click="resetShare"> Reset</a>
              </div>
          </div>
 

        <div class="row MatcMarginTop">
          <div class="col-md-12">

              <div class="form-group">
                    <span>Test</span>
                    <input type="text" class="form-control" :value="`${base}/#/test.html?h=${hashes[1]}`" >
              </div>

              <div class="form-group">
                    <span>Share and Comment</span>
                    <input type="text" class="form-control" :value="`${base}/#/share.html?h=${hashes[1]}`" >
              </div>
              <!--
              <div class="form-group">
                    <span>Embedded</span>
                    <input type="text" class="form-control" :value="iframe" >
              </div>
              -->
           </div>
        </div>
   
      </div>
    </div>

    <div class="MatcSection">
      <div class="container">
        <h2>Comments</h2>
        <Comment
          v-if="app"
          :appID="app.id"
          type="app_settings"
          :reference="sessionID"
          contentID
          insertPosition="top"
        />
      </div>
    </div>
  </div>
</template>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Team from "page/Team";
import Services from "services/Services";
import Comment from "page/Comment";

export default {
  name: "Test",
  mixins: [DojoWidget],
  props: ["app", "test", "annotation", "events", "pub", "user", "invitations"],
  data: function() {
    return {
      sessionID: "",
      eventsWithAnnimations: [],
      mouseEvents: []
    };
  },
  components: {
    Comment: Comment,
    Team: Team
  },
  computed: {
    base () {
        return location.protocol + "//" + location.host;
    },
    iframe () {
      if (this.app) {
        var w = this.app.screenSize.w + "px";
        var h = this.app.screenSize.h + "px";
        var code = '<iframe src="' + 
                      this.base + "/em.html?h=" + 
                      this.hashes[1] +'" width="' + 
                      w + '" height="' + 
                      h + '" allowTransparency="true" frameborder="0"></iframe>'
        return code
      }  
			return '-'
    },
    hashes () {
      var temp = {};
      for(var key in this.invitations){
        temp[this.invitations[key]] = key;
      }
      return temp
    }
  },
  methods: {
    async deleteApp() {
      if (confirm(`Do you want to delete the ${this.app.name} prorotype?`)) {
        await Services.getModelService().deleteApp(this.app)
        location.href = '#/my-apps.html'
      }
    },
    async resetShare () {
      await Services.getModelService().resetTeam(this.app.id)
      /**
       * Could be nicer by reloading invitaions and passing to parent. This is lazy
       */
      location.reload()
    },
    async setAppName () {
      let res = await Services.getModelService().updateAppProps(this.app.id, {id: this.app.id, name: this.app.name})
      if (res.status === 'ok') {
        this.showSuccess('Name was saved...')
      } else {
        this.showError('Oooppps, Could not change the name. Try again!')
      }
    }
  },
  watch: {
    $route() {
      this.load();
    }
  },
  async mounted() {
    this.logger = new Logger("SettingsTab");
    this.logger.info("mounted", "exit");
  }
};
</script>

