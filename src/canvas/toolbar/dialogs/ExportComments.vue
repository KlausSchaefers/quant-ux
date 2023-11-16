
<template>
    <div class="MatcExportComments">

        <div class="MatcDialogTable MatcDialogTableScrollable">
            <table class="MatcToolbarTableSettingsTable">
                <thead>
                    <tr>
                        <th class="MatcDialogTableCol60">Comment</th>
                        <th>User</th>
                        <th>Created</th>
                        <th>Screen</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="c in screenComments" :key="c.id">
                        <td class="MatcDialogTableCol60">{{ c.message }}</td>
                        <td class="">{{ c.userName }}</td>
                        <td class="">{{ c.date }}</td>
                        <td class="">{{ c.screen }}</td>
                    </tr>
                </tbody>

            </table>

        </div>

        <div class="MatcExportCommentsTools">
            <a class="MatcLinkButton MatcButtonXXS" @click="download">Download</a>
        </div>


    </div>
</template>
<style lang="scss">
@import '../../../style/components/import_dialog.scss';
@import '../../../style/components/export_dialog.scss';
</style>
  
<script>


import Logger from 'common/Logger'
import ModelGeom from 'core/ModelGeom'
import lang from 'dojo/_base/lang'
//   import ZipSevice from 'services/ZipService'
//   import { saveAs } from 'file-saver';

export default {
    name: 'ExportComment',
    mixins: [],
    props: ['model', 'jwtToken', 'comments'],
    data: function () {
        return {
        }
    },
    components: {},
    computed: {
        screenComments() {
            return this.comments.map(c => {
                const result = lang.clone(c)
                const parent = ModelGeom.getHoverScreen(result, this.model)
                result.date = new Date(c.created).toLocaleDateString();
                result.userName = this.getCommentUserName(result)
                if (parent) {
                    result.screen = parent.name
                } else {
                    result.screen = 'Canvas'
                }
                return result
            })
        }
    },
    methods: {

        download () {
         
            let csvContent = 'Comment\tUser\tDate\tScreen\n'

            csvContent += this.screenComments.map((c) => {
                return `${c.message}\t${c.userName}\t${c.date}\t${c.screen}`
            }).join("\n")

            const downloadFileName = this.model.name + '.csv'

            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;"
            });
            if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveBlob(blob, downloadFileName)
            } else {
                const elem = window.document.createElement("a");
                elem.href = window.URL.createObjectURL(blob)
                elem.download = downloadFileName
                document.body.appendChild(elem)
                elem.click()
                document.body.removeChild(elem)
            }
        
        },


        getCommentUserName(comment) {
            if ((comment.user && comment.user.name) || comment.user.lastname) {
                return this.getUserName(comment.user);
            }
            return "Guest";
        },


        getUserName(user) {
            let result = "";
            if (user.name) {
                result = user.name + " ";
            }
            if (user.lastname) {
                result += user.lastname;
            }
            if (result.length == 0) {
                result = user.email;
            }

            return result;
        },


        setModel(m) {
            this.model = m;
        },

        setJwtToken(t) {
            this.jwtToken = t
        },

    },

    mounted() {
        this.logger = new Logger("ExportZip");
    }
}
</script>