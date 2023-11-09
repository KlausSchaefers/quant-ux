<template>
  <div class="MatcCanvasPage" id="CanvasNode" @wheel="onMouseWheel">
    <template v-if="selectedViewMode === 'Design'">
        <DesignToolbar ref="toolbar" :pub="pub"  @viewModeChange="onVieModeChange"/>
        <DesignCanvas ref="canvas" />
    </template>
    <template v-if="selectedViewMode === 'Heatmap'">
        <AnalyticToolbar ref="toolbar" @viewModeChange="onVieModeChange"/>
        <AnalyticCanvas ref="canvas" />
    </template>
 
  </div>
</template>

<style lang="scss">
  @import "../../style/matc.scss";
  @import "../../style/canvas/all.scss";
  @import '../../style/toolbar/all.scss';
</style>
<style lang="sass">
  @import "../../style/bulma.sass"
</style>

<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import win from "dojo/win";
import Toolbar from "canvas/toolbar/Toolbar";
import Canvas from "canvas/Canvas";
import Controller from "canvas/controller/Controller";
import ModelFactory from "core/ModelFactory";
import RenderFactory from "core/RenderFactory";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import Services from "services/Services";
import Logger from "common/Logger";
import CollabSession from '../../canvas/controller/CollabSession'

import AnalyticToolbar from 'canvas/analytic/AnalyticToolbar'
import AnalyticCanvas from 'canvas/analytic/AnalyticCanvas'
import AnalyticController from 'canvas/analytic/AnalyticController'

export default {
  name: "Design",
  mixins: [DojoWidget],
  data: function() {
    return {
      selectedViewMode: ''
    };
  },
  components: {
    'DesignToolbar': Toolbar,
    'DesignCanvas': Canvas,
    'AnalyticToolbar': AnalyticToolbar,
    'AnalyticCanvas': AnalyticCanvas
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
    }
  },
  methods: {
    onVieModeChange (e) {
      this.logger.log(-1, "onVieModeChange", "enter", e);
      this.selectedViewMode = e
      this.load()
    },
    onMouseWheel (e) {
      /**
       * Cancel all left and right swipes to surpress back navigation
       */
      if (e && Math.abs(e.deltaX) > 50 ) {
        this.logger.log(-1, "onMouseWheel", "cancel");
        e.preventDefault();
      }
    },
    load () {
      if (this.selectedViewMode === 'Design') {
        this.loadData()
      } else {
        this.loadAnlyticData()
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
        const invitations = values[2];
        const temp = {};
        for (let key in invitations) {
          temp[invitations[key]] = key;
        }
        const hash = temp[1];
        this.buildCanvas(values[0], values[1], hash);
      });
    },
    buildCanvas(model, stack, hash) {
      this.logger.log(3, "buildCanvas", "enter");
      const canvas = this.$refs.canvas;
      const toolbar = this.$refs.toolbar;
      const controller = new Controller();
      const service = this.modelService;

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
      renderFactory.setHash(hash);

      /**
       * Dependency injection
       */
      controller.setModelService(service);
      controller.setToolbar(toolbar);
      controller.setModelFactory(factory);
      if (this.pub) {
        controller.setPublic(true);
        canvas.setPublic(true);
        toolbar.setPublic(true);
      }

      toolbar.setController(controller);
      toolbar.setCanvas(canvas);
      toolbar.setUser(this.user);
      toolbar.setModelFactory(factory);
      toolbar.setContext(this.context);
      toolbar.setHash(hash);

      canvas.setController(controller);
      canvas.setToolbar(toolbar);
      canvas.setRenderFactory(renderFactory);
      canvas.setModelFactory(factory);
      canvas.setModelService(service);
      canvas.setCommentService(Services.getCommentService());
      canvas.setUser(this.user);

      // wire shit together
      this.tempOwn(on(toolbar, "newScreen", lang.hitch(canvas, "addScreen"))); // deprecated
      this.tempOwn(on(toolbar, "newWidget", lang.hitch(canvas, "addWidget"))); // deprecated

      this.tempOwn(on(toolbar, "newLine", lang.hitch(canvas, "addLine")));
      this.tempOwn(on(toolbar, "newComment", lang.hitch(canvas, "addComment")));

      this.tempOwn(on(toolbar, "newTemplatedWidget", lang.hitch(canvas, "addTemplatedWidget")));
      this.tempOwn(on(toolbar, "newTemplatedScreen", lang.hitch(canvas, "addTemplatedScreen")));
      this.tempOwn(on(toolbar, "newTemplatedGroup", lang.hitch(canvas, "addTemplatedGroup")));

      this.tempOwn(on(toolbar, "newThemedScreen", lang.hitch(canvas, "addThemedScreen")));
      this.tempOwn(on(toolbar, "newThemedGroup", lang.hitch(canvas, "addThemedGroup")));
      this.tempOwn(on(toolbar, "newThemedWidget", lang.hitch(canvas, "addThemedWidget")));
      this.tempOwn(on(toolbar, "newMultiThemedScreen", lang.hitch(canvas, "addMultiThemedScreens")));
      this.tempOwn(on(toolbar, "newThemedScreenAndWidget", lang.hitch(canvas, "addThemedScreenAndWidgets")));
      this.tempOwn(on(toolbar, "newImportApp", lang.hitch(canvas, "addImportedApp")));

      this.tempOwn(on(toolbar, "onNewLogicObject", lang.hitch(canvas, "addLogicGroup")));
      this.tempOwn(on(toolbar, "onNewRestObject", lang.hitch(canvas, "addRestObject")));
      this.tempOwn(on(toolbar, "onNewScriptObject", lang.hitch(canvas, "addScriptObject")));
      this.tempOwn(on(toolbar, "onNewSVG", lang.hitch(canvas, "addSVG")))
      this.tempOwn(on(toolbar, "onEditSVG", lang.hitch(canvas, "openSVGEditor")))
      

      /**
       * last set the model
       */
      controller.setCommandStack(stack);

      /**
       * controller will render screen
       */
      controller.setModel(model, this.$route.params.sid);

      /**
       * Init layer list
       */
      canvas.initLayer();

      if (!this.pub && this.user.role !== 'guest') {
        this.collabSession = new CollabSession(this.user)
        this.collabSession.initWebsocket(model, canvas, controller, toolbar)
        window.onbeforeunload = () => {this.collabSession.sendBye()}
      }
    },

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
  beforeDestroy () {
    if (this.collabSession) {
      this.collabSession.sendBye()
      this.collabSession.close()
    }
  },
  async mounted() {
    this.logger = new Logger("Design");
    if (this.$route.meta.viewMode === 'Heatmap') {
      this.selectedViewMode = 'Heatmap'
    } else {
      this.selectedViewMode = 'Design'
    }
    css.add(win.body(), "MatcVisualEditor");
    this.user = await Services.getUserService().load();
    this.modelService = Services.getModelService(this.$route);
    this.load();
    this.logger.log(-1, "mounted", "exit > " + this.selectedViewMode);
  }
};
</script>
