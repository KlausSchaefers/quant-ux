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
    executeScript (widgetID) {
        this.logger.log(-2,"runScript","executeScript >" + widgetID);

    },
    async runScript (script) {
        this.logger.log(2,"runScript","enter >");

        const engine = new ScriptEngine()
        let result = await engine.run(script, this.model, this.dataBindingValues).then()
 
        if (result.status === 'ok') {     
            requestAnimationFrame( () => {
                this.renderAppChanges(result)
                this.renderScriptDataBinding(result)  
                this.renderScriptTo(result)
            })
        }
        return result
    },
    renderAppChanges (result) {
        this.logger.log(-1,"renderAppChanges","enter >", result.appDeltas);
        if (result.appDeltas) {
            result.appDeltas.forEach(change => {
                ScriptToModel.applyChange(this.model, change, this.renderFactory)
            });
        }
    },
    


    renderScriptDataBinding (result) {
        this.logger.log(1,"renderScriptDataBinding","enter >", result.viewModel);
        if (result.viewModel) {
           this.replaceDataBinding(result.viewModel)
        }
    },
    renderScriptTo (result) {
        this.logger.log(1,"renderScriptResult","enter >" , result);
        if (result.to) {
            let targetScreen = Object.values(this.model.screens).find(s => s.name === result.to)
            if (targetScreen) {
                // get the from line, and copy animation props?
                this.renderTransition({
                    to: targetScreen.id
                },this.currentScreen.id);
            } else {
                this.logger.log(1,"runScript","No screen with name  >" + result.to);
                result.console.push({
                    type: 'error',
                    args: `Simulator: No screen with name '${result.to}'`
                })
            }
        }
    }
  }

}
</script>