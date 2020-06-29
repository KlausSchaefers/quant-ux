
<template>
     <div class="MatcToolbarLowCode">
		 <div class="MatcToolbarItem">
             <CheckBox label="Wrap Children" :value="isWraped" @change="onWrapChange"/>
         </div>
          <div class="MatcToolbarItem">
             <CheckBox label="Force Grid" :value="isGrid" @change="onGridChange"/>
         </div>

         <div class="MatcToolbarItem MatcToolbarGridFull MatcToobarInputIconCntr" ref="tooltipCustom">

             <input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput"
                placeholder="Custom Component"
                :value="customComponent"
                @change="onCustomChange"/>
            <span class="mdi mdi-puzzle MatcToobarInputIcon" />

         </div>
	</div>
</template>
<script>

import DojoWidget from 'dojo/DojoWidget'
import CheckBox from 'common/CheckBox'
import _Tooltip from 'common/_Tooltip'

export default {
    name: 'LowCodeSection',
    mixins:[DojoWidget, _Tooltip],
    data: function () {
        return {
            isWraped: false,
            isGrid: false,
            customComponent: '',
            callbacks: {
                click: ''
            }
        }
    },
    components: {
        'CheckBox': CheckBox
    },
    methods: {
        onWrapChange (value){
            if (this.isGroup) {
                this.emit('changeGroupStyle', 'wrap', value)
            } else {
                this.emit('changeStyle', 'wrap', value)
            }
        },

        onGridChange (value) {
            if (this.isGroup) {
                this.emit('changeGroupStyle', 'grid', value)
            } else {
                this.emit('changeStyle', 'grid', value)
            }
        },

        onCustomChange (e) {
            let value = e.target.value
            if (this.isGroup) {
                this.emit('changeGroupProps', 'customComponent', value)
            } else {
                this.emit('changeProps', 'customComponent', value)
            }
        },

		setValue (widget, isGroup = false){
            console.debug('setVlaue', widget)
            this.isGroup = isGroup
      		if (widget.style && widget.style.wrap) {
                this.isWraped = widget.style.wrap
            } else {
                this.isWraped = false
            }
            if (widget.style && widget.style.grid) {
                this.isGrid = widget.style.grid
            } else {
                this.isGrid = false
            }
            if (widget.props && widget.props.callbacks){
                this.callbacks.click = widget.props.callbacks.click
            } else {
                this.callbacks = {
                    click: ''
                }
            }
            if (widget.props && widget.props.customComponent) {
                this.customComponent = widget.props.customComponent
            } else {
                this.customComponent = ''
            }
		}
    },
    mounted () {
         if (this.$refs.tooltipCustom) {
            this.addTooltip(this.$refs.tooltipCustom, 'Enter the name of the custom component that should be used during rendering.')
        }
    }
}
</script>