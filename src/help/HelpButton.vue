
<template>
    <a class="MatcHelpIcon" @click="open">
        <span class="mdi mdi-help-circle"></span>
    </a>
</template>
<script>
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import Help from 'help/Help'
import DojoWidget from 'dojo/DojoWidget'

export default {
    name: 'HelpButton',
    mixins:[DojoWidget],
    props: ['topic', 'subtopic'],
    data: function () {
        return {
            
        }
    },
    components: {},
    methods: {
        open () {
            let dialog = new Dialog()

            var db = new DomBuilder();
			var popup = db.div("MatcDialog MatcHelpDialog MatcPadding").build();
            	
            dialog.popup(popup, this.$el);
            
            let help = this.$new(Help)
            help.placeAt(popup)
            help.setTopic(this.topic)
            help.setSupTopic(this.subtopic)
        }
    }, 
    mounted () {
    }
}
</script>