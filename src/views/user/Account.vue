<template>
  <div class="VommondContentContainer">


    <div class="MatcContent MatcAbout ">
      <div class="MatcSection">
        <div class="container" v-if="user">
          <h2>My Account</h2>

          <p class="MatcLead MatcMarginBottomXL">
            Change your personal settings here!
          <p>
          <div class="row">

            <div class="col-md-6" v-if="isQuxAuth">
              <div data-dojo-type="de/vommond/Form">
                <div class="form-group">
                  <label>Name</label>
                  <input type="email" class="form-control input-lg" v-model="user.name" placeholder="Enter your name"  data-binding-required="true">
                </div>

                <div class="form-group">
                  <label>Lastname</label>
                  <input type="email" class="form-control input-lg" v-model="user.lastname"  placeholder="Enter your lastname" data-binding-required="true" >
                </div>

                <div class="form-group">
                  <label>Homepage</label>
                  <input type="text"  class="form-control input-lg" v-model="user.homepage" placeholder="http://www.yourpage.com">
              </div>

                <div class="form-group">
                  <label>Password</label>
                  <input type="password" class="form-control  input-lg" v-model="password" placeholder="To change, enter new password">
                </div>


                <div class="form-group">
                  <label>Newsletter</label>
                  <div>
                  <CheckBox v-model="user.newsletter" label="I want to receive the newsletter"/>
                  </div>
                </div>

                <div class="VommondFormErrorLabel">
                    {{error}}
                </div>

                <div class="MatcButtonBar">
                  <a class="MatcButton" @click="save">Save</a>
                  <a class href="#/apps/my-apps.html">Cancel</a>
                </div>
              </div>
            </div>
            <div class="col-md-6" v-else>
              <p class="MatcLead MatcMarginBottomXL">
                Your credentials are managed in Keycloak. Contact your admin for help.
              </p>
            </div>
            <div class="col-md-2 col-md-offset-1 visible-md-block visible-lg-block">
              <Label>Image</Label>
              <UserImage :user="user" />
            </div>
              <div class="col-md-1 col-md-offset-1">
                  <a class="MatcButton MatcButtonRed" @click="retire">Delete</a>
              </div>

          </div>
      </div>
      </div>
    </div>
  </div>
</template>
<script>
// import Services from 'services/Services'
// import hash from "dojo/hash";
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
// import Form from 'common/Form'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Services from "services/Services";
import CheckBox from "common/CheckBox.vue";
import UserImage from "page/UserImage.vue";

export default {
  name: "Finish",
  mixins: [DojoWidget],
  data: function() {
    return {
      password:'',
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
      'UserImage': UserImage
  },
  computed: {
    isQuxAuth () {
        return Services.getConfig().auth !== 'keycloak'
    }
  },
  methods: {
    async retire () {
        this.logger.log(0, "retire", "entry");

		var db = new DomBuilder();
		var dialog = db.div("MatcDialog").build();

		var name = this.user.name ? this.user.name : this.user.email;

		db.h3("", this.getNLS("user.retire.hi") + name + ",").build(dialog);
		db.div("MatcMarginTop", this.getNLS("user.retire.msg"), true).build(dialog);

		var bar = db.div("MatcButtonBar MatcMarginTopXXL").build(dialog);

		var del = db.a("MatcButton MatcButtonRed", this.getNLS("btn.delete")).build(bar);
		var cancel = db.a("MatcLinkButton", this.getNLS("btn.cancel")).build(bar);


		var d = new Dialog();
		d.popup(dialog, document.getElementById("accountRetireButton"));
		d.own(on(del, "click", lang.hitch(this, "_retireUser", d, dialog)));
		d.own(on(cancel, "click", function () {
			d.close();
		}));
	},

	_retireUser(d, dialog) {
		this.logger.error("_retireUser", "enter");
		Services.getUserService().retire(this.user); // this._doGet("/rest/retire");
		d.shake();
		dialog.innerHTML = this.getNLS("user.retire.cusoon");
		d.own(on(d, "close", () => {
            this.$root.$emit('logout')
        }));
    },

    async save() {
      this.logger.log(0, "save", "entry");
      let data = {
          name: this.user.name,
          lastname: this.user.lastname,
          homepage: this.user.homepage,
          newsletter: this.user.newsletter
      }

      if (this.password > 0) {
          if (this.password.length < 6) {
              console.warn('Password too short')
              this.error = "The password must have at least 6 characters"
              return
          } else {
              data.password = this.password
          }
      }
      let result = await Services.getUserService().save(this.user._id, data);
      this.$root.$emit("user", result);
      this.showSuccess("Account updated");
    }
  },
  async mounted() {
    this.logger = new Logger("Finish");
    let user = Services.getUserService().load()
    Services.getUserService().loadById(user.id).then(full => {
      this.user = full
      this.logger.info("mounted", "exit >> " + this.user.email);
    })
  }
};
</script>

