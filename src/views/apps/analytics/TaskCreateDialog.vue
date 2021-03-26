
<template>
  <div :class="'TaskCreateDialog ' + model.type">
    <div class="TaskCreateDialogCntr">
      <div class="FormCntr" >

          <div class="field">
            <label>Name</label>
            <input  v-model="task.name" type="text" class="input" placeholder="Name"  />
          </div>

          <div class="field">
            <label>Description</label>
            <textarea  v-model="task.description" type="text" class="input"  placeholder="An explaination for the users"  />
          </div>



          <div>
            <label>Expected Steps</label>
            <p class="MatcHint mb-16">Click in the simulator to add steps. You can remove steps that are not needed by clicking on them.</p>
            <div class="StepCntr">
              <div v-for="(step, i) in steps" :key="i" class="Step">
                <div class="StepDetails">
                    {{step.type}} -
                    {{step.label}}
                    <div class="removePopup">
                      <span @click="removeEvent(i)" class="mdi">Remove</span>
                    </div>


                </div>
              </div>
            </div>
          </div>

      </div>

      <div class="SimCntr">

        <div class="SimWrapper" ref="wrapper">

        </div>

      </div>

    </div>


    <div class="buttons mt-16">
      <a class="button is-primary" >Save</a>
      <a class="button is-text" >Cancel</a>
    </div>

  </div>
</template>
<style lang="scss">
  @import '../../../style/scss/TaskCreateDialog.scss';
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import Logger from "common/Logger";
import CheckBox from "common/CheckBox";
import Simulator from "core/Simulator";
import Util from "core/Util";

export default {
  name: "TaskRecorder",
  props: ['model'],
  mixins: [Util, DojoWidget],
  data: function() {
    return {
      hash: '',
      task: {
        name: '',
        description: '',
        flow:[]
      },
      ignoredEvents: [
        "SessionStart",
        "ScreenAnimation",
        "Animation",
        "OverlayRemoveAnimation",
        "OverlayShowAnimation",
        "MouseOut",
        "MouseOver",
        "WidgetInit",
        "ValidationOK"
      ]
    };
  },
  components: {},
  computed: {
    steps () {
      console.debug('steps')
      return this.task.flow.map(event => {
        return {
          screen: this.getScreenName(event.screen),
          widget: this.getWidgetName(event.widget),
          type:  this.getEventLabel(event.type),
          label: event.widget ? this.getWidgetName(event.widget) + ' @ ' + this.getScreenName(event.screen): this.getScreenName(event.screen)
        }
      })
    }
  },
  methods: {

    postCreate () {
      this.logger = new Logger("TaskRecorder");
      this.logger.log(-1, "postCreate", "enter > " + this.appID + "> " + this.hash);
      setTimeout(() => {
        this.createSimulator()
      }, 500)
    },

    createSimulator () {
      let wrapper = this.$refs.wrapper
      var pos = this.resizeSimulatorContainer(this.model, wrapper, 0.7);

      wrapper.style.width = pos.w + 'px'
      wrapper.style.height = pos.h + 'px'

      this.simulator = this.$new(Simulator, {
          isDesktopTest: true,
          mode: "recordFlow",
          logData: false
      });
      this.simulator.setHash(this.hash)
      this.tempOwn(on(this.simulator, "event", lang.hitch(this, "onEvent")));
      this.simulator.placeAt(wrapper);
      this.simulator.scrollListenTarget = "parent";
      this.simulator.startup();
      this.simulator.setModel(this.model);
    },


    onEvent (e) {
      console.debug(e)
      if (this.ignoredEvents.indexOf(e.type) < 0) {
        this.task.flow.push(e);
      }
    },


    stop () {
      this.simulator.destroy();

      /**
       * Here we have to order the events by time and
       * then remove unwanted attributes...
       */
      this._flow.sort(function(a, b) {
        return a.time - b.time;
      });
      for (var i = 0; i < this._flow.length; i++) {
        var e = this._flow[i];
        delete e["session"];
        delete e["user"];
        delete e["time"];
        if (e.state) {
          delete e.state.children;
        }
      }

      this.renderFlow(this._flow, false);


    },

    renderFlow: function(flow, existingFlow) {
      console.debug('renderFlow')

      if (this.domNode.parentNode) {
        this.dialog.resize({ w: 650, h: 550 });
      }

      this.cleanUpTempListener();

      this.showButtonBar(this.flowBar);

      this.container.innerHTML = "";

      var cntr = this.db.div("MatcTaskRecorderFlowList").build(this.container);

      this.db.h2("", "Recorded Task Flow").build(cntr);
      this.checkBoxList = [];
      if (flow.length > 0) {
        var tblCntr = this.db.div("MatcTaskRecorderFlowListTable").build(cntr);
        var tbl = this.db.table().build(tblCntr);
        this.db
          .thead([
            this.getNLS("taskRecorderEvent"),
            this.getNLS("taskRecorderScreen"),
            this.getNLS("taskRecorderWidget"),
            this.getNLS("taskRecorderAction")
          ])
          .build(tbl);
        var tbody = this.db.tbody().build(tbl);
        for (let i = 0; i < flow.length; i++) {
          let event = flow[i];
          let row;
          if (event.widget) {
            if (event.type == "WidgetGesture" && event.gesture) {
              let gesture = event.gesture;
              row = [
                this.getGestureLabel(gesture.type),
                this.getScreenName(event.screen),
                this.getWidgetName(event.widget)
              ];
            } else if (
              event.state &&
              (event.type == "WidgetClick" || event.type == "WidgetChange")
            ) {
              row = [
                this.getEventStateLabel(event.state),
                this.getScreenName(event.screen),
                this.getWidgetName(event.widget)
              ];
            } else {
              row = [
                this.getEventLabel(event.type),
                this.getScreenName(event.screen),
                this.getWidgetName(event.widget)
              ];
            }
          } else if (event.type == "ScreenGesture" && event.gesture) {
            let gesture = event.gesture;
            row = [
              "Screen " + this.getGestureLabel(gesture.type),
              this.getScreenName(event.screen),
              "-"
            ];
          } else {
            row = [
              this.getEventLabel(event.type),
              this.getScreenName(event.screen),
              "-"
            ];
          }
          var tr = this.db.tr(row).build(tbody);

          var chkCntr = this.db
            .td("MatcTaskRecorderFlowListCheckCntr")
            .build(tr);
          let chkBx = this.$new(CheckBox);
          chkBx.placeAt(chkCntr);
          if (i === 0 || i === flow.length - 1 || existingFlow) {
            chkBx.setValue(true);
          }
          this.checkBoxList.push(chkBx);
        }

        var chkBx = this.$new(CheckBox);
        chkBx.setLabel(this.getNLS("taskRecorderDoNotAllow"));
        chkBx.placeAt(this.db.div("MatcLead").build(this.container));
        chkBx.setValue(this._task.strict == true);
        this.own(on(chkBx, "change", lang.hitch(this, "setStrict")));
      } else {
        this.db.div("MatcLead", this.getNLS("taskRecorderError1")).build(cntr);
        //this.db.div("MatcLead MatcMarginTop", this.getNLS("taskRecorderError2")).build(cntr);
      }
    },

    removeEvent (i) {
      this.task.flow.splice(i, 1);
    },

    setStrict (value) {
      this.task.strict = value;
    },

    _close: function() {
      this.emit("close", {});
    },

    _save: function() {
      var selected = this._flow;
      if (this.checkBoxList) {
        selected = [];
        for (var i = 0; i < this._flow.length; i++) {
          var event = this._flow[i];
          if (this.checkBoxList[i].getValue()) {
            selected.push(event);
          }
        }
      } else {
        console.warn("_save, no checkBoxList");
      }
      this.emit("save", selected, this._task.strict);
    },

    cleanUp: function() {
      this.cleanUpTempListener();
    }
  },
  mounted() {}
};
</script>