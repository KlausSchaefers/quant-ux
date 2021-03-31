import * as Color from './ColorUtil'
import CSSOptimizer from './CSSOptimizer'
import Logger from '../Logger'
class CSSFactory {

	constructor () {
		Logger.log(4, 'CSSFactory.constructor() ')
		this.marginWhiteSpaceCorrect = 0

		this.mapping = {

			"color" : "color",
			"textAlign" : "text-align",
			"fontFamily" : "font-family",
			"fontSize" : "font-size",
			"fontStyle" : "font-style",
			"fontWeight" : "font-weight",
			"letterSpacing" : "letter-spacing",
			"lineHeight" : "line-height",

			"border": "border",
			"borderWidth": "border-width",
			"borderStyle": "border-style",
			"borderColor": "border-color",
			"borderRadius": "border-radius",
			"borderLeft": "border-left",
			"borderRight": "border-right",
			"borderTop": "border-top",
			"borderBottom": "border-bottom",

			"borderBottomColor" : "border-bottom-color",
			"borderTopColor" : "border-top-color",
			"borderLeftColor" : "border-left-color",
			"borderRightColor" : "border-right-color",

			"borderBottomLeftRadius" : "border-bottom-left-radius",
			"borderTopLeftRadius" : "border-top-left-radius",
			"borderBottomRightRadius" : "border-bottom-right-radius",
			"borderTopRightRadius" : "border-top-right-radius",

			"borderBottomWidth" : "border-bottom-width",
			"borderTopWidth" : "border-top-width",
			"borderLeftWidth" : "border-left-width",
			"borderRightWidth" : "border-right-width",

			"borderTopStyle" : "border-top-style",
			"borderBottomStyle" : "border-bottom-style",
			"borderRightStyle" : "border-left-style",
			"borderLeftStyle" : "border-right-style",

			"paddingBottom" : "padding-bottom",
			"paddingLeft" : "padding-left",
			"paddingRight" : "padding-right",
			"paddingTop" : "padding-top",
			"padding": "padding",

			//"marginBottom" : "margin-bottom",
			//"marginLeft" : "margin-left",
			//"marginRight" : "margin-right",
			//"marginTop": "margin-top",

			"textDecoration" : "text-decoration",
			"boxShadow" : "box-shadow",
			"textShadow" : "text-shadow",

			"opacity": "opacity",

			"cursor": "cursor"
		}

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

			"fontSize": true,

			"letterSpacing": true
		}


		this.easingMapping = {
			'easeInQuad': 'ease-in',
			'easeOutQuad': 'ease-out',
			'linear': 'linear',
			'easeInOutQuad': 'ease-in-out',
			'easeElasticIn': 'ease-in',
			'easeElasticOut': 'ease-out',
			'easeBounceIn': 'ease-in',
			'easeBounceOut': 'ease-out',
		}

		this.fontProperties = ['color', 'fontSize', 'fontWeight', 'textAlign', 'fontStyle', 'letterSpacing', 'lineHeight']

	}


	create (boxes, model) {
		var result = "";
		boxes.forEach(box => {
			result += this.getCSS(box)
		})
		if (boxes.filter(box => box.template !== undefined).length > 0) {
			result += '/*\n Component Style\n */\n\n'
			boxes.forEach(box => {
				if (box.template && model.templates && model.templates[box.template]) {
					let template = model.templates[box.template]
					result += this.getCSS(template, '', '')
				}
			})
		}
		/**
		 * FIXME: add designTokens
		 */


		return result;
	}

	getSelector(widget, prefix ='', postfix ='') {
		return prefix + this.getName(widget) + postfix
	}

	getName(box){
		let name = box.name.replace(/\s+/g, '_')
		if (box.inherited) {
			name += '_Master'
		}
		if (this.prefix) {
			name = `${this.prefix}_${name}`
		}
		return name
	}


	getCSS (widget, prefix ='', postfix ='') {

		widget = this.clone(widget)
		widget = CSSOptimizer.get(widget)
		var result = "";

		var style = widget.style;
		style = this.fixAutos(style, widget)

		let selector = this.getSelector(widget, prefix, postfix);

			/**
			 * Add normal css
			 */
			result += selector + ' {\n'
			result += this.getRawStyle(style, widget);
			result += '}\n\n'

			if (widget.hover) {
				result += selector + ':hover {\n'
				result += '  transition: all 0.2s;\n'
				result += this.getRawStyle(widget.hover, widget);
				result += '}\n\n'
			}

			if (widget.focus) {
				result += selector + ':focus {\n'
				result += this.getRawStyle(widget.focus, widget);
				result += '}\n\n'
			}

			if (widget.error) {
				result += selector + ':invalid {\n'
				result += this.getRawStyle(widget.error, widget);
				result += '}\n\n'
			}

			if (widget.active) {
				result += selector + '.qux-active {\n'
				result += this.getRawStyle(widget.active, widget);
				result += '}\n\n'
			}

			if (this.isInputElement(widget)) {
				result += selector + '::placeholder {\n'
				result += `  color: ${this.getPlaceHolderColor(style.color)};\n`
				result += '}\n\n'
			}



		/**
		 * Animation
		 */
		if (screen && screen.animation && screen.animation.ScreenLoaded) {
			let animation = screen.animation.ScreenLoaded

			if (widget.id in animation.widgets) {
				let widgetAnimation = animation.widgets[widget.id]
				if (widgetAnimation) {
					result += this.getAnimation(widgetAnimation, selector, widget, screen)
				}
			}

			if (widget.isGroup && widget.groupId in animation.groups) {
				let groupAnimation = animation.groups[widget.groupId]
				if (groupAnimation) {
					result += this.getAnimation(groupAnimation, selector, widget, screen)
				}
			}
		}

		return result
	}


	getAnimation (animation, selector, widget) {
		let result = ''

		let total = animation.delay + animation.duration
		let delay = Math.round((animation.delay / (total)) * 100)
		let animId = `${widget.id}-anim-load`
		let easing = animation.easing ? this.getEasing(animation.easing) : 'linear'

		if (animation.type === 'fadeIn') {
			result +=  `@keyframes ${animId}{\n`
			result += '  0% { opacity:0; }\n'
			result += `  ${delay}% { opacity: 0;}\n`
			result += `  100% { opacity: 1;}\n`
			result += '}\n\n'
		}

		if (animation.type === 'fadeOut') {
			result +=  `@keyframes ${animId}{\n`
			result += '  0% { opacity:1; }\n'
			result += `  ${delay}% { opacity: 1;}\n`
			result += `  100% { opacity: 0;}\n`
			result += '}\n\n'
		}

		if (animation.type === 'zoomIn') {
			result +=  `@keyframes ${animId}{\n`
			result += '  0% { transform:scale(0, 0); transform-origin: 50% 50%;}\n'
			result += `  ${delay}% { transform:scale(0, 0); transform-origin: 50% 50%;}\n`
			result += `  100% { transform:scale(1, 1); transform-origin: 50% 50%;}\n`
			result += '}\n\n'
		}

		if (animation.type === 'fadeOut') {
			result +=  `@keyframes ${animId}{\n`
			result += '  0% { opacity:1; }\n'
			result += `  ${delay}% {opacity: 1;}\n`
			result += `  100% {opacity: 0;}\n`
			result += '}\n\n'
		}

		if (animation.type === 'growRight') {
			result +=  `@keyframes ${animId}{\n`
			result += '  0% { transform:scale(0, 1); transform-origin: top left;}\n'
			result += `  ${delay}% { transform:scale(0, 1); transform-origin: top left;}\n`
			result += `  100% { transform:scale(1, 1); transform-origin: top left;}\n`
			result += '}\n\n'
		}

		if (animation.type === 'growLeft') {
			result +=  `@keyframes ${animId}{\n`
			result += '  0% { transform:scale(0, 1); transform-origin: top right;}\n'
			result += `  ${delay}% {transform:scale(0, 1); transform-origin: top right;}\n`
			result += `  100% { transform:scale(1, 1); transform-origin: top right;}\n`
			result += '}\n\n'
		}

		if (animation.type === 'growUp') {
			result +=  `@keyframes ${animId}{\n`
			result += '  0% { transform:scale(1, 0); transform-origin: bottom right;}\n'
			result += `  ${delay}% {transform:scale(1, 0); transform-origin: bottom right;}\n`
			result += `  100% { transform:scale(1, 1); transform-origin: bottom right;}\n`
			result += '}\n\n'
		}

		if (animation.type === 'growDown') {
			result +=  `@keyframes ${animId}{\n`
			result += '  0% { transform:scale(1, 0); transform-origin: top right;}\n'
			result += `  ${delay}% {transform:scale(1, 0); transform-origin: top right;}\n`
			result += `  100% { transform:scale(1, 1); transform-origin: top right;}\n`
			result += '}\n\n'
		}


		/**
		 * Use calc(100vh) and so?
		 */
		if (animation.type === 'slideRight') {
			result +=  `@keyframes ${animId}{\n`
			result += '  0% { transform: translateX(-1000px) }\n'
			result += `  ${delay}% { transform: translateX(-1000px); }\n`
			result += `  100% { transform:translateX(0); }\n`
			result += '}\n\n'
		}

		if (animation.type === 'slideLeft') {
			result +=  `@keyframes ${animId}{\n`
			result += '  0% { transform: translateX(1000px) }\n'
			result += `  ${delay}% { transform: translateX(1000px); }\n`
			result += `  100% {transform:translateX(0); }\n`
			result += '}\n\n'
		}

		if (animation.type === 'slideDown') {
			result +=  `@keyframes ${animId}{\n`
			result += '  0% { transform: translateY(-1000px) }\n'
			result += `  ${delay}% { transform: translateY(-1000px); }\n`
			result += `  100% {transform:translateY(0); }\n`
			result += '}\n\n'
		}


		if (animation.type === 'slideUp') {
			result +=  `@keyframes ${animId}{\n`
			result += '  0% { transform: translateY(1000px) }\n'
			result += `  ${delay}% { transform: translateY(1000px); }\n`
			result += `  100% {transform:translateY(0); }\n`
			result += '}\n\n'
		}


		result += selector + ' {\n'
		result += `  animation-fill-mode: forwards;\n`
		result += `  animation-name:${animId};\n`
		result += `  animation-duration:${total}ms;\n`
		result += `  animation-timing-function:${easing};\n`
		result += '}\n\n'

		return result
	}

	getEasing (easing) {
		return this.easingMapping[easing]
	}

	getStyleByKey (style, widget, keys) {
		var result = ''
		keys.forEach( key => {
			if (style[key] !== undefined && style[key] !== null) {
				var value = style[key];
				result += '  ' + this.getKey(key) + ': ' + this.getValue(key, value) + ';\n'
			}
		})
		return result;
	}

	getRawStyle (style, widget) {
		let result = this.getStyleByKey(style, widget, Object.keys(this.mapping))
		result += this.getBackGround(style, widget)
		return result;
	}

	getPlaceHolderColor (color) {
		if (color) {
			let c = Color.fromString(color);
			c.a = 0.5;
			return Color.toString(c);
		}
		return 'rgba(0, 0, 0, 0.5)'
	}

	getBackGround(style, widget) {
		let result = ''

		if (style.background && style.overlay !== true) {
			if (style.background.colors) {
				if (style.background.radial) {
					let background = style.background
					let gradient = background.colors.map(color => {
						return color.c + ' ' + color.p + '%'
					}).join(', ')
					result += `  background: radial-gradient(circle, ${gradient});\n`
				} else {
					let background = style.background
					let gradient = "(" + background.direction + "deg";
					for (let i = 0; i < background.colors.length; i++) {
						let color = background.colors[i];
						gradient += "," + color.c + " " + color.p + "% ";
					}
					gradient += ")";
					result += `  background: linear-gradient${gradient};\n`
				}

			} else {
				result += `  background-color: ${style.background};\n`
			}
		}
		if (style.backgroundColor) {
			result += `  background-color: ${style.backgroundColor};\n`
		}

		if (style.backgroundImage && style.backgroundImage.url) {

			if (style.backgroundImage.url.indexOf('http') === 0) {
				result += `  background-image: url(${style.backgroundImage.url});\n`
			} else {
				result += `  background-image: url(${this.imagePrefix}/${style.backgroundImage.url});\n`
			}

			if (style.backgroundSize) {
				result += `  background-size: ${style.backgroundSize }%;\n`
			} else {
				result += `  background-size: 100%;\n`
			}

			if (style.backgroundPosition) {
				var pos = style.backgroundPosition;
				let w = Math.round(pos.left * widget.w)
				let h = Math.round(pos.top * widget.h)
				result += `  background-position: ${w}px ${h}px;\n`
			} else {
				result += `  background-position: 0px 0px;\n`
			}
			result += `  background-repeat: no-repeat;\n`
		}
		return result
	}

	getKey (key) {
		return this.mapping[key];
	}

	getValue (key, value) {
		var result = ''
		if (key === 'fontFamily'){
			result += this.escapeFontFamily(value)
		} else if (this.isPixel[key]) {
			result += value + 'px';
		} else if (key === "boxShadow") {
			result = value.h+"px "+ value.v+"px "+ value.b+"px "+ value.s + "px " + value.c;
			if (value.i) {
				result += 'inset'
			}
		} else if (key === 'textShadow') {
			result = value.h+"px "+ value.v+"px "+ value.b+"px "+ value.c;
		} else {
			result += value
		}
		return result;
	}

	escapeFontFamily (value) {
		return value.split(',').map(f => {
			if (f.indexOf(' ') >= 0) {
				return '"' + f + '"';
			}
			return f
		}).join(', ')
	}

	clone (obj) {
		if (!obj) {
				return null
		}
		let _s = JSON.stringify(obj)
		return JSON.parse(_s)
	}

	isInputElement (element) {
    const type = element.type
    return type === 'TextBox' || type === 'TextArea' || type === 'Password'
	}

	fixAutos (style, widget) {
    if (style.fontSize === 'Auto') {
        style.fontSize = widget.h
    }
    return style
	}

}

export default new CSSFactory()