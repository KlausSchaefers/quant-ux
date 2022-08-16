
<template>
  <div class="MatcWidgetTypeVolumeSlider"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import domGeom from "dojo/domGeom";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "VolumeSlider",
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
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
    },

    wireEvents () {
      this.wired = true;
      for (let i = 0; i < this.elements.length; i++) {
        this.own(this.addClickListener(this.elements[i],lang.hitch(this, "onSelect", i)))
      }
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onBodyClick")));
      this.wireHover()
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
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      var db = new DomBuilder();
      this.elements = [];
      var elementCount = this.model.props.elementCount;
      var cntr = db.div("MatcWidgetTypeVolumeSliderCntr").build();
      var h = (1 / elementCount) * 100;
      var w = (1 / (elementCount * 2 - 1)) * 100;
      var m = (1 / (elementCount * 2 - 1)) * 100;

      for (var i = 0; i < elementCount; i++) {
        var element = db.div("MatcWidgetTypeVolumeSliderElement").build(cntr);
        element.style.height = h * (i + 1) + "%";
        element.style.width = w + "%";
        element.style.left = w * i + m * i + "%";
        this._borderNodes.push(element);
        this._backgroundNodes.push(element);
        this._shadowNodes.push(element);
        this.elements.push(element);
      }

      this.domNode.appendChild(cntr);

      this.setStyle(style, model);

      this.setValue(model.props.selected);
    },

    onSelect (pos, e) {
      this.stopPropagation(e);
      this.emitStateChange("select", pos, e);
      this.setValue(pos);
    },

    onBodyClick (e) {
      var mouse = this.getMouse(e);
      var domPos = domGeom.position(this.domNode);
      var p = (mouse.x - domPos.x) / domPos.w;
      /**
       * FIXME: This is a little wrong because we have n*2-1 elements,
       * so p does not really translate lineary..
       */
      var pos = Math.floor(p * 10);

      this.stopPropagation(e);
      this.emitStateChange("select", pos, e);
      this.setValue(pos);
    },

    setValue (value) {
      if (value !== this.value) {
        var active = this.model.active;
        var passive = this.model.style;
        if (active) {
          for (var i = 0; i < this.elements.length; i++) {
            var s;
            if (i < value + 1) {
              s = active;
            } else {
              s = passive;
            }

            this.elements[i].style.background = s.background;

            this.elements[i].style.borderTopColor = s.borderTopColor;
            this.elements[i].style.borderBottomColor = s.borderBottomColor;
            this.elements[i].style.borderRightColor = s.borderRightColor;
            this.elements[i].style.borderLeftColor = s.borderLeftColor;

            this.elements[i].style.borderTopWidth = s.borderTopWidth;
            this.elements[i].style.borderBottomWidth = s.borderBottomWidth;
            this.elements[i].style.borderRightWidth = s.borderRightColor;
            this.elements[i].style.borderLeftWidth = s.borderLeftWidth;

            this.elements[i].style.borderTopRightRadius =
              s.borderTopRightRadius;
            this.elements[i].style.borderTopLeftRadius = s.borderTopLeftRadius;
            this.elements[i].style.borderBottomRightRadius =
              s.borderBottomRightRadius;
            this.elements[i].style.borderBottomLeftRadius =
              s.borderBottomLeftRadius;
          }
        }

        this.value = value;
      }
    },

    getValue () {
      return this.value;
    },

    getMouse (e) {
      const result = {};
      result.x = e.pageX;
      result.y = e.pageY;
      return result;
    },

    getState () {
      return {
        type: "select",
        value: this.value
      };
    },

    setState (state) {
      if (state && state.type == "select") {
        this.setValue(state.value);
      }
    },

    destroy () {
      if (this._compositeState) {
        this.emitCompositeState();
      }
      this.cleanUp();
    }
  },
  mounted() {}
};
</script>