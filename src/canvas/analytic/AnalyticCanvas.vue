
<template>
  <div class="MatcCanvas MatcAnalyticCanvas">
    <div class="MatcCanvasFrame" data-dojo-attach-point="frame">
      <div class="MatcCanvasContainer MatcCanvasZoomable" data-dojo-attach-point="container">
        <div class="MatcCanvasContainer" data-dojo-attach-point="zoomContainer">
          <div data-dojo-attach-point="screenContainer" class="MatcCanvasLayer"></div>
          <div data-dojo-attach-point="widgetContainer" class="MatcCanvasLayer"></div>
          <div data-dojo-attach-point="svgContainer" class="MatcCanvasLayer MatcCanvasSVGLayer"></div>
        </div>
        <div data-dojo-attach-point="dndContainer" class="MatcDnDLayer"></div>
      </div>
    </div>
    <div class="MatcCanvasScrollBar MatcCanvasScrollBarRight" data-dojo-attach-point="scrollRight">
      <div class="MatcCanvasScrollBarCntr MatcCanvasScrollBarCntrRight" data-dojo-attach-point="scrollRightCntr">
        <div class="MatchCanvasScrollHandle" data-dojo-attach-point="scrollRightHandler"></div>
      </div>
    </div>
    <div class="MatcCanvasScrollBar MatcCanvasScrollBarBottom" data-dojo-attach-point="scrollBottom" :style="'padding-left:' + this.layerListWidth + 'px'">
      <div class="MatcCanvasScrollBarCntr MatcCanvasScrollBarCntrBottom" data-dojo-attach-point="scrollBottomCntr" >
        <div class="MatchCanvasScrollHandle" data-dojo-attach-point="scrollBottomHandler"></div>
      </div>
    </div>
    <div class="MatcMessage" data-dojo-attach-point="message"></div>
  </div>
</template>

<style lang="css">
@import url("../../style/css/legacy.css");
</style>
<style lang="scss">
@import "../../style/matc.scss";
@import "../../style/canvas/all.scss";
@import '../../style/toolbar/all.scss';
</style>

<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";

import Logger from "common/Logger";
import on from "dojo/on";
import touch from "dojo/touch";
import lang from "dojo/_base/lang";

import win from "dojo/_base/win";
import topic from "dojo/topic";

import DomBuilder from "common/DomBuilder";
import DataFrame from "common/DataFrame";
import _DragNDrop from "common/_DragNDrop";

import Heat from "dash/Heat";
import Render from "canvas/Render";
import Lines from "canvas/Lines";
import DnD from "canvas/DnD";
import Add from "canvas/Add";
import Select from "canvas/Select";
import Distribute from "canvas/Distribute";
import GridResize from "canvas/GridResize";
import Tools from "canvas/Tools";
import Zoom from "canvas/Zoom";
import Util from "core/Util";
import InlineEdit from "canvas/InlineEdit";
import Scroll from "canvas/Scroll";
import Upload from "canvas/Upload";
import Comment from "canvas/Comment";
import KeyBoard from "canvas/KeyBoard";
import Resize from "canvas/Resize";
import Replicate from "canvas/Replicate";
import Analytics from "dash/Analytics";
import FastDomUtil from "core/FastDomUtil";
import * as d3 from "d3";
import _Color from 'common/_Color'

import UserJourney from './UserJourney'
import DropOff from './DropOff'
import DataProcessing from './DataProcessing'

export default {
  name: "AnalyticCanvas",
  props:['viewport'],
  mixins: [
    DojoWidget,
    _DragNDrop,
    _Color,
    Util,
    Render,
    Lines,
    DnD,
    Add,
    Select,
    Distribute,
    GridResize,
    Tools,
    Zoom,
    InlineEdit,
    Scroll,
    Upload,
    KeyBoard,
    Resize,
    Replicate,
    Comment,
    Heat,
    UserJourney,
    DropOff,
    DataProcessing
  ],
  data: function () {
    return {
      mode: "view",
      zoom: 1,
      analyticMode: "HeatmapClick",
      resizeEnabled: false,
      renderDND: true,
      dragNDropMinTimeSpan: 0,
      wireInheritedWidgets: true,
      taskLineOpacity: 1,
      isBlackAndWhite: false,
      dropOffLineWidth: 25,
      dropOffLineColor: '#555',
      dropOffEventWidth: 40,
      userJourneyEndColor: '#f03131',
      layerListWidth: 256
    };
  },
  components: {},
  methods: {
    postCreate() {
      this.logger = new Logger("AnalyticCanvas");
      this.logger.log(2, "constructor", "entry");
      this.cache = {};
      this.moveMode = "classic";
      this.domUtil = new FastDomUtil();
      this.analyticLines = {}
      this.analyticCircles = {}

      this.logger.log(2, "postCreate", "entry");
      this.initSize();

      /**
       * init container size and position
       */
      this.canvasPos = {
        x: this.canvasStartX,
        y: this.canvasStartY,
        w: this.canvasFlowWidth,
        h: this.canvasFlowHeight,
      };
      this.initViewport()
      this.initContainerSize();
      this.setContainerPos();

      /**
       * Init remaining sub components
       */
      this.initSelection()
      this.initRender();
      this.initAnalyticSVG()
      this.initZoom();
      this.initScrollBars();
      this.initComment();
      this.initSettings();
      this.initWiring();
      this.initKeys();
      this.initMouseTracker()
      this.initDarkModeListener()
      this.initLayer()

      this.db = new DomBuilder();

      /**
       * Init Listeners
       */
      this.own(
        topic.subscribe(
          "matc/toolbar/click",
          lang.hitch(this, "onToolbarClick")
        )
      );
      this.own(on(win.body(), "keydown", lang.hitch(this, "onKeyPress")));
      this.own(on(win.body(), "keyup", lang.hitch(this, "onKeyUp")));

      this.logger.log(2, "postCreate", "exit!!!");
    },

    initLayer (){
			this.logger.log(-2,"initLayer", "entry");
			const w = localStorage.getItem('quxLayerListWidth')
			if (w && !isNaN(w * 1)) {
				this.setLayerListWidth( w * 1)				
			}
		},


    setLayerListWidth (w) {
      this.layerListWidth = w
    },
 
    showError(msg) {
      if (this.message) {
        css.add(this.message, "MatcMessageError");
        css.remove(this.message, "MatcMessageSuccess MatcMessageHint");
        this.message.textContent = msg;
        setTimeout(lang.hitch(this, "hideMessage"), 3000);
      }
    },

    XlineFunction(line) {
      return this.straightLineFunction(line)
    },

    setPublic(isPublic) {
      this.isPublic = isPublic;
    },

    setModelService(s) {
      this.sourceModelService = s;
    },

    setCommentService(s) {
      this.commentService = s;
    },

    setToolbar(t) {
      this.toolbar = t;
      this.onChangeCanvasViewConfig();
    },

    setMouseListener(callback) {
      this.mouseListenerCallback = callback
    },

    inlineEditInit() {
      this.logger.log(2, "inlineEditInit", "enter");
    },

    setMouseData(data) {
      this.logger.log(0, "setMouseData", "enter > " + data.length);
      // this.mouseData = this.computeMouseDistribution(data, this.sourceModel);
      this.mouseData = data;
      if (data.length == 0) {
        this.showError("No Mouse data was recorded");
      }
    },

    setBW(isBW) {
      this.logger.log(1, "setBW", "enter > " + isBW);
      if (isBW) {
        css.add(this.container, "MatcCanvasBW");
      } else {
        css.remove(this.container, "MatcCanvasBW");
      }
    },

    onChangeCanvasViewConfig() {
      if (this.toolbar) {
        this.toolbar.setCanvasViewConfig({
          zoom: this.zoom,
          renderLines: this.renderLines,
          showComments: this.showComments,
          isBlackAndWhite: this.isBlackAndWhite,
        });
      }
    },

    setCanvasViewConfig(key, value) {
      this.logger.log(-1, "setCanvasViewConfig", "enter > " + key, value);
      if (key === "zoom") {
        this.setZoomFactor(value);
      }

      if (key === "renderLines") {
        this.setViewLines(value);
      }

      if (key === "showComments") {
        this.setCommentView(value);
      }

      if (key === "isBlackAndWhite") {
        this.isBlackAndWhite = value;
        this.setBW(value);
      }
    },

    /**********************************************************************
     * Lines
     **********************************************************************/

    initAnalyticSVG() {
      this.logger.log(3, "initAnalyticSVG", "entry");
      let bodySelection = d3.select(this.svgContainer);
      this.analyticSVG = bodySelection.append("svg").attr("width", this.canvasPos.h).attr("height", this.canvasPos.w);
    },

    cleanUpAnalyticLines() {
      if (this.analyticSVG) {
        this.analyticSVG.selectAll("*").remove();
      }
      this.analyticLines = {}
      this.analyticCircles = {}
    },

    drawLine(id, line) {
      let color = this.defaultLineColor
      let width = this.defaultLineWidth
      if (this.model && this.model.lines && this.model.lines[id]) {
        let modelLine = this.model.lines[id]
        let widgetData = this.getLineWidgetData()
        if (widgetData[modelLine.from]) {
          let data = widgetData[modelLine.from]
          let p = data.clicksRel
          //width = Math.max(0.3, Math.round(1 * p))
          color = this.mixColor(p)
        }
      }
      return this.drawSVGLine(id, line, color, width, 1);
    },

    drawAnalyticLine(id, line, color, width, opacity) {
      const svg = this.analyticSVG.append("path")
        .attr("d", this.lineFunction(line))
        .attr("stroke", color)
        .attr("stroke-width", width)
        .attr("fill", "none")
        .style("opacity", opacity);

      this.analyticLines[id] = svg
    },


    drawStraightAnalyticLine(id, line, color, width, opacity) {
      const svg = this.analyticSVG.append("path")
        .attr("d", this.straightLineFunction(line))
        .attr("stroke", color)
        .attr("stroke-width", width)
        .attr("fill", "none")
        .style("opacity", opacity);

      this.analyticLines[id] = svg
    },



    /**********************************************************************
     * Wiring
     **********************************************************************/

    initWiring() {
      this.logger.log(-1, "initWiring", "enter");
      this.own(on(this.dndContainer, "mousedown", (e) => this.dispatchMouseDown(e)));
    },

    dispatchMouseDownScreen(e, id) {
      this.logger.log(-1, "dispatchMouseDownScreen", "enter", id);
      let dndDiv = this.screenDivs[id];
      let screen = this.model.screens[id];
      this.onScreenDndClick(screen.id, dndDiv, null);
    },

    dispatchMouseDownWidget(e, id) {
      this.logger.log(-1, "dispatchMouseDownWidget", "enter", id);
      let div = this.widgetDivs[id];
      this.onWidgetDndClick(id, div);
    },

    /**********************************************************************
     * Settings
     **********************************************************************/

    afterUpdateDnd(zoomedModel) {
      this.logger.log(1, "afterUpdateDnd", "enter > ", zoomedModel);
    },

    initSettings() {
      this.logger.log(1, "initSettings", "enter > ");
      /**
       * default settings
       */
      this.settings = {
        canvasTheme: "MatcLight",
        lineColor: "#333",
        lineWidth: 1,
        storePropView: true,
        moveMode: "ps",
        mouseWheelMode: "scroll",
      };

      var s = this._getStatus("matcSettings");
      if (s) {
        if (s.canvasTheme) {
          this.settings.canvasTheme = s.canvasTheme;
        }
        if (s.lineColor) {
          this.settings.lineColor = s.lineColor;
        }
        if (s.lineWidth) {
          this.settings.lineWidth = s.lineWidth;
        }
      } else {
        this.logger.log(2, "initSettings", "exit>  no saved settings");
      }

      this.applySettings(this.settings);
    },

    getSettings() {
      return this.settings;
    },

    setSettings(s) {
      /**
       * Mixin values
       */
      if (s.canvasTheme) {
        this.settings.canvasTheme = s.canvasTheme;
      }
      if (s.lineColor) {
        this.settings.lineColor = s.lineColor;
      }
      if (s.lineWidth) {
        this.settings.lineWidth = s.lineWidth;
      }
      if (s.storePropView != null) {
        this.settings.storePropView = s.storePropView;
      }

      if (s.mouseWheelMode != null) {
        this.settings.mouseWheelMode = s.mouseWheelMode;
      }

      this._setStatus("matcSettings", this.settings);

      this.applySettings(this.settings);
      this.rerender();
    },

    applySettings(s) {
      this.logger.log(
        2,
        "applySettings",
        "enter > " + s.canvasTheme + " &> " + s.moveMode
      );

      if (s.lineColor) {
        this.defaultLineColor = s.lineColor;
      }
      if (s.lineWidth) {
        this.defaultLineWidth = s.lineWidth;
      }
      if (s.canvasTheme) {
        this.setCanvasTheme(s.canvasTheme)
      }

      if (s.mouseWheelMode) {
        this._mouseWheelMode = s.mouseWheelMode;
      }

      this.settings = s;
    },


    setCanvasTheme(canvasTheme) {

      if (canvasTheme === "MatcAuto") {
        this.logger.log(-1, "setCanvasTheme", "enter > auto: " + canvasTheme + ' > OS: ' + this.isDarkModeOS())
        if (this.isDarkModeOS()) {
          canvasTheme = 'MatcDark'
        } else {
          canvasTheme = 'MatcLight'
        }
      }

      if (this._lastCanvasTheme) {
        css.remove(win.body(), this._lastCanvasTheme);
      }

      css.add(win.body(), canvasTheme)
      this._lastCanvasTheme = canvasTheme;

      if (canvasTheme == "MatcLight") {
        this.defaultLineColor = "#49C0F0";
      } else {
        this.defaultLineColor = "#49C0F0";
      }
    },

    initDarkModeListener() {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      this.own(on(mediaQuery, 'change', () => {
        this.logger.log(-1, "initDarkModeListener", "change");
        if (this.settings.canvasTheme === 'MatcAuto') {
          this.setCanvasTheme(this.settings.canvasTheme)
        }
      }))
    },


    isDarkModeOS() {
      if (window.matchMedia) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return true
        } else {
          return false
        }
      }
      return true
    },
    /**********************************************************************
     * DnD.js overwrites
     **********************************************************************/

    onWidgetDndClick(id, div, pos, e) {
      this.logger.log(2, "onWidgetDndClick", "enter > " + id);
      this.stopEvent(e);
      this.onWidgetSelected(id);
      this.selectAnalyticDiv(id);
      this.setState(0);
    },

    onScreenDndClick(id, div, pos, e) {
      this.logger.log(2, "onScreenDndClick", "entry > " + id);
      this.stopEvent(e);
      this.setSelectedScreens([id]);
      this.selectAnalyticDiv(id);
      this.setState(0);
    },

    onCanvasSelected() {
      this.logger.log(2, "onCanvasSelected", "entry > ");
      this.selectAnalyticDiv(null);
      if (this.toolbar) {
        this.toolbar.unselect();
        this.toolbar.onCanvasSelected()
      }
    },

    selectAnalyticDiv(id) {
      if (this._analyticLastSelectedDiv) {
        css.remove(this._analyticLastSelectedDiv, "MatcHeapMapWidgetSelected");
        delete this._analyticLastSelectedDiv;
      }
      if (this.analyticsDivs && this.analyticsDivs[id]) {
        let div = this.analyticsDivs[id];
        css.add(div, "MatcHeapMapWidgetSelected");
        this._analyticLastSelectedDiv = div;
      }

      if (this.widgetDivs && this.widgetDivs[id]) {
        let div = this.widgetDivs[id];
        css.add(div, "MatcHeapMapWidgetSelected");
        this._analyticLastSelectedDiv = div;
      }
    },

    /**********************************************************************
     * Rendering
     **********************************************************************/

    renderLayerList() {
      this.logger.log(1, "renderLayerList", "entry > ");
    },

    afterRender() {
      this.logger.log(1, "afterRender", "entry > " + this.analyticMode);
      this.cleanUpAnalytics();

      try {
        this._renderHeatMap();
      } catch (e) {
        this.logger.error("afterRender", "Could not render heatmaps ", e);
        this.logger.sendError(e);
      }
    },

    hasSelect() {
      return this.mode != "addComment";
    },

    _renderHeatMap() {
      this.logPageView("/analytics/workspace/" + this.analyticMode + ".html");

      this.setBW(this.isBlackAndWhite);

      /**
       * Init everything so the _Heat.js code works correctly
       */
      this.cleanUpHeat();

      /**
       * FIXME: Make this customisable
       */
      if (
        this.sourceModel.type == "smartphone" ||
        this.sourceModel.type == "tablet"
      ) {
        this.defaultRadius = this.sourceModel.screenSize.w / 20;
        this.defaultBlur = this.sourceModel.screenSize.w / 15;
      } else {
        this.defaultRadius = this.sourceModel.screenSize.w / 120;
        this.defaultBlur = this.sourceModel.screenSize.w / 100;
      }

      this.logger.log(0, "onScreenRendered", "adjust radios to " + this.defaultRadius);

      const screenGrouping = this.df.groupBy("screen");

      this.heatmapDivs = {};
      for (var id in this.sourceModel.screens) {
        const screen = this.sourceModel.screens[id];

        const screenDF = screenGrouping.get(id);
        let screenEvents = [];
        if (screenDF) {
          screenEvents = screenDF.as_array();
        }

        if (this["_render_" + this.analyticMode]) {
          /**
           * create canvas
           */
          const div = this.createBox(screen);
          css.add(div, "MatcHeatMapScreen");
          const cntr = this.db.div("MatcHeapMapContainer").build(div);

          const canvas = this.db.canvas(screen.w, screen.h).build(cntr);
          const ctx = canvas.getContext("2d");

          this["_render_" + this.analyticMode](screenEvents, screen, ctx, div);

          if (this.hasSelect()) {
            this.tempOwn(on(div, touch.press, lang.hitch(this, "onScreenDndClick", screen.id, div, null)));
          }

          this.widgetContainer.appendChild(div);

          this.heatmapDivs[screen.id] = div;
          this.analyticsDivs[screen.id] = div;
        }
      }

      /**
       * now draw a div for every widgert so we can also select them.
       * A little hack but I dunno have a better way...
       */
      if ("UserJourney" != this.analyticMode && "Gesture" != this.analyticMode && 'DropOff' != this.analyticMode) {
        this.hideWidgetDND = true;
      } else {
        this.hideWidgetDND = false;
      }

      if (this["_render_global_" + this.analyticMode]) {
        this["_render_global_" + this.analyticMode]();
      }
    },

    _render_HeatmapMouse(screenEvents, screen, ctx) {
      this.logger.log(0, "_render_HeatmapMouse", "entry > " + screen.name);
      /**
       * FIXME: we could make this fastter by caching some stuff,
       * or at least soft the events by screen
       */
      let mouseData = this.mouseData.filter((m) => m.screen === screen.id);
      mouseData = this._filterSelectedSessions(mouseData)
      let data = this.computeMouseDistribution(mouseData, this.sourceModel);
      if (data[screen.id]) {
        let d = data[screen.id];
        this.draw(ctx, d.values, d.max, screen.w, screen.h);
      }
    },

    _render_HeatmapClick(screenEvents, screen, ctx, div) {
      this.logger.log(2, "_render_HeatmapClick", "entry > ");

      const events = this._filterSelectedSessions(this.events)

      const df = new DataFrame(events)
      var numberOfClicks = -1;
      if (this.analyticParams) {
        numberOfClicks = this.analyticParams.numberOfClicks;
      }

      if (numberOfClicks === "screenClicks") {

        let screenClicks = this.getScreenClicksOnBackground(df);
        screenClicks = screenClicks.as_array();
        this._render_pixel_screen_heatmap(screenClicks, screen, ctx, div);

      } else if (numberOfClicks === "missedClicks") {

        let missedClicks = this.getMissedClicks(df);
        this._render_pixel_screen_heatmap(missedClicks, screen, ctx, div);

      } else if (numberOfClicks > 0) {

        let firstNEvents = this.getFirstNClicksData(events, numberOfClicks);
        this._render_pixel_screen_heatmap(firstNEvents, screen, ctx, div);

      } else {

        let filtered = this.getClickEvents(new DataFrame(events));
        let actionEvents = filtered.as_array();
        this._render_pixel_screen_heatmap(actionEvents, screen, ctx, div);

      }
    },

    _filterSelectedSessions(events) {
      if (this.analyticParams && this.analyticParams.sessions) {
        const sessions = this.analyticParams.sessions
        return events.filter(e => {
          return sessions[e.session] === true
        })
      }
      return events
    },

    _render_pixel_screen_heatmap(actionEvents, screen, ctx) {
      if (screen.w <= 0 || screen.h <= 0) {
        this.logger.error("_render_pixel_screen_heatmap", "Error > bad screen dimension: " + screen.name);
        return
      }
      try {
        const events = [];
        for (let i = 0; i < actionEvents.length; i++) {
          const e = actionEvents[i];
          const screenID = this.getEventScreenId(e);
          if (screenID == screen.id) {
            events.push(e);
          }
        }
        const dist = this.computeClickDistribution(events, screen.w, screen.h);
        this.draw(ctx, dist.values, dist.max, screen.w, screen.h);
      } catch (err) {
        this.logger.error("_render_pixel_screen_heatmap", "Error > " + screen.name);
      }

    },

    _render_HeatmapScrollView(screenEvents, screen, ctx) {
      this.logger.log(2, "_render_HeatmapScrollView", "entry > ");

      var dist = this.computeScrollVisibiltyDistribution(
        screenEvents,
        this.sourceModel.screenSize.h,
        screen.h
      );
      this.drawSections(dist, ctx, screen.h, screen.w);
    },

    _render_HeatmapScrollTime(screenEvents, screen, ctx) {
      this.logger.log(2, "_render_HeatmapScrollTime", "entry > ");

      var dist = this.computeScrollDurationDistrubtion(
        screenEvents,
        this.sourceModel.screenSize.h,
        screen.h
      );
      this.drawSections(dist, ctx, screen.h, screen.w);
    },

    _render_HeatmapViews(screenEvents, screen, ctx) {
      this.logger.log(2, "HeatmapViews", "entry > ");

      if (screen.style.overlay) {
        let screenViews = this.getOverlayViews();
        let count = screenViews.counts[screen.id];
        if (!count) {
          count = 0;
        }

        ctx.globalAlpha = 0.4;
        let color = this.mixColor(count / screenViews.total);
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, screen.w, screen.h);
      } else {
        let screenViews = this.getScreenViews();
        let count = screenViews.counts[screen.id];
        if (!count) {
          count = 0;
        }

        ctx.globalAlpha = 0.4;
        let color = this.mixColor(count / screenViews.total);
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, screen.w, screen.h);
      }
    },

    _render_HeatmapDwelTime(screenEvents, screen, ctx) {
      this.logger.log(2, "HeatmapDwelTime", "entry > ");

      if (screen.style.overlay) {
        let times = this.getOverlayDwellTime();
        let time = times.times[screen.id];
        if (!time) {
          time = 0;
        }
        ctx.globalAlpha = 0.4;
        let color = this.mixColor(time / times.total);
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, screen.w, screen.h);
      } else {
        let times = this.getScreenDwellTime();
        let time = times.times[screen.id];
        if (!time) {
          time = 0;
        }
        ctx.globalAlpha = 0.4;
        let color = this.mixColor(time / times.total);
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, screen.w, screen.h);
      }
    },



    drawDurationLine(session, line, defaultColor, maxDuration) {
      for (let i = 0; i < line.length - 1; i++) {
        let start = line[i]
        let end = line[i + 1]
        let p = end.duration / maxDuration
        let width = Math.round(p * 6) + 2
        let color = defaultColor
        if (!defaultColor) {
          //color = this.mixColor(Math.min(1, p))
        }
        this.drawStraightAnalyticLine(session, [start, end], color, width, this.taskLineOpacity);
      }
    },



    /**********************************************************************
     * Gesture
     **********************************************************************/

    _render_global_Gesture() {
      this.logger.log(0, "_render_global_Gesture", "entry > ");

      var gestures = this.getGestures();
      var db = new DomBuilder();

      for (var i = 0; i < gestures.length; i++) {
        var e = gestures[i];
        var gesture = e.gesture;

        var screenID = this.getEventScreenId(e);
        var screen = this.sourceModel.screens[screenID];
        if (screen && gesture) {
          var line = [];

          var start = e.gesture.start;
          var end = e.gesture.end;
          if (start && end) {
            var x = start.x * screen.w + screen.x;
            var y = start.y * screen.h + screen.y;
            line.push({ x: x, y: y, d: "right" });

            this._renderGestureStart(x, y, this.analyticParams.color, db);

            x = end.x * screen.w + screen.x;
            y = end.y * screen.h + screen.y;
            line.push({ x: x, y: y, d: "right" });

            var r = Math.max(1, Math.round(3 * this.zoom));
            this.drawSVGLine("", line, this.analyticParams.color, r, 1);
          }
        } else {
          console.warn(
            "_render_global_Gesture()",
            "Screen is not there",
            e.screen
          );
        }
      }
    },

    _renderGestureStart(x, y, color, db) {
      var cntr = db
        .div("MatcAnalyticCanvasEventCntr")
        .build(this.widgetContainer);
      cntr.style.left = Math.round(x) + "px";
      cntr.style.top = Math.round(y) + "px";

      var div = db
        .div("MatcAnalyticCanvasEvent MatcAnalyticCanvasEvent")
        .build(cntr);
      var r = Math.max(5, Math.round(15 * this.zoom));
      div.style.width = r + "px";
      div.style.height = r + "px";
      div.style.top = -1 * Math.round(r / 2) + "px";
      div.style.left = -1 * Math.round(r / 2) + "px";
      div.style.backgroundColor = color;
      return div;
    },


    cleanUpAnalytics() {
      this.cleanUpAnalyticLines()

      this.cleanUpNode(this.widgetContainer)
      this.analyticsDivs = {};
    },



    /**********************************************************************
     * DI
     **********************************************************************/

    setController(c) {
      this.logger.log(2, "setController", "enter");
      this.controller = c;
      c.setCanvas(this);
    },

    getController() {
      if (this._controllerCallback) {
        this[this._controllerCallback]();
      }
      return this.controller;
    },

    setControllerCallback(c) {
      this._controllerCallback = c;
    },

    setModelFactory(f) {
      this.logger.log(3, "setModelFactory", "enter");
      this.factory = f;
    },

    setRenderFactory(f) {
      this.logger.log(3, "setRenderFactory", "enter");
      this.renderFactory = f;
    },

    setModel(model) {
      this.sourceModel = model;
      this.model = model
      this.grid = this.sourceModel.grid;
      this.setCommentView(this.showComments);
    },

    setEvents(events) {
      this.logger.log(1, "setEvents", "enter > # " + events.length);
      var analytics = new Analytics();
      this.events = analytics.nornalizeContainerChildEvents(events);
      this.df = new DataFrame(events);
      this.df.sortBy("time");
      this.fixGestures(events);
    },

    setAnnotation(a) {
      this.logger.log(2, "setAnnotation", "enter > # ");
      this.annotation = a;
    },

    setTest(t) {
      this.logger.log(2, "setTest", "enter > # ");
      this.testSettings = t;
    },

    setAnalyticMode(mode, params) {
      this.logger.log(2, "setAnalyticMode", "entry > mode: " + mode);
      this.analyticMode = mode;
      this.analyticParams = params;
      this.rerender();

      if (this.analyticCSS) {
        css.remove(this.domNode, this.analyticCSS);
      }

      this.analyticCSS = mode;
      css.add(this.domNode, this.analyticCSS);
    },

    setUser(u) {
      this.user = u;
    },

    setMode(mode, forceRender) {
      this.logger.log(2, "setMode", "enter > " + mode + " != " + this.mode + " > " + forceRender);
      if (mode != this.mode) {
        this.mode = mode;
        if (this.toolbar) {
          this.toolbar.setMode(mode);
        }
        this.rerender();
      } else if (forceRender) {
        this.rerender();
      }
    },

    setSubMode () {

    },

    /***************************************************************************
     * Keyboard handling
     ***************************************************************************/

    onKeyPress(e) {
      this._currentKeyEvent = e;

      if (this.state == "simulate" || this.state == "dialog") {
        return;
      }

      var target = e.target;
      if (css.contains(target, "MatcIgnoreOnKeyPress")) {
        return;
      }

      /**
       * The keycode is differently in every browser!
       */
      var k = e.keyCode ? e.keyCode : e.which;

      if (k == 32) {
        // space

        if (!this._inlineEditStarted) {
          this.stopEvent(e);
          if (this.getMode() != "move") {
            this.setMode("move");
            this.showHint("Move the mouse to move canvas...");
            this.onDragStart(this.container, "container", "onCanvasDnDStart", "onCanvasDnDMove", "onCanvasDnDEnd", null, this._lastMouseMoveEvent, true);
          }
        }

        /**
         * Arrow dispatch...
         */
      } else if (k == 37) {
        this.onArrowLeft();
      } else if (k == 39) {
        this.onArrowRight();
      } else if (k == 40) {
        this.onArrowDown();
      } else if (k == 38) {
        this.onArrowUp();
      } else if (k == 171 || k == 187) {
        // +

        if (!this._inlineEditStarted) {
          this.onClickPlus();
          this.stopEvent(e);
        }
      } else if (k == 173 || k == 189) {
        //-

        if (!this._inlineEditStarted) {
          this.onClickMinus();
          this.stopEvent(e);
        }
      }
    },

    getMode() {
      return this.mode;
    },

    onKeyUp(e) {
      var k = e.keyCode ? e.keyCode : e.which;
      if (k == 32) {
        this.onDragEnd(this._lastMouseMoveEvent);
        this.setMode("view");
      }

      delete this._currentKeyEvent;
    },

    /***************************************************************************
     * Helper Functons
     ***************************************************************************/

    initMouseTracker() {
      this.own(on(win.body(), "mousemove", lang.hitch(this, "onMouseMove")));
    },

    onMouseMove(e) {
      var pos2 = this.getCanvasMousePosition(e, true);
      //this._debugMouseLabel.innerHTML = "[" + Math.round(pos2.x) +" , "+ Math.round(pos2.y) + "]";
      this._lastMousePos = pos2;
      this._lastMouseMoveEvent = e;
    },

    destroy() {
      this.cleanUp();
    },

    logPageView(url) {
      this.logger.log(4, "logPageView", "enter", url);
    },
  },
  mounted() { },
};
</script>