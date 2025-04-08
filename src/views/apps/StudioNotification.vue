<template>
    <a class="MatcLink MatcStudioNavItem StudioNotification" @click="showDialog" @click.right="reset">
        <span class="StudioNotificationBubble" v-if="newNotifications > 0"></span>
        <QIcon icon="Notification" />
        <span class="MatcCollapseViewMinHidden">
            {{ $t('app.notifications') }}
        </span>

        <ZoomDialog ref="dialog">
            <div class="MatcDialogXL MatcDialog" @click.stop>

                <h1> {{ $t('app.notifications') }}</h1>
                <div class="MatcToolbarTabs MatcToolbarTabsSmall">
                    <a @click="tab = 'new'" :class="{ 'MatcToolbarTabActive': tab === 'new' }">
                        <QIcon icon="Notification"></QIcon>
                        {{$t('app.newnotifications')}}
                    </a>
                    <a @click="tab = 'all'" :class="{ 'MatcToolbarTabActive': tab === 'all' }">
                        <QIcon icon="NotificationAll"></QIcon>
                        {{$t('app.allnotifications')}}
                    
                    </a>
                </div>

                <template v-if="tab === 'new'">

                    <div class="StudioNotificationContainer MatcScrollContainer" ref="cntr">
                        <div v-for="n in filteredNewNotifications" :key="n.id" class="StudioNotificationItem">
                            <img class="StudioNotificationItemImage" :src="'/notification/' + n.img">
                            <div class="StudioNotificationItemBody">
                                <div class="StudioNotificationItemHeader">
                                    <h3>{{n.title}}</h3>
                                    <span>{{formatDate(n.lastUpdate)}}</span>
                                </div>
                
                                <p v-html="n.body"></p>
                                <a v-if="n.details" @click="showMore(n)">More...</a>
                            </div> 
                        </div>

                        <div v-if="filteredNewNotifications.length === 0" class="MatcHint">
                            {{ $t('app.notifications-none') }}
                        </div>
                    </div>
                </template>

                <template v-if="tab === 'all'">
                    <div class="StudioNotificationContainer MatcScrollContainer" ref="cntr">
        
                        <div v-for="n in allNotifcations" :key="n.id" class="StudioNotificationItem">
                            <img class="StudioNotificationItemImage" :src="'/notification/' + n.img">
                            <div class="StudioNotificationItemBody">
                                <div class="StudioNotificationItemHeader">
                                    <h3>{{n.title}}</h3>
                                    <span>{{formatDate(n.lastUpdate)}}</span>
                                </div>                
                                <p v-html="n.body"></p>
                                <a v-if="n.details" @click="showMore(n)">More...</a>
                            </div>
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
       
                <div class="StudioNotificationItemLine"></div>

                <div class="MatcButtonBar MatcButtonBarSpaceBetween MatcMarginTop">
   
                    <CheckBox :value="isAutoOpen" :label="$t('app.notification_no_auto')" @change="setAutoOpen"/>

                    <button class="MatcButton MatcButtonPrimary" @click="close">
                        {{$t('common.close')}}
                    </button>
                </div>

            </div>
        </ZoomDialog>
    </a>
</template>

<style lang="scss">
    @import "../../style/toolbar/tab.scss";
</style>
  

<script>

import Services from 'services/Services'
import QIcon from "page/QIcon";
import ZoomDialog from 'common/ZoomDialog'
import * as UIUtil from '../../util/UIUtil'
import CheckBox from 'common/CheckBox'

export default {
    name: "StudioNotification",
    mixins: [],
    props: ['user'],
    data: function () {
        return {
            videoScaleFactor: 1,
            selectedNotification: null,
            newNotifications: 0,
            notifications: [],
            tab:'new',
            isAutoOpen: true
        };
    },
    components: {
        'QIcon': QIcon,
        'ZoomDialog': ZoomDialog,
        'CheckBox': CheckBox
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
        allNotifcations () {
            return this.notifications
                .map(n => this.convertNotification(n))
                .toSorted((a,b) => {
                    return a.lastUpdate - b.lastUpdate
                })
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
                    return a.lastUpdate - b.lastUpdate
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
        setAutoOpen (value) {
            this.notifcationService.setAutoOpen(value)
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
            if (n.img) {
                result.img = n.img
            }
            return result
        },
        showAutoDialog () {
            if (this.newNotifications && this.isAutoOpen) {  
                setTimeout(() => {
                    this.showDialog()
                }, 500)
            }
        }
    },
    async mounted() {
        this.notifcationService = Services.getNotificationService()
        this.notifications = await this.notifcationService.getNotications()
        this.isAutoOpen = await this.notifcationService.getAutoOpen()
        this.newNotifications = this.notifications.filter(n => n.isNew).length
        if (!this.newNotifications) {
            this.tab = 'all'
        }
        this.showAutoDialog()        
    }
};
</script>
  