<template>
  <div class="MatcWidgetTypeTimeLine">

  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget"
import UIWidget from "core/widgets/UIWidget"
import DomBuilder from "common/DomBuilder";

export default {
  name: "Timeline",
  mixins: [DojoWidget, UIWidget],
  data() {
    return {
      value: ''
    }
  },
  components: {},
  methods: {
    postCreate() {
      this._borderNodes = []
      this._backgroundNodes = []
      this._shadowNodes = []
      this._paddingNodes = []
      this._labelNodes = []
      this.nodes = []
      this.icons = []
    },

    wireEvents() {
        this.own(this.addClickListener(this.domNode, e => {
          this.onClick(e)
        }));
        this.wireHover()
    },

    render(model, style, scaleX, scaleY) {
      this.model = model
      this.style = style
      this._scaleX = scaleX
      this._scaleY = scaleY

      let db = new DomBuilder();

      let cntrCSS = 'MatcWidgetTypeTimeLineCntr'
      if (style.elementSpacing === -1) {
        cntrCSS += ' MatcWidgetTypeTimeLineCntrAutoSpace'
      }
      let cntr = db.div(cntrCSS).build()

      db.div('MatcWidgetTypeTimeLineBar')
        .w(Math.round(style.lineWidth * this._scaleY))
        .left(Math.round(((style.circleSize - style.lineWidth) / 2) * this._scaleY))
        .background(style.lineBackground)
        .borderRadius(Math.round(style.lineWidth * this._scaleY) / 2)
        .build(cntr)

      this._labelNodes = []
      this.elementDivs = {}

      let options = model.props.options
      let circleWidth = Math.round(style.circleSize * this._scaleY)
      if (options) {
        options.forEach(opt => {

          let element = db.div('MatcWidgetTypeTimeLineElement').build(cntr)
          if (style.elementSpacing > 0) {
            element.style.marginTop = Math.round(style.elementSpacing * this._scaleY) + 'px'
          }

          let circle = db.div('MatcWidgetTypeTimeLineCircle')
            .w(circleWidth)
            .h(circleWidth)
            .background(style.cicleBackground)
            .borderColor(style.cicleActiveBorderColor)
            .borderWidth(Math.round(style.circleBorderWidth * this._scaleY))
            .build(element)

          let label = db.div('MatcWidgetTypeTimeLineLabel', opt)
            .paddingLeft(Math.round(style.paddingLeft * this._scaleY))
            .build(element)

          this._labelNodes.push(label);

          this.elementDivs[opt] = {
            label: label,
            circle: circle
          }

        })
      }

      this.removeAllChildren(this.domNode)
      this.domNode.appendChild(cntr)
      this.setStyle(style, model)

      if (model.props.selected) {
        this.setValue(model.props.selected)
      }
    },

    getValue() {
      return this.value
    },

    setValue(value) {
      this.value = value

      let style = this.style
      for (let opt in this.elementDivs) {
        let divs = this.elementDivs[opt]
        let cicleBackground = opt !== this.value ? style.cicleBackground : style.cicleActiveBackground
        let cicleBorderColor = opt !== this.value ? style.cicleBorderColor : style.cicleActiveBorderColor
        let circleTextColor = opt !== this.value ? style.color : style.cicleActiveTextColor

        divs.label.style.color = circleTextColor
        divs.circle.style.borderColor = cicleBorderColor
        divs.circle.style.background = cicleBackground
      }

    },

    getState() {
      return {
        type: "all",
        value: {
          selected: this.value
        }
      }
    },

    setState(state) {
      if (state && state.type == "all") {
        this.setValue(state.value.selected)
      }
    },

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue: function(v) {
      var options = this.model.props.options;
      if (options) {
        if (isNaN(v)) {
          var i = options.indexOf(v);
          if (i >= 0 && i < options.length) {
            v = options[i];
            this.setValue(v);
          }
        } else {
          if (v >= 0 && v < options.length) {
            v = options[v];
            this.setValue(v);
          }
        }
      }
    },
  },
  mounted() {}
}
</script>
