
<template>
<div :class="['MatcPublic MatcTestPage', {'MatcWindows': hasWindows},  {'MatcTestPageResponsive': isResponsive}]">
	<Splash :hash="hash" :model="model" :settings="settings" @start="renderTest"  v-if="hasSplash"/>
	<div  class="MatcTestCntr">
		<div class="MatcTestTaskCntr MatcTestContent " ref="tastCntr" v-if="showTasks">

			<div class="MatcStudioLogo">        
				<img src="../../style/img/QUXLogo5BlueWhite2.svg" class="MatcStudioLogo" ref="logo"> 
				<span class="MatcCollapseViewMinHidden">Quant-UX</span>               
			</div>

			<div class="MatcTestTaskList" ref="taskList">
				<div v-for="(t) in getUserTasks()" :key="t.id" :class="{'MatcTestTaskDone':taskDone[t.id] }">
					<h4>{{t.name}} 
					<QIcon icon="CheckBoxHook" v-if="taskDone[t.id]"/>
					</h4>
					<div class="MatcTestTaskDescription">
						{{t.description}}
					</div>
				</div>
			</div>
	
	
		</div>
		<div class="MatcTest" ref="responsiveScroll">
			<div class="MatcTestSimulatorWrapper" ref="cntr">
			
			</div>
		</div>
	</div>

</div>
</template>
<style>
	@import url("../../style/css/legacy.css");
</style>
<style lang="scss">
  @import "../../style/matc.scss";
  @import "../../style/test.scss";
  @import "../../style/canvas/all.scss";
</style>
<style lang="sass">
  @import "../../style/bulma.sass"
</style>

<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import win from 'dojo/win'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import Util from 'core/Util'
import Dialog from 'common/Dialog'
import has from 'dojo/has'
import Services from 'services/Services'
import Simulator from 'core/Simulator'
import Preloader from 'core/simulator/Preloader'
import QR from 'core/QR'
import Analytics from 'dash/Analytics'
import DataFrame from 'common/DataFrame'
import * as ScrollUtil from '../../util/ScrollUtil'
import ResponsiveLayout from 'core/responsive/ResponsiveLayout'
import Splash from './Splash'
import QIcon from 'page/QIcon'


export default {
    name: 'TestPage',
    mixins:[Util, DojoWidget],
    data: function () {
        return {
			isResponsive: false,
			hash: '',
			hasSplash: true,
			true: false,
			skipSplash: false,
			desktopScaleDirection: "width",
			desktopOffset: 0,
			responiveOffset: 200,
			settings: null,
			logging: true,
			model: null,
			step: 0,
			password: '',
			passwordError: '',
			simulatorEvents: [],
			taskDone: {},
			splashImage: null,
			forceSimpleBar: false ,
        }
    },
    components: {
		'Splash':Splash,
		'QIcon': QIcon
	},
	computed: {
		hasWindows () {
			return navigator.platform.indexOf('Win') > -1
		},
		showTasks () {
			if (this.settings && this.settings.showTaskInTest) {
				return true
			}
			return false
		},
		hasSettings () {
			return this.settings !== null
		},
		menuWidth () {
			if (this.settings && this.settings.showTaskInTest) {
				return 256
			}
			return 0
		}
	},
    methods: {
      	postCreate () {
			this.logger = new Logger('TestPage');
			const hash = this.getHashFromUri();
			this.logger.log(2,"postCreate","enter", hash);
			const log = this.$route.query.log
			this.analytics = new Analytics()

			this.initNLS()

			/**
			 * If test is loaded from mobile, dispatch the simulator.html
			 */
			if((has("android") || has("ios"))){
				/**
				 * Do a forward to the simulator
				 *
				 * url pattern is server + "/simulate.html?&h=" + hash + "&log=" + log +"&qr=true";
				 *
				 * keep in sync with qr
				 */
				let target = "/#/simulate.html?qr=true&h=" + hash;
				if(log == "false"){
					target+="&log=false";
				} else {
					target+="&log=true";
				}
				target += this.getDataQuery()
				location = target;
				return;
			}
			this.db = new DomBuilder();
			if(this.$route.query.s === "true"){
				this.logger.log(-1,"postCreate","skipSplash");
				this.skipSplash = true;
			}

			if (this.$route.query.responsive === 'true') {
				this.isResponsive = true
			}

			/**
			 * Load the model a little later to avoid any flickering
			 */
			setTimeout(lang.hitch(this, "loadModel"), 1);
			this.logger.log(1,"postCreate","exit");
		},

		getDataQuery () {
			let result = ''
			const dataItems = Object.entries(this.$route.query).filter(record => {
				return record[0].slice(0, 5) == "data_"}
			);
			for (let item of dataItems) {
				result += "&" + item[0] + "=" + item[1];
			}
			return result
		},


		getUserTasks (){
			const tasks = [];
			if (this.settings.tasks && this.settings.tasks){
				for(let i=0; i< this.settings.tasks.length; i++){
					const task = this.settings.tasks[i];
					if (task.description && task.description != "Enter a description here"){
						tasks.push(task);
					}
				}
			}

			return tasks;
		},

		async loadModel (){
			this.logger.log(2,"loadModel","enter");
			var hash = this.getHashFromUri();
			if (hash && hash.length < 60) {
				this.showPassword()
			} else {
				this.loadModelFromHash(hash)
			}
		},

		showPassword () {
			this.logger.log(2,"showPassword","enter");
			this.step = 6
		},

		async setPassword () {
			this.logger.log(1,"setPassword","enter", this.password);

			const hash = this.getHashFromUri();
			const newHash = hash + this.password

			try {
				const app = await Services.getModelService().findAppByHash(newHash)
				if (app) {
					this.passwordError = ''
					this.loadModelFromHash(newHash)
				} else {
					this.showPasswordError()
				}
			} catch (e) {
				this.showPasswordError()
			}
		},

		showPasswordError () {
			this.passwordError = 'The password is wrong.'
		},

		async loadModelFromHash (hash) {
			this.hash = hash;
			if(hash){
				const app = await Services.getModelService().findAppByHash(hash)
				this.setModel(app)
			} else {
				console.debug("loadModel() > Hash is missing in url")
			}
			if(this.$route.query.log === "false"){
				this.logger.log(0,"loadModel","turn off logging");
				this.logging = false;
			}
			this.screenID = this.$route.query.s;
			this.debug = this.$route.query.debug === "true";
		},

		getHashFromUri (){
			if (this.$route.query.a && this.$route.query.b) {
				if(Math.random() > 0.5){
					this.logger.log(0,"getHashFromUri","Test version A");
					return this.$route.query.a;
				} else {
					this.logger.log(0,"getHashFromUri","Test version B");
					return this.$route.query.b;
				}
			}
			return this.$route.query.h
		},

		async setModel (model){
			this.logger.log(2,"setModel","enter > " + model);
			if(model){
				this.model = model;
				let test = await Services.getModelService().findTestByHash(this.model, this.hash)
				this.setTestsettings(test)
				this.preloadImages(model)
			} else {
				this.domNode.innerHTML="Sorry, the invitation is not valid...";
				location.href = location.protocol + "//" + location.host + "/404.html";
			}
		},

		capitalizeFirstLetter:function(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		},


		setTestsettings (settings){
			this.logger.log(1,"setTestsettings","enter > ", settings);
			this.settings = settings;
		},
		
		

		preloadImages (model) {
			this.logger.log(-1,"preloadImages","enter");
			Preloader.load(model, this.hash, this.domNode)	
		},

		showQRDialog (e){
			this.stopEvent(e);

			const dialog = this.db
				.div("MatchTestQRDialog MatcPadding")
				.build();

			const img = this.db
				.img()
				.build(dialog)

			css.add(img, "MatcSimulatorQR");
			QR.getQRCode(this.hash, true, false, this.getLanguage(), this.getDataQuery()).then(url => {
				img.src = url
			})

			this.db
				.div("MatcHint MatchTestQRDialogHint", this.getNLS("test.qr.headline"))
				.build(dialog);

			const d = new Dialog();
			d.popup(dialog, e.target);
		},


		onSimulatorEvent (e) {
			this.simulatorEvents.push(e)

			let session = new DataFrame(this.simulatorEvents);
			session = this.getActionEvents(session);
			const tasks = this.settings.tasks;
			const matches = this.analytics.getTaskPerformance(session, tasks, true);
			matches.data.forEach(match => {
				this.$set(this.taskDone, match.task, true)
			})
		},

		renderTest (){
			this.logger.log(-1,"renderTest","enter", this.settings.showTaskInTest );

			this.hasSplash = false
			
			this.renderSimulator();

			if (this.model.type != "desktop") {
				let btn = this.db.div("MatcTestQRButton  MatcAnimated MatcFadeOut").build(this.domNode);
				this.db.span("mdi mdi-qrcode MatcMiddle").build(btn);
				this.own(on(btn, touch.press, lang.hitch(this, "showQRDialog")));

				setTimeout(() => {
					css.remove(btn, "MatcFadeOut");
				}, 1500);
			}
		},


		renderSimulator () {
			/**
			 * Render Simulator
			 */
			const screenPos = win.getBox();
			screenPos.w -= this.menuWidth;

			const cntr = this.$refs.cntr
			if (this.isResponsive) {
				// change model 
				this.simulator = this.renderResponsiceSimulator(cntr, screenPos);
			} else  if(this.model.type == "desktop"){
				this.simulator = this.renderDesktopSimulator(cntr, screenPos);
			} else {
				// we want center of page, not center of right...
				cntr.style.marginRight = this.menuWidth + 'px'
				this.simulator = this.renderMobileSimulator(cntr, screenPos);
			}
			return cntr;
		},
		
		renderResponsiceSimulator (cntr, screenPos){
			this.logger.log(2,"renderDesktopSimulator","enter " );

			
			const factor = this.getResponsiveScaleFactor(screenPos);
			screenPos.w -= 64
			const cntrPos = {
				w : Math.floor(screenPos.w * factor),
				h : Math.floor(screenPos.h * factor) - 96
			};

			// we could do this somehow nicer?
			// now the scroll will bon on the entire page, which is messing up screen
			// recordings
			const layout = new ResponsiveLayout()
			layout.initApp(this.model, true)
			// should this be the same height or scalled????
			const resizedModel = layout.resize(cntrPos.w,this.model.screenSize.h )

			cntrPos.h = Math.min(resizedModel.screenSize.h, cntrPos.h)	

			const wrapper = this.db.div("MatchSimulatorWrapper").build(cntr);
			wrapper.style.width = Math.round(cntrPos.w) + "px";
			wrapper.style.height = Math.round(cntrPos.h) + "px";

			const container = this.db.div("MatchSimulatorContainer").build(wrapper)
			container.style.width = Math.round(cntrPos.w) + "px";
			container.style.height = Math.round(cntrPos.h) + "px";
			const hasSimpleBar = ScrollUtil.addScrollIfNeeded(container, this.forceSimpleBar)


			const s = this.createSimulator();
			s.setResizeListener(size => {
				this.logger.log(-1,"renderMobileSimulator","resize", size.w + '/' + size.h);
				wrapper.style.height = size.h + 'px'
				wrapper.style.width = size.w + 'px'

				container.style.height = size.h + 'px'
				container.style.width = size.w + 'px'
			})
			s.mode ="width";
			/**
			 * FIXME: Hacky workaround for initScale() issue;
			 */
			s.isDesktopTest = true;
			s.setInvitation(this.hash);
			s.placeAt(container);
			if (hasSimpleBar) {
				s.scrollListenTarget = "simpleBar";
			} else {
				s.scrollListenTarget = "parent";
			}


			s.startup();
			s.setModel(resizedModel);
		

			this.logger.log(2,"renderDesktopSimulator","exit" );
			return s;
		},

		renderMobileSimulator (cntr, screenPos){
			this.logger.log(0,"renderMobileSimulator","enter > " + screenPos.w + "," + screenPos.h);

			css.add(win.body(), "MatcTestMobile");

			const factor = 0.75;
			const cntrPos = {
				w : Math.floor(screenPos.w * factor),
				h : Math.floor(screenPos.h * factor)
			};

			let pos = this.model.screenSize;
			if(cntrPos.h < this.model.screenSize.h){
				this.logger.log(-1,"renderMobileSimulator","scale down...");
				pos = this.getScaledSize(cntrPos, "height", this.model);
			}

			const wrapper = this.db.div("MatchSimulatorWrapper").build(cntr);
			wrapper.style.width = Math.round(pos.w) + "px";
			wrapper.style.height = Math.round(pos.h) + "px";

			const container = this.db.div("MatchSimulatorContainer").build(wrapper)
			container.style.width = Math.round(pos.w) + "px";
			container.style.height = Math.round(pos.h) + "px";
			const hasSimpleBar = ScrollUtil.addScrollIfNeeded(container, this.forceSimpleBar)

			const s = this.createSimulator();
			s.setResizeListener(size => {
				this.logger.log(-1,"renderMobileSimulator","resize", size.w + '/' + size.h);
				wrapper.style.height = size.h + 'px'
				wrapper.style.width = size.w + 'px'

				container.style.height = size.h + 'px'
				container.style.width = size.w + 'px'
			})
			s.setInvitation(this.hash);
			s.isDesktopTest = true;
			if (hasSimpleBar) {
				s.scrollListenTarget = "simpleBar";
			} else {
				s.scrollListenTarget = "parent";
			}
			s.placeAt(container)
			s.setModel(this.model);
		
			this.logger.log(0,"renderMobileSimulator","exit", pos);
			return s;
		},


		renderDesktopSimulator (cntr, screenPos){
			this.logger.log(2,"renderDesktopSimulator","enter " );

			const factor = this.getDesktopScaleFactor(screenPos);
			screenPos.w -= 64
			const cntrPos = {
				w : Math.floor(screenPos.w * factor),
				h : Math.floor(screenPos.h * factor)
			};
			let pos = this.model.screenSize;
			if (cntrPos.w < this.model.screenSize.w){
				this.logger.log(0,"renderDesktopSimulator","scale down by width...");
				pos = this.getScaledSize(cntrPos, "width", this.model);
			}


			const wrapper = this.db.div("MatchSimulatorWrapper").build(cntr);
			wrapper.style.width = Math.round(pos.w) + "px";
			wrapper.style.height = Math.round(pos.h) + "px";

			const container = this.db.div("MatchSimulatorContainer").build(wrapper)
			container.style.width = Math.round(pos.w) + "px";
			container.style.height = Math.round(pos.h) + "px";
			const hasSimpleBar = ScrollUtil.addScrollIfNeeded(container, this.forceSimpleBar)


			const s = this.createSimulator();
			s.setResizeListener(size => {
				this.logger.log(-1,"renderMobileSimulator","resize", size.w + '/' + size.h);
				wrapper.style.height = size.h + 'px'
				wrapper.style.width = size.w + 'px'

				container.style.height = size.h + 'px'
				container.style.width = size.w + 'px'
			})
			s.mode ="width";
			/**
			 * FIXME: Hacky workaround for initScale() issue;
			 */
			s.isDesktopTest = true;
			s.setInvitation(this.hash);
			s.placeAt(container);
			if (hasSimpleBar) {
				s.scrollListenTarget = "simpleBar";
			} else {
				s.scrollListenTarget = "parent";
			}


			s.startup();
			s.setModel(this.model);
		

			this.logger.log(2,"renderDesktopSimulator","exit" );
			return s;
		},


		getDesktopScaleFactor (screenPos){
			const factor = (screenPos.w-this.desktopOffset) / screenPos.w;
			return Math.min(1,factor);
		},

		getResponsiveScaleFactor (screenPos){
			const factor = (screenPos.w-this.responiveOffset) / screenPos.w;
			return Math.min(1,factor);
		},


		createSimulator (){
			if(this.debug){
				const sim = this.$new(Simulator);
				sim.on('event', (e) => this.onSimulatorEvent(e))
				sim.mode = "debug"
				sim.logData = false
				return sim
			} else {
				const sim = this.$new(Simulator);
				sim.on('event', (e) => this.onSimulatorEvent(e))
				sim.mode = "debug"
				sim.logData = this.logging
				sim.applyTestSettings(this.settings)
				return sim
			}
		}
    },
    mounted () {
		css.add(win.body(), 'MatcPublic')

		if (this.forceSimpleBar) {
			console.error('forceSimpleBar')
		}
    }
}
</script>
