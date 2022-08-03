
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import on from 'dojo/on'
import touch from 'dojo/touch'
import hash from 'dojo/hash'
import domGeom from 'dojo/domGeom'
import win from 'dojo/win'
import CheckBox from 'common/CheckBox'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import Simulator from 'core/Simulator'
import ScrollContainer from 'common/ScrollContainer'
import RadioBoxList from 'common/RadioBoxList'
import Form from 'common/Form'
import ScreenSizeSelector from 'page/ScreenSizeSelector'

import Plan from 'page/Plan'
import Services from 'services/Services'
import QR from 'core/QR'
import Help from 'help/Help'
import Share from 'page/Share'

import ImportDialog from 'canvas/toolbar/dialogs/ImportDialog'
import AnimationComposer from 'canvas/toolbar/dialogs/AnimationComposer'
import ExportDialog from 'canvas/toolbar/dialogs/ExportDialog'
import CustomFonts from 'canvas/toolbar/dialogs/CustomFonts'

export default {
    name: '_Dialogs',
    mixins:[Plan, DojoWidget],
    data: function () {
        return {

        }
    },
    components: {},
    methods: {
		showFontDialog (e) {
			this.logger.log(0,"showFontDialog", "entry > ", this.isPublic);

			var db = new DomBuilder();
			var popup = db.div("MatcFontDialog  MatcPadding").build();


			let customFonts = this.$new(CustomFonts);
			customFonts.placeAt(popup);
			customFonts.setModel(this.model)

			let row = db.div("row MatcMarginTop").build(popup);
			let right = db.div("col-md-12 MatcButtonBar").build(row);
			var save = db.div("MatcButton", "Save").build(right);
			var close = db.div("MatcLinkButton", "Close").build(right);

			var d = new Dialog();
			d.own(on(close, touch.press, lang.hitch(d,"close")));
			d.own(on(save, touch.press, lang.hitch(this,"saveFonts", d, customFonts)));


			d.popup(popup, e.target);
		},

		saveFonts (dialog, customFonts) {
				this.logger.log(0,"saveFonts", "entry > ");

				this.controller.setFonts(customFonts.getFonts());

				dialog.close()
		},

		showImportDialog (e, zipFiles = null) {
			this.logger.log(-1,"showImportDialog", "entry > " + this.isPublic);
			let dialog = new Dialog()
      		var db = new DomBuilder();
			var popup = db.div("MatcDialog MatchImportDialog MatcPadding").build();
      		dialog.popup(popup, e.target);
      		
			let importDialog = this.$new(ImportDialog)
			importDialog.placeAt(popup)

			importDialog.setPublic(this.isPublic)
			importDialog.setJwtToken(this.jwtToken)
			importDialog.setModel(this.model)
			importDialog.setController(this.controller)
			importDialog.setCanvas(this.canvas)
			importDialog.setZoom(this.canvas.getZoomFactor())
			if (zipFiles) {
				importDialog.onZipFileDropped(zipFiles)
			}
			importDialog.$on('save', data => {
					this.logger.log(-1,"showImportDialog", "save > ", data);
					dialog.close()
			})
			importDialog.$on('cancel', () => {
					this.logger.log(-1,"showImportDialog", "cancel > ");
					dialog.close()
			})
		},

	showHelp (e) {
		let dialog = new Dialog()
    	var db = new DomBuilder();
		let popup = db.div("MatcDialog MatcHelpDialog MatcPadding").build();
      	dialog.popup(popup, e.target);
     	let help = this.$new(Help)
     	help.placeAt(popup)
	},

    async showSharing (e){
			this.logger.log(-1,"showSharing", "entry > ", this.isPublic);

			var invitation = await Services.getModelService(this.$route).findInvitation(this.model.id)
			var temp = {};
			for(var key in invitation){
				temp[invitation[key]] = key;
			}

			var db = new DomBuilder();
			var popup = db.div("MatcInfitationDialog MatcInfitationDialogLarge MatcPadding").build();
			var cntr = db.div("container").build(popup);
			var row = db.div("row").build(cntr);
			var right = db.div("col-md-12").build(row);
			db.h3("",this.getNLS("share.Headline")).build(right);

			let share = this.$new(Share)
			share.placeAt(right)
			share.setInvitation(temp[1])
			share.setPublic(this.isPublic)

			row = db.div("row MatcMarginTop").build(cntr);
			right = db.div("col-md-12 MatcButtonBar").build(row);

			var write = db.div("MatcButton", "Close").build(right);

			var d = new Dialog();
			d.own(on(write, touch.press, lang.hitch(d,"close")));
			d.popup(popup, e.target);
		},


		showDownloadDialog (e){

			var d = new Dialog();

			var db = new DomBuilder();

			var div = db.div("").build();

			var exportDialog = this.$new(ExportDialog);
			exportDialog.setJwtToken(this.jwtToken);
			exportDialog.placeAt(div);
			setTimeout(() => {
				exportDialog.setModel(this.model);
			}, 500)


			d.own(on(exportDialog, 'cancel', lang.hitch(d, "close")));
			d.popup(div, e.target);

		},


		onChangeScreenSize:function(e){

			var d = new Dialog();
			var db = new DomBuilder();
			var div = db.div("MatcDialog MatcResizeDialog ").build();

			var cntr = db.div("form-group").build(div);
			var selector = this.$new(ScreenSizeSelector);
			selector.setValue(this.model);
			selector.placeAt(cntr);

			var bar = db.div(" MatcMarginTop row").build(div);

			var left = db.div("col-md-6 MatcButtonBar").build(bar);

			var change = db.a("MatcButton", "Change").build(left);
			var cancel = db.a("MatcLinkButton", "Close").build(left);

			d.own(on(cancel, touch.release, lang.hitch(d, "close")));
			d.own(on(change, touch.release, lang.hitch(this, "_changeScreenSize", d, selector, div)));
			d.popup(div, e.target);
		},

		_changeScreenSize:function(d, selector){
			var newSize = selector.getValue();
			d.close();
			this.controller.setScreenSize(newSize, false);
		},

		showOutOFSyncError (localApp, callback) {

			let db = new DomBuilder();
			var popup = db.div("MatcDialog MatcHeaderDialog MatcPadding").build();

			var cntr = db.div().build(popup);

			db.h3("MatcDialogHeader", "Error Detected").build(cntr);
			db.p("", "We found that there is a newer version stored on your computer. This can happen when there are networking issues.").build(cntr);
			db.p("", "Do you want to use the local version, or the version from the server.").build(cntr);

			var dialog = new Dialog();
			dialog.own(on(dialog, "close", lang.hitch(this, "closeDialog")));

			var bar = db.div("MatcButtonBar MatcMarginTopXL").build(popup);
			var fix = db.div("MatcButton", "Keep local version").build(bar);
			var stay = db.a("MatcButton ", "Keep online version").build(bar);

			dialog.own(on(fix, touch.press, () => {
				dialog.close()
				callback(true)
			}));

			dialog.own(on(stay, touch.press, () => {
				dialog.close()
				callback(false)
			}));

			dialog.popup(popup, this.template);
		},


		showShortCuts:function(e){

			var d = new Dialog();

			var db = new DomBuilder();

			var div = db.div("MatcDialog MatcShortCutDialog").build();

			var tblCntr =  db.div("MatcToolbarHelpKeyCntr container").build(div);

			var row = db.div("row").build(tblCntr);
			var left = db.div("col-md-6").build(row);
			var right = db.div("col-md-6").build(row);


			let tbl = db.table().build(left);

			this._renderShortCut(db, tbl,"CTRL", " Disable Snapping");
			this._renderShortCut(db, tbl,"CTRL C", "Copy");
			this._renderShortCut(db, tbl,"CTRL V", "Paste");
			this._renderShortCut(db, tbl,"CTRL D", "Duplicate");
			this._renderShortCut(db, tbl,"CTRL G", "Group / Ungroup");
			this._renderShortCut(db, tbl,"CTRL &uarr;", "Bring to Front ");
			this._renderShortCut(db, tbl,"CTRL &darr;", "Send Back");
			this._renderShortCut(db, tbl,"SHIFT CLICK", "Multi Selection");
			this._renderShortCut(db, tbl,"SHIFT I", "Select Text Color");
			this._renderShortCut(db, tbl,"CTRL I", "Select Border Color");
			this._renderShortCut(db, tbl,"I", "Select Background Color");
			this._renderShortCut(db, tbl,"SPACE", "Move Tool");
		
			tbl = db.table().build(right);
			this._renderShortCut(db, tbl,"ALT", "Measure Tool");
			this._renderShortCut(db, tbl,"L", "Create Line");
			this._renderShortCut(db, tbl,"+", "Zoom In");
			this._renderShortCut(db, tbl,"-", "Zoom Out");
			this._renderShortCut(db, tbl,"R", "Create Rectangle");
			this._renderShortCut(db, tbl,"H", "Create Hotspot");
			this._renderShortCut(db, tbl,"T", "Create Text");
			this._renderShortCut(db, tbl,"S", "Create Screen");
			this._renderShortCut(db, tbl,"W", "Create Widget");
			this._renderShortCut(db, tbl,"D", "Distribute Selection");
			this._renderShortCut(db, tbl,"C", "Clone Selection");
		

			var scroller = this.$new(ScrollContainer);
			scroller.placeAt(tblCntr);
			scroller.wrap(row);

			var bar = db.div("MatcButtonBar MatcMarginTop").build(div);
			var cancel = db.a("MatcButton", "Close").build(bar);

			d.own(on(cancel, touch.release, lang.hitch(d, "close")));
			d.popup(div, e.target);
		},

		_renderShortCut:function(db, tbl, keys, txt){
			var tr = db.tr().build(tbl);
			var td = db.td().build(tr);
			var parts = keys.split(" ");
			for(var i=0; i < parts.length; i++){
				db.span("MatcToolbarHelpKeyBlock",parts[i] ).build(td);
			}
			db.td("MatcHint MatcToolbarHelpKeyBlockTxt", txt).build(tr);
		},


		showSignUpReminderDialog:function(node){

			var d = new Dialog();

			var db = new DomBuilder();

			var div = db.div("MatcDialog ").build();

			db.h2("", "Hi!").build(div);

			db.div("MatcHint", "It seems you like our tool. Why don't you sign up, it's for free!").build(div);

			var bar = db.div("MatcButtonBar MatcMarginTopXL").build(div);

			var save = db.a("MatcButton ", "Sign Up For Free").build(bar);
			var cancel = db.a(" MatcLinkButton ", "Cancel").build(bar);

			d.own(on(d, "close", lang.hitch(this, "closeDialog")));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			var me = this;
			d.own(on(save, touch.press, function(){
				div.innerHTML = "";
				me._createSignUpForm(d, div);
				d.resize(div);
			}));
			d.popup(div, node);

		},


		showSignUpDialog:function(e){
			var d = new Dialog();
			var db = new DomBuilder();
			var div = db.div("MatcDialog ").build();
			this._createSignUpForm(d, div);
			d.popup(div, e.target);
		},

		_createSignUpForm:function(d, div){
			let f = this.$new(Form);
			f.render([{
				label: "Email",
				name: "email",
				type: "text",
				required: "true",
				placeholder: this.getNLS("dialog.login.email.placeholder"),
				css: "input-lg MatcIgnoreOnKeyPress",
				error: this.getNLS("dialog.login.email.error")
			}, {
				label: this.getNLS("dialog.login.password.label"),
				name: "password",
				type: "password",
				min: 6,
				placeholder: this.getNLS("dialog.login.password.placeholder"),
				css: "input-lg MatcIgnoreOnKeyPress",
				error: this.getNLS("dialog.login.password.error")
			}, {
				label: this.getNLS("dialog.login.tos.1") + ' <a href="#/termsofservice.html" target="_blank">' + this.getNLS("dialog.login.tos.2") + '</a>' + this.getNLS("dialog.login.tos.3"),
				name: "tos",
				type: "check",
				required: "true",
				css: "",
				error: this.getNLS("dialog.login.tos.error")
			}], [{
				label: this.getNLS("dialog.login.btn.create"),
				css: "MatcButton MatchButtonGreen",
				click: lang.hitch(this, "_signUpAndSave", d, f)
			}, {
				label: this.getNLS("btn.cancel"),
				css: "MatcLinkButton",
				click: lang.hitch(d, "close")
			}]);

			f.placeAt(div);
			f.startup();
			d.on("close", function () {
				f.destroy();
			});
		},

		async _signUpAndSave (dialog, form, data){
			var valid = form.validateForm(null, true);

			if (valid) {

				var result = await Services.getUserService().signup(data)// this._doPost("/rest/user", data);

				if (!result) {
					var error = new Error("createUser() > Could not send data to /rest/user");
					this.log.error("createUser", "Could not load REST API");
					this.log.sendError(error);
					form.showError("Something went wrong! Please contact klaus.schaefers[at]quant-ux.com", "");
				} else {
					if (result.type == "error") {
						if (result.errors.indexOf("user.email.not.unique") >= 0) {
							form.showError("The email is already taken! Please enter another one!", "email");
						} else {
							form.showError("Something went wrong! Please try again!", "");
						}
						dialog.shake();
					} else {
						dialog.close();
						Services.getUserService().login(data).then(result => {
							console.debug('user logged in', result)
							if (result.type == "error") {
								console.debug('Error on signup login', result)
							} else {
								var newModel = lang.clone(this.model);
								newModel.isPublic = false;
								/**
								 * Set here the real controller so the copy will work!
								 */
								this.$root.$emit('UserLogin', result)
								this.controller.setModelService(Services.getModelService())
								this.controller.onSaveAsAfterSignUp(newModel, this.model.name);
							}
						});
					}
				}


			} else {
				dialog.shake();
			}
		},

		showThemeCreateDialog (e){

			var db = new DomBuilder();
			var div = db.div("MatcDialogXL MatcPadding").build();
			var txt = db.textarea("form-control MatcContentWidgetEditor").build(div);

			let category = this.model.lastCategory ? this.model.lastCategory : 'XXX'

			if (this._selectedGroup){

				let boundingBox = this.getBoundingBox(this._selectedGroup.children);
				let group = {
					 "id" : "XXX",
					 "type" : "Group",
					 "_type" : "Group",
					 "name" : this._selectedGroup.name,
					 "category" : category,
					 "subcategory" : "XXX",
					 "children":[]
				}
				let children = this.sortChildren(this._selectedGroup.children);
				for (let i=0; i< children.length; i++){
					var org = children[i];
					let widget = lang.clone(org);
					delete widget.created
					delete widget.modified
					delete widget.z
					delete widget.template
					delete widget.copyOf
					widget._type = "Widget"
					widget.style = this.getStyle(org);
					widget.x = widget.x - boundingBox.x;
					widget.y = widget.y - boundingBox.y;
					widget.id =this._selectedGroup.name+i;
					widget.z = null;
					widget.template = null;
					// delete copyOf;
					group.children.push(widget);
				}
				txt.value = JSON.stringify(group,null, '  ');
			}
			if(this._selectedWidget){
				let widget = lang.clone(this._selectedWidget)
				widget._type = "Widget"
				widget.category = category
				widget.subcategory = "XXX"
				delete widget.created
				delete widget.modified
				delete widget.x
				delete widget.y
				delete widget.z
				delete widget.template
				delete widget.copyOf
				txt.value = JSON.stringify(widget,null, '  ');
			}

			if (this._selectedScreen){
				let app = {
					type: 'ScreenAndWidget',
					_type: 'ScreenAndWidget',
					id: this._selectedScreen.name,
					name: this._selectedScreen.name,
					category: category,
					subcategory: 'AAA',
					screens: {},
					widgets: {},
					lines: {},
					groups: {}
				}
				let screen = lang.clone(this._selectedScreen)
				screen._type = "Screen"
				screen.category = category
				screen.subcategory = "XXX"
				screen.id = screen.name
				screen.children = []
				screen.w = '$100%'
				screen.h = '$100%'
				screen.x = 0
				screen.y = 0

				app.screens[screen.id] = (screen)

				let children = this.sortChildren(this._selectedScreen.children);
				for (let i=0; i< children.length; i++){
					let org = children[i];
					let widget = lang.clone(org);
					delete widget.created
					delete widget.modified
					delete widget.z
					delete widget.template
					delete widget.copyOf
					widget._type = "Widget"
					widget.style = this.getStyle(org);
					widget.x = widget.x - screen.x;
					widget.y = widget.y - screen.y;
					widget.id = this._selectedScreen.name+i;
					widget.z = null;
					widget.template = null;
					screen.children.push(widget.id);
					app.widgets[widget.id] = (widget)
				}
				delete screen.created
				delete screen.modified
				delete screen.x
				delete screen.y
				delete screen.z
				delete screen.min
				delete screen.template
				delete screen.copyOf
				txt.value = JSON.stringify(app,null, '  ');
			}

			var bar = db.div("MatcButtonBar MatcMarginTop").build(div);
			var cancel = db.a("MatcButton", "Close").build(bar);
			var d = new Dialog();
			d.own(on(cancel, touch.release, lang.hitch(d, "close")));
			d.popup(div, e.target);

			this.logger.log(0,"showThemeCreateDialog", "exit > ");
		},

		/**********************************************************************
		 * Settings
		 **********************************************************************/

		onShowSettings:function(){

			var db = new DomBuilder();
			var popup = db.div("MatcDialog MatcHeaderDialog MatcPadding").build();
			var cntr = db.div("").build(popup);
			var settings = this.canvas.getSettings();

			/**
			 * Themes
			 */
			db.label("","Theme :").build(cntr);
			var themeList = this.$new(RadioBoxList);
			themeList.setOptions([
			  {value:"MatcLight", label: "Light"},
			  {value:"MatcDark", label:"Dark"}
			]);
			themeList.setValue(settings.canvasTheme);
			themeList.placeAt(cntr);

			/**
			 * Keep color boxes open
			 */
			db.label("MatcMarginTop","Other:").build(cntr);

			var selectMoveCntr = db.div("form-group").build(cntr);
			var selectMoveBox = this.$new(CheckBox);
			selectMoveBox.setLabel("Select to move");
			selectMoveBox.setValue(settings.selectMove);
			selectMoveBox.placeAt(selectMoveCntr);

			var selectScreenCntr = db.div("form-group").build(cntr);
			var selectScreenCheckBox = this.$new(CheckBox);
			selectScreenCheckBox.setLabel("Click on screen will select");
			selectScreenCheckBox.setValue(settings.hasSelectOnScreen);
			selectScreenCheckBox.placeAt(selectScreenCntr);

			var qrCodeCheckBoxCntr = db.div("form-group").build(cntr);
			var qrCodeCheckBox = this.$new(CheckBox);
			qrCodeCheckBox.setLabel("Show QR Code in simulator");
			qrCodeCheckBox.setValue(settings.hasQRCode);
			qrCodeCheckBox.placeAt(qrCodeCheckBoxCntr);

			var colorCntr = db.div("form-group").build(cntr);
			var colorPicker = this.$new(CheckBox);
			colorPicker.setLabel("Keep colorpicker open");
			colorPicker.setValue(settings.keepColorWidgetOpen);
			colorPicker.placeAt(colorCntr);

			var zoomCntr = db.div("form-group").build(cntr);
			var zoomChkBox = this.$new(CheckBox);
			zoomChkBox.setLabel("Snapp on zoom");
			zoomChkBox.setValue(settings.zoomSnapp);
			zoomChkBox.placeAt(zoomCntr);

			var designTokenCntr = db.div("form-group").build(cntr);
			var designTokenCheckBox = this.$new(CheckBox);
			designTokenCheckBox.setLabel("Show Design Tokens");
			designTokenCheckBox.setValue(settings.hasDesignToken);
			designTokenCheckBox.placeAt(designTokenCntr);

			var protoMotoCntr = db.div("form-group").build(cntr);
			var protoMotoCheckBox = this.$new(CheckBox);
			protoMotoCheckBox.setLabel("Enable Beta Features");
			protoMotoCheckBox.setValue(settings.hasProtoMoto);
			protoMotoCheckBox.placeAt(protoMotoCntr);

			/**
			 * Since 3.0.43 we snapp by default to top left corner
			 */
			var gridSnapTopLeftCntr = db.div("form-group").build(cntr);
			var gridSnapTopLeftChkBox = this.$new(CheckBox);
			gridSnapTopLeftChkBox.setLabel("Snap grid to top left corner");
			gridSnapTopLeftChkBox.setValue(settings.snapGridOnlyToTopLeft);
			gridSnapTopLeftChkBox.placeAt(gridSnapTopLeftCntr);

			var bar = db.div("MatcButtonBar MatcMarginTopXL").build(popup);

			var save = db.a("MatcButton ", "Save").build(bar);
			var cancel = db.a(" MatcLinkButton ", "Cancel").build(bar);

			var dialog = new Dialog();
			dialog.own(on(dialog, "close", lang.hitch(this, "closeDialog")));
			dialog.own(on(cancel, touch.press, lang.hitch(dialog, "close")));
			dialog.own(on(save, touch.press, lang.hitch(
				this, "onSaveSettings", dialog, themeList, colorPicker, zoomChkBox, 
				protoMotoCheckBox, gridSnapTopLeftChkBox, selectMoveBox, designTokenCheckBox, selectScreenCheckBox,
				qrCodeCheckBox
			)));

			dialog.popup(popup, this.template);

			this.canvas.enableMouseZoom(false);
			this.canvas.setState("simulate");

			this.logger.log(0,"onShowSettings", "exit > ");
		},

		onSaveSettings (dialog, themeList, colorPicker, zoomChkBox, protoMotoCheckBox, gridSnapTopLeftChkBox, 
			selectMoveBox, designTokenCheckBox, selectScreenCheckBox, qrCodeCheckBox) {
			const settings = {
				canvasTheme: themeList.getValue(),
				keepColorWidgetOpen: colorPicker.getValue(),
				zoomSnapp: zoomChkBox.getValue(),
				hasProtoMoto: protoMotoCheckBox.getValue(),
				snapGridOnlyToTopLeft: gridSnapTopLeftChkBox.getValue(),
				selectMove: selectMoveBox.getValue(),
				hasDesignToken: designTokenCheckBox.getValue(),
				hasSelectOnScreen: selectScreenCheckBox.getValue(),
				hasQRCode: qrCodeCheckBox.getValue()
			};

			this.canvas.setSettings(settings);
			dialog.close();
		},


		/**********************************************************************
		 * Histroy
		 **********************************************************************/

		async onShowHistory(){

			var db = new DomBuilder();

			db = new DomBuilder();
			var popup = db.div("MatcDialogXL MatcPadding").build();

			var cntr = db.div("").build(popup);

			db.h3("MatcDialogHeader", "History").build(cntr);


			var stack = this.controller.commandStack.stack;
			var pos = this.controller.commandStack.pos;


			var team = await Services.getModelService(this.$route).findTeam(this.model.id) //this._doGet("/rest/apps/" + this.model.id +"/team.json");
			var users = this.getObjectFromArray(team, "id");

			var tblCntr =  db.div("MatcDialogTable").build(cntr);

			var tbl = db.table().build();
			db.thead(["Date", "User", "Type"]).build(tbl);
			var tbody = db.tbody().build(tbl)
			for(var i=0; i <stack.length; i++){
				var command = stack[i];
				var name ="Unknown";
				if(users[command.userID]){
					var user = users[command.userID];
					name = this.getUserName(user);
				}
				var date = this.formatDate(command.timestamp);
				var row =  [date, name, command.type];
				var tr = db.tr(row).build(tbody);
				if(i>= pos){
					css.add(tr, "MatcDialogTableInvalidRow")
				}
			}

			var scroller = this.$new(ScrollContainer);
			scroller.placeAt(tblCntr);
			scroller.wrap(tbl);


			var dialog = new Dialog();
			dialog.own(on(dialog, "close", lang.hitch(this, "closeDialog")));

			var bar = db.div("MatcButtonBar MatcMarginTopXL").build(popup);
			var cancel = db.a("MatcButton ", "Close").build(bar);
			dialog.own(on(cancel, touch.press, lang.hitch(dialog, "close")));


			dialog.popup(popup, this.template);

			this.canvas.enableMouseZoom(false);
			this.canvas.setState("simulate");

			this.logger.log(0,"onShowHistory", "exit > " + pos);
		},

		/**********************************************************************
		 * Create Template
		 **********************************************************************/

		showTemplateCreateDialog:function(name){
			this.logger.log(0,"showTemplateCreateDialog", "entry");

			var db = new DomBuilder();

			db = new DomBuilder();
			var popup = db.div("MatcDialog MatcHeaderDialog MatcPadding").build();

			var cntr = db.div().build(popup);

			db.h3("MatcDialogHeader", "Create Component").build(cntr);

			var inputName = db.input("form-control input-lg MatcIgnoreOnKeyPress", name, "Name of the template").build(cntr);

			var dialog = new Dialog();
			dialog.own(on(dialog, "close", lang.hitch(this, "closeDialog")));

			var bar = db.div("MatcButtonBar MatcMarginTopXL").build(popup);
			var write = db.div("MatcButton", "Create").build(bar);
			var cancel = db.a("MatcLinkButton ", "Cancel").build(bar);

			dialog.own(on(cancel, touch.press, lang.hitch(dialog, "close")));
			dialog.own(on(inputName, 'keyup', e => {
				var k = e.keyCode ? e.keyCode : e.which;
				if (k === 13) {
					this._createTemplate(inputName, dialog)
				}
			}))
			dialog.own(on(write, touch.press, lang.hitch(this, "_createTemplate", inputName, dialog)));
			dialog.popup(popup, this.template);


			setTimeout(function(){inputName.focus()}, 400);
			this.canvas.setState("simulate");

		},

		_createTemplate:function(input, dialog){

			dialog.hide(this.template);
			this.closeDialog();

			if(this._selectedWidget){
				this.controller.addTemplateWidget(this._selectedWidget, input.value);
			}

			if(this._selectedScreen){
				this.controller.addeTemplateScreen(this._selectedScreen, input.value);
			}

			if(this._selectedGroup){
				this.controller.addNestedTemplateGroup(this._selectedGroup, input.value);
			}
		},


		/**********************************************************************
		 * Save As
		 **********************************************************************/

		onSaveAs:function(){
			this.logger.log(0,"onSaveAs", "entry");

			var dialog = new Dialog();
			var db = new DomBuilder();
			let popup = db.div("MatcDialog MatcHeaderDialog MatcPadding").build();

			if(this.user.role=="guest"){
				/**
				 * FIXME: Show here the login screen?
				 */
				let cntr = db.div().build(popup);
				db.h3("MatcDialogHeader", "Save as").build(cntr);
				db.div("MatcHint", "Register to create a copy of the prototype...").build(cntr);
				dialog.own(on(dialog, "close", lang.hitch(this, "closeDialog")));
				let cancel = db.a("MatcLinkButton ", "Cancel").build(bar);
				let bar = db.div("MatcButtonBar MatcMarginTopXL").build(popup);
				dialog.own(on(cancel, touch.press, lang.hitch(dialog, "close")));
			} else {
				let cntr = db.div().build(popup);
				db.h3("MatcDialogHeader", "Save as").build(cntr);
				let inputName = db.input("form-control input-lg MatcIgnoreOnKeyPress", "Copy of " + this.model.name , "Name of the template").build(cntr);
				dialog.own(on(dialog, "close", lang.hitch(this, "closeDialog")));
				let bar = db.div("MatcButtonBar MatcMarginTopXL").build(popup);
				let write = db.div("MatcButton", "Save As").build(bar);
				let cancel = db.a("MatcLinkButton ", "Cancel").build(bar);
				dialog.own(on(cancel, touch.press, lang.hitch(dialog, "close")));
				dialog.own(on(write, touch.press, lang.hitch(this, "_saveAs", inputName, dialog)));

				setTimeout(() => {
					inputName.select()
					inputName.focus()
				}, 200)
			}
			dialog.popup(popup, this.home);
			this.canvas.setState("simulate");
		},

		async _saveAs (inputName, dialog){
			dialog.close();
			this.closeDialog();
			var app = await this.controller.onSaveAs(this.model, inputName.value);
			if (app){
				this.redirectAfterExit = false;
				hash("#/apps/" +app.id +".html");
			}
		},

		closeDialog:function(){
			this.canvas.enableMouseZoom(true);
			this.canvas.setState(0);
		},


		/**********************************************************************
		 * Simulation Stuff
		 **********************************************************************/



		startSimilator () {
			this.logger.log(0,"startSimilator", "entry");
			
			var pos = domGeom.position(win.body());
			let maxHeight = pos.h - 100
			/**
			 * Since 2.1.7 we have better scalling.
			 * Keep in sync with the ShareCanvas.startSimulator() method
			 *
			 * FIXME: This could be still a litte bit better. We could max the height and with factors
			 */
			css.add(win.body(), 'MatcCanvasSimulatorVisible')
			if (this.model.type === "desktop"){
				pos.w = pos.w * 0.75;
				pos.h = pos.h * 0.75;
				this._showDesktopSimulator(this.model, pos, maxHeight);
			} else if(this.model.type === "tablet") {
				if (this.model.screenSize.w > this.model.screenSize.h){
					pos.w = pos.w * 0.65;
					pos.h = pos.h * 0.65;
					this._showMobileTest(this.model, pos, "MatchSimulatorWrapperTablet", maxHeight);
				} else {
					pos.w = pos.w * 0.35;
					pos.h = pos.h * 0.35;
					this._showMobileTest(this.model, pos, "MatchSimulatorWrapperTablet", maxHeight);
				}
			} else {
				pos.w = pos.w * 0.25;
				pos.h = pos.h * 0.25;
				this._showMobileTest(this.model, pos , "MatchSimulatorWrapperMobile", maxHeight);
			}
		},


		_showDesktopSimulator (model, pos, maxHeight){

			var dialog = document.createElement("div");
			css.add(dialog, "MatchSimulatorDialog");

			var container = document.createElement("div");
			css.add(container, "MatchSimulatorContainer");
			dialog.appendChild(container);

			pos = this.getScaledSize(pos, "width", this.model);
			if (pos.h > maxHeight) {
				let factor = pos.h / maxHeight
				pos.h = pos.h / factor
				pos.w = pos.w / factor
			}
			container.style.width = Math.round(pos.w) + "px";
			container.style.height = Math.round(pos.h) + "px";

			var s = this.$new(Simulator,{mode : "debug", logData : false});
			s.scrollListenTarget = "parent";
			s.isDesktopTest = true
			s.setHash(this.hash)

			var scroller = this.$new(ScrollContainer,{canDestroy:true});
			scroller.placeAt(container);
			s.setScrollContainer(scroller);


			var d = new Dialog();
			d.hasCSSAnimation = false;
			d.popup(dialog, this.simulatorButton);

			d.own(d.on("close", lang.hitch(this, "stopSimulator",s, scroller)));
			d.own(on(dialog, 'click', (e) => {
				if (e.target === dialog) {
					d.close()
				}
			}));

			/**
			 * Isn#t the model passed
			 */
			model = this.model;
			var screen = this._getSimulatorScreen();
			s.setStartScreen(screen);
			setTimeout(function(){
				scroller.wrap(s.domNode);
				s.setModel(model);
			}, 500);

			/**
			 * otherwise the mouse wheel listener will prevent
			 * scrolling in the simulator!
			 */
			this.canvas.enableMouseZoom(false);
			this.canvas.setState("simulate");

		},



		_showMobileTest (model, pos, clazz, maxHeight){
			const dialog = document.createElement("div");
			css.add(dialog, "MatchSimulatorDialog");

			const wrapper = document.createElement("div");
			css.add(wrapper, "MatchSimulatorWrapper ");
			if(clazz){
				css.add(wrapper, clazz);
			}
			dialog.appendChild(wrapper);

			const container = document.createElement("div");
			css.add(container, "MatchSimulatorContainer");

			pos = this.getScaledSize(pos, "width", this.model);
			if (pos.h > maxHeight) {
				let factor = pos.h / maxHeight
				pos.h = Math.ceil(pos.h / factor)
				pos.w = Math.ceil(pos.w / factor)
			}

			container.style.width = Math.ceil(pos.w) + "px";
			container.style.height = Math.ceil(pos.h)+ "px";

			wrapper.style.width = Math.ceil(pos.w) + "px";
			wrapper.style.height = Math.ceil(pos.h) + "px";
			css.add(wrapper, 'MatcSimulatorFadeOut')
			wrapper.appendChild(container);

			const scroller = this.$new(ScrollContainer,{canDestroy:true});
			scroller.placeAt(container);

			const s = this.$new(Simulator,{mode : "debug", logData : false});
			s.scrollListenTarget = "parent";
			s.isDesktopTest = true
			s.setScrollContainer(scroller);
			s.setHash(this.hash)


			// sinde 4.1.03 the qr code can be hidden in the settings.
			const settings = this.getSettings()
			if (settings.hasQRCode !== false) {
				const qrCodeWrapper = document.createElement("div")
				css.add(qrCodeWrapper, "MatcSimulatorQRWrapper");
				dialog.appendChild(qrCodeWrapper);

				const img = document.createElement("img");
				QR.getQRCode(this.hash, false, true).then(url => {
					img.src = url
				})
				css.add(img, "MatcSimulatorQR");
				qrCodeWrapper.appendChild(img);
			}

		

			/**
			 * FIXME: We have here some flickering. Because of the fixed
			 * positions widgets we cannot use cssAniamtion because the scale(1,1)
			 * set in Dialog.js will mess up the the fixed attribute.
			 *
			 * Solutions:
			 *
			 * 1) Do not add screen pos whne flag is set?
			 */
			const d = new Dialog();
			d.hasCSSAnimation = false;
			d.popup(dialog, this.simulatorButton);

			d.on("close", lang.hitch(this, "stopSimulator", s, scroller));
			d.own(on(dialog, 'click', (e) => {
				if (e.target === dialog) {
					d.close()
				}
			}));

			/**
			 * Isnt the model passed???
			 */
			model = this.model;

			const screen = this._getSimulatorScreen();
			s.setStartScreen(screen);
			setTimeout(() => {
				scroller.wrap(s.domNode);
				s.setModel(model);
				css.remove(wrapper, 'MatcSimulatorFadeOut')
			}, 600);

			/**
			 * otherwise the mouse wheel listener will prevent
			 * scrolling in the simulator!
			 */
			this.canvas.enableMouseZoom(false);
			this.canvas.setState("simulate");

		},

		_getSimulatorScreen:function(){
			if(this._selectedScreen){
				return this._selectedScreen;
			}
			if(this._selectedWidget){
				return this.getParentScreen(this._selectedWidget);
			}

		},


		_showAnimationComposer:function(screen, type, node){

			var d = new Dialog();
			var db = new DomBuilder();
			var dialog = db.div("MatchAnimationDialog").build();
			var div = db.div("MatchAnimationDialogCntr").build(dialog);

			var pos = domGeom.position(win.body());
			dialog.style.width = Math.round(pos.w * 0.95) + "px";
			dialog.style.height = Math.round(pos.h * 0.9) + "px";

			var composer = this.$new(AnimationComposer);
			composer.setHash(this.hash)
			composer.setType(type);
			composer.placeAt(div);
			composer.setModel(this.model);

			var cntr = db.div("container-fluid").build(div);
			var row = db.div("row").build(cntr);

			var left = db.div("col-md-3 MatcButtonBar ").build(row);
			//var right = db.div("col-md-9 MatcHint MatcPaddingTop", "* Only copied widgets and groups have the &quot;Transfrom&quot; animation").build(row);


			var write = db.div("MatcButton", "Save").build(left);
			var cancel = db.a("MatcLinkButton ", "Cancel").build(left);
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(write, touch.press, lang.hitch(this, "_setScreenAnimation", composer, d, screen, type)));


			setTimeout(function(){
				composer.setScreen(screen);
			},500);


			d.popup(dialog, node);
			d.on("close", lang.hitch(this, "stopSimulator", composer, null));

			this.canvas.enableMouseZoom(false);
			this.canvas.setState("simulate");
		},

		_setScreenAnimation:function(composer, dialog, screen, type){
			var anim = composer.getValue();
			composer.destroy();
			dialog.close();
			this.controller.setScreenAnimation(screen.id, type, anim);

		},


		stopSimulator:function(s, scroller){
			this.canvas.enableMouseZoom(true);
			this.canvas.setState(0);
			css.remove(win.body(), 'MatcCanvasSimulatorVisible')
			if(s){
				s.destroy();
			}
			if(scroller){
				scroller.destroy();
			}
		}
    },
    mounted () {
    }
}
</script>