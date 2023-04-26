<template>
    <div :class="'MatcLoginPage ' + (resetToken ? 'MatcLoginPageReset' : 'MactMainGradient')">
        <div class="MatcLoginPageDialog" v-if="isQuxAuth">
        
                <div class="MatcLoginPageContainer">
                    <div class="MatcToolbarTabs MatcToolbarTabsBig" v-if="!resetToken">
                        <a :class="{'MatcToolbarTabActive': tab === 'login'}" @click="setTab('login')">Login</a>
                        <a :class="{'MatcToolbarTabActive': tab === 'signup'}" @click="setTab('signup')" v-if="allowSignUp">Sign Up</a>
                    </div>

                    <div :class="' MatcLoginWrapper ' + tab ">
                        <div class="MatcLoginContent">
                            <div class="MatcLoginPageSection" >
                                <div class="MatcLoginPageForm">
                                    <div class=" form-group">
                                        <label class="">Email</label>
                                        <input class=" form-control input-lg" placeholder="Your email" type="text" v-model="email">
                                    </div>

                                    <div class=" form-group has-feedback">
                                        <label class="">Password</label>
                                        <input class=" form-control input-lg" placeholder="Your password" type="password" v-model="password" @keyup.enter="login">
                                    </div>
                                </div>
                                <span class="MatcErrorLabel" v-show="errorMessage">{{errorMessage}}</span>
                                <div class="MatcButtonBar">
                                    <a class="MatcButton" @click="login">Login</a>
                                    <a class="MatcLinkButton" @click="requestPasswordReset" v-if="hasLoginError">Reset Password</a>
                                </div>
                            </div>
                        </div> <!-- login-->
                        
                     

                        <div class="MatcLoginContent">
                            <div class="MatcLoginPageSection">
                                <div class="MatcLoginPageForm">
                                    <div class=" form-group">
                                        <label class="">Email</label>
                                        <input class=" form-control input-lg" placeholder="Your email" type="text" v-model="email">
                                    </div>

                                    <div class=" form-group has-feedback">
                                        <label class="">Password</label>
                                        <input class=" form-control input-lg" placeholder="Your password" type="password" v-model="password" @keyup.enter="signup">
                                    </div>
                                    <div class=" form-group has-feedback" >
                                        <CheckBox v-model="tos" label="I accept the term of service"/>
                                    </div>
                                </div>
                                <span class="MatcErrorLabel">{{errorMessage}}</span>
                                <div class="MatcButtonBar">
                                    <a class="MatcButton" @click="signup">SignUp</a> 
                                </div>
                            </div>
                        </div> <!-- new -->

                        <div class="MatcLoginContent">
                              <div class="MatcLoginPageSection" v-if="resetToken">
                                <div class="MatcLoginPageForm">
                                    <div class=" form-group">
                                        <label class="">Email</label>
                                        <input class=" form-control input-lg" placeholder="Your email" type="text" v-model="email">
                                    </div>

                                    <div class=" form-group has-feedback">
                                        <label class="">New Password</label>
                                        <input class=" form-control input-lg" placeholder="The new password" type="password" v-model="password">
                                    </div>
                                </div>
                                <span class="MatcErrorLabel" >{{errorMessage}}</span>
                                <div class="MatcButtonBar">
                                    <a class="MatcButton MatcButtonRed" @click="resetPassword">Set new password</a>                                
                                </div>
                            </div> 
                        </div><!-- reset-->

    

                    </div> <!-- end wrapper-->

        
            </div> <!-- Container -->
            
          
        </div> <!-- Dialog -->
    </div>
</template>


<style lang="scss">
    @import "../style/scss/login.scss";
</style>
<style lang="css">
    @import '../style/toolbar/tab.css';
</style>
<script>


import Services from 'services/Services'
import Logger from 'common/Logger'
import CheckBox from '../common/CheckBox.vue'


export default {
  name: "Header",
  mixins: [],
  props: ['user'],
  data: function() {
    return {
        hasLoginError: false,
        resetToken: false,
        email: '',
        password: '',
        tos: false,
        errorMessage: ' ',
        tab: 'login',
        config: {}
    }
  },
  computed: {
    isQuxAuth () {
        return Services.getConfig().auth !== 'keycloak'
    },
    allowSignUp () {
        return this.config && this.config.user && this.config.user.allowSignUp === true
    }
  },
  watch: {
    'user' (v) {
      this.logger.log(6, 'watch', 'user >> ' + v.email)
      this.user = v
    }
  },
  components: {
    CheckBox
  },
  methods: {
      setTab (tab) {
        this.tab = tab
        this.errorMessage = ' '
      },
      async resetPassword () {
        this.logger.info('resetPassword', 'enter ', this.email)

        if (this.email.length < 2) {
            this.errorMessage = "Please enter your email"
            return;
        }

        if (this.password.length < 6) {
            this.errorMessage = "Password too short"
            return;
        }

        if (this.resetToken.length < 6) {
            this.errorMessage = "Token is wrong"
            return;
        }

        let result = await Services.getUserService().reset2(this.email, this.password, this.resetToken)
        if (result.type === 'error') {
            this.errorMessage = 'Someything is wrong'
        } else {
            this.errorMessage = ''
            this.resetToken = ''
            this.tab = 'login'
            this.$router.push('/')
        }
 
      },
      async requestPasswordReset () {
        this.logger.info('requestPasswordReset', 'enter ', this.email)
        await Services.getUserService().reset(this.email)
        this.errorMessage = 'Check you mail.'
      },
      async login () {
        this.logger.info('login', 'enter ', this.email)
        var result = await Services.getUserService().login({
            email:this.email,
            password: this.password
        })
        if (result.type == "error") {
            this.$root.$emit("Error", "Wrong login credentials")
            this.errorMessage = "Login is wrong"
            this.hasLoginError = true
        } else {
            this.$emit('login', result);
            this.$root.$emit('UserLogin', result)
            this.hasLoginError = false
        }
      },
      async signup() {
        this.logger.info('signup', 'enter ', this.email)

        if (this.password.length < 6) {
            this.errorMessage = "Password too short"
            return;
        }

        if (this.tos !== true) {
            this.errorMessage = "Please accept terms of service"
            return;
        }

        var result = await Services.getUserService().signup({
            email:this.email,
            password: this.password,
            tos: this.tos
        })
        if (result.type == "error") {
            if (result.errors.indexOf("user.create.domain") >= 0) {
                this.errorMessage = "Not the correct domain"
            } else if (result.errors.indexOf("user.create.nosignup") >=0 ) {
                this.errorMessage = "No sign-ups allowed."
            } else if (result.errors.indexOf("user.email.not.unique") >= 0) {
                this.errorMessage = "Email is taken"
            } else {
                this.errorMessage = "Password too short"
            }
        } else {
            let user = await Services.getUserService().login({
                email:this.email,
                password: this.password,
            })
            this.$emit('login', user);
            this.$root.$emit('UserLogin', user)
            this.logger.log(-1,'signup', 'exit with login', this.email)
        }
      },
      initKeyCloak (conf) {
        const keycloakService = Services.getUserService()
        keycloakService.init(conf)
      }
  },
  async mounted() {
    this.logger = new Logger('LoginPage')
   	this.resetToken = this.$route.query.id
    if (this.resetToken && this.resetToken.length > 2) {
        this.logger.log(-1,'mounted', 'reset ')
        this.tab = 'reset'
    }

    this.config = Services.getConfig()
    this.logger.log(-1,'mounted', 'exit > ', this.config.user)
  }
}
</script>