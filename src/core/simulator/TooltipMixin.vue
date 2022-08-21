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

                    if (widget.style.tooltipFontSize) {
                        if (widget.style.tooltipFontSize !== 'Auto') {
                            div.style.fontSize = widget.style.tooltipFontSize + 'px'
                        }
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