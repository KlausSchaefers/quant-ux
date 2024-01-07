<template>
    <div class="MatcCanvasCommentDialog" @click.stop @mousedown.stop @keyup.stop @keydown.stop>

        <div class="MatcCanvasCommentDialogList">
            <div :class="'MatcCanvasCommentDialogRow ' + c.status" v-for="c in comments" :key="c.id">

                <div class="MatcCanvasCommentContent">
               
                    <div class="MatcCanvasCommentDialogDetails">
                        <div class="MatcCanvasCommentDialogDetailsMeta">
                            <UserImage :user="c.user" v-if="false"/>
                            <span class="MatcCanvasCommentDialogDetailsName">
                            {{getCommentUserName(c)}}
                            </span>
                            - {{ formatDate(c.created) }} 
                        </div>
                  
                        <QIconDropDown icon="Dots" :options="getOptions(c)" v-if="!isNew"/>
                        <!-- <QIcon icon="Delete" @click.stop="onDelete" v-if="comment && comment.id"></QIcon> -->
                         
                         <!-- <span v-if="c.edited" class="MatcCanvasCommentDialogDetailsEdited">Edited</span> -->
                    </div>
                    <div class="MatcCanvasCommentDialogMessage" v-if="!isAuthor(c)">
                        {{ comment.message }}
                    </div>
                    <div v-else
                        @focus="isDirty = true"
                        :class="['MatcCanvasCommentDialogMessage MatcCanvasCommentDialogMessageEditor', { 'MatcCanvasCommentDialogMessageNew': isNew }]"
                        contenteditable="true"
                        @blur="onChange(c, $event)"
                        ref="textAreas">

                        {{c.message}}
                    </div>

                </div>
            </div>
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
import UserImage from './UserImage'
import * as UIUtil from '../util/UIUtil'
// import QIcon from './QIcon'
import QIconDropDown from './QIconDropDown'

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
        // 'QIcon': QIcon,
        'QIconDropDown': QIconDropDown
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
        getOptions (comment) {
            const isDoneLabel = comment.status === 'Done' ? 'Set Active' : 'Set Done'
            if (this.isAuthor(comment)) {
                return [
                    {label: 'Edit', callback: () => this.onEdit(comment), icon: "EditPencil"},
                    {label: isDoneLabel, callback: () => this.toggleDone(comment), icon: "CheckBoxHook"},
                    {label: 'Delete', callback: () => this.onDelete(comment), icon: "DeleteX"}
                ]
            }
            return [
                {label: isDoneLabel, callback: () => this.toggleDone(comment), icon: "CheckBoxHook"},
                {label: 'Delete', callback: () => this.onDelete(comment), icon: "DeleteX"}
            ]
        },
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
            const newText = this.stripHTML(e.target.innerText)
            if (newText !== c.message) {
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
            return UIUtil.formatDate(t, justDate)
        },

        getCommentUserName(comment) {
            if ((comment.user && comment.user.name) || comment.user.lastname) {
                return UIUtil.getUserName(comment.user);
            }
            return "Guest";
        },
    },


    mounted() {
        this.logger = new Logger("CanvasComment");
    }
};
</script>