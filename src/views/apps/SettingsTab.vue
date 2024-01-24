<template>
  <div class="MatcContent MatcSettings">
    <section class="section">
      <div class="container">
        <div class="box is-shadowless">
          <h2 class="title">Prototype Name</h2>
          <div class="form-group">
            <input
              type="text"
              class="form-control"
              v-model="app.name"
              @change="setAppName"
              placeholder="Enter App name"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="box is-shadowless team-settings">
          <h2 class="title">Team</h2>
          <Team v-if="app && user" :appID="app.id" :userID="user.id" />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="box is-shadowless">
          <div class="level">
            <div class="level-left">
              <h2 class="title level-item">Sharing</h2>
            </div>
            <div class="level-right">
              <a class="MatcButton is-outlined level-item" @click="resetShare">Reset</a>
            </div>
          </div>

          <div class="form-group">
            <label>Test</label>
            <input type="text" class="form-control" :value="`${base}/#/test.html?h=${hashes[1]}`" />
          </div>

          <div class="form-group">
            <label>Share and Comment</label>
            <input type="text" class="form-control" :value="`${base}/#/share.html?h=${hashes[1]}`" />
          </div>

          <div class="form-group">
            <label>Code Generation</label>
            <input type="text" class="form-control" :value="`${hashes[1]}`" />
          </div>
          <!--
              <div class="form-group">
                    <span>Embedded</span>
                    <input type="text" class="form-control" :value="iframe" >
              </div>
          -->
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <a @click="showDeleteDialog" class="button is-fullwidth is-normal is-danger level-item" ><span ref="deleteBtn">Delete Prototype</span></a>
      </div>
    </section>
  </div>
</template>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Team from "page/Team";
import Services from "services/Services";
import on from "dojo/on";
import touch from "dojo/touch";
import Dialog from "common/Dialog";
import lang from "dojo/_base/lang";
import DomBuilder from "common/DomBuilder";

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
    Team: Team
  },
  computed: {
    base() {
      return location.protocol + "//" + location.host;
    },
    iframe() {
      if (this.app) {
        var w = this.app.screenSize.w + "px";
        var h = this.app.screenSize.h + "px";
        var code = '<iframe src="' + this.base + "/em.html?h=" + this.hashes[1] + '" width="' +  w + '" height="' +  h + '" allowTransparency="true" frameborder="0"></iframe>';
        return code;
      }
      return "-";
    },
    hashes() {
      var temp = {};
      for (var key in this.invitations) {
        temp[this.invitations[key]] = key;
      }
      return temp;
    }
  },
  methods: {
    async showDeleteDialog() {

      let db = new DomBuilder()
      const div = db.div("box MatcDeleteDialog").build();
      db.h3("title is-4", 'Delete Prototype').build(div);
      db.p('', `Do you want to delete the '${this.app.name}' prototype?`).build(div)
      const bar = db.div("MatcButtonBar").build(div);
      const write = db.a("MatcButton MatcButtonDanger", this.getNLS("btn.delete")).build(bar);
      const cancel = db.a("MatcLinkButton", this.getNLS("btn.cancel")).build(bar);

      const d = new Dialog();
      d.own(on(write, touch.press, lang.hitch(this, "deleteApp", d)));
      d.own(on(cancel, touch.press, lang.hitch(d, "close")));
      d.popup(div, this.$refs.deleteBtn);

    },

    async deleteApp (d) {
      await Services.getModelService().deleteApp(this.app);
      d.close()
      location.href = "#/apps/my-apps.html";
    },
    async resetShare() {
      await Services.getModelService().resetTeam(this.app.id);
      /**
       * Could be nicer by reloading invitaions and passing to parent. This is lazy
       */
      location.reload();
    },
    async setAppName() {
      let res = await Services.getModelService().updateAppProps(this.app.id, {
        id: this.app.id,
        name: this.app.name
      });
      if (res.status === "ok") {
        this.showSuccess("Name was saved...");
      } else {
        this.showError("Oooppps, Could not change the name. Try again!");
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

