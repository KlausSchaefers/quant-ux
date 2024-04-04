<template>
  <div class="MatcAnnotation">
    <div data-dojo-attach-point="chkBoxCntr" class></div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import topic from "dojo/topic";
import hash from "dojo/hash";
import Logger from "common/Logger";
import DropDownButton from "page/DropDownButton";
import Services from "services/Services";

export default {
  name: "VideoAnnotation",
  mixins: [DojoWidget],
  props: ["appID", "sessionID", "test", "annotation", "events", "pub"],
  data: function() {
    return {
      value: null
    };
  },
  components: {},
  methods: {
    postCreate () {
      this.log = new Logger("VideoAnnotation");

      this.btn = this.$new(DropDownButton);
      this.btn.setOptions([
        {
          label: "The test was ok",
          value: true,
          css: "MatcButtonGreen",
          icon: ""
        },
        {
          label: "Ignore this test",
          value: false,
          css: "MatcButtonDanger",
          icon: ""
        }
      ]);
      css.add(this.btn.domNode, "MatcButton");
      this.btn.placeAt(this.chkBoxCntr);
      this.own(on(this.btn, "change", lang.hitch(this, "onChangeValid")));

      this.deleteBtn = document.createElement("a");
      css.add(this.deleteBtn, "MatcButton MatcButtonDanger MatcMarginLeft");
      this.deleteBtn.innerHTML = "Delete Test";
      this.own(
        on(this.deleteBtn, touch.press, lang.hitch(this, "deleteSession"))
      );
      this.chkBoxCntr.appendChild(this.deleteBtn);
      this.setValue(this.annotation);
    },

    setValue(anno) {
      this.value = anno;
      this.render(this.value);
    },

    render (value) {
      this.cleanUp();
      this.btn.setValue(value.isValid);
      this.renderDelete(value);
    },

    renderDelete (value) {
      if (value.isValid) {
        css.add(this.deleteBtn, "hidden");
      } else {
        css.remove(this.deleteBtn, "hidden");
      }
    },

    cleanUp () {
      this.cleanUpTempListener();
    },

    onChangeValid (value) {
      this.log.log(0, "onChangeValid", "enter > " + value);
      this.value.isValid = value;
      this.sendUpdate();
      this.renderDelete(this.value);
    },

    async sendUpdate() {
      if (this.pub) {
        topic.publish(
          "App.Notification.Success",
          "Please register to save changes..."
        );
      } else {
        console.debug("sendUpate", this.value);
        if (!this.value.id) {
          let res = await Services.getModelService().saveAnnotation(
            this.appID,
            this.value
          );
          this.onAnnotionAdded(res);
        } else {
          let res = await Services.getModelService().updateAnnotation(
            this.appID,
            this.value
          );
          this.onAnnotionAdded(res);
        }
      }
    },

    deleteSession () {
      if (this.pub) {
        topic.publish(
          "App.Notification.Success",
          "Please register to save changes..."
        );
      } else {
        if (this.sessionID && this.appID) {
          Promise.all([
            Services.getModelService().deleteAnnotation(
              this.appID,
              this.value.id
            ),
            Services.getModelService().deleteEventsBySession(
              this.appID,
              this.sessionID
            ),
            Services.getModelService().deleteMouseBySession(
              this.appID,
              this.sessionID
            )
          ]).then(() => {
            hash("#/apps/" + this.appID + "/test.html");
          });
        }
      }
    },

    onAnnotionAdded (a) {
      this.value = a;
      this.showSuccess("Updates saved!");
      this.$emit("change", a);
    }
  },
  watch: {
    annotation(v) {
      this.setValue(v);
    }
  },
  mounted() {}
};
</script>