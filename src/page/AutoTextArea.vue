
<template>
    <div :class="['MatcAutoTextArea', {'MatcAutoTextAreaInline':inline} ]">
        <div class="MatcAutoTextAreaHidden">{{label}}</div>
        <textarea v-model="label" @blur="onBlur"></textarea>
    </div>
  </template>
  <style lang="scss">
    @import "../style/components/auto_textarea.scss";
  </style>
  <script>

  export default {
    name: "AutoTextArea",
    props:['value', 'inline'],
    mixins: [],
    data: function() {
      return {
        label: ''
      };
    },
    components: {
    },
    computed: {
    },
    methods: {
        onBlur () {
            if (this.label.trim() !== this.value) {
                this.$emit("blur", this.label.trim())
            }
        }
    },
    watch: {
        value (v) {
            this.label = v
        }
    },
    async mounted() {
        this.label = this.value
    }
  };
  </script>