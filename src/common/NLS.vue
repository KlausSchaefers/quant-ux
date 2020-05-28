
<template>
  <div></div>
</template>
<script>
import nls from '../nls/en.json'

export default {
  name: "NLS",
  mixins: [],
  data: function() {
    return {
      nls: nls
    }
  },
  components: {},
  methods: {
    getNLS (key) {
      if (this.$i18n) {
        let nls = this.$i18n.t(key)
        if (nls != null && nls != undefined) {
          return nls
        }
      }
      console.warn('getNLS() > could not find key or not i18n', key)
      if (nls[key]) {
          return nls[key]
      }
      return key
    }
  },
  mounted() {
  }
};
</script>