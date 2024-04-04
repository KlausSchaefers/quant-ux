
<template>
  <div class="MatcSimulator MatcPreview"></div>
</template>
<style lang="scss">
  @import "../style/simulator.scss";
  @import "../style/widgets/all.scss";
  @import "../style/canvas/all.scss";
  @import "../style/components/preview.scss";
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import topic from "dojo/topic";
import domGeom from "dojo/domGeom";
import Logger from "common/Logger";
import Layout from "core/Layout";
import RenderFactory from 'core/RenderFactory'
import Animation from 'core/Animation'

export default {
  name: "Preview",
  mixins: [Layout, DojoWidget],
  props: ['app', 'screen', 'isPublic'],
  data: function() {
    return {
      isFillBackground: false,
      debug: false,
      mode: "standalone",
      loadingMessage: "No Start Screen!",
      scale: "width",
      running: true,
      isPlayer: false,
      currentScroll: 0
    };
  },
  components: {},
  methods: {
    postCreate: function() {
      this.logger = new Logger("Preview");
      this.logger.log(2, "postCreate", "enter >" + this.mode);
      this.renderFactory = new RenderFactory();
      this.renderFactory.setMode("view");
      this.animationFactory = new Animation();
      this.overlays = {};
      this.own(topic.subscribe("MatcSimulatorRenderFixedPopup",lang.hitch(this, "addFixedPopup")));
    },

    setDebug: function(d) {
      this.debug = d;
    },

    setJwtToken (t) {
      this.jwtToken = t
      this.renderFactory.setJwtToken(t)
    },

    setPublic (p) {
      this.isPublic = p
      this.renderFactory.setPublic(p)
    },

    setInvitation: function(h) {
      this.logger.log(2, "setInvitation", "Set hash to render factory");
      this.hash = h;
      if (this.renderFactory) {
        this.renderFactory.hash = h;
      }
    },

    setModel: function(model, screenID, widgetID) {
      this.logger.log(2,"setModel", "enter > m:" + model.id + " > s:" + screenID + " > w:" + widgetID);

      this.model = model;

      this.selectedWidgetID = widgetID;

      if (this.model.fonts) {
				this.attachFontsToDom(this.model.fonts)
      }
      this.initScale();

      this.model = this.createZoomedModel(this._scaleX, this._scaleY, true);

      /**
       * ATTENTION: Here a passed wrongly the unzoomed model.
       * Now the zoomed model is passed. I hope it does not
       * cause any issues!
       *
       */
      this.renderFactory.setModel(this.model);
      this.renderFactory.setScaleFactor(this._scaleX, this._scaleY);

      if (screenID) {
        this.render(this.model.screens[screenID]);
      } else {
        this.render();
      }
    },

    setScreen: function(screenID, scrollTop) {
      /**
       * if there was an animation, make sure we render new again!
       */
      if (this._currentAnimation) {
        this.render(this.model.screens[screenID]);
        delete this._currentAnimation;
      }

      /**
       * render only if needed
       */
      if (this._currentScreenID != screenID) {
        this.render(this.model.screens[screenID], scrollTop);

        /**
         * Check if we have to set the scroll!
         */
        if (scrollTop != undefined && scrollTop != null) {
          this.setScroll(scrollTop);
        }
      }
      this._currentScreenID = screenID;
    },

    setOverlays: function(screenIDs) {
      /**
       * render new ones
       */
      for (var i = 0; i < screenIDs.length; i++) {
        var screenID = screenIDs[i];

        if (!this.overlays[screenID]) {
          if (this.model.screens[screenID]) {
            var screen = this.model.screens[screenID];
            this.renderOverlay(screen);
          } else {
            console.warn("setOverlays() > No Screen ", screenID);
          }
        }
      }

      /**
       * remove overlays that were removed...
       */
      for (let screenID in this.overlays) {
        if (screenIDs.indexOf(screenID) < 0) {
          var div = this.overlays[screenID];
          if (div) {
            this.removeOverlay(screenID, div);
          }
        }
      }
    },

    setScroll: function(p) {
      if (this._currenScreen) {
        var scrollTop = Math.round(this._currenScreen.h * p) * -1;

        this._screenDiv.style.top = scrollTop + "px";
        this.currentScroll = scrollTop;
      } else {
        console.warn("setScroll() > Called without screen!");
      }
    },

    setMouse: function(event) {
      if (this._currentScreenID) {
        if (!this._mousePointer) {
          var cntr = document.createElement("div");
          css.add(cntr, "MatcPreviewMouseCntr");

          var pointer = document.createElement("div");
          css.add(pointer, "MatcPreviewMouse");
          cntr.appendChild(pointer);

          this.domNode.appendChild(cntr);
          this._mousePointer = cntr;
        }
        var x = event.x;
        var y = event.y;

        var screen = this.model.screens[this._currentScreenID];

        // var box = {
        //  x: x * screen.w,
        //  y: y * screen.h
        // };

        //console.debug("setMouse",event.dur);

        if (event.dur) {
          //					var dur = event.dur + "s";
          //					if(dur.length <3){
          //						dur = "0"+dur;
          //					}
          // FIXME: Use ms?
          this._mousePointer.style.transition = "all 0.030s";
        }
        this._renderMousePosition(
          Math.round(y * screen.h),
          Math.round(x * screen.w)
        );
      }
    },

    _renderMousePosition: function(y, x) {
      this._mousePointer.style.top = y + this.currentScroll + "px";
      this._mousePointer.style.left = x + "px";
    },

    setScreenPos: function(p) {
      this.screenPos = p;
    },

    /***************************************************************************
     * Rendering stuff
     ***************************************************************************/

    initScale: function() {
      if (!this.screenPos) {
        this.screenPos = domGeom.position(this.domNode);
      }

      if (this.scale == "width") {
        this._scaleX = (this.screenPos.w * 1.0) / this.model.screenSize.w;
        this._scaleY = this._scaleX;
      } else {
        console.warn("initScale() > DEPRECTAED : ", this.scale);
      }

      this.logger.log(5, "initScale", "enter > " + this.scale + " > " + this._scaleX + " > " + this._scaleY);
    },

    render: function(screen) {
      this.logger.log(2, "render", "enter >" + this._scaleX + " > " + this._scaleY);

      if (!screen) {
        screen = this.getStartScreen();
      }
	    css.remove(this.domNode, "MatcSimulatorLoadingMessageVisible")
      if (screen) {
        this.renderScreen(screen, 0);
      } else {
        css.add(this.domNode, "MatcSimulatorLoadingMessageVisible")
        this.domNode.innerHTML = '<span class="MatcPreviewStatusMsg">' + this.loadingMessage + "</span>";
      }
    },

    renderOverlay: function(screen) {
      this.logger.log(0, "renderOverlay", "enter > " + screen.id);

      /**
       * render screen and widgets
       */
      var div = this.renderScreenWithWidgets(screen, true);

      this.addOverlay(screen, div);

      return div;
    },

    renderScreen: function(screen, scrollTop) {
      this.logger.log(
        2,
        "renderScreen",
        "enter > " + screen.id + " > " + scrollTop
      );

      //var oldScreen = this._currentScreenDiv;

      this.cleanUp();

      /**
       * render screen and widgets
       */
      var div = this.renderScreenWithWidgets(screen);

      /**
       * render widget selection if there is
       */
      this.renderWidgetSelection(screen, div);

      /**
       * Callback for child classes
       */
      this.onScreenRendered(screen, div);

      /**
       * set to dom
       */
      this.addScreen(screen, div, scrollTop);

      /**
       * Add fixed widgets after, so they stay on top for sure
       */
      this.addFixedWidgets();

      if (this.isFillBackground) {
        this.fillBackground(screen)
      }


      return div;
    },

    fillBackground (screen) {
      if (this.$el && this.$el.parentNode) {
        let parent = this.$el.parentNode
        if (screen.style && screen.style.background) {
          parent.style.background = screen.style.background
        }
      }
    },

    addScreen: function(screen, div, scrollTop) {
      this._screenDiv = div;
      this.currentScroll = 0;
      this._currenScreen = screen;
      this._currentScreenID = screen.id;
      this._currentScreenDiv = div;

      if (scrollTop != undefined && scrollTop != null) {
        this.setScroll(scrollTop);
      }
      this.domNode.appendChild(div);
    },

    addFixedWidgets: function() {
      if (this._fixedWidgets) {
        for (var i = 0; i < this._fixedWidgets.length; i++) {
          var w = this._fixedWidgets[i];
          this.domNode.appendChild(w);
        }
      }
    },

    removeFixedWidgets: function() {
      if (this._fixedWidgets) {
        for (var i = 0; i < this._fixedWidgets.length; i++) {
          var w = this._fixedWidgets[i];
          if (w.parentNode) {
            try {
              w.parentNode.removeChild(w);
            } catch (e) {
              console.error("Preview.removeFixedWidgets", e);
              console.debug(e.stack);
            }
          }
        }
      }
    },

    /**
     * Sometimes we want to render fixed stuff
     */
    addFixedPopup: function(node) {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
      this.domNode.appendChild(node);
      if (!this._fixedPopups) {
        this._fixedPopups = []
      }
      this._fixedPopups.push(node);
    },

    removeFixedPopups: function() {
      if (this._fixedPopups) {
        for (var i = 0; i < this._fixedPopups.length; i++) {
          var w = this._fixedPopups[i];
          if (w.parentNode) {
            w.parentNode.removeChild(w);
          }
        }
      }
    },

    addOverlay: function(overlay, div) {
      if (this._screenDiv) {
        if (overlay.style.fixed) {
          this.domNode.appendChild(div);
        } else {
          this._screenDiv.appendChild(div);
        }

        if (overlay.style.blur && this._currentScreenDiv) {
          var children = this._currentScreenDiv.childNodes;
          var radius = Math.max(2, 20 * this._scaleX);
          for (var i = 0; i < children.length; i++) {
            var node = children[i];
            if (node != div) {
              node.style.filter = "blur(" + radius + "px)";
              node.style.webkitFilter = "blur(" + radius + "px)";
            }
          }
        }

        this.overlays[overlay.id] = div;
      } else {
        console.warn("addOverlay() > NO _screenDiv");
      }
      //console.debug("addOverLay() > exit" , this.overlays);
    },

    removeOverlay: function(screenID, div) {
      if (div && div.parentNode) {
        div.parentNode.removeChild(div);
      }
      delete this.overlays[screenID];

      if (this._currentScreenDiv) {
        var children = this._currentScreenDiv.childNodes;
        for (var i = 0; i < children.length; i++) {
          var node = children[i];
          if (node != div) {
            node.style.filter = "none";
          }
        }
      }

      //console.debug("removeOverlay() > exit" , this.overlays);
    },

    removeAllOverlays: function() {
      for (var id in this.overlays) {
        var div = this.overlays[id];
        if (div && div.parentNode) {
          div.parentNode.removeChild(div);
        }
      }

      this.overlays = {};
    },

    renderScreenWithWidgets: function(screen, isOverlay) {
      var div = this.createScreen(screen, isOverlay);
      css.add(div, "MatcPreviewScreenAnimation");

      this._fixedWidgets = [];
      this._fixedPopups = [];

      /**
       * render child widgets
       */
      var widgets = this.sortChildren(screen.children);
      for (var i = 0; i < widgets.length; i++) {
        var widget = widgets[i];
        var w = this.renderWidget(screen, widget);
        /**
         * we do not add to the screen but to the dome node
         * This is again different to the simulator!
         *
         * FIXME: if the widget is fixed (style.fixed) we should also we should
         * add them later to not use z-level in the css.
         */
        if (widget.style.fixed) {
          this._fixedWidgets.push(w);
        } else {
          div.appendChild(w);
        }

        this._widgets[widget.id] = true;
      }

      return div;
    },

    renderWidgetSelection: function(screen, div) {
      /**
       * set background transparent and scroll widget
       * into view
       */
      if (this.selectedWidgetID) {
        var widget = this.model.widgets[this.selectedWidgetID];
        var y = widget.y - screen.y + widget.h;
        if (y > this.screenPos.h) {
          let dif = y - this.screenPos.h + 5;
          dif = Math.min(screen.h - this.screenPos.h, dif);
          div.style.top = -1 * dif + "px";
        }

        var x = widget.x - screen.x + widget.w;
        if (x > this.screenPos.w) {
          let dif = x - this.screenPos.w + widget.w + 5;
          dif = Math.min(screen.w - this.screenPos.w, dif);
          div.style.left = -1 * dif + "px";
        }
      }
    },

    /**
     * Template methods for child widgets
     */
    onScreenRendered: function() {},

    createScreen: function(screen, isOverlay) {
      var div = this.createBox(screen);
      css.add(div, "MatcScreen");
      this.domNode.style.height = screen.h + "px";
      this.domNode.style.width = screen.w + "px";

      if (screen.style) {
        this.renderFactory.setStyle(div, screen);
      }

      if (isOverlay) {
        /**
         * Since 2.4 we can have overlays with background
         */
        if (!screen.style.hasBackground) {
          div.style.backgroundColor = "transparent";
        }
      }
      return div;
    },

    setWidgetState: function(widgetID, state, forceMarker, t) {
      var widget = this.renderFactory.getUIWidgetByID(widgetID);
      if (widget) {
        widget.setState(state, t);
      }
    },

    /***************************************************************************
     * Widget Animation stuff
     ***************************************************************************/

    setWidgetAnimationStates: function(states) {
      //console.debug("setWidgetAnimationStates", states)

      for (var id in states) {
        if (this._widgets[id]) {
          var style = states[id].style;
          var pos = states[id].pos;
          var laststate = this._lastWidgetAnimationState[id];

          if (!laststate || pos) {
            let uiwidget = this.renderFactory.getAnimationWrapper(id);
            if (uiwidget) {
              uiwidget.setAnimatedPos(pos, style);
            } else {
              console.debug(
                "setWidgetAnimationStates() > No ui widget for ",
                id
              );
            }
          }

          if (!laststate || laststate.style._aid != style._aid) {
            let uiwidget = this.renderFactory.getAnimationWrapper(id);
            if (uiwidget) {
              uiwidget.setAnimatedStyle(style);
            } else {
              console.debug(
                "setWidgetAnimationStates() > No ui widget for ",
                id
              );
            }
          }
          this._lastWidgetAnimationState[id] = states[id];
        }
      }
    },

    /***************************************************************************
     * Animation stuff
     ***************************************************************************/

    resetAnimations: function() {
      delete this._currentMarkerID;
      delete this._currentOverlayAnimation;
    },

    /***************************************************************************
     * Marker
     ***************************************************************************/

    setMarker: function(event, forceMarker) {
      if (this._currentMarkerID != event.id || forceMarker) {
        var x = event.x;
        var y = event.y;
        if (this._currentScreenID) {
          var screen = this.model.screens[this._currentScreenID];

          var marker = document.createElement("div");
          css.add(marker, "MatcPreviewMarker");
          //this._screenDiv.appendChild(marker);
          this.domNode.appendChild(marker);

          var circle = document.createElement("div");
          css.add(circle, "MatcPreviewMarkerCircle");
          marker.appendChild(circle);

          var box = {
            x: x * screen.w,
            y: y * screen.h
          };

          marker.style.top = Math.round(box.y) + this.currentScroll + "px";
          marker.style.left = Math.round(box.x) + "px";

          if (this._mousePointer) {
            this._mousePointer.style.transition = "none";
            this._renderMousePosition(Math.round(box.y), Math.round(box.x));
          }

          setTimeout(lang.hitch(this, "hideMarker", marker), 10);
        } else {
          console.warn("Cannot set marker, no screen");
        }
        this._currentMarkerID = event.id;
      }
    },

    hideMarker: function(marker) {
      css.add(marker, "MatcPreviewMarkerHidden");
      setTimeout(lang.hitch(this, "cleanupMarker", marker), 500);
    },

    cleanupMarker: function(marker) {
      if (marker.parentNode) {
        marker.parentNode.removeChild(marker);
      }
    },

    /***************************************************************************
     * Overlay Animation
     ***************************************************************************/

    animateOverlay: function(event, time, min) {
      //console.debug("animateOverlay", event.animation, this._currentOverlayAnimation);
      if (event.animation) {
        var to = event.animation.to;
        var overlay = this.model.screens[to];
        if (overlay) {
          this.createOverlayAnimation(event, overlay, min);

          if (this._currentOverlayAnimation) {
            this._currentOverlayAnimation.time(time);
          } else {
            /**
             * Might happen when fast backwarding as we delete the animation??
             */
            //console.warn("animateOverlay() > No Animation")
          }
        } else {
          console.warn("animateOverlay() > No screen", event);
        }
      }
    },

    createOverlayAnimation: function(event, overlay, min) {
      var type = event.animation.type;
      var animID = event.id + type;
      if (
        !this._currentOverlayAnimation ||
        this._currentOverlayAnimation.id != animID
      ) {
        // var oldScreenDiv = this._screenDiv;
        var newScreenDiv = this.overlays[overlay.id];
        if (newScreenDiv) {
          if (this.animationFactory["createScreen_" + type]) {
			let animation = null
            if (event.type == "OverlayShowAnimation") {
              animation = this.animationFactory["createScreen_" + type](
                overlay,
                null,
                newScreenDiv,
                true
              );
            } else {
              animation = this.animationFactory["createScreen_" + type](
                overlay,
                newScreenDiv,
                null,
                true
              );
            }
            if (event.animation.duration) {
              animation.duration = event.animation.duration;
            }

            if (event.animation.easing) {
              animation.setEasing(event.animation.easing);
            }

            animation.setStart(event.time - min);
            animation.id = animID;

            this._currentOverlayAnimation = animation;
          } else {
            console.warn(
              "animateScreen() > No animation function for : createScreen_" +
                type
            );
          }
        } else {
          /**
           * This is ok. might happen while using the slider
           */
          //console.warn("animateScreen() > No div");
        }
      }
      return this._currentOverlayAnimation;
    },

    /***************************************************************************
     * Screen Animation
     ***************************************************************************/

    animateScreen: function(event, time, min) {
      if (event.animation) {
        var to = event.animation.to;
        var screen = this.model.screens[to];
        if (screen) {
          var oldScreenDiv = this._screenDiv;

          if (this._currentScreenID != screen.id || !this._currentAnimation) {
            this.removeAllOverlays();

            /**
             * On skip back, it might happen, that the original screen was not there. In the case
             * we have to render it
             */
            if (this._currentScreenID != event.screen) {
              this.render(this.model.screens[event.screen]);
            }

            /**
             * clean up a little
             */
            this.renderFactory.cleanUp();
            this.cleanUpTempListener();

            /**
             * render screen and widgtes
             */
            var newScreenDiv = this.renderScreenWithWidgets(screen);

            /**
             * set to dom
             */
            this.addScreen(screen, newScreenDiv);

            /**
             * check if we have to create a new animation
             */
            this.createAnimation(
              event,
              screen,
              oldScreenDiv,
              newScreenDiv,
              min
            );
          }

          if (this._currentAnimation) {
            this._currentAnimation.time(time);
          } else {
            console.warn("animateScreen() > No Animation");
          }
        } else {
          console.warn("animateScreen() > No screen", event.screen);
        }
      } else {
        console.warn("animateScreen() > No to", event);
      }
    },

    createAnimation: function(
      event,
      screen,
      oldScreenDiv,
      newScreenDiv,
      min,
      overlay
    ) {
      if (!this._currentAnimation || this._currentAnimation.id != event.id) {
        //	console.debug("createAnimation() > create new");
        var type = event.animation.type;
        if (this.animationFactory["createScreen_" + type]) {
          var animation = this.animationFactory["createScreen_" + type](
            screen,
            oldScreenDiv,
            newScreenDiv,
            overlay
          );

          if (event.animation.duration) {
            animation.duration = event.animation.duration;
          }

          if (event.animation.easing) {
            animation.setEasing(event.animation.easing);
          }

          animation.setStart(event.time - min);
          animation.id = event.id;
          this._currentAnimation = animation;
        } else {
          console.warn(
            "animateScreen() > No animation function for : createScreen_" + type
          );
        }
      }
      return this._currentAnimation;
    },

    animateScreenEnd: function() {
      //console.debug("animateScreenEnd");
      delete this._currentAnimation;
    },

    cleanUp: function() {
      this.renderFactory.cleanUp();
      this.cleanUpTempListener();

      /**
       * Just remove the screen to make sure the mouse and the markers stay in place
       */
      if (this._screenDiv && this._screenDiv.parentNode) {
        this._screenDiv.parentNode.removeChild(this._screenDiv);
      } else {
        //console.warn("cleanUp() > no parent for screen??");
      }
      this.removeFixedWidgets();
      this.removeFixedPopups();
      this._widgets = {};
      this._lastWidgetAnimationState = {};
    }
  },
  mounted() {
    if (this.app) {
      this.postCreate()
      this.setModel(this.app, this.screen)
    }
  }
};
</script>