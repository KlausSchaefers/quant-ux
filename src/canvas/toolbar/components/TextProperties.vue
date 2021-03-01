
<template>
  <div>
      <div class="MatcToolbarSectionContent" ref="main" />
      <div class="MatcToolbarSectionContent" ref="advanced"/>
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
import ToolbarColor from 'canvas/toolbar/components/ToolbarColor'
import TextShadow from 'canvas/toolbar/components/TextShadow'
import InputDropDownButton from 'canvas/toolbar/components/InputDropDownButton'
import _Tooltip from 'common/_Tooltip'

export default {
    name: 'TextProperties',
    mixins:[_Tooltip, DojoWidget],
    data: function () {
        return {
          fontFamilies: []
        }
    },
    components: {},
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
        this.model = m
      },

      getColorPicker () {
        return this.color
      },

      hasVerticalAlign (has) {
        if (has) {
          css.remove(this.verticalAlign.domNode, 'hidden')
        } else {
           css.add(this.verticalAlign.domNode, 'hidden')
        }
      },

      setValue (style) {

					this.family.setValue(style.fontFamily);
					this.fontSize.setValue(style.fontSize);
					this.fontWeight.setValue(style.fontWeight == "bold");
					this.fontStyle.setValue(style.fontStyle == "italic");
					this.textDecoration.setValue(style.textDecoration == "underline");
					this.color.setValue(style.color);
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

        let content = this.$refs.main
        let advanced = this.$refs.advanced


				this.family = this.$new(ToolbarDropDownButton);
				this.family.setOptions(this.fontFamilies);
				this.family.reposition = true;
				this.addTooltip(this.family.domNode, "Font Family");
				this.own(on(this.family, "change", lang.hitch(this, "setWidgetStyle", "fontFamily")));
				this._placeAt(this.family, content);


				this.fontSize = this.$new(InputDropDownButton);
				this.fontSize.setOptions(["Auto",10,12,14,18,20,24,28,32,40,50,60,70,80,100,120]);
				this.fontSize.reposition = true;
				this.own(on(this.fontSize, "change", lang.hitch(this, "setWidgetStyle", "fontSize")));
				this._placeAt(this.fontSize, content);
				this.addTooltip(this.fontSize.domNode, "Font Size");

				// this.createSpacer(content);


				this.color = this.$new(ToolbarColor, {hasPicker:true, chevron:false});
				this.color.keepOpenOnTypeSelection = "widget";
				this.color.reposition = true;
				this.color.updateLabel = true;
				this.color.setModel(this.model);
				this.color.setLabel('<span class="MatcToolbarColorIndicator"></span>');
				this.own(on(this.color, "change", lang.hitch(this, "setWidgetStyle", "color")));
				this.own(on(this.color, "changing", lang.hitch(this, "setTempWidgetStyle", "color")));
				this._placeAt(this.color, content);
				this.addTooltip(this.color.domNode, "Font Color");


				this.fontWeight= this.$new(ToolbarToggleButton);
				this.fontWeight.setLabel("");
				this.fontWeight.setCss("mdi mdi-format-bold");
				this.own(on(this.fontWeight, "change", lang.hitch(this, "toggleStyle", "fontWeight", "bold")));
				this._placeAt(this.fontWeight, content);
				this.addTooltip(this.fontWeight.domNode, "Bold");

				this.fontStyle = this.$new(ToolbarToggleButton);
				this.fontStyle.setLabel("");
				this.fontStyle.setCss("mdi mdi-format-italic");
				this.own(on(this.fontStyle, "change", lang.hitch(this, "toggleStyle", "fontStyle", "italic")));
				this._placeAt(this.fontStyle, content);
				this.addTooltip(this.fontStyle.domNode, "Italic");

				this.textDecoration = this.$new(ToolbarToggleButton);
				this.textDecoration.setLabel("");
				this.textDecoration.setCss("mdi mdi-format-underline");
				this.own(on(this.textDecoration, "change", lang.hitch(this, "toggleStyle", "textDecoration", "underline")));
				this._placeAt(this.textDecoration, content);
				this.addTooltip(this.textDecoration.domNode, "Underline");

				this.strikeThrough = this.$new(ToolbarToggleButton);
				this.strikeThrough.setLabel('S');
				this.strikeThrough.setCss("MatcToolbarStrikeTrought");
				this.own(on(this.strikeThrough, "change", lang.hitch(this, "toggleStyle", "textDecoration", "line-through")));
				//this._placeAt(this.strikeThrough, content);
				this.addTooltip(this.strikeThrough.domNode, "Strikethrough");

				//this.createSpacer(content);


				this.textAlign = this.$new(ToolbarSelector);
				this.textAlign.setOptions([
					{ value:"left", icon:"mdi mdi-format-align-left"},
						{ value:"center", icon:"mdi mdi-format-align-center"},
						{ value:"right", icon:"mdi mdi-format-align-right"},
						{ value:"justify", icon:"mdi mdi-format-align-justify"}
				]);
				this.own(on(this.textAlign, "change", lang.hitch(this, "setWidgetStyle", "textAlign")));
				this._placeAt(this.textAlign, content);
				this.addTooltip(this.textAlign.domNode, "Text Alignment");

				this.createSpacer(content);


				/**
				* advanced text stuff
				*/


				this.textShadow = this.$new(TextShadow);
				this.textShadow.setModel(this.model)
				this.own(on(this.textShadow, "change", lang.hitch(this, "setWidgetStyle", "textShadow")));
				this._placeAt(this.textShadow, advanced);
				this.addTooltip(this.textShadow.domNode, "Text Shadow");

				this.lineHeight = this.$new(ToolbarDropDownButton);
				this.lineHeight.setOptions([1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6,1.7,1.8,1.9, 2, 2.5, 3]);
				this.lineHeight.setLabel('<span class="mdi mdi-format-line-spacing"></span>');
				this.lineHeight.reposition = true;
				this.lineHeight.updateLabel  =false;
				this.own(on(this.lineHeight, "change", lang.hitch(this, "setWidgetStyle", "lineHeight")));
				this._placeAt(this.lineHeight, advanced);
				this.addTooltip(this.lineHeight.domNode, "Line Height");

				this.letterSpacing = this.$new(ToolbarDropDownButton);
				this.letterSpacing.setOptions([0,1,2,4,5,6,7,8,9,10,20,30]);
				this.letterSpacing.setLabel('<span class="glyphicons glyphicons-text-width"></span>');
				this.letterSpacing.reposition = true;
				this.letterSpacing.updateLabel  =false;
				this.own(on(this.letterSpacing, "change", lang.hitch(this, "setWidgetStyle", "letterSpacing")));
				this._placeAt(this.letterSpacing, advanced);
				this.addTooltip(this.letterSpacing.domNode, "Letter Spacing");

				this.verticalAlign = this.$new(ToolbarDropDownButton);
				this.verticalAlign.setOptions([
				{ value:"top", icon:"mdi mdi-format-vertical-align-top"},
				{ value:"middle", icon:"mdi mdi-format-vertical-align-center"},
				{ value:"bottom", icon:"mdi mdi-format-vertical-align-bottom"},
				]);
				this.verticalAlign.setLabel('<span class="glyphicons glyphicons-text-width"></span>');
				this.verticalAlign.reposition = true;
				this.verticalAlign.updateLabel  = true;
				this.own(on(this.verticalAlign, "change", lang.hitch(this, "setWidgetStyle", "verticalAlign")));
				this._placeAt(this.verticalAlign, advanced);
				this.addTooltip(this.verticalAlign.domNode, "Vertical Align");

      },


			createSpacer (parent){
				var span = document.createElement("span");
				css.add(span,"MatcToolbarSeperator");
				if(!parent){
					this.properties.appendChild(span);
				} else {
					parent.appendChild(span);
				}
				return span;
			},

      _placeAt (w, d) {
        w.placeAt(d)
      },

      setWidgetStyle (key, value) {
        this.emit('change', key, value)
      },

      toggleStyle (key, value) {
        this.emit('toggle', key, value)
      },

      setTempWidgetStyle (key, value) {
        this.emit('changing', key, value)
      }

    },
    mounted () {
    }
}
</script>