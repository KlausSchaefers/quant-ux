
<template>
  <div class="MatcWidgetTypeUpload ">
      <div class="MatcWidgetTypeUploadLabel" ref="labelNode" v-if="!icon">
          {{label}}
      </div>
      <span v-else :class="[icon, 'MatcWidgetTypeUploadIcon']" :style="{'font-size': size }"/>
      <input type="file" class="MatcWidgetTypeUploadFile" ref="input" accept="image/*" capture="user" @change="onFileChange" v-if="isWired"/>
  </div>
</template>
<style>

</style>

<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Upload",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      value: "",
      style: {},
      model: {},
      bbox: {w: 20, h:20},
      isWired: false
    };
  },
  components: {},
  computed: {
    label () {
      if (this.value && !this.icon && this.value.name) {
        return this.value.name
      }
      if (this.model && this.model.props){
          return this.model.props.label
      }
      return ''
    },
    maxFiles () {
        if (this.model && this.model.props && this.model.props.maxFiles !== undefined){
            return this.model.props.maxFiles
        }
        return 1
    },
    icon () {
        if (this.model && this.model.style && this.model.style.icon){
            return 'mdi ' + this.model.style.icon
        }
        return ''
    },
    size () {
      if (this.bbox) {
        return Math.round(Math.min(this.bbox.h, this.bbox.w) * 0.6) + 'px'
      }
      return '20px'
    }
  },
  methods: {

    onFileChange () {
      if (this.$refs.input) {
        let files = this.$refs.input.files;
        if (files.length >= this.maxFiles) {
          this.setImage(files[0])
        }
      }
    },

    setImage (image, e) {
      this.value = image
      this.emitDataBinding(this.value);
      this.emitClick(e);
    },

    postCreate () {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
      this._labelNodes = [this.$refs.labelNode];
    },

    wireEvents () {
      this.isWired = true
      this.wireHover()
    },

    getLabelNode () {
      if (!this.icon) {
        return this.$refs.labelNode
      }
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.bbox.w = model.w
      this.bbox.h = model.h
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
        value: ''
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

    resize (pos) {
      this.bbox.w = pos.w
      this.bbox.h = pos.h
    },

    onClick (e) {
      this.stopEvent(e);
      this.emitClick(e);
    }
  }
};
</script>