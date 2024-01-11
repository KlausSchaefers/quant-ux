<template>
    <div :class="'StudioComment ' + status">
        <div class="StudioCommentHeader">
            <QIconDropDown icon="Dots" :options="dotOptions" v-if="!isNew"/>
        </div>
        <div class="StudioCommentMessage" v-if="mode === 'view'">{{message}}</div>
        <textarea v-model="message" v-else @blur="onBlur"></textarea>
      

        <div v-if="isNew">
            <button class="MatcButton MatcButtonXXS MatcMarginTop" @click="onSave">Save</button> 
        </div>
        <template v-else>
            <div class="StudioCommentUser">
                {{getUserName(comment.user)}}
            </div> 
            <div class="StudioCommentFooter">
                {{formatDate(comment.created)}} <span v-if="comment.edited">(edited)</span>
            </div>
        </template>
        
    </div>
</template>

<script>
import * as UIUtil from '../../util/UIUtil'
import QIconDropDown from 'page/QIconDropDown'
import Logger from "common/Logger";
export default {
    name: "StudioDetails",
    mixins: [],
    props: ["app", "user", "comment", "isNew"],
    data: function () {
        return {
            status: '',
            isAuthor: false,
            mode: 'view',
            message: '',
           
        };
    },
    components: {
        'QIconDropDown': QIconDropDown
    },
    computed: {
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
        toggleDone () {
            const status = this.status === 'Done' ? '' : 'Done'
            this.status = status
            this.$emit("status",this.comment.id, status);
        },
        onSave () {
            this.$emit("create",this.message);
        },
        onEdit () {
            this.mode = 'edit'
        },
        onBlur () {
            if (!this.isNew) {
                this.mode = 'view'
                this.$emit("change", this.comment.id, this.message);
            }
        },
        onDelete() {
            this.$emit("delete", this.comment);
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
  