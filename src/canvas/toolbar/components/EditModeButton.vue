
<template>
  <div class="MatcToolbarEditMode">
    <a @click="setDesign" :class="['MatcToolbarItem', {'MatcToolbarEditModeActive': !hasData }]">
        Design
    </a>
    <a @click="setCode" :class="['MatcToolbarItem', {'MatcToolbarEditModeActive': hasData }]">
        Data &amp; Code
    </a>
  </div>
</template>
<script>

import Logger from "common/Logger";


export default {
  name: "EditModeButton",
  mixins: [],
  props: ['value'],
  data: function() {
    return {

    };
  },
  computed: {
    hasData () {
        if (this.value) {
            return this.value.hasDataView
        }
        return true
    }
  },
  components: {},
  methods: {
      setDesign() {
        this.log.log(-1, 'setDesign', 'enter')
        this.value.hasDataView = false
        this.$emit('change', 'hasDataView', false)
      },
      setCode () {
        this.log.log(-1, 'setCode', 'enter')
        this.value.hasDataView = true
        this.$emit('change', 'hasDataView', true)
      }
  },
  watch: {
        value (v) {
            this.log.log(2, 'watch(value)', 'enter', v)
            this.value = v
        }
   },
  async mounted() {
    this.log = new Logger("EditModeButton")
  }
};
</script>