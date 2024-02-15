
<template>
  <div class="MatcDesignTokenMixin MatcToolbarPopUpCntr">

    <div type="button" ref="button" class="MatcToolbarItem MatcToolbarIconButton">
      <QIcon icon="ImageFilter" />

      <span class="MatcToolbarItemLabel">{{ label }}</span>

    </div>

    <div class="MatcToolbarPopUp MatcBoxShadowPopup MatcToolbarDropDownButtonPopup" role="menu"
      data-dojo-attach-point="popup" @click.stop="" @mousedown.stop="">
      <div class=" MatcToolbarTabContainer">
        <div class=" MatcToolbarTabs">
          <a class="">Image Filter</a>
        </div>
      </div>
      <div class="MatcShadowSettings">
        <div ref="blurSliderCntr" class="MatcBoxShadowSliderCntr">
          <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Blur</span>
        </div>
        <div ref="opacitySliderCntr" class="MatcBoxShadowSliderCntr">
          <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Opacity</span>
        </div>
        <div ref="hueSliderCntr" class="MatcBoxShadowSliderCntr">
          <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Hue</span>
        </div>
        <div ref="satSliderCntr" class="MatcBoxShadowSliderCntr">
          <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Saturation</span>
        </div>
        <div ref="contrastSliderCntr" class="MatcBoxShadowSliderCntr">
          <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Contrast</span>
        </div>
        <div ref="brightnessSliderCntr" class="MatcBoxShadowSliderCntr">
          <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Brightness</span>
        </div>
        <div ref="graySliderCntr" class="MatcBoxShadowSliderCntr">
          <span class="MatcToolbarPopUpLabel MatcToolbarLabeledColor">Grayscale</span>
        </div>
      </div>
      <div class="MatcToolbarPopupFooter" @click="onRemove">
        <span class="MatcToolbarPopupFooterNone mdi mdi-close-circle"></span>
        <span class="MatcToolbarPopupFooterLabel">No Filter</span>
      </div>
    </div>

  </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import _DropDown from './_DropDown'
import _Color from 'common/_Color'
import ToolbarSlider from './ToolbarSlider'
import QIcon from 'page/QIcon'
export default {
  name: 'ImageFilter',
  mixins: [_Color, DojoWidget, _DropDown],
  data: function () {
    return {
      defaultValue: {
        blur: 0,
        grayscale: 0,
        hueRotate: 0,
        opacity: 100,
        saturate: 100,
        contrast: 100,
        brightness: 100
      },
      label: '',
      value: false,
      tempValue: false,
      reposition: true,
      arrowPosition: "right"
    }
  },
  components: {
    'QIcon': QIcon
  },
  computed: {
  },
  methods: {

    init() {
      if (this.blurSlider) {
        return
      }
      this.blurSlider = this.renderIntBox(this.$refs.blurSliderCntr, 'blur', 50)
      this.graySlider = this.renderIntBox(this.$refs.graySliderCntr, 'grayScale')
      this.opacitySlider = this.renderIntBox(this.$refs.opacitySliderCntr, 'opacity')
      this.hueSlider = this.renderIntBox(this.$refs.hueSliderCntr, 'hueRotate')
      this.brighnessSlider = this.renderIntBox(this.$refs.brightnessSliderCntr, 'brightness', 200)
      this.contrastSlider = this.renderIntBox(this.$refs.contrastSliderCntr, 'contrast', 200)
      this.satSlider = this.renderIntBox(this.$refs.satSliderCntr, 'saturate', 200)

    },

    setTempFilter() {
      this.tempValue = {
        blur: Math.round(this.blurSlider.getValue()),
        opacity: Math.round(this.opacitySlider.getValue()),
        grayscale: Math.round(this.graySlider.getValue()),
        hueRotate: Math.round(this.hueSlider.getValue()),
        brightness: Math.round(this.brighnessSlider.getValue()),
        contrast: Math.round(this.contrastSlider.getValue()),
        saturate: Math.round(this.satSlider.getValue())
      }
      this.emit('changing', this.tempValue)
    },

    setValuesInWidgets(filter) {
      if (this.blurSlider) {
        this.blurSlider.setValue(filter.blur)
        this.graySlider.setValue(filter.grayscale)
        this.opacitySlider.setValue(filter.opacity)
        this.hueSlider.setValue(filter.hueRotate)
        this.brighnessSlider.setValue(filter.brightness)
        this.contrastSlider.setValue(filter.contrast)
        this.satSlider.setValue(filter.saturate)
      }
    },

    renderIntBox(parent, param, max = 100) {
      var input = this.$new(ToolbarSlider, { max: max, min: 0 });
      input.placeAt(parent);
      input.render();
      this.own(on(input, "change", lang.hitch(this, "setIntValue", param)));
      this.own(on(input, "changing", lang.hitch(this, "setTempIntValue", param)));
      return input;
    },

    setIntValue() {
      this.setTempFilter()
    },

    setTempIntValue() {
      this.setTempFilter()
    },

    onVisible() {
      this.tempValue = false
    },

    onResize() {
      this.updatePosition()
    },

    onHide() {
      if (this.tempValue) {
        this.emit('change', this.tempValue)
      }
    },

    onTempChange(v) {
      this.tempValue = v
      this.emit('changing', this.tempValue)
    },

    onRemove(e) {
      this.tempValue = false
      this.stopEvent(e);
      this.onChange(null);
    },

    setValue(v) {
      if (v) {
        this.value = lang.clone(v);
        this.label = 'Filter'
      } else {
        this.value = lang.clone(this.defaultValue)
        this.label = "No Filter"
      }
      this.setValuesInWidgets(this.value)
    }
  },
  mounted() {
    this.init()
  }
}
</script>