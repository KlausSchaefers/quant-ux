<template>
  <div class="MatcWidgetTypeScrollTarget"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "ScrollTarget",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {};
  },
  components: {},
  methods: {
    postCreate: function() {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
    },

    getCreateTemplates () {
        return [
                {
                "id" : "ScrollTarget",
                "type" : "ScrollTarget",
                "name" : "Scroll Target",
                "category" : "WireFrame",
                "subcategory" : "FormSpecial",
                "_type" : "Widget",
                "x" : 0,
                "y" : 0,
                "w" : 100,
                "h" : 20,
                "z" : 0,
                "props" : {
                },
                "has" : {
                    "scrollEvent": true
                },
                "style" : {
                }
            }
        ]
    },

    wireEvents: function() {
    },

    render: function(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
    },

    getValue: function() {},

    setValue: function() {},

    getState: function() {
      return {};
    },

    setState: function() {}
  },
  mounted() {}
};
</script>