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

    },
    mounted() {
        this.logger = new Logger("UserImage");
    }
};
</script>



