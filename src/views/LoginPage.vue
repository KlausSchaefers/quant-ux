<template>
    <div class="MatcLoginPage MatcSimulatorSplash MactMainGradient">
        <div class="MatcLoginPageContainer">
            <div>
                <div class=" form-group">
                    <label class="">Email</label>
                    <input class=" form-control input-lg" placeholder="Your email" type="text" v-model="email">
                </div>

                <div class=" form-group has-feedback">
                    <label class="">Password</label>
                    <input class=" form-control input-lg" placeholder="Your password" type="password" v-model="password" @keyup.enter="login">
                </div>
                <div class="MatcButtonBar">
                    <a class=" MatcButton" @click="login">Login</a>
                    <span class="MatcErrorLabel" v-if="errorMessage">{{errorMessage}}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>

import Services from 'services/Services'
import Logger from 'common/Logger'

export default {
  name: "Header",
  mixins: [],
  props: ['user'],
  data: function() {
    return {
        email: '',
        password: '',
        errorMessage: ''
    }
  },
  watch: {
    'user' (v) {
      this.logger.log(6, 'watch', 'user >> ' + v.email)
      this.user = v
    }
  },
  components: {
  },
  methods: {
      async login () {
            this.logger.info('login', 'enter ', this.email)
            var result = await Services.getUserService().login({
                email:this.email,
                password: this.password
            })
            if (result.type == "error") {
                this.$root.$emit("Error", "Wrong login credentials")
                this.errorMessage = "Login is wrong"
            } else {
                this.$emit('login', result);
                this.$root.$emit('UserLogin', result)
            }
      }
  },
  async mounted() {
    this.logger = new Logger('LoginPage')
  }
}
</script>

