
<template>
  <div class="MatcTeam">
    <div class="MatcTeamContainer" data-dojo-attach-point="cntr"></div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import Logger from "common/Logger";
import Dialog from "common/Dialog";
import _Tooltip from 'common/_Tooltip'
import DomBuilder from "common/DomBuilder";
import Input from "common/Input";
import RadioBoxList from "common/RadioBoxList";
import Util from "core/Util";
import Plan from "page/Plan";

import Services from "services/Services";

export default {
  name: "Team",
  mixins: [Util, Plan, _Tooltip, DojoWidget],
  props: ["appID", "userID"],
  data: function () {
    return {
      isSaving: false,
    };
  },
  components: {},
  methods: {
    postCreate () {
      this.logger = new Logger("Team");
      this.logger.log(4,"postCreate", "enter >" + this.appID + " > " + this.userID + " > " + this.reference);
      this.db = new DomBuilder();
      if (this.appID && this.userID) {
        this.load();
      }
    },

    async load() {
      let team = await Services.getModelService().findTeam(this.appID);
      this.setTeamLoaded(team);
    },

    setTeamLoaded (team) {
      this.team = team;
      this.render();
    },

    render  () {
      try {
        this.cleanUp();
        var div = document.createElement("div");

        this.plus = this.renderPlus(div);
        this.tempOwn(on(this.plus, touch.press, lang.hitch(this, "showAdd", this.plus)));

        for (var i = 0; i < this.team.length; i++) {
          var user = this.team[i];
          this.renderUser(div, user);
        }

        this.cntr.appendChild(div);
      } catch (err) {
        this.logger.sendError(err)
      }

    },

    renderPlus (div) {
      var item = this.db.div("MatcTeamItem ").build(div);
      var plus = this.db.div("MatcUserAdd").build(item);
      this.db.span("mdi mdi-plus MatcMiddle").build(plus);
      return plus;
    },

    renderUser  (div, user) {
      var item = this.db.div("MatcTeamItem ").build(div);
      var top = this.db.div("").build(item);
      this.createUserImage(user, top);
      this.tempOwn(on(item, touch.press, lang.hitch(this, "showEdit", top, user)));
      this.addTooltip(top, this.getUserName(user))
    },

    async showAdd() {
      var div = this.db.div("MatcTeamDialog MatcPadding").build();

      var cntr = this.db.div("container").build(div);
      var row = this.db.div("row").build(cntr);

      var right = this.db.div("col-md-12").build(row);

      this.db.h2("title", "Add Team Member").build(right);

      var email = this.$new(Input);
      email.setPlaceholder("Enter the email");
      email.setCss("input");
      email.placeAt(right);

      var error = this.db
        .div("MatcErrorLabel MatcErrorLabelEmpty")
        .build(right);

      var bar = this.db.div("buttons MatcMarginTop").build(cntr);

      var write = this.db.div("button is-primary", "Add User").build(bar);

      var cancel = this.db.a("button is-text", "Cancel").build(bar);

      var d = new Dialog({ overflow: true });
      d.own( on(write, touch.press, lang.hitch(this, "addUser", email, error, d, bar)));
      d.own(on(cancel, touch.press, lang.hitch(d, "close")));
      d.own(on(d, "close", lang.hitch(email, "destroy")));
      d.popup(div, this.plus);

      /**
       * Some kind of hack to male sure the focus is called.
       */
      setTimeout(function () {
        email.focus();
      }, 300);

      let suggestions = await Services.getModelService().findTeamSuggestions(
        this.appID
      );
      this.setTeamSuggestions(email, suggestions);
      // this._doGet("rest/apps/" + this.appID + "/suggestions/team.json", lang.hitch(this, "setTeamSuggestions", email));
    },

    setTeamSuggestions: function (email, data) {
      var ids = {};
      for (let i = 0; i < this.team.length; i++) {
        ids[this.team[i].id] = true;
      }

      var hints = [];
      for (let i = 0; i < data.length; i++) {
        var user = data[i];
        if (!ids[user.id]) {
          var option = { label: "", value: user.email };

          if (user.name) {
            option.label += user.name + " ";
          }

          if (user.lastname) {
            option.label += user.lastname + " ";
          }

          if (option.label.length > 0) {
            option.label += " - ";
          }

          option.label += user.email;
          if (user.image) {
            option.image = user.image;
          }
          hints.push(option);
        }
      }
      email.setHints(hints);
    },

    showEdit: function (item, user) {
      var popup = this.db
        .div("MatcTeamDialog MatcTeamDialogEdit MatcPadding MatcActionBox")
        .build();

      var cntr = this.db.div("container").build(popup);
      var row = this.db.div("columns").build(cntr);

      var left = this.db.div("column is-4").build(row);
      this.createUserImage(user, left);

      var right = this.db.div("column is-8").build(row);

      var lbl = this.db
        .div("MatcTeamUserName", this.getUserName(user))
        .build(right);
      var radio = null;
      if (user.permission == 3) {
        var label = this.db.div().build(right);
        css.add(label, "MatcHint MatcMarginTop");
        label.innerHTML = "Is the owner!";
      } else {
        lbl.innerHTML += " can:";
        radio = this.$new(RadioBoxList);
        radio.setOptions([
          { label: "Write", value: 2, css: "" },
          { label: "Read", value: 1, css: "" },
        ]);
        radio.placeAt(right);
        radio.setValue(user.permission);
      }

      row = this.db.div("columns").build(cntr);
      left = this.db.div("column is-4").build(row);
      right = this.db.div("column buttons").build(cntr);

      var d = new Dialog();

      if (user.permission != 3) {
        let write = this.db.div("button is-primary", "Save").build(right);
        let cancel = this.db.a("button is-text", "Cancel").build(right);
        let remove = this.db.a("button is-text", "Remove").build(right);
        d.own(on(cancel, touch.press, lang.hitch(d, "close")));
        d.own(on(write, touch.press, lang.hitch(this, "changePermission", user, radio, d)));
        d.own(on(remove, touch.press, lang.hitch(this, "removeUser", user, radio, d)));
      } else {
        let cancel = this.db.div("button is-primary", "Close").build(right);
        d.own(on(cancel, touch.press, lang.hitch(d, "close")));
      }
      d.popup(popup, item);
    },

    async addUser(input, error, dialog, bar, e) {
      this.logger.log(-1, "addUser", "enter");
      this.stopEvent(e);

      /**
       * Make sure we do not add twice!!
       */
      let email = input.getValue()
      let found = this.team.filter(t => t.email === email)
      if (found.length > 0) {
        this.logger.error("addUser", "EXIT > User already in team");
        dialog.close();
        return;
      }


      /**
       * Sometimes we users click here two times,
       * which causes ACL errors
       */
      if (this.isSaving) {
        this.logger.error("addUser", "EXIT > Is saving");
        return;
      }
      this.isSaving = true;
      var permission = 2;
      var user = { email: input.getValue(), permission: permission };
      let result = await Services.getModelService().createTeam(
        this.appID,
        user
      );

      this.isSaving = false;
      // var result = this._doPost("/rest/apps/" +this.appID + "/team/", user);
      if (result.type == "error") {
        if (result.errors[0] == "apps.team.member.add.error.email") {
          css.remove(error, "MatcErrorLabelEmpty");
          error.innerHTML = "No user is registered with the email!";
        }
        if (result.errors[0] == "apps.team.member.add.error.read") {
          css.remove(error, "MatcErrorLabelEmpty");
          error.innerHTML = "You can only read the app!";
        }
        dialog.shake();
      } else {
        dialog.close();
        this.load();
      }
    },

    async changePermission(user, radio, dialog) {
      user.permission = radio.getValue();
      dialog.close();
      radio.destroy();
      await Services.getModelService().updateTeam(this.appID, user);
      this.load();
    },

    async setPermission(permisson, user) {
      user.permission = permisson;
      await Services.getModelService().createTeam(this.appID, user);
      // this._doPost("/rest/apps/" +this.appID + "/team/", user);
      this.load();
    },

    async removeUser(user, radio, dialog) {
      await Services.getModelService().deleteTeam(this.appID, user);
      // this._doDelete("/rest/apps/" +this.appID + "/team/" +  user.id + ".json");
      dialog.close();
      radio.destroy();
      this.load();
    },

    cleanUp: function () {
      this.cleanUpTempListener();
      this.cntr.innerHTML = "";
    },
  },
  mounted() {},
};
</script>