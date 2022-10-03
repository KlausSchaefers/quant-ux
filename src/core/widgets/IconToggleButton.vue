
<template>
  <div class="MatcWidgetIconToggleButton">
        <div class="MatcWidgetVisualPickerIcon">
             <span :class="icon" ref="iconNode"/>
        </div>
        <div class="MatcWidgetIconToggleButtonLabel" ref="labelNode">
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
import touch from "dojo/touch";

export default {
  name: "IconToggleButton",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      value: "",
      style: {},
      model: {},
      isWired: false,
      topic: "MatcWidgetIconToggleButton"
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
    size () {
      if (this.bbox) {
        return Math.round(Math.min(this.bbox.h, this.bbox.w) * 0.6) + 'px'
      }
      return '20px'
    }
  },
  methods: {
    postCreate () {
        this._borderNodes = [this.$el];
        this._backgroundNodes = [this.$el];
        this._shadowNodes = [this.$el];
        this._labelNodes = [this.$el];
    },

    wireEvents () {
      this.isWired = true
      this.own(this.addClickListener(this.domNode, lang.hitch(this, 'onChange')));
      this.own(topic.subscribe(this.topic, lang.hitch(this, "onOtherChecked")));
      this.wireHover(touch.enter, touch.leave)
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
        topic.publish(
            this.topic, 
            {
                id: this.model.id, 
                formGroup: this.getFormGroup(this.model)
            }
        );
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

    getValue () {
      return this.value;
    },

    setValue (value) {
      this.value = value;

      if (this.value && this.model.active) {
        const active = this.model.active
        this.$el.style.background = active.background
        this.$el.style.color = active.color
      } else {
        this.$el.style.background = this.style.background
        this.$el.style.color = this.style.color
      }
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