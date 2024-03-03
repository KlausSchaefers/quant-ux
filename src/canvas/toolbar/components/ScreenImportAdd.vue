
<template>
     <div class="MatcToolbarItem  MatcMultiIcon MatcScreenImportAdd MatcToolbarDropDownButton">
		<div type="button" ref="button">
			<label data-dojo-attach-point="label" class="">
				<QIcon icon="DeviceMobile" />

			</label>

			</div>
			<div class="MatcToolbarPopUp" role="menu" data-dojo-attach-point="popup">
			<div class="MatcScreenAddCntr MatcPadding">
					<div class="container-fluid">
					<div class="row">
						<div class="col-md-6 MatcCenter" data-dojo-attach-point="addCntr">
						</div>
						<div class="col-md-6 MatcCenter" data-dojo-attach-point="uploadCntr">
							
						</div>
						
					</div>
				</div>
			</div>

			<div class="MatcToolbarPopUpArrowCntr">
				<div class="MatcToolbarPopUpArrow">
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
import topic from 'dojo/topic'
import DomBuilder from 'common/DomBuilder'
import Util from 'core/Util'
import RenderFactory from 'core/RenderFactory'
import _DropDown from './_DropDown'
import QIcon from 'page/QIcon'
import _Tooltip from 'common/_Tooltip'

export default {
    name: 'ScreenImportAdd',
    mixins:[Util, DojoWidget, _DropDown, _Tooltip],
    data: function () {
        return {
            screenWidth: 300,
            screenHeight: 600,
            selectedCategory: "Screen",
            showSubCatgeoryLabels: false,
			previewSizes : {
				"default" : {
					w : 120,
					h : 70
				},
				"Screen" : {
					w : 160,
					h : 200
				}
			}
        }
    },
    components: {QIcon},
    methods: {
			setModel (m){
				this.model = m;
				this.screenWidth = m.screenSize.w;
				this.screenHeight = m.screenSize.h;
				this.renderFactory = new RenderFactory();
				this.renderFactory.setModel(m);
				// if (this.icon){
				// 	css.add(this.icon, this.getAppTypeIcon(m));
				// }

			},

			onVisible (){
				css.add(this.domNode,"MatcToolbarItemActive");
				if(this.uploader){
					this.uploader.initFileDnD(this.popup);
				}
				this.setInfo("( Click or Drop files here)");
			},

			onHide (){
				if(this.domNode){
					css.remove(this.domNode,"MatcToolbarItemActive");
					if (this.uploader) {
						this.uploader.destroyFileDnD();
					}
				}
			},

			init (){

				var db = new DomBuilder();

				var add = db.div("MatcUploader").build(this.addCntr);
				db.div("MatcUploaderIcon MatcMiddle mdi mdi-crop-portrait").build(add);
				db.div("MatcHint MatcMarginTop", "Create Empty Screen").build(this.addCntr);
				this.own(on(add, touch.press, lang.hitch(this, "onAddScreen")));

				var upload = db.div("MatcUploader").build(this.uploadCntr);
				db.div("MatcUploaderIcon MatcMiddle mdi mdi-cloud-upload").build(upload);
				db.div("MatcHint MatcMarginTop", "Import Screens").build(this.uploadCntr);
				this.own(on(upload, touch.press, lang.hitch(this, "onImportScreen")));

			},

			onImportScreen (e) {
				this.stopEvent(e);
				this.hideDropDown();
				this.emit("onImport", e);
			},

			onDesignGPT (e) {
				this.stopEvent(e);
				this.hideDropDown();
				this.emit("onDesignGPT", e);
			},


			onAddScreen (e){
				this.stopEvent(e);
				var screen = this.createEmptyScreen(0,0,"Screen");
				screen._type = "Screen";
				this.hideDropDown();
				this.emit("onAdd", screen,e);
			},


			onFilesSelected (files,e){
				this.logger.log(0,"onFilesSelected", "enter" );
				topic.publish("matc/canvas/startupload", files, e);
				this.hideDropDown();
			},



			onFilesUploaded (result,e ){
				this.logger.log(1, "ScreenImportAdd.onFilesUploaded", "enter");
				var uploads  = result.uploads;
				var screens = [];
				for(var i=0; i< uploads.length; i++){
					var upload = uploads[i];
					var screen = this.createEmptyScreen((this.model.screenSize.w + 100 )*i, 0, upload.name);
					screen.style.backgroundImage ={
						url : upload.url,
						w : upload.width,
						h : upload.height
					};
					screens.push(screen);
				}
				this.hideDropDown();
				this.emit("onUpload", screens,e);

			},

			setInfo (txt){
				if(this.help){
					css.remove(this.help, "MatcError");
					this.help.innerHTML=txt;
				}

			},

			onError (txt){
				if(this.help){
					css.add(this.help, "MatcError");
					this.help.innerHTML=txt;
				}
			},

			destroy (){
				if(this.uploader){
					this.uploader.destroy();
				}
			}
    },
    mounted () {
		this.addTooltip(this.$el, this.getNLS("tooltip.screen"))
    }
}
</script>