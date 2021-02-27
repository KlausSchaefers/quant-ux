
<template>
     <div class="MatcDownloader MatcCSSExporter">
		<div data-dojo-attach-point="donwloadBtn" class="MatcPointer MatcToolbarItem ">
			<span class="MatcToolbarSmallIcon mdi mdi-code-not-equal-variant"></span>
			<span class="MatcToolbarItemLabel">Export Code (Beta)</span>
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import _Tooltip from 'common/_Tooltip'
import Dialog from 'common/Dialog'
import Code from 'common/Code'
import Util from 'core/Util'
import * as LowCodeUtil from 'core/LowCodeUtil'

const cli = require('quant-ux-cli')

export default {
    name: 'CSSExporter',
    mixins:[_Tooltip, Util, DojoWidget],
    data: function () {
        return {
					selectedWidgetIDs: [],
					isResponsive: true
        }
    },
    components: {},
    methods: {
      postCreate (){
				this.logger = new Logger("CSSExporter");
				this.addTooltip(this.donwloadBtn, "Download CSS");
				this.own(on(this.donwloadBtn, touch.press, lang.hitch(this, "download")));
			},

			setHash (h) {
				this.hash = h
			},

			setModel (model) {
				this.logger.log(3, "setModel", "enter > ")
				this.model = model;
			},

			setScreen (screen) {
				this.screen = screen;
				delete this.selectedWidgetIDs
			},

			setWidgets (widgetIDs) {
				this.logger.log(3, "setWidgets", "enter > " + widgetIDs)
				this.selectedWidgetIDs = widgetIDs;
				delete this.screen
			},

			download () {
				this.logger.log(-1, "download", "enter > " + this.screen);

				var db = new DomBuilder();
				var popup = db.div("MatcCSSDialog ").build();

				var cntr = db.div("MatcCSSDialogCntr").build(popup);

				let code = this.$new(Code)
				code.placeAt(cntr)

				if (this.selectedWidgetIDs && this.selectedWidgetIDs.length > 1){
					/**
					 * Create here a faked model with one screen taht is the bounding box.
					 */
					let boundingBox = this.getBoundingBox(this.selectedWidgetIDs)
					let fakedModel = lang.clone(this.model)
					fakedModel.screens = {
						'SelectedScreen': {
							id: 'SelectedScreen',
							name: "Selection",
							style: {},
							x: boundingBox.x,
							y: boundingBox.y,
							w: boundingBox.w,
							h: boundingBox.h,
							children: this.selectedWidgetIDs
						}
					}
					fakedModel.screenSize.w = boundingBox.w
					fakedModel.screenSize.h = boundingBox.h

					this.generateScreen(fakedModel, "SelectedScreen", code, true)


				} else if(this.screen) {

					this.generateScreen(this.model, this.screen.id, code, true)

				} else {
					code.setCSS(this.getWidgetCSS())
				}

				var write = db.div("MatcButtonBar")
					.div("MatcButton MatcMarginTop", "Close")
					.build(popup);

				var d = new Dialog();
				d.own(on(write, touch.press, lang.hitch(d,"close")));
				d.popup(popup, this.domNode);
			},

			generateScreen (model, screenID, code, isResponsive) {

				code.setNPMTemplate(LowCodeUtil.getNPMTemplate(this.hash, this.model))
				code.setRouterTemplate(LowCodeUtil.getRouterTemplate(this.hash, this.model))
				code.setLowCodeTemplate(LowCodeUtil.getMainTemplate(this.hash, this.model))

				/**
				 * Create HTML
				 */
				let htmlGenerator = new cli.Generator(new cli.HTMLFactory(), new cli.CSSFactory(isResponsive, "", true))
				let result = htmlGenerator.run(model)
				let screen = result.screens.find(s => s.id === screenID)
				if (screen) {
					let html = screen.template
					let writer = new cli.SinglePageWriter()
					let files = writer.getFiles(result)
					let selectedFile = files.find(f => f.id === screenID)
					if (selectedFile) {
						let previewCode = selectedFile.content
						code.setHTMLTemplate(html)
						code.setPreview(previewCode)
					} else {
						console.warn('CssExporter.downloadScreen() > no file for screen', screenID)
					}
				} else {
					console.warn('CssExporter.downloadScreen() > no sceeen')
				}

				/**
				 * Generate CSS and Vue
				 */
				let vueGenerator = new cli.Generator(
					new cli.VueFactory(),
					new cli.CSSFactory(isResponsive, false, true)
				)
				let vueResult = vueGenerator.run(model, isResponsive)
				let vueScreen = vueResult.screens.find(s => s.id === screenID)
				if (vueScreen) {
					let writer = new cli.VueExportWriter()
					let files = writer.getFiles(vueResult)

					let selectedFile = files.find(f => f.id === screenID && f.type === 'vue')
					if (selectedFile) {
						let previewCode = selectedFile.content
						code.setVue(previewCode)
					} else {
						console.warn('CssExporter.downloadScreen() > no vue for screen', screenID)
					}

					let selectedCSS = files.find(f => f.id === screenID && f.type === 'css')
					if (selectedCSS) {
						let previewCSS = selectedCSS.content
						code.setCSS(previewCSS)
					} else {
						console.warn('CssExporter.downloadScreen() > no css for screen', screenID)
					}
				}
				code.setModel(model)
			},

			getWidgetCSS () {
				var f = new cli.CSSFactory()
				return f.getRaw(this.model,this.selectedWidgetIDs)
			}
    },
    mounted () {
    }
}
</script>