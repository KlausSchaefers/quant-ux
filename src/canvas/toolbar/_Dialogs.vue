
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
import AnimationComposer from 'canvas/toolbar/AnimationComposer'
import DownloadDialog from 'canvas/toolbar/DownloadDialog'
import CustomFonts from 'canvas/toolbar/CustomFonts'
import Plan from 'page/Plan'
import Services from 'services/Services'
import QR from 'core/QR'

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
				this.logger.log(0,"showFontDialog", "entry > ");

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

      showSharing (e){
				this.logger.log(0,"showSharing", "entry > ");
				
				var invitation = this._doGet("/rest/invitation/"+this.model.id+ ".json");
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
				var base = location.protocol + "//" + location.host;
				
				var testInput = db
					.div("MatcMarginTop")
					.span("", this.getNLS("share.Test"))
					.input("form-control MatcIgnoreOnKeyPress", base +"#/test.html?h=" + temp[1])
					.build(right);
					
				var commentInput = db
					.div("MatcMarginTop")
					.span("", this.getNLS("share.Comment"))
					.input("form-control MatcIgnoreOnKeyPress", base +"#/share.html?h=" + temp[1])
					.build(right);
				
					
				var codeRow = db
					.div("MatcMarginTop MatcShareRow")
					.span("", this.getNLS("share.Code"))
					.parent().build(right);
				
				var codeInput = db.input("form-control", this.hash)
					.build(codeRow);			
		
				
				row = db.div("row MatcMarginTop").build(cntr);
				right = db.div("col-md-12 MatcButtonBar").build(row);

				var write = db.div("MatcButton", "Close").build(right);
				
				var d = new Dialog();
				d.own(on(write, touch.press, lang.hitch(d,"close")));
				d.own(on(testInput, "focus", function(){
					testInput.select();
				}));
				d.own(on(commentInput, "focus", function(){
					commentInput.select();
				}));
				d.own(on(codeInput, "focus", function(){
					codeInput.select();
				}));
				
				d.popup(popup, e.target);
		},
		
		
		showDownloadDialog:function(e){
			
			var d = new Dialog();
			
			var db = new DomBuilder();
			
			var div = db.div("MatcPadding MatcDownloadDialog").build();
		
			var downloader = this.$new(DownloadDialog);
			downloader.placeAt(div);
			var model = this.model;
			// rendering of png does not work if scale is set, so we wait
			setTimeout(function() {
				downloader.setModel(model);
			}, 500)

			var bar = db.div(" MatcMarginTop row").build(div);
			var left = db.div("col-md-1 MatcButtonBar").build(bar);
			db.div("col-md-9  MatcHint", "Click to download").build(bar);		
			var cancel = db.a("MatcButton", "Close").build(left);
			
			d.own(on(cancel, touch.release, lang.hitch(d, "close")));
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
			// this._renderShortCut(db, tbl,"SHIFT", "Selection Tool");
			this._renderShortCut(db, tbl,"ALT", "Measure Tool");
			this._renderShortCut(db, tbl,"L", "Create Line");
			
			tbl = db.table().build(right);
		
			this._renderShortCut(db, tbl,"SPACE", "Move Tool");
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
			
			var bar = db.div("MatcButtonBar MatcMarginTopXXL").build(div);
			
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
		
		showThemeCreateDialog:function(){
			
			var db = new DomBuilder();			
			var div = db.div("MatcDialogXL MatcPadding").build();			
			var txt = db.textarea("form-control MatcContentWidgetEditor").build(div);			
			if(this._selectedGroup){
			
				var boundingBox = this.getBoundingBox(this._selectedGroup.children);				
				var group = {
					 "id" : "XXX",
					 "type" : "Group",
					 "_type" : "Group",
					 "name" : this._selectedGroup.name,
					 "category" : "XXX",
					 "subcategory" : "XXX",
					 "children":[]
				}				
				var children = this.sortChildren(this._selectedGroup.children);		
				for(var i=0; i< children.length; i++){
					var org = children[i];
					var widget = lang.clone(org);
					widget.style = this.getStyle(org);
					widget.x = widget.x -boundingBox.x;
					widget.y = widget.y -boundingBox.y;
					widget.id =this._selectedGroup.name+i;
					widget.z = null;
					widget.template = null;
					// delete copyOf;
					group.children.push(widget);
				}
				txt.value = JSON.stringify(group,null, '  ');
			} 
			if(this._selectedWidget){
				txt.value = JSON.stringify(this._selectedWidget,null, '  ');
			}
			var bar = db.div("MatcButtonBar MatcMarginTop").build(div);			
			var cancel = db.a("MatcLinkButton", "Cancel").build(bar);			
			var d = new Dialog();
			d.own(on(cancel, touch.release, lang.hitch(d, "close")));
			d.popup(div, this.domNode);	
		
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
			 * Mouse Wheel
			 */
			db.label("MatcMarginTop","Mouse Wheel / Touchpad Scroll :").build(cntr);
			var mouseWheelList = this.$new(RadioBoxList);
			mouseWheelList.setOptions([
			   {value:"scroll", label: "Scroll Canvas"},
			   {value:"zoom", label:"Zoom Canvas"}
			]);
			mouseWheelList.setValue(settings.mouseWheelMode);
			mouseWheelList.placeAt(cntr);
			
			/**
			 * Move mode
			 */
			db.label("MatcMarginTop","Move Mode:").build(cntr);
			var moveList = this.$new(RadioBoxList);
			moveList.setOptions([
			   {value:"ps", label: "Extra move tool and SPACE"},
			   {value:"classic", label:"Canvas Drag'n'Drop"}
			]);
			moveList.setValue(settings.moveMode);
			moveList.placeAt(cntr);
			

			/**
			 * Keep color boxes open
			 */
			db.label("MatcMarginTop","Other:").build(cntr);

			var colorCntr = db.div("form-group").build(cntr);
			var colorPicker = this.$new(CheckBox);
			colorPicker.setLabel("Keep colorpicker open");
			colorPicker.setValue(settings.keepColorWidgetOpen);
			colorPicker.placeAt(colorCntr);
			
			var renderCntr = db.div("form-group").build(cntr);
			var renderCheckBox = this.$new(CheckBox);
			renderCheckBox.setLabel("Use fast rendering (BETA)");
			renderCheckBox.setValue(settings.fastRender);
			renderCheckBox.placeAt(renderCntr);
		
			
			var bar = db.div("MatcButtonBar MatcMarginTopXXL").build(popup);
		
			var save = db.a("MatcButton ", "Save").build(bar);
			var cancel = db.a(" MatcLinkButton ", "Cancel").build(bar);
			
			var dialog = new Dialog();
			dialog.own(on(dialog, "close", lang.hitch(this, "closeDialog")));
			dialog.own(on(cancel, touch.press, lang.hitch(dialog, "close")));
			dialog.own(on(save, touch.press, lang.hitch(this, "onSaveSettings", dialog, themeList,moveList, mouseWheelList, colorPicker, renderCheckBox)));
			
			dialog.popup(popup, this.template);
			
			this.canvas.enableMouseZoom(false);
			this.canvas.setState("simulate");
		
			this.logger.log(0,"onShowSettings", "exit > ");
		},
		
		onSaveSettings:function(dialog, themeList,moveList, mouseWheelList, colorPicker, renderCheckBox){
			var settings = {
				canvasTheme: themeList.getValue(),
				moveMode : moveList.getValue(),
				mouseWheelMode: mouseWheelList.getValue(),
				keepColorWidgetOpen: colorPicker.getValue(),
				fastRender: renderCheckBox.getValue()
			};
	
			this.canvas.setSettings(settings);
			dialog.close();
		},
		
		
		/**********************************************************************
		 * Histroy
		 **********************************************************************/
	
		onShowHistory:function(){
			
			var db = new DomBuilder();
			
			db = new DomBuilder();
			var popup = db.div("MatcDialogXL MatcPadding").build();
			
			var cntr = db.div("").build(popup);
			
			db.h3("MatcDialogHeader", "History").build(cntr);
			
			
			var stack = this.controller.commandStack.stack;
			var pos = this.controller.commandStack.pos;
			
			
			var team = this._doGet("/rest/apps/" + this.model.id +"/team.json");
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
			
			var bar = db.div("MatcButtonBar MatcMarginTopXXL").build(popup);
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
			
			db.h3("MatcDialogHeader", "Make Template").build(cntr);
			
			
			var inputName = db.input("form-control input-lg MatcIgnoreOnKeyPress", name, "Name of the template").build(cntr);
				
			var dialog = new Dialog();
			dialog.own(on(dialog, "close", lang.hitch(this, "closeDialog")));
			
			var bar = db.div("MatcButtonBar MatcMarginTopXXL").build(popup);
			var write = db.div("MatcButton", "Make").build(bar);
			var cancel = db.a("MatcLinkButton ", "Cancel").build(bar);
			
			dialog.own(on(cancel, touch.press, lang.hitch(dialog, "close")));
		
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
				this.controller.addTemplateGroup(this._selectedGroup, input.value);
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
				let bar = db.div("MatcButtonBar MatcMarginTopXXL").build(popup);			
				dialog.own(on(cancel, touch.press, lang.hitch(dialog, "close")));			
			} else {
				let cntr = db.div().build(popup);				
				db.h3("MatcDialogHeader", "Save as").build(cntr);				
				let inputName = db.input("form-control input-lg MatcIgnoreOnKeyPress", "Copy of " + this.model.name , "Name of the template").build(cntr);
				dialog.own(on(dialog, "close", lang.hitch(this, "closeDialog")));				
				let bar = db.div("MatcButtonBar MatcMarginTopXXL").build(popup);
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
		
	
		
		startSimilator:function(){
			this.logger.log(0,"startSimilator", "entry");	
			
			css.add(win.body(), 'MatcCanvasSimulatorVisible')
			if(this.model.type == "desktop"){
				this._showDesktopSimulator(this.model);
			} else if(this.model.type=="tablet"){
				if(this.model.screenSize.w > this.model.screenSize.h){
					this._showMobileTest(this.model,{w:800, h: 600}, "MatchSimulatorWrapperTablet");
				} else {
					this._showMobileTest(this.model,{w:400, h: 480}, "MatchSimulatorWrapperTablet");
				}
			} else{
				this._showMobileTest(this.model, {w:300, h: 800}, "MatchSimulatorWrapperMobile");
			}
		},
		
		
		_showDesktopSimulator:function(model){
			

			var dialog = document.createElement("div");
			css.add(dialog, "MatchSimulatorDialog");
			
			
			var container = document.createElement("div");
			css.add(container, "MatchSimulatorContainer");
			dialog.appendChild(container);
			
			var pos = domGeom.position(win.body());
			pos.w = pos.w * 0.75;
			pos.h = pos.h * 0.75;
			pos = this.getScaledSize(pos, "width", this.model);
			container.style.width = Math.round(pos.w) + "px";
			container.style.height = Math.round(pos.h) + "px";
		
			var s = this.$new(Simulator,{mode : "debug", logData : false});
			s.scrollListenTarget = "parent";
			
			var scroller = this.$new(ScrollContainer,{canDestroy:true});
			scroller.placeAt(container);
			s.setScrollContainer(scroller);

			
			var d = new Dialog();
			d.hasCSSAnimation = false;
			d.popup(dialog, this.simulatorButton);
			
			d.own(d.on("close", lang.hitch(this, "stopSimulator",s, scroller)));
			
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
		
		
		
		_showMobileTest:function(model, pos, clazz){
			
			var dialog = document.createElement("div");
			css.add(dialog, "MatchSimulatorDialog");
		
			
			var wrapper = document.createElement("div");
			css.add(wrapper, "MatchSimulatorWrapper ");
			if(clazz){
				css.add(wrapper, clazz);
			}
			dialog.appendChild(wrapper);
			
			var container = document.createElement("div");
			css.add(container, "MatchSimulatorContainer");
		

					
			/**
			 * FIXME: make this somehow grow to the max if the screen height
			 */
			pos = this.getScaledSize(pos, "width", this.model);
			container.style.width = Math.ceil(pos.w) + "px";
			container.style.height = Math.ceil(pos.h) + "px";

			wrapper.style.width = Math.ceil(pos.w) + "px";
			wrapper.style.height = Math.ceil(pos.h) + "px";
			css.add(wrapper, 'MatcSimulatorFadeOut')
			wrapper.appendChild(container);
			
			var scroller = this.$new(ScrollContainer,{canDestroy:true});
			scroller.placeAt(container);
	
			var s = this.$new(Simulator,{mode : "debug", logData : false});
			s.scrollListenTarget = "parent";
			s.setScrollContainer(scroller);
		
							
			var img = document.createElement("img");
			QR.getQRCode(this.hash, false, true).then(url => {
				img.src = url
			})
			css.add(img, "MatcSimulatorQR");
			dialog.appendChild(img);
			
			/**
			 * FIXME: We have here some flickering. Because of the fixed 
			 * positions widgets we cannot use cssAniamtion because the scale(1,1)
			 * set in Dialog.js will mess up the the fixed attribute.
			 * 
			 * Solutions:
			 * 
			 * 1) Do not add screen pos whne flag is set?
			 */
			var d = new Dialog();
			d.hasCSSAnimation = false;
			d.popup(dialog, this.simulatorButton);
			
			d.on("close", lang.hitch(this, "stopSimulator", s, scroller));
			
			/**
			 * Isnt the model passed???
			 */
			model = this.model;
			
			
			var screen = this._getSimulatorScreen();
			s.setStartScreen(screen);
			setTimeout(function(){
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
			
			
			
			d.popup(dialog, node, "MatcDialogThemed");
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