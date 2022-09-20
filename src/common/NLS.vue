
<template>
  <div></div>
</template>
<script>
import nls from '../nls/en.json'
import JSONPath from 'core/JSONPath'

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
    getNlSWithReplacement (key, values) {
      let translated = this.getNLS(key)
      for (let key in values) {
        const value = values[key]
        translated = translated.replace(new RegExp(`\{\{${key}\}\}`), value)
      }
      return translated
    },
    getNLS (key) {
      if (this.$i18n) {
        let result = this.$i18n.t(key)
        if (result != null && result != undefined) {
          return result
        }
      }
      /**
       * This can happen for elements that are mounted with DojoWidget.$new
       */
      const result = JSONPath.get(nls, key)
      if (result) {
        return result
      }
      return key
    }
  },
  mounted() {
  }
};
</script>