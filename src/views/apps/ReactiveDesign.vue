<template>
  <div class="MatcCanvasPage" id="CanvasNode" @wheel="onMouseWheel">
    <Toolbar ref="toolbar" :pub="pub" v-if="hasToolbar"/>
    <Canvas ref="canvas" :value="model" @change="onModelChange"/>
  </div>
</template>

<style lang="css">
  @import url("../../style/matc.css");
</style>
<style lang="sass">
  @import "../../style/bulma.sass";
</style>

<script>
import css from "dojo/css";
import win from "dojo/win";
import Toolbar from "../../canvas2/toolbar/ReactiveToolbar";
import Canvas from "../../canvas2/ReactiveCanvas";
import Controller from "canvas/controller/Controller";
import ModelFactory from "core/ModelFactory";
import RenderFactory from "core/RenderFactory";
import Services from "services/Services";
import Logger from "common/Logger";

export default {
  name: "ReactiveDesign",
  mixins: [],
  data: function() {
    return {
      hasToolbar: false,
      model: null,
      hash: null,
      stack: []
    };
  },
  components: {
    Toolbar: Toolbar,
    Canvas: Canvas
  },
  computed: {
    pub() {
      return this.$route.meta && this.$route.meta.isPublic;
    },
    mode() {
      if (this.pub) {
        return "public";
      }
      return "private";
    },
    controller () {
      return new Controller();
    },
    modelFactory () {
      return new ModelFactory();
    },
    renderFactory () {
      var renderFactory = new RenderFactory();
      renderFactory.setModel(this.model);
      renderFactory.setHash(this.hash);
      return renderFactory
    }

  },
  methods: {
    onMouseWheel (e) {
      /**
       * Cancel all left and right swipes to surpress back navigation
       */
      if (e && Math.abs(e.deltaX) > 50 ) {
        this.logger.log(-1, "onMouseWheel", "cancel");
        e.preventDefault();
      }
    },
    loadData() {
      let id = this.$route.params.id;
      this.logger.log(3, "loadData", "enter", id);
      Promise.all([
        this.modelService.findApp(id),
        this.modelService.getCommands(id),
        this.modelService.findInvitation(id)
      ]).then(values => {
        let invitations = values[2];
        var temp = {};
        for (var key in invitations) {
          temp[invitations[key]] = key;
        }
        let hash = temp[1];
        this.onDataLoaded(values[0], values[1], hash);
      });
    },
    onDataLoaded(model, stack, hash) {
      this.logger.log(3, "onDataLoaded", "enter");
      this.model = model
      this.stack = stack
      this.hash = hash
    },
    onModelChange () {

    }
  },
  async mounted() {
    this.logger = new Logger("Design");
    css.add(win.body(), "MatcVisualEditor");
    this.user = await Services.getUserService().load();
    this.modelService = Services.getModelService(this.$route);
    this.loadData();
    this.logger.log(3, "mounted", "exit");
  }
};
</script>
