<template>
  <div class="MatcCanvasPage" id="CanvasNode">
      <AnalyticToolbar ref="toolbar" />
      <AnalyticCanvas ref="canvas" />
  </div>
</template>

<style lang="css">
  @import url("../../style/matc.css");
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
    loadData () {
      let id = this.$route.params.id
      this.logger.log(0, 'loadData', 'enter', id)
      Promise.all([
        this.modelService.findApp(id),
        this.modelService.findTest(id),
        this.modelService.findEvents(id),
        this.modelService.findSessionAnnotations(id),
        this.modelService.findInvitation(id)
      ]).then(values => {
        let invitations = values[4];
        var temp = {};
        for (var key in invitations) {
          temp[invitations[key]] = key;
        }
        let hash = temp[1];
        this.buildCanvas(values[0], values[1], values[2], values[3], hash)
      })
    },
    buildCanvas (model, test, events, annotation, hash) {
      this.logger.log(-1, 'buildCanvas', 'enter', hash)

      let canvas = this.$refs.canvas
      let toolbar = this.$refs.toolbar

      let controller = new AnalyticController()
      let service = Services.getModelService()

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
    this.logger = new Logger("Analyze");
    css.add(win.body(), 'MatcVisualEditor')
    this.user = await Services.getUserService().load()
    this.modelService = Services.getModelService(this.$route)
    this.loadData()
    this.logger.log(3, 'mounted', 'exit')
  }
};
</script>
