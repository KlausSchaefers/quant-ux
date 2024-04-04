<template>
    <div :class="'UserComment ' + status">
        <div class="UserCommentHeader">
            <div class="UserCommentUser">
                {{getUserName(comment.user)}}
            </div> 
            <QIconDropDown icon="Dots" :options="dotOptions"/>
        </div>
         
        <div class="UserCommentFooter">
            {{formatDate(comment.created)}} <span v-if="comment.edited">(edited)</span>
        </div>

        <div class="UserCommentMessage" v-if="mode === 'view'">{{message}}</div>
        <div class="UserCommentElement" v-else>
            <textarea v-model="message" class="MatcMarginTopXS"></textarea>
            <div class="UserCommentButtons">
                <button class="MatcButton MatcButtonXXS MatcMarginTopXS" @click="onBlur">Save</button>
                <button class="MatcButton MatcButtonXXS MatcMarginTopXS" @click="onCancel">Cancel</button> 
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    @import "../style/components/user_comment.scss";
</style>

<script>
import * as UIUtil from '../util/UIUtil'
import QIconDropDown from 'page/QIconDropDown'
import Logger from "common/Logger";
export default {
    name: "UserComment",
    mixins: [],
    props: ["user", "comment"],
    data: function () {
        return {
            status: '',
            hasReply: false,
            isAuthor: false,
            mode: 'view',
            message: '',
            replyMessage: ''
        };
    },
    components: {
        'QIconDropDown': QIconDropDown
    },
    computed: {
        dotOptions () {
            const isDoneLabel = this.status === 'Done' ? 'Set Active' : 'Set Done'
            const isDoneIcon = this.status === 'Done' ? 'CheckBoxOff' : 'CheckBoxOn'
            const deleteLabel = this.comment.parentId ? 'Delete' : 'Delete'
            if (this.isAuthor) {
                return [
                    {label: 'Edit', callback: (o, e) => this.onEdit(e), icon: "EditPencil"},
                    {label: isDoneLabel, callback: (o, e) => this.toggleDone(e), icon: isDoneIcon},
                    {label: deleteLabel, callback: (o, e) => this.onDelete(e), icon: "Delete"}
                ]
            }
            return [
                {label: isDoneLabel, callback: (o, e) => this.toggleDone(e), icon: isDoneIcon},
                {label: deleteLabel, callback: (o, e) => this.onDelete(e), icon: "Delete"}
            ]
        }
    },
    methods: {
        toggleDone () {
            const status = this.status === 'Done' ? '' : 'Done'
            this.status = status
            this.$emit("status",this.comment.id, status);
        },

        onEdit () {
            this.mode = 'edit'
        },
        onBlur () {          
            this.mode = 'view'
            this.$emit("change", this.comment.id, this.message);       
        },
        onCancel () {
            this.message = this.comment.message
            this.mode = 'view'
        },
        onDelete() {
            this.$emit("delete", this.comment);
        },
        formatDate(ts) {
            return UIUtil.formatDate(ts)
        },
        getUserName(user) {
            return UIUtil.getUserName(user)
        },
        showReply () {
            this.hasReply = true
            setTimeout(() => {
                this.$refs.replyInput.focus()
            }, 200)
        }
    },
    watch: {
  
    },
    async mounted() {
        this.logger = new Logger("UserComment");
        this.message = this.comment.message
        this.status = this.comment.status 
        this.isAuthor = this?.user?.id === this?.comment?.user?.id
        if (this.isNew) {
            this.mode = 'edit'
        }
    }
};
</script>
  