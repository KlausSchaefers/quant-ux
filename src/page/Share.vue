
<template>
     <div class="MatcShareDialog" @keydown.stop="" @keyup.stop="" @keypress.stop="">
        <div class="MatcMarginTop MatcShareRow">
            <span>Test</span>
            <input type="text" class="form-control" :value="testLink" @focus="select">
            <a class="MatcShareIcon" :href="testLink" target="_QuantUXTest">
                <span class="mdi mdi-share" />
            </a>
        </div>

        <div class="MatcMarginTop MatcShareRow">
            <span>Share and Comment</span>
            <input type="text" class="form-control" :value="shareLink" @focus="select">
            <a class="MatcShareIcon" :href="shareLink" target="_QuantUXShare">
                <span class="mdi mdi-share" />
            </a>
        </div>

        <div class="MatcMarginTop MatcShareRow">
            <span>Code Generation</span>
            <input type="text" class="form-control" :value="`${hash}`" @focus="select" ref="hashInput">
             <a class="MatcShareIcon" @click="copy" target="_QuantUXShare">
                <span class="mdi mdi-content-copy" />
            </a>
        </div>
    </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'

export default {
    name: 'ShareForm',
    mixins:[DojoWidget],
    data: function () {
        return {
            isPublic: false,
            invitation: '--- Loading ---'
        }
    },
    computed: {
        base () {
          return location.protocol + "//" + location.host;
        },
        hash () {
            return this.invitation
        },
        testLink () {
            let testURL = this.base +"/#/test.html?h=" + this.hash
            if (this.isPublic) {
                testURL += "&log=false"
            }
            return testURL
        },
        shareLink () {
            let testURL = this.base +"/#/share.html?h=" + this.hash
            if (this.isPublic) {
                testURL += "&log=false"
            }
            return testURL
        }
    },
    methods: {
        setInvitation (inv) {
            this.invitation = inv
        },
        setPublic (p) {
            this.isPublic = p
        },
        copy () {
            this.$refs.hashInput.select()
            document.execCommand('copy');
            this.showSuccess('Copied to clipboard')
        },
        select (e) {
            if (e.target) {
                e.target.select()
                document.execCommand('copy');
                this.showSuccess('Copied to clipboard')
            }
        }
    }, 
    mounted () {
    }
}
</script>