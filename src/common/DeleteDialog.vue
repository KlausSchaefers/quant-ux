<template>
    <ZoomDialog ref="dialog">
        <div class="MatcDeleteDialog MatcDialog">
            <h3 class="title is-4">{{title}}</h3>
            <p class="MatcMarginBottomXL">
               {{message}} 
            </p>
            <div class="MatcButtonBar">
                <div class="MatcButton MatcButtonDanger" @click="onAction">Delete</div>
                <div class="MatcLinkButton" @click="close">Cancel</div>
            </div>
        </div>
    </ZoomDialog>
</template>
<script>
import ZoomDialog from 'common/ZoomDialog'

export default {
    name: "DeleteDialog",
    mixins: [],
    data: function () {
        return {
            title: 'Title',
            message: 'Message',
            isVisisble: false,
            apps: [],
            user: null
        };
    },
    watch: {},
    components: {
        'ZoomDialog': ZoomDialog,    
    },
    methods: {          
        close() {
            this.$refs.dialog.close()
        },
        show(title, message, target, callback) {   
            console.debug("show", title, message)       
            this.isVisisble = false
            this.title = title
            this.message = message
            this.callback = callback
            this.$refs.dialog.show(target)           
            setTimeout(() => {
                this.isVisisble = true
            }, 300)           
        },
        onAction(app) {
            if (this.callback) {
                this.callback(app)
            }
            this.close()
        }
    },

    async mounted() {
    }
};
</script>
  
  