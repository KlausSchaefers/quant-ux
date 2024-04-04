
<template>
     <div class="MatcTooltipSection">
        <div class="MatcToolbarItem MatcToolBarTextArea">
            <textarea 
                class="MatcIgnoreOnKeyPress MatcToobarInput" 
                placeholder="Enter tooltip text" 
                ref="innputField"
                v-model="tooltipText" 
                @change="onChangeText"
            />
        </div>
        <TooltipSettings ref="settings" @change="onChangeStyle" v-show="tooltipText"/>
       
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import TooltipSettings from './TooltipSettings'

export default {
    name: 'TooltipSection',
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
    components: {TooltipSettings},
	computed: {
	},
    methods: {
        setModel (m) {
            this.model = m
            if (this.$refs.settings) {
                this.$refs.settings.setModel(m)
            } else {
                 console.warn('TooltipSection.setModel() no ref')
            }
        },

        setCssProps (props) {
            if (this.$refs.settings) {
                this.$refs.settings.setCssProps(props)
            } else {
                console.warn('TooltipSection.setCssProps() no ref')
            }
        },

        setBox (box) {
            if (this.$refs.settings) {
                this.$refs.settings.setBox(box)
            } else {
                console.warn('TooltipSection.setBox() no ref')
            }
        },

        setWidget (w) {
            this.widget = w
            if (this.widget.props.tooltipText) {
                this.tooltipText = this.widget.props.tooltipText
            } else {
                this.tooltipText = ""
            }

            if (this.$refs.settings) { 
                this.$refs.settings.setValue(w.style)
            } else {
                console.warn('TooltipSection.setWidget() no ref')
            }
        },

        onChangeStyle (style) {
          this.emit("onChangeStyle", style)
        },

        onChangeText () {
            this.emit("onChangeText", this.tooltipText)
        },

        blur () {
            if (this.$refs.innputField){
                this.$refs.innputField.blur()
            }
        }

    },
    mounted () {

    }
}
</script>