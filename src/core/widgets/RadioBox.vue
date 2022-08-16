
<template>
  <div class="MatcWidgetTypeRadioBox">
    <div data-dojo-attach-point="back">
      <span class="MatcWidgetTypeRadioBoxCircle" data-dojo-attach-point="hook"></span>
    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import topic from "dojo/topic";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "RadioBox",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: false,
      topic: "MatcWidgetRadioBoxChange"
    };
  },
  components: {},
  methods: {
    postCreate () {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
    },

    wireEvents () {
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onChange")));
      this.own(topic.subscribe(this.topic, lang.hitch(this, "onOtherChecked")));
      this.wireHover()
    },

    onOtherChecked (event) {
      if (event && this.model && event.id != this.model.id) {
        this.setValue(false);
      }
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model);

      /**
       * Legacy
       */
      if (model.props.colorButton) {
        this.hook.style.background = model.props.colorButton;
      }

      if (model.style.colorButton) {
        this.hook.style.background = model.style.colorButton;
      }

      this.setValue(model.props.checked);
    },

    getValue: function() {
      return this.value;
    },

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue: function(v) {
      if (v !== true && v !== false && v >= 1) {
        v = true;
      }
      this.setValue(v);
    },

    setValue: function(value) {
      this.value = value;

      if (value) {
        css.add(this.domNode, "MatcWidgetTypeRadioBoxChecked");

        if (this.model.checked) {
          this.setStyle(this.model.checked);
        }
      } else {
        css.remove(this.domNode, "MatcWidgetTypeRadioBoxChecked");

        if (this.model.checked) {
          this.setStyle(this.model.style);
        }
      }
    },

    getState: function() {
      return {
        type: "radiobox.checked",
        value: this.value
      };
    },

    setState: function(state) {
      if (state && state.type == "radiobox.checked") {
        this.setValue(state.value);
      }
    },

    onChange: function(e) {
      if (!this.value) {
        this.emitDataBinding(true);
        this.setValue(true);
        this.emitStateChange("radiobox.checked", this.value, e);
        topic.publish(this.topic, { id: this.model.id });
      } else {
        this.emitClick(e);
      }
    }
  },
  mounted() {}
};
</script>