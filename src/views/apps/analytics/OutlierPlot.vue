
<template>
    <div :class="'MatcScatterPlot MatcOutlierPlot MatcScatterPlot' + mode  ">
       
     
        <div class="MatcScatterPlotCntr" data-dojo-attach-point="cntr" @click="onBackgroundClick" @dblclick="onDoubelClick">
            <div class="MatcScatterPlotCanvas" data-dojo-attach-point="canvas">
            </div>
        </div>

        <div class="MatcScatterPlotHintBar" data-dojo-attach-point="hintCntr">
        </div>

    </div>
</template>

<style lang="scss">
    @import '../../../style/scatter.scss';
</style>

<script>
import on from 'dojo/on'
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import Logger from 'common/Logger'
import _Color from 'common/_Color'
import DomBuilder from 'common/DomBuilder'
import Util from 'core/Util'
import * as Outlier from '../../../dash/Outlier'
import DataFrame from 'common/DataFrame'

export default {
    name: 'OutlierPlot',
    mixins: [_Color, Util],
    props: ['test', 'app', 'events', 'annotation', 'pub'],
    data: function () {
        return {
            mode: 'Scatter',   
            offset: 5,
            paddingFactor: 1.1,
            dialog: false,
            includeDropOff: false,
            defaultColor: "#56A9FC",
            colors: [ "#9933cc", "#669900", "#ff8a00", "#cc0000", "#000000", "#8ad5f0", "#d6adeb", "#c5e26d"],
            bins: 3,
            canvasPos: {
                w: 800,
                h: 450
            }
        }
    },
    components: {

    },
    methods: {
        postCreate() {
            this.log = new Logger("ScatterPlot");
            this.init();
        },

        init() {
            this.db = new DomBuilder();      
            this._scatterPoints = {};
        },

        setValue(test, app, events, annotations) {

            const filteredEvents = this.filterEvents(events, annotations);
            const df = this.getActionEvents(new DataFrame(filteredEvents));
            df.sortBy("time");

            this.model = app
            this.df = df
            this.annotations = annotations;        
            this.tasks = lang.clone(test.tasks).filter(task => task.flow.length >= 2);
            const taskIDs = this.tasks.map(t => t.id)
            
            const data = Outlier.getBaseData(df, this.tasks)
  
            const matrix = Outlier.getMatrix(data, ["interactions", "duration", "screens", "tasks", ...taskIDs])
    
            const zMatrix = Outlier.getZScore(matrix)

            // const s = zMatrix.map(row => row.join(',')).join('\n')
            // console.debug(s)
   

            const distance = Outlier.getPairwiseDistance(zMatrix)
            //const points = Outlier.tsne(distance, 30, 10)
            const points = Outlier.umap(distance, 0.95)
            const scaledPOints = Outlier.getMinMaxScore(points, 100 - 2 * this.offset)



            this.render(data, scaledPOints);
            this.onBackgroundClick()
        },

        onDoubelClick () {
            this.setValue(this.test, this.app, this.events, this.annotation)
        },

        onBackgroundClick () {
            this.setHint(this.db.span("MatcHint", this.getNLS("analytics.distribution.hint")).build());
        },



        render (sessions, points) {

            this.canvas.innerText = ''

            for (let i = 0; i < sessions.length; i++) {
                const s = sessions[i]
                const point = points[i] 

                const ms = Math.min(i * 10, 300) + 100;
                
                const p = this.db.span("MatxScatterPoint").build(this.canvas);
                p.style.bottom = (49 + Math.random() * 2) + "%";
                p.style.left = (49.5 + Math.random() * 1) + "%";
                p.style.opacity = 0
                p.style.background = this.defaultColor
                this._scatterPoints[i] = p;
                this.tempOwn(on(p, "click", lang.hitch(this, "selectPoint", p, s, i)));
        
                setTimeout(lang.hitch(this, "animateScatterPoint", p, s, point[0] + this.offset, point[1] + this.offset), ms);
                
            }

        },


        clean_scatter(callback) {
            this.log.log(-1, "clean_scatter", "enter");
            css.remove(this.domNode, "MatcScatterPlotScatter");
            this.setHint();
            if (this._scatterPoints) {
                for (var sessionID in this._scatterPoints) {
                    var p = this._scatterPoints[sessionID];
                    p.style.bottom = "-5%";
                }
            }
            setTimeout(lang.hitch(this, "removePoints"), 200);
            if (callback) {
                setTimeout(callback, 200);
            }
            this.yMinLabel.innerHTML = ""
            this.minLabel.innerHTML = ""
        },

        removePoints() {
            if (this._scatterPoints) {
                for (var sessionID in this._scatterPoints) {
                    var p = this._scatterPoints[sessionID];
                    if (p.parentNode) {
                        p.parentNode.removeChild(p)
                    }

                }
            }
            delete this._scatterPoints;
            this._scatterPoints = {};
        },

        selectPoint(p, s, i, e) { 
            this.stopEvent(e);
            css.add(this.cntr, "MatcScatterPlotCntrHover");
            this._selectedScatterPoint = p;
            this.showSessionReplayHint(s.session)
        },

        showSessionReplayHint(id) {
            if (this.model) {
                let url = "#/apps/" + this.model.id + "/replay/" + id + ".html";
                if (this.mode == "public") {
                    url = "#/examples/" + this.model.id + "/replay/" + id + ".html";
                }
                const hint = this.db.span("MatcHint", this.getNLS("analytics.distribution.play")).build();
                const a = this.db.a("", this.getNLS("analytics.distribution.here")).build(hint);
                a.href = url
                a.target = "_matcSessionReplay" + id
                this.setHint(hint);
            }
        },

        /*********************************************************************
         * Helper
         *********************************************************************/

        hoverPoint(p) {
            if (this._selectedScatterPoint == p) {
                css.add(this.cntr, "MatcScatterPlotCntrHover");
            }
        },

        setHint(hintNode) {
            this.hintCntr.innerHTML = "";
            if (hintNode) {
                this.hintCntr.appendChild(hintNode);
            }
        },

        clearPoint() {
            //this.setMiddle(mean_count, max_count, mean_duration, max_duration);
            css.remove(this.cntr, "MatcScatterPlotCntrHover");
        },

      

        animateScatterPoint(p, s, bottom, left) {
            p.style.bottom = bottom + "%";
            p.style.left = left + "%";
            p.style.opacity = 1
        }
    },
    mounted() {        
        this.setValue(this.test, this.app, this.events, this.annotation)
    }
}
</script>