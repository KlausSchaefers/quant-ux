
<template>
  <div class="MatcWidgetTypePaging"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";
import touch from "dojo/touch";
import on from "dojo/on";

export default {
  name: "Paging",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: 0,
      offset: 0
    };
  },
  components: {},
  methods: {
    postCreate () {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
      this._paddingNodes = []
      this._labelNodes = []
    },

    wireEvents () {
      this.wired = true;
      for (var i = 0; i < this.elements.length; i++) {
        let element = this.elements[i]
        this.own(this.addClickListener(element.div ,lang.hitch(this, element.callback, element.value)) );

        this.own(on(element.div, touch.over,lang.hitch(this, "onElementOver", i, element)));
        this.own(on(element.div, touch.out,lang.hitch(this, "onElementOut", i, element)));
      }
      //this.wireHover()
    },

    onElementOver (i, element) {
      if (this.value - 1 === i) {
        return
      }
      if (this.model.hover) {
        let div = element.div
        div.style.color = this.model.hover.color
        div.style.background = this.model.hover.background
      }
    },

    onElementOut (i, element) {
        let div = element.div
        if (element.value !== this.value) {
          div.style.color = this.model.style.color
          div.style.background = this.model.style.background
        } else {
          if (this.model.active) {
            div.style.color = this.model.active.color
            div.style.background = this.model.active.background
          }
        }
    },

    onNext (pos, e) {
      this.stopPropagation(e);
      this.emitClick(e)
      this.offset += this.currentElementCount
      if (this.offset > this.model.props.max - this.currentElementCount) {
        this.offset = this.model.props.max - this.currentElementCount
      }
      this.renderElements(this.model, this.style, this.model.w, this._scaleX)
      this.wireEvents()
    },

    onBack (pos, e) {
      this.stopPropagation(e);
      this.emitClick(e)
      this.offset -= this.currentElementCount
      if (this.offset < 2) {
        this.offset = 0
      }
      this.renderElements(this.model, this.style, this.model.w, this._scaleX)
      this.wireEvents()
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.renderElements(model, style, model.w, scaleX)
    },

    renderElements(model, style, width, scale) {
      var db = new DomBuilder();
      this.elements = [];

      var cntr = db.div("MatcWidgetTypePagingCntr").build();

      let gap = Math.round(8 * scale)+ 'px'
      switch (model.props.justifyContent) {
        case 'left':
          cntr.style.justifyContent = 'flex-start'
          cntr.style.gap = gap
          break;

        case 'right':
          cntr.style.justifyContent = 'flex-end'
          cntr.style.gap = gap
          break

        case 'center':
          cntr.style.justifyContent = 'center'
          cntr.style.gap = gap
          break

        default:
          cntr.style.justifyContent = 'space-between'
          cntr.style.gap = ''
          break

      }


      let elementWidth = this.getZoomed(style.fontSize, scale) * 2
      var elementCount = this.getNumberOfVisibleElements(model, style, width)

      if (this.offset > 0) {
        this.renderElement(db, elementWidth, cntr, '...', 'onBack', model.props.iconBack)
      }

      for (var i = 0; i < elementCount; i++) {
        this.renderElement(db, elementWidth, cntr, this.offset + i + 1, 'onSelect')
      }

      if (elementCount + this.offset < model.props.max) {
        this.renderElement(db, elementWidth, cntr, '...', 'onNext', model.props.iconNext)
      }

      this.removeAllChildren(this.domNode)
      // this.domNode.innerHTML = ""
      this.domNode.appendChild(cntr);

      this.currentElementCount = elementCount
      this.setStyle(style, model);
      this.setValue(model.props.selected)
    },

    renderElement(db, width, cntr, value, callback, icon) {
        var element = db.div("MatcWidgetTypePagingElement").w(width).build(cntr);
        this._borderNodes.push(element)
        this._backgroundNodes.push(element)
        this._paddingNodes.push(element)
        this.elements.push({
          div: element,
          callback: callback,
          value: value
        });
        if (icon) {
          let label = db.span("MatcWidgetTypePagingElementLabel").build(element)
          db.span(icon).build(label)
          this._labelNodes.push(label)
        } else {
          let label = db.span("MatcWidgetTypePagingElementLabel", value).build(element)
          this._labelNodes.push(label)
        }

    },

    resize (box) {
      var elementCount =  this.getNumberOfVisibleElements(this.model, this.style, box.w)
      if (elementCount != this.currentElementCount) {
        this.renderElements(this.model, this.style, box.w, this._scaleX)
      }
    },

    getNumberOfVisibleElements (model, style, width) {
      let elementWidth = this.getZoomed(style.fontSize, this._scaleX) * 2
      let numberofVisibleElements = Math.round((width * 0.9) / elementWidth) - 1
      numberofVisibleElements = Math.min(numberofVisibleElements, model.props.max);
      if (model.props.maxVisisble > 1) {
        numberofVisibleElements = Math.min(numberofVisibleElements, model.props.maxVisisble);
      }
      if (this.offset > 0 ) {
        numberofVisibleElements--
      }
      return numberofVisibleElements
    },

    onSelect (pos, e) {
      /**
       * This could be better and we coudl skip forwards when we are one before the arrow
       */
      this.stopPropagation(e);
      this.emitClick(e);
      this.setValue(pos);
      this.emitDataBinding(pos, 'output');
      this.emitStateChange("select", pos, e);
    },

    /**
     * Can be overwritten by children to have proper type conversion
     */
    setDataBinding (variable, value) {
      var databinding = this.getDataBinding(this.model);
      if (databinding && databinding["output"]) {
        let widgetVarialbe = databinding["output"];
        if (widgetVarialbe === variable) {
          this.setValue(value)
          return true;
        }
      }
      if (databinding && databinding["elements"]) {
        let widgetVarialbe = databinding["elements"];
        if (widgetVarialbe === variable) {
          this.setMax(value)
          return true;
        }
      }
      return false;
    },

    setMax (max) {
      this.model.props.max = max
      this.renderElements(this.model, this.style, this.model.w, this._scaleX)
      this.wireEvents()
    },

    setValue (value) {
        if (this.model.active) {
            let active = this.model.active
            let style = this.model.style
            this.elements.forEach((element) => {
                let div = element.div
                if (element.value == value) {
                    div.style.background = active.background
                    div.style.color = active.color
                } else {
                    div.style.background = style.background
                    div.style.color = style.color
                }
            })
        }
        this.value = value;
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