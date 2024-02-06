<template>
    <a class="MatcLink StudioNotification" @click="showDialog">
        <span class="StudioNotificationBubble" v-if="notifications.length > 0"></span>
        <QIcon icon="Notification" />
        <span class="MatcCollapseViewMinHidden">
            {{ $t('app.notifications') }}
        </span>

        <ZoomDialog ref="dialog">
            <div class="MatcDialogM MatcDialog" @click.stop>
                <h1> {{ $t('app.notifications') }}</h1>
                <div class="StudioNotificationContainer MatcScrollContainer" ref="cntr">
                    <div v-for="n in filteredNotifications" :key="n.id" class="StudioNotificationItem">
                        <h3>{{n.title}}</h3>
                        <p v-html="n.body">
                        </p>
                        <div class="StudioNotificationVideo">
                            <iframe
                                v-if="n.video"
                                :width="560 * videoScaleFactor"
                                :height="315 * videoScaleFactor"
                                :src="n.video.src"
                                frameborder="0"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                            </iframe>
                        </div>
         
                    </div>
                    <div v-if="filteredNotifications.length === 0" class="StudioNotificationItem">
                        <p>
                            {{ $t('app.notifications-none') }}
                        </p>
                    </div>
                </div>
       

                <div class="MatcButtonBar MatcMarginTop">
                    <button class="MatcButton MatcButtonPrimary" @click="close">{{$t('common.close')}}</button>
                </div>

            </div>
        </ZoomDialog>
    </a>
</template>
  

<script>

import Services from 'services/Services'
import QIcon from "page/QIcon";
import ZoomDialog from 'common/ZoomDialog'

export default {
    name: "StudioNotification",
    mixins: [],
    data: function () {
        return {
            videoScaleFactor: 1,
            notifications: [
                // {
                //     id:1,
                //     more: `Lorem ipsum dolor <b>sit</b> amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. .`,
                //     title: 'This is the body',
                //     video: 'https://www.youtube.com/embed/qWJ5kTb_Gec?si=Ccu0Hwsenf0hOXDW',
                //     lastUpdate: new Date().getTime()
                // },
                // {
                //     id:2,
                //     title: 'Test 1',
                //     more: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
                //     video: 'https://www.youtube.com/embed/qWJ5kTb_Gec?si=Ccu0Hwsenf0hOXDW',
                //     lastUpdate: new Date().getTime() - 86000
                // }
            ]
        };
    },
    components: {
        'QIcon': QIcon,
        'ZoomDialog': ZoomDialog
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
        },
        filteredNotifications () {
            return this.notifications.map(n => this.convertNotification(n))
        }
    },
    methods: {
        showDialog () {
            Services.getUserService().setLastNotication()
            this.$refs.dialog.show(this.$el)
        },
        close () {
            this.$refs.dialog.close()
        },
        convertNotification (n) {
            let result = {
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
                result.video = {
                    "src": url
                }
            }
            return result
        },
    },
    async mounted() {
        this.notifications = await Services.getUserService().getNotications()
    }
};
</script>
  