
<template>
  <div class="MatcWidget MatchWidgetTypeImage MatcEventedWidget MatcSimulatorClickable">

  </div>
</template>

<style scoped>
  .MatchWidgetTypeImage{
    height: 100%;
    width: 100%;
  }
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "QImage",
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
    },

    wireEvents() {
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onClick")));
      this.own(on(this.domNode, touch.over, lang.hitch(this, "onDomMouseOver")));
      this.own(on(this.domNode, touch.out, lang.hitch(this, "onDomMouseOut")));
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