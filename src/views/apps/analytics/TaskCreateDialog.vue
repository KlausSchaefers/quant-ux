
<template>
  <div :class="'MatcDialog TaskCreateDialog ' + model.type">
    <div class="TaskCreateDialogCntr">
      <div class="FormCntr" >

          <div class="form-group">
            <label>Name</label>
            <input  v-model="task.name" type="text" class="form-control" placeholder="Name"  />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea  v-model="task.description" type="text" class="form-control"  placeholder="An explaination for the users"  />
          </div>



          <div>
            <label>Expected Steps</label>
            <p class="MatcHint mb-16">Click in the simulator to add steps. You can remove steps that are not needed by clicking on them.</p>
            <div class="StepCntr form-group">
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
            <div class="form-group">
               <CheckBox label="Strict matching. No events between are allowed." :value="task.strict"  @change="setStrict"/>
            </div>
            <div class="form-group">
              <CheckBox label="Record only screen views" :value="recordOnlyScreenViews"  @change="setRecordOnlyScreenView"/>
            </div>
          </div>

      </div>

      <div class="SimCntr" ref="simCntr">

        <div class="SimWrapper" ref="wrapper">

        </div>

        <div v-if="abScreens && abScreens.length > 0" class="ABSelector">
          <p class="MatcHint">
            Select the next screen to show
          </p>
          <div v-for="box in abScreens" :key="box.id" class="MatcButton" @click="selectABLine(box)">
            {{box.name}}
          </div>
        </div>

      </div>

    </div>


    <div class="MatcButtonBar">
      <a class="MatcButton MatcButtonPrimary" @click="onSave">Save</a>
      <a class="MatcLinkButton" @click="onCancel" >Cancel</a>
    </div>

  </div>
</template>
<style lang="scss">
  @import '../../../style/components/task_create_dialog.scss';
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import Logger from "common/Logger";
import CheckBox from "common/CheckBox";
import Simulator from "core/Simulator";
import Util from "core/Util";
import domGeom from "dojo/domGeom";

export default {
  name: "TaskCreateDialog",
  props: ['model'],
  mixins: [Util, DojoWidget],
  data: function() {
    return {
      hash: 'NoHashTaskCreate',
      recordOnlyScreenViews: true,
      abScreens: null,
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
  components: {
    'CheckBox': CheckBox
  },
  computed: {
    steps () {
      return this.task.flow.map(event => {
        return {
          screen: this.getScreenName(event.screen),
          widget: this.getWidgetName(event.widget),
          type:  this.getEventLabelWithState(event),
          label: event.widget ? this.getWidgetName(event.widget) + ' @ ' + this.getScreenName(event.screen): this.getScreenName(event.screen)
        }
      })
    }
  },
  methods: {

    getEventLabelWithState (event) {
      if (event.state && (event.type === 'WidgetClick' || event.type === 'WidgetChange')) {
        return this.getEventStateLabel(event.state)
      }
      return this.getEventLabel(event.type)
    },

    setRecordOnlyScreenView (v) {
      this.recordOnlyScreenViews = v
    },

    postCreate () {
      this.logger = new Logger("TaskCreateDialog");
      this.logger.log(-1, "postCreate", "enter > " + this.appID + "> " + this.hash);
      setTimeout(() => {
        this.createSimulator()
      }, 500)
    },

    createSimulator () {
      const wrapper = this.$refs.wrapper
      const pos = this.resizeSimulatorContainer(this.model, this.$refs.simCntr, 0.7);
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
      this.simulator.abSelector = (lines, callback) => {this.showABDialog(lines, callback)}
      this.simulator.setModel(this.model);
    },

    async showABDialog (lines, callback) {
      this.logger.log(-1,  'showABDialog',  'enter > ', lines)
      this.abCallback = callback
      this.abLines = lines
      this.abScreens = lines.map(line => {
        let to = line.to
        if (this.model.screens[to]) {
          return this.model.screens[to]
        }
        if (this.model.widgets[to]) {
          return this.model.widgets[to]
        }
      })

    },

    selectABLine (box) {
      this.logger.log(-1,  'selectABLine',  'enter > ', box)
      if (this.abLines && this.abCallback) {
       let selectedLine = this.abLines.find(l => l.to === box.id)
       this.abCallback(selectedLine)
      }

      this.abLines = null
      this.abScreens = null
      this.abCallback = null
    },

    resizeSimulatorContainer (app, node) {
        let pos = domGeom.position(node)
        pos.h = 600
        if (app.type == 'smartphone') {
            // there might be wide screen apps
            if (app.screenSize.h < app.screenSize.w) {
              this.logger.log(-1,  'resizeSimulatorContainer', 'Wide screen')
 
              pos = this.getScaledSize(pos, "width", app);
            } else {
              pos = this.getScaledSize(pos, "height", app);
            }
            
        } else {
        
            pos = this.getScaledSize(pos, "width", app);
        }
        return pos
    },


    onEvent (event) {
      this.logger.log(-1,  'onEvent',  'enter > ignoreFirstEvent:' + this.ignoreFirstEvent, event)

      if (this.recordOnlyScreenViews) {

        if (event.type === 'ScreenLoaded' || event.type === 'OverlayLoaded' ) {
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

      } else  if (this.ignoredEvents.indexOf(event.type) < 0 ) {

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