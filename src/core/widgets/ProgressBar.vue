
<template>
  <div class="MatcWidgetTypeProgressBar">
      <div class="MatcWidgetTypeProgressBarInner" :style="{'width': width, 'background': foreground }">

      </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "ProgressBar",
  mixins: [UIWidget, DojoWidget],
  data() {
    return {
      value: 50,
      model: null
    };
  },
  components: {},
  computed: {
      width () {
        if (this.value < 1) {
            return this.value * 100 + '%'
        }
        return Math.max(0, Math.min(100, this.value)) + '%'
      },
      foreground () {
        if (this.model && this.model.style) {
            return this.model.style.foreground
        }
        return '#333'
      }
  },
  methods: {
    postCreate() {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
    },

    wireEvents() {
      this.wired = true;
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onClick")));
      this.wireHover()
    },

    render(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.resize(model);
      this.setStyle(style, model);
      if (model.props && model.props.value !== null && model.props.value !== undefined) {
        this.setValue(model.props.value);
      }

      //this.setValue(model.props.selected)
    },

    
    _setDataBindingValue (v) {
      this.setValue(v);
    },

    setValue (value) {
        this.value = value * 1
    },

    getValue () {
      return this.value;
    },

    getState() {
      return {};
    },

    setState() {
    },

    onClick(e) {
      this.stopEvent(e);
      this.emitClick(e);
    },

    destroy() {
    }
  },
  mounted() {}
};
</script>