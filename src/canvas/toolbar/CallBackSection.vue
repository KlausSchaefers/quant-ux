
<template>
     <div class="MatcToolbarLowCode">
         <div class="MatcToolbarItem MatcToolbarGridFull MatcToobarInputIconCntr" v-show="!isScreen" ref="tooltipClick">

             <input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput"
                placeholder="Click callback"
                :value="callbacks.click"
                @change="onClickChange"/>
            <span class="mdi mdi-cursor-default MatcToobarInputIcon" />

         </div>
        <div class="MatcToolbarItem MatcToolbarGridFull MatcToobarInputIconCntr" v-show="!isScreen" ref="tooltipChange">

             <input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput"
                placeholder="Change callback"
                :value="callbacks.change"
                @change="onChangeChange"/>
            <span class="mdi mdi-database MatcToobarInputIcon" />

         </div>
         <div class="MatcToolbarItem MatcToolbarGridFull MatcToobarInputIconCntr" v-show="isScreen" ref="tooltipLoad">

             <input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput"
                placeholder="Load callback"
                :value="callbacks.load"
                @change="onLoadChange"/>
              <span class="mdi mdi-backup-restore MatcToobarInputIcon" />

         </div>
	</div>
</template>
<script>

import DojoWidget from 'dojo/DojoWidget'
import _Tooltip from 'common/_Tooltip'

export default {
    name: 'LowCodeSection',
    mixins:[_Tooltip, DojoWidget],
    data: function () {
        return {
            type: false,
            callbacks: {
                click: '',
                change: ''
            }
        }
    },
    computed: {
        isScreen () {
            return this.type === 'Screen'
        }
    },
    components: {
    },
    methods: {
        onWrapChange (value){
            this.emit('changeStyle', 'wrap', value)
        },

        onClickChange (e) {
            this.callbacks.click = e.target.value
            this.emit('changeProps', 'callbacks', this.callbacks)
        },

        onChangeChange (e) {
            this.callbacks.change = e.target.value
            this.emit('changeProps', 'callbacks', this.callbacks)
        },

        onLoadChange (e) {
            this.callbacks.load = e.target.value
            this.emit('changeScreenProps', 'callbacks', {
                'load': this.callbacks.load
            })
        },

		setValue (widget){
            this.type = widget.type
            if (widget.props && widget.props.callbacks){
                this.callbacks.click = widget.props.callbacks.click
                this.callbacks.change = widget.props.callbacks.change
                this.callbacks.load = widget.props.callbacks.load
            } else {
                this.callbacks = {
                    click: '',
                    change: '',
                    load: ''
                }
            }
		}
    },
    mounted () {
        if (this.$refs.tooltipClick) {
            this.addTooltip(this.$refs.tooltipClick, 'Enter the name of the method that should be called when the user <b>CLICKS</b> on the element.')
        }
        if (this.$refs.tooltipChange) {
            this.addTooltip(this.$refs.tooltipChange, 'Enter the name of the method that should be called when value of the element <b>CHANGES</b>.')
        }
        if (this.$refs.tooltipLoad) {
            this.addTooltip(this.$refs.tooltipLoad, 'Enter the name of the method that should be called when the screen is <b>LOADED</b>.')
        }
    }
}
</script>