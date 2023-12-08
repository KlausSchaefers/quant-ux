<template>
    <div class="StudioComment">
        <div class="StudioCommentHeader">
            <QIconDropDown icon="Dots" :options="dotOptions"/>
        </div>
        <div class="StudioCommentMessage" v-if="mode === 'view'">
            {{message}}
        </div>
        <textarea v-model="message" v-else @blur="onBlur"></textarea>
      

        <div class="StudioCommentUser">
            {{getUserName(comment.user)}}
        </div> 
        <div class="StudioCommentFooter">
            {{formatDate(comment.created)}} <span v-if="comment.edited">(edited)</span>
        </div>
        
    </div>
</template>

<script>
import * as UIUtil from '../../util/UIUtil'
import QIconDropDown from 'page/QIconDropDown'
import Logger from "common/Logger";
export default {
    name: "StudioDetails",
    mixins: [],
    props: ["app", "user", "comment"],
    data: function () {
        return {
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
            if (this.isAuthor) {
                return [
                    {label: 'Edit', callback: (o, e) => this.onEdit(e), icon: "EditPencil"},
                    {label: 'Delete', callback: (o, e) => this.onDelete(e), icon: "DeleteX"}
                ]
            }
            return [
                {label: 'Delete', callback: (o, e) => this.onDelete(e), icon: "DeleteX"}
            ]
        }
    },
    methods: {
        onEdit () {
            this.mode = 'edit'
        },
        onBlur () {
            this.mode = 'view'
            this.$emit("change", this.comment.id, this.message);
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
        this.isAuthor = this?.user.id === this?.comment?.user.id
    }
};
</script>
  