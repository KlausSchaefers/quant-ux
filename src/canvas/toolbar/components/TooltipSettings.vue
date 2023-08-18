
<template>
     <div class="MatcTooltipSettings">
        <DesignTokenView v-show="hasDesignToken" :designtoken="currentDesignToken"/>

     
            <div class="MatcToobarRow" v-show="!hasDesignToken">
                <ToolbarColor
                    :qIsDropDown="isChildDropDown"
                    :app="model"
                    lbl="Background"
                    :color="tooltipBackground"
                    @change="onChangeBackground($event)"/>
                        
            </div>
            <div class="MatcToobarRow" v-show="!hasDesignToken" >
                <ToolbarColor
                    :qIsDropDown="isChildDropDown"
                    :app="model"
                    lbl="Color"
                    :color="tooltipColor"
                    @change="onChangeColor($event)"/>
            </div>
            <div class="MatcToobarRow" v-show="!hasDesignToken">
                <InputDropDownButton
                    :qIsDropDown="isChildDropDown"
                    class=""
                    qPostfix=" (Font Size)"
                    @change="onChangeFontSize($event)"
                    :qValue="tooltipFontSize"
                    :qReposition="true"
                    :qOptions="['Auto', 8, 12, 16, 20, 24, 32, 48]"
                />
            </div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import ToolbarColor from './ToolbarColor'
import InputDropDownButton from './InputDropDownButton'
import _DesignToken from './_DesignToken'
import DesignTokenView from './DesignTokenView'

export default {
    name: 'TooltipSettings',
    mixins:[_DesignToken, DojoWidget],
    props:['isChildDropDown'],
    data: function () {
        return {
            tooltipBackground: '#333333',
            tooltipColor: '#ffffff',
            tooltipFontSize: 'Auto',
            model: {}
        }
    },
    components: {ToolbarColor, InputDropDownButton, DesignTokenView},
	computed: {
	},
    methods: {
        setModel (m) {
            this.model = m
        },

        setValue (style) {
            this.tooltipBackground = style?.tooltipBackground ? style.tooltipBackground : "#333333" 
            this.tooltipColor = style?.tooltipColor ? style.tooltipColor : "#ffffff" 
            this.tooltipFontSize = style?.tooltipFontSize ? style.tooltipFontSize : 'Auto'
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
            this.emit("change", {
                'tooltipBackground': this.tooltipBackground,
                'tooltipColor': this.tooltipColor,
                'tooltipFontSize': this.tooltipFontSize
            })
        }
    },
    mounted () {

    }
}
</script>