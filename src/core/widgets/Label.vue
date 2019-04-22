
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
  data: function() {
    return {
      value: "",
      hackValueLabel: false
    };
  },
  components: {},
  methods: {
    postCreate: function() {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
      this._labelNodes = [this.domNode];
    },

    wireEvents: function() {
      this.own(
        this.addClickListener(this.domNode, lang.hitch(this, "onClick"))
      );
      this.own(
        on(this.domNode, touch.over, lang.hitch(this, "onDomMouseOver"))
      );
      this.own(on(this.domNode, touch.out, lang.hitch(this, "onDomMouseOut")));
    },

    getLabelNode: function() {
      return this.domNode;
    },

    render: function(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.setStyle(style, model);
      if (model.props && model.props.label) {
        this.setValue(model.props.label);
      }
    },

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue: function(v) {
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

    getValue: function() {
      return this.value;
    },

    setValue: function(value) {
      value += "";
      this.value = value;
      this.setInnerHTML(this.domNode, value);
    },

    getState: function() {
      return {
        type: "value",
        value: this.value
      };
    },

    setState: function(state) {
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

    resize: function(pos) {
      if (this.style.fontSize === "Auto" || this.style.fontSize === "a") {
        this.domNode.style.fontSize = pos.h * 0.95 + "px";
      }
    },

    _set_fontSize: function(parent, style) {
      if (style.fontSize === "Auto" || this.style.fontSize === "a") {
        parent.style.fontSize = this.model.h * 0.95 + "px";
      } else {
        var size = style.fontSize * this._scaleX;
        if (this._scaleX < 1) {
          size = size * 0.95;
        }
        parent.style.fontSize = size + "px";
      }
    },

    onClick: function(e) {
      this.stopEvent(e);
      this.emitClick(e);
    }
  },
  mounted() {}
};
</script>