
<template>
     <div class="MatcToolbarLowCode">



        <div class="MatcToobarRow" >
            <div class="MatcToolbarFlexCntr" v-if="!isFixed">
                    <div class="MatcToolbarItem  MatcToolbarGridHalf MatcToobarInputIconCntr" ref="tooltipMinWidth">
                        <input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput"
                                placeholder="Min Width"
                                :value="minWidth"
                                @change="onMinWidthChange"/>
                            <span class="mdi mdi-unfold-less-vertical MatcToobarInputIcon" />
                    </div>

                <div class="MatcToolbarItem MatcToolbarGridHalf MatcToobarInputIconCntr" ref="tooltipMaxWidth">
                    <input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput"
                            placeholder="Max Width"
                            :value="maxWidth"
                            @change="onMaxWidthChange"/>
                        <span class="mdi mdi-unfold-more-vertical MatcToobarInputIcon" />
                </div>
            </div>
            <div v-else class="MatcToolbarItem">
                This element has a fixed width
            </div>
        </div>


	</div>
</template>
<script>

import DojoWidget from 'dojo/DojoWidget'
import _Tooltip from 'common/_Tooltip'

export default {
    name: 'LowCodeSection',
    mixins:[DojoWidget, _Tooltip],
    data: function () {
        return {
            widget: null,
            minWidth: '',
            maxWidth: ''
        }
    },
    components: {
        // 'ToolbarDropDownButton': ToolbarDropDownButton,
        // 'InputDropDownButton': InputDropDownButton
    },
    computed: {
        isFixed () {
            let e = this.widget
            return e && e.props && e.props.resize && e.props.resize.fixedHorizontal
        }
    },
    methods: {
        onMinWidthChange (e) {
            let value = e.target.value
            if (this.isGroup) {
                this.emit('changeGroupStyle', 'minWidth', value)
            } else {
                this.emit('changeStyle', 'minWidth', value)
            }
        },
        onMaxWidthChange (e) {
            let value = e.target.value
            if (this.isGroup) {
                this.emit('changeGroupStyle', 'maxWidth', value)
            } else {
                this.emit('changeStyle', 'maxWidth', value)
            }
        },

		setValue (widget, isGroup = false){

            this.isGroup = isGroup
            this.widget = widget
            console.debug('setValue', widget)

            if (widget.style && widget.style.minWidth !== undefined) {
                this.minWidth = widget.style.minWidth
            } else {
                this.minWidth = ''
            }

             if (widget.style && widget.style.maxWidth !== undefined) {
                this.maxWidth = widget.style.maxWidth
            } else {
                this.maxWidth = ''
            }

		}
    },
    mounted () {
        if (this.$refs.tooltipMinWidth) {
            this.addTooltip(this.$refs.tooltipMinWidth, 'Min With')
        }
        if (this.$refs.tooltipMaxWidth) {
            this.addTooltip(this.$refs.tooltipMaxWidth, 'Max Width')
        }
    }
}
</script>