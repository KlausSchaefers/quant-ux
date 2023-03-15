
<template>
  <div class="MatcWidgetTypeImageCarousel">
    <div class="MatcWidgetTypeImageCarouselCntr" data-dojo-attach-point="cntr"></div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import win from "dojo/_base/win";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";
import Animation from "core/Animation";
import Logger from 'common/Logger'

export default {
  name: "ImageCarousel",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      value: null,
      repeats: 3,
      animationDuration: 300,
    };
  },
  components: {},
  methods: {
    postCreate() {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [];
      this._shadowNodes = [this.domNode];
    },

    wireEvents() {
      this.wired = true;
      this.tempOwn(
        this.addTouchStart(this.domNode, lang.hitch(this, "onDndStart"))
      );
      this.wireHover()
    },

    onDndStart(e) {
      this.stopEvent(e);

      this.cleanUp();

      this.dndStartPos = this.getMouse(e);

      this.moveListener = this.addTouchMove(
        win.body(),
        lang.hitch(this, "onDnDMove")
      );
      this.releaseListener = this.addTouchRelease(
        win.body(),
        lang.hitch(this, "onDndEnd")
      );

      this.initCompositeState(-1);

      return false;
    },

    onDnDMove(e) {
      this.stopEvent(e);
      var pos = this.getMouse(e);
      this.emitMouseMove(e, true);
      var delta = {
        x: Math.round(pos.x - this.dndStartPos.x),
        y: Math.round(pos.y - this.dndStartPos.y),
      };

      var p;
      if (this._vertical) {
        p = delta.y / this.model.h;
      } else {
        p = delta.x / this.model.w;
      }

      this.setCntrPos(-1 + p);
      this.addCompositeSubState(-1 + p);
    },

    onDndEnd(e) {
      this.stopEvent(e);

      var pos = this.getMouse(e);
      this.emitMouseMove(e);
      var delta = {
        x: Math.round(pos.x - this.dndStartPos.x),
        y: Math.round(pos.y - this.dndStartPos.y),
      };

      var p;
      if (this._vertical) {
        p = delta.y / this.model.h;
      } else {
        p = delta.x / this.model.w;
      }

      this.cleanUp();

      if (Math.abs(p) < 0.2) {
        /**
         * Slide back
         */

        let anim = new Animation().createAnimation();
        anim.duration = Math.round(this.animationDuration / 3);
        anim.onEnd(lang.hitch(this, "onSlideCenterDone", e));
        if (p > 0) {
          anim.onRender(lang.hitch(this, "renderSlideLeftCenter", p));
        } else {
          anim.onRender(lang.hitch(this, "renderSlideRightCenter", p));
        }
        anim.run();
      } else {
        let anim = new Animation().createAnimation();
        anim.duration = this.animationDuration;

        if (p > 0) {
          let pos = this.value - 1;
          anim.onRender(lang.hitch(this, "renderSlideLeft", p));
          anim.onEnd(lang.hitch(this, "onSlideDone", pos, e, null, -2));
        } else {
          let pos = this.value + 1;
          anim.onRender(lang.hitch(this, "renderSlideRight", -1 * p));
          anim.onEnd(lang.hitch(this, "onSlideDone", pos, e, null, 0));
        }
        anim.run();
      }
    },

    _setDataBindingValue(v) {
      const value = (v * 1) -1;
      if (!isNaN(value) && this.model && this.model.props && this.model.props.images) {
        this.setValue(value);
      } else {
        console.debug("_setDataBindingValue() > not int value" + v);
      }
    },

    cleanUp() {
      if (this.moveListener) {
        this.moveListener.remove();
      }
      if (this.releaseListener) {
        this.releaseListener.remove();
      }
      delete this.moveListener;
      delete this.releaseListener;
      delete this.dndStartPos;
      delete this.dndStartTime;
    },

    onScreenRendered() {
      let leftButton = this.getRef("backButton");
      if (leftButton) {
        leftButton = leftButton[0];
        let btn = this.factory.getUIWidgetByID(leftButton);
        if (!btn) {
          btn = this.factory.getWidgetNodeByID(leftButton);
          if (btn) {
            this.tempOwn(
              on(btn, touch.press, lang.hitch(this, "onBack", leftButton))
            );
            this.tempOwn(on(btn, touch.release, lang.hitch(this, "stopEvent")));
          } else {
            console.error(
              "onScreenRendered() > No widget with id as leftButton",
              leftButton
            );
          }
        }
      }
      let rightButton = this.getRef("nextButton");
      if (rightButton) {
        rightButton = rightButton[0];
        let btn = this.factory.getUIWidgetByID(rightButton);
        if (!btn) {
          btn = this.factory.getWidgetNodeByID(rightButton);
          if (btn) {
            this.tempOwn(
              on(btn, touch.press, lang.hitch(this, "onNext", rightButton))
            );
            this.tempOwn(on(btn, touch.release, lang.hitch(this, "stopEvent")));
          } else {
            console.error(
              "onScreenRendered() > No widget with id as rightButton",
              rightButton
            );
          }
        }
      }
    },

    render(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this._vertical = this.model.props.vertical;

      const db = new DomBuilder();
      this.elements = [];

      if (this.mode == "edit") {
        const element = db.div("MatcWidgetTypeImageCarouselBox").build(this.cntr);
        this.elements.push(element);
      } else {
        for (var i = 0; i < 3; i++) {
          const element = db
            .div("MatcWidgetTypeImageCarouselBox")
            .build(this.cntr);
          this.elements.push(element);
        }
      }
      this.setStyle(style);
      this.resize(this.model);
      this.setValue(0);
    },

    resize(box) {
      if (this.mode != "edit") {
        if (this._vertical) {
          this.cntr.style.height = box.h * 3 + "px";
          for (let i = 0; i < 3; i++) {
            const element = this.elements[i];
            element.style.height = box.h + "px";
            element.style.top = i * box.h + "px";
          }
        } else {
          this.cntr.style.width = box.w * 3 + "px";
          for (let i = 0; i < 3; i++) {
            const element = this.elements[i];
            element.style.width = box.w + "px";
            element.style.left = i * box.w + "px";
          }
        }

        this.setCntrPos(-1);
      }
    },

    setCntrPos(p) {
      //console.debug("setCntrPos", p, p*this.model.w);
      let trans;
      if (this._vertical) {
        trans = "translateY(" + p * this.model.h + "px)";
      } else {
        trans = "translateX(" + p * this.model.w + "px)";
      }

      this.cntr.style.transform = trans;
      this.cntr.style.webkitTransform = trans;
      this.scrollPos = p;
    },

    onBack(widgetID, e) {
      const pos = this.value - 1;
      const anim = new Animation().createAnimation();
      anim.duration = this.animationDuration;
      anim.onRender(lang.hitch(this, "renderSlideLeft", 0));
      anim.onEnd(lang.hitch(this, "onSlideDone", pos, e, widgetID, -2));
      anim.run();
      this.initCompositeState(-1);
      return false;
    },

    onNext(widgetID, e) {
      const pos = this.value + 1;
      const anim = new Animation().createAnimation();
      anim.duration = this.animationDuration;
      anim.onRender(lang.hitch(this, "renderSlideRight", 0));
      anim.onEnd(lang.hitch(this, "onSlideDone", pos, e, widgetID, 0));
      anim.run();
      this.initCompositeState(-1);
      return false;
    },

    renderSlideLeft(offset, p) {
      p = Math.min(p + offset, 1);
      this.setCntrPos(-1 + p);
      this.addCompositeSubState(-1 + p);
    },

    renderSlideRight(offset, p) {
      p = Math.min(p + offset, 1);
      this.setCntrPos(-1 * (1 + p));
      this.addCompositeSubState(-1 * (1 + p));
    },

    onSlideDone(pos, e, widgetID, finalValue) {
      this.setValue(pos);
      this.stopPropagation(e);
      this.emitCompositeState("slide", finalValue);
      this.emitStateChange("select", pos, e);
      this.emitDataBinding(pos + 1);
    },

    renderSlideLeftCenter(offset, p) {
      p = offset * (1 - p);
      this.setCntrPos(-1 + p);
      this.addCompositeSubState(-1 + p);
    },

    renderSlideRightCenter(offset, p) {
      p = offset * (1 - p);
      this.setCntrPos(-1 + p);
      this.addCompositeSubState(-1 + p);
    },

    onSlideCenterDone(e) {
      this.emitCompositeState("slide", -1);
      this.setCntrPos(-1);
      this.emitClick(e);
    },

    getImage(pos) {
      const images = this.model.props.images;
      const length = images.length;
      let p = pos % length;
      if (p < 0) {
        p += length;
      }
      return images[p];
    },

    setImage(pos, image) {
      const element = this.elements[pos];
      if (element) {
        if (image) {
          if (this.hash) {
            let url = "url(/rest/images/" + this.hash + "/" + image + ")";
            element.style.backgroundImage = url
          } else if (this.jwtToken) {
            let url = "url(/rest/images/" + image + "?token=" + this.jwtToken + ")";
            element.style.backgroundImage = url;
          } else {
            if (!this.isPublic) {
              this.logger.warn('setImage', 'error > no token or hash')
            }
            let url = "url(/rest/images/" + image + ")";
            element.style.backgroundImage = url;
          }
        } else {
          let w = this.model.w * 2;
          let h = this.model.h * 2;

          const c = document.createElement("canvas");
          const context = c.getContext("2d");
          c.width = w;
          c.height = h;
          h += 0.5;
          w += 0.5;
          const n = 0.5;
          context.moveTo(n, n);
          context.lineTo(w, h);
          context.moveTo(w, n);
          context.lineTo(n, h);
          context.strokeStyle = "#333";
          context.strokeWidth = 2;
          context.imageSmoothingEnabled = false;
          context.stroke();
          element.style.backgroundImage = "url(" + c.toDataURL("image/png") + ")";
          element.style.border = "1px solid #777";
        }
      }
    },

    getValue() {
      return this.value;
    },

    setValue(pos) {
      //console.debug("setValue", pos);

      if (this.mode == "edit") {
        this.setImage(0, this.getImage(pos));
      } else {
        this.setImage(0, this.getImage(pos - 1));
        this.setImage(1, this.getImage(pos));
        this.setImage(2, this.getImage(pos + 1));
        this.setCntrPos(-1);
      }

      this.value = pos;
    },

    getMouse(e) {
      const result = {};
      result.x = e.pageX;
      result.y = e.pageY;
      return result;
    },

    getState() {
      return {
        type: "select",
        value: this.value,
      };
    },

    setState(state, t) {
      if (state && state.type == "select") {
        this.setValue(state.value);
      } else if (state && state.type == "slide") {
        const p = this.getLastSubState(state, t);
        if (p) {
          this.setCntrPos(p.value);
        } else {
          this.setCntrPos(0);
        }
      }
    },

    destroy() {
      if (this._compositeState) {
        this.emitCompositeState();
      }
      this.cleanUp();
    },
  },
  mounted() {
    this.logger = new Logger('ImageCarousel')
  },
};
</script>