
<template>
     <div class="MatcToolbarLowCode">

		 <div class="MatcToolbarItem" v-if="isContainer">
             <CheckBox label="Auto Layout" :value="isAutoLayout" @change="onAutoChange"/>
         </div>

        <div class="MatcToobarRow" v-if="isAutoLayout && isContainer">
            <ToolbarDropDownButton
                class="MatcToolbarGridFull"
                :qOptions="flexOptions"
                :qValue="flex"
                @change="onFlexChange"
                :qReposition="true"
                :qUpdateLabel="true"/>
        </div>

        <div class="MatcToobarRow">
            <div class="MatcToolbarItem MatcToolbarGridFull MatcToobarInputIconCntr" ref="tooltipCustom">

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
import CheckBox from 'common/CheckBox'
import _Tooltip from 'common/_Tooltip'
import ToolbarDropDownButton from 'canvas/toolbar/ToolbarDropDownButton'

export default {
    name: 'LowCodeSection',
    mixins:[DojoWidget, _Tooltip],
    data: function () {
        return {
            widget: null,
            isAutoLayout: false,
            flex: 'Wrap', // Row, Col,, Wrap
            customComponent: '',
            layoutOptions: [
                {label: 'Grid', value: 'Grid'},
                {label: 'Flex', value: 'Flex'},
            ],
            flexOptions: [
                {label: 'Wrap', value: 'Wrap'},
                {label: 'Rows', value: 'Row'},
                {label: 'Colums', value: 'Col'},
            ]
        }
    },
    components: {
        'CheckBox': CheckBox,
        'ToolbarDropDownButton': ToolbarDropDownButton
    },
    computed: {
        isContainer () {
            if (this.widget && (this.widget.type === 'Box' || this.widget.type === 'Button')) {
                return true
            }
            return false
        }
    },
    methods: {
        onAutoChange (value) {
            if (this.isGroup) {
                this.emit('changeGroupStyle', 'autoLayout', value)
            } else {
                this.emit('changeStyle', 'autoLayout', value)
            }
        },
        onFlexChange (value) {
            if (this.isGroup) {
                this.emit('changeGroupStyle', 'flex', value)
            } else {
                this.emit('changeStyle', 'flex', value)
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

            if (widget.style && widget.style.autoLayout === true) {
                this.isAutoLayout = widget.style.autoLayout
            } else {
                this.isAutoLayout = false
            }

            if (widget.style && widget.style.flex) {
                this.flex = widget.style.flex
            } else {
                this.flex = 'Wrap'
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