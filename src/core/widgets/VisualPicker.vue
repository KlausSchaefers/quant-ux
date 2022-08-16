
<template>
  <div class="MatcWidgetVisualPicker">
      <div class="MatcWidgetVisualPickerIconCntr" ref="cntrNode" >
          <div class="MatcWidgetVisualPickerBorder" ref="borderNode" >
             <span :class="icon" ref="iconNode"/>
          </div>
          <div class="MatcWidgetVisualPickerPopOver" v-show="value === true" ref="popNode">
                <span :class="popIcon" ref="popIconNode"/>
          </div>
      </div>
      <div class="MatcWidgetVisualPickerIconLabel" ref="labelNode">
          {{label}}
      </div>
  </div>
</template>
<style>

</style>

<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import topic from "dojo/topic";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "VisualPicker",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      value: "",
      style: {},
      model: {},
      isWired: false,
      topic: "MatcWidgetVisualPicker"
    };
  },
  components: {},
  computed: {
    label () {
      if (this.model && this.model.props){
          return this.model.props.label
      }
      return ''
    },
    icon () {
        if (this.model && this.model.style && this.model.style.icon){
            return 'mdi ' + this.model.style.icon
        }
        return ''
    },
    popIcon () {
        if (this.model && this.model.style && this.model.style.popIcon){
            return 'mdi ' + this.model.style.popIcon
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
    postCreate () {
      this._borderNodes = [this.$refs.borderNode];
      this._backgroundNodes = [this.$refs.cntrNode];
      this._shadowNodes = [this.$refs.cntrNode];
      this._labelNodes = [this.$refs.labelNode];
    },

    wireEvents () {
      this.isWired = true
      this.own(this.addClickListener(this.domNode, lang.hitch(this, 'onChange')));
      this.own(topic.subscribe(this.topic, lang.hitch(this, "onOtherChecked")));
      this.wireHover()
    },
  
    onOtherChecked (event) {
      const formGroup = this.getFormGroup(this.model)
      if (formGroup && event && this.model && event.id != this.model.id) {
        if (this.getFormGroup(this.model) === event.formGroup) {
          this.setValue(false);
        }
      }
    },

    onChange(e){
        this.setValue(!this.value);
        this.emit("change", this.value );
        this.emitClick(e);
         topic.publish(this.topic, {id: this.model.id, formGroup: this.getFormGroup(this.model)});
    },

    getLabelNode () {
      return this.$refs.labelNode;
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.setStyle(style, model);
      if (model.props && model.props.checked !== undefined) {
        this.setValue(model.props.checked);
      }
    },

    _set_iconSize(parent, style) {
        if (this.$refs.iconNode) {
            const w = this._getBorderWidth(style.iconSize);
            this.$refs.iconNode.style.fontSize = w + "px";
        }
    },

    _set_iconColor(parent, style) {
      if (this.$refs.iconNode) {
          this.$refs.iconNode.style.color = style.iconColor
      }
    },

    _set_popBackground (parent, style) {
        if (this.$refs.popNode) {
            this.$refs.popNode.style.background = style.popBackground
        }
    },

    _set_popColor(parent, style) {
        if (this.$refs.popNode) {
            this.$refs.popNode.style.color = style.popColor
        }
    },

    _set_popIconSize(parent, style) {
        if (this.$refs.popIconNode) {
            const w = this._getBorderWidth(style.popIconSize);
            this.$refs.popIconNode.style.fontSize = w + "px";
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
      if (state && state.type == 'value') {
        this.setValue(state.value);
      }
    },

   
    onClick (e) {
      this.stopEvent(e);
      this.emitClick(e);
    },


    getFormGroup (widget) {
      if (widget.props) {
        return widget.props.formGroup;
      }
    }
  }
};
</script>