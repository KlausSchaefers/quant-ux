
<template>
  <div></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import Logger from "common/Logger";
import Dialog from "common/Dialog";
import DomBuilder from "common/DomBuilder";
import Table from "common/Table";
import Util from "core/Util";
import Plan from "page/Plan";
import Services from "services/Services";
import TaskRecorder from "views/apps/analytics/TaskRecorder";

export default {
  name: "TestSettings",
  props: ["test", "app", "annotation", "events"],
  mixins: [Util, Plan, DojoWidget],
  data: function() {
    return {
      appID: "",
      userID: ""
    };
  },
  components: {},
  computed: {
    pub() {
      return this.$route.meta && this.$route.meta.isPublic;
    }
  },
  methods: {
    postCreate() {
      this.logger = new Logger("TestSettings");
      this.logger.log(
        4,
        "postCreate",
        "enter > " + this.appID + " > " + this.pub
      );
      this.db = new DomBuilder();
      if (this.test) {
        this.setValue(this.test);
      }
    },

    setValue(data) {
      this.render(data);
    },

    render(data) {
      this.cleanUpTempListener();
      this.renderTaskTable(data);
      this.checkPlan();
    },

    renderTaskTable(data) {
      this.domNode.innerHTML = "";
      if (data.tasks && data.tasks.length > 0) {
        var me = this;
        var tbl = this.$new(Table);
        tbl.setColumns([
          {
            query: "name",
            label: this.getNLS("testSettingsTaskName"),
            edit: function(input, task) {
              task.name = input.value;
              me.save(false);
            },
            width: 20
          },
          {
            query: "description",
            label: this.getNLS("testSettingsTaskDescription"),
            edit: function(input, task) {
              task.description = input.value;
              me.save(false);
            },
            width: 60
          }
        ]);
        tbl.setActions([
          {
            label: this.getNLS("dashTaskTableEditFlow"),
            css: "button is-primary is-outlined ",
            callback: lang.hitch(me, "_onEditFlow")
          },
          {
            label: "",
            icon: "mdi mdi-close",
            css: "button is-danger",
            callback: function(task, i, node) {
              me.onDelete(node, task, i);
            }
          }
        ]);
        tbl.placeAt(this.domNode);
        tbl.setValue(data.tasks);
      } else {
        this.db.div("MatcHint MatcMarginBottom", this.getNLS("testSettingsTaskAddHint")).build(this.domNode);
      }

      this.addBTN = this.db
        .a("button is-primary", this.getNLS("testSettingsAddTask"))
        .build(this.domNode);

      this.own(on(this.addBTN, touch.press, lang.hitch(this, "addTaskToTable", this.addBTN, null)));
    },

    checkPlan() {
      this.logger.log(8, "checkPlan", "enter");
      if (this.pub) {
        if (!this.planCanAddTask(this.test)) {
          css.add(this.addBTN, "MatcButtonGreen");
          this.addBTN.innerHTML = this.getNLS("testSettingsUpgradePlan");
        } else {
          css.remove(this.addBTN, "MatcButtonGreen");
          this.addBTN.innerHTML = this.getNLS("testSettingsAddTask");
        }
      }
    },

    async addTaskToTable() {
      if (!this.test.tasks) {
        this.test.tasks = [];
      }
      this.test.tasks.push({
        name: "Task " + (this.test.tasks.length + 1),
        description: this.getNLS("testSettingTaskDeskPlaceholder"),
        id: "t" + Date.now(),
        flow: []
      });

      this.render(this.test);
      this.save();
    },

    onDelete (node, task, i) {
      var name = task.name ? task.name : task.label;

      var div = this.db.div("box").build();

      this.db.h3("title is-4",this.getNLS("testSettingTaskDelete1") + name + this.getNLS("testSettingTaskDelete2")).build(div);

      var bar = this.db.div("buttons").build(div);

      var write = this.db.a("button is-danger", this.getNLS("btn.delete")).build(bar);
      var cancel = this.db.a("button is-text", this.getNLS("btn.cancel")).build(bar);

      var d = new Dialog();
      d.own(on(write, touch.press, lang.hitch(this, "removeTask", i, d)));
      d.own(on(cancel, touch.press, lang.hitch(d, "close")));

      d.popup(div, node);
    },

    removeTask: function(i, d) {
      this.test.tasks.splice(i, 1);
      this.render(this.test);
      d.close();
      this.save();
    },

    async save() {
      if (this.pub) {
        this.showSuccess(this.getNLS("testSettingsRegister"));
      } else {
        console.debug("save", this.test);
        let res = await Services.getModelService().saveTestSettings(
          this.app.id,
          this.test
        );
        if (res.status === "ok") {
          this.showSuccess("Saved..");
          this.$emit("change", this.test);
        }
      }
    },

     _onEditFlow(task, i, node) {
      var tasks = this.test.tasks;
      for (let j = 0; j < tasks.length; j++) {
        var t = tasks[j];
        if (t.id == task.id) {
          this.onFlow(node, t, j);
        }
      }
    },

    onFlow(node, task) {
      this.showTaskFlow(node, task, this.app);
    },

    showTaskFlow(node, task, model) {
      var d = new Dialog();
      var dialog = document.createElement("div");
      css.add(dialog, "MatchTaskRecorderDialog");
      var s = this.$new(TaskRecorder, { model: model, task: task, dialog: d, hash: this.hash });
      s.placeAt(dialog);
      d.popup(dialog, node);
      d.own(
        on(d, "close", function() {
          s.destroy();
        })
      );
      d.own(
        on(s, "close", function() {
          d.close();
        })
      );
      d.own(on(s, "save", lang.hitch(this, "saveFlow", task.id, d)));
    },

    saveFlow(taskID, d, flow, strict) {
      console.debug("saveFlow", taskID, flow, strict, this.test);
      let task = this.test.tasks.find(t => t.id === taskID);
      if (task) {
        task.flow = flow;
        task.strict = strict;
        d.close();
        this.render(this.test);
        this.save();
      } else {
        console.error("AnalyticTaskList.saveFlow() > Cannot find task", taskID);
      }
    },


    cleanUp() {
      this.cleanUpTempListener();
    }
  },
  watch: {
    test(v) {
      console.debug("TestSetting.watch() > test", v);
      this.test = v;
      this.setValue(v);
    }
  },
  mounted() {}
};
</script>