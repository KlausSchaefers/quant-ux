<template>
    <div class="MatcCanvasCommentDialog" @click.stop @mousedown.stop @keyup.stop @keydown.stop @dblclick.stop>
        <div class="MatcCanvasCommentDialogHeader" v-if="!isNew">
            <QIcon icon="SVGChevronLeft" @click="onNext(-1, $event)" />
            <QIcon icon="SVGChevronRight" @click="onNext(1, $event)"/>
        </div> 
        <div class="MatcCanvasCommentDialogContent">
            <div class="MatcCanvasCommentDialogList" v-if="comment">
                
                <UserComment 
                    v-if="!isNew"
                    :comment="comment" 
                    :user="user"
                    @delete = "onDelete"
                    @change="onChangeMessage"
                    @status="onChangeStatus"/>

                <div v-for="child in replies" :key="child.id" class="">      
                    <UserComment
                        class="UserCommentResponse"
                        :comment="child" 
                        :user="user"
                        @delete = "onDeleteChild"
                        @change="onChangeMessage"
                        @status="onChangeStatus"/>
                </div>
            </div>

            <div v-if="isNew || isReply" class="" >
                <UserCommentHeader :user="user" /> 
                <textarea v-model="newMessage" ref="newInput" class="MatcCanvasCommentDialogMessage MatcCanvasCommentDialogMessageEditor MatcMarginTopXS"></textarea>
                <div class="UserCommentButtons">
                    <button class="MatcButton MatcButtonXXS MatcMarginTopXS" @click="onCreate" v-if="isNew">Save</button> 
                    <button class="MatcButton MatcButtonXXS MatcMarginTopXS" @click="onReply" v-if="isReply">Save</button>
                    <button class="MatcButton MatcButtonXXS MatcMarginTopXS" @click="onCancel">Cancel</button>
                </div>
            </div>
            <div v-else>
                <div class="MatcCanvasCommentDialogReplyButton" @click="showReply">Reply...</div>
            </div>    
  
        </div>
       
    </div>
</template>
<style lang="scss">
@import '../style/canvas/canvas_comments.scss';
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import Logger from "common/Logger";
import lang from 'dojo/_base/lang'
import UserComment from 'page/UserComment'
import UserCommentHeader from 'page/UserCommentHeader'
import QIcon from "page/QIcon";

export default {
    name: "CanvasComment",
    mixins: [DojoWidget],
    props: [],
    data: function () {
        return {
            isNew: false,
            isReply: false,
            isDirty: false,
            newMessage: '',
            comment: null,
            children: [],
            user: null
        };
    },
    components: {
        'UserComment': UserComment,
        'UserCommentHeader': UserCommentHeader,
        'QIcon': QIcon
    },
    computed: {
        replies () {
            if (this.children) {
                return this.children.toSorted((a,b) => {
                    return a.created - b.created
                })
            }
            return []
        },
        comments() {
            if (this.comment) {
                return [this.comment].concat(this.children).toSorted((a,b) => {
                    return a.created - b.created
                })
            }
            return []
        }
    },
    methods: {
        setUser(u) {
            this.user = u
        },

        onChangeStatus (commentId, status) {
            const comment = this.comments.find(c => c.id === commentId)
            if (comment) {
                comment.status = status
                this.emit("save", comment, true)
            } else {
                this.logger.error("onChangeStatus", "Cannot find comment " + commentId)
            }
        },
        onChangeMessage (commentId, message) {
            const comment = this.comments.find(c => c.id === commentId)
            if (comment) {
                comment.message = message
                this.emit("save", comment, true)
            } else {
                this.logger.error("onChangeMessage", "Cannot find comment " + commentId)
            }
        },
        onDelete(comment) {
            this.emit("delete", comment)
        },

        onDeleteChild (child) {
            this.children = this.children.filter(c => c.id !== child.id)
            this.emit("delete", child, true)
        },
       
        onReply () {
            const reply = lang.clone(this.comment)
            delete reply.id
            delete reply._id
            reply.parentId = this.comment.id
            reply.message = this.newMessage
            this.emit("save", reply, false)
            this.newMessage = ''
            this.isReply = false
        },

        onCreate() {
            this.comment.message = this.newMessage
            this.emit("save", this.comment)
        },

        showReply () {
            this.isReply = true
            setTimeout(() => {
                if (this.$refs.newInput) {
                    this.$refs.newInput.focus()
                }
            }, 100)
        },
      
        setValue(c, children) {
            this.comment = lang.clone(c)
            this.children = lang.clone(children)
            this.org = c
            if (!c.id) {
                this.isDirty = true
                this.isNew = true
                setTimeout(() => {
                    if (this.$refs.newInput) {
                        this.$refs.newInput.focus()
                    }
                }, 100)
            }
        },

        onNext (i, e) {
            this.emit("next", i, e)
        },

        onCancel() {
            this.emit("cancel")
        }
    },


    mounted() {
        this.logger = new Logger("CanvasComment");
    }
};
</script>