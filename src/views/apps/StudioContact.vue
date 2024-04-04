<template>
    <a class="MatcLink StudioContact" @click="showDialog">
        <QIcon icon="Mail" />
        <span class="MatcCollapseViewMinHidden">
            {{ $t('app.contact') }}
        </span>

        <ZoomDialog ref="dialog">
            <div class="MatcDialogM MatcDialog" @click.stop>
                <h1> {{ $t('app.contact') }}</h1>
                
                <div class="form-group MatcShareRow">
                    <label>Email</label>
                    <input type="text" class="form-control" v-model="email" />
                </div>
       
                <div class="form-group MatcShareRow">
                    <label>Message</label>
                    <textarea type="text" class="form-control" v-model="message" ></textarea>
                </div>

                <div class="form-group MatcShareRow">
                    <p class="MatcError">{{error}}</p>
                  
                </div>

                <div class="MatcButtonBar MatcMarginTop">
                    
                    <button class="MatcButton MatcButtonPrimary" @click="sendMail">{{$t('app.mail.send')}}</button>
                    <button class=" MatcLinkButton" @click="close">{{$t('btn.cancel')}}</button>
                    <!-- <p class="MatcButtonBarSuccess">{{success}}</p> -->
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
    props:['user'],
    mixins: [],
    data: function () {
        return {
            name:'',
            email: '',
            message: '',
            error: '',
            success:'sdfsdf  sdfsdf'
        };
    },
    components: {
        'QIcon': QIcon,
        'ZoomDialog': ZoomDialog
    },
    computed: {
    },
    methods: {
        showDialog () {
            if (this.user) {
                this.email = this.user.email
            }
            this.$refs.dialog.show(this.$el)
        },
        async sendMail() {
            if (this.email.length === 0 || this.message.length === 0) {
                this.error = this.$t('app.mail.error')
                this.$refs.dialog.shake()
            } else {
                this.error = ''
                let res = await Services.getUserService().contact(this.name, this.email, this.message)
                if (res) {
                    this.success = this.$t('app.mail.success')
                    this.$root.$emit('Success',this.$t('app.mail.success'))
                    setTimeout(() => {
                        this.$refs.dialog.close()
                    }, 500)
                }
            }
        },
        close () {
            this.$refs.dialog.close()
        }
    },
    async mounted() {
    }
};
</script>
  