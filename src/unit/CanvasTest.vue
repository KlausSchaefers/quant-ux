<template>
  <div class="MatcCanvasPage" id="CanvasNode">
      <Toolbar ref="toolbar" />
      <Canvas ref="canvas" />
  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
</style>

<script>
import DojoWidget from "dojo/DojoWidget";
import css from 'dojo/css'
import win from 'dojo/win'
import Toolbar from 'canvas/toolbar/Toolbar'
import Canvas from 'canvas/Canvas'
import Controller from 'canvas/controller/Controller'
import ModelFactory from 'core/ModelFactory'
import RenderFactory from 'core/RenderFactory'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import Services from 'services/Services'
import app from './data/canvasTestApp.json'

export default {
  name: "home",
  mixins: [DojoWidget],
  data: function() {
    return {
    };
  },
  components: {
      'Toolbar': Toolbar,
      'Canvas': Canvas
  },
  methods: {
    setModel (m) {
      console.debug('setModel', m)
      this._setStatus('canvasTestModel', m)
    },
    getModel () {
      let model = this._getStatus('canvasTestModel')
      if (!model || this.$route.query.new === 'true') {
        let type = {
          type: "smartphone",
          screenSize: { w: 360, h: 640 }
        }
        let factory = new ModelFactory();
        model = factory.createAppModel('Test', 'Test Des', type);
        model.isPublic = true;
        model.id = 0;
        model.isTryOut = true;
      }
      return model
    }
  },
  mounted() {
    css.add(win.body(), 'MatcVisualEditor')

    let canvas = this.$refs.canvas
    let toolbar = this.$refs.toolbar
    let controller = new Controller({mode: 'public'})

    /**
     * model factory
     */

    let model = app
    var factory = new ModelFactory();
    var stack = {stack:[], pos:0, lastUUID:0,appID:0};
    let user = {role:'user', id:-1}

    factory.setModel(model);
    /**
     * render factory
     */
    var renderFactory = new RenderFactory();

    renderFactory.setModel(model);

    /**
     * Dependency injection
     */
    controller.setModelService(Services.getPublicModelService())
    controller.setToolbar(toolbar);
    controller.setModelFactory(factory);
    controller.setPublic(true)
    controller.on('change', (model) => {
      this.setModel(model)
    })

    toolbar.setController(controller);
    toolbar.setCanvas(canvas);
    toolbar.setUser(user);
    toolbar.setModelFactory(factory);
    toolbar.setContext(this.context);

    canvas.setController(controller);
    canvas.setUser(user)
    canvas.setToolbar(toolbar);
    canvas.setRenderFactory(renderFactory);
    canvas.setModelFactory(factory);

    // wire shit together
    this.tempOwn(on(toolbar, "newScreen", lang.hitch(canvas, "addScreen"))); // deprecated
    this.tempOwn(on(toolbar, "newWidget", lang.hitch(canvas, "addWidget")));// deprecated

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

    this.tempOwn(on(toolbar, "onNewLogicObject", lang.hitch(canvas, "addLogicGroup")));
    this.tempOwn(on(toolbar, "onNewRestObject", lang.hitch(canvas, "addRestObject")));

    /**
     * last set the model
     */
    controller.setCommandStack(stack);

    /**
     * controller will render screen
     */
    controller.setModel(model, "");

    /**
     * Init layer list
     */
    canvas.initLayer();


    /**
     * add route listener
     */
    if (this.addRouteChangeListener){

      this.addRouteChangeListener(function() {
        controller.onExit();
        toolbar.onExit();
        canvas.onExit();
      });
    }

    console.debug('CanvasTest.mounted() > exit')
  }
};
</script>
