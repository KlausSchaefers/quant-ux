<template>
  <div class="VommondContentContainer">


    <div class="MatcContent MatcMarginTopXXL ">
      <div class="MatcSection">
        <div class="container" v-if="user">
          <h2>My Account</h2>

          <p class="MatcLead MatcMarginBottomXL">
            Change your personal settings here!
          </p>
          <div class="row">

            <div class="col-md-8 " v-if="isQuxAuth">
              <div data-dojo-type="de/vommond/Form">

                <div class="form-group MatcHoverHint" @dblclick="isEmailDisabled = false">
                  <label>
                    Email <span class="MatcHint" v-if="isEmailDisabled">(double click to edit)</span>
                  </label>

                  <input type="email" class="form-control" ref="emailField" :disabled="isEmailDisabled"
                    v-model="user.email" placeholder="Your email" />
                </div>

                <div class="form-group">
                  <label>Name</label>
                  <input type="email" class="form-control" v-model="user.name" placeholder="Enter your name"
                    data-binding-required="true">
                </div>

                <div class="form-group">
                  <label>Lastname</label>
                  <input type="email" class="form-control" v-model="user.lastname" placeholder="Enter your lastname"
                    data-binding-required="true">
                </div>

                <div class="form-group">
                  <label>Homepage</label>
                  <input type="text" class="form-control" v-model="user.homepage" placeholder="http://www.yourpage.com">
                </div>

                <div class="form-group">
                  <label>Password</label>
                  <input type="password" class="form-control" v-model="password"
                    placeholder="To change, enter new password">
                </div>


                <div class="form-group">
                  <label>Newsletter</label>
                  <div>
                    <CheckBox v-model="user.newsletter" label="I want to receive the newsletter" />
                  </div>
                </div>

                <div class="MatcErrorLabel">
                  {{ error }}
                </div>

                <div class="MatcButtonBar">
                  <a class="MatcButton" @click="save">Save</a>
                  <a class="MatcLinkButton" href="#/apps/my-apps.html">Cancel</a>
                </div>
              </div>
            </div>
            <div class="col-md-8" v-else>
              <p class="MatcLead MatcMarginBottomXL">
                Your credentials are managed in Keycloak. Contact your admin for help.
              </p>
            </div>
            <div class="col-md-2 col-md-offset-1 visible-md-block visible-lg-block">
              <Label>Image</Label>
              <UserImage :user="user" @change="onImageChanged"/>
            </div>
   
          </div>
          <div class="row ">
            <div class="col-md-8 MatcMarginTopXXL">
         
              <p class="MatcDangerBox">
             
                If you want to delete your account, click <a @click="retire">here</a>. All your data will
                be removed, including your prototypes. If you want to save them, export them as *.zip files.
              </p>
            </div>

          </div>
        </div>


      </div>
    </div>
  </div>
</template>
<script>
import lang from 'dojo/_base/lang'
import on from 'dojo/on'

import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Services from "services/Services";
import CheckBox from "common/CheckBox.vue";
import UserImageUploader from "page/UserImageUploader.vue";

export default {
  name: "Finish",
  mixins: [DojoWidget],
  data: function () {
    return {
      isEmailDisabled: true,
      password: '',
      error: '',
      user: null,
      errorHomepage: false,
      errorName: false,
      errorLastName: false
    };
  },
  watch: {},
  components: {
    'CheckBox': CheckBox,
    'UserImage': UserImageUploader
  },
  computed: {
    isQuxAuth() {
      return Services.getConfig().auth !== 'keycloak'
    }
  },
  methods: {
    async retire() {
      this.logger.log(0, "retire", "entry");

      const db = new DomBuilder();
      const dialog = db.div("MatcDialog").build();
      const name = this.user.name ? this.user.name : this.user.email;

      db.h3("", this.getNLS("user.retire.hi") + name + ",")
        .build(dialog);

      db.div("MatcMarginTop", this.getNLS("user.retire.msg"), true)
        .build(dialog);

      const bar = db
        .div("MatcButtonBar MatcMarginTopXXL")
        .build(dialog);

      const del = db
        .a("MatcButton MatcButtonDanger", this.getNLS("btn.delete"))
        .build(bar);

      const cancel = db
        .a("MatcLinkButton", this.getNLS("btn.cancel"))
        .build(bar);

      const d = new Dialog();
      d.popup(dialog, this.$refs.retireBUTTON);
      d.own(on(del, "click", lang.hitch(this, "_retireUser", d, dialog)));
      d.own(on(cancel, "click", function () {
        d.close();
      }));
    },

    _retireUser(d, dialog) {
      Services.getUserService().retire(this.user); // this._doGet("/rest/retire");
      d.shake();
      dialog.innerHTML = this.getNLS("user.retire.cusoon");
      d.own(
        on(d, "close", () => {
          this.$root.$emit("logout");
        })
      );
    },

    confirm() {
      return new Promise(resolve => {
        const db = new DomBuilder();
        const dialog = db.div("MatcDialog").build();

        const name = this.user.name ? this.user.name : this.user.email;
        const message = this.getNLS("user.change.email") + this.user.email

        db.h3("", this.getNLS("user.change.hi") + name + ",")
          .build(dialog);

        db.div("MatcMarginTop", message, true)
          .build(dialog);

        const bar = db
          .div("MatcButtonBar MatcMarginTopXXL")
          .build(dialog);

        const save = db
          .a("MatcButton MatcButtonRed", this.getNLS("btn.save"))
          .build(bar);

        const cancel = db
          .a("MatcLinkButton", this.getNLS("btn.cancel"))
          .build(bar);

        const d = new Dialog();
        d.popup(dialog, this.$refs.emailField);
        d.own(on(save, "click", () => {
          resolve(true)
          d.close()
        }))
        d.own(on(cancel, "click", () => {
          d.close();
        }))
        d.on("close", () => {
          resolve(false)
        });
      })
    },

    async save() {
      this.logger.log(0, "save", "entry");
      const data = {
        name: this.user.name,
        lastname: this.user.lastname,
        homepage: this.user.homepage,
        newsletter: this.user.newsletter
      };

      if (this.orginalEmail !== this.user.email) {
        const sure = await this.confirm()
        if (!sure) {
          return
        }
        data.email = this.user.email
      }

      if (this.password > 0) {
        if (this.password.length < 6) {
          console.warn("Password too short");
          this.error = "The password must have at least 6 characters";
          return;
        } else {
          data.password = this.password;
        }
      }

      const result = await Services.getUserService().save(this.user._id, data);
      if (result.errors) {
        this.logger.error("save", "Email taken", this.user.email);
        this.showError("Email is taken...");
        this.error = "The email is already taken";
      } else {
        this.$root.$emit("user", result);
        this.showSuccess("Account updated");
      }
    },

    onImageChanged () {
      this.showSuccess("Image changed");
      // fixme, we should actually update the user
    },
  },
  async mounted() {
    this.logger = new Logger("Finish");
    let user = Services.getUserService().load()
    Services.getUserService()
      .loadById(user.id)
      .then(full => {
        this.user = full;
        this.orginalEmail = this.user.email
        this.logger.info("mounted", "exit >> " + this.user.email);
      });
  }
};
</script>

