<template>
    <ZoomDialog ref="dialog">
        <div class="MatcAppsDialog MatcDialog">
            <AppList :pub="false" :canAdd="false" @select="onSelected" :hasSelect="true" :hasFocus="true" v-if="isVisisble" ref="appList"/>

        </div>
    </ZoomDialog>
</template>
<script>
import ZoomDialog from 'common/ZoomDialog'
import AppList from "page/AppList";
import Logger from "common/Logger";

export default {
    name: "AppListDialog",
    mixins: [],
    data: function () {
        return {
            isVisisble: false,
            apps: [],
            user: null
        };
    },
    watch: {},
    components: {
        'ZoomDialog': ZoomDialog,
        'AppList': AppList
    },
    methods: {          
        close() {
            this.$refs.dialog.close()
        },
        show(summaries, e) {          
            this.isVisisble = false
            this.$refs.dialog.show(e.target)
            this.apps = summaries
            setTimeout(() => {
                this.isVisisble = true
            }, 300)
           
        },
        onSelected(app) {
            if (this.callback) {
                this.callback(app)
            }
            this.close()
        }
    },

    async mounted() {
        this.log = new Logger("AppList");
    }
};
</script>
  
  