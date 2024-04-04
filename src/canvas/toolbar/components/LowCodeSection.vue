
<template>
     <div class="MatcToolbarLowCode">

        <div class="MatcToobarRow" v-if="isContainer">
            <ToolbarDropDownButton
                class=""
                qPopupCSS="MatcActionAnimProperties"
                qMaxLabelLength="40"
                :qOptions="layoutOptions"
                :qValue="layout"
                @change="onLayoutChange"
                :qReposition="true"
                :qUpdateLabel="true"/>
        </div>

        <div class="MatcToobarRow" v-if="isAutoLayout && isContainer">
            <InputDropDownButton
                ref="paddingY"
                @change="onPaddingYChange"
                :qValue="paddingY"
                :qOptions="paddingOptions"
                qIcon="mdi mdi-unfold-more-horizontal"
                :qReposition="true" />

            <InputDropDownButton
                ref="paddingX"
                @change="onPaddingXChange"
                :qValue="paddingX"
                :qOptions="paddingOptions"
                qIcon="mdi mdi-unfold-more-vertical"
                :qReposition="true" />


            <InputDropDownButton
                ref="space"
                @change="onSpacingChange"
                :qValue="spacing"
                :qOptions="paddingOptions"
                qIcon="mdi mdi-select-all"
                :qReposition="true" />

        </div>


        <div class="MatcToobarRow" v-if="isCustom || !isContainer">
            <div class="MatcToolbarItem  MatcToobarInputIconCntr" ref="tooltipCustom">

                <input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput"
                    placeholder="Custom Component"
                    :value="customComponent"
                    @change="onCustomChange"/>
                <span class="mdi mdi-puzzle MatcToobarInputIcon" />

            </div>
        </div>
	</div>
</template>
<script>

import DojoWidget from 'dojo/DojoWidget'
// import CheckBox from 'common/CheckBox'
import _Tooltip from 'common/_Tooltip'
import ToolbarDropDownButton from './ToolbarDropDownButton'
import InputDropDownButton from './InputDropDownButton'

export default {
    name: 'LowCodeSection',
    mixins:[DojoWidget, _Tooltip],
    data: function () {
        return {
            widget: null,
            layout: 'Grid',
            flexAlign: 'Wrap', // Row, Col,, Wrap
            customComponent: '',
            paddingX: -1,
            paddingY: -1,
            spacing: 8,
            layoutOptions: [
                {label: 'Default', value: 'Grid'},
                {label: 'Custom Component', value: 'Custom'},
                // {label: 'Rows (Auto Layout)', value: 'Row'},
                // {label: 'Colums (Auto Layout)', value: 'Col'},
                {label: 'Wrap (Auto Layout)', value: 'Wrap'},
            ],
            paddingOptions: [
                {label: 'Auto', value: -1},
                {label: '0', value: 0},
                {label: 1, value: 1},
                {label: 4, value: 4},
                {label: 8, value: 8},
                {label: 16, value: 16},
                {label: 24, value: 24},
                {label: 32, value: 32},
                {label: 40, value: 40}
            ]
        }
    },
    components: {
        'ToolbarDropDownButton': ToolbarDropDownButton,
        'InputDropDownButton': InputDropDownButton
    },
    computed: {
        isCustom () {
            return this.layout === 'Custom'
        },
        isAutoLayout () {
            /**
             * This was copied from Figma, but doe snot make much sense without auto layout in the canvas
             */
            return false //this.layout !== 'Grid' && this.layout !== 'Custom'
        },
        isContainer () {
            if (this.widget && (this.widget.type === 'Box' || this.widget.type === 'Button')) {
                return true
            }
            return false
        }
    },
    methods: {
        onLayoutChange (value) {
            if (this.isGroup) {
                this.emit('changeGroupStyle', 'layout', value)
            } else {
                this.emit('changeStyle', 'layout', value)
            }
        },
        onPaddingXChange (value) {
            if (this.isGroup) {
                this.emit('changeGroupStyle', 'flexPaddingX', value)
            } else {
                this.emit('changeStyle', 'flexPaddingX', value)
            }
        },
        onPaddingYChange (value) {
            if (this.isGroup) {
                this.emit('changeGroupStyle', 'flexPaddingY', value)
            } else {
                this.emit('changeStyle', 'flexPaddingY', value)
            }
        },
        onSpacingChange (value) {
            if (this.isGroup) {
                this.emit('changeGroupStyle', 'flexSpacing', value)
            } else {
                this.emit('changeStyle', 'flexSpacing', value)
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

            this.isGroup = isGroup
            this.widget = widget

            if (widget.style && widget.style.layout) {
                this.layout = widget.style.layout
            } else {
                this.layout = 'Grid'
            }

            if (widget.style && widget.style.flexPaddingX !== undefined) {
                this.paddingX = widget.style.flexPaddingX
            } else {
                this.paddingX = -1
            }

            if (widget.style && widget.style.flexPaddingY !== undefined) {
                this.paddingY = widget.style.flexPaddingY
            } else {
                this.paddingY = -1
            }

            if (widget.style && widget.style.flexSpacing !== undefined) {
                this.spacing = widget.style.flexSpacing
            } else {
                this.spacing = -1
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
            this.addTooltip(this.$refs.tooltipCustom, 'Custom component to replace element')
        }
        if (this.$refs.paddingX) {
            this.addTooltip(this.$refs.paddingX, 'Horizontal Padding')
        }
    }
}
</script>