
<template>
    <div class="MatcCanvas MatcAnalyticCanvas">
    </div>
  </template>
  

  <script>
 
  import css from "dojo/css";
  import on from "dojo/on";
  import lang from "dojo/_base/lang";
  import DomBuilder from "common/DomBuilder"; 
  
  export default {
    name: "UserJourney",
    mixins: [],
    data: function () {
      return {
      };
    },
    components: {},
    methods: {

      highlightSession (sessionID = false) {
        if (!this.analyticParams.tree) {
          this.highlightAnalyticLine(sessionID)
        }
      },


      highlightAnalyticLine(sessionID) {
        this.logger.log(1, "highlightAnalyticLine", "entry > ", sessionID);
          if (this.analyticLines) {
            for (let id in this.analyticLines) {
              this.hideOrShowLine(id, sessionID)    
            }
          }
      },

      hideOrShowLine (id, sessionID) {
        const line = this.analyticLines[id]
        if (line) {
          if (!sessionID || sessionID === id) {
            line.style('opacity', 1)
          } else {
            line.style('opacity', 0)
          }
        }
        // fix to also show task lines
        const line2 = this.analyticLines[id + 'taskBackGround']
        if (line2) {
          if (!sessionID || sessionID +'taskBackGround' === id + 'taskBackGround') {
            line2.style('opacity', 1)
          } else {
            line2.style('opacity', 0)
          }
        }
        if (this.analyticCircles[id]) {
          const divs = this.analyticCircles[id]             
          divs.forEach(div => {
            if (!sessionID || sessionID === id) {
              div.style.opacity = 1                  
            } else {
              div.style.opacity = 0
            }
          })   
        }
      },


    
  
      _render_global_UserJourney() {
        this.logger.log(1, "_render_global_UserJourney", "entry > ");
        this.setBW(true);
        this.cleanUpAnalytics()
        if (!this.analyticParams.tree) {
          this._renderUserSingleLines();
        } else {
          this._renderUserTree();
        }
      },
  
      _renderUserTree() {
        let sessions = this.getUserJourney();
        let db = new DomBuilder();
        let time = this.analyticParams.time
        
        let selectedSessions = this.analyticParams.sessions;
        let graph = {};
        let maxCount = 0;
        let maxMeanDuration = 0
      
        for (let sessionID in selectedSessions) {
          if (selectedSessions[sessionID] === true) {
            let session = sessions[sessionID];
            if (session) {
              this._getSessionGraph(session, graph, time);
              maxCount++;
            } else {
              console.debug("_renderUserTree() > No session for ", sessionID);
            }
          }
        }
  
        /**
         * We might have the situation that the users creates loopes
         * in one session. This will cause the count to be bigger than the
         * session count (maxCount). This messes up the graph. To make it
         * nice again, we update maxCount
         */
    
        for (let id in graph) {
          const l = graph[id]
          if (l.count > maxCount) {
            console.warn("_renderUserTree() > Update maxcount, because l.count bigger than max count", )
            maxCount = l.count
          }
          const meanDuration = l.duration / l.count
          maxMeanDuration = Math.max(meanDuration, maxMeanDuration)
        }
  
        const divs = {};
        for (let id in graph) {
          const l = graph[id];
          const line = [];
          line.push({
            x: l.from.x,
            y: l.from.y,
            d: "right",
          });
          line.push({
            x: l.to.x,
            y: l.to.y,
            d: "right",
          });
  
          const meanDuration = l.duration / l.count
          const p = time ?
              Math.min(1, meanDuration / maxMeanDuration):
              Math.min(1, l.count / maxCount)
  
          const width = Math.min(15, Math.max(1, Math.round(p * 25))) + 1;
          const color = this.mixColor(Math.min(1, p));
          const toID = l.to.x + "," + l.to.y;
          const fromID = l.from.x + "," + l.from.y;
          
          if (!divs[toID]) {
            divs[toID] = this._renderTreeEvent(l.to.x, l.to.y, width, color, db);
          }
        
          if (!divs[fromID]) {
            divs[fromID] = this._renderTreeEvent(l.from.x,l.from.y,width,color,db);
          }
  
          this.drawAnalyticLine(id, line, color, width, this.taskLineOpacity);
        }
      },
  
  
  
      _renderTreeEvent(x, y, width, color, db) {
        const cntr = db
          .div("MatcAnalyticCanvasEventCntr")
          .build(this.widgetContainer);

        cntr.style.left = Math.round(x) + "px";
        cntr.style.top = Math.round(y) + "px";
  
        const div = db
          .div("MatcAnalyticCanvasEvent MatcAnalyticCanvasEvent")
          .build(cntr);
  
        const r = Math.round(width * 2);
        div.style.width = r + "px";
        div.style.height = r + "px";
        div.style.top = -1 * Math.round(r / 2) + "px";
        div.style.left = -1 * Math.round(r / 2) + "px";
        div.style.background = color;
      },
  
      _renderUserSingleLines() {
        const sessions = this.getUserJourney();
        const outlierScores = this.getOutlierScores()

        const taskPerformance = this.getTaskPerformance();
        const db = new DomBuilder();
  
        let task = null;
        if (this.analyticParams.task !== false && this.analyticParams.task >= 0) {
          task = this.testSettings.tasks[this.analyticParams.task];
        }

        const selectedSessions = this.analyticParams.sessions;
        for (let sessionID in selectedSessions) {
          if (selectedSessions[sessionID] === true) {
            const session = sessions[sessionID];
            const matches = taskPerformance[sessionID];
            const outlierScore = outlierScores[sessionID]
            if (session) {
              this._renderUserGraph(sessionID, session, db, task, matches, outlierScore);
            } else {
              console.debug( "_render_global_UserJourney() > No session for ", sessionID   );
            }
          }
        }

        if (this.analyticParams.outlier) {
          this.showHint(`Found ${Object.values(outlierScores).filter(v => v ===1).length} outliers`)
        }
      },
  
      
  
      _renderUserGraph(sessionID, session, db, task, matches, isOutlier) {
    
        const sessionEvents = session.data;
        const line = [];
        const sessionLength = sessionEvents.length
        const matchLines = [];
  
        let e = null;
        let lastDurationEvent
        let duration = 0
        let maxDuration = 0
        let match;
        if (task && matches) {
          match = matches[task.id];
        }
  
        // compute line
        for (let i = 0; i < sessionLength; i++) {
          e = sessionEvents[i];
          if (lastDurationEvent) {
            duration = e.time - lastDurationEvent.time
            maxDuration = Math.max(duration, maxDuration)
          }
          
          const screenID = this.getEventScreenId(e);
          const sourceScreen = this.sourceModel.screens[screenID];
          const zoomedScreen = this.model.screens[screenID];
          if (sourceScreen && zoomedScreen) {
            if (e.type == "SessionStart") {
              const x = sourceScreen.x - Math.max(10, Math.round(30 * this.zoom));
              const y = sourceScreen.y + Math.max(10, Math.round(30 * this.zoom));
              line.push({ x: x, y: y, d: "right", duration:duration, type: e.type, session: e.session });
            } else if (e.x >= 0 && e.y >= 0 && !e.noheat) {
              const x = e.x * sourceScreen.w + sourceScreen.x;
              const y = e.y * sourceScreen.h + sourceScreen.y;
              line.push({ x: x, y: y, d: "right", duration: duration , type: e.type, session: e.session});
              lastDurationEvent = e
            }
            if (match && match.startPosition <= i && match.endPosition >= i) {
              const point = line[line.length - 1];
              point.match = true
              matchLines.push(point);
            }
          } else {
            console.warn("_renderUserGraph()", "Screen is not there", e.screen);
          }
        }
        
        /** Since 4.0.60 we add a last node, if it was screen load */
        if (e && e.type === 'ScreenLoaded') {
          const screenID = this.getEventScreenId(e);
          const sourceScreen = this.sourceModel.screens[screenID];
          let x = Math.round(sourceScreen.x + sourceScreen.w / 2);
          let y = Math.round(sourceScreen.y + sourceScreen.h / 2);
          line.push({ x: x, y: y, d: "right", duration:duration, type: e.type, session: e.session});
          if (match && match.startPosition <=  sessionLength-1 && match.endPosition >= sessionLength-1) {
              const point = line[line.length - 1];
              point.match = true
              matchLines.push(point);
            }
        }
  
        this.analyticCircles[sessionID] = []
        // draw all points
        for (let i = 0; i < line.length; i++) {
          const p = line[i]
          const width = Math.round(40 * (p.duration / maxDuration)) + 25
          const [div, halo, cntr] = this._renderScreenEvent(p.x,p.y, p.type, "",db, p.session, width);
          if (i == line.length -1) {
            css.add(cntr, "MatcAnalyticCanvasEventSessionEnd");
            div.style.background = this.userJourneyEndColor
            halo.style.background = this.userJourneyEndColor + 28;
            halo.style.borderColor = this.userJourneyEndColor;
          } else if (i > 0) {
            if (p.match) {
              div.style.background = this.analyticParams.taskColor;
              halo.style.background = this.analyticParams.taskColor + 28;
              halo.style.borderColor = this.analyticParams.taskColor;
            } else if (isOutlier && this.analyticParams.outlier) {
            
              div.style.background = this.analyticParams.outlierColor
              halo.style.background = this.analyticParams.outlierColor + 28;
              halo.style.borderColor = this.analyticParams.outlierColor;

            } else {
              div.style.background = this.analyticParams.color
              halo.style.background = this.analyticParams.color + 28;
              halo.style.borderColor = this.analyticParams.color;
            }
          }
          this.analyticCircles[sessionID].push(cntr)
      


        }
    
        /**
         * Render successful lines on top
         */
        let lineColor = this.analyticParams.color
        let lineOpacity = this.taskLineOpacity
        let lineWidth = 2

        if (this.analyticParams.outlier) {
          if (isOutlier) {
            lineColor = this.analyticParams.outlierColor
            lineOpacity = this.taskLineOpacity
            lineWidth = 4
          } else {
            lineOpacity = this.taskLineOpacity * 0.5
          }
        }
        
        if (task) {
          lineOpacity = this.taskLineOpacity * 0.5
          this.drawStraightAnalyticLine(sessionID+"taskBackGround", line, lineColor, lineWidth, lineOpacity);
          this.drawStraightAnalyticLine(sessionID, matchLines,this.analyticParams.taskColor, 4 ,this.taskLineOpacity);
        } else {
          this.drawStraightAnalyticLine(sessionID,line, lineColor, lineWidth, lineOpacity);
        }
  
        return false;
      },
  
     
      _renderScreenEvent(x, y, type, label, db, screenID, width, r = 15) {
        const cntr = db
          .div("MatcAnalyticCanvasEventCntr")
          .build(this.widgetContainer);
        cntr.style.left = Math.round(x) + "px";
        cntr.style.top = Math.round(y) + "px";
  
  
        const halo = db
          .div("MatcAnalyticCanvasEventHalo")
          .build(cntr);
  
        halo.style.width = width + "px";
        halo.style.height = width + "px";
        halo.style.top = -1 * Math.round(width / 2) + "px";
        halo.style.left = -1 * Math.round(width / 2) + "px";
   
        const div = db
          .div("MatcAnalyticCanvasEvent MatcAnalyticCanvasClickableEvent MatcAnalyticCanvasEvent" + type)
          .build(cntr);
  
        div.style.width = r + "px";
        div.style.height = r + "px";
        div.style.top = -1 * Math.round(r / 2) + "px";
        div.style.left = -1 * Math.round(r / 2) + "px";
  
        this.tempOwn(on(div, "click", lang.hitch(this, "onScreenEventClick", screenID)));
  
        return [div, halo, cntr];
      },
  
      onScreenEventClick(id, e) {
        this.stopEvent(e);
        if (this.toolbar) {
          this.toolbar.setSelectSessions([id]);
        }
      },
  
      _getSessionGraph(session, graph) {
    
        const sessionEvents = session.data;
        let from;
        let e = null
        let lastDurationEvent// = sessionEvents[0]
        let duration = 0
        for (let i = 0; i < sessionEvents.length; i++) {
          e = sessionEvents[i];
          // we start only counting durations once there
          // was an click event
          if (lastDurationEvent) {
            duration = e.time - lastDurationEvent.time
          }
          
        /**
           * Be aware of the overlay...
           */
          const screenID = this.getEventScreenId(e);
          const screen = this.sourceModel.screens[screenID];
          if (screen) {
            const to = {};
            if (e.type == "SessionStart") {
              to.x = screen.x - Math.max(10, Math.round(30));
              to.y = screen.y + Math.max(10, Math.round(30));
              from = this._addToGraph(from, to, graph, 0);
            } else if (e.x >= 0 && e.y >= 0 && !e.noheat) { // some click
              if (e.widget && this.sourceModel.widgets[e.widget]) {
                const widget = this.sourceModel.widgets[e.widget];
                to.x = Math.round(widget.x + widget.w / 2);
                to.y = Math.round(widget.y + widget.h / 2);
                from = this._addToGraph(from, to, graph, duration);
                lastDurationEvent = e
              } else {
                to.x = Math.round(Math.min(1, e.x) * screen.w + screen.x);
                to.y = Math.round(Math.min(1, e.y) * screen.h + screen.y);
                from = this._addToGraph(from, to, graph, duration);
                lastDurationEvent = e
              }
            }
          } else {
            console.warn("_getSessionGraph()", "Screen is not there", e.screen);
          }
        }
  
          /** Since 4.0.60 we add a last node, if it was screen load */
        if (e && e.type === 'ScreenLoaded') {
          const screenID = this.getEventScreenId(e);
          const screen = this.sourceModel.screens[screenID];
          const to = {
            x: Math.round(screen.x + screen.w / 2),
            y: Math.round(screen.y + screen.h / 2)
          }
          from = this._addToGraph(from, to, graph, duration);
        }
  
  
      },
  
      _addToGraph(from, to, graph, duration) {
        if (from) {
          const id = from.x + ";" + from.y + "-" + to.x + ";" + to.y;
          if (!graph[id]) {
            graph[id] = {
              from: from,
              to: to,
              count: 0,
              duration: 0
            };
          }
          graph[id].count++;
          graph[id].duration += duration * 1;
          return to;
        }
        return to;
      }
    },
    mounted() {},
  };
  </script>