
<template>
    <a :class="[{'MatcHelpIcon': !isToolbar}, {'MatcToolbarItem': isToolbar}]" @click="open">
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
            isToolbar: false
        }
    },
    components: {},
    methods: {
        open () {
            let dialog = new Dialog()

            var db = new DomBuilder();
			var popup = db.div("MatcDialog MatcHelpDialog MatcPadding").build();
            	
            dialog.popup(popup, this.$el);
            setTimeout(() => {
                let help = this.$new(Help)
                help.placeAt(popup)
                if (this.topic) {
                    help.setTopic(this.topic)
                    help.setSupTopic(this.subtopic)
                }
            }, 300)
            
        }
    }, 
    mounted () {
    }
}
</script>