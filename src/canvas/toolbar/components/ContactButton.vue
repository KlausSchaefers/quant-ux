
<template>
  <div class="MatcHidden MatcToolbarItem MatcNotification">
    <div type="button" @click="showDialog">
      <span class="mdi mdi-email-outline"></span>
    </div>
  </div>
</template>
<script>
import css from "dojo/css";
import DojoWidget from 'dojo/DojoWidget'
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import Logger from "common/Logger";
import DomBuilder from "common/DomBuilder";
import Dialog from "common/Dialog";
import Services from "services/Services";

export default {
  name: "Notification",
  mixins: [DojoWidget],
  data: function() {
    return {
      section: "",
      reposition: false,
      arrowPosition: 0
    };
  },
  components: {},
  methods: {
    showDialog() {
        var dialog = new Dialog();
        var db = new DomBuilder();
        let popup = db.div("MatcDialog MatcPadding").build();


        let cntr = db.div().build(popup);
        db.h3("MatcDialogHeader", "Contact").build(cntr);

        let hint = db.p("MatcMarginBottom", "If you found a bug, miss a feature and want to share anything else, please contact us!").build(cntr);

        let name = db
            .div("form-group")
            .label("", "Name")
            .parent()
            .input("form-control input-lg MatcIgnoreOnKeyPress")
            .build(cntr);

        let email = db
            .div("form-group")
            .label("", "Email")
            .parent()
            .input("form-control input-lg MatcIgnoreOnKeyPress")
            .build(cntr);


        let msg = db
            .div("form-group")
            .label("", "Message")
            .parent()
            .textarea("form-control input-lg MatcIgnoreOnKeyPress")
            .build(cntr);

        let bar = db.div("MatcButtonBar MatcMarginTopXL").build(popup);
        let send = db.div("MatcButton MatcButtonPrimary", "Send").build(bar);
        let cancel = db.a("MatcLinkButton ", "Cancel").build(bar);
        dialog.own(on(cancel, touch.press, lang.hitch(dialog, "close")));
        dialog.own(on(send, touch.press, lang.hitch(this, "send", name, email, msg, dialog, hint)));

        if (this.user && this.user.role !== 'guest') {
            name.value = this.user.name
            email.value = this.user.email
            setTimeout(() => {
                msg.focus()
            }, 200)
        } else {
            setTimeout(() => {
                name.focus()
            }, 200)
        }


        dialog.popup(popup, this.$el);
    },

    async send (inputName, inputEmail, inputMsg, dialog, hint) {
        let name = inputName.value
        let email = inputEmail.value
        let msg = inputMsg.value

        if (email.length === 0 || msg.length === 0) {
            this.logger.info('Empty shake')
            dialog.shake()
        } else {
            let res = await Services.getUserService().contact(name, email, msg)
            if (res) {
                hint.innerHTML = 'Thanks for contacting us! The dialog will close automatically'
                this.$root.$emit('Success', 'Thanks for contacting us! The dialog will close automatically')
                setTimeout(() => {
                    dialog.close()
                }, 500)
            }
        }
    }
  },
  async mounted() {
    this.logger = new Logger("ContactButton")
    setTimeout(() => {
        css.remove(this.$el, "MatcHidden")
    }, 2000)
    this.user = await Services.getUserService().getUser()
    this.logger.log(4, 'mounted', 'User', this.user.email)
  }
};
</script>