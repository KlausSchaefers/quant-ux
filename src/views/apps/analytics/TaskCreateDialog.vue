
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
                         <span class="mdi mdi-arrow-right" v-if="i > 0"/>
                <div class="StepDetails">
                    {{step.type}} -
                    {{step.label}}
                    <div class="removePopup" @click="removeEvent(i)">
                      <span class="mdi">Remove</span>
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
      <a class="button is-primary" @click="onSave">Save</a>
      <a class="button is-text" @click="onCancel" >Cancel</a>
    </div>

  </div>
</template>
<style lang="scss">
  @import '../../../style/scss/task_create_dialog.scss';
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import Logger from "common/Logger";
import Simulator from "core/Simulator";
import Util from "core/Util";

export default {
  name: "TaskRecorder",
  props: ['model'],
  mixins: [Util, DojoWidget],
  data: function() {
    return {
      hash: '',
      ignoreFirstEvent: false,
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


    onEvent (event) {
      this.logger.log(-1,  'onEvent',  'enter', event)

      if (this.ignoredEvents.indexOf(event.type) < 0) {
        if (this.ignoreFirstEvent) {
          this.logger.log(-1,  'onEvent',  'ignore first event')
          this.ignoreFirstEvent = false
          return
        }
        this.task.flow.push({
          screen: event.screen,
          widget: event.widget,
          type: event.type,
          state: event.state
        });
      }
    },

    removeEvent (i) {
      this.task.flow.splice(i, 1);
    },

    setStrict (value) {
      this.task.strict = value;
    },

    onCancel () {
      this.emit("close", {});
    },

    onSave() {
      this.task.flow.sort((a, b) => {
        return a.time - b.time;
      });
      this.emit("save", this.task);
    },

    getValue () {
      return this.task
    },

    setValue (task) {
      this.task = lang.clone(task)
    },

    cleanUp: function() {
      this.cleanUpTempListener();
    }
  },
  mounted() {}
};
</script>