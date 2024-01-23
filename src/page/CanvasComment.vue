<template>
    <div class="MatcCanvasCommentDialog" @click.stop @mousedown.stop @keyup.stop @keydown.stop>
        {{isNew}}
        <template v-if="!isNew">
            <div class="MatcCanvasCommentDialogList" v-for="c in comments" :key="c.id" >
                
                <UserComment
                    :comment="c" 
                    :user="user"
                    @delete = "onDelete"
                    @change="onMessage"
                    @status="onStatus"/>
            

            </div>
        </template>
        <div v-else
            @focus="isDirty = true"
            :class="['MatcCanvasCommentDialogMessage MatcCanvasCommentDialogMessageEditor', { 'MatcCanvasCommentDialogMessageNew': isNew }]"
            contenteditable="true"
            @blur="onChangeNew($event)"
            ref="textAreas">

            {{comment.message}}
        </div>

        <div class="MatcButtonBar MatcButtonBarCols">
            <div class="MatcButtonBarCol">
                <!-- <a class="MatcButton MatcButtonXS" @click.stop="onCancel" v-if="!isDirty">Close</a> -->
                <a class="MatcButton MatcButtonXS" @click.stop="onSave" v-if="isDirty">Save</a>
                <!-- <a class="MatcLinkButton MatcButtonXS" @click.stop="onCancel" v-if="isDirty">Cancel</a> -->
            </div>
            <!-- <div class="MatcButtonBarCol">
                <a class=" MatcLinkButton MatcButtonXS" @click.stop="onDelete" v-if="comment && comment.id">Delete</a>
            </div> -->
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
//import UserImage from './UserImage'
// import * as UIUtil from '../util/UIUtil'
// import QIcon from './QIcon'
// import QIconDropDown from './QIconDropDown'
import UserComment from 'page/UserComment'

export default {
    name: "CanvasComment",
    mixins: [DojoWidget],
    props: [],
    data: function () {
        return {
            isNew: false,
            isDirty: false,
            comment: null,
            children: [],
            user: null
        };
    },
    components: {
        //'UserImage': UserImage,
        'UserComment': UserComment,
        // 'QIcon': QIcon,
        //'QIconDropDown': QIconDropDown
    },
    computed: {
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

        onStatus (commentId, status) {
            console.debug(status)
        },
        onMessage (commentId, message) {
            console.debug(message)
        },
        onDelete(comment) {
            this.emit("delete", comment)
        },
        onCreate () {

        },
        onReply () {
            // this.$emit("reply", this.replyMessage, this.comment.id);
            // this.hasReply = false
            // this.replyMessage = ''
        },
        // getOptions (comment) {
        //     const isDoneLabel = comment.status === 'Done' ? 'Set Active' : 'Set Done'
        //     if (this.isAuthor(comment)) {
        //         return [
        //             {label: 'Edit', callback: () => this.onEdit(comment), icon: "EditPencil"},
        //             {label: isDoneLabel, callback: () => this.toggleDone(comment), icon: "CheckBoxHook"},
        //             {label: 'Delete', callback: () => this.onDelete(comment), icon: "DeleteX"}
        //         ]
        //     }
        //     return [
        //         {label: isDoneLabel, callback: () => this.toggleDone(comment), icon: "CheckBoxHook"},
        //         {label: 'Delete', callback: () => this.onDelete(comment), icon: "DeleteX"}
        //     ]
        // },
        onEdit () {
            this.isDirty = true
            setTimeout(() => {
                let textAreas = this.$refs.textAreas
                if (textAreas) {
                    textAreas[0].focus()
                }
            }, 100)
        },
        toggleDone () {
            const status = this.comment.status === 'Done' ? '' : 'Done'
            this.comment.status = status
            this.isDirty = true
        },
        setValue(c, children) {
            this.comment = lang.clone(c)
            this.children = lang.clone(children)
            this.org = c
            if (!c.id) {
                this.isDirty = true
                this.isNew = true
                setTimeout(() => {
                    let textAreas = this.$refs.newInput
                    if (textAreas) {
                        textAreas.focus()
                    }
                }, 100)
            }
        },

        onChangeNew(c, e) {
            const newText = this.stripHTML(e.target.innerText)
            if (newText !== this.comment.message) {
                this.comment.message = newText
                this.isDirty = true
            }
        },
        // isAuthor(c) {
        //     if (this.user && this.user.id === c?.user?.id) {
        //         return true
        //     }
        //     return false
        // },

        onSave() {
            this.emit("save", this.comment)
        },

        onCancel() {
            this.emit("cancel")
        },

        // onDelete() {
        //     this.emit("delete", this.comment)
        // },

        // formatDate(t, justDate) {
        //     return UIUtil.formatDate(t, justDate)
        // },

        // getCommentUserName(comment) {
        //     if ((comment.user && comment.user.name) || comment.user.lastname) {
        //         return UIUtil.getUserName(comment.user);
        //     }
        //     return "Guest";
        // },
    },


    mounted() {
        this.logger = new Logger("CanvasComment");
    }
};
</script>