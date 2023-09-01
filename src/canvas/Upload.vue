<script>
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import on from 'dojo/on'
import touch from 'dojo/touch'
import json from 'dojo/json'
import topic from 'dojo/topic'
import DomBuilder from 'common/DomBuilder'
import Ring from 'common/Ring'
import Dialog from 'common/Dialog'
import Services from 'services/Services'

export default {
    name: 'Upload',
    mixins:[],
    data: function () {
        return {
        }
    },
    components: {},
    methods: {
      initUpload (){
				this.logger.log(2,"initUpload", "enter");
				this._fileDnDListeners = [];
				this.own(on(this.domNode, "dragenter", lang.hitch(this, "_setUploadStatus", false, true)));
				this.own(on(this.domNode, "dragover", lang.hitch(this, "_setUploadStatus", false, false)));
				this.own(on(this.domNode, "dragleave", lang.hitch(this, "_setUploadStatus", true, false)));
				this.own(on(this.domNode, "drop", lang.hitch(this, "_uploadFileDrop")));
				this.own(topic.subscribe("matc/canvas/startupload", lang.hitch(this,"onFileUpload")));
			},

			_setUploadStatus (leave, checkScreen, e){

				e.preventDefault;
				e.preventDefault();
				if(leave){
					css.remove(this.domNode, "MatcCanvasImageUploadDND");
				} else {
					css.add(this.domNode, "MatcCanvasImageUploadDND");
					//this.showHint("Drop your files and the canvas to create screens...");
				}

				if (checkScreen){
					if (e.target && css.contains(e.target, "MatcScreenDnD")) {
						css.add(e.target, "MatcScreenDragOver");
						this._lastUplaodScreenDragOver = e.target
					} else {
						if (this._lastUplaodScreenDragOver){
							css.remove(this._lastUplaodScreenDragOver, "MatcScreenDragOver");
							delete this._lastUplaodScreenDragOver;
						}
					}
				}
				return false;
			},

			onFileUpload (files, e){
				this._files = files;
				this._sendFiles(e);
			},

			_uploadFileDrop (e){

				e.preventDefault;
				e.preventDefault();
				this.stopEvent(e);

				var dt = e.dataTransfer;
				this._files = dt.files;

				/**
				 * If we drop a zip file, we open the import dialog. One
				 * might still want to select what to import.
				 */
				if (this._files.length === 1 && this._files[0].name.endsWith('.zip')) {
					css.remove(this.domNode, "MatcCanvasImageUploadDND");
					if (this.toolbar) {
						this.toolbar.showImportDialog(e, this._files)
					}
					return
				}

				css.remove(this.domNode, "MatcCanvasImageUploadDND");
				this._sendFiles(e);

				return false;
			},

			_sendFiles (e){
				this.logger.log(1,"_sendFiles", "entry");
				this.stopEvent(e);

				if(this.isPublic){
					this.showHint("Please register to upload files...");
				} else {

					this.showHint("Uploading files....");
					var pos = this.getCanvasMousePosition(e);
					if(pos.x < 0 || pos.y <0 || isNaN(pos.x) || isNaN(pos.y)){
						pos.x = -1*(this.domPos.x + this.canvasPos.x -200);
						pos.y = -1*(this.domPos.y + this.canvasPos.y -200);
						this.logger.log(0, "_sendFiles()","pos < 0 => fix " + pos.x + " > " + pos.y + " most likey upload button!");
					}

					this.logger.log(0,"_sendFiles", "pos : " + pos.x + "x" + pos.y);
					var hoverScreen = this.getHoverScreen(pos);

					/**
					 * Now render a screen for every file with a progress bar
					 */
					var screens = {};
					var completed = [];
					this._uploadJobs = {};
					this._uploadJobCount = 0;
					for(let i = 0; i < this._files.length; i++) {
						let file = this._files[i];
						if(file.size < 50000000){
							if (hoverScreen) {
								this.logger.log(0,"_sendFiles", "create image");
								let x = pos.x + (10 + this.getZoomed(10,this.zoom)) * i;
								let y = pos.y + (10 + this.getZoomed(10,this.zoom)) * i;
								let screen = this.createEmptyImage(x,y, file.name);
								/**
								 * we unzoom because the createEmptyScreen operates in the zoomed model
								 */
								screen = this.getUnZoomedBox(screen, this.zoom, this.zoom);
								screens[file.name] = screen;
								/**
								 * Now create a job...
								 */
								this._uploadJobs[file.name] = {
									screen : screen,
									running : true,
									widget: true,
									parentScreen: hoverScreen
								};
							} else {
								let x = pos.x + (this.model.screenSize.w + this.getZoomed(100,this.zoom)) * i;
								let screen = this.createEmptyScreen(x,pos.y, file.name);
								/**
								 * we unzoom because the createEmptyScreen operates in the zoomed model
								 */
								screen = this.getUnZoomedBox(screen, this.zoom, this.zoom);
								screens[file.name] = screen;
								/**
								 * Now create a job...
								 */
								this._uploadJobs[file.name] = {
									screen : screen,
									running : true
								};
							}

							this._uploadJobCount++;
						} else {
							this.showError("The image " + file.name + " is too big (max 10mb).");
						}
					}

					/**
					 * Now we send the data and update the previes afterwards
					 */
					if(this._uploadJobCount > 0){
						this._renderUploadJobs();
						let names = {};
						for(let i = 0; i < this._files.length; i++) {
							let name = this._files[i].name;
							if(!names[name]){
								this._sendSingleFile(i, this._files[i], screens, completed, pos, hoverScreen)
							}
							names[name] = true;
						}
					}
				}
			},



			_sendSingleFile (i, file, screens, completed, pos, hoverScreen){

				var formData = new FormData();
				formData.append('file', file);

				/**
				 * Sketch (new and legacy) has different URL
				 */
				var url = '/rest/images/' + this.model.id;
				if(file.name.endsWith("qux")){
					let pos2 = this.getUnZoomedBox(pos, this.zoom, this.zoom);
					url = '/rest/import/sketch/' + this.model.id + "?x="+pos2.x + "&y=" + pos2.y;
				}
				if(file.name.endsWith("sketch")){
					let pos2 = this.getUnZoomedBox(pos, this.zoom, this.zoom);
					url = '/rest/import/sketch2/' + this.model.id + "?x="+pos2.x + "&y=" + pos2.y;
				}

				let imageService = Services.getImageService()
				imageService.upload(url, formData).then(response => {
					this._onUploadDone(response, screens, completed, file.name, pos, hoverScreen);
				}, err => {
					this._onUploadError(err, screens, completed, file.name, pos, hoverScreen);
				})
			},

			_onUploadDone (result, screens, completed, fileName, pos, hoverScreen){
				this.logger.log(-1,"_onUploadDone", "enter >  " ,this._uploadJobCount,  fileName);

				if(result.error){
					console.error("_onUploadDone()", result);
					this.logger.error("_onUploadDone", "Error while uploading");
					this.showError("Upps... Something went wrong.");
				} else {
					result = json.parse(result);
					if(fileName.endsWith("qux") || fileName.endsWith("sketch")){
						this._onSketchUploaded(result, screens, completed, fileName);
					} else {
						this._onImageUploaded(result, screens, completed, fileName);
					}
				}

				this._uploadJobCount--;
				if(this._uploadJobCount == 0){

					this._cleanUpUploadJobs();
					if(!fileName.endsWith("qux") && !fileName.endsWith("sketch")){

						if (hoverScreen){
							this.logger.log(-1,"_onUploadDone", "create widgets >  ");
							this.controller.addMultiImageWidgets(completed,hoverScreen);
							this.showError("BETA: You dropped the images on a screen. They are created as images!");
						} else {
							this.controller.addMultiScreens(completed,true);
							this.showSuccess("Images were created as screens...");
						}

					} else {
						/**
						 * Check if we have a re-import
						 */
						if(this.controller.isSketchUpdate(completed)){
							this.controller.updateScreensAndWidgets(completed, pos);
							this.showSuccess("Sketch Design Updated...");
						} else {
							this.controller.addScreensAndWidgets(completed, pos);
							this.showSuccess("Sketch Design Imported...");
						}
					}
				}

			},

			_sketchUploadDialog (completed, pos){

				var db = new DomBuilder();
				var popup = db.div("MatcDialog MatcHeaderDialog MatcPadding").build();

				var cntr = db.div("").build(popup);

				db.h2("", "Sketch Import").build(cntr);
				db.div("MatcHint", "The export file contains exiting screens and widgets. Do you want to update the existing widgets or import as new?").build(cntr);


				var bar = db.div("MatcButtonBar MatcMarginTopXL").build(popup);
				var cancel = db.a("MatcButton MatcButtonPrimary", "Import as new").build(bar);
				var save = db.a("MatcButton ", "Update Elements").build(bar);


				var dialog = new Dialog();
				dialog.own(on(cancel, touch.press, lang.hitch(this, "_sketchKeepChanges", dialog, completed, pos)));
				dialog.own(on(save, touch.press, lang.hitch(this, "_sketchOverrideChanges", dialog, completed, pos)));

				dialog.popup(popup, this.domNode);

			},

			_sketchOverrideChanges (dialog, completed, pos){
				dialog.close();
				this.controller.updateScreensAndWidgets(completed, pos);
			},

			_sketchKeepChanges (dialog, completed, pos){
				dialog.close();
				this.controller.addScreensAndWidgets(completed, pos);
			},

			_onSketchUploaded (result, screens, completed){

				this.logger.log(1,"_onSketchUploaded", "enter");

				if(!completed.screens){
					completed.screens = {};
				}
				if(!completed.widgets){
					completed.widgets = {};
				}
				if(!completed.groups){
					completed.groups = {};
				}
				for(let id in result.screens){
					let screen = result.screens[id];
					completed.screens[id] = screen;
				}
				for(let id in result.widgets){
					let widget = result.widgets[id];
					completed.widgets[id] = widget;
				}
				if(result.groups){
					for(let id in result.groups){
						let group = result.groups[id];
						completed.groups[id] = group;
					}
				}
				this.logger.log(2,"_onSketchUploaded", "exit");
			},

			_onImageUploaded (result, screens, completed){
				this.logger.log(-1,"_onImageUploaded", "enter", result);
				var uploads  = result.uploads;
				var names = [];
				for(var i=0; i< uploads.length; i++){
					var upload = uploads[i];
					if(screens[upload.name]){
						/**
						 * Ok, the upload was good. Now we add the style...
						 *
						 * FIXME: This is a bit hacky as the background must be defined
						 * before the image. This is a bug in the RenderFactoy
						 *
						 * We should just update the prop in here.. the screen should have already
						 */
						var screen = screens[upload.name];

						screen.style.backgroundImage = {
							name: upload.name,
							url : upload.url,
							w : upload.width,
							h : upload.height
						};

						if(this._uploadJobs[upload.name]){
							var job = this._uploadJobs[upload.name];
							var ring = job.ring;
							job.running = false;

							ring.stopAnimation();
							ring.setPercent(1);
						}

						completed.push(screen);
						names.push(upload.name);
					} else {
						console.warn("_onUploadDone() > Could not upload", upload);
					}
				}

				this.showSuccess("Uploading done "+ names.join(", "));
			},

			_cleanUpUploadJobs (){
				//console.debug("_deleteUploadScreens() > enter");
				for(var id in this._uploadJobs){
					var job = this._uploadJobs[id];
					var ring = job.ring;
					ring.stopAnimation();
					ring.destroy();
					let div = job.div
					if (div && div.parentNode) {
						 div.parentNode.removeChild(div)
					}
				}
				this.addAfterRenderCallBack(null);
				delete this._uploadJobCount;
				delete this._uploadJobs;
			},

			_renderUploadJobs (){

				var db = new DomBuilder();

				for(var screenID in this._uploadJobs){
					var job = this._uploadJobs[screenID];
					var screen = job.screen;
					screen = this.getZoomedBox(lang.clone(screen), this.zoom, this.zoom);
					var div = this.createScreen(screen);
					css.add(div, "MatcCanvasImageUploadPreview");
					db.div("MatcScreenLabel", screen.name).build(div);
					var cntr = db.div("MatcCenter MatcMiddle").build(div);

					var size = Math.round(Math.min(screen.w,screen.h) *0.8);
					var ring = this.$new(Ring, {
						color:"#49c0f0",
						width : Math.max(1, Math.round( 10 * this.zoom)),
						size :size
					});

					ring.setSize(size);
					ring.hideLabel();
					ring.placeAt(cntr);
					if(job.running){
						ring.startAnimation();
					} else {
						ring.setPercent(1);
					}

					this.dndContainer.appendChild(div);
					job.div = div;
					job.ring = ring;
				}

				/**
				 * make sure the screens are rendered...
				 */
				if(this._uploadJobCount){
					this.addAfterRenderCallBack(lang.hitch(this, "_renderUploadJobs"))
				}
			},

			_onUploadError (){

				this._cleanUpUploadJobs();

				this.showError("Could not upload files");

				this.rerender();
			}
    },
    mounted () {
    }
}
</script>