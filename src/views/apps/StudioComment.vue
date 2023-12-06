<template>
    <div class="StudioComment">
        {{comment.message}} {{user}}

        <div class="StudioCommentFooter">
            {{getUserName(comment.user)}}
        </div> 
        {{formatDate(comment.created)}}
    </div>
</template>

<script>
import * as UIUtil from '../../util/UIUtil'

import Logger from "common/Logger";
export default {
    name: "StudioDetails",
    mixins: [],
    props: ["app", "user", "comment"],
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
        this.logger = new Logger("StudioComment");

    }
};
</script>
  