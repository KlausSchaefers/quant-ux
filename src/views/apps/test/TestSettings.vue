
<template>
    <div class="MatcTestSettings MatcDashTable">

        <div data-dojo-attach-point="tableCntr" class="">
          <div v-if="hasTests" >
          <table class="vommondTable table is-hoverable">
            <thead>
                <tr>
                  <td style="width: 20%;">Name</td>
                  <td style="width: 30%;">Description</td>
                  <td style="width: 35%;">Steps</td>
                  <td style="width: 15%;" class="action">Action</td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(task, i) in testSettings.tasks" :key="task.id">
                  <td >{{task.name}}</td>
                  <td>{{shorten(task.description)}}</td>
                  <td>
                    <template v-if="task.flow && task.flow.length > 0">
                      <div class="StepCntr">
                          <div v-for="(step, i) in getTaskSteps(task)" :key="i" :class="'Step ' + step.type">
                            <span class="mdi mdi-arrow-right" v-if="i > 0"/>
                            <div class="StepDetails">{{shorten(step.label, 20)}}  </div>
                         </div>
                      </div>


                    </template>
                    <span class="MatcHint" v-else>No steps </span>
                  </td>
                  <td class=" action">
                    <div style="width: 100px; display: flex; justify-content: flex-end;">
                    <a class="MatcButton MatcButtonXXS MatcButtonSecondary" @click="onEditTask(task, i, $event)"><QIcon icon="EditSquare"/></a>
                    <a class="MatcButton MatcButtonXXS MatcButtonDanger MatcButtonSecondary" @click="onDelete(task, i, $event)"><QIcon icon="DeleteTrash"/></a>
                    </div>
                  </td>
                </tr>
            </tbody>
          </table>
          <div class="form-group mb-32">
            <CheckBox :value="test.showTaskInTest" :label="getNLS('testSettingsShowTaskInTest')" @change="onShowTaskChange"/>
              </div>

          <div class="form-group" v-if="test.showTaskInTest" >
            <CheckBox :value="test.showSuccessInTest" :label="getNLS('testSettingsShowSuccessInTest')" @change="onShowSuccessInTest"/>
          </div>

          </div>
          <p v-else class="mb-32">
            {{getNLS("testSettingsTaskAddHint")}}
          </p>
        </div>

        <a data-nls="testSettingsAddTask" @click="showCreateDialog" class="MatcButton MatcButtonXXS">Add task</a>


  </div>
</template>
<style lang="scss">
  @import '../../../style/components/task_create_dialog.scss';
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import Logger from "common/Logger";
import Dialog from "common/Dialog";
import DomBuilder from "common/DomBuilder";
import CheckBox from "common/CheckBox";
import Util from "core/Util";
import Plan from "page/Plan";
import QIcon from "page/QIcon";
import Services from "services/Services";
import TaskRecorder from "views/apps/analytics/TaskCreateDialog";


export default {
  name: "TestSettings",
  props: ["test", "app", "annotation", "events", "hash"],
  mixins: [Util, Plan, DojoWidget],
  data: function() {
    return {
      testSettings: null,
      appID: "",
      userID: ""
    };
  },
  components: {
    'CheckBox': CheckBox,
    'QIcon':QIcon
  },
  computed: {
    pub() {
      return this.$route.meta && this.$route.meta.isPublic;
    },
    hasTests () {
      return this.testSettings && this.testSettings.tasks && this.testSettings.tasks.length > 0
    }
  },
  methods: {

    shorten (s, max = 70) {
      if (s && s.length > max) {
        return s.substring(0, max) + '...'
      }
      return s
    },

    getTaskSteps (task) {
      let result = []
      if (task.flow.length > 0) {
        result.push(this.createStep(task.flow[0]))
      }

      if (task.flow.length > 2) {
        result.push({
          type: '',
          label: '...'
        })
      }

      if (task.flow.length > 1) {
        result.push(this.createStep(task.flow[task.flow.length-1]))
      }

      return result
    },

    createStep (event) {
      return {
        label: (event.widget ? this.getWidgetName(event.widget) : this.getScreenName(event.screen)),
        type: event.widget ? 'widget' : 'screen'
      }
    },



    getScreenName (screenID) {
      if (this.app.screens[screenID] && this.app.screens[screenID].name) {
        return this.app.screens[screenID].name;
      }
      return screenID;
    },

    getWidgetName (widgetID) {
      if (this.app.widgets[widgetID] && this.app.widgets[widgetID].name) {
        return this.app.widgets[widgetID].name;
      }
      return widgetID;
    },

    postCreate() {
      this.logger = new Logger("TestSettings");
      this.logger.log(4,"postCreate", "enter > " + this.appID + " > " + this.pub);
      this.db = new DomBuilder();
      if (this.test) {
        this.setValue(this.test);
      }
    },

    setValue(data) {
      this.testSettings = data
    },

    render(data) {
      this.cleanUpTempListener();
      this.renderTaskTable(data);
    },

    onShowTaskChange (value) {
      this.test.showTaskInTest = value
      this.save();
    },

    onShowSuccessInTest (value) {
      this.test.showSuccessInTest = value
      this.save();
    },

    showCreateDialog () {
      var d = new Dialog();
      var dialog = document.createElement("div");
      css.add(dialog, "MatchTaskRecorderDialog");
      var s = this.$new(TaskRecorder, { model: this.app, hash: this.hash });
      s.setValue({
        name: "Task " + (this.test.tasks.length + 1),
        description: '',
        flow: [],
        strict: false
      })
      s.placeAt(dialog);
      d.popup(dialog, this.addBTN);
      d.own(on(d, "close", function() { s.destroy(); }));
      d.own(on(s, "close", function() { d.close(); }));
      d.own(on(s, "save", lang.hitch(this, "createNewTask", s, d)));
    },

    async createNewTask(s, dialog) {
      let newTask = s.getValue()
      dialog.close()
      if (!this.test.tasks) {
        this.test.tasks = [];
      }
      this.test.tasks.push({
        name: newTask.name,
        description: newTask.description,
        id: "t" + Date.now(),
        strict: newTask.strict,
        flow: newTask.flow
      });


      this.save();
    },

    onEditTask(task, i, e) {
      var d = new Dialog();
      var dialog = document.createElement("div");
      css.add(dialog, "MatchTaskRecorderDialog");
      var s = this.$new(TaskRecorder, { model: this.app, hash: this.hash, ignoreFirstEvent: true});
      s.setValue(task)
      s.placeAt(dialog);
      d.popup(dialog, e.target);
      d.own(on(d, "close", function() { s.destroy(); }));
      d.own(on(s, "close", function() { d.close(); }));
      d.own(on(s, "save", lang.hitch(this, "updateTask", s, d)));
    },

    updateTask(s, dialog) {
      let updatedTask = s.getValue()
      let task = this.test.tasks.find(t => t.id === updatedTask.id);
      if (task) {
        task.name = updatedTask.name
        task.strict = updatedTask.strict
        task.flow = updatedTask.flow
        task.description = updatedTask.description

        this.save();
      } else {
        console.error("AnalyticTaskList.saveFlow() > Cannot find task", updatedTask);
      }
      dialog.close();
    },



    onDelete (task, i, e) {
      var name = task.name ? task.name : task.label;
      var div = this.db.div("MatcDeleteDialog").build();
      this.db.h3("title is-4", this.getNLS("testSettingTaskDeleteTitle")).build(div);
      this.db.p('MatcMarginBottomXL', this.getNLS("testSettingTaskDelete1") + name + this.getNLS("testSettingTaskDelete2")).build(div)
      var bar = this.db.div("MatcButtonBar").build(div);
      var write = this.db.a("MatcButton MatcButtonDanger", this.getNLS("btn.delete")).build(bar);
      var cancel = this.db.a("MatcLinkButton", this.getNLS("btn.cancel")).build(bar);
      var d = new Dialog();
      d.own(on(write, touch.press, lang.hitch(this, "removeTask", i, d)));
      d.own(on(cancel, touch.press, lang.hitch(d, "close")));
      d.popup(div, e.target);
    },

    removeTask (i, d) {
      this.test.tasks.splice(i, 1);
      d.close();
      this.save();
    },

    async save() {
      if (this.pub) {
        this.showSuccess(this.getNLS("testSettingsRegister"));
      } else {
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