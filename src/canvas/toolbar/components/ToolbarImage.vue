
<template>
	<div class=" MatcToolbarPopUpCntr MatcToolbarImage ">
		<div type="button" ref="button" class="MatcToolbarItem MatcToolbarIconButton">
			<QIcon icon="Image" v-if="!multiSelection"/>
			<QIcon icon="ImageList" v-else/>
			<span class="MatcToolbarItemLabel">{{ btnLabel }}</span>
		</div>
		<div class="MatcToolbarPopUp" role="menu" data-dojo-attach-point="popup">
			<div class="MatcImageUpload" data-dojo-attach-point="upload">
				<div data-dojo-attach-point="imageContainer" class="MatcImageUploadContainer">
				</div>
				<div class="MatcPopupErrorMsg" data-dojo-attach-point="errorMsg"></div>
				<div data-dojo-attach-point="footer" class="MatcToolbarPopupFooter">
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import ScrollContainer from 'common/ScrollContainer'
import _DropDown from './_DropDown'
import Uploader from 'page/Uploader'
import Services from 'services/Services'
import QIcon from 'page/QIcon'
import {iconDOM} from 'page/QIconUtil'

export default {
	name: 'ToolbarImage',
	mixins: [DojoWidget, _DropDown],
	data: function () {
		return {
			value: false,
			reposition: true,
			arrowPosition: "right",
			mode: "private",
			multiSelection: false,
			selection: [],
			jwtToken: 'notoken'
		}
	},
	components: {
		'QIcon': QIcon
	},
	computed: {
		btnLabel() {
			if (this.selection && this.selection.length > 0) {
				return this.selection.length + ' Images'
			}
			if (this.value) {
				if (this.value.name) {
					return this.shorten(this.value.name, 20)
				}
				return 'Image'
			}
			if (this.multiSelection) {
				return 'No Images'
			}
			return 'No  Image'
		}
	},
	methods: {
		shorten(s, max) {
			if (s && s.length > max) {
				return s.substring(0, max) + '...'
			}
			return s
		},

		init() {
		},

		setJwtToken(t) {
			this.jwtToken = t
		},

		setCanvas(c) {
			this.canvas = c;
		},

		setMultiSelection(multiSelection) {
			this.multiSelection = multiSelection;
		},

		setSelection(selection) {
			if (selection) {
				this.selection = lang.clone(selection);
			}
		},

		setModel(m) {
			this.model = m;
		},

		setValue(v) {
			this.value = v;
		},

		onVisible() {
			this.load();
			this.canvas.enableMouseZoom(false);
			css.remove(this.errorMsg, "MatcPopupErrorMsgVivisble");
		},

		onHide() {

			this.cleanUpTempListener();
			if (this.uploader) {
				this.uploader.destroyFileDnD();
				this.uploader.destroy();
			}

			this.canvas.enableMouseZoom(true);
		},



		onUploadDone(result) {

			if (result.errors && result.errors.length > 0) {
				css.add(this.errorMsg, "MatcPopupErrorMsgVivisble");
				this.errorMsg.innerHTML = "The image type is not supported or the image bigger than 1 MB.";
			} else {
				css.remove(this.errorMsg, "MatcPopupErrorMsgVivisble");
				this.errorMsg.innerHTML = ""
			}
			this._files = null;
			this.load();
		},

		onUploadError(MSG) {
			this.errorMsg.innerHTML = MSG;
			css.add(this.errorMsg, "MatcPopupErrorMsgVivisble");
		},


		async load() {
			if (this.model.id) {
				let data = await Services.getModelService().findImages(this.model.id)
				this.render(data)
			} else {
				this.renderTryOut();
			}
		},

		renderTryOut() {
			var parent = document.createElement("div");

			var div = document.createElement("div");
			css.add(div, "MatcHint");
			div.innerHTML = "Register to upload images...";
			parent.appendChild(div);

			this.imageContainer.innerHTML = "";
			this.imageContainer.appendChild(parent);

			this.renderFooter();
		},

		render(data) {

			if (this.scrollCntr) {
				//this.scrollCntr.destroy();
			}
			this.cleanUpTempListener();


			let parent = document.createElement("div");
			this.tempOwn(on(parent, touch.press, lang.hitch(this, "stopEvent")));
			this.tempOwn(on(parent, "click", lang.hitch(this, "stopEvent")));

			let add = document.createElement("div");
			css.add(add, "MatcImageUploadPreview");

			if (this.uploader) {
				this.uploader.destroyFileDnD();
				this.uploader.destroy();
			}

			this.uploader = this.$new(Uploader, { size: 70, url: '/rest/images/' + this.model.id, width: 2 });
			this.uploader.placeAt(add);
			this.uploader.setMode(this.mode);
			this.uploader.initFileDnD(this.popup);
			parent.appendChild(add);

			this.tempOwn(this.uploader.on("uploadDone", lang.hitch(this, "onUploadDone")));
			this.tempOwn(this.uploader.on("uploadError", lang.hitch(this, "onUploadError", "Something went wrong...")));
			this.tempOwn(this.uploader.on("uploadPublicError", lang.hitch(this, "onUploadError", "Please register to upload images.")));


			for (let i = 0; i < data.length; i++) {
				let div = document.createElement("div");
				css.add(div, "MatcImageUploadPreview MatcToolbarDropDownButtonItem");
				if (data[i].width > data[i].height) {
					css.add(div, "MatcImageUploadPreviewHorizontal");
				} else {
					css.add(div, "MatcImageUploadPreviewVertical");
				}
				div.style.backgroundImage = "url(/rest/images/" + data[i].url + "?token=" + this.jwtToken + ")";

				if (this.imageIsSelected(data[i])) {
					css.add(div, "MatcImageUploadPreviewSelected ");
				}

				let del = document.createElement("div");
				css.add(del, "mdi mdi-close-circle MatcImageUploadRemove");

				this.tempOwn(on(del, touch.press, lang.hitch(this, "_deleteImage", data[i])));
				div.appendChild(del);

				parent.appendChild(div);
				this.tempOwn(on(div, touch.press, lang.hitch(this, "_selectImage", data[i], div)));
			}

			if (data.length == 0) {
				let div = document.createElement("div");
				css.add(div, "MatcHint");
				div.innerHTML = "Click the button or drop your images here!";
				parent.appendChild(div);
			}


			this.imageContainer.innerHTML = "";
			this.imageContainer.appendChild(parent);


			let s = this.$new(ScrollContainer);
			s.placeAt(this.imageContainer);
			s.wrap(parent);

			//css.remove(this.progressCntr, "MatcImageUploadLabelVisible");
			this.scrollCntr = s;

			this.renderFooter();

		},

		imageIsSelected(img) {
			if (this.multiSelection) {
				var url = img.url;
				return this.selection && this.selection.indexOf(url) >= 0;
			} else {
				return this.value && this.value.url == img.url
			}
		},


		renderFooter() {
			this.footer.innerHTML = "";
			if (this.multiSelection) {
		

				var bar = document.createElement("div");
				css.add(bar, "MatcButtonBar");

				var save = document.createElement("span");
				save.innerHTML = "Save";
				css.add(save, "MatcButton MatcButtonPrimary");
				bar.appendChild(save);

				var cancel = document.createElement("span");
				cancel.innerHTML = "Cancel";
				css.add(cancel, "MatcLinkButton");
				bar.appendChild(cancel);

				this.footer.appendChild(bar);

				this.tempOwn(on(save, touch.press, lang.hitch(this, "saveImageSelection")));
				this.tempOwn(on(cancel, touch.press, lang.hitch(this, "canceImageSelection")));

			} else {
				this.footer.appendChild(iconDOM('Delete'))
				var lbl = document.createElement("span")
				lbl.innerHTML = 'No Background Image'
				this.footer.appendChild(lbl)
				this.tempOwn(on(this.footer, touch.press, lang.hitch(this, "_removeImage")));
			}
		},

		saveImageSelection(e) {
			this.stopEvent(e);
			this.onChange(this.selection);
		},

		canceImageSelection(e) {
			this.stopEvent(e);
			this.hideDropDown();
		},



		_selectImage(v, div, e) {
			this.stopEvent(e);

			if (this.multiSelection) {

				var url = v.url;
				var pos = this.selection.indexOf(url);
				if (pos >= 0) {
					this.selection.splice(pos, 1);
					css.remove(div, "MatcImageUploadPreviewSelected");
				} else {
					this.selection.push(url);
					css.add(div, "MatcImageUploadPreviewSelected");
				}

			} else {
				var i = {
					name: v.name,
					url: v.url,
					w: v.width,
					h: v.height
				};
				this.onChange(i);
			}

		},

		_removeImage(e) {
			this.stopEvent(e);
			this.onChange(null);
		},

		setLabel() {

		},

		async _deleteImage(img, e) {
			this.stopEvent(e);
			if (this.mode == "public") {
				this.errorMsg.innerHTML = "Please register to delete images...";
				css.add(this.errorMsg, "MatcPopupErrorMsgVivisble");
			} else {
				const result = await Services.getImageService().delete(this.model, img)

				if (result.status !== 'ok') {
					this.errorMsg.innerHTML = "Only the owner can delete images";
					css.add(this.errorMsg, "MatcPopupErrorMsgVivisble");
				}

				if (this.value && this.value.url == img.url) {
					this.onChange(null);
				}

				const url = img.url;
				if (this.multiSelection) {
					const pos = this.selection.indexOf(url);
					if (pos >= 0) {
						this.selection.splice(pos, 1);
					}
				}
			}
			this.load();
		},
		destroy() {
			this.cleanUpTempListener();
		}
	},
	mounted() {
	}
}
</script>