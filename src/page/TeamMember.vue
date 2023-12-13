
<template>
    <div class="MatcTeamItem" @click="$emit('click', $event)">
        <div class="MatcUserImageCntr">
            <div v-if="user.image" class="MatcUserImageCntrTrans">
                <img :src="getUserImage(user)" class="MatcUserImage"/>
            </div> 
                <div v-else class="MatcUserImageNone">
                    <span class="MatcMiddle MatcUserLetters">
                        {{getUserLetter(user)}}
                    </span>
                </div>
        </div>
    </div>
  </template>
  <script>
  import _Tooltip from 'common/_Tooltip'
  import * as UIUtil from '../util/UIUtil'

  export default {
    name: "Team",
    mixins: [_Tooltip],
    props: ["user"],
    data: function () {
      return {
        isSaving: false,
        team: []
      };
    },
    components: {
    },
    methods: {
        getUserLetter (user) {
            return UIUtil.getUserLetter(user)
        },
        getUserImage (user) {
            if (user) {
                return "/rest/user/" + user.id + "/images/" + user.name + "_" + user.lastname + "/" + user.image
            }
            return ""
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
    },
    mounted() {
        if (this.user) {
            //this.addTooltip(this.$el, this.getUserName(this.user))
        }
    },
  };
  </script>