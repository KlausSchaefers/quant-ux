<template>
  <div class="MatcWidgetTypeSpinner">
    <div data-dojo-attach-point="borderBox" class="MatcWidgetTypeSpinnerBorderBox"></div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import win from "dojo/_base/win";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";
import Animation from "core/Animation";

export default {
  name: "Spinner",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: null,
      repeats: 3
    };
  },
  components: {},
  methods: {
    postCreate () {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
    },

    wireEvents () {
        this.wired = true;
        for (let i = 0; i < this.options.length; i++) {
          this.tempOwn(this.addTouchStart(this.options[i],lang.hitch(this, "onDndStart", this.values[i], i)))
        }
        this.wireHover()
    },

    onDndStart (value, pos, e) {
      this.stopEvent(e);
      this.dndStartPos = this.getMouse(e);
      this.dndStartTime = new Date().getTime();
      this.moveListener = this.addTouchMove(
        win.body(),
        lang.hitch(this, "onDnDMove")
      );
      this.releaseListener = this.addTouchRelease(
        win.body(),
        lang.hitch(this, "onDndEnd", value, pos)
      );
      this.initCompositeState(this.getTopInPercent(this.currentTop), e);
      return false;
    },

    onDnDMove (e) {
      this.stopEvent(e);
      var pos = this.getMouse(e);
      var difY = pos.y - this.dndStartPos.y;
      this.setTop(difY + this.currentTop);
      this.addCompositeSubState(this.getTopInPercent(difY + this.currentTop));
      this.emitMouseMove(e);
      return false;
    },

    onDndEnd (option, pos, e) {
      this.stopEvent(e);
      if (this.dndStartPos) {
        var mPos = this.getMouse(e);
        var difY = mPos.y - this.dndStartPos.y;
        if (Math.abs(Math.abs(difY) < 10)) {
          this.onSelect(option, pos, e);
        } else {
          /**
           * FIXME: we could still have here some kind of momentum...
           */
          var h = Math.round(this.model.h * 0.33);
          var top = this._lastTop;
          var space = Math.abs(top % h);
          pos = Math.floor(Math.abs(top / h)) + 1;

          var dif = 0;
          if (space > h / 2) {
            pos++;
            dif = h - space;
          } else {
            dif = -1 * space;
          }
          option = this.values[pos];
          this.currentTop = top;
          var anim = new Animation().createAnimation();
          anim.duration = space * 5;
          anim.onRender(lang.hitch(this, "onSlide", this.currentTop, dif));
          anim.onEnd(lang.hitch(this, "onSlideDone", option));
          anim.run();
        }
        /**
         * Since 3.0.43 we virbrate
         */
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(30);
        }
      }

      this.cleanUp();
    },

    cleanUp () {
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

    render (model, style, scaleX, scaleY) {
      // On (re)render ( called when style or props are updated)
      // make sure things are properly cleaned up.
      if (this.cntr && this.cntr.parentNode) {
        this.cntr.parentNode.removeChild(this.cntr);
      }

      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model);

      var db = new DomBuilder();

      let options = this.model.props.options;
      if (!options) {
        options = []
      }
      var cntr = db.div("MatcWidgetTypeSpinnerCntr").build();
      this.options = [];
      this.values = [];
      var h = Math.round(this.model.h * 0.33);
      for (var j = 0; j < this.repeats; j++) {
        for (var i = 0; i < options.length; i++) {
          var option = options[i];
          var node = db.div("MatcWidgetTypeSpinnerOption").build(cntr);
          node.style.height = h + "px";
          db.div("MatcVAlignCntr")
            .div("MatcVAlignCenter", option)
            .build(node);
          this.options.push(node);
          this.values.push(option);
        }
      }

      this.domNode.appendChild(cntr);
      this.cntr = cntr;
      this.cntrHeight = h * this.repeats * options.length;
      this.viewHeight = h * 3;

      if (this.model.style.borderBoxColor) {
        this.borderBox.style.borderColor = this.model.style.borderBoxColor;
      }

      if (this.model.style.borderBoxWidth) {
        var w = Math.max(1,this.getZoomed(this.model.style.borderBoxWidth, this._scaleY));
        this.borderBox.style.borderTopWidth = w + "px";
        this.borderBox.style.borderBottomWidth = w + "px";
      }

      this.setValue(options[0]);
    },

    onSelect (option, pos, e) {
      this.stopPropagation(e);

      if (pos == this.currentPos) {
        this.emitClick(e);
      } else {
        var h = Math.round(this.model.h * 0.33);
        var dif = -1 * h;
        if (pos > this.currentPos) {
          dif = h;
        }
        var anim = new Animation().createAnimation();
        anim.onRender(lang.hitch(this, "onSlide", this.currentTop, dif));
        anim.onEnd(lang.hitch(this, "onSlideDone", option));
        anim.run();
        this.initCompositeState(this.getTopInPercent(this.currentTop), e);
      }
    },

    setPosition (pos) {
      var h = Math.round(this.model.h * 0.33);
      var p = pos + this.model.props.options.length;

      for (var i = 0; i < this.options.length; i++) {
        css.remove(this.options[i], "MatcWidgetTypeSpinnerOptionSelected");
      }
      css.add(this.options[p], "MatcWidgetTypeSpinnerOptionSelected");
      var top = -h * (p - 1);
      this.setTop(top);
      this.currentTop = top;
      this.currentPos = p;
    },

    setTop (top) {
      if (top > 0 || top < -0.66 * this.cntrHeight) {
        var rest = top % Math.round(this.cntrHeight / this.repeats);
        top = -1 * (this.cntrHeight / this.repeats) + rest;
      }
      this.cntr.style.top = top + "px";
      this._lastTop = top;
    },

    getTopInPercent (top) {
      return top / this.cntrHeight;
    },

    onSlide (top, dif, p) {
      var t = top - dif * p;
      this.setTop(t);
      this.addCompositeSubState(this.getTopInPercent(t));
    },

    onSlideDone (option) {
      this.emitDataBinding(option);
      this.setValue(option);
      this.emitCompositeState("select", option);
    },

    resize (box) {
      var h = Math.round(box.h * 0.33);
      for (var i = 0; i < this.options.length; i++) {
        var node = this.options[i];
        node.style.height = h + "px";
      }
      this.cntrHeight = h * this.repeats * this.options.length;
      this.viewHeight = h * 3;
      this.optionHeight = h;
      /**
       * We have to ste the top correct by selected the first element.
       *
       * FIXME: pass the model in the methode
       */
      this.model.h = box.h
      this.model.w = box.w
      this.setPosition(0)
    },

    setValue (value) {
      if (value !== this.value) {
        var pos = this.model.props.options.indexOf(value);
        if (pos >= 0) {
          this.setPosition(pos);
        }
        this.value = value;
      }
    },

    getValue () {
      return this.value;
    },

    getState: function() {
      return {
        type: "select",
        value: this.value
      };
    },

    setState: function(state, t) {
      if (state && state.type == "select") {
        var top = this.getLastSubState(state, t);
        if (top) {
          this.setTop(top.value * this.cntrHeight);
        } else {
          this.setValue(state.value);
        }
      }
    },


    destroy: function() {
      if (this._compositeState) {
        this.emitCompositeState();
      }
      this.cleanUp();
    }
  },
  mounted() {}
};
</script>