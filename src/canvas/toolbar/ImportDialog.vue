
<template>
     <div class="" >
        <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab='images'" :class="{'MatcToolbarTabActive': tab === 'images'}">{{ getNLS('dialog.import.tab-images')}}</a>
            <a @click="tab='figma'" :class="{'MatcToolbarTabActive': tab === 'figma'}">{{ getNLS('dialog.import.tab-figma')}}</a>
        </div>
        <div v-if="tab=== 'images'">
            <h3>{{ getNLS('dialog.import.images-title')}}</h3>
        </div>
        <div v-if="tab=== 'figma'">
            <h3>{{ getNLS('dialog.import.figma-title')}}</h3>
        </div>

	</div>
</template>
<style lang="scss">
    @import url('../../style/import_dialog.scss');
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'

export default {
    name: 'ImportDialog',
    mixins:[DojoWidget],
    data: function () {
        return {
            tab: "images"
        }
    },
    components: {},
    methods: {
        setModel (m){
            this.model = m;

        },

        setJwtToken(t) {
            this.jwtToken = t
        }
    },
    mounted () {
        this.logger = new Logger("ImportDialog");
    }
}
</script>