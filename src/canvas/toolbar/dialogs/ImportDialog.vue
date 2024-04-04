
<template>
     <div class="MatchImportDialog" @dragover="onDragEnter" @dragenter="onDragEnter" @dragleave="onDragLeave" @drop="onDrop">
        <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab='images'" :class="{'MatcToolbarTabActive': tab === 'images'}">{{ getNLS('dialog.import.tab-images')}}</a>
            <a @click="tab='figma'" :class="{'MatcToolbarTabActive': tab === 'figma'}">{{ getNLS('dialog.import.tab-figma')}}</a>
            <a @click="tab='zip'" :class="{'MatcToolbarTabActive': tab === 'zip'}">{{ getNLS('dialog.import.tab-zip')}}</a>
            <a @click="tab='swagger'" :class="{'MatcToolbarTabActive': tab === 'swagger'}" v-if="hasSwagger">{{ getNLS('dialog.import.')}}</a>
            <a @click="tab='openai'" :class="{'MatcToolbarTabActive': tab === 'openai'}" v-if="hasOpenAI">{{ getNLS('dialog.import.tab-open-ai')}}</a>
 
        </div>
        <div v-if="isPublic">
             <div class="MatchImportDialogCntr">
             {{ getNLS('dialog.import.error-public')}}
            </div>
        </div>
        <div v-else>
            <div v-if="tab=== 'images'">
                <div :class="['MatchImportDialogDropZone MatchImportDialogCntr', {'MatchImportDialogDropZoneHover': hasDrop}]">
                    <span class="MatcHint" v-if="uploadFiles.length === 0">{{ getNLS('dialog.import.images-drop-msg')}}</span>
                    <div class="MatchImportDialogPreview MatcToolbarDropDownButtonItem" v-for="(file,i) in uploadFiles" :key="file.name" :style="{'height': previewHeight, 'width': previewWidth}">
                        <img :src="uploadPreviews[i]" :alt="file.name"/>
                    </div>
                    <input type="file" @change="onFileChange" >
                </div>
            </div>

            <div v-if="tab=== 'zip'">
                <div :class="['MatchImportDialogDropZone MatchImportDialogCntr', {'MatchImportDialogDropZoneHover': hasDrop}]">
                    <span class="MatcHint" v-if="!hasZip">{{ getNLS('dialog.import.zip-drop-msg')}}</span>
                    <span v-else class="MatchImportDialogPreview MatchImportDialogZip MatcToolbarDropDownButtonItem">
                        <span class="mdi mdi-file-code-outline"/>
                    </span>
                    <input type="file" @change="onZipChange" >
                </div>
            </div>


            <div v-if="tab=== 'figma'">
                <div class="MatchImportDialogCntr">

                    <div v-if="!figmaPages">

                        <div class="form-group ">
                            <label>{{ getNLS('dialog.import.figma-key')}}
                            <a target="figma" href="https://www.figma.com/developers/api#access-tokens">
                                <span class="mdi mdi-help-circle"></span>
                            </a>
                            </label>
                            <form autocomplete="off">
                                <input type="password" autocomplete="off" class="form-control" v-model="figmaAcccessKey" />
                            </form>
                        </div>

                        <div class="form-group">
                            <label>{{ getNLS('dialog.import.figma-url')}}</label>
                            <input type="text" class="form-control" v-model="figmaUrl" />
                        </div>

                    </div>

                    <div v-else>
                        <label>{{ getNLS('dialog.import.figma-select-page')}}</label>
                        <div>
                            <RadioBoxList :qOptions="figmaPages" @change="setSelectedFigmaPage" />
                        </div>
                    </div>

                </div>
            </div>

            <div v-if="tab=== 'swagger'">
                <div class="MatchImportDialogCntr">
                      <div class="form-group">
                            <label>{{ getNLS('dialog.import.open-api-url')}}</label>
                            <input type="text" class="form-control" v-model="swaggerURL" />
                        </div>
                </div>
            </div>

            <div v-if="tab=== 'openai'">
                <div class="MatchImportDialogCntr">
                      <div class="form-group">
                            <label>{{ getNLS('dialog.import.open-ai-prompt')}}</label>
                            <textarea type="text" class="form-control" v-model="openAIPrompt">
                            </textarea>
                        </div>

                        <div class=" MatcButtonBar MatcMarginTop">
                            <a class="MatcButton MatcButtonPrimary"
                                @click.stop="onContinueFigma">{{ getNLS('dialog.import.open-ai-generate')}}
                            </a>
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
        </div>

        <div class="MatcError">
            {{errorMSG}}
        </div>

        <div class=" MatcButtonBar MatcMarginTop">
            <a class=" MatcButton MatcButtonPrimary" v-if="hasContinue" @click.stop="onContinueFigma">{{ getNLS('btn.continue')}}</a>
            <a class=" MatcButton MatcButtonPrimary" v-if="!isPublic && !hasContinue" @click.stop="onSave">{{ getNLS('btn.import')}}</a>
            <a class=" MatcLinkButton" @click.stop="onCancel">{{ getNLS('btn.cancel')}}</a>
        </div>


	</div>
</template>
<style lang="scss">
    @import '../../../style/components/import_dialog.scss';
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import Util from 'core/Util'
import Services from 'services/Services'
import RadioBoxList from 'common/RadioBoxList'

import ZipSevice from 'services/ZipService'
import FigmaService from 'services/FigmaService'
import SwaggerService from 'services/SwaggerService'

export default {
    name: 'ImportDialog',
    mixins:[Util, DojoWidget],
    data: function () {
        return {
            tab: "images",
            hasDrop: false,
            hasContinue: false,
            uploadFiles: [],
            uploadPreviews: [],
            hasZip: false,
            zoom: 1,
            errorMSG: '',
            progressMSG: '',
            progessPercent: 0,
            figmaAcccessKey: '',
            figmaUrl: '',
            figmaPages: null,
            figmaModel: null,
            figmaSelectedPage: null,
            swaggerURL: '',
            isPublic: false,
            hasSwagger: false,
            hasOpenAI: false,
            openAIPrompt: ''
        }
    },
    components: {
        'RadioBoxList': RadioBoxList
    },
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

        setPublic (isPublic) {
            this.isPublic = isPublic
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
            this.logger.log(-1, 'onSave', 'enter', this.figmaSelectedPage !== null)
            this.errorMSG = ""
            if (this.tab === 'images') {
                this.tab = 'progress'
                await this.uploadImagesAndCreateScreens()
            }
            if (this.tab === 'figma' && this.isValidFigmaConfig()) {
                this.tab = 'progress'
                await this.importFigma(this.figmaAcccessKey, this.figmaUrl)
            }
            if (this.tab === 'zip') {
                await this.importZip()
            }
            if (this.tab === 'swagger') {
                await this.loadSwagger()
            }
            if (this.tab === 'openai') {
                await this.importOpenAI()
            }
        },

        async importOpenAI () {
            this.logger.log(-1, 'loadSwagger', 'enter', this.openAIPrompt)
        },
        async loadSwagger () {
            this.logger.log(-1, 'loadSwagger', 'enter', this.swaggerURL)
            if (this.swaggerURL) {
                localStorage.setItem('quxSwaggerURL', this.swaggerURL)
                try {
                    const swaggerService = new SwaggerService()
                    const [items, schemas] = await swaggerService.parseURL(this.swaggerURL)
                    console.debug(items, schemas)
                } catch (err) {
                    this.errorMSG = this.getNLS('dialog.import.error-swagger-wrong_url') + ` (${err.message})`
                }
             
            } else {
                this.errorMSG = this.getNLS('dialog.import.error-swagger-no-url')
            }
        },

        async onContinueFigma () {
            this.logger.log(-1, 'onContinueFigma', 'enter', this.figmaSelectedPage !== null)
            if (this.figmaSelectedPage) {
                this.tab = 'progress'
                await this.parseFigma(this.figmaAcccessKey, this.figmaUrl, this.figmaModel, this.figmaSelectedPage, this.model.screenSize)
                this.$emit('save')
            } else {
                this.errorMSG = this.getNLS('dialog.import.error-figma-page')
            }
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

        resetFigma () {
            this.logger.log(-1, 'resetFigma', 'enter')
            this.figmaPages = null
            this.figmaModel = null
            this.figmaSelectedPage = null
            this.hasContinue = false
        },

        setSelectedFigmaPage (value) {
            this.logger.log(-1, 'setSelectedFigmaPage', 'enter', value)
            this.figmaSelectedPage = value
        },

        async importFigma (accessKey, url) {
            this.logger.log(-1, 'importFigma', 'enter', url)

            localStorage.setItem('quxFigmaAccessKey', accessKey)
            localStorage.setItem('quxFigmaUrl', url)
            let fileId = this.getFigmaFileKey(url)

            try {
                this.setProgress(0, 'dialog.import.figma-progress-file')

                let figmaService = new FigmaService(accessKey)
                let fModel = await figmaService.get(fileId)       
                if (fModel) {
                    this.logger.log(-1, 'importFigma', 'fModel', fModel)
                    this.figmaPages = figmaService.getPages(fModel)
                    this.figmaModel = fModel

                    /**
                     * Check now if we need to show the 2nd wizard step
                     */
                    if (this.figmaPages.length === 1) {
                        this.figmaSelectedPage = this.figmaPages[0].id
                        await this.parseFigma(accessKey, url, this.figmaModel, this.figmaSelectedPage, this.model.screenSize)
                        this.$emit('save')
                    } else {
                        /**
                         * show the page selection page
                         */
                        this.hasContinue = true
                        this.tab = 'figma'
                    }

                } else {
                    throw new Error('Could not download figma. Servivce returned null')
                }

            } catch (err) {
                console.debug(err.stack)
                this.logger.error('importFigma', 'Cannot import figma')
                this.logger.sendError(err)
                this.errorMSG = this.getNLS('dialog.import.error-figma-load') + ` (${err.message})`
                this.tab = 'figma'
            }
        },

        async parseFigma (accessKey, url, fModel, figmaSelectedPage, screenSize, importChildren = false) {
            this.logger.log(-1, 'parseFigma', 'enter', url)

            try {
                let fileId = this.getFigmaFileKey(url)
                let figmaService = new FigmaService(accessKey)
                let model = await figmaService.parse(fileId, fModel, importChildren, screenSize, [figmaSelectedPage])

                if (model) {

                    /**
                     * Download all the images
                     */
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
                    this.logger.error('importFigma', 'Cannot partse figma')
                    this.logger.sendError(new Error('Could not parse figma'))
                    this.errorMSG = this.getNLS('dialog.import.error-figma-load')
                    this.tab = 'figma'
                }
            } catch (err) {
                this.logger.error('importFigma', 'Cannot partse figma', err)
                this.logger.sendError(err)
                this.errorMSG = this.getNLS('dialog.import.error-figma-load')
                this.tab = 'figma'
            }

            this.resetFigma()
        },

 

        getImagesWithFigmaImage (model, importChildren) {
            if (importChildren) {
                return Object.values(model.widgets).filter(w => w.props && w.props.figmaImage)
            } else {
                return Object.values(model.screens).filter(w => w.props && w.props.figmaImage)
            }
        },

        async downloadFigmaImages (vectorWidgets) {
            this.logger.log(-1, 'importFigma', 'downloadFigmaImages', vectorWidgets)
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
                                    name: upload.name,
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
                    name: upload.name,
                    url : upload.url,
                    w : upload.width,
                    h : upload.height
                };
                return screen
            })
            this.controller.addScreensAndWidgets({screens: screens});

            /**
             * Close dialog
             */
            this.$emit('save')
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
            if (this.tab === 'figma') {
                this.tab = 'images'
            }
        },

        onDragLeave (e) {
            e.stopPropagation()
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
            this.hasDrop = false
        },

        onDrop (e) {
            this.logger.log(-1, 'onDrop', 'enter', this.tab)
            e.stopPropagation()
            e.preventDefault()
            let files = e.dataTransfer.files
            this.hasDrop = false
            // flip tab if zip is dropped
            if (files.length === 1 && this.isZipFile(files[0])) {
                this.tab = 'zip'
            }
            if (this.tab === 'zip') {
                this.showZip(files)
            }
            if (this.tab === "images") {
                this.showFiles(files)
            }
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
        },

        /**
         * Zip stuff
         */
        onZipChange (e) {
            let files = e.target.files
            this.showZip(files)
        },

        isZipFile (file) {
            return file.name.endsWith('.zip')
        },

        onZipFileDropped (files) {
            this.tab = 'zip'
            this.showZip(files)
        },

        showZip (files) {
            this.logger.log(-1, 'showZip', 'error', files)
            this.hasZip = true
             this.hasDrop = false
            this.zipFile = files[0]
            this.errorMSG = ""

            if (this.zipFile && !this.isZipFile(this.zipFile)) {
                this.errorMSG = this.getNLS('dialog.import.error-zip-no-file')
                this.hasZip = false
                return
            }
        },

        async importZip () {
            this.logger.log(-1, 'importZip', 'enter')
            if (!this.hasZip) {
                this.errorMSG = this.getNLS('dialog.import.error-no-file')
                return
            }
            if (this.zipFile && !this.isZipFile(this.zipFile)) {
                this.errorMSG = this.getNLS('dialog.import.error-zip-no-file')
                return
            }

            this.tab = 'progress'

            // upload images from zip and update model
            this.setProgress(0.1)
            let zipModel = await ZipSevice.uploadImages(this.zipFile, this.model.id, (done, total) => {
                 this.setProgress(((done / total) * 80) + 20)
            })
            // import app
            await this.controller.importApp(zipModel, this.getCanvasCenter())
            // close dialog
            this.$emit('save')
        }


    },
    mounted () {
        this.logger = new Logger("ImportDialog");
        this.figmaAcccessKey = localStorage.getItem('quxFigmaAccessKey')
        this.figmaUrl = localStorage.getItem('quxFigmaUrl')
        this.swaggerURL = localStorage.getItem('quxSwaggerURL')
        if (location.href.indexOf('localhost') > 0) {
            //this.hasSwagger = true
            //this.tab = 'swagger'
        }

    }
}
</script>