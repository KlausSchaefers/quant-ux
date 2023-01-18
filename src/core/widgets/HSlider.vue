
<template>
  <div class="MatcWidgetTypeHSlider"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import HSlider from "common/HSlider";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "HSlider",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: null,
       sliderPressed: false
    };
  },
  components: {},
  methods: {
    postCreate () {
      this.slider = this.$new(HSlider, {wire: false})
      this.slider.wire = false;
      this.slider.placeAt(this.domNode);

      this._borderNodes = [this.slider.cntr, this.slider.bar];
      this._backgroundNodes = [this.slider.cntr];
      this._shadowNodes = [this.slider.cntr];
    },

    wireEvents () {
      this.slider.wireEvents();
      this.own(this.slider.on("change", lang.hitch(this, "onSliderChange")));
      this.own(this.slider.on("press", lang.hitch(this, "onSliderPress")));
      this.own(this.slider.on("release", lang.hitch(this, "onSliderRelease")));
      this.wireHover()
    },

    onSliderChange (w, e) {
      if (!this.sliderPressed) {
        this.emitStateChange("select", this.slider.getValue(), e);
      } else {
        this.addCompositeSubState(this.slider.getValue());
      }

      var v = this.slider.getValue();
      this.emitDataBinding(v);
      this.setValueLabel(v);

     
    },

    onSliderPress (e) {
      this.sliderPressed = true;
      this.initCompositeState(this.slider.getValue(), e);
    },

    onSliderRelease (e) {
      this.sliderPressed = false;
      this.emitCompositeState("select", this.slider.getValue());
      setTimeout(() => {
        this.emitStateChange("select", this.slider.getValue(), e);
      }, 250)
    },

    cleanUp () {
      this.slider.cleanup();
      this.sliderPressed = false;
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      if (style.barColor) {
        this.slider.bar.style.backgroundColor = style.barColor;
      }

      if (style.handleColor) {
        this.slider.hndl.style.backgroundColor = style.handleColor;
      }

      if (style.handleShadow) {
        this._setShadow(this.slider.hndl, style.handleShadow);
      }

      if (model.props && model.props.hasLabel) {
        this.slider.setShowLabel(true)
      }

      this.setStyle(style, model);

      this.resize(model);
    },

    resize (model) {
      var barHeight = Math.round(model.h / 3);

      if (this.style.barHeight) {
        barHeight = Math.round(model.h * this.style.barHeight);
      }

      /**
       * Update dom
       */
      var hPos = { w: 0, h: model.h };
      var bPos = { w: model.w, h: barHeight };

      /**
       * update handle
       */
      this.slider.hndl.style.height = model.h + "px";
      if (this.style.handleWidth) {
        let w = this.getZoomed(this.style.handleWidth, this._scaleX);
        this.slider.hndl.style.width = w + "px";
        hPos.w = w;
      } else {
        this.slider.hndl.style.width = Math.round(model.w / 10) + "px";
        hPos.w = Math.round(model.w / 10);
      }

      if (this.style.handleRadius) {
        let w = this.getZoomed(this.style.handleRadius, this._scaleX);
        this.slider.hndl.style.borderRadius = w + "px";
      }




      //this.setScalledNodeStyle(this.slider.hndl, this.style, ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"])

      this.slider.bar.style.height = bPos.h + "px";
      this.slider.cntr.style.height = bPos.h + "px";

      this.slider.render(model, bPos, hPos);

      /**
       * Now reforce rendering
       */
      if (this.model.props) {
        var p = this.model.props;
        if (p.max != null && p.max != undefined) {
          this.slider.setMax(p.max);
        }
        if (p.min != null && p.min != undefined) {
          this.slider.setMin(p.min);
        }
        if (p.value != null && p.value != undefined) {
          this.slider.setValue(p.value);
        }
      }
    },

    _setDataBindingValue (v) {
      v = v * 1;
      if (!isNaN(v)) {
        this.setValue(v);
      } else {
        console.debug("_setDataBindingValue() > not int value" + v);
      }
    },

    setValue (value) {
      this.slider.setValue(value);
      this.setValueLabel(value);
    },

    getValue () {
      return this.slider.getValue();
    },

    getState () {
      return {
        type: "select",
        value: this.getValue()
      };
    },

    setState (state, t) {
      if (state && state.type == "select") {
        var child = this.getLastSubState(state, t);
        if (child) {
          this.setValue(child.value);
        } else {
          this.setValue(state.value);
        }
      }
    },

    _set_handleBorderColor (parent, style) {
      this.slider.hndl.style.borderColor = style.handleBorderColor;
    },

    _set_handleBorderWidth (parent, style) {
      this.slider.hndl.style.borderWidth =
        this._getBorderWidth(style.handleBorderWidth) + "px";
    },

    _set_handleBorderStyle (parent, style) {
      this.slider.hndl.style.borderStyle = style.handleBorderStyle;
    },

    beforeDestroy () {
      if (this._compositeState) {
        this.emitCompositeState();
      }
      this.cleanUp();
    }
  },
  mounted() {}
};
</script>