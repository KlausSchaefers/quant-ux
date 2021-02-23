
<template>
  <div :class="['MatcWidgetTypeScreenSegement', {'MatcWidgetTypeScreenSegementOverFlow': hasOverflow}]">
      Segement
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";
import DomBuilder from 'common/DomBuilder'
import Core from 'core/Core'
import Logger from 'common/Logger'
import lang from 'dojo/_base/lang'

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
        /**
         * FIXME: we shoukd have here some kind of fast rendering!
         */
        this.render(widget, this.style, this._scaleX, this._scaleY)
    },

    updateChild (widget) {
       if (this._childWidgets) {
           let childWidget = this._childWidgets.find(c => c.parent === widget.id)
           if (childWidget) {
               	childWidget.widget.style = widget.style;
				        childWidget.widget.props = widget.props;
                this.factory.setStyle(childWidget.div, childWidget.widget);
           }
       }
    },

    render (widget, style, scaleX, scaleY, isUpdate = false) {
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

      /**
       * Try to avoid rerenders if not needed
       */
      if (isUpdate && widget.props.screenID === this._screenID) {
        this.logger.log(2, 'render', 'exit update > ', widget.props)
        return
      }

      this.domNode.innerHTML = ""
      this._childWidgets = []
      let db = new DomBuilder()

      if (!this.isSymbol && this.app && widget.props.screenID) {
          this.logger.log(2, 'render', 'enter > full render')
          this._screenID = widget.props.screenID
          let screen = this.app.screens[widget.props.screenID]
          if (screen) {

            let core = new Core()
            core.model = this.app

            let parentScreen = core.getParentScreen(widget, this.app)

            let cntr = db
                .div('MatcWidgetTypeScreenSegementCntr')
                .w(screen.w)
                .h(screen.h)
                .build()

            /**
             * Attention: The core.sortedList is somehow reversed... So, we
             * prevent this by passing a new parameter.
             */
            var widgets = core.getSortedScreenChildren(this.app, screen, false)

			      for (let i=0; i< widgets.length; i++){
                let childWidget = widgets[i];
                let copy = lang.clone(childWidget)
                copy.inherited = childWidget.id
                copy.id = childWidget.id + '@' + parentScreen.name
                let div = this.renderWidget(copy, screen, db)
                cntr.appendChild(div)

                let child = {
                    parent: childWidget.id,
                    widget: copy,
                    div: div
                }

                this._childWidgets.push(child)
            }
            this.cntr = cntr
            this.domNode.appendChild(cntr)
          } else {
               db.div('MatcWidgetTypeScreenSegementHint', 'Screen segment does not exist').build(this.domNode)
          }

      } else {
        this._screenID = ''
        db.div('MatcWidgetTypeScreenSegementHint', 'Select a screen segment').build(this.domNode)
      }
    },

    renderWidget (widget, screen, db) {

	    let div = db.div('MatcBox MatcWidget')
                .w(widget.w)
                .h(widget.h)
                .top(widget.y - screen.y)
                .left(widget.x - screen.x)
                .build()

      this.factory.createWidgetHTML(div, widget);
      return div
    }
  },
  mounted() {
      this.logger = new Logger('ScreenSegment')

  }
};
</script>