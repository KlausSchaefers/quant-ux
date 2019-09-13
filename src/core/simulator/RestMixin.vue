<template>
  <div>
  </div>
</template>
<script>

export default {
	name: 'RestMixin',
  methods: {
    async executeRest (screenID, widgetID, widget, line) {
      this.logger.log(-1,"executeRest","enter >  rest:" + widget.id, line );
    }
  }
}
</script>