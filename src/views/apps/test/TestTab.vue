<template>
  <div class="MatcTest MatcLayout" >
    <section class="" v-if="false">
   
        <div class="box is-shadowless">
          <h3 class="title">Tests
            <HelpButton
              topic="testing"
              subtopic="testing.howmany"
              :hasNotifications="false"
            />

          </h3>
          <div class="MatcForm" id="testUserCountCntr">
            <BulletGraph :value="sessionCount" :sections="bulletGraphSection" />
          </div>
        </div>

    </section>
    <section class="" data-dojo-attach-point="sectionDes" >

        <div class="box is-shadowless ">

            <h3 class="title">
              {{getNLS('testSettingsHeader')}}  
              <HelpButton topic="testing" subtopic="testing.landing" :hasNotifications="false"/>
            </h3>

          
            <div class="MatcLayoutCols mb-32">
                <textarea
                    class="form-control MatcTextAreaMedium MatcLayoutColGrow"
                    v-model="test.description"
                    data-gramm_editor="false"
                    @change="onTestChange"
                    placeholder="Enter here a welcome message for your testers."
                  />
              
                  <div class="MatcLayoutCol3" >
                      <div :class="['MatUploader MatUploaderDropZone', {'MatUploaderDropZoneHover': hasDragOver}, {'MatUploaderHasFile': hasSplash}]" 
                        @dragenter="onDragEnter" @dragleave="onDragLeave" @drop="onDrop">
                        
                          <div class="MatcHint" v-if="!hasSplash">{{ splashMessage}}</div>
                          <div v-else class="MatUploaderPreview" :style="'background-image:url(' + splashUrl + ')'">
                            <span class="MatUploaderPreviewRemove mdi mdi-close-circle" @click="onRemoveSplash"/>
                          </div>

                          <input type="file" v-if="!hasSplash" @change="onFileChanged" >
                      </div>
                  </div>
            </div>

            <div class="form-group ">
            <CheckBox :value="test.recordOneTestPerUser" :label="getNLS('testSettingsRecordOneTestPerUser')" @change="setRecordOnePerUser"/>
          </div>

        
      </div>
    </section>


    <section data-dojo-attach-point="sectionTask">

        <div class="box is-shadowless">
          <h3 data-nls="testSettingsTasks" class="title">Tasks
            <HelpButton
              topic="testing"
              subtopic="testing.tasks"
              :hasNotifications="false"
            /></h3>
          <TestSettings :pub="pub" :test="test" :app="app" @change="onTaskChange" :hash="hash"/>
        </div>
  
    </section>

    <section class="">
 
        <div class="box is-shadowless">
          <h3 class="title">Screen Recordings</h3>
          <div ref="sessionCntr" class="MatcDashTable"></div>
        </div>

    </section>

  </div>
</template>
<style lang="scss">
  @import '../../../style/components/upload.scss';
  @import '../../../style/components/layout.scss';
</style>
<script>
import Logger from "common/Logger"
import DojoWidget from "dojo/DojoWidget"
import css from "dojo/css"
import on from "dojo/on"
import lang from "dojo/_base/lang"
import DataFrame from "common/DataFrame"
import BulletGraph from "common/BulletGraph"
import TestSettings from "views/apps/test/TestSettings"
import Table from "common/Table"
import Services from "services/Services"
import Analytics from "dash/Analytics"
import Plan from "page/Plan"
import {iconDOM} from "page/QIconUtil"
import Util from "core/Util"
import HelpButton from "help/HelpButton"
import Dialog from "common/Dialog"
import touch from "dojo/touch"
import DomBuilder from "common/DomBuilder"
import CheckBox from "common/CheckBox";

export default {
  name: "Test",
  mixins: [DojoWidget, Plan, Util],
  props: ["app", "test", "annotation", "events", "hash"],
  data: function() {
    return {
      sessionCount: 10,
      hasDragOver: false,
      isUploading: false,
      hasComments: false,
      bulletGraphSection: [
        {
          value: 5,
          color: "#f83a3a",
          label:
            "Jakob Nielsen argues that 5 testers are needed to uncover 85% of all errors in an qualitative usababilty study."
        },
        {
          value: 10,
          color: "#ffb61c",
          label:
            "Hwang & Salvendy suggest the 10+-2 rule as a good sample size."
        },
        {
          value: 20,
          color: "#83b600",
          label:
            "Accoring to Jakob Nielsen 20 testers are required to get statistically valid results."
        }
      ]
    };
  },
  components: {
    'BulletGraph': BulletGraph,
    'TestSettings': TestSettings,
    'HelpButton': HelpButton,
    'CheckBox': CheckBox
  },
  computed: {
    pub() {
      return this.$route.meta && this.$route.meta.isPublic;
    },
    urlPrefix() {
      if (this.pub) {
        return "examples";
      }
      return "apps";
    },
    hasSplash () {
      return this.test && this.test.splash
    },
    splashUrl () {
      if (this.test && this.test.splash) {
        return '/rest/images/' + this.hash + "/" + this.test.splash.url
      }
      return ''
    },
    splashMessage () {
      if (this.isUploading) {
        return this.getNLS('test.splash.uploading')
      }
      return this.getNLS('test.splash.upload')
    }
  },
  methods: {
    onDragEnter () {
      this.hasDragOver = true
    },
    onDragLeave () {
      this.hasDragOver = false
    },
    onDrop (e) {
      this.logger.log(-1, 'onDrop', 'enter', e)
      e.stopPropagation()
      e.preventDefault()
      let files = e.dataTransfer.files
      this.hasDragOver = false
      this.uploadSplash(files)
    },
    onFileChanged (e) {
      let files = e.target.files
      this.uploadSplash(files)
    },
    async uploadSplash(files) {
      this.logger.log(-1, 'onDrop', 'enter', files)
      if (files.length === 1) {
          this.isUploading = true
          let file = files[0]
          let url = '/rest/images/' + this.app.id + '?resize=false';
          let formData = new FormData();
				  formData.append('file', file);
          let result = await this.imageService.upload(url, formData)
          result = JSON.parse(result)
     
          if (result.uploads && result.uploads.length === 1) {
            this.test.splash = result.uploads[0]
            this.onTestChange()
          }
          this.isUploading = false
      } else {
        this.showError("Upload single image");
      }
    },
    async onRemoveSplash () {
      if (this.test.splash) {
        await this.imageService.delete(this.app, this.test.splash)
      }
      delete this.test.splash
      this.onTestChange()
    },
    onTaskChange(test) {
      this.$emit("change", lang.clone(test));
    },
    setRecordOnePerUser(value) {
      this.test.recordOneTestPerUser = value
      this.onTestChange()
    },
    async onTestChange() {
      if (this.pub) {
        this.showSuccess("Saved");
      } else {
        const res = await this.modelService.saveTestSettings(
          this.app.id,
          this.test
        );
        if (res.status === "ok") {
          this.showSuccess("Saved");
          this.$emit("change", lang.clone(this.test));
        } else {
          this.showError("Could not save test settings");
        }
      }
    },
    showBullet() {
      this.logger.log(-2, "show", "entry >");
      const df = new DataFrame(this.events);
      this.sessionCount = df.unique("session");
      this.logger.log(0, "show", "exit", this.sessionCount);
    },
    showSessions() {
      this.logger.log(-1, "showSessions", "enter " + this.planGetTestCount());
      this.cleanUpTempListener()
      const app = this.app;
      const list = this._getTestList(lang.clone(this.events), this.annotation, this.test);
      const urlPrefix = this.urlPrefix;

      const tbl = this.$new(Table);
      tbl.setColumns([
        {
          query: "label",
          width:10,
          label: "Test",
          fct: (td, row) => {
            const input = document.createElement('input')
            css.add(input, 'form-control MatcInlineEdit')
            input.value = row.label
            td.appendChild(input)
            this.tempOwn(on(input, "change", () => this.onChangeSessionLabel(input.value, row)))
          }
        },
        {
          query: "status",
          label: this.getNLS("videoTableStatus")
        },
        {
          query: "taskPerformance",
          label: "Successful Tasks",
          fct: (td, row) => {
            const names = row.taskNames;
            const cntr = document.createElement('div')
            css.add(cntr, "MatcTagCntr");
            if (names && names.length > 0) {
              for (let r = 0; r < names.length; r++) {
                const span = document.createElement("span");
                css.add(span, "tag");
                span.innerHTML = names[r];
                cntr.appendChild(span);
              }
            } else {
              td.innerHTML = "-";
            }
            td.appendChild(cntr)
          }
        },
        {
          query: "duration",
          label: this.getNLS("videoTableDuration"),
          fct: (td, row) => {
            td.innerHTML = row.duration + ' sec'
          }
        },
        // {
        //   query: "size",
        //   label: this.getNLS("videoTableEvents")
        // },
        {
          query: "date",
          label: this.getNLS("videoTableDate")
        }
      ]);
      tbl.setActions([
        {
          render: (node, row) => {
            const group = document.createElement("div");
            group.style.width = '140px'
            group.style.display = 'inline-block'
            node.appendChild(group);

            const play = document.createElement("a");
            play.href = "#/" +  urlPrefix + "/" +  app.id + "/replay/" + row.session + ".html";
            css.add(play, "MatcButton MatcButtonSecondary MatcButtonXXS");
            play.appendChild(iconDOM('PlayVideo'))
            group.appendChild(play);

            const remove = document.createElement("a");
            this.tempOwn(on(remove, 'click',(e) => this.showDeleteSessionDialog(e, row)));
            css.add(remove, "MatcButton MatcButtonDanger MatcButtonXXS MatcButtonSecondary");
            remove.appendChild(iconDOM('DeleteTrash'))
            group.appendChild(remove);

          }
        }
      ]);

      this.$refs.sessionCntr.innerHTML = ""
      tbl.placeAt(this.$refs.sessionCntr);
      tbl.setValue(list);
    },

    onChangeSessionLabel (value, row) {
      this.logger.log(-1,"onChangeSessionLabel", "enter >", value);
      const session = row.session
      const sessionStart = this.events.find(e => e.type === 'SessionStart' && e.session === session)
      if (sessionStart) {
        sessionStart.label = value
        this.modelService.updateEvent(this.app.id, sessionStart)
        this.$root.$emit("Success", "Test name was updated");
      } else {
        this.logger.warn("onChangeSessionLabel", "No session start >");
      }

    },

    showDeleteSessionDialog (e, session) {
      this.logger.log(1,"showDeleteSessionDialog", "enter >", session.session);
      const db = new DomBuilder()
      const div = db.div("MatcDeleteDialog").build();
      db.h3("title is-4", 'Delete Test').build(div);
      db.p('MatcMarginBottomXL', "Do you want to delete the test? You will loose all data related to this test!").build(div)
      const bar = db.div("MatcButtonBar").build(div);
      const write = db.a("MatcButton MatcButtonDanger", this.getNLS("btn.delete")).build(bar);
      const cancel = db.a("MatcLinkButton", this.getNLS("btn.cancel")).build(bar);
      const d = new Dialog();
      d.own(on(write, touch.press, lang.hitch(this, "deleteSession", session, d)));
      d.own(on(cancel, touch.press, lang.hitch(d, "close")));
      d.popup(div, e.target);
    },

    async deleteSession (session, d) {
      this.logger.log(1,"deleteSession", "enter >", session.session);
      if (!this.pub) {
        await this.modelService.deleteEventsBySession(this.app.id, session.session)
        this.showSuccess('Test deleted');
        this.$emit('reloadEvents')
      }

      d.close()
    },

    _getTestList (events, annotatation, testSettings) {
      const list = [];

      if (!testSettings.tasks) {
        testSettings.tasks = [];
      }

      const df = new DataFrame(events);
      df.sortBy("time");
      const sessionGroup = df.groupBy("session");
      const sessions = sessionGroup.data;

      const annoSession = new DataFrame(annotatation).groupBy("reference");

      const actionDF = this.getActionEvents(new DataFrame(events));

      const analytics = new Analytics();
      const taskCount = testSettings.tasks.length;
      // merge in annotation overwrites
      const tasksPerformance = analytics.getMergedTaskPerformance(
        actionDF,
        testSettings.tasks,
        annotatation
      );
      const tasksBySession = tasksPerformance.count("session");

      const sessionTaskNames = analytics.getSuccessTaskNames(
        tasksPerformance,
        testSettings.tasks
      );

      let id = 1;
      for (let sessionID in sessions) {
        let label = `Test ${id}`
        const session = sessions[sessionID];
        const date = this.formatDate(session.min("time"));

        const anno = annoSession.get(sessionID);
        let status = '<span class="MatchDashStatusSuccess">Valid</span>';
        let isValid = true;
        if (anno) {
          isValid = anno.get(0).get("isValid");
          if (!isValid) {
            status = '<span class="MatchDashStatusFailure">Ignore</span>';
          }
        }

        const start = session.data.find(e => e.type === 'SessionStart')
        if (start && start.label) {
          label = start.label
        }

        /** Since 2.4 we show also the user */
        let user = session.data && session.data.length > 0 ? session.data[0].user : '-'
        if (user && user.name) {
          user = user.name
        }

        let taskSuccess = tasksBySession.get(sessionID);
        if (!taskSuccess) {
          taskSuccess = 0;
        }

        const actionsEvents = this.getActionEvents(new DataFrame(session.data));

        const item = {
          session: sessionID,
          user: user,
          taskPerformance: taskSuccess + " / " + taskCount,
          taskNames: sessionTaskNames[sessionID],
          duration: Math.ceil((session.max("time") - session.min("time")) / 1000),
          date: date,
          start: session.min("time"),
          size: actionsEvents.size(),
          status: status,
          isValid: isValid,
          id: id,
          label: label,
          screens: session.unique("screen")
        };

        list.push(item);
        id++;
      }

      list.sort((a, b) => {
        return a.id - b.id;
      });

      return list;
    }
  },
  watch: {
    test(v) {
      // for some reason not called
      this.logger.info("watch", "test >", v);
      this.test = v;
    },
    events (v) {
      this.logger.info("watch", "events >", v);
      this.events = v;
      this.showBullet();
      this.showSessions();
    }
  },
  async mounted() {
    this.logger = new Logger("Test");
    this.modelService = Services.getModelService(this.$route);
    this.imageService = Services.getImageService()
    this.showBullet();
    this.showSessions();
    this.logger.info("mounted", "exit");
  }
};
</script>

