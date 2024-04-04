
<template>
  <div :class="['MatcAccountButton', {'MatcToolbarPopUpVisible': isVisible}]">
    <a type="button" @click.stop="open" class="MatcToolbarIconButton" >
      <span v-if="hasLabel">
        {{selectedLanguage}}
      </span>
      <QIcon icon="Account" v-if="!hasImage" ></QIcon>
      <span class="MatcUserImageCntr" v-else>
          <img class="MatcUserImage" :src="userImage">
      </span>

      <span class="caret" v-if="hasCarret"></span>
    </a>
    <div class="MatcDropDownPopUp" role="menu" data-dojo-attach-point="popup" v-if="isVisible">
      <ul class role="menu" data-dojo-attach-point="ul">
        <li v-for="o in options" :key="o.value" >
          <a :href="o.value">{{o.label}}</a>
        </li>
      </ul>
    </div>
    <div class="MatcDropDownPopUpBackdrop" v-if="isVisible"></div>
  </div>
</template>
<style lang="scss">
  @import "../style/components/account.scss";
</style>
<script>
//import Services from "services/Services";
import on from "dojo/on";
import win from "dojo/_base/win";
import Logger from "common/Logger";
import QIcon from "../page/QIcon";
import _Tooltip from "common/_Tooltip";
export default {
  name: "AccountButton",
  props:['hasLabel', 'value', 'user'],
  mixins: [_Tooltip],
  data: function() {
    return {
      isVisible: false,
      hasCarret: false,
      options: [
        {
          label: this.$t('header.my-account'),
          value: "#/my-account.html"
        },
        {
          label: this.$t('header.logout'),
          value: "#/logout.html"
        }
      ]
    };
  },
  components: {
    'QIcon': QIcon
  },
  computed: {
    hasImage () {
      return this.user && this.user.image
    },
    userImage () {
      return '/rest/user/' + this.user.id + '/images/' + this.user.name + '_' + this.user.lastname + '/' + this.user.image
    }
  },
  methods: {
    open () {
      this.isVisible = true
      this._mouseDownListener = on(win.body(), "click", e => {
        this.close(e)
      })
    },
    close() {
      this.isVisible = false
    }
  },
  async mounted() {
    this.logger = new Logger("AccountButton");
    this.addTooltip(this.$el, this.$t('header.tooltip.my-account'), "vommondToolTipRightBottom")
    console.debug(this.user)
  }
};
</script>