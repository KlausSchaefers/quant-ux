<template>
    <div class="MatcUser">
        <div v-if="!user || user.role === 'guest'" class="MatcUserAvatar">
            <QIcon icon="User" />
        </div>
        <template v-else>
            <img v-if="user.image" class="MatcUserImage"
                :src="'/rest/user/' + user.id + '/images/' + user.name + '_' + user.lastname + '/' + user.image" />
            <div class="MatcUserAvatar" v-else>
                {{ getUserLetter(user) }}
            </div>
        </template>
    </div>
</template>
<style lang="scss">
@import '../style/components/user_image.scss';
</style>
<script>
import Logger from "common/Logger";
import QIcon from './QIcon'
import * as UIUtil from '../util/UIUtil'

export default {
    name: "UserImage",
    mixins: [],
    props: ["user"],
    data: function () {
        return {
        };
    },
    components: {
        'QIcon': QIcon
    },
    methods: {
        getUserLetter(user) {
            return UIUtil.getUserLetter(user)
        }
    },
    mounted() {
        this.logger = new Logger("UserImage");
    }
};
</script>



