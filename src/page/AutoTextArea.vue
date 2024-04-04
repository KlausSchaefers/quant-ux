
<template>
    <div :class="['MatcAutoTextArea', {'MatcAutoTextAreaInline':inline}, {'MatcAutoTextAreaFocus':hasFocus} ]">
        <div class="MatcAutoTextAreaHidden">{{label}}</div>
        <textarea v-model="label" @blur="onBlur" @focus="hasFocus = true" :placeholder="placeholder"></textarea>
    </div>
  </template>
  <style lang="scss">
    @import "../style/components/auto_textarea.scss";
  </style>
  <script>

  export default {
    name: "AutoTextArea",
    props:['value', 'inline', 'placeholder'],
    mixins: [],
    data: function() {
      return {
        label: '',
        hasFocus: false
      };
    },
    components: {
    },
    computed: {
    },
    methods: {
        onBlur () {
            this.hasFocus = false
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