
<template>
  <div></div>
</template>
<script>
/**
 *
		this.paddingProperties = ["paddingBottom", "paddingLeft", "paddingRight", "paddingTop", "padding"]

		this.borderProperties = [
			'borderWidth', 'border', 'borderRadius', 'boderColor',
			'borderBottomColor', 'borderTopColor', 'borderLeftColor', 'borderRightColor',
			'borderTopStyle', 'borderBottomStyle', 'borderRightStyle', 'borderLeftStyle',
			'borderBottomWidth', 'borderTopWidth', 'borderLeftWidth', 'borderRightWidth',
			'borderBottomLeftRadius', 'borderTopLeftRadius', 'borderBottomRightRadius', 'borderTopRightRadius'
		]

		this.borderColorProperties = ['borderBottomColor', 'borderTopColor', 'borderLeftColor', 'borderRightColor']
		this.borderWidthProperties = ['borderBottomWidth', 'borderTopWidth', 'borderLeftWidth', 'borderRightWidth']
		this.borderStyleProperties = ['borderTopStyle', 'borderBottomStyle', 'borderRightStyle', 'borderLeftStyle']
		this.borderRadiusProperties = ['borderBottomLeftRadius', 'borderTopLeftRadius', 'borderBottomRightRadius', 'borderTopRightRadius']

		this.textProperties = [
			'color', 'textDecoration', 'textAlign', 'fontFamily',
			'fontSize', 'fontStyle', 'fontWeight', 'letterSpacing', 'lineHeight'
		]

		this.isPixel = {
			"borderBottomLeftRadius": true,
			"borderBottomRightRadius": true,
			"borderTopRightRadius": true,
			"borderTopLeftRadius": true,

			"borderBottomWidth": true,
			"borderLeftWidth": true,
			"borderTopWidth": true,
			"borderRightWidth": true,

			"paddingBottom": true,
			"paddingLeft": true,
			"paddingRight": true,
			"paddingTop": true,

			"fontSize": true
		}


    this.fontProperties = ['color', 'fontSize', 'fontWeight', 'textAlign', 'fontStyle', 'letterSpacing', 'lineHeight']

 */

export default {
  name: "CSSMixin",
  mixins: [],
  data: function () {
  },
  components: {},
  computed: {
    padding () {
      return ''
    },
    border () {
      let s = this.style
      return `borderBottomColor: ${s.borderBottomColor};
              borderTopColor: ${s.borderTopColor};
              borderLeftColor: ${s.borderLeftColor};
              borderRightColor: ${s.borderRightColor};

              borderTopStyle: ${s.borderTopStyle};
              borderBottomStyle: ${s.borderBottomStyle};
              borderRightStyle: ${s.borderRightStyle};
              borderLeftStyle: ${s.borderLeftStyle};

              borderBottomWidth: ${this.getZoomed(s.borderBottomWidth)};
              borderTopWidth: ${this.getZoomed(s.borderTopWidth)};
              borderLeftWidth: ${this.getZoomed(s.borderLeftWidth)};
              borderRightWidth: ${this.getZoomed(s.borderRightWidth)};

              borderBottomLeftRadius: ${this.getZoomed(s.borderBottomLeftRadius)};
              borderTopLeftRadius: ${this.getZoomed(s.borderTopLeftRadius)};
              borderBottomRightRadius: ${this.getZoomed(s.borderBottomRightRadius)};
              borderTopRightRadius: ${this.getZoomed(s.borderTopRightRadius)};`
    },
    background () {
      var background = this.style.background;
		  if (background && background.colors) {
        var value = "(" + background.direction + "deg";
        for (var i = 0; i < background.colors.length; i++) {
          var color = background.colors[i];
          value += "," + color.c + " " + color.p + "% ";
        }
        value + ");";
        return `background: linear-gradient ${value}`;

      } else {
        return `backgroundColor:${background};`
      }
    },
    font () {
      let s = this.style
      return `color: ${s.color};
              fontSize:${this.getFontSize(this.qWidget, s)};
              lineHeight:${s.lineHeight};
              fontFamily:${s.fontFamily};
              letterSpacing: ${s.letterSpacing};
              textAlign: ${s.textAlign}
              fontWeight:${s.fontWeight};`
    },
    verticalAlign () {
      let s = this.style
      if (s.verticalAlign) {
        if (s.textAlign) {
          return "MatcInlineEditVAlign-" + s.verticalAlign + "-" + s.textAlign;
        } else {
          return "MatcInlineEditVAlign-" + s.verticalAlign;
        }
      }
      return ''
    }
  },
  methods: {
    getZoomed (v) {
      if (v!= undefined && v!== null) {
        return v * this.qZoom + 'px'
      }
      return ''
    },
    getDefault(key, value) {
      if (value !== undefined) {
        return `${key}:${value};`;
      }
      return ''
    },
    getFontSize (model, style) {
      if (style.fontSize === "Auto" || style.fontSize === "a") {
        return model.h * 0.95 + "px";
      } else {
        var size = style.fontSize * this.qZoom;
        if (this.qZoom < 1) {
          size = size * 0.95;
        }
        return size + "px";
      }
    }
  }
};
</script>