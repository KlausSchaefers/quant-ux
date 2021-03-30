
<template>
  <div class="MatcTaskRecorder">
    <div data-dojo-attach-point="wrapper">
      <div data-dojo-attach-point="container" >
        <div style=" width: 480px">
        <h2 class="title">Record a Task flow</h2>
        <p class="">{{nls.taskRecorder1}}</p>
        <p class="">{{nls.taskRecorder2}}</p>
        <div class="content" style="margin-bottom: 32px;">
          <ol style="margin-left: 16px">
            <li v-html="nls.taskRecorderStep0"></li>
            <li v-html="nls.taskRecorderStep1"></li>
            <li v-html="nls.taskRecorderStep3"></li>
            <li v-html="nls.taskRecorderStep4"></li>
          </ol>
        </div>
        </div>
      </div>
    </div>

    <div>
      <div class="" data-dojo-attach-point="btnBar">
        <div class="buttons mt-16">
          <a class="button is-primary" data-dojo-attach-point="startBtn">Begin</a>
          <a class="button is-text" data-dojo-attach-point="cancelBTN">Cancel</a>
         </div>
      </div>

      <div class="MatcHidden" data-dojo-attach-point="recordBar">
        <div class="buttons">
         <a class="button is-primary MatcButtonPassive" data-dojo-attach-point="stopBtn">Done</a>
        </div>
      </div>

      <div class="MatcHidden" data-dojo-attach-point="flowBar">
          <div class="buttons">
            <a class="button is-primary" data-dojo-attach-point="saveBTN">Save</a>
            <a class="button is-primary is-outlined" data-dojo-attach-point="startBtn2">Record Again</a>
            <a class="button is-text" data-dojo-attach-point="cancelBTN2">Cancel</a>
          </div>
      </div>
    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import Logger from "common/Logger";
import DomBuilder from "common/DomBuilder";
import CheckBox from "common/CheckBox";
import Simulator from "core/Simulator";
import Util from "core/Util";

export default {
  name: "TaskRecorder",
  mixins: [Util, DojoWidget],
  data: function() {
    return {
      hash: '',
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
  methods: {
    postCreate: function() {
      this.logger = new Logger("TaskRecorder");
      this.logger.log(-1, "postCreate", "enter > " + this.appID + "> " + this.hash);
      this.db = new DomBuilder();
      this.own(on(this.cancelBTN, touch.press, lang.hitch(this, "_close")));
      this.own(on(this.cancelBTN2, touch.press, lang.hitch(this, "_close")));
      this.own(on(this.startBtn, touch.press, lang.hitch(this, "start")));
      this.own(on(this.startBtn2, touch.press, lang.hitch(this, "start")));
      this.own(on(this.stopBtn, touch.press, lang.hitch(this, "stop")));
      this.own(on(this.saveBTN, touch.press, lang.hitch(this, "_save")));
      this._task = lang.clone(this.task);
      if (this.task.flow && this.task.flow.length > 0) {
        this._flow = lang.clone(this.task.flow);
        this.renderFlow(this._flow, true);
      }
    },

    start: function() {

      this.container.innerHTML = "";

      this._flow = [];
      this._notRecorded = 0;

      var cntr = this.db.div("MactCenter").build(this.container);
      var pos = this.resizeSimulatorContainer(this.model, cntr, 0.7);

      /**
       * hack because somehow the overflow is hidden
       */
      pos.w += 40;
      pos.h += 80;

      // var scroller = new ScrollContainer();
      // scroller.placeAt(cntr);

      this.dialog.resize(pos);

      /**
       * Because of the fixed positions we have to wait a little
       * to render the simulator
       */

      setTimeout(() => {
        this.showButtonBar(this.recordBar);
        this.simulator = this.$new(Simulator, {
          mode: "recordFlow",
          logData: false
        });
        this.simulator.setHash(this.hash)
        this.tempOwn(on(this.simulator, "event", lang.hitch(this, "onEvent")));
        this.simulator.placeAt(cntr);
        this.simulator.scrollListenTarget = "parent";
        this.simulator.startup();
        this.record();
        this.simulator.setModel(this.model);
      }, 400);
    },

    onEvent: function(e) {
      if (this.isRecording) {
        if (this.ignoredEvents.indexOf(e.type) < 0) {
          this._flow.push(e);
          css.remove(this.stopBtn, "MatcButtonPassive");
        } else {
          //console.debug("onEvent > ignore", e.type)
        }
      } else {
        /**
         * TODO: Show somehow a warning message to the user if he does not record anything?
         */
      }
    },

    record: function() {
      this.isRecording = true;
      if (!this.isRecording) {
        //this.recordBtn.innerHTML = this.getNLS("taskRecorderPauseBtn");
        //this.recordHint.innerHTML= this.getNLS("taskRecorderPauseDes");
        //this.isRecording = true;
      } else {
        //this.recordBtn.innerHTML = this.getNLS("taskRecorderRecordBtn");
        //this.recordHint.innerHTML=this.getNLS("taskRecorderRecordDes");
        //this.isRecording = false;
      }
    },

    stop: function() {
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

    removeEvent: function(i) {
      this._flow.splice(i, 1);
      this.renderFlow(this._flow);
    },

    setStrict: function(value) {
      this._task.strict = value;
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

    showButtonBar: function(node) {
      this._toggerBar(node, this.btnBar);
      this._toggerBar(node, this.flowBar);
      this._toggerBar(node, this.recordBar);
    },

    _toggerBar: function(node, bar) {
      if (node == bar) {
        css.remove(bar, "MatcHidden");
      } else {
        css.add(bar, "MatcHidden");
      }
    },

    cleanUp: function() {
      this.cleanUpTempListener();
      //this.cntr.innerHTML="";
    }
  },
  mounted() {}
};
</script>