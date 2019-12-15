
<template>
  <div :class="['MatcWidgetTypeScreenSegement', {'MatcWidgetTypeScreenSegementOverFlow': hasOverflow}]">
      Segement
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";
import DomBuilder from 'common/DomBuilder'
// import Core from 'core/Core'
// import lang from 'dojo/_base/lang'

export default {
  name: "ScreenSegment",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
        model: {
            props:{}
        },
        hasXOverFlow: false,
        dataBindingValues: null
    };
  },
  computed: {
    hasOverflow () {
        return true
    }
  },
  methods: {

    postCreate () {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
    },

    setSymbol (s) {
        this.isSymbol = s
    },

    setZoomedModel (m) {
        this.app = m;
    },

    getChildren() {
       return this._childWidgets
    },

    update (widget) {
        this.render(widget, this.style, this._scaleX, this._scaleY)
    },

    render (widget, style, scaleX, scaleY) {
      /**
       * This is super slow for fast rendering, as we will redraw everzthing. We must
       * therefore reuse the items or have some kind of rerender() method if the 
       * isUpdate parameter is set
       */
      this.model = widget;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, widget);

      this.domNode.innerHTML = ""
      this._childWidgets = []
      let db = new DomBuilder()

      if (!this.isSymbol && this.app && widget.children && widget.children.length > 0) {
    
        //let childWidgets = this.getChildWidgets(widget)
   
        // this.domNode.appendChild(cntrDiv)
      } else {
        db.div('MatcWidgetTypeScreenSegementHint', 'Select a screen segment').build(this.domNode)
      }
    },



  },
  mounted() {}
};
</script>