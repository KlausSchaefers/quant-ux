
<template>
     <div class="MatcDownloader MatcCSSExporter">
		<div data-dojo-attach-point="donwloadBtn" class="MatcToolbarItem MatcToolbarDropDownButton MatcToolbarIconButton">
		
			<QIcon icon="Code"/>
			<span class="MatcToolbarItemLabel">Export Code</span>
	
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
import * as LowCodeUtil from 'core/code/LowCodeUtil'
import CSSFactory from 'core/code/CSSFactory'
import QIcon from 'page/QIcon'
//const cli = require('quant-ux-cli')

export default {
    name: 'CSSExporter',
    mixins:[_Tooltip, Util, DojoWidget],
    data: function () {
        return {
					selectedWidgetIDs: [],
					isResponsive: true
        }
    },
    components: {
		'QIcon': QIcon
	},
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
				delete this.selectedDesignTokens
			},

			setWidgets (widgetIDs) {
				this.logger.log(3, "setWidgets", "enter > " + widgetIDs)
				this.selectedWidgetIDs = widgetIDs;
				delete this.screen
				delete this.selectedDesignTokens
			},

			setDesignTokens (designTokens) {
				this.logger.log(3, "setDesignTokens", "enter > ")
				this.selectedDesignTokens = designTokens;
				delete this.screen
				delete this.selectedWidgetIDs
			},

			download () {
				this.logger.log(-1, "download", "enter > " + this.screen);

				var db = new DomBuilder();
				var popup = db.div("MatcCSSDialog MatcDialog").build();

				var cntr = db.div("MatcCSSDialogCntr").build(popup);

				let code = this.$new(Code)
				code.placeAt(cntr)

			  if (this.screen) {
					this.getScreenCSS(this.model, this.screen.id, code)
				}

				if (this.selectedWidgetIDs){
					this.getWidgetCSS(this.model, this.selectedWidgetIDs, code)
				}

				if (!this.screen && !this.selectedWidgetIDs) {
					this.getDesignTokenCss(this.model, this.selectedDesignTokens, code)
				}


				var write = db.div("MatcButtonBar MatcMarginTop")
					.div("MatcButton MatcButtonPrimary ", "Close")
					.build(popup);

				var d = new Dialog();
				d.own(on(write, touch.press, lang.hitch(d,"close")));
				d.popup(popup, this.domNode);
			},


			getDesignTokenCss (model, designTokens, code) {

				code.setNPMTemplate(LowCodeUtil.getNPMTemplate(this.hash, this.model))
				code.setRouterTemplate(LowCodeUtil.getRouterTemplate(this.hash, this.model))
				code.setLowCodeTemplate(LowCodeUtil.getMainTemplate(this.hash, this.model))
				code.setModel(model)

				let boxes = []
				for (let id in designTokens) {
					let token = designTokens[id]
					let box = {
						id: id,
						name: token.name,
						style: {}
					}
					boxes.push(box)

					if (token.isComplex) {
						box.style = token.value
					} else {
						/** this will always give a color! */
						box.style[token.type] = token.value
					}

				}
				let tokenCSS = CSSFactory.create(boxes, model)
				if (!tokenCSS.trim()) {
					tokenCSS = `/* no design tokens */`
				}
				code.setCSS(tokenCSS)


			},

			getScreenCSS (model, screenID, code) {
				let screens =[model.screens[screenID]].filter(w => w !== null && w !== undefined)
				let screenCSS = CSSFactory.create(screens, model)
				code.setCSS(screenCSS)

				code.setNPMTemplate(LowCodeUtil.getNPMTemplate(this.hash, this.model))
				code.setRouterTemplate(LowCodeUtil.getRouterTemplate(this.hash, this.model))
				code.setLowCodeTemplate(LowCodeUtil.getMainTemplate(this.hash, this.model))
				code.setModel(model)
			},

			getWidgetCSS (model, ids, code) {
				let widgets = ids.map(id => model.widgets[id]).filter(w => w !== null && w !== undefined)
				let widgetCSS = CSSFactory.create(widgets, model)
				console.debug(widgetCSS)
				code.setCSS(widgetCSS)
			}
    },
    mounted () {
    }
}
</script>