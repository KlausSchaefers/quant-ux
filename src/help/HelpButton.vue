
<template>
    <span :class="[{'MatcHelpIcon': !hasToolbar}, {'MatcToolbarItem MatcNotification': hasToolbar}]" @click="open">
        <div type="button" data-dojo-attach-point="button"> 
            <span class="mdi mdi-help-circle">
            </span>
            <span v-if="newNotifications" class="MatcNotificationBubble">{{newNotifications}}</span>
        </div>
        
    </span>
</template>
<script>
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import Help from 'help/Help'
import DojoWidget from 'dojo/DojoWidget'
import Services from 'services/Services'

export default {
    name: 'HelpButton',
    mixins:[DojoWidget],
    props: ['topic', 'subtopic', 'hasNotifications', 'hasToolbar'],
    data: function () {
        return {
            newNotifications: 0
        }
    },
    components: {},
    methods: {
        open () {
            if (this.hasToolbar) {
                Services.getUserService().setLastNotication()
                this.newNotifications = 0
            }
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
            
        },
        async initNotification () {
            let result = await Services.getUserService().getLastNotication()
            if (result) {
                let lastNoticationView = result.lastNotification
                let newNotifications = 0
                let notifications = await Services.getUserService().getNotications()
                for (var i=0; i < notifications.length; i++ ){
                    var notification = notifications[i];
                    if (notification.lastUpdate > lastNoticationView){
                        newNotifications++;
                    }
                }
                this.newNotifications = newNotifications
            }
        }
    }, 
    mounted () {
        if (this.hasNotifications) {
            this.initNotification()
        }
    }
}
</script>