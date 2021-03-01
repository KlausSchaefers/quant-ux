
<template>
  <span class="mdi mdi-dots-horizontal" @click.stop="onPlus" @mousedown.stop="">

	</span>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'

export default {
    name: 'DesignTokenBtn',
    mixins:[Util, DojoWidget],
    data: function () {
        return {
            value: null,
            inputEvent: "change",
            mode: "all"
        }
    },
    components: {},
    methods: {
      onPlus () {
        console.debug('onPlus')
      }
    },
    mounted () {
    }
}
</script>