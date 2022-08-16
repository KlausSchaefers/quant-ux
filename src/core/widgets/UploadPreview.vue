
<template>
  <div :class="['MatcWidgetTypeUploadPreview', {'MatcWidgetTypeUploadPreviewImage': hasImage}]" :style="{'backgroundImage': src}"/>

</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "UploadPreview",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: "",
      style: {},
      model: {},
      hackValueLabel: false
    };
  },
  computed: {
      hasImage () {
          return this.value && this.value.length > 0
      },
      src () {
          if (this.value) {
            /**
             * Vale was set by data binding! 
             */
            let url = 'url(' + this.value + ')';
            return url
          } else if (this.model) {
            if (this.model.style && this.model.style.backgroundImage) {
              /**
               * We have a normal background pic
               */
              let url = 'url(' + this.model.style.backgroundImage + ')';
              return url
            } else {
              /**
               * We draw a placeholder
               */
              var w = this.model.w * 2;
              var h = this.model.h * 2;
              var c = document.createElement("canvas");
              var context = c.getContext("2d");
              c.width = w;
              c.height = h;
              h += 0.5;
              w += 0.5;
              var n = 0.5;
              context.moveTo(n, n);
              context.lineTo(w, h);
              context.moveTo(w, n);
              context.lineTo(n, h);
              context.strokeStyle = "#333";
              context.strokeWidth = 2;
              context.imageSmoothingEnabled = false;
              context.stroke();
              let url = 'url(' + c.toDataURL("image/png") + ')';
              return url

            }
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
      this._labelNodes = [this.domNode];
    },

    wireEvents () {
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onClick")));
      this.wireHover()
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

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue (v) {        
        /**
         * We can have normal urls and data ulrs
         */
        if (v.substring && (v.indexOf('data:image/png;base64') === 0 || v.indexOf('http') === 0)) {
            this.setValue(v);
            return;
        } 
        /**
         * Sometimes its files
         */
        if (v.name && v.size) {
          let reader = new FileReader()
          if (reader.readAsDataURL) {
            reader.onload = () => {
              this.setValue(reader.result)
            }
            reader.readAsDataURL(v)
          }
          return;
        } 
        /**
         * Last it can handle array buffers
         */
        try {
          let imgUrl = this.bufferToImage(v)
          this.setValue(imgUrl)
        } catch (e) {
          console.error('UploadPreview._setDataBindingValue() Cannot handle data. Not ArrayBuffer',e)
        }
    },

    getValue: function() {
      return this.value;
    },

    setValue: function(value) {
      this.value = value;
    },

    bufferToImage (buffer) {
      var base64Flag = 'data:image/jpeg;base64,';
      var imageStr = this.arrayBufferToBase64(buffer);
      return base64Flag + imageStr
    },

    arrayBufferToBase64 (buffer) {
        var binary = '';
        var bytes = [].slice.call(new Uint8Array(buffer));      
        bytes.forEach((b) => binary += String.fromCharCode(b));
        return window.btoa(binary);
    },

    getState: function() {
      return {
        type: "value",
        value: ''
      };
    },

    setState: function(state) {
      if (state && state.type == "value") {
        this.setValue(state.value);
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