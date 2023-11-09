x
<template>
    <div class="MatcHelpChat">
       XXX
    </div>
</template>
<style scoped>
textarea {
    height: 200px;
}
</style>

<style lang="scss">
  @import "../style/components/help_chat.scss" ;
</style>


<script>
import DojoWidget from 'dojo/DojoWidget'
import Services from 'services/Services'
//import Vue from 'vue'

export default {
    name: 'HelpButton',
    mixins:[DojoWidget],
    props: ['help', 'standalone'],
    data: function () {
        return {
            texts: [],
            selected: "getting_started",
            selectedParagraph: "",
            search: "",
            hasSideBar: true,
            hasSearch: true,
            hasNotifications: true,
            contactName: '',
            contactEmail: '',
            contactMessage:'',
            contactError: '',
            concatSucess: '',
            videoScaleFactor: 1.2
        }
    },
    components: {},
    computed: {
  
    },
    methods: {
    
    },
    watch: {
        
    },
    async mounted () {
        this.aiService = Services.getAIService()
        this.aiService.getAssistant()
    }
}
</script>