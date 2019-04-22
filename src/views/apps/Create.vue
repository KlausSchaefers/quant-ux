<template>
  <div>
    <div class="MatcHeader bs-docs-header">
      <div class="container-fluid">
        <div class="row MatcHeaderTopRow">
          <div class="col-md-12">
            <h2>New Prototype</h2>Enter the name for your new project and select the screen type
          </div>
        </div>
        <div class="row MatcHeaderBottomRow">
          <div class="col-md-12"></div>
        </div>
      </div>
    </div>

    <div class="MatcContent">
      <div class="MatcSection">
        <div class="container">
          <div class="row">
            <div class="col-md-6">
              <form>
                <div class="form-group">
                  <label>Name</label>
                  <input type="text"  class="form-control input-lg" v-model="name" placeholder="Enter App name" >
                  <div data-binding-error="name"></div>
                </div>

                <div class="form-group">
                  <label>ScreenSize *</label>
                  <ScreenSizeSelector @change="setType"/>
                </div>
              </form>

              <div class="MatcButtonBar">
                <a class="MatcButton" @click="create">Create</a>
                <a href="#/my-apps.html" class>Cancel</a>
              </div>

              <div
                class="MatcHint MatcFontSmall MatcMarginTopXXL">
                  * The screen size is measured in points and not pixel!
                </div>
            </div>

            <div class="col-md-4 col-md-offset-1 MatcPadding"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Services from "services/Services";
import ScreenSizeSelector from "page/ScreenSizeSelector";
import ModelFactory from 'core/ModelFactory'

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
        if (this.$route.meta && this.$route.meta.isTryout){
          this.logger.info("create", "enter > tryout");
          console.debug(this.type)
          location.href = `#/tryout2.html?w=${this.type.screenSize.w}&h=${this.type.screenSize.h}&t=${this.type.type}`
        } else {
          this.logger.info("create", "enter > user");
          let fac = new ModelFactory()
          let model = fac.createAppModel(this.name, '', this.type)
          let app = await Services.getModelService().createApp(model);
          if (app && app.id) {
              location.href = "#/apps/" + app.id + "/create.html"
          } else {
              this.showError('Could not create app')
          }
        }
    }
  },
  async mounted() {
    this.logger = new Logger("Create");
  }
};
</script>


