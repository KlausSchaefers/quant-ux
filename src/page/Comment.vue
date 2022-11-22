<template>
  <div class="MatcComment">
    <div class="MatcCommentBar " data-dojo-attach-point="btnBar">
   
    </div>
    <div class="MatcCommentContainer" data-dojo-attach-point="cntr"></div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import Logger from "common/Logger";
import Util from "core/Util";
import Services from "services/Services";

export default {
  name: "Comment",
  mixins: [Util, DojoWidget],
  props: ["type", "reference", "appID", "contentID", "insertPosition"],
  data: function() {
    return {
      collapsed: false
    };
  },
  components: {},
  methods: {
    async postCreate() {
      this.logger = new Logger("Comment");
      let user = await Services.getUserService().load();
      this.userID = user.id;
      this.setUserAndLoad(user);
      if (this.collapsed == "true") {
        this.setCollapsed(true);
      }
      this.logger.log(4, "postCreate", "exit", this.user);
    },

    setUserAndLoad: function(u) {
      this.user = u;
      this.load();
    },

    setType: function(t) {
      this.type = t;
    },

    setInsertPosition: function(p) {
      this.insertPosition = p;
    },

    setCollapsed: function(c) {
      this.collapsed = c;
      if (this.collapsed) {
        css.remove(this.btnBar, "hidden");
        css.add(this.cntr, "MatcHidden");
      }
    },

    onToggleCollapse: function() {
      this.collapsed = !this.collapsed;
      if (this.collapsed) {
        css.add(this.cntr, "MatcHidden");
      } else {
        css.remove(this.cntr, "MatcHidden");
        this.load();
      }
    },

    setReference: function(r) {
      this.reference = r;
    },

    setUser: function(u) {
      this.user = u;
    },

    setApp: function(appID) {
      this.appID = appID;
    },

    setHash: function(hash) {
      this.hash = hash;
    },

    async load() {
      this.logger.log(
        5,
        "load",
        "enter >" + this.appID + " > " + this.reference
      );
      let comments = await Services.getCommentService().find(
        this.appID,
        this.type,
        this.reference
      );
      this.setValue(comments);
    },

    setValue: function(comments) {
      this.comments = comments;
      this.render(comments);
    },

    render: function(comments) {
      if (this.insertPosition == "top") {
        comments.sort(function(a, b) {
          return b.created - a.created;
        });
      } else {
        comments.sort(function(a, b) {
          return a.created - b.created;
        });
      }

      this.cleanUp();

      var ul = document.createElement("ul");

      if (this.insertPosition == "top") {
        this.createInput(ul);
      }
      for (var i = 0; i < comments.length; i++) {
        var comment = comments[i];
        var txt = this.createItem(ul, comment.user);

        var meta = document.createElement("div");
        css.add(meta, "MatcCommentMeta");
        txt.appendChild(meta);

        var message = document.createElement("div");
        css.add(message, "MatcCommentMessage");
        this.setTextContent(message, comment.message);
        txt.appendChild(message);

        var name = document.createElement("span");
        css.add(name, "MatcCommentNameLabel");
        meta.appendChild(name);

        if (comment.user && (comment.user.name || comment.user.lastname)) {
          this.setTextContent(name, this.getUserName(comment.user));
        } else {
          this.setTextContent(name, this.getNLS("common.guest"));
        }

        var time = document.createElement("span");
        css.add(time, "MatcCommentTime");
        time.innerHTML = this.formatDate(comment.created);
        meta.appendChild(time);

        if (comment.userID == this.user.id) {
          var cntr = document.createElement("div");
          css.add(cntr, "MatcCommentActions MatcActionBar");
          meta.appendChild(cntr);

          var edit = document.createElement("a");
          css.add(edit, "button is-text");
          edit.innerHTML = this.getNLS("btn.edit");
          cntr.appendChild(edit);
          this.tempOwn(
            on(edit, touch.press, lang.hitch(this, "onEdit", comment, message))
          );

          var del = document.createElement("a");
          css.add(del, "button is-text");
          del.innerHTML = this.getNLS("btn.delete");
          cntr.appendChild(del);
          this.tempOwn(
            on(del, touch.press, lang.hitch(this, "onDelete", comment))
          );
        }
      }

      if (this.insertPosition == "bottom") {
        this.createInput(ul);
      }

      this.cntr.appendChild(ul);
    },

    async onDelete(comment) {
      var pos = this.comments.indexOf(comment);
      if (pos > -1) {
        this.comments.splice(pos, 1);
      }
      this.render(this.comments);
      await Services.getCommentService().delete(this.appID, comment);
    },

    onEdit(comment, txt) {
      txt.innerHTML = "";

      var input = document.createElement("textarea");
      css.add(input, "textarea");
      input.placeHolder = "Leave a comment";
      input.value = comment.message;
      txt.appendChild(input);

      var bar = document.createElement("div");
      css.add(bar, "MatcButtonBar MatcMarginTop ");
      txt.appendChild(bar);

      var btn = document.createElement("div");
      css.add(btn, "button is-primary");
      btn.innerHTML = this.getNLS("btn.post");
      bar.appendChild(btn);

      this.tempOwn(
        on(btn, touch.press, lang.hitch(this, "update", comment, txt, input))
      );
    },

    createInput: function(ul) {
      if (this.user.role != "guest") {
        let txt = this.createItem(ul, this.user);
        let input = document.createElement("textarea");
        css.add(input, "textarea");
        input.placeHolder = "Leave a comment";
        txt.appendChild(input);
        this.input = input;
        this.tempOwn(
          on(input, "focus", lang.hitch(this, "showButtons", txt, input))
        );
        return input;
      } else {
        let txt = this.createItem(ul, this.user);
        let input = document.createElement("p");
        css.add(input, "MatcCommentRow MatcMarginBottom MatcHint");
        input.innerHTML = "Please sign up to leave a comment.";
        txt.appendChild(input);
      }
    },

    showButtons: function(txt, input) {
      if (!this.buttonVisible) {
        var bar = document.createElement("div");
        css.add(bar, "MatcButtonBar ");
        txt.appendChild(bar);

        var btn = document.createElement("div");
        css.add(btn, "button is-primary mt-16");
        btn.innerHTML = this.getNLS('comments.post');
        bar.appendChild(btn);

        css.remove(input, "MatcTextAreaSmall");

        var callback = lang.hitch(this, "submit");
        this.tempOwn(on(btn, touch.press, callback));
        this.buttonVisible = true;
      }
    },
    createItem: function(ul, user) {
      var li = document.createElement("li");
      css.add(li, "MatcMarginBottom");
      ul.appendChild(li);

      var item = document.createElement("div");
      css.add(item, "MatcCommentRow");
      li.appendChild(item);

      var pic = this.createUserImage(user, item);
      css.add(pic, "MatcUserImageCntrSmall MatcCommentPic");

      var txt = document.createElement("div");
      css.add(txt, "MatcCommentText");
      item.appendChild(txt);

      var clear = document.createElement("div");
      css.add(clear, "MatcFloatClear");
      li.appendChild(clear);
      return txt;
    },

    async submit(e) {
      this.stopEvent(e);
      var comment = {
        message: this.input.value,
        type: this.type,
        reference: this.reference
      };
      let res = await Services.getCommentService().create(this.appID, comment);
      this.onCommentAdded(res);
      this.buttonVisible = false;
    },

    async update(comment, txt, input) {
      comment.message = input.value;
      await Services.getCommentService().update(this.appID, comment);
      this.render(this.comments);
    },

    onCommentAdded() {
      this.load();
    },

    cleanUp() {
      this.cleanUpTempListener();
      this.cntr.innerHTML = "";
      this.input = null;
    }
  },
  mounted() {}
};
</script>