class CSSOptimizer {


	constructor () {
        /**
         *  Keep the order to collapsed Order: top-left | top-right | bottom-right | bottom-left
         */
        this.borderRadius = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"]

         /**
         * Order: top, right, bottom, left
         */
        this.borderWidth = ["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"]
        this.borderStyle = ['borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle']
        this.borderColor = ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor']

        this.padding = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']

	}

    get(box) {
        if (box.style) {
            //box.style = this.compress(box.style)
        }
        return box
    }


    compress (style) {


        this.compressAttribes(style, this.padding, 'padding', 'px', 0)

        /**
         * Compress and collapse border
         */
        this.compressAttribes(style, this.borderRadius, 'borderRadius', 'px', 0)
        let borderIsEqual = this.compressAttribes(style, this.borderColor, 'borderColor', false, 'transparent')
        let widthIsEqual = this.compressAttribes(style, this.borderWidth, 'borderWidth', 'px', 0)
        let styleIsEqual = this.compressAttribes(style, this.borderStyle, 'borderStyle', false, 'solid')

        /**
         * Merge borders of possible
         */
        if (borderIsEqual && widthIsEqual && styleIsEqual) {
            style.border = `${style.borderWidth} ${style.borderStyle} ${style.borderColor}`
            delete style.borderColor
            delete style.borderWidth
            delete style.borderStyle
        }

        /**
         * Remove defaults for the all equal case
         */
        if (style.borderStyle === 'solid solid solid solid') {
            delete style.borderStyle
        }

        if (style.borderStyle === 'solid') {
            delete style.borderStyle
        }

        // if (style.border && style.border.indexOf('0px') === 0) {
        //    delete style.border
        //}

        if (style.padding === '0px') {
            delete style.padding
        }

        if (style.borderRadius === '0px') {
            delete style.borderRadius
        }

        return style
    }

    resizeToBoxModel (widget) {
        if (widget.style) {
			if (widget.style.paddingTop) {
				widget.h -= widget.style.paddingTop
			}
			if (widget.style.paddingBottom) {
				widget.h -= widget.style.paddingBottom
			}
			if (widget.style.paddingLeft) {
				widget.w -= widget.style.paddingLeft
			}
			if (widget.style.paddingRight) {
				widget.w -= widget.style.paddingRight
			}

			if (widget.style.borderTopWidth) {
				widget.h -= widget.style.borderTopWidth
			}
			if (widget.style.borderBottomWidth) {
				widget.h -= widget.style.borderBottomWidth
			}
			if (widget.style.borderLeftWidth) {
				widget.w -= widget.style.borderLeftWidth
			}
			if (widget.style.borderRightWidth) {
				widget.w -= widget.style.borderRightWidth
			}
        }
        return widget
    }

    compressAttribes (style, keys, prop, unit, defaultValue) {
        /**
         * Check if we have all the same
         */
        let firstValue = style[keys[0]]
        if(keys.every(key => style[key] === firstValue)) {

            if (firstValue === undefined || firstValue === null) {
                firstValue = defaultValue
            }
            if (unit) {
                firstValue += unit
            }
            keys.forEach(key => {
                /**
                 * Remove but store a backup for CSSFactory to fix box height
                 */
                style['_' + key] = style[key]
                delete style[key]
            })

            style[prop] = firstValue
            return true;
        } else {
            let values = []
            keys.forEach(key => {
                let value = style[key]
                if (value === undefined || value === null) {
                    value = defaultValue
                }
                if (unit) {
                    value += unit
                }
                values.push(value)
                style['_' + key] = style[key]
                delete style[key]
            })
            style[prop] = values.join(' ')
            return false
        }
    }

}

export default new CSSOptimizer()