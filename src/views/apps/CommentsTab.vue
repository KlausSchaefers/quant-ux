<template>
    <div class="MatcTest MatcLayout">
        <section class="">

            <div class="StudioDetailsCommentsGrid">

                <StudioComment v-for="c in filteredComments" :key="c.id" @delete="onDeleteComment" @change="onChangeComment"
                    :user="user" :comment="c" />
            </div>
        </section>
    </div>
</template>
<style lang="scss"></style>
<script>
import Logger from "common/Logger"
import DojoWidget from "dojo/DojoWidget"
import Services from "services/Services";
import StudioComment from './StudioComment'
export default {
    name: "Test",
    mixins: [DojoWidget],
    props: ["app", "test", "annotation", "events", "hash", "user"],
    data: function () {
        return {
            comments: []
        };
    },
    components: {
        'StudioComment': StudioComment
    },
    computed: {
        pub() {
            return this.$route.meta && this.$route.meta.isPublic;
        },
        urlPrefix() {
            if (this.pub) {
                return "examples";
            }
            return "apps";
        },
        filteredComments () {
            let comments = this.comments  
            return comments.toSorted((a,b) => {
                return b.created - a.created
            })
        }
    },
    methods: {
        async loadComments() {
            this.comments = await Services.getCommentService().findAll(
                this.app.id
            )
        },
        async onChangeComment (id, message) {
            const found = this.comments.find(c => c.id === id)
            if (found) {
                found.message = message
                found.modified = new Date().getTime()
                found.edited = true
				await Services.getCommentService().update(this.app.id, found)
                this.showSuccess("Comment updated");
            } else {
                console.error('Cannot find comment', id)
            }
        },
        async onDeleteComment(comment) {
            this.comments = this.comments.filter(c => c.id !== comment.id)        
            if (!this.pub) {
                await Services.getCommentService().delete(this.app.id, comment)
                this.showSuccess("Comment deleted");
            }       
        },
    },
    watch: {
        test(v) {
            // for some reason not called
            this.logger.info("watch", "test >", v);
            this.test = v;
        },
        events(v) {
            this.logger.info("watch", "events >", v);
            this.events = v;
            this.showBullet();
            this.showSessions();
        }
    },
    async mounted() {
        this.logger = new Logger("CommentsTab");
        this.loadComments()
        this.logger.info("mounted", "exit");
    }
};
</script>
  
  