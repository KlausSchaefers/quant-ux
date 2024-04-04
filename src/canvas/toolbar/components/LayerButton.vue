
<template>
   <ArrowDropDown @select="onSelect" :options="tools" icon="Layer" css="MatcToolbarPrimaryItem"></ArrowDropDown>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import ArrowDropDown from './ArrowDropDown'
import _Tooltip from 'common/_Tooltip'

export default {
    name: 'LayerButton',
    mixins:[Util, DojoWidget, _Tooltip],
    data: function () {
        return {
            selectedTool: null,
            tools: [
                {value: "front", label: this.getNLS("toolbar.layer.front"), icon:"LayerTop", shortcut:"CTRL + &uarr;"},
				{value: "forward", label: this.getNLS("toolbar.layer.forward"), icon:"LayerUp", shortcut:"CTRL + ]"},
				{value: "backward", label: this.getNLS("toolbar.layer.backward") , icon:"LayerDown", shortcut:"CTRL + ["},
				{value: "back", label: this.getNLS("toolbar.layer.back"), icon:"LayerBottom", shortcut:"CTRL + &darr;"}
            ]
        }
    },
    components: {
        'ArrowDropDown':ArrowDropDown
    },
    methods: {    
        onSelect (t, e) {   
            this.$emit('select', t, e)
        }		
    },
    mounted () {
        this.addTooltip(this.$el, this.getNLS("tooltip.layer"))
    }
}
</script>