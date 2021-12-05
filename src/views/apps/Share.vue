<template>
  <div class="MatcCanvasPage MatcShare" id="CanvasNode">
      <ShareCanvas ref="canvas" />
  </div>
</template>

<style lang="css">
  @import url("../../style/matc.css");
  @import url("../../style/test.css");
</style>
<style lang="sass">
  @import "../../style/bulma.sass"
</style>

<script>
import DojoWidget from "dojo/DojoWidget";
import css from 'dojo/css'
import win from 'dojo/win'
import ShareCanvas from 'canvas/share/ShareCanvas'
import ShareController from 'canvas/share/ShareController'
import ModelFactory from 'core/ModelFactory'
import RenderFactory from 'core/RenderFactory'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import Services from 'services/Services'
import Logger from "common/Logger";

export default {
  name: "Design",
  mixins: [DojoWidget],
  data: function() {
    return {
    };
  },
  components: {
      'ShareCanvas': ShareCanvas
  },
  computed: {
    pub () {
      return this.$route.meta && this.$route.meta.isPublic
    },
    mode () {
			if (this.pub) {
				return 'public'
			}
			return 'private'
		}
  },
  methods: {
    loadData () {
      let id = this.$route.query.h
      this.logger.log(0, 'loadData', 'enter', id)
      Promise.all([
          this.modelService.findAppByHash(id),
      ]).then(values => {
         this.buildCanvas(values[0])
      })
    },
    buildCanvas (model) {
      this.logger.log(0, 'buildCanvas', 'enter')
      let canvas = this.$refs.canvas
      let controller = new ShareController()
      let service = this.modelService

      /**
       * model factory
       */
      var factory = new ModelFactory();
      factory.setModel(model);

      /**
       * render factory
       */
      var renderFactory = new RenderFactory();
      renderFactory.setModel(model);
      renderFactory.setHash(this.$route.query.h)

      /**
       * Dependency injection
       */
      controller.setModelService(service)
      controller.setModelFactory(factory);
      if (this.pub) {
        controller.setPublic(true)
      }

      canvas.setController(controller);
      canvas.setRenderFactory(renderFactory);
      canvas.setModelFactory(factory);
      canvas.setModelService(service);
      canvas.setCommentService(Services.getCommentService())
      canvas.setUser(this.user)
      canvas.setHash(this.$route.query.h);

      // wire shit together
      this.tempOwn(on(toolbar, "newComment", lang.hitch(canvas, "addComment")));

      var startScreen = null;
      for(var screenID in model.screens){
        var screen = model.screens[screenID];
        if (screen.props && screen.props.start){
            startScreen = screenID;
            break;
        }
      }
      /**
       * controller will render screen
       */
      controller.setModel(model, startScreen);

    }
  },
  async mounted() {
    this.logger = new Logger("Design");
    css.add(win.body(), 'MatcVisualEditor')
    this.modelService = Services.getModelService(this.$route)
    this.user = await Services.getUserService().load()
    this.loadData()
    this.logger.log(3, 'mounted', 'exit')
  }
};
</script>
