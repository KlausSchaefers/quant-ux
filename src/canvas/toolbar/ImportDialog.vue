
<template>
     <div class="MatchImportDialog" @dragover="onDragEnter" @dragenter="onDragEnter" @dragleave="onDragLeave" @drop="onDrop">
        <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab='images'" :class="{'MatcToolbarTabActive': tab === 'images'}">{{ getNLS('dialog.import.tab-images')}}</a>
            <a @click="tab='figma'" :class="{'MatcToolbarTabActive': tab === 'figma'}">{{ getNLS('dialog.import.tab-figma')}}</a>
        </div>
        <div v-if="tab=== 'images'">

            <div :class="['MatchImportDialogDropZone MatchImportDialogCntr', {'MatchImportDialogDropZoneHover': hasDrop}]">
                <span class="MatcHint" v-if="uploadFiles.length === 0">{{ getNLS('dialog.import.images-drop-msg')}}</span>
                <div class="MatchImportDialogPreview MatcToolbarDropDownButtonItem" v-for="(file,i) in uploadFiles" :key="file.name" :style="{'height': previewHeight, 'width': previewWidth}">
                    <img :src="uploadPreviews[i]" :alt="file.name"/>
                </div>
                <input type="file" @change="onFileChange" >
            </div>

        </div>
        <div v-if="tab=== 'figma'">
            <div class="MatchImportDialogCntr">

            <div class="field ">
                <label>{{ getNLS('dialog.import.figma-key')}}
                    <a  target="figma" href="https://www.figma.com/developers/api#access-tokens">
                        <span class="mdi mdi-help-circle"></span>
                    </a>
                    </label>
                <input type="text" class="input" v-model="figmaAcccessKey" />
            </div>

            <div class="field">
                <label>{{ getNLS('dialog.import.figma-url')}}</label>
                <input type="text" class="input" v-model="figmaUrl" />
            </div>


            </div>
        </div>
         <div v-if="tab=== 'progress'">
            <div class="MatchImportDialogCntr">
                <span class="MatcHint" >
                    {{progressMSG}}
                    <span class="MatcUploadProgressCnr">
                        <span class="MatcUploadProgress" ref="progressBar" :style="'width:' + progessPercent + '%'"/>
                    </span>
                </span>
            </div>
        </div>
        <div class="MatcError">
            {{errorMSG}}
        </div>

        <div class=" MatcButtonBar MatcMarginTop">

            <a class=" MatcButton" @click.stop="onSave">{{ getNLS('btn.import')}}</a>
            <a class=" MatcLinkButton" @click.stop="onCancel">{{ getNLS('btn.cancel')}}</a>
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
import FigmaService from 'services/FigmaService'

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
            errorMSG: '',
            progressMSG: '',
            progessPercent: 0,
            figmaAcccessKey: '',
            figmaUrl: ''
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
            if (this.tab === 'figma' && this.isValidFigmaConfig()) {

                this.tab = 'progress'
                await this.importFigma(this.figmaAcccessKey, this.figmaUrl)
            }
            this.$emit('save')
        },

        isValidFigmaConfig () {
            if (!this.figmaAcccessKey) {
                this.errorMSG = this.getNLS('dialog.import.error-figma-key')
                return false
            }
            if (!this.figmaUrl) {
                this.errorMSG = this.getNLS('dialog.import.error-figma-url')
                return false
            }
            if (this.figmaUrl.indexOf('https://www.figma.com/file/') !== 0) {
                this.errorMSG = this.getNLS('dialog.import.error-figma-url')
                return false
            }
            if (!this.getFigmaFileKey(this.figmaUrl)) {
                this.errorMSG = this.getNLS('dialog.import.error-figma-url')
                return false
            }
            return true
        },

        getFigmaFileKey (url) {
            let parts = url.split('/')
            if (parts.length >= 5) {
                return parts[4]
            }
        },

        async importFigma (accessKey, url, importChildren = false) {
            this.logger.log(-1, 'importFigma', 'enter', url)
            localStorage.setItem('quxFigmaAccessKey', accessKey)
            localStorage.setItem('quxFigmaUrl', url)
            let fileId = this.getFigmaFileKey(url)

            try {
                let figmaService = new FigmaService(accessKey)
                this.setProgress(0, 'dialog.import.figma-progress-file')
                let model = await figmaService.get(fileId, importChildren)
                if (model) {
                    this.logger.log(-1, 'importFigma', 'model', model)
                    let vectorWidgets = this.getImagesWithFigmaImage(model, importChildren)

                    await this.downloadFigmaImages(vectorWidgets)

                    let minX = 1000000
                    let minY = 1000000
                    Object.values(model.screens).forEach(screen => {
                        minX = Math.min(minX, screen.x)
                        minY = Math.min(minY, screen.y)
                    })

                    /**
                     * Set to correct position
                     */
                    let pos = this.getCanvasCenter()
                    let offsetX = pos.x - minX
                    let offsetY = pos.y - minY
                    Object.values(model.screens).forEach(screen => {
                        screen.x += offsetX
                        screen.y += offsetY
                        return screen
                    })
                    Object.values(model.widgets).forEach(widget => {
                        widget.x += offsetX
                        widget.y += offsetY
                        return widget
                    })


                    this.controller.addScreensAndWidgets(model);
                } else {
                    throw new Error('Could not download figma. Servivce returned null')
                }
            } catch (err) {
                this.logger.error('importFigma', 'Cannot import figma')
                this.logger.sendError(err)
                this.errorMSG = this.getNLS('dialog.import.error-figma-load')
                this.tab = 'figma'
            }
        },

        getImagesWithFigmaImage (model, importChildren) {
            if (importChildren) {
                return Object.values(model.widgets).filter(w => w.props && w.props.figmaImage)
            } else {
                return Object.values(model.screens).filter(w => w.props && w.props.figmaImage)
            }
        },

        async downloadFigmaImages (vectorWidgets) {
            this.setProgress(20)
            let total = vectorWidgets.length * 2;
            let done = 0
            let imageService = Services.getImageService()
            let url = '/rest/images/' + this.model.id;
            let promisses = vectorWidgets.map(widget => {
                let figmaImage = widget.props.figmaImage
                this.logger.log(-1, 'downloadFigmaImages', 'enter', figmaImage)
                return new Promise ((resolve, reject) => {
                    var myRequest = new Request(figmaImage);
                    fetch(myRequest).then(response => response.blob()).then(blob => {
                        done++
                        this.setProgress(((done / total) * 80) + 20)

                        var formData = new FormData()
                        formData.append(widget.name +'.png', blob, widget.name +'.png')
                        imageService.upload(url, formData).then(uploadResponse => {
                            uploadResponse = JSON.parse(uploadResponse)
                            let upload = uploadResponse.uploads[0]
                            if (upload) {
                                widget.style.backgroundImage = {
                                    url: upload.url,
                                    w: upload.width,
                                    h: upload.height
                                };
                            }

                            done++
                            this.setProgress(((done / total) * 80) + 20)

                            resolve(widget)
                        }, err => {
                            this.logger.error('downloadFigmaImages', 'Could not upload image')
                            reject(err)
                        })
                    }, err => {
                        this.logger.error('downloadFigmaImages', 'Could get blob')
                        reject(err)
                    })
                })
            })
            let images = await Promise.all(promisses)
            return images
        },

        async uploadImagesAndCreateScreens () {
            this.logger.log(-1, 'uploadImagesAndCreateScreens', 'enter')

            let progress = []
            this.setProgress(10, 'dialog.import.image-progress')

            if (!this.model) {
                this.logger.error('uploadImagesAndCreateScreens', 'no model')
                return
            }

		    let url = '/rest/images/' + this.model.id;
            let imageService = Services.getImageService()
            let promisses = this.uploadFiles.map((file, i) => {
                var formData = new FormData();
				formData.append('file', file);
                return imageService.upload(url, formData, event => {
                    progress[i] = event.loaded / file.size;
                    var total = progress.reduce((a, b) => {
                        return a + b;
                    }, 0);
                    this.setProgress(total * 100)
                })
            })

            let results = await Promise.all(promisses)
            let uploads = results.flatMap(str => {
                let parsed = JSON.parse((str))
	            return parsed.uploads;
            })
            let pos = this.getCanvasCenter()
            let screens = uploads.map((upload,i ) => {

				let x = pos.x + (100 + this.model.screenSize.w) * i;
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
            if (this.canvas) {
                return {
                    x: Math.max(50, this.getZoomed(-1 * (this.canvas.domPos.x + this.canvas.canvasPos.x - 200), 1 / this.zoom)),
                    y: Math.max(50, this.getZoomed(-1 * (this.canvas.domPos.y + this.canvas.canvasPos.y - 200), 1 / this.zoom)),
                }
            }
            return {x:0, y: 0}
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

        onFileChange (e) {
            let files = e.target.files
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

        setProgress (p, msg = '') {
            this.progessPercent = p;
            if (msg) {
                this.progressMSG = this.getNLS(msg)
            }
        },

        isAllowedFileType (file) {
            if(file.size > 50000000){
                this.errorMSG = this.getNLS('dialog.import.error-too-big')
                return false
            }
            let name = file.name.toLowerCase()
            if (name.indexOf('.jpg') > 0 || name.indexOf('.jpeg') > 0 || name.indexOf('.png') > 0 || name.indexOf('.gif') > 0) {
                return true
            } else {
                this.errorMSG = this.getNLS('dialog.import.error-wrong-type')
            }
        }


    },
    mounted () {
        this.logger = new Logger("ImportDialog");
        this.figmaAcccessKey = localStorage.getItem('quxFigmaAccessKey')
        this.figmaUrl = localStorage.getItem('quxFigmaUrl')
    }
}
</script>