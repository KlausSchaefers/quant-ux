<template>
  <div class="MatcCanvasPage" id="CanvasNode" @wheel="onMouseWheel">
    <Toolbar ref="toolbar" :pub="pub" />
    <Canvas ref="canvas" />
  </div>
</template>

<style lang="css">
  @import url("../../style/matc.css");
  @import url("../../style/canvas/all.css");
  @import url('../../style/toolbar/all.css');

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

export default {
  name: "Design",
  mixins: [DojoWidget],
  data: function() {
    return {};
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
        this.buildCanvas(values[0], values[1], hash);
      });
    },
    buildCanvas(model, stack, hash) {
      this.logger.log(3, "buildCanvas", "enter");
      let canvas = this.$refs.canvas;
      let toolbar = this.$refs.toolbar;
      let controller = new Controller();
      let service = this.modelService;

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

  },
  beforeDestroy () {
    if (this.collabSession) {
      this.collabSession.sendBye()
      this.collabSession.close()
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
