
<template>
  <div></div>
</template>
<script>
import nls from '../nls/en.json'
import JSONPath from 'core/JSONPath'
import Logger from 'core/Logger'

export default {
  name: "NLS",
  mixins: [],
  data: function() {
    return {
      nls: nls,
      nlsLanguage: ''
    }
  },
  components: {},
  methods: {
    getLanguage () {
      return this.nlsLanguage
    },
    initNLS () {
	    if (this.$route && this.$route.query.ln) {
        Logger.log(-1,"NLS.initNLS() > set by query: ", this.$route.query.ln);
				this.$root.$i18n.locale = this.$route.query.ln
        this.nlsLanguage = this.$route.query.ln
			}
    },
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