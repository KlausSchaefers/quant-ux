
<template>
     <div :class="' MatcScriptEditor ' +  screenType">
        <div class="MatcScriptColumns">
            <div ref="simCntr" class="MatcScriptEditorSimulator">
        
            </div>
            <div ref="editCntr" class="MatcScriptEditorIDE">

                <div class="MatcToolbarTabs MatcToolbarTabsBig">
                    <a @click="tab='editor'" :class="{'MatcToolbarTabActive': tab === 'editor'}">Editor</a>
                    <a @click="tab='console'" :class="{'MatcToolbarTabActive': tab === 'console'}">Console</a>
                </div>
                <div class="MatcScriptEditorContent" v-if="tab === 'editor'" ref="ideCntr">
                    <Ace
                        v-if="loaded && script"
                        ref="aceEditor"
                        v-model="script"
                        @init="editorInit"
                        lang="javascript"
                        theme="chrome"
                        :width="w"
                        :height="h"></Ace>
                </div>
                <div class="MatcScriptEditorContent MatcScriptEditorConsole" v-if="tab === 'console'">
                    <div :class="'MatcScriptEditorConsoleLine ' + l.type " v-for="(l, i) in logs" :key="i">
                        {{l.args}}
                    </div>
                </div>
                <div class=""> 
                    <div class="MatcButton" @click="run"> Run </div>
                </div>
        
            </div>
        </div>
	</div>
</template>

<style lang="scss">
    @import '../../../style/toolbar/script.scss';
</style>

<script>
import DojoWidget from 'dojo/DojoWidget'
//import css from 'dojo/css'
import lang from 'dojo/_base/lang'
//import on from 'dojo/on'
//import touch from 'dojo/touch'
import domGeom from 'dojo/domGeom'
import Logger from 'core/Logger'
import DomBuilder from 'common/DomBuilder'
import Util from 'core/Util'
import Simulator from 'core/Simulator'
import ScrollContainer from 'common/ScrollContainer'
import Core from 'core/Core'

export default {
    name: 'ScriptEditor',
    mixins:[Util, DojoWidget],
    props:['value', 'app'],
    data: function () {
        return {
            jwtToken: 'NoTokenComposer',
            hash: "NoHashComposer",
            tab: 'editor',
            script: '',
            w: 400,
            h: 500,
            loaded: true,
            widget: {},
            logs: []
        }
    },
    components: {
        'Ace': () => import(/* webpackChunkName: "ace" */ 'vue2-ace-editor')
    },
    computed: {
        screenType () {
            if (this.app && (this.app.type === 'desktop' || this.app.type === 'tablet')) {
                return 'MatcScriptEditorDesktop'
            }
            return 'MatcScriptEditorMobile'
        }
    },
    methods: {
        setJwtToken (t) {
            this.jwtToken = t
        },

        setHash (h) {
            Logger.log(-1,"ScriptEditor.setHash","enter");
            this.hash = h
        },


        setModel (m){
            Logger.log(-1,"ScriptEditor.setModel","enter");
            this.orgModel = lang.clone(m);
            this.model = this.createInheritedModel(m);
            this.model = Core.addContainerChildrenToModel(this.model);
        },

        setType (type){
            this.type = type;
        },

        setWidget (w){
            Logger.log(-1,"ScriptEditor.setWidget", "enter > ", w);
            this.widget = w;
            if (this.widget?.props?.script) {
                this.script = this.widget.props.script
                Logger.log(-1,"ScriptEditor.setWidget", "exit > " + this.script);
            }
        },

        setScreen (s){
            Logger.log(1,"ScriptEditor.setScreen", "enter > " + s.id);
            this.screen = s;
            this.render(s);
        },

        editorInit () {
            require(/* webpackChunkName: "ace" */ 'brace/ext/language_tools') //language extension prerequsite...
            require(/* webpackChunkName: "ace" */ 'brace/mode/javascript')
            require(/* webpackChunkName: "ace" */ 'brace/theme/chrome')

            const editor = this.$refs.aceEditor.editor
            editor.setOptions({
                enableBasicAutocompletion: false,
                enableSnippets: false,
                enableLiveAutocompletion: true
            });

        },

        render (scrn){
            this.cleanUpTempListener();

            /**
             * Render Simulator and surpress onLoadAniamtion
             */
            const sim = this.renderSimulator(this.$refs.simCntr);
            sim.doNotRunOnLoadAnimation = true
            sim.setHash(this.hash)
            if (scrn) {
                sim.setStartScreen(scrn);
            }
            sim.setModel(this.orgModel);
            this.simulator = sim;

            /**
             * Get size for ace
             */
            const idePos = domGeom.position(this.$refs.ideCntr);
            this.w = idePos.w - 16
            this.h = idePos.h - 16
            this.loaded = true
        },


        renderSimulator (cntr){

            const db = new DomBuilder();

            const domPos = domGeom.position(this.domNode);
            const pos = domGeom.position(cntr);
            pos.w -=30;
            pos.h = domPos.h;

            const container = db.div("MatchSimulatorContainer MatcAnimationComposerSimulator")
                .h(pos.h)
                .w(pos.w)
                .build();

            const scroller = this.$new(ScrollContainer, {canDestroy:true});
            scroller.placeAt(container);

            const s = this.$new(Simulator, {mode : "debug", logData : false, runTimerLinesOnScreenLoad : false, isDesktopTest:true, isWiringEvents:true});
            s.scrollListenTarget = "parent";
            /**
             * We do not want to resize the parent.
             * Therefore we replace the method with an empty one
             */
            s.initParent = () => {};

            s.setScrollContainer(scroller);
            scroller.wrap(s.domNode);
            cntr.appendChild(container);
           return s;
        },

        async run () {
            Logger.log(-1, 'ScriptEditor.run()', this.script)
            this.$emit('run', this.script)

            try {
                const result = await this.simulator.runScript(this.script)
                if (result) {
                    if (result.console) {
                        this.logs = result.console
                    }
                }
            } catch (err) {
                  Logger.log(-1, 'ScriptEditor.run() > error', err)
            }
           
        },
     


        getValue (){
            this.script
        },

        destroy (){
            if(this.simulator){
                this.simulator.destroy();
            }
        }
    },
    mounted () {
        Logger.log(-1, 'ScriptEditor.mounted()', this.app)
        if (this.app) {
            this.setModel(this.app)
        }
        if (this.value) {
            this.setWidget(this.value)
        }

        this.render()
    }
}
</script>