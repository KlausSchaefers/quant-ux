<template>
  <div>
  </div>
</template>
<script>

import css from 'dojo/css'

export default {
    name: 'TooltipMixin',
    methods: {
        showTooltip (screenID, widgetID){
            this.cleanupToolTip()
            const widget = this.model.widgets[widgetID]
            const scrn = this.model.screens[screenID]
            if (scrn && widget && widget.props && widget.props.tooltipText) {
                if(this.currentScreenDiv){ 
                    const div = document.createElement('div')
                    css.add(div, 'MatcWidgetTooltip')
                    div.innerText = widget.props.tooltipText
                    div.style.top = (widget.y - scrn.y) + (widget.h + 4) + "px";
					div.style.left = (widget.x - scrn.x) + "px";

                    if (widget.style.tooltipBackground) {
                        div.style.background = widget.style.tooltipBackground
                    }

                    if (widget.style.tooltipColor) {
                        div.style.color = widget.style.tooltipColor
                    }

                    let tooltipFontSize = 12
                    if (widget.style.tooltipFontSize && widget.style.tooltipFontSize !== 'Auto') {
                        tooltipFontSize = Math.round(widget.style.tooltipFontSize * this._scaleX)
                    } 
                    div.style.fontSize = Math.round(tooltipFontSize * this._scaleX) + 'px'

                    if (widget?.style?.fontFamily) {
                        div.style.fontFamily = widget.style.fontFamily
                    }
                
                    this.currentScreenDiv.appendChild(div)
                    this._tooltipDiv = div
                }
            }
        },
        hideTooltip () {
           this.cleanupToolTip()
        },
        cleanupToolTip () {
            if (this._tooltipDiv) {
                const parent = this._tooltipDiv.parentNode
                if (parent) {
                    parent.removeChild(this._tooltipDiv)
                }
            }
            delete this._tooltipDiv
        }
    }
}
</script>