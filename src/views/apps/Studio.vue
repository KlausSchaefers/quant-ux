<template>
    <div class="MatcStudio">
        <SplitContainer :left="192">
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

                    <div class="MatcStudioRightRow MatcMarginTop">
                        <button @click="showAppsDialog" class="MatcButton MatcButtonSecondary  MatcButtonXS">
                            <QIcon icon="Projects"></QIcon>
                            {{ $t('app.projects') }}

                        </button>
                    </div>
 
                    <div class="MatcStudioAppList MatcMarginBottom">
                        <a v-for="app in filteredAppList" :key="app.id" :href="'#/' + urlPrefix +'/' + app.id + '.html'" :class="{'MatcStudioAppListSelected' : selectedApp === app.id}">
                            <span class="MatcStudioAppListDot"/>
                            <span class="MatcStudioAppListLabel">
                                {{app.name}}
                            </span>                                      
                        </a>
                        <a v-if="hasMore" @click="showAppsDialog">
                            <span class="MatcStudioAppListDot" style="opacity: 0;"/>
                            <span class="MatcStudioAppListLabel">
                                {{$t('app.more')}}
                            </span>    
                        </a>
                    </div>

                    <div class="MatcStudioRightRow">
                        <a class="" href="#/help.html">
                            <QIcon icon="Book"/>
                            {{ $t('app.help') }}
                        </a>
                    </div>

                    <div class="MatcStudioRightRow">
                        <a class="" href="#/my-account.html">
                            <QIcon icon="Account" v-if="!hasUserImage" ></QIcon>
                            <span class="MatcUserImageCntr" v-else>
                                <img class="MatcUserImage" :src="userImage">
                            </span>
                            {{userName}}
                        </a>
                    </div>
          
                </div>
   
        
            
            </template>

            <template v-slot:right>
                <StudioOverview v-if="selectedApp" :user="user"/>
                
                io.vertx.core.Launcher

                -Dvertx.disableFileCaching=true

                run de.vommond.matc.MATC -conf matc.conf
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
            return this.apps.length > 10
        },
        filteredAppList () {
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
            this.apps = value
        },
        initRoute() {
            this.logger.log(-1, "initRoute", "enter", this.$route.params.id);
            this.selectedApp = this.$route.params.id
        },
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
        this.load();
        this.initRoute();
        this.logger.log(2,"mounted", "exit > ", this.user);
    }
};
</script>
  
  