
<template>
    <div class="MatcCanvas MatcAnalyticCanvas">
     
    </div>
  </template>
  
  
  <script>
  
  import on from "dojo/on";
  import DomBuilder from "common/DomBuilder";
  import DataFrame from "common/DataFrame";
  import Analytics from "dash/Analytics";
 
  export default {
    name: "DropOff",
    mixins: [],
    data: function () {
      return {
      };
    },
    components: {},
    methods: {
     
  
      /**********************************************************************
       * DropOff
       **********************************************************************/
  
      _render_global_DropOff() {
        this.logger.log(1, "_render_global_DropOff", "entry > ", this.analyticParams.task);
        this.setBW(true);
        if (this.analyticParams.task) {
          if (this.analyticParams.time) {
            this._render_dropoff_task_time(this.analyticParams.task);
          } else {
            this._render_dropoff_task_success(this.analyticParams.task);
          }
        } else {
          this.showError('No task selected')
        }
      },
  
       _render_dropoff_task_time (task) {
  
        const db = new DomBuilder()
  
        const df = new DataFrame(this.events);
        const analytics  = new Analytics();
        const funnel = analytics.getFunnelSummary(df, task, this.annotation);
  

  
        const length = task.flow.length
        if (task.flow && task.flow.length > 1) {
  
          /**
           * We take here to total task time...
           */
          const maxTime = Math.max(1,funnel[funnel.length-1].durationMean)
  
          for (let i=0; i < task.flow.length - 1; i++){
            const startSummary = funnel[i+1]
            const endSummary = funnel[i+2]
            const start = task.flow[i]
            const end = task.flow[i+1]
  
  
            const time = endSummary.durationMean - startSummary.durationMean
            const p = Math.min(1, time  / maxTime)
  
  
            const startPos = this._getDropOffBoxPosition(start, i , length)
            const endPos = this._getDropOffBoxPosition(end, i+ 1, length)
            const line = [startPos, endPos]
  
            let color = this.mixColor(p)
            let width = Math.max(3, Math.round(this.dropOffLineWidth * p))
            this.drawAnalyticLine('dropOffLine'+i,line, color , width, this.taskLineOpacity);
  
            /**
             * Render Points
             */
            this._renderDropOffEvent(endPos.x, endPos.y, 'FlowStep', db, color, width + this.dropOffEventWidth, Math.round(time / 100) / 10, 's')
            if (i === 0) {
                color = this.mixColor(p)
                width = Math.max(3, Math.round(this.dropOffLineWidth * p))
                this._renderDropOffEvent(startPos.x, startPos.y, 'FlowStep', db, color, width + this.dropOffEventWidth, '0', 's')
            }
  
          }
        } else {
          this.showError('Cannot show task times. The selected task has only one step.')
        }
      },
  
      _render_dropoff_task_success (task) {
  
        const db = new DomBuilder()
  
        const df = new DataFrame(this.events);
        const analytics  = new Analytics();
        const funnel = analytics.getFunnelSummary(df, task, this.annotation);
  
        const length = task.flow.length
        if (task.flow && task.flow.length > 1) {
          for (let i=0; i < task.flow.length - 1; i++){
  
            const startSummary = funnel[i+1]
            const endSummary = funnel[i+2]
            const start = task.flow[i]
            const end = task.flow[i+1]
  
            const startPos = this._getDropOffBoxPosition(start, i, length)
            const endPos = this._getDropOffBoxPosition(end, i + 1, length)
            const line = [startPos, endPos]
  
            let color = this.greenToRed(endSummary.p)
            let width = Math.max(3, Math.round(this.dropOffLineWidth * endSummary.p))
            this.drawAnalyticLine('dropOffLine'+i,line, color , width, this.taskLineOpacity);
  
            /**
             * Render drop off
             */
            if (startSummary && endSummary) {
                const p = startSummary.p - endSummary.p
                const dropOffPos = {
                  x: startPos.x + 100,
                  y: startPos.y + 100
                }
                const dropOffLine = [startPos, dropOffPos]
                width = Math.max(3, Math.round(this.dropOffLineWidth * p))
                this.drawAnalyticLine('dropOffLineDrop'+i,dropOffLine, this.dropOffLineColor , width, this.taskLineOpacity);
                this._renderDropOffEvent(dropOffPos.x, dropOffPos.y, 'FlowStep', db, this.dropOffLineColor, width + this.dropOffEventWidth, Math.round(-100 * p))
            }
  
            /**
             * Render points
             */
            this._renderDropOffEvent(endPos.x, endPos.y, 'FlowStep', db, color, width + this.dropOffEventWidth, Math.round(endSummary.p * 100))
            if (i === 0) {
                color = this.greenToRed(startSummary.p)
                width = Math.max(3, Math.round(this.dropOffLineWidth * startSummary.p))
                this._renderDropOffEvent(startPos.x, startPos.y, 'FlowStep', db, color, width + this.dropOffEventWidth, Math.round(startSummary.p * 100))
            }
  
          }
        } else {
          this.showError('Cannot show task times. The selected task has only one step.')
        }
      },
  
      _getDropOffBoxPosition (e, i = 0, l = 1) {
  
        if (e.widget) {
          let widget = this.sourceModel.widgets[e.widget]
          if (widget) {
              let pos = {}
              pos.x = Math.round(widget.x + widget.w / 2);
              pos.y = Math.round(widget.y + widget.h / 2);
              return pos
          } else {
             this.logger.warn("_geDropOffBoxPosition", "no widget > ", e.widget);
          }
  
        }
        if (e.screen) {
          let sourceScreen = this.sourceModel.screens[e.screen]
          if (sourceScreen) {
              let pos = {}
              pos.x = Math.round(sourceScreen.x + sourceScreen.w / 2);
              pos.y = Math.min(sourceScreen.y + sourceScreen.h, Math.round(sourceScreen.y + sourceScreen.h / 3) + (sourceScreen.h * i / (l * 2)));
              return pos
          } else {
             this.logger.warn("_geDropOffBoxPosition", "no screen > ", e.screen);
          }
        }
      },
  
      _renderDropOffEvent(x, y, type, db, color, width, p, unit='%') {
        var cntr = db
          .div("MatcAnalyticCanvasEventCntr")
          .build(this.widgetContainer);
        cntr.style.left = Math.round(x) + "px";
        cntr.style.top = Math.round(y) + "px";
  
        var div = db
          .div("MatcAnalyticCanvasEvent MatcAnalyticCanvasEvent" + type,)
          .build(cntr);
  
        var r = Math.max(5, Math.round(width));
        div.style.width = r + "px";
        div.style.height = r + "px";
        div.style.top = -1 * Math.round(r / 2) + "px";
        div.style.left = -1 * Math.round(r / 2) + "px";
        div.style.background = color
        this.tempOwn(on(div, 'click', (e) => this.selectDropOffPoint(e)))
      
        if (unit) {
          db.span('MatcAnalyticCanvasEventLabel', p + unit).build(div)
        }
  
        return div;
      },
  
      selectDropOffPoint () {
  
      }
    },
    mounted() {},
  };
  </script>