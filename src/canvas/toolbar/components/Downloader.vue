
<template>
     <div class="MatcDownloader ">
		<div data-dojo-attach-point="donwloadBtn" class="MatcPointer MatcToolbarItem MatcToolbarIconButton">
			<QIcon icon="Download"/>
			<span class="MatcToolbarItemLabel">Download PNG</span>
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
import Preview from 'page/Preview'
import QIcon from 'page/QIcon'

import * as htmlToImage from 'html-to-image';

export default {
    name: 'Downloader',
    mixins:[_Tooltip, DojoWidget],
    data: function () {
        return {

        }
    },
    components: {
		'QIcon': QIcon
	},
    methods: {
      postCreate (){
				this.logger = new Logger("Downloader");
				if (window.saveAs) {
					this.addTooltip(this.donwloadBtn, "Download as PNG");
					this.own(on(this.donwloadBtn, touch.press, lang.hitch(this, "download")));
				} else {
					this.domNode.innerHTML = '<span class="MatcToolbarItemLabel">Not supported browser</span>';
					this.logger.log(0, "onImageReady", "No saveAs");
				}
			},

		setModel (model, screenID) {
			this.logger.log(3, "setModel", "enter > " + screenID)
			this.model = model;
			this.screenID = screenID;
		},

		setJwtToken(t) {
			this.jwtToken = t
		},

		download () {

			var f = 3 //; this.sizeDropDown.getValue();
			var screen = this.model.screens[this.screenID];
			if (screen) {
				this.logger.log(0, "download", "enter > " + this.screenID + " > f:" + f);

				try {
					var db = new DomBuilder();
					this.cntrNode = db
						.div("MatcDownloaderCntr")
						.div("MatcDownloaderWrapper").w(screen.w * f).h(screen.h * f)
						.build(this.domNode);

					var s = this.$new(Preview);
					s.placeAt(this.cntrNode);
					s.setJwtToken(this.jwtToken);
					s.setModel(this.model, this.screenID);

					htmlToImage.toBlob(s.domNode)
			    		.then(lang.hitch(this, "onPngReady", screen))
			    		.catch(lang.hitch(this, "onImageError"));

				} catch (e) {
					this.logger.error("download", "Something went wrong", e);
					this.logger.sendError(e);
				}
			} else {
				this.logger.error("download", "No screen with id" + this.screenID);
			}
		},

		onImageError  (e) {
			this.logger.error("onImageError", "Could not create image", e);
			this.logger.sendError(new Error("Could not convert image"));
			this.logger.sendError(e);
			this.cleanUp();
		},


		onPngReady (screen, blob){
			this.logger.log(0, "onPngReady", "enter > ");
			try {
				if (window.saveAs) {
					 window.saveAs(blob, screen.name + '.png');
				} else {
					this.logger.log(0, "onPngReady", "No saveAs");
				}
			} catch (e) {
				this.logger.error("onPngReady", "Something went wrong", e);
				this.logger.sendError(e);
			}
	        this.cleanUp();
	        this.logger.log(0, "onPngReady", "exit");
		},

		cleanUp () {
			this.logger.log(0, "cleanUp", "enter");
			if(this.cntrNode && this.cntrNode.parentNode){
				this.cntrNode.parentNode.removeChild(this.cntrNode)
			}
			delete this.cntrNode;
		}
    },
    mounted () {
    }
}
</script>