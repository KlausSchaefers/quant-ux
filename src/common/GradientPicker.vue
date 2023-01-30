
<template>
  <div class="VommondGradientPicker VommondColorPickerSketch" @click.stop="" @mousedown.stop="">
		<div class="VommondGradientPickerSelectorRow ">
			   <div  class="VommondGradientPickerSelector" data-dojo-attach-point="selector">
				 </div>
         <input data-dojo-attach-point="inputDegree" class="VommondColorPickerNumberInput vommondLineInput MatcIgnoreOnKeyPress" @keyup="onDirectionChange">
    </div>
    <div class="VommondGradientPickerSelectorLabels">
      <span class="VommondGradientPickerGradientLabel">Gradient</span>
      <span>Angle</span>
    </div>

    <div class="VommondGradientPickerMainRow">
      <div data-dojo-attach-point="topLeft"  ></div>
    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import win from "dojo/_base/win";
import on from "dojo/on";
import touch from "dojo/touch";
import domGeom from "dojo/domGeom";
import ColorPickerSketch from "common/ColorPickerSketch";
import DomBuilder from "common/DomBuilder";

export default {
  name: "GradientPicker",
  mixins: [DojoWidget],
  data: function () {
    return {
      defaultValue: {
        colors: [
          { c: "#ffffff", p: 0 },
          { c: "#cccccc", p: 100 },
        ],
        gradient: true,
        direction: 90,
        gradientHeight: 300,
        gradientWidth: 30,
        selectedHandle: 0,
      },
    };
  },
  components: {},
  methods: {
    postCreate () {
      this.colorPicker = this.$new(ColorPickerSketch);
      this.colorPicker.placeAt(this.topLeft);
      this.own(this.colorPicker.on("change", lang.hitch(this, "onColorChange")));
      this.setValue(this.value);
    },

    getValue () {
      return this.value;
    },

    setValue (value, fromParent = false) {
			if (value && value.colors) {
				this.value = lang.clone(value);
			} else {
        this.value = lang.clone(this.defaultValue)
      }
			this._setGradientCSS(this.selector, this.value, true);
			this.setSelectorColor(this.value);
			this.setSelectorPos(this.value);
      this.setDirection(this.value)
      /**
       * TODO: we could call    this.selectHandle(0);. However, this will tricker this method again, and we have an invite loop
       */
      if (fromParent) {
         //this.selectHandle(0);
      }
    },

    setSelectorColor (value) {
      const l = lang.clone(value);
      l.direction = 90;
      this._setGradientCSS(this.selector, l);
    },

    setSelectorPos (gradient) {
      if (!this.selectorButtons) {
        this.selectorButtons = [];
        this.selectorButtonsColor = [];
        this.cleanUpTempListener();
        const db = new DomBuilder();

        this.selector.innerHTML = "";
        for (let i = 0; i < gradient.colors.length; i++) {
          let cntr = db.div("VommondGradientPickerSelectorHandleCntr").build(this.selector);
          let wrapper = db.div("VommondGradientPickerSelectorOuter").build(cntr);
          let handle = db.div("VommondGradientPickerSelectorInner").build(wrapper);

          this.selectorButtons[i] = cntr;
          this.selectorButtonsColor[i] = handle;
          this.tempOwn( on(cntr, touch.press, lang.hitch(this, "onSelectorPress", i)));
        }
				this.tempOwn( on(this.selector, touch.press, lang.hitch(this, "onSelectorClick")));
      }

      for (let i = 0; i < gradient.colors.length; i++) {
        const color = gradient.colors[i];
        this.selectorButtonsColor[i].style.background = color.c;
        this.selectorButtons[i].style.left = color.p  + "%";
      }
    },

		onSelectorClick (e) {
      this.cleanUp()
      this.stopEvent(e);
			const pos = this.getMousePos(e, this.selector);
      const p = Math.min(100, Math.max(0, Math.round((pos.x * 1000) / pos.w) / 10));
			const distanceStart = Math.abs(this.value.colors[0].p - p)
			const distanceEnd = Math.abs(this.value.colors[1].p - p)
			if (distanceStart < distanceEnd) {
				this.value.colors[0].p = p
			} else {
				this.value.colors[1].p = p
			}
			this.setValue(this.value);
			this.onChange()
		},

    onSelectorPress (i, e) {
      this.cleanUp()
      this.stopEvent(e);
      this.selectHandle(i);
      this._touchMoveListner = on(win.body(), touch.move, lang.hitch(this, "onSelectorMove"));
      this._touchReleaseListner = on(win.body(), touch.release,lang.hitch(this, "cleanUp") );
      this.onSelectorMove(e);
    },

    onSelectorMove (e) {
      const pos = this.getMousePos(e, this.selector);
      const p = Math.min(100, Math.max(0, Math.round((pos.x * 1000) / pos.w) / 10));
      if (this.selectedHandle < this.value.colors.length) {
        this.value.colors[this.selectedHandle].p = p;
        this.setValue(this.value);
				this.onChange()
      }
    },

		onChange () {
			this.emit('change', this.value)
		},

    selectHandle  (i) {
      this.selectedHandle = i;
      for (var j = 0; j < this.selectorButtons.length; j++) {
        css.remove( this.selectorButtons[j], "VommondGradientPickerSelectorHandleCntrSelected" );
      }
      css.add(this.selectorButtons[i],"VommondGradientPickerSelectorHandleCntrSelected" );
      var selectedColor = this.value.colors[i];
      this.colorPicker.setValue(selectedColor.c);
    },

    onColorChange (c) {
      if (this.selectedHandle < this.value.colors.length) {
        this.value.colors[this.selectedHandle].c !== c;
        this.value.colors[this.selectedHandle].c = c;
        this.setValue(this.value);
      }
			this.onChange()
    },

    setLabel () {
      //this.label.innerHTML=label;
    },

    setDirection (value) {
      this.inputDegree.value = value.direction
    },

    onDirectionChange () {
      this.value.direction = this.inputDegree.value;
      this.setValue(this.value);
      this.onChange()
    },

    cleanUp  () {
      if (this._touchMoveListner) {
        this._touchMoveListner.remove();
      }
      if (this._touchReleaseListner) {
        this._touchReleaseListner.remove();
      }
      this._touchReleaseListner = null;
      this._touchMoveListner = null;
    },

    getMousePos (evt, div) {
      const pos = domGeom.position(div);
      return {
        x: evt.clientX - pos.x,
        y: evt.clientY - pos.y,
        w: pos.w,
        h: pos.y,
      };
    },

    _setGradientCSS (node, gradient, useDir = false) {
      const direction = useDir ? gradient.direction : "0";
      let value = "(" + direction + "deg";
      const sortedColors = gradient.colors.slice()
      sortedColors.sort((a, b) => {
        return a.p - b.p
      })
      for (let i = 0; i < sortedColors.length; i++) {
        const color = sortedColors[i];
        value += "," + color.c + " " + color.p + "% ";
      }
      value + ");";
      node.style.background = "linear-gradient" + value;
      node.style.background = "-webkit-linear-gradient" + value;
    },

    onParentClose () {
      this.cleanUp()
      if (this.colorPicker) {
        this.colorPicker.onParentClose()
      }
    }
  },
  mounted() {

	}
};
</script>