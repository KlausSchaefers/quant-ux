<template>
    <div class="UserComment">
        <div class="UserCommentHeader">
            <div class="UserCommentUser">
                {{getUserName(user)}}
            </div>
        </div>         
        <div class="UserCommentFooter">
            {{formatDate(new Date().getTime())}}
        </div>
    </div>
</template>

<style lang="scss">
    @import "../style/components/user_comment.scss";
</style>

<script>
import * as UIUtil from '../util/UIUtil'
export default {
    name: "UserCommentHeader",
    mixins: [],
    props: ["user"],
    data: function () {
        return {
        };
    },
    components: {
    },
    computed: {
    },
    methods: {       
        formatDate(ts) {
            return UIUtil.formatDate(ts)
        },
        getUserName(user) {
            return UIUtil.getUserName(user)
        }
    },
    watch: {
    },
    async mounted() {
    }
};
</script>
  