<template>
  <div class="MatcHeader" id="">
 
      <div class="MatcHeaderLeft">
     
        <a href="#/" ref="myPrototype">
          <img src="../style/img/QUXLogo5BlueWhite.svg" class="MatcHeaderLogo" ref="logo">
          Quant-UX
        </a>

      </div>
      <div class="container MatcHeaderCenter">
        <div class="MatcHeaderCenterLeft">
         
      
        </div>
        <div class="MatcHeaderCenterRight">
       
        </div>
      </div>
      <div class="MatcHeaderRight">
        <a class="" href="#/help.html">
            <QIcon icon="Book" :tooltip="$t('header.tooltip.documentation')"/>
          </a>
          <LanguagePicker @change="setLanguage" />
        <AccountButton :user="user"/>
        <!-- <a class="" href="#/my-account.html">
          <QIcon icon="Account"/>
          {{ $t('header.my-account') }}
        </a>
       <a class="" href="#/logout.html">{{ $t('header.logout') }}</a>
        <a class="" href="#/logout.html">
          <QIcon icon="Logout"/>
        </a> -->
       
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
import AccountButton from 'page/AccountButton'
import QIcon from 'page/QIcon'
import _Tooltip from "common/_Tooltip";

export default {
  name: "Header",
  mixins: [_Tooltip],
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
    'LanguagePicker': LanguagePicker,
    'QIcon': QIcon,
    'AccountButton': AccountButton
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

    this.addTooltip(this.$refs.logo, this.$t("header.tooltip.my-prototypes"))
    this.addTooltip(this.$refs.myPrototype, this.$t("header.tooltip.my-prototypes"))
  }
}
</script>

