<template>
  <div>
  </div>
</template>
<script>


export default {
    name: 'TooltipMixin',
    methods: {
        showTooltip (screenID, widgetID){
            
            const widget = this.model.widgets[widgetID]
            if (widget) {
                console.debug("showTooltip", widget.name)
            }
        },
        hideTooltip () {
           // console.debug("hideTooltip", widgetID)
           
        }
    }
}
</script>