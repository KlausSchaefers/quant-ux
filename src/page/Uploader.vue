
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
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import Services from 'services/Services'
import QIcon from 'page/QIcon'

export default {
	name: 'Uploader',
	mixins: [DojoWidget],
	data: function () {
		return {
			url: "",
			enabled: true,
			size: 150,
			color: "#92c500",
			width: 5,
			animationSpeed: 30,
			allowedFile: ["png", "jpg", "psd", "qux", "gif", "jpeg"]
		}
	},
	components: {
		'QIcon': QIcon
	},
	methods: {
		postCreate() {
			this.own(on(this.file, "change", lang.hitch(this, "_onFileChange")));
			this._canvas = document.createElement("canvas");
			this._canvas.height = this.size;
			this._canvas.width = this.size;
			this.canvasCntr.appendChild(this._canvas);
			this.own(on(this.domNode, "mousedown", lang.hitch(this, "_onOpenFile")));
			this.own(on(this.domNode, "mouseup", lang.hitch(this, "_onOpenFile")));
			this.own(on(this.domNode, "click", lang.hitch(this, "_onOpenFile")));
		},

		setMode(m) {
			this.mode = m
		},

		_onOpenFile(e) {
			e.stopPropagation();
			this._lastMouseEvent = e;
		},

		setUploadCallBack(fct) {
			this.uploadCallback = fct;
		},

		setEnabled(e) {
			this.enabled = e;
		},

		_sendFiles() {
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

				let imageService = Services.getImageService()
				imageService.upload(this.url, formData).then(response => {
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
		},

		onUploadDone(data) {
			this.stopUploadAnimation();
			data = JSON.parse(data);
			this.emit("uploadDone", data, this._lastMouseEvent);
		},

		onUploadError() {
			this.stopUploadAnimation();
			this.emit("uploadError", []);
		},

		_onFileChange(e) {
			this.stopEvent(e);
			this._files = this.file.files;

			if (this.uploadCallback) {
				this.uploadCallback(this._files, e);
				this.stopUploadAnimation();
			} else {
				this._sendFiles();
			}
		},

		_onFileDropped(e) {
			e.preventDefault();
			this.stopEvent(e);
			var dt = e.dataTransfer;
			this._files = dt.files;
			if (this.uploadCallback) {
				this.uploadCallback(this._files, e);
				this.stopUploadAnimation();
			} else {
				this._sendFiles();
			}
			this._lastMouseEvent = e;
			return false;
		},

		_stop(leave, e) {
			e.preventDefault();
			if (leave) {
				css.remove(this.domNode, "MatcUploaderDnD");
			} else {
				css.add(this.domNode, "MatcUploaderDnD");
			}
			return false;
		},

		initFileDnD(node) {
			this._fileDnDListeners = [];
			this._fileDnDListeners.push(on(node, "dragenter", lang.hitch(this, "_stop", false)));
			this._fileDnDListeners.push(on(node, "dragover", lang.hitch(this, "_stop", false)));
			this._fileDnDListeners.push(on(node, "dragleave", lang.hitch(this, "_stop", true)));
			this._fileDnDListeners.push(on(node, "drop", lang.hitch(this, "_onFileDropped")));
		},

		destroyFileDnD() {
			if (this._fileDnDListeners) {
				for (var i = 0; i < this._fileDnDListeners.length; i++) {

					this._fileDnDListeners[i].remove();
				}
			}
			delete this._fileDnDListeners;
		},

		startUploadAnimation() {
			this.animationRunning = true;
			this.animationState = 0;
			this.animate();
			css.add(this.domNode, "MatcUploaderLoading");
		},

		stopUploadAnimation() {
			this.animationRunning = false;
			this.clearProgress();
			css.remove(this.domNode, "MatcUploaderLoading");
			css.remove(this.domNode, "MatcUploaderDnD");
		},

		stopDummyAnimation() {
			this.stopUploadAnimation();
			this.emit("uploadNotEnabled", []);
		},

		animate() {
			if (this.animationRunning) {
				this.setProgress(this.animationState);
				this.animationState += 0.01;
				if (this.animationState > 1.1) {
					this.animationState = 0;
				}
				if (!window.requestAnimationFrame) {
					setTimeout(lang.hitch(this, "animate"), this.animationSpeed);
				} else {
					var callback = lang.hitch(this, "animate");
					requestAnimationFrame(callback);
				}
			}
		},


		setProgress(p) {
			var x = this.size / 2;
			var c = this._canvas;
			var ctx = c.getContext("2d");
			this.clearProgress();
			ctx.beginPath();
			var s = this._degreesToRadians(0);
			var e = this._degreesToRadians(360 * p);
			ctx.arc(x, x, (x - this.width / 2), s, e);
			ctx.strokeStyle = this.color
			ctx.lineWidth = this.width;
			ctx.stroke()
		},

		clearProgress() {
			var c = this._canvas;
			var ctx = c.getContext("2d");
			ctx.clearRect(0, 0, c.width, c.height);
		},

		_degreesToRadians(degrees) {
			return (degrees * (Math.PI / 180)) - Math.PI / 2;
		},

		destroy() {
			if (this.destroyFileDnD) {
				this.destroyFileDnD();
			}
		}
	},
	mounted() {
	}
}
</script>