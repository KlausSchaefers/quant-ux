<template>
  <div>
  </div>
</template>
<script>
import ScriptEngine from '../../core/engines/ScriptEngine'
import * as ScriptToModel from '../../core/engines/ScriptToModel'

export default {
  name: 'ScriptMixin',
  methods: {

    async initLoadScripts () {
        this.logger.log(2,"initLoadScripts","enter >" );
        if (this.doNotExecuteScripts) {
            this.logger.log(2,"initLoadScripts","exit > Do not run" );
            return
        }
        const widgets = this.getLoadScripts()
        for (let i=0; i< widgets.length; i++) {
            const widget = widgets[i]
            if (widget.props.script) {
                this.logger.log(-1,"initLoadScripts","run >", widget.name );
                await this.runScript(widget.props.script, widget)
            }
        }
        this.logger.log(2,"initLoadScripts","exit", this.dataBindingValues );
    },

    getLoadScripts () {
        return Object
            .values(this.model.widgets)
            .filter(w => w.type === 'Script' && w.props.trigger === 'load')
    },

    async initRepeatScripts () {
        this.logger.log(2,"initRepeatScripts","enter >" );
        if (this.doNotExecuteScripts) {
            this.logger.log(2,"initRepeatScripts","exit > Do not run" );
            return
        }
        const widgets = this.getRepeatScripts()
        this._repeatScriptIntervals = []
        for (let i=0; i< widgets.length; i++) {
            const widget = widgets[i]
            if (widget.props.script && widget.props.delay) {
                let id = setInterval(() => {
                    this.logger.log(-1,"initRepeatScripts","run > ", widget.name );
                    this.runScript(widget.props.script, widget)
                }, widget.props.delay * 1000)
                this._repeatScriptIntervals.push(id)
            }
        }
        this.logger.log(2,"initRepeatScripts","exit", this.dataBindingValues );
    },

    cleanUpRepeatScripts () {
        this.logger.log(2,"cleanUpRepeatScripts","enter" );
        if (this._repeatScriptIntervals) {
            this._repeatScriptIntervals.forEach(id => {
                clearInterval(id)
            })
        }
    },

    getRepeatScripts () {
        return Object
            .values(this.model.widgets)
            .filter(w => w.type === 'Script' && w.props.trigger === 'repeat')
    },
 

    async executeDataScripts () {
        this.logger.log(2,"executeDataScripts","enter >" );
        if (this.doNotExecuteScripts) {
            this.logger.log(2,"executeDataScripts","exit > Do not run" );
            return
        }
        const widgets = this.getDataBindingScripts()
        for (let i=0; i< widgets.length; i++) {
            const widget = widgets[i]
            if (widget.props.script) {
                await this.runScript(widget.props.script, widget)
            }
        }
        this.logger.log(2,"executeDataScripts","exit");
    },

    getDataBindingScripts () {
        if (!this._scriptsDataBinding) {
            this._scriptsDataBinding = Object
                .values(this.model.widgets)
                .filter(w => w.type === 'Script' && w.props.trigger === 'databinding')
        }
        return this._scriptsDataBinding
    },

    async executeScript (widgetID, orginalLine) {
        this.logger.log(-2,"executeScript","enter >" + widgetID);
        const widget = this.model.widgets[widgetID]
        if (widget && widget.props.script) {
            const result = await this.runScript(widget.props.script, widget, orginalLine)
            return result
        } else {
            this.logger.error("executeScript","exit > could not find " + widgetID);
        }
    },
    async runScript (script, widget, orginalLine) {
        this.logger.log(2,"runScript","enter", widget?.name);

        const event = this.getScriptSourceEvent(orginalLine)

        return new Promise(async(resolve) => {
            const engine = new ScriptEngine()
            let result = await engine.run(script, this.model, this.dataBindingValues, event).then()


    
            if (result.status === 'ok') {     
                requestAnimationFrame( () => {
                    this.vibrate(result)
                    this.renderAppChanges(result)
                    this.renderScriptDataBinding(result)  
                    this.renderScriptTo(result, widget, orginalLine)
                    this.logger.log(1,"runScript","exit");
                    resolve(result)
                })
            } else {
                resolve(result)
            }
        }) 
    },

    vibrate(result) {
        if (result.vibratePattern) {
            this.logger.log(-1,"vibrate","enter", result.vibratePattern);
            try {
                navigator.vibrate(result.vibratePattern)
            } catch (err) {
                this.logger.error("vibrate","Err", err);
            }        
        }
    },

    getScriptSourceEvent (line) {
        const event = {
            type: 'None',
            widget:'',
            screen: ''
        }
        if (line) {
            event.type = line.event
            const widget = this.model.widgets[line.from]
            if (widget) {
                event.widget = widget.name
            } else {
                this.logger.log(-1,"getScriptSourceEvent","No widet with id ", line.from);
            }

            if (this.currentScreen) {
                event.screen = this.currentScreen.name
            }  else {
                this.logger.log(-1,"getScriptSourceEvent","No current screen ");
            }
        }
        this.logger.log(2,"getScriptSourceEvent","exit ", event);
        return event
    },

    renderAppChanges (result) {
        this.logger.log(2,"renderAppChanges","enter >", result.appDeltas);
        if (result.appDeltas) {
            result.appDeltas.forEach(change => {
                ScriptToModel.applyChange(this.model, change, this.renderFactory)
            });
        }
    },
    


    renderScriptDataBinding (result) {
        this.logger.log(2,"renderScriptDataBinding","enter >", result.viewModel);
        if (result.viewModel) {
           this.replaceDataBinding(result.viewModel)
        }
    },
    renderScriptTo (result, widget, orginalLine) {
        this.logger.log(2,"renderScriptResult","enter >" ,  orginalLine);
        if (!this.currentScreen && result.to) {
            // FIXME: This happens when a load script fires returns
            // before the page was rendered. Maybe change the ordering??
            this.logger.error("renderScriptResult","no currentscreen");
            return
        }
        if (result.to) {
            const targetScreen = Object.values(this.model.screens).find(s => s.name === result.to)
            if (targetScreen) {
                const tempLine = this.createTempLine(targetScreen.id, orginalLine)
                if(targetScreen.style.overlay){
					this.renderOverlay(tempLine, this.currentScreen.id);
                } else {
                    this.renderTransition(tempLine,this.currentScreen.id);
                }
            } else {
                this.logger.log(1,"runScript","No screen with name  >" + result.to);
                result.console.push({
                    type: 'error',
                    args: `Simulator: No screen with name '${result.to}'`
                })
            }
        } else if (widget) {
            const lines = this.getLinesForWidget(widget);
            if (lines && lines.length === 1) {
                const tempLine = this.createTempLine(lines[0].to, orginalLine)
                this.renderTransition(tempLine,this.currentScreen.id);
            }
        }
    },

    createTempLine (to, orginalLine) {
        const result =  {
            to: to
        }
        if (orginalLine) {
            result.animation = orginalLine.animation
            result.duration = orginalLine.duration
            result.easing = orginalLine.easing
            result.from = orginalLine.from
        }
        return result
    }

  }


}
</script>