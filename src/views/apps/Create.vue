<template>
  <main>
    <section class="section">
      <div class="container">
        <h2 class="title">Create a new prototype</h2>
        <div class="columns">
          <div class="column is-6">
            <form>
              <div class="field">
                <label>Name</label>
                <input type="text" class="input" v-model="name" placeholder="Enter App name" ref="inputName"/>
                <div data-binding-error="name"></div>
              </div>

              <div class="form-group">
                <label>ScreenSize *</label>
                <ScreenSizeSelector @change="setType" />
              </div>
            </form>
          </div>
        </div>

        <div class="buttons mt-16">
          <a class="button is-primary" @click="create">Create</a>
          <a href="#/apps/my-apps.html" class="button is-text">Cancel</a>
        </div>

        <p class="has-text-grey is-size-6">* The screen size is measured in points and not pixel!</p>
      </div>
    </section>
  </main>
</template>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Services from "services/Services";
import ScreenSizeSelector from "page/ScreenSizeSelector";
import ModelFactory from "core/ModelFactory";

export default {
  name: "Create",
  mixins: [DojoWidget],
  data: function() {
    return {
      name: "",
      type: null
    };
  },
  watch: {},
  components: {
    ScreenSizeSelector: ScreenSizeSelector
  },
  methods: {
    setType(t) {
      this.type = t;
    },
    async create() {
      if (this.$route.meta && this.$route.meta.isTryout) {
        this.logger.info("create", "enter > tryout");
        location.href = `#/apps/tryout2.html?w=${this.type.screenSize.w}&h=${this.type.screenSize.h}&t=${this.type.type}`;
      } else {
        this.logger.info("create", "enter > user");
        let fac = new ModelFactory();
        let model = fac.createAppModel(this.name, "", this.type);
        let app = await Services.getModelService().createApp(model);
        if (app && app.id) {
          location.href = "#/apps/" + app.id + "/create.html";
        } else {
          this.showError("Could not create app");
        }
      }
    }
  },
  async mounted() {
    this.logger = new Logger("Create");
    setTimeout(() => {
      if (this.$refs.inputName) {
        this.$refs.inputName.focus()
      }
    }, 50)
  }
};
</script>


