
<template>
     <div class="MatcToolbar MatcAnalyticsToolbar">
<!-- 
		<div class="MatcToobarLeft MatcAnalyticsToolbarTestCntr MatcToobarPropertiesSection" data-dojo-attach-point="testListCntr">

		</div> -->

		<div class="MatcToolbarTop ">
			<div class=" MatcToobarHomeSection MatcToobarItemBig" data-dojo-attach-point="home"></div>

			<div class="MatcToolbarTopCntr" >

				<div class="MatcToolbarTopLeftCntr" data-dojo-attach-point="screenSection">
				</div>

				<div class="MatcToolbarNotificationSection MatcToolbarSection" data-dojo-attach-point="notificationSection">
					<ToolbarPluginSection :events="events" :user="user" :mode="model" />
					<ViewConfig :value="canvasViewConfig" @change="onChangeCanvasViewConfig" :analytic="true"/>
					<HelpButton :hasNotifications="false" :hasToolbar="true" ref="helpBtn"/>
				</div>

				<div class="MatcToobarSignUpSection MatcToolbarSection MatcToolbarSectionHidden" data-dojo-attach-point="signupSection">
					<a class="MatcToolbarItem MatcToolbarIconNoSmooth" data-dojo-attach-point="saveButton">
						<span class="MatcToolbarLabel">Sign Up For Free</span>
					</a>
				</div>
			</div>
		</div>

		<div class="MatcToobarPropertiesSection MatcToolbarSectionHidden" data-dojo-attach-point="propertiesCntr">
		</div>

		<div class=" MatcToobarCommentSection MatcToolbarSection">
			<a class="MatcToolbarItem" data-dojo-attach-point="commentBtn">
				<span class="mdi mdi-comment-outline"></span>
			</a>
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
import _Color from 'common/_Color'

import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import ScrollContainer from 'common/ScrollContainer'
import Dialog from 'common/Dialog'
import _Tooltip from 'common/_Tooltip'
import CheckBox from 'common/CheckBox'
import RadioBoxList from 'common/RadioBoxList'
import Form from 'common/Form'
import ToolbarDropDownButton from 'canvas/toolbar/components/ToolbarDropDownButton'
import ToolbarColor from 'canvas/toolbar/components/ToolbarColor'
import Ring from 'common/Ring'
import Histogram from 'dash/Histogram'
import Analytics from 'dash/Analytics'
import VideoPlayer from 'views/apps/test/VideoPlayer'
import DataFrame from 'common/DataFrame'
import ViewConfig from 'canvas/toolbar/components/ViewConfig'
import ToolbarPluginSection from '../../plugins/ToolbarPluginSection'
import HelpButton from 'help/HelpButton'


export default {
    name: 'AnalyticToolbar',
    mixins:[Util,_Color,  _Tooltip, DojoWidget],
    data: function () {
        return {
			events: null,
			model: null,
			user: null,
			value: false,
			analyticMode: "HeatmapClick",
			analyticHeatMapClicks: -1,
			canvasViewConfig: {}
        }
    },
    components: {
			'ViewConfig': ViewConfig,
			'HelpButton': HelpButton,
			'ToolbarPluginSection': ToolbarPluginSection
		},
    methods: {
        postCreate(){
			this.logger = new Logger("AnalyticToolbar");
			this.logger.log(2,"constructor", "entry");

			this.own(on(this.commentBtn, touch.press, lang.hitch(this, "onNewComment")));
			this.own(on(this.signupSection, touch.press, lang.hitch(this, "showSignUpDialog")));


			var btn = this.$new(ToolbarDropDownButton, {arrowPosition:false});
			btn.updateLabel = false;
			btn.setLabel('<span class="mdi mdi-menu"></span>');
			btn.setOptions([
				{label :"Settings", callback:lang.hitch(this, "onShowSettings")},
				{css:"MatcToolbarPopUpLine"},
				{label :"Exit", callback:lang.hitch(this, "onExit")},
			]);
			btn.setValue(this.analyticMode);
			btn.placeAt(this.home);

			css.add(btn.domNode, "MatcToolbarItem");
			this.renderToolbar()
		},

		showHelpDialog(helpID){
			if (this.$refs.helpBtn) {
				this.$refs.helpBtn.show('analytics.canvas', helpID)
			}
		},

		onNewComment(e){
			this.logger.log(2,"onNewComment", "entry");
			this.stopEvent(e);
			this.emit("newComment", {"type" : "comment", "event" : e});
		},

		setAnalyticMode(mode, params){
			this.logger.log(2,"setAnalyticMode", "entry > mode: " + mode);
			this.analyticMode = mode;
			if(this.canvas){
				this.canvas.setAnalyticMode(mode, params);
			}
			this.hideProperties();
		},

		setModelService (s) {
			this.modelService = s
			setTimeout(lang.hitch(this, "initMouseData"), 500);
		},

		setPublic(p){
			this.isPublic = p;
			if(p){
				// css.remove(this.signupSection, "MatcToolbarSectionHidden");
			}
		},

		setCanvasViewConfig (viewConfig) {
			this.canvasViewConfig = viewConfig
		},

		onChangeCanvasViewConfig (key, value) {
			if (this.canvas) {
				this.canvas.setCanvasViewConfig(key, value)
			}
		},

		setUser(u) {
			this.user = u
		},

		async initMouseData(){
			this.logger.log(2,"initMouseData", "entry");
			if(this.isPublic){
				//this._doGet("/examples/mouse/" + this.model.id + ".json", lang.hitch(this,"setMouseData"));
				let res = await this.modelService.findPublicMouse(this.model.id)
				this.setMouseData(res)
			} else {
				let res = await this.modelService.findMouse(this.model.id)
				this.setMouseData(res)
				//this._doGet("rest/mouse/" + this.model.id + ".json", lang.hitch(this,"setMouseData"));
			}
		},

		setMouseData(data){
			this.logger.log(2,"setMouseData", "entry >"  +data.length);
			this.mouseData = data;
		},


		/**********************************************************************
		 * Callbacks to canvas
		 **********************************************************************/


		showClickHeatMap(){
			this.logger.log(2,"showClickHeatMap", "entry > " + this.analyticHeatMapClicks);
			this.setSelectedViewButton(this.viewBtnClickMap);
			this.setAnalyticMode("HeatmapClick", {numberOfClicks : this.analyticHeatMapClicks} );
			this.showHeatMapProperties();
		},

		reShowClickHeatMap () {
			this.logger.log(0,"reShowClickHeatMap", "entry > " + this.analyticHeatMapClicks);
			this.hideAllSections()
			this.showHeatMapProperties();
		},

		showFirstClickHeatMap(i){
			this.logger.log(0,"showFirstClickHeatMap", "entry > "+ i);
			this.analyticHeatMapClicks = i;
			this.setHeatMapLabel(i)
			this.setAnalyticMode("HeatmapClick",{numberOfClicks : this.analyticHeatMapClicks} );
		},

		showMouseHeatMap(){
			this.logger.log(2,"showMouseHeatMap", "entry");
			this.setSelectedViewButton(this.viewBtnMouseMap);

			if(!this.mouseData){
				this.canvas.showHint("Loading data...");
				if(this.isPublic){
					this._doGet("/examples/mouse/" + this.model.id + ".json", lang.hitch(this,"_onMouseDataLoaded"))
				} else {
					this._doGet("rest/mouse/" + this.model.id + ".json", lang.hitch(this,"_onMouseDataLoaded"))
				}
			} else {
				this.canvas.setMouseData(this.mouseData);
				this.setAnalyticMode("HeatmapMouse");
			}

		},


		_onMouseDataLoaded(data){
			this.logger.log(2,"_onMouseDataLoaded", "entry >"  +data.length);
			this.mouseData = data;
			this.canvas.setMouseData(this.mouseData);
			this.setAnalyticMode("HeatmapMouse");
		},

		showScrollHeatMap(){
			this.logger.log(2,"showScrollHeatMap", "entry");
			this.setSelectedViewButton(this.viewBtnScrollMap);
			this.setAnalyticMode("HeatmapScrollView");
		},

		showDwelTimeMap(){
			this.logger.log(2,"showDwelTimeMap", "entry");
			this.setSelectedViewButton(this.viewBtnDwellTime);
			this.setAnalyticMode("HeatmapDwelTime");
		},


		showDiscoveryTimeMap(){
			this.logger.log(2,"showDwelTimeMap", "entry");
			this.setSelectedViewButton(this.viewBtnDiscoveryTime);
			this.setAnalyticMode("HeatmapDiscoryTime");

		},

		showScrollTimeMap(){
			this.logger.log(2,"showScrollHeatMap", "entry");
			this.setSelectedViewButton(this.viewBtnScrollTime);
			this.setAnalyticMode("HeatmapScrollTime");
		},

		showViewMap(){
			this.logger.log(2,"showViewMap", "entry");
			this.setSelectedViewButton(this.viewBtnView);
			this.setAnalyticMode("HeatmapViews");
		},

		showDropOff () {
			this.logger.log(-1,"showDropOff", "entry");
			this.setSelectedViewButton(this.viewBtnDropOff);
			this.showDropOffProperties()
		},

		showUserJourney(){
			this.logger.log(-1,"showUserJourney", "entry > ");
			this.setSelectedViewButton(this.viewBtnClickStream);

			const sessions = {};
			for(var id in this.sessionCheckBoxes){
				sessions[id] = this.sessionCheckBoxes[id].getValue();
			}
			const params = {
				sessions:sessions,
				time: this.sessionTimeCheckBox.getValue(),
				color : this.sessionLineColor.getValue(),
				tree: this.sessionTreeCheckBox.getValue(),
				task: this.sessionTaskBtn.getValue(),
				taskColor: this.sessionTaskLineColor.getValue(),
				outlier: this.sessionOutlierCheckbox.getValue(),
				outlierColor: this.sessionOutlierColor.getValue()
			};
			this.setAnalyticMode("UserJourney",params );
			this.showSessionProperties();
		},

		showGestureMap(){
			this.logger.log(2,"showGestureMap", "entry > ");
			this.setSelectedViewButton(this.viewBtnGesture);

			var params = {
				color: this.gestureLineColor.getValue()
			};

			this.setAnalyticMode("Gesture", params);
			this.showGestureProperties();


		},


		/**********************************************************************
		 * Rending stuff
		 **********************************************************************/

		renderToolbar(){
			this.logger.log(3,"renderToolbar", "enter");

			if (this.isRendered) {
				return
			}
			this.viewBtns = [];
			this.isRendered = true

			/**
			 * Views per screens
			 */
			this.viewBtnClickMap = this.createToolBarItem('Click Heatmap', "showClickHeatMap", "mdi mdi-cursor-default",this.screenSection);
			this.viewBtns.push(this.viewBtnClickMap);
			this.addTooltip(this.viewBtnClickMap, "Where did the users click?");

			this.viewBtnMouseMap = this.createToolBarItem('Mouse Heatmap', "showMouseHeatMap", "mdi mdi-mouse",this.screenSection);
			this.viewBtns.push(this.viewBtnMouseMap);
			this.addTooltip(this.viewBtnMouseMap, "Howlong was cursor at some place?");

			//this.viewBtnGesture = this.createToolBarItem('Gestures', "showGestureMap", "mdi mdi-cursor-pointer",this.screenSection);
			//this.viewBtns.push(this.viewBtnGesture);
			//this.addTooltip(this.viewBtnGesture, "Which gestures were done?");

			this.viewBtnClickStream = this.createToolBarItem("User Journey", "showUserJourney", "mdi mdi-vector-polyline",this.screenSection);
			this.viewBtns.push(this.viewBtnClickStream);
			this.addTooltip(this.viewBtnClickStream, "See where the users have clicked in one session.");

			this.viewBtnDropOff = this.createToolBarItem("Tasks & Drop Off", "showDropOff", "mdi mdi-chart-timeline-variant-shimmer",this.screenSection);
			this.viewBtns.push(this.viewBtnDropOff);
			this.addTooltip(this.viewBtnDropOff, "See whre users dropped of when performing tasks.");

			/**
			 * Global Distributions
			 */
			this.viewBtnView = this.createToolBarItem("Views", "showViewMap", "mdi mdi-eye",this.screenSection);
			this.viewBtns.push(this.viewBtnView);
			this.addTooltip(this.viewBtnView, "How often was the screen loaded");


			this.viewBtnDwellTime = this.createToolBarItem("Dwell Time", "showDwelTimeMap", "mdi mdi-timelapse",this.screenSection);
			this.viewBtns.push(this.viewBtnDwellTime);
			this.addTooltip(this.viewBtnDwellTime, "How much time have the users spend on this page in average");


			this.viewBtnScrollMap = this.createToolBarItem("Scroll Visibility", "showScrollHeatMap", "mdi mdi-swap-vertical",this.screenSection);
			this.viewBtns.push(this.viewBtnScrollMap);
			this.addTooltip(this.viewBtnScrollMap, "How often was the part of the screen visible");

			this.viewBtnScrollTime = this.createToolBarItem("Scroll Time", "showScrollTimeMap", "mdi mdi-timer",this.screenSection);
			this.viewBtns.push(this.viewBtnScrollTime);
			this.addTooltip(this.viewBtnScrollTime, "How long was the part of the screen visible");

		
			this.setSelectedViewButton(this.viewBtnClickMap);

			this.logger.log(3,"renderToolbar", "exit");
		},



		render(){
			this.logger.log(3,"render", "entry");

			this.properties = document.createElement("div");
			css.add(this.properties, "MatcToobarPropertiesSectionCntr")

			this.sections = [];

			this.propertiesStates = {};

			this.renderScreenProperties();

			this.renderWidgetProperties();

			this.renderSessionProperties();

			this.renderDropOffProperties()

			this.renderHeatMapProperties();

			this.renderGestureProperties();

			this.propertiesCntr.appendChild(this.properties);


			/**
			 * Now assemble final ui. hook in properties panel and make toolSection Visible!
			 */
			this.scroller = this.$new(ScrollContainer);
			this.scroller.placeAt(this.propertiesCntr);
			this.scroller.wrap(this.properties, 40);

			this.hideAllSections();

			this.showHeatMapProperties();

			this.logger.log(3,"render", "exit");
		},

		renderScreenProperties(){
			this.logger.log(3,"renderScreenProperties", "entry");


			var db = new DomBuilder();
			/**
			 * Name
			 */
			this.screenNameDiv = this.createSection("Screen Name");
			var content = this.createContent(this.screenNameDiv);

			this.screenName = this.createInput(content, "Screen Name");
			this.screenName.readOnly = true;

			var ringCntr = db.div("MatcCenter").build(content);

			/**
			 * Views total
			 */
			var cntr = db.div("MatcMarginBottom").build(ringCntr)
			this.screenTestRing = this.createRing("Test Coverage", "analytics.canvas.kpi.coverage");
			this.screenTestRing.placeAt(cntr);

			/**
			 * Dwell
			 */
			cntr = db.div("MatcMarginBottom").build(ringCntr)
			this.screenDwellRing = this.createRing("Dwell Time", "analytics.canvas.kpi.dwell");
			this.screenDwellRing.placeAt(cntr);

			/**
			 * Views total
			 */
			cntr = db.div("MatcMarginBottom").build(ringCntr)
			this.screenTotalViewRing = this.createRing("Screen Views", "analytics.canvas.kpi.screen-views");
			this.screenTotalViewRing.placeAt(cntr);


			/**
			 * CLicks
			 */
			cntr = db.div("MatcMarginBottom").build(ringCntr)
			this.screenClickRing = this.createRing("Screen Clicks", "analytics.canvas.kpi.screen-clicks");
			this.screenClickRing.placeAt(cntr);


			/**
			 * CLicks
			 */
			cntr = db.div("MatcMarginBottom").build(ringCntr)
			this.screenWidgetClickRing = this.createRing("Widget Clicks", "analytics.canvas.kpi.screen-widget-clicks");
			this.screenWidgetClickRing.placeAt(cntr);

		},


		renderWidgetProperties(){
			this.logger.log(3,"renderWidgetProperties", "entry");

			var db = new DomBuilder();

			/**
			 * Name
			 */
			this.widgetNameDiv = this.createSection("Widget ");
			var content = this.createContent(this.widgetNameDiv);
			this.widgetName = this.createInput(content, "Screen");
			this.widgetName.readOnly = true;
			var ringCntr = db.div("MatcCenter").build(content);

			/**
			 * CLicks
			 */
			let cntr = db.div("MatcMarginBottom").build(ringCntr)
			this.widgetClickRing = this.createRing("Widget Clicks", "analytics.canvas.kpi.clicks");
			this.widgetClickRing.placeAt(cntr);


			/**
			 * First Clicks
			 */
			cntr = db.div("MatcMarginBottom").build(ringCntr)
			this.widgetFirstClickRing = this.createRing("First Clicks", "analytics.canvas.kpi.first-clicks");
			this.widgetFirstClickRing.placeAt(cntr);

			/**
			 * Discovery
			 */
			cntr = db.div("MatcMarginBottom").build(ringCntr);
			var nodes =  this.createBigNumber(db, cntr, "Time before Click", "analytics.canvas.kpi.before-click");
			this.widgetDiscoverLabel =nodes[0];
			this.widgetDiscoverSTDLabel =nodes[1];

		},


		renderHeatMapProperties(){
			this.logger.log(1,"renderHeatMapProperties", "entry");

			var db = new DomBuilder();

			this.heatmapDiv = this.createSection("Heatmap");

			let content = this.createContent(this.heatmapDiv);

			var row = db.div("MatcToobarRow MatcMarginBottom").build(content);

			var list = this.$new(RadioBoxList);
			css.add(list.domNode, "MatcToolbarRadioList");
			list.setOptions([
				{"value" : -1,label : "All Clicks"},
				{"value" : 1, label : "First Click"},
				{"value" : 3, label : "First three Clicks"},
				{"value" : "missedClicks", label : "Missed Clicks"}
			]);
			list.placeAt(db.div().build(row));
			this.own(list.on("change", lang.hitch(this, "showFirstClickHeatMap")));


			this.heatmapLabel = db.div('MatcToobarRow').label('MatcToolbarLabel MatcToolbarHelpSection').build(content)

			this.heatmapClickList = list;
			this.setHeatMapLabel(-1)
		},

		setHeatMapLabel (i) {
			let lbl = ''
			if (i === -1) {
				lbl = this.getNLS('analytics.canvas.heatamp.hintAll')
			}
			if (i === 1) {
				lbl = this.getNLS('analytics.canvas.heatamp.hintFirst')
			}
			if (i === 3) {
				lbl = this.getNLS('analytics.canvas.heatamp.hintFirstThree')
			}
			if (i === 'missedClicks') {
				lbl = this.getNLS('analytics.canvas.heatamp.hintMissed')
			}
			this.heatmapLabel.textContent = lbl
		},

		renderDropOffProperties () {
			this.logger.log(2,"renderSessionProperties", "entry");

			var db = new DomBuilder();


			this.dropOffConfigDiv = this.createSection("Show");
			var content = this.createContent(this.dropOffConfigDiv);
			var row = db.div("MatcToobarRow MatcToolbarRadioList").build(content);

			this.dropOffTimeCheckBox = this.$new(RadioBoxList, {maxLabelLength:20});
			this.dropOffTimeCheckBox.setOptions([
				{value: false, label: 'Drop Off'},
				{value: true, label: 'Time'}
			]);
			this.dropOffTimeCheckBox.setValue(false);
			this.dropOffTimeCheckBox.placeAt(row);
			this.own(on(this.dropOffTimeCheckBox, "change", lang.hitch(this, "selectDropOffTask")));


			this.dropOffOptionsDiv = this.createSection("Tasks");
			content = this.createContent(this.dropOffOptionsDiv);
			row = db.div("MatcToobarRow ").build(content);


			this.dropOffTaskBtn = this.$new(RadioBoxList, {maxLabelLength:20});

			let tasks = []

			if (this.testSettings.tasks && this.testSettings.tasks.length >= 1) {
				tasks = this.testSettings.tasks.map((task,i) => {
					return {value: i, label: task.name}
				})	
			} else {
				this.dropOffOptionsLabel = db
					.span(
							"MatcToolbarLabel MatcToolbarHelpSection", 
							this.getNLS("analytics.canvas.dropoff.hintNoTasksDefined")
					)
					.build(row)
			}
			
			this.dropOffTaskBtn.setOptions(tasks);
			this.dropOffTaskBtn.setValue(0);
			css.add(this.dropOffTaskBtn.domNode ,"MatcToolbarRadioList");
			this.dropOffTaskBtn.placeAt(row);
			this.own(on(this.dropOffTaskBtn, "change", lang.hitch(this, "selectDropOffTask")));

			this.dropOffChartDivCntr = this.createSection("Insights");
			content = this.createContent(this.dropOffChartDivCntr);

			var ringCntr = db.div("MatcCenter ").build(content);
			this.dropoffTaskSuccess = this.createRing("Success", "analytics.canvas.kpi.first-clicks");
			css.add(this.dropoffTaskSuccess.domNode, 'MatcMarginBottom')
			this.dropoffTaskSuccess.placeAt(ringCntr);


			let cntr = db.div("MatcMarginBottom").build(ringCntr);
			var nodes =  this.createBigNumber(db, cntr, "Duration", "analytics.canvas.kpi.before-click");
			this.dropOffTaskDuration =nodes[0];
			this.dropOffTaskDurationLabel = nodes[1];


			cntr = db.div("MatcMarginBottom").build(ringCntr);
			nodes =  this.createBigNumber(db, cntr, "Interactions", "analytics.canvas.kpi.before-click");
			this.dropOffInteractions =nodes[0];
			this.dropOffInteractionsLabel = nodes[1];


			this.dropOffFunnelDivCntr = this.createSection("Drop Off");
			content = this.createContent(this.dropOffFunnelDivCntr);

			this.dropOffChartDiv = db.div('MatcToolbarDropOffChart', '').build(content)
		},


		renderSessionProperties(){
			this.logger.log(2,"renderSessionProperties", "entry");

			const db = new DomBuilder();

			this.sessionOptionsDiv = this.createSection("Show");
			let content = this.createContent(this.sessionOptionsDiv);

			let row = db.div("MatcToobarRow ").build(content);
			this.sessionTreeCheckBox = this.$new(CheckBox);
			css.add(this.sessionTreeCheckBox.domNode, "MatcToolbarItem");
			this.sessionTreeCheckBox.setValue(true);
			this.sessionTreeCheckBox.setLabel("Merge Graph");
			this.sessionTreeCheckBox.placeAt(row);
			this.own(on(this.sessionTreeCheckBox, "change", lang.hitch(this, "showUserJourney")));

			this.sessionOutlierCheckbox = this.$new(CheckBox);
			css.add(this.sessionOutlierCheckbox.domNode, "MatcToolbarItem");
			this.sessionOutlierCheckbox.setValue(false);
			this.sessionOutlierCheckbox.setLabel("Show Outlier");
			this.sessionOutlierCheckbox.placeAt(row);
			this.own(on(this.sessionOutlierCheckbox, "change", lang.hitch(this, "showUserJourneyOutlier")));


			this.sessionOutlierDiv = this.createSection("Colors");
		 	content = this.createContent(this.sessionOutlierDiv);
			row = db.div("MatcToobarRow ").build(content);
	
	
			this.sessionLineColor = this.$new(ToolbarColor, {updateColor :true, hasCustomColor:false, hasPicker:false});
			this.sessionLineColor.placeAt(row);
			this.sessionLineColor.setLabel('Graph');
			this.sessionLineColor.setModel(this.model);
			this.sessionLineColor.setValue("#33b5e5");
			css.add(this.sessionLineColor.domNode ,"MatcToolbarGridFull hidden");
			this.own(on(this.sessionLineColor, "change", lang.hitch(this, "showUserJourney")));

			this.sessionTaskLineColor = this.$new(ToolbarColor, {updateColor :true, hasCustomColor:false, hasPicker:false});
			this.sessionTaskLineColor.placeAt(row);
			this.sessionTaskLineColor.setLabel('Task');
			this.sessionTaskLineColor.setModel(this.model);
			this.sessionTaskLineColor.setValue("#92c500");
			css.add(this.sessionTaskLineColor.domNode ,"MatcToolbarGridFull");
			this.own(on(this.sessionTaskLineColor, "change", lang.hitch(this, "showUserJourney")));


			this.sessionOutlierColor = this.$new(ToolbarColor, {updateColor :true, hasCustomColor:false, hasPicker:false});
			this.sessionOutlierColor.placeAt(row);
			this.sessionOutlierColor.setLabel('Outlier');
			this.sessionOutlierColor.setModel(this.model);
			this.sessionOutlierColor.setValue("#ffb61c");
			css.add(this.sessionOutlierColor.domNode ,"MatcToolbarGridFull");
			this.own(on(this.sessionOutlierColor, "change", lang.hitch(this, "showUserJourney")));
		

			this.sessionShowDiv = this.createSection("Options");
			content = this.createContent(this.sessionShowDiv);
			row = db.div("MatcToobarRow MatcToolbarRadioList").build(content);
			this.sessionTimeCheckBox = this.$new(RadioBoxList, {maxLabelLength:20});
			this.sessionTimeCheckBox.setOptions([
				{value: false, label: 'Navigation'},
				{value: true, label: 'Time'}
			]);
		
			this.sessionTimeCheckBox.setValue(false);
			this.sessionTimeCheckBox.placeAt(row);
			this.own(on(this.sessionTimeCheckBox, "change", lang.hitch(this, "showUserJourney")));

	
			this.sessionTaskCntr = this.createSection("Tasks");
			content = this.createContent(this.sessionTaskCntr);

			row = db.div("MatcToobarRow ").build(content);

			var tasks = [{value:-1, label: "No Task"}];
			if (this.testSettings.tasks){
				for (let i=0; i < this.testSettings.tasks.length; i++){
					let task = this.testSettings.tasks[i];
					tasks.push({value: i, label: task.name});
				}
			}
			this.sessionTaskBtn = this.$new(RadioBoxList, {maxLabelLength:20});
			this.sessionTaskBtn.setOptions(tasks);
			this.sessionTaskBtn.setValue(-1);
			css.add(this.sessionTaskBtn.domNode ,"MatcToolbarRadioList");
			this.sessionTaskBtn.placeAt(row);
			this.own(on(this.sessionTaskBtn, "change", lang.hitch(this, "selectUserJournyTask")));

		

			this.sessionDiv = this.createSection("Tests");
			content = this.createContent(this.sessionDiv);
			css.add(content, "MatcMarginBottomXXL");


			row = db.div("MatcToobarRow").build(content);

			this.sessionOrderBrn = this.$new(ToolbarDropDownButton,{maxLabelLength:20});
			this.sessionOrderBrn.setOptions([
				{value: 'duration', label:"Sort by Duration"},
				{value: 'events', label:"Sort by Events"},
				{value: 'date', label:"Sort by Date"},
				{value: 'weirdness', label:"Sort by Outlier"}
			]);
			this.sessionOrderBrn.setPopupCss("MatcActionAnimProperties");
			this.sessionOrderBrn.updateLabel = true;
			this.sessionOrderBrn.reposition = true;
			this.sessionOrderBrn.setValue('duration')
			css.add(this.sessionOrderBrn.domNode, "MatcToolbarGridFull  MatcToolbarIconNoSmooth");
			this.sessionOrderBrn.placeAt(row);
			this.tempOwn(on(this.sessionOrderBrn, "change", (v) => {this.onSortSessionList(v)}));
			this.addTooltip(this.sessionOrderBrn.domNode, "Change the sort order of the session list");


			this.sessionListCntr = db.div("MatcToobarRow").build(content);
			this.sessionList = this._getTestList(this.events, this.annotation, this.testSettings);
			this.renderSessionList(this.sessionListCntr, this.sessionList, 'duration')


		
		},

		onSortSessionList (value) {
			this.renderSessionList(this.sessionListCntr, this.sessionList, value)
			this.selectUserJournyTask(this.sessionTaskBtn.getValue())
		},

		renderSessionList (content, list, order) {

			const db = new DomBuilder();

			content.innerHTML = ""

			this.sessionCheckBoxes = {};
			this.sessionAllCheckBox = this.$new(CheckBox);
			this.sessionAllCheckBox.setLabel("Show All");
			this.sessionAllCheckBox.setValue(true);
			css.add(this.sessionAllCheckBox.domNode, "MatcToolbarItem");
			this.sessionAllCheckBox.placeAt(db.div("MatcToobarRow").build(content));
			this.own(on(this.sessionAllCheckBox,"change", lang.hitch(this,"selectAllSessions")));

			list.sort((a, b) => {
				if (order === 'duration') {
					return b.duration - a.duration
				} 
				if (order === 'date')  {
					return a.start - b.start
				}
				if (order === 'weirdness') {
					return b.weirdness - a.weirdness
				}
				return b.size - a.size
			})
		



			for(let i=0; i < list.length; i++){
				const session = list[i];
				const row = db.div("MatcToobarRow MatcToobarRowIconCntr").build(content);

				const chk = this.$new(CheckBox);
				css.add(chk.domNode, "MatcToolbarItem");
				chk.setValue(true);
				if (order === 'duration') {
					chk.setLabel("Test " + (session.id) + " ("  + session.duration + "s )"); // + session.taskPerformance +" Tasks - "
				} 
				if (order === 'date') {
					chk.setLabel("Test " + (session.id) + " ("  + session.date + ")"); // + session.taskPerformance +" Tasks - "
				}
				if (order === 'events') {
					chk.setLabel("Test " + (session.id) + " ("  + session.size + ")"); // + session.taskPerformance +" Tasks - "
				}

				if (order === 'weirdness') {
					chk.setLabel("Test " + (session.id) + " ("  + session.weirdness + ")"); // + session.taskPerformance +" Tasks - "
				}
			
				chk.placeAt(db.div().build(row));

				this.sessionCheckBoxes[session.session] = chk;
				this.own(on(chk,"change", lang.hitch(this,"selectSession")));
				this.own(on(row, "mouseover", lang.hitch(this, "hoverSession", session)))
				this.own(on(row, "mouseout", lang.hitch(this, "hoverSession", null)))

				var play = db.div("MatcToobarRowRightIcon").span("mdi mdi-play").build(row)
				this.own(on(play,"click", lang.hitch(this,"showSession", session)));
			}
		},

		hoverSession (session) {
			if(this.canvas){
				this.canvas.highlightSession(session?.session)
			}
		},

		showUserJourneyOutlier (showOutlier) {
			if (showOutlier) {
				let outliers = this.canvas.getOutlierScores();
				for (let session in this.sessionCheckBoxes){
					let chkBx = this.sessionCheckBoxes[session];
					if (outliers[session]){
						css.remove(chkBx.domNode, "MatcToolbarItemStrikeThrough");	
					} else {		
						css.add(chkBx.domNode, "MatcToolbarItemStrikeThrough");
					}
				}

			} else {
				for (let session in this.sessionCheckBoxes){
					let chkBx = this.sessionCheckBoxes[session];
					css.remove(chkBx.domNode, "MatcToolbarItemPassive");
					css.remove(chkBx.domNode, "MatcToolbarItemStrikeThrough");
				}
			}
			this.showUserJourney();
		},
		/**
		 * Update the UI according the selected task. Show task color selector
		 * and also fade out not matching sessions
		 */
		selectUserJournyTask(taskNumber){
	
			if (taskNumber >= 0) {
				// css.remove(this.sessionTaskLineColor.domNode, "hidden");
				// css.remove(this.sessionLineColor.domNode, "hidden")
				let task = this.testSettings.tasks[taskNumber];
				let taskPerformance = this.canvas.getTaskPerformance();
				for (let session in this.sessionCheckBoxes){
					let chkBx = this.sessionCheckBoxes[session];
					if (taskPerformance[session] && taskPerformance[session][task.id]){
						css.remove(chkBx.domNode, "MatcToolbarItemStrikeThrough");
						//chkBx.setValue(true);
					} else {
						//chkBx.setValue(false);
						css.add(chkBx.domNode, "MatcToolbarItemStrikeThrough");
					}
				}
			} else {
				// css.add(this.sessionTaskLineColor.domNode, "hidden");
				// css.add(this.sessionLineColor.domNode, "hidden")
				for (let session in this.sessionCheckBoxes){
					let chkBx = this.sessionCheckBoxes[session];
					css.remove(chkBx.domNode, "MatcToolbarItemPassive");
					css.remove(chkBx.domNode, "MatcToolbarItemStrikeThrough");
				}
			}
			this.showUserJourney();
		},

		selectAllSessions(value){
			for(var id in this.sessionCheckBoxes){
				this.sessionCheckBoxes[id].setValue(value);
			}
			this.showUserJourney();
		},


		setSelectSessions(ids){
			if (this.sessionCheckBoxes){
				for(var id in this.sessionCheckBoxes){
					if (ids.indexOf(id) >= 0){
						this.sessionCheckBoxes[id].setValue(true);
					} else {
						this.sessionCheckBoxes[id].setValue(false);
					}
				}
				this.sessionAllCheckBox.setValue(false);
				this.showUserJourney();
			}
		},


		selectSession(){
			this.showUserJourney();
		},


		_getTestList(events, annotatation, testSettings){

			const list =[];
			if(!testSettings.tasks){
				testSettings.tasks = [];
				console.warn("_getTestList() > Added missing task array")
			}

			const df = new DataFrame(events);
			df.sortBy("time");
			const sessionGroup = df.groupBy("session");
			const sessions = sessionGroup.data;

			const annoSession = new DataFrame(annotatation).groupBy("reference");
			const analytics  = new Analytics();
			const taskCount = testSettings.tasks.length;
			const tasksPerformance = analytics.getMergedTaskPerformance(df, testSettings.tasks, annotatation );
			const tasksBySession = tasksPerformance.count("session");

			const outliers = this.canvas.getOutlierScores()

			let id = 1;
			for(let sessionID in sessions){

				let session = sessions[sessionID];
				let date = this.formatDate(session.min("time"), true);

				let anno = annoSession.get(sessionID);
				let status = '<span class="MatchDashStatusSuccess">Valid</span>';
				let isValid = true;
				if(anno){
					isValid = anno.get(0).get("isValid");
					if(!isValid){
						status = '<span class="MatchDashStatusFailure">Failure</span>';
					}
				}

				let taskSuccess = tasksBySession.get(sessionID);
				if(!taskSuccess){
					taskSuccess = 0;
				}

				const df = new DataFrame(session.data)
   				//const actionsEvents = this.getActionEvents(df);
				const clicks = df.select("type", "in",["ScreenClick","WidgetClick","WidgetChange", "ScreenGesture", "WidgetGesture"])


				const item = {
					session : sessionID,
					taskPerformance : taskSuccess + " / " + taskCount,
					weirdness: outliers[sessionID],
					duration : (Math.ceil( (session.max("time") - session.min("time")) / 1000 )),
					date : date,
					start : session.min("time"),
					size : clicks.size(),
					status :status,
					isValid : isValid,
					id : id,
					screens : session.unique("screen")
				};

				list.push(item);
				id++;
			}

			list.sort((a,b) => {
				return a.id - b.id;
			});

			return list;
		},


		renderGestureProperties(){

			var db = new DomBuilder();

			this.gestureOptionsDiv = this.createSection("Options");

			let content = this.createContent(this.gestureOptionsDiv);

			var row = db.div("MatcToobarRow MatcMarginBottomXXL").build(content);
			db.span("MatcToolbarItemLabel", "Gesture Color").build(row);

			this.gestureLineColor = this.$new(ToolbarColor, {updateColor :true, hasCustomColor:false, hasPicker:false});
			this.gestureLineColor.placeAt(row);
			this.gestureLineColor.setLabel('Line Color');
			this.gestureLineColor.setModel(this.model);
			this.gestureLineColor.setValue("#0099cc");
			this.own(on(this.gestureLineColor, "change", lang.hitch(this, "showGestureMap")));


		},


		/*****************************************************************************************************
		 * Dialogs
		 ****************************************************************************************************/




		showDwellDistribution(e){
			this.logger.log(0,"showDwellDistribution", "entry > " );

			if(this._selectedScreen){

				var df = new DataFrame(this.events);
				var analytics  = new Analytics();
				var screenTimeGrouping = analytics.getScreenTimeGrouping(df);
				var dwellTimes = screenTimeGrouping.get(this._selectedScreen.id);

				if(dwellTimes){

					var db = new DomBuilder();
					var dialog = new Dialog();
					var d = db.div("MatcPadding DashTaskListDetailsDialog").build();

					db.h2("MatcDialogTitle", "Dwell Time Distribution &quot" + this._selectedScreen.name + "&quot").build(d);

					var cntr = db.div("DashTaskListDialogHist").build(d);

					var duration_dist = dwellTimes.hist(null, 10);

					var hist = this.$new(Histogram);
					hist.setFormTo(function(v){
						return Math.round(v/1000) + " sec";
					});
					hist.onHover(function(bucket){
						return  Math.round(bucket.from/1000) + " - "  + Math.round(bucket.to/1000) + " sec (" +bucket.count + " x)" ;
					});
					hist.setValue(duration_dist, dwellTimes.mean());
					hist.placeAt(cntr);

					dialog.popup(d, e.target);
				}
			}
		},




		/*****************************************************************************************************
		 * properties view
		 ****************************************************************************************************/

		showGestureProperties(){
			this.logger.log(1,"showGestureProperties", "entry > ");
			this.showProperties();
			css.remove(this.gestureOptionsDiv, "MatcToolbarSectionHidden");
		},


		showWidgetProperties(model){
			this.logger.log(1,"showWidgetProperties", "entry > " + model.id + " " + model.name);
			this.showProperties();

			css.remove(this.widgetNameDiv, "MatcToolbarSectionHidden");
			this.widgetName.value = model.name;

			var data = this.canvas.getWidgetData(model);

			if(data[model.id]){
				var widgetData = data[model.id];


				this.widgetClickRing.setPs(widgetData.clicksRel);
				this.widgetClickRing.setValue(widgetData.clicksAbs);

				// vs firstClicksRelApp
				if(isNaN(widgetData.firstClicksRelScreen)){
					widgetData.firstClicksRelScreen = 0;
				}
				this.widgetFirstClickRing.setPs(widgetData.firstClicksRelScreen);
				this.widgetFirstClickRing.setValue(widgetData.firstClicksAbs);


				this.setTextContent(this.widgetDiscoverSTDLabel, "+/-" + Math.round(widgetData.discoverTimeStd / 1000) + "s")
				this.setTextContent(this.widgetDiscoverLabel, Math.round(widgetData.discoverTimeAbs / 1000) + "s");
			}
		},



		showScreenProperties(model){
			this.logger.log(0,"showScreenProperties", "entry");
			this.showProperties();

			css.remove(this.screenNameDiv, "MatcToolbarSectionHidden");



			this.screenName.value = model.name;

			var times;
			var views;
			var clicks;
			var widgetClicks;
			var screenTests;
			if(!model.style.overlay){
				times = this.canvas.getScreenDwellTime();
				views = this.canvas.getScreenViews();
				clicks = this.canvas.getScreenClicks();
				widgetClicks = this.canvas.getScreenWidgetClicks();
				screenTests = this.canvas.getScreenTests();
			} else {
				times = this.canvas.getOverlayDwellTime();
				views = this.canvas.getOverlayViews();
				clicks = this.canvas.getOverlayClicks();
				widgetClicks = this.canvas.getOverlayWidgetClicks();
				screenTests = this.canvas.getOverlayTest();
			}

			var time =times.times[model.id];
			if(!time){
				time = 0;
			}


			var sClick = clicks.clicks[model.id];
			var wClicks = widgetClicks.clicks[model.id];

			var totalClicksOnScreen = sClick + wClicks;
			var avgDwell = (time /times.sessions) ;

			var count =views.counts[model.id];
			if(!count){
				count = 0;
			}

			var tests = screenTests.counts[model.id];
			if(!tests){
				tests = 0;
			}


			this.screenTotalViewRing.setValue(count);
			this.screenTotalViewRing.setPs((count / views.total));

			//(count / times.sessions)
			this.screenTestRing.setValue(tests);
			this.screenTestRing.setPs((tests / screenTests.sessions));


			this.screenClickRing.setPs(sClick / totalClicksOnScreen);
			this.screenClickRing.setValue(sClick);


			this.screenWidgetClickRing.setPs(wClicks / totalClicksOnScreen);
			this.screenWidgetClickRing.setValue(wClicks);


			this.screenDwellRing.setPs(time / times.total);
			this.screenDwellRing.setValue(Math.round( avgDwell / 1000) + "s");


		},


		showSessionProperties(){
			this.logger.log(0,"showSessionProperties", "entry");
			this.showProperties();

			css.remove(this.sessionDiv, "MatcToolbarSectionHidden");
			css.remove(this.sessionOptionsDiv, "MatcToolbarSectionHidden");
	

			if (this.sessionTreeCheckBox.getValue()){
				css.add(this.sessionTaskCntr, "MatcToolbarSectionHidden")
				css.add(this.sessionLineColor.domNode, "hidden");
				css.add(this.sessionTaskBtn.domNode, "hidden");
				css.remove(this.sessionShowDiv, 'MatcToolbarSectionHidden')
				// css.add(this.sessionTaskLineColor.domNode, "hidden");
				css.add(this.sessionLineColor.domNode, "hidden");
				css.add(this.sessionOutlierDiv, "MatcToolbarSectionHidden")
				css.add(this.sessionOutlierCheckbox.domNode, "hidden");
				
			} else {
				css.remove(this.sessionTaskCntr, "MatcToolbarSectionHidden")
				css.remove(this.sessionLineColor.domNode, "hidden");
				css.remove(this.sessionTaskBtn.domNode, "hidden");
				css.add(this.sessionShowDiv, 'MatcToolbarSectionHidden')
				// css.remove(this.sessionTaskLineColor.domNode, "hidden");
				css.remove(this.sessionLineColor.domNode, "hidden");
				css.remove(this.sessionOutlierDiv, "MatcToolbarSectionHidden")
				css.remove(this.sessionOutlierCheckbox.domNode, "hidden");
			}
		},


		/*****************************************************************************************************
		 * drop off
		 ****************************************************************************************************/
		selectDropOffTask () {
			this.showDropOffProperties()
		},

		showDropOffProperties(){
			this.logger.log(0,"showDropOffProperties", "entry");


			let taskNumber = this.dropOffTaskBtn.getValue()
			let task = this.testSettings.tasks[taskNumber];
			if (task) {
				this.setAnalyticMode("DropOff", {
					time: this.dropOffTimeCheckBox.getValue(),
					task: task,
					color: '#ccc'
				});
				css.remove(this.dropOffConfigDiv, "MatcToolbarSectionHidden")
				css.remove(this.dropOffOptionsDiv, "MatcToolbarSectionHidden");
				css.remove(this.dropOffChartDivCntr, "MatcToolbarSectionHidden")
				//css.remove(this.dropOffFunnelDivCntr, "MatcToolbarSectionHidden")
				this.showDropOffChart(task)
				this.showProperties();
			} else {
				this.setAnalyticMode("DropOff", {
					time: this.dropOffTimeCheckBox.getValue(),
					task: null,
					color: '#ccc'
				});
				css.remove(this.dropOffConfigDiv, "MatcToolbarSectionHidden")
				css.remove(this.dropOffOptionsDiv, "MatcToolbarSectionHidden")
				this.showProperties();
			}
		},

		showDropOffChart (task) {
			var df = new DataFrame(this.events);
			var analytics  = new Analytics();
			let funnel = analytics.getFunnelSummary(df, task, this.annotation);

			let lastStep = funnel[funnel.length-1]

			this.dropoffTaskSuccess.setPs(lastStep.p)
			this.dropoffTaskSuccess.setValue(Math.round(lastStep.p * 100) + '%')

			this.dropOffTaskDuration.innerText = Math.round(lastStep.durationMean / 100) / 10 + 's'
			this.dropOffTaskDurationLabel.innerText = '+/-' + Math.round(lastStep.durationStd / 100) / 10 + 's'

			this.dropOffInteractions.innerText = Math.round(lastStep.interactionsMean)
			this.dropOffInteractionsLabel.innerText = '+/-' + Math.round(lastStep.interactionsStd)
		},

		showDropOffFunnel (funnel) {
			this.dropOffChartDiv.innerHTML = ''
			let db = new DomBuilder()
			let cntr = db.div().build()
			funnel.forEach((step, i) => {
				if(step.event){
					db.span('MatcDashLabel', this.getNiceEventLabel(step.event, i)).build(cntr)
					let bar = db.div('MatcToolbarDropOffChartBar', Math.round(step.p * 100) + '%').build(cntr)
					bar.style.background = this.greenToRed(step.p)
					bar.style.width = step. p * 100 + '%'
				}
			})
			this.dropOffChartDiv.appendChild(cntr)
		},

		getNiceEventLabel (event, i){
			if (this.model){
				var row = [];
				if(event.widget){
					if(event.type =="WidgetGesture" && event.gesture){
						let gesture = event.gesture;
						row = [this.getGestureLabel(gesture.type),  this.getWidgetName(event.widget)];
					} else if(event.state && (event.type == "WidgetClick" || event.type == "WidgetChange")  ){
						return this.getEventStateLabel(event.state) + ` -  ` + this.getWidgetName(event.widget) + ' @ ' + this.getScreenName(event.screen);
					} else {
						return this.getEventLabel(event.type) + ` -  ` + this.getWidgetName(event.widget) + ' @ ' + this.getScreenName(event.screen);
					}
				} else if(event.type =="ScreenGesture" && event.gesture){
					let gesture = event.gesture;
					row = ["Screen " + this.getGestureLabel(gesture.type), this.getScreenName(event.screen)];
				}else {
					row = [this.getEventLabel(event.type), this.getScreenName(event.screen)];
				}
				return row[0] + " - " +row[1]+ "";
			}
			return this.getNLS("dash.perf.dropoff.step") + i;
		},


		showHeatMapProperties(){
			this.showProperties();

			css.remove(this.heatmapDiv,"MatcToolbarSectionHidden" );

			this.heatmapClickList.setValue(this.analyticHeatMapClicks);
		},



		/*****************************************************************************************************
		 * show properties section and make sure the scroll bar is moved too!
		 ****************************************************************************************************/

		showProperties(){
			css.remove(this.propertiesCntr, "MatcToolbarSectionHidden");
			if(this.canvas){
				css.add(this.canvas.scrollRight, "MatcCanvasScrollBarRightOpen");
			}
		},

		hideProperties(){
			if (this.analyticMode == "UserJourney"){
				this.hideAllSections();
				this.showSessionProperties();
			} else if (this.analyticMode == "HeatmapClick"){
				this.hideAllSections();
				this.showHeatMapProperties();
			} else {
				css.add(this.propertiesCntr, "MatcToolbarSectionHidden");
				if(this.canvas){
					css.remove(this.canvas.scrollRight, "MatcCanvasScrollBarRightOpen");
				}
				this.hideAllSections();
			}
		},


		hideAllSections(){
			this.logger.log(3,"hideAllSections", "entry");
			for(var i=0; i< this.sections.length; i++){
				var section = this.sections[i];
				css.add(section, "MatcToolbarSectionHidden");
			}
		},


		/**********************************************************************
		 * Canvas Delegates
		 **********************************************************************/



		/**********************************************************************
		 * DI stuff
		 **********************************************************************/


		setController(c){
			this.logger.log(3,"setController", "entry");
			this.controller = c;
		},

		setCanvas(c){
			this.logger.log(3,"setCanvas", "entry");
			this.canvas = c;

		},

		setModelFactory(f){
			this.logger.log(3,"setModelFactory", "entry");
			this.factory = f;
		},

		setModel(m){
			this.model = this.createInheritedModel(m);
			this.renderToolbar();
			this.render();
		},

		setAnnotation(a){
			this.logger.log(-1,"setAnnotation", "enter > # " );
			this.annotation = a;
		},

		setTest(t){
			this.logger.log(2,"setTest", "enter > # " );
			this.testSettings = t;
		},

		setEvents(events){
			this.logger.log(2,"setEvents", "enter > # " + events.length);
			this.events = events;
		},

		setMode(mode){
			this.logger.log(2,"setMode", "entry > '" + mode + "'");
			this.mode = mode;
			this.onModeChange();
		},


		onModeChange () {

		},


		/********************************************************
		 * Helper
		 ********************************************************/

		setSelectedViewButton(btn){
			for(var i=0; i < this.viewBtns.length; i++){
				css.remove(this.viewBtns[i],"MatcToolbarItemActive");
			}
			css.add(btn,"MatcToolbarItemActive");
		},

		createRing(lbl, help, distCallBack){

			var bgColor = "#cecece";
			var settings = this.canvas.getSettings();
			if(settings.canvasTheme == "MatcDark"){
				bgColor = "#777";
			}
			var ring = this.$new(Ring, {size:100, width:5, backgroundColor: bgColor, color:"#0099cc", color2:"#83b600", color3:"#ffa713"});
			ring.setDomSize(120,120);
			ring.setLabel(lbl);

			if(distCallBack){
				ring.setAction("mdi mdi-chart-bar");
				this.tempOwn(ring.on("action", lang.hitch(this, distCallBack)));
			}

			if(help){
				ring.setHelp(true);
				this.tempOwn(ring.on("help", lang.hitch(this, "showHelpDialog", help)));
			}

			css.add(ring.domNode, "MatcMarginTop");
			return ring;
		},

		createToolBarItem(label, callback, icon, parent){
			var a = document.createElement("div");
			css.add(a,"MatcToolbarItem");

			if(icon){
				var i = document.createElement("span");
				css.add(i,icon);
				a.appendChild(i);
			}

			var lbl = document.createElement("label");
			css.add(lbl, "MatcToolbarLabel");
			lbl.innerHTML =label;
			a.appendChild(lbl);


			if(callback){
				this.tempOwn(on(a, touch.press, lang.hitch(this, callback)));
			}
			if(!parent){
				this.properties.appendChild(a);
			} else {
				parent.appendChild(a);
			}

			return a;
		},


		createInput(content,placeholder){

			var div = document.createElement("div");
			css.add(div, " MatcToolbarItem MatcToolbarGridFull");
			content.appendChild(div);

			let input = document.createElement("input");
			input.disabled = true;
			css.add(input, "MatcIgnoreOnKeyPress MatcToobarInput  MatcToobarInlineEditDisabled");
			div.appendChild(input);

			if(placeholder){
				input.placeholder = placeholder;
			}
			return input;
		},

		createContent(parent){
			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);
			return content;
		},

		createSection(lbl, hasTemplateMarker){

			var parent = document.createElement("div");
			css.add(parent, "MatcToolbarSection");

			var header = this.createSectionHeader( parent, lbl,hasTemplateMarker);

			/**
			 * store the value somehow in a cookie? and use it during restore??
			 */
			this.own(on(header, touch.press, function(){
				css.toggle(parent, "MatcToolbarSectionCollabsed");
				return false;
			}));

			this.sections.push(parent);

			this.properties.appendChild(parent);
			return parent;
		},

		createSectionHeader(parent, lbl, hasTemplateMarker){
			var div = document.createElement("div");
			css.add(div,"MatcToolbarSectionLabel");
			parent.appendChild(div);

			div.innerHTML=lbl;

			if(hasTemplateMarker){
				var span = document.createElement("span");
				css.add(span, "MatcToolbarSectionMarker");
				span.innerHTML=" *";
				div.appendChild(span);
			}

			var chev = document.createElement("span");
			css.add(chev, "MatcToolbarSectionChevron mdi mdi-chevron-down");
			div.appendChild(chev);

			return div;
		},



		createBigNumber(db, cntr, label, help){
			var numberCntr = db.div("MatcToolBarNumberCntr MatcMarginTop").build(cntr);
			let l = db.div("MatcDashLabel", label).build(numberCntr);
			var main =  db.div("MatcToolbarBigLabel").build(numberCntr);
			var little =  db.div("MatcToolbarDetailLabel").build(numberCntr);
			if(help){
				var node =  db.span("mdi mdi-help-circle MatcHelpIcon").build(l);
				this.tempOwn(on(node, touch.press, lang.hitch(this, "showHelpDialog", help)));
			}

			return [main, little];
		},


		/********************************************************
		 * Main menu handlers
		 ********************************************************/

		onExit(){
			this.logger.log(0,"onExit", "entry", this.isPublic);
			if(this.isPublic){
				hash("#/examples/"+ this.model.id + "/design.html");
			} else {
				hash("#/apps/"+ this.model.id + "/design.html");
			}
		},

		onShare(){
			this.logger.log(0,"onShare", "entry");
		},

		/********************************************************
		 * Selection handlers!
		 ********************************************************/

		onWidgetSelected(widget){
			this.logger.log(2,"onWidgetSelected", "entry");

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
			this.showWidgetProperties(widget);


			this.logger.log(3,"onWidgetSelected", "exit");
		},


		onScreenSelected(screen){
			this.logger.log(-1, "onScreenSelected", "entry", this._selectedScreen);

			/**
			 * We don not want to rerender on scroll
			 */
			if(this._selectedScreen && this._selectedScreen.id == screen.id){
				this.logger.log(3,"onScreenSelected", "exit > no new selection!");
				return;
			}

			this.cleanUp();
			this._selection = "screen";
			this._selectedScreen = screen;
			this.showScreenProperties(screen);


			this.logger.log(4,"onScreenSelected", "exit");
		},




		onLineSelected(line){
			this.cleanUp();
			this._selection = "line";
			this._selectedLine = line;
		},



		onMultiSelect(selection){
			this.cleanUp();

			this._selection = "multi";
			this._selectedMulti = selection;
		},

		onGroupSelect(group){
			this.cleanUp();
			this._selection = "group";
			this._selectedGroup = group;
			this.showGroupProperties(group);
		},



		onCanvasSelected(){
			this.cleanUp();
			this.hideProperties();
		},


		/**
		 * method which will update all properties. method is called from controller!
		 */
		updatePropertiesView(){

			if(this._selectedWidget ){
				this.onWidgetSelected(this._selectedWidget );
			}
		},



		/********************************************************
		 * Player
		 ********************************************************/

		showSession(session,e){
			//console.debug("showSession", session.session, this.events.length);

			const sessionID = session.session;
			const dialog = new Dialog();
		
			const db = new DomBuilder();

			const div = db.div("MatcDialog MatcPlayerDialog ").build();
			const cntr = db.div("").build(div);

			dialog.onOpen(() => {
				if (this.isPublic){
					Promise.all([
						this.modelService.findPublicTagAnnotations(this.model.id),
						this.modelService.findPublicMouseBySession(this.model.id, sessionID)
					]).then(values => {
						this._showSession(sessionID, cntr, dialog, values);
					});
				} else {
					Promise.all([
						this.modelService.findTagAnnotations(this.model.id),
						this.modelService.findMouseBySession(this.model.id, sessionID)
					]).then(values => {
						this._showSession(sessionID, cntr, dialog, values);
					});
				}
			})

			dialog.popup(div, e.target);
		},

		_showSession(sessionID, cntr, dialog, data) {

			try {
				const mouse = data[1];

				const df = new DataFrame(this.events);
				df.sortBy("time");
				const sessionGroup = df.groupBy("session");
				const events = sessionGroup.get(sessionID);

				const player = this.$new(VideoPlayer);
				player.setDialog(dialog)
				player.placeAt(cntr);
				player.setModel(this.model);
				player.setTestSettings(this.testSettings)
				player.setMouse(mouse);
				player.setMouse(mouse);
				player.setSession(events, sessionID);
		

				dialog.own(on(dialog, "close", function () {
					player.destroy();
				}));
			} catch (e) {
				console.error(e);
			}
		},

		_getSessionAnnotation(annotations, appID){

			if(annotations.length > 1){
				/**
				 * This should not happen, but we have seen it happeing. We delete this now...
				 */
				console.warn("Too many annotations!");
				for(var i=1; i< annotations.length; i++){
					var a = annotations[i];
					this._doDelete("rest/annotations/apps/"+ appID + "/" + a.id + ".json");
				}
			}

			if(annotations.length >= 1){
				return  annotations[0];
			}else {
				//console.debug("Create Tag annotation...");
				return {
					appID : appID,
					type : "tags",
					reference : "",
					sessions :{}
				};
			}
		},

		/********************************************************
		 * Show Settings
		 ********************************************************/


		onShowSettings(e){

			var db = new DomBuilder();

			db = new DomBuilder();
			var popup = db.div("MatcDialog MatcHeaderDialog MatcPadding").build();

			var cntr = db.div("").build(popup);

			var settings = this.canvas.getSettings();


			/**
			 * Themes
			 */
			db.label("","Theme :").build(cntr);
			var themeList = this.$new(RadioBoxList);
			themeList.setOptions([
				{value:"MatcDark", label:"Dark"},
				{value:"MatcLight", label: "Light"}
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


			var bar = db.div("MatcButtonBar MatcMarginTopXL").build(popup);
			var save = db.a("MatcButton ", "Save").build(bar);
			var cancel = db.a(" MatcLinkButton ", "Cancel").build(bar);



			var dialog = new Dialog();
			dialog.own(on(cancel, touch.press, lang.hitch(dialog, "close")));
			dialog.own(on(save, touch.press, lang.hitch(this, "onSaveSettings", dialog, themeList, mouseWheelList)));

			dialog.popup(popup, e.target);

			this.canvas.enableMouseZoom(false);
			this.canvas.setState("simulate");

			this.logger.log(0,"onShowSettings", "exit > ");
		},

		onSaveSettings(dialog, themeList,mouseWheelList){
			var settings = {
				canvasTheme: themeList.getValue(),
				mouseWheelMode : mouseWheelList.getValue()
			};

			this.canvas.setSettings(settings);
			this.canvas.enableMouseZoom(true);
			dialog.close();
		},


		/********************************************************
		 * SignUp
		 ********************************************************/


		showSignUpDialog(e){

			var d = new Dialog();

			var db = new DomBuilder();

			var div = db.div("MatcDialog ").build();


			this._createSignUpForm(d, div);

			d.popup(div, e.target);
		},


		_createSignUpForm(d, div){
			let f = this.$new(Form);
			f.render([
				{
					label: "Email",
					name:"email",
					type:"text",
					required:"true",
					placeholder:"Your email",
					css:"input-lg MatcIgnoreOnKeyPress",
					error:"We need your email."
				},
				{
					label: "Password",
					name:"password",
					type:"password",
					min:6,
					placeholder:"Your password",
					css:"input-lg MatcIgnoreOnKeyPress",
					error:"The password should have at least six characters."
				},
				{
					label: 'I have read the <a href="#/termsofservice.html" target="_blank">terms of service</a>',
					name:"tos",
					type:"check",
					required:"true",
					css:"MatcFormCheckBox MatcIgnoreOnKeyPress",
					error:"You must accept the terms of service!"
				}
			], [
				{label : "Cancel", css:"MatcLinkButton", click: lang.hitch(d, "close")},
				{label : "Create Free Account", css:"MatcButton MatchButtonGreen", click: lang.hitch(this, "_signUpAndNew",d,f)}
			]);

			f.placeAt(div);
			f.startup();

			return f;
		},

		_signUpAndNew(dialog, form, data){

			var valid = form.validateForm(null, true);

			if(valid){

				result = this._doPost("rest/user", data);

				if(result.type=="error"){
					if(result.errors.indexOf("user.email.not.unique") >=0){
						form.showError("The email is already taken! Please enter another one!", "email");
					} else {
						form.showError("Something went wrong! Please try again!", "");
					}

					dialog.shake();
				} else {
					dialog.close();

					var result = this._doPost("rest/login/", data);
					if(result.type!="error"){

						window.location.href = "/my-account.html";

					} else {
						console.error("_signUpAndSave() > Could not sign in user");
					}
				}
			} else {
				dialog.shake();
			}
		},

		/********************************************************
		 * CleanUp
		 ********************************************************/


		cleanUp(){
			this.hideAllSections();
			this.unselect()
		},

		unselect() {
			this._selectedWidget = null;
			this._selectedLine  = null;
			this._selectedScreen = null;
			this._selectedMulti = null;
			this._selectedGroup = null;
			this._selection = null;
		},

		blurWidgetProperties(){

		}
    },
    mounted () {
    }
}
</script>