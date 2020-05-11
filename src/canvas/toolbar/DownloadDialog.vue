
<template>
     <div class="">
		<label>Export</label>
		<div class="MatcDownloadDialogCntr" data-dojo-attach-point="cntr"></div>
		<div class="MatcDownloadDialogRender" data-dojo-attach-point="renderCntr"></div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import Preview from 'page/Preview'

// import domtoimage from 'dom-to-image-more'
import domtoimage from '../../util/dom-to-image';
import { saveAs } from 'file-saver'

export default {
    name: 'DownloadDialog',
    mixins:[DojoWidget],
    data: function () {
        return {
            width: 150,
            height: 150
        }
    },
    components: {},
    methods: {

			postCreate: function(){
				this.logger = new Logger("DownloadDialog");
				if (!window.saveAs) {
					this.cntr.innerHTML = '<span class="MatcToolbarItemLabel">Not supported browser</span>';
					this.logger.log(0, "onImageReady", "No saveAs");
				}
				this.db = new DomBuilder();
			},

			setModel:function(m){
				this.model = m;
				this.height = (m.screenSize.h /  m.screenSize.w) * this.width;
				this.render(m);
			},

			setJwtToken(t) {
				this.jwtToken = t
			},

			render:function(model) {
				this.wrapper = {};
				this.blobs = {};
				this.previews = {};
				for (var id in model.screens) {
					var screen = model.screens[id];
					var wrapper = this.db
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

			renderScreen:function (model, screen) {
				this.logger.log(0, "download", "enter > " + screen.id + " > f:" + f);
				var f = 2;
				try {
					var db = new DomBuilder();
					var cntrNode = db.div("MatcDownloaderCntr").build(this.renderCntr);
					var wrapper = db.div("MatcDownloaderWrapper")
							.w(screen.w * f).h(screen.h * f)
							.build(cntrNode);

					this.previews[screen.id] = cntrNode;

					var s = this.$new(Preview);
					s.placeAt(wrapper);
					s.setJwtToken(this.jwtToken);
					s.setModel(model, screen.id);

					domtoimage.toBlob(s.domNode)
							.then(lang.hitch(this, "onBlobReady", screen))
							.catch(lang.hitch(this, "onImageError", screen));


				} catch (e) {
					this.logger.error("download", "Something went wrong", e);
					console.debug(e.stack)
					this.logger.sendError(e);
				}

			},

			onBlobReady:function(screen, blob){
				this.blobs[screen.id] = blob;
				try {
					var a = new FileReader();
						a.onload = lang.hitch(this, "onDataUrl", screen)
						a.readAsDataURL(blob);
				} catch (e){
					console.error("onPngReady", e)
					console.error(blob)
					this.onImageError(screen);
				}
			},

			onPngReady:function(screen, url) {
				var wrapper = this.wrapper[screen.id];
				if (wrapper) {
					wrapper.innerHTML = "";
					var img = this.db.img().build(wrapper);
					img.src = url;

					this.db.div("MatcDownloadDialogPreviewMSG")
						.span("", "Download").build(wrapper);

					this.tempOwn(on(wrapper, "click", lang.hitch(this, "download", screen)));
				}
				var preview = this.previews[screen.id];
				if (preview) {
					this.renderCntr.removeChild(preview)
				}
			},

			onDataUrl:function(screen, e) {
				var wrapper = this.wrapper[screen.id];
				if (wrapper) {
					wrapper.innerHTML = "";
					var img = this.db.img().build(wrapper);
					img.src = e.target.result;

					this.db.span("", screen.name).build(wrapper);
	//
					this.tempOwn(on(wrapper, "click", lang.hitch(this, "download", screen)));
				}
				var preview = this.previews[screen.id];
				if (preview) {
					this.renderCntr.removeChild(preview)
				}
			},


			onImageError:function(screen, e) {
				this.logger.error("download", "Something went wrong", e);
				var wrapper = this.wrapper[screen.id];
				if (wrapper) {
					wrapper.innerHTML="";
					this.db.span("", "Error").build(wrapper);
				}
			},

			download:function(screen){
				this.logger.log(-1, "download", "enter > " + screen.id);
				var blob = this.blobs[screen.id];
				if (blob) {
					saveAs(blob, screen.name + '.png');
				} else {
					this.logger.log(0, "download", "No BLOB >" + screen.id);
				}
			}
    },
    mounted () {
    }
}
</script>