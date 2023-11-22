<template>
    <div class="MatcStudio">
        <SplitContainer :left="250">
            <template v-slot:left>
                {{urlPrefix}}
                <div v-for="app in apps" :key="app.id">
                    <a :href="'#/' + urlPrefix +'/' + app.id + '.html'">{{app.name}}</a>
                </div>
            </template>

            <template v-slot:right>
                <StudioOverview v-if="selectedApp" :user="user"/>
                
            </template>

        </SplitContainer>
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
        'StudioOverview': StudioOverview
        //AppList: AppList
    },
    computed: {
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
        async load() {
            if (this.pub) {
                let summaries = await Services.getModelService().findPublicSummaries();
                this.setLoadingPreview(summaries);
            } else {
                let summaries = await Services.getModelService().findMyAppSummaries();
                this.setLoadingPreview(summaries);
            }
        },

        async setLoadingPreview(value) {
            this.logger.log(0, "setLoadingPreview", "enter > " + value.length);
            value.sort((a, b) => {
                return b.lastUpdate - a.lastUpdate;
            });
            this.apps = value
            // if (this.pub) {
            //     let apps = await Services.getModelService().findPublic();
            //     this.setApps(apps);
            // } else {
            //     let apps = await Services.getModelService().findMyApps();
            //     this.setApps(apps);
            // }
        },
        setApps (apps) {
            this.apps = apps
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
  
  