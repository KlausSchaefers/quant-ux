
<template>
  <div
    :class="['MatcWidgetTypeScreenSegement', { 'MatcWidgetTypeScreenSegementOverFlow': hasOverflow }, { 'MatcWidgetTypeScreenSegementSnapp': hasSnapp }]">

  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";
import DomBuilder from 'common/DomBuilder'
import Core from 'core/Core'
import Logger from 'common/Logger'
import lang from 'dojo/_base/lang'
import * as ScrollUtil from '../../util/ScrollUtil'

export default {
  name: "ScreenSegment",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      model: {
        props: {}
      },
      hasXOverFlow: false,
      dataBindingValues: null
    };
  },
  computed: {
    hasOverflow() {
      return true
    },
    hasSnapp() {
      return this.model?.props?.snapp === true
    }
  },
  methods: {

    postCreate() {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
    },

    wireEvents() {
      if (this.domNode) {
        /**
         * In Simulator mode we add scroll hacks if needed
         */
        ScrollUtil.addScrollIfNeeded(this.domNode, false)
      }
    },

    setSymbol(s) {
      this.isSymbol = s
    },

    setZoomedModel(m) {
      this.app = m;
    },

    getChildren() {
      return this._childWidgets
    },

    getDataBindingChildren() {
      return this._childWidgets
    },

    update(widget) {
      /**
       * FIXME: we shoukd have here some kind of fast rendering!
       */
      this.render(widget, this.style, this._scaleX, this._scaleY)
    },

    updateChild(widget) {
      if (this._childWidgets) {
        let childWidget = this._childWidgets.find(c => c.parent === widget.id)
        if (childWidget) {
          childWidget.widget.style = widget.style;
          childWidget.widget.props = widget.props;
          this.factory.setStyle(childWidget.div, childWidget.widget);
        }
      }
    },

    render(widget, style, scaleX, scaleY) {

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

  

      if (!this.isSymbol && this.app && widget.props.screenID) {
        this.logger.log(2, 'render', 'enter > full render')
        this.renderScreen(widget, widget.props.screenID)
      } else {
        this._screenID = ''
        const db = new DomBuilder()
        db.div('MatcWidgetTypeScreenSegementHint', 'Select a screen segment').build(this.domNode)
      }
    },

    renderScreen(widget, screenID) {

      const db = new DomBuilder()
      const screen = this.app.screens[screenID]
      if (screen) {

        const core = new Core()
        core.model = this.app

        /**
         * Attention: The core.sortedList is somehow reversed... So, we
         * prevent this by passing a new parameter.
         */
        const widgets = core.getSortedScreenChildren(this.app, screen, false)
        if (this.childrenAreModified(widgets)) {
          this.logger.log(-1, 'renderScreen', 'Exit because ne change')
          return
        }
        this.logger.log(-1, 'renderScreen', 'Start rendering')
       
        this._screenID = screenID
        this.domNode.innerHTML = ""
        this._childWidgets = [] 

        const parentScreen = core.getParentScreen(widget, this.app)

        const cntr = db
          .div('MatcWidgetTypeScreenSegementCntr')
          .w(screen.w)
          .h(screen.h)
          .build()

        this._childLastModified = {}
        for (let i = 0; i < widgets.length; i++) {
          const childWidget = widgets[i];
          this._childLastModified[childWidget.id] = childWidget.modified
          const copy = lang.clone(childWidget)
          copy.inherited = childWidget.id
          copy.id = childWidget.id + '@' + parentScreen?.name

          const div = this.renderWidget(copy, screen, db)
          cntr.appendChild(div)

          const child = {
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
    },

    childrenAreModified (widgets) {
        if (this._childLastModified) {
          const modified = widgets.filter(w => {
            return this._childLastModified[w.id] !== w.modified
          })
          if (modified.length === 0) {
            return true
          }
        }
      return false
    },

    renderWidget(widget, screen, db) {
      const div = db.div('MatcBox MatcWidget')
        .w(widget.w)
        .h(widget.h)
        .top(widget.y - screen.y)
        .left(widget.x - screen.x)
        .build()

      this.factory.createWidgetHTML(div, widget);

      return div
    },

    setValue(value) {
      const newScreen = Object.values(this.app.screens).find(s => s.name === value)
      if (newScreen) {
        this.renderScreen(this.model, newScreen.id)
        this.emit('rerender', this)
      } else {
        this.logger.error('setValue', 'Screen with name ' + value + ' does not exist')
        this.renderScreen(this.model, this.model?.props?.screenID)
      }
    }
  },
  mounted() {
    this.logger = new Logger('ScreenSegment')
  }
};
</script>