
<template>
  <div class="MatcInlineEditable MatcWidgetTypeLabelInlineEditable"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Label",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return  {
      value: "",
      hackValueLabel: false
    };
  },
  components: {},
  methods: {
    postCreate () {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
      this._labelNodes = [this.domNode];
    },

    wireEvents () {
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onClick")));
      this.wireHover()
    },

    onSimulatoStarted () {
      this.isSimulatorStarted = true
      if (this.isAnimated()) {
        if (this.isChatAnimation()) {
          this.startChatAnimation(this.model.props.label, this.animDuration)          
        } else {
          this.startNumberAnimation(this.animMax)
        }
      }
    },

    getLabelNode () {
      return this.domNode;
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      if (this.isAnimated()) {
        this.animCurrent = model.props.min
        this.animMax = model.props.max
        this.animDuration = model.props.duration * 1
      }

      this.setStyle(style, model);
      if (model.props && model.props.label) {
        this.setValue(model.props.label);
      } else {
        this.setValue('');
      }
    },


    /*
     * should be called when the widget was scalled, e.g. by
     */
    updateScale (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model, true);
    },


    /**
    * Build in update scale and just set the font size
     */

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue (v) {
      if (this.isQDate(v)) {
        v = this.convertQDateToString(v);
      } else if (this.isQDateRange(v)) {
        v = this.convertQDateToString(v.from) + ' - ' + this.convertQDateToString(v.to);
      } else if (typeof v === 'object' && !Array.isArray(v) && v !== null) {
        try {
          v = JSON.stringify(v, '  ', 2)
        } catch (err) {
          console.warn('Label._setDataBindingValue() Cannot convert JSON', v)
        }
      }
      this.animIsRunning = false
      if (this.isAnimated() && this.isChatAnimation()) {
        this.startChatAnimation(v, this.animDuration, false)
        return
      }
      if (this.isAnimated() && !isNaN(v)) {
        this.startNumberAnimation(v)
        return
      }
      if (this.model.props && this.model.props.label) {
        const label = this.getLabelValue()
        v = this.replaceVaribale(label, v)
      }
      this.setValue(v);
    },

    getLabelValue () {
      return this.model.props && this.model.props.label
    },

    replaceVaribale (label, value) {
        if (label.indexOf("{0}") >= 0) {
           return label.replace("{0}", value);
        }
        if (label.indexOf("{value}") >= 0) {
           return label.replace("{value}", value);
        }
        return value
    },

    getValue () {
      return this.value;
    },

    setValue (value) {  
      value += "";
      if (this.value != value) {
        this.value = value;
        this.setInnerHTML(this.domNode, value);
      }
    },

    startChatAnimation (txt, animDuration) {
      //console.debug('Label.startChatAnimation() > enter', txt, animDuration, repeat)
      let durationPerChar = 1 / (animDuration * 3);
      const length = txt.length
      const frames = Math.round(durationPerChar * length * 30)
      const framesPerChar = frames / length
      clearTimeout(this.animationRepeat)

      this.animSteps = []
      for (let i = 0; i < frames; i++) {
        const end = Math.floor(i / framesPerChar)
        this.animSteps.push(txt.slice(0, end))
      }
      this.animSteps.push(txt)

      this.animIsRunning = true
      this.runLabelAnimation("", txt)     
    },

    startNumberAnimation (to) {
      const label = this.getLabelValue()
      const diff = to - this.animCurrent
      const frames = (this.animDuration * 30)
      const step = diff / frames
      this.animSteps = []
 
      let x = this.animCurrent
      for (let i = 0; i < frames; i++) {
        this.animSteps.push(Math.round(x))
        x += step
      } 
      this.animSteps.push(to)
      this.animIsRunning = true
      this.runLabelAnimation(label, to)

    },

    runLabelAnimation (label, to, callback) {
        if (!this.animIsRunning) {
          this.animCurrent = to
          return
        }
        if (this.animSteps.length > 0) {
          let value = this.animSteps.shift()
          value = this.replaceVaribale(label, value)
          this.setTextContent(this.domNode, value + "");
          requestAnimationFrame(() => {
              this.runLabelAnimation(label, to, callback)
          })
        } else {
          this.animCurrent = to
          if (callback) {
            callback()
          }
        }
    },

    isAnimated () {
      return this.model && this.model.props.animated
    },

    isChatAnimation () {
      return this.model && this.model.props.animation === 'chat'
    },

    getState () {
      return {
        type: "value",
        value: this.value
      };
    },

    setState (state) {
      /**
       * Hack for the time when we use the getValueLabel() mechnism!
       */
      if (this.hackValueLabel) {
        return;
      }
      if (state && state.type == "value") {
        this.setValue(state.value);
      }
    },

    resize (pos) {
      if (this.style.fontSize === "Auto" || this.style.fontSize === "a") {
        this.domNode.style.fontSize = pos.h * 0.95 + "px";
      }
    },

    _set_fontSize (parent, style) {
      if (style.fontSize === "Auto" || this.style.fontSize === "a") {
        parent.style.fontSize = Math.round(this.model.h * 0.95) + "px";
      } else {
        var size = style.fontSize * this._scaleX;
        if (this._scaleX < 1) {
          size = size * 0.95;
        }
        parent.style.fontSize = Math.round(size) + "px";
      }
    },

    onClick (e) {
      this.stopEvent(e);
      this.emitClick(e);
    },

    beforeDestroy () {
      this._isDestroyed = true
      this.animIsRunning = false
      clearTimeout(this.animationRepeat)
    }

  
   
  },
  mounted() {}
};
</script>