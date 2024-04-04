<template>
    <div :class="'StudioComment ' + status">

        <UserComment 
            v-if="!isNew"
            :comment="comment" 
            :user="user"
            @delete = "onDelete"
            @cancel="onCancel"
            @change="onChange"
            @status="onStatus"/>
       
        <div v-for="child in children" :key="child.id" class="StudioCommentResponse">    
            <UserComment 
                class="UserCommentResponse"
                v-if="!isNew"
                :comment="child" 
                :user="user"
                @cancel="onCancel"
                @delete = "onDelete"
                @change="onChange"
                @status="onStatus"/>
        </div>

        <div v-if="isNew" class="StudioCommentElement MatcMarginTop" >
            <UserCommentHeader :user="user" /> 
            <textarea v-model="message" class="MatcMarginTopXS"></textarea>
            <div class="UserCommentButtons">
                <button class="MatcButton MatcButtonXXS MatcMarginTopXS" @click="onCreate">Save</button>
                <button class="MatcButton MatcButtonXXS MatcMarginTopXS" @click="onCancel">Cancel</button> 
            </div>
        </div>

      
        <div class="StudioCommentReplyCntr" v-if="!isNew">
            <a class="StudioCommentReply" v-if="!hasReply" @click="showReply">Reply...</a>
            <template v-else>
                <UserCommentHeader :user="user" /> 
                <textarea v-model="replyMessage" ref="replyInput" class="MatcMarginTopXS"></textarea>
                <div class="UserCommentButtons">
                    <button class="MatcButton MatcButtonXXS MatcMarginTopXS" @click="onReply">Save</button> 
                    <button class="MatcButton MatcButtonXXS MatcMarginTopXS" @click="onCancel">Cancel</button> 
                </div>
            </template>
        </div>


        
    </div>
</template>

<script>
import UserComment from 'page/UserComment'
import UserCommentHeader from 'page/UserCommentHeader'
import Logger from "common/Logger";
import * as UIUtil from '../../util/UIUtil'
export default {
    name: "StudioComment",
    mixins: [],
    props: ["user", "comment", "isNew"],
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
        'UserComment': UserComment,
        'UserCommentHeader': UserCommentHeader
    },
    computed: {
        children () {
            if (this.comment.children) {
                return this.comment.children.toSorted((a,b) => {
                    return a.created - b.created
                })
            }
            return []
        },
        dotOptions () {
            const isDoneLabel = this.status === 'Done' ? 'Set Active' : 'Set Done'
            if (this.isAuthor) {
                return [
                    {label: 'Edit', callback: (o, e) => this.onEdit(e), icon: "EditPencil"},
                    {label: isDoneLabel, callback: (o, e) => this.toggleDone(e), icon: "CheckBoxHook"},
                    {label: 'Delete', callback: (o, e) => this.onDelete(e), icon: "DeleteX"}
                ]
            }
            return [
                {label: isDoneLabel, callback: (o, e) => this.toggleDone(e), icon: "CheckBoxHook"},
                {label: 'Delete', callback: (o, e) => this.onDelete(e), icon: "DeleteX"}
            ]
        }
    },
    methods: {
        onStatus (commentId, status) {
            this.$emit("status",commentId, status);
        },
        onChange (commentId, message) {
            this.$emit("change", commentId, message);            
        },
        onDelete(comment) {
            this.$emit("delete", comment);
        },
        onCreate () {
            this.$emit("create",this.message);
        },
        onReply () {
            this.$emit("reply", this.replyMessage, this.comment.id);
            this.hasReply = false
            this.replyMessage = ''
        },
        onCancel () {
            this.hasReply = false
            this.$emit("cancel")
        },
        showReply () {
            this.hasReply = true
            setTimeout(() => {
                this.$refs.replyInput.focus()
            }, 200)
        },
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
        this.message = this.comment.message
        this.status = this.comment.status 
        this.isAuthor = this?.user?.id === this?.comment?.user?.id
        if (this.isNew) {
            this.mode = 'edit'
        }
    }
};
</script>
  