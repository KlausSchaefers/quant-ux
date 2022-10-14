
<template>
    <div class="">
		<div class="" data-dojo-attach-point="cntr">
		</div>
		<div class="MatcDownloadDialogRender" data-dojo-attach-point="renderCntr"></div>
	</div>
</template>

<style>
  @import url("../../../style/download.css");
</style>

<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import Preview from 'page/Preview'
import * as htmlToImage from 'html-to-image';
import { saveAs } from 'file-saver'

export default {
    name: 'ExportImages',
    mixins:[DojoWidget],
    data: function () {
        return {
            width: 150,
            height: 150
        }
    },
    components: {},
    methods: {

			setModel (m){
				this.blobs = {}
				this.model = m;
				this.height = (m.screenSize.h /  m.screenSize.w) * this.width;
			},

			setJwtToken(t) {
				this.jwtToken = t
			},

			onFocus () {
				this.logger.log(-1, "onFocus", "enter");
				/**
				 * Rerender stuff
				 */
				this.cntr.innerHTML = ""
				this.renderCntr.innerHTML = ""
				this.render(this.model);
			},

			async render (model) {
		
				this.wrapper = {};
				this.previews = {};
				for (let id in model.screens) {
					let screen = model.screens[id];
					let wrapper = this.db
						.div("MatcToolbarScreenListPreviewWrapper MatcCreateBtnElement MatcToolbarDropDownButtonItem")
						.div("MatcDownloadDialogPreview")
						.w(this.width)
						.h(this.height)
						.build(this.cntr);
					this.wrapper[id] = wrapper;
					this.db.span("", "Loading...").build(wrapper);
					this.renderScreen(model, screen);
				}
			},

			renderScreen (model, screen) {
				this.logger.log(0, "download", "enter > " + screen.id);
				const f = 2;

				/**
				 * On focus this method might be called again, do not render twice
				 */
				if (this.blobs[screen.id]) {
					this.onBlobReady(screen, this.blobs[screen.id])
					return
				}

				try {
					const db = new DomBuilder();
					const cntrNode = db.div("MatcDownloaderCntr").build(this.renderCntr);
					const wrapper = db.div("MatcDownloaderWrapper")
							.w(screen.w * f).h(screen.h * f)
							.build(cntrNode);

					this.previews[screen.id] = cntrNode;

					const s = this.$new(Preview);
					s.placeAt(wrapper);
					s.setJwtToken(this.jwtToken);
					s.setModel(model, screen.id);

					htmlToImage.toBlob(s.domNode)
							.then(lang.hitch(this, "onBlobReady", screen))
							.catch(lang.hitch(this, "onImageError", screen));

				} catch (e) {
					this.logger.error("download", "Something went wrong", e);
					this.logger.sendError(e);
				}

			},

			onBlobReady (screen, blob){
				if (blob) {
					this.blobs[screen.id] = blob;
					try {
						const a = new FileReader();
						a.onload = lang.hitch(this, "onDataUrl", screen)
						a.readAsDataURL(blob);
					} catch (e){
						console.error("onBlobReady", e)
						console.error(blob)
						this.onImageError(screen);
					}
				} else {
					this.onImageError(screen);
				}

			},

			onDataUrl (screen, e) {
				const wrapper = this.wrapper[screen.id];
				if (wrapper) {
					wrapper.innerHTML = "";
					const img = this.db.img().build(wrapper);
					img.src = e.target.result;

					this.db.span("", screen.name).build(wrapper);
					this.tempOwn(on(wrapper, "click", lang.hitch(this, "download", screen)));
				}
				const preview = this.previews[screen.id];
				if (preview) {
					this.renderCntr.removeChild(preview)
				}
			},


			onImageError (screen, e) {
				this.logger.error("download", "Something went wrong", e);
				const wrapper = this.wrapper[screen.id];
				if (wrapper) {
					wrapper.innerHTML="";
					this.db.span("", "Error").build(wrapper);
				}
			},

			download (screen){
				this.logger.log(-1, "download", "enter > " + screen.id);
				const blob = this.blobs[screen.id];
				if (blob) {
					saveAs(blob, screen.name + '.png');
				} else {
					this.logger.log(0, "download", "No BLOB >" + screen.id);
				}
			},
			cleanUp () {
				delete this.blobs
				delete this.wrapper
			}
    },
    mounted () {
		this.logger = new Logger("ExportImages");
		this.db = new DomBuilder();
    }
}
</script>