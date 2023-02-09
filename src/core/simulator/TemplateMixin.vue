<template>
  <div>
  </div>
</template>
<script>

export default {
	name: 'TemplateMixin',
  methods: {
      fireTemplateLineIfNeeded (screenID, widgetID, type) {
        const widget = this.model.widgets[widgetID]
        if (widget.template) {  
          let lines = this.getRootTemplateLines(widget.template)
          if (lines) {     
            this.executeTemplateLine(screenID, widgetID, lines, type)          
          }
        }
      },

      executeTemplateLine(screenID, widgetID, lines, type) {
        this.logger.log(2,"executeTemplateLine","enter > " + widgetID, type);
        const line = this.getLineForGesture(lines, type);
        if (line) {
          if (type === 'click' && !line.isTemplateTransition) { // && line.to is screen
            	this.executeLine(this.currentScreen.id, "", line);
              return
          }
        }
      },

      initRootTemplateLines (model) {
        this.logger.log(2,"initRootTemplateLines","enter > ");
        this._rootTemplateLines = {}
        Object
          .values(model.widgets)
          .filter(w => w.isRootTemplate)
          .forEach(w => {
              const lines = this.getLinesForWidget(w)
              this._rootTemplateLines[w.template] = lines
          })
 
      },

      getRootTemplateLines (templateId) {
        return this._rootTemplateLines[templateId]
      }

    }
}
</script>