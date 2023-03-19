
<template>
    <div class="MatchImportDialog MatchImportOpenAIDialog">

        <div v-if="isPublic">
            <div class="MatchImportDialogCntr">
                {{ getNLS('design-gpt.error-public') }}
            </div>
        </div>
        <div v-else class="MatchImportOpenAIDialogCntr">

            <div class="MatchImportOpenAIDialogInput">


                <div v-if="page === 'openai'">
                    <div class="MatchImportDialogCntr ">
                        <div class="field">
                            <label>{{ getNLS('design-gpt.prompt') }}</label>
                            <textarea type="text" class="input" v-model="openAIPrompt">
                                    </textarea>
                        </div>
                    </div>
                </div>

                <div v-if="page === 'progress'">
                    <div class="MatchImportDialogCntr">
                        <span class="MatcHint">
                            {{ progressMSG }}
                            <span class="MatcUploadProgressCnr">
                                <span class="MatcUploadProgress" ref="progressBar"
                                    :style="'width:' + progessPercent + '%'" />
                            </span>
                        </span>
                    </div>
                </div>


                <div class="MatcError">
                    {{ errorMSG }}
                </div>

                <div class=" MatcButtonBar MatcMarginTop">
                    <a class=" MatcButton" v-if="page === 'openai'" @click.stop="onCreatePreview">{{
                        getNLS('design-gpt.preview') }}</a>
                    <a class=" MatcButton" v-if="preview" @click.stop="onSave">{{ getNLS('btn.import') }}</a>
                    <a class=" MatcLinkButton" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
                </div>

            </div>

            <div class="MatchImportDialogPreviewCntr">
                <span class="MatcHint" v-if="!preview">
                    {{ hint }}
                </span>
                <div ref="simCntr" class="MatcScriptEditorSimulator">

                </div>
            </div>


        </div>





    </div>
</template>
<style lang="scss">
@import '../../../style/import_dialog.scss';
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import Util from 'core/Util'
import DomBuilder from 'common/DomBuilder'
import domGeom from 'dojo/domGeom'
import ScrollContainer from 'common/ScrollContainer'
import Simulator from 'core/Simulator'
//import Services from 'services/Services'

export default {
    name: 'OpenAIDialog',
    mixins: [Util, DojoWidget],
    data: function () {
        return {
            page: "openai",
            hasContinue: false,
            uploadFiles: [],
            uploadPreviews: [],
            hasZip: false,
            zoom: 1,
            errorMSG: '',
            progressMSG: '',
            progessPercent: 0,
            isPublic: false,
            openAIPrompt: '',
            preview: null,
            hint: this.getNLS('design-gpt.no-preview')
        }
    },
    components: {

    },
    computed: {
        previewWidth() {
            return '100px'
        },
        previewHeight() {
            if (this.model) {
                let factor = this.model.screenSize.w / 100
                return this.model.screenSize.h / factor + 'px'
            }
            return '200px'
        }
    },
    methods: {
        setModel(m) {
            this.model = m;
        },

        setPublic(isPublic) {
            this.isPublic = isPublic
        },

        setController(controller) {
            this.controller = controller
        },

        setCanvas(c) {
            this.canvas = c
        },

        setJwtToken(t) {
            this.jwtToken = t
        },

        setZoom(z) {
            this.zoom = z
        },

        onCancel() {
            this.$emit('cancel')
        },

        async onSave() {
            this.logger.log(-1, 'onSave', 'enter')

            const model = this.preview
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
            this.$emit('save')
        },

        async onCreatePreview() {
            this.logger.log(-1, 'onCreatePreview', 'enter')

            this.hint = this.getNLS('design-gpt.busy')

            setTimeout(() => {
                this.preview = this.runDesignGPT()
                const sim = this.renderSimulator(this.$refs.simCntr);
                sim.doNotRunOnLoadAnimation = true
                sim.doNotExecuteScripts = true
                sim.setModel(this.preview);
                this.simulator = sim;
            }, 2000)


        },

        runDesignGPT() {
            return {
                "_id": "6417759d05d72326569320a1",
                "version": 2.1,
                "name": "GPTApp",
                "description": "",
                "screenSize": {
                    "w": 375,
                    "h": 812
                },
                "type": "smartphone",
                "screens": {
                    "s10000_58909": {
                        "x": 1217,
                        "y": 1125,
                        "h": 812,
                        "w": 375,
                        "name": "Screen",
                        "type": "Screen",
                        "style": {
                            "background": "#ffffff"
                        },
                        "min": {
                            "w": 375,
                            "h": 812
                        },
                        "has": {
                            "image": true
                        },
                        "props": {
                            "start": true
                        },
                        "children": ["w10005_56681", "w10006_24757", "w10007_44184", "w10008_10731", "w10004_21715", "w10003_71813"],
                        "id": "s10000_58909"
                    }
                },
                "widgets": {
                    "w10003_71813": {
                        "type": "Label",
                        "name": "Label",
                        "x": 1249,
                        "y": 1187,
                        "w": 311,
                        "h": 26,
                        "z": 1,
                        "props": {
                            "label": "Email"
                        },
                        "has": {
                            "label": true,
                            "padding": true,
                            "advancedText": true
                        },
                        "style": {
                            "fontSize": 20,
                            "fontFamily": "Helvetica Neue,Helvetica,Arial,sans-serif",
                            "textAlign": "left",
                            "letterSpacing": 0,
                            "lineHeight": 1,
                            "color": "#333333",
                            "textShadow": null
                        },
                        "id": "w10003_71813",
                        "created": 1679264433281,
                        "modified": 1679264536562
                    },
                    "w10004_21715": {
                        "type": "Label",
                        "name": "Label 1",
                        "x": 1250,
                        "y": 1303,
                        "w": 311,
                        "h": 26,
                        "z": 2,
                        "props": {
                            "label": "Password"
                        },
                        "has": {
                            "label": true,
                            "padding": true,
                            "advancedText": true
                        },
                        "style": {
                            "fontSize": 20,
                            "fontFamily": "Helvetica Neue,Helvetica,Arial,sans-serif",
                            "textAlign": "left",
                            "letterSpacing": 0,
                            "lineHeight": 1,
                            "color": "#333333",
                            "textShadow": null
                        },
                        "id": "w10004_21715",
                        "created": 1679264449050,
                        "modified": 1679264534460,
                        "copyOf": "w10003_71813"
                    },
                    "w10005_56681": {
                        "id": "w10005_56681",
                        "type": "TextBox",
                        "name": "Text Box",
                        "x": 1250,
                        "y": 1213,
                        "w": 309,
                        "h": 40,
                        "z": 3,
                        "props": {
                            "label": "",
                            "placeholder": true
                        },
                        "has": {
                            "label": true,
                            "backgroundColor": true,
                            "border": true,
                            "editable": true,
                            "onclick": true,
                            "padding": true
                        },
                        "style": {
                            "color": "#333333",
                            "fontFamily": "Helvetica Neue,Helvetica,Arial,sans-serif",
                            "borderTopRightRadius": 3,
                            "borderTopLeftRadius": 3,
                            "borderBottomRightRadius": 3,
                            "borderBottomLeftRadius": 3,
                            "borderTopWidth": 1,
                            "borderBottomWidth": 1,
                            "borderRightWidth": 1,
                            "borderLeftWidth": 1,
                            "fontSize": 18,
                            "borderTopColor": "#333333",
                            "borderBottomColor": "#333333",
                            "borderRightColor": "#333333",
                            "borderLeftColor": "#333333",
                            "background": "#ffffff",
                            "paddingTop": 5,
                            "paddingBottom": 5,
                            "paddingLeft": 5,
                            "paddingRight": 5,
                            "textAlign": "left"
                        },
                        "error": {
                            "borderTopColor": "#cc0000",
                            "borderBottomColor": "#cc0000",
                            "borderRightColor": "#cc0000",
                            "borderLeftColor": "#cc0000",
                            "background": "#ffcaca"
                        },
                        "focus": {
                            "background": "#f2f2f2"
                        },
                        "created": 1679264466664,
                        "modified": 1679264547880
                    },
                    "w10006_24757": {
                        "id": "w10006_24757",
                        "type": "Password",
                        "name": "Password",
                        "x": 1250,
                        "y": 1329,
                        "w": 309,
                        "h": 40,
                        "z": 4,
                        "props": {
                            "label": "",
                            "cleartextHideLabel": "Hide",
                            "cleartextShowLabel": "Show"
                        },
                        "has": {
                            "label": true,
                            "backgroundColor": true,
                            "border": true,
                            "editable": true,
                            "onclick": true,
                            "padding": true
                        },
                        "style": {
                            "color": "#333333",
                            "fontFamily": "Helvetica Neue,Helvetica,Arial,sans-serif",
                            "borderTopRightRadius": 3,
                            "borderTopLeftRadius": 3,
                            "borderBottomRightRadius": 3,
                            "borderBottomLeftRadius": 3,
                            "borderTopWidth": 1,
                            "borderBottomWidth": 1,
                            "borderRightWidth": 1,
                            "borderLeftWidth": 1,
                            "fontSize": 18,
                            "borderTopColor": "#333333",
                            "borderBottomColor": "#333333",
                            "borderRightColor": "#333333",
                            "borderLeftColor": "#333333",
                            "background": "#ffffff",
                            "paddingTop": 5,
                            "paddingBottom": 5,
                            "paddingLeft": 5,
                            "paddingRight": 5,
                            "textAlign": "left"
                        },
                        "created": 1679264477874,
                        "modified": 1679264480228
                    },
                    "w10007_44184": {
                        "id": "w10007_44184",
                        "type": "Button",
                        "name": "Button",
                        "x": 1249,
                        "y": 1406,
                        "w": 96,
                        "h": 40,
                        "z": 5,
                        "props": {
                            "label": "Login"
                        },
                        "has": {
                            "backgroundColor": true,
                            "border": true,
                            "onclick": true,
                            "label": true,
                            "padding": true
                        },
                        "actions": {},
                        "style": {
                            "fontFamily": "Helvetica Neue,Helvetica,Arial,sans-serif",
                            "borderTopRightRadius": 3,
                            "borderTopLeftRadius": 3,
                            "borderBottomRightRadius": 3,
                            "borderBottomLeftRadius": 3,
                            "borderTopWidth": 1,
                            "borderBottomWidth": 1,
                            "borderRightWidth": 1,
                            "borderLeftWidth": 1,
                            "borderTopColor": "#333333",
                            "borderBottomColor": "#333333",
                            "borderRightColor": "#333333",
                            "borderLeftColor": "#333333",
                            "background": "#333333",
                            "fontSize": 20,
                            "textAlign": "center",
                            "letterSpacing": 0,
                            "lineHeight": 1,
                            "color": "#ffffff",
                            "paddingTop": 0,
                            "paddingBottom": 0,
                            "paddingLeft": 0,
                            "paddingRight": 0,
                            "verticalAlign": "middle"
                        },
                        "created": 1679264485997,
                        "modified": 1679264530562
                    },
                    "w10008_10731": {
                        "id": "w10008_10731",
                        "type": "Button",
                        "name": "Link",
                        "x": 1380,
                        "y": 1406,
                        "w": 179,
                        "h": 40,
                        "z": 6,
                        "props": {
                            "label": "Forgot Password"
                        },
                        "has": {
                            "onclick": true,
                            "label": true
                        },
                        "style": {
                            "fontSize": 20,
                            "fontFamily": "Helvetica Neue,Helvetica,Arial,sans-serif",
                            "textAlign": "center",
                            "letterSpacing": 0,
                            "lineHeight": 1,
                            "color": "#333333",
                            "textDecoration": "underline",
                            "background": "transparent",
                            "verticalAlign": "middle"
                        },
                        "created": 1679264497031,
                        "modified": 1679264530562
                    }
                },
                "lines": {},
                "groups": {},
                "templates": {},
                "designtokens": {},
                "lastUUID": 10009,
                "lastUpdate": 1679264547884,
                "created": 1679259037020,
                "startScreen": "",
                "grid": {
                    "w": 8,
                    "h": 8,
                    "style": "line",
                    "color": "#cecece",
                    "visible": false,
                    "enabled": false
                },
                "domain": "Quant-UX.com",
                "isDirty": true,
                "screenCount": 1,
                "widgetCount": 6,
                "lastBackup": 1679263911019,
                "sizeBackup": 2829,
                "lastCategory": "WireFrame",
                "id": "6417759d05d72326569320a1"
            }

        },

        renderSimulator(cntr) {

            const db = new DomBuilder();

            const domPos = domGeom.position(this.domNode);
            const pos = domGeom.position(cntr);
            pos.w -= 30;
            pos.h = domPos.h;

            const container = db.div("MatchSimulatorContainer MatcAnimationComposerSimulator")
                .h(pos.h)
                .w(pos.w)
                .build();

            const scroller = this.$new(ScrollContainer, { canDestroy: true });
            scroller.placeAt(container);

            const s = this.$new(Simulator, { mode: "debug", logData: false, runTimerLinesOnScreenLoad: false, isDesktopTest: true, isWiringEvents: true });
            s.scrollListenTarget = "parent";
            s.setHash(this.hash)
            /**
             * We do not want to resize the parent.
             * Therefore we replace the method with an empty one
             */
            s.initParent = () => { };

            s.setScrollContainer(scroller);
            scroller.wrap(s.domNode);
            cntr.appendChild(container);
            return s;
        },

        getCanvasCenter() {
            if (this.canvas) {
                return {
                    x: Math.max(250, this.getZoomed(-1 * (this.canvas.domPos.x + this.canvas.canvasPos.x - 200), 1 / this.zoom)),
                    y: Math.max(50, this.getZoomed(-1 * (this.canvas.domPos.y + this.canvas.canvasPos.y - 200), 1 / this.zoom)),
                }
            }
            return { x: 0, y: 0 }
        },


    },
    mounted() {
        this.logger = new Logger("DesignGPTDialog");
        this.openAIKey = localStorage.getItem('quxPpenAIKey')

    }
}
</script>