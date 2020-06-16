
<template>
     <div class="MatchImportDialog" @dragover="onDragEnter" @dragenter="onDragEnter" @dragleave="onDragLeave" @drop="onDrop">
        <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab='images'" :class="{'MatcToolbarTabActive': tab === 'images'}">{{ getNLS('dialog.import.tab-images')}}</a>
            <a @click="tab='figma'" :class="{'MatcToolbarTabActive': tab === 'figma'}">{{ getNLS('dialog.import.tab-figma')}}</a>
        </div>
        <div v-if="tab=== 'images'">

            <div :class="['MatchImportDialogDropZone MatchImportDialogCntr', {'MatchImportDialogDropZoneHover': hasDrop}]">
                <span class="MatcHint" v-if="uploadFiles.length === 0">{{ getNLS('dialog.import.images-drop-msg')}}</span>
                <div class="MatchImportDialogPreview" v-for="(file,i) in uploadFiles" :key="file.name" :style="{'height': previewHeight, 'width': previewWidth}">
                    <img :src="uploadPreviews[i]" :alt="file.name"/>
                </div>
            </div>

        </div>
        <div v-if="tab=== 'figma'">
            <div class="MatchImportDialogCntr">

            </div>
        </div>
         <div v-if="tab=== 'progress'">
            <div class="MatchImportDialogCntr">
                <span class="MatcHint" v-if="uploadFiles.length === 0">{{ getNLS('dialog.import.progress-title')}}</span>
            </div>
        </div>
        <div class="MatcError">
            {{errorMSG}}
        </div>

        <div class=" MatcButtonBar MatcMarginTop">

            <a class=" MatcButton" @click="onSave">{{ getNLS('btn.save')}}</a>
            <a class=" MatcLinkButton" @click="onCancel">{{ getNLS('btn.cancel')}}</a>
        </div>

         <div v-if="tab=== 'log'">

        </div>

	</div>
</template>
<style lang="scss">
    @import '../../style/import_dialog.scss';
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import Util from 'core/Util'
import Services from 'services/Services'

export default {
    name: 'ImportDialog',
    mixins:[Util, DojoWidget],
    data: function () {
        return {
            tab: "images",
            hasDrop: false,
            uploadFiles: [],
            uploadPreviews: [],
            zoom: 1,
            errorMSG: ''
        }
    },
    components: {},
    computed: {
        previewWidth () {
            return '100px'
        },
        previewHeight () {
            if (this.model) {
                let factor = this.model.screenSize.w  / 100
                return this.model.screenSize.h / factor + 'px'
            }
            return '200px'
        }
    },
    methods: {
        setModel (m){
            this.model = m;
        },

        setController (controller) {
            this.controller = controller
        },

        setCanvas(c){
            this.canvas = c
        },

        setJwtToken(t) {
            this.jwtToken = t
        },

        setZoom (z) {
            this.zoom = z
        },

        onCancel () {
            this.$emit('cancel')
        },

        async onSave () {
            if (this.tab === 'images') {
                this.tab = 'progress'
                await this.uploadImagesAndCreateScreens()
            }
            this.$emit('save')
        },

        async uploadImagesAndCreateScreens () {
            this.logger.log(-1, 'uploadImagesAndCreateScreens', 'enter')
            if (!this.model) {
                this.logger.error('uploadImagesAndCreateScreens', 'no model')
                return
            }

		    let url = '/rest/images/' + this.model.id;
            let imageService = Services.getImageService()
            let promisses = this.uploadFiles.map(file => {
                var formData = new FormData();
				formData.append('file', file);
                return imageService.upload(url, formData)
            })

            let results = await Promise.all(promisses)
            let uploads = results.flatMap(str => {
                let parsed = JSON.parse((str))
	            return parsed.uploads;
            })
            let pos = this.getCanvasCenter()
            let screens = uploads.map((upload,i ) => {

				let x = pos.x + (50 + this.model.screenSize.w) * i;
                let y = pos.y
                let screen = this.createEmptyScreen(x,y, upload.name);
                screen.w = this.model.screenSize.w
                screen.h = this.model.screenSize.h

                screen.style.backgroundImage = {
                    url : upload.url,
                    w : upload.width,
                    h : upload.height
                };
                return screen
            })
            this.controller.addScreensAndWidgets({screens: screens});
        },

        getCanvasCenter () {
            // we have to take teh inverse
            return {
                x: Math.max(50, this.getZoomed(-1 * (this.canvas.domPos.x + this.canvas.canvasPos.x - 200), 1 / this.zoom)),
                y: Math.max(50, this.getZoomed(-1 * (this.canvas.domPos.y + this.canvas.canvasPos.y - 200), 1 / this.zoom)),
            }
        },

        onDragEnter (e) {
            e.stopPropagation()
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
            this.hasDrop = true
            this.tab = 'images'
        },

        onDragLeave (e) {
            e.stopPropagation()
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
            this.hasDrop = false
        },

        onDrop (e) {
            e.stopPropagation()
            e.preventDefault()
            let files = e.dataTransfer.files
            this.hasDrop = false
            this.showFiles(files)
        },
        showFiles (files) {
            this.logger.log(-1, 'showFiles', 'enter', files)
            this.uploadFiles = []
            this.uploadPreviews = []
            for (var i = 0; i < files.length; i++) {
                let file = files[i];
                if (this.isAllowedFileType(file)) {
                    this.uploadFiles.push(file)
                    try {
                        let reader = new FileReader()
                        reader.onload =  () => {
                            this.uploadPreviews.push(reader.result)
                        }
                        reader.readAsDataURL(file)
                    } catch (err) {
                        this.logger.error('showFiles', 'error', err)
                    }
                }
            }
        },
        isAllowedFileType (file) {
            if(file.size > 50000000){
                this.errorMSG = this.getNLS('dialog.import.error-too-big')
                return false
            }
            return true
        }


    },
    mounted () {
        this.logger = new Logger("ImportDialog");
    }
}
</script>