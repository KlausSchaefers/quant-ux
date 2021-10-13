<template>
  <div class="MatcToolbarCollabUser" v-if="visibleUsers.length > 1">
    <div v-for="user in visibleUsers" :key="user.id" class="MatcTeamItem vommondToolTipCntr" @click="onClickUser(user)">
      
      <div :class="['MatcUserImageCntr ', {'MatcUserImageCntrTrans': user.image}]">
        <div v-if="user.image">
          <img :src="'/rest/user/' + user.id + '/images/' + user.name + '_' + user.lastname + '/' + user.image"/>
        </div>
         <div v-else class="MatcUserImageNone">
          <span class="MatcMiddle MatcUserLetters">
            {{getUserLetter(user)}}
          </span>
        </div>
      </div>

      <div class="vommondToolTip">
            <div class="vommondToolTipArrow"></div>
            <span class="vommondToolTipLabel">Click to view {{getUserName(user)}}</span>
      </div>

    </div>
  </div>
</template>
<script>

import Logger from "common/Logger";


export default {
  name: "CoolabUser",
  mixins: [],
  props: ['users'],
  data: function() {
    return {
      canvasViewMode: 'design'
    };
  },
  computed: {
    visibleUsers () {
      if (this.users.length < 5) {
        return this.users
      }
      return this.users.slice(0,4)
    }
  },
  components: {},
  methods: {
    getUserLetter (user) {
      let result = ''
      if (user.name) {
        result += user.name.substring(0, 1).toUpperCase();
        if (user.lastname) {
          result += user.lastname.substring(0, 1).toUpperCase();
        }
      } else {
        let parts = user.email.split('.')
        if (parts.length > 0) {
          result += parts[0].substring(0, 1).toUpperCase();
        }
        if (parts.length > 1) {
          result += parts[1].substring(0, 1).toUpperCase();
        }
      }
      return result
    },
    getUserName (user) {
      let result = "";
      if (user.name) {
        result = user.name + " ";
      }
      if (user.lastname) {
        result += user.lastname;
      }
      if (result.length == 0) {
        result = user.email;
      }
      return result;
    },
    onClickUser (user) {
      this.log.log(2, 'onClickUser', 'enter')
      this.$emit('select', user)
    }
  },
  watch: {
    users (v) {
        this.log.log(2, 'watch(users)', 'enter', v)
        this.users = v
    }
   },
  async mounted() {
    this.log = new Logger("CoolabUser")
  }
};
</script>