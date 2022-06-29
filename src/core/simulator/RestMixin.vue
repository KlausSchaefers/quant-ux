<template>
  <div>
  </div>
</template>
<script>
import RestEngine from 'core/RestEngine'

export default {
	name: 'RestMixin',
  methods: {
    async executeRest (screenID, widgetID, widget, line) {
      this.logger.log(1,"executeRest","enter >  rest:" + widget.id, line );

      const rest = widget.props.rest
      
      /**
       * get al the data we need!
       */
      const requiredDataBindings = RestEngine.getNeededDataBings(rest)
      let data = {}
      requiredDataBindings.forEach(path => {
        const value = this.getDataBindingByPath(path)
        data[path] = value
      })

      try {
        const result = await RestEngine.run(rest, data)
        if (rest.output.databinding) {
          this.setDataBindingByKey(rest.output.databinding, result)
          // since 4.0.70 we also can the data binding...
          this.updateAllDataBindings(this.currentScreen.id, rest.output.databinding, result)
          this.logger.log(-1, "executeRest","set data " + rest.output.databinding, this.dataBindingValues);
        }
        return true
      } catch (e) {
        if (rest.output.databinding) {
          this.setDataBindingByKey(rest.output.databinding, "ERROR")
        }
        this.logger.error("executeRest","error", e);
        this.emit('onRestError', e, rest, data)
      }
      return false
    }
  }
}
</script>