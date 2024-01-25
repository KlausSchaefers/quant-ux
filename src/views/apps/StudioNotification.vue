<template>
    <a class="MatcLink StudioNotification" href="#/help.html">
        <span class="StudioNotificationBubble" v-if="notifications.length > 0"></span>
        <QIcon icon="Notification" />
        <span class="MatcCollapseViewMinHidden">
            {{ $t('app.notifications') }}
        </span>
    </a>
</template>
  

<script>

import Services from 'services/Services'
import QIcon from "page/QIcon";

export default {
    name: "StudioNotification",
    mixins: [],
    data: function () {
        return {
            notifications: [
                {
                    id:1,
                    title: 'Test 1',
                    more: 'This is the body',
                    video: '',
                    lastUpdate: new Date().getTime()
                },
                {
                    id:1,
                    title: 'Test 1',
                    more: 'This is the body',
                    video: '',
                    lastUpdate: new Date().getTime() - 86000
                }
            ]
        };
    },
    components: {
        'QIcon': QIcon
    },
    computed: {
        pub() {
            return this.$route.meta && this.$route.meta.isPublic
        },
        mode() {
            if (this.pub) {
                return 'public'
            }
            return 'private'
        }
    },
    methods: {
        convertNotification (n) {
            let news = {
                "id": "notifications." + n.id,
                "title": n.title,
                "body": n.more
            }
            if (n.video) {
                let url = n.video
                if (url.indexOf('src="') > 0 ){
                    url = url.substring(url.indexOf('src="') + 5)
                    url = url.substring(0, url.indexOf('"'))
                }
                news.video = {
                    "src": url
                }
            }
            return news
        },
    },
    async mounted() {
        if (this.isLive) {
            this.notifications = await Services.getUserService().getNotications()
        }

        console.debug(this.notifications)
        // if (notifications) {
        //     notifications.sort((a,b) => {
        //         return b.lastUpdate - a.lastUpdate;
        //     });
        // }
    }
};
</script>
  