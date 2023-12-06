<template>
    <div class="MatcStudio">
        <SplitContainer :left="256">
            <template v-slot:left>
                <div class="MatcStudioRight">
                    <div class="MatcStudioLogo">        
                        <img src="../../style/img/QUXLogo5BlueWhite.svg" class="MatcStudioLogo" ref="logo"> Quant-UX                
                    </div>

                    <div class="MatcMarginTop">        
                        <button @click="showNewDialog" class="MatcButton MatcButtonPrimary  MatcButtonXS">
                            <QIcon icon="Plus"/> {{ $t('app.create') }}
                        </button>      
                    </div>

                    <!-- <div class="MatcStudioRightRow MatcMarginTop" v-if="filteredAppList.length > 0">
                        <button @click="showAppsDialog" class="MatcButton MatcButtonSecondary  MatcButtonXS">
                            <QIcon icon="Projects"></QIcon>
                            {{ $t('app.projects') }}

                        </button>
                    </div> -->

                    <div class="MatcStudioRightRow MatcMarginTop" v-if="filteredAppList.length > 0">
                        <h4> {{ $t('app.recent-projects') }}</h4>
                 
                    </div>
 
                    <div class="MatcStudioAppList MatcMarginBottom">
                        <a v-for="app in filteredAppList" :key="app.id" :href="'#/' + urlPrefix +'/' + app.id + '.html'" :class="['MatcLink', {'MatcStudioAppListSelected' : selectedApp === app.id}]">
                            <span class="MatcStudioAppListDot" :style="{'background': app.previewColor}"/>
                            <span class="MatcStudioAppListLabel">
                                {{app.name}}
                            </span>                                      
                        </a>
                        <a v-if="hasMore" @click="showAppsDialog" class="MatcActionLink">
                            <span class="MatcStudioAppListDot" style="opacity: 0;"/>
                            <span class="MatcStudioAppListLabel ">
                                {{$t('app.more')}}
                            </span>    
                        </a>
                    </div>

                    <div class="MatcStudioRightRow">
                        <a class="MatcLink" href="#/help.html">
                            <QIcon icon="Book"/>
                            {{ $t('app.help') }}
                        </a>
                    </div>

                    <div class="MatcStudioRightRow">
                        <a class="MatcLink" href="#/my-account.html" >
                            <QIcon icon="Account" v-if="!hasUserImage" ></QIcon>
                            <span class="MatcUserImageCntr" v-else>
                                <img class="MatcUserImage" :src="userImage">
                            </span>
                            {{userName}}
                        </a>
                    </div>

                    <div class="MatcStudioRightRow">
                        <a class="MatcLink" @click="onLogout">
                            <QIcon icon="Logout"/>
                            {{ $t('app.logout') }}                 
                        </a>
                    </div>       
          
                </div>
   
        
            
            </template>

            <template v-slot:right>
                <StudioOverview v-if="selectedApp" :user="user" @change="onChangeAppProps" @delete="onDeleteApp"/>
                <div class="MatcStudioWelcome" v-else>

                    <div class="">
                        <h3>{{$t('app.welcome-headline')}}</h3>
                        <div>
                            {{$t('app.welcome-intro')}}
                        </div>
                    </div>
              

                </div>

            </template>

        </SplitContainer>

        <CreateAppDialog ref="createDialog"></CreateAppDialog>
        <AppListDialog ref="appsDialog"></AppListDialog>
    </div>
</template>
<style lang="scss">
@import "../../style/studio.scss";
</style>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Services from "services/Services";
import SplitContainer from "page/SplitContainer";
import StudioOverview from './StudioOverview'
import CreateAppDialog from "page/CreateAppDialog";
import QIcon from "page/QIcon";
import AppListDialog from './AppListDialog'


export default {
    name: "Studio",
    mixins: [DojoWidget],
    data: function () {
        return {
            selectedApp: null,
            apps: [],
            user: null
        };
    },
    components: {
        'SplitContainer': SplitContainer,
        'StudioOverview': StudioOverview,
        'CreateAppDialog': CreateAppDialog,
        'QIcon': QIcon,
        'AppListDialog': AppListDialog
        //AppList: AppList
    },
    computed: {
        hasMore () {
            if (this.filteredAppList.length === 0) {
                return false
            }
            return this.apps.length > 10
        },
        filteredAppList () {
            //return []
            if (this.apps.length > 10) {
                return this.apps.slice(0, 10) 
            }
            return this.apps
        },
        hasUserImage () {
            return false
        },
        userName () {
            return 'My Account'
        },
        urlPrefix () {
            if (!this.pub) {
                return 'apps'
            } else {
                return 'examples'
            }
        },
        pub() {
            return this.$route.meta && this.$route.meta.isPublic === true;
        },
    },
    methods: {
        onDeleteApp (app) {
            this.apps = this.apps.filter(a => a.id !== app.id)
            this.setDefaultApp()
        },
        onChangeAppProps (app) {
            const found = this.apps.find(a => a.id === app.id)
            if (found) {
                found.name = app.name
                found.previewColor = app.previewColor
                this.$forceUpdate()  
            } else {
                console.error(found, app)
            }
        },
        showAppsDialog (e) {
            this.$refs.appsDialog.show(this.apps, e)
        },
        showNewDialog (e) {
            this.$refs.createDialog.show(e)
        },

        async load() {
            if (this.pub) {
                let summaries = await Services.getModelService().findPublicSummaries();
                this.setApps(summaries);
            } else {
                let summaries = await Services.getModelService().findMyAppSummaries();
                this.setApps(summaries);
            }
        },

        async setApps(value) {
            this.logger.log(0, "setApps", "enter > " + value.length);
            value.sort((a, b) => {
                return b.lastUpdate - a.lastUpdate;
            });
            value.forEach(a => {
                if (!a.previewColor) {
                    a.previewColor = ''
                }
            })
            this.apps = value
        },
        initRoute() {
            this.logger.log(3, "initRoute", "enter > " + this.$route.params.id);
            if (this.$route.params.id) {
                this.selectedApp = this.$route.params.id
            } else {
               this.setDefaultApp()
            }
        },
        setDefaultApp () {
            if (this.apps.length > 0 && !this.defaultDispatched) {
                const app = this.apps[0]
                if (this.pub) {
                    this.$router.push(`/examples/${app.id}.html`)                   
                } else {
                    this.$router.push(`/apps/${app.id}.html`)
                }      
                this.defaultDispatched = true      
            }
        },
        onLogout () {
            Services.getUserService().logout()
            this.$emit('logout', Services.getUserService().GUEST)
            this.$router.push(`/`)                  
        }

    },
    watch: {
        $route() {
            this.logger.log(-1, "watch", "route");
            this.initRoute();
        }
    },
    async mounted() {
        this.logger = new Logger("Studio");
        this.user = Services.getUserService().getUser();
        await this.load();
        this.initRoute();
        this.logger.log(2,"mounted", "exit > ", this.user);
    }
};
</script>
  
  