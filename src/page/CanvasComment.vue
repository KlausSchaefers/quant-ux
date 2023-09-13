<template>
    <div class="MatcCanvasCommentDialog MatcPadding" @click.stop @mousedown.stop @keyup.stop @keydown.stop>

        <div class="MatcCanvasCommentDialogList">
            <div class="MatcCanvasCommentDialogRow" v-for="c in comments" :key="c.id">
                <UserImage :user="c.user" />
                <div class="MatcCanvasCommentContent">
                    <div class="MatcCanvasCommentDialogDetails">
                        {{ formatDate(c.created) }} <span v-if="c.edited"
                            class="MatcCanvasCommentDialogDetailsEdited">Edited</span>
                    </div>
                    <div class="MatcCanvasCommentDialogMessage" v-if="!isAuthor(c)">
                        {{ comment.message }}
                    </div>
                    <textarea v-else v-model="c.message"
                        :class="['MatcCanvasCommentDialogMessage', { 'MatcCanvasCommentDialogMessageNew': isNew }]"
                        @keyup="onChange(c, $event)" ref="textAreas">

                    </textarea>

                </div>
            </div>
        </div>
        <div class="MatcButtonBar MatcButtonBarCols">
            <div class="MatcButtonBarCol">
                <a class="MatcButton MatcButtonPrimary MatcButtonXS" @click.stop="onCancel" v-if="!isDirty">Close</a>
                <a class="MatcButton MatcButtonPrimary MatcButtonXS" @click.stop="onSave" v-if="isDirty">Save</a>
                <a class="MatcLinkButton MatcButtonXS" @click.stop="onCancel" v-if="isDirty">Cancel</a>
            </div>
            <div class="MatcButtonBarCol">
                <a class=" MatcLinkButton MatcButtonXS" @click.stop="onDelete" v-if="comment && comment.id">Delete</a>
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
import UserImage from './UserImage'


export default {
    name: "CanvasComment",
    mixins: [DojoWidget],
    props: [],
    data: function () {
        return {
            isNew: false,
            isDirty: false,
            comment: null,
            user: null
        };
    },
    components: {
        'UserImage': UserImage,

    },
    computed: {
        comments() {
            if (this.comment) {
                return [this.comment]
            }
            return []
        }
    },
    methods: {
        setUser(u) {
            this.user = u
        },
        setValue(c) {
            this.comment = lang.clone(c)
            this.org = c
            if (!c.id) {
                this.isDirty = true
                this.isNew = true
                setTimeout(() => {
                    let textAreas = this.$refs.textAreas
                    if (textAreas) {
                        textAreas[0].focus()
                    }
                }, 100)
            }
        },

        onChange(c, e) {
            const newText = this.stripHTML(e.target.value)
            if (newText == c.message) {
                c.message = newText
                this.isDirty = true
            }
        },
        isAuthor(c) {
            if (this.user && this.user.id === c?.user?.id) {
                return true
            }
            return false
        },

        onSave() {
            this.emit("save", this.comment)
        },

        onCancel() {
            this.emit("cancel")
        },

        onDelete() {
            this.emit("delete", this.comment)
        },

        formatDate(t, justDate) {
            var date = new Date(t);
            if (justDate) {
                return date.toLocaleDateString();
            }
            return date.toLocaleString();
        },

        getCommentUserName(comment) {
            if ((comment.user && comment.user.name) || comment.user.lastname) {
                return this.getUserName(comment.user);
            }
            return "Guest";
        },
    },


    mounted() {
        this.logger = new Logger("CanvasComment");
    }
};
</script>