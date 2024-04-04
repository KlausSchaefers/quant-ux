
<template>
     <div class="MatcToolbar MatcAnalyticsToolbar MatcLayerListVisible">

		<div class="MatcToolbarLayerList MatcToolbarAnalyticList MatcToobarPropertiesSection" :style="'width:'+ layerListWidth +'px'">
			<div class="MatcToolbarLayerListCntr" data-dojo-attach-point="testListCntr">
			</div>
			<div class="MatcToolbarLayerListDND" ref="dndHanlde" @mousedown.stop="onResizeStart"></div>
		</div>

		<div class="MatcToolbarTop ">
			<div class="MatcToolbarTopHome" :style="'width:'+ layerListWidth +'px'">
				<HomeMenu @select="onHomeMenu"  :name="modelName" />
			</div>

			<div class="MatcToolbarTopCntr" :style="'width:calc(100% - '+ layerListWidth +'px)'" >
				<div class="MatcToolbarSection MatcToolbarTopLeft">
<!-- 
					<div :class="['MatcToolbarItem MatcToolbarPrimaryItem', {'MatcToolbarItemSelected': mode === 'edit'} ]" data-dojo-attach-point="editBtn"  @click="onEdit">
						<QIcon icon="Edit" />
					</div> 

					<div :class="['MatcToolbarItem MatcToolbarPrimaryItem', {'MatcToolbarItemSelected': mode === 'move'} ]" data-dojo-attach-point="moveBtn"  @click="onMove">
						<QIcon icon="EditMove" />
					</div> -->

					<div :class="['MatcToolbarItem MatcToolbarPrimaryItem', {'MatcToolbarItemSelected': mode === 'addComment'} ]" data-dojo-attach-point="commentBtn"  @click="onNewComment">
						<QIcon icon="Comment" />
					</div>	
				</div>
		
				<div class="MatcToolbarTopCenterCntr">
					<div class="MatcToolbarSection" data-dojo-attach-point="screenSection">
						<AnalyticViewModeButton @change="onChangeViewMode" v-if="events"/>
					</div>
				</div>
			

				<div class="MatcToolbarNotificationSection MatcToolbarTopRight MatcToolbarSection" data-dojo-attach-point="notificationSection">
				
					
					<ViewConfig :value="canvasViewConfig" @change="onChangeCanvasViewConfig" :analytic="true"/>
					<HeatmapToggleButton  :value="'Heatmap'" @change="$emit('viewModeChange', $event)"/>	
					<div class="MatcToolbarItem" @click="showSharing">
						<div class="MatcToobarPrimaryButton">									
							Share						
						</div>
					</div> 
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
import _Color from 'common/_Color'

import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'

import Dialog from 'common/Dialog'
import _Tooltip from 'common/_Tooltip'
import RadioBoxList from 'common/RadioBoxList'
import Form from 'common/Form'
import Ring from 'common/Ring'
import Histogram from 'dash/Histogram'
import Analytics from 'dash/Analytics'
import Share from 'page/Share'

import DataFrame from 'common/DataFrame'
import ViewConfig from 'canvas/toolbar/components/ViewConfig'
import HomeMenu from './AnalyticHomeMenu.vue'
import Help from 'help/Help'
import QIcon from 'page/QIcon'
import AnalyticViewModeButton from './AnalyticViewModeButton'
import AnalyticToolbarRender from './AnalyticToolbarRender'
import {onStartDND} from '../../util/DND'
import HeatmapToggleButton from '../toolbar/components/HeatmapToggleButton.vue'

export default {
    name: 'AnalyticToolbar',
    mixins:[Util,_Color,  _Tooltip, DojoWidget, AnalyticToolbarRender],
    data: function () {
        return {
			mode:'',
			modelName: 'Loading...',
			events: null,
			model: null,
			user: null,
			value: false,
			analyticMode: "HeatmapClick",
			analyticHeatMapClicks: -1,
			canvasViewConfig: {},
			layerListWidth: 256
        }
    },
    components: {
		'ViewConfig': ViewConfig,
		//'HelpButton': HelpButton,
		'HomeMenu': HomeMenu,
		'QIcon': QIcon,
		'AnalyticViewModeButton': AnalyticViewModeButton,
		'HeatmapToggleButton': HeatmapToggleButton
	},
    methods: {
        postCreate(){
			this.logger = new Logger("AnalyticToolbar");
			this.logger.log(2,"constructor", "entry");
			this.renderToolbar()
			this.initLayer()
		},

		setCommentService (s) {
			this.logger.log(3,"setCommentService", "entry");
			this.commentService = s
		},

		onMove (e){
			this.stopEvent(e);
			this.canvas.setMode("move");
		},

		onEdit (e){
			this.stopEvent(e);
			this.canvas.setMode("edit");
		},

	
		showHelpDialog(helpID){
			if (this.$refs.helpBtn) {
				this.$refs.helpBtn.show('analytics.canvas', helpID)
			}
		},

		onHomeMenu (option, e) {
			this.logger.log(1,"onHomeMenu", "entry", e);
			if (this[option.value]) {
				this[option.value](e)
			}
		},

		onChangeViewMode (option) {
			this.logger.log(-1,"onChangeViewMode", "entry", option);
			if (this[option]) {
				this[option]()
			}
		},

		showHelp(e) {
			let dialog = new Dialog()
			var db = new DomBuilder();
			let popup = db.div("MatcDialog MatcHelpDialog MatcPadding").build();
			dialog.popup(popup, e.target);
			let help = this.$new(Help)
			help.placeAt(popup)
		},


		onNewComment(e){
			this.logger.log(2,"onNewComment", "entry");
			this.stopEvent(e);
			this.emit("newComment", {"type" : "comment", "event" : e});
		},

		setAnalyticMode(mode, params, callback){
			this.logger.log(2,"setAnalyticMode", "entry > mode: " + mode);
			this.analyticMode = mode;
			this.analyticModeCallback = callback
			if (!callback) {
				console.warn("setAnalyticMode() called with callback", this.mode)
			}
			if(this.canvas){
				this.canvas.setAnalyticMode(mode, params);
			}
			this.hideProperties();
		},

		onCanvasSelected () {
			this.logger.log(-2,"onCanvasSelected", "entry > mode: " + this.analyticMode);

			if (this.analyticMode === "HeatmapClick") {
				this.hideAllSections()
				this.showHeatMapProperties()
			}
		},

		reRenderAnalyticMode () {
			this.logger.log(-2,"reRenderAnalyticMode", "entry", this.analyticMode);
			if (this.analyticModeCallback){
				this.analyticModeCallback()
			} else {
				this.logger.error("reRenderAnalyticMode", "No callback");
			}
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


		async showSharing(e) {
			this.logger.log(-1, "showSharing", "entry > ", this.isPublic);

			const invitation = await this.modelService.findInvitation(this.model.id)
			const temp = {};
			for (let key in invitation) {
				temp[invitation[key]] = key;
			}

			const db = new DomBuilder();
			const popup = db.div("MatcDialog MatcInfitationDialog MatcInfitationDialogLarge MatcPadding").build();
			const cntr = db.div("container").build(popup);
			let row = db.div("row").build(cntr);
			let right = db.div("col-md-12").build(row);
			db.h3("", this.getNLS("share.Headline")).build(right);

			const share = this.$new(Share)
			share.placeAt(right)
			share.setInvitation(temp[1])
			share.setPublic(this.isPublic)

			row = db.div("row MatcMarginTop").build(cntr);
			right = db.div("col-md-12 MatcButtonBar").build(row);

			const write = db.div("MatcButton MatcButtonPrimary", "Close").build(right);

			const d = new Dialog();
			d.own(on(write, touch.press, lang.hitch(d, "close")));
			d.popup(popup, e.target);
		},

		/**********************************************************************
		 * Layer List Width
		 **********************************************************************/

		onResizeStart (e) {
            const pos = this.layerListWidth
            onStartDND(e, d => {
				let width = pos + d.x
				// if (Math.abs(256 - width) < 5) {
				// 	width = 256
				// }
                this.layerListWidth = Math.min(Math.max(196, width), 400)
				localStorage.setItem('quxLayerListWidth', this.layerListWidth)
				this.setLayerListWidth(this.layerListWidth)    
            })
        },

		initLayer (){
			this.logger.log(-2,"initLayer", "entry");
			const w = localStorage.getItem('quxLayerListWidth')
			if (w && !isNaN(w * 1)) {
				this.setLayerListWidth( w * 1)				
			}
		},

   		setLayerListWidth(w) {
			this.layerListWidth = w
			if (this.canvas) {
				this.canvas.setLayerListWidth(w)
			}
		},


		/**********************************************************************
		 * Callbacks to canvas
		 **********************************************************************/


		showClickHeatMap(){
			this.logger.log(-2,"showClickHeatMap", "entry > " + this.analyticHeatMapClicks);
			this.setAnalyticMode("HeatmapClick", {
					numberOfClicks : this.analyticHeatMapClicks,
					sessions: this.getSelectedSessions(),
				}, 
				() => this.showClickHeatMap()
			);
			this.showHeatMapProperties();
		},

		showFirstClickHeatMap(i){
			this.logger.log(-1,"showFirstClickHeatMap", "entry > "+ i);
			this.analyticHeatMapClicks = i;
			this.setHeatMapLabel(i)
			if (i === 'mouse') {
				this.showMouseHeatMap()
			} else {		
				this.setAnalyticMode("HeatmapClick",{
					numberOfClicks : this.analyticHeatMapClicks,
					sessions: this.getSelectedSessions()
				} , () => this.showFirstClickHeatMap(i));
			}
		},

		showMouseHeatMap(){
			this.logger.log(-2,"showMouseHeatMap", "entry");
			if(!this.mouseData){
				this.canvas.showHint("Loading data...");
				if(this.isPublic){
					this._doGet("/examples/mouse/" + this.model.id + ".json", lang.hitch(this,"_onMouseDataLoaded"))
				} else {
					this._doGet("rest/mouse/" + this.model.id + ".json", lang.hitch(this,"_onMouseDataLoaded"))
				}
			} else {
				this.canvas.setMouseData(this.mouseData);
				this.setAnalyticMode("HeatmapMouse", {
					sessions: this.getSelectedSessions()
				}, () => this.showMouseHeatMap());
			}
			this.showHeatMapProperties();
		},


		_onMouseDataLoaded(data){
			this.logger.log(2,"_onMouseDataLoaded", "entry >"  +data.length);
			this.mouseData = data;
			this.canvas.setMouseData(this.mouseData);
			this.setAnalyticMode("HeatmapMouse", {
				sessions: this.getSelectedSessions()
			}, () => this.showMouseHeatMap());
		},

	
		showViewMap(){
			this.logger.log(2,"showViewMap", "entry");
			this.setAnalyticMode("HeatmapViews", {		
				sessions: this.getSelectedSessions()
			}, () => this.showViewMap());
		},

		showDropOff () {
			this.logger.log(-1,"showDropOff", "entry");
			this.showDropOffProperties()
		},

		showUserJourney(){
			this.logger.log(-1,"showUserJourney", "entry > ");	
			const params = {
				sessions: this.getSelectedSessions(),
				time: this.sessionTimeCheckBox.getValue(),
				color : this.sessionLineColor.getValue(),
				tree: this.sessionTreeCheckBox.getValue(),
				task: this.sessionTaskBtn.getValue(),
				taskColor: this.sessionTaskLineColor.getValue(),
				outlier: this.sessionOutlierCheckbox.getValue(),
				outlierColor: this.sessionOutlierColor.getValue()
			};
			this.setAnalyticMode("UserJourney",params, () => this.showUserJourney());
			this.showSessionProperties();
		},



		showGestureMap(){
			this.logger.log(2,"showGestureMap", "entry > ");	
			this.setAnalyticMode("Gesture", {
				color: this.gestureLineColor.getValue(),
				sessions: this.getSelectedSessions()
			}, () => this.showGestureMap());
			this.showGestureProperties();
		},


		showScreenMode () {
			const newMode = this.screenModeRadioList.getValue()
			this.setAnalyticMode(newMode, {
				sessions: this.getSelectedSessions()
			}, () => this.showScreenMode());
			css.remove(this.screenModeDiv, "MatcToolbarSectionHidden")
			this.logger.log(-1,"showScreenMode", "exit > ", newMode);
		}, 
		
		changeScreenMode (m) {
			this.logger.log(0,"changeScreenMode", "entry > ", m);
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

			const data = this.canvas.getWidgetData(model);

			if(data[model.id]){
				const widgetData = data[model.id];

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
			this.logger.log(-1,"showScreenProperties", "entry");
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
			this.logger.log(1,"showSessionProperties", "entry");
			this.showProperties();

			// css.remove(this.sessionDiv, "MatcToolbarSectionHidden");
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
				}, () => this.showDropOffProperties());
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
				}, () => this.showDropOffProperties());
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
			console.debug("hideProperties() > enter")
			if (this.analyticMode == "UserJourney"){
				this.hideAllSections();
				this.showSessionProperties();
				return
			} 
			
			if (this.analyticMode == "HeatmapClick"){
				this.hideAllSections();
				this.showHeatMapProperties();
				return
			} 
			
			// if (this.analyticMode == "HeatmapClick"){
			// 	this.hideAllSections();
			// 	this.showHeatMapProperties();
			// 	return
			// } 
			
			// css.add(this.propertiesCntr, "MatcToolbarSectionHidden");
			// if(this.canvas){
			// 	css.remove(this.canvas.scrollRight, "MatcCanvasScrollBarRightOpen");
			// }
			this.hideAllSections();
			
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
			this.modelName = m.name
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

		setSelectedViewButton(){
		},

		createRing(lbl, help, distCallBack){

			var bgColor = "#cecece";
			var settings = this.canvas.getSettings();
			if(settings.canvasTheme == "MatcDark"){
				bgColor = "#777";
			}
			var ring = this.$new(Ring, {size:100, width:5, backgroundColor: bgColor, color:"#365fff", color2:"#83b600", color3:"#ffa713"});
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
			css.add(a,"MatcToolbarItem MatcToolbarPrimaryItem");

			if(icon){
				var i = document.createElement("span");
				css.add(i,icon);
				a.appendChild(i);
			}

			// var lbl = document.createElement("label");
			// css.add(lbl, "MatcToolbarLabel");
			// lbl.innerHTML =label;
			// a.appendChild(lbl);


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
			css.add(div, "MatcToolbarItem");
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

		createSection(lbl, parentNode, canBeHidden = true){

			const parent = document.createElement("div");
			css.add(parent, "MatcToolbarSection");

			const header = this.createSectionHeader( parent, lbl);

			/**
			 * store the value somehow in a cookie? and use it during restore??
			 */
			this.own(on(header, touch.press, () => {
				css.toggle(parent, "MatcToolbarSectionCollabsed");
				return false;
			}));

			if (canBeHidden) {
				this.sections.push(parent);
			}
			parentNode.appendChild(parent);
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



		// onCanvasSelected(){
		// 	this.cleanUp();
		// 	this.hideProperties();
		// },


		/**
		 * method which will update all properties. method is called from controller!
		 */
		updatePropertiesView(){

			if(this._selectedWidget ){
				this.onWidgetSelected(this._selectedWidget );
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
				{value:"MatcLight", label: "Light"},
				{value:"MatcDark", label:"Dark"},
				{value: "MatcAuto", label: "Auto"}
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
			var save = db.a("MatcButton MatcButtonPrimary", "Save").build(bar);
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
		this.db = new DomBuilder();
    }
}
</script>