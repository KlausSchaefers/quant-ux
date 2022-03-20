<template>
  <div>
  </div>
</template>
<script>


export default {
	name: 'TemplateMixin',
  methods: {
      fireTemplateLineIfNeeded (screenID, widgetID, type) {
        	//this.logger.log(-1,"fireTemplateLineIfNeeded","enter > " + widgetID + " > type:" + type);

          if (type === 'click') {
            let lines = this.getTemplateLines(widgetID, type)
            if (lines) {
              lines = lines.filter(l => l.event === type)
              if (lines.length === 1) {
                let line = lines[0]
                this.executeTemplateLine(screenID, widgetID, line)
              } else {
                this.logger.error("fireTemplateLineIfNeeded","ERROR > Too many lines for " + widgetID, lines);
              }
            }
          }
         
      },

      executeTemplateLine(screenID, widgetID, line) {
        this.logger.log(-1,"executeTemplateLine","enter > " + widgetID, line.to);

        /**
         * chekc the kind of transition....
         */
      },

      getTemplateLines (widgetID) {

        /** cache result for speedup */
        if (!this._templateLines) {
          this._templateLines = {}
        }

        if (!this._templateLines[widgetID]) {
          const widget = this.model.widgets[widgetID]
          if (widget && widget.template) {
            this.logger.log(-1,"getTemplateLines","enter > " + widgetID);
            let lines = this.getTemplatesLinesWithTransitions(widget.template)  
            if (lines){
              this._templateLines[widgetID] = lines
            }            
          }
        }
        return this._templateLines[widgetID]
      },

      getTemplatesLinesWithTransitions (templateID) {
        if (!this._templateWithTransitions) {
          this._templateWithTransitions = {}
          if (this.model.templates) {
            for (let id in this.model.widgets) {
              let widget = this.model.widgets[id]
              if (widget.template) {
                let lines = this.getLinesForWidget(widget)
                if (lines) {       
                  lines.forEach(l => {
                    if (l.isTemplateTransition) {
                      if (!this._templateWithTransitions[widget.template]) {
                        this._templateWithTransitions[widget.template] = []
                      }
                      this._templateWithTransitions[widget.template].push(l)
                    }
                  })
                }                
              }              
            }
          }
          this.logger.log(3,"getAllTemplatesWithTransitions","enter > ", this._templateWithTransitions);
        }

        return this._templateWithTransitions[templateID]
      }
    }
}
</script>