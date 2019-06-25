
<template>
  <div class="MatcWidgetTypeUpload ">
      <div class="MatcWidgetTypeUploadLabel" ref="labelNode">
          {{label}}
      </div>
    
  </div>
</template>
<style>

</style>

<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Upload",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      value: "",
      style: {},
      model: {}
    };
  },
  components: {},
  computed: {
    options () {
      return this.style.options
    },
    label () {
        if (this.model && this.model.props){
            console.debug('this.model.props.label', this.model.props.label)
            return this.model.props.label
        }
        return ''
    }
  },
  methods: {

    postCreate () {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
      this._labelNodes = [this.$refs.labelNode];
    },

   

    wireEvents () {
      this.own(this.addClickListener(this.domNode, lang.hitch(this, 'onClick')));
      this.own(on(this.domNode, touch.over, lang.hitch(this, 'onDomMouseOver')));
      this.own(on(this.domNode, touch.out, lang.hitch(this, 'onDomMouseOut')));
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

    getValue () {
      return this.value;
    },

    setValue (value) {
      this.value = value;
    },

    getState () {
      return {
        type: 'value',
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
      if (state && state.type == 'value') {
        this.setValue(state.value);
      }
    },

    resize () {
    },

    onClick: function(e) {
      this.stopEvent(e);
      this.emitClick(e);
    }
  }
};
</script>