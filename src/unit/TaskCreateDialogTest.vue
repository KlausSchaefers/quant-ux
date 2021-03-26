<template>
  <div class="MatcLight">
    <h1>TabelConf Test</h1>

    <div class="dialog">
      <TaskCreateDialog :model="mobile" />
    </div>


  </div>
</template>

<style>
  @import url("../style/matc.css");
  @import url("../style/qux.css");
  .dialog {
    background: #fff;
    padding: 20px;
    display: inline-block;
    margin: 20px;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2)
  }
</style>

<style lang="sass">
  @import "../style/bulma.sass";
</style>

<script>

import desktop from './data/tableapp.json'
import mobile from './data/taskCreateMobile.json'

import TaskCreateDialog from '../../src/views/apps/analytics/TaskCreateDialog'

export default {
  name: "TaskCreatDialogTest",
  mixins: [],
  data: function() {
    return {
        desktop: desktop,
        mobile: mobile,
        model: null
    };
  },
  components: {
    'TaskCreateDialog': TaskCreateDialog
  },
  computed: {
  },
  methods: {
  },
  mounted() {
  }
};
</script>
