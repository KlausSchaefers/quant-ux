
<template>
  <div class="MatcWidgetTypePaging"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Paging",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: 0
    };
  },
  components: {},
  methods: {
    postCreate: function() {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
      this._paddingNodes = []
      this._labelNodes = []
    },

    wireEvents: function() {
      this.wired = true;
      for (var i = 0; i < this.elements.length; i++) {
        this.own(this.addClickListener(this.elements[i],lang.hitch(this, "onSelect", i + 1)) );
      }
    },

    render: function(model, style, scaleX, scaleY) {
      console.debug('render', model)
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      var db = new DomBuilder();
      this.elements = [];
      var elementCount = this.model.props.max;
      var cntr = db.div("MatcWidgetTypePagingCntr").build();

      for (var i = 0; i < elementCount; i++) {
        var element = db.div("MatcWidgetTypePagingElement").build(cntr);
        let label = db.span("MatcWidgetTypePagingElementLabel", i + 1).build(element)
        this.elements.push(element);
        this._borderNodes.push(element)
        this._backgroundNodes.push(element)
        this._paddingNodes.push(element)
        this._labelNodes.push(label)
      }

      this.domNode.innerHTML = ""
      this.domNode.appendChild(cntr);

      this.setStyle(style, model);
      this.resize(model);
      console.debug('renderEnd', model.props.selected)
      this.setValue(model.props.selected)
    },

    resize () {
    },

    onSelect: function(pos, e) {
      this.stopPropagation(e);
      this.setValue(pos);
      this.emitDataBinding(pos);
      this.emitStateChange("select", pos, e);
    },

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue: function(v) {
      this.setValue(v);
    },


    setValue: function(value) {
        if (this.model.active) {
            let active = this.model.active
            let style = this.model.style
            this.elements.forEach((element, i) => {
                if (i + 1 == value) {
                    element.style.background = active.background
                    element.style.color = active.color
                } else {
                    element.style.background = style.background
                    element.style.color = style.color
                }
            })
        }
        this.value = value;
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