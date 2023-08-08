
<template>
   <ArrowDropDown @select="onSelect" :options="tools" icon="Layer" css="MatcToolbarSecondaryItem"></ArrowDropDown>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import ArrowDropDown from './ArrowDropDown'

export default {
    name: 'LayerButton',
    mixins:[Util, DojoWidget],
    data: function () {
        return {
            selectedTool: null,
            tools: [
                {value: "front", label: "Bring to front", icon:"LayerTop", shortcut:"CTRL + &uarr;"},
				{value: "forward", label: "Bring forward", icon:"LayerUp", shortcut:"CTRL + ]"},
				{value: "backward", label: "Send backward", icon:"LayerDown", shortcut:"CTRL + ["},
				{value: "back", label: "Send to back ", icon:"LayerBottom", shortcut:"CTRL + &darr;"}
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
    }
}
</script>