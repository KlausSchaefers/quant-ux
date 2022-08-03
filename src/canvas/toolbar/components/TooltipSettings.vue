
<template>
     <div class="MatcTooltipSettings">
        <div class="MatcToolbarItem MatcToolbarGridFull" >
            <input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput" placeholder="Tooltip text" v-model="tooltipText"/>
        </div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'

export default {
    name: 'TooltipSettings',
    mixins:[DojoWidget],
    data: function () {
        return {
			tooltipText: ''
        }
    },
    components: {},
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
            }
        }


    },
    mounted () {
    }
}
</script>