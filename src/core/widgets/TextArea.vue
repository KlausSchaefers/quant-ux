<template>
  <div class="MatcWidgetTypeTextBox MatcWidgetTypeTextArea"></div>
</template>
<script>
import css from "dojo/css";
import Logger from "common/Logger";
import TextBox from "core/widgets/TextBox";

export default {
  name: "TextArea",
  mixins: [TextBox],
  data: function() {
    return {
      value: null,
      mode: "edit"
    };
  },
  components: {},
  methods: {
    postCreate: function() {
      this.log = new Logger("TextArea");
      if (this.mode == "simulator") {
        this.input = document.createElement("textarea");
      } else {
        this.input = document.createElement("div");
      }
      css.add(this.input, "MatcWidgetTypeTextBoxInput");
      this.domNode.appendChild(this.input);

      this._borderNodes = [this.input];
      this._backgroundNodes = [this.input];
      this._paddingNodes = [this.input];
      this._shadowNodes = [this.input];
    },

    onEnterPressed: function() {},

    setValue: function(value) {
      if (value != null && value != undefined && this.value != value) {
        if (Array.isArray(value)) {
          value = value.join(',')
        }
        this.value = value;
        css.remove(this.input, "MatcWidgetTypeTextBoxInputPlaceholder");
        if (this.mode == "simulator") {
          this.input.value = value;
        } else {
          value = value.replace(/\n/g, "<br>");
          this.input.innerHTML = value;
        }
      }
    }
  },
  mounted() {}
};
</script>