
<template>
	<ul class="MatcTree">
    {{value.label}}
    <TreeItem v-for="child in value.children" :key="child.id" class="MatcTreeRootNode" :value="child">
    </TreeItem>
	</ul>
</template>
<script>

import TreeItem from 'common/TreeItem'

export default {
  name: "Tree",
  props:['value'],
  mixins: [],
  data: function() {
    return {
    };
  },
  components: {
    'TreeItem': TreeItem
  },
  methods: {
    destroy: function() {
    }
  },
  watch: {
    value (v) {
      this.value = v
    }
  },
  mounted() {}
};
</script>