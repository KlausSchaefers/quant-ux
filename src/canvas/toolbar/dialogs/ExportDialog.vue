
<template>
     <div class="MatchImportDialog MatchExportDialog MatcDialog">

        <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="showImageExport()" :class="{'MatcToolbarTabActive': tab === 'images'}">{{ getNLS('dialog.export.tab-images')}}</a>
            <a @click="tab='github'" v-if="hasGit" :class="{'MatcToolbarTabActive': tab === 'github'}">{{ getNLS('dialog.export.tab-github')}}</a>
            <a @click="tab='zip'" :class="{'MatcToolbarTabActive': tab === 'zip'}">{{ getNLS('dialog.export.tab-zip')}}</a>
            <a @click="showComments()" :class="{'MatcToolbarTabActive': tab === 'comments'}">{{ getNLS('dialog.export.tab-comments')}}</a>
        </div>
        <div v-if="isPublic">
             <div class="MatchImportDialogCntr">
             {{ getNLS('dialog.import.error-public')}}
            </div>
        </div>

        <div v-else class="MatcExportDialogCntr">
            <div v-show="tab=== 'images'" ref="imageCntr">
            </div>

             <div v-show="tab=== 'github'">
                <!-- <ExportGit :model="model" :jwtToken="jwtToken" ref="exportGit" /> -->
            </div>

  
            <ExportComments :model="model" :jwtToken="jwtToken" :comments="comments" ref="" v-if="comments" v-show="tab=== 'comments'"></ExportComments>
      

            <div v-show="tab=== 'zip'">
                <ExportZip :model="model" :jwtToken="jwtToken" ref="exportZip" />
            </div>
        </div>

        <div class="MatcError">
            {{errorMSG}}
        </div>

        <div class=" MatcButtonBar MatcMarginTop">
            <a class=" MatcButton MatcButtonPrimary" v-if="tab === 'github'" @click.stop="onExport">{{ getNLS('btn.export')}}</a>
            <a class=" MatcButton MatcButtonPrimary" @click.stop="onCancel">{{ getNLS('btn.close')}}</a>
        </div>



	</div>
</template>
<style lang="scss">
    @import '../../../style/components/import_dialog.scss';
    @import '../../../style/components/export_dialog.scss';
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import Util from 'core/Util'
import ExportImages from './ExportImages'
import ExportZip from './ExportZip'
import ExportComments from './ExportComments'

export default {
    name: 'GitExport',
    mixins:[Util, DojoWidget],
    data: function () {
        return {
            hasGit: false,
            comments: false,
            tab: "images",
            zoom: 1,
            errorMSG: '',
            progressMSG: '',
            model: null,
            jwtToken: '',
            isPublic: false,
            width: 150,
            height: 150
        }
    },
    components: {
      //'ExportGit': ExportGit,
      'ExportZip': ExportZip,
      'ExportComments': ExportComments
    },
    computed: {
    },
    methods: {
        showImageExport () {
          this.tab = 'images'
          if (this.downloader) {
            this.downloader.onFocus()
          }
        },

        setModel (m){
          this.model = m;

          this.downloader = this.$new(ExportImages);
          this.downloader.setJwtToken(this.jwtToken);
          this.downloader.placeAt(this.$refs.imageCntr);
          this.downloader.setModel(m);
          if (this.tab === 'images') {
            setTimeout(() => {
              this.downloader.onFocus()
            }, 30)
          }
        },

        setPublic (isPublic) {
          this.isPublic = isPublic
        },

        setCommentService (s) {
          this.commentService = s
        },

        setJwtToken(t) {
          this.jwtToken = t
        },

        setZoom (z) {
          this.zoom = z
        },

        async showComments() {
          this.tab='comments'
          if (this.commentService) {
            this.comments =  await this.commentService.find(this.model.id, 'ScreenComment')
          }
        },

        onCancel () {
          if (this.downloader) {
            this.downloader.cleanUp()
          }
          this.emit('cancel')
        },

        async onExport () {
          if (this.tab === 'images') {
            this.errorMSG = "Press on the images to download"
          }

          if (this.tab === 'github') {
            this.errorMSG = ""
            this.$refs.exportGit.writeToGit()
          }
        }
    },
    mounted () {
        this.logger = new Logger("ExportDialog");
    }
}
</script>