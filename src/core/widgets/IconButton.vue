
<template>
  <div class="MatchWidgetTypeIconButton">
      <div ref="labelCntr">
        <span :class="'MatchWidgetTypeIconButtonIcon ' + icon" :style="{'margin-right' : margin, color: iconColor}"/>
        <span class="MatcInlineEditable" ref="labelNode">{{label}}</span> 
      </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "IconButton",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: "",
      model: null,
      scale: 1
    };
  },
  components: {},
  computed: {
      label () {
          if (this.model && this.model.props && this.model.props.label) {
              return this.model.props.label
          }
          return ''
      }, 
      icon () {
        if (this.model && this.model.style && this.model.style.icon) {
              return this.model.style.icon
        }
        return ''
      },
      margin () {
          if (this.model && this.model.style && this.model.style.iconMargin) {
              return  Math.round(this.scale * this.model.style.iconMargin) + 'px'
          }
          return '0px' // Math.round(this.scale * 10) + 'px'
      },
      iconColor () {
        if (this.model && this.model.style && this.model.style.iconColor && this.model.style.iconColor !== 'transparent') {
            return this.model.style.iconColor
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
      this._labelNodes = [this.$refs.labelCntr];
    },

    wireEvents() {
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onClick")));
      this.wireHover()
    },

    getLabelNode() {
      return this.$refs.labelNode;
    },

    render(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.scale = scaleX
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