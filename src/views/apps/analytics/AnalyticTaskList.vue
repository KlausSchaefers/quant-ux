
<template>
  <div class="MatcTestSettings MatcDashTable">
    <div class data-dojo-attach-point="sectionTask">
      <div class="level">
        <div class="level-left">
          <h3 class="title level-item">
            <span data-nls="testSettingsTasks">{{$t('analytic-task-list.header')}}</span>
            <HelpButton
              topic="analytics.tasks"
              subtopic="analytics.tasks.create"
              :hasNotifications="false"
            />
          </h3>
        </div>
        <div class="level-right">
          <a class="MatcButton MatcButtonSecondary MatcButtonXS"  data-nls="btn.download"  @click="downloadCVS" >{{$t('analytic-task-list.download')}}</a>
        </div>
      </div>

      <div data-dojo-attach-point="tableCntr"></div>

    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import Logger from "common/Logger";
import Dialog from "common/Dialog";
import DomBuilder from "common/DomBuilder";
import ProgressBar from "common/ProgressBar";
import Table from "common/Table";
import DataFrame from "common/DataFrame";

import TaskPerfGram from "views/apps/analytics/TaskPerfGram";
import TestSettings from "views/apps/test/TestSettings";
import Analytics from "dash/Analytics";
import HelpButton from "help/HelpButton";


export default {
  name: "AnalyticsTaskList",
  mixins: [TestSettings, DojoWidget],
  props: ['hash'],
  data: function() {
    return {
      appID: "",
      userID: "",
      mode: "private",
      colWidths: [3, 3, 3, 3],
      details: false,
      downloadFileName: "Task_Summary.csv",
      BINS: 10
    };
  },
  components: {
    HelpButton: HelpButton
  },
  computed: {
    df() {
      let events = this.filterEvents(this.events, this.annotation);
      var actionEvents = this.getActionEvents(new DataFrame(events));
      events = actionEvents.as_array();
      var df = new DataFrame(events);
      df.sortBy("time");
      return df;
    }
  },
  methods: {
    postCreate() {
      this.logger = new Logger("AnalyticsTaskList");
      this.logger.log(0, "postCreate", "enter > " + this.app.id);
      this.db = new DomBuilder();
      this.render();
    },

    downloadCVS () {
      var csvContent =
        "Name,Start, Success,Duration (Mean),Duration (Median), Duration (STD),Events (Mean), Events (STD)\n";

      const tasks = this.test.tasks;
      const analytics = new Analytics();
      const perf = analytics.getTaskPerformance(this.df, tasks);
      const summaries = analytics.getTaskSummary(this.df, tasks, this.annotation);

      for (let i = 0; i < summaries.length; i++) {
        const summary = summaries[i];
        csvContent += summary.label + ",";
        csvContent += summary.startCount + " / " + summary.sessionCount + ",";
        csvContent += summary.value + " / " + summary.sessionCount + ",";
        csvContent += this.formatNumber(summary.durationMean / 1000) + ",";
        csvContent += this.formatNumber(summary.durationMedian / 1000) + ",";
        csvContent += this.formatNumber(summary.durationStd / 1000) + ",";
        csvContent += this.formatNumber(summary.countMean) + ",";
        csvContent += this.formatNumber(summary.countStd) + "";
        csvContent += "\n";
      }

      csvContent += "\n\n\n\n";

      /**
       * Perf stats
       */
      csvContent += "Test, Task, Interactions, Duration\n";
      perf.foreach(row => {
        csvContent += row["session"] + ",";
        csvContent += row["taskName"] + ",";
        csvContent += row["interactions"] + ",";
        csvContent += this.formatNumber(row["duration"] / 1000) + "";
        csvContent += "\n";
      });


      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
      });
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, this.downloadFileName);
      } else {
        const elem = window.document.createElement("a");
        elem.href = window.URL.createObjectURL(blob);
        elem.download = this.downloadFileName;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
      }
    },

    render() {
      this.cleanUpTempListener();
      this.tableCntr.innerHTML = "";
      if (this.details) {
        css.add(this.addBTN, "hidden");
      } else {
        css.remove(this.addBTN, "hidden");
      }
      if (this.test.tasks.length > 0) {
        this.renderTaskTable();
        css.remove(this.downLoadBtn, "hidden");
      } else {
        var msg = this.db
          .div("MatcHint MatcMarginBottom")
          .build(this.tableCntr);
        msg.innerHTML = this.getNLS("dashTaskEmpty");
        css.add(this.downLoadBtn, "hidden");
      }
    },

    renderTaskTable() {
      var db = new DomBuilder();
      var row = db.div("columns").build(this.tableCntr);
      var col = db.div("column").build(row);

      var tasks = this.test.tasks;
      var analytics = new Analytics();

      var summaries = analytics.getTaskSummary(this.df, tasks, this.annotation);
 
      var me = this;
      var tbl = this.$new(Table);
      tbl.actionLabel = 'Details'
    
      tbl.setColumns([
        {
          query: "label",
          label: this.getNLS("dashTaskTableName"),
          width: 20
        },
        {
          query: "startCount",
          label: this.getNLS("dashTaskTableStart"),
          fct: function(td, row) {
            css.add(td, "MatcDashTableTdHint MatcDashTableLabels");
            td.innerHTML = row.startCount + " / " + row.sessionCount
          },
          width: 10
        },
        {
          query: "success",
          label: this.getNLS("dashTaskTableSuccess"),
          fct: function(td, row) {
            css.add(td, "MatcDashBigTable");
            var bar = me.$new(ProgressBar);
            bar.color = me.PROGRESS_COLOR;
            bar.placeAt(td);
            bar.setValue(row.p);
            bar.setLabel(row.value + " / " + row.startCount);
          },
          width: 20
        },
        {
          query: "success",
          label: "",
          fct: function(td, row) {
            css.add(td, "MatcDashTableTdHint MatcDashTableLabels");
            td.innerHTML = "(" + Math.round(row.p * 100) + "%)";
          },
          width: 10
        },
        {
          query: "durationMean",
          label: this.getNLS("dashTaskTableDuration"),
          width: 15,
          fct: function(td, row) {
            css.add(td, "MatcDashTableLabels");
            td.innerHTML = me.formatNumber(row.durationMean / 1000) + " sec";
          }
        },
        {
          query: "interactionsMean",
          label: this.getNLS("dashTaskTableEvents"),
          width: 15,
          fct: function(td, row) {
            css.add(td, "MatcDashTableLabels");
            td.innerHTML = me.formatNumber(row.interactionsMean);
          }
        }
      ]);
      tbl.setActions([
        {
          label: "",
          icon: "AnalyseChart",
          css: "MatcButton MatcButtonXXS MatcButtonSecondary",
          callback: lang.hitch(me, "_showTaskPerf")
        }
      ]);
      tbl.placeAt(col);
      tbl.setValue(summaries);
    },

    _onFlowDetails() {},

    _showTaskPerf(summary, i, node) {
      var task = null;
      var tasks = this.test.tasks;
      for (let j = 0; j < tasks.length; j++) {
        var t = tasks[j];
        if (t.id == summary.id) {
          task = t;
          break;
        }
      }
      if (task) {
        var db = new DomBuilder();
        var dialog = new Dialog();
        var d = db.div("MatcPadding MatcDashTaskPerfGramDialog MatcDialog").build();
        var gram = this.$new(TaskPerfGram, {
          model: this.app,
          dialog: dialog,
          mode: this.mode
        });
        gram.setValue(this.df, task, this.annotation, this.test.tasks);
        gram.placeAt(d);
        dialog.popup(d, node);
      } else {
        console.debug("_showTaskPerf", "No task", summary);
      }
    },


    _setTaskName (input, task) {
      var tasks = this.test.tasks;
      for (var i = 0; i < tasks.length; i++) {
        var t = tasks[i];
        if (t.id == task.id) {
          t.name = input.value;
        }
      }
      this.save();
    }
  },
  watch: {
    events () {
        this.render();
    }
  },
  mounted() {}
};
</script>