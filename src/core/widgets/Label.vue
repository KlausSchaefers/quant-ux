
<template>
  <div class="MatcInlineEditable MatcWidgetTypeLabelInlineEditable"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Label",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return  {
      value: "",
      hackValueLabel: false
    };
  },
  components: {},
  methods: {
    postCreate () {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
      this._labelNodes = [this.domNode];
    },

    wireEvents () {
      this.own(
        this.addClickListener(this.domNode, lang.hitch(this, "onClick"))
      );
      this.own(
        on(this.domNode, touch.over, lang.hitch(this, "onDomMouseOver"))
      );
      this.own(on(this.domNode, touch.out, lang.hitch(this, "onDomMouseOut")));
    },

    getLabelNode () {
      return this.domNode;
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.setStyle(style, model);
      if (model.props && model.props.label) {
        this.setValue(model.props.label);
      }
    },


    /*
     * should be called when the widget was scalled, e.g. by
     */
    updateScale (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model, true);
    },


    /**
    * Build in update scale and just set the font size
     */

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue (v) {
      if (this.isQDate(v)) {
        v = this.convertQDateToString(v);
      }
      if (this.model.props && this.model.props.label) {
        var label = this.model.props.label;
        if (label.indexOf("{0}") >= 0) {
          v = label.replace("{0}", v);
        }
      }
      this.setValue(v);
    },

    getValue () {
      return this.value;
    },

    setValue (value) {
      value += "";
      if (this.value != value) {
        this.value = value;
        this.setInnerHTML(this.domNode, value);
      }
    },

    getState () {
      return {
        type: "value",
        value: this.value
      };
    },

    setState (state) {
      /**
       * Hack for the time when we use the getValueLabel() mechnism!
       */
      if (this.hackValueLabel) {
        return;
      }
      if (state && state.type == "value") {
        this.setValue(state.value);
      }
    },

    resize (pos) {
      if (this.style.fontSize === "Auto" || this.style.fontSize === "a") {
        this.domNode.style.fontSize = pos.h * 0.95 + "px";
      }
    },

    _set_fontSize (parent, style) {
      if (style.fontSize === "Auto" || this.style.fontSize === "a") {
        parent.style.fontSize = Math.round(this.model.h * 0.95) + "px";
      } else {
        var size = style.fontSize * this._scaleX;
        if (this._scaleX < 1) {
          size = size * 0.95;
        }
        parent.style.fontSize = Math.round(size) + "px";
      }
    },

    onClick (e) {
      this.stopEvent(e);
      this.emitClick(e);
    }
  },
  mounted() {}
};
</script>