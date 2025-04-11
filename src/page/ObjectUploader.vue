
<template>
	<div class="MatcUploader">
		<div class="MatcUploaderCanvas " data-dojo-attach-point="canvasCntr"></div>
		<QIcon icon="Upload"/>
		<input type="file" data-dojo-attach-point="file" class="MatcImageUploadFile" />
	</div>
</template>
<style lang="scss">
  @import '../style/components/upload.scss';
</style>
<script>
import Uploader from './Uploader.vue'
import Services from 'services/Services'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import QIcon from 'page/QIcon'

export default {
	name: 'Uploader',
	mixins: [Uploader],
	data: function () {
		return {
			url: "",
			enabled: true,
			size: 150,
			color: "#92c500",
			width: 5,
			animationSpeed: 30,
			allowedFile: ["mp3"]
		}
	},
	components: {
		'QIcon': QIcon
	},
	methods: {
		
		_sendFiles() {
			console.debug('_send')
			if (this.mode == "public") {
				console.debug("Upload not allowed in public")
				this.emit("uploadPublicError", []);
				return;
			}

			css.remove(this.domNode, "MatcUploaderDnD");
			if (this.enabled && this.url) {
				this.emit("uploadStart", []);

				var formData = new FormData();
				var names = {};
				for (var i = 0; i < this._files.length; i++) {
					var name = this._files[i].name;
					if (!names[name]) {
						formData.append('file', this._files[i]);
					}
					names[name] = true;
				}

				let uploadService = Services.getUploadService()
				uploadService.upload(this.url, formData).then(response => {
					this.onUploadDone(response);
				}, err => {
					this.onUploadError(err);
				})

				this.startUploadAnimation();

			} else {
				this.emit("uploadStart", []);
				/**
				 * Simulate upload
				 */
				this.startUploadAnimation();
				setTimeout(lang.hitch(this, "stopDummyAnimation"), 2000);

			}
		}
	},
	mounted() {
	}
}
</script>