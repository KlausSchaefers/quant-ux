
<template>
	<div class="MatcDesignTokenMixin">
		  <div class="MatcToolbarSectionContent" v-show="hasDesignToken">
				<DesignTokenView class="MatcToolbarItem"  :designtoken="currentDesignToken"/>
		  </div>
		  <div v-show="!hasDesignToken" class="MatcTextProperties">
			  <div class="MatcToolbarSectionContent" ref="row1" />
			  <div class="MatcToolbarSectionContent" ref="row2" />
			  <div class="MatcToolbarSectionContent" ref="row3" />
			  <div class="MatcToolbarSectionContent" ref="row4"/>
		  </div>
  </div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import css from 'dojo/css'
import ToolbarDropDownButton from 'canvas/toolbar/components/ToolbarDropDownButton'
import ToolbarSelector from 'canvas/toolbar/components/ToolbarSelector'
import ToolbarToggleButton from 'canvas/toolbar/components/ToolbarToggleButton'
import TextShadow from 'canvas/toolbar/components/TextShadow2'
import InputDropDownButton from 'canvas/toolbar/components/InputDropDownButton'
import _Tooltip from 'common/_Tooltip'
import _DesignToken from './_DesignToken'
import DesignTokenView from './DesignTokenView'

export default {
  name: 'TextProperties',
  props:['isChildDropDown'],
  mixins:[_Tooltip, _DesignToken, DojoWidget],
  data: function () {
	  return {
		fontFamilies: []
	  }
  },
  components: {
	  'DesignTokenView': DesignTokenView
  },
  computed: {
  },
  methods: {

	setFontFamilies (families) {
	  this.fontFamilies = families
	  if (this.family){
		  this.family.setOptions(this.fontFamilies);
	  }
	},

	setModel (m) {
		  if (this.color) {
			  this.color.setModel(m)
		  }
	  this.model = m
	},

	getColorPicker () {
	  return this.color
	},

	hasVerticalAlign () {
	  // if (has) {
	  //   css.remove(this.verticalAlign.domNode, 'hidden')
	  // } else {
	  //    css.add(this.verticalAlign.domNode, 'hidden')
	  // }
	},

	setValue (style) {

		  this.family.setValue(style.fontFamily);
		  this.fontSize.setValue(style.fontSize);
		  this.fontWeight.setValue(style.fontWeight == "bold");
		  this.fontStyle.setValue(style.fontStyle == "italic");
		  this.textDecoration.setValue(style.textDecoration == "underline");
		  this.textAlign.setValue(style.textAlign);

		  this.textShadow.setValue(style.textShadow);
		  this.lineHeight.setValue(style.lineHeight);
		  this.letterSpacing.setValue(style.letterSpacing);
		  this.strikeThrough.setValue(style.textDecoration == "line-through");

		  if(style.verticalAlign){
			  this.verticalAlign.setValue(style.verticalAlign);
		  } else {
			  this.verticalAlign.setValue("top");
		  }
	},

	postCreate() {

	  const row1 = this.$refs.row1
	  const row2 = this.$refs.row2
	  const row3 = this.$refs.row3
	  const row4 = this.$refs.row4


	  this.family = this.$new(ToolbarDropDownButton);
	  this.family.setOptions(this.fontFamilies);
	  this.family.reposition = true;
	  this.family.isChildDropDown = this.isChildDropDown
	  css.add(this.family.domNode, 'MatcTextPropertiesFontFamily')
	  this.addTooltip(this.family.domNode, "Font Family");
	  this.own(on(this.family, "change", lang.hitch(this, "setWidgetStyle", "fontFamily")));
	  this._placeAt(this.family, row1);


	  this.fontSize = this.$new(InputDropDownButton);
	  this.fontSize.setOptions(["Auto",10,12,14, 16, 20,24,28,32,40,50,60,70,80,100,120]);
	  css.add(this.fontSize.domNode, 'MatcTextPropertiesFontSize')
	  this.fontSize.reposition = true;
	  this.fontSize.isChildDropDown = this.isChildDropDown
	  this.own(on(this.fontSize, "change", lang.hitch(this, "setWidgetStyle", "fontSize")));
	  this._placeAt(this.fontSize, row1);
	  this.addTooltip(this.fontSize.domNode, "Font Size");

	  this.fontWeight= this.$new(ToolbarToggleButton, {icon: 'TextBold'});
	  this.fontWeight.setLabel("");
	  this.own(on(this.fontWeight, "change", lang.hitch(this, "toggleStyle", "fontWeight", "bold")));
	  this._placeAt(this.fontWeight, row2);
	  this.addTooltip(this.fontWeight.domNode, "Bold");

	  this.fontStyle = this.$new(ToolbarToggleButton, {icon: 'TextItalic'});
	  this.fontStyle.setLabel("");
	  this.own(on(this.fontStyle, "change", lang.hitch(this, "toggleStyle", "fontStyle", "italic")));
	  this._placeAt(this.fontStyle, row2);
	  this.addTooltip(this.fontStyle.domNode, "Italic");

	  this.textDecoration = this.$new(ToolbarToggleButton, {icon: 'TextUnderline'});
	  this.textDecoration.setLabel("");
	  this.own(on(this.textDecoration, "change", lang.hitch(this, "toggleStyle", "textDecoration", "underline")));
	  this._placeAt(this.textDecoration, row2);
	  this.addTooltip(this.textDecoration.domNode, "Underline");

	  this.strikeThrough = this.$new(ToolbarToggleButton, {icon: 'TextStrike'});
	  this.strikeThrough.setLabel('');
	  this.own(on(this.strikeThrough, "change", lang.hitch(this, "toggleStyle", "textDecoration", "line-through")));
	  this._placeAt(this.strikeThrough, row2);
	  this.addTooltip(this.strikeThrough.domNode, "Strikethrough");

	  this.textAlign = this.$new(ToolbarSelector);
	  this.textAlign.setOptions([
		  { value:"left", icon:"TextAlignLeft"},
		  { value:"center", icon:"TextAlignCenter"},
		  { value:"right", icon:"TextAlignRight"},
		  { value:"justify", icon:"TextAlignJustify"}
	  ]);
	  this.own(on(this.textAlign, "change", lang.hitch(this, "setWidgetStyle", "textAlign")));
	  this._placeAt(this.textAlign, row3);
	  this.addTooltip(this.textAlign.domNode, "Text Alignment");



	  /**
	  * advanced text stuff
	  */

	  this.letterSpacing = this.$new(ToolbarDropDownButton, {hasCaret:false, icon: 'TextLetterSpacing'});
	  this.letterSpacing.setOptions([0,1,2,4,5,6,7,8,9,10,20,30]);
	  //this.letterSpacing.setLabel('<span class="mdi mdi-format-text-rotation-none"></span>');
	  this.letterSpacing.reposition = true;
	  this.letterSpacing.updateLabel  =false;
	  this.letterSpacing.isChildDropDown = this.isChildDropDown
	  this.own(on(this.letterSpacing, "change", lang.hitch(this, "setWidgetStyle", "letterSpacing")));
	  this._placeAt(this.letterSpacing, row4);
	  this.addTooltip(this.letterSpacing.domNode, "Letter Spacing");

	  this.lineHeight = this.$new(ToolbarDropDownButton, {hasCaret:false, icon:"TextLineHeight"});
	  this.lineHeight.setOptions([1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6,1.7,1.8,1.9, 2, 2.5, 3]);
	  //this.lineHeight.setLabel('<span class="mdi mdi-format-line-spacing"></span>');
	  this.lineHeight.reposition = true;
	  this.lineHeight.updateLabel  =false;
	  this.lineHeight.isChildDropDown = this.isChildDropDown
	  this.own(on(this.lineHeight, "change", lang.hitch(this, "setWidgetStyle", "lineHeight")));
	  this._placeAt(this.lineHeight, row4);
	  this.addTooltip(this.lineHeight.domNode, "Line Height");

  

	  this.textShadow = this.$new(TextShadow, {hasCaret:false});
	  this.textShadow.setModel(this.model)
	  this.textShadow.isChildDropDown = this.isChildDropDown
	  this.own(on(this.textShadow, "change", lang.hitch(this, "setWidgetStyle", "textShadow")));
	  this.own(on(this.textShadow, "changing", lang.hitch(this, "setTempWidgetStyle", "textShadow")));
	  this._placeAt(this.textShadow, row4);
	  this.addTooltip(this.textShadow.domNode, "Text Shadow");

	  this.verticalAlign = this.$new(ToolbarDropDownButton, {hasCaret:false});
	  this.verticalAlign.setOptions([
		  { value:"top", icon:"TextAlignTop"},
		  { value:"middle", icon:"TextAlignMiddle"},
		  { value:"bottom", icon:"TextAlignBottom"},
	  ]);
	  //this.verticalAlign.setLabel('<span class="mdi mdi-format-vertical-align-top"></span>');
	  this.verticalAlign.reposition = true;
	  this.verticalAlign.updateLabel  = true;
	  this.verticalAlign.isChildDropDown = this.isChildDropDown
	  this.own(on(this.verticalAlign, "change", lang.hitch(this, "setWidgetStyle", "verticalAlign")));
	  this._placeAt(this.verticalAlign, row4);
	  this.addTooltip(this.verticalAlign.domNode, "Vertical Align");

	},

  addTooltip () {
  // disable
  },

  _placeAt (w, d) {
	  w.placeAt(d)
  },

  setWidgetStyle (key, value) {
	  this.emit('change', key, value)
  },

  setTempWidgetStyle (key, value) {
	  this.emit('changing', key, value)
  },

  toggleStyle (key, value) {
	  this.emit('toggle', key, value)
  }

  },
  mounted () {
  }
}
</script>