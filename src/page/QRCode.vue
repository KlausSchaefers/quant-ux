<template>
  <img class="MatcAppList" />
</template>
<script>

export default {
  name: "QRCode",
  mixins: [DojoWidget, List, Plan],
  props: ['hash', 'debug', 'live', 'log'],
  data: function() {
    return {
    };
  },
  components: {},
  methods: {
  },
  mounted() {
    this.log = new Logger("QRCode");
    this.log.log(2, 'mounted', 'enter')
  }
};
</script>