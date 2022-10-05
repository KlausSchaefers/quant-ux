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
               await this.runScript(widget.props.script, widget)
            }
        }
        this.logger.log(-2,"initLoadScripts","exit", this.dataBindingValues );
    },

    getLoadScripts () {
        return Object
            .values(this.model.widgets)
            .filter(w => w.type === 'Script' && w.props.trigger === 'load')
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
        this.logger.log(-2,"executeDataScripts","exit");
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
        if (!this.currentScreen) {
            // FIXME: This happens when a load script fires returns
            // before the page was rendered. Maybe change the ordering??
            this.logger.error("renderScriptResult","no currentscreen");
            return
        }
        if (result.to) {
            let targetScreen = Object.values(this.model.screens).find(s => s.name === result.to)
            if (targetScreen) {
                const tempLine = this.createTempLine(targetScreen.id, orginalLine)
                this.renderTransition(tempLine,this.currentScreen.id);
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