<template>
    <a class="MatcLink StudioNotification" @click="showDialog" @click.right="reset">
        <span class="StudioNotificationBubble" v-if="newNotifications > 0"></span>
        <QIcon icon="Notification" />
        <span class="MatcCollapseViewMinHidden">
            {{ $t('app.notifications') }}
        </span>

        <ZoomDialog ref="dialog">
            <div class="MatcDialogM MatcDialog" @click.stop>
                <template v-if="tab === 'all'">
                    <h1> {{ $t('app.notifications') }}</h1>
                    <div class="StudioNotificationContainer MatcScrollContainer" ref="cntr">
                        <div v-for="n in filteredNewNotifications" :key="n.id" class="StudioNotificationItem">
                            <div class="StudioNotificationItemHeader">
                                <h3>{{n.title}}</h3>
                                <span>{{formatDate(n.lastUpdate)}}</span>
                            </div>
            
                            <p v-html="n.body">
                            </p>
                            <a v-if="n.details" @click="showMore(n)">More...</a>
                                
                        </div>

                        <div v-if="filteredNewNotifications.length === 0" class="StudioNotificationItem">
                            <p>
                                {{ $t('app.notifications-none') }}
                            </p>
                        </div>

                        <div v-if="filteredOldNotifications.length > 0" class="StudioNotificationItemSpacer">
                            <div class="StudioNotificationItemLine"></div>
                            <div> {{ $t('app.oldnotifications') }}</div>
                            <div class="StudioNotificationItemLine"></div>
                        </div>

                        <div v-for="n in filteredOldNotifications" :key="n.id" class="StudioNotificationItem">
                            <div class="StudioNotificationItemHeader">
                                <h3>{{n.title}}</h3>
                                <span>{{formatDate(n.lastUpdate)}}</span>
                            </div>
            
                            <p v-html="n.body">
                            </p>
                            <a v-if="n.details" @click="showMore(n)">More...</a>
                              
                        </div>
                    </div>
                </template>
                <template v-if="tab === 'more'">
                    <h1> {{ selectedNotification.details.title }}</h1>
                    <div class="StudioNotificationContainer MatcScrollContainer" ref="cntr">
                        <div class="StudioNotificationItem">
                            <p v-html="selectedNotification.details.body"></p>
                        </div>
                    </div>
                </template>
       

                <div class="MatcButtonBar MatcMarginTop">
                    <button class="MatcButton MatcButtonPrimary" @click="close" v-if="tab === 'all'">
                        {{$t('common.close')}}
                    </button>
                    <button v-else class="MatcButton MatcButtonPrimary" @click="tab = 'all'">
                        {{$t('btn.back')}}
                    </button>
                </div>

            </div>
        </ZoomDialog>
    </a>
</template>
  

<script>

import Services from 'services/Services'
import QIcon from "page/QIcon";
import ZoomDialog from 'common/ZoomDialog'
import * as UIUtil from '../../util/UIUtil'

export default {
    name: "StudioNotification",
    mixins: [],
    data: function () {
        return {
            videoScaleFactor: 1,
            selectedNotification: null,
            newNotifications: 0,
            notifications: [],
            tab:'all'
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
        filteredNewNotifications () {
            return this.notifications
                .map(n => this.convertNotification(n))
                .filter(n => n.isNew)
                .toSorted((a,b) => {
                    return b.lastUpdate - a.lastUpdate
                })
        },
        filteredOldNotifications () {
            return this.notifications
                .map(n => this.convertNotification(n))
                .filter(n => !n.isNew)
                .toSorted((a,b) => {
                    return b.lastUpdate - a.lastUpdate
                })
        }
    },
    methods: {
        showDialog () {
            this.notifcationService.setLastNotication()
            this.newNotifications = 0
            this.$refs.dialog.show(this.$el)
        },
        showMore (n) {
            this.tab = 'more',
            this.selectedNotification = n
        },
        close () {
            this.$refs.dialog.close()
        },
        formatDate(ts) {
            return UIUtil.formatDate(ts)
        },
        reset () {
            if (location.href.indexOf('localhost') > 0) {
                this.notifcationService.reset()
            }
        },
        convertNotification (n) {
            const result = {
                "id": "notifications." + n.id,
                "title": n.title,
                "body": n.more,
                "lastUpdate": n.lastUpdate,
                "isNew": n.isNew,
                "details": n.details
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
        this.notifcationService = Services.getNotificationService()
        this.notifications = await this.notifcationService.getNotications()
        this.newNotifications = this.notifications.filter(n => n.isNew).length
    }
};
</script>
  