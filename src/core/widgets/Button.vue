
<template>
  <div class="MatcWidget MatchWidgetTypeButton MatcEventedWidget MatcSimulatorClickable">
      <div data-dojo-attach-point="labelNode" class="MatcInlineEditable">{{label}}</div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Button",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: "",
      model: null
    };
  },
  components: {},
  computed: {
      label () {
        if (this.model && this.model.props && this.model.props.label) {
            return this.model.props.label
        }
        return ''
      }
  },
  methods: {
    postCreate() {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
      this._labelNodes = [this.labelNode];
    },

    wireEvents() {
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onClick")));
      this.wireHover()
    },

    getLabelNode() {
      return this.labelNode;
    },

    render(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model);
    },

    updateScale (model, style, scaleX, scaleY) {
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model);
    },

    getValue() {
      return this.value;
    },

    setValue() {

    },

    getState() {
    },

    setState() {
    },

    onClick(e) {
      this.stopEvent(e);
      this.emitClick(e);
    }
  },
  mounted() {}
};
</script>