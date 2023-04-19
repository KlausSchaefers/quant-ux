
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
      this.elements = [];
      this.icons = [];

      const db = new DomBuilder();
      const elementCount = this.model.props.elementCount;
      const cntr = db.div("MatcWidgetTypeRatingCntr").build();

      for (let i = 0; i < elementCount; i++) {
        const element = db.div("MatcWidgetTypeRatingElement").build(cntr);
        element.style.height = "100%";
        
        const icon = db.span("mdi mdi-star-outline").build(element);
        icon.style.color = style.color;
        
        this.icons.push(icon);
        this.elements.push(element);
      }

      this.removeAllChildren(this.domNode)
      this.domNode.appendChild(cntr);

      this.resize(model);
      this.setValue(model.props.selected - 1)
    },

    resize (model) {
      const elementCount = this.elements.length;
      const w = (model.h / model.w) * 100;
      const m = (100 - w * elementCount) / (elementCount - 1);
      for (let i = 0; i < elementCount; i++) {
        const element = this.elements[i];
        element.style.width = w + "%";
        element.style.left = w * i + m * i + "%";
        const icon = this.icons[i];
        icon.style.fontSize = model.h + "px";
      }
    },

    onSelect (pos, e) {
      this.stopPropagation(e);
      this.setValue(pos);
      this.emitDataBinding(pos + 1);
      this.emitStateChange("select", pos, e);
    },

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue (v) {
      this.setValue((v * 1) - 1);
    },

    setValue (value) {
      // Here is somekind of bug, that sometimes the render() method is
      // called and the this.value is already set, but no 
      // inital rendering was done. Forcing a redraw fixes the issue
      //if (value !== this.value) {
        for (let i = 0; i < this.elements.length; i++) {
          const icon = this.icons[i];
          if (i < value + 1) {
            css.remove(icon, "mdi-star-outline");
            css.add(icon, "mdi-star");
          } else {
            css.add(icon, "mdi-star-outline");
            css.remove(icon, "mdi-star");
          }
        }
        this.value = value;
      //}
    },

    getValue () {
      return this.value;
    },

    getState () {
      return {
        type: "select",
        value: this.value
      };
    },

    setState (state) {
      if (state && state.type == "select") {
        this.setValue(state.value);
      }
    },

    destroy () {
      if (this._compositeState) {
        this.emitCompositeState();
      }
    }
  },
  mounted() {}
};
</script>