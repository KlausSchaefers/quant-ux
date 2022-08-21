
<template>
     <div class="MatcTooltipSettings">
        <div class=" MatcToolbarGridFull" >
            <textarea class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput" placeholder="Tooltip text" v-model="tooltipText" @change="onChangeText"/>
        </div>
        <div >
            <div class="MatcToobarRow" >
                <ToolbarColor
                    :app="model"
                    lbl="Background"
                    :color="tooltipBackground"
                    @change="onChangeBackground($event)"/>
                        
            </div>
            <div class="MatcToobarRow" >
                <ToolbarColor
                    :app="model"
                    lbl="Color"
                    :color="tooltipColor"
                    @change="onChangeColor($event)"/>
            </div>
            <div class="MatcToobarRow" v-if="hasDesignDetails">
                <InputDropDownButton
                    class="MatcToolbarGridFull"
                    qPostfix=" (Font Size)"
                    @change="onChangeFontSize($event)"
                    :qValue="tooltipFontSize"
                    :qReposition="true"
                    :qOptions="['Auto', 8, 12, 16, 20, 24, 32, 48]"
                />
            </div>
        </div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import ToolbarColor from './ToolbarColor'
import InputDropDownButton from './InputDropDownButton'

export default {
    name: 'TooltipSettings',
    mixins:[DojoWidget],
    data: function () {
        return {
            hasDesignDetails: false,
			tooltipText: '',
            tooltipBackground: '#333333',
            tooltipColor: '#ffffff',
            tooltipFontSize: 'Auto',
            model: {}
        }
    },
    components: {ToolbarColor, InputDropDownButton},
	computed: {
	},
    methods: {
        setModel (m) {
            this.model = m
        },

        setWidget (w) {
            this.widget = w
            if (this.widget.props.tooltipText) {
                this.tooltipText = this.widget.props.tooltipText
            } else {
                this.tooltipText = ""
            }
            this.tooltipBackground = this.widget?.style?.tooltipBackground ? this.widget.style.tooltipBackground : "#333333" 
            this.tooltipColor = this.widget?.style?.tooltipColor ? this.widget.style.tooltipColor : "#ffffff" 
            this.tooltipFontSize = this.widget?.style?.tooltipFontSize ? this.widget.style.tooltipFontSize : 'Auto'
        },

        onChangeBackground (c) {
            this.tooltipBackground = c
            this.onChangeStyle()
        },

        onChangeColor (c) {
            this.tooltipColor = c
            this.onChangeStyle()
        },

        onChangeFontSize (size) {
            this.tooltipFontSize = size
            this.onChangeStyle()
        },

        onChangeStyle () {
            this.emit("onChangeStyle", {
                'tooltipBackground': this.tooltipBackground,
                'tooltipColor': this.tooltipColor,
                'tooltipFontSize': this.tooltipFontSize
            })
        },

        onChangeText () {
            this.emit("onChangeText", this.tooltipText)
        }


    },
    mounted () {

    }
}
</script>