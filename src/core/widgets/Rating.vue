
<template>
  <div class="MatcWidgetTypeRating"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Rating",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: null,
      repeats: 3
    };
  },
  components: {},
  methods: {
    postCreate () {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
    },

    wireEvents () {
      this.wired = true;
      for (let i = 0; i < this.elements.length; i++) {
        this.own(this.addClickListener(this.elements[i],lang.hitch(this, "onSelect", i)))
      }
      this.wireHover()
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      var db = new DomBuilder();
      this.elements = [];
      this.icons = [];
      var elementCount = this.model.props.elementCount;
      var cntr = db.div("MatcWidgetTypeRatingCntr").build();

      for (var i = 0; i < elementCount; i++) {
        var element = db.div("MatcWidgetTypeRatingElement").build(cntr);
        element.style.height = "100%";
        var icon = db.span("mdi mdi-star-outline").build(element);
        icon.style.color = style.color;
        this.icons.push(icon);
        this.elements.push(element);
      }

      this.removeAllChildren(this.domNode)
      this.domNode.appendChild(cntr);

      this.resize(model);

      /**
       * Selected is the visible starts
       */
      this.setValue(model.props.selected - 1)
    },

    resize: function(model) {
      var elementCount = this.elements.length;
      // var h = (model.h / model.w) * this.model.h;
      var w = (model.h / model.w) * 100;
      var m = (100 - w * elementCount) / (elementCount - 1);
      for (var i = 0; i < elementCount; i++) {
        var element = this.elements[i];
        element.style.width = w + "%";
        element.style.left = w * i + m * i + "%";
        var icon = this.icons[i];
        icon.style.fontSize = model.h + "px";
      }
    },

    onSelect: function(pos, e) {
      this.stopPropagation(e);
      this.setValue(pos);
      this.emitDataBinding(pos + 1);
      this.emitStateChange("select", pos, e);
    },

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue: function(v) {
      this.setValue(v - 1);
    },

    setValue: function(value) {
      if (value !== this.value) {
        for (var i = 0; i < this.elements.length; i++) {
          var icon = this.icons[i];
          if (i < value + 1) {
            css.remove(icon, "mdi-star-outline");
            css.add(icon, "mdi-star");
          } else {
            css.add(icon, "mdi-star-outline");
            css.remove(icon, "mdi-star");
          }
        }

        this.value = value;
      }
    },

    getValue: function() {
      return this.value;
    },

    getState: function() {
      return {
        type: "select",
        value: this.value
      };
    },

    setState: function(state) {
      if (state && state.type == "select") {
        this.setValue(state.value);
      }
    },

    destroy: function() {
      if (this._compositeState) {
        this.emitCompositeState();
      }
    }
  },
  mounted() {}
};
</script>