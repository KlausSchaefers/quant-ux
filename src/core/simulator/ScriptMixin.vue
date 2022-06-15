<template>
  <div>
  </div>
</template>
<script>
import ScriptEngine from '../../core/engines/ScriptEngine'

export default {
  name: 'ScriptMixin',
  methods: {
    async runScript (script) {
        this.logger.log(-2,"runScript","enter >" + script);

        const engine = new ScriptEngine()
        let result = await engine.run(script, this.model, this.dataBindingValues)

        return result
    }
  }
}
</script>