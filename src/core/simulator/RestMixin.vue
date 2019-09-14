<template>
  <div>
  </div>
</template>
<script>
import RestEngine from 'core/RestEngine'
// import lang from 'dojo/_base/lang'

export default {
	name: 'RestMixin',
  methods: {
    async executeRest (screenID, widgetID, widget, line) {
      this.logger.log(1,"executeRest","enter >  rest:" + widget.id, line );

      let rest = widget.props.rest
      
      /**
       * get al the data we need!
       */
      let requiredDataBindings = RestEngine.getNeededDataBings(rest)
      let data = {}
      requiredDataBindings.forEach(path => {
        let value = this.getDataBindingByPath(path)
        data[path] = value
      })

      try {
        let result = await RestEngine.run(rest, data)
        if (rest.output.databinding) {
          this.setDataBindingByKey(rest.output.databinding, result)
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