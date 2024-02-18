<template>
    <div class=" MatcCreateBtn MatcToolbarArrowDropDown MatcToolbarDropDownButton">
	<div type="button" ref="button" :class="['MatcToolbarItem MatcToolbarPrimaryItem', {'MatcToolbarItemSelected': mode === 'add'}]">	
			<QIcon icon="AddWidget" />		
			<!-- <span class="caret"></span> -->
		</div>
			<div class="MatcToolbarPopUp" role="menu" data-dojo-attach-point="popup">
				<div class="MatcCreateBtnCntr MatcPadding">
					<div class="container-fluid">
						<div class="row"  v-show="tab === 'widgets'">
							<div class="col-md-10 MatcCreateBtnElementList MatcCreateBtnRight" data-dojo-attach-point="rightCntr">
								<div class="MatcHint">Loading Widgets...</div>
							</div>
							<div class="col-md-2 MatcCreateBtnLeft">
								<div class="form-group has-feedback">
									<input type="search" class=" MatcCreateSearch MatcIgnoreOnKeyPress form-control" placeholder="Search" data-dojo-attach-point="searchBox"/>
									<span class="mdi mdi-magnify  form-control-feedback MatcCreateSearchBtn " aria-hidden="true" data-dojo-attach-point="searchRemoveBtn"></span>
								</div>
								<div class="MatcCreateCatCntr" data-dojo-attach-point="leftCntr"></div>
							</div>
						</div>
						<div class="row" v-show="tab === 'import'">
							<div @mousedown.stop="" class="col-md-12 MatcCreateBtnElementList MatcCreateBtnRight" >
								<div data-dojo-attach-point="importCntr">
									<div class="MatcHint">Loading Apps...</div>
								</div>
								<div class="MatcButtonBar">
									<a class="MatcButton MatcButtonPrimary MatcButtonXS" @click="onSaveImports">Save</a> 
									<a class="MatcButton MatcButtonPrimary MatcButtonXS" @click="showWidgets()">Back</a>
								</div>
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
import domStyle from 'dojo/domStyle'
import touch from 'dojo/touch'
import DomBuilder from 'common/DomBuilder'
import ScrollContainer from 'common/ScrollContainer'
import Util from 'core/Util'
import RenderFactory from 'core/RenderFactory'
import _DropDown from './_DropDown'
import Services from 'services/Services'
import CheckBox from 'common/CheckBox'
import ModelUtil from 'core/ModelUtil'
import QIcon from 'page/QIcon'
import {wrapIcon} from 'page/QIconUtil'
import QSS from 'core/qss/QSS'
import _Tooltip from 'common/_Tooltip'

export default {
    name: 'CreateButton2',
    mixins:[Util, DojoWidget, _DropDown, _Tooltip],
	props:['mode'],
    data: function () {
        return {
        	screenWidth : 300,
			screenHeight : 600,
			selectedCategory : "WireFrame",
			showSubCatgeoryLabels : false,
			icons: [],
			svgIcons: [],
			categoryNames : {
				"Bootstrap" : "Bootstrap 3",
				"Bootstrap4" : "Bootstrap 4",
				"OpenUI": "OpenUI5"
			},
			previewSizes : {
				default : {
					w : 120,
					h : 70
				},
				Screen : {
					w : 160,
					h : 200
				}
			},
			tab: 'widgets',
			importableApps: []
        }
    },
    components: {QIcon},
    methods: {
      	setIcons (icons) {
			this.icons = icons
		},

		setSVGIcons (icons) {
			this.svgIcons = icons
		},

		setUser (user) {
			this.user = user
		},

		async setModel (m){
			this.model = m;
			this.screenWidth = m.screenSize.w;
			this.screenHeight = m.screenSize.h;
			this.renderFactory = new RenderFactory();
			this.renderFactory.setModel(m);
			this.renderFactory.setSymbol(true);
			this.categoriesList = ["WireFrame", "Advanced", "Survey", "Material", "IOS", "Charts" ];
			this.categoryToQSS = {
				WireFrame: QSS.getTheme("wireframe"),
				Advanced: QSS.getTheme("wireframe"),
				Survey: QSS.getTheme("survey")
			}
			this._importedApps = {}
			/**
			 * set to last added category...
			 */
			if(	this.model.lastCategory){
				this.selectedCategory = this.model.lastCategory;
			}
			// FIXME: this could be done only on demand...
			// check if we have imports, becasue then we have to check
			// if (this.model.imports)
			this.importableApps = await Services.getModelService().findMyAppSummaries()
			setTimeout(lang.hitch(this, "init"), 2000);
		},

		setJwtToken (t) {
			if (this.renderFactory) {
				this.renderFactory.setJwtToken(t)
			}
		},

		onVisible (){
			this.showWidgets()
			if(this.selectedCategory == 'Template'){
				this.renderTemplates();
			}
			setTimeout( () => {
				this.searchBox.select();
				this.searchBox.focus();
			}, 250)
			css.add(this.button,"MatcToolbarItemActive");
		},

		onHide (){
			css.remove(this.button,"MatcToolbarItemActive");
		},

		async init (){
			if (!this.categories){

				/**
				 * load themes
				 */
				let coreThemes = await Services.getSymbolService().getCore()
				this.onThemesLoaded(coreThemes)

				this.own(on(this.searchBox, "mousedown", function(e){
					e.stopPropagation();
					return false
				}));
				// chrome messes with this now! We have new pointer events!
				this.own(on(this.searchBox, "pointerdown", function(e){
					e.stopPropagation();
					return false
				}));

				this.own(on(this.searchBox, "keypress", function(e){e.stopPropagation()}));
				this.own(on(this.searchBox, "keydown", function(e){e.stopPropagation()}));
				this.own(on(this.searchBox, "keyup", lang.hitch(this,"onSearch")));
				this.own(on(this.searchRemoveBtn, touch.press, lang.hitch(this,"resetSearch")));
			}
		},


		onSearch (e){
			e.stopPropagation();
			var k = e.keyCode ? e.keyCode : e.which
			if (k === 13) {
				if (this._visibleElements && this._visibleElements.length === 1) {
					this.onCreate(this._visibleElements[0], e)
					return;
				}
			}

			var query = this.searchBox.value;
			if(query.length > 1 && this.categories){
				this.searchQuery = query.toLowerCase();
				this.renderSearchResult(this.searchQuery);
			} else {
				//css.add(this.searchRemoveBtn, "hidden");
				this.showCategory(this.selectedCategory);
				this.searchQuery = null;
			}
		},

		resetSearch (e){
			this.stopEvent(e);
			this.searchBox.value="";
			//css.add(this.searchRemoveBtn, "hidden");
			if(this.searchQuery ){
				this.searchQuery = null;
				this.showCategory(this.selectedCategory);
			}
		},

		onThemesLoaded (themes){
			this.rightCntr.innerHTML="";
			var categories = {};
			var temp = {};



			/**
			 * sort into categories
			 */
			for (let i=0; i< themes.length; i++){
				let theme = themes[i];
				if (theme.id){
					const category = theme.category;
					if(!categories[category]){
						categories[category] = {};
					}
					// add categories omn demand
					if (this.categoriesList.indexOf(category) === -1) {
						console.warn('CreateButton.onThemesLoaded() > Found new category. Consinder updating the CreateButton.vue componenet', category)
						this.categoriesList.push(category)
					}
					if(!categories[category][theme.id]){
						categories[category][theme.id] = theme
			
						if (this.categoryToQSS[category]) {					
							const qssTheme = this.categoryToQSS[category]				
							QSS.replaceVariables(qssTheme, theme)
							QSS.replaceSize(qssTheme, theme)
							QSS.replaceBorderVariables(theme)		
						}

						temp[theme.id] = theme;
						this.setDefaultValues(theme);
						this.setDefaultValues(theme.min);
					} else {
						console.warn("We have already a theme with the id", theme.id, theme);
					}
				} else {
					console.warn("Theme has no id!");
				}
			}

			/**
			 * now do the mixin stuff
			 */
			for(let id in temp){
				let theme = temp[id];
				let category = theme.category;
				if(theme._extends){
					var parent = temp[theme._extends];
					if(parent){
						/**
						 * if we extends something we have to mixing all relevant properties.
						 * dojo.mixin does not provide deep mixins.
						 */
						theme = lang.mixin(lang.clone(parent), theme);
						theme.props = lang.mixin(lang.clone(parent.props), theme.props);
						theme.style = lang.mixin(lang.clone(parent.style), theme.style);
						theme.has = lang.mixin(lang.clone(parent.has), theme.has);
						if(parent._preview){
							theme._preview = lang.mixin(lang.clone(parent._preview), theme._preview);
						}
						if(theme.error){
							theme.error = lang.mixin(lang.clone(parent.error), theme.error);
						}
						if(theme.focus){
							theme.focus = lang.mixin(lang.clone(parent.focus), theme.focus);
						}
						if(theme.hover){
							theme.hover = lang.mixin(lang.clone(parent.hover), theme.hover);
						}
						if(theme.checked){
							theme.checked = lang.mixin(lang.clone(parent.checked), theme.checked);
						}

						categories[category][id] = theme

					} else {
						console.warn("Theme " + id +" extends not exiting theme "+ theme._extends);
					}
				}
			}


			this.render(categories)
		},



		setDefaultValues (box){
			if(box){

				if(box.w === "$screenwidth"){
					box.w = this.screenWidth;
				}
				if(box.w === "$25%"){
					box.w = Math.round(this.screenWidth * 0.25);
				}
				if(box.w === "$33%"){
					box.w = Math.round(this.screenWidth * 0.33);
				}
				if(box.w === "$50%"){
					box.w = Math.round(this.screenWidth * 0.5);
				}
				if(box.w === "$66%"){
					box.w = Math.round(this.screenWidth * 0.66);
				}
				if(box.w === "$75%"){
					box.w = Math.round(this.screenWidth * 0.75);
				}
				if(box.w === "$80%"){
					box.w = Math.round(this.screenWidth * 0.80);
				}
				if(box.w === "$90%"){
					box.w = Math.round(this.screenWidth * 0.9);
				}

				if(box.w === "$100%"){
					box.w = Math.round(this.screenWidth);
				}

				if(box.h === "$screenheight"){
					box.h = this.screenHeight;
				}
				if(box.h === "$25%"){
					box.h = Math.round(this.screenHeight *0.25);
				}
				if(box.h === "$33%"){
					box.h = Math.round(this.screenHeight * 0.33);
				}
				if(box.h === "$50%"){
					box.h = Math.round(this.screenHeight * 0.5);
				}
				if(box.h === "$66%"){
					box.h = Math.round(this.screenHeight *0.66);
				}
				if(box.h === "$75%"){
					box.h = Math.round(this.screenHeight * 0.75);
				}
				if(box.h === "$80%"){
					box.h = Math.round(this.screenHeight * 0.80);
				}
				if(box.h === "$90%"){
					box.h = Math.round(this.screenHeight * 0.9);
				}
				if(box.h === "$100%"){
					box.h = Math.round(this.screenHeight);
				}


				if (box.children){
					for (let i = 0; i < box.children.length; i++){
						this.setDefaultValues(box.children[i]);
					}
				}

				if (box.screens) {
					for (let id in box.screens){
						this.setDefaultValues(box.screens[id]);
					}
				}

				if (box.widgets) {
					for (let id in box.widgets){
						this.setDefaultValues(box.widgets[id]);
					}
				}
			}

		},

		render (categories){
			this.categories = categories;
			/**
			 * first sort and pr
			 */
			const db = new DomBuilder();
			this._lis = {};
			const ul = db.ul("").build();
			const cats = this.categoriesList;
			for (let i=0; i< cats.length; i++){
				const category = cats[i];
				const li = db.li().build(ul);
				let label = category;
				if(this.categoryNames[label]){
					label = this.categoryNames[label];
				}
				db.a("", label).build(li);
				this._lis[category] = li;
				this.own(on(li, touch.press, lang.hitch(this, "showCategory", category, true) ));
			}


			/**
			 * 3th installation specific components
			 */
			const sharedLibs = Services.getConfig().sharedLibs
			if (sharedLibs) {
				let importApps = sharedLibs.split(',')
				importApps.forEach(appHash => {
					const sharedLi = db.li().build(ul);
					const a = db.a("", "importing...").build(sharedLi);
					this._lis[appHash] = sharedLi;
					Services.getModelService().findAppByHash(appHash).then(app => {
						this.own(on(sharedLi, touch.press, lang.hitch(this, "showImportedApp", app.id, true) ));
						this.onImportedLoaded(app, a, '')
					}).catch (err => {
						a.innerHTML = 'Could not load...'
						console.debug('Createbutton.render() >  Cannot import app', appHash, err)
					})
				})
			}

			/**
			 * 4rd icons
			 */
			if (this.model.version >= 5) {
				const liSVGIcons = db.li().build(ul);
				db.a("", "Icons").build(liSVGIcons);
				this._lis["SVGIcons"] = liSVGIcons;
				this.own(on(liSVGIcons, touch.press, lang.hitch(this, "showSVGIcons", true) ));
			} else {
				const liIcons = db.li().build(ul);
				db.a("", "Icons").build(liIcons);
				this._lis["Icons"] = liIcons;
				this.own(on(liIcons, touch.press, lang.hitch(this, "showIcons", true) ));
			}
		
		
			/**
			 * 5rd templates
			 */
			const liTemplates = db.li().build(ul);
			db.a("", "My Components").build(liTemplates);
			this._lis["Template"] = liTemplates;
			this.own(on(liTemplates, touch.press, lang.hitch(this, "showTemplates", true) ));

		

			/**
			 * 6th Imports
			 */
			if (this.model.imports) {
				this.model.imports.forEach(appID => {
					/**
					 * It could happen that the user does not have access
					 */
					let importedApp = this.importableApps.find(a => a.id === appID)
					if (importedApp) {
						const liImport = db.li().build(ul);
						let a = db.a("", "importing...").build(liImport);
						this._lis[appID] = liImport;
						this.own(on(liImport, touch.press, lang.hitch(this, "showImportedApp", appID, true) ));
						Services.getModelService().findApp(appID).then(app => {
							this.onImportedLoaded(app, a)
						}).catch (err => {
							console.debug('Createbutton.render() > Cannot import app', appID, err)
						})
					} else {
						console.warn('Createbutton.render() > render() No access to ', appID)
					}
				})
			}
		
			const li = db.li("MatcMarginTop").build(ul);
			db.a("", "Import").build(li);
			this._lis["Import"] = li;
			this.own(on(li, touch.press, lang.hitch(this, "showImportSection") ));

			this.leftCntr.innerHTML = ""
			this.leftCntr.appendChild(ul);

			this.scroller = this.$new(ScrollContainer);
			this.scroller.placeAt(this.rightCntr);

			this.iconCntr = db.div("").build();
			this.scroller.wrap(this.iconCntr);


			this.showCategory(this.selectedCategory);
		},

		async showImportSection (e){
			this.stopEvent(e)
			this.tab = 'import'

			this._tempImports = {}

			let apps = this.importableApps.filter(app => app.name).sort((a,b) => {
				if (a.name && b.name) {
					return a.name.localeCompare(b.name)
				}
			})

			const db = new DomBuilder();
			const cntr = db.div('MatcCreateImportCntr').build()

			apps.forEach(app => {
				if (app.id != this.model.id) {
					let row = db.div().build(cntr)
					let chkBox = this.$new(CheckBox)
					chkBox.setLabel(app.name)
					chkBox.placeAt(row)
					chkBox.on('change', selected => {
						this._tempImports[app.id] = selected
					});
					if (this.model.imports) {
						if (this.model.imports.indexOf(app.id) >= 0) {
							chkBox.setValue(true)
							this._tempImports[app.id] = true
						}
					}
				}
			})

			this.importCntr.innerHTML = ''
			this.importCntr.appendChild(cntr)
		},

		onImportedLoaded (app, li, postfix = ' *') {
			this.setTextContent(li, app.name +  postfix)
			this._importedApps[app.id] = app
			let elements = Services.getSymbolService().convertAppToSymbols(app)
			if (this.categories){
				let dict = {}
				elements.forEach(e => {
					dict[e.id] = e
				})
				this.categories[app.id] = dict
			} else {
				console.warn('onImportedLoaded() No Categories')
			}
		},

		onSaveImports () {
			let imports = []
			for (let appID in this._tempImports){
				if (this._tempImports[appID]) {
					imports.push(appID)
				}
			}
			this.emit('importsChange', imports)
		},

		updateImports () {
			// ToDo: If we unimport something, this might leave some
			// of the old categories in. We should cleap that up...
			this.showWidgets()
			this.rightCntr.innerHTML="";
			this.render(this.categories)
		},

		showImportedApp (appID) {
			console.debug('showImportedApp', appID, this._importedApps[appID])
			if (this._importedApps[appID]) {
				this.showCategory(appID, true)
			} else {
				console.warn('showImportedApp() App not loaded')
			}
		},

		async showWidgets () {
			this.tab = 'widgets'
		},

		showCategory (category, resetSearch){
			this.showWidgets()
			if(resetSearch){
				this.resetSearch();
			}
			this.selectedCategory = category;
			this.renderSelectedTab(this.selectedCategory);
			this.renderCategory(this.selectedCategory);
		},

		showIcons (resetSearch){
			this.showWidgets()
			if(resetSearch){
				this.resetSearch();
			}
			this.selectedCategory = 'Icons';
			this.renderSelectedTab(this.selectedCategory);
			this.renderIcons();
		},

		showSVGIcons (resetSearch) {
			this.showWidgets()
			if(resetSearch){
				this.resetSearch();
			}
			this.selectedCategory = 'SVGIcons';
			this.renderSelectedTab(this.selectedCategory);
			this.renderSVGIcons();
		},

		showTemplates (resetSearch){
			this.showWidgets()
			if(resetSearch){
				this.resetSearch();
			}
			this.selectedCategory = 'Template';
			this.renderSelectedTab(this.selectedCategory);
			this.renderTemplates();
		},


		renderSelectedTab (category){
			for(var cat in this._lis){
				css.remove(	this._lis[cat], "MatcSelected");
			}
			if(this._lis[category]){
				css.add(this._lis[category], "MatcSelected");
			}
		},

		renderSVGIcons (query) {
			this.renderFactory.cleanUp();

			if (!query) {
				this.cleanUpTempListener();
			}

			const db = new DomBuilder();
			const cntr = db.div("MatcDateSectionIconCntr MatcDateSectionSVGIconCntr", "").build();
			let icons = this.svgIcons;

			if (query && query.length > 1) {
				let temp = {}
				for (let icon in icons) {
					if (icon.indexOf(query) >=0) {
						temp[icon] = icons[icon]
					}
				}
				icons = temp
			}
			for (let icon in icons) {		
				let span = db.span("MatcToolbarDropDownButtonItem mdi").build(cntr);
				span.setAttribute("data-matc-icon", icon);

				const wrapper = db.span('').build(span)
				wrapper.innerHTML  = wrapIcon(icons[icon])
				this.tempOwn(on(span, touch.press, lang.hitch(this, "onCreateSVGIcon", icon)));
			}

			if (!query) {
				this.iconCntr.innerHTML="";
			}
			this.iconCntr.appendChild(cntr);
		},

		renderIcons (query){
			this.renderFactory.cleanUp();

			if (!query) {
				this.cleanUpTempListener();
			}
			const db = new DomBuilder();
			const cntr = db.div("MatcDateSectionIconCntr", "").build();
			let icons = this.icons;

			if (query && query.length > 1) {
				let temp = []
				for (let j = 0; j < icons.length; j++) {
					let icon = icons[j];
					if (icon.indexOf(query) >=0) {
						temp.push(icon)
					}
				}
				icons = temp
			}
			for (let j = 0; j < icons.length; j++) {
				let icon = icons[j];
				let span = db.span("MatcToolbarDropDownButtonItem mdi mdi-"+icons[j]).build(cntr);
				span.setAttribute("data-matc-icon", icons[j]);
				this.tempOwn(on(span, touch.press, lang.hitch(this, "onCreateIcon", icon)));
			}
			if (!query) {
				this.iconCntr.innerHTML="";
			}
			this.iconCntr.appendChild(cntr);
		},

		onCreateIcon (icon, e){
			this.stopEvent(e);

			const value = {
				"id" : "Icon",
				"type" : "Icon",
				"category" : "Icons",
				"subcategory" : "Image",
				"_type" : "Widget",
				"name" : "Icon",
				"x" : 0,
				"y" : 0,
				"w" : 40,
				"h" : 40,
				"z" : 0,
				"props" : {},
				"has" : {
					"onclick" : true,
					"data" : true
				},
				"actions" : {},
				"style" : {
					"borderTopRightRadius" : 0,
					"borderTopLeftRadius" : 0,
					"borderBottomRightRadius" : 0,
					"borderBottomLeftRadius" : 0,
					"borderTopWidth" : 0,
					"borderBottomWidth" : 0,
					"borderRightWidth" : 0,
					"borderLeftWidth" : 0,
					"borderTopColor" : "#333333",
					"borderBottomColor" : "#333333",
					"borderRightColor" : "#333333",
					"borderLeftColor" : "#333333",
					"color" : "#333333",
					"icon" : "mdi mdi-"+icon
				}
			};
			//this.model.lastCategory = "Icons";
			this.hideDropDown();
			this.emit("change", value ,e);
		},

		onCreateSVGIcon (icon, e){
			this.stopEvent(e);

			var value = {
				"id" : "Icon",
				"type" : "SVGIcon",
				"category" : "Icons",
				"subcategory" : "Image",
				"_type" : "Widget",
				"name" : "Icon",
				"x" : 0,
				"y" : 0,
				"w" : 40,
				"h" : 40,
				"z" : 0,
				"props" : {
					"svg": this.svgIcons[icon] 
				},
				"has" : {
					"onclick" : true,
					"data" : true
				},
				"actions" : {},
				"style" : {
					"color" : "#333333",
					"strokeWidth": 1,
					"backgroundImageRotation": 0
				}
			};
			//this.model.lastCategory = "Icons";
			this.hideDropDown();
			this.emit("change", value ,e);
		},

		renderImportedApp (app) {
			let elements = Services.getSymbolService().convertAppToSymbols(app)
			this.renderElements(elements, app.id, false);
		},

		renderTemplates (){

			const elements = [];
			if(this.model && this.model.templates){
				for(let tid in this.model.templates){
					let template = this.model.templates[tid];

					if(template.visible){
						/**
						 * copy object and add meta data for correct dispatch
						 */
						template = lang.clone(template);
						template._type = template.templateType;
						template._isTemplate = true;
						/**
						 * Since 4.0 we have to inline also the deisgn tokens
						 */
						ModelUtil.inlineBoxDesignToken(template, this.model)
						elements.push(template);
					}

				}
			}

			this.renderElements(elements, 'Template', true);

		},

		renderCategory (category){

			var children = this.categories[category];
			var elements = [];
			for(var id in children){
				var child = children[id];
				elements.push(child);
			}

			this.renderElements(elements, category, false);

		},

		renderSearchResult (query){
			//css.remove(this.searchRemoveBtn, "hidden");
			var elements = [];
			for(var cat in this.categories){
				var children  = this.categories[cat];
				for(var id in children){
					var child = children[id];
					if(child.name && child.name.toLowerCase().indexOf(query) >=0){
						elements.push(child);
					}
				}
			}
			this.renderSelectedTab();
			this.renderElements(elements, "search", false);
			if (this.model.version >= 5) {
				this.renderSVGIcons(query)
			} else {
				this.renderIcons(query)	
			}
		},



		renderElements (elements, category, isTemplate, append){
			this._visibleElements = elements
			elements.sort((a,b) => {
				if (a.subcategory && b.subcategory){
					if(a.subcategory == b.subcategory){
						return a.name.localeCompare(b.name);
					}
					return a.subcategory.localeCompare(b.subcategory);
				}
				return a.name.localeCompare(b.name);
			})

			this.renderFactory.cleanUp();
			this.cleanUpTempListener();


			var db = new DomBuilder();
		
			var cntr = db.div().build();

			if(elements.length === 0){
				if(isTemplate){
					/**
					 * This case should only happen for templates. Therefore we will have specific message here
					 */
					db.span("MatcHint","No symbols defined. To create a symbol, select a widget and click 'Create Component' in the toolbar!").build(cntr);
				} else if(this.searchQuery){
					db.span("MatcHint","No elements match the search query").build(cntr);
				}

			} else {

				for (let i =0; i < elements.length; i++) {
					let child = elements[i];
					let size = this._getPreviewSize(child);

					let div = db.div("MatcCreateBtnElement MatcToolbarDropDownButtonItem").build(cntr);
					if (elements.length === 1) {
						css.add(div, 'MatcCreateBtnElementSelected')
					}

					let preview = db.div("MatcCreateBtnElementPreview").build(div);
					css.add(preview, child.category);
					domStyle.set(preview, {
						"width" :  size.w + "px",
						"height" : size.h + "px",
					});

					if (child.type === "ScreenAndWidget") {
						this.renderScreenAndWidget(child, preview, db, size, isTemplate, div)
					} else if(child.type != "Group"){
						this.renderWidget(child, preview, db, size, isTemplate, div);
					} else {
						this.renderGroup(child, preview, db, size, isTemplate, div);
					}

					/**
					 * FIXME: For templates make inline edit someday to change name
					 */
					var lbl = db.div("MatcCreateBtnElementLabel",this.formatString(child.name, 18)).build(div);
					lbl.style.width = size.w + "px";

					if (isTemplate) {
						let delBtn = db.div("MatcCreateBtnRemove  mdi mdi-close-circle").build(div)
						this.tempOwn(on(delBtn, touch.press, lang.hitch(this, "onRemoveTemplate", child)));
					}
				}
			}

			if(!append){
				this.iconCntr.innerHTML="";
			}

			this.iconCntr.appendChild(cntr);

		},

		renderScreenAndWidget (app, preview, db, size, isTemplate, elementDiv){
	
			this.tempOwn(on(elementDiv, touch.press, lang.hitch(this, "onCreate", app)));

			// FIXME: Somehow scale to model minscreen size??
		
			let screens = Object.values(app.screens)
			if (screens.length === 1) {
				let screen = screens[0]

				let scale = this.getScale(size, "auto", screen)
				scale.x = Math.min(1, scale.x)
				scale.y = Math.min(1, scale.y)
		
				let scalledScreen = this._getScalledChild(screen, size);
				let centeredBox = this._createCenteredBox(db, preview, scalledScreen, size);

				/**
				 * Create screen box
				 */
				let screenBox = db.div("MatcBox").build(centeredBox);
				domStyle.set(screenBox, {
					"width" :  (scalledScreen.w) + "px",
					"height" : (scalledScreen.h) + "px",
					"top": "0px",
					"left": "0px",
				});
				this.renderFactory.setStyle(screenBox, screen);

				/**
				 * render children
				 */
				const children = screen.children;
				for (let i=0; i< children.length; i++) {
					let childID = children[i]
					let widget = app.widgets[childID]
					if (widget) {
						let child = lang.clone(widget);
						this.renderChildWidget(child, scale, screen, screenBox, db, i)
					} else {
						console.debug("CreateButton.renderScreenAndWidget() > No widget with id", childID);
					}
				}
			}
		},

		renderChildWidget (child, scale, parent, parentDiv, db, i) {
			child.w *= scale.x;
			child.x *= scale.x;
			child.h *= scale.y;
			child.y *= scale.y;
			try{
				child.id = parent.id +"_" + i;
				const widgetBox = db.div("MatcBox").build(parentDiv);
				domStyle.set(widgetBox, {
					"width" :  Math.round(child.w) + "px",
					"height" : Math.round(child.h) + "px",
					"top" : (child.y) + "px",
					"left" : (child.x) + "px",
				});
				this.renderFactory.createWidgetHTML(widgetBox, child);
			} catch(e){
				console.error("CreateButton.renderChildWidget() > Error", e);
			}
		},


		renderGroup (group, preview, db, size, isTemplate, elementDiv){
			/**
			 * template groups are rendered differently
			 */
			if (isTemplate){

				this.tempOwn(on(elementDiv, touch.press, lang.hitch(this, "onCreate", group)));

				/**
				 * bounding box is primary
				 */
				let child = this.getBoundingBox(group.children);
				let scale = this.getScale(size, "auto", child)
				child = this._getScalledChild(child, size);
				child.h -= 10;
				child.w -= 10;
				let box = this._createCenteredBox(db, preview, child, size);

				/**
				 * now render group
				 */
				let children = this.getTemplateGroupOrderChildren(group);	
				for (let i=0; i< children.length; i++){
					let templateChild = lang.clone(children[i]);
					/**
					 * Since 4.0.60 we need to inline templates
					 */
					templateChild = ModelUtil.inlineTemplateVariant(templateChild, this.model)
					this.renderChildWidget(templateChild, scale, group, box, db, i)
				}
			} else {

				this.tempOwn(on(elementDiv, touch.press, lang.hitch(this, "onCreate", group)));

				const bbbox = this.getBoundingBoxByBoxes(group.children);
				const scale = this.getScale(size, "auto", bbbox)
				scale.x = Math.min(1, scale.x)
				scale.y = Math.min(1, scale.y)

				const scaledBbox = this._getScalledChild(bbbox, size);
				const box = this._createCenteredBox(db, preview, scaledBbox, size);

				const children = group.children;
				for (let i=0; i< children.length; i++){
					const groupChild = lang.clone(children[i]);
					this.renderChildWidget(groupChild, scale, group, box, db, i)
				}
			}
		},

		renderWidget (child, preview, db, size, isTemplate, elementDiv){
			this.tempOwn(on(elementDiv, touch.press, lang.hitch(this, "onCreate", child)));
			child = this._getScalledChild(child, size);
			const box = this._createCenteredBox(db, preview, child, size);
			try {
				this.renderFactory.createWidgetHTML(box, child);
			} catch (e) {
				console.error('CreateButton.renderWidget() > Error', child)
				console.error(e)
			}
		},

		_getScalledChild (child, size){
			/**
			 * check if we have to use the preview
			 */
			if(child._preview){
				child = child._preview;
			}

			/**
			 * check if we have to scale
			 */
			if(child.w > size.w || child.h > size.h){
				const scale = this.getScale(size, "auto", child)
				this.renderFactory.setScaleFactor(scale.x,scale.y);
				child = this.getZoomedBox(lang.clone(child),scale.x, scale.y) ;
			} else {
				this.renderFactory.setScaleFactor(1,1);
			}

			//this.renderFactory.setScaleFactor(1,1);
			return child;
		},


		_createCenteredBox (db, preview, child, size){

			/**
			 * render centered box
			 */
			var box = db.div("MatcBox").build(preview);
			var left = (size.w - child.w)/2;
			var top = (size.h - child.h)/2;
			domStyle.set(box, {
				"width" :  child.w + "px",
				"height" : child.h + "px",
				"top" : top + "px",
				"left" : left + "px",
			});

			return box;
		},

		onRemoveTemplate (template, e) {
			this.stopEvent(e);
			//this.hideDropDown();
			this.emit("removeTemplate", template ,e);
			setTimeout(() => {
				this.showTemplates()
			}, 100)
			
		},

		onCreate (child,e){
			this.stopEvent(e);
			var value = lang.clone(child);
			if(child.category){
				this.model.lastCategory = child.category;
			}  else {
				this.model.lastCategory = "WireFrame"
			}
			this.hideDropDown();
			this.emit("change", value ,e);
		},

		_getPreviewSize (child){
			if (child._previewSize) {
				return child._previewSize
			}
			let type = child.type
			if(this.previewSizes[type]){
				return this.previewSizes[type];
			}
			return this.previewSizes["default"];
		},

		highlight (){
			var parent = this.domNode.parentNode;
			if(parent){
				css.add(parent, "MatcCreateHighlight");

				setTimeout(function(){
					css.remove(parent, "MatcCreateHighlight");
				},400);

				setTimeout(function(){
					css.add(parent, "MatcCreateHighlight");
				},800);

				setTimeout(function(){
					css.remove(parent, "MatcCreateHighlight");
				},1200);

				setTimeout(function(){
					css.add(parent, "MatcCreateHighlight");
				},1600);

				setTimeout(function(){
					css.remove(parent, "MatcCreateHighlight");
				},2000);
			}

		}
    },
    mounted () {
		this.addTooltip(this.$el, this.getNLS("tooltip.widget"))
    }
}
</script>