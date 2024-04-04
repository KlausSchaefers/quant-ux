<template>
  <div class="MatcCanvasPage" id="CanvasNode">
      <AnalyticToolbar ref="toolbar" />
      <AnalyticCanvas ref="canvas" />
  </div>
</template>

<style lang="scss">
  @import "../../style/matc.scss";
</style>
<style lang="sass">
  @import "../../style/bulma.sass"
</style>

<script>
import DojoWidget from "dojo/DojoWidget";
import css from 'dojo/css'
import win from 'dojo/win'

import ModelFactory from 'core/ModelFactory'
import RenderFactory from 'core/RenderFactory'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import Services from 'services/Services'

import AnalyticToolbar from 'canvas/analytic/AnalyticToolbar'
import AnalyticCanvas from 'canvas/analytic/AnalyticCanvas'
import AnalyticController from 'canvas/analytic/AnalyticController'

import Logger from "common/Logger";

export default {
  name: "Design",
  mixins: [DojoWidget],
  data: function() {
    return {
    };
  },
  components: {
      'AnalyticToolbar': AnalyticToolbar,
      'AnalyticCanvas': AnalyticCanvas
  },
  computed: {
    isPublic () {
      return this.$route.meta && this.$route.meta.isPublic
    }
  },
  methods: {
    loadAnlyticData () {
      let id = this.$route.params.id
      this.logger.log(0, 'loadAnlyticData', 'enter', id)
      Promise.all([
        this.modelService.findApp(id),
        this.modelService.findTest(id),
        this.modelService.findEvents(id),
        this.modelService.findSessionAnnotations(id),
        this.modelService.findInvitation(id)
      ]).then(values => {
        const invitations = values[4];
        const temp = {};
        for (const key in invitations) {
          temp[invitations[key]] = key;
        }
        const hash = temp[1];
        this.buildAnalyticCanvas(values[0], values[1], values[2], values[3], hash)
      })
    },
    buildAnalyticCanvas (model, test, events, annotation, hash) {
      this.logger.log(-1, 'buildAnalyticCanvas', 'enter', hash)

      const canvas = this.$refs.canvas
      const toolbar = this.$refs.toolbar

      const controller = new AnalyticController()
      const service = Services.getModelService()

      /**
       * model factory
       */
       const factory = new ModelFactory();
      factory.setModel(model);

      /**
       * render factory
       */
       const renderFactory = new RenderFactory();
      renderFactory.setModel(model);
      renderFactory.setHash(hash)

      /**
       * Dependency injection
       */
      controller.setModelService(service)
      controller.setToolbar(toolbar);
      controller.setModelFactory(factory);


      toolbar.setController(controller);
      toolbar.setCanvas(canvas);
      toolbar.setUser(this.user);
      toolbar.setModelFactory(factory);
      toolbar.setModelService(service)
      toolbar.setEvents(events);
      toolbar.setAnnotation(annotation);
      toolbar.setTest(test);
      toolbar.setPublic(this.isPublic)

      canvas.setController(controller);
      canvas.setToolbar(toolbar);
      canvas.setRenderFactory(renderFactory);
      canvas.setModelFactory(factory);
      canvas.setCommentService(Services.getCommentService())
      canvas.setUser(this.user)
      canvas.setEvents(events);
      canvas.setAnnotation(annotation);
      canvas.setTest(test);

      // wire shit together
      this.tempOwn(on(toolbar, "newComment", lang.hitch(canvas, "addComment")));

      let startScreen = null;
      for(let screenID in model.screens){
        const screen = model.screens[screenID];
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
    this.logger = new Logger("Analyze");
    css.add(win.body(), 'MatcVisualEditor')
    this.user = await Services.getUserService().load()
    this.modelService = Services.getModelService(this.$route)
    this.loadAnlyticData()
    this.logger.log(3, 'mounted', 'exit')
  }
};
</script>
