<template>

  <div class="VommondContentContainer">
   

     <div class="MatcContent MatcAbout">
		<div class="MatcSection">
      <div class="container">
        <div class="row">
          <div class="col-md-6">

					<h2>Password Reset</h2>
					

					<div v-if="page === 1">
						<p class="MatcLead MatcMarginBottomXXL">
							Forgot your password? To reset your password, enter your email and click on &quot;Reset&quot;.
						</p>

						<input type="email"  class="form-control" v-model="email" placeholder="Enter your email">

						<div class="MatcErrorLabel" v-html="error"></div>

						<div class="MatcButtonBar">
							<a class="MatcButton MatcButtonPrimary" @click="reset">Reset</a>
							<a class href="#/">Cancel</a>
						</div>
					</div> <!-- End page 1 -->

					<div v-if="page === 2">
						<p class="MatcLead MatcMarginBottomXXL">
							We have send you an email with a reset-link. Please open the mail and visit the link.
						</p>
					</div> <!-- End page 2 -->

					<div v-if="page === 3">
						<p class="MatcLead MatcMarginBottomXXL">
							Please enter your email and your new password here
						</p>

						<div class="form-group">
							<label>Email</label>
							<input type="email"  class="form-control" v-model="email" placeholder="Enter your email">
						</div>

						<div class="form-group">
							<label>Password</label>
							<input type="password" class="form-control " v-model="password1" placeholder="" data-binding-required="true">
						</div>
						
						<div class="form-group">
							<label>Password (Repetition)</label>
							<input type="password" class="form-control" v-model="password2" placeholder="" >
							<div v-if="error">{{error}}</div>
						</div>

						<div class="MatcButtonBar">
							<a class="MatcButton MatcButtonPrimary" @click="send">Send</a>
							<a class href="#/">Cancel</a>
						</div>
					</div> <!-- End page 3 -->

					<div v-if="page === 4">
						<p class="MatcLead MatcMarginBottomXXL">
							Your password was reset. You can login now!
						</p>
					</div> <!-- End page 4 -->
				</div>

		
			</div>
		</div>
      </div>
    </div>
  </div>
</template>
<script>
import Services from 'services/Services'
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'

export default {
  name: "Login",
  mixins: [DojoWidget],
  data: function() {
    return {
		error: '',
		email: '',
		page: 1,
		password1: '',
		password2: '',
		token: ''
	};
  },
  watch: {},
  components: {},
  methods: {
    async reset() {
		this.log.log(0, "reset", "entry");
		var result = await Services.getUserService().reset(this.email) //this._doPost("/rest/user/password/request", data);
		if (result.status == "ok") {
			this.showSuccess('You got mail')
			this.page = 2
		}
    },

    async send() {
		this.log.log(0, "send", "entry");	  
		if (this.password1.length < 6) {
			this.error = "The password must have at least 6 characters!"
		}
		if (this.password1 !== this.password2) {
			this.error = "The password do not match!"
		} else {  
			var result = await Services.getUserService().reset2(this.email, this.password1, this.token); //this._doPost("/rest/user/password/set", data);
			if (result.status == "ok") {
				this.showSuccess('Great, your new password is set. You can loggin now')
				this.page = 4  
			} else {
				this.error = "Something went wrong. Request a new password!"
			}
		}
    }
  },
  mounted () {
	this.log = new Logger('ResetPassword')
	if (this.$route.query.id) {
		this.log.info('mounted', 'Go token')
		this.token = this.$route.query.id
		this.page = 3
	}
	this.log.info('mounted', 'exit', this.$route)
  }
}
</script>

