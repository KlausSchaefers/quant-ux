
<template>
<div class="MatcPublic">
	<div :class="['MatcTest', {'MatcTestCustomSplash': hasSplash}]" v-if="step < 10">
		<div v-if="hasSplash" class="MatcTestCustomSplashPowered">Powered by Quant-UX</div> 

		<div class="MatcTestMenu MatcTestMenuMax MactMainGradient" data-dojo-attach-point="overlay" :style="splashBackground" v-if="hasSettings">

			<div :class="['MatcTestLogoCntr', {'MatcTestLogoCntrMax': step > 1}]" >

				<div :class="['MatcTestProgressCntr']">
					<div class="MatcTestProgressBar" >
					</div>
					<transition name="fade">
						<div v-if="step > 2">
							<div class="MatcTestContent" v-if="step === 6">
								<div class="MatcTestContentCntr">
									<h2>Password</h2>
									<p>
										Please enter the password
									</p>
									<input v-model="password" class="form-control" @keypress.enter="setPassword"/>
									<div class="MatcButton MatcMarginTop" @click="setPassword()">
											Next
									</div>
									<span class="MatcError" style="margin-left:20px">
										{{passwordError}}
									</span>
								</div>


							</div>
							<div class="MatcTestContent" v-if="step === 3">
								<div class="MatcTestContentCntr">
									<h2>Welcome!</h2>
									<p v-if="settings.description">
										{{settings.description}}
									</p>
									<p v-else>
										You were invited for a usability test of the "{{model.name}}" application.
										You can try out the prototype by clicking on the <b>Start Prototype</b> button.
									</p>
									<p>
										{{getPricacy()}}
									</p>
								</div>
								<div class="MatcMarginTop">
									<div class="MatcButton MatcTestStartButton"	@click="renderTest()"	v-if="getUserTasks().length === 0">
											Start Prototype
										</div>
									<div class="MatcButton MatcTestStartButton"	@click="renderTasks()" v-else>
											Show Tasks
									</div>
								</div>
							</div>
							<div class="MatcTestContent" v-if="step === 4">
								<div class="MatcTestContentCntr">
									<h2>Tasks!</h2>
									<p>
										Please perfrom the following tasks.
									</p>
									<div v-for="t in getUserTasks()" :key="t.id">
										<h3>{{t.name}}</h3>
										<div class="MatcTestTaskDescription">
											{{t.description}}
										</div>
									</div>
								</div>

								<div class="MatcMarginTop">
									<div class="MatcButton MatcTestStartButton" @click="renderTest()">
											Start Prototype
									</div>
								</div>
							</div>
						</div>
					</transition>
				</div>
				<transition name="logoFade" v-if="step == 0">
					<div class="MatcLogoNew MatcSimulatorLoadingLogoAnimation"></div>
				</transition>
			</div>
		</div>
	</div>
	<div  class="MatcTestCntr">
		<div class="MatcTestTaskCntr MatcTestContent" ref="tastCntr" v-if="showTasks">
			<h1>Tasks</h1>
			<p>
				Please perfrom the following tasks
			</p>
			<div v-for="(t,i) in getUserTasks()" :key="t.id" :class="{'MatcTestTaskDone':taskDone[t.id] }">
					<h3>#{{i+1}} - {{t.name}} <span class="mdi mdi-check-circle" v-if="taskDone[t.id]"/> </h3>
					<div class="MatcTestTaskDescription">
						{{t.description}}
					</div>
			</div>
		</div>
		<div class="MatcTest" ref="cntr">
		</div>
	</div>
</div>
</template>
<style>
  @import url("../../style/matc.css");
  @import url("../../style/test.css");
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
import QR from 'core/QR'
import Analytics from 'dash/Analytics'
import DataFrame from 'common/DataFrame'

export default {
    name: 'TestPage',
    mixins:[Util, DojoWidget],
    data: function () {
        return {
			true: false,
			skipSplash: false,
			desktopScaleDirection: "width",
			desktopOffset: 0,
			settings: null,
			logging: true,
			model: null,
			step: 0,
			password: '',
			passwordError: '',
			simulatorEvents: [],
			taskDone: {},
			splashImage: null
        }
    },
    components: {},
	computed: {
		hasSplash () {
			return this.splashImage !== null
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
				return 400
			}
			return 0
		},
		splashBackground () {
			if (this.splashImage) {
  				return `background-image: url(/rest/images/${this.hash}/${this.splashImage.url});`
			}
			return ''
		}
	},
    methods: {
      	postCreate () {
			this.logger = new Logger('TestPage');
			var hash = this.getHashFromUri();
			this.logger.log(2,"postCreate","enter", hash);
			let log = this.$route.query.log
			this.analytics = new Analytics()

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
				var target = "/#/simulate.html?qr=true&h=" + hash;
				if(log == "false"){
					target+="&log=false";
				} else {
					target+="&log=true";
				}
				location = target;
				return;
			}
			this.db = new DomBuilder();
			if(this.$route.query.debug === "true"){
				this.logger.log(0,"postCreate","skipSplash");
				this.skipSplash = true;
			}
			/**
			 * Load the model a little later to avoid any flickering
			 */
			setTimeout(lang.hitch(this, "loadModel"), 1);
			this.logger.log(1,"postCreate","exit");
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

			var hash = this.getHashFromUri();
			let newHash = hash + this.password

			try {
				let app = await Services.getModelService().findAppByHash(newHash)
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
				let app = await Services.getModelService().findAppByHash(hash)
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
			this.setCustomSplash(settings)
			if(this.debug || this.skipSplash){
				setTimeout(lang.hitch(this,"renderTest"),0);
			} else{
				setTimeout(lang.hitch(this,"hideLogo"),500);
			}
		},
		
		setCustomSplash (settings) {
			this.logger.log(-1,"setCustomSplash","enter > ", settings);
			if (settings.splash) {
				this.splashImage = settings.splash
			}
		},

		hideLogo () {
			this.logger.log(1,"hideLogo","enter" );
			this.step = 1
			setTimeout(lang.hitch(this,"expandWindow"),500);
		},

		expandWindow () {
			this.logger.log(1,"expandWindow","enter" );
			this.step = 2
			setTimeout(lang.hitch(this,"renderSettings"),1000);
		},

		renderSettings(){
			this.logger.log(2,"renderSettings","enter" );
			this.step = 3
		},

		renderTasks (){
			this.logger.log(2,"renderTasks","enter" );
			this.step = 4
		},

		getUserTasks (){
			var tasks = [];
			if (this.settings.tasks && this.settings.tasks){
				for(var i=0; i< this.settings.tasks.length; i++){
					var task = this.settings.tasks[i];
					if (task.description && task.description != "Enter a description here"){
						tasks.push(task);
					}
				}
			}
			return tasks;
		},

		getPricacy () {
			return this.getNLS("test.welcome.privacy");
		},

		renderTest (){
			this.logger.log(-1,"renderTest","enter", this.settings.showTaskInTest );

			this.step = 10
			css.remove(this.overlay, "MatcTestMenuMax");
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


		showQRDialog (e){
			this.stopEvent(e);

			var dialog = this.db
				.div("MatchTestQRDialog MatcPadding")
				.build(dialog);

			var img = this.db.img().build(dialog)
			css.add(img, "MatcSimulatorQR");
			QR.getQRCode(this.hash, true, false).then(url => {
				img.src = url
			})

			this.db.div("MatcHint MatchTestQRDialogHint", this.getNLS("test.qr.headline"))
				.build(dialog);

			var d = new Dialog();
			d.popup(dialog, e.target);
		},


		onSimulatorEvent (e) {
			this.simulatorEvents.push(e)

			var session = new DataFrame(this.simulatorEvents);
			session = this.getActionEvents(session);
			var tasks = this.settings.tasks;
			let matches = this.analytics.getTaskPerformance(session, tasks, true);
			matches.data.forEach(match => {
				this.$set(this.taskDone, match.task, true)
			})
		},

		renderSimulator () {
			/**
			 * Render Simulator
			 */
			var screenPos = win.getBox();
			screenPos.w -= this.menuWidth;

			/**
			 * Set container size... make sure
			 */
			var cntr = this.db.div("MatcSimulatorSection").build();
			cntr.style.top="0px";
			cntr.style.left = this.menuWidth + "px";
			cntr.style.width = screenPos.w + "px";
			this.$refs.cntr.appendChild(cntr);

			if(this.model.type == "desktop"){
				this.simulator = this.renderDesktopSimulator(cntr, screenPos);
			} else {
				this.simulator = this.renderMobileSimulator(cntr, screenPos);
			}

			return cntr;
		},

		renderMobileSimulator (cntr, screenPos){
			this.logger.log(0,"renderMobileSimulator","enter > " + screenPos.w + "," + screenPos.h);

			css.add(win.body(), "MatcTestMobile");

			var factor = 0.75;
			var cntrPos = {
				w : Math.floor(screenPos.w * factor),
				h : Math.floor(screenPos.h * factor)
			};

			var pos = this.model.screenSize;

			if(cntrPos.h < this.model.screenSize.h){
				this.logger.log(0,"renderMobileSimulator","scale down...");
				pos = this.getScaledSize(cntrPos, "height", this.model);
			}

			var parent = this.db.div("MatcCenter").build(cntr);

			var wrapper = this.db.div("MatchSimulatorWrapper").build(parent);
			wrapper.style.width = Math.round(pos.w) + "px";
			wrapper.style.height = Math.round(pos.h) + "px";

			var container = this.db.div("MatchSimulatorContainer").build(wrapper)
			container.style.width = Math.round(pos.w) + "px";
			container.style.height = Math.round(pos.h) + "px";

			var s = this.createSimulator();
			s.setInvitation(this.hash);
			s.isDesktopTest = true;
			s.scrollListenTarget = "parent";
			s.placeAt(container)
			s.setModel(this.model);

			this.logger.log(0,"renderMobileSimulator","exit", pos);
			return s;
		},


		renderDesktopSimulator (cntr, screenPos){
			this.logger.log(2,"renderDesktopSimulator","enter " );

			var factor = this.getDesktopScaleFactor(screenPos);
			screenPos.w -= 64
			var cntrPos = {
				w : Math.floor(screenPos.w * factor),
				h : Math.floor(screenPos.h * factor)
			};

			var pos = this.model.screenSize;

			if (cntrPos.w < this.model.screenSize.w){
				this.logger.log(0,"renderDesktopSimulator","scale down by width...");
				pos = this.getScaledSize(cntrPos, "width", this.model);
			}



			var parent = this.db.div("MatcCenter").build(cntr);

			var wrapper = this.db.div("MatchSimulatorWrapper").build(parent);
			wrapper.style.width = Math.round(pos.w) + "px";
			wrapper.style.height = Math.round(pos.h) + "px";

			var container = this.db.div("MatchSimulatorContainer").build(wrapper)
			container.style.width = Math.round(pos.w) + "px";
			container.style.height = Math.round(pos.h) + "px";


			var s = this.createSimulator();
			s.mode ="width";
			/**
			 * FIXME: Hacky workaround for initScale() issue;
			 */
			s.isDesktopTest = true;
			s.setInvitation(this.hash);
			s.placeAt(container);
			s.scrollListenTarget = "parent";

			s.startup();
			s.setModel(this.model);

			this.logger.log(2,"renderDesktopSimulator","exit" );
			return s;
		},


		getDesktopScaleFactor (screenPos){
			var factor = (screenPos.w-this.desktopOffset) / screenPos.w;
			return Math.min(1,factor);
		},

		createSimulator (){
			if(this.debug){
				let sim = this.$new(Simulator);
				sim.on('event', (e) => this.onSimulatorEvent(e))
				sim.mode = "debug" // realy?
				sim.logData = false
				return sim
			} else {
				let sim = this.$new(Simulator);
				sim.on('event', (e) => this.onSimulatorEvent(e))
				sim.mode = "debug"
				sim.logData = this.logging
				return sim
			}
		}
    },
    mounted () {
		css.add(win.body(), 'MatcPublic')
    }
}
</script>