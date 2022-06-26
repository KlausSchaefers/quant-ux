
<template>
     <div class="MatcToolbar" @dblclick="onDoubleClick">

		<div class="" data-dojo-attach-point="layerListCntr">
		</div>


		<div class="MatcToobarLeft" data-dojo-attach-point="toolsSection">

			<div class="hidden" data-dojo-attach-point="importSection"></div>

			<div class="MatcToolbarItem MatcToolbarItemActive" data-dojo-attach-point="editTool">
				<span class="mdi mdi-cursor-default"></span>
			</div>

			<div class="" data-dojo-attach-point="addScreenSection"></div>

			<div class="" data-dojo-attach-point="addSection"></div>

			<div class="MatcToolbarItem MatcMultiIcon" data-dojo-attach-point="rectangleTool" >
				<span class="mdi mdi-square-outline" ></span>
				<span class="mdi mdi-plus-circle MatcTinyIcon MatcTinyIconAnimated"></span>
			</div>

			<div class="MatcToolbarItem MatcMultiIcon" data-dojo-attach-point="textTool" >
				<span class="mdi mdi-format-text" ></span>
				<span class="mdi mdi-plus-circle MatcTinyIcon MatcTinyIconAnimated"></span>
			</div>

			<div class="MatcToolbarItem MatcMultiIcon" data-dojo-attach-point="hotspotTool" >
				<span class="mdi mdi-select" ></span>
				<span class="mdi mdi-plus-circle MatcTinyIcon MatcTinyIconAnimated"></span>
			</div>

			<div class="MatcToolbarItem MatcMultiIcon " data-dojo-attach-point="addLogicSection" >
				<span class="mdi mdi-rhombus-outline" ></span>
				<span class="mdi mdi-plus-circle MatcTinyIcon MatcTinyIconAnimated"></span>
			</div>

			<div class="MatcToolbarItem MatcMultiIcon " data-dojo-attach-point="addRestSection" v-show="showRestTool">
				<span class="mdi mdi-cloud-outline" ></span>
				<span class="mdi mdi-plus-circle MatcTinyIcon MatcTinyIconAnimated"></span>
			</div>

			<div class="MatcToolbarItem MatcMultiIcon " data-dojo-attach-point="addScriptSection" v-show="showScriptTool">
				<span class="mdi mdi-code-tags" ></span>
				<span class="mdi mdi-plus-circle MatcTinyIcon MatcTinyIconAnimated"></span>
			</div>


			<div class="MatcToolbarItem MatcToolbarMove" data-dojo-attach-point="moveTool" >
				<span class="mdi mdi-cursor-move" ></span>
			</div>


			<div class="MatcToolbarItem MatcMultiIcon" data-dojo-attach-point="selectBtn">
				<span class="mdi mdi-selection"></span>
				<span class="mdi mdi-cursor-default MatcTinyIcon"></span>
			</div>

			<div class="" data-dojo-attach-point="commentSection">
				<div class="MatcToolbarItem MatcMultiIcon" data-dojo-attach-point="commentBtn">
					<span class="mdi mdi-comment-outline"></span>

				</div>
			</div>

		</div>

		<div class="MatcToolbarTop">
				<div class=" MatcToobarHomeSection MatcToobarItemBig" data-dojo-attach-point="home"></div>

				<div class="MatcToolbarTopCntr">

						
						<div class=" MatcToobarSimulatorSection MatcToolbarSection" data-dojo-attach-point="simulatorSection">
							<a class="MatcToolbarItem MatcToolbarIconNoSmooth" data-dojo-attach-point="simulatorButton">
								<span class="mdi mdi-play" style="vertical-align:middle" data-dojo-attach-point="simulatorIcon"></span>
								<span class="MatcToolbarLabel MatcToolbarResponsiveLabel">{{ $t('toolbar.simulate')}}</span>
							</a>
						</div>
						<div class="MatcToolbarSection MatcToolbarDenseSection" data-dojo-attach-point="undoSection">
							<a class="MatcToolbarItem MatcToolbarIconNoSmooth MatcToolbarItemDisbaled" data-dojo-attach-point="undo">
								<span class="mdi mdi-undo"></span>
							</a>
							<a class="MatcToolbarItem MatcToolbarIconNoSmooth MatcToolbarItemDisbaled" data-dojo-attach-point="redo">
								<span class="mdi mdi-redo"></span>
							</a>
						</div>


						<div class="MatcToolbarSection MatcToolbarDenseSection" data-dojo-attach-point="copyPasteDiv">
							<a class="MatcToolbarItem MatcToolbarItemDisbaled " data-dojo-attach-point="copyBtn">
								<span class="mdi mdi-content-copy"></span>
							</a>
							<a class="MatcToolbarItem MatcToolbarItemDisbaled" data-dojo-attach-point="pasteBtn">
								<span class="mdi mdi-content-paste"></span>
							</a>
							<a class="MatcToolbarItem MatcToolbarItemDisbaled" data-dojo-attach-point="copyStyleBtn">
								<span class="mdi mdi-format-paint"></span>
							</a>
							<a class="MatcToolbarItem MatcToolbarItemDisbaled" data-dojo-attach-point="deleteBtn">
								<span class="mdi mdi-trash-can-outline"></span>
							</a>
			
						</div>




						<div class="MatcToolbarTopCenterCntr">
							<div class="MatcToolbarSection MatcToolbarDenseSection MatcToolbarSectionTools MatcToolbarSectionHidden" data-dojo-attach-point="toolsCntrDiv">

							
								<div class="MatcToolbarSubSection" data-dojo-attach-point="groupDIV">
									<a class="MatcToolbarItem" data-dojo-attach-point="groupBTN">
										<span class="mdi mdi-link-variant-plus" ></span>
									</a>
									<a class="MatcToolbarItem" data-dojo-attach-point="ungroupBTN">
										<span class="mdi mdi-link-variant-minus"></span>
									</a>
								</div>

								<div class="MatcToolbarSubSection" data-dojo-attach-point="templateDiv">
								</div>

								<div class="MatcToolbarSubSection" data-dojo-attach-point="magicCopyDiv">
								</div>

								<div class="MatcToolbarSubSection" data-dojo-attach-point="toolsDiv">
								</div>

								<div class="MatcToolbarSubSection" data-dojo-attach-point="developerDiv">
								</div>

							</div>
						</div>


				
						<div class="MatcToolbarNotificationSection MatcToolbarSection" data-dojo-attach-point="notificationSection">
							<div class="MatcToolbarSection">
								<CollabUser :users="collabUsers" @select="onCollabUserClicked" />
							</div>
							<div class="MatcToolbarSection">
								<EditModeButton :value="canvasViewConfig" @change="onChangeCanvasViewConfig"  @canvasViewMode="setCanvasViewMode"/>
							</div>
							<ViewConfig :value="canvasViewConfig" @change="onChangeCanvasViewConfig" v-if="hasViewConfigVtn"/>
							<HelpButton :hasNotifications="true" :hasToolbar="true"/>
						</div>

						<div class="MatcToobarSignUpSection MatcToolbarSection MatcToolbarSectionHidden" data-dojo-attach-point="signupSection">
							<a class="MatcToolbarItem MatcToolbarIconNoSmooth" data-dojo-attach-point="saveButton">
							<span class="MatcToolbarLabel">{{ $t('toolbar.sign-up')}}</span>
							</a>
						</div>

				</div>
			</div>

			<div class="MatcToobarPropertiesSection MatcToolbarSectionHidden" data-dojo-attach-point="propertiesCntr">
			</div>

		</div>

</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import hash from 'dojo/hash'
import Util from 'core/Util'
import topic from 'dojo/topic'
import Logger from 'common/Logger'
import _Tools from 'canvas/toolbar/mixins/_Tools'
import _Render from 'canvas/toolbar/mixins/_Render'
import _Dialogs from 'canvas/toolbar/mixins/_Dialogs'
import _Show from 'canvas/toolbar/mixins/_Show'
import ToolbarDropDownButton from 'canvas/toolbar/components/ToolbarDropDownButton'
import ViewConfig from 'canvas/toolbar/components/ViewConfig'
import EditModeButton from "canvas/toolbar/components/EditModeButton"
import CollabUser from "canvas/toolbar/components/CollabUser"
import HelpButton from 'help/HelpButton'



export default {
  name: 'Toolbar',
	mixins:[Util, _Render, _Dialogs, _Tools,_Show, DojoWidget],
	props:['pub'],
    data: function () {
        return {
			canvasViewMode: 'design',
			value: false,
			isPublic: false,
			active: true,
			redirectAfterExit: true,
			showRestTool: true,
			showScriptTool: false,
			hasViewConfigVtn: true,
			canvasViewConfig: {},
			settings: {},
			collabUsers:[],
			showLabels:false,
			isDeveloperMode: false
        }
    },
	components: {
		'ViewConfig': ViewConfig,
		'HelpButton': HelpButton,
		'EditModeButton': EditModeButton,
		'CollabUser': CollabUser
	},
	computed: {
		hasProtoMoto () {
			return this.settings && this.settings.hasProtoMoto
		}
	},
    methods: {
      postCreate: function(){
			this.logger = new Logger("Toolbar");
			this.logger.log(3, "constructor", "entry > " + this.pub);

			this.own(on(this.undo, touch.press, lang.hitch(this, "onUndo")));
			this.own(on(this.redo, touch.press, lang.hitch(this, "onRedo")));

			this.own(on(this.copyBtn, touch.press, lang.hitch(this, "onCopy")));
			this.own(on(this.pasteBtn, touch.press, lang.hitch(this, "onPaste")));
			this.own(on(this.deleteBtn, touch.press, lang.hitch(this, "onDelete")));
			this.own(on(this.copyStyleBtn, touch.press, lang.hitch(this, "onToolCopyStyle")));
			this.own(on(this.commentBtn, touch.press, lang.hitch(this, "onNewComment")));

			this.own(on(this.editTool, touch.press, lang.hitch(this, "onEdit")));
			this.own(on(this.moveTool, touch.press, lang.hitch(this, "onMove")));
			this.own(on(this.signupSection, touch.press, lang.hitch(this, "showSignUpDialog")));

			this.own(on(this.selectBtn, touch.press, lang.hitch(this, "onToolSelect", "select")));
			this.own(on(this.groupBTN, touch.press, lang.hitch(this, "onToolGroup")));
			this.own(on(this.ungroupBTN, touch.press, lang.hitch(this, "onToolGroup")));
			this.own(on(this.hotspotTool, touch.press, lang.hitch(this, "onToolHotspot")));
			this.own(on(this.textTool, touch.press, lang.hitch(this, "onToolText")));
			this.own(on(this.rectangleTool, touch.press, lang.hitch(this, "onToolBox")));

			var btn = this.$new(ToolbarDropDownButton,{arrowPosition:false});
			btn.updateLabel = false;
			btn.setLabel('<span class="mdi mdi-menu"></span>');
			btn.setOptions(this.getMainMenu());
			btn.placeAt(this.home);
			css.add(btn.domNode, "MatcToolbarItem");
		},


		getMainMenu   () {

			var options = [
 			  {label : this.$i18n.t('toolbar.menu.start'), callback:lang.hitch(this, "startSimilator") },
			  {label : this.$i18n.t('toolbar.menu.settings'), callback:lang.hitch(this, "onShowSettings")},
			  {label : this.$i18n.t('toolbar.menu.shortcuts'), callback:lang.hitch(this, "showShortCuts")},
			  {label : this.$i18n.t('toolbar.menu.share'), callback:lang.hitch(this, "showSharing")},
			  {label : this.$i18n.t('toolbar.menu.import'), callback:lang.hitch(this, "showImportDialog")},
			  {label : this.$i18n.t('toolbar.menu.export'), callback:lang.hitch(this, "showDownloadDialog")},
			  {css:"MatcToolbarPopUpLine"},
			  {label : this.$i18n.t('toolbar.menu.change-screen-size'), callback:lang.hitch(this, "onChangeScreenSize")},
			  {label :this.$i18n.t('toolbar.menu.save-as'), callback:lang.hitch(this, "onSaveAs")},
			  {css:"MatcToolbarPopUpLine"},
			  {label : this.$i18n.t('toolbar.menu.exit'), callback:lang.hitch(this, "onExit")},
			]
			return options
		},

		setController (c){
			this.logger.log(3,"setController", "entry");
			this.controller = c;
			this.own(this.controller.on("notSavedWarningShow", lang.hitch(this,"showSaveButton")));
			this.own(this.controller.on("commandAdded", lang.hitch(this,"onCommandAdded")));
		},

		setCanvas (c){
			this.logger.log(3,"setCanvas", "entry");
			this.canvas = c;
		},

		setHash (h){
			this.hash = h
		},

		setContext (context){
			this.context = context;
		},

		setModelFactory (f){
			this.logger.log(3,"setModelFactory", "entry");
			this.factory = f;
		},

		setModel (m){
			this.model = m;
			this.renderToolbar();
			this.renderProperties()
		},

		setPublic (isPublic) {
			this.logger.log(-1,"setPublic", "entry > '" + isPublic + "'");
			this.isPublic = isPublic
		},

		setMode (mode){
			this.logger.log(3,"setMode", "entry > '" + mode + "'");
			this.mode = mode;
			this.onModeChange();
		},

		setLayerList (layerlist){
			this.logger.log(1,"setLayerList", "entry ");
			layerlist.placeAt(this.layerListCntr)
		},

		setUser (user){
			this.user = user;
			this.collabUsers.push(user)
		},

		addCollabUser (user) {
			this.logger.log(1,"addCollabUser", "entry ", user);
			const found = this.collabUsers.find(u => u.id === user.id)
			if (!found) {
				this.collabUsers.push(user)
			}
		},

		removeCollabUser (user) {
			this.logger.log(1,"removeCollabUser", "entry ", user);
			this.collabUsers = this.collabUsers.filter(u => u.id !== user.id)
		},

		getSettings (){
			if (this.canvas){
				return this.canvas.getSettings();
			}
			return {};
		},

		setCanvasViewConfig (viewConfig) {
			this.canvasViewConfig = viewConfig
		},

		onChangeCanvasViewConfig (key, value) {
			if (this.canvas) {
				this.canvas.setCanvasViewConfig(key, value)
			}
		},

		setCanvasViewMode (mode) {
			this.logger.log(-1,"setCanvasViewMode", "entry > " + mode);
			this.canvasViewMode = mode
			if (this.canvas) {
				this.canvas.setViewMode(mode)
			}
			this.updatePropertiesView()
		},

		onCollabUserClicked (user) {
			this.logger.log(-1,"onCollabUserClicked", "entry > ", user);
			if (this.canvas && this.user.id !== user.id) {
				this.canvas.moveToCollabUser(user)
			}
		},

		onFadeOut (){
			this.logger.log(-1,"onFadeOut", "entry ");
			css.add(this.layerListCntr, "MatcLayerListFadeOut");
		},

		onFadeIn (){
			this.logger.log(-1,"onFadeIn", "entry ");
			css.remove(this.layerListCntr, "MatcLayerListFadeOut");
		},

		/********************************************************
		 * Mian menu handlers
		 ********************************************************/

		onDoubleClick () {
			this.logger.log(-1,"onDoubleClick", "entry ", this.isDeveloperMode);
			this.isDeveloperMode = !this.isDeveloperMode
			if (this.isDeveloperMode && this.canvas) {
				this.canvas.showSuccess("Ninja mode enabled!")
			}
		},

		onExit (){
			this.logger.log(-1,"onExit", "entry > " + this.pub);
			this.active = false;
			if(this.pub){
				if(this.model.id){
					hash("#/examples/"+ this.model.id + ".html");
				} else {
					hash("#/");
				}
			} else {
				if (this.redirectAfterExit){
					hash("#/apps/"+ this.model.id + ".html");
				} else {
					this.logger.log(-1,"onExit", "exit >> Do not redictect!");
				}
			}
		},

		onShare (){
			this.logger.log(0,"onShare", "entry");
		},



		onCommandAdded (count){
			if(this.isPublic && count == 50 && !this.reminderShown){
				this.showSignUpReminderDialog(this.saveButton);
				this.reminderShown = true;
			}
		},



		/********************************************************
		 * Selection handlers!
		 ********************************************************/

		onRulerSelected (screen, ruler) {
			this.logger.log("onRulerSelected", "entry : active:" + this.active);

			if (this.active){
				try {
					this.cleanUp();
					this._selection = "ruler";
					this._selectedRuler = {
						screen: screen,
						ruler: ruler
					};
					this.showRulerProperties(screen, ruler);

				} catch(e){
					console.error(e.stack);
					this.logger.sendError(e);
				}
			} else {
				this.logger.log(0,"onRulerSelected", "exit > Not Active");
			}
		},

		onWidgetSelected (widget){
			this.logger.log(1, "onWidgetSelected", "entry : active:" + this.active);

			/**
			 * Make this faster. Just updating the view costs 30ms
			 */
			if (this.active && widget){
				try{
					/**
					 * We might want to blur some stuff
					 */
					if(this._selectedWidget && this._selectedWidget.id != widget.id){
						this.logger.log(3,"onWidgetSelected", "exit > no new selection!");
						this.blurWidgetProperties();
					}

					this.cleanUp();
					this._selection = "widget";
					this._selectedWidget = widget;
					this._selectionID = widget.id;
					this.showWidgetProperties(widget);
					this.showCopyPaste();
					this.showDevTools()
					this.showTools();
					this.showTemplate(widget);

					this.logger.log(3,"onWidgetSelected", "exit");
				} catch (e){
					console.error(e.stack);
					this.logger.sendError(e);
				}
			} else {
				this.logger.log(0,"onWidgetSelected", "exit > Not Active");
			}

		},

		onInheritedWidgetSelected (widget) {
			this.logger.log(-1,"onInheritedWidgetSelected", "entry:" + widget.id);

			if (this.active){
				/**
				 * We might want to blur some stuff
				 */
				if(this._selectedWidget && this._selectedWidget.id != widget.id){
					this.logger.log(3,"onWidgetSelected", "exit > no new selection!");
					this.blurWidgetProperties();
				}

				this.cleanUp();

				this.showInheritedWidgetProperties(widget);
				this._selection = "inheritedWidget";
				this._selectedWidget = widget;
				this._selectionID = widget.id;
			}
		},


		onScreenSelected (screen){
			this.logger.log(3,"onScreenSelected", "entry > active: " + this.active);

			if (this.active){
				try{
					this.cleanUp();

					if (screen) {
						this._selection = "screen";
						this._selectionID = screen.id;
						this._selectedScreen = screen;
						this.showScreenProperties(screen);
						this.showCopyPaste();
						this.showDevTools()
					} else {
						this.logger.error("onScreenSelected", "exit > no screen passed");
					}
				} catch(e){
					console.error(e.stack);
					this.logger.sendError(e);
				}
				this.logger.log(4,"onScreenSelected", "exit");
			} else {
				this.logger.log(0,"onScreenSelected", "exit > Not active!");
			}
		},

		onLineSelected (line){
			this.cleanUp();
			this._selection = "line";
			this._selectedLine = line;
			this.showCopyPaste();
		},

		onMultiSelect (selection){
			if (this.active){
				try{
					this.cleanUp();
					this._selection = "multi";
					this._selectedMulti = selection;
					this.showCopyPaste();
					this.showTemplateMerge(selection);
					this.showTools();
					this.showMultiProperties(this._selectedMulti);
				}catch(e){
					console.error(e);
					this.logger.sendError(e);
				}
			} else {
				this.logger.log(0,"onMultiSelect", "exit > Not active!");
			}
		},

		onGroupSelect (group){
			if (this.active){
				try{
					this.cleanUp();
					this._selection = "group";
					this._selectedGroup = group;
					this.showCopyPaste();
					this.showTemplate(group);
					this.showTools();
					this.showGroupProperties(group);
					this.showDevTools()
				} catch(e){
					console.error(e);
					this.logger.sendError(e);
				}
			} else {
				this.logger.log(0,"onGroupSelect", "exit > Not active!");
			}
		},


		onCanvasSelected (){
			this.cleanUp();

			this.showCanvas()
		},


		/**
		 * method which will update all properties. method is called from controller!
		 */
		updatePropertiesView (){

			if (this.active){
				try{

					/**
					 * 1) check if we have to hide general stuff
					 */
					this.hideNotNeededButtons();

					/**
					 * 2) update stuff
					 */
					if(this._selectedWidget){
						this.onWidgetSelected(this._selectedWidget);
					}

					if(this._selectedScreen){
						this.onScreenSelected(this._selectedScreen);
					}


					if(this._selectedGroup){
						this.showGroupProperties(this._selectedGroup);
					}

				} catch(e){
					console.error(e);
					console.error(e.stack);
					this.logger.sendError(e);
				}
			} else {
				this.logger.log(0,"updatePropertiesView", "exit > Not active!");
			}

		},

		onChildWidgetSelected (widgetID){
			if(this.canvas){
				this.canvas.onWidgetSelected(widgetID);
			}
		},

		/********************************************************
		 * CleanUp
		 ********************************************************/


		cleanUp (){
			this.storePropertiesState();

			this._flushInputFields();

			this._blurInputFields();

			this.cleanUpUI();

			this._selectedWidget = null;

			this._selectedLine  = null;

			this._selectedScreen = null;

			this._selectedMulti = null;

			this._selectedGroup = null;

			this._selection = null;

			this._selectionID = null

			this._selectedRuler = null

			/**
			 * UGLY: Make sure the widget drop down is closed. We should have a loop for all
			 * drop downs!
			 */
			this.createBTN.hideDropDown();
		},

		_blurInputFields (){

			var nodes = document.getElementsByTagName("input");
			for(var x = 0; x < nodes.length; x++){
				nodes[x].blur();
			}

		},

		_flushInputFields (){
			/**
			 * a little bit hacky. we flush the screen name now!
			 * FIXME; This can cause errors in case of undo and redo!
			 */
			this.setScreenName(this.stripHTML(this.screenName.value));

			this.setWidgetName(this.stripHTML(this.widgetName.value));

			this.setGroupName(this.stripHTML(this.groupName.value));

			if(this.widgetSize.isDirty()){
				this.widgetSize.update();
			}
		},

		/**
		 * The layer list needs to be able to set the name, otherwise the _flushInputFields
		 * method will be called after and write the old value!
		 */
		onModelNameChange (id, type, txt){
			if (type == "widget"){
				this.widgetName.value = txt
			} else if (type == "screen"){
				this.screenName.value = txt
			} else if (type == "group"){
				this.groupName.value = txt
			}
		},



		/**********************************************************************
		 * Add & Remove Events
		 **********************************************************************/

		onNewScriptObject (e) {
			this.logger.log(-1,"onNewLogicObject", "entry > ");

				var obj = {
				"id" : "Script",
				"name" : "Script",
				"type":"Script",
				"x": 0,
				"y": 0,
				"w": 80,
				"h": 90,
				"props" : {
					"label" : "Script",
					"script": ''
				},
				"has" :{
					"script" : true
				},
				"style" : {
			        "background": "#777"
				}
			};
			this.emit("onNewScriptObject", {"obj" : obj, "event":e});
		},

		onNewRestObject (e) {
			this.logger.log(-1,"onNewLogicObject", "entry > ");

			var obj = {
				"id" : "Rest",
				"name" : "Rest",
				"type":"Rest",
				"x": 0,
				"y": 0,
				"w": 80,
				"h": 90,
				"props" : {
					"label" : "Rest",
					"rest": {
						"method": "GET",
						"url": "",
						"token": "",
						"authType": "Bearer",
						"input": {
							"type": "JSON",
							"fileDataBinding": '',
							"template": ''
						},
						"output": {
							"databinding": '',
							"template": '',
							"type": 'JSON',
							"hints": {}
						},
						"headers": []
					}
				},
				"has" :{
					"rest" : true
				},
				"style" : {
			        "background": "#777"
				}
			};
			this.emit("onNewRestObject", {"obj" : obj, "event":e});
		},

		onNewLogicObject (e){
			this.logger.log(0,"onNewLogicObject", "entry > ");

			var obj = {
				"id" : "Or",
				"name" : "Or",
				"type":"LogicOr",
				"x": 0,
				"y": 0,
				"w": 80,
				"h": 80,
				"props" : {
					"label" : "Or"
				},
				"has" :{
					"logic" : true
				},
				"style" : {
			        "background": "#777"
				}
			};
			// 56a9fc
			this.emit("onNewLogicObject", {"obj" : obj, "event":e});
		},


		onThemedMultiScreen (screens,e ){
			this.logger.log(0,"onThemedMultiScreen", "entry > ");
			this.emit("newMultiThemedScreen", {"obj" : screens, "event":e});
		},

		onImportChange (imports) {
			this.logger.log(-1,"onImportChange", "entry > ", imports);
			if (this.controller) {
				this.controller.setImports(imports)
			}
		},


		onRemoveTemplate (template) {
			this.logger.log(-1,"onRemoveTemplate", "entry > ", template);
			if (this.controller && template) {
				this.controller.removeAndUnlinkTemplate(template.id)
			}
		},

		onNewThemeObject (obj, e){
			this.logger.log(1,"onNewThemeObject", "entry > " + obj._type + " > " + obj.type+ " > " +obj._isTemplate);
			const type = obj._type;

			/**
			 * remove here some of the shit not needed
			 */
			delete obj._extends;
			delete obj._type;
			delete obj._group;
			delete obj.category;
			delete obj.subcategory;
			delete obj._previewSize
			/**
			 * Now dispatch the the right listener
			 */
			if (obj._isTemplate){
				/**
				 * special handling for templates
				 */
				this.emit("newTemplated"+type, {"id" : obj.id, "event" : e});
			} else if(type === "Screen"){
				this.emit("newThemedScreen", {"obj" : obj, "event" : e});
			} else if(type === "Group"){
				this.emit("newThemedGroup", {"obj" : obj, "event" : e});
			} else if (type === "Widget"){
				this.emit("newThemedWidget",{"obj" : obj, "event" : e} );
			} else if (type === "ScreenAndWidget") {
				this.emit("newThemedScreenAndWidget",{"obj" : obj, "event" : e} );
			}
		},


		onNewLine (e){

			this.stopEvent(e);

			if(this._selectedWidget){

				this.emit("newLine", {"type" : "line", "event" : e, "from" : this._selectedWidget.id});

			} else if(this._selectedGroup){

				this.emit("newLine", {"type" : "line", "event" : e, "from" : this._selectedGroup.id});

			} else if(this._selectedScreen){

				this.emit("newLine", {"type" : "line", "event" : e, "from" : this._selectedScreen.id});

			}

			return false;
		},

		onNewTransformLine (e){
			this.stopEvent(e);

			if(this._selectedWidget){

				this.emit("newLine", {"type" : "line", "event" : e, "from" : this._selectedWidget.id, "duration":500, "animation":"transform"});

			} else if(this._selectedGroup){

				this.emit("newLine", {"type" : "line", "event" : e, "from" : this._selectedGroup.id, "duration":500, "animation":"transform"});

			} else if(this._selectedScreen){

				this.emit("newLine", {"type" : "line", "event" : e, "from" : this._selectedScreen.id, "duration":500, "animation":"transform"});

			}

			return false;
		},

		onNewComment (e){
			this.logger.log(0,"onNewComment", "entry");
			this.stopEvent(e);

			this.emit("newComment", {"type" : "comment", "event" : e});
		},



		createOnClick (e){
			this.emit("newLine", {"type" : "line", "event" : e, "from" : this._selectedWidget.id});
			return false;
		},

		/**********************************************************************
		 * Design Token
		 **********************************************************************/

		newDesignToken (tokenType, cssProps, name) {
			this.logger.log(-1,"newDesignToken", "entry", name);

			var state = this._getViewStyleModelKey();
			if(this._selectedWidget){
				this.controller.addDesignToken(this._selectedWidget.id, tokenType, cssProps, state, name, 'widget');
			}
			if(this._selectedScreen){
				this.controller.addDesignToken(this._selectedScreen.id, tokenType, cssProps, state, name, 'screen');
			}
			this.designTokenList.setModel(this.model)
		},

		linkDesignToken (designToken, cssProps) {
			this.logger.log(-1,"linkDesignToken", "entry");
			var state = this._getViewStyleModelKey();
			if(this._selectedWidget){
				this.controller.linkDesignToken(this._selectedWidget.id, designToken.id,state, cssProps, 'widget');
			}
			if(this._selectedScreen){
				this.controller.linkDesignToken(this._selectedScreen.id, designToken.id, state, cssProps,'screen');
			}
		},

		unlinkDesignToken (designToken) {
			this.logger.log(-1,"unlinkDesignToken", "entry", designToken);

			var state = this._getViewStyleModelKey();
			if(this._selectedWidget){
				this.controller.unlinkDesignToken(this._selectedWidget.id, designToken.id,state, 'widget');
			}
			if(this._selectedScreen){
				this.controller.unlinkDesignToken(this._selectedScreen.id, designToken.id, state, 'screen');
			}
		},

		changeDesignToken (designToken) {
			this.logger.log(-1,"changeDesignToken", "entry");

			this.controller.updateDesignToken(designToken.id, designToken.name, designToken.value);

		},

		removeDesignToken () {
			this.logger.log(-1,"deleteDesignToken", "entry");
		},

		/**********************************************************************
		 * Action
		 **********************************************************************/


		newAction (action){

			if(this._selectedWidget){
				this.controller.addAction(this._selectedWidget.id, action, false);
			}

			if(this._selectedGroup){
				this.controller.addAction(this._selectedGroup.id, action, true);
			}

		},

		removeAction (action){

			if(this._selectedWidget){
				this.controller.removeAction(this._selectedWidget.id, action, false);
			}

			if(this._selectedGroup){
				this.controller.removeAction(this._selectedGroup.id, action, true);
			}
		},

		updateAction (action) {
			this.logger.log(-1,"updateAction", "enter > ", action);

			if (this._selectedWidget){
				this.controller.updateAction(this._selectedWidget.id, action, false);
			}

			if(this._selectedGroup){
				this.controller.updateAction(this._selectedGroup.id, action, true);
			}
		},

		/**********************************************************************
		 * Modes
		 **********************************************************************/


		onMove (e){
			this.stopEvent(e);
			this.canvas.setMode("move");
		},

		onEdit (e){
			this.stopEvent(e);
			this.canvas.setMode("edit");
		},



		/**********************************************************************
		 * Copy, Paste, Delete
		 **********************************************************************/


		onCopy (e){
			this.stopEvent(e);
			this.logger.log(1,"onCopy", "entry : " + this._selection);

			this.canvas.onCopy();
		},

		onPaste (e){
			this.stopEvent(e);
			this.logger.log(1,"onPaste", "entry : " + this._selection);

			this.canvas.onPaste(true,e);
		},


		onDelete (e){
			this.stopEvent(e);
			this.logger.log(1,"onDelete", "entry : " + this._selection);

			if(this._selection == "line"){
				this.removeLine();
			}

			if(this._selection == "widget"){
				this.removeWidget();
			}

			if(this._selection == "screen"){
				this.removeScreen();
			}

			if(this._selection == "multi"){
				this.removeMulti();
			}

			if(this._selection == "group"){
				this.removeGroup();
			}
		},

		removeLine (){
			if(this._selectedLine){
				this.controller.removeLine(this._selectedLine);
				this.cleanUp();
			}
			if(this._selectedWidget){
				let line = this.getLine(this._selectedWidget);
				if(line){
					this.controller.removeLine(line);
					this.cleanUp();
				}
			}
			if(this._selectedGroup){
				let line = this.getLine(this._selectedGroup);
				if(line){
					this.controller.removeLine(line);
					this.cleanUp();
				}
			}
			return false;
		},

		removeLineById (id){
			var line = this.model.lines[id];
			if(line){
				this.controller.removeLine(line);
				this.cleanUp();
			} else {
				console.debug("removeLineById() > No Line with id", id)
			}
		},

		removeWidget (){
			if(this._selectedWidget){
				this.controller.removeWidget(this._selectedWidget.id);	
				this.cleanUp();
			}
			return false;
		},

		removeScreen (){
			if(this._selectedScreen){
				this.controller.removeScreen(this._selectedScreen.id);
				this.cleanUp();
			}
			return false;
		},

		removeMulti (){
			if(this._selectedMulti){
				this.controller.removeMultiWidget(this._selectedMulti);
				this.cleanUp();
			}
			return false;
		},

		removeGroup (){
			if(this._selectedGroup){
				this.controller.removeGroupAndWidgets(this._selectedGroup.id);
				this.cleanUp();
			}
			return false;
		},

		/**********************************************************************
		 * Tools which get activated and change how the canvas responds to clicks
		 **********************************************************************/

		onToolCreateTheme (e){
			this.stopEvent(e);
			this.showThemeCreateDialog(e);
		},

		onToolChangeTemplate(type, e){
			this.stopEvent(e);
			this.logger.log(-1,"onToolChangeTemplate", "entry : " + type);
			if (type === 'update') {
				this.onToolUpdateTemplate(e)
			}
			if (type === 'remove') {
				this.onToolRemoveTemplate(e)
			}
		},

		onToolRemoveTemplate (e) {
			this.logger.log(1,"onToolRemoveTemplate", "entry : " + this._selectedWidget);
			this.stopEvent(e);
			if (this._selectedWidget){
				this.controller.unlinkTemplate(this._selectedWidget.id, false);
			}
			if (this._selectedGroup){
				this.controller.unlinkTemplate(this._selectedGroup.id, true);
			}
		},

		onToolUpdateTemplate (e) {
			this.stopEvent(e);
			this.logger.log(1,"onToolUpdateTemplate", "entry : " + this._selectedWidget);
			if (this._selectedWidget){
				this.controller.updateTemplateStyle(this._selectedWidget.id);
			} 
			if (this._selectedGroup){
				this.controller.updateGroupTemplateStyle(this._selectedGroup.id);
			}
		},

		onToolCreateTemplate (e){
			this.stopEvent(e);
			this.logger.log(1,"onToolCreateTemplate", "entry : " + this._selectedWidget);

			var name = this.$i18n.t("toolbar.templates.new");
			if(this._selectedWidget && this._selectedWidget.name){
				name = this._selectedWidget.name;
			}

			if(this._selectedScreen && this._selectedScreen.name){
				name = this._selectedScreen.name;
			}

			if(this._selectedGroup && this._selectedGroup.name){
				name = this._selectedGroup.name;
			}

			this.showTemplateCreateDialog(name);
		},

		onToolbarReplicate (e){
			this.stopEvent(e);
			this.logger.log(1,"onToolbarReplicate", "entry : " + this._selectedWidget);
			this.canvas.onReplicate();
			if (this.replicateBtn){
				css.toggle(this.replicateBtn, "MatcToolbarItemActive");
			}
		},

		onToolbarDistribute (e){
			this.stopEvent(e);
			this.logger.log(1,"onToolbarDistribute", "entry : " + this._selectedWidget);
			this.canvas.onDistribute();
			if (this.distributeBtn){
				css.toggle(this.distributeBtn, "MatcToolbarItemActive");
			}
		},


		onToolCopyStyle (e){
			this.stopEvent(e);
			this.logger.log(1,"onCopyStyle", "entry : " + this._selection);

			if(this._selection != "screen"){
				this.canvas.onCopyStyle();
				this.toolCopyPasteStyleStart();
			}

		},


		onToolAlignElements (value, e){
			this.logger.log(1,"onAlignElements", "entry : " + this._selection);
			this.stopEvent(e);


			if(this._selectedMulti){
				/**
				 * in case we are in a selction we will align to the selection!
				 */
				this.controller.alignWidgets(value, this._selectedMulti, this._selectedMulti);

			} else if (this._selectedWidget) {
				/**
				 * Since 2.1.7 we allign on canvas
				 */

				// this.toolAlignStart(value);
				// this.canvas.onAlignStart(value);
				const parentScreen = this.getParentScreen(this._selectedWidget);
				if (parentScreen) {
					this.controller.alignWidgets(value, [this._selectedWidget.id], [parentScreen.id]);
				} else {
					this.logger.log(1,"onAlignElements", "exit not parent : ", this._selectedWidget);
				}
			} else if (this._selectedGroup) {
				/**
				 * Since 2.1.7 we allign on canvas
				 */
				const widgetID = this._selectedGroup.children[0]
				const widget = this.model.widgets[widgetID]
				if (widget) {
					var parentScreen = this.getParentScreen(widget);
					if (parentScreen) {
						this.controller.alignWidgets(value, this._selectedGroup.children, [parentScreen.id]);
					} else {
						this.logger.log(1,"onAlignElements", "exit not parent : ", this._selectedGroup);
					}
				}
			}


		},


		onToolDistributeElements (value, e){
			this.logger.log(0,"onToolDistributeElements", "entry : " + this._selection);
			this.stopEvent(e);

			if(this._selectedMulti){
				this.controller.distributeWidgets(value, this._selectedMulti);
			}
		},

		onToolSelect (mode, e){
			this.logger.log(1,"onModeClick", "entry > '" + mode + "'");
			this.stopEvent(e);
			topic.publish("matc/canvas/click", "");
			/**
			 * toggle between modes!
			 */
			if(this.mode == "select"){
				this.controller.setMode("edit");
			} else {
				this.controller.setMode("select");
			}
		},

		onToolText (e){
			this.logger.log(1,"onToolHotspot", "entry >");
			this.stopEvent(e);

			topic.publish("matc/canvas/click", "");

			/**
			 * toggle between modes!
			 */
			if(this.mode == "addText"){
				this.controller.setMode("edit");
			} else {
				this.controller.setMode("addText");
			}
		},

		onToolBox (e){
			this.logger.log(1,"onToolHotspot", "entry >");
			this.stopEvent(e);

			topic.publish("matc/canvas/click", "");

			/**
			 * toggle between modes!
			 */
			if(this.mode == "addBox"){
				this.controller.setMode("edit");
			} else {
				this.controller.setMode("addBox");
			}
		},

		onToolHotspot (e){
			this.logger.log(1,"onToolHotspot", "entry >");
			this.stopEvent(e);

			topic.publish("matc/canvas/click", "");

			/**
			 * toggle between modes!
			 */
			if(this.mode == "hotspot"){
				this.controller.setMode("edit");
			} else {
				this.controller.setMode("hotspot");
			}
		},

		onToolGroup (e){
			this.logger.log(1,"onToolGroup", "entry");
			this.stopEvent(e);

			if(this._selectedGroup){
				/**
				 * Ungroup
				 */
				this.controller.removeGroup(this._selectedGroup.id);
			}

			if(this._selectedMulti){
				/**
				 * Create a group and let the canvas select it!
				 */
				var group = this.controller.addGroup(this._selectedMulti);
				if(group){
					this.canvas.onGroupSelected(group.id);
				}

			}
		},


		onToolWidgetLayer (value){
			this.logger.log(1,"onToolWidgetLayer", "entry > "+ value);

			let selection = this._getSelectedWidgets();
			if (selection.length > 0) {
				let topId = false
				/**
				 * Since 4.0.60 we have a single selection in a group, 
				 * can we boost the entire group to top?
				 */

				if (selection.length === 1 && (value === 'front' || value === 'back')) {
					const widget = this.model.widgets[selection[0]];
					if (widget) {
						let parentGroup = this.getTopParentGroup(widget.id)
						topId = widget.id
						if (parentGroup) {
							selection= this.getAllGroupChildren(parentGroup)
						}
					}
				}
				
				const widgets = this.model.widgets;
				const oldValues = this.getZValues(widgets);
				const offset = this._getZOffset(selection, oldValues);
				const max = this.getMaxZValue(widgets);
				const min = this.getMinZValue(widgets);
				switch(value) {
				    case "front":
				    	for(let i=0;i< selection.length; i++){
				    		let id =selection[i];
				    		oldValues[id] = max +1 + offset[id];
				    	}
				    	break;
				    case "forward":
				    	for(let i=0;i< selection.length; i++){
				    		let id =selection[i];
				    		oldValues[id]+=1;
				    	}
				        break;
				    case "backward":
				    	for(let i=0;i< selection.length; i++){
				    		let id =selection[i];
				    		oldValues[id]-=1;
				    	}
				    	break;
				    default:
				    	var l = selection.length;
					    for(let i=0;i< selection.length; i++){
				    		let id =selection[i];
				    		oldValues[id] = min - l + offset[id];
				    	}
				        break;
				}

			
				/**
				 * Since 4.0.60 we move groups as well up or down
				 */
				if (topId) {
					if (value === 'front') {
						oldValues[topId] = max + 10 + selection.length
					}
					if (value === 'back') {
						oldValues[topId] = min - 10 + selection.length
					}
				}
				

				/**
				 * normalize z-values to have the model a little bit better. Lowest value should be
				 * zero, not more than one step between layers
				 */
				const newValues = this.getNormalizeWidgetZValues(oldValues);
				this.controller.setWidgetLayers(newValues);
			}
		},

		_getZOffset (selection, values){
			var offsets = {};

			var min = 100000;

			for(let i=0;i< selection.length; i++){
		    	let id =selection[i];
		    	min = Math.min(min, values[id]);
			}

			for(let i=0;i< selection.length; i++){
			    let id =selection[i];
			    offsets[id] = values[id] - min;
			}

			return offsets;
		},

		_getSelectedWidgets (){
			var selection = [];
			if(this._selectedWidget){
				selection.push(this._selectedWidget.id);
			} else if(this._selectedGroup){
				/**
				 * Since 2.1.3 we have sub groups
				 */
				selection = this.getAllGroupChildren(this._selectedGroup)
			} else if(this._selectedMulti){
				selection = this._selectedMulti;
			} else {
				console.warn("_getSelectedWidgets() > Cannot get fint selection!");
			}
			return selection;
		},

		/**********************************************************************
		 * UI Callback to update style & props
		 **********************************************************************/

		toggleLineHide (value){
			this.logger.log(3,"toggleLineHide", "entry >" + value);


			if(this._selectedWidget){
				let line = this.getLineFrom(this._selectedWidget);
				if(line){
					this.controller.updateLineProperties(line.id, "hidden", value);
				} else {
					console.warn("toggleLineHide() > No line for widget. Check should no be visible!");
				}
			}

			if(this._selectedGroup){
				let line = this.getLineFrom(this._selectedGroup);
				if(line){
					this.controller.updateLineProperties(line.id, "hidden", value);
				} else {
					console.warn("toggleLineHide() > No line for Group. Check should no be visible!");
				}
			}
		},

		setLineProperty (key, value){
			this.logger.log(2,"setLineProperty", "entry >" + key + " : " + value);

			if(this._selectedWidget){
				let line = this.getLineFrom(this._selectedWidget);
				if(line){
					this.controller.updateLineProperties(line.id, key, value);
				} else {
					console.warn("setLineProperty() > No line for widget. Check should no be visible!");
				}
			}

			if(this._selectedGroup){
				let line = this.getLineFrom(this._selectedGroup);
				if(line){
					this.controller.updateLineProperties(line.id, key, value);
				} else {
					console.warn("setLineProperty() > No line for Group. Check should no be visible!");
				}
			}
		},


		setLinePropertyByID (id, key, value){
			this.logger.log(0,"setLinePropertyByID", "entry >" + id + " > "+  key + " : " + value);

			var line = this.model.lines[id];
			if(line){
				this.controller.updateLineProperties(line.id, key, value);

			} else {
				console.warn("setLinePropertyByID() > No line with id " + id + ". Check should no be visible!");
			}
		},

		updateLineByID (id, newLine){
			this.logger.log(0,"updateLineByID", "entry >" + id );

			var line = this.model.lines[id];
			if(line){
				this.controller.updateLineAllProperties(line.id, newLine);
			} else {
				console.warn("updateLineByID() > No line with id " + id + ". Check should no be visible!");
			}
		},

		setWidgetSize (pos){
			this.logger.log(1,"setWidgetSize", "entry > ");

			if(this._selectedWidget){

				this.controller.updateWidgetPosition(this._selectedWidget.id, pos, true);
			}

			return false;
		},

		enableInheritedWidget () {
			this.logger.log(1,"enableInheritedWidget", "entry > ");
			if(this._selectedWidget){
				var newWidget = this.controller.enableInheritedWidget(this._selectedWidget);
				if(newWidget){
					/**
					 * Trigger Selecion in Canvas which will also trigger back the selection
					 * in the controller and then the Toolbar.
					 */
					if (this.canvas) {
						this.canvas.onWidgetSelected(newWidget.id)
					}
				}
			}
			return false;
		},

		setScreenSize (pos){
			this.logger.log(0,"setScreenSize", "entry > "+ pos.w + "/" + pos.h);

			if(this._selectedScreen){

				this.controller.updateScreenWidthAndHeight(this._selectedScreen.id, pos);
			}
			return false;
		},


		toggleStyle (key, value){
			this.logger.log(0,"toggleStyle", "entry > " + key + " - "+ value);
			var modelKey = this._getViewStyleModelKey();
			var newStyle = {};
			if(this._selectedWidget && this._selectedWidget.style){
				let style = this._selectedWidget[modelKey];
				if(style && (style[key] == null || style[key] != value)){
					newStyle[key] = value;
				} else {
					newStyle[key] = "";
				}
				this.controller.updateWidgetProperties(this._selectedWidget.id, newStyle, modelKey);
			} else if(this._selectedMulti && this._selectedMulti[0]){
				var widget = this.model.widgets[this._selectedMulti[0]];
				if(widget){
					let style = widget[modelKey];
					if(style && (style[key] == null || style[key] != value)){
						newStyle[key] = value;
					} else {
						newStyle[key] = "";
					}
					this.controller.updateMultiProperties(this._selectedMulti, newStyle, modelKey);
				}
			}
			return false;
		},


		setWidgetStyle (key, value){
			this.logger.log(2,"setWidgetStyle", "entry > " + key + " - "+ value);

			var newSytle = {};
			newSytle[key] = value;
			var modelKey = this._getViewStyleModelKey();

			if(this._selectedWidget && this._selectedWidget.style){
				this.controller.updateWidgetProperties(this._selectedWidget.id, newSytle, modelKey);
			} else if(this._selectedMulti){
				this.controller.updateMultiProperties(this._selectedMulti, newSytle, modelKey);
			}else if(this._selectedGroup){
				this.controller.updateMultiProperties(this._selectedGroup.children, newSytle, modelKey);
			}
			return false;
		},


		setWidgetMultiStyle (newStyle){
			this.logger.log(2,"setWidgetMultiStyle", "entry");
			var modelKey = this._getViewStyleModelKey();
			if(this._selectedWidget && this._selectedWidget.style){
				this.controller.updateWidgetProperties(this._selectedWidget.id, newStyle, modelKey);
			} else if(this._selectedMulti){
				this.controller.updateMultiProperties(this._selectedMulti, newStyle, modelKey);
			}
			return false;
		},

		_getViewStyleModelKey (){
			return this.widgetViewModeBtn.getValue();
		},


		setWidgetProps (key, value){
			this.logger.log(2,"setWidgetProps", "entry > " + key + " - "+ value);
			if(this._selectedWidget){
				if(this._selectedWidget.props){
					var newProps = {};
					newProps[key] = value;
					this.controller.updateWidgetProperties(this._selectedWidget.id, newProps, "props");
				}
			}
			return false;
		},

		setGroupProperties (key, value) {
			this.logger.log(2,"setGroupProperties", "entry > " + key + " - "+ value);
			if (this._selectedGroup) {
				var newProps = {};
				newProps[key] = value;
				this.controller.updateGroup(this._selectedGroup.id, 'props', key, value)
			}
			return false
		},

		setGroupStyle (key, value) {
			this.logger.log(2,"setGroupStyle", "entry > " + key + " - "+ value);
			if (this._selectedGroup) {
				var newProps = {};
				newProps[key] = value;
				this.controller.updateGroup(this._selectedGroup.id, 'style', key, value)
			}
			return false
		},

		setScreenStyle (key, value){
			this.logger.log(2,"setScreenStyle", "entry > " + key + " - "+ value);
			if(this._selectedScreen){
				if(this._selectedScreen.style){
					var newSytle = {};
					newSytle[key] = value;
					this.controller.updateScreenProperties(this._selectedScreen.id, newSytle, "style");
				}
			}
			return false;
		},

		setRulerProperties (props) {
			this.logger.log(2,"setRulerProperties", "entry ");
			if (this._selectedRuler) {
				this.controller.updateScreenRulerProps(this._selectedRuler.screen.id, this._selectedRuler.ruler.id, props)
			}
			return false
		},

		setRulerPosition (v) {
			this.logger.log(0,"setRulerPosition", "entry > " + v);
			if (this._selectedRuler) {
				this.controller.updateScreenRulerValue(this._selectedRuler.screen.id, this._selectedRuler.ruler.id, v)
			}
		},

		/***************************************************************************************************************
		 *  Temp Styles without model updates. Just update the rendering!
		 ***************************************************************************************************************/
		setTempScreenStyle (key, value){
			this.logger.log(0,"setTempScreenStyle", "entry > " + key + " - "+ value);
			if(this._selectedScreen){
				if(this._selectedScreen.style){
					var newSytle = {};
					newSytle[key] = value;
					this.canvas.setTempScreenStyle(this._selectedScreen.id, newSytle);
				}
			}
			return false;
		},

		setTempWidgetStyle (key, value){
			this.logger.log(2,"setTempWidgetStyle", "entry > " + key + " - "+ value);
			var modelKey = this._getViewStyleModelKey();
			if ("style" == modelKey) {
				var newStyle = {};
				newStyle[key] = value;
				/**
				 * FIXME: What does this do?
				 */
				modelKey = this._getViewStyleModelKey();
				if(this._selectedWidget && this._selectedWidget.style){
					this.canvas.setTempWidgetStyle(this._selectedWidget.id, newStyle);
				} else if(this._selectedMulti){
					for (var i=0; i < this._selectedMulti.length; i++){
						this.canvas.setTempWidgetStyle(this._selectedMulti[i], newStyle);
					}
				}
			}
			return false;
		},

		setTempMultiWidgetStyle (newStyle){
			this.logger.log(0,"setTempMultiWidgetStyle", "entry > " + newStyle);

			if(this._selectedWidget && this._selectedWidget.style){
				this.canvas.setTempWidgetStyle(this._selectedWidget.id, newStyle);
			} else if(this._selectedMulti){
				for (var i=0; i < this._selectedMulti.length; i++){
					this.canvas.setTempWidgetStyle(this._selectedMulti[i], newStyle);
				}
			}
			return false;
		},


		setScreenStart (key, value){
			this.logger.log(2,"setScreenStart", "entry > " + key + " - "+ value);
			if(this._selectedScreen){
				if(this._selectedScreen.props){
					var newProps = {};
					newProps[key] = value;
					this.controller.updateScreenStart(this._selectedScreen.id, newProps, "props");
				}
			}
			return false;
		},

		setScreenSegement (key, value) {
			this.logger.log(0,"setScreenSegement", "entry > " + key + " - "+ value);
			if (this._selectedScreen){
				this.controller.setScreenSegment(this._selectedScreen.id, value);
			}
			return false;
		},

		setScreenProps (key, value){
			this.logger.log(0,"setScreenProps", "entry > " + key + " - "+ value);
			if(this._selectedScreen){
				if(this._selectedScreen.props){
					var newProps = {};
					newProps[key] = value;
					this.controller.updateScreenProperties(this._selectedScreen.id, newProps, "props");
				}
			}
			return false;
		},


		setScreenParent (parentScreens){

			this.logger.log(0,"setScreenParent", "entry > " + parentScreens.length);
			if(this._selectedScreen){

				this.controller.setScreenParent(this._selectedScreen.id, parentScreens);

			}
			return false;
		},



		showImageSelector (){
			this.logger.log(3,"showImageSelector", "entry > ");
		},

		showLineAction (line){
			this.logger.log(3,"showLineAction", "entry > " + line.id);

			if(this._selectedWidget){
				if(this.actionBTN){
					let actionBTN = this.actionBTN;
					setTimeout(function(){
						actionBTN.showActionSettings(line);
					},50);

				}
			} else if(this._selectedGroup){
				if(this.groupActionBTN){
					let actionBTN = this.groupActionBTN;
					setTimeout(function(){
						actionBTN.showActionSettings(line);
					},50);
				}
			}
		},


		showWidgetSelector (){
			if(this.createBTN){
				this.createBTN.showDropDown();
			}
		},

		showScreenSelector (){
			if(this.screenCreateBtn){
				this.screenCreateBtn.showDropDown();
			}
		},

		onScreenNameChange (){
			this.setScreenName(this.screenName.value);
		},

		setScreenName (value){
			this.logger.log(3,"setScreenName", "entry > " + value);
			if(this._selectedScreen){
				this.controller.setScreenName(this._selectedScreen.id, value);
			}
		},


		onWidgetNameChange (){
			this.setWidgetName(this.widgetName.value);
		},

		onGroupNameChange (){
			this.setGroupName(this.groupName.value);
		},


		setWidgetName (value){
			this.logger.log(3,"setWidgetName", "entry > " + value);
			if(this._selectedWidget){
				/**
				 * FIXME: we could catch if there was a change... well for now the
				 * controller does it...
				 */
				this.controller.setWidgetName(this._selectedWidget.id, value);
			}
		},

		setGroupName (value){
			if(this._selectedGroup && this._selectedGroup.name !== value){
				this.logger.log(-1,"setGroupName", "entry > " + value);
				this.controller.setGroupName(this._selectedGroup.id, value);
			}
		},


		/**********************************************************************
		 * Undo  & Redo
		 **********************************************************************/

		hideUndoSection (){
			css.add(this.undoSection, "MatcToolbarSectionHidden");
		},

		showUndoSection (){
			css.remove(this.undoSection, "MatcToolbarSectionHidden");
		},

		onUndo (){
			this.logger.log(1,"onUndo", "entry");
			this.controller.undo();
			return false;
		},

		disableUndo (){
			css.add(this.undo, "MatcToolbarItemDisbaled");
		},

		enbaleUndo (){
			css.remove(this.undo, "MatcToolbarItemDisbaled");
		},

		onRedo (){
			this.logger.log(1,"onRedo", "entry");
			this.controller.redo();
			return false;
		},

		disableRedo (){
			css.add(this.redo, "MatcToolbarItemDisbaled");
		},

		enbaleRedo (){
			css.remove(this.redo, "MatcToolbarItemDisbaled");
		},

		setSettings (v){
			this.logger.log(1,"setSettings", "entry > ", v);
			this.settings = v;
			if (this.settings.hasProtoMoto) {
				this.showScriptTool = true
			} else {
				this.showScriptTool = false
			}
		},


		/**********************************************************************
		 * Helper
		 **********************************************************************/

		stopEvent (e){
			if(e){
				e.preventDefault();
				e.stopPropagation();
			}
		}
    },
    mounted () {
    }
}
</script>