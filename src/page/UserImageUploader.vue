<template>
  <div class="MatcUser MatcUserImageUploader">
    <div class="MatcCenter MatcInline">
      <div class="MatcUserImageCntr" data-dojo-attach-point="imageCntr"></div>
      <div class="MatcActionBar" data-dojo-attach-point="imageActions"></div>
    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import DomBuilder from "common/DomBuilder";
import Logger from "common/Logger";
import Services from 'services/Services'

export default {
  name: "UserImage",
  mixins: [DojoWidget],
  props: ["user"],
  data: function() {
    return {
      value: {}
    };
  },
  components: {},
  methods: {
    constructor () {
      this.logger = new Logger("UserImageUploader");
      this.logger.log(2, "constructor", "entry");
    },

    postCreate() {
      this._initFileDnD(document.documentElement);
      this.value = this.user;
      this.render(this.value);
    },

    render (user) {
      this.cleanUp();

      var db = new DomBuilder();
      if (user.image) {
        db.img("rest/user/" + user.id + "/images/" + user.name + "_" + user.lastname + "/" + user.image, "MatcUserImage").build(this.imageCntr);

        var upload = db
          .div("MatcActionBarBtn MatcUploadButton", "Change")
          .build(this.imageActions);
        this.file = db.file("MatcImageUploadFile").build(upload);
        this.tempOwn(on(this.file, "change", lang.hitch(this, "_onFileChange")));

        var del = db.a("MatcActionBarBtn", "Remove").build(this.imageActions);
        this.tempOwn(on(del, touch.press, lang.hitch(this, "_deleteImage")));
      } else {
        var plus = db
          .span(" mdi mdi-plus-circle", "")
          .build(this.imageCntr);
        this.file = db.file("MatcImageUploadFile").build(plus);
        this.tempOwn(on(this.file, "change", lang.hitch(this, "_onFileChange")));
        css.add(this.imageCntr, "MatcImageUploadAdd");
        db.span("MatcHint", "Click or Drop file to upload an image")
          .build(this.imageActions);
      }
    },

    cleanUp () {
      this.imageCntr.innerHTML = "";
      this.imageActions.innerHTML = "";

      css.remove(this.domNode, "MatcImageUploadDND");
      css.remove(this.imageCntr, "MatcImageUploadAdd");
      this.cleanUpTempListener();
    },

    /***************************************************
     * File Upload Handling
     ***************************************************/

    _stop (leave, e) {
      e.preventDefault;
      e.preventDefault();
      if (leave) {
        css.remove(this.domNode, "MatcImageUploadDND");
      } else {
        css.add(this.domNode, "MatcImageUploadDND");
      }
      return false;
    },

    onFileDropped (e) {
      e.preventDefault;
      e.preventDefault();
      this.stopEvent(e);
      var dt = e.dataTransfer;
      this._files = dt.files;
      css.remove(this.domNode, "MatcImageUploadDND");
      this._sendFiles();
      return false;
    },

    _onFileChange (e) {
      this.stopEvent(e);
      this._files = this.file.files;
      css.remove(this.domNode, "MatcImageUploadDND");
      this._sendFiles();
    },

    _sendFiles: function() {
      // here is some kind of stupid bug.

      var me = this;
      let token = Services.getUserService().getToken()
      var formData = new FormData();
      for (var i = 0; i < this._files.length; i++) {
        formData.append("file", this._files[i]);
      }

      // now post a new XHR request
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "rest/user/" + this.user.id + "/images/");
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.onload = function() {
        if (xhr.status === 200) {
          me.onUploadDone();
        } else {
          me.onUploadError();
        }
      };
      xhr.send(formData);
    },

    async _deleteImage (e) {
      this.stopEvent(e);
      await Services.getUserService().deleteImage(this.value)
      this.load();
      this.$emit("change")
    },

    onUploadDone () {
      this.load();
      this.$emit("change")
    },

    async load () {
      let u = await Services.getUserService().loadById(this.value.id)
      this.setUser(u)
    },

    setUser (u) {
      this.value = u;
      this.render(u);
    },

    onUploadError: function() {},

    _initFileDnD (node) {
      this._fileDnDListeners = [];

      this._fileDnDListeners.push(
        on(node, "dragenter", lang.hitch(this, "_stop", false))
      );
      this._fileDnDListeners.push(
        on(node, "dragover", lang.hitch(this, "_stop", false))
      );
      this._fileDnDListeners.push(
        on(node, "dragleave", lang.hitch(this, "_stop", true))
      );
      this._fileDnDListeners.push(
        on(node, "drop", lang.hitch(this, "onFileDropped"))
      );
    },

    _destroyFileDnD: function() {
      if (this._fileDnDListeners) {
        for (var i = 0; i < this._fileDnDListeners.length; i++) {
          this._fileDnDListeners[i].remove();
        }
      }
      delete this._fileDnDListeners;
    },

    destroy: function() {
      this.cleanUpTempListener();
      this._destroyFileDnD();
    }
  },
  mounted() {}
};
</script>