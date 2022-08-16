
<template>
  <div :class="['MatcWidgetTypeSegmentPicker', {'MatcWidgetTypeSegmentPickerShadow': hasActiveShadow} ]">
    <div class="MatcWidgetTypeSegmentPickerHighlight" ref="highlight">
    </div>
    <div class="MatcWidgetTypeSegmentPickerWrapper" ref="wrapper">
    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "SegmentPicker",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: false,
      model: false,
    };
  },
  components: {},
  computed: {
    isMulti () {
      if (this.model && this.model.props && this.model.props.multi) {
        return true
      }
      return false
    },
    options () {
      if (this.model && this.model?.props?.options) {
        return this.model?.props?.options
      }
      return []
    },
    hasActiveShadow () {
      if (this.model && this.model.active && this.model.active.boxShadow) {
        return true
      }
      return false
    }
  },
  methods: {
    postCreate () {
      this._labelNodes = [];
      this._borderNodes = [this.domNode];
      this._shadowNodes = [this.$refs.highlight];
      this._backgroundNodes = [this.domNode];
      this._paddingNodes = [];
    },

    wireEvents () {
      this.wired = true;
      for (var i = 0; i < this.btns.length; i++) {
        var option = this.btns[i].o;
        var btn = this.btns[i].b;
        this.own(this.addClickListener(btn, lang.hitch(this, "onSelect", option)));
      }
      this.wireHover()
    },

    render (model, style, scaleX, scaleY) {
        this.model = model;
        this.style = style;
        this._scaleX = scaleX;
        this._scaleY = scaleY;

        const wrapper = this.$refs.wrapper
  
        this.removeAllChildren(wrapper)

        const db = new DomBuilder();
        const options = this.model.props.options;
        const width = 100 / options.length;
        this.btns = [];
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            var btn = db
                .div("MatcWidgetTypeSegmentPickerChild")
                .w(width, "%")
                .build(wrapper);

            let label = db.span("", option).build(btn);
            this.btns.push({o: option, b: btn});
            this._paddingNodes.push(btn);
            this._labelNodes.push(label)
        }
        this.setStyle(style, model);
        this.setActiveStyle(width, style) 
        if (this.model.props.selected !== undefined) {
            this.setValue(this.model.props.selected, true);
        }
    },

    setActiveStyle (width, style) {
        const highlight = this.$refs.highlight
        highlight.style.width = width + "%"

        if (style.selectedBackground) {
          highlight.style.background = style.selectedBackground
        }
        this._setBorderRadius(highlight, style)
    },

   


    onSelect (option, e) {
      this.stopEvent(e);
      let value = option
      this.value = value;
      this.emitDataBinding(value);
      this.setValue(value);
      this.emitStateChange("select", value, e);
    },

    moveSelection(option) {
        const highlight = this.$refs.highlight
        const options = this.model.props.options;
        const width = 100 / options.length;
        let index = options.indexOf(option)
        if (index >= 0) {
          highlight.style.left = (width * index) + "%"
        }

        const style = this.style
        for (let i = 0; i < this.btns.length; i++) {
          let value = this.btns[i].o;
          let btn = this.btns[i].b;
          if (value === option) {
            btn.style.color = style.selectedColor
          } else {
            btn.style.color = style.color
          }
        }
    },

    getValue () {
      return this.value;
    },

    setValue (value) {
      this.value = value;
      this.moveSelection(value)
    },

    getState () {
      return {
        type: "select",
        value: this.value
      };
    },

    setState (state) {
      if (state) {
        if (state.type == "select") {
          this.setValue(state.value);
        }
      }
    },

    beforeDestroy: function() {
    }
  },
  mounted() {}
};
</script>