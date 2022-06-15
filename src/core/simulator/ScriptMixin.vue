<template>
  <div>
  </div>
</template>
<script>
import ScriptEngine from '../../core/engines/ScriptEngine'


export default {
  name: 'ScriptMixin',
  methods: {
    executeScript (widgetID) {
        this.logger.log(-2,"runScript","executeScript >" + widgetID);

    },
    async runScript (script) {
        this.logger.log(-2,"runScript","enter >" + script);

        const engine = new ScriptEngine()
        let result = await engine.run(script, this.model, this.dataBindingValues).then()
 
        if (result.status === 'ok') {     
            this.renderScriptDataBinding(result)  
            this.renderScriptTo(result)
        }

       console.debug(result)
        return result
    },
    renderScriptDataBinding (result) {
        this.logger.log(-1,"renderScriptDataBinding","enter >", result.viewModel);
        if (result.viewModel) {
           this.replaceDataBinding(result.viewModel)
        }
    },
    renderScriptTo (result) {
        this.logger.log(-2,"renderScriptResult","enter >" , result);
        if (result.to) {
            let targetScreen = Object.values(this.model.screens).find(s => s.name === result.to)
            if (targetScreen) {
                // get the from line, and copy animation props?
                this.renderTransition({
                    to: targetScreen.id
                },this.currentScreen.id);
            } else {
                this.logger.log(-2,"runScript","No screen with name  >" + result.to);
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