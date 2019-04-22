
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