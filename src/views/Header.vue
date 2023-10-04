<template>
  <div class="MatcHeader" id="">

    <div class="MatcHeaderLeft">
      <img src="../style/img/QUXLogo5.svg" class="MatcHeaderLogo">
      <a href="#/">
        Quant-UX
      </a>

    </div>
    <div class="container MatcHeaderCenter">
      <div class="MatcHeaderCenterLeft">
        <a class="" href="#/">{{ $t('header.my-prototypes') }}</a>
        <a class="" href="#/help.html">{{ $t('header.documentation') }}</a>
      </div>
      <div class="MatcHeaderCenterRight">
        <LanguagePicker @change="setLanguage" />
      </div>
    </div>
    <div class="MatcHeaderRight">
      <a class="" href="#/my-account.html">{{ $t('header.my-account') }}</a>
    </div>
  </div>
</template>

<style lang="scss">
@import "../style/components/menu.scss";
</style>


<script>

import Services from 'services/Services'
import Logger from 'common/Logger'
import hash from "dojo/hash";
import LanguagePicker from "page/LanguagePicker";

export default {
  name: "Header",
  mixins: [],
  props: ['user'],
  data: function () {
    return {
    }
  },
  watch: {
    'user'(v) {
      this.logger.log(6, 'watch', 'user >> ' + v.email)
      this.user = v
    }
  },
  components: {
    'LanguagePicker': LanguagePicker
  },
  methods: {
    setLanguage(language) {
      this.logger.log(-1, "setLanguage", "entry", language);
      Services.getUserService().setLanguage(language)
      this.$root.$i18n.locale = language
      this.$root.$emit('Success', this.$i18n.t('common.language-changed'))

    },

    logout() {
      this.logger.log(2, "logout", "entry");
      Services.getUserService().logout()
      this.$emit('logout', Services.getUserService().GUEST)
      hash("/", true);
    }
  },
  async mounted() {
    this.logger = new Logger('Header')
    this.logger.log(7, 'mounted', 'exit >> ' + this.user.email)
  }
}
</script>

