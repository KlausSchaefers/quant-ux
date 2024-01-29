
<template>
  
            <div :class="['MatcTestSplash MatcTestSplashMax MactMainGradient', {'MatcTestCustomSplash': hasSplash}]" data-dojo-attach-point="overlay" :style="splashBackground" v-if="hasSettings">
                <div v-if="hasSplash  && step < 5" class="MatcTestCustomSplashPowered">Powered by Quant-UX</div> 
                <div :class="['MatcTestLogoCntr', {'MatcTestLogoCntrMax': step > 1}]" >
    

                    <div :class="['MatcTestProgressCntr']">
                        <div class="MatcTestProgressBar" >
                        </div>
                        <transition name="fade">
                            <div v-if="step > 2">
                                <div class="MatcTestContent" v-if="step === 6">
                                    <div class="MatcTestContentCntr">
                                        <h2>{{getNLS("simulator.password.title")}} </h2>
                                        <p v-html="getNLS('simulator.password.msg')">
                                            
                                        </p>
                                        <input v-model="password" class="form-control" @keypress.enter="setPassword"/>
                                        <div class="MatcButton MatcMarginTop" @click="setPassword()">
                                            {{getNLS("simulator.password.next")}}
                                        </div>
                                        <span class="MatcError" style="margin-left:20px">
                                            {{passwordError}}
                                        </span>
                                    </div>
    
    
                                </div>
                                <div class="MatcTestContent" v-if="step === 3">
                                    <div class="MatcTestContentCntr">
                                        <h2> {{getNLS("simulator.welcome.title")}} !</h2>
                                        <p v-if="settings.description">
                                            {{settings.description}}
                                        </p>
                                        <p v-else v-html="getNlSWithReplacement('simulator.welcome.msg', {'name': model.name})">
                                        </p>
                                        <p v-html="getNLS('simulator.welcome.privacy')"></p>
                                        <p v-html="getNLS('simulator.welcome.privacy1')"></p>
                                        <p v-html="getNLS('simulator.welcome.click-start')"></p>
                                    </div>
                                    <div class="MatcMarginTop">
                                        <div class="MatcButton MatcButtonPrimary MatcTestStartButton"	@click="onStart()"	v-if="getUserTasks().length === 0">
                                                {{getNLS("simulator.welcome.start")}}
                                        </div>
                                        <div class="MatcButton MatcButtonPrimary MatcTestStartButton"	@click="renderTasks()" v-else>
                                                {{getNLS("simulator.welcome.showTasks")}}
                                        </div>
                                    </div>
                                </div>
                                <div class="MatcTestContent" v-if="step === 4">
                                    <div class="MatcTestContentCntr">
                                        <h2>{{getNLS("simulator.tasks.title")}} !</h2>
                                        <p>
                                            {{getNLS("simulator.tasks.msg")}}
                                        </p>
                                        <div v-for="t in getUserTasks()" :key="t.id">
                                            <h4>{{t.name}}</h4>
                                            <div class="MatcTestTaskDescription">
                                                {{t.description}}
                                            </div>
                                        </div>
                                    </div>
    
                                    <div class="MatcMarginTop">
                                        <div class="MatcButton MatcButtonPrimary MatcTestStartButton" @click="onStart()">
                                            {{getNLS("simulator.welcome.start")}}
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
                <div class="MatcTestVersion">v5.0.2</div>
            </div>
    </template>
    <style>
    </style>
    <style lang="scss">
      @import "../../style/test.scss";
    </style>
    <style lang="sass">
    </style>
    
    <script>
    import lang from 'dojo/_base/lang'
    import Logger from 'common/Logger'
    import NLS from 'common/NLS'

    export default {
        name: 'Splah',
        props: ['settings', 'model', 'hash'],
        mixins:[NLS],
        data: function () {
            return {
                splashImage: null,
                step: 0               
            }
        },
        components: {},
        computed: {
            hasWindows () {
                return navigator.platform.indexOf('Win') > -1
            },
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
                    return 256
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

            onStart (e) {
                this.$emit("start", e)
            },
     
            setTestsettings (settings){
                this.logger.log(1,"setTestsettings","enter > ", settings);
                this.settings = settings;
                this.setCustomSplash(settings)
                setTimeout(() => this.hideLogo(), 500);
            },
            
            setCustomSplash (settings) {
                this.logger.log(1,"setCustomSplash","enter > ", settings);
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
    
            getPricacy () {
                return this.getNLS("test.welcome.privacy");
            }   
      
        },
        watch: {
            model (m) {
                this.model = m
            },
            settings (s) {
                this.setTestsettings(s)
            }
        },
        mounted () {
            this.logger = new Logger('Splash');
        }
    }
    </script>
    