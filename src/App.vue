<template>
  <div id="app" :class="['MatcMainCntr', {'MatcWindows': isWindows}]">
    <router-view/>
    <div class="vommondMessage" ref="message">
    </div>
  </div>
</template>

<style>
	@import url("./style/css/legacy.css");
</style>
<script>
import css from 'dojo/css'
import win from 'dojo/win'
import Services from 'services/Services'

export default {
data: function() {
    return {  
		isWindows:false 
    }
  },
  methods: {
    showSuccess (msg){
		if (this.$refs.message){
				css.add(this.$refs.message, "vommondMessageSuccess");
				css.remove(this.$refs.message, "vommondMessageError vommondMessageHint");
				this.$refs.message.innerHTML = msg;
				setTimeout( () => {
					this.hideMessage()
				},2000);
			}
		},

	showError (msg){
		if (this.message){
			css.add(this.$refs.message, "vommondMessageError");
			css.remove(this.$refs.message, "vommondMessageSuccess vommondMessageHint");
			this.$refs.message.innerHTML = msg;
			setTimeout( () => {
				this.hideMessage()
			},4000);
		}
	},

	showHint (msg){
		if (this.$refs.message){
			css.add(this.$refs.message, "vommondMessageHint");
			css.remove(this.$refs.message, "vommondMessageSuccess vommondMessageSuccess");
			this.$refs.message.innerHTML = msg;
			setTimeout( () => {
				this.hideMessage()
			},4000);
		}
	},

	hideMessage (){
		css.remove(this.$refs.message, "vommondMessageSuccess vommondMessageError vommondMessageHint");
	},

	handler4xx (url, res) {
		if (res.status === 401) {
			alert('Something is wrong. Please login again!')
			Services.getUserService().logout()
			this.$router.push('/')
			this.$root.$emit('MatcLogout', Services.getUserService().GUEST)
		}
		if (res.tokenTimedOut) {
			alert('Your session has expired. Please login again')
			Services.getUserService().logout()
			this.$router.push('/')
			this.$root.$emit('MatcLogout', Services.getUserService().GUEST)
		}
	},
	initNLS () {
		const language = Services.getUserService().getLanguage()
		this.$root.$i18n.locale = language
	},
	initScroll () {
		if (navigator.platform.indexOf('Win') > -1 || location.href.indexOf("os=win") > -1) {
			this.isWindows = true
		}
	}
  },
  async mounted () {
	Services.setErrorHandler((url, res) => {
		this.handler4xx(url, res)
	})
	this.$root.$on('Success', (msg) => {
		this.showSuccess(msg)
	})
	this.$root.$on('Error', (msg) => {
		this.showError(msg)
	})
	this.$root.$on('Hint', (msg) => {
		this.showHint(msg)
	})
	this.$root.$on('UserLogin', (user) => {
		Services.getUserService().setUser(user)
	})
	css.remove(win.body(), 'MatcPublic')
	this.initNLS()
	this.initScroll()
  }
}
</script>

